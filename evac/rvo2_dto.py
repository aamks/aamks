import copy
import warnings
import json
import os
import pandas as pd
import math
from collections import OrderedDict
from math import ceil, log, isinf
from shapely.geometry import LineString,LineString, box
from include import Sqlite, Json
from numpy import array, prod, zeros, ndenumerate
from scipy.stats import norm
from scipy.spatial.distance import cdist
from geom.nav import Navmesh
from evac.pyrvo.rvo_simulator import RVOSimulator
from evac.evacuees import Evacuees
from evac.evacuee import Evacuee
from evac.exit import CompartmentExit, Teleport, TermianlDoorExit, RoomGoalExit
from evac.compartments import Compartments
from evac.compartment import Compartment
from typing import List, Optional

warnings.simplefilter('ignore', RuntimeWarning)

class EvacEnv:

    def __init__(self, aamks_vars, floor, compartments,terminal_door_exits,teleports,sim_id=None,):
        self.json = Json()
        self.sim_id = sim_id
        self.evacuees = Evacuees
        self.max_speed = 0
        self.current_time = 0
        self.smoke_query = None # PartitionQuery()
        self.floor = floor
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
        self.unavailable_rooms = []
        self.time_last_agent_left_the_floor = None
        self.compartments: Compartments = compartments
        self.terminal_door_exits: List[TermianlDoorExit] = terminal_door_exits
        self.teleports: List[Teleport] = teleports



        f = open(os.path.join(os.environ['AAMKS_PATH'], 'evac','config.json'), 'r')
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
        new_sql_path = os.path.join(self.general['working_dir'], f"aamks_{self.sim_id}.sqlite")
        if os.path.exists(new_sql_path):
            self.s=Sqlite(new_sql_path)
        else:
            self.s=Sqlite("{}/aamks.sqlite".format(os.environ['AAMKS_PROJECT']))

        self.dfed = FEDDerivative(self.floor, sqlite=self.s)
        self.detection = Detection(self)


    def _find_closest_exit(self, evacuee):
        if evacuee.current_compartment.name == "outside" and evacuee.leader.finished == 0:
        # room_exit_goal terminal exit outside handle
            path, exit = self._get_shortest_navmesh_path(evacuee,{evacuee.leader.exit})


        if self.is_room_goal_weight_logic_defined(evacuee.current_compartment):
        # exit doors were defined for this room so agent will reach goal from room_exit_weight dict
            path, exit = self._get_path(evacuee, is_goal_in_rooms_goals=True)
        else:
        # exit doors were not defined for this room so agent will reach goal from general_floor_goals dict
            path, exit = self._get_path(evacuee, is_goal_in_rooms_goals=False)

        if path is None and exit is None:
            evacuee.agent_has_no_escape = True
            return None
        else:
            return path, exit


    def is_room_goal_weight_logic_defined(self, compartment):
        if compartment.roomGoalExits is None:
            return False
        room_exit_weights = [exit.room_exit_weight for exit in compartment.roomGoalExits]
        # weights are equal so there is no logic
        if len(set(room_exit_weights)) == 1:
            return False

        # at least 1 weight is different than 
        # default 1 - there is logic
        for exit in compartment.roomGoalExits:
            if exit.room_exit_weight != 1:
                return True
        return False


    def find_path_to_leader(self, evacuee):
        if self.evacuees.check_if_agent_exists(evacuee.leader):
            if evacuee.current_floor != evacuee.leader.current_floor or evacuee.leader.finished == 0:
                return self._find_closest_exit(evacuee)

            if evacuee.leader.agent_has_no_escape:
                return self._find_closest_exit(evacuee)

            if evacuee.current_compartment.name == 'outside':
                return self._find_closest_exit(evacuee)

            exit = 'follow_leader'

            x, y = evacuee.leader.position

            # follower keeps a little distance so as not to fly into the leader and move him
            if math.dist(evacuee.position, evacuee.leader.position) <= 300:
                return None

            navmesh_path = self.nav.nav_query_first_navmesh(src=evacuee.position, dst=(x, y), maxStraightPath=999)

            if navmesh_path[0] == 'err':
                # agent cannot find path to his leader
                # so he finds normal exit path
                return self._find_closest_exit(evacuee)
            
            return navmesh_path, exit
        else:
            return self._find_closest_exit(evacuee)

    def get_general_goals_best_path(self,evacuee):
        if evacuee.exits_path is None or evacuee.current_compartment.name not in evacuee.exits_path:
            shortest_navmesh_path,terminal_exit = self._get_shortest_navmesh_path_general_goals(evacuee)
            if shortest_navmesh_path is None:
                return None, None
            self.find_exits_path_to_the_floor_exit(evacuee, shortest_navmesh_path,terminal_exit)  
        exit = self.get_exit_from_exits_path(evacuee) 

        if isinstance(exit, CompartmentExit) or isinstance(exit, TermianlDoorExit):
            x,y = exit.x_direction,exit.y_direction
        elif isinstance(exit, Teleport):
            x,y = exit.x,exit.y

        return self.nav.nav_query_first_navmesh(src=evacuee.position, dst=(x, y), maxStraightPath=999), exit

    def get_exit_from_exits_path(self,evacuee):
        current_comp = evacuee.current_compartment.name
        while True:
            exit = evacuee.exits_path[current_comp]
            # we skip hole and get further exit
            # so that agents don't go through the middle of the hole
            if exit.name.startswith("z"):
                current_comp = self.compartments.get_adjecent_room(exit.name, current_comp)
            else:
                return exit

    def get_rooms_goals_best_path(self,evacuee):
        exits_dict = evacuee.current_compartment.roomGoalExits
        return self._get_shortest_navmesh_path(evacuee,exits_dict)

    def _get_path(self, evacuee, is_goal_in_rooms_goals):
        if is_goal_in_rooms_goals and evacuee.reset_behavior_due_to_panic[self.floor]==False:
            return self.get_rooms_goals_best_path(evacuee)
        else:
            return self.get_general_goals_best_path(evacuee)
            
    def _get_shortest_navmesh_path_general_goals(self,evacuee):
        exits_dict = self.teleports + self.terminal_door_exits
        return self._get_shortest_navmesh_path(evacuee,exits_dict)

    def _get_shortest_navmesh_path(self,evacuee, exits_dict):
        navmesh_path = None
        paths = list()

        if evacuee.current_compartment.name in self.unavailable_rooms:
            # agent room is in smoke
            # so the agent can walk through the smoke further
            paths = self.get_paths(evacuee, exits_dict, walk_through_the_smoke = True)
        elif evacuee.reset_behavior_due_to_panic[self.floor]==False:
            # agent is not in room in smoke so he goes to 
            # the best exit not knowing if there will be a fire on the way. 
            # If he comes across a fire on the way he will change the direction 
            paths = self.get_paths(evacuee, exits_dict, walk_through_the_smoke = True)
        elif evacuee.reset_behavior_due_to_panic[self.floor]==True:
            # the agent is in panic so now he will move along the smoke-free path to the exit
            paths = self.get_paths(evacuee, exits_dict, walk_through_the_smoke = False)
        if len(paths) == 0:
            # there is no passage so
            # agent must escape through the smoke
            paths = self.get_paths(evacuee, exits_dict, walk_through_the_smoke = True)

      
        if len(paths) > 0:
            path_weights = list(zip(*paths))[2]
            # index of exit with the smallest weight equal to the product of distance and output weight
            index_min_path_weight = path_weights.index(min(path_weights))
            navmesh_path = paths[index_min_path_weight][4]
            exit = paths[index_min_path_weight][3]

            return navmesh_path, exit
        else:
            return None, None

    def get_paths(self,evacuee, exits_dict, walk_through_the_smoke):
        paths = list()
        
        for exit in exits_dict:

            path = []
            x, y = exit.x, exit.y
            if isinstance(exit, TermianlDoorExit) or isinstance(exit, RoomGoalExit):
                x, y = exit.x_direction, exit.y_direction

            
            if walk_through_the_smoke == False:
                path = self.nav.nav_query(src=evacuee.position, dst=(x, y), maxStraightPath=999)
            else:
                path = self.nav.nav_query_first_navmesh(src=evacuee.position, dst=(x, y), maxStraightPath=999)

            if path[0] == 'err':
                continue
            
            if isinstance(exit, TermianlDoorExit) or isinstance(exit, Teleport):
                exit_weight = exit.general_exit_weight
            elif isinstance(exit, RoomGoalExit):
                exit_weight = exit.room_exit_weight
            else:
                exit_weight = 1

            if len(path) == 1:
                path_length = 1
            else:
                path_length = LineString(path).length
            if isinf(exit_weight):
                exit_dist_considering_weight = path_length*100000
            else:
                exit_dist_considering_weight = path_length*exit_weight
            paths.append([x, y, exit_dist_considering_weight, exit, path])

        return paths

    def find_doors_on_path(self, evacuee, shortest_navmesh_path):

        exits_list = {}
        visited_doors = set()

        current_comp_name = self.compartments.get_room_name_for_point(shortest_navmesh_path[0])
        for i in range(len(shortest_navmesh_path) - 1):
            p1 = shortest_navmesh_path[i]
            p2 = shortest_navmesh_path[i + 1]
            segment_line = LineString([p1, p2])
            p1_comp = self.compartments.get_room_for_point(p1)
            p2_comp = self.compartments.get_room_for_point(p2)
            segment_done = False

            while not segment_done:
                found_door = False

                for door in self.compartments.get_comp_exits(current_comp_name):
                    if door.name in visited_doors:
                        continue

                    door_box = box(door.x_min, door.y_min, door.x_max, door.y_max)

                    p1_comp_name = p1_comp.name if hasattr(p1_comp, 'name') else str(p1_comp)
                    p2_comp_name = p2_comp.name if hasattr(p2_comp, 'name') else str(p2_comp)

                    if segment_line.intersects(door_box) and p1_comp_name != p2_comp_name:
                        # p1_comp_name != p2_comp_name because sometiomes 
                        # p1 is located on the exit to the adjacent room,
                        # to which there is no path - the path leads in the opposite direction

                        # we go to the next room
                        next_comp_name = door.get_next_comp(current_comp_name)

                        if not next_comp_name:
                            # Cannot find next compartment for door
                            segment_done = True
                            break
                        next_comp = self.compartments.get_compartment(next_comp_name)
                        if next_comp is None or segment_line.intersects(box(next_comp.x_min, next_comp.y_min, next_comp.x_max, next_comp.y_max)):
                            #we check above condition becouse sometimes the agent stands at the exit to the room 
                            #on the opposite side and then 2 exits meet the intersect condition
                            #but we only want the exit that leads to the correct room
                            exits_list[current_comp_name] = door
                            visited_doors.add(door.name)

                            current_comp_name = next_comp_name
                            found_door = True
                            break  # check the door again in the new room

                if not found_door:
                    # line no longer crosses doors in current_comp
                    segment_done = True

        return exits_list


    def find_exits_path_to_the_floor_exit(self,evacuee, shortest_navmesh_path,terminal_exit):

        if not shortest_navmesh_path:
            raise Exception("you cannot pass empty shortest_navmesh_path to this function")
        exits_list = self.find_doors_on_path(evacuee, shortest_navmesh_path)
        if isinstance(terminal_exit, Teleport):
            teleport_room_name = self.compartments.get_room_name_for_point((terminal_exit.x,terminal_exit.y))
            exits_list[teleport_room_name] = terminal_exit
        elif isinstance(terminal_exit, TermianlDoorExit):
            exits_list['outside'] = terminal_exit

        evacuee.exits_path = exits_list


    def set_floor_teleport_destination_queue_lists(self):
        for teleport in self.teleports:
            # destination of teleport on n florr is locaten on n-1 when stairs goes downstair
            # and n+1 if stairs goes upstair. queues of agents are formed on n floor
            if int(teleport.floor) == int(self.floor) and teleport.stair_direction == "downstairs":
                self.floor_downstair_teleports_queue[(teleport.x_direction,teleport.y_direction)] = False
            elif int(teleport.floor) == int(self.floor) and teleport.stair_direction == "upstairs":
                self.floor_upstair_teleports_queue[(teleport.x_direction,teleport.y_direction)] = False
            elif int(teleport.floor) == int(self.floor)+1 and teleport.stair_direction == "downstairs":
                self.free_space_coordinates_of_downstair_teleport_destination[(teleport.x_direction,teleport.y_direction)]={'min_x':teleport.x_direction-25, 'max_x':teleport.x_direction+25, 'min_y': teleport.y_direction-25, 'max_y': teleport.y_direction+25}
            elif int(teleport.floor) == int(self.floor)-1 and teleport.stair_direction == "upstairs":
                self.free_space_coordinates_of_upstair_teleport_destination[(teleport.x_direction,teleport.y_direction)]={'min_x':teleport.x_direction-25, 'max_x':teleport.x_direction+25, 'min_y': teleport.y_direction-25, 'max_y': teleport.y_direction+25}    
            
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
        for n in range(self.evacuees.get_number_of_pedestrians()):
            ped = self.evacuees.get_pedestrian(n)
            prev_floor = ped.has_agent_changed_floor()
            if ped.has_agent_moved() or prev_floor is not None:
                position = ped.position
                velocity = ped.velocity
                fed = ped.symbolic_fed
                finished = ped.finished
                unique_agent_id = ped.unique_agent_id_on_different_floors
                floor = ped.current_floor
                id = ped.id
                data_row[unique_agent_id] = [int(position[0]), int(position[1]), velocity[0], velocity[1], fed, floor, id, prev_floor]
        return data_row

    def update_agents_position(self):
        for i in range(self.evacuees.get_number_of_pedestrians()):
            evacuee = self.evacuees.get_pedestrian(i)
            if self.evacuees.get_finshed_of_pedestrian(i) == 0 and not isinstance(evacuee.exit, Teleport):

                self.evacuees.set_position_to_pedestrian(i, (1000000 + i * 200, 10000))
                RVOSimulator.set_agent_position(self.simulator, i, (1000000 + i * 200, 10000))
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
        sorted_evacuees = sorted(self.evacuees.pedestrians, key=lambda evacuee: evacuee.type == 'follower')
        for evacuee in sorted_evacuees:
            position = evacuee.position
            if evacuee.agent_has_no_escape == True:
                # agent is trapped, has no escape
                continue
            else:                  
                position = evacuee.position

                if evacuee.type == 'follower':
                    result = self.find_path_to_leader(evacuee)
                    if result is not None:
                        path, exit = result
                        evacuee.path = path
                        evacuee.exit = exit
                    else:
                        evacuee.path = None
                        evacuee.exit = None
                else:
                    result = self._find_closest_exit(evacuee)
                    if result is not None:
                        path, exit = result
                        evacuee.path = path
                        evacuee.exit = exit
                try:
                    vis = RVOSimulator.query_visibility(self.simulator, position, evacuee.path[2], 15)
                    if vis:
                        evacuee.set_goal(navmesh_path=evacuee.path[1:])
                    else:
                        evacuee.set_goal(navmesh_path=evacuee.path)
                except:
                    evacuee.set_goal(navmesh_path=evacuee.path)


    def append_agents_to_move_downstairs_or_upstairs(self, evacuee, pedestrian_number):
        self.agents_to_move_downstairs_or_upstairs.append({
            'agent_number': pedestrian_number,
            'teleport_position': (evacuee.exit.x_direction,evacuee.exit.y_direction),
            'distance_from_teleport': cdist([evacuee.position], [(evacuee.exit.x,evacuee.exit.y)], 'euclidean')})

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
            evacuee = self.evacuees.get_pedestrian(i)
            if evacuee.finished == 0:
                continue
            #try:
            # find activity level
            activity = 1
            
            evacuee = self.evacuees.get_pedestrian(i)
            if self.evacuees.get_velocity_of_pedestrian(i) == (0, 0):
                activity = 0
            elif 's' in evacuee.current_compartment.name:
                activity = 2

            dfed = self.smoke_query.get_fed_sfpe(evacuee.current_compartment.name, activity_level=activity)
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

    def generate_nav_mesh(self, working_dir,fire):
        self.nav = Navmesh(self.sim_id)
        self.nav.build(fire, floor=str(self.floor), wd=working_dir)

    def prepare_rooms_list(self):
        rooms_f = self.s.query('SELECT name from aamks_geom where type_pri="COMPA" and floor = "{}"'.format(self.floor))
        for item in rooms_f:
            self.room_list.update({item['name']: 0.0})

    def update_room_opacity(self):
        smoke_opacity = dict()
        self.unavailable_rooms = []    # rooms can be available again
        for room in self.room_list.keys():
            hgt = self.smoke_query.compa_conditions[str(room)]['HGT']
            if hgt == None:
                opacity = self._OD_to_OPACITY(self.smoke_query.compa_conditions[str(room).split('.')[0]]['ULOD'])
            elif hgt <= self.config['LAYER_HEIGHT']:
                opacity = self._OD_to_OPACITY(self.smoke_query.compa_conditions[str(room)]['ULOD'])
            else:
                opacity = self._OD_to_OPACITY(self.smoke_query.compa_conditions[str(room)]['LLOD'])

            if opacity > 0.0 and room not in self.rooms_in_smoke:
                self.rooms_in_smoke.append(room)
            if opacity > 2/3:
                self.unavailable_rooms.append(room)
            smoke_opacity.update({room: round(opacity, 2)})
            self.elog.debug('ROOM: {}, opacity: {}'.format(room, round(opacity, 2)))
        return smoke_opacity

    def _OD_to_OPACITY(self, OD):
        if OD is None:
            OD = 0.0
        self.elog.debug('TIME: {}, optical density: {}'.format(self.current_time, OD))
        if OD:
            vis = self.general['c_const'] / (log(10) * OD)
            if vis <= 3:
                return 1.0
            elif vis >= 30:
                return 0.0
            else:
                return (30-vis)/30
        else:
            return 0.

    def update_time(self):
        self.current_time += self.config['TIME_STEP']

    def get_simulation_time(self):
        return self.simulator.getGlobalTime()


    def is_agent_approaching_room(self, evacuee, door_center):
        if abs(evacuee.position[0] - door_center[0]) < 50 and abs(evacuee.position[1] - door_center[1] < 50):
            dx = door_center[0] - evacuee.position[0]  
            dy = door_center[1] - evacuee.position[1]
            vector = evacuee.velocity
            return (dx == 0 or (dx > 0 and vector[0] > 0) or (dx < 0 and vector[0] < 0)) and \
                (dy == 0 or (dy > 0 and vector[1] > 0) or (dy < 0 and vector[1] < 0))
        return False

    def _next_room_in_smoke(self, evacuee):
        path = evacuee.path
        if path is None:
            return False
        for point in path[1:]:
            next_point = self.smoke_query.get_visibility(point)
            od_next_point = next_point[0]
            room_next_point = next_point[1]
            if room_next_point != evacuee.current_compartment.name and room_next_point != 'outside':
                if self.config['SMOKE_AWARENESS'] and len(path) > 1:
                    if room_next_point in self.unavailable_rooms:
                        return True
        return False

    def update_evacuees_properties(self):
        for i in range(self.evacuees.get_number_of_pedestrians()):  
            evacuee = self.evacuees.get_pedestrian(i)

            visibility_data = self.smoke_query.get_visibility(evacuee.position)

            OD = visibility_data[0]
            evacuee.current_compartment = Compartment('outside')
            for comp in self.compartments.compartments:
                if comp.name.startswith(visibility_data[1]+"."):
                    evacuee.current_compartment = comp
                if comp.name == visibility_data[1]:
                    evacuee.current_compartment = comp
                # starts with because stairs on upper floors are for example s21.2
                

            evacuee.optical_density_at_position = OD
            if evacuee.current_compartment.name in self.unavailable_rooms:
                self.reset_behavior_due_to_panic(evacuee)
            if self._next_room_in_smoke(evacuee):
                self.reset_behavior_due_to_panic(evacuee)

        adjecent_rooms_to_reset_behavior_due_to_panic = set()
        rooms_where_reset_behavior_due_to_panic_is_set = set()
        for i in range(self.evacuees.get_number_of_pedestrians()):  
            evacuee = self.evacuees.get_pedestrian(i)
            if evacuee.current_compartment == 'outside':
                continue
            if evacuee.reset_behavior_due_to_panic[self.floor] == False:
                continue
            rooms_where_reset_behavior_due_to_panic_is_set.add(evacuee.current_compartment.name)

            interior_doors_current_compartment = [exit for exit in evacuee.current_compartment.compartmentExits if exit.leads_outside == False]
            for door in interior_doors_current_compartment:
                adjecent_room = self.compartments.get_adjecent_room(door.name, evacuee.current_compartment.name)
                if self.is_agent_approaching_room(evacuee,(door.x, door.y)):
                    adjecent_rooms_to_reset_behavior_due_to_panic.add(adjecent_room)

        for i in range(self.evacuees.get_number_of_pedestrians()):  
            evacuee = self.evacuees.get_pedestrian(i)
            if evacuee.current_compartment.name in adjecent_rooms_to_reset_behavior_due_to_panic or evacuee.current_compartment.name in rooms_where_reset_behavior_due_to_panic_is_set:
                if evacuee.velocity != (0,0):
                    self.reset_behavior_due_to_panic(evacuee)
                    
    def reset_behavior_due_to_panic(self, evacuee):
        # if the behavior has already been reset, we do not reset it again 
        # - the agent can panic and be in panic only once on floor
        if evacuee.reset_behavior_due_to_panic[self.floor] == False:
            evacuee.reset_behavior_due_to_panic[self.floor]=True
            evacuee.exits_path = None

    def do_simulation(self, step):
        self.step = step
        # update goal and speed every 9th step
        # we call the navmesh every odd number of steps because we want to avoid 
        # the problem of the agent oscillating around the top of the navigation mesh, 
        # which sometimes happens if we call the navmesh every even number of times
        if (step % 9) == 0:
            self.update_evacuees_properties()
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
                evacuee = self.evacuees.get_pedestrian(e)
                if evacuee.check_if_agent_reached_outside_door():
                    self.time_last_agent_left_the_floor = self.current_time
                elif evacuee.has_agent_reached_teleport():
                    self.append_agents_to_move_downstairs_or_upstairs(evacuee, e)
                    self.time_last_agent_left_the_floor = self.current_time
                
