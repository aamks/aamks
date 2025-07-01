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
    def __init__(self, sim_id=None):# {{{
        self.json=Json()
        self.conf=self.json.read("{}/conf.json".format(os.environ['AAMKS_PROJECT']))
        self.fire_model=self.conf['fire_model']
        sim_sql_path = os.path.join(os.environ['AAMKS_PROJECT'], "workers", f"{sim_id}", f"aamks_{sim_id}.sqlite")
        scenario_sql_path = os.path.join(os.environ['AAMKS_PROJECT'], "aamks_geom.sqlite")
        self.s=Sqlite(sim_sql_path)
        self.s_geom=Sqlite(scenario_sql_path)
        self.json.s = self.s_geom
        self.world_meta=self.json.readdb("world_meta")
        self.floors_meta=self.json.readdb("floors_meta")
        self.floors=self.floors_meta.keys()
        self.walls_width=self.world_meta['walls_width']
        self._create_obstacles()
        self.s.close()
        self.s_geom.close()
        # TODO: in future we will probably process vertical staircases outside of aamks_geoms db table
        #if self.world_meta['multifloor_building']==1:
        #    self._create_obstacles('world2d', 'world2d_obstacles')
        #exit()

# }}}
    def _create_obstacles(self):# {{{
        ''' 
        Geometry may contain obstacles for modeling machines, FDS walls, bookcases,
        etc. Obstacles are not visible in CFAST.
        '''

        rvo2ObstalesData = OrderedDict()
        animatorVirtualHallHolesObstaclesData = OrderedDict()
        animatorOtherObstaclesData = OrderedDict()
        floors = self.s_geom.query("SELECT DISTINCT(floor) FROM aamks_geom")
        for r in floors:
            floor=r['floor']
            zz=self.floors_meta[floor]['minz_abs']
            rvo2ObstalesData[floor] = []
            animatorVirtualHallHolesObstacles=[]
            animatorVirtualHallHolesObstaclesData[floor] = []
            animatorOtherObstacles=[]
            animatorOtherObstaclesData[floor] = []

            rvo2Obsts=[]
            for o in self.s_geom.query("SELECT points FROM aamks_geom WHERE type_pri='OBST' AND floor=?", (floor,)):
                rvo2Obsts.append(Polygon(json.loads(o['points'])))
                animatorOtherObstacles.append(Polygon(json.loads(o['points'])))

            obstacles = self._floor2obsts(floor)
            animatorVirtualHallHolesObstacles = obstacles[1]
            animatorOtherObstacles += obstacles[2]
            rvo2Obsts+=obstacles[0]

            for i in rvo2Obsts:
                rvo2ObstalesData[floor].append([(int(x),int(y), zz) for x,y in i.exterior.coords])
            for i in animatorVirtualHallHolesObstacles:
                animatorVirtualHallHolesObstaclesData[floor].append([(int(x),int(y), zz) for x,y in i.exterior.coords])
            for i in animatorOtherObstacles:
                animatorOtherObstaclesData[floor].append([(int(x),int(y), zz) for x,y in i.exterior.coords])
        
        self.s.query("CREATE TABLE obstacles (json)")
        self.s.query("INSERT INTO obstacles VALUES (?)", (json.dumps({'obstacles': rvo2ObstalesData}),))
        
        self.s.query("CREATE TABLE obstacles_animator (json)")
        self.s.query("INSERT INTO obstacles_animator VALUES (?)", (json.dumps({'virtualHallHolesObstacles': animatorVirtualHallHolesObstaclesData, 'otherObstacles': animatorOtherObstaclesData}),))
#}}}
    def _floor2obsts(self, floor):# {{{
        ''' 
        For a roomX we create a roomX_ghost, we move it by self.walls_width,
        which must match the width of hvents. Then we create walls via logical
        operations. Finally doors cut the openings in walls.

        '''
        if self.fire_model=='FDS':
            return []

        walls=[]
        for i in self.s_geom.query("SELECT * FROM aamks_geom WHERE floor=? AND type_pri='COMPA' ORDER BY name", (floor,)):

            walls.append((i['x0']+self.walls_width , i['y0']            , i['x0']+i['width']                  , i['y0']+self.walls_width)                )
            walls.append((i['x0']+i['width']       , i['y0']            , i['x0']+i['width']+self.walls_width , i['y0']+i['depth']+self.walls_width)     )
            walls.append((i['x0']+self.walls_width , i['y0']+i['depth'] , i['x0']+i['width']                  , i['y0']+i['depth']+self.walls_width)     )
            walls.append((i['x0']                  , i['y0']            , i['x0']+self.walls_width            , i['y0']+i['depth']+self.walls_width)     )

        walls_polygons=([box(ii[0],ii[1],ii[2],ii[3]) for ii in set(walls)])

        doors_polygons=[]
        # we don't take holes that connect virtual halls with compartments because we dont want to 
        # let agents go from compartment to virtual hall. If there is a hole between the compartment and the virtual hall, 
        # it is as if there was a balcony - the fire may spread, but people will not pass between virtual hall and compartment.
        # for visualisation purposes (animator) we will make obstacles_animator table and we will 
        # draw holes between in virtual hall wall with a dashed line
        for i in self.s_geom.query("SELECT * FROM aamks_geom WHERE floor=? AND type_tri='DOOR' and vent_from_name NOT LIKE 'a%.%' and vent_to_name NOT LIKE 'a%.%' ORDER BY name", (floor,)):
            doors_polygons.append(box(i['x0'], i['y0'], i['x0']+i['width'], i['y0']+i['depth']))
            
        rvo2Obsts=[]
        for wall in walls_polygons:
            for door in doors_polygons:
                wall=wall.difference(door)
            if isinstance(wall, MultiPolygon):
                for i in polygonize(wall):
                    rvo2Obsts.append(i)
            elif isinstance(wall, Polygon) and not wall.is_empty:
                rvo2Obsts.append(wall)


        animatorObstacles = []
        animatorVirtualHallHoles=[]
        animatorVirtualHallHolesObstaclesToReturn = []
        for i in self.s_geom.query("SELECT * FROM aamks_geom WHERE floor=? AND type_tri='DOOR' and (vent_from_name LIKE 'a%.%' or vent_to_name LIKE 'a%.%') ORDER BY name", (floor,)):
            animatorVirtualHallHoles.append(box(i['x0'], i['y0'], i['x0']+i['width'], i['y0']+i['depth']))
        
        for wall in rvo2Obsts:
            for hole in animatorVirtualHallHoles:
                cut_part = wall.intersection(hole)
                if not cut_part.is_empty and isinstance(cut_part, Polygon):
                    animatorVirtualHallHolesObstaclesToReturn.append(cut_part)
                wall=wall.difference(hole)
            if isinstance(wall, MultiPolygon):
                for i in polygonize(wall):
                    animatorObstacles.append(i)
            elif isinstance(wall, Polygon) and not wall.is_empty:
                animatorObstacles.append(wall)

        return rvo2Obsts, animatorVirtualHallHolesObstaclesToReturn, animatorObstacles
        
# }}}
