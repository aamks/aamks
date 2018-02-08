import locale
locale.setlocale(locale.LC_ALL, 'en_US.UTF-8')
from manager.init import OnInit, OnEnd
from geom.geom import Geom
from geom.path import Path
from fire.cfast_tessellate import CfastTessellate
from montecarlo.cfast_mcarlo import CfastMcarlo
from montecarlo.evac_mcarlo import EvacMcarlo
from include import SendMessage

SendMessage("Let's go!")
OnInit()
Geom()
Path() # TODO: seems like we should call it elsewhere
CfastTessellate()
CfastMcarlo()
EvacMcarlo()
OnEnd()


# ssh mimooh@duch
# aamks.<example>       # wystarczy raz 
# AA                    # uruchom aamks
# aamks                 # cd /usr/local/aamks
# cd current            # current to taki akrasuski@consultrisk/risk/128/
