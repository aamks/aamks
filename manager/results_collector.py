import os 
import sys
from subprocess import Popen,PIPE

sys.path.append(os.environ['AAMKS_PATH'])
from include import Json
from collections import OrderedDict

'''
1. aamksrun makes gearman pass the job to worker: 
    /usr/local/aamks/tests/worker_report.py
2. Worker calls gearman server back with: Popen("gearman -h {} -f aOut '{} {}'".format(os.environ['AAMKS_SERVER'], report['hostname'], json_file), shell=True)
3. This file implements gearman's aOut function:
    * download json with configuration to workers/123/report_123.json
    * download animation to workers/123/123.anim.zip
'''

dest_dir="{}/workers/{}".format(os.environ['AAMKS_PROJECT'], sys.argv[3])
json_file="{}/report_{}.json".format(dest_dir, sys.argv[3])
Popen(["scp", "{}:{}".format(sys.argv[1], sys.argv[2]), json_file]).wait()
json=Json()
data=json.read(json_file)
print(["scp", "{}:{}".format(sys.argv[1], data['animation']), dest_dir])
Popen(["scp", "{}:{}".format(sys.argv[1], data['animation']), dest_dir])
