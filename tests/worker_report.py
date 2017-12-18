import os
import sys
sys.path.append(os.environ['AAMKS_PATH'])
from include import Json
from collections import OrderedDict

''' write /tmp/report.json after each aRun call '''

json=Json()
report=OrderedDict()
report['animation']="/usr/local/aamks/examples/simple/1.anim.zip"
report['hostname']=os.uname()[1]
report['results']=["some data"]
json.write(report, "/tmp/report.json")


