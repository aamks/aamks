# IMPORT# {{{
from collections import OrderedDict
import csv
import re
import os
import sys
import inspect
import bisect
import time
from ast import literal_eval as make_tuple
from numpy.random import randint

# }}}

def _read_records():
    ''' 
    Imitates CFAST producing 14 csv records in 5 seconds intervals
    '''

    data=OrderedDict()
    for letter in ['n', 's', 'w']:
        data[letter] = open('{}/fire/examples/cfast_{}.csv'.format(os.environ['AAMKS_PATH'], letter)).readlines()

    try:
        os.remove("/tmp/cfast_n.csv")
        os.remove("/tmp/cfast_s.csv")
        os.remove("/tmp/cfast_w.csv")
    except:
        pass

    n=open("/tmp/cfast_n.csv", 'a', 1) # append with line buffering
    s=open("/tmp/cfast_s.csv", 'a', 1) # append with line buffering
    w=open("/tmp/cfast_w.csv", 'a', 1) # append with line buffering

    for i in range(14):
        time.sleep(5)
        n.write(data['n'][i])
        s.write(data['s'][i])
        w.write(data['w'][i])
    n.close()
    s.close()
    w.close()

_read_records()
