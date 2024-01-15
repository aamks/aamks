import warnings
from collections import OrderedDict
from pyrvo.rvo_simulator import RVOSimulator
warnings.simplefilter('ignore', RuntimeWarning)
from evac.evacuees import Evacuees
from math import ceil
import json
from geom.nav import Navmesh
from shapely.geometry import LineString
from include import Sqlite
from include import Json
import os
from scipy.stats import norm
from math import log
import math
from numpy import array, prod, zeros, ndenumerate
from scipy.spatial.distance import cdist
import pandas as pd


class EvacEnv:

    def __init__(self, aamks_vars):
        self.json = Json()
        self.evacuees = Evacuees
        self.max_speed = 0
        self.current_time = 0
        self.positions = []
        self.velocities = []
        self.velocity_vector = []
        self.speed_vec = []
        self.finished = []
        self.finished_vec = []
        self.trajectory = []
        self.smoke_query = None
        self.rset = 0
        self.per_9 = 0
        self.floor = 0
        self.nav = None
        self.room_list = OrderedDict()
        self.rooms_in_smoke = []
        self.agents_to_move_downstairs_or_upstairs = []
        self.unique_agent_id_on_floor = None
        self.free_space_coordinates_of_upstair_teleport_destination = {}
        self.free_space_coordinates_of_downstair_teleport_destination = {}
        self.floor_upstair_teleports_queue = {}
        self.floor_downstair_teleports_queue = {}
        self.step = 0

        f = open('{}/{}/config.json'.format(os.environ['AAMKS_PATH'], 'evac'), 'r')
        self.config = json.load(f)

        self.general = aamks_vars
        self.simulator = RVOSimulator(neighbor_dist=self.config['NEIGHBOR_DISTANCE'],
                                     max_neighbors=self.config['MAX_NEIGHBOR'],
                                     time_horizon=self.config['TIME_HORIZON'],
                                     time_horizon_obst=self.config['TIME_HORIZON_OBSTACLE'],
                                     radius=self.config['RADIUS'],
                                     max_speed=self.max_speed)
        
        self.elog = self.general['logger']
        self.elog.info('ORCA on {} floor initiated'.format(self.floor))

        self.dfed = FEDDerivative(self.floor)

    def _find_closest_exit(self, e):

        evacuee = self.evacuees.get_pedestrian(e)
        position = self.evacuees.get_position_of_pedestrian(e)
        try:
            od_at_agent_position = self.smoke_query.get_visibility(position)
        except:
            od_at_agent_position = 0, 'outside'
        
        # od_at_agent_position[0] is optical dencity value in this position
        # od_at_agent_position[1] is room name, for example r1, c2, s3

        if od_at_agent_position[1] in self.general['agents_destination'][int(self.floor)]['rooms_goals']:
        # exit doors were defined for this room so agent will reach goal from rooms_goals dict
            paths = self._get_path(e, evacuee, position, od_at_agent_position, True)
        else:
            # exit doors were not defined for this room so agent will reach goal from general_floor_goals dict
            paths = self._get_path(e, evacuee, position,od_at_agent_position, False)

        if len(paths) > 0:
            exits = list(zip(*paths))[2]
            # index of exit with the smallest weight equal to the product of distance and output weight
            index = exits.index(min(exits))
            # variable target_teleport_coordinates which flags that goal will be teleport
            if paths[index][3]['type'] == 'teleport':
                evacuee.target_teleport_coordinates = (paths[index][3]['direction_x'], paths[index][3]['direction_y'])
                evacuee.agent_has_no_escape = False

            # if chosen goal is teleport or outside door, then agent will leave floor
            terminal_exits_names = []
            for exit in self.general['agents_destination'][int(self.floor)]['general_floor_goals']:
                terminal_exits_names.append(exit['name'])
            
            if paths[index][3]['name'] in terminal_exits_names:
                evacuee.agent_leaves_floor = True
            # else, the goal is only to the next room on the floor, so the agent will not leave the floor, he will go through the next room
            else:
                evacuee.agent_leaves_floor = False

            evacuee.path = paths[index][4]
            return paths[index][0], paths[index][1]
        else:
            evacuee.agent_has_no_escape = True
            return None


    def _get_path(self, e, evacuee, position, od_at_agent_position, is_goal_in_rooms_goals):
        paths, paths_free_of_smoke = list(), list()
        room_name = od_at_agent_position[1]
        if is_goal_in_rooms_goals:
            exits_dict = self.general['agents_destination'][int(self.floor)]['rooms_goals'][room_name]
            if all(i['exit_weight'] == exits_dict[0]['exit_weight'] for i in exits_dict):
                # all exit weights of exit door for this room are equal so there is no 
                # there is no logic to follow rooms_goals, so then general_floor_goals is selected
                exits_dict = self.general['agents_destination'][int(self.floor)]['general_floor_goals']
        else:
            exits_dict = self.general['agents_destination'][int(self.floor)]['general_floor_goals']
        
        # if the agent is outside the building, it means that he is already reaching the exit, we do not change his goal - 
        # even if in general_floor_goals another exit has a weight of 10 and the current one has a weight of 0
        _exit_dict = {}
        if room_name == 'outside':
            # we get only this particular one exit outside near agent
            # we dont want to find anoter exit if another exit has bigger general_floor_goals weight
            # now when agent is already outside (agent has beed guided by room room_exits_weights)
            _exit_dict = [exit.copy() for exit in exits_dict if (exit['x'] == evacuee.exit_coordinates[0] and exit['y'] == evacuee.exit_coordinates[1] or
                                                                 exit['x_outside'] == evacuee.exit_coordinates[0] and exit['y_outside'] == evacuee.exit_coordinates[1])]
            # and we set the x y coordinates to x_outside y_outside in case the agent is pushed
            # outside by rvo2 more than 100 px from the door so that it does not return to the door.
            for exit in _exit_dict:
                exit['x'] = exit['x_outside']
                exit['y'] = exit['y_outside']

        else:
            _exit_dict = exits_dict
        for exit in _exit_dict:
            # in order to prevent from walking through the adjacent door
            x, y = exit['x'], exit['y']
            if LineString([(x,y), (position[0], position[1])]).length < 100 and exit['type'] == 'door':
                x, y = exit['x_outside'], exit['y_outside']
            
            path = self.nav.nav_query(src=position, dst=(x, y), maxStraightPath=999)
            if path[0] == 'err':
                continue
            path_length = LineString(path).length
            if self._next_room_in_smoke(e, path, od_at_agent_position) is not True:
                try:
                    if math.isinf(exit['exit_weight']):
                        exit_dist_considering_weight = path_length*100000
                    else:
                        exit_dist_considering_weight = path_length*exit['exit_weight']
                    paths_free_of_smoke.append([x, y, exit_dist_considering_weight, exit, path])
                except:
                    self.evacuees.set_finish_to_agent(e)
                    if exit['type'] == 'teleport':
                        evacuee.target_teleport_coordinates = (exit['direction_x'], exit['direction_y'])
                    if evacuee.target_teleport_coordinates is not None:
                        self.append_agents_to_move_downstairs_or_upstairs(evacuee, e)
                    paths_free_of_smoke.append([x, y, 0, exit, path])

            else:
                if math.isinf(exit['exit_weight']):
                    exit_dist_considering_weight = path_length*100000
                else:
                    exit_dist_considering_weight = path_length*exit['exit_weight']
                paths.append([x, y, exit_dist_considering_weight, exit, path])
       
        if len(paths_free_of_smoke)>0:
            return paths_free_of_smoke
        else:
            return paths



    def _next_room_in_smoke(self, evacuee, path, od_at_agent_position):

        self.evacuees.set_optical_density(evacuee, od_at_agent_position[0])
        self.room = od_at_agent_position[1]

        for point in path[1:]:
            od_next_point = self.smoke_query.get_visibility(point)
            if od_next_point[1] != self.room and od_next_point[1] != 'outside':
                if self.config['SMOKE_AWARENESS'] and len(path) > 1:
                    if od_at_agent_position[0] < od_next_point[0]:
                        return True
                    else:
                        return False
                else:
                    return False
                
        return False

    def set_floor_teleport_destination_queue_lists(self):
        for exit in self.general['agents_destination'][int(self.floor)]['general_floor_goals']:
            # destination of teleport on n florr is locaten on n-1 when stairs goes downstair
            # and n+1 if stairs goes upstair. queues of agents are formed on n floor
            if exit['type'] == 'teleport' and int(exit['floor']) == int(self.floor) and exit['stair_direction'] == "downstairs":
                self.floor_downstair_teleports_queue[(exit['direction_x'],exit['direction_y'])] = False
            elif exit['type'] == 'teleport' and int(exit['floor']) == int(self.floor) and exit['stair_direction'] == "upstairs":
                self.floor_upstair_teleports_queue[(exit['direction_x'],exit['direction_y'])] = False
            elif exit['type'] == 'teleport' and int(exit['floor']) == int(self.floor)+1 and exit['stair_direction'] == "downstairs":
                self.free_space_coordinates_of_downstair_teleport_destination[(exit['direction_x'],exit['direction_y'])]={'min_x':exit['direction_x']-25, 'max_x':exit['direction_x']+25, 'min_y': exit['direction_y']-25, 'max_y': exit['direction_y']+25}
            elif exit['type'] == 'teleport' and int(exit['floor']) == int(self.floor)-1 and exit['stair_direction'] == "upstairs":
                self.free_space_coordinates_of_upstair_teleport_destination[(exit['direction_x'],exit['direction_y'])]={'min_x':exit['direction_x']-25, 'max_x':exit['direction_x']+25, 'min_y': exit['direction_y']-25, 'max_y': exit['direction_y']+25}    
            
    def read_cfast_record(self, time):
        self.smoke_query.read_cfast_record(time)

    def add_unique_agent_id_on_floor(self, evacuee, i):
        evacuee.unique_agent_id_on_different_floors = i

    def add_unique_agent_ids_on_floor(self, evacuees):
        for evacuee in evacuees:
            self.unique_agent_id_on_floor +=1
            evacuee.unique_agent_id_on_different_floors = self.unique_agent_id_on_floor

    def place_evacuees(self, evacuees):
        assert isinstance(evacuees, Evacuees), '%evacuees is not type of Evacuees'
        
        [self.add_unique_agent_id_on_floor(evacuees.get_pedestrian(i), i)
         for (i) in range(evacuees.get_number_of_pedestrians())]
        self.unique_agent_id_on_floor = evacuees.get_number_of_pedestrians()-1
        self.evacuees = evacuees
        self.add_evacuees_to_navmesh(self.evacuees)


    def append_evacuees(self, evacuees_to_append):
        new_evacuees = Evacuees()
        self.add_unique_agent_ids_on_floor(evacuees_to_append)
        [new_evacuees.add_pedestrian(evacuee) for evacuee in evacuees_to_append]
        self.add_evacuees_to_navmesh(new_evacuees)
        [self.evacuees.add_pedestrian(evacuee) for evacuee in evacuees_to_append]

    def add_evacuees_to_navmesh(self, evacuees):
        assert isinstance(evacuees, Evacuees), '%evacuees is not type of Evacuees' 

        for i in range(evacuees.get_number_of_pedestrians()):
            evacuee = evacuees.get_pedestrian(i)
            RVOSimulator.add_agent(self.simulator, evacuee.unique_agent_id_on_different_floors, evacuee.position)
        [RVOSimulator.set_agent_pref_velocity(self.simulator, i, evacuees.get_velocity_of_pedestrian(i))
         for (i) in range(evacuees.get_number_of_pedestrians())]
        [RVOSimulator.set_agent_max_speed(self.simulator, i, evacuees.get_speed_max_of_pedestrian(i))
         for i in range(evacuees.get_number_of_pedestrians())]

    def delete_agents_from_floor(self,agents_indexes_to_delete):
        unique_agents_ids_on_floor = []
        for index in sorted(agents_indexes_to_delete, reverse=True):
            evacuee = self.evacuees.get_pedestrian(index)
            unique_agents_ids_on_floor.append(evacuee.unique_agent_id_on_different_floors)
            self.evacuees.remove_pedestrian(index)

        rvo_agent_indexes_to_remove = RVOSimulator.get_agent_indexes_by_unique_agent_id_on_floor(self.simulator,unique_agents_ids_on_floor)
        RVOSimulator.delete_agents(self.simulator, sorted(rvo_agent_indexes_to_remove, reverse=False))

    @staticmethod
    def discretize_time(time):
        return int(ceil(time / 10.0)) * 10

    def get_data_for_visualization(self):
        data_row={}
        finished = [self.evacuees.get_finshed_of_pedestrian(i) for i in range(self.evacuees.get_number_of_pedestrians())]
        for n in range(self.evacuees.get_number_of_pedestrians()):
            position = self.evacuees.get_position_of_pedestrian(n)
            velocity = self.evacuees.get_velocity_of_pedestrian(n)
            fed = self.evacuees.get_symbolic_fed_of_pedestrian(n)
            unique_agent_id = self.evacuees.get_unique_agent_id_on_floor(n)
            data_row[unique_agent_id] = [int(position[0]), int(position[1]), velocity[0], velocity[1], fed, finished[n]]
        return data_row

    def update_agents_position(self):
        for i in range(self.evacuees.get_number_of_pedestrians()):
            evacuee = self.evacuees.get_pedestrian(i)
            if self.evacuees.get_finshed_of_pedestrian(i) == 0 and evacuee.target_teleport_coordinates is None:
                self.evacuees.set_position_to_pedestrian(i, (1000000 + i * 200, 10000))
                RVOSimulator.set_agent_position(self.simulator, i, (1000000 + i * 200, 10000))
                # Tu agent opuszcza pietro
                continue
            else:
                x = int(RVOSimulator.get_agent_position(self.simulator, i)[0])
                y = int(RVOSimulator.get_agent_position(self.simulator, i)[1])
                self.evacuees.set_position_to_pedestrian(i, (x,y))

    def update_agents_velocity(self):
        for i in range(self.evacuees.get_number_of_pedestrians()):
            self.evacuees.set_num_of_obstacle_neighbours(i, RVOSimulator.get_agent_num_obstacle_neighbors(self.simulator, i))
            self.evacuees.calculate_pedestrian_velocity(i, self.current_time)
        for i in range(self.evacuees.get_number_of_pedestrians()):
            RVOSimulator.set_agent_pref_velocity(self.simulator, i, self.evacuees.get_velocity_of_pedestrian(i))


    def set_goal(self):
        for e in range(self.evacuees.get_number_of_pedestrians()):
            if (self.evacuees.get_finshed_of_pedestrian(e)) == 0:
                continue
            else:
                # TODO: mimooh temporary fix
                evacuee = self.evacuees.get_pedestrian(e)
                position = evacuee.position
                exit = self._find_closest_exit(e)
                if evacuee.agent_has_no_escape == True:
                    # agent is trapped, has no escape
                    continue
                evacuee.exit_coordinates = (exit[0], exit[1])
                try:
                    vis = RVOSimulator.query_visibility(self.simulator, position, evacuee.path[2], 15)
                    if vis:
                        self.evacuees.set_goal(ped_no=e, navmesh_path=evacuee.path[1:])
                    else:
                        self.evacuees.set_goal(ped_no=e, navmesh_path=evacuee.path)
                except:
                    self.evacuees.set_goal(ped_no=e, navmesh_path=evacuee.path)

    def append_agents_to_move_downstairs_or_upstairs(self, evacuee, pedestrian_number):
        self.agents_to_move_downstairs_or_upstairs.append({
            'agent_number': pedestrian_number,
            'teleport_position': evacuee.target_teleport_coordinates,
            'distance_from_teleport': cdist([evacuee.position], [evacuee.exit_coordinates], 'euclidean')})

    def update_speed(self):
        for i in range(self.evacuees.get_number_of_pedestrians()):
            self.elog.debug('Number of neigbouring agents: {}'.format(RVOSimulator.get_agent_num_agent_neighbors(self.simulator, i)))
            self.elog.debug('Neigbouring distance: {}'.format(RVOSimulator.get_agent_neighbor_dist(self.simulator, i)))
            if (self.evacuees.get_finshed_of_pedestrian(i)) == 0:
                continue
            else:
                self.evacuees.update_speed_of_pedestrian(i)
                agent_speed = self.evacuees.get_speed_of_pedestrian(i)
                agent_speed = self.reduce_agent_on_stairs_speed(agent_speed, i) 
                RVOSimulator.set_agent_max_speed(self.simulator, i, agent_speed)

    def reduce_agent_on_stairs_speed(self, agent_speed, i):
        for stair in self.general['staircases']:
            pedestrian = self.evacuees.get_pedestrian(i)
            if stair['x_min']<pedestrian.position[0]<stair['x_max'] and stair['y_min']<pedestrian.position[1]<stair['y_max']:
                return agent_speed*0.4
        return agent_speed

    def save_feds(self, time):
        with open('fed.csv', 'a') as file:
            for i in range(self.evacuees.get_number_of_pedestrians()):
                old = self.smoke_query.get_fed_deprecated(self.evacuees.get_position_of_pedestrian(i))
                purs = self.smoke_query.get_fed_purser(self.evacuees.get_position_of_pedestrian(i))
                sfpe = self.smoke_query.get_fed_sfpe(self.evacuees.get_position_of_pedestrian(i))
                file.write(f'{time},{i},{old},{purs},{sfpe}\n')

    def update_fed(self):
        fed_over_1 = False
        for i in range(self.evacuees.get_number_of_pedestrians()):
            if (self.evacuees.get_finshed_of_pedestrian(i)) == 0:
                continue
            else:
                #try:
                # find activity level
                activity = 1
                position = self.evacuees.get_position_of_pedestrian(i)
                if self.evacuees.get_velocity_of_pedestrian(i) == (0, 0):
                    activity = 0
                elif 's' in self.smoke_query.xy2room(position):
                    activity = 2

                dfed = self.smoke_query.get_fed_sfpe(position, activity_level=activity)
                if i == 0:
                    self.elog.debug('FED calculated: {}'.format(dfed))
                #except:
                #    self.elog.warning('Simulation without FED')
                #    fed = 0.0
                fed_over_1 = False if self.evacuees.update_fed_of_pedestrian(i, dfed) < 1 else True
                self.evacuees.update_symbolic_fed_of_pedestrian(i)

        # return True if at least one agent has FED=1 (ASET criterion)
        return  fed_over_1
            
    def get_list_of_symbolic_feds(self):
        return [self.evacuees.get_symbolic_fed_of_pedestrian(i) for i in range(self.evacuees.get_number_of_pedestrians())]

    def process_obstacle(self, obstacles):
        for i in range(len(obstacles)):
            obst = list()
            for n in obstacles[i]:
                obst.append(n[0:2])
            RVOSimulator.add_obstacle(self.simulator, obst)
        RVOSimulator.process_obstacles(self.simulator)
        return self.simulator.get_obstacles_count(), 2

    def generate_nav_mesh(self):
        self.nav = Navmesh()
        self.nav.build(floor=str(self.floor))

    def prepare_rooms_list(self):
        self.s = Sqlite(f"{os.environ['AAMKS_PROJECT']}/aamks.sqlite")
        rooms_f = self.s.query('SELECT name from aamks_geom where type_pri="COMPA" and floor = "{}"'.format(self.floor))
        for item in rooms_f:
            self.room_list.update({item['name']: 0.0})


    def update_room_opacity(self):
        smoke_opacity = dict()
        for room in self.room_list.keys():
            opacity =  0.0
            hgt = self.smoke_query.compa_conditions[str(room)]['HGT']
            if hgt == None:
                opacity = self._OD_to_VIS(self.smoke_query.compa_conditions[str(room).split('.')[0]]['ULOD'])
            elif hgt <= self.config['LAYER_HEIGHT']:
                opacity = self._OD_to_VIS(self.smoke_query.compa_conditions[str(room)]['ULOD'])
            else:
                od = self.smoke_query.compa_conditions[str(room)]['LLOD']
                opacity = self._OD_to_VIS(self.smoke_query.compa_conditions[str(room)]['LLOD'])
            if opacity > 0.0 and room not in self.rooms_in_smoke:
                self.rooms_in_smoke.append(room)
            smoke_opacity.update({room: round(opacity, 2)})
            self.elog.debug('ROOM: {}, opacity: {}'.format(room, round(opacity, 2)))
        return smoke_opacity

    def _OD_to_VIS(self, OD):
        self.elog.debug('TIME: {}, optical density: {}'.format(self.current_time, OD))
        if OD <= 1:
            return 0.0
        else:
            vis = self.general['c_const'] / (log(10) * OD)
            if vis <= 3:
                return 1.0
            elif vis >= 30:
                return 0.0
            else:
                return (30-vis)/30

    def update_time(self):
        self.current_time += self.config['TIME_STEP']

    def get_simulation_time(self):
        return self.simulator.getGlobalTime()

    def get_rset_time(self) -> None:
        finished = [self.evacuees.get_finshed_of_pedestrian(i) for i in range(self.evacuees.get_number_of_pedestrians())]
        exited = finished.count(0)
        # if 98% egressed in simulation time but up to 2% stuck (RVO error)
        if (exited > len(finished) * 0.98) and self.per_9 == 0:
            self.rset = self.current_time + 30
        # all egressed but ...?
        if all(x == 0 for x in finished) and self.rset == 0:
            self.rset = self.current_time + 30

    def do_simulation(self, step):
        self.step = step
        # update goal and speed every 10th step
        # we call the navmesh every odd number of steps because we want to avoid 
        # the problem of the agent oscillating around the top of the navigation mesh, 
        # which sometimes happens if we call the navmesh every 10 steps, for example
        if (step % 9) == 0:
            self.set_goal()
            self.update_speed()
        self.check_if_agents_reached_goal()
        self.update_agents_velocity()
        RVOSimulator.do_step(self.simulator, self.config['TIME_STEP'])

        self.update_agents_position()
        self.update_time()
        #self.elog.info(self.current_time)
        #if (step % self.config['SMOKE_QUERY_RESOLUTION']) == 0:
        aset_bool = self.update_fed()
        self.dfed.update_dfed(self.config['TIME_STEP'], self.evacuees)
        if self.rset == 0:
            self.get_rset_time()
        return aset_bool

    def reset_floor_downstair_teleport_queue_list(self):
        for key, value in self.floor_downstair_teleports_queue.items():
            self.floor_downstair_teleports_queue[key] = False

    def reset_floor_upstair_teleport_queue_list(self):
        for key, value in self.floor_upstair_teleports_queue.items():
            self.floor_upstair_teleports_queue[key] = False

    def check_if_agents_reached_goal(self):
        for e in range(self.evacuees.get_number_of_pedestrians()):
            if (self.evacuees.get_finshed_of_pedestrian(e)) == 0:
                continue
            else:
                if not self.evacuees.check_if_agent_reached_outside_door(ped_no=e):
                    self.evacuees.has_agent_reached_teleport(self.floor, ped_no=e)
                    evacuee = self.evacuees.get_pedestrian(e)
                    if evacuee.target_teleport_coordinates is not None and evacuee.finished == 0:
                        self.append_agents_to_move_downstairs_or_upstairs(evacuee, e)

