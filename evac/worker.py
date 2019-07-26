#!/usr/bin/python3

import os
import shutil
import sys
from numpy import array
from numpy import prod


from evac.evacuee import Evacuee
from evac.evacuees import Evacuees
from evac.rvo2_dto import EvacEnv
from fire.smoke_query import SmokeQuery
from include import Sqlite
import time
import logging
from urllib.request import urlopen, urlretrieve
from include import Json
import json
from collections import OrderedDict
from subprocess import Popen
import zipfile

#SIMULATION_TYPE = 'NO_CFAST'
SIMULATION_TYPE = 1

class Worker:

    def __init__(self):
        self.start_time = time.time()
        self.url = sys.argv[1]
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
        os.environ["AAMKS_PROJECT"]='.'
        self.working_dir = self.url.split('aamks_users/')[1]
        self.cross_building_results = None
        self.simulation_time = None
        self.time_shift = None
        self.animation_data = []
        self.smoke_opacity = dict()

    def error_report(self, message):
        with open("/tmp/aamks.log", "a") as output:
            output.write(message)

    def _report_error(self, exception: Exception) -> logging:
        print('Error occurred, see aamks.log file for details.')
        logging.error('Cannot create RVO2 environment: {}'.format(str(exception)))
        sys.exit(1)

    def get_config(self):
        try:
            f = open('{}/{}/config.json'.format(os.environ['AAMKS_PATH'], 'evac'), 'r')
            self.config = json.load(f)
        except Exception as e:
            sys.exit(1)

        try:
            self.vars['conf'] = json.loads(urlopen('{}/evac.json'.format(self.url)).read().decode())
        except Exception as e:
            print('Cannot fetch evac.json from server: {}'.format(str(e)))
            sys.exit(1)
        else:
            print('URL OK. Starting calculations')

        self.sim_id = self.vars['conf']['SIM_ID']
        self.host_name = os.uname()[1]
        self.db_server = self.vars['conf']['SERVER']

    def get_geom_and_cfast(self):

        os.chdir(self.working_dir)


        logging.basicConfig(filename='aamks.log', level=logging.INFO,
                            format='%(asctime)s %(levelname)s: %(message)s')

        logging.info('URL: {}'.format(self.url))

        try:
            urlretrieve('{}/../../aamks.sqlite'.format(self.url), 'aamks.sqlite')

        except Exception as e:
            self._report_error(e)
        else:
            logging.info('Aamks.sqlite fetched from server')

        try:
            self.cfast_input = urlopen('{}/cfast.in'.format(self.url)).read().decode()

        except Exception as e:
            self._report_error(e)
        else:
            logging.info('Cfast.in fetched from server')
        print("Host: {} start simulation id: {}".format(self.host_name, self.sim_id))

    def _create_workspace(self):
        try:
            shutil.rmtree(self.working_dir, ignore_errors=True)
            os.makedirs(self.working_dir)
        except Exception as e:
            self._report_error(e)

    def run_cfast_simulations(self):

        try:
            with open('cfast.in', "w") as f:
                f.write(self.cfast_input)
        except Exception as e:
            self._report_error(e)
        else:
            logging.debug('Cfast input file saved.')

        try:
            os.system('/usr/local/aamks/fire/cfast cfast.in')
            cfast_log = open('cfast.log', 'r')
        except Exception as e:
            self._report_error(e)

        for line in cfast_log.readlines():
            if line.startswith("***Error:"):
                self._report_error(Exception(line))

        logging.info('Simulation finished with exit code 0')

    def create_geom_database(self):

        self.s = Sqlite("aamks.sqlite")
        #self.s.dumpall()
        doors = self.s.query('SELECT floor, name, center_x, center_y from aamks_geom where type_pri="HVENT" AND vent_to_name="outside"')
        self.vars['conf']['doors']=doors
        self.obstacles = json.loads(self.s.query('SELECT * FROM obstacles')[0]['json'], object_pairs_hook=OrderedDict)

    def _create_evacuees(self, floor):

        evacuees = []
        logging.debug('Adding evacuues on floor: {}'.format(floor))

        floor = self.vars['conf']['FLOORS_DATA'][str(floor)]

        for i in floor['EVACUEES'].keys():
            evacuees.append(Evacuee(origin=tuple(floor['EVACUEES'][i]['ORIGIN']), v_speed=floor['EVACUEES'][i]['V_SPEED'],
                                    h_speed=floor['EVACUEES'][i]['H_SPEED'], pre_evacuation=floor['EVACUEES'][i]['PRE_EVACUATION'],
                                    alpha_v=floor['EVACUEES'][i]['ALPHA_V'], beta_v=floor['EVACUEES'][i]['BETA_V'],
                                    node_radius=self.config['NODE_RADIUS']))

        e = Evacuees()
        [e.add_pedestrian(i) for i in evacuees]

        logging.info('Num of evacuees placed: {}'.format(len(evacuees)))
        return e

    def prepare_simulations(self):
        logging.info('Number of floors processed: {}'.format(len(self.obstacles['obstacles'])))
        obstacles = []


        for i in self.obstacles['obstacles'].keys():
            try:
                eenv = EvacEnv(self.vars['conf'])
                eenv.floor = i
            except Exception as e:
                self._report_error(e)
            else:
                logging.info('RVO2 ready on {} floors'.format(i))

            for obst in self.obstacles['obstacles'][str(i)]:
                obstacles.append([tuple(x) for x in array(obst)[[0,1,2,3,4,1]]])
            eenv.obstacle = obstacles
            num_of_vertices = eenv.process_obstacle(obstacles)
            eenv.generate_nav_mesh()
            logging.info('Added obstacles on floor: {}, number of vercites: {}'.format(1, num_of_vertices))

            e = self._create_evacuees(i)
            eenv.place_evacuees(e)
            #eenv.set_goal()
            eenv.prepare_rooms_list()
            self.floors.append(eenv)


    def connect_rvo2_with_smoke_query(self):
        logging.info('Connectiong to smoke queries ')

        for i in self.floors:
            try:
                i.smoke_query = SmokeQuery(floor=i.floor)
            except Exception as e:
                self._report_error(e)
            else:
                logging.info('Smoke query connected to floor: {}'.format(i.floor))

    def do_simulation(self):
        logging.info('Starting simulations')
        time_frame = 10
        first_evacuue = []
        while 1:
            self.floors[0].smoke_query.cfast_has_time(time_frame)
            if self.floors[0].smoke_query.cfast_has_time(time_frame) == 1:
                logging.info('Simulation time: {}'.format(time_frame))
                rsets = []
                for i in self.floors:
                    i.read_cfast_record(time_frame)
                    first_evacuue.append(i.evacuees.get_first_evacuees_time())

                for step in range(0, int(time_frame / self.floors[0].config['TIME_STEP'])):
                    time_row = dict()
                    for i in self.floors:
                        i.do_simulation(step)
                        if (step % i.config['VISUALIZATION_RESOLUTION']) == 0:
                            time_row.update({str(i.floor): i.get_data_for_visualization()})
                    if len(time_row) > 0:
                        self.animation_data.append(time_row)

                for i in self.floors:
                    rsets.append(i.rset)
                time_frame += 10
            else:
                time.sleep(1)
            print('Progress: {}%'.format(round(time_frame/self.vars['conf']['simulation_time'] * 100), 1))
            if time_frame > (self.vars['conf']['simulation_time'] - 10):
                break
            if prod(array(rsets)) > 0:
                self.simulation_time = max(rsets)
                self.time_shift = min(first_evacuue)
                break
        self.cross_building_results = self.floors[0].smoke_query.get_final_vars()

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

        Popen("gearman -h {} -f aOut '{} {} {}'".format(os.environ['AAMKS_SERVER'], self.host_name, '/home/aamks_users/'+self.working_dir+'/'+self.meta_file, self.sim_id), shell=True)
    # }}}
    def _write_animation_zips(self):# {{{
        '''
        Raw data comes as an argument. We create /home/aamks/1.anim.zip
        with anim.json inside.
        '''

        json_content = {
                        'simulation_id': self.sim_id,
                        'simulation_time': self.simulation_time,
                        'time_shift': self.time_shift,
                        'animations': {
                            'evacuees': self.animation_data,
                            'rooms_opacity': []
                        }
                        }
        zf = zipfile.ZipFile("{}_{}_{}_anim.zip".format(self.vars['conf']['project_id'], self.vars['conf']['scenario_id'], self.sim_id), mode='w', compression=zipfile.ZIP_DEFLATED)
        try:
            zf.writestr("anim.json", json.dumps(json_content))
        finally:
            zf.close()

    # }}}
    def _write_meta(self):# {{{
        j=Json()
        report = OrderedDict()
        report['worker'] = self.host_name
        report['sim_id'] = self.sim_id
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
    # }}}

    def main(self):
        self.get_config()
        self._create_workspace()
        self.get_geom_and_cfast()
        self.create_geom_database()
        self.run_cfast_simulations()
        self.prepare_simulations()
        self.connect_rvo2_with_smoke_query()
        self.do_simulation()
        self.send_report()
        #SendMessage('Worker: {} end sim: {}'.format(self.host_name, self.sim_id))

    def test(self):
        self.get_config()
        self.get_geom_and_cfast()
        self.create_geom_database()
        self.prepare_simulations()
        self.do_simulation()
        self.send_report()


w = Worker()
#w.main()

if SIMULATION_TYPE == 'NO_CFAST':
    w.test()
else:
    w.main()
