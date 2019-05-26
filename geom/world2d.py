# MODULES
# {{{
import json
import shutil
import os
import re
import sys
import codecs
import itertools

from pprint import pprint
from collections import OrderedDict
from shapely.geometry import box, Polygon, LineString, Point, MultiPolygon
from shapely.ops import polygonize
from numpy.random import uniform
from math import sqrt
from math import floor
from include import Sqlite
from include import Json
from include import Dump as dd
from geom.obstacles import Obstacles

# }}}

class World2d():
    def __init__(self):# {{{

        self.json=Json()
        self.conf=self.json.read("{}/conf.json".format(os.environ['AAMKS_PROJECT']))
        self.s=Sqlite("{}/aamks.sqlite".format(os.environ['AAMKS_PROJECT']))
        self.global_meta=self.json.readdb("global_meta")
        self.floors_meta=self.json.readdb("floors_meta")
        self.floors=self.floors_meta.keys()
        self.walls_width=self.global_meta['walls_width']
        self.projections={'top':dict(), 'side':dict()}

        self._top_projection_make()
        self._side_projection_make()
        self._db_rectangles_top()
        self._db_rectangles_side()
        self._world2d_make()
        self._extra_geoms_make()
        exit()
        Obstacles("world2d", "world2d_obstacles", self._extra_geoms_make())
        dd(self.json.readdb("world2d_obstacles"))
        exit()
# }}}
    def _extra_geoms_make(self):
        print("insert obstacles x0,y0 into aamks_geom?")
        exit()

    def _top_projection_make(self):# {{{
        '''
        In world2d we have top and left projections
        '''

        self.projections['top']['padding_rectangle']=300
        self.projections['top']['padding_vertical']=200
        self.projections['top']['x0']=self.s.query("SELECT min(x0) AS m FROM aamks_geom")[0]['m'] - self.projections['top']['padding_rectangle']
        self.projections['top']['x1']=self.s.query("SELECT max(x1) AS m FROM aamks_geom")[0]['m']
        self._top_proj_lines()
        self._top_translate_geoms()
# }}}
    def _top_translate_geoms(self):# {{{
        '''
        All geoms must be y-translated
        '''

        self.s.query("CREATE TABLE world2d(name,floor,global_type_id,hvent_room_seq,vvent_room_seq,type_pri,type_sec,type_tri,x0,y0,z0,width,depth,height,cfast_width,sill,face,face_offset,vent_from,vent_to,material_ceiling,material_floor,material_wall,heat_detectors,smoke_detectors,sprinklers,is_vertical,vent_from_name,vent_to_name, how_much_open, room_area, x1, y1, z1, center_x, center_y, center_z, fire_model_ignore,mvent_throughput,exit_type,room_enter)")
        self.s.query("INSERT INTO world2d SELECT * FROM aamks_geom")
        for floor,line in self.projections['top']['lines'].items():
            ty=line - self.projections['top']['padding_vertical'] - self.floors_meta[floor]['maxy']  
            self.s.query("UPDATE world2d SET y0=y0+?, y1=y1+?, center_y=center_y+?, z0=0, z1=0, center_z=0 WHERE floor=?", (ty,ty,ty,floor))

# }}}
    def _top_proj_lines(self):# {{{
        '''
        Helper horizontal lines for Animator: 2, 1, 0
        '''

        lines=OrderedDict()
        absolute=0
        for floor in list(self.floors_meta.keys())[::-1]:
            if absolute==0:
                lines[floor]=absolute + self.floors_meta[floor]['ydim'] + self.projections['top']['padding_vertical']
            else:
                lines[floor]=absolute + self.floors_meta[floor]['ydim'] + self.projections['top']['padding_vertical'] * 2 
            absolute=lines[floor]
        self.projections['top']['lines']=lines

