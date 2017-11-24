# IMPORT# {{{
from collections import OrderedDict
from math import sqrt
import codecs
import itertools
import numpy as np
import os
import json
import sys
import inspect
import bisect
from numpy.random import randint
from include import Sqlite
from include import Json
from include import Dump as dd

# }}}

class SmokeQuery():
    def __init__(self):
        ''' 
        On init fill each cell with smoke conditions. Then you can query an (x,y). 
        ''' 
        #print("{}/workers/tessellation.json".format(os.environ['AAMKS_PROJECT']))
        self.json=Json() 
        f=self.json.read("{}/workers/tessellation.json".format(os.environ['AAMKS_PROJECT']))
        self.query_vertices=f['query_vertices']
        self.side=f['side']
        self.floor_dim=f['floor_dim']
        self._make_cells()

    def _make_cell_conditions(self,cell):# {{{
        self.cells_conditions[str(cell)]=OrderedDict([ ('smoke', 0.1), ('temp', 0.2), ('vis', 0.3) ])
# }}}

    def _make_cells(self):#{{{
        self.cells_conditions=OrderedDict()
        for k,v in self.query_vertices.items():
            self._make_cell_conditions(k)
            for pt in list(zip(v['x'], v['y'])):
                self._make_cell_conditions(pt)
#}}}
    def query(self,q):# {{{
        ''' 
        Query returns the square for point q. If the square has rectangles,
        then we return the rectangle The first step is to find the x,y for the
        square. 
        '''

        x=self.floor_dim['minx'] + self.side * int((q[0]-self.floor_dim['minx'])/self.side) 
        y=self.floor_dim['miny'] + self.side * int((q[1]-self.floor_dim['miny'])/self.side)
        print("todo", q,x,y)
        #dd(self.query_vertices[(x,y)])
        #dd(self.query_vertices)
        if len(self.query_vertices[(x,y)]['x'])==0:
            print(q, "in square ({},{}). Conditions:".format(x,y), self.cells_conditions[(x,y)])
        else:
            for i in range(bisect.bisect(self.query_vertices[(x,y)]['x'], q[0])-1,0,-1):
                print(i)
                if self.query_vertices[(x,y)]['y'][i] < q[1]:
                    rx=self.query_vertices[(x,y)]['x'][i]
                    ry=self.query_vertices[(x,y)]['y'][i]
                    print(q, "in rectangle ({},{}). Conditions:".format(rx,ry), self.cells_conditions[(rx,ry)])
                    return
# }}}
