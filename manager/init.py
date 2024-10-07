from collections import OrderedDict
import datetime
from subprocess import Popen,PIPE
import subprocess
import time
import sys
import os
import json
import shutil
import subprocess
import logging
import sys

from include import Json, Psql, Sqlite, SimIterations, Vis, GetUserPrefs
from include import Dump as dd
from geom.nav import Navmesh


logger = logging.getLogger('AAMKS.init.py')


class OnInit:
    def __init__(self, sim_id=None):# {{{
        ''' Stuff that happens at the beggining of the project '''
        self.json=Json()
        self.conf=self.json.read("{}/conf.json".format(os.environ['AAMKS_PROJECT']))
        self.project_id=self.conf['project_id']
        self.scenario_id=self.conf['scenario_id']
        self.p=Psql()
        self._clear_srv_anims()
        self.s=Sqlite("{}/aamks.sqlite".format(os.environ['AAMKS_PROJECT']), 2)
        if os.environ['AAMKS_WORKER'] == 'slurm':
            new_sql_path = os.path.join(os.environ['AAMKS_PROJECT'], f"aamks_{sim_id}.sqlite")
            shutil.copy(os.path.join(os.environ['AAMKS_PROJECT'], "aamks.sqlite"), new_sql_path)
            self.s=Sqlite(new_sql_path)
        self._clear_sqlite()
        self.irange = SimIterations(self.project_id, self.scenario_id, self.conf['number_of_simulations']).get()
        
        self._setup_simulations()
        self._create_sqlite_tables()
        self.s.close()
# }}}
    def _clear_srv_anims(self):# {{{
        ''' 
        Need to detect and remove obsolete srv animations. Server always
        overwrites anims.json and we need to prevent the dumplicates in
        Animator right menu entries.

        We try: because there may be no anims.json just yet.

        TODO: it is possible we could just remove this file and remove all
        server animations. But would it hurt workers animations?
        ''' 

        try:
            anims=self.json.read("{}/workers/anims.json".format(os.environ['AAMKS_PROJECT']))
            new_anims=[]
            for a in anims:
                if a['srv'] != 1:
                    new_anims.append(a)
            self.json.write(new_anims, "{}/workers/anims.json".format(os.environ['AAMKS_PROJECT']))
        except:
            pass

        try:
            os.remove("{}/workers/static.json".format(os.environ['AAMKS_PROJECT']))
            os.remove("{}/dd_geoms.json".format(os.environ['AAMKS_PROJECT']))
        except:
            pass
# }}}
    def _clear_sqlite(self):# {{{
        try:
            self.s.query("DROP TABLE dispatched_evacuees")
            self.s.query("DROP TABLE aamks_geom")
            self.s.query("DROP TABLE floors_meta")
            self.s.query("DROP TABLE world_meta")
            self.s.query("DROP TABLE obstacles")
            self.s.query("DROP TABLE cell2compa")
            self.s.query("DROP TABLE query_vertices")
        except:
            pass
# }}}
    def _setup_simulations(self):# {{{
        ''' Simulation dir maps to id from psql's simulations table'''

        workers_dir="{}/workers".format(os.environ['AAMKS_PROJECT']) 
        os.makedirs(workers_dir, mode = 0o777, exist_ok=True)

        for i in range(*self.irange):
            sim_dir="{}/{}".format(workers_dir,i)
            os.makedirs(sim_dir, mode=0o777, exist_ok=True)
            if os.environ['AAMKS_WORKER'] != 'slurm':
                self.p.query("INSERT INTO simulations(iteration,project,scenario_id) VALUES(%s,%s,%s)", (i,self.project_id, self.scenario_id))

# }}}
    def _create_sqlite_tables(self): # {{{
        ''' At least some tables must be create early for Vis() etc. '''

        self.s.query("CREATE TABLE dispatched_evacuees(json)")
# }}}

class OnEnd():
    def __init__(self, sim_id=None):# {{{
        ''' Stuff that happens at the end of the project '''
        logger.info('start OnEnd()')
        if os.environ['AAMKS_WORKER']=='slurm':
            # works will be registered as slurm array by slurm.py
            # nothing to do except for updating aamks.sqlite with latest sim sqlite and Vis (possible conflicts?)
            new_sql_path = os.path.join(os.environ['AAMKS_PROJECT'], f"aamks_{sim_id}.sqlite")
            os.replace(new_sql_path, os.path.join(os.environ['AAMKS_PROJECT'], "aamks.sqlite"))
            Vis({'highlight_geom': None, 'anim': None, 'title': "OnEnd()", 'srv': 1})
            return
        self.json=Json()
        self.uprefs=GetUserPrefs()
        self.conf=self.json.read("{}/conf.json".format(os.environ['AAMKS_PROJECT']))
        self.s=Sqlite("{}/aamks.sqlite".format(os.environ['AAMKS_PROJECT']))
        self.p=Psql()
        self.project_id=self.conf['project_id']
        self.scenario_id=self.conf['scenario_id']
        if self.uprefs.get_var('navmesh_debug')==1:
            logger.debug('start _test_navmesh()')
            # self._test_navmesh()
        Vis({'highlight_geom': None, 'anim': None, 'title': "OnEnd()", 'srv': 1})
        logger.debug('start _register_works()')
        self._register_works()
        self.s.close()