# }}}

    def _side_projection_make(self):# {{{
        '''
        The floor segment of a staircase (FSoS) is a cuboid which may be
        perceived as a deformed plane originally. It can be shown, that the
        agents' capacity of FSoS equals the number of agents on a flat floor
        (top projections). 

        In Animator the agents will have the same balls sizes for top and side
        views. Therefore we need to scale the staircase height so that the same
        number of agents fits the given cuboid. 

        FSoS side projections must then equal the size of the room_area which
        must equal height x width. 

        We need to calculate how many FSoS'es there are for each staircase
        (tower_span).

        Assumption: on the top-most-floor there only fit two rows of agents,
        i.e. 2 x 54cm balls rows =~ 120 area.

        '''

        self.projections['side']['padding_rectangle']=300
        self.projections['side']['animator_floor_height']=1000
        self.projections['side']['top_floor_area']=120
        self.projections['side']['x0']=self.s.query("SELECT max(x1) AS m FROM aamks_geom")[0]['m'] + self.projections['side']['padding_rectangle']

        self._side_proj_towers()
        self._side_proj_max_spans()
        self._side_proj_lines()
        self._side_proj_rectangles()
        self._side_proj_width()
# }}}
    def _side_proj_towers(self):# {{{
        ''' 
        This is for evacuation only and cannot interfere with fire models
        (fire_model_ignore=1). Most STAI(RCASES) or HALL(S) are drawn on floor
        0, but they are tall and need to cross other floors (towers). Say we
        have floor bottoms at 0, 3, 6, 9, 12 metres and STAI's top is at 9
        metres - the STAI belongs to floors 0, 1, 2. We INSERT fake (x,y) STAI
        slices on proper floors in order to calculate vent_from / vent_to
        properly. These fake entities are enumerated from 100000. We only
        consider towers which span across more than 1 floor.

        '''

        towers={}
        for w in self.s.query("SELECT floor,height,name,type_sec FROM aamks_geom WHERE type_sec in ('STAI','HALL')"):
            if w['height'] > self.floors_meta[w['floor']]['maxz_abs']:
                towers[(w['floor'], w['name'], w['type_sec'])]=[]
                current_floor=w['floor']

                for floor in self.floors:
                    for v in self.s.query("SELECT min(z0) FROM aamks_geom WHERE type_pri='COMPA' AND floor=?", (floor,)):
                        if v['min(z0)'] < w['height']:
                            towers[(w['floor'], w['name'], w['type_sec'])].append(floor)
                towers[(w['floor'], w['name'], w['type_sec'])].remove(current_floor)

        for k,v in towers.items():
            towers[k]=['0']+v
        self.projections['side']['towers']=towers
# }}}
    def _side_proj_max_spans(self):# {{{
        '''
        The number of floors in the highest staircase 
        '''

        max_spans=-1
        for k,v in self.projections['side']['towers'].items():
            if len(v) > max_spans: 
                max_spans=len(v)
                maxs=(k[2], max_spans)
        self.projections['side']['max_spans']=maxs
# }}}
    def _side_proj_lines(self):# {{{
        '''
        Helper horizontal lines for Animator: 2, 1, 0
        '''
        maxs=self.projections['side']['max_spans']
        animator_floor_height=self.projections['side']['animator_floor_height']
        top_floor_area=self.projections['side']['top_floor_area']
        lines=OrderedDict()
        for i in reversed(range(maxs[1])):
            lines[str(i)] = animator_floor_height * (maxs[1]-1-i) + top_floor_area
        self.projections['side']['lines']=lines

# }}}
    def _side_proj_rectangles(self):# {{{
        '''
        All FSoS'es will be represented at constant height to better fit
        Animator. It will allow to compare the vertical speed at the same
        distance for each staircase and align the floors. We are free to deform
        any staircase in any way taking the resulting area (the capacity for
        evacuees) is not changed. Therefore we pick the preferred height and
        alter width to keep to original area.

        animator_floor_height=1000 seems like a reasonable height for animator.
        Speed of agents will be scaled to match the vertical movement in this
        height.
        '''

        animator_floor_height=self.projections['side']['animator_floor_height']
        top_floor_area=self.projections['side']['top_floor_area']
        towers=self.projections['side']['towers']
        lines=self.projections['side']['lines']

        t=OrderedDict()
        padding_rectangle=self.projections['side']['padding_rectangle']

        for k,v in self.projections['side']['towers'].items():
            rects=[]
            i=self.s.query("SELECT * FROM aamks_geom WHERE name=?", (k[1],))[0]
            width=int(i['width']*i['depth'] / animator_floor_height)
            for floor in v:
                rects.append({"floor": floor, "x0": padding_rectangle, "y1": lines[floor], 'height': animator_floor_height, 'width': width})
            rects[-1]['height']=top_floor_area

            t[i['name']]=rects
            padding_rectangle+=width+self.projections['side']['padding_rectangle']
        self.projections['side']['rectangles']=t

