import locale
locale.setlocale(locale.LC_ALL, 'en_US.UTF-8')
from manager.init import OnInit, OnEnd
from geom.geom import Geom
from geom.world2d import World2d
from geom.obstacles import Obstacles
from fire.cfast_partition import CfastPartition
from fire.smoke_query import SmokeQuery
from montecarlo.cfast_mcarlo import CfastMcarlo
from montecarlo.evac_mcarlo import EvacMcarlo
from include import SendMessage

OnInit()
Geom()
World2d()
Obstacles()
CfastPartition(0) # 1 enabled debugging
CfastMcarlo()
EvacMcarlo()
#z=SmokeQuery("0")
#z.get_final_vars() 
OnEnd()
