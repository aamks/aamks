#!/usr/bin/python3

import os
import shutil
import sys
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

SIMULATION_TYPE = 'NO_CFAST'


class Worker:

    def __init__(self):
        self.url = sys.argv[1]
        self.vars = OrderedDict()
        self.results = dict()
        self.geom = None
        self.trajectory = None
        self.velocity = None
        self.floor_dims = None
        self.evacuees = None
        self.fire_dto = None
        self.sim_floors = None
        self.start_time = time.time()
        self.floors = list()
        os.chdir('/home/aamks')

    def _report_error(self, exception: Exception) -> logging:
        print('Error occurred, see aamks.log file for details.')
        logging.error('Cannot create RVO2 environment: {}'.format(str(exception)))
        sys.exit(1)

    def get_config(self):

        try:
            self.vars['conf'] = json.loads(urlopen('{}/evac.json'.format(self.url)).read().decode())
        except Exception as e:
            print('Cannot fetch evac.json from server: {}'.format(str(e)))
            sys.exit(1)
        else:
            print('URL OK. Starting calculations')

        self.sim_id = self.vars['conf']['GENERAL']['SIM_ID']
        self.host_name = os.uname()[1]
        self.db_server = self.vars['conf']['GENERAL']['SERVER']
        # self.project_name = self.vars['conf']['GENERAL']['PROJECT_NAME']

    def get_geom_and_cfast(self):

        os.chdir(self.vars['conf']['GENERAL']['WORKSPACE'])

        logging.basicConfig(filename='aamks.log', level=logging.DEBUG,
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
            shutil.rmtree(self.vars['conf']['GENERAL']['WORKSPACE'], ignore_errors=True)
            os.makedirs(self.vars['conf']['GENERAL']['WORKSPACE'])
        except Exception as e:
            self._report_error(e)

    def run_cfast_simulations(self):

        try:
            with open('cfast.in', "w") as f:
                f.write(self.cfast_input)
        except Exception as e:
            self._report_error(e)
        else:
            logging.info('Cfast input file saved.')

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
        self.geom = json.loads(self.s.query('SELECT * FROM obstacles')[0]['json'], object_pairs_hook=OrderedDict)

    def _create_evacuees(self, floor):
        floor_no = str(floor+1)

        evacuees = []
        logging.info('Adding evacuues on floor: {}'.format(floor_no))

        floor = self.vars['conf']['FLOORS_DATA'][floor_no]

        for i in range(floor['NUM_OF_EVACUEES']):
            evacuees.append(Evacuee(origin=tuple(floor['EVACUEES']['E' + str(i)]['ORIGIN']),
                                    v_speed=floor['EVACUEES']['E' + str(i)]['V_SPEED'],
                                    h_speed=floor['EVACUEES']['E' + str(i)]['H_SPEED'],
                                    roadmap=floor['EVACUEES']['E' + str(i)]['ROADMAP'],
                                    pre_evacuation=floor['EVACUEES']['E' + str(i)][
                                        'PRE_EVACUATION'],
                                    alpha_v=floor['EVACUEES']['E' + str(i)]['ALPHA_V'],
                                    beta_v=floor['EVACUEES']['E' + str(i)]['BETA_V'],
                                    node_radius=self.vars['conf']['AAMKS_CONF']['NODE_RADIUS']))

        e = Evacuees()
        [e.add_pedestrian(i) for i in evacuees]

        logging.info('Num of evacuees placed: {}'.format(len(evacuees)))
        return e

    def prepare_simulations(self):
        logging.info('Number of floors processed: {}'.format(len(self.geom['points'])))
        obstacles = []

        for i in range(len(self.geom['points'])):
            try:
                env = EvacEnv(self.vars['conf'])
            except Exception as e:
                self._report_error(e)
            else:
                logging.info('RVO2 ready on {} floors'.format(i))

            for obst in self.geom['points'][str(i+1)]:
                obstacles.append([tuple(x) for x in obst])
            env.obstacle = obstacles
            num_of_vertices = env.process_obstacle(obstacles)
            logging.info('Added obstacles on floor: {}, number of vercites: {}'.format(str(i+1), num_of_vertices))

            e = self._create_evacuees(i)
            env.place_evacuees(e)
            self.floors.append(env)

    def do_simulation(self):
        logging.info('Starting simulaitons')

        time_frame = 10
        floor = 1
        try:
            master_query = SmokeQuery(floor='1', vars=self.vars['conf']['GENERAL'])
        except Exception as e:
            self._report_error(e)

        for i in self.floors:
            try:
                i.smoke_query = SmokeQuery(floor=str(floor), vars=self.vars['conf']['GENERAL'])
            except Exception as e:
                self._report_error(e)
            else:
                logging.info('Smoke query connected to floor: {}'.format(floor))
            floor += 1

        if master_query.read_cfast_record(time_frame) == 1:
            for i in self.floors:
                i.read_cfast_record(time_frame)
                i.do_simulation(time_frame)
                time_frame += 10
        else:
            time.sleep(1)


    def send_report(self, sim_id, project,floor, animation_data, psql_data ): # {{{
        '''
        Runs on a worker. Write /home/aamks/project/sim_id.json on each aRun
        completion. Then inform gearman server to scp to itself
        /home/aamks/project/sim_id.json via aOut service. Gearman server will
        process this json via /usr/local/aamks/manager/results_collector.py.
        Gearman server will psql insert and will scp the worker's animation to
        itself.
        '''

        self.project_dir="/home/aamks/{}".format(project)
        try:
            os.makedirs(self.project_dir, exist_ok=True)
        except:
            pass
        self.sim_id=sim_id
        self.floor=floor
        self._write_animation(animation_data)
        self._write_report(psql_data)
    # }}}
    def _write_animation(self, animation_data):# {{{
        '''
        Raw data comes as an argument. We create /home/aamks/1.anim.zip
        with anim.json inside.
        '''

        zf = zipfile.ZipFile("{}/{}.anim.zip".format(self.project_dir, self.sim_id), mode='w', compression=zipfile.ZIP_DEFLATED)
        try:
            zf.writestr("anim.json", json.dumps(animation_data))
        finally:
            zf.close()
    # }}}
    def _write_report(self, psql_data):# {{{
        j=Json()
        host=os.uname()[1]
        report=OrderedDict()
        report['worker']=host
        report['sim_id']=self.sim_id
        report['animation']="{}/{}.anim.zip".format(self.project_dir, self.sim_id)
        report['psql']=psql_data
        json_file="{}/report_{}.json".format(self.project_dir, self.sim_id)
        j.write(report, json_file)
        Popen("gearman -h {} -f aOut '{} {} {} {}'".format(os.environ['AAMKS_SERVER'], host, json_file, sim_id, floor ), shell=True)
    # }}}
    def example_animation_data():# {{{
        ''' TODO: temporary. Should come as argument in the future '''
        animation_data=dict()
        animation_data['data']=[
                [ [ 1000 , 1150 , 20  , 200  , "N" , 1 ] , [ 1000 , 1150 , 200 , 0   , "N" , 1 ] ] ,
                [ [ 1100 , 1850 , 200 , -300 , "N" , 1 ] , [ 1500 , 1150 , 200 , 0   , "N" , 1 ] ] ,
                [ [ 1500 , 1150 , 200 , 80   , "N" , 0 ] , [ 5000 , 1150 , 200 , 0   , "N" , 1 ] ] ,
                [ [ 5000 , 1850 , 200 , -200 , "N" , 0 ] , [ 6000 , 1150 , 200 , 0   , "N" , 1 ] ] ,
                [ [ 6000 , 1150 , 200 , 200  , "N" , 0 ] , [ 0    , 0    , 200 , 200 , "N" , 0 ] ] ,
                [ [ 0    , 0    , 200 , 200  , "N" , 0 ] , [ 0    , 0    , 200 , 200 , "N" , 0 ] ] 
            ]            
        animation_data['floor']="1"
        animation_data['frame_rate']=2
        animation_data['project_name']=project
        animation_data['simulation_id']=sim_id
        animation_data['simulation_time']=200
        animation_data['time_shift']=150.61 
        return animation_data

    def main(self):
        self.get_config()
        self._create_workspace()
        self.get_geom_and_cfast()
        self.create_geom_database()
        self.run_cfast_simulations()
        self.create_geom_database()
        self.prepare_simulations()
        self.do_simulation()

    def test(self):
        self.get_config()
        self.get_geom_and_cfast()
        self.create_geom_database()
        self.prepare_simulations()
        self.do_simulation()


w = Worker()
if SIMULATION_TYPE == 'NO_CFAST':
    w.test()
else:
    w.main()
