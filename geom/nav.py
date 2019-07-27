# MODULES
# {{{
import json
import shutil
import os
import re
import sys
import codecs
import itertools
import _recast as dt
import subprocess

from pprint import pprint
from collections import OrderedDict
from shapely.geometry import box, Polygon, LineString, Point, MultiPolygon
from shapely.ops import polygonize
from numpy.random import uniform
from math import sqrt
from include import Sqlite
from include import Json
from include import Dump as dd
from include import Vis

# }}}

class Navmesh: 
    def __init__(self):# {{{
        ''' 
        installer/navmesh_installer.sh installs all the dependencies.

        * navmesh build from the obj geometry file
        thanks to https://github.com/arl/go-detour !

        * navmesh query
        thanks to https://github.com/layzerar/recastlib/ !

        ============================================

        This is how we are supposed to be called:

        nav=Navmesh()
        nav.build(floor)
        nav.query([(1300,600), (3100,1800)])

            or if you want to block r1 and r2 and have the navmeshes named

        navs=dict()
        navs[('r1','r2')]=Navmesh()
        navs[('r1','r2')].build(floor,('r1','r2'))
        navs[('r1','r2')].query([(1300,600), (3100,1800)])

        '''

        self.json=Json()
        self.s=Sqlite("{}/aamks.sqlite".format(os.environ['AAMKS_PROJECT']))
        self.navmesh=OrderedDict()
# }}}
    def _bricked_wall(self, floor, bypass_rooms=[]):# {{{
        '''
        For navmesh we may wish to turn some doors into bricks.
        '''

        bricked_wall=[]

        if len(bypass_rooms) > 0 :
            floors_meta=json.loads(self.s.query("SELECT json FROM floors_meta")[0]['json'])
            elevation=floors_meta[floor]['minz_abs']
            where=" WHERE "
            where+=" vent_from_name="+" OR vent_from_name=".join([ "'{}'".format(i) for i in bypass_rooms])
            where+=" OR vent_to_name="+" OR vent_to_name=".join([ "'{}'".format(i) for i in bypass_rooms])
            bypass_doors=self.s.query("SELECT name,x0,y0,x1,y1 FROM aamks_geom {}".format(where))

            for i in bypass_doors:
                bricked_wall.append([[i['x0'],i['y0'],elevation], [i['x1'],i['y0'],elevation], [i['x1'],i['y1'],elevation], [i['x0'],i['y1'],elevation], [i['x0'],i['y0'],elevation]])

        bricked_wall+=self.json.readdb("obstacles")['obstacles'][floor]
        try:
            bricked_wall.append(self.json.readdb("obstacles")['fire'][floor])
        except:
            pass

        return bricked_wall

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
    def _obj_make(self,floor,bypass_rooms):# {{{
        ''' 
        1. Create obj file from aamks geometries.
        2. Build navmesh with golang, obj is input
        3. Query navmesh with python
        4. bypass_rooms are the rooms excluded from navigation

        99 is the z-dim in cm

        '''

        z=self._bricked_wall(floor,bypass_rooms)
        obj='';
        self._obj_num=0;
        for face in z:
            obj+=self._obj_elem(face,99)
        for face in self._obj_platform(floor):
            obj+=self._obj_elem(face,0)
        
        path="{}/{}.obj".format(os.environ['AAMKS_PROJECT'], self.nav_name)
        with open(path, "w") as f: 
            f.write(obj)
        return path

# }}}
    def _navmesh_vis(self,navmesh_paths,colors):# {{{
        j=Json()
        z=j.read('{}/dd_geoms.json'.format(os.environ['AAMKS_PROJECT']))
        for cc,path in enumerate(navmesh_paths):
            for i,p in enumerate(path):
                try:
                    z[self.floor]['lines'].append({"xy":(path[i][0], path[i][1]), "x1": path[i+1][0], "y1": path[i+1][1] , "strokeColor": colors[cc], "strokeWidth": 14  , "opacity": 0.5 } )
                except:
                    pass

        j.write(z, '{}/dd_geoms.json'.format(os.environ['AAMKS_PROJECT']))
# }}}
    def _chunks(self,l, n):# {{{
        """Yield successive n-sized chunks from l."""
        for i in range(0, len(l), n):
            yield l[i:i + n]
# }}}
    def _get_name(self,floor,bypass_rooms=[]):# {{{
        brooms=''
        if len(bypass_rooms)>0:
            brooms="-"+"-".join(bypass_rooms)
        self.nav_name="{}{}.nav".format(floor,brooms)

# }}}

    def test(self):# {{{
        agents_pairs=6
        colors=[ "#f80", "#f00", "#8f0", "#08f", "#f0f", "#f8f", "#0ff", "#ff0" ]
        navmesh_paths=[]

        z=self.json.read('{}/dd_geoms.json'.format(os.environ['AAMKS_PROJECT']))
        evacuees=self.s.query("SELECT x0,y0 FROM aamks_geom WHERE type_pri='EVACUEE' AND floor=? ORDER BY global_type_id LIMIT ?", (self.floor, agents_pairs*2))
        for x,i in enumerate(self._chunks(evacuees,2)):
            p0=(i[0]['x0'], i[0]['y0'])
            p1=(i[1]['x0'], i[1]['y0'])
            z[self.floor]['circles'].append({ "xy": p0, "radius": 30, "fillColor": colors[x] , "opacity": 1 } )
            z[self.floor]['circles'].append({ "xy": p1, "radius": 30, "fillColor": colors[x] , "opacity": 1 } )
            navmesh_paths.append(self.query((p0,p1),300))
        self.json.write(z, '{}/dd_geoms.json'.format(os.environ['AAMKS_PROJECT']))
        self._navmesh_vis(navmesh_paths,colors)
        Vis({'highlight_geom': None, 'anim': None, 'title': 'Nav {} test'.format(self.nav_name), 'srv': 1})
