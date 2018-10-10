from collections import OrderedDict
import os
import sys
import sqlite3
import inspect
import json
from subprocess import Popen,PIPE

class SendMessage:# {{{
    ''' 
    SendMessage() may fail if there are unescaped bash special chars. 
    First we try to send the msg as it is, and if that fails, we convert to
    alphanums only.
    '''

    def __init__(self,msg):
        with open("/tmp/aamks.log", "a") as f: 
            f.write(msg+"\n")
        for to in [ i.strip() for i in os.environ['AAMKS_NOTIFY'].split(",") ]:
            try:
                Popen("printf '{}' | sendxmpp -r aamks -d -t -u aamks -p aamkstatanka -j jabb.im {}> /dev/null 2>/dev/null &".format(msg, to), shell=True)
            except:
                msg="".join([ c if c.isalnum() else " " for c in msg ])
                Popen("printf '{}' | sendxmpp -r aamks -d -t -u aamks -p aamkstatanka -j jabb.im {}> /dev/null 2>/dev/null &".format(msg, to), shell=True)
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
            raise Exception("Fatal: Cannot connect to postresql.")

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
        self.conf=self.json.read("{}/conf_aamks.json".format(os.environ['AAMKS_PROJECT']))
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
            raise Exception("\n\nMissing or invalid json: {}.".format(path)) 

    def write(self, data, path, pretty=0): 
        try:
            if pretty==1:
                pretty=json.dumps(data, indent=4)
                f=open(path, 'w')
                f.write(pretty)
                f.close()
            else:
                f=open(path, 'w')
                json.dump(data, f)
                f.close()
        except:
            raise Exception("\n\nCannot write json: {}.".format(path)) 


# }}}
