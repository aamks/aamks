import os 
import sys
from subprocess import Popen,PIPE

sys.path.append(os.environ['AAMKS_PATH'])
from include import Json
from collections import OrderedDict

'''
1. aamksrun makes gearman pass the job to worker: (,E)
    /usr/local/aamks/tests/worker_report.py
2. Worker calls gearman back with: Popen("gearman -h {} -f aOut '{} {}'".format(os.environ['AAMKS_SERVER'], report['hostname'], json_file), shell=True)
3. This file implements gearman's aOut function realizować
'''

# gearman -f aOut "g1 /usr/local/aamks/tests/report.json"
# gearman -f aRun  "g1 /usr/local/aamks/examples/simple/1.anim.zip"
#Popen("scp {}:{} {}/workers/{}".format(sys.argv[1], sys.argv[2], os.environ['AAMKS_PROJECT'], os.path.basename(sys.argv[2]), shell=True)

#sys.argv=['mm', 'g1', 'ff']
#print("scp {}:{} {}/".format(sys.argv[1], sys.argv[2], os.environ['AAMKS_PROJECT']))

# get json 
Popen("scp {}:{} {}/workers/".format(sys.argv[1], sys.argv[2], os.environ['AAMKS_PROJECT']), shell=True)
