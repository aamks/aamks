from collections import OrderedDict
from subprocess import Popen,PIPE
import time
import sys
import os
import shutil
from distutils.dir_util import copy_tree
from include import Json
from include import Psql
from include import Dump as dd
from include import SimIterations
from include import Vis

class OnInit():
    def __init__(self):# {{{
        ''' Stuff that happens at the beggining of the project '''

        if len(sys.argv) > 1:
            os.environ["AAMKS_PROJECT"]=sys.argv[1]
        self.json=Json()
        self.conf=self.json.read("{}/conf.json".format(os.environ['AAMKS_PROJECT']))
        self.project_id=self.conf['project_id']
        self.p=Psql()
        self._clear_srv_anims()
        self._clear_sqlite()
        self._setup_simulations()
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
            r.append(self.p.query('SELECT max(iteration)+1 FROM simulations WHERE project=%s', (self.project_id,))[0][0])
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
            self.p.query("INSERT INTO simulations(iteration,project) VALUES(%s,%s)", (i,self.project_id))

# }}}
class OnEnd():
    def __init__(self):# {{{
        ''' Stuff that happens at the end of the project '''
        self.json=Json()
        self.conf=self.json.read("{}/conf.json".format(os.environ['AAMKS_PROJECT']))
        self.project_id=self.conf['project_id']
        self.p=Psql()
        self._gearman_register_works()
# }}}
    def _gearman_register_works(self):# {{{
        ''' 
        We only register works. The works will be run by workers registered via
        manager. 
        '''

        if os.environ['AAMKS_USE_GEARMAN']=='0':
            return

        si=SimIterations(self.project_id, self.conf['number_of_simulations'])
        try:
            for i in range(*si.get()):
                worker="{}/workers/{}".format(os.environ['AAMKS_PROJECT'],i)
                worker = worker.replace("/home","")
                gearman="gearman -b -f aRun 'https://www.ctrk.pl:444{}'".format(worker)
                os.system(gearman)
        except Exception as e:
            print('OnEnd: {}'.format(e))
            
# }}}
