import os 
import sys
from subprocess import Popen,PIPE

# gearman -f aOut "g1 /etc/fstab"
# gearman -f aRun  "g1 /etc/fstab"
#Popen("scp {}:{} {}/workers/{}".format(sys.argv[1], sys.argv[2], os.environ['AAMKS_PROJECT'], os.path.basename(sys.argv[2]), shell=True)
Popen("scp {}:{} {}/workers/197/{}".format(sys.argv[1], sys.argv[2], os.environ['AAMKS_PROJECT'], sys.argv[1]), shell=True)
