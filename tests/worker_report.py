#!/usr/bin/python3
import os
import sys
sys.path.append(os.environ['AAMKS_PATH'])
from include import Json
from collections import OrderedDict
from subprocess import Popen,PIPE

class WorkerReport():
    def __init__(self, path): 
        ''' Write /path/report.json on each aRun completion '''
        json=Json()
        host=os.uname()[1]
        report=OrderedDict()
        report['hostname']=host
        report['args']=", ".join(sys.argv)
        report['animation']="{}/{}.anim.zip".format(path,host)
        report['results']="psql report"
        json_file="{}/{}.json".format(path, host)
        json.write(report, json_file)
        Popen("gearman -h {} -f aOut '{} {}'".format(os.environ['AAMKS_SERVER'], host, json_file), shell=True)

report=WorkerReport("/home/aamks")
