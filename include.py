from collections import OrderedDict
from datetime import datetime
from math import sqrt
from numpy.random import randint
from subprocess import Popen
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
    Useful for debuging gearman workers. In the past we had jabber here.
    '''

    def __init__(self,msg):
        with open("/tmp/aamks.log", "a") as f: 
            f.write(str(msg)+"\n")
# }}}
class Dump:# {{{
    def __init__(self,*args):
        '''debugging function, much like print but handles various types better'''
        print()
        for struct in args:
            if isinstance(struct, list):
                for i in struct:
                    print(i)
            elif isinstance(struct, tuple):
                for i in struct:
                    print(i)
            elif isinstance(struct, dict):
                for k, v in struct.items():
                    print (str(k)+':', v)
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

    def __init__(self, project, scenario_id, how_many):
        self.p=Psql()
        self.project=project
        self.scenario_id=scenario_id
        self.how_many=how_many

    def get(self):
        self.r=[]
        try:
            # If project already exists in simulations table (e.g. adding 100 simulations to existing 1000)
            _max=self.p.query("SELECT max(iteration)+1 FROM simulations WHERE project={} AND scenario_id={}".format(self.project,self.scenario_id))[0][0]
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

    def dict_insert(self, table, named_records):
        columns = ', '.join(named_records.keys())
        placeholders = ':'+', :'.join(named_records.keys())
        query='INSERT INTO {} ({}) VALUES ({})'.format(table, columns, placeholders)
        self.query(query, named_records)

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
        print("project: {}".format(os.environ['AAMKS_PROJECT']))
        print()
        for i in self.query('SELECT * FROM aamks_geom order by floor,type_pri,global_type_id'):
            print(i)

    def dump_geoms(self,floor='all'):
        print("dump_geom() from caller: {}, {}".format(inspect.stack()[1][1], inspect.stack()[1][3]))
        print("project: {}".format(os.environ['AAMKS_PROJECT']))
        print()
        if floor=='all':
            print("f;name;x0;y0;x1;y1;z0;z1;pri;sec")
            for i in self.query('SELECT floor,name,x0,y0,x1,y1,z0,z1,type_pri,type_sec FROM aamks_geom ORDER BY floor,type_pri,global_type_id'):
                print("{};{};{};{};{};{};{};{};{};{}".format(i['floor'],i['name'],i['x0'], i['y0'], i['x1'], i['y1'], i['z0'], i['z1'], i['type_pri'], i['type_sec']))
        else:
            print("name;x0;y0;x1;y1;z0;z1")
            for i in self.query('SELECT name,x0,y0,x1,y1,z0,z1 FROM aamks_geom WHERE floor=? ORDER BY type_pri,global_type_id', (floor,)):
                print("{};{};{};{};{};{};{}".format(i['name'],i['x0'], i['y0'], i['x1'], i['y1'], i['z0'], i['z1']))

    def dumpall(self):
        ''' Remember to add all needed sqlite tables here '''
        print("dump() from caller: {}, {}".format(inspect.stack()[1][1], inspect.stack()[1][3]))
        print("project: {}".format(os.environ['AAMKS_PROJECT']))
        print()
        for i in ('aamks_geom', 'floors_meta', 'obstacles', 'partition', 'cell2compa', 'navmeshes'):
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
    def close(self):
        self.SQLITE.close()

# }}}
class Psql: # {{{
    def __init__(self):

        import psycopg2
        import psycopg2.extras

        try:
            self._project_name=os.path.basename(os.environ['AAMKS_PROJECT'])
        except:
            pass

        try:
            self.PSQL=psycopg2.connect("dbname='aamks' user='aamks' host='127.0.0.1' password='{}'".format(os.environ['AAMKS_PG_PASS']))
            self.psqldb=self.PSQL.cursor(cursor_factory=psycopg2.extras.DictCursor)
        except:
            raise SystemExit("Fatal: Cannot connect to postresql.")

    def query(self,query,data=tuple()):
        ''' Query. Return results as dict. '''
        self.psqldb.execute(query,data)
        self.PSQL.commit()
        if query[:6] in("select", "SELECT"):
            return self.psqldb.fetchall() 

    def copy_expert(self, sql, csv_file):
        cursor = self.PSQL.cursor()
        with open(csv_file, "w") as f:
            cursor.copy_expert(sql, f)

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
    def readdb(self,table):
        if not hasattr(self, 's'):
            self.s=Sqlite("{}/aamks.sqlite".format(os.environ['AAMKS_PROJECT']))
        return json.loads(self.s.query("SELECT json FROM {}".format(table))[0]['json'])
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
class GetUserPrefs:# {{{
    def __init__(self):# {{{
        self.p=Psql()
        if 'AAMKS_USER_ID' not in os.environ:
            os.environ["AAMKS_USER_ID"]=str(1)

        self.pconf=json.loads(self.p.query("SELECT preferences FROM users WHERE id=%s", (os.environ['AAMKS_USER_ID'],))[0][0])
    def get_var(self, var):
        return self.pconf[var]

# }}}
# }}}
class DDgeoms:# {{{
    '''
    dd_geoms are some optional extra rectangles, points, paths and
    circles that are written on top of our geoms. Useful for developing
    and debugging features. 

    styles: 'fillColor', 'strokeColor', 'strokeWidth', 'opacity', 'fontSize', 'dashArray': [10,20] 


    params:

        ddgeoms({"type": "circle"   , "g": {"p0": (0, 0) , "radius": 10        },               "floor": "0" , "style": {"fillColor": "#f00" }})
        ddgeoms({"type": "rectangle", "g": {"p0": (0, 0) , "size": (100, 200)  },               "floor": "0" , "style": {"fillColor": "#f00" }})
        ddgeoms({"type": "text"     , "g": {"p0": (0, 0) , "content": "Hello!" },               "floor": "0" , "style": {"fillColor": "#f00" }})
        ddgeoms({"type": "path"     , "g": {"p0": (0, 0) , "points": [(100, 200), (200,200)]},  "floor": "0" , "style": {"fillColor": "#f00" }})

    '''

    def open(self):# {{{
        self.json=Json()
        try:
            self.zz=self.json.read('{}/dd_geoms.json'.format(os.environ['AAMKS_PROJECT']))
        except:
            self.zz={}
# }}}
    def add(self,params):# {{{
        floor=params['floor']
        tt=params['type']
        del params['floor']
        del params['type']
        if floor not in self.zz:
            self.zz[floor]={ 'rectangle': [], 'path': [], 'circle': [], 'text': [] }
        if "p0" in params['g']: params['g']["p0"]=[ int(params['g']['p0'][0]), int(params['g']['p0'][1]) ]
        if "p1" in params['g']: params['g']["p1"]=[ int(params['g']['p1'][0]), int(params['g']['p1'][1]) ]
        if "points" in params['g']: params['g']["points"]=[ [int(i), int(j)] for i,j in params['g']['points'] ]
        params['g']=json.dumps(params['g'])
        self.zz[floor][tt].append(params)
# }}}
    def write(self):# {{{
        self.json.write(self.zz, '{}/dd_geoms.json'.format(os.environ['AAMKS_PROJECT']))
# }}}
# }}}
class Vis:# {{{
    def __init__(self,params):# {{{
        ''' 
        Static.json is written each time, because obstacles may be available /
        non-available, so it is not constans. 
        '''

        self.s=Sqlite("{}/aamks.sqlite".format(os.environ['AAMKS_PROJECT']))
        self.json=Json()
        self.conf=self.json.read("{}/conf.json".format(os.environ['AAMKS_PROJECT']))
        self.params=params

        self._static_floors=OrderedDict()
        self._js_make_floors_and_meta()
        self._js_make_rooms()
        self._js_make_doors()
        self._js_make_obstacles()
        self._js_make_dd_geoms()
        self._js_make_srv_evacuees()
        self._js_vis_fire_origin()
        self._js_world_meta()
        self.json.write(OrderedDict([('world_meta', self._world_meta), ('floors', self._static_floors)]), '{}/workers/static.json'.format(os.environ['AAMKS_PROJECT'])) 
        cae=CreateAnimEntry()
        cae.save(self.params, "{}/workers/anims.json".format(os.environ['AAMKS_PROJECT']))
# }}}
    def _js_make_floors_and_meta(self):# {{{
        ''' Animation meta tells how to scale and translate canvas view '''
        
        for floor,meta in self.json.readdb("floors_meta").items(): 
            self._static_floors[floor]=OrderedDict()
            self._static_floors[floor]['floor_meta']=meta
# }}}
    def _js_make_rooms(self):# {{{
        ''' Data for rooms. '''

        for floor in self._static_floors.keys():
            self._static_floors[floor]['rooms']=OrderedDict()
            for i in self.s.query("SELECT name,points,type_sec,room_enter FROM aamks_geom WHERE floor=? AND type_pri='COMPA'", (floor,)):
                self._static_floors[floor]['rooms'][i['name']]=OrderedDict([ ('name', i['name']), ('type_sec', i['type_sec']), ('room_enter', i['room_enter']), ('points', i['points'])])
# }}}
    def _js_make_doors(self):# {{{
        ''' Data for doors. '''

        for floor in self._static_floors.keys():
            self._static_floors[floor]['doors']=OrderedDict()
            for i in self.s.query("SELECT name,points,type_sec FROM aamks_geom WHERE floor=? AND type_tri='DOOR' AND type_sec != 'HOLE'", (floor,)):
                self._static_floors[floor]['doors'][i['name']]=OrderedDict([ ('name', i['name']), ('type_sec', i['type_sec']), ('points', i['points'])])
# }}}
    def _js_make_obstacles(self):# {{{
        ''' 
        Data for obstacles. 
        '''

        if "skip_obstacles" in self.params:
            xx={'obstacles': {} }
            dummy_obst=[[ [-1000, -1000, 0], [-1000, -1000, 0], [-1000, -1000, 0], [-1000, -1000, 0], [-1000, -1000, 0] ]]
            for floor in self._static_floors.keys():
                xx['obstacles'][floor]=dummy_obst
        else:
            xx=JSON.readdb("obstacles")

        for floor,obstacles in xx['obstacles'].items():
            self._static_floors[floor]['obstacles']=[]
            for obstacle in obstacles:
                self._static_floors[floor]['obstacles'].append(json.dumps([ (o[0], o[1])  for o in obstacle ]))

# }}}
    def _js_make_srv_evacuees(self):# {{{
        ''' Draw srv, non-animated evacuees '''

        if "skip_evacuees" in self.params:
            for floor,meta in self.json.readdb("floors_meta").items(): 
                self._static_floors[floor]['evacuees']=[]
        else:
            for floor,evacuees in JSON.readdb("dispatched_evacuees").items():
                self._static_floors[floor]['evacuees']=[]
                for i in evacuees:
                    self._static_floors[floor]['evacuees'].append(json.dumps(i))
# }}}
    def _js_make_dd_geoms(self):# {{{
        try:
            f=self.json.read("{}/dd_geoms.json".format(os.environ['AAMKS_PROJECT']))
        except:
            pass

        for floor in self._static_floors.keys():
            try:
                self._static_floors[floor]['dd_geoms']=f[floor]
            except:
                self._static_floors[floor]['dd_geoms']={ 'rectangle': [], 'path': [], 'circle': [], 'text': [] }
# }}}
    def _js_vis_fire_origin(self):# {{{
        if "skip_fire_origin" in self.params:
            self.params['fire_origin']=None
        else:
            z=self.s.query("SELECT floor, x, y FROM fire_origin")
            self.params['fire_origin']={'floor': z[0]['floor'], 'x': z[0]['x'], 'y': z[0]['y'] }
# }}}
    def _js_world_meta(self):# {{{
        try:
            self._world_meta=JSON.readdb("world_meta")['world2d']
        except:
            self._world_meta={ 'minx': 0, 'miny': 0, 'maxx': 3000, 'maxy': 2000, 'xdim': 3000, 'ydim': 2000, 'center': [1500, 100, 0] }
# }}}
# }}}
class CreateAnimEntry:# {{{
    ''' 
    Animator renderer for static img | animation

    params for self.save()
    ======
    highlight_geom: geom to highlight in Animator
    anim: animation file | empty
    title: title
    srv: 0 | 1 (worker | server). 1 serves the purposes:
        * previous server visuals are obsolete and need to be removed
        * initial Apainter's evacuees will be displayed
    skip_evacuees: optional; good for cfast_partition.py calls before evacuees are ready
    skip_fire_origin: optional; good for cfast_partition.py calls before fire_origin is ready
    '''

    def _reorder_anims(self, z):# {{{
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
    def save(self, params, path_anims_json):# {{{

        self.json=Json()

        try:
            z=self.json.read(path_anims_json)
            z,lowest_id=self._reorder_anims(z)
        except:
            z=[]
            lowest_id=-1

        anim_record=OrderedDict()
        anim_record['sort_id']=lowest_id
        #lowest_id-=1
        anim_record['title']=params['title']
        anim_record['time']=datetime.now().strftime('%H:%M')
        anim_record['fire_origin']=params['fire_origin']
        anim_record['highlight_geom']=params['highlight_geom']
        anim_record['srv']=params['srv']
        anim_record['anim']=params['anim']
        records={}
        records[anim_record['title']] = anim_record

        # We are removing duplicates here
        for i in z:
            # TODO: Jul.2019: perhaps this breaks worker animations. Consider r['srv'] == 1 ?
            if i['title'] not in records:
                records[i['title']]=i

        self.json.write(list(records.values()), path_anims_json)
        #dd(records)
# }}}
# }}}

dd=Dump
JSON=Json()
