import datetime
import os
import subprocess
import logging
from include import Json, Psql, Sqlite, SimIterations, Vis, GetUserPrefs
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
        if not sim_id:
            si = SimIterations(self.project_id, self.scenario_id, self.conf['number_of_simulations'])
            self.irange = si.get()
            si.insert(self.conf['number_of_simulations'])
        else:
            self.irange = [sim_id, sim_id+1]
        self._setup_simulations()
# }}}
    def _setup_simulations(self):# {{{
        ''' Simulation dir maps to id from psql's simulations table'''

        workers_dir="{}/workers".format(os.environ['AAMKS_PROJECT']) 
        os.makedirs(workers_dir, mode = 0o777, exist_ok=True)

        for i in range(*self.irange):
            sim_dir="{}/{}".format(workers_dir,i)
            os.makedirs(sim_dir, mode=0o777, exist_ok=True)
# }}}

class OnEnd():
    def __init__(self, sim_id=None):# {{{
        ''' Stuff that happens at the end of the project '''
        logger.info('start OnEnd()')
        new_sql_path = os.path.join(os.environ['AAMKS_PROJECT'], "workers", f"{sim_id}", f"aamks_{sim_id}.sqlite")
        if sim_id:
            # works will be registered as slurm array by slurm.py
            # nothing to do except for updating aamks.sqlite with latest sim sqlite and Vis (possible conflicts?)
            Vis({'highlight_geom': None, 'anim': None, 'title': "OnEnd()", 'srv': 1, "sql": new_sql_path})
            return
        if os.path.exists(new_sql_path):
            self.s=Sqlite(new_sql_path)
        else:
            self.s=Sqlite("{}/aamks.sqlite".format(os.environ['AAMKS_PROJECT']))
        self.json=Json()
        self.uprefs=GetUserPrefs()
        self.conf=self.json.read("{}/conf.json".format(os.environ['AAMKS_PROJECT']))
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
        logger.info(f"run job {os.environ['AAMKS_WORKER']}")
        if os.environ['AAMKS_WORKER']=='none':
            return

        if os.environ['AAMKS_WORKER']=='local':
            os.chdir("{}/evac".format(os.environ['AAMKS_PATH']))
            for i in range(*si.get()):
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
                    worker_pwd="{}/workers/{}".format(os.environ['AAMKS_PROJECT'],i)
                    messege_redis = AR.main(worker_pwd)
                    job_id = messege_redis['id']
                    self.p.query(f"UPDATE simulations SET job_id='{job_id}' WHERE project={self.project_id} AND scenario_id={self.scenario_id} AND iteration={i}")
            except Exception as e:
                print('OnEnd: {}'.format(e))
                logger.error(f'OnEnd: Error {e}')

# }}}
