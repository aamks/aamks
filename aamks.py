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
from include import SendMessage
from include import SimIterations
from include import Json

#os.environ['AAMKS_PROJECT']='/home/aamks_users/mimoohowy@gmail.com/demo/navmesh'
json = Json()
if len(sys.argv) > 1:
    conf = json.read("{}/conf.json".format(sys.argv[1]))
else:
    conf = json.read("{}/conf.json".format(os.environ['AAMKS_PROJECT']))
##
OnInit()
CFASTimporter()
FDSimporter()
World2d()
Obstacles()
CfastPartition()

si = SimIterations(conf['project_id'], conf['scenario_id'], conf['number_of_simulations'])
for sim_id in range(*si.get()):
    cfast_mc = CfastMcarlo(sim_id)
    cfast_mc.do_iterations()
EvacMcarlo()
OnEnd()
