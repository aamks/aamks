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

from schody import Queue 
#s.query("select count(name), min(x0), max(x1) from world2d where name LIKE 's4|%'")[0].values()
#s.query("select y0, y1 from world2d where name LIKE 's4|1'")[0].values()

class Prepare_queues:

    def __init__(self, floors=3, number_queues=3, width=1000, height=1000):
        self.floors = floors
        self.number_queues = number_queues
        self.width = width
        self.height = height
        self.lenght = (self.width**2+self.height**2)**(1/2)
        self.size = int((self.width+self.lenght)/50)

    def create_queues(self):
        que = []
        for i in range(self.number_queues):
            que.append(Queue(i, self.floors, self.size))
        return que


    def create_floor_positions(self,floor=0, offset=0):
        positions = []
        sin_alfa = self.height/self.lenght
        cos_alfa = self.width/self.lenght
        lenght_steps = (self.width+self.lenght)/self.size
        for i in range(self.size):
            l = i*lenght_steps
            x = offset+l*cos_alfa
            y = floor*self.height+l*sin_alfa
            if l>self.lenght:
                x = offset+lenght_steps*(self.size-i)
                y = floor*self.height+self.height
            positions.append((x,y))
        return positions

    def create_positions(self, offset=0):
        positions = []
        for i in range(self.floors):
            positions.extend(self.create_floor_positions(floor=i, offset=offset))
        for i in positions:
            print(i)
        #return positions

A = Prepare_queues()
A.size = 5
q = A.create_queues()
print(q, q[0].floor, q[0].floor_space)
A.create_positions()

class EvacEnv:
    def __init__(self):# {{{
        self.que = create_queues()
        self.json=Json()
        self.s=Sqlite("{}/aamks.sqlite".format(os.environ['AAMKS_PROJECT']))
        self.evacuee_radius=self.json.read("{}/inc.json".format(os.environ['AAMKS_PATH']))['evacueeRadius']
        time=1
        #self.sim rvo2.PyRVOSimulator TIME_STEP , NEIGHBOR_DISTANCE , MAX_NEIGHBOR , TIME_HORIZON , TIME_HORIZON_OBSTACLE , RADIUS , MAX_SPEED
        self.sim=rvo2.PyRVOSimulator(time,40,5,time,time,self.evacuee_radius,30)
        self.door1='d11'
        self.door2=(6100,2100)
        self._create_teleports()
        self._create_agents()
        self._load_obstacles()
        self._anim={"simulation_id": 1, "simulation_time": 20, "time_shift": 0, "animations": { "evacuees": [], "rooms_opacity": [] }}
        self._run()
        self._write_zip()
        Vis({'highlight_geom': None, 'anim': '1/f1.zip', 'title': 'x', 'srv': 1})

# }}}
    def _create_teleports(self):# {{{
        '''
        TODO: non-multifloor stairacases cause the need to try/except here. 
        geom.py should handle sX.Y naming better.
        '''
        self._teleport_from={}
        for i in self.s.query("SELECT name,center_x,center_y,vent_to_name  FROM world2d WHERE vent_to_name LIKE 's%'"):
            target=i['vent_to_name'].replace(".", "|")
            tt=self.s.query("SELECT x0,y0 FROM world2d WHERE name=?", (target,))
            try:
                #self._teleport_from[(i['name'], (i['center_x'], i['center_y']), i['vent_to_name'])]=(target, (tt[0]['x0'], tt[0]['y0']))
                self._teleport_from[i['name']]=(target, (tt[0]['x0']+self.evacuee_radius*2, tt[0]['y0']+self.evacuee_radius*2))
            except:
                pass
        #dd(self._teleport_from)
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
        door=self.s.query("SELECT center_x, center_y  FROM world2d WHERE name=?", (self.door1,))[0]
        z=self.s.query("SELECT * FROM world2d WHERE type_pri='EVACUEE'" )
        self.agents={}
        for i in z:
            aa=i['name']
            self.agents[aa]={}
            ii=self.sim.addAgent((i['x0'],i['y0']))
            self.agents[aa]['name']=aa
            self.agents[aa]['id']=ii
            self.sim.setAgentPrefVelocity(ii, (200,0))
            self.agents[aa]['behaviour']='random'
            self.agents[aa]['target']=(door['center_x'], door['center_y'])
# }}}
    def _load_obstacles(self):# {{{
        obstacles=self.json.readdb('world2d_obstacles')['points']
        for i in obstacles:
            self.sim.addObstacle([ (o[0],o[1]) for o in i[:4] ])
            self.sim.processObstacles()
# }}}
    def _velocity(self,a): # {{{
        x=a['target'][0] - self.sim.getAgentPosition(a['id'])[0]
        y=a['target'][1] - self.sim.getAgentPosition(a['id'])[1]
        if abs(x) + abs(y) < 30:
            if y < 1030:
                pietro = 2
            elif y > 1030 and y < 3400:
                pietro = 1
            else:
                pietro = 0
            self.que.add(pietro, a['id'])
            self.sim.setAgentPosition(a['id'], self._teleport_from[self.door1][1])
            a['target']=self.door2
        else:
            self.sim.setAgentPrefVelocity(a['id'], (x,y))
        
# }}}
    def _update(self):# {{{
        for k,v in self.agents.items():
            self._velocity(self.agents[k])
        self._positions();
# }}}
    def _write_zip(self):# {{{
        d="{}/workers/1".format(os.environ['AAMKS_PROJECT'])

        zf=zipfile.ZipFile("{}/f1.zip".format(d), 'w')
        zf.writestr("anim.json", json.dumps(self._anim))
        zf.close()
# }}}
    def _run(self):# {{{
        for t in range(30):
            self.sim.doStep()
            self._update()
            #print([x for x in self.que.que() if x is not None])
            print(self.que.que())
            self.que.pop()
# }}}

#e=EvacEnv()
