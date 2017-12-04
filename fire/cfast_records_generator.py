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
    data=OrderedDict()
    for letter in ['n', 's', 'w']:
        data[letter] = open('{}/fire/test/cfast_{}.csv'.format(os.environ['AAMKS_PATH'], letter)).readlines()

    w=open("/tmp/write.txt", 'a', 1) # append
    for i in data['n']:
        time.sleep(3)
        w.write(i)
    w.close()

_read_records()
