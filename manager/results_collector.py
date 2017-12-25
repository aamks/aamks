import os 
import sys
from subprocess import Popen,PIPE
sys.path.append(os.environ['AAMKS_PATH'])
from include import Json
from include import Sqlite
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
    def _fire_origin_coords(self, sim_id):# {{{
        data=self.json.read("{}/workers/{}/evac.json".format(os.environ['AAMKS_PROJECT'], sim_id))
        room=data['GENERAL']['ROOM_OF_FIRE_ORIGIN']
        
        self.s=Sqlite("{}/aamks.sqlite".format(os.environ['AAMKS_PROJECT']))
        z=self.s.query("SELECT center_x, center_y FROM aamks_geom WHERE name=?", (room,))[0]
        return (z['center_x'], z['center_y'])
# }}}
    def _animation(self):# {{{
        data=self.json.read(self._json_file)
        Popen(["scp", "{}:{}".format(sys.argv[1], data['animation']), self._dest_dir])

        self.jsonOut=OrderedDict()
        self.jsonOut['title']=data['sim_id']
        self.jsonOut['geom_json']='floor_1.json'
        self.jsonOut['anim_json']="../{}.anim.zip".format(data['sim_id'])
        self.jsonOut['fire_origin']=self._fire_origin_coords(data['sim_id'])
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
