# MODULES {{{
import warnings
warnings.simplefilter('ignore', RuntimeWarning)
import rvo2
import json
import shutil
import os
import io
import re
import sys
import codecs
import itertools
import zipfile

from pprint import pprint
from collections import OrderedDict
from numpy.random import uniform
from math import sqrt
from include import Sqlite
from include import Json
from include import Dump as dd
from include import Vis
from numpy.random import uniform
# }}}

class EvacEnv:
    def __init__(self):# {{{
        self.json=Json()
        self.s=Sqlite("{}/aamks.sqlite".format(os.environ['AAMKS_PROJECT']))

        radius=self.json.read("{}/inc.json".format(os.environ['AAMKS_PATH']))['evacueeRadius']
        time=1
        #self.sim rvo2.PyRVOSimulator TIME_STEP , NEIGHBOR_DISTANCE , MAX_NEIGHBOR , TIME_HORIZON , TIME_HORIZON_OBSTACLE , RADIUS , MAX_SPEED
        self.sim = rvo2.PyRVOSimulator(time     , 40                , 5            , time         , time                  , radius , 30)
        self._create_agents()
        self._load_obstacles()
        self._anim={"simulation_id": 1, "simulation_time": 20, "time_shift": 0, "animations": { "evacuees": [], "rooms_opacity": [] }}
        self._run()
        self._write_zip()
        Vis({'highlight_geom': None, 'anim': '1/f1.zip', 'title': 'x', 'srv': 1})

# }}}
    def _positions(self):# {{{
        frame=[]
        for k,v in self.agents.items():
            pos=[round(i) for i in self.sim.getAgentPosition(v['id'])]
            frame.append([pos[0],pos[1],0,0,"N",1])
            #print(k,",t:", self.sim.getGlobalTime(), ",pos:", pos, ",v:", [ round(i) for i in self.sim.getAgentVelocity(v['id'])])
        self._anim["animations"]["evacuees"].append(frame)
# }}}
    def _create_agents(self):# {{{
        door=self.s.query("SELECT center_x, center_y  FROM world2d WHERE name='d12'")[0]
        z=self.s.query("SELECT * FROM world2d WHERE type_pri='EVACUEE'" )
        self.agents={}
        for i in z:
            aa=i['name']
            self.agents[aa]={}
            ii=self.sim.addAgent((i['x0'],i['y0']))
            self.agents[aa]['id']=ii
            self.sim.setAgentPrefVelocity(ii, (200,0))
            self.agents[aa]['behaviour']='random'
            self.agents[aa]['target']=(door['center_x'], door['center_y'])
# }}}
    def _load_obstacles(self):# {{{
        #obstacles=self.json.readdb('world2d_obstacles')['points']
        obstacles=self.json.readdb('obstacles')['points']["0"]
        for i in obstacles:
            self.sim.addObstacle([ (o[0],o[1]) for o in i[:4] ])
            self.sim.processObstacles()
# }}}
    def _update_velocity(self,a): # {{{
        x=a['target'][0] - self.sim.getAgentPosition(a['id'])[0]
        y=a['target'][1] - self.sim.getAgentPosition(a['id'])[1]
        self.sim.setAgentPrefVelocity(a['id'], (x,y))
# }}}
    def _update(self):# {{{
        for k,v in self.agents.items():
            self._update_velocity(self.agents[k])
        self._positions();
# }}}
    def _write_zip(self):# {{{
        d="{}/workers/1".format(os.environ['AAMKS_PROJECT'])

        zf=zipfile.ZipFile("{}/f1.zip".format(d), 'w')
        zf.writestr("anim.json", json.dumps(self._anim))
        zf.close()
# }}}
    def _run(self):# {{{
        for t in range(100):
            self.sim.doStep()
            self._update()
# }}}

e=EvacEnv()
