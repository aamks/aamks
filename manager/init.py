from collections import OrderedDict
from subprocess import Popen,PIPE
import http.server
import socketserver
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
        self._kill_http_server()
        self.json=Json()
        self.conf=self.json.read("{}/conf_aamks.json".format(os.environ['AAMKS_PROJECT']))
        self.p=Psql()
        self._clear_sqlite()
        self._setup_simulations()
        self._setup_vis()
        self._setup_anim_master()
        self._info()
        self._http_serve()
# }}}
    def _kill_http_server(self):# {{{
        ''' 
        Python serves vis data at localhost:8123. When we change aamks project,
        we need to chdir and serve vis data from there, so we need to kill the old
        python webserver. It may need some time to release the resources, so we
        kill it early and then serve again as late as possible -- onEnd(). 
        '''

        Popen('pkill -9 -f "^python3 -m http.server 8123"', shell=True)
# }}}
    def _info(self):# {{{
        print("Project name:", self.conf['PROJECT_NAME'])
        Popen('env | grep AAMKS', shell=True)
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

        project=self.conf['PROJECT_NAME']
        how_many=self.conf['NUMBER_OF_SIMULATIONS']

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
            self.p.query("INSERT INTO simulations(iteration,project) VALUES(%s,%s)", (i,self.conf['PROJECT_NAME']))

# }}}
    def _setup_vis(self):# {{{
        vis_dir="{}/workers/vis".format(os.environ['AAMKS_PROJECT']) 
        try:
            os.remove("{}/workers/vis/paperjs_extras.json".format(os.environ['AAMKS_PROJECT']))
        except:
            pass
        os.makedirs(vis_dir, exist_ok=True)
        copy_tree("{}/gui/vis/js".format(os.environ['AAMKS_PATH']), "{}/js".format(vis_dir) )
        shutil.copyfile("{}/gui/vis/css.css".format(os.environ['AAMKS_PATH']), "{}/css.css".format(vis_dir))
        shutil.copyfile("{}/geom/colors.json".format(os.environ['AAMKS_PATH']), "{}/colors.json".format(vis_dir))
# }}}
    def _setup_anim_master(self):# {{{
        path="{}/workers/vis/master.html".format(os.environ['AAMKS_PROJECT'])

        with open(path, "w") as f:
            f.write('''<!DOCTYPE HTML>
<html>
<head>
    <meta charset="UTF-8">
    <meta http-equiv=Content-Type content='text/html; charset=utf-8' />
    <link href='https://fonts.googleapis.com/css?family=Play' rel='stylesheet'>
    <link href='https://fonts.googleapis.com/icon?family=Material+Icons' rel='stylesheet'>
    <title>Aamks</title>
    <link rel='stylesheet' type='text/css' href='css.css'>
        <script type="text/javascript" src="js/jquery.js"></script>
        <script type="text/javascript" src="js/paper-full.js"></script>
        <script type="text/javascript" src="js/jszip.min.js"></script>
        <script type="text/javascript" src="js/jszip-utils.js"></script>
        <script type="text/paperscript" canvas="canvas" src="js/aamks.js" ></script>
</head>
<body>
<div>
    <vis-title></vis-title> &nbsp; &nbsp; Time: <sim-time></sim-time>
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
    def _http_serve(self):# {{{
        ''' 
        We also serve animations via localhost:8123. 
        2>/dev/null ignores "OSError: [Errno 98] Address already in use"
        '''

        Popen('cd {}; python3 -m http.server 8123 2>/dev/null 1>/dev/null'.format(os.environ['AAMKS_PROJECT']), shell=True)
# }}}

class OnEnd():
    def __init__(self):# {{{
        ''' Stuff that happens at the end of the project '''
        self.json=Json()
        self.conf=self.json.read("{}/conf_aamks.json".format(os.environ['AAMKS_PROJECT']))
        self.p=Psql()
        self._gearman_register_results_collector()
        self._gearman_register_works()
        self._visualize_aanim()
# }}}
    def _gearman_register_results_collector(self):# {{{
        ''' 
        The worker reports each complete work to aOut service.
        Gearman can then connect to worker machine and download the results.
        '''

        Popen("(echo workers ; sleep 0.1) | netcat {} 4730 | grep -q aOut || {{ gearman -w -h {} -f aOut xargs python3 {}/manager/results_collector.py; }}".format(os.environ['AAMKS_SERVER'], os.environ['AAMKS_SERVER'], os.environ['AAMKS_PATH']), shell=True)
# }}}
    def _gearman_register_works(self):# {{{
        ''' 
        We only register works. The works will be run by workers registered via
        manager. 
        '''

        if os.environ['AAMKS_USE_GEARMAN']=='0':
            return

        si=SimIterations(self.conf['PROJECT_NAME'], self.conf['NUMBER_OF_SIMULATIONS'])
        project=self.conf['PROJECT_NAME']
        for i in range(*si.get()):
            worker="{}/workers/{}".format(os.environ['AAMKS_PROJECT'],i)
            gearman="gearman -f aRun 'http://{}/users{} {} &'".format(os.environ['AAMKS_SERVER'],worker.replace("/home/aamks_users",""), project)
            os.system(gearman)
# }}}
    def _visualize_aanim(self):# {{{
        ''' If we chosen to see the animated demo of aamks. '''

        if self.conf['PROJECT_NAME'] == 'aanim':
            si=SimIterations(self.conf['PROJECT_NAME'], self.conf['NUMBER_OF_SIMULATIONS'])
            project=self.conf['PROJECT_NAME']
            for i in range(*si.get()):
                worker_dir="{}/workers/{}".format(os.environ['AAMKS_PROJECT'],i)
                shutil.copyfile("{}/examples/aanim/anim.zip".format(os.environ['AAMKS_PATH'])  , "{}/anim.zip".format(worker_dir))
                shutil.copyfile("{}/examples/aanim/evac.json".format(os.environ['AAMKS_PATH']) , "{}/evac.json".format(worker_dir))
                Vis(None, "aanim", "aanim", (0,0))
# }}}