# }}}
    def _test_navmesh(self):# {{{
        navs={}
        for floor in self.json.readdb('floors_meta').keys():
            z=self.s.query("SELECT name FROM aamks_geom WHERE floor=? AND room_enter='no'", (floor,))
            bypass_rooms=[]
            for i in z:
                bypass_rooms.append(i['name'])
            navs[tuple(bypass_rooms)]=Navmesh()
            navs[tuple(bypass_rooms)].build(floor,bypass_rooms)
            navs[tuple(bypass_rooms)].test()
# }}}
    def _register_works(self):# {{{
        ''' 
        We only register works. The works will be run by workers registered via
        manager. 
        '''

        si=SimIterations(self.project_id, self.scenario_id, self.conf['number_of_simulations'])
        animations_number = self.conf['animations_number']
        logger.info(f"run job {os.environ['AAMKS_WORKER']}")
        if os.environ['AAMKS_WORKER']=='none':
            return

        if os.environ['AAMKS_WORKER']=='local':
            os.chdir("{}/evac".format(os.environ['AAMKS_PATH']))
            for i in range(*si.get()):
                job_id=datetime.datetime.now().strftime("%Y%m%d")+f"-iter-{i}"
                if animations_number > 0:
                    is_anim = 1
                    animations_number -= 1
                else:
                    is_anim = 0
                self.p.query(f"UPDATE simulations SET job_id='{job_id}', is_anim={is_anim} WHERE project={self.project_id} AND scenario_id={self.scenario_id} AND iteration={i}")
                logger.info('start worker.py sim - %s', i)
                exit_status = subprocess.run(["{}/env/bin/python3".format(os.environ['AAMKS_PATH']), "worker.py", "{}/workers/{}".format(os.environ['AAMKS_PROJECT'], i)])
                if exit_status.returncode != 0:
                    logger.error('worker exit status - %s', exit_status)
                else:
                    logger.info('finished worker.py sim - %s', i)
            return

        if os.environ['AAMKS_WORKER']=='gearman':
            try:
                for i in range(*si.get()):
                    if animations_number > 0:
                        is_anim = 1
                        animations_number -= 1
                    else:
                        is_anim = 0
                    self.p.query(f"UPDATE simulations SET is_anim={is_anim} WHERE project={self.project_id} AND scenario_id={self.scenario_id} AND iteration={i}")
                    worker="{}/workers/{}".format(os.environ['AAMKS_PROJECT'],i)
                    worker = worker.replace("/home","/mnt")
                    gearman=["gearman", "-v",  "-b", "-f", "aRun", worker]
                    job_id = subprocess.check_output(gearman, universal_newlines=True)
                    job_id = job_id.split('Task created: ')[-1][:-1]
                    self.p.query(f"UPDATE simulations SET job_id='{job_id}' WHERE project={self.project_id} AND scenario_id={self.scenario_id} AND iteration={i}")
                    logger.info(f'send {gearman}')

            except Exception as e:
                print('OnEnd: {}'.format(e))
                logger.error(f'gearman error {e}')


        if os.environ['AAMKS_WORKER']=='redis':
            from redis_aamks.app.main import AARedis
            AR = AARedis()
            try:
                for i in range(*si.get()):
                    if animations_number > 0:
                        is_anim = 1
                        animations_number -= 1
                    else:
                        is_anim = 0
                    self.p.query(f"UPDATE simulations SET is_anim={is_anim} WHERE project={self.project_id} AND scenario_id={self.scenario_id} AND iteration={i}")
                    worker_pwd="{}/workers/{}".format(os.environ['AAMKS_PROJECT'],i)
                    messege_redis = AR.main(worker_pwd)
                    job_id = messege_redis['id']
                    self.p.query(f"UPDATE simulations SET job_id='{job_id}' WHERE project={self.project_id} AND scenario_id={self.scenario_id} AND iteration={i}")
            except Exception as e:
                print('OnEnd: {}'.format(e))
                logger.error(f'OnEnd: Error {e}')

# }}}
