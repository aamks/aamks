# MODULES {{{
import sys
import re
import os
import shutil
import math
from collections import OrderedDict
import json
import getopt
from pprint import pprint
import codecs
from subprocess import Popen,call
from shapely.geometry import box, Polygon, LineString, Point, MultiPolygon
from shapely.ops import unary_union

from numpy.random import choice
from numpy.random import uniform
from numpy.random import normal
from numpy.random import lognormal
from numpy.random import binomial
from numpy.random import gamma
from numpy.random import triangular
from numpy.random import seed
from numpy import array as npa
from math import sqrt

from include import Sqlite
from include import Json
from include import Dump as dd
from include import SimIterations
from scipy.stats.distributions import lognorm

# }}}

class EvacMcarlo():
    def __init__(self):# {{{
        ''' Generate montecarlo evac.conf. '''
        self.json=Json()
        self.conf=self.json.read("{}/conf.json".format(os.environ['AAMKS_PROJECT']))
        self.s=Sqlite("{}/aamks.sqlite".format(os.environ['AAMKS_PROJECT']))
        self.evacuee_radius=self.json.read('{}/inc.json'.format(os.environ['AAMKS_PATH']))['evacueeRadius']
        self.floors=[z['floor'] for z in self.s.query("SELECT DISTINCT floor FROM aamks_geom ORDER BY floor")]
        self._project_name=os.path.basename(os.environ['AAMKS_PROJECT'])

        si=SimIterations(self.conf['project_id'], self.conf['scenario_id'], self.conf['number_of_simulations'])
        sim_ids=range(*si.get())
        for self._sim_id in sim_ids:
            seed(self._sim_id)
            self._fire_obstacle()
            self._static_evac_conf()
            self._dispatch_evacuees()
            self._make_evac_conf()
        self._evacuees_static_animator()

# }}}
    def _static_evac_conf(self):# {{{
        ''' 
        AAMKS_PROJECT must be propagated to worker environment.
        '''

        self._evac_conf=self.conf
        self._evac_conf['AAMKS_PROJECT']=os.environ['AAMKS_PROJECT']
        self._evac_conf['SIM_ID']=self._sim_id
        self._evac_conf['SERVER']=os.environ['AAMKS_SERVER']
        self._evac_conf['FIRE_ORIGIN']=self.s.query("SELECT name FROM fire_origin WHERE sim_id=?", (self._sim_id,))[0]['name']
# }}}
    def _fire_obstacle(self):# {{{
        '''
        Fire Obstacle prevents humans to walk right through the fire. Currently
        we build the rectangle xx * yy around x,y. Perhaps this size could be
        some function of fire properties.
        '''

        xx=150
        yy=150

        z=self.s.query("SELECT * FROM fire_origin") 
        i=z[0]
        points=[ [i['x']-xx, i['y']-yy, 0], [i['x']+xx, i['y']-yy, 0], [i['x']+xx, i['y']+yy, 0], [i['x']-xx, i['y']+yy, 0], [i['x']-xx, i['y']-yy, 0] ]

        obstacles=self.json.readdb("obstacles")
        obstacles['fire']={ i['floor']: points }
        self.s.query("UPDATE obstacles SET json=?", (json.dumps(obstacles),)) 

# }}}
    def _make_pre_evacuation(self,room,type_sec):# {{{
        ''' 
        An evacuee pre_evacuates from either ordinary room or from the room of
        fire origin; type_sec is for future development.
        '''

        if room != self._evac_conf['FIRE_ORIGIN']:
            pe=self.conf['pre_evac']
        else:
            pe=self.conf['pre_evac_fire_origin']
        return round(lognorm(s=1, loc=pe['mean'], scale=pe['sd']).rvs(), 2)
# }}}
    def _get_density(self,name,type_sec,floor):# {{{
        ''' 
        Special selectors from distributions.json
        First we try to return ROOM_1_2, then ROOM_FLOOR_1, then ROOM
        Concentration comes as m^2, but aamks uses 100 * 100 cm^2 
        '''

        z=self.conf['evacuees_concentration']
        for i in [name, "{}_FLOOR_{}".format(type_sec,floor), type_sec]:
            if i in z.keys():
                return z[i] * 100 * 100
        raise Exception("Cannot determine the density for {}".format(name))

# }}}
    def _evac_rooms(self,floor): # {{{
        '''
        * probabilistic: probabilistic rooms
        * manual: manually asigned evacuees 
        '''

        rooms={}
        probabilistic_rooms={}
        for i in self.s.query("SELECT points, name, type_sec FROM aamks_geom WHERE type_pri='COMPA' AND floor=? ORDER BY global_type_id", (floor,)):
            i['points']=json.loads(i['points'])
            probabilistic_rooms[i['name']]=i

        manual_rooms={}
        for i in self.s.query("SELECT name, x0, y0 FROM aamks_geom WHERE type_pri='EVACUEE' AND floor=?", (floor,)):
            q=(floor,i['x0'], i['y0'], i['x0'], i['y0'])
            x=self.s.query("SELECT name,type_sec FROM aamks_geom WHERE type_pri='COMPA' AND floor=? AND x0<=? AND y0<=? AND x1>=? AND y1>=?", q)[0]
            if not x['name'] in manual_rooms:
                manual_rooms[x['name']]={'type_sec': x['type_sec'], 'positions': [] }
                del probabilistic_rooms[x['name']]
            manual_rooms[x['name']]['positions'].append((i['x0'], i['y0'], x['name']))

        rooms['probabilistic']=probabilistic_rooms
        rooms['manual']=manual_rooms
        return rooms
