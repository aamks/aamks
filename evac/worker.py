#!/usr/bin/python3
import os
import sys
from numpy import array, prod
import time
import logging
import json
from collections import OrderedDict
from subprocess import run, TimeoutExpired
import zipfile
import pandas as pd
from io import StringIO
import shutil
from evac.pathfinder import read_from_text
from include import Psql, Json, Sqlite
from evac.pathfinder.navmesh import Navmesh as Pynavmesh
from results.beck_new import RiskIteration as RI
from evac.evacuee import Evacuee
from evac.evacuees import Evacuees
from evac.rvo2_dto import EvacEnv
from fire.partition_query import PartitionQuery

SIMULATION_TYPE = 1
if 'AAMKS_SKIP_CFAST' in os.environ:
    if os.environ['AAMKS_SKIP_CFAST'] == '1':
        SIMULATION_TYPE = 'NO_CFAST'


class Worker:

    def __init__(self, redis_worker_pwd = None, AA=None):
        self.wlogger = None
        self.config = None
        self.project_conf = None

        if AA:
            os.environ['AAMKS_PROJECT'] = AA['PROJECT']
            os.environ['AAMKS_PATH'] = AA['PATH']
            os.environ['AAMKS_SERVER'] = AA['SERVER']
            os.environ['AAMKS_PG_PASS'] = AA['PG_PASS']

        if redis_worker_pwd: 
            self.working_dir = redis_worker_pwd 
        else:
            self.working_dir=sys.argv[1] if len(sys.argv)>1 else "{}/workers/1/".format(os.environ['AAMKS_PROJECT'])

        self.project_dir = self.working_dir.split("/workers/")[0]
        self.sim_id = int(self.working_dir.split("/workers/")[1])

        new_sql_path = os.path.join(self.working_dir, f"aamks_{self.sim_id}.sqlite")
        if os.path.exists(new_sql_path):
            self.s=Sqlite(new_sql_path)
        else:
            self.s=Sqlite("{}/aamks.sqlite".format(os.environ['AAMKS_PROJECT']))
        self.json=Json()
        self.json.s = self.s
        self.AAMKS_SERVER=self.json.read("/etc/aamksconf.json")['AAMKS_SERVER']
        os.environ["AAMKS_PROJECT"] = self.project_dir
        os.chdir(self.working_dir)
        self.vars = OrderedDict()
        self.results = dict()
        self.obstacles = None
        self.floor_dims = None
        self.evacuees = None
        self.fire_dto = None
        self.sim_floors = None
        self.floors = list()
        self.host_name = os.uname()[1]
        self.cross_building_results = None
        self.simulation_time = None
        self.time_shift = None
        self.animation_data = []
        self.smoke_opacity = []
        self.rooms_in_smoke = dict()
        self.position_fed_tables_information = []
        self.rows_to_insert = []
        self.detection_time = None
        self.rooms_det_time = {}
        self.start_time = time.time()
        self.max_exit_weight = 10
        self.exit_code = None
        self.rooms = {}
        self.is_anim = 0
        self.previous_critical_rooms = {}


    def get_logger(self, logger_name):
        FORMATTER = logging.Formatter('%(asctime)s - %(name)-14s - %(levelname)s - %(message)s')
        LOG_FILE = f"{self.working_dir}/aamks.log"
        file_handler = logging.FileHandler(LOG_FILE)
        file_handler.setFormatter(FORMATTER)
        file_handler.setLevel(logging.INFO)

        logger = logging.getLogger(logger_name)
        #logger.setLevel(eval('logging.{}'.format(self.config['LOGGING_MODE'])))
        logger.setLevel(logging.DEBUG)
        logger.addHandler(file_handler)
        logger.propagate = False
        ch = logging.StreamHandler()
        ch.setLevel(logging.INFO)
        ch.setFormatter(FORMATTER)
        logger.addHandler(ch)

        return logger

    def get_config(self):
        #this statement prevents redis_aamks/worker/worker.py from creating new loggers during every iteration
        if not logging.getLogger(f'{self.host_name} - worker.py').handlers:
            self.wlogger = self.get_logger(f'{self.host_name} - worker.py')
        else:
            self.wlogger = logging.getLogger(f'{self.host_name} - worker.py')
        try:
            f = open(os.path.join(os.environ['AAMKS_PATH'], 'evac', 'config.json'), 'r')
            self.config = json.load(f)
        except Exception as e:
            self.wlogger.error(e)
            self.send_report(e={"status":16})
            raise SystemError(16)
        try:
            f = open('evac.json', 'r')
            self.vars['conf'] = json.load(f)
        except Exception as e:
            self.wlogger.error('Cannot load evac.json from directory: {}'.format(str(e)))
            self.send_report(e={"status":17})
            raise SystemError(17)

        self.detection_time = self.config['DETECTION_TIME']
        self.project_conf=self.json.read("../../conf.json")

        if not logging.getLogger(f'{self.host_name} - evac.py  ').handlers: 
            self.vars['conf']['logger'] = self.get_logger(f'{self.host_name} - evac.py  ')
        else:
            self.vars['conf']['logger'] = logging.getLogger(f'{self.host_name} - evac.py  ')

    def run_cfast_simulations(self, version='intel', attempt=0):
        self.send_report(e={"status":101})
        compa_no = self.s.query("SELECT COUNT(*) from aamks_geom WHERE type_pri='COMPA'")[0]['COUNT(*)']
        if version == 'intel':
            cfast_file = 'cfast_775-750-i' if compa_no > 100 else 'cfast_775-100-i'
        else:
            cfast_file = 'cfast_775-750' if compa_no > 100 else 'cfast_775-100'
        if self.project_conf['fire_model'] == 'CFAST':
            err = False
            try:
                p = run([f"{os.environ['AAMKS_PATH']}/fire/{cfast_file}", "cfast.in"], timeout=600, capture_output=True,
                        text=True)
            except TimeoutExpired as e:
                self.wlogger.error(e)
                self.send_report(e={"status": 21})
                err = True
            else:
                for line in p.stdout.split('\n'):
                    if line.startswith("***Error") or err:
                        err = True
                        self.wlogger.error(Exception(f'CFAST:{line}'))
                        if 'essure' in p.stdout:
                            self.send_report(e={"status": 22})
                        else:
                            self.send_report(e={"status": 20})

            if not err:
                self.wlogger.info('CFAST simulation calculated with success')
                self.send_report(e={"status": 102})
                return True
            else:
                if attempt == 1:
                    self.wlogger.error('CFAST stuck - unable to calculate with Intel nor GNU compiled sources')
                    self.send_report(e={'status': 21})
                    raise SystemError(21)
                self.wlogger.warning(f'Iteration skipped due to CFAST error, attempt = {attempt + 1}')
                return self.run_cfast_simulations("gnu", attempt + 1)


    def create_geom_database(self):
        self.obstacles = json.loads(self.s.query('SELECT * FROM obstacles')[0]['json'], object_pairs_hook=OrderedDict)
        outside_building_doors = self.s.query('SELECT floor, name, center_x, center_y, width, depth, vent_from_name, vent_to_name, terminal_door, exit_weight from aamks_geom WHERE terminal_door IS NOT NULL')
        floor_teleports = self.s.query("SELECT floor, name, exit_weight, teleport_from, teleport_to, stair_direction from aamks_geom WHERE name LIKE 'k%'")
        rooms_with_exits_weights_set = self.s.query('SELECT floor, name, center_x, center_y, room_exits_weights from aamks_geom WHERE room_exits_weights IS NOT NULL')
        all_rooms = self.s.query("SELECT name, floor, points from aamks_geom WHERE type_pri = 'COMPA'")
        for room in all_rooms:
            points = room['points'].replace('[', '').replace(']', '').split(', ')
            int_points = [int(x) for x in points]
            x_min = min(int_points[0],int_points[2],int_points[4],int_points[6])
            x_max = max(int_points[0],int_points[2],int_points[4],int_points[6])
            y_min = min(int_points[1],int_points[3],int_points[5],int_points[7])
            y_max = max(int_points[1],int_points[3],int_points[5],int_points[7])
            self.rooms[room['name']]={'floor': room['floor'], 'x_min':x_min, 'x_max':x_max, 'y_min':y_min,'y_max':y_max}

        self.vars['conf']['agents_destination'] = []
        for floor in sorted(self.obstacles['obstacles'].keys()):
            self.vars['conf']['agents_destination'].append([])
            self.vars['conf']['agents_destination'][int(floor)]= {}
            self.vars['conf']['agents_destination'][int(floor)]['general_floor_goals'] = []
            self.vars['conf']['agents_destination'][int(floor)]['rooms_goals'] = {}

        for door in outside_building_doors:
            room_before_exit_center = self.s.query('SELECT points from aamks_geom WHERE name=? or name=?', (door['vent_to_name'],door['vent_from_name']))
            center_x, center_y = self.get_center_from_points(room_before_exit_center[0]['points'])
            destination_x, destination_y = self._get_outside_door_destination(center_x, center_y, door)
            if door['exit_weight'] is not None:
                if door['exit_weight'] == '0':
                    weight = float("inf")
                else:
                    weight = self.max_exit_weight/int(door['exit_weight'])
            else:
                weight = 1
            self.vars['conf']['agents_destination'][int(door['floor'])]['general_floor_goals'].append({'name':door['name'], 'floor':door['floor'],'x_outside':destination_x,'y_outside':destination_y, 'x':door['center_x'], 'y':door['center_y'], 'type':'door', 'exit_weight':weight})

        for teleport in floor_teleports:
            teleport_from_coordinates = teleport['teleport_from'].replace('[', '').replace(']','').replace(' ', '').split(',')
            int_teleport_from_coordinates = [int(t) for t in teleport_from_coordinates]
            x = int_teleport_from_coordinates[0]
            y = int_teleport_from_coordinates[1]

            teleport_to_coordinates = teleport['teleport_to'].replace('[', '').replace(']','').replace(' ', '').split(',')
            int_teleport_to_coordinates = [int(t) for t in teleport_to_coordinates]
            direction_x = int_teleport_to_coordinates[0]
            direction_y = int_teleport_to_coordinates[1]

            if teleport['exit_weight'] is not None:
                if teleport['exit_weight'] == '0':
                    weight = float("inf")
                else:
                    weight = self.max_exit_weight/int(teleport['exit_weight'])
            else:
                weight = 1

            self.vars['conf']['agents_destination'][int(teleport['floor'])]['general_floor_goals'].append({'name':teleport['name'], 'floor':teleport['floor'], 'x':x, 'y':y, 'type':'teleport', 'direction_x':direction_x, 'direction_y':direction_y,'exit_weight':weight,'stair_direction':teleport['stair_direction']})
        
        for room in rooms_with_exits_weights_set:
            self.vars['conf']['agents_destination'][int(room['floor'])]['rooms_goals'][room['name']] = []

            exits_weights_dict = dict(eval(room['room_exits_weights']))
            for exit_id in exits_weights_dict.keys():
                if exits_weights_dict[exit_id] == '0':
                    weight = float("inf")
                else:
                    weight = self.max_exit_weight/int(exits_weights_dict[exit_id])
                query = "SELECT floor, name, center_x, center_y, width, depth from aamks_geom WHERE (global_type_id="+exit_id+" and type_tri='DOOR')"
                exit = self.s.query(query)
                destination_x, destination_y = self._get_door_destination(room['center_x'], room['center_y'], exit[0], outside_building_doors)
                self.vars['conf']['agents_destination'][int(exit[0]['floor'])]['rooms_goals'][room['name']].append({'name':exit[0]['name'], 'floor':exit[0]['floor'], 'x_outside':destination_x,'y_outside':destination_y, 'x':exit[0]['center_x'], 'y':exit[0]['center_y'], 'type':'door', 'exit_weight':weight})

        self.wlogger.info('SQLite load successfully')


    def get_center_from_points(self, points):
        points = points.replace('[', '').replace(']', '').split(', ')
        int_points = [int(x) for x in points]
        return((int_points[0]+int_points[2]+int_points[4]+int_points[6])/4, (int_points[1]+int_points[3]+int_points[5]+int_points[7])/4)

    def get_longer_projection_with_average(self, points):
        points = points.replace('[', '').replace(']', '').split(', ')
        int_points = [int(x) for x in points]
        x_coords = int_points[0::2]
        y_coords = int_points[1::2]
        min_x, max_x = min(x_coords), max(x_coords)
        min_y, max_y = min(y_coords), max(y_coords)
        x_length = max_x - min_x
        y_length = max_y - min_y
        avg_x = sum(x_coords) / len(x_coords)
        avg_y = sum(y_coords) / len(y_coords)
        
        if x_length >= y_length:
            return ((min_x, avg_y), (max_x, avg_y))
        else:
            return ((avg_x, min_y), (avg_x, max_y))
    
    
    def _get_outside_door_destination(self, last_room_center_x, last_room_center_y, door):
        goal_from_door_distance = 100
        if door['width'] < door['depth']:
            # exit door is vertical
            if last_room_center_x > door['center_x']:
                #exit door leads to the left on the building plan
                return(door['center_x']-goal_from_door_distance, door['center_y'])
            if last_room_center_x < door['center_x']:
                #exit door leads to the right on the building plan
                return(door['center_x']+goal_from_door_distance, door['center_y'])
        else:
            # exit door is horizontal
            if last_room_center_y > door['center_y']:
                #The exit door leads downwards on the building plan
                return(door['center_x'], door['center_y']-goal_from_door_distance)
            if last_room_center_y < door['center_y']:
                #The exit door leads upwards on the building plan
                return(door['center_x'], door['center_y']+goal_from_door_distance)
            
        raise Exception("something is wrong with aamks.sqlite geometry, unable to set exit target from building "+ str(goal_from_door_distance) +"cm behind exit door")

    def _get_door_destination(self, last_room_center_x, last_room_center_y, door, outside_building_doors):
        goal_from_door_distance=25
        for outside_door in outside_building_doors:
            if outside_door['name'] == door['name']:
                # doors are terminal - leads outside
                goal_from_door_distance=100
                break

        if door['width'] < door['depth']:
            # exit door is vertical
            if last_room_center_x > door['center_x']:
                #exit door leads to the left on the building plan
                return(door['center_x']-goal_from_door_distance, door['center_y'])
            if last_room_center_x < door['center_x']:
                #exit door leads to the right on the building plan
                return(door['center_x']+goal_from_door_distance, door['center_y'])
        else:
            # exit door is horizontal
            if last_room_center_y > door['center_y']:
                #The exit door leads downwards on the building plan
                return(door['center_x'], door['center_y']-goal_from_door_distance)
            if last_room_center_y < door['center_y']:
                #The exit door leads upwards on the building plan
                return(door['center_x'], door['center_y']+goal_from_door_distance)


        raise Exception("something is wrong with aamks.sqlite geometry, unable to set exit target "+ str(goal_from_door_distance) +"cm behind door")

    def _create_evacuees(self, floor: int):
        evacuees_list = []
        self.wlogger.debug('Adding evacuues on floor: {}'.format(floor))

        floor = self.vars['conf']['FLOORS_DATA'][str(floor)]

        leaders_id_list = []
        for i in floor['EVACUEES'].keys():
            evacuees_list.append(Evacuee(origin=tuple(floor['EVACUEES'][i]['ORIGIN']), v_speed=floor['EVACUEES'][i]['V_SPEED'],
                                    h_speed=floor['EVACUEES'][i]['H_SPEED'], pre_evacuation=self.config['DETECTION_TIME'],
                                    detection_constituents= floor['EVACUEES'][i]['PRE_EVACUATION'],
                                    detection_compa= floor['EVACUEES'][i]['COMPA'],
                                    alpha_v=floor['EVACUEES'][i]['ALPHA_V'], beta_v=floor['EVACUEES'][i]['BETA_V'],
                                    node_radius=self.config['NODE_RADIUS'], 
                                    type = floor['EVACUEES'][i]['type'], 
                                    current_floor = floor
                                  ))
            leaders_id_list.append(floor['EVACUEES'][i]['leader_id'])
            self.wlogger.debug('{} evacuee added'.format(i))

        evacuees = Evacuees()
        for e in evacuees_list:
            e.leader = evacuees_list[leaders_id_list.pop(0)]
            evacuees.add_pedestrian(e)

        self.wlogger.info('Num of evacuees placed: {}'.format(len(evacuees_list)))
        return evacuees

    def prepare_staircases(self, floor):
        rows = self.s.query("SELECT x0, y0, width, depth from aamks_geom WHERE type_sec='STAI' AND floor = floor")
        stair_cases = []
        for row in rows:
            x_min = row['x0']
            x_max = row['x0'] + row['width']
            y_min = row['y0']
            y_max = row['y0'] + row['depth']
            staircase = {'x_min':x_min, 'x_max':x_max, 'y_min':y_min, 'y_max':y_max}
            stair_cases.append(staircase)
        self.vars['conf']['staircases'] = stair_cases
        return stair_cases

    def prepare_simulations(self):
        floor_numers = sorted(self.obstacles['obstacles'].keys())
        for floor in floor_numers:
            eenv = None
            obstacles = []
            try:
                self.prepare_staircases(str(floor))
                self.vars['conf']['working_dir'] = self.working_dir
                eenv = EvacEnv(self.vars['conf'], self.sim_id)
                eenv.floor = floor
            except Exception as e:
                self.wlogger.error(e)
                self.send_report(e={"status":31})
                raise SystemError(31)
            else:
                self.wlogger.info('rvo2_dto ready on {} floors'.format(floor))

            # CO-ORDINATES OF OBST MUST BE IN COUNTER-CLOCKWISE DIRECTION FOR THE RVO2 ALGORITHM TO WORK PROPERLY
            for obst in self.obstacles['obstacles'][str(floor)]:
                x_min = min(i[0] for i in obst)
                x_max = max(i[0] for i in obst)
                y_min = min(i[1] for i in obst)
                y_max = max(i[1] for i in obst)
                obstacles.append([(x_min,y_min),(x_max,y_min),(x_max,y_max),(x_min,y_max),(x_min,y_min),(x_max,y_min)])
            if str(floor) in self.obstacles['fire']:
                fire_obst = self.obstacles['fire'][str(floor)]
                x_min = min(i[0] for i in fire_obst)
                x_max = max(i[0] for i in fire_obst)
                y_min = min(i[1] for i in fire_obst)
                y_max = max(i[1] for i in fire_obst)
                obstacles.append([(x_min,y_min),(x_max,y_min),(x_max,y_max),(x_min,y_max),(x_min,y_min),(x_max,y_min)])

            eenv.obstacle = obstacles
            num_of_vertices = eenv.process_obstacle(obstacles)
            eenv.generate_nav_mesh(self.working_dir)
            self.wlogger.debug('Added obstacles on floor: {}, number of vercites: {}'.format(1, num_of_vertices))

            e = self._create_evacuees(floor)
            self.wlogger.info('Evacuees placed on floor: {}'.format(floor))
            eenv.place_evacuees(e)
            eenv.prepare_rooms_list()
            self.wlogger.info('Room list prepared on floor: {}'.format(floor))
            eenv.set_floor_teleport_destination_queue_lists()
            self.floors.append(eenv)


    def connect_rvo2_with_smoke_query(self):

        for floor in self.floors:
            try:
                floor.smoke_query = PartitionQuery(floor=floor.floor, sim_id=self.sim_id)
            except Exception as e:
                self.wlogger.error(e)
                self.send_report(e={"status":32})
                raise SystemError(32)
            else:
                self.wlogger.info('Smoke query connected to floor: {}'.format(floor.floor))

    def process_agents_queuing_when_moving_downstairs_and_upstairs(self):
        if len(self.floors) == 1:
            return

        for i in range(0,len(self.floors)):
            # floor is first floor, only downstair movement is possible to floor
            if i == 0:
                floor = self.floors[i]
                floor_above = self.floors[i+1]
                floor_above.reset_floor_downstair_teleport_queue_list()
                for e in range(floor.evacuees.get_number_of_pedestrians()):
                    position = floor.evacuees.get_position_of_pedestrian(e)
                    x = position[0]
                    y = position[1]
                    for cords, cords_range in floor.free_space_coordinates_of_downstair_teleport_destination.items():
                        if cords_range['min_x'] < x < cords_range['max_x'] and cords_range['min_y'] < y < cords_range['max_y']:
                            floor_above.floor_downstair_teleports_queue[cords] = True;


            # floor is last floor, only upstair movement is possible to floor
            elif i == (len(self.floors)-1):
                floor_below = self.floors[i-1]
                floor = self.floors[i]
                floor_below.reset_floor_upstair_teleport_queue_list()
                for e in range(floor.evacuees.get_number_of_pedestrians()):
                    position = floor.evacuees.get_position_of_pedestrian(e)
                    x = position[0]
                    y = position[1]
                    for cords, cords_range in floor.free_space_coordinates_of_upstair_teleport_destination.items():
                        if cords_range['min_x'] < x < cords_range['max_x'] and cords_range['min_y'] < y < cords_range['max_y']:
                            floor_below.floor_upstair_teleports_queue[cords] = True;

            # floors in between first and last floors, both upstair and downstair 
            # movement is possible to this floors
            # this case happens only when builing has 3 storeys or more
            else:
                floor = self.floors[i]
                floor_below = self.floors[i-1]
                floor_above = self.floors[i+1]
                floor_below.reset_floor_upstair_teleport_queue_list()
                floor_above.reset_floor_downstair_teleport_queue_list()
                for e in range(floor.evacuees.get_number_of_pedestrians()):
                    position = floor.evacuees.get_position_of_pedestrian(e)
                    x = position[0]
                    y = position[1]
                    for cords, cords_range in floor.free_space_coordinates_of_upstair_teleport_destination.items():
                        if cords_range['min_x'] < x < cords_range['max_x'] and cords_range['min_y'] < y < cords_range['max_y']:
                            floor_below.floor_upstair_teleports_queue[cords] = True
                    for cords, cords_range in floor.free_space_coordinates_of_downstair_teleport_destination.items():
                        if cords_range['min_x'] < x < cords_range['max_x'] and cords_range['min_y'] < y < cords_range['max_y']:
                            floor_above.floor_downstair_teleports_queue[cords] = True

    def do_simulation(self):
        self.wlogger.info('Starting simulations')
        cfast_step = self.floors[0].config['SMOKE_QUERY_RESOLUTION']
        aevac_step = self.floors[0].config['TIME_STEP']
        time_frame = 0
        #first_evacuue = []
        # iterate over CFAST time frames (results saving interval)

        while 1:
            time_frame += cfast_step    # increase upper limit of time_frame
            aset = self.vars['conf']['simulation_time']

            if time_frame >= (self.vars['conf']['simulation_time']):
                self.wlogger.info('Simulation ends due to user time limit: {}'.format(self.vars['conf']['simulation_time']))
                self.simulation_time = time_frame
                self.time_shift = 0
                break

            if self.floors[0].smoke_query.cfast_has_time(time_frame) == 1:
                self.wlogger.info('Simulation time: {}'.format(time_frame))
                rsets = []
                for i in self.floors:
                    try:
                        i.read_cfast_record(time_frame)
                        floor_det = i.detection.update()    # floor_det is checked for ALL compartments (all floors)
                    except IndexError:
                        self.wlogger.error(f'Unable to read CFAST results at {time_frame} s')
                        self.send_report(e={"status":23})
                        raise IndexError(f'Unable to read CFAST results at {time_frame} s')
                    #first_evacuue.append(i.evacuees.get_first_evacuees_time())
                if floor_det:
                    self.detection_time = min(self.detection_time, floor_det)

                # iterate with AEvac time step over CFAST time_frame
                for step_no in range(0, int(cfast_step / aevac_step)):
                    time_row = dict()
                    smoke_row = dict()
                    # do single AEvac step on all floors
                    for i in self.floors:
                        if i.do_simulation(step_no) and aset > i.current_time:
                            aset = i.current_time

                    # move agents downstairs and upstairs
                    self.process_agents_queuing_when_moving_downstairs_and_upstairs() 
                    self.process_agents_upstairs_and_downstairs_movement(step_no, time_frame)

                    # prepare visualization on all floors
                    for i in self.floors:       
                        if (step_no % i.config['VISUALIZATION_RESOLUTION']) == 0:
                            time_row.update({str(i.floor): i.get_data_for_visualization()})
                            smoke_row.update({str(i.floor): i.update_room_opacity()})
                    if len(time_row) > 0:
                        self.animation_data.append(time_row)
                        self.smoke_opacity.append(smoke_row)
                        self.change_pynavmesh_due_to_smoke()

                # determine RSET and smoke on all floors
                for i in self.floors:
                    rsets.append(i.rset)
                    self.rooms_in_smoke.update({i.floor: i.rooms_in_smoke})
                progress = round((time_frame)/self.vars["conf"]["simulation_time"] * 100, 1)
                self.wlogger.info(f'Progress: {progress}%')
                progres_status = int(1000+progress)
                self.send_report(e={"status":progres_status})
                # check if all agents egressed and determine RSET for the building
                if prod(array(rsets)) > 0:
                    self.wlogger.info('Simulation ends due to successful evacuation: {}'.format(rsets))
                    self.simulation_time = max(rsets)
                    self.time_shift = 0
                    break
            else:
                self.wlogger.error(f'There was no data found at {time_frame} s in CFAST results.')
                self.send_report(e={"status":33})
                raise IndexError(f'There was no data found at {time_frame} s in CFAST results.')

        # gather results of the whole simulation (multisimulation iteration)
        self.cross_building_results = self.floors[0].smoke_query.get_final_vars()
        self.cross_building_results['dcbe'] = aset
        self.wlogger.info('Final results gathered')
        self.wlogger.debug('Final results gathered: {}'.format(self.cross_building_results))

    def change_pynavmesh_due_to_smoke(self):
        # use floor parameter instead of reading opacity from smoke_opacity
        # avoid recreating pynavmesh if not necessary
        for floor in self.floors:
            try:
                self.previous_critical_rooms[floor.floor]
            except KeyError:
                self.previous_critical_rooms[floor.floor] = []
            if floor.unavailable_rooms != self.previous_critical_rooms[floor.floor]:
                if len(floor.unavailable_rooms) > 0:
                    self.generate_new_pynavmesh(floor, floor.unavailable_rooms)
                    self.previous_critical_rooms[floor.floor] = floor.unavailable_rooms

    def generate_new_pynavmesh(self, floor, floor_critical_rooms):
        figure_points = []
        with open(os.path.join(self.working_dir, f'pynavmesh{floor.floor}.nav_first')) as first_pynavmesh:
            lines = first_pynavmesh.readlines()
        points = lines[0].split()
        x_list = points[::3]
        z_list = points[2::3]
        figures_points = lines[1].split()
        polygons = lines[2].split()

        count = 0
        all_figures = []
        index = -1

        for poly in polygons:
            index +=1
            poly_sides_count = int(poly)
            for i in range (poly_sides_count):
                figure_points.append((float(x_list[int(figures_points[count])]), float(z_list[int(figures_points[count])])))
                count+=1
            x = []
            for co in figure_points:
                x.append([co[0], co[1]])
            all_figures.append((index,x))
            x = []
            figure_points = []

        figures_points_after_removal = []
        polygons_after_removal = []

        for id, coordinates in all_figures:
            skip_outer1 = False
            skip_outer2 = False
            for floor_critical_room in floor_critical_rooms:
                x_min = self.rooms[floor_critical_room]['x_min']/100
                x_max = self.rooms[floor_critical_room]['x_max']/100
                y_min = self.rooms[floor_critical_room]['y_min']/100
                y_max = self.rooms[floor_critical_room]['y_max']/100
                for x, y in coordinates:
                    if x_min < x and x_max > x and y_min < y and y_max > y:
                        figures_points = figures_points[int(polygons[id]):]
                        skip_outer1 = True
                        skip_outer2 = True
                        break
                if skip_outer1:
                    break
            if skip_outer2:
                continue
            polygons_after_removal.append(polygons[id])
            elements_to_move = figures_points[:int(polygons[id])]
            figures_points = figures_points[int(polygons[id]):]
            figures_points_after_removal.extend(elements_to_move)

        new_navmesh_path = os.path.join(self.working_dir, f'pynavmesh{floor.floor}.nav')
        with open(new_navmesh_path, 'w') as file:
            file.write(' '.join(points) + '\n')
            file.write(' '.join(figures_points_after_removal) + '\n')
            file.write(' '.join(polygons_after_removal))
        vert, polygs = read_from_text(new_navmesh_path)
        floor.nav.navmesh = Pynavmesh(vert, polygs)

    def process_agents_upstairs_and_downstairs_movement(self, step, time):
        agents_to_move = self.get_agents_to_move()
        self.move_agents(agents_to_move, step, time)

    def get_one_agent_per_tp(self, agents_to_move_sorted_by_distance_from_tp, floor):
        agents_to_move_one_per_tp = []
        teleports_taken = []
        for a in agents_to_move_sorted_by_distance_from_tp:
            if a['teleport_position'] not in teleports_taken:
                agents_to_move_one_per_tp.append(a)
                teleports_taken.append(a['teleport_position'])
            else:
                agent = floor.evacuees.get_pedestrian(a['agent_number'])
                agent.finished = 1
        return agents_to_move_one_per_tp

    def get_agents_to_move(self):
        if len(self.floors) == 1:
            return []
        agents_to_move = []
        for i in range(0,len(self.floors)):
            # floor is first floor, only upstair movement is possible from floor
            if i == 0:
                floor = self.floors[i]
                agents_to_move_upstairs_sorted_by_distance_from_tp = sorted(floor.agents_to_move_downstairs_or_upstairs, key=lambda d: d['distance_from_teleport'])
                agents_to_move_upstairs_one_per_teleport = self.get_one_agent_per_tp(agents_to_move_upstairs_sorted_by_distance_from_tp, floor)
                for j in agents_to_move_upstairs_one_per_teleport:
                    agent = floor.evacuees.get_pedestrian(j['agent_number'])
                    if (j['teleport_position'] in floor.floor_upstair_teleports_queue and 
                        floor.floor_upstair_teleports_queue[j['teleport_position']] == False):
                        agent.set_position_to_pedestrian(j['teleport_position'])
                        destination_floor = i+1
                        agents_to_move.append(tuple([i, destination_floor, agent, j['agent_number']]))
                    else:
                        agent.finished = 1
            # floor is last floor, only downstair movement is possible from floor
            elif i == (len(self.floors)-1):
                floor = self.floors[i]
                agents_to_move_downstairs_sorted_by_distance_from_tp = sorted(floor.agents_to_move_downstairs_or_upstairs, key=lambda d: d['distance_from_teleport'])
                agents_to_move_downstairs_one_per_teleport = self.get_one_agent_per_tp(agents_to_move_downstairs_sorted_by_distance_from_tp, floor)
                for j in agents_to_move_downstairs_one_per_teleport:
                    agent = floor.evacuees.get_pedestrian(j['agent_number'])
                    if (j['teleport_position'] in floor.floor_downstair_teleports_queue and 
                        floor.floor_downstair_teleports_queue[j['teleport_position']] == False):
                        agent.set_position_to_pedestrian(j['teleport_position'])
                        destination_floor = i-1
                        agents_to_move.append(tuple([i, destination_floor, agent, j['agent_number']]))
                    else:
                        agent.finished = 1
            # floors in between first and last floors, both upstair and downstair 
            # movements are possible from these floors
            # this case happens only when builing has 3 storeys or more
            else:
                floor = self.floors[i]
                agents_to_move_sorted_by_distance_from_tp = sorted(floor.agents_to_move_downstairs_or_upstairs, key=lambda d: d['distance_from_teleport'])
                agents_to_move_one_per_teleport = self.get_one_agent_per_tp(agents_to_move_sorted_by_distance_from_tp, floor)
                for j in agents_to_move_one_per_teleport:
                    agent = floor.evacuees.get_pedestrian(j['agent_number'])
                    # downstair movement from floor
                    if (j['teleport_position'] in floor.floor_downstair_teleports_queue and 
                        floor.floor_downstair_teleports_queue[j['teleport_position']] == False): 
                        agent.set_position_to_pedestrian(j['teleport_position'])
                        destination_floor = i-1
                        agents_to_move.append(tuple([i, destination_floor, agent, j['agent_number']]))
                    # upstair movement from floor
                    elif (j['teleport_position'] in floor.floor_upstair_teleports_queue and 
                        floor.floor_upstair_teleports_queue[j['teleport_position']] == False):   
                        agent.set_position_to_pedestrian(j['teleport_position'])
                        destination_floor = i+1
                        agents_to_move.append(tuple([i, destination_floor, agent, j['agent_number']]))
                    else:
                        agent.finished = 1

        return agents_to_move


    def move_agents(self, agents_to_move, step, time):
        if len(agents_to_move) == 0:
            for floor_num in range(len(self.floors)):
                self.floors[floor_num].agents_to_move_downstairs_or_upstairs = []
            return
            
        for floor_num in range(len(self.floors)):
            agents_who_leave_current_floor_indexes = [agent[3] for agent in agents_to_move if agent[0] == floor_num]
            if agents_who_leave_current_floor_indexes:
                self.floors[floor_num].rset = time
                self.floors[floor_num].delete_agents_from_floor(agents_who_leave_current_floor_indexes)

        for floor_num in range(len(self.floors)):
            agents_who_come_to_current_floor = [agent[2] for agent in agents_to_move if agent[1] == floor_num]
            self.floors[floor_num].agents_to_move_downstairs_or_upstairs = []
            self.floors[floor_num].append_evacuees(agents_who_come_to_current_floor)

        for agent_to_move in agents_to_move:
            agent = agent_to_move[2]
            agent.finished = 1
            agent.target_teleport_coordinates = None
            agent.current_floor = agent_to_move[1]


    def send_report(self, e=False): # {{{
        '''
        Runs on a worker. Write /home/aamks/project/sim_id.json on each aRun
        completion. Then inform gearman server to scp to itself
        /home/aamks/project/sim_id.json via aOut service. Gearman server will
        process this json via $AAMKS_PATH/manager/results_collector.py.
        Gearman server will psql insert and will scp the worker's animation to
        itself.
        '''
        if not e:
            self._animation_save()
            LocalResultsCollector(self._get_meta(e)).psql_report()
        else:
            LocalResultsCollector(self._get_meta(e)).psql_error()
        
    def _get_meta(self, e=False):
        report = OrderedDict()
        report['worker'] = self.host_name
        report['path_to_project'] = self.project_dir
        if e and 1 < e['status'] < 20:
            report['early_error'] = self.working_dir
        else:
            report['sim_id'] = self.sim_id
            report['scenario_id'] = self.vars['conf']['scenario_id']
            report['project_id'] = self.vars['conf']['project_id']
            report['fire_origin'] = self.vars['conf']['FIRE_ORIGIN']
            report['highlight_geom'] = None
        report['psql'] = dict()
        if e:
            report['psql'] = e
        else:
            report['psql']['fed'] = dict()
            report['psql']['fed_symbolic'] = dict()
            report['psql']['rset'] = dict()
            report['psql']['dfed'] = dict()
            report['psql']['runtime'] = int(time.time() - self.start_time)
            report['psql']['cross_building_results'] = self.cross_building_results
            for i in self.floors:
                report['psql']['fed'] = self._collect_evac_data('fed')
                report['psql']['fed_symbolic'] = self._collect_evac_data('symbolic_fed')
                report['psql']['rset'][i.floor] = int(i.rset)
                report['psql']['dfed'][i.floor] = self.floors[int(i.floor)].dfed.export()
            for num_floor in range(len(self.floors)):
                report['animation'] = "{}_{}_{}_anim.zip".format(self.vars['conf']['project_id'], self.vars['conf']['scenario_id'], self.sim_id)
                report['floor'] = num_floor
            report['psql']['i_risk'] = RI(report['psql']['fed'], calculate=True).export()

            report['psql']['detection'] = int(self.detection_time)
            report['psql']['status'] = 0
            
        self.exit_code = report['psql']['status']
        self.wlogger.info('Metadata prepared successfully')

        return report

    # }}}
    def _write_animation_zips(self):# {{{
        '''
        Raw data comes as an argument. We create /home/aamks/1.anim.zip
        with anim.json inside.
        '''

        '''Selecting only the rooms that had smoke during simulations'''
        smoke_data = []
        for row in self.smoke_opacity:
            floors = dict()
            for key in row.keys():
                room_on_floor = dict()
                for room in self.rooms_in_smoke[key]:
                    room_on_floor.update({room: row[key][room]})
                floors.update({key: room_on_floor})
            smoke_data.append(floors)
        self.wlogger.info('Smoke data created')

        json_content = {
                        'simulation_id': self.sim_id,
                        'simulation_time': self.simulation_time,
                        'time_shift': self.time_shift,
                        'animations': {
                            'evacuees': self.animation_data,
                            'rooms_opacity': smoke_data,
                            'doors': None
                        }
                        }
        zf = zipfile.ZipFile("{}_{}_{}_anim.zip".format(self.vars['conf']['project_id'], self.vars['conf']['scenario_id'], self.sim_id), mode='w', compression=zipfile.ZIP_DEFLATED)
        try:
            zf.writestr("anim.json", json.dumps(json_content))
            self.wlogger.info('Date for animation saved')
        finally:
            zf.close()

    def _animation_save(self):# {{{
        params=OrderedDict()
        p = Psql()
        self.is_anim = p.query(f"""SELECT is_anim FROM simulations WHERE project={self.vars['conf']['project_id']} AND scenario_id=
                          {self.vars['conf']['scenario_id']} AND iteration={self.sim_id}""")[0][0]
        if self.is_anim:
            params['sort_id']=self.sim_id
            params['title']="sim.{}".format(self.sim_id)
            params['time']=time.strftime("%H:%M %d.%m", time.gmtime())
            params['srv']=0
            params['fire_origin'] = self.s.query("select floor, x, y from fire_origin where sim_id=?", (self.sim_id,))[0]
            params['highlight_geom']=None
            params['anim']="{}/{}_{}_{}_anim.zip".format(self.sim_id, self.vars['conf']['project_id'], self.vars['conf']['scenario_id'], self.sim_id)
            p.query(f"""UPDATE simulations SET animation = '{json.dumps(params)}'
                    WHERE project={self.vars['conf']['project_id']} AND scenario_id={self.vars['conf']['scenario_id']} AND iteration={self.sim_id}""")
            self.wlogger.info("Animation saved to psql")

            self._write_animation_zips()

        else:
            self.wlogger.info("Iteration without animation")
    # }}}

    # gather data across all floors
    def _collect_evac_data(self, parameter):
        collected = []
        for evacenv in self.floors:
            collected.extend([ped.__dict__[parameter] for ped in evacenv.evacuees.pedestrians])

        return collected

    def _collect_fed_data(self):
        collected_fed = []
        for evacenv in self.floors:
            collected_fed.extend([ped.fed for ped in evacenv.evacuees.pedestrians])

        return collected_fed

    def cleanup(self):
        if not self.is_anim:
            os.remove("finals.sqlite")
            os.remove("cfast_devices.csv")
            os.remove("cfast_vents.csv")
            os.remove("cfast_walls.csv")
            os.remove("cfast_masses.csv")
            os.remove("cfast_zone.csv")
            os.remove("cfast.log")
            os.remove("cfast.smv")
            os.remove("cfast.out")
            os.remove("cfast.plt")
            os.remove("cfast.status")
            os.remove("cfast_evac_socket_port.txt")
            # os.remove("doors_opening_level_frame.txt") #fortran issue
            # os.remove("times.txt")
            shutil.rmtree("door_opening_changes")
            for floor in self.floors:
                try:
                    os.remove(f'pynavmesh{floor.floor}.nav')
                except FileNotFoundError:
                    continue

    def main(self):
        self.get_config()
        self.send_report(e={"status":100})
        self.create_geom_database()
        if self.run_cfast_simulations():
            self.prepare_simulations()
            self.connect_rvo2_with_smoke_query()
            self.do_simulation()
            self.send_report()
            self.cleanup()
            self.wlogger.info(f'Simulation ended with status {self.exit_code}')
        return self.exit_code

    def test(self):
        self.get_config()
        self.create_geom_database()
        self.prepare_simulations()
        self.connect_rvo2_with_smoke_query()
        self.do_simulation()
        self.send_report()

    def run_worker(self):
        if SIMULATION_TYPE == 'NO_CFAST':
            print('Working in NO_CFAST mode')
            self.test()
        else:
            exc = self.main()
            return exc

