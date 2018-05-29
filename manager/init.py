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
        self.json=Json()
        self.conf=self.json.read("{}/conf_aamks.json".format(os.environ['AAMKS_PROJECT']))
        self.project_id=self.conf['general']['project_id']
        self.p=Psql()
        self._clear_sqlite()
        self._setup_simulations()
        self._setup_vis()
        self._setup_anim_master()
        self._info()
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

        how_many=self.conf['general']['number_of_simulations']

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
        os.chmod(workers_dir, 0o777)

        irange=self._create_iterations_sequence()
        for i in range(*irange):
            sim_dir="{}/{}".format(workers_dir,i)
            os.makedirs(sim_dir, exist_ok=True)
            os.chmod(sim_dir, 0o777)
            self.p.query("INSERT INTO simulations(iteration,project) VALUES(%s,%s)", (i,self.project_id))

# }}}
    def _setup_vis(self):# {{{
        vis_dir="{}/workers/vis".format(os.environ['AAMKS_PROJECT']) 
        # TODO: may be useful at some occasion, who knows...
        try:
            os.remove("{}/workers/vis/dd_geoms.json".format(os.environ['AAMKS_PROJECT']))
        except:
            pass
        os.makedirs(vis_dir, exist_ok=True)
        os.chmod(vis_dir, 0o777)
        copy_tree("{}/gui/vis/js".format(os.environ['AAMKS_PATH']), "{}/js".format(vis_dir) )
        os.remove("{}/js/aamks.js".format(vis_dir) )
        os.symlink("{}/gui/vis/js/aamks.js".format(os.environ['AAMKS_PATH']), "{}/js/aamks.js".format(vis_dir) )
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
    def _info(self):# {{{
        print("Project id: {} run.\n".format(self.project_id))
# }}}
class OnEnd():
    def __init__(self):# {{{
        ''' Stuff that happens at the end of the project '''
        self.json=Json()
        self.conf=self.json.read("{}/conf_aamks.json".format(os.environ['AAMKS_PROJECT']))
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

        si=SimIterations(self.project_id, self.conf['general']['number_of_simulations'])
        try:
            for i in range(*si.get()):
                worker="{}/workers/{}".format(os.environ['AAMKS_PROJECT'],i)
                worker = worker.replace("/home","")
                gearman="gearman -b -f aRun 'http://{}{}'".format(os.environ['AAMKS_SERVER'], worker)
                os.system(gearman)
        except Exception as e:
            print('An error code occured: {}'.format(e))
        else: 
            print('{} simulations run successfully'.format(i))
            
# }}}
