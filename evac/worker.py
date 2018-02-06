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

class Worker():
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
        self.error_main = 'Error occurred, see aamks.log file for details.'

        os.chdir('/home/aamks')
        logging.basicConfig(filename='aamks.log', level=logging.DEBUG,
                            format='%(asctime)s %(levelname)s: %(message)s')

    def set_environment(self):
        logging.info('URL: {}'.format(self.url))

        try:
            self.vars['conf'] = json.loads(urlopen('{}/evac.json'.format(self.url)).read().decode())
        except Exception as e:
            print(self.error_main)
            logging.error('Cannot fetch evac.json from server: {}'.format(str(e)))
            sys.exit(1)
        else:
            logging.info('Evac.json fetched from server')

        try:
            shutil.rmtree(self.vars['conf']['GENERAL']['WORKSPACE'], ignore_errors=True)
            os.makedirs(self.vars['conf']['GENERAL']['WORKSPACE'])
        except Exception as e:
            print(self.error_main)
            logging.error('Cannot create workspace: {}'.format(str(e)))
            sys.exit(1)
        else:
            logging.info('Workspace created.')

        try:
            urlretrieve('{}/../../aamks.sqlite'.format(self.url),
                        '{}/aamks.sqlite'.format(self.vars['conf']['GENERAL']['WORKSPACE']))

        except Exception as e:
            print(self.error_main)
            logging.error('Cannot fetch aamks.sqllite from server: {}'.format(str(e)))
            sys.exit(1)
        else:
            logging.info('Aamks.sqlite fetched from server')

        try:
            self.cfast_input = urlopen('{}/cfast.in'.format(self.url)).read().decode()

        except Exception as e:
            print(self.error_main)
            logging.error('Cannot fetch cfast.in from server: {}'.format(str(e)))
            sys.exit(1)
        else:
            logging.info('Cfast.in fetched from server')

        self.project_name = self.vars['conf']['GENERAL']['PROJECT_NAME']
        self.sim_id = self.vars['conf']['GENERAL']['SIM_ID']
        self.host_name = os.uname()[1]
        self.db_server = self.vars['conf']['GENERAL']['SERVER']

        print("Host: {} start simulation id: {}".format(self.host_name, self.sim_id))

    def run_cfast_simulations(self):

        try:
            with open(self.vars['conf']['GENERAL']['WORKSPACE'] + '/cfast.in', "w") as f:
                f.write(self.cfast_input)
        except Exception as e:
            print(self.error_main)
            logging.error('Cannot write cfast input file: {}'.format(str(e)))
            sys.exit(1)
        else:
            logging.info('Cfast input file saved.')

        try:
            os.system('/usr/local/aamks/fire/cfast {}/cfast.in'.format(self.vars['conf']['GENERAL']['WORKSPACE']))
            cfast_log = open('{}/cfast.log'.format(self.vars['conf']['GENERAL']['WORKSPACE']), 'r')
        except Exception as e:
            print(self.error_main)
            logging.error('Cannot run cfast simulations: {}'.format(str(e)))
            sys.exit(1)

        for line in cfast_log.readlines():
            if line.startswith("***Error:"):
                logging.error('Simulation failed: {}'.format(line))
                sys.exit(1)

        logging.info('Simulation finished with exit code 0')

    def read_data_from_cfast(self):
        sq = SmokeQuery(floor='1', path=self.vars['conf']['GENERAL']['WORKSPACE'])
        ready = sq.read_cfast_records(20)
        print(sq.get_conditions((1005, 1), 20))
        print(ready)

    def create_geom_database(self):
        self.s = Sqlite("{}/aamks.sqlite".format(self.vars['conf']['GENERAL']['WORKSPACE']))
        #self.s.dumpall()
        self.geom = json.loads(self.s.query('SELECT * FROM obstacles')[0]['json'], object_pairs_hook=OrderedDict)
        for i in self.geom['points']:
            print(i)

    def create_evacuees(self):
        floor_no = '1'

        evacuees = []
        logging.info('Num of evacuees in file: {}'.format(self.vars['conf'][floor_no]['NUM_OF_EVACUEES']))

        for i in range(self.vars['conf'][floor_no]['NUM_OF_EVACUEES']):
            evacuees.append(Evacuee(origin=tuple(self.vars['conf'][floor_no]['EVACUEES']['E' + str(i)]['ORIGIN']),
                                    v_speed=self.vars['conf'][floor_no]['EVACUEES']['E' + str(i)]['V_SPEED'],
                                    h_speed=self.vars['conf'][floor_no]['EVACUEES']['E' + str(i)]['H_SPEED'],
                                    roadmap=self.vars['conf'][floor_no]['EVACUEES']['E' + str(i)]['ROADMAP'],
                                    pre_evacuation=self.vars['conf'][floor_no]['EVACUEES']['E' + str(i)][
                                        'PRE_EVACUATION'],
                                    alpha_v=self.vars['conf'][floor_no]['EVACUEES']['E' + str(i)]['ALPHA_V'],
                                    beta_v=self.vars['conf'][floor_no]['EVACUEES']['E' + str(i)]['BETA_V'],
                                    node_radius=self.vars['conf']['AAMKS_CONF']['NODE_RADIUS']))

        e = Evacuees()
        [e.add_pedestrian(i) for i in evacuees]

        logging.info('Num of evacuees created: {}'.format(len(evacuees)))
        self.evacuees = e

    def do_simulations(self):
        logging.info('Number of floors processed: {}'.format(len(self.geom['points'])))
        floors = []

        try:
            for i in self.geom['points']:
                floors.append(EvacEnv(self.vars['conf']))
        except Exception as e:
            logging.error('Cannot create RVO2 environment: {}'.format(str(e)))
            sys.exit(1)
        else:
            logging.info('RVO2 ready on {} floors'.format(len(floors)))

        try:
            num_of_floor = 1
            for floor in floors:
                obstacles = []
                for obst in self.geom['points'][str(num_of_floor)]:
                    obstacles.append([tuple(x) for x in obst])
                floor.obstacle = obstacles
                num_of_vertices = floor.process_obstacle(obstacles)
                logging.info('Number of vercites in RVO2: {}'.format(num_of_vertices))
                num_of_floor += 1
        except Exception as e:
            logging.error('Cannot set obstacle to RVO2: {}'.format(str(e)))
            sys.exit(1)
        else:
            logging.info('Obstacles successfully processed by RVO2')
        try:
            for f in floors:
                f.place_evacuees(self.evacuees)
        except Exception as e:
            logging.error('Cannot place evacuees to RVO2: {}'.format(str(e)))
            sys.exit(1)
        else:
            logging.info('Evacuees in RVO2')

        for floor in floors:
            floor.fire_dto = self.fire_dto

        for floor in floors:
            floor.do_simulation()
            logging.info('{} seconds of simulation generated at floor: {}'
                         .format(round(floor.get_simulation_time(), 2), floors.index(floor)))
            self.rset = floor.rset
            self.per_9 = floor.per_9
        self.sim_floors = floors

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
        self.set_environment()
        self.run_cfast_simulations()
        self.read_data_from_cfast()
        self.create_geom_database()
        self.create_evacuees()
        self.do_simulations()

## }}}
#
#    try:
#        sim_id=os.path.basename(sys.argv[1])
#        project=sys.argv[2]
#    except:
#        ''' Testing without gearman. '''
#        sim_id="1"
#        project="simple"
#
#    # todo: animation_data and psql_data will be produced in a-evac
#    floor="1"
#    animation_data=example_animation_data()
#    psql_data="psql report"
#
#    report=Worker(sim_id, project, floor, animation_data, psql_data)
#
#except:
#    t="In test/worker.py:\n"
#    t+=traceback.format_exc()
#    SendMessage(t)
#    raise Exception("worker fail")

#
w = Worker()
w.main()
