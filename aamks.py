import locale
import os
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

os.environ['AAMKS_PROJECT']='/home/aamks_users/mimoohowy@gmail.com/demo/navmesh'
OnInit()
CFASTimporter()
FDSimporter()
World2d()
Obstacles()
CfastPartition() 
CfastMcarlo()
EvacMcarlo()
OnEnd()
