#!/usr/bin/python3
import os
import sys
sys.path.append(os.environ['AAMKS_PATH'])
from include import Json
from collections import OrderedDict
from subprocess import Popen,PIPE

class WorkerReport():
    def __init__(self, path, sim_id): 
        ''' 
        Runs on a worker. 
        Write /home/aamks/sim_id.json on each aRun completion.
        Then inform gearman server to scp to itself /home/aamks/sim_id.json via aOut service.
        Gearman server will process this json in manager/results_collector.py.
        Gearman server will psql insert and will scp the worker's animation to itself. 
        '''

        json=Json()
        host=os.uname()[1]
        dest=sim_id
        report=OrderedDict()
        report['hostname']=host
        report['sim_id']=sim_id 
        report['animation']="{}/{}.anim.zip".format(path,dest)
        report['results']="psql report"
        json_file="{}/report_{}.json".format(path, dest)
        json.write(report, json_file)
        Popen("gearman -h {} -f aOut '{} {} {}'".format(os.environ['AAMKS_SERVER'], host, json_file, dest), shell=True)

report=WorkerReport("/home/aamks", os.path.basename(sys.argv[1]))
