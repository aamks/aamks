#!/usr/bin/python3

import os
import shutil
import subprocess
import sys
sys.path.insert(1, '/usr/local/aamks')
from numpy import array
from numpy import prod
from numpy import insert
from numpy import cumsum
import pathfinder.pyrvo as rvo

from results.beck_new import RiskIteration as RI
from evac.evacuee import Evacuee
from evac.evacuees import Evacuees
from evac.rvo2_dto import EvacEnv
from fire.partition_query import PartitionQuery
from include import Sqlite
import time
import logging
from logging.handlers import TimedRotatingFileHandler
from urllib.request import urlopen, urlretrieve
import ssl
from include import Json
import json
from collections import OrderedDict
from subprocess import run, TimeoutExpired
import zipfile
import pandas as pd
from include import Psql

SIMULATION_TYPE = 1
if 'AAMKS_SKIP_CFAST' in os.environ:
    if os.environ['AAMKS_SKIP_CFAST'] == '1':
        SIMULATION_TYPE = 'NO_CFAST'

class Worker:

    def __init__(self):
        self.json=Json()
        self.AAMKS_SERVER=self.json.read("/etc/aamksconf.json")['AAMKS_SERVER']
        self.working_dir=sys.argv[1] if len(sys.argv)>1 else "{}/workers/1/".format(os.environ['AAMKS_PROJECT'])
        self.project_dir=self.working_dir.split("/workers/")[0]
        os.environ["AAMKS_PROJECT"] = self.project_dir
        os.chdir(self.working_dir)
        self.vars = OrderedDict()
        self.results = dict()
        self.obstacles = None
        self.trajectory = None
        self.velocity = None
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
        self.start_time = time.time()


    def get_logger(self, logger_name):
        FORMATTER = logging.Formatter('%(asctime)s - %(name)-14s - %(levelname)s - %(message)s')
        LOG_FILE = f"{self.project_dir}/aamks.log"
        file_handler = TimedRotatingFileHandler(LOG_FILE, when='midnight')
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
        try:
            f = open('{}/{}/config.json'.format(os.environ['AAMKS_PATH'], 'evac'), 'r')
            self.config = json.load(f)
        except Exception as e:
            print(e)
            self.send_report(e={"status":16})
            sys.exit(1)

        try:
            f = open('evac.json', 'r')
            self.vars['conf'] = json.load(f)
        except Exception as e:
            print('Cannot load evac.json from directory: {}'.format(str(e)))
            self.send_report(e={"status":17})
            sys.exit(1)

        self.project_conf=self.json.read("../../conf.json")

        self.sim_id = self.vars['conf']['SIM_ID']
        self.host_name = os.uname()[1]
        #print('Starting simulations id: {}'.format(self.sim_id))
        self.wlogger=self.get_logger('worker.py')
        self.vars['conf']['logger'] = self.get_logger('evac.py')

    def run_cfast_simulations(self):
        cfast_file = 'cfast7_linux_64'
        compa_no = self.s.query("SELECT COUNT(*) from aamks_geom WHERE type_pri='COMPA'")[0]['COUNT(*)']
        cfast_file = 'cfast_775-1000-i' if compa_no > 100 else 'cfast_775-100-i'
            
        if self.project_conf['fire_model'] == 'CFAST':
            err = False
            try:
                p = run([f"/usr/local/aamks/fire/{cfast_file}","cfast.in"], timeout=600, capture_output=True, text=True)
            except TimeoutExpired as e:
                self.wlogger.error(e)
                self.send_report(e={"status":21})
                err = True
            else:
                for line in p.stdout.split('\n'):
                    if line.startswith("***Error") or err:
                        err = True
                        self.wlogger.error(Exception(f'CFAST:{line}'))
                        if 'essure' in p.stdout:
                            self.send_report(e={"status":22})
                        else:
                            self.send_report(e={"status":20})

            inf = 'Iteration skipped due to CFAST error' if err else 'CFAST simulation calculated with success' 
            self.wlogger.info(inf)
            return not err

    def create_geom_database(self):

        self.s = Sqlite("{}/aamks.sqlite".format(self.project_dir))
        outside_building_doors = self.s.query('SELECT floor, name, center_x, center_y, terminal_door from aamks_geom WHERE terminal_door IS NOT NULL')
        floor_teleports = self.s.query("SELECT floor, name, teleport_from, teleport_to from aamks_geom WHERE name LIKE 'k%'")

        self.vars['conf']['agents_destination'] = []

        for door in outside_building_doors:
            self.vars['conf']['agents_destination'].append({'name':door['name'], 'floor':door['floor'], 'center_x':door['center_x'], 'center_y':door['center_y'], 'type':'door'})

        for teleport in floor_teleports:
            teleport_from_coordinates = teleport['teleport_from'].replace('[', '').replace(']','').replace(' ', '').split(',')
            int_teleport_from_coordinates = [int(t) for t in teleport_from_coordinates]
            center_x = int_teleport_from_coordinates[0]
            center_y = int_teleport_from_coordinates[1]

            teleport_to_coordinates = teleport['teleport_to'].replace('[', '').replace(']','').replace(' ', '').split(',')
            int_teleport_to_coordinates = [int(t) for t in teleport_to_coordinates]
            direction_x = int_teleport_to_coordinates[0]
            direction_y = int_teleport_to_coordinates[1]

            self.vars['conf']['agents_destination'].append({'name':teleport['name'], 'floor':teleport['floor'], 'center_x':center_x, 'center_y':center_y, 'type':'teleport', 'direction_x':direction_x, 'direction_y':direction_y})


        self.obstacles = json.loads(self.s.query('SELECT * FROM obstacles')[0]['json'], object_pairs_hook=OrderedDict)
        self.wlogger.info('SQLite load successfully')

    def _get_detection_time(self):
        heat = any(self.project_conf['smoke_detectors'].values())
        smoke = any(self.project_conf['heat_detectors'].values())
        sprink = any(self.project_conf['sprinklers'].values())
        if any([heat, smoke, sprink]):
            df = pd.read_csv('cfast_devices.csv')[3:].astype(float)
            if (df.filter(like='SENSACT').iloc[-1] == 1).any():
                det = df['Time'][df[(df.filter(like='SENSACT') == 1) == True].idxmax().min()]
            del df
        try:
            return det
        except NameError:
            return 60*30
            return round(normal(loc=self.project_conf['detection']['mean'], scale=self.project_conf['detection']['sd']), 2)

    def _create_evacuees(self, floor):

        evacuees = []
        self.wlogger.debug('Adding evacuues on floor: {}'.format(floor))

        floor = self.vars['conf']['FLOORS_DATA'][str(floor)]
        def pre_evac_total(i):
            if floor['EVACUEES'][i]['COMPA'] == self.vars['conf']['FIRE_ORIGIN']:
                
                return floor['EVACUEES'][i]['PRE_EVACUATION']
            else:
                return self.detection_time+floor['EVACUEES'][i]['PRE_EVACUATION']

        for i in floor['EVACUEES'].keys():
            evacuees.append(Evacuee(origin=tuple(floor['EVACUEES'][i]['ORIGIN']), v_speed=floor['EVACUEES'][i]['V_SPEED'],
                                    h_speed=floor['EVACUEES'][i]['H_SPEED'], pre_evacuation=pre_evac_total(i),
                                    alpha_v=floor['EVACUEES'][i]['ALPHA_V'], beta_v=floor['EVACUEES'][i]['BETA_V'],
                                    node_radius=self.config['NODE_RADIUS']))
            self.wlogger.debug('{} evacuee added'.format(i))

        e = Evacuees()
        [e.add_pedestrian(i) for i in evacuees]

        self.wlogger.info('Num of evacuees placed: {}'.format(len(evacuees)))
        return e

    def prepare_simulations(self):
        self.detection_time = self._get_detection_time() #rough - with CFAST SPREADSHEET resolution

        for floor in sorted(self.obstacles['obstacles'].keys()):
            eenv = None
            obstacles = []
            try:
                self.vars['conf']['project_dir'] = self.project_dir
                eenv = EvacEnv(self.vars['conf'])
                eenv.floor = floor
            except Exception as e:
                self.wlogger.error(e)
                self.send_report(e={"status":31})
            else:
                self.wlogger.info('rvo2_dto ready on {} floors'.format(floor))

            for obst in self.obstacles['obstacles'][str(floor)]:
                coords = list()
                for coord in obst:
                    coords.append(tuple(coord))
                if len(obst) > 1:
                    coords.append(tuple(obst[1]))
                obstacles.append(coords)
            if str(floor) in self.obstacles['fire']:
                obstacles.append([tuple(x) for x in array(self.obstacles['fire'][str(floor)])[[0, 1, 2, 3, 4, 1]]])

            eenv.obstacle = obstacles
            num_of_vertices = eenv.process_obstacle(obstacles)
            eenv.generate_nav_mesh()
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
                floor.smoke_query = PartitionQuery(floor=floor.floor)
            except Exception as e:
                self.wlogger.error(e)
                self.send_report(e={"status":32})
                exit(1)
            else:
                self.wlogger.info('Smoke query connected to floor: {}'.format(floor.floor))

    def process_agents_queuing_when_moving_downstairs(self):
        for i in range(0,len(self.floors)-1):
            floor = self.floors[i]
            floor_above = self.floors[i+1]
            floor_above.reset_floor_teleport_queue_list()
            for e in range(floor.evacuees.get_number_of_pedestrians()):
                position = floor.evacuees.get_position_of_pedestrian(e)
                x = position[0]
                y = position[1]
                for cords, cords_range in floor.free_space_coordinates_of_telepors_destination.items():
                    if cords_range['min_x'] < x < cords_range['max_x'] and cords_range['min_y'] < y < cords_range['max_y']:
                        floor_above.floor_teleports_queue[cords] = True;


    def do_simulation(self):
        self.wlogger.info('Starting simulations')
        cfast_step = self.floors[0].config['SMOKE_QUERY_RESOLUTION']
        aevac_step = self.floors[0].config['TIME_STEP']
        time_frame = 0
        #first_evacuue = []
        # iterate over CFAST time frames (results saving interval)
        while 1:
            time_frame += cfast_step    # increase upper limit of time_frame
            # check for user time limit
            if time_frame > (self.vars['conf']['simulation_time']):
                self.wlogger.info('Simulation ends due to user time limit: {}'.format(self.vars['conf']['simulation_time']))
                break

            #self.floors[0].smoke_query.cfast_has_time(time_frame)
            # read CFAST results at given time_frame if they exist
            if self.floors[0].smoke_query.cfast_has_time(time_frame) == 1:

                self.wlogger.info('Simulation time: {}'.format(time_frame))
                rsets = []
                aset = self.vars['conf']['simulation_time']
                for i in self.floors:
                    try:
                        i.read_cfast_record(time_frame)
                    except IndexError:
                        self.wlogger.error(f'Unable to read CFAST results at {time_frame} s')
                        self.send_report(e={"status":23})
                        break
                    #first_evacuue.append(i.evacuees.get_first_evacuees_time())

                # iterate with AEvac time step over CFAST time_frame
                for step_no in range(0, int(cfast_step / aevac_step)):
                    time_row = dict()
                    smoke_row = dict()
                    # do single AEvac step on all floors
                    for i in self.floors:
                        if i.do_simulation(step_no) and aset > i.current_time:
                            aset = i.current_time

                    # move agents downstairs
                    self.process_agents_queuing_when_moving_downstairs() 
                    self.process_agents_downstairs_movement(step_no, time_frame)

                    # prepare visualization on all floors
                    for i in self.floors:       
                        if (step_no % i.config['VISUALIZATION_RESOLUTION']) == 0:
                            time_row.update({str(i.floor): i.get_data_for_visualization()})
                            smoke_row.update({str(i.floor): i.update_room_opacity()})
                    if len(time_row) > 0:
                        self.animation_data.append(time_row)
                        self.smoke_opacity.append(smoke_row)

                # determine RSET and smoke on all floors
                for i in self.floors:
                    rsets.append(i.rset)
                    self.rooms_in_smoke.update({i.floor: i.rooms_in_smoke})
                self.wlogger.info(f'Progress: {round(time_frame/self.vars["conf"]["simulation_time"] * 100, 1)}%')

                # check if all agents egressed and determine RSET for the building
                if prod(array(rsets)) > 0:
                    self.wlogger.info('Simulation ends due to successful evacuation: {}'.format(rsets))
                    self.simulation_time = max(rsets)
                    self.time_shift = 0
                    break
            else:
                self.wlogger.error(f'There was no data found at {time_frame} s in CFAST results.')
                self.send_report(e={"status":33})
                break

        # gather results of the whole simulation (multisimulation iteration)
        self.cross_building_results = self.floors[0].smoke_query.get_final_vars()
        self.cross_building_results['dcbe'] = aset
        self.wlogger.info('Final results gathered')
        self.wlogger.debug('Final results gathered: {}'.format(self.cross_building_results))

    def process_agents_downstairs_movement(self, step, time):
        agents_to_move = self.get_agents_to_move_downstairs()
        self.move_agents_downstairs(agents_to_move, step, time)
    
    def get_one_agent_per_tp(self, agents_to_move_downstairs_sorted_by_distance_from_tp, floor):
        agents_to_move_downstairs_one_per_tp = []
        teleports_taken = []
        for a in agents_to_move_downstairs_sorted_by_distance_from_tp:
            if a['teleport_position'] not in teleports_taken:
                agents_to_move_downstairs_one_per_tp.append(a)
                teleports_taken.append(a['teleport_position'])
            else:
                agent = floor.evacuees.get_pedestrian(a['agent_number'])
                agent.finished = 1
        return agents_to_move_downstairs_one_per_tp

    def get_agents_to_move_downstairs(self):
        agents_to_move = []
        for num_floor in range(1, len(self.floors)):
            floor = self.floors[num_floor]
            agents_to_move_downstairs_sorted_by_distance_from_tp = sorted(floor.agents_to_move_downstairs, key=lambda d: d['distance_from_teleport']) 
            agents_to_move_downstair_one_per_teleport = self.get_one_agent_per_tp(agents_to_move_downstairs_sorted_by_distance_from_tp, floor)
            for i in agents_to_move_downstair_one_per_teleport:
                agent = floor.evacuees.get_pedestrian(i['agent_number'])
                if floor.floor_teleports_queue[i['teleport_position']] == False:
                    agent.set_position_to_pedestrian(i['teleport_position'])
                    agents_to_move.append(tuple([num_floor, agent, i['agent_number']]))
                else:
                    agent.finished = 1
        return agents_to_move

    def move_agents_downstairs(self, agents_to_move, step, time):
        if len(agents_to_move) == 0:
            for num_floor in range(len(self.floors)-1):
                self.floors[num_floor+1].agents_to_move_downstairs = []
            return
        for num_floor in range(len(self.floors)-1):
            current_floor_new_agents = [agent[1] for agent in agents_to_move if agent[0] == num_floor+1]
            current_floor_new_agents_indexes = [agent[2] for agent in agents_to_move if agent[0] == num_floor+1]
            for agent in current_floor_new_agents:
                agent.finished = 1
                agent.target_teleport_coordinates = None
            self.floors[num_floor+1].delete_agents_from_floor(current_floor_new_agents_indexes)
            self.floors[num_floor+1].agents_to_move_downstairs = []
            self.floors[num_floor].append_evacuees(current_floor_new_agents)

    def send_report(self, e=False): # {{{
        '''
        Runs on a worker. Write /home/aamks/project/sim_id.json on each aRun
        completion. Then inform gearman server to scp to itself
        /home/aamks/project/sim_id.json via aOut service. Gearman server will
        process this json via /usr/local/aamks/manager/results_collector.py.
        Gearman server will psql insert and will scp the worker's animation to
        itself.
        '''
        if not e:
            self._write_animation_zips()
            self._animation_save_psql()
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
                            'rooms_opacity': smoke_data
                        }
                        }
        zf = zipfile.ZipFile("{}_{}_{}_anim.zip".format(self.vars['conf']['project_id'], self.vars['conf']['scenario_id'], self.sim_id), mode='w', compression=zipfile.ZIP_DEFLATED)
        try:
            zf.writestr("anim.json", json.dumps(json_content))
            self.wlogger.info('Date for animation saved')
        finally:
            zf.close()

    def _animation_save_psql(self):# {{{
        params=OrderedDict()
        params['sort_id']=self.sim_id
        params['title']="sim.{}".format(self.sim_id)
        params['time']=time.strftime("%H:%M %d.%m", time.gmtime())
        params['srv']=0
        params['fire_origin'] = self.s.query("select floor, x, y from fire_origin where sim_id=?", (self.sim_id,))[0]
        params['highlight_geom']=None
        params['anim']="{}/{}_{}_{}_anim.zip".format(self.sim_id, self.vars['conf']['project_id'], self.vars['conf']['scenario_id'], self.sim_id)
        p = Psql()
        p.query(f"""UPDATE simulations SET animation = '{json.dumps(params)}'
                WHERE project={self.vars['conf']['project_id']} AND scenario_id={self.vars['conf']['scenario_id']} AND iteration={self.sim_id}""")

        self.wlogger.info("Animation saved to psql")
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



    def main(self):
        self.get_config()
        self.create_geom_database()
        if self.run_cfast_simulations():
            self.prepare_simulations()
            self.connect_rvo2_with_smoke_query()
            self.do_simulation()
            self.send_report()
            self.wlogger.info('Simulation ended successfully')

    def test(self):
        self.get_config()
        self.create_geom_database()
        self.prepare_simulations()
        self.connect_rvo2_with_smoke_query()
        self.do_simulation()
        self.send_report()

