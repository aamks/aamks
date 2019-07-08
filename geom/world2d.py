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
        self.world_meta=self.json.readdb("world_meta")
        self.conf=self.json.read("{}/conf.json".format(os.environ['AAMKS_PROJECT']))
        self.s=Sqlite("{}/aamks.sqlite".format(os.environ['AAMKS_PROJECT']))
        self.floors_meta=self.json.readdb("floors_meta")
        self.floors=self.floors_meta.keys()
        self.walls_width=self.world_meta['walls_width']
        self.projections={'top':dict(), 'side':dict()}
        self._top_projection_make()
        self._top_proj_lines()
        self._meta_translate_y()
        self._world2d_boundaries()
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

        floors_meta=self.json.readdb("floors_meta")

        for floor,line in self.projections['top']['lines'].items():
            self.floors_meta[floor]['world2d_ty']=line - self.projections['top']['padding_vertical'] - self.floors_meta[floor]['maxy']  
            self.floors_meta[floor]['world2d_tx']=0
        self.s.query("UPDATE floors_meta SET json=?", (json.dumps(self.floors_meta),))

# }}}
    def _world2d_boundaries(self):# {{{
        m={}
        m['minx']=99999999999
        m['miny']=99999999999
        m['maxx']=-99999999999
        m['maxy']=-99999999999
        for floor,meta in self.json.readdb("floors_meta").items():
            m['minx']=min(m['minx'], meta['minx']+meta['world2d_tx'])
            m['miny']=min(m['miny'], meta['miny']+meta['world2d_ty'])
            m['maxx']=max(m['maxx'], meta['maxx']+meta['world2d_tx'])
            m['maxy']=max(m['maxy'], meta['maxy']+meta['world2d_ty'])

        m['xdim']=m['maxx']-m['minx']
        m['ydim']=m['maxy']-m['miny']
        m['center']=[round(m['minx'] + m['xdim']/2), round(m['miny'] + m['ydim']/2), 0]

        self.world_meta['world2d']=m
        self.s.query("UPDATE world_meta SET json=?", (json.dumps(self.world_meta),))

# }}}
