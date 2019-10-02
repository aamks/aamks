from collections import OrderedDict
from subprocess import Popen,PIPE
import time
import sys
import os
import json
import shutil
from distutils.dir_util import copy_tree
from include import Json
from include import Psql
from include import Sqlite
from include import Dump as dd
from include import SimIterations
from include import Vis
from include import GetUserPrefs
from geom.nav import Navmesh

class OnInit():
    def __init__(self):# {{{
        ''' Stuff that happens at the beggining of the project '''

        if len(sys.argv) > 1: os.environ["AAMKS_PROJECT"]=sys.argv[1]
        if len(sys.argv) > 2: os.environ["AAMKS_USER_ID"]=sys.argv[2]
        self.json=Json()
        self.conf=self.json.read("{}/conf.json".format(os.environ['AAMKS_PROJECT']))
        self.project_id=self.conf['project_id']
        self.scenario_id=self.conf['scenario_id']
        self.p=Psql()
        self._clear_srv_anims()
        self._clear_sqlite()
        self.s=Sqlite("{}/aamks.sqlite".format(os.environ['AAMKS_PROJECT']))
        self._setup_simulations()
        self._create_sqlite_tables()
# }}}
    def _clear_srv_anims(self):# {{{
        ''' 
        Need to detect and remove obsolete srv animations. Server always
        overwrites anims.json and we need to prevent the dumplicates in
        Animator right menu entries.

        We try: because there may be no anims.json just yet.

        TODO: it is possible we could just remove this file and remove all
        server animations. But would it hurt workers animations?
        ''' 

        try:
            anims=self.json.read("{}/workers/anims.json".format(os.environ['AAMKS_PROJECT']))
            new_anims=[]
            for a in anims:
                if a['srv'] != 1:
                    new_anims.append(a)
            self.json.write(new_anims, "{}/workers/anims.json".format(os.environ['AAMKS_PROJECT']))
        except:
            pass

        try:
            os.remove("{}/workers/static.json".format(os.environ['AAMKS_PROJECT']))
            os.remove("{}/dd_geoms.json".format(os.environ['AAMKS_PROJECT']))
        except:
            pass
# }}}
    def _clear_sqlite(self):# {{{
        try:
            os.remove("{}/aamks.sqlite".format(os.environ['AAMKS_PROJECT']))
        except:
            pass
# }}}
    def _create_iterations_sequence(self):# {{{
        '''
        For a given project we may run simulation 0 to 999. Then we may wish to
        run 100 simulations more and have them numbered here: from=1000 to=1099
        These from and to numbers are unique for the project and are used as
        rand seeds in later aamks modules. This is similar, but distinct from
        SimIterations() - we are creating the sequence, and the later reads the
        sequence from/to. Remember that range(1,4) returns 1,2,3; hence SELECT
        max(iteration)+1 
        '''

        how_many=self.conf['number_of_simulations']

        r=[]
        try:
            # If the project already exists in simulations table (e.g. adding 100 simulations to existing 1000); try: fails on addition on int+None.
            r.append(self.p.query('SELECT max(iteration)+1 FROM simulations WHERE project=%s AND scenario_id=%s', (self.project_id, self.scenario_id))[0][0])
            r.append(r[0]+how_many)
        except:
            # If a new project
            r=[1, how_many+1]
        return r
# }}}
    def _setup_simulations(self):# {{{
        ''' Simulation dir maps to id from psql's simulations table'''

        workers_dir="{}/workers".format(os.environ['AAMKS_PROJECT']) 
        os.makedirs(workers_dir, exist_ok=True)

        irange=self._create_iterations_sequence()
        for i in range(*irange):
            sim_dir="{}/{}".format(workers_dir,i)
            os.makedirs(sim_dir, exist_ok=True)
            self.p.query("INSERT INTO simulations(iteration,project,scenario_id) VALUES(%s,%s,%s)", (i,self.project_id, self.scenario_id))

# }}}
    def _create_sqlite_tables(self): # {{{
        ''' At least some tables must be create early for Vis() etc. '''

        self.s.query("CREATE TABLE dispatched_evacuees(json)")
# }}}

class OnEnd():
    def __init__(self):# {{{
        ''' Stuff that happens at the end of the project '''
        self.json=Json()
        self.uprefs=GetUserPrefs()
        self.conf=self.json.read("{}/conf.json".format(os.environ['AAMKS_PROJECT']))
        self.s=Sqlite("{}/aamks.sqlite".format(os.environ['AAMKS_PROJECT']))
        self.project_id=self.conf['project_id']
        self.scenario_id=self.conf['scenario_id']
        if self.uprefs.get_var('navmesh_debug')==1:
            self._test_navmesh()
        Vis({'highlight_geom': None, 'anim': None, 'title': "OnEnd()", 'srv': 1})
        self._gearman_register_works()
# }}}
    def _test_navmesh(self):# {{{
        navs={}
        for floor in self.json.readdb('floors_meta').keys():
            z=self.s.query("SELECT name FROM aamks_geom WHERE floor=? AND room_enter='no'", (floor,))
            bypass_rooms=[]
            for i in z:
                bypass_rooms.append(i['name'])
            navs[tuple(bypass_rooms)]=Navmesh()
            navs[tuple(bypass_rooms)].build(floor,bypass_rooms)
            navs[tuple(bypass_rooms)].test()
# }}}
    def _gearman_register_works(self):# {{{
        ''' 
        We only register works. The works will be run by workers registered via
        manager. 
        '''

        if os.environ['AAMKS_USE_GEARMAN']=='0':
            return

        si=SimIterations(self.project_id, self.scenario_id, self.conf['number_of_simulations'])
        try:
            for i in range(*si.get()):
                worker="{}/workers/{}".format(os.environ['AAMKS_PROJECT'],i)
                worker = worker.replace("/home","")
                gearman="gearman -b -f aRun 'https://{}{}'".format(os.environ['AAMKS_SERVER'], worker)
                os.system(gearman)
        except Exception as e:
            print('OnEnd: {}'.format(e))
            
# }}}
