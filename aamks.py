# sudo apt-get install python3-pip python3-shapely python3-numpy python3-networkx python3-psycopg2 gearman; sudo -H pip3 install webcolors pyhull 

import locale
locale.setlocale(locale.LC_ALL, 'en_US.UTF-8')
from manager.init import OnInit, OnEnd
from geom.geom import Geom
from geom.path import Path
from fire.cfast_tessellate import CfastTessellate
from fire.smoke_query import SmokeQuery
from montecarlo.cfast_mcarlo import CfastMcarlo
from montecarlo.evac_mcarlo import EvacMcarlo

OnInit()
Geom()

Path()
#CfastTessellate()
#SmokeQuery()

CfastMcarlo()
EvacMcarlo()
OnEnd()
