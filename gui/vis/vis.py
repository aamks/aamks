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
import json
from numpy.random import randint
from include import Sqlite
from include import Json
from include import Dump as dd

# }}}

class Vis():
    def __init__(self,highlight_geom,src='image',title='',fire_origin=[]):# {{{
        ''' 
        Html canvas module for src=image (read from sqlite geoms) or
        src=/path/to/animation (animate evacuues read from evac's json).
        src=image is how we ignore all aspects of animation. 
        '''

        self.s=Sqlite("{}/aamks.sqlite".format(os.environ['AAMKS_PROJECT']))
        self.json=Json()
        self.conf=self.json.read("{}/conf_aamks.json".format(os.environ['AAMKS_PROJECT']))
        self.title=title
        self.fire_origin=fire_origin
        self.highlight_geom=highlight_geom
        self.src=src

        self._static=OrderedDict()
        self._js_make_floors()
        self._js_make_rooms()
        self._js_make_doors()
        self._js_make_obstacles()
        self._js_append_paperjs_extras()

        self.vis_dir="{}/workers/vis".format(os.environ['AAMKS_PROJECT']) 
        self._save()
# }}}
    def _js_make_floors(self):# {{{
        '''
        1: [('meta', {'width': 5004 , 'animation_translate': [3502 , 500] , ... })]
        2: [('meta', {'width': 5004 , 'animation_translate': [3502 , 0]   , ... })]
        '''
        
        for floor,meta in json.loads(self.s.query("SELECT * FROM floors")[0]['json']).items():
            self._static[floor]=OrderedDict()
            self._static[floor]['meta']=OrderedDict(meta)
# }}}
    def _js_make_rooms(self):# {{{
        ''' Data for rooms. '''

        for floor in self._static.keys():
            self._static[floor]['rooms']=OrderedDict()
            for i in self.s.query("SELECT name,x0,y0,width,depth,type_sec FROM aamks_geom WHERE floor=? AND type_pri='COMPA'", (floor,)):
                self._static[floor]['rooms'][i['name']]=i

# }}}
    def _js_make_doors(self):# {{{
        ''' Data for doors. '''

        for floor in self._static.keys():
            self._static[floor]['doors']=OrderedDict()
            for i in self.s.query("SELECT name,x0,y0,center_x,center_y,width,depth,type_sec FROM aamks_geom WHERE floor=? AND type_tri='DOOR' AND type_sec != 'HOLE'", (floor,)):
                self._static[floor]['doors'][i['name']]=i
# }}}
    def _js_make_obstacles(self):# {{{
        ''' 
        Data for obstacles. It may happen that geom.py was interrupted before
        obstacles were created, so we produce a 0 size obstacle in try/except. 
        '''

        try:
            for floor,obstacles in json.loads(self.s.query("SELECT * FROM obstacles")[0]['json']).items():
                self._static[floor]['obstacles']=obstacles
        except:
            for floor in self._static.keys():
                self._static[floor]['obstacles']=[ dict([("x0",0), ("y0",0), ("width",0), ("depth",0) ]) ]
# }}}
    def _js_append_paperjs_extras(self):# {{{
        ''' 
        We can plot some extra rectangles, points, lines and circles on top of
        our paperjs geoms 
        '''

        try:
            for floor in self._static.keys():
                f=self.json.read("{}/paperjs_extras.json".format(os.environ['AAMKS_PROJECT']))
                self._static[floor]['paperjs_extras']=f

        except:
            for floor in self._static.keys():
                z=dict()
                z['rectangles']=[]      # z['rectangles'].append( { "xy": (1000+i*40, 500+i) , "width": 20 , "depth": 100 , "strokeColor": "#fff" , "strokeWidth": 2 , "fillColor": "#f80", "opacity": 0.7 } )
                z['lines']=[]           # z['lines'].append(      { "xy": (2000+i*40, 200+i*40), "x1": 3400, "y1": 500, "strokeColor": "#fff" , "strokeWidth": 2, "opacity": 0.7 } )
                z['circles']=[]         # z['circles'].append(    { "xy": (i['center_x'], i['center_y']), "radius": 80 , "fillColor": "#fff", "opacity": 0.3 } )
                z['texts']=[]           # z['texts'].append(      { "xy": (f['minx']+a*i, f['miny']+a*v), "content": "                                                                                         { }x { }".format(x,y), "fontSize": 20, "fillColor":"#06f", "opacity":0.5 })
                self._static[floor]['paperjs_extras']=z
            
# }}}
    def _save(self):# {{{
        ''' 
        Static.json is written each time, because obstacles may be available /
        non-available, so it is not constans. Except from static.json we update
        animations listing here (anims.json)
        '''

        self.json.write(self._static, '{}/static.json'.format(self.vis_dir)) 

        records=[]
        for floor in self._static.keys():
            anim_record=OrderedDict()
            if self.src=='image':
                anim_record['anim_json']=''
            else:
                anim_record['anim_json']="../{}".format(self.src)

            anim_record['title']=self.title
            anim_record['floor']=floor
            anim_record['fire_origin']=self.fire_origin
            anim_record['highlight_geom']=self.highlight_geom
            records.append(anim_record)

        try:
            z=self.json.read("{}/anims.json".format(self.vis_dir))
        except:
            z=[]
        z.append(records)
        dd(records)
        self.json.write(z, "{}/anims.json".format(self.vis_dir))
# }}}
