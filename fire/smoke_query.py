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
from ast import literal_eval as make_tuple
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
        self.s=Sqlite("{}/aamks.sqlite".format(os.environ['AAMKS_PROJECT']))
        self._read_tessellation()
        self._make_cells_static()
        self._make_cells_dynamic()
        dd(self.cells_conditions)

    def _read_tessellation(self):# {{{
        ''' Python has this nice dict[(1,2)], but json cannot handle it. We
        have passed it as dict['(1,2)'] and know need to bring back from str to
        tuple.
        '''

        f=self.json.read("{}/workers/tessellation.json".format(os.environ['AAMKS_PROJECT']))
        self.side=f['side']
        self.floor_dim=f['floor_dim']
        self.query_vertices=OrderedDict()
        for k,v in f['query_vertices'].items():
            self.query_vertices[make_tuple(k)]=v
# }}}
    def _cell_static_data(self,cell):# {{{
        # TODO: inkscape project has incorrect room intersections :(
        try:
            z=self.s.query("SELECT name from aamks_geom WHERE type_pri='COMPA' AND ?>=x0 AND ?>=y0 AND ?<x1 AND ?<y1", (cell[0], cell[1], cell[0], cell[1]))[0]['name']
        except:
            z='outside'
        self.cells_conditions[cell]=OrderedDict([ ('cell', cell), ('compa',z) ])
# }}}
    def _make_cells_static(self):#{{{
        self.cells_conditions=OrderedDict()
        for k,v in self.query_vertices.items():
            self._cell_static_data(k)
            for pt in list(zip(v['x'], v['y'])):
                self._cell_static_data(pt)
#}}}
    def _make_cells_dynamic(self):#{{{
        for i in self.cells_conditions.keys():
            self.cells_conditions[i]['smoke']=0.1
            self.cells_conditions[i]['temp']=0.2
#}}}
    def query(self,q):# {{{
        ''' 
        First we find to which square our q belongs. If this square has 0 rectangles
        then we return conditions from the square. If the square has rectangles
        we need to loop through those rectangles. Finaly we read the smoke
        conditions from the cell. 
        '''

        x=self.floor_dim['minx'] + self.side * int((q[0]-self.floor_dim['minx'])/self.side) 
        y=self.floor_dim['miny'] + self.side * int((q[1]-self.floor_dim['miny'])/self.side)

        if len(self.query_vertices[x,y]['x'])==0:
            return "Conditions at {}x{}: {}".format(q[0],q[1], self.cells_conditions[x,y])
        else:
            for i in range(bisect.bisect(self.query_vertices[(x,y)]['x'], q[0]),0,-1):
                if self.query_vertices[(x,y)]['y'][i-1] < q[1]:
                    rx=self.query_vertices[(x,y)]['x'][i-1]
                    ry=self.query_vertices[(x,y)]['y'][i-1]
                    return "Conditions at {}x{}: {}".format(q[0],q[1], self.cells_conditions[rx,ry])
# }}}
