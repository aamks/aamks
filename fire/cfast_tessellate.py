# IMPORT# {{{
from collections import OrderedDict
import itertools
import numpy as np
import os
import sys
import inspect
from shapely.geometry import box, Polygon, LineString, Point, MultiPolygon
from numpy.random import randint
from include import Sqlite
from include import Json
from include import Dump as dd

# }}}

class CfastTessellate():
    def __init__(self):
        ''' 
        Divide space into cells for smoke conditions queries asked by evacuees.
        Cells may be larger squares or smaller rectangles. First divide into
        squares of self._side. Iterate over squares and if any square is
        crossed by an obstacle divide this square further into rectangles. 
        
        For any evacuee's (x,y) it will be easy to find the square he is in. If
        we have rectangles in our square we use some optimizations to find the
        correct rectangle. Finally fetch the conditions from the cell. ''' 

        self._side=400
        self.s=Sqlite("{}/aamks.sqlite".format(os.environ['AAMKS_PROJECT']))
        self.json=Json() 
        self._floor=1 
        self._floor_dimensions()
        self._init_space() 
        self._intersect_space() 
        self._optimize()
        self._plot_space() 
        self._save()

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
        the maxX (right) and maxY (top) edges. 
        '''

        right_limit=id_[0]+self._side
        top_limit=id_[1]+self._side
        for pt in list(zip(points.xy[0], points.xy[1])):
            if right_limit != pt[0] and top_limit != pt[1]:
                self.rectangles[id_].append((int(pt[0]), int(pt[1])))
# }}}
    def _optimize(self):# {{{
        ''' 
        * self.squares (collection of shapely boxen) is not needed anymore
        * self.rectangles must have duplicates removed and must be sorted by x
        * xy_vectors must be of the form: [ [x0,x1,x2,x3], [y0,y1,y2,y3] ]. 
        '''

        del(self.squares)

        for id_,rects in self.rectangles.items():
            self.rectangles[id_]=list(sorted(set(rects)))

        self.query_vertices=OrderedDict()
        for id_,v in self.rectangles.items():
            self.query_vertices[str(id_)]=OrderedDict()
            xy_vectors=list(zip(*self.rectangles[id_]))
            try:
                self.query_vertices[str(id_)]['x']=xy_vectors[0]
                self.query_vertices[str(id_)]['y']=xy_vectors[1]
            except:
                self.query_vertices[str(id_)]['x']=()
                self.query_vertices[str(id_)]['y']=()

        #print("bytes", sys.getsizeof(self.rectangles))
# }}}
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
    def _plot_space(self):# {{{
        z=OrderedDict()

        z['rectangles']=[]      # z['rectangles'].append( { "xy": (1000+i*40, 500+i) , "width": 20 , "depth": 100 , "strokeColor": "#fff" , "strokeWidth": 2 , "fillColor": "#f80", "opacity": 0.7 } )
        z['lines']=[]           # z['lines'].append(      { "xy": (2000+i*40, 200+i*40), "x1": 3400, "y1": 500, "strokeColor": "#fff" , "strokeWidth": 2, "opacity": 0.7 } )
        z['circles']=[]         # z['circles'].append(    { "xy": (i['center_x'], i['center_y']), "radius": 80 , "fillColor": "#fff", "opacity": 0.3 } )
        z['texts']=[]           # z['texts'].append(      { "xy": (f['minx']+a*i, f['miny']+a*v), "content": "                                                                                         { }x { }".format(x,y), "fontSize": 20, "fillColor":"#06f", "opacity":0.5 })
        radius=5

        #for i in self.s.query("SELECT * FROM aamks_geom WHERE type_pri='COMPA' ORDER BY x0,y0"):
        #     z['rectangles'].append( { "xy": (i['x0'], i['y0']), "width": i['width'] , "depth": i['depth'] , "strokeColor": "#f00" , "strokeWidth": 10 , "fillColor": "none", "opacity": 0.4 } )

        a=self._side
        for k,v in self.rectangles.items():
            z['rectangles'].append( { "xy": k, "width": a , "depth": a , "strokeColor": "#f80" , "strokeWidth": 0.3 , "opacity": 0.2 } )
            z['circles'].append(    { "xy": k, "radius": radius , "fillColor": "#fff", "opacity": 0.3 } )
            z['texts'].append(      { "xy": k, "content": k, "fontSize": 5, "fillColor":"#f0f", "opacity":0.7 })
            for mm in v:
                z['circles'].append( { "xy": mm, "radius": radius, "fillColor": "#fff", "opacity": 0.3 } )
                z['texts'].append(   { "xy": mm, "content": mm, "fontSize": 5, "fillColor":"#f0f", "opacity":0.7 })

        self.json.write(z, '{}/paperjs_extras.json'.format(os.environ['AAMKS_PROJECT']))
        #print('{}/paperjs_extras.json'.format(os.environ['AAMKS_PROJECT']))
# }}}
    def _save(self):# {{{
        data=OrderedDict()
        data['floor_dim']=self._floor_dim
        data['side']=self._side
        data['query_vertices']=self.query_vertices
        #data['cells_conditions']=self.cells_conditions
        #print("{}/workers/smoke.json".format(os.environ['AAMKS_PROJECT']))
        self.json.write(data, "{}/workers/tessellation.json".format(os.environ['AAMKS_PROJECT']))
        # }}}
