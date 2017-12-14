import os 
import sys
from subprocess import Popen,PIPE

# gearman -f aOut "g1 /etc/fstab"
Popen("scp {}:{} {}/vis/{}".format(sys.argv[1], sys.argv[2], os.environ['AAMKS_PROJECT'], os.path.basename(sys.argv[2])), shell=True)
