import os 
import sys
import json
from subprocess import Popen,PIPE
sys.path.append(os.environ['AAMKS_PATH'])
from include import Json
from include import Sqlite
from include import SendMessage
from collections import OrderedDict
import traceback

try:
    class ResultsCollector():
        def __init__(self, host, json_file, sim_id, floor):# {{{
            '''
            1. aamksrun makes gearman pass these jobs to workers: 
                /usr/local/aamks/tests/worker.py
            2. Worker calls gearman server aOut function
            3. This file implements gearman's aOut function:
                * download results.json with configuration to workers/123/report_123.json
                * download animation.zip to workers/123/anim.zip
            '''
            self.host=host
            self.json_file=json_file
            self.sim_id=sim_id
            self.floor=floor

            self._dest_dir="{}/workers/{}".format(os.environ['AAMKS_PROJECT'], self.sim_id)
            self._dest_json="{}/report.json".format(self._dest_dir)
            self.json=Json()
            self._results_json()
            self._animation()
# }}}
        def _results_json(self):# {{{
            Popen(["scp", "{}:{}".format(self.host, self.json_file), self._dest_json]).wait()
# }}}
        def _fire_origin_coords(self, sim_id):# {{{
            data=self.json.read("{}/workers/{}/evac.json".format(os.environ['AAMKS_PROJECT'], sim_id))
            room=data['GENERAL']['ROOM_OF_FIRE_ORIGIN']
            
            self.s=Sqlite("{}/aamks.sqlite".format(os.environ['AAMKS_PROJECT']))
            z=self.s.query("SELECT center_x, center_y FROM aamks_geom WHERE name=?", (room,))[0]
            return (z['center_x'], z['center_y'])
# }}}
        def _animation(self):# {{{
            data=self.json.read(self._dest_json)
            Popen(["scp", "{}:{}".format(self.host, data['animation']), "{}/anim.zip".format(self._dest_dir)])

            self.jsonOut=OrderedDict()
            self.jsonOut['sort_id']=int(sim_id)
            self.jsonOut['title']="sim{}, f{}".format(data['sim_id'], self.floor)
            self.jsonOut['floor']=self.floor
            self.jsonOut['fire_origin']=self._fire_origin_coords(data['sim_id'])
            self.jsonOut['highlight_geom']=None
            self.jsonOut['anim']="{}".format(data['sim_id'])

            anims_master="{}/workers/vis/anims.json".format(os.environ['AAMKS_PROJECT'])
            try:
                z=self.json.read(anims_master)
            except:
                z=[]
            z.append(self.jsonOut)
            self.json.write(z, anims_master)
# }}}

    try:
        host=sys.argv[1]
        json_file=sys.argv[2]
        sim_id=sys.argv[3]
        floor=sys.argv[4]
    except:
        ''' Testing without gearman. Make sure workers/1/ exist and contains evac and cfast jsons. '''
        j=Json()
        c=j.read("{}/conf_aamks.json".format(os.environ['AAMKS_PROJECT']))
        host="localhost"
        json_file="/home/aamks/{}/report_1.json".format(c['GENERAL']['PROJECT_NAME'])
        sim_id="1"
        floor="1"

    ResultsCollector(host,json_file,sim_id,floor)

except:
    t="In results_collector.py:\n"
    t+=traceback.format_exc()
    SendMessage(t)
    raise Exception("worker fail")
