import locale
import os
import sys
locale.setlocale(locale.LC_ALL, 'en_US.UTF-8')
from manager.init import OnInit, OnEnd
from geom.cfast_importer import CFASTimporter
from geom.fds_importer import FDSimporter
from geom.world2d import World2d
from geom.obstacles import Obstacles
from fire.cfast_partition import CfastPartition
from fire.partition_query import PartitionQuery
from montecarlo.cfast_mcarlo import CfastMcarlo
from montecarlo.evac_mcarlo import EvacMcarlo
from include import SimIterations
from include import Json
import logging

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

def start_aamks(path):
    logger = prepare_logger(path) if not logging.getLogger('AAMKS').hasHandlers() else logging.getLogger('AAMKS')
    json = Json()
    if path:
        conf = json.read("{}/conf.json".format(path))
    else:
        conf = json.read("{}/conf.json".format(os.environ['AAMKS_PROJECT']))
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
    EvacMcarlo()
    logger.info('finished EvacMcarlo()')
    logger.info('calling OnEnd()')
    OnEnd()
    logger.info('finished OnEnd()')
    logger.info('AAMKS application finished successfully')
        

if __name__ == '__main__':
    start_aamks(sys.argv[1])
