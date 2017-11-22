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
from colour import Color
from numpy.random import randint
from include import Sqlite
from include import Json
from include import Dump as dd

# }}}

class Vis():
    def __init__(self,floor,highlight_geom,src='image',title='',fire_origin=[]):# {{{
        ''' Html canvas module for src=image (read from sqlite geoms) or src=/path/to/animation (animate evacuues read from evac's json). 
        src=image is how we ignore all aspects of animation. '''

        self.s=Sqlite("{}/aamks.sqlite".format(os.environ['AAMKS_PROJECT']))
        self.json=Json()
        self.conf=self.json.read("{}/conf_aamks.json".format(os.environ['AAMKS_PROJECT']))
        self.floor=floor
        self.title=title
        self.fire_origin=fire_origin
        self.highlight_geom=highlight_geom
        self.src=src

        self.jsonCommon=OrderedDict()
        self.jsonOut=OrderedDict()
        self.jsonOut['title']=self.title
        self._scale_and_translate()
        self._js_make_rooms()
        self._js_make_doors()
        self._js_make_obstacles()
        self._js_append_paperjs_extras()

        self.vis_dir="{}/vis".format(os.environ['AAMKS_PROJECT']) 
        self._make_json_common()
        self._register_animation()
# }}}

    def _floor_dimensions(self):# {{{
        minx=self.s.query("SELECT min(x0) AS minx FROM aamks_geom WHERE floor=?", (self.floor,))[0]['minx']
        miny=self.s.query("SELECT min(y0) AS miny FROM aamks_geom WHERE floor=?", (self.floor,))[0]['miny']
        maxx=self.s.query("SELECT max(x1) AS maxx FROM aamks_geom WHERE floor=?", (self.floor,))[0]['maxx']
        maxy=self.s.query("SELECT max(y1) AS maxy FROM aamks_geom WHERE floor=?", (self.floor,))[0]['maxy']

        return dict([ ('width', maxx-minx), ('height', maxy-miny), ('maxx', maxx), ('maxy', maxy), ('minx', minx), ('miny', miny)  ])
# }}}
    def _scale_and_translate(self):# {{{
        ''' Canvas size is 1600 x 800 in css.css. Calculate how to scale the whole floor to fit the canvas. 
        Minima don't have to be at (0,0) in autocad, therefore we also need to translate the drawing for the canvas. '''

        f=self._floor_dimensions()
        self.jsonOut['scale']=round(min(1600/f['width'],800/f['height'])*0.95, 2) # 0.95 is canvas padding
        self.jsonOut['translate']=[ int(f['maxx']-0.5*f['width']), int(f['maxy']-0.5*f['height']) ]

# }}}
    def _js_make_rooms(self):# {{{
        ''' Data for rooms. Coords and colors. '''
        self.jsonCommon['rooms']=OrderedDict()
        for i in self.s.query("SELECT short,x0,y0,width,depth,type_sec FROM aamks_geom WHERE floor=? AND type_pri='COMPA'", (self.floor,)):
            self.jsonCommon['rooms'][i['short']]=i

# }}}
    def _js_make_doors(self):# {{{
        ''' Data for doors. Coords and colors. '''
        self.jsonCommon['doors']=OrderedDict()
        for i in self.s.query("SELECT short,x0,y0,center_x,center_y,width,depth,type_sec FROM aamks_geom WHERE floor=? AND type_tri='DOOR' AND type_sec != 'HOLE'", (self.floor,)):
            self.jsonCommon['doors'][i['short']]=i
# }}}
    def _js_make_obstacles(self):# {{{
        ''' Data for obstacles. It may happen that geom.py was interrupted before obstacles were created, so there are no obstacles in geom.json, hence try/except. '''
        try:
            self.jsonCommon['obstacles']=[]
            for i in self.json.read("{}/geom.json".format(os.environ['AAMKS_PROJECT']))['obstacles'][str(self.floor)]:
                k=list(zip(*i))
                # x               , y         , width                 , height
                coords={ "x0": min(k[0]) , "y0": min(k[1]) , "width": max(k[0]) - min(k[0]), "depth": max(k[1]) - min(k[1]) } 
                self.jsonCommon['obstacles'].append(coords)

        except:
            self.jsonCommon['obstacles']=[ { "x0":0, "y0":0, "width":0, "height":0 } ]
            
# }}}

    def _js_append_paperjs_extras(self):# {{{
        ''' We can plot some extra rectangles, points, lines and circles on top of our paperjs geoms '''

        try:
            f=self.json.read("{}/paperjs_extras.json".format(os.environ['AAMKS_PROJECT']))
            self.jsonCommon['paperjs_extras']=f

        except:
            z=dict()
            z['rectangles']=[]      # z['rectangles'].append( { "xy": (1000+i*40, 500+i) , "width": 20 , "depth": 100 , "strokeColor": "#fff" , "strokeWidth": 2 , "fillColor": "#f80", "opacity": 0.7 } )
            z['lines']=[]           # z['lines'].append(      { "xy": (2000+i*40, 200+i*40), "x1": 3400, "y1": 500, "strokeColor": "#fff" , "strokeWidth": 2, "opacity": 0.7 } )
            z['circles']=[]         # z['circles'].append(    { "xy": (i['center_x'], i['center_y']), "radius": 80 , "fillColor": "#fff", "opacity": 0.3 } )
            z['texts']=[]           # z['texts'].append(      { "xy": (f['minx']+a*i, f['miny']+a*v), "content": "                                                                                         { }x { }".format(x,y), "fontSize": 20, "fillColor":"#06f", "opacity":0.5 })
            self.jsonCommon['paperjs_extras']=z
            
# }}}

    def _make_json_common(self):# {{{
        ''' Common geometry is written once. '''
        self.json.write(self.jsonCommon, '{}/floor_{}.json'.format(self.vis_dir, self.floor)) 

# }}}
    def _register_animation(self):# {{{
        ''' todo: description master.html is created in init/init.py
        '''

        if self.src=='image':
            anim_source=''
        else:
            anim_source=self.src

        self.jsonOut['geom_json']='floor_{}.json'.format(self.floor) 
        self.jsonOut['anim_json']="../"+anim_source
        self.jsonOut['fire_origin']=self.fire_origin
        self.jsonOut['highlight_geom']=self.highlight_geom

        try:
            z=self.json.read("{}/anims.json".format(self.vis_dir))
        except:
            z=[]
        z.append(self.jsonOut)
        with open("{}/anims.json".format(self.vis_dir), mode='w', encoding='utf-8') as f:
            json.dump(z, f)
# }}}
