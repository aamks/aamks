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
            si.insert(self.conf['animations_number'])
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
            logger.info(f'setup {i} simulation')
# }}}
    def get_irange(self):
        return self.irange

class OnEnd():
    def __init__(self, sim_id=None):# {{{
        ''' Stuff that happens at the end of the project '''
        logger.info('start OnEnd()')
        self.sim_id = sim_id
        sim_sql_path = os.path.join(os.environ['AAMKS_PROJECT'], "workers", f"{sim_id}", f"aamks_{sim_id}.sqlite")
        scenario_sql_path = os.path.join(os.environ['AAMKS_PROJECT'],"workers", f"{sim_id}", "aamks_geom.sqlite")
        Vis({'highlight_geom': None, 'anim': None, 'title': "OnEnd()", 'srv': 1, "sim_sql": sim_sql_path, "scen_sql": scenario_sql_path})

        if os.environ['AAMKS_WORKER']=='slurm':
            # works will be registered as slurm array by slurm.py
            # nothing to do except for updating aamks.sqlite with latest sim sqlite and Vis (possible conflicts?)
            return
        self.p=Psql()
        self.json=Json()
        self.conf=self.json.read("{}/conf.json".format(os.environ['AAMKS_PROJECT']))
        self.project_id=self.conf['project_id']
        self.scenario_id=self.conf['scenario_id']
        logger.info('start _register_works()')
        self._register_works()
# }}}

    def _register_works(self):# {{{
        ''' 
        We only register works. The works will be run by workers registered via
        manager. 
        '''

        logger.info(f"run job {os.environ['AAMKS_WORKER']}")
        if os.environ['AAMKS_WORKER']=='none':
            return

        if os.environ['AAMKS_WORKER']=='gearman':
            try:
                worker="{}/workers/{}".format(os.environ['AAMKS_PROJECT'],self.sim_id)
                worker = worker.replace("/home","/mnt")
                gearman=["gearman", "-v",  "-b", "-f", "aRun", worker]
                job_id = subprocess.check_output(gearman, universal_newlines=True)
                job_id = job_id.split('Task created: ')[-1][:-1]
                self.p.query(f"UPDATE simulations SET job_id='{job_id}' WHERE project={self.project_id} AND scenario_id={self.scenario_id} AND iteration={self.sim_id}")
                logger.info(f'send {gearman}')

            except Exception as e:
                print('OnEnd: {}'.format(e))
                logger.error(f'gearman error {e}')

        if os.environ['AAMKS_WORKER']=='redis':
            from redis_aamks.app.main import AARedis
            AR = AARedis()
            try:
                worker_pwd="{}/workers/{}".format(os.environ['AAMKS_PROJECT'],self.sim_id)
                messege_redis = AR.main(worker_pwd)
                job_id = messege_redis['id']
                self.p.query(f"UPDATE simulations SET job_id='{job_id}' WHERE project={self.project_id} AND scenario_id={self.scenario_id} AND iteration={self.sim_id}")
            except Exception as e:
                print('OnEnd: {}'.format(e))
                logger.error(f'OnEnd: Error {e}')

# }}}
