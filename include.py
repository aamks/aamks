from collections import OrderedDict
from datetime import datetime
from math import sqrt
from numpy.random import randint
from subprocess import Popen,PIPE
import _recast as dt
import subprocess
import codecs
import inspect
import itertools
import json
import numpy as np
import os
import sqlite3
import sys

class SendMessage:# {{{
    ''' 
    SendMessage() may fail if there are unescaped bash special chars. 
    First we try to send the msg as it is, and if that fails, we convert to
    alphanums only.
    '''

    def __init__(self,msg):
        with open("/tmp/aamks.log", "a") as f: 
            f.write(str(msg)+"\n")
        # for to in [ i.strip() for i in os.environ['AAMKS_NOTIFY'].split(",") ]:
        #     try:
        #         Popen("printf '{}' | sendxmpp -r aamks -d -t -u aamks -p aamkstatanka -j jabb.im {}> /dev/null 2>/dev/null &".format(msg, to), shell=True)
        #     except:
        #         msg="".join([ c if c.isalnum() else " " for c in msg ])
        #         Popen("printf '{}' | sendxmpp -r aamks -d -t -u aamks -p aamkstatanka -j jabb.im {}> /dev/null 2>/dev/null &".format(msg, to), shell=True)
# }}}
class Dump:# {{{
    def __init__(self,struct):
        '''debugging function, much like print but handles various types better'''
        print()
        if isinstance(struct, list):
            for i in struct:
                print(i)
        elif isinstance(struct, dict):
            for k, v in struct.items():
                print (str(k)+':', v)
        #elif isinstance(struct, zip):
        #    self.dd(list(struct))
        else:
            print(struct)
# }}}
class Colors:# {{{
    def hex2rgb(self,color):
        rgb = color[1:]
        r, g, b = rgb[0:2], rgb[2:4], rgb[4:6]
        return tuple([float(int(v, 16)) / 255 for v in (r, g, b)])
# }}}
class SimIterations:# {{{
    ''' 
    For a given project we may run simulation 0 to 999. Then we may wish to run
    100 simulations more and have them numbered here: from=1000 to=1099 These
    from and to numbers are unique for the project and are used as rand seeds
    in later aamks modules. Remember that range(1,4) returns 1,2,3; hence
    SELECT max(iteration)+1 
    '''

    def __init__(self, project, how_many):
        self.p=Psql()
        self.project=project
        self.how_many=how_many

    def get(self):
        self.r=[]
        try:
            # If project already exists in simulations table (e.g. adding 100 simulations to existing 1000)
            _max=self.p.query('SELECT max(iteration)+1 FROM simulations WHERE project=%s', (self.project,))[0][0]
            self.r.append(_max-self.how_many)
            self.r.append(_max)
        except:
            # If a new project
            self.r=[1, self.how_many+1]
        return self.r
        
# }}}
class Sqlite: # {{{

    def __init__(self, handle, must_exist=0):
        '''
        must_exist=0: we are creating the database
        must_exist=1: Exception if there's no such file
        '''

        if must_exist == 1:
            assert os.path.exists(handle), "Expected to find an existing sqlite file at: {}.\nCWD: {}".format(handle, os.getcwd())


        self.SQLITE = sqlite3.connect(handle)
        self.SQLITE.row_factory=self._sql_assoc
        self.sqlitedb=self.SQLITE.cursor()

    def _sql_assoc(self,cursor,row):
        ''' Query results returned as dicts. '''
        d = OrderedDict()
        for id, col in enumerate(cursor.description):
            d[col[0]] = row[id]
        return d

    def query(self,query,data=tuple()):
        ''' Query sqlite, return results as dict. '''
        self.sqlitedb.execute(query,data)
        self.SQLITE.commit()
        if query[:6] in("select", "SELECT"):
            return self.sqlitedb.fetchall() 

    def executemany(self,query,data=tuple()):
        ''' Query sqlite, return results as dict. '''
        self.sqlitedb.executemany(query,data)
        self.SQLITE.commit()

    def querydd(self,query,data=tuple()):
        ''' Debug query, instead of connecting shows the exact query and params. '''
        print(query)
        print(data)

    def dump(self):
        print("dump() from caller: {}, {}".format(inspect.stack()[1][1], inspect.stack()[1][3]))
        for i in self.query('SELECT * FROM aamks_geom order by floor,type_pri,global_type_id'):
            print(i)

    def dump_geoms(self,floor):
        print("dump_geom() from caller: {}, {}".format(inspect.stack()[1][1], inspect.stack()[1][3]))
        print()
        print("name;x0;y0;x1;y1,z0,z1")
        for i in self.query('SELECT name,x0,y0,x1,y1,z0,z1 FROM aamks_geom WHERE floor=? ORDER BY type_pri,global_type_id', (floor,)):
            print("{};{};{};{};{};{};{}".format(i['name'],i['x0'], i['y0'], i['x1'], i['y1'], i['z0'], i['z1']))

    def dumpall(self):
        ''' Remember to add all needed sqlite tables here '''
        print("dump() from caller: {}, {}".format(inspect.stack()[1][1], inspect.stack()[1][3]))
        for i in ('aamks_geom', 'floors', 'obstacles', 'partition', 'cell2compa', 'navmeshes'):
            try:
                print("\n=======================")
                print("table:", i)
                print("=======================\n")
                z=self.query("SELECT * FROM {}".format(i))
                try:
                    z=json.loads(z[0]['json'], object_pairs_hook=OrderedDict)
                except:
                    pass
                Dump(z)
            except:
                pass