# }}}
    def _dispatch_evacuees(self):# {{{
        ''' 
        We dispatch the evacuees across the building according to the density
        distribution. 
        '''

        self.dispatched_evacuees=OrderedDict() 
        self.pre_evacuation=OrderedDict() 
        self._make_floor_obstacles()
        for floor in self.floors:
            self.pre_evacuation[floor] = list()
            positions = []
            evac_rooms=self._evac_rooms(floor)
            for name,r in evac_rooms['probabilistic'].items():
                density=self._get_density(r['name'],r['type_sec'],floor)
                room_positions=self._dispatch_inside_polygons(density,r['points'], floor, name)
                positions += room_positions
                for i in room_positions:
                    self.pre_evacuation[floor].append(self._make_pre_evacuation(r['name'], r['type_sec']))
            for name,r in evac_rooms['manual'].items():
                positions += r['positions']
                for i in r['positions']:
                    self.pre_evacuation[floor].append(self._make_pre_evacuation(name, r['type_sec']))
            self.dispatched_evacuees[floor] = positions
# }}}
    def _make_floor_obstacles(self):# {{{
        self._floor_obstacles={}
        for floor in self.floors:
            obsts=[]
            for x in self.json.readdb("obstacles")['obstacles'][floor]:
                obsts.append([(o[0],o[1]) for o in x])
            try:
                obsts.append(self.json.readdb("obstacles")['fire'][floor])
            except:
                pass
            self._floor_obstacles[floor]=unary_union([ Polygon(i) for i in obsts ])
# }}}
    def _dispatch_inside_polygons(self,density,points,floor,name):# {{{
        exterior=Polygon(points)
        exterior_minus_obsts=exterior.difference(self._floor_obstacles[floor])
        walkable=exterior_minus_obsts.buffer(- self.evacuee_radius - 10 )

        bbox=list(walkable.bounds)
        target=int(walkable.area / density)
        positions=[]
        while len(positions) < target:
            x=uniform(bbox[0], bbox[2])
            y=uniform(bbox[1], bbox[3])
            if walkable.intersects(Point(x,y)):
                positions.append((int(x),int(y), name))
        return positions
# }}}
    def _make_evac_conf(self):# {{{
        ''' Write data to sim_id/evac.json. '''

        self._evac_conf['FLOORS_DATA']=OrderedDict()
        for floor in self.floors:
            self._evac_conf['FLOORS_DATA'][floor]=OrderedDict()
            self._evac_conf['FLOORS_DATA'][floor]['NUM_OF_EVACUEES']=len(self.dispatched_evacuees[floor])
            self._evac_conf['FLOORS_DATA'][floor]['EVACUEES']=OrderedDict()
            z=self.s.query("SELECT z0 FROM aamks_geom WHERE floor=?", (floor,))[0]['z0']
            for i,pos in enumerate(self.dispatched_evacuees[floor]):
                e_id='f{}'.format(i)
                self._evac_conf['FLOORS_DATA'][floor]['EVACUEES'][e_id]=OrderedDict()
                self._evac_conf['FLOORS_DATA'][floor]['EVACUEES'][e_id]['ORIGIN']         = (pos[0], pos[1])
                self._evac_conf['FLOORS_DATA'][floor]['EVACUEES'][e_id]['COMPA']          = (pos[2])
                self._evac_conf['FLOORS_DATA'][floor]['EVACUEES'][e_id]['PRE_EVACUATION'] = self.pre_evacuation[floor][i]

                self._evac_conf['FLOORS_DATA'][floor]['EVACUEES'][e_id]['ALPHA_V']        = round(normal(self.conf['evacuees_alpha_v']['mean']     , self.conf['evacuees_alpha_v']['sd'])     , 2)
                self._evac_conf['FLOORS_DATA'][floor]['EVACUEES'][e_id]['BETA_V']         = round(normal(self.conf['evacuees_beta_v']['mean']      , self.conf['evacuees_beta_v']['sd'])      , 2)
                self._evac_conf['FLOORS_DATA'][floor]['EVACUEES'][e_id]['H_SPEED']        = round(normal(self.conf['evacuees_max_h_speed']['mean'] , self.conf['evacuees_max_h_speed']['sd']) , 2)
                self._evac_conf['FLOORS_DATA'][floor]['EVACUEES'][e_id]['V_SPEED']        = round(normal(self.conf['evacuees_max_v_speed']['mean'] , self.conf['evacuees_max_v_speed']['sd']) , 2)

        self.json.write(self._evac_conf, "{}/workers/{}/evac.json".format(os.environ['AAMKS_PROJECT'],self._sim_id))
# }}}
    def _evacuees_static_animator(self):# {{{
        ''' 
        For the animator. We just pick a single, newest sim_id and display
        evacuees init positions. Animator can use it when there are no worker
        provided animations (moving evacuees for specific sim_id). 

        '''

        m={}
        for floor in self.floors:
            m[floor]=self.dispatched_evacuees[floor]
        self.s.query('INSERT INTO dispatched_evacuees VALUES (?)', (json.dumps(m),))
        
# }}}

# }}}
