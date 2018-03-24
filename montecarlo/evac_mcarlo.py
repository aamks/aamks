# MODULES {{{
import sys
import re
import os
import shutil
import math
from collections import OrderedDict
import psycopg2
import psycopg2.extras # needed? 
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

# }}}

class EvacMcarlo():
    def __init__(self):# {{{
        ''' Generate montecarlo evac.conf. '''

        self.s=Sqlite("{}/aamks.sqlite".format(os.environ['AAMKS_PROJECT']))
        self.json=Json()
        self.conf=self.json.read("{}/conf_aamks.json".format(os.environ['AAMKS_PROJECT']))
        self.dists=self.json.read("{}/distributions.json".format(os.environ['AAMKS_PROJECT']))
        self.floors=[z['floor'] for z in self.s.query("SELECT DISTINCT floor FROM aamks_geom ORDER BY floor")]

        si=SimIterations(self.conf['PROJECT_NAME'], self.conf['NUMBER_OF_SIMULATIONS'])
        for self._sim_id in range(*si.get()):
            seed(self._sim_id)
            self._static_evac_conf()
            self._dispatch_evacuees()
            self._make_evac_conf()

# }}}



    def _static_evac_conf(self):# {{{
        ''' 
        ROOM_OF_FIRE_ORIGIN is invented in cfast_mcarlo.py and written to
        sim_id/evac.json 
        '''

        self._evac_conf=self.conf
        self._evac_conf['WORKSPACE']="{}_{:04d}".format(self.conf['PROJECT_NAME'], self._sim_id)
        self._evac_conf['SIM_ID']=self._sim_id
        self._evac_conf['SERVER']=os.environ['AAMKS_SERVER']
        self._evac_conf['ROOM_OF_FIRE_ORIGIN']=self.json.read("{}/workers/{}/evac.json".format(os.environ['AAMKS_PROJECT'], self._sim_id))['ROOM_OF_FIRE_ORIGIN']
# }}}
    def _make_pre_evacuation(self,room,type_sec):# {{{
        ''' 
        An evacuee pre_evacuates from either ordinary room or from the room of
        fire origin. type_sec will be probably developed in the future.
        '''

        if room != self._evac_conf['ROOM_OF_FIRE_ORIGIN']:
            pre_evacuation=self.dists['building_category'][self.conf['BUILDING_CATEGORY']]['pre_evacuation_time']['mean_and_sd_ordinary_room']
        else:
            pre_evacuation=self.dists['building_category'][self.conf['BUILDING_CATEGORY']]['pre_evacuation_time']['mean_and_sd_room_of_fire_origin']
        return round(lognormal(pre_evacuation[0], pre_evacuation[1]), 2)
# }}}
    def _get_density(self,name,type_sec,floor):# {{{
        ''' Special selectors from distributions.json
        First we try to return ROOM_1_2, then ROOM_FLOOR_1, then ROOM
        '''

        z=self.dists['building_category'][self.conf['BUILDING_CATEGORY']]['evacuees_concentration']
        for i in [name, "{}_FLOOR_{}".format(type_sec,floor), type_sec]:
            if i in z.keys():
                return z[i]
        raise Exception("Cannot determine the density for {}".format(name))

# }}}
    def _dispatch_evacuees(self):# {{{
        ''' 
        We dispatch the evacuees across the building according to the density
        distribution. We also calculate pre_evacuation time for each evacuee.
        '''

        self.dispatched_evacuees=OrderedDict() 
        self.pre_evacuation=OrderedDict() 
        for floor in self.floors:
            self.pre_evacuation[floor] = list()
            positions = []
            rooms = self.s.query("SELECT x0, x1, y0, y1, name, type_sec, room_area FROM aamks_geom WHERE type_pri='COMPA' AND floor=?", (floor,))
            for r in rooms:
                density=self._get_density(r['name'],r['type_sec'],floor)
                x = uniform(r['x0'] + 50 , r['x1'] - 50 , int(r['room_area'] / density))
                y = uniform(r['y0'] + 50 , r['y1'] - 50 , int(r['room_area'] / density))
                positions += list(zip(x, y))
                for i in x:
                    self.pre_evacuation[floor].append(self._make_pre_evacuation(r['name'], r['type_sec']))
            self.dispatched_evacuees[floor] = [list([int(i) for i in l]) for l in positions]
# }}}
    def _make_evac_conf(self):# {{{
        ''' Write data to sim_id/evac.json. '''
        ''' For easier development: /tmp/blender_evac.json. '''

        self._evac_conf['FLOORS_DATA']=OrderedDict()
        for floor in self.floors:
            self._evac_conf['FLOORS_DATA'][floor]=OrderedDict()
            self._evac_conf['FLOORS_DATA'][floor]['NUM_OF_EVACUEES']=len(self.dispatched_evacuees[floor])
            self._evac_conf['FLOORS_DATA'][floor]['EVACUEES']=OrderedDict()
            z=self.s.query("SELECT z0 FROM aamks_geom WHERE floor=?", (floor,))[0]['z0']
            for i,pos in enumerate(self.dispatched_evacuees[floor]):
                e_id='E{}'.format(i)
                speeds=self.dists['building_category'][self.conf['BUILDING_CATEGORY']]['evacuees_speed_params']
                self._evac_conf['FLOORS_DATA'][floor]['EVACUEES'][e_id]=OrderedDict()
                self._evac_conf['FLOORS_DATA'][floor]['EVACUEES'][e_id]['ORIGIN']         = (pos[0]/100, pos[1]/100, z/100)
                self._evac_conf['FLOORS_DATA'][floor]['EVACUEES'][e_id]['PRE_EVACUATION'] = self.pre_evacuation[floor][i]
                self._evac_conf['FLOORS_DATA'][floor]['EVACUEES'][e_id]['ALPHA_V']        = round(normal(*speeds['alpha_v_mean_and_sd'])     , 2)
                self._evac_conf['FLOORS_DATA'][floor]['EVACUEES'][e_id]['BETA_V']         = round(normal(*speeds['beta_v_mean_and_sd'])      , 2)
                self._evac_conf['FLOORS_DATA'][floor]['EVACUEES'][e_id]['H_SPEED']        = round(normal(*speeds['max_h_speed_mean_and_sd']) , 2)
                self._evac_conf['FLOORS_DATA'][floor]['EVACUEES'][e_id]['V_SPEED']        = round(normal(*speeds['max_v_speed_mean_and_sd']) , 2)
        self.json.write(self._evac_conf, "{}/workers/{}/evac.json".format(os.environ['AAMKS_PROJECT'],self._sim_id))
        self.json.write(self._evac_conf, "/tmp/blender_evac.json")

# }}}
