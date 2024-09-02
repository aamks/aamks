# MODULES
# {{{
import json
import shutil
import os
import re
import sys
import codecs
import itertools

from pprint import pprint
from collections import OrderedDict
from shapely.geometry import box, Polygon, LineString, Point, MultiPolygon
from shapely.ops import polygonize
from numpy.random import uniform
from math import sqrt
from math import floor
from include import Sqlite
from include import Json
from include import Dump as dd
from geom.obstacles import Obstacles

# }}}

class World2d():
    ''' World2d is a display of all floors in a single 2d world '''
    def __init__(self):# {{{
        self.json=Json()
        self.conf=self.json.read("{}/conf.json".format(os.environ['AAMKS_PROJECT']))
        self.world_meta=self.json.readdb("world_meta")
        self.s=Sqlite("{}/aamks.sqlite".format(os.environ['AAMKS_PROJECT']))
        self._read_floors_meta()
        self.floors=self.floors_meta.keys()
        self.walls_width=self.world_meta['walls_width']
        self.projections={'top':dict(), 'side':dict()}
        self._top_projection_make()
        self._top_proj_lines()
        self._meta_translate_y()
        self._world2d_boundaries()
        self.s.close()
# }}}
    def _read_floors_meta(self):# {{{
        unordered=self.json.readdb("floors_meta")
        x=list(unordered.keys())
        x.sort(key=int)
        self.floors_meta=OrderedDict()
        for i in x:
            self.floors_meta[i]=unordered[i]
# }}}
    def _top_projection_make(self):# {{{
        '''
        In world2d we have top and left projections
        '''

        self.projections['top']['padding_rectangle']=300
        self.projections['top']['padding_vertical']=200
        self.projections['top']['x0']=self.s.query("SELECT min(x0) AS m FROM aamks_geom")[0]['m'] - self.projections['top']['padding_rectangle']
        self.projections['top']['x1']=self.s.query("SELECT max(x1) AS m FROM aamks_geom")[0]['m']
# }}}
    def _top_proj_lines(self):# {{{
        '''
        Helper horizontal lines for Animator: 2, 1, 0
        '''

        lines=OrderedDict()
        absolute=0
        for floor in list(self.floors_meta.keys())[::-1]:
            if absolute==0:
                lines[floor]=absolute + self.floors_meta[floor]['ydim'] + self.projections['top']['padding_vertical']
            else:
                lines[floor]=absolute + self.floors_meta[floor]['ydim'] + self.projections['top']['padding_vertical'] * 2 
            absolute=lines[floor]
        self.projections['top']['lines']=lines

# }}}
    def _meta_translate_y(self):# {{{
        '''
        Calculate translateY (ty). Animator needs this meta info to dynamicaly
        merge floors in world2d view. At some point we will probably introduce
        tx for staircases. 
        '''

        for floor,line in self.projections['top']['lines'].items():
            self.floors_meta[floor]['ty']=line - self.projections['top']['padding_vertical'] - self.floors_meta[floor]['maxy']  
            self.floors_meta[floor]['tx']=0
        self.s.query("UPDATE floors_meta SET json=?", (json.dumps(self.floors_meta),))

# }}}
    def _world2d_boundaries(self):# {{{
        m={}
        m['minx']=99999999999
        m['miny']=99999999999
        m['maxx']=-99999999999
        m['maxy']=-99999999999
        for floor,meta in self.floors_meta.items():
            m['minx']=min(m['minx'], meta['minx']+meta['tx'])
            m['miny']=min(m['miny'], meta['miny']+meta['ty'])
            m['maxx']=max(m['maxx'], meta['maxx']+meta['tx'])
            m['maxy']=max(m['maxy'], meta['maxy']+meta['ty'])

        m['xdim']=m['maxx']-m['minx']
        m['ydim']=m['maxy']-m['miny']
        m['center']=[round(m['minx'] + m['xdim']/2), round(m['miny'] + m['ydim']/2), 0]

        self.world_meta['world2d']=m
        self.s.query("UPDATE world_meta SET json=?", (json.dumps(self.world_meta),))

# }}}

