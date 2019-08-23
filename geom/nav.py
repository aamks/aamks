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
import copy

from pprint import pprint
from collections import OrderedDict
from shapely.geometry import box, Polygon, LineString, Point, MultiPolygon
from fire.partition_query import PartitionQuery
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
        nav.nav_query(src, dst)

            or if you want to block r1 and r2 and have the navmeshes named

        navs=dict()
        navs[('r1','r2')]=Navmesh()
        navs[('r1','r2')].build(floor,('r1','r2'))
        navs[('r1','r2')].nav_query(src, dst)

        '''

        self.json=Json()
        self.s=Sqlite("{}/aamks.sqlite".format(os.environ['AAMKS_PROJECT']))
        self._test_colors=[ "#f80", "#f00", "#8f0", "#08f" ]
        self.navmesh=OrderedDict()
        self.partition_query={}
        self.evacuee_radius=self.json.read('{}/inc.json'.format(os.environ['AAMKS_PATH']))['evacueeRadius']
# }}}

    def build(self,floor,bypass_rooms=[]):# {{{
        self.floor=floor
        self.bypass_rooms=bypass_rooms
        self._get_name(bypass_rooms)
        file_obj=self._obj_make(bypass_rooms)
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
    def nav_query(self,src,dst,maxStraightPath=16):# {{{
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
        startPos = dt.dtVec3(src[0]/100, 1, src[1]/100)
        endPos = dt.dtVec3(dst[0]/100, 1, dst[1]/100)

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
            ll=self.path_length(p0,(i['center_x'],i['center_y']))
            if ll < closest['len']:
                closest={ 'name': i['name'], 'x': i['center_x'], 'y': i['center_y'], 'len': int(ll) }
        return closest
            
# }}}
    def room_leaves(self,ee):# {{{
        self.partition_query[self.floor]=PartitionQuery(self.floor)
        room=self.partition_query[self.floor].xy2room(ee)
        closest={ 'len': 999999999, 'name': None, 'x': None, 'y': None }

        leaves={}
        for door in self._room_exit_doors(room):
            dest=self._move_dest_around_door({'e': ee, 'door': door, 'room': room})
            ll=self.path_length(ee,dest)
            leaves[ll]=(dest, door['name'])

        best_point, best_name=leaves[min(leaves.keys())]
        best_path=self.nav_query(ee, best_point)
        candidates={'best_point': best_point, 'best_name': best_name, 'best_path': best_path, 'all': list(leaves.values())}
        return candidates

# }}}
    def path_length(self, src, dst):# {{{
        return LineString(self.nav_query(src, dst, 300)).length 
# }}}
    def nav_plot_line(self,points):# {{{
        j=Json()
        z=j.read('{}/dd_geoms.json'.format(os.environ['AAMKS_PROJECT']))
        for cc,path in enumerate(points):
            for i,p in enumerate(path):
                #dd(i,p)
                try:
                    z[self.floor]['lines'].append({"xy":(path[i][0], path[i][1]), "x1": path[i+1][0], "y1": path[i+1][1] , "strokeColor": self._test_colors[cc], "strokeWidth": 14  , "opacity": 0.5 } )
                except:
                    pass

        j.write(z, '{}/dd_geoms.json'.format(os.environ['AAMKS_PROJECT']))
# }}}
    def test(self):# {{{
        agents_pairs=4
        ee=self.s.query("SELECT name,x0,y0 FROM aamks_geom WHERE type_pri='EVACUEE' AND floor=? ORDER BY global_type_id LIMIT ?", (self.floor, agents_pairs*2))
        if len(ee) == 0: return
        evacuees=list(self._chunks(ee,2))
        self._test_evacuees_pairs(evacuees)
        self._test_room_leaves((ee[0]['x0'], ee[0]['y0']))
        Vis({'highlight_geom': None, 'anim': None, 'title': 'Nav {} test'.format(self.nav_name), 'srv': 1})

# }}}

    def _bricked_wall(self, bypass_rooms=[]):# {{{
        '''
        For navmesh we may wish to turn some doors into bricks.
        '''

        bricked_wall=[]

        if len(bypass_rooms) > 0 :
            floors_meta=json.loads(self.s.query("SELECT json FROM floors_meta")[0]['json'])
            elevation=floors_meta[self.floor]['minz_abs']
            where=" WHERE "
            where+=" vent_from_name="+" OR vent_from_name=".join([ "'{}'".format(i) for i in bypass_rooms])
            where+=" OR vent_to_name="+" OR vent_to_name=".join([ "'{}'".format(i) for i in bypass_rooms])
            bypass_doors=self.s.query("SELECT name,x0,y0,x1,y1 FROM aamks_geom {}".format(where))

            for i in bypass_doors:
                bricked_wall.append([[i['x0'],i['y0'],elevation], [i['x1'],i['y0'],elevation], [i['x1'],i['y1'],elevation], [i['x0'],i['y1'],elevation], [i['x0'],i['y0'],elevation]])

        bricked_wall+=self.json.readdb("obstacles")['obstacles'][self.floor]
        try:
            bricked_wall.append(self.json.readdb("obstacles")['fire'][self.floor])
        except:
            pass

        return bricked_wall

# }}}
    def _obj_platform(self):# {{{
        z=self.s.query("SELECT x0,y0,x1,y1 FROM aamks_geom WHERE type_pri='COMPA' AND floor=?", (self.floor,))
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
    def _obj_make(self,bypass_rooms):# {{{
        ''' 
        1. Create obj file from aamks geometries.
        2. Build navmesh with golang, obj is input
        3. Query navmesh with python
        4. bypass_rooms are the rooms excluded from navigation

        99 is the z-dim in cm

        '''

        z=self._bricked_wall(bypass_rooms)
        obj='';
        self._obj_num=0;
        for face in z:
            obj+=self._obj_elem(face,99)
        for face in self._obj_platform():
            obj+=self._obj_elem(face,0)
        
        path="{}/{}.obj".format(os.environ['AAMKS_PROJECT'], self.nav_name)
        with open(path, "w") as f: 
            f.write(obj)
        return path

# }}}
    def _chunks(self,l, n):# {{{
        """Yield successive n-sized chunks from l."""
        for i in range(0, len(l), n):
            yield l[i:i + n]
# }}}
    def _get_name(self,bypass_rooms=[]):# {{{
        brooms=''
        if len(bypass_rooms)>0:
            brooms="-"+"-".join(bypass_rooms)
        self.nav_name="{}{}.nav".format(self.floor,brooms)

# }}}

    def _hole_connected_rooms(self): # {{{
        ''' 
        room A may be hole-connected to room B which may be hole-connnected to
        room C and so on -- recursion
        '''

        if self._hole_count == len(self._hole_rooms):
            return 
        else:
            self._hole_count=len(self._hole_rooms)
            tt=copy.deepcopy(self._hole_rooms)
            for room in self._hole_rooms.keys():
                for i in self.s.query("SELECT vent_from_name,vent_to_name FROM aamks_geom WHERE type_sec='HOLE' AND (vent_from_name=? OR vent_to_name=?)", (room, room)):
                    tt[i['vent_from_name']]=1
                    tt[i['vent_to_name']]=1
            self._hole_rooms=copy.deepcopy(tt)
            return self._hole_connected_rooms()
# }}}
    def _room_exit_doors(self,room): # {{{
        ''' 
        An agents is found in room A. If room A is connected to room B via a
        hole, then we are looking for way out via doors in the "merged" AB
        room. 

        room A may be hole-connected to room B which may be hole-connnected to
        room C and so on, hence recursive _hole_connected_rooms() need to
        calculate _hole_rooms
        '''

        self._hole_rooms={room: 1}
        self._hole_count=0
        self._hole_connected_rooms()
        doors={}
        for rr in self._hole_rooms.keys():
            z=self.s.query("SELECT name, type_sec, x0, y0, x1, y1, center_x, center_y, is_vertical FROM aamks_geom WHERE type_sec='DOOR' AND (vent_from_name=? OR vent_to_name=?)", (rr, rr))
            for d in z:
                doors[d['name']]=d
        return list(doors.values())
# }}}
    def _move_dest_around_door(self,data):# {{{
        '''
        For the hole-connnected rooms the dest point must be calculated
        relative to the ROOM (inside, outside). It won't do relative to the
        EVACUEE position (left, right, above, below). 
        '''
        top_right=self.partition_query[self.floor].xy2room([data['door']['x1'], data['door']['y0']])

        #print(data['door']['name'], top_right, [data['door']['x1'], data['door']['y0']])
        if data['door']['is_vertical']==1:
            if top_right in self._hole_rooms.keys():
                dest=(data['door']['center_x'] - self.evacuee_radius*4, data['door']['center_y'])
            else:
                dest=(data['door']['center_x'] + self.evacuee_radius*4, data['door']['center_y'])
        else:
            if top_right in self._hole_rooms.keys():
                dest=(data['door']['center_x'], data['door']['center_y'] + self.evacuee_radius*4)
            else:
                dest=(data['door']['center_x'], data['door']['center_y'] - self.evacuee_radius*4)

        return dest
# }}}

    def _test_evacuees_pairs(self,evacuees):# {{{

        z=self.json.read('{}/dd_geoms.json'.format(os.environ['AAMKS_PROJECT']))
        navmesh_paths=[]
        for x,i in enumerate(evacuees):
            src=(i[0]['x0'], i[0]['y0'])
            dst=(i[1]['x0'], i[1]['y0'])
            z[self.floor]['circles'].append({ "xy": src, "radius": 30, "fillColor": self._test_colors[x] , "opacity": 1 } )
            z[self.floor]['circles'].append({ "xy": dst, "radius": 30, "fillColor": self._test_colors[x] , "opacity": 1 } )
            navmesh_paths.append(self.nav_query(src, dst, 300))
        self.json.write(z, '{}/dd_geoms.json'.format(os.environ['AAMKS_PROJECT']))
        self.nav_plot_line(navmesh_paths)
# }}}
    def _test_room_leaves(self,ee):# {{{
        ''' 
        radius=3.5 is the condition for the agent to reach the behind-doors target 
        '''

        mm=self.room_leaves(ee)
        z=self.json.read('{}/dd_geoms.json'.format(os.environ['AAMKS_PROJECT']))
        for dest in mm['all']:
            z[self.floor]['circles'].append({ "xy": dest[0], "radius": self.evacuee_radius*3.5, "fillColor": "#ff0", "opacity": 0.3 } )
            z[self.floor]['circles'].append({ "xy": dest[0], "radius": self.evacuee_radius*0.5, "fillColor": "#000", "strokeColor": self._test_colors[0], "strokeWidth": 8,  "opacity": 0.3 } )

        z[self.floor]['circles'].append({ "xy": mm['best_point'], "radius": self.evacuee_radius*3.5, "fillColor": "#0f0", "opacity": 0.3 } )
        z[self.floor]['circles'].append({ "xy": mm['best_point'], "radius": self.evacuee_radius*0.5, "fillColor": "#f00", "strokeColor": self._test_colors[0], "strokeWidth": 8,  "opacity": 0.3 } )
        self.json.write(z, '{}/dd_geoms.json'.format(os.environ['AAMKS_PROJECT']))

        self.nav_plot_line([mm['best_path']])
# }}}
