# IMPORT
# {{{
from collections import OrderedDict
from math import sqrt
from pprint import pprint
import codecs
import itertools
import networkx as nx
import numpy.random as rand
import os
import sys
import json
from include import Sqlite
from include import Json
from include import Dump as dd
# }}}

class Path():
    def __init__(self):# {{{
        self.s=Sqlite("{}/aamks.sqlite".format(os.environ['AAMKS_PROJECT']))
        self.json=Json()
        self.conf=self.json.read("{}/conf_aamks.json".format(os.environ['AAMKS_PROJECT']))
        self._doors_centers()
        self._measure_door_pairs_distances()
        self._graph_and_distances()
        self._assert_outside_available()
        self._paths_as_coordinates()
        self._paths_as_rooms()
        self._save()
# }}}

    def _make_door_intersections(self):# {{{
        ''' Intersecting rooms with doors/holes for graphs. '''

        all_compas=[z['name'] for z in self.s.query("SELECT name FROM aamks_geom WHERE type_pri='COMPA' ORDER BY name") ]
        all_compas.append('outside')

        door_intersections=OrderedDict((key,[]) for key in all_compas)
        id2compa_name=json.loads(self.s.query("select * from id2compa")[0]['json'])

        for v in self.s.query("select * from aamks_geom where type_tri='DOOR'"):
            door_intersections[id2compa_name[str(v['vent_from'])]].append(v['name'])
            door_intersections[id2compa_name[str(v['vent_to'])]].append(v['name'])
        self.s.query("CREATE TABLE door_intersections(json)")
        self.s.query("INSERT INTO door_intersections VALUES (?)", (json.dumps(door_intersections),))
        return door_intersections
# }}}
    def _doors_centers(self):# {{{
        self._doors_centers = {}
        for i in self.s.query("SELECT name, center_x, center_y FROM aamks_geom WHERE type_tri='DOOR'"):
            self._doors_centers[i['name']] = (i['center_x'], i['center_y'])
# }}}
    def _measure_door_pairs_distances(self):# {{{
        ''' networkx needs to know all door pairs and the distance in each pair. '''
        door_intersections=self._make_door_intersections()
        doorPairs = []
        for k, v in door_intersections.items():
            if k != 'outside':
                for z in list(itertools.combinations(v, 2)):
                    doorPairs.append(z)

        self._door_pairs_distances=[]
        for doorPair in doorPairs:
            d0Center = self._doors_centers[doorPair[0]]
            d1Center = self._doors_centers[doorPair[1]]
            self._door_pairs_distances.append((doorPair[0], doorPair[1], round(sqrt((d0Center[0] - d1Center[0]) ** 2 + (d0Center[1] - d1Center[1]) ** 2), 2)))

        for doorOut in door_intersections['outside']:
            self._door_pairs_distances.append(('outside', doorOut, 0))
# }}}
    def _graph_and_distances(self):# {{{
        ''' We create the path sequence from each door to the outside.
        Also, we calculate the length of each path, because for an evacuee in large room the closest first door may be not optimal at all.
        '''
        G = nx.Graph()
        G.add_weighted_edges_from(self._door_pairs_distances)

        self._network_xpaths = {}
        self._network_xpaths_lengths = {}
        for k, v in nx.shortest_path(G, target='outside', weight='weight').items():
            v.remove('outside')
            if k != 'outside':
                self._network_xpaths[k] = v

        for k, v in nx.shortest_path_length(G, target='outside', weight='weight').items():
            self._network_xpaths_lengths[k] = int(v)
# }}}
    def _assert_outside_available(self):# {{{
        ''' Each door must appear as a key in self._network_xpaths[k]. '''

        for i in self.s.query("SELECT global_type_id,floor,name FROM aamks_geom WHERE type_tri='DOOR'"):
            if i['name'] not in self._network_xpaths.keys(): 
                self.geom._visualize('HVENT', "No escape via door", i['global_type_id'])
# }}}

    def _paths_as_coordinates(self):# {{{
        self._graph_coords_seq = OrderedDict()
        for k, v in self._network_xpaths.items():
            self._graph_coords_seq[k] = []
            for d in v:
                self._graph_coords_seq[k].append((self._doors_centers[d][0], self._doors_centers[d][1]))
# }}}
    def _paths_as_rooms(self):# {{{
        ''' We get some two doors and calculate their common room. '''
        self._graph_rooms_seq = OrderedDict()
        for k, v in self._network_xpaths.items():
            self._graph_rooms_seq[k] = []
            for i in range(0,len(v)-1):
                door1,door2=(v[i],v[i+1])
                rooms=[]
                for i in self.s.query("SELECT vent_from_name,vent_to_name FROM aamks_geom WHERE name in(?,?)", (door1,door2)):
                    rooms.append(i['vent_from_name'])
                    rooms.append(i['vent_to_name'])
                self._graph_rooms_seq[k].append(max(set(rooms), key=rooms.count))
# }}}

    def _save(self):# {{{
        ''' Save graph data to sqlite '''
        z=OrderedDict()
        z['network_xpaths_lengths']=self._network_xpaths_lengths
        z['graph_coords_seq']=self._graph_coords_seq
        z['graph_rooms_seq']=self._graph_rooms_seq

        self.s.query("CREATE TABLE graph(json)")
        self.s.query("INSERT INTO graph VALUES (?)", (json.dumps(z),))
# }}}
