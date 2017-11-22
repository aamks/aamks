#!/usr/bin/env python
from EvacEnv import EvacEnv
from Evacuee import Evacuee
from Evacuees import Evacuees
from GEOM_DTO import GEOM_DTO
import time
import sqlite3
from FIRE_DTO import FIRE_DTO
import psycopg2
import os
from collections import OrderedDict
import json
import sys
from urllib.request import urlopen
from AnimatePedestrian import AnimatePedestrian
from os.path import expanduser
import shutil
import pickle
import logging


class Run:

    def __init__(self):
        self.url = sys.argv[1]
        #self.url = "http://localhost/users/mimoohowy@gmail.com/99/risk/51/workers/98"
        #self.mode = sys.argv[2]
        self.mode = "ntest"
        self.vars = OrderedDict()
        self.results = dict()
        self.trajectory = None
        self.velocity = None
        self.floor_dims = None
        self.evacuees = None
        self.fire_dto = None
        self.sim_floors = None
        self.start_time = time.time()

        os.chdir(expanduser("~"))
        logging.basicConfig(filename='aamks.log', level=logging.DEBUG, format='%(asctime)s %(levelname)s: %(message)s')
        try:
            self.sql_connection = sqlite3.connect(":memory:")
            self.sql_connection.row_factory = self.dict_factory
        except Exception as e:
            print('Error occurred, see aamks.log file for details.')
            logging.error('Cannot instantiate database: {}'.format(str(e)))
            sys.exit(1)
        else:
            logging.info('Database instantiated')

    def dict_factory(self, cursor, row):
        d = {}
        for idx, col in enumerate(cursor.description):
            d[col[0]] = row[idx]
        return d

    def set_environment(self):
        logging.info('URL: {}'.format(self.url))

        try:
            self.vars['conf'] = json.loads(urlopen('{}/evac.json'.format(self.url)).read().decode())
            self.vars['geom'] = json.loads(urlopen('{}/../../geom.json'.format(self.url)).read().decode(),
                                       object_pairs_hook=OrderedDict)
            self.cfast_input = urlopen('{}/cfast.in'.format(self.url)).read().decode()
        except Exception as e:
            print('Error occurred, see aamks.log file for details.')
            logging.error('Cannot fetch the data from server: {}'.format(str(e)))
            sys.exit(1)
        else:
            logging.info('Data fetched from server')

        self.project_name = self.vars['conf']['GENERAL']['PROJECT_NAME']
        self.sim_id = self.vars['conf']['GENERAL']['SIM_ID']
        self.host_name = os.uname()[1]
        self.db_server = self.vars['conf']['GENERAL']['SERVER']

        print("Host: {} start simulation id: {}".format(self.host_name, self.sim_id))



    def run_cfast_simulations(self):
        try:
            shutil.rmtree(self.vars['conf']['GENERAL']['WORKSPACE'], ignore_errors=True)
            os.makedirs(self.vars['conf']['GENERAL']['WORKSPACE'])
        except Exception as e:
            print('Error occurred, see aamks.log file for details.')
            logging.error('Cannot create workspace: {}'.format(str(e)))
            sys.exit(1)
        else:
            logging.info('Workspace created.')

        try:
            with open(self.vars['conf']['GENERAL']['WORKSPACE'] + '/cfast.in', "w") as f:
                f.write(self.cfast_input)
        except Exception as e:
            print('Error occurred, see aamks.log file for details.')
            logging.error('Cannot write cfast input file: {}'.format(str(e)))
            sys.exit(1)
        else:
            logging.info('Cfast input file saved.')

        try:
            os.system('/home/svn/svn_mimooh/aamks/devel/evac/cfast {}/cfast.in'.format(self.vars['conf']['GENERAL']['WORKSPACE']))
            cfast_log = open('{}/cfast.log'.format(self.vars['conf']['GENERAL']['WORKSPACE']), 'r')
        except Exception as e:
            print('Error occurred, see aamks.log file for details.')
            logging.error('Cannot run cfast simulations: {}'.format(str(e)))
            sys.exit(1)

        for line in cfast_log.readlines():
            if line.startswith("***Error:"):
                logging.error('Simulation failed: {}'.format(line))
                sys.exit(1)

        logging.info('Simulation finished with exit code 0')

    def create_geom_database(self):

        g = GEOM_DTO(self.sql_connection, self.vars)

        # Writing data from GEOM to DB
        try:
            g.create_dbs()
            g.sql_query("CREATE INDEX positions ON aamks_geom (x0, x1, y0, y1);")
            g.sql_query("CREATE INDEX type_sec_ind ON aamks_geom (type_sec);")
            compas = g.sql_query("SELECT distinct(name) FROM aamks_geom where type_pri = 'COMPA'")
            self.floor_dims = g.get_floor_dim()
        except Exception as e:
            print('Error occurred, see aamks.log file for details.')
            logging.error('Cannot create geom database: {}'.format(str(e)))
            sys.exit(1)
        else:
            logging.info('Created compas: {}'.format(compas))

    def create_fire_database(self):
        f = FIRE_DTO(self.sql_connection, self.vars)

        # Load cfast files to DB
        try:
            f.create_dbs()
            times = f.query("SELECT max(time) FROM aamks_csv ")
        except Exception as e:
            print('Error occurred, see aamks.log file for details.')
            logging.error('Cannot create fire database: {}'.format(str(e)))
            sys.exit(1)
        else:
            logging.info('Fire database created with max simulation time: {}'.format(times))
        self.fire_dto = f

    def create_evacuees(self):
        floor_no='1'
        
        evacuees = []
        logging.info('Num of evacuees in file: {}'.format(self.vars['conf'][floor_no]['NUM_OF_EVACUEES']))

        for i in range(self.vars['conf'][floor_no]['NUM_OF_EVACUEES']):
            evacuees.append(Evacuee(origin=tuple(self.vars['conf'][floor_no]['EVACUEES']['E'+str(i)]['ORIGIN']),
                                    v_speed=self.vars['conf'][floor_no]['EVACUEES']['E'+str(i)]['V_SPEED'],
                                    h_speed=self.vars['conf'][floor_no]['EVACUEES']['E'+str(i)]['H_SPEED'],
                                    roadmap=self.vars['conf'][floor_no]['EVACUEES']['E'+str(i)]['ROADMAP'],
                                    pre_evacuation=self.vars['conf'][floor_no]['EVACUEES']['E'+str(i)]['PRE_EVACUATION'],
                                    alpha_v=self.vars['conf'][floor_no]['EVACUEES']['E'+str(i)]['ALPHA_V'],
                                    beta_v=self.vars['conf'][floor_no]['EVACUEES']['E'+str(i)]['BETA_V'],
                                    node_radius=self.vars['conf']['AAMKS_CONF']['NODE_RADIUS']))

        e = Evacuees()
        [e.add_pedestrian(i) for i in evacuees]

        logging.info('Num of evacuees created: {}'.format(len(evacuees)))
        self.evacuees = e

    def do_simulations(self):
        logging.info('Number of floors processed: {}'.format(len(self.vars['geom']['obstacles'])))
        floors = []

        try:
            for i in self.vars['geom']['obstacles']:
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
                for obst in self.vars['geom']['obstacles'][str(num_of_floor)]:
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

    def send_report(self):

        run_time = time.time() - self.start_time
        self.results['WCBE'] = self.rset
        self.results['DCBE'] = self.fire_dto.get_dcbe_time()
        self.results['MIN_H'] = self.fire_dto.get_min_height()
        self.results['MAX_T'] = self.fire_dto.get_max_temp()
        self.results['MIN_VIS'] = self.fire_dto.get_min_visibility()
        self.results['per_9'] = self.per_9
        self.results['FED'] = [self.evacuees.get_fed_of_pedestrian(i) for i in range(self.evacuees.get_number_of_pedestrians())]

        try:
            psql_conection=psycopg2.connect("dbname='aamks' user='aamks' host={} password='TopSecretOfSgsp'".format(self.db_server))
        except Exception as e:
            logging.error('Cannot connect postgres database: {}'.format(str(e)))
            sys.exit(1)
        else:
            logging.info('Postgres successfully connected')

        cur = psql_conection.cursor()
        try:
            cur.execute("UPDATE simulations SET host=%s, dcbe_time=%s, dcbe_compa=%s, wcbe=%s, status=%s, run_time=%s, fed=%s, "
                        "min_height=%s, max_temp = %s, min_vis = %s WHERE project=%s AND iteration=%s",
                        (self.host_name, self.results['DCBE'][0], self.results['DCBE'][1], self.results['WCBE'], self.results['per_9'], run_time,
                         self.results['FED'], self.results['MIN_H'], self.results['MAX_T'], self.results['MIN_VIS'],
                         self.project_name, self.sim_id))
            psql_conection.commit()
        except Exception as e:
            logging.error('Cannot send report to database {}'.format(str(e)))
            sys.exit(1)
        else:
            logging.info('Report successfully sent to server')

    def dump_data_for_visualisation(self):

        f_data = self.fire_dto.dump_fire_data()
        with open('{}/fire_data.json'.format(self.vars['conf']['GENERAL']['WORKSPACE']), 'w') as outfile:
             json.dump(f_data, outfile)

        for floor in self.sim_floors:
            encoded = floor.record_data()
            with open('{}/evac_data_{}.json'.format(self.vars['conf']['GENERAL']['WORKSPACE'], self.sim_floors.index(floor)), 'w') as outfile:
                 json.dump(encoded, outfile)

            with open('{}/trajectory_{}.pickle'.format(self.vars['conf']['GENERAL']['WORKSPACE'], self.sim_floors.index(floor)), 'wb') as outfile:
                 pickle.dump(floor.trajectory, outfile)

            with open('{}/velocity_{}.pickle'.format(self.vars['conf']['GENERAL']['WORKSPACE'], self.sim_floors.index(floor)), 'wb') as outfile:
                 pickle.dump(floor.velocity_vector, outfile)

    def animate(self, vars):
        a = AnimatePedestrian(vars)
        a.load_data()
        a.set_trajectory(a.trajectory, a.velocity)
        a.initiate_chart(self.floor_dims)
        a.set_obstacles(self.vars['geom']['obstacles']['1'])
        a.run_animation(10)

    def main(self):
        self.set_environment()
        if self.mode == 'test':
            print('Reading from CFAST test output')
        else:
            self.run_cfast_simulations()
        self.create_geom_database()
        self.create_fire_database()
        self.create_evacuees()
        self.do_simulations()
        self.send_report()
        self.dump_data_for_visualisation()
        #self.animate(self.vars)

r = Run()
r.main()