# }}}
    def _side_proj_width(self):# {{{
        mmax=-99999
        for t in self.projections['side']['rectangles'].values():
            for i in t:
                mmax=max(mmax,(i['width']+i['x0']))
        self.projections['side']['width']=mmax
        self.projections['side']['x1']=self.projections['side']['x0'] + mmax
# }}}

    def _db_rectangles_top(self):# {{{
        next_id=100000
        for w, floors in self.projections['side']['towers'].items():
            self.s.query("UPDATE aamks_geom set type_tri='TOWER_BASE' WHERE name=?", (w[1],))
            row=self.s.query("SELECT * FROM aamks_geom WHERE name=?", (w[1],))[0]
            orig_name=row['name']
            for floor in floors:
                row['fire_model_ignore']=1
                row['floor']=floor
                row['name']="{}.{}".format(orig_name,floor)
                row['type_tri']="TOWER_LEFT"
                row['global_type_id']=next_id
                next_id+=1
                self.s.query('INSERT INTO aamks_geom VALUES ({})'.format(','.join('?' * len(row.keys()))), list(row.values()))
# }}}
    def _db_rectangles_side(self):# {{{

        for k,tt in self.projections['side']['rectangles'].items():
            i=self.s.query("SELECT * FROM aamks_geom WHERE name=?", (k,))[0]
            for ii in tt:
                i['floor']='world2d'
                i['name']="{}|{}".format(k,ii['floor'])
                i['x0']=ii['x0']+self.projections['side']['x0']
                i['x1']=ii['x0']+self.projections['side']['x0']+ii['width']
                i['y1']=ii['y1']
                i['width']=ii['width']
                i['y0']=i['y1']-ii['height']
                i['depth']=i['y1']-i['y0']
                i['type_tri']='TOWER_RIGHT'
                self.s.query("DELETE FROM world2d WHERE name=?", (i['name'],))
                self.s.dict_insert('world2d', i)
# }}}

    def _world2d_make(self):# {{{
        self._world2d_paint_lines()
        self._world2d_meta()
        self._world2d_db_adjust
        #self._world2d_obstacles()
        #dd(self.s.query("SELECT name,floor,x0,x1,y0,y1,width,height FROM world2d where type_sec='STAI'"))
# }}}
    def _world2d_db_adjust(self):# {{{
        self.s.query("UPDATE aamks_geom SET name=name||'.0' WHERE type_tri='TOWER_BASE'")
        self.s.query("UPDATE world2d    SET name=name||'.0' WHERE type_tri='TOWER_BASE'")
        self.s.query("UPDATE aamks_geom SET vent_to_name=vent_to_name||'.0' WHERE vent_to_name LIKE 's%' AND vent_to_name NOT LIKE 's%.%'")
        self.s.query("UPDATE world2d    SET vent_to_name=vent_to_name||'.0' WHERE vent_to_name LIKE 's%' AND vent_to_name NOT LIKE 's%.%'")
        self.s.query("UPDATE world2d    SET floor='world2d'")
# }}}
    def _world2d_paint_lines(self):# {{{
        z=self.json.read('{}/dd_geoms.json'.format(os.environ['AAMKS_PROJECT']))

        for proj in ['top', 'side']:
            x0=self.projections[proj]['x0']
            x1=self.projections[proj]['x1']
            for floor,y in self.projections[proj]['lines'].items():
                z['world2d']['lines'].append( { "xy": (x0 , y)    , "x1": x1         , "y1": y         , "strokeColor": "#fff" , "strokeWidth": 4   , "opacity": 0.7 } )
                z['world2d']['texts'].append( { "xy": (x0 , y-50) , "content": floor , "fontSize": 200 , "fillColor": "#fff"   , "opacity": 0.7 } )

        self.json.write(z, '{}/dd_geoms.json'.format(os.environ['AAMKS_PROJECT']))

    # }}}
    def _world2d_meta(self):# {{{
        '''
        For Animator after geoms and towers made it into the world2d.
        '''

        minx=self.s.query("SELECT min(x0) AS minx FROM world2d")[0]['minx']
        miny=self.s.query("SELECT min(y0) AS miny FROM world2d")[0]['miny']
        maxx=self.s.query("SELECT max(x1) AS maxx FROM world2d")[0]['maxx']
        maxy=self.s.query("SELECT max(y1) AS maxy FROM world2d")[0]['maxy']
        width= maxx - minx
        height= maxy - miny
        center=(minx + int(width/2), miny + int(height/2), 0)

        world2d_meta=OrderedDict([('width', width) , ('height', height) , ('z', 0), ('center', center), ('minx', minx) , ('miny', miny) , ('maxx', maxx) , ('maxy', maxy)])
        self.s.query("CREATE TABLE world2d_meta(json)")
        self.s.query("INSERT INTO world2d_meta VALUES (?)", (json.dumps(world2d_meta),))
        self.s.query("UPDATE world2d SET x1=x0+width, y1=y0+depth, z1=z0+height, center_x=x0+width/2, center_y=y0+depth/2, center_z=z0+height/2")

