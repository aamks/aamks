import os 
import sys
from subprocess import Popen,PIPE
sys.path.append(os.environ['AAMKS_PATH'])
from include import Json
from collections import OrderedDict

class ResultsCollector():
    def __init__(self):# {{{
        '''
        1. aamksrun makes gearman pass these jobs to workers: 
            /usr/local/aamks/tests/worker.py
        2. Worker calls gearman server aOut function
        3. This file implements gearman's aOut function:
            * download results.json with configuration to workers/123/report_123.json
            * download animation.zip to workers/123/123.anim.zip
        '''
        self._dest_dir="{}/workers/{}".format(os.environ['AAMKS_PROJECT'], sys.argv[3])
        self._json_file="{}/report_{}.json".format(self._dest_dir, sys.argv[3])
        self.json=Json()
        self._results_json()
        self._animation()
# }}}
    def _results_json(self):# {{{
        Popen(["scp", "{}:{}".format(sys.argv[1], sys.argv[2]), self._json_file]).wait()
# }}}
    def _animation(self):# {{{
        data=self.json.read(self._json_file)
        #print(["scp", "{}:{}".format(sys.argv[1], data['animation']), self._dest_dir])
        Popen(["scp", "{}:{}".format(sys.argv[1], data['animation']), self._dest_dir])

        self.jsonOut=OrderedDict()
        self.jsonOut['title']=data['sim_id']
        self.jsonOut['geom_json']='floor_1.json'
        self.jsonOut['anim_json']="../{}.anim.zip".format(data['sim_id'])
        self.jsonOut['fire_origin']=[]
        self.jsonOut['highlight_geom']=''
        self.jsonOut['translate']=[0,0]
        self.jsonOut['scale']=1

        anims_master="{}/workers/vis/anims.json".format(os.environ['AAMKS_PROJECT'])
        try:
            z=self.json.read(anims_master)
        except:
            z=[]
        z.append(self.jsonOut)
        self.json.write(z, anims_master)
# }}}


ResultsCollector()
