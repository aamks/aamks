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
from shapely.geometry import box, Polygon, LineString, Point, MultiPolygon
from colour import Color
from numpy.random import randint
from include import Sqlite
from include import Json
from include import Dump as dd

# }}}

class CfastTessellate():
    def __init__(self):
        ''' 
        Divide space into cells for queries of fire conditions asked by
        evacuees. Cells may be larger squares or smaller rectangles. First
        divide into squares of self._side. Iterate over squares and if any
        square is crossed by an obstacle divide this square further into
        rectangles. 
        
        For any evacuee's (x,y) it will be easy to find the square he is in. If
        we have rectangles in our square we use some optimizations to find the
        correct rectangle. Finally fetch the conditions from the cell. 
        ''' 

        self._side=400
        self.s=Sqlite("{}/aamks.sqlite".format(os.environ['AAMKS_PROJECT']))
        self._json=Json() 
        self._floor=1 
        self._floor_dimensions()
        self._init_space() 
        self._intersect_space() 
        self._optimize()
        self._make_cells() 
        self._plot_space() 
        self._query((1101, 1001))

    def _floor_dimensions(self):# {{{
        minx=self.s.query("SELECT min(x0) AS minx FROM aamks_geom WHERE floor=?", (self._floor,))[0]['minx']
        miny=self.s.query("SELECT min(y0) AS miny FROM aamks_geom WHERE floor=?", (self._floor,))[0]['miny']
        maxx=self.s.query("SELECT max(x1) AS maxx FROM aamks_geom WHERE floor=?", (self._floor,))[0]['maxx']
        maxy=self.s.query("SELECT max(y1) AS maxy FROM aamks_geom WHERE floor=?", (self._floor,))[0]['maxy']
        self._floor_dim=dict([ ('width', maxx-minx), ('height', maxy-miny), ('maxx', maxx), ('maxy', maxy), ('minx', minx), ('miny', miny)  ])
# }}}
    def _init_space(self):# {{{
        self.squares=OrderedDict()
        self.rectangles=OrderedDict()
        self.lines=[]

        for i in self.s.query("SELECT * FROM aamks_geom WHERE type_pri='COMPA' ORDER BY x0,y0"):
            self.lines.append(LineString([ Point(i['x0'],i['y0']), Point(i['x0'], i['y1'])] ))
            self.lines.append(LineString([ Point(i['x0'],i['y0']), Point(i['x1'], i['y0'])] ))
            self.lines.append(LineString([ Point(i['x1'],i['y1']), Point(i['x0'], i['y1'])] ))
            self.lines.append(LineString([ Point(i['x1'],i['y1']), Point(i['x1'], i['y0'])] ))

        self._side
        x=int(self._floor_dim['width']/self._side)+1
        y=int(self._floor_dim['height']/self._side)+1
        for v in range(y):
            for i in range(x):
                x_=self._floor_dim['minx']+self._side*i
                y_=self._floor_dim['miny']+self._side*v
                xy=(x_, y_)
                self.squares[xy]=box(x_, y_, x_+self._side, y_+self._side)
                self.rectangles[xy]=[]
# }}}
    def _candidate_intersection(self,id_,points):# {{{
        ''' 
        So there's an intersection "points" of the square and the walls of the
        room. We get 2 points in this call. Should we create a rectangle of any
        of these points? The rectangle is defined by it's (minX,minY) vertex.
        We only accept the points that belong to the square but don't lie on
        the maxX (right) and maxY (top) edges. Also, if the intersection is at
        where the big square originates, we don't want to produce the
        duplication rectangle (i != k) 
        '''

        right_limit=id_[0]+self._side
        top_limit=id_[1]+self._side
        for pt in list(zip(points.xy[0], points.xy[1])):
             if right_limit not in pt and top_limit not in pt:
                 if pt != id_:
                     self.rectangles[id_].append((int(pt[0]), int(pt[1])))