# }}}
class Psql: # {{{
    def __init__(self):
        ''' Blender's python doesn't need nor supports psql '''

        import psycopg2
        import psycopg2.extras

        self._project_name=os.path.basename(os.environ['AAMKS_PROJECT'])
        try:
            self.PSQL=psycopg2.connect("dbname='aamks' user='aamks' host={} password='{}'".format(os.environ['AAMKS_SERVER'], os.environ['AAMKS_PG_PASS']))
            self.psqldb=self.PSQL.cursor(cursor_factory=psycopg2.extras.DictCursor)
        except:
            raise SystemExit("Fatal: Cannot connect to postresql.")

    def query(self,query,data=tuple()):
        ''' Query. Return results as dict. '''
        self.psqldb.execute(query,data)
        self.PSQL.commit()
        if query[:6] in("select", "SELECT"):
            return self.psqldb.fetchall() 

    def querydd(self,query,data=tuple()):
        ''' Debug query. Instead of connecting shows the exact query and params. '''
        print(query)
        print(data)

    def dump(self):
        self.json=Json()
        self.conf=self.json.read("{}/conf.json".format(os.environ['AAMKS_PROJECT']))
        print("dump() from caller: {}, {}".format(inspect.stack()[1][1], inspect.stack()[1][3]))
        for i in self.query("SELECT id,project,iteration,to_char(current_timestamp, 'Mon.DD HH24:MI'),data FROM simulations WHERE project=%s ORDER BY id", (self._project_name,) ):
            print(i)

# }}}
class Json: # {{{
    def read(self,path): 
        try:
            f=open(path, 'r')
            dump=json.load(f, object_pairs_hook=OrderedDict)
            f.close()
            return dump
        except:
            raise SystemExit("include.py: Missing or invalid json: {}.".format(path)) 

    def write(self, data, path, pretty=0): 
        try:
            if pretty==1:
                pretty=json.dumps(data, indent=4)
                with open(path, "w") as f: 
                    json.dump(pretty, f)
            else:
                with open(path, "w") as f: 
                    json.dump(data, f)
        except:
            raise SystemExit("include.py: Cannot write json: {}.".format(path)) 


# }}}
class Vis:# {{{
    def __init__(self,highlight_geom,src='image',title='',fire_origin=[]):# {{{
        ''' 
        Html canvas module for src=image (read from sqlite geoms) or
        src=animation_directory in workers/ directory. We will then search for
        e.g. workers/85/anim.zip file. src=image is how we ignore all aspects
        of animation. 
        '''

        self.s=Sqlite("{}/aamks.sqlite".format(os.environ['AAMKS_PROJECT']))
        self.json=Json()
        self.conf=self.json.read("{}/conf.json".format(os.environ['AAMKS_PROJECT']))
        self.title=title
        self.fire_origin=fire_origin
        self.highlight_geom=highlight_geom
        self.src=src

        self._static=OrderedDict()
        self._js_make_floors_and_meta()
        self._js_make_rooms()
        self._js_make_doors()
        self._js_make_obstacles()
        self._js_make_dd_geoms()

        self._save()
# }}}
    def _js_make_floors_and_meta(self):# {{{
        ''' Animation meta tells how to scale and translate canvas view '''
        
        for floor,meta in json.loads(self.s.query("SELECT * FROM floors")[0]['json']).items():
            self._static[floor]=OrderedDict()
            self._static[floor]['meta']=OrderedDict()
            self._static[floor]['meta']['scale']=meta['animation_scale']
            self._static[floor]['meta']['translate']=meta['animation_translate']
# }}}
    def _js_make_rooms(self):# {{{
        ''' Data for rooms. '''

        for floor in self._static.keys():
            self._static[floor]['rooms']=OrderedDict()
            for i in self.s.query("SELECT name,x0,y0,width,depth,type_sec FROM aamks_geom WHERE floor=? AND type_pri='COMPA'", (floor,)):
                self._static[floor]['rooms'][i['name']]=i

