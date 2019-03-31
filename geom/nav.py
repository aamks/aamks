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
from include import Sqlite
from include import Json
from include import Dump as dd
from include import Navmesh
from include import Vis

# }}}

class Nav():
    def __init__(self):# {{{
        self.json=Json()
        self.s=Sqlite("{}/aamks.sqlite".format(os.environ['AAMKS_PROJECT']))
        #self.s.dump()
        #self.s.dumpall()
        self.create(str(0), ['r4','r6'])
# }}}
    def _bricked_wall(self, floor, bypass_rooms):# {{{
        '''
        For navmesh we may wish to turn some doors into bricks.
        '''

        bricked_wall=[]

        if len(bypass_rooms) > 0 :
            floors_meta=json.loads(self.s.query("SELECT json FROM floors")[0]['json'])
            elevation=floors_meta[floor]['z']
            where=" WHERE "
            where+=" vent_from_name="+" OR vent_from_name=".join([ "'{}'".format(i) for i in bypass_rooms])
            where+=" OR vent_to_name="+" OR vent_to_name=".join([ "'{}'".format(i) for i in bypass_rooms])
            bypass_doors=self.s.query("SELECT name,x0,y0,x1,y1 FROM aamks_geom {}".format(where))

            for i in bypass_doors:
                bricked_wall.append([[i['x0'],i['y0'],elevation], [i['x1'],i['y0'],elevation], [i['x1'],i['y1'],elevation], [i['x0'],i['y1'],elevation], [i['x0'],i['y0'],elevation]])

        z=self.s.query("SELECT json FROM obstacles")
        json.loads(z[0]['json'])['points'].items()
        for floor,walls in json.loads(z[0]['json'])['points'].items():
            bricked_wall+=walls

        return bricked_wall

# }}}
    def create(self,floor,bypass_rooms=[]):# {{{
        ''' 
        1. Create obj file from aamks geometries.
        2. Build navmesh with golang, obj is input
        3. Query navmesh with python
        4. bypass_rooms are the rooms excluded from navigation
        '''

        self.nav=OrderedDict()
        z=self._bricked_wall(floor,bypass_rooms)
        obj='';
        self._obj_num=0;
        for face in z:
            obj+=self._obj_elem(face,99)
        for face in self._obj_platform(floor):
            obj+=self._obj_elem(face,0)
        
        path="{}/{}.obj".format(os.environ['AAMKS_PROJECT'], floor)
        #dd(path)
        with open(path, "w") as f: 
            f.write(obj)
        #with open("/home/mimooh/0.obj", "w") as f: 
        #    f.write(obj)
        self.nav[floor]=Navmesh()
        self.nav[floor].build(obj, os.environ['AAMKS_PROJECT'], floor)
        self._navmesh_test(floor)

        Vis({'highlight_geom': None, 'anim': None, 'title': 'Navmesh test', 'srv': 1})

# }}}
    def _obj_platform(self,floor):# {{{
        z=self.s.query("SELECT x0,y0,x1,y1 FROM aamks_geom WHERE type_pri='COMPA' AND floor=?", (floor,))
        platforms=[]
        for i in z:
            platforms.append([ (i['x1'], i['y1']), (i['x1'], i['y0']), (i['x0'], i['y0']), (i['x0'], i['y1']) ])
        return platforms

# }}}
    def _obj_elem(self,face,z):# {{{
        elem=''
        elem+="o Face{}\n".format(self._obj_num)
        for verts in face[:4]:
            elem+="v {}\n".format(" ".join([ str(i/100) for i in [verts[0], z, verts[1]]]))
        elem+="f {}\n\n".format(" ".join([ str(4*self._obj_num+i)+"//1" for i in [1,2,3,4]]))
        self._obj_num+=1
        return elem
# }}}
    def _navmesh_test(self,floor):# {{{
        colors=["#fff", "#f80", "#f00", "#8f0", "#08f", "#f0f" ]
        navmesh_paths=[]

        for x in range(6):
            src_dest=[]
            for i in self.s.query("SELECT center_x,center_y FROM aamks_geom WHERE type_pri='COMPA' AND floor=? ORDER BY RANDOM() LIMIT 2", (floor,)):
                r=round(uniform(-100,100))
                src_dest.append([i['center_x']+r, i['center_y']+r])

            z=self.json.read('{}/dd_geoms.json'.format(os.environ['AAMKS_PROJECT']))
            z[floor]['circles'].append({ "xy": (src_dest[0]),"radius": 20, "fillColor": colors[x] , "opacity": 1 } )
            z[floor]['circles'].append({ "xy": (src_dest[1]),"radius": 20, "fillColor": colors[x] , "opacity": 1 } )
            self.json.write(z, '{}/dd_geoms.json'.format(os.environ['AAMKS_PROJECT']))
            navmesh_paths.append(self.nav[floor].query(src_dest, floor,100))
        self._navmesh_vis(floor,navmesh_paths,colors)
# }}}
    def _navmesh_vis(self,floor,navmesh_paths,colors):# {{{
        j=Json()
        z=j.read('{}/dd_geoms.json'.format(os.environ['AAMKS_PROJECT']))
        for cc,path in enumerate(navmesh_paths):
            for i,p in enumerate(path):
                try:
                    z[floor]['lines'].append({"xy":(path[i][0], path[i][1]), "x1": path[i+1][0], "y1": path[i+1][1] , "strokeColor": colors[cc], "strokeWidth": 2  , "opacity": 0.7 } )
                except:
                    pass

        j.write(z, '{}/dd_geoms.json'.format(os.environ['AAMKS_PROJECT']))
# }}}


