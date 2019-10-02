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
from math import sqrt

from include import Sqlite
from include import Json
from include import Dump as dd
from include import SimIterations
from include import Vis

from scipy.stats.distributions import lognorm
from sklearn.cluster import MeanShift
from include import GetUserPrefs


# }}}

class EvacClusters():
    def __init__(self):# {{{
        ''' Generate clusters of evacuees. '''

        self.uprefs=GetUserPrefs()
        if self.uprefs.get_var('evac_clusters')==0:
            return

        self.json=Json()
        self.conf=self.json.read("{}/conf.json".format(os.environ['AAMKS_PROJECT']))
        self.s=Sqlite("{}/aamks.sqlite".format(os.environ['AAMKS_PROJECT']))
        self.dispatched_evacuees=self.json.readdb("dispatched_evacuees")
        self.conf=self.json.read("{}/conf.json".format(os.environ['AAMKS_PROJECT']))
        self.evacuee_radius=self.json.read('{}/inc.json'.format(os.environ['AAMKS_PATH']))['evacueeRadius']

        self._make_dispatched_rooms()  
        self._clustering()
        self._vis_clusters()

# }}}
    def _make_dispatched_rooms(self):# {{{
        ''' 
        rooms for dispatched_evacuees
        '''

        self._dispatched_rooms={}
        for floor,evacuees in self.dispatched_evacuees.items():
            self._dispatched_rooms[floor]={}
            for e in evacuees:
                if e[2] not in self._dispatched_rooms[floor]:
                    self._dispatched_rooms[floor][e[2]]=[]
                self._dispatched_rooms[floor][e[2]].append((e[0], e[1]))

# }}}
    def _cluster_leader(self, center, points):# {{{
        points = tuple(map(tuple, points))
        dist_2 = np.sum((points - center) ** 2, axis=1)
        return points[np.argmin(dist_2)]
# }}}
    def _clustering(self):# {{{
        ms = MeanShift()
        self.clusters = {}
        for floor,rooms in self._dispatched_rooms.items():
            self.clusters[floor]={}
            for room, positions in rooms.items():
                self.clusters[floor][room]=OrderedDict()
                z = np.array(positions)
                ms.fit(z)
                cluster_centers = ms.cluster_centers_
                labels = ms.labels_
                for i in sorted(labels):
                    self.clusters[floor][room][i]=OrderedDict([('agents', [])])

                for idx,i in enumerate(labels):
                    self.clusters[floor][room][i]['agents'].append(self._dispatched_rooms[floor][room][idx])
                for idx,i in enumerate(labels):
                    self.clusters[floor][room][i]['center']=cluster_centers[i]
                    self.clusters[floor][room][i]['leader']=self._cluster_leader(cluster_centers[i], self.clusters[floor][room][i]['agents'])
        #dd(self.clusters['0']['r1'])

# }}}
    def _vis_clusters(self):# {{{
        '''
        We have 9 colors for clusters and 1 color for the leader of the cluster
        Colors are defined in aamks/inc.json as color_0, color_1, ...
        '''

        anim=OrderedDict([("simulation_id",1), ("simulation_time",0), ("time_shift",0)])

        anim_evacuees=[OrderedDict(), OrderedDict()]
        anim_rooms_opacity=[OrderedDict(), OrderedDict()]
        color_iterator=0
        for floor,floors in self.clusters.items():
            frame=[]
            for room,rooms in floors.items():
                for cid,clusters in rooms.items():
                    color_iterator+=1
                    for agent in clusters['agents']:
                        frame.append([agent[0],agent[1],0,0,str(color_iterator%9),1])
                    frame.append([clusters['leader'][0], clusters['leader'][1], 0, 0, str(9),1])
                    
                    anim_evacuees[0][floor]=frame
                    anim_evacuees[1][floor]=frame
                    anim_rooms_opacity[0][floor]={}
                    anim_rooms_opacity[1][floor]={}
        anim['animations']=OrderedDict([("evacuees", anim_evacuees), ("rooms_opacity", anim_rooms_opacity)]) 
        self._write_anim_zip(anim)
        Vis({'highlight_geom': None, 'anim': None, 'title': 'Clustering', 'srv': 1, 'anim': "1/clustering.zip"})

# }}}
    def _write_anim_zip(self,anim):# {{{
        zf = zipfile.ZipFile("{}/workers/{}/clustering.zip".format(os.environ['AAMKS_PROJECT'], 1) , mode='w', compression=zipfile.ZIP_DEFLATED)
        try:
            zf.writestr("anim.json", json.dumps(anim))
        finally:
            zf.close()
# }}}