# }}}
    def _js_make_doors(self):# {{{
        ''' Data for doors. '''

        for floor in self._static.keys():
            self._static[floor]['doors']=OrderedDict()
            for i in self.s.query("SELECT name,x0,y0,center_x,center_y,width,depth,type_sec FROM aamks_geom WHERE floor=? AND type_tri='DOOR' AND type_sec != 'HOLE'", (floor,)):
                self._static[floor]['doors'][i['name']]=i
# }}}
    def _js_make_obstacles(self):# {{{
        ''' 
        Data for obstacles. It may happen that geom.py was interrupted before
        obstacles were created, so we produce a 0 size obstacle in try/except. 
        '''

        try:
            _json=json.loads(self.s.query("SELECT * FROM obstacles")[0]['json'])
            for floor,obstacles in _json['named'].items():
                self._static[floor]['obstacles']=obstacles
        except:
            for floor in self._static.keys():
                self._static[floor]['obstacles']=[ dict([("x0",0), ("y0",0), ("width",0), ("depth",0) ]) ]
# }}}
    def _js_make_dd_geoms(self):# {{{
        ''' 
        dd_geoms are initialized in geom.py. Those are optional extra
        rectangles, points, lines and circles that are written to on top of our
        geoms. Useful for debugging.
        '''

        f=self.json.read("{}/dd_geoms.json".format(os.environ['AAMKS_PROJECT']))
        for floor in self._static.keys():
            self._static[floor]['dd_geoms']=f[floor]
# }}}
    def _js_reorder_animations(self, z):# {{{
        '''
        sort_id -1, -2, -3 come from the server.
        sort_id > 1 come from workers -- sort_id is sim_id.
        We want to display latest from the server on top, then the workers.
        The server starts with -1 and next animations have -1 added.
        '''

        sorted_anims=[]
        d=[]
        for i,j in enumerate(z):
            d.append((j['sort_id'],i))
        sorted_d=sorted(d)
        for i in sorted_d:
            sorted_anims.append(z[i[1]])
        lowest_id=sorted_d[0][0]
        return (sorted_anims, lowest_id - 1)

# }}}
    def _save(self):# {{{
        ''' 
        Static.json is written each time, because obstacles may be available /
        non-available, so it is not constans. Except from static.json we update
        the listing of the animations (anims.json). Animations are also updated from
        workers via gearman. 
        '''

        vis_dir="{}/workers".format(os.environ['AAMKS_PROJECT']) 
        self.json.write(self._static, '{}/static.json'.format(vis_dir)) 

        try:
            z=self.json.read("{}/anims.json".format(vis_dir))
            z,lowest_id=self._js_reorder_animations(z)
        except:
            z=[]
            lowest_id=-1

        records=[]
        for floor in self._static.keys():
            anim_record=OrderedDict()
            anim_record['sort_id']=lowest_id
            lowest_id-=1
            anim_record['title']="{} {}, f{}".format(self.title, datetime.now().strftime('%H:%M'), floor)
            anim_record['floor']=floor
            anim_record['fire_origin']=self.fire_origin
            anim_record['highlight_geom']=self.highlight_geom
            if self.src=='image':
                anim_record['anim']=''
            else:
                anim_record['anim']="{}".format(self.src)

            records = [anim_record] + records
        z = records + z
        self.json.write(z, "{}/anims.json".format(vis_dir))
# }}}
# }}}
class Navmesh: # {{{
    ''' 
    installer/navmesh_installer.sh installs all the dependencies.

    * navmesh build from the obj geometry file
    thanks to https://github.com/arl/go-detour !

    * navmesh query
    thanks to https://github.com/layzerar/recastlib/ !
    '''

    def __init__(self):
        self.navmesh=OrderedDict()

    def build(self,obj,folder=".",floor="0"):# {{{
        file_obj="{}/{}.obj".format(folder, floor)
        file_nav="{}/{}.nav".format(folder, floor)
        file_conf="{}/recast.yml".format(folder)
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
            self.navmesh[floor] = dt.dtLoadSampleTileMesh(file_nav)
        except:
            raise SystemExit("Navmesh: cannot create {}".format(file_nav))

# }}}
    def query(self,q,floor="0"):# {{{
        filtr = dt.dtQueryFilter()
        query = dt.dtNavMeshQuery()

        status = query.init(self.navmesh[floor], 2048)
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

        status, out = query.findPath(startRef, endRef, startPos, endPos, filtr, 32)
        if dt.dtStatusFailed(status):
            return "err", -4, status
        pathRefs = out["path"]

        status, fixEndPos = query.closestPointOnPoly(pathRefs[-1], endPos)
        if dt.dtStatusFailed(status):
            return "err", -5, status

        status, out = query.findStraightPath(startPos, fixEndPos, pathRefs, 32, 0)
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