# Total FED growth spatial function (per floor)
class FEDDerivative:
    def __init__(self, floor: int, sqlite):
        self.s = sqlite
        self.floor = floor
        self.dim = self._find_2dims()

        self.raw = []
        self.raw_df = pd.DataFrame(self.raw)

        self.cell_size = [50, 50]    # fixed cell size [dx,dy] [cm]
        self.celled = self._meshing()
        self.celled_df = pd.DataFrame(self.celled)

    # find dimensions of the plane returns list: [[xmin, ymin], [xmax, ymax]]
    def _find_2dims(self):
        dims = []
        q = self.s.query(f"SELECT points, type_sec FROM aamks_geom as a WHERE a.floor = '{self.floor}' and \
                (a.name LIKE 'r%' or a.name LIKE 'c%' or a.name LIKE 'a%' or a.name LIKE 's%');")
        def minmax(pts):
            ret = []
            xys = list(zip(*pts))
            ret.append([min(xys[i])-100 for i in range(2)])
            ret.append([max(xys[i])+100 for i in range(2)])
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


class Detection:
    def __init__(self, eenv: EvacEnv):
        self.evac_conf = eenv.general    # more data in conf from worker vars to be inherited in the future
        self.eenv = eenv
        self.time = eenv.current_time
        self.config = eenv.config
        self.state = {}
        self.rooms = []
        self.sensors = []
        self.conditions = []
        self.room_heights = {}

    def _get_rooms_sensors(self, all_compas):
        for entity in all_compas:
            if entity.startswith(('sd', 'sp', 'hd')):
                self.sensors.append(entity)
            elif entity.startswith('t_'):
                # we don't care about targets - those are for fire spread
                continue
            else:
                self.rooms.append(entity)

    def _initialize(self):
        self.conditions = self.eenv.smoke_query.compa_conditions
        self._get_rooms_sensors(self.eenv.smoke_query.all_compas)
        self.room_heights = {room: None for room in self.rooms}
        self.state = dict(rooms={room: None for room in self.rooms}, floor=None)
        # initial heights
        initial = copy.deepcopy(self.conditions)
        for r in self.rooms:
            self.room_heights[r] = initial[r]['HGT']
        del initial

        # set fire origin room detection to 0.001 (can't be 0 because bool(0) = False)
        self.state['rooms'][self.evac_conf['FIRE_ORIGIN']] = .001

    def _od_to_vis(self, optical_density):
        # convert optical density to visibility
        if optical_density:
            return min([30, self.evac_conf['c_const'] / (optical_density * log(10))])
        else:
            return 30

    def _is_fire_from_sensor(self, sensor):
        # return sensor state
        return bool(self.conditions[sensor]['SENSACT'])

    def _is_fire_symptom(self, room: str):
        actual_ulod = self.conditions[self.cfast_name(room)]['ULOD']
        actual_height = self.conditions[room]['HGT']
        initial_height = self.room_heights[room]
        # check for fire symptoms in room
        if not initial_height and not actual_height:
            # one-zone model
            if self._od_to_vis(actual_ulod) <= self.config['LOWEST_VIS']:
                return True
        elif actual_height <= self.config['PRE_EVAC_TIME_ZONE_REDUCTION'] * initial_height:
            # two-zone model
            if self._od_to_vis(actual_ulod) <= self.config['LOWEST_VIS']:
                return True
        return False

    def _update_floor_state(self):
        # iterate over sensors to evaluate their state
        if not self.state['floor']:
            for sensor in self.sensors:
                if self._is_fire_from_sensor(sensor):
                    self.state['floor'] = self.time

    def _update_rooms_state(self):
        # iterate over rooms to evaluate rooms' conditions and state
        for room in self.rooms:
            if self.state['rooms'][room]:
                continue
            if self._is_fire_symptom(room):
                self.state['rooms'][room] = self.time

    def _delay_from_room(self, room: str, pre_evac: float):
        # calculate total delay time for room that is in fire
        room_detection = self.state['rooms'][room]
        if room_detection:
            return room_detection + pre_evac
        else:
            return self.config['DETECTION_TIME']

    def _delay_from_floor(self, alarm: float, pre_evac: float):
        # calculate total delay time for room that is in fire
        floor_detection = self.state['floor']
        if floor_detection:
            return floor_detection + alarm + pre_evac
        else:
            return self.config['DETECTION_TIME']

    def _get_pedestrian_delay(self, evacuee: Evacuee):
        floor_data = self.evac_conf['FLOORS_DATA'][str(self.eenv.floor)]

        room_delay = self._delay_from_room(evacuee.detection_compa, evacuee.detection_constituents['pre_evac_fire_origin'])
        if evacuee.detection_compa == self.evac_conf['FIRE_ORIGIN']:
            return room_delay
        else:
            floor_delay = self._delay_from_floor(floor_data['ALARMING'], evacuee.detection_constituents['pre_evac'])
            return min(floor_delay, room_delay)

    def _update_delays(self):
        # iterate over evacuees and if still not moving set them proper delay
        for evacuee in self.eenv.evacuees.pedestrians:
            if evacuee.velocity != (0, 0):
                continue
            new_delay = self._get_pedestrian_delay(evacuee)
            if evacuee.pre_evacuation_time > new_delay:
                evacuee.pre_evacuation_time = new_delay

    def cfast_name(self, aamks_geom_name):
        return aamks_geom_name.split('.')[0]

    def update(self):
        self.time = round(self.eenv.current_time, 2)
        if self.time == 0:
            self._initialize()
        else:
            # update state variables if needed
            self._update_floor_state()
            self._update_rooms_state()
            # update evacuees pre-evac times
            self._update_delays()
            # return floor detection time
        return self.state['floor']
