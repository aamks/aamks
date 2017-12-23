#!/usr/bin/python3
import os
import sys
sys.path.append(os.environ['AAMKS_PATH'])
from include import Json
import json
from collections import OrderedDict
from subprocess import Popen,PIPE
import zipfile

class WorkerReport():
    def __init__(self, sim_id, animation_data, psql_data): # {{{
        ''' 
        Runs on a worker. 
        Write /home/aamks/sim_id.json on each aRun completion.
        Then inform gearman server to scp to itself /home/aamks/sim_id.json via aOut service.
        Gearman server will process this json in manager/results_collector.py.
        Gearman server will psql insert and will scp the worker's animation to itself. 
        '''
        self.sim_id=sim_id
        self._write_report(psql_data)
        self._write_animation(animation_data)
    # }}}
    def _write_report(self, psql_data):# {{{
        j=Json()
        host=os.uname()[1]
        report=OrderedDict()
        report['worker']=host
        report['sim_id']=self.sim_id 
        report['animation']="/home/aamks/{}.anim.zip".format(self.sim_id)
        report['psql']=psql_data
        json_file="/home/aamks/report_{}.json".format(self.sim_id)
        j.write(report, json_file)
        Popen("gearman -h {} -f aOut '{} {} {}'".format(os.environ['AAMKS_SERVER'], host, json_file, self.sim_id), shell=True)
    # }}}
    def _write_animation(self, animation_data):# {{{
        zf = zipfile.ZipFile("/home/aamks/{}.anim.zip".format(self.sim_id), mode='w', compression=zipfile.ZIP_DEFLATED)
        try:
            zf.writestr("anim.json", json.dumps(animation_data))
        finally:
            zf.close()
    # }}}

def example_animation_data():# {{{
    animation_data=dict()
    animation_data['data']=[
            [ [ 1000 , 1150 , 20  , 200  , "N" , 1 ] , [ 1000 , 1150 , 200 , 0   , "N" , 1 ] ] ,
            [ [ 1100 , 1850 , 200 , -300 , "N" , 1 ] , [ 1500 , 1150 , 200 , 0   , "N" , 1 ] ] ,
            [ [ 1500 , 1150 , 200 , 80   , "N" , 0 ] , [ 5000 , 1150 , 200 , 0   , "N" , 1 ] ] ,
            [ [ 5000 , 1850 , 200 , -200 , "N" , 0 ] , [ 6000 , 1150 , 200 , 0   , "N" , 1 ] ] ,
            [ [ 6000 , 1150 , 200 , 200  , "N" , 0 ] , [ 0    , 0    , 200 , 200 , "N" , 0 ] ] ,
            [ [ 0    , 0    , 200 , 200  , "N" , 0 ] , [ 0    , 0    , 200 , 200 , "N" , 0 ] ] 
        ]            
    animation_data['frame_rate']=2
    animation_data['frame_rate']=2
    animation_data['project_name']="test1"
    animation_data['simulation_id']=sys.argv[1]
    animation_data['simulation_time']=200
    animation_data['time_shift']=150.61 
    return animation_data
# }}}

sys.argv.append("1")
report=WorkerReport(os.path.basename(sys.argv[1]), example_animation_data(), "some psql data")
