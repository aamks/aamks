#!/usr/bin/python3

import os
import shutil
import sys
from numpy import array
from numpy import prod


from evac.evacuee import Evacuee
from evac.evacuees import Evacuees
from evac.rvo2_dto import EvacEnv
from evac.staircase import Staircase
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
from subprocess import Popen
import zipfile

#SIMULATION_TYPE = 'NO_CFAST'
SIMULATION_TYPE = 1

class Worker:

    def __init__(self):
        self.json=Json()
        self.AAMKS_SERVER=self.json.read("/etc/aamksconf.json")['AAMKS_SERVER']
        self.start_time = time.time()
        self.url=sys.argv[1] if len(sys.argv)>1 else "{}/workers/1/".format(os.environ['AAMKS_PROJECT'])
        self.vars = OrderedDict()
        self.results = dict()
        self.obstacles = None
        self.trajectory = None
        self.velocity = None
        self.floor_dims = None
        self.evacuees = None
        self.fire_dto = None
        self.sim_floors = None
        self.start_time = time.time()
        self.floors = list()
        self.host_name = os.uname()[1]
        os.chdir('/home/aamks_users')
        os.environ["AAMKS_PROJECT"] = '/home/aamks_users/'+self.url.split('aamks_users/')[1].split('/workers/')[0]
        if self.url.split('aamks_users/')[1][0] == "/":
            self.working_dir = self.url.split('aamks_users/')[1][1:]
        else:
            self.working_dir = self.url.split('aamks_users/')[1]

        self.cross_building_results = None
        self.simulation_time = None
        self.time_shift = None
        self.animation_data = []
        self.smoke_opacity = []
        self.rooms_in_smoke = dict()
        ssl._create_default_https_context = ssl._create_unverified_context


    def get_logger(self, logger_name):
        #FORMATTER = logging.Formatter("%(asctime)s — %(name)s — %(levelname)s — %(message)s")
        LOG_FILE = "/tmp/aamks_{}.log".format(self.sim_id)
        file_handler = TimedRotatingFileHandler(LOG_FILE, when='midnight')
        #file_handler.setFormatter(FORMATTER)
        logger = logging.getLogger(logger_name)
        logger.setLevel(eval('logging.{}'.format(self.config['LOGGING_MODE'])))
        logger.addHandler(file_handler)
        logger.propagate = False
        return logger

    def download_inputs(self):

        os.chdir(self.working_dir)

        try:
            urlretrieve('{}/../../conf.json'.format(self.url), '{}/conf.json'.format(os.environ['AAMKS_PROJECT']))

        except Exception as e:
            print(e)
        else:
            print('conf.json fetched from server')

        try:
            urlretrieve('{}/evac.json'.format(self.url), 'evac.json'.format(os.environ['AAMKS_PROJECT']))
        except Exception as e:
            print(e)
        else:
            print('evac.json fetched from server')

        try:
            urlretrieve('{}/../../aamks.sqlite'.format(self.url), '{}/aamks.sqlite'.format(os.environ['AAMKS_PROJECT']))

        except Exception as e:
            print(e)
        else:
            print('Aamks.sqlite fetched from server')

        try:
            urlretrieve('{}/cfast.in'.format(self.url), 'cfast.in'.format(os.environ['AAMKS_PROJECT']))
        except Exception as e:
            print(e)
        else:
            print('cfast.in fetched from server')

    def get_config(self):
        try:
            f = open('{}/{}/config.json'.format(os.environ['AAMKS_PATH'], 'evac'), 'r')
            self.config = json.load(f)
        except Exception as e:
            print(e)
            sys.exit(1)

        try:
            f = open('evac.json', 'r')
            self.vars['conf'] = json.load(f)
        except Exception as e:
            print('Cannot load evac.json from directory: {}'.format(str(e)))
            sys.exit(1)

        self.project_conf=self.json.read("../../conf.json")

        self.sim_id = self.vars['conf']['SIM_ID']
        self.host_name = os.uname()[1]
        #print('Starting simulations id: {}'.format(self.sim_id))
        self.wlogger=self.get_logger('worker.py')
        self.vars['conf']['logger'] = self.get_logger('evac.py')

    def _create_workspace(self):
        try:
            shutil.rmtree(self.working_dir, ignore_errors=True)
            os.makedirs(self.working_dir)
        except Exception as e:
            print(e)
        else:
            print('Workspace created')

    def run_cfast_simulations(self):
        if self.project_conf['fire_model'] == 'CFAST':
            try:
                os.system('/usr/local/aamks/fire/cfast cfast.in')
            except Exception as e:
                self.wlogger.error(e)
                cfast_log = open('cfast.log', 'r')
                for line in cfast_log.readlines():
                    if line.startswith("***Error:"):
                        self.wlogger.error(Exception(line))
            else:
                self.wlogger.info('CFAST simulation calculated with success')

    def create_geom_database(self):

        self.s = Sqlite("{}/aamks.sqlite".format(os.environ['AAMKS_PROJECT']))
        #self.s.dumpall()
        doors = self.s.query('SELECT floor, name, center_x, center_y from aamks_geom WHERE terminal_door IS NOT NULL')
        self.vars['conf']['doors']=doors
        self.obstacles = json.loads(self.s.query('SELECT * FROM obstacles')[0]['json'], object_pairs_hook=OrderedDict)
        self.wlogger.info('SQLite load successfully')

    def _create_evacuees(self, floor):

        evacuees = []
        self.wlogger.debug('Adding evacuues on floor: {}'.format(floor))

        floor = self.vars['conf']['FLOORS_DATA'][str(floor)]

        for i in floor['EVACUEES'].keys():
            evacuees.append(Evacuee(origin=tuple(floor['EVACUEES'][i]['ORIGIN']), v_speed=floor['EVACUEES'][i]['V_SPEED'],
                                    h_speed=floor['EVACUEES'][i]['H_SPEED'], pre_evacuation=floor['EVACUEES'][i]['PRE_EVACUATION'],
                                    alpha_v=floor['EVACUEES'][i]['ALPHA_V'], beta_v=floor['EVACUEES'][i]['BETA_V'],
                                    node_radius=self.config['NODE_RADIUS']))
            self.wlogger.debug('{} evacuee added'.format(i))

        e = Evacuees()
        [e.add_pedestrian(i) for i in evacuees]

        self.wlogger.info('Num of evacuees placed: {}'.format(len(evacuees)))
        return e

    def prepare_staircases(self):
        rows = self.s.query("SELECT name, floor, x0, y0, width, depth, height, room_area from aamks_geom WHERE type_sec='STAI' AND fire_model_ignore !=1 ORDER BY name")
        stair_cases = []
        for row in rows:
            staircase = {row['name']: Staircase(name=row['name'], floors=9, number_queues=2, doors=1, width=row['width'], height=row['height'], offsetx=0, offsety=0)}
            stair_cases.append(staircase)
        self.vars['conf']['staircases'] = stair_cases
        return stair_cases

    def prepare_simulations(self):

        for floor in sorted(self.obstacles['obstacles'].keys()):
            eenv = None
            obstacles = []
            try:
                eenv = EvacEnv(self.vars['conf'])
                eenv.floor = floor
            except Exception as e:
                self.wlogger.error(e)
            else:
                self.wlogger.info('rvo2_dto ready on {} floors'.format(floor))

            for obst in self.obstacles['obstacles'][str(floor)]:
                coords = list()
                for coord in obst:
                    coords.append(tuple(coord))
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
            self.floors.append(eenv)


    def connect_rvo2_with_smoke_query(self):

        for floor in self.floors:
            try:
                floor.smoke_query = PartitionQuery(floor=floor.floor)
            except Exception as e:
                self.wlogger.error(e)
                exit(1)
            else:
                self.wlogger.info('Smoke query connected to floor: {}'.format(floor.floor))

    def do_simulation(self):
        self.wlogger.info('Starting simulations')
        time_frame = 10
        first_evacuue = []
        while 1:
            self.floors[0].smoke_query.cfast_has_time(time_frame)
            if self.floors[0].smoke_query.cfast_has_time(time_frame) == 1:
                self.wlogger.info('Simulation time: {}'.format(time_frame))
                rsets = []
                for i in self.floors:
                    i.read_cfast_record(time_frame)
                    first_evacuue.append(i.evacuees.get_first_evacuees_time())

                for step in range(0, int(10 / self.floors[0].config['TIME_STEP'])):
                    time_row = dict()
                    smoke_row = dict()
                    for i in self.floors:
                        i.do_simulation(step)
                        if (step % i.config['VISUALIZATION_RESOLUTION']) == 0:
                            time_row.update({str(i.floor): i.get_data_for_visualization()})
                            smoke_row.update({str(i.floor): i.update_room_opacity()})
                    if len(time_row) > 0:
                        self.animation_data.append(time_row)
                        self.smoke_opacity.append(smoke_row)

                for i in self.floors:
                    rsets.append(i.rset)
                    self.rooms_in_smoke.update({i.floor: i.rooms_in_smoke})
                time_frame += 10
            else:
                time.sleep(1)
            self.wlogger.info('Progress: {}%'.format(round(time_frame/self.vars['conf']['simulation_time'] * 100), 1))
            if time_frame > (self.vars['conf']['simulation_time'] - 10):
                self.wlogger.info('Simulation ends due to user time limit: {}'.format(self.vars['conf']['simulation_time']))
                break
            if prod(array(rsets)) > 0:
                self.wlogger.info('Simulation ends due to successful evacuation: {}'.format(rsets))
                self.simulation_time = max(rsets)
                self.time_shift = 0
                break
        self.cross_building_results = self.floors[0].smoke_query.get_final_vars()
        self.wlogger.info('Final results gathered')
        self.wlogger.debug('Final results gathered: {}'.format(self.cross_building_results))



    def send_report(self): # {{{
        '''
        Runs on a worker. Write /home/aamks/project/sim_id.json on each aRun
        completion. Then inform gearman server to scp to itself
        /home/aamks/project/sim_id.json via aOut service. Gearman server will
        process this json via /usr/local/aamks/manager/results_collector.py.
        Gearman server will psql insert and will scp the worker's animation to
        itself.
        '''
        self._write_animation_zips()
        self._write_meta()

        if os.environ['AAMKS_WORKER'] == 'gearman':
            Popen("gearman -h {} -f aOut '{} {} {}'".format(self.AAMKS_SERVER, self.host_name, '/home/aamks_users/'+self.working_dir+'/'+self.meta_file, self.sim_id), shell=True)
            self.wlogger.info('aOut launched successfully')
        else:
            command = "python3 {}/manager/results_collector.py {} {} {}".format(os.environ['AAMKS_PATH'], self.host_name, self.meta_file, self.sim_id)
            os.system(command)
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
        zf = zipfile.ZipFile("{}.zip".format(self.sim_id), mode='w', compression=zipfile.ZIP_DEFLATED)
        try:
            zf.writestr("anim.json", json.dumps(json_content))
            self.wlogger.info('Date for animation saved')
        finally:
            zf.close()

    # }}}
    def _write_meta(self):# {{{
        j=Json()
        report = OrderedDict()
        report['worker'] = self.host_name
        report['sim_id'] = self.sim_id
        report['scenario_id'] = self.vars['conf']['scenario_id']
        report['project_id'] = self.vars['conf']['project_id']
        report['path_to_project'] = '/home/aamks_users/'+self.working_dir.split('workers')[0]
        report['fire_origin'] = self.vars['conf']['FIRE_ORIGIN']
        report['highlight_geom'] = None
        report['psql'] = dict()
        report['psql']['fed'] = dict()
        report['psql']['rset'] = dict()
        report['psql']['runtime'] = int(time.time() - self.start_time)
        report['psql']['cross_building_results'] = self.cross_building_results
        for i in self.floors:
            report['psql']['fed'][i.floor] = i.fed
            report['psql']['rset'][i.floor] = int(i.rset)
        for num_floor in range(len(self.floors)):
            report['animation'] = "{}_{}_{}_anim.zip".format(self.vars['conf']['project_id'], self.vars['conf']['scenario_id'], self.sim_id)
            report['floor'] = num_floor

        self.meta_file = "meta_{}.json".format(self.sim_id)
        j.write(report, self.meta_file)
        self.wlogger.info('Metadata prepared successfully')
    # }}}

    def main(self):
        self._create_workspace()
        self.download_inputs()
        self.get_config()
        self.create_geom_database()
        self.run_cfast_simulations()
        self.prepare_simulations()
        self.connect_rvo2_with_smoke_query()
        self.do_simulation()
        self.send_report()
        self.wlogger.info('Simulation ended')

    def test(self):
        self.get_config()
        self.create_geom_database()
        self.prepare_simulations()
        self.connect_rvo2_with_smoke_query()
        self.do_simulation()
        self.send_report()

    def local_worker(self):
        os.chdir(self.working_dir)
        self.get_config()
        self.create_geom_database()
        self.run_cfast_simulations()
        self.prepare_staircases()
        self.prepare_simulations()
        self.connect_rvo2_with_smoke_query()
        self.do_simulation()
        self.send_report()


w = Worker()
#print(os.environ['AAMKS_WORKER'])
if SIMULATION_TYPE == 'NO_CFAST':
    #print('Working in NO_CFAST mode')
    w.test()
elif os.environ['AAMKS_WORKER'] == 'local':
    print('Working in LOCAL MODE')
    w.local_worker()
elif os.environ['AAMKS_WORKER'] == 'gearman':
    print('Working in gearman MODE')
    w.main()
else:
    print('Please specify worker mode')
