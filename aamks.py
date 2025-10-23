import locale
import os
import sys
import logging
#locale.setlocale(locale.LC_ALL, 'en_US.UTF-8')

from manager.init import OnInit, OnEnd
from geom.cfast_importer import CFASTimporter
from geom.world2d import World2d
from geom.obstacles import Obstacles
from fire.cfast_partition import CfastPartition
from fire.partition_query import PartitionQuery
from montecarlo.cfast_mcarlo import CfastMcarlo
from montecarlo.evac_mcarlo import EvacMcarlo
from include import SimIterations, Json
from evac.worker import Worker

def prepare_logger(path):
    log_file = path + '/aamks.log' if path else os.getenv('AAMKS_PROJECT') + '/aamks.log'
    logger = logging.getLogger('AAMKS')
    logger.setLevel(logging.DEBUG)
    log_dir = os.path.dirname(log_file)
    os.makedirs(log_dir, exist_ok=True)
    fh = logging.FileHandler(log_file)
    fh.setLevel(logging.DEBUG)
    ch = logging.StreamHandler()
    ch.setLevel(logging.INFO)
    formatter = logging.Formatter('%(asctime)s - %(name)-14s - %(levelname)s - %(message)s')
    fh.setFormatter(formatter)
    ch.setFormatter(formatter)
    logger.addHandler(fh)
    logger.addHandler(ch)
    return logger

def start_aamks(path, user_id):
    os.environ["AAMKS_PROJECT"] = path
    os.environ["AAMKS_USER_ID"] = user_id
    # for local testing:
    # path = '/home/aamks_users/majster1020@wp.pl/testtttt/tptest'
    # os.environ["AAMKS_PROJECT"] = '/home/aamks_users/majster1020@wp.pl/testtttt/tptest'

    logger = prepare_logger(path) if not logging.getLogger('AAMKS').hasHandlers() else logging.getLogger('AAMKS')

    logger.info('calling OnInit()')
    sim_range = OnInit().get_irange()
    logger.info('finished OnInit()')
    for sim_id in range(*sim_range):
        start_aamks_with_worker(path, user_id, sim_id)
   
def start_aamks_with_worker(path: str, user_id: str, sim_id: str):
    os.environ["AAMKS_PROJECT"] = path
    os.environ["AAMKS_USER_ID"] = user_id
    sim_id = int(sim_id)

    logger = prepare_logger(path) if not logging.getLogger('AAMKS').hasHandlers() else logging.getLogger('AAMKS')

    logger.info('calling OnInit()')
    OnInit(sim_id)
    logger.info('finished OnInit()')
    
    logger.info('calling CFASTimporter()')
    CFASTimporter(sim_id)
    logger.info('finished CFASTimporter()')

    logger.info('calling World2d()')
    World2d(sim_id)
    logger.info('finished World2d()')

    logger.info('calling Obstacles()')
    Obstacles(sim_id)
    logger.info('finished Obstacles()')

    logger.info('calling CfastPartition()')
    CfastPartition(sim_id)
    logger.info('finished CfastPartition()')

    logger.info('calling CfastMcarlo()')
    cfast_mc = CfastMcarlo(sim_id)
    logger.info('finished CfastMcarlo()')

    logger.info('calling cfast_mc.do_iterations()')
    cfast_mc.do_iterations()
    logger.info('finished cfast_mc.do_iterations()')

    logger.info('calling EvacMcarlo()')
    evac_mc = EvacMcarlo(sim_id)
    logger.info('finished EvacMcarlo()')

    logger.info('calling evac_mc.do_iterations()')
    evac_mc.do_iterations()
    logger.info('finished evac_mc.do_iterations()')

    logger.info(f'sim {sim_id} prepared successfully. Launching...')

    logger.info('calling evac.Worker')
    w = Worker(redis_worker_pwd=os.path.join(path, "workers", str(sim_id)))
    status = w.run_worker()
    logger.info('finished evac.Worker')
    
    logger.info('calling OnEnd()')
    OnEnd(sim_id)
    logger.info('finished OnEnd()')

    logger.info(f'sim {sim_id} finished with status {status}')


if __name__ == '__main__':
    if os.environ["AAMKS_WORKER"] == 'slurm' or os.environ["AAMKS_WORKER"] == 'redis':
        start_aamks_with_worker(*sys.argv[1:])
    else:
        if len(sys.argv) > 2:
            os.environ["AAMKS_PROJECT"]=sys.argv[1]
            os.environ["AAMKS_USER_ID"]=sys.argv[2]
            start_aamks(sys.argv[1], sys.argv[2])
        elif len(sys.argv) > 1:
            os.environ["AAMKS_PROJECT"]=sys.argv[1]
            start_aamks(sys.argv[1], os.environ['AAMKS_USER_ID'])
        else:
            start_aamks(os.environ['AAMKS_PROJECT'], os.environ['AAMKS_USER_ID'])