class LocalResultsCollector:
    def __init__(self, report: OrderedDict):
        self.meta = report
        self.p = Psql()

    def psql_report(self):
        fed = json.dumps(self.meta['psql']['fed'])
        fed_symbolic = json.dumps(self.meta['psql']['fed_symbolic'])
        rset = json.dumps(self.meta['psql']['rset'])
        dfeds = [pd.read_json(StringIO(i)) for i in self.meta['psql']['dfed'].values()]

        # fed_growth_cells table
        def check_for_data(x, floor):
            return  bool(self.p.query(f"""SELECT * FROM fed_growth_cells_data
                    WHERE x_min={x['xmin']} AND x_max={x['xmax']} AND y_min={x['ymin']} AND y_max={x['ymax']}
                    AND scenario_id={self.meta['scenario_id']} AND project={self.meta['project_id']} AND floor={floor}"""))

        def update_fed_growth(x, floor):
            if check_for_data(x, floor):
                query = f"""UPDATE fed_growth_cells_data SET fed_growth_sum = fed_growth_sum + {x['total_dfed']},
                        samples_number = samples_number + 1
                        WHERE x_min={x['xmin']} AND x_max={x['xmax']} AND y_min={x['ymin']} AND y_max={x['ymax']}
                        AND scenario_id={self.meta['scenario_id']} AND project={self.meta['project_id']} AND floor={floor}"""
            else:
                query = f"""INSERT INTO fed_growth_cells_data(scenario_id, project, floor, x_min, x_max, y_min, y_max, fed_growth_sum, samples_number)
                        VALUES ({self.meta['scenario_id']}, {self.meta['project_id']}, {floor}, {x['xmin']}, {x['xmax']}, 
                        {x['ymin']}, {x['ymax']}, {x['total_dfed']}, 1)"""
            self.p.query(query)

        [dfed.apply(update_fed_growth, axis=1, floor=f) for f, dfed in enumerate(dfeds)]

        # simulations table
        self.p.query(f"""UPDATE simulations SET fed = '{fed}', fed_symbolic = '{fed_symbolic}', wcbe='{rset}', detection = '{self.meta['psql']['detection']}', 
                run_time = {self.meta['psql']['runtime']}, dcbe_time = {self.meta['psql']['cross_building_results']['dcbe']},
                min_vis_compa = {self.meta['psql']['cross_building_results']['min_vis_compa']},
                max_temp = {self.meta['psql']['cross_building_results']['max_temp_compa']}, host = '{self.meta['worker']}',
                min_hgt_compa = {self.meta['psql']['cross_building_results']['min_hgt_compa']},
                min_vis_cor = {self.meta['psql']['cross_building_results']['min_vis_cor']},
                min_hgt_cor = {self.meta['psql']['cross_building_results']['min_hgt_cor']},
                tot_heat = {self.meta['psql']['cross_building_results']['tot_heat']},
                status = '{self.meta['psql']['status']}',
                results = '{self.meta['psql']['i_risk']}'
                WHERE project={self.meta['project_id']} AND scenario_id={self.meta['scenario_id']} AND iteration={self.meta['sim_id']}""")

    def psql_error(self):
        if 'early_error' in self.meta.keys():
            url_s = self.meta['early_error'].split('/')
            self.meta['sim_id'] = url_s[-1]
            self.meta['project_id'] = self.p.query(f"SELECT id FROM projects WHERE project_name='{url_s[-4]}'")[0][0]
            self.meta['scenario_id'] = self.p.query(f"SELECT id FROM scenarios WHERE project_id={self.meta['project_id']} AND scenario_name='{url_s[-3]}'")[0][0]
        self.p.query(f"""UPDATE simulations SET status = '{self.meta['psql']['status']}', host = '{self.meta['worker']}'
                WHERE project={self.meta['project_id']} AND scenario_id={self.meta['scenario_id']} AND iteration={self.meta['sim_id']}""")


if __name__ == "__main__":
    w = Worker()
    # try:
    w.run_worker()
    # except Exception as error:
    #     w.wlogger.error(error)
    #     w.send_report(e={'status': 1})