# }}}
    def build(self,floor,bypass_rooms=[]):# {{{
        self.floor=floor
        self.bypass_rooms=bypass_rooms
        self._get_name(floor,bypass_rooms)
        file_obj=self._obj_make(floor,bypass_rooms)
        file_nav="{}/{}".format(os.environ['AAMKS_PROJECT'], self.nav_name)
        file_conf="{}/recast.yml".format(os.environ['AAMKS_PROJECT'])
        with open(file_conf, "w") as f: 
            f.write('''\
            cellsize: 0.10
            cellheight: 0.2
            agentheight: 2
            agentradius: 0.30
            agentmaxclimb: 0.1
            agentmaxslope: 45
            regionminsize: 8
            regionmergesize: 20
            edgemaxlen: 12
            edgemaxerror: 1.3
            vertsperpoly: 6
            detailsampledist: 6
            detailsamplemaxerror: 1
            partitiontype: 1
            tilesize: 0
            ''')
        subprocess.call("rm -rf {}; recast --config {} --input {} build {} 1>/dev/null 2>/dev/null".format(file_nav, file_conf, file_obj, file_nav), shell=True)

        try:
            self.NAV = dt.dtLoadSampleTileMesh(file_nav)
        except:
            raise SystemExit("Navmesh: cannot create {}".format(file_nav))
# }}}
    def query(self,q,maxStraightPath=16):# {{{
        '''
        ./Detour/Include/DetourNavMeshQuery.h: maxStraightPath: The maximum number of points the straight path arrays can hold.  [Limit: > 0]
        We set maxStraightPath to a default low value which stops calculations early
        If one needs to get the full path to the destination one must call us with any high value, e.g. 999999999
        '''

        filtr = dt.dtQueryFilter()
        query = dt.dtNavMeshQuery()

        status = query.init(self.NAV, 2048)
        if dt.dtStatusFailed(status):
            return "err", -1, status

        polyPickExt = dt.dtVec3(2.0, 4.0, 2.0)
        startPos = dt.dtVec3(q[0][0]/100, 1, q[0][1]/100)
        endPos = dt.dtVec3(q[1][0]/100, 1, q[1][1]/100)

        status, out = query.findNearestPoly(startPos, polyPickExt, filtr)
        if dt.dtStatusFailed(status):
            return "err", -2, status
        startRef = out["nearestRef"]
        _startPt = out["nearestPt"]

        status, out = query.findNearestPoly(endPos, polyPickExt, filtr)
        if dt.dtStatusFailed(status):
            return "err", -3, status
        endRef = out["nearestRef"]
        _endPt = out["nearestPt"]

        status, out = query.findPath(startRef, endRef, startPos, endPos, filtr, maxStraightPath)
        if dt.dtStatusFailed(status):
            return "err", -4, status
        pathRefs = out["path"]

        status, fixEndPos = query.closestPointOnPoly(pathRefs[-1], endPos)
        if dt.dtStatusFailed(status):
            return "err", -5, status

        status, out = query.findStraightPath(startPos, fixEndPos, pathRefs, maxStraightPath, 0)
        if dt.dtStatusFailed(status):
            return "err", -6, status
        straightPath = out["straightPath"]
        straightPathFlags = out["straightPathFlags"]
        straightPathRefs = out["straightPathRefs"]
        
        path=[]
        for i in straightPath:
            path.append((i[0]*100, i[2]*100))

        if path[0]=="err":
            return None
        else :
            return path
# }}}
    def closest_terminal(self,p0,exit_type):# {{{
        '''
        The shortest polyline defines the closest exit from the floor. 
        dist < 10 test asserts the polyline has min 2 distinct points.

        exit_type: primary | secondary | any
        '''

        if exit_type in ['primary', 'secondary']:
            r=self.s.query("SELECT name,center_x,center_y FROM aamks_geom WHERE terminal_door=? AND floor=?", (exit_type, self.floor))
        else:
            r=self.s.query("SELECT name,center_x,center_y FROM aamks_geom WHERE terminal_door IS NOT NULL AND floor=?", (self.floor,))
        m={}
        closest={ 'len': 999999999, 'name': None, 'x': None, 'y': None }
        for i in r:
            if abs(i['center_x']-p0[0]) < 10 and abs(i['center_y']-p0[1]) < 10: 
                closest={ 'name': i['name'],  'x': i['center_x'], 'y': i['center_y'],'len': 0  }
                return closest
            ll=LineString(self.query((p0,(i['center_x'],i['center_y'])),300)).length 
            if ll < closest['len']:
                closest={ 'name': i['name'], 'x': i['center_x'], 'y': i['center_y'], 'len': int(ll) }
        return closest
            
# }}}
    def closest_room_escape(self,p0,room):# {{{
        '''
        Evacuee finds himself in a room with smoke and needs to leave urgently
        '''

        r=self.s.query("SELECT name,center_x,center_y FROM aamks_geom WHERE (vent_from_name=? OR vent_to_name=?) AND floor=?", (room,room,self.floor))
        m={}
        closest={ 'len': 999999999, 'name': None, 'x': None, 'y': None }
        for i in r:
            if abs(i['center_x']-p0[0]) < 10 and abs(i['center_y']-p0[1]) < 10: 
                closest={ 'name': i['name'],  'x': i['center_x'], 'y': i['center_y'],'len': 0  }
                return closest
            ll=sqrt((i['center_x']-p0[0])**2 + (i['center_y']-p0[1])**2)
            if ll < closest['len']:
                closest={ 'name': i['name'], 'x': i['center_x'], 'y': i['center_y'], 'len': int(ll) }
        return closest
            
# }}}