# }}}

    def _world2d_obstacles(self):# {{{
        '''
        CFAST uses the real 3D model, but for RVO2 we flatten the world to 2D
        '''

        obstacles=self.json.readdb("obstacles")


        # temp
        data=obstacles
        self.s.query("CREATE TABLE world2d_obstacles(json)")
        self.s.query("INSERT INTO world2d_obstacles VALUES (?)", (json.dumps(data),))
        return
        # temp


        data={}
        data['points']=[]
        for floor,obsts in obstacles['points'].items():
            for obst in obsts:
                #obst[0][1]+=self.world2d_ty[floor]
                #obst[1][1]+=self.world2d_ty[floor]
                #obst[2][1]+=self.world2d_ty[floor]
                #obst[3][1]+=self.world2d_ty[floor]
                #obst[4][1]+=self.world2d_ty[floor]

                obst[0][2]=300
                obst[1][2]=300
                obst[2][2]=300
                obst[3][2]=300
                obst[4][2]=300
                data['points'].append(obst)

        data['named']=[]
        for floor,obsts in obstacles['named'].items():
            for obst in obsts:
                #obst['y0']+=self.world2d_ty[floor]
                data['named'].append(obst)

        staircase_obstacles=self._world2d_staircases_obstacles()
        data['points']+=staircase_obstacles['points']
        data['named']+=staircase_obstacles['named']

        self.s.query("CREATE TABLE world2d_obstacles(json)")
        self.s.query("INSERT INTO world2d_obstacles VALUES (?)", (json.dumps(data),))

# }}}
    def _world2d_staircases_obstacles(self):# {{{
        '''
        We are cutting holes in the bottom of each FSoS.
        The width of the hole is hardcoded to 200 cm (center_x +/-100).

        '''

        walls=[]

        for k,rects in self.projections['side']['rectangles'].items():
            for i in rects:
                i['x0']+=self.projections['side']['x0']+self.projections['side']['padding_rectangle']
                i['y0']=i['y1']-i['height']
                walls.append((i['x0']+i['width']       , i['y0']             , i['x0']+i['width']+self.walls_width , i['y0']+i['height']+self.walls_width) )
                walls.append((i['x0']                  , i['y0']             , i['x0']+self.walls_width            , i['y0']+i['height']+self.walls_width) )
                walls.append((i['x0']+i['width']/2+100 , i['y0']+i['height'] , i['x0']+i['width']                  , i['y0']+i['height']+self.walls_width) )
                walls.append((i['x0']+self.walls_width , i['y0']+i['height'] , i['x0']+i['width']/2-100            , i['y0']+i['height']+self.walls_width) )

            ceiling=(i['x0']+self.walls_width , i['y0'] , i['x0']+i['width'] , i['y0']+self.walls_width)
            walls.append(ceiling)

        walls_polygons=([box(ii[0],ii[1],ii[2],ii[3]) for ii in set(walls)])

        obstacles={}
        obstacles['points']=[]
        obstacles['named']=[]
        for i in walls:
            obstacles['points'].append([ [i[0] , i[1] , 300 ] , [ i[2] , i[1] , 300 ] , [ i[2] , i[3] , 300 ] , [ i[0] , i[3] , 300 ] , [ i[0] , i[1] , 300 ] ])
            obstacles['named'].append({'x0': i[0], 'y0': i[1], 'width': i[2]-i[0], 'depth': i[3]-i[1]})
        return obstacles
# }}}
