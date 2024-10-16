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
    json = Json()
    conf = json.read("{}/conf.json".format(path))
    logger = prepare_logger(path) if not logging.getLogger('AAMKS').hasHandlers() else logging.getLogger('AAMKS')

    logger.warning('Start AAMKS application. Read conf.json')
    logger.info('calling OnInit()')
    OnInit()
    logger.info('finished OnInit()')
    logger.info('calling CFASTimporter()')
    CFASTimporter()
    logger.info('finished CFASTimporter()')
    logger.info('calling World2d()')
    World2d()
    logger.info('finished World2d()')
    logger.info('calling Obstacles()')
    Obstacles()
    logger.info('finished Obstacles()')
    logger.info('calling CfastPartition()')
    CfastPartition()
    logger.info('finished CfastPartition()')

    si = SimIterations(conf['project_id'], conf['scenario_id'], conf['number_of_simulations'])
    for sim_id in range(*si.get()):
        logger.info('calling CfastMcarlo() - sim %s', sim_id)
        cfast_mc = CfastMcarlo(sim_id)
        logger.info('finished CfastMcarlo() - sim %s', sim_id)
        logger.info('calling cfast_mc.do_iterations()')
        cfast_mc.do_iterations()
        logger.info('finished cfast_mc.do_iterations()')
        logger.info('calling EvacMcarlo()')
        evac_mc = EvacMcarlo(sim_id)
        logger.info('finished EvacMcarlo()')
        logger.info('calling evac_mc.do_iterations()')
        evac_mc.do_iterations()
        logger.info('finished evac_mc.do_iterations()')
    logger.info('calling OnEnd()')
    OnEnd()
    logger.info('finished OnEnd()')
    logger.info('AAMKS application finished successfully')


def start_aamks_with_slurm(path: str, user_id: int, sim_id: int):
    os.environ["AAMKS_PROJECT"] = path
    os.environ["AAMKS_USER_ID"] = user_id
    json = Json()
    conf = json.read("{}/conf.json".format(path))
    logger = prepare_logger(path) if not logging.getLogger('AAMKS').hasHandlers() else logging.getLogger('AAMKS')

    logger.warning(f'Preparing {sim_id} - conf.json imported')
    logger.info('calling OnInit()')
    OnInit(sim_id=sim_id)
    logger.info('finished OnInit()')
    
    logger.info('calling CFASTimporter()')
    CFASTimporter(sim_id=sim_id)
    logger.info('finished CFASTimporter()')

    logger.info('calling World2d()')
    World2d(sim_id=sim_id)
    logger.info('finished World2d()')

    logger.info('calling Obstacles()')
    Obstacles(sim_id=sim_id)
    logger.info('finished Obstacles()')

    logger.info('calling CfastPartition()')
    CfastPartition(sim_id=sim_id)
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

    logger.info(f'{sim_id} prepared successfully. Launching...')

    logger.info('calling evac.Worker')
    w = Worker(redis_worker_pwd=os.path.join(path, "workers", sim_id))
    status = w.run_worker()
    logger.info('finished evac.Worker')
    
    logger.info('calling OnEnd()')
    OnEnd(sim_id=sim_id)
    logger.info('finished OnEnd()')

    logger.info(f'{sim_id} finished with status {status}')


if __name__ == '__main__':
    if os.environ["AAMKS_WORKER"] == 'slurm':
        start_aamks_with_slurm(*sys.argv[1:])
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