# Total FED growth spatial function (per floor)
class FEDDerivative:
    def __init__(self, floor: int):
        self.floor = floor
        self.dim = self._find_2dims()

        self.raw = []
        self.raw_df = pd.DataFrame(self.raw)

        self.cell_size = [50, 50]    # fixed cell size [dx,dy] [cm]
        self.celled = self._meshing()
        self.celled_df = pd.DataFrame(self.celled)

    # find dimensions of the plane returns list: [[xmin, ymin], [xmax, ymax]]
    def _find_2dims(self):
        aamks_sqlite = Sqlite(f"{os.environ['AAMKS_PROJECT']}/aamks.sqlite")
        dims = []
        q = aamks_sqlite.query(f"SELECT points, type_sec FROM aamks_geom as a WHERE a.floor = '{self.floor}' and \
                (a.name LIKE 'r%' or a.name LIKE 'c%' or a.name LIKE 'a%' or a.name LIKE 's%');")
        def minmax(pts):
            ret = []
            xys = list(zip(*pts))
            ret.append([min(xys[i]) for i in range(2)])
            ret.append([max(xys[i]) for i in range(2)])
            return ret

        for i in q:
            dims.extend(minmax(json.loads(i['points'])))

        return minmax(dims)

    def _meshing(self):
        # mesh geometry with structurized quadrilaterall elements (of self.size dimensions)

        shape = [self._dim2cell(self.dim[1][ax], axis=ax) for ax in range(2)]

        return zeros(shape)

    def _append_to_cell(self, x: float, y: float, value: float):
        i = self._dim2cell(x)
        j = self._dim2cell(y, axis=1)

        self.celled[i, j] += value
   

    def _cell2dim(self, cell_no: int, axis=0):
        # return the minimum coordinate of [cell_no] cell, axis==0 for X, 1 for Y
        return cell_no * self.cell_size[axis] + self.dim[0][axis]

    def _dim2cell(self, dim: float, axis=0):
        # return cell number for given dimension, axis==0 for X, 1 for Y !!! int is not the best function here!!!
        cell_no = int((dim - self.dim[0][axis]) / self.cell_size[axis])
        if cell_no < 0:
            raise ValueError(f'Cell number takes only positive values ({dim}, {cell_no})')
        else:
            return cell_no

    def update_dfed(self, dt: float, evacuees):
        # iterate over agents that are present on the floor at the moment
        for agent in evacuees.pedestrians:
            x, y = agent.position
            dfed = agent.dfed
            if dfed > 0:
                self.raw.append({'x':x, 'y':y, 'dfed/dt':dfed/dt})
                try:
                    self._append_to_cell(x, y, dfed/dt)
                except IndexError:
                    # evacuee outside the building
                    pass
        
    # exporting non-zero dfed cells
    def export(self):
        exp = []
        for i, v in ndenumerate(self.celled):
            if v > 0: 
                row = {'cell_id': i, 'xmin': self._cell2dim(i[0]), 'xmax': self._cell2dim(i[0]+1),
                        'ymin': self._cell2dim(i[1], axis=1), 'ymax': self._cell2dim(i[1]+1, axis=1), 'total_dfed': v}
                exp.append(row)
        return pd.DataFrame(exp).to_json()

        
