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
from numpy.random import randint
from numpy.random import seed
from numpy import array as npa
from math import sqrt

from include import Sqlite
from include import Json
from include import Dump as dd
from include import SimIterations

# }}}

class CfastMcarlo():
    def __init__(self):# {{{
        ''' Generate montecarlo evac.conf. '''

        self.s=Sqlite("{}/aamks.sqlite".format(os.environ['AAMKS_PROJECT']))
        self.json=Json()
        self.conf=self.json.read("{}/conf_aamks.json".format(os.environ['AAMKS_PROJECT']))
        self.dists=self.json.read("{}/distributions.json".format(os.environ['AAMKS_PROJECT']))
        self.floors=[z['floor'] for z in self.s.query("SELECT DISTINCT floor FROM aamks_geom ORDER BY floor")]
        self._evac_conf=OrderedDict()
        self._make_doors_centers()

        si=SimIterations(self.conf['GENERAL']['PROJECT_NAME'], self.conf['GENERAL']['NUMBER_OF_SIMULATIONS'])
        for self._sim_id in range(*si.get()):
            seed(self._sim_id)
            self._dispatch_evacuees()
            self._roadmaps_for_evacuees()
            self._room_of_fire_origin() 
            self._make_evac_conf()

# }}}

    def _room_of_fire_origin(self):# {{{
        ''' ROOM_OF_FIRE_ORIGIN is invented in CfastConf.py and written to sim_id/evac.json '''
        self.conf['GENERAL']['ROOM_OF_FIRE_ORIGIN']=self.json.read("{}/workers/{}/evac.json".format(os.environ['AAMKS_PROJECT'], self._sim_id))['GENERAL']['ROOM_OF_FIRE_ORIGIN']
# }}}
    def _get_density(self,name,type_sec,floor):# {{{
        ''' Special selectors from distributions.json
        First we try to return ROOM_1_2, then ROOM_FLOOR_1, then ROOM
        '''

        z=self.dists['building_category'][self.conf['GENERAL']['BUILDING_CATEGORY']]['evacuees_concentration']
        for i in [name, "{}_FLOOR_{}".format(type_sec,floor), type_sec]:
            if i in z.keys():
                return z[i]
        raise Exception("Cannot determine the density for {}".format(name))

# }}}
    def _dispatch_evacuees(self):# {{{
        ''' We dispatch the evacuees across the building according to the density distribution. '''

        self.dispatched_evacuees=OrderedDict() 
        for floor in self.floors:
            positions = []
            rooms = self.s.query("SELECT x0, x1, y0, y1, name, type_sec, room_area FROM aamks_geom WHERE type_pri='COMPA' AND floor=?", (floor,))
            for r in rooms:
                density=self._get_density(r['name'],r['type_sec'],floor)
                x = uniform(r['x0'] + self.conf['AAMKS_CONF']['WALL_MARGIN'], r['x1'] - self.conf['AAMKS_CONF']['WALL_MARGIN'], int(r['room_area'] / density))
                y = uniform(r['y0'] + self.conf['AAMKS_CONF']['WALL_MARGIN'], r['y1'] - self.conf['AAMKS_CONF']['WALL_MARGIN'], int(r['room_area'] / density))
                positions += list(zip(x, y))
            self.dispatched_evacuees[floor] = [list([int(i) for i in l]) for l in positions]
# }}}
    def _make_doors_centers(self):# {{{
        self._doors_centers = {}
        for i in self.s.query("SELECT name, center_x, center_y FROM aamks_geom WHERE type_tri='DOOR'"):
            self._doors_centers[i['name']] = (i['center_x'], i['center_y'])
# }}}
    def _roadmaps_for_evacuees(self):# {{{
        ''' An evacuee finds himself in a room.
        There are n doors to this room.
        The graph already knows the distance from each door to the outside
        We search for min(dist_evacuee2door + dist_door2outside)
        Then for each evacuee we save the cooridnates: [ evacuee, D0, D1, D2, D3 ]
        We also save the rooms sequence [ ROOM_1_1, ROOM_1_4 ] so that the aamks's evacuee doesn't need to make costly calcuations of the current room from xy.
        '''
        graph=self.json.read("{}/graph.json".format(os.environ['AAMKS_PROJECT']))
        geom=self.json.read("{}/geom.json".format(os.environ['AAMKS_PROJECT']))
        network_xpaths_lengths  = graph['network_xpaths_lengths']
        graph_coords_seq        = graph['graph_coords_seq']
        graph_rooms_seq         = graph['graph_rooms_seq']
        door_intersections      = geom['compa_intersects_doors']
        
        self.evacuees_roadmaps_coords=OrderedDict()
        self.evacuees_roadmaps_rooms=OrderedDict()
        for floor in self.floors:
            self.evacuees_roadmaps_coords[floor]=[]
            self.evacuees_roadmaps_rooms[floor]=[]
            for evacuee_location in self.dispatched_evacuees[floor]:
                evacuee_in_room=self._xy2room(evacuee_location,floor)
                roadmap_coords=[evacuee_location]
                roadmap_rooms=[evacuee_in_room]
                least=99999999
                for door in door_intersections[evacuee_in_room]:
                    evacuee_door_distance=sqrt((self._doors_centers[door][0] - evacuee_location[0]) ** 2 + (self._doors_centers[door][1] - evacuee_location[1]) ** 2)
                    if evacuee_door_distance + network_xpaths_lengths[door]  < least:
                        least = evacuee_door_distance + network_xpaths_lengths[door] 
                        exit=door
                roadmap_coords+=graph_coords_seq[exit]
                roadmap_rooms+=graph_rooms_seq[exit]
                self.evacuees_roadmaps_coords[floor].append(roadmap_coords)
                self.evacuees_roadmaps_rooms[floor].append(roadmap_rooms)

