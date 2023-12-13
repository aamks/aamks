# MODULES {{{
import sys
import re
import os
import shutil
import math
import numpy as np
from collections import OrderedDict
import json
import getopt
from pprint import pprint
import codecs
from subprocess import Popen,call
from shapely.geometry import box, Polygon, LineString, Point, MultiPolygon
from shapely.ops import unary_union
import zipfile

from numpy.random import choice
from numpy.random import uniform
from numpy.random import normal
from numpy.random import lognormal
from numpy.random import binomial
from numpy.random import gamma
from numpy.random import triangular
from numpy.random import seed
from numpy import array as npa
from math import sqrt, log, exp

from include import Sqlite
from include import Json
from include import Dump as dd
from include import SimIterations
from include import Vis

from scipy.stats import lognorm
from scipy.optimize import root
from scipy.special import erfc

# }}}
def lognorm_params_from_percentiles(x1, x2, p1=0.01, p2=0.99):
    def equations(vars):
        m, s = vars
        eq1 = 0.5 * erfc(-(log(x1) - m) / (s * sqrt(2))) - p1
        eq2 = 0.5 * erfc(-(log(x2) - m) / (s * sqrt(2))) - p2
        return [eq1, eq2]

    results =  root(equations, (0, 0.1))
    if not results.success:
        raise RuntimeError(f'Numerical solution of lognormal distribution parameters failed.\n{params.message}')

    return results.x


def lognorm_percentiles_from_params(mu, sigma, p1=0.01, p2=0.99):
    dist = lognorm(scale=math.exp(mu), s=sigma)
    return [dist.ppf(p) for p in [p1, p2]]


class EvacMcarlo():
    def __init__(self):# {{{
        ''' Generate montecarlo evac.conf. '''

        self.s=Sqlite("{}/aamks.sqlite".format(os.environ['AAMKS_PROJECT']))
        self.json=Json()
        self.conf=self.json.read("{}/conf.json".format(os.environ['AAMKS_PROJECT']))
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
        self.s.close()

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

        xx=50
        yy=50

        z=self.s.query("SELECT * FROM fire_origin") 
        i=z[0]
        points=[ [i['x']-xx, i['y']-yy, 0], [i['x']+xx, i['y']-yy, 0], [i['x']+xx, i['y']+yy, 0], [i['x']-xx, i['y']+yy, 0], [i['x']-xx, i['y']-yy, 0] ]

        obstacles=self.json.readdb("obstacles")
        obstacles['fire']={ i['floor']: points }
        self.s.query("UPDATE obstacles SET json=?", (json.dumps(obstacles),)) 

# }}}
    def _get_alarming_time(self):
        return round(normal(loc=self.conf['alarming']['mean'], scale=self.conf['alarming']['sd']), 2)

    def _make_pre_evacuation(self,room,type_sec):# {{{
        ''' 
        Get values for both cases (once there is enough smoke in the room other than fire origin's,
        agents should start to behave like they actually are in the room of fire origin though).
        '''

        pre_evacs = {'pre_evac': None, 'pre_evac_fire_origin': None}
        for room_type in ['pre_evac', 'pre_evac_fire_origin']:
            pe = self.conf[room_type]
            if pe['mean'] and pe['sd']:
                # if distribution parameters are given
                params = [pe[i] for i in ['mean', 'sd']]
            elif pe['1st'] and pe['99th']:
                # if percentiles are given
                params = lognorm_params_from_percentiles(pe['1st'], pe['99th'])
            else:
                raise ValueError(f'Invalid pre-evacuation time input data - check the form.')
            pre_evacs[room_type] = round(lognormal(mean=params[0], sigma=params[1]), 2)
            
        return pre_evacs

# }}}
    def _get_density(self,name,type_sec,floor):# {{{
        ''' 
        1. See what Apainter says about the density 
        2. See what conf.json says about evacuees density

        Density comes as m^2, but aamks uses 100 * 100 cm^2 
        '''

        r=self.s.query("SELECT evacuees_density FROM aamks_geom WHERE name=?", (name,))[0]
        if r['evacuees_density']  is not None:
            return 1/r['evacuees_density'] * 100 * 100

        z=self.conf['evacuees_density'][type_sec]
        return 1/z * 100 * 100

        raise Exception("Cannot determine the density for {}".format(name))

# }}}
    def _evac_rooms(self,floor): # {{{
        '''
        * probabilistic: probabilistic rooms
        * manual: manually asigned evacuees 
        '''

        rooms={}
        probabilistic_rooms={}
        for i in self.s.query("SELECT points, name, type_sec FROM aamks_geom WHERE type_pri='COMPA' AND floor=? AND has_door=1 ORDER BY global_type_id", (floor,)):
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
            self._evac_conf['FLOORS_DATA'][floor]['ALARMING']=self._get_alarming_time()
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
        os.chmod("{}/workers/{}/evac.json".format(os.environ['AAMKS_PROJECT'],self._sim_id), 0o666)
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
