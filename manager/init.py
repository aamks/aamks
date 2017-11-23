from collections import OrderedDict
from subprocess import Popen,PIPE
import sys
import os
import shutil
from distutils.dir_util import copy_tree
from include import Json
from include import Psql
from include import Dump as dd
from include import SimIterations
from gui.vis.vis import Vis 

class OnInit():
    def __init__(self):# {{{
        ''' Stuff that happens at the beggining of the project '''
        if len(sys.argv) > 1:
            os.environ["AAMKS_PROJECT"]=sys.argv[1]
        self.json=Json()
        self.conf=self.json.read("{}/conf_aamks.json".format(os.environ['AAMKS_PROJECT']))
        self.p=Psql()
        self._clear_sqlite()
        self._setup_simulations()
        self._setup_vis()
        self._setup_anim_master()
        self._info()
# }}}
    def _info(self):# {{{
        Popen('env | grep AAMKS', shell=True)
# }}}
    def _clear_sqlite(self):# {{{
        try:
            os.remove("{}/aamks.sqlite".format(os.environ['AAMKS_PROJECT']))
        except:
            pass
# }}}
    def _create_iterations_sequence(self):# {{{
        ''' For a given project we may run simulation 0 to 999. Then we may wish to run 100 simulations more and have them numbered here: from=1000 to=1099
        These from and to numbers are unique for the project and are used as rand seeds in later aamks modules. 
        This is similar, but distinct from SimIterations() - we are creating the sequence, and the later reads the sequence from/to.
        Remember that range(1,4) returns 1,2,3; hence SELECT max(iteration)+1
        '''
        project=self.conf['GENERAL']['PROJECT_NAME']
        how_many=self.conf['GENERAL']['NUMBER_OF_SIMULATIONS']

        r=[]
        try:
            # If the project already exists in simulations table (e.g. adding 100 simulations to existing 1000); try: fails on addition on int+None.
            r.append(self.p.query('SELECT max(iteration)+1 FROM simulations WHERE project=%s', (project,))[0][0])
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
            os.makedirs("{}/{}".format(workers_dir,i), exist_ok=True)
            self.p.query("INSERT INTO simulations(iteration,project) VALUES(%s,%s)", (i,self.conf['GENERAL']['PROJECT_NAME']))

# }}}
    def _setup_vis(self):# {{{
        vis_dir="{}/vis".format(os.environ['AAMKS_PROJECT']) 
        try:
            os.remove("{}/vis/paperjs_extras.json".format(os.environ['AAMKS_PROJECT']))
        except:
            pass
        os.makedirs(vis_dir, exist_ok=True)
        copy_tree("{}/gui/vis/js".format(os.environ['AAMKS_PATH']), "{}/js".format(vis_dir) )
        shutil.copyfile("{}/gui/vis/css.css".format(os.environ['AAMKS_PATH']), "{}/css.css".format(vis_dir))
# }}}
    def _setup_anim_master(self):# {{{
        path="{}/vis/master.html".format(os.environ['AAMKS_PROJECT'])
        with open(path, "w") as f:
            f.write('''<!DOCTYPE HTML>
<html>
<head>
    <meta charset="UTF-8">
    <meta http-equiv=Content-Type content='text/html; charset=utf-8' />
    <title>Aamks</title>
    <link rel='stylesheet' type='text/css' href='css.css'>
    <link href='https://fonts.googleapis.com/css?family=Play' rel='stylesheet'>
    <link href='https://fonts.googleapis.com/icon?family=Material+Icons' rel='stylesheet'>
        <script type="text/javascript" src="js/jquery.js"></script>
        <script type="text/javascript" src="js/paper-full.js"></script>
        <script type="text/javascript" src="js/jszip.min.js"></script>
        <script type="text/javascript" src="js/jszip-utils.js"></script>
        <script type="text/paperscript" canvas="canvas" src="js/aamks.js" ></script>
</head>
<body>
<div>
    <vis-title></vis-title>
    &nbsp; &nbsp;
    <show-animation-setup-box>[setup]</show-animation-setup-box>
    
    <animation-setup-box>
        <table>
            <tr><td>Animation           <td><choose-vis></choose-vis> 
            <tr><td>Highlight           <td><highlight-geoms></highlight-geoms> 
            <tr><td>Style               <td><change-style></change-style> 
            <tr><td>Labels size         <td><size-labels></size-labels> 
            <tr><td>Walls size          <td><size-walls></size-walls> 
            <tr><td>Doors size          <td><size-doors></size-doors> 
            <tr><td>Balls size          <td><size-balls></size-balls> 
            <tr><td>Vectors size        <td><size-velocities></size-velocities> 
            <tr><td>Speed               <td><animation-speed></animation-speed>
        </table>
    </animation-setup-box>
</div>
<canvas-mouse-coords></canvas-mouse-coords>
<svg-slider></svg-slider>

<canvas id="canvas" resize hidpi="off" />

''')
# }}}

class OnEnd():
    def __init__(self):# {{{
        ''' Stuff that happens at the end of the project '''
        self.json=Json()
        self.conf=self.json.read("{}/conf_aamks.json".format(os.environ['AAMKS_PROJECT']))
        self.p=Psql()
        self._gearman_workers()
        self._visualize()
# }}}
    def _gearman_workers(self):# {{{
        ''' Gearman must run after server generated all data for workers to download '''

        if os.environ['AAMKS_USE_GEARMAN']=='0':
            return

        si=SimIterations(self.conf['GENERAL']['PROJECT_NAME'], self.conf['GENERAL']['NUMBER_OF_SIMULATIONS'])
        for i in range(*si.get()):
            worker="{}/workers/{}".format(os.environ['AAMKS_PROJECT'],i)
            gearman="gearman -f gEGG http://{}/users{} &".format(os.environ['AAMKS_SERVER'],worker.replace("/home/aamks_users",""))
            os.system(gearman)
            #print(gearman)
# }}}
    def _visualize(self):# {{{
        Vis(1, None, '1.anim.zip', "evac 1", (3000,1500))
        Vis(1, None, '2.anim.zip', "evac 2", (4000,1600))
        Vis(1, None, '3.anim.zip', "evac 3" )
        Vis(1, None, '4.anim.zip', "evac 4" )
# }}}