# }}}
    def _xy2room(self, position,floor):# {{{
        try:
            return self.s.query("SELECT name FROM aamks_geom WHERE floor=? AND x0 < ? AND x1 > ? AND y0 < ? AND y1 > ? AND type_pri='COMPA'",  (floor,position[0], position[0], position[1], position[1]))[0]['name']
        except: 
            Exception('Evacuee starts outside of the room:', position)
# }}}
    def _evacuee_pre_evacuation(self,room):# {{{
        ''' An evacuee pre_evacuates from either ordinary room or from the room of fire origin. '''

        if room != self.conf['GENERAL']['ROOM_OF_FIRE_ORIGIN']:
            pre_evacuation=self.dists['building_category'][self.conf['GENERAL']['BUILDING_CATEGORY']]['pre_evacuation_time']['mean_and_sd_ordinary_room']
        else:
            pre_evacuation=self.dists['building_category'][self.conf['GENERAL']['BUILDING_CATEGORY']]['pre_evacuation_time']['mean_and_sd_room_of_fire_origin']
        return round(lognormal(pre_evacuation[0], pre_evacuation[1]), 2)
# }}}

    def _static_evac_conf(self):# {{{
        self._evac_conf['GENERAL']=self.conf['GENERAL']
        self._evac_conf['GENERAL']['WORKSPACE']="{}_{:04d}".format(self.conf['GENERAL']['PROJECT_NAME'], self._sim_id)
        self._evac_conf['GENERAL']['SIM_ID']=self._sim_id
        self._evac_conf['GENERAL']['SERVER']=os.environ['AAMKS_SERVER']
        self._evac_conf['AAMKS_CONF']=self.conf['AAMKS_CONF']
# }}}
    def _make_evac_conf(self):# {{{
        ''' Write data to sim_id/evac.json. '''

        self._static_evac_conf()
        for floor in self.floors:
            self._evac_conf[floor]=OrderedDict()
            self._evac_conf[floor]['NUM_OF_EVACUEES']=len(self.evacuees_roadmaps_coords[floor])
            self._evac_conf[floor]['EVACUEES']=OrderedDict()
            for i in range(0,len(self.evacuees_roadmaps_coords[floor])):
                e_id='E{}'.format(i)

                self._evac_conf[floor]['EVACUEES'][e_id]=OrderedDict()
                self._evac_conf[floor]['EVACUEES'][e_id]['ORIGIN']         = self.evacuees_roadmaps_coords[floor][i].pop(0)
                self._evac_conf[floor]['EVACUEES'][e_id]['ROADMAP']        = self.evacuees_roadmaps_coords[floor][i]
                self._evac_conf[floor]['EVACUEES'][e_id]['ROADMAP_ROOMS']  = self.evacuees_roadmaps_rooms[floor][i]
                self._evac_conf[floor]['EVACUEES'][e_id]['PRE_EVACUATION'] = self._evacuee_pre_evacuation(self.evacuees_roadmaps_rooms[floor][i])

                speeds=self.dists['building_category'][self.conf['GENERAL']['BUILDING_CATEGORY']]['evacuees_speed_params']
                self._evac_conf[floor]['EVACUEES'][e_id]['ALPHA_V']        = round(normal(*speeds['alpha_v_mean_and_sd'])     , 2)
                self._evac_conf[floor]['EVACUEES'][e_id]['BETA_V']         = round(normal(*speeds['beta_v_mean_and_sd'])      , 2)
                self._evac_conf[floor]['EVACUEES'][e_id]['H_SPEED']        = round(normal(*speeds['max_h_speed_mean_and_sd']) , 2)
                self._evac_conf[floor]['EVACUEES'][e_id]['V_SPEED']        = round(normal(*speeds['max_v_speed_mean_and_sd']) , 2)
        self.json.write(self._evac_conf, "{}/workers/{}/evac.json".format(os.environ['AAMKS_PROJECT'],self._sim_id))

# }}}
