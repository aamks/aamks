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

        self.s=Sqlite("{}/aamks.sqlite".format(os.environ['AAMKS_PROJECT']))
        self.json=Json()
        self.conf=self.json.read("{}/conf.json".format(os.environ['AAMKS_PROJECT']))
        self.floors=[z['floor'] for z in self.s.query("SELECT DISTINCT floor FROM aamks_geom ORDER BY floor")]
        self._project_name=os.path.basename(os.environ['AAMKS_PROJECT'])

        si=SimIterations(self.conf['project_id'], self.conf['number_of_simulations'])
        for self._sim_id in range(*si.get()):
            seed(self._sim_id)
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
        Concentration comes as m^2, but aamks uses 10000 cm^2 
        '''

        z=self.conf['evacuees_concentration']
        for i in [name, "{}_FLOOR_{}".format(type_sec,floor), type_sec]:
            if i in z.keys():
                return z[i] * 10000
        raise Exception("Cannot determine the density for {}".format(name))

# }}}
    def _evac_rooms(self,floor): # {{{
        '''
        * plain: plain rooms
        * manual: manually asigned evacuees 
        '''

        rooms={}
        plain_rooms={}
        for i in self.s.query("SELECT x0, x1, y0, y1, name, type_sec, room_area FROM aamks_geom WHERE type_pri='COMPA' AND floor=? ORDER BY global_type_id", (floor,)):
            plain_rooms[i['name']]=i

        manual_rooms={}
        for i in self.s.query("SELECT name, x0, y0 FROM aamks_geom WHERE type_pri='EVACUEE' AND floor=?", (floor,)):
            q=(floor,i['x0'], i['y0'], i['x0'], i['y0'])
            x=self.s.query("SELECT name,type_sec FROM aamks_geom WHERE type_pri='COMPA' AND floor=? AND x0<=? AND y0<=? AND x1>=? AND y1>=?", q)[0]
            if not x['name'] in manual_rooms:
                manual_rooms[x['name']]={'type_sec': x['type_sec'], 'pos': [] }
                del plain_rooms[x['name']]
            manual_rooms[x['name']]['pos'].append((i['x0'], i['y0']))

        rooms['plain']=plain_rooms
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
        for floor in self.floors:
            self.pre_evacuation[floor] = list()
            positions = []
            evac_rooms=self._evac_rooms(floor)
            for name,r in evac_rooms['plain'].items():
                density=self._get_density(r['name'],r['type_sec'],floor)
                x = uniform(r['x0'] + 50 , r['x1'] - 50 , int(r['room_area'] / density))
                y = uniform(r['y0'] + 50 , r['y1'] - 50 , int(r['room_area'] / density))
                positions += list(zip(x, y))
                for i in x:
                    self.pre_evacuation[floor].append(self._make_pre_evacuation(r['name'], r['type_sec']))
            for name,r in evac_rooms['manual'].items():
                positions += r['pos']
                for i in r['pos']:
                    self.pre_evacuation[floor].append(self._make_pre_evacuation(name, r['type_sec']))
            self.dispatched_evacuees[floor] = [list([int(i) for i in l]) for l in positions]
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

        # TODO: see if we really need it
        # static.json may not exist at this stage, so we preserve the data and
        # the actual write happens in init.py 

        pass
        # m={}
        # for floor in self.floors:
        #     m[floor]['evacuees']=self.dispatched_evacuees[floor]
        #     m[floor]['sim_id']=self._sim_id
        # self.json.write(m,"{}/workers/static.json".format(os.environ['AAMKS_PROJECT']))

        # self.s.query("CREATE TABLE dispatched_evacuees(json)")
        # self.s.query('INSERT INTO floors_meta VALUES (?)', (json.dumps(self.floors_meta),))
        
# }}}

# }}}
