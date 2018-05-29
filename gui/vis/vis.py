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
from datetime import datetime
from numpy.random import randint
from include import Sqlite
from include import Json
from include import Dump as dd

# }}}

class Vis():
    def __init__(self,highlight_geom,src='image',title='',fire_origin=[]):# {{{
        ''' 
        Html canvas module for src=image (read from sqlite geoms) or
        src=animation_directory in workers/ directory. We will then search for
        e.g. workers/85/anim.zip file. src=image is how we ignore all aspects
        of animation. 
        '''

        self.s=Sqlite("{}/aamks.sqlite".format(os.environ['AAMKS_PROJECT']))
        self.json=Json()
        self.conf=self.json.read("{}/conf_aamks.json".format(os.environ['AAMKS_PROJECT']))
        self.title=title
        self.fire_origin=fire_origin
        self.highlight_geom=highlight_geom
        self.src=src

        self._static=OrderedDict()
        self._js_make_floors_and_meta()
        self._js_make_rooms()
        self._js_make_doors()
        self._js_make_obstacles()
        self._js_make_dd_geoms()

        self.vis_dir="{}/workers/vis".format(os.environ['AAMKS_PROJECT']) 
        self._save()
# }}}
    def _js_make_floors_and_meta(self):# {{{
        ''' Animation meta tells how to scale and translate canvas view '''
        
        for floor,meta in json.loads(self.s.query("SELECT * FROM floors")[0]['json']).items():
            self._static[floor]=OrderedDict()
            self._static[floor]['meta']=OrderedDict()
            self._static[floor]['meta']['scale']=meta['animation_scale']
            self._static[floor]['meta']['translate']=meta['animation_translate']
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
            _json=json.loads(self.s.query("SELECT * FROM obstacles")[0]['json'])
            for floor,obstacles in _json['named'].items():
                self._static[floor]['obstacles']=obstacles
        except:
            for floor in self._static.keys():
                self._static[floor]['obstacles']=[ dict([("x0",0), ("y0",0), ("width",0), ("depth",0) ]) ]
# }}}
    def _js_make_dd_geoms(self):# {{{
        ''' 
        dd_geoms are initialized in geom.py. Those are optional extra
        rectangles, points, lines and circles that are written to on top of our
        geoms. Useful for debugging.
        '''

        f=self.json.read("{}/dd_geoms.json".format(os.environ['AAMKS_PROJECT']))
        for floor in self._static.keys():
            self._static[floor]['dd_geoms']=f[floor]
# }}}
    def _js_reorder_animations(self, z):# {{{
        '''
        sort_id -1, -2, -3 come from the server.
        sort_id > 1 come from workers -- sort_id is sim_id.
        We want to display latest from the server on top, then the workers.
        The server starts with -1 and next animations have -1 added.
        '''

        sorted_anims=[]
        d=[]
        for i,j in enumerate(z):
            d.append((j['sort_id'],i))
        sorted_d=sorted(d)
        for i in sorted_d:
            sorted_anims.append(z[i[1]])
        lowest_id=sorted_d[0][0]
        return (sorted_anims, lowest_id - 1)

# }}}
    def _save(self):# {{{
        ''' 
        Static.json is written each time, because obstacles may be available /
        non-available, so it is not constans. Except from static.json we update
        animations listing here (anims.json) Animations are also updated from
        workers via gearman. 
        '''

        self.json.write(self._static, '{}/static.json'.format(self.vis_dir)) 

        try:
            z=self.json.read("{}/anims.json".format(self.vis_dir))
            z,lowest_id=self._js_reorder_animations(z)
        except:
            z=[]
            lowest_id=-1

        records=[]
        for floor in self._static.keys():
            anim_record=OrderedDict()
            anim_record['sort_id']=lowest_id
            lowest_id-=1
            anim_record['title']="{}-{}, f{}".format(self.title, datetime.now().strftime('%H:%M'), floor)
            anim_record['floor']=floor
            anim_record['fire_origin']=self.fire_origin
            anim_record['highlight_geom']=self.highlight_geom
            if self.src=='image':
                anim_record['anim']=''
            else:
                anim_record['anim']="{}".format(self.src)

            records = [anim_record] + records

        z = records + z
        self.json.write(z, "{}/anims.json".format(self.vis_dir))
        os.chmod("{}/anims.json".format(self.vis_dir), 0o777)
# }}}
