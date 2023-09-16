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
from include import Vis

# }}}

class Obstacles():
    def __init__(self):# {{{
        self.json=Json()
        self.conf=self.json.read("{}/conf.json".format(os.environ['AAMKS_PROJECT']))
        self.fire_model=self.conf['fire_model'];
        self.s=Sqlite("{}/aamks.sqlite".format(os.environ['AAMKS_PROJECT']))
        self.world_meta=self.json.readdb("world_meta")
        self.floors_meta=self.json.readdb("floors_meta")
        self.floors=self.floors_meta.keys()
        self.walls_width=self.world_meta['walls_width']
        self._create_obstacles('aamks_geom', 'obstacles')
        self.s.close()
        # TODO: in future we will probably process vertical staircases outside of aamks_geoms db table
        #if self.world_meta['multifloor_building']==1:
        #    self._create_obstacles('world2d', 'world2d_obstacles')
        #exit()

# }}}
    def _create_obstacles(self, tin, tout):# {{{
        ''' 
        Geometry may contain obstacles for modeling machines, FDS walls, bookcases,
        etc. Obstacles are not visible in CFAST.
        '''

        data=OrderedDict()
        for r in self.s.query("SELECT DISTINCT(floor) FROM {}".format(tin)):
            floor=r['floor']
            zz=0
            if tin=='aamks_geom':
                zz=self.floors_meta[floor]['minz_abs']
            data[floor]=[]
            obsts=[]
            for o in self.s.query("SELECT points FROM {} WHERE type_pri='OBST' AND floor=?".format(tin), (floor,)):
                obsts.append(Polygon(json.loads(o['points'])))
                
            obsts+=self._floor2obsts(tin,floor)
            for i in obsts:
                data[floor].append([(int(x),int(y), zz) for x,y in i.exterior.coords])
        self.s.query("CREATE TABLE {} (json)".format(tout))
        self.s.query("INSERT INTO {} VALUES (?)".format(tout), (json.dumps({'obstacles': data}),))
        #self.s.dumpall()
#}}}
    def _floor2obsts(self,tin,floor):# {{{
        ''' 
        For a roomX we create a roomX_ghost, we move it by self.walls_width,
        which must match the width of hvents. Then we create walls via logical
        operations. Finally doors cut the openings in walls.

        '''
        if self.fire_model=='FDS':
            return []

        walls=[]
        for i in self.s.query("SELECT * FROM {} WHERE floor=? AND type_pri='COMPA' ORDER BY name".format(tin), (floor,)):

            walls.append((i['x0']+self.walls_width , i['y0']            , i['x0']+i['width']                  , i['y0']+self.walls_width)                )
            walls.append((i['x0']+i['width']       , i['y0']            , i['x0']+i['width']+self.walls_width , i['y0']+i['depth']+self.walls_width)     )
            walls.append((i['x0']+self.walls_width , i['y0']+i['depth'] , i['x0']+i['width']                  , i['y0']+i['depth']+self.walls_width)     )
            walls.append((i['x0']                  , i['y0']            , i['x0']+self.walls_width            , i['y0']+i['depth']+self.walls_width)     )

        walls_polygons=([box(ii[0],ii[1],ii[2],ii[3]) for ii in set(walls)])

        doors_polygons=[]
        for i in self.s.query("SELECT * FROM {} WHERE floor=? AND type_tri='DOOR' ORDER BY name".format(tin), (floor,)):
            doors_polygons.append(box(i['x0'], i['y0'], i['x0']+i['width'], i['y0']+i['depth']))
            
        obsts=[]
        for wall in walls_polygons:
            for door in doors_polygons:
                wall=wall.difference(door)
            if isinstance(wall, MultiPolygon):
                for i in polygonize(wall):
                    obsts.append(i)
            elif isinstance(wall, Polygon) and not wall.is_empty:
                obsts.append(wall)
        return obsts 
# }}}