# }}}
    def _optimize(self):# {{{
        ''' 
        1. self.squares (collection of shapely boxen) is not needed anymore
        2. self.rectangles must have duplicates removed and must be sorted by x
        3. xy_vectors must be of the form: [ [x0,x1,x2,x3], [y0,y1,y2,y3] ]. 
        '''

        del(self.squares)

        for id_,rects in self.rectangles.items():
            self.rectangles[id_]=list(sorted(set(self.rectangles[id_])))

        self.query_vertices=OrderedDict()
        for id_,v in self.rectangles.items():
            self.query_vertices[id_]=OrderedDict()
            xy_vectors=list(zip(*self.rectangles[id_]))
            try:
                self.query_vertices[id_]['x']=xy_vectors[0]
                self.query_vertices[id_]['y']=xy_vectors[1]
            except:
                self.query_vertices[id_]['x']=()
                self.query_vertices[id_]['y']=()

        print("bytes", sys.getsizeof(self.rectangles))
# }}}
    def _make_cell_conditions(self,cell):# {{{
        self.cells_conditions[cell]=OrderedDict([ ('smoke', 0.1), ('temp', 0.2), ('vis', 0.3) ])
# }}}
    def _make_cells(self):#{{{
        self.cells_conditions=OrderedDict()
        for k,v in self.query_vertices.items():
            self._make_cell_conditions(k)
            for pt in list(zip(v['x'], v['y'])):
                self._make_cell_conditions(pt)
#}}}
    def _intersect_space(self):# {{{
        ''' 
        We have squares and search for rectangles: we see how squares are crossed by obstacles (walls).
        '''
        for line in self.lines: 
            for id_,square in self.squares.items():
                if square.intersects(line):
                    points=square.intersection(line)
                    if points.length>0:
                        self._candidate_intersection(id_,points)
        
# }}}
    def _query(self,q):# {{{
        ''' 
        Query returns the square for point q. If the square has rectangles,
        then we return the rectangle The first step is to find the x,y for the
        square. 
        '''

        x=self._floor_dim['minx'] + self._side * int((q[0]-self._floor_dim['minx'])/self._side) 
        y=self._floor_dim['miny'] + self._side * int((q[1]-self._floor_dim['miny'])/self._side)
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
    def _plot_space(self):# {{{
        z=OrderedDict()

        z['rectangles']=[]      # z['rectangles'].append( { "xy": (1000+i*40, 500+i) , "width": 20 , "depth": 100 , "strokeColor": "#fff" , "strokeWidth": 2 , "fillColor": "#f80", "opacity": 0.7 } )
        z['lines']=[]           # z['lines'].append(      { "xy": (2000+i*40, 200+i*40), "x1": 3400, "y1": 500, "strokeColor": "#fff" , "strokeWidth": 2, "opacity": 0.7 } )
        z['circles']=[]         # z['circles'].append(    { "xy": (i['center_x'], i['center_y']), "radius": 80 , "fillColor": "#fff", "opacity": 0.3 } )
        z['texts']=[]           # z['texts'].append(      { "xy": (f['minx']+a*i, f['miny']+a*v), "content": "                                                                                         { }x { }".format(x,y), "fontSize": 20, "fillColor":"#06f", "opacity":0.5 })
        radius=5

        # for i in self.s.query("SELECT * FROM aamks_geom WHERE type_pri='COMPA' ORDER BY x0,y0"):
        #     z['rectangles'].append( { "xy": (i['x0'], i['y0']), "width": i['width'] , "depth": i['depth'] , "strokeColor": "#f00" , "strokeWidth": 10 , "fillColor": "none", "opacity": 0.4 } )

        a=self._side
        for k,v in self.rectangles.items():
            z['rectangles'].append( { "xy": k, "width": a , "depth": a , "strokeColor": "#f80" , "strokeWidth": 0.3 , "opacity": 0.2 } )
            z['circles'].append(    { "xy": k, "radius": radius , "fillColor": "#fff", "opacity": 0.3 } )
            z['texts'].append(      { "xy": k, "content": k, "fontSize": 5, "fillColor":"#f0f", "opacity":0.7 })
            for mm in v:
                z['circles'].append( { "xy": mm, "radius": radius, "fillColor": "#fff", "opacity": 0.3 } )
                z['texts'].append(   { "xy": mm, "content": mm, "fontSize": 5, "fillColor":"#f0f", "opacity":0.7 })

        self._json.write(z, '{}/paperjs_extras.json'.format(os.environ['AAMKS_PROJECT']))
        #print('{}/paperjs_extras.json'.format(os.environ['AAMKS_PROJECT']))
# }}}