class LocalResultsCollector:
    def __init__(self, report: OrderedDict):
        self.meta = report
        self.p = Psql()

    def psql_report(self):
        fed = json.dumps(self.meta['psql']['fed'])
        fed_symbolic = json.dumps(self.meta['psql']['fed_symbolic'])
        rset = json.dumps(self.meta['psql']['rset'])
        dfeds = [pd.read_json(i) for i in self.meta['psql']['dfed'].values()]

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
        #SendMessage("Database updated")

    def psql_error(self):
        if 'early_error' in self.meta.keys():
            url_s = self.meta['early_error'].split('/')
            self.meta['sim_id'] = url_s[-1]
            self.meta['project_id'] = self.p.query(f"SELECT id FROM projects WHERE project_name='{url_s[-4]}'")[0][0]
            self.meta['scenario_id'] = self.p.query(f"SELECT id FROM scenarios WHERE project_id={self.meta['project_id']} AND scenario_name='{url_s[-3]}'")[0][0]
        self.p.query(f"""UPDATE simulations SET status = '{self.meta['psql']['status']}', host = '{self.meta['worker']}'
                WHERE project={self.meta['project_id']} AND scenario_id={self.meta['scenario_id']} AND iteration={self.meta['sim_id']}""")
        #SendMessage("Database updated with error status")


w = Worker()
try:
    if SIMULATION_TYPE == 'NO_CFAST':
        print('Working in NO_CFAST mode')
        w.test()
    else:
        w.main()
except:
    # send report but with error code
    w.send_report(e={'status': 1})
