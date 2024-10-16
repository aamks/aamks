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
from include import Vis

# }}}

class CFASTimporter():
    def __init__(self, sim_id=None):# {{{
        self.json=Json()
        self.conf=self.json.read("{}/conf.json".format(os.environ['AAMKS_PROJECT']))
        if self.conf['fire_model']=='FDS':
            return
        if sim_id:
            new_sql_path = os.path.join(os.environ['AAMKS_PROJECT'], "workers", f"{sim_id}", f"aamks_{sim_id}.sqlite")
            self.s=Sqlite(new_sql_path)
        else:
            self.s=Sqlite("{}/aamks.sqlite".format(os.environ['AAMKS_PROJECT']), 3)
        self.raw_geometry=self.json.read("{}/cad.json".format(os.environ['AAMKS_PROJECT']))
        self.geomsMap=self.json.read("{}/inc.json".format(os.environ['AAMKS_PATH']))['aamksGeomsMap']
        self.doors_width=32
        self.walls_width=4
        self._dispatched_evacuees()
        self._geometry2sqlite()
        self._enhancements()
        self._towers_slices()
        self._floors_meta()
        self._world_meta()
        self._aamks_geom_into_polygons()
        self._make_id2compa_name()
        self._find_intersections_within_floor()
        self._find_mvent_intersections()
        self._mvent_is_vertical()
        self._get_faces()
        self._hvents_per_room()
        self._find_intersections_between_floors()
        self._vvents_per_room()
        self._add_names_to_vents_from_to()
        self._recalculate_vents_from_to()
        self._calculate_sills()
        self._terminal_doors()
        self._compa_has_doors()
        self._auto_detectors_and_sprinklers()
        self._assert_faces_ok()
        self._assert_room_has_door()
        self._find_intersections_within_rooms()
        self._debug()
        self.s.close()
# }}}
    def _dispatched_evacuees(self):
        self.s.query("CREATE TABLE dispatched_evacuees(json)")

    def _floors_meta(self):# {{{
        ''' 
        Floor dimensions are needed here and there. 
        for z_absolute high towers are not taken under account, we want the natural floor's zdim 
        for z_relative high towers are not taken under account, we want the natural floor's zdim 
        '''

        self.floors_meta=OrderedDict()
        self._world3d=dict()
        self._world3d['minx']=9999999
        self._world3d['maxx']=-9999999
        self._world3d['miny']=9999999
        self._world3d['maxy']=-9999999
        prev_maxz=0
        for floor in self.floors:
            ty=0
            tx=0
            minx=self.s.query("SELECT min(x0) AS minx FROM aamks_geom WHERE floor=?", (floor,))[0]['minx']
            maxx=self.s.query("SELECT max(x1) AS maxx FROM aamks_geom WHERE floor=?", (floor,))[0]['maxx']
            miny=self.s.query("SELECT min(y0) AS miny FROM aamks_geom WHERE floor=?", (floor,))[0]['miny']
            maxy=self.s.query("SELECT max(y1) AS maxy FROM aamks_geom WHERE floor=?", (floor,))[0]['maxy']
            minz_abs=self.s.query("SELECT min(z0) AS minz FROM aamks_geom WHERE type_sec NOT IN('STAI','HALL') AND floor=?", (floor,))[0]['minz']
            maxz_abs=self.s.query("SELECT max(z1) AS maxz FROM aamks_geom WHERE type_sec NOT IN('STAI','HALL') AND floor=?", (floor,))[0]['maxz']
            zdim=maxz_abs - prev_maxz
            prev_maxz=maxz_abs

            xdim= maxx - minx
            ydim= maxy - miny
            center=(minx + int(xdim/2), miny + int(ydim/2), minz_abs)
            self.floors_meta[floor]=OrderedDict([('name', floor), ('xdim', xdim) , ('ydim', ydim) , ('center', center), ('minx', minx) , ('miny', miny) , ('maxx', maxx) , ('maxy', maxy), ('minz_abs', minz_abs), ('maxz_abs', maxz_abs) , ('zdim', zdim), ('ty', ty), ('tx', tx)  ])

            self._world3d['minx']=min(self._world3d['minx'], minx)
            self._world3d['maxx']=max(self._world3d['maxx'], maxx)
            self._world3d['miny']=min(self._world3d['miny'], miny)
            self._world3d['maxy']=max(self._world3d['maxy'], maxy)

        self.s.query("CREATE TABLE floors_meta(json)")
        self.s.query('INSERT INTO floors_meta VALUES (?)', (json.dumps(self.floors_meta),))

# }}}
    def _world_meta(self):# {{{
        self.s.query("CREATE TABLE world_meta(json)")
        self.world_meta={}
        self.world_meta['world3d']=self._world3d
        self.world_meta['walls_width']=self.walls_width
        self.world_meta['doors_width']=self.doors_width

        if len(self.floors_meta) > 1:
            self.world_meta['multifloor_building']=1
        else: 
            self.world_meta['multifloor_building']=0

        self.s.query('INSERT INTO world_meta(json) VALUES (?)', (json.dumps(self.world_meta),))

# }}}
    def _bbox(self,points,z):# {{{
        ''' 
        Not really a bounding box for just any polygon, but this name is a good hint
        '''

        xy=list(map(list, zip(*points)))
        bbox=OrderedDict( [ ('x0', (min(xy[0]))) , ('y0', (min(xy[1]))) , ('x1', (max(xy[0]))) , ('y1', (max(xy[1]))) , ])
        bbox['z0']=z[0]
        bbox['z1']=z[1]
        bbox['width']=bbox['x1']-bbox['x0']
        bbox['depth']=bbox['y1']-bbox['y0']
        bbox['height']=z[1]-z[0]
        return bbox
# }}}
    def _geometry2sqlite(self):# {{{
        ''' 
        Parse geometry and place geoms in sqlite. The lowest floor is always 0.
        The self.raw_geometry example for floor("0"):

            "0": [
                "ROOM": [
                    { "idx": 1 , "points": "[[ 495  , 415 ] , [1000 , 415] , [ 1000 , 2000 ] , [495  , 2000] ]" , "z": "[0 , 350]" , "room_enter": "yes", "evacuees_density": "auto" }
                    { "idx": 2 , "points": "[[ 1000 , 415 ] , [2235 , 415] , [ 2235 , 1000 ] , [1000 , 1000] ]" , "z": "[0 , 350]" , "room_enter": "yes", "evacuees_density": "auto" }
                ],
            ]

        Current file format should always be available here: https://github.com/aamks/aamks/tree/master/installer/demo

        Some columns in db are left empty for now. 

        Sqlite's aamks_geom table must use two unique ids 
        a) 'name' for visualisation and 
        b) 'global_type_id' for cfast enumeration. 
        '''

        data=[]
        for floor,gg in self.raw_geometry.items():
            for k,arr in gg.items():
                if k in ('UNDERLAY_IMG', 'UNDERLAY_FLOOR'):
                    continue
                for v in arr:
                    v['type']=k
                    v['floor']=floor
                    v['points']=json.loads(v['points'])
                    v['z']=json.loads(v['z'])
                    v['bbox']=self._bbox(v['points'],v['z'])
                    v['attrs']=self._prepare_attrs(v)
                    record=self._prepare_geom_record(v)
                    if record != False:
                        data.append(record)
        self.s.query("CREATE TABLE aamks_geom(name,floor,global_type_id,hvent_room_seq,vvent_room_seq,type_pri,type_sec,type_tri,x0,y0,z0,width,depth,height,cfast_width,sill,face,face_offset,vent_from,vent_to,material_ceiling,material_floor,material_wall,heat_detectors,smoke_detectors,sprinklers,is_vertical,vent_from_name,vent_to_name, how_much_open, room_area, x1, y1, z1, center_x, center_y, center_z, fire_model_ignore, mvent_throughput, exit_type, room_enter, evacuees_density, terminal_door, points, origin_room, orig_type, has_door, teleport_from, teleport_to, adjacents, stair_direction, exit_weight, room_exits_weights)")
        self.s.executemany('INSERT INTO aamks_geom VALUES ({})'.format(','.join('?' * len(data[0]))), data)
#}}}
    def _prepare_attrs(self,v):# {{{
        aa={}
        aa['mvent_throughput']=v['mvent_throughput']    if 'mvent_throughput' in v else None
        aa['room_enter']=v['room_enter']                if 'room_enter' in v else None
        aa['exit_type']=v['exit_type']                  if 'exit_type' in v else None

        try: 
            aa['evacuees_density']=float(v['evacuees_density'])
        except: 
            aa['evacuees_density']=None
        return aa
# }}}
    def _prepare_geom_record(self,v):# {{{
        ''' Format a record for sqlite. Hvents get fixed width self.doors_width cm '''
        # OBST
        teleport_from = None
        teleport_to = None
        stair_direction = None
        exit_weight = None
        room_exits_weights = None

        if v['type'] in ('OBST',):
            type_pri='OBST'
            type_tri=''

        # EVACUEE
        elif v['type'] in ('EVACUEE',):                  
            type_pri='EVACUEE'
            type_tri=''

       # TELEPORT
        elif v['type'] in ('FLOOR_TELEPORT_UP','FLOOR_TELEPORT_DOWN'):                  
            type_pri='FLOOR_TELEPORT'
            type_tri=''
            teleport_from = str(v['teleport_from'])
            teleport_to = str(v['teleport_to'])
            if v['type'] == 'FLOOR_TELEPORT_UP':
                stair_direction = 'upstairs'
            elif v['type'] == 'FLOOR_TELEPORT_DOWN':
                stair_direction = 'downstairs'
            if 'exit_weight' in v:
                exit_weight = str(v['exit_weight'])

        # FIRE
        elif v['type'] in ('FIRE',):                  
            type_pri='FIRE'
            type_tri=''

        # MVENT      
        elif v['type'] in ('MVENT',):                  
            type_pri='MVENT'
            type_tri=''

        # VVENT      
        elif v['type'] in ('VVENT',):                  
            type_pri='VVENT'
            type_tri=''

        # COMPA
        elif v['type'] in ('ROOM', 'COR', 'HALL', 'STAI'):      
            type_pri='COMPA'
            type_tri=''
            if 'room_exits_weights' in v:
                room_exits_weights = str(v['room_exits_weights'])
        
        
        # HVENT  
        elif v['type'] in ('DOOR', 'DCLOSER', 'DELECTR', 'HOLE', 'WIN'): 
            v['bbox']['width']=max(v['bbox']['width'],self.doors_width)
            v['bbox']['depth']=max(v['bbox']['depth'],self.doors_width)
            type_pri='HVENT'
            if v['type']  in ('DOOR', 'DCLOSER', 'DELECTR'):
                if 'exit_weight' in v:
                    exit_weight = str(v['exit_weight'])
            if v['type']  in ('DOOR', 'DCLOSER', 'DELECTR', 'HOLE'): 
                type_tri='DOOR'
            elif v['type'] in ('WIN'):
                type_tri='WIN'

        global_type_id=v['idx'];
        name='{}{}'.format(self.geomsMap[v['type']], global_type_id)
        #self.s.query("CREATE TABLE aamks_geom(name , floor      , global_type_id , hvent_room_seq , vvent_room_seq , type_pri , type_sec  , type_tri , x0              , y0              , z0              , width              , depth              , height              , cfast_width , sill , face , face_offset , vent_from , vent_to , material_ceiling                      , material_floor                      , material_wall                      , heat_detectors , smoke_detectors , sprinklers , is_vertical , vent_from_name , vent_to_name , how_much_open , room_area , x1   , y1   , z1   , center_x , center_y , center_z , fire_model_ignore , mvent_throughput               , exit_type               , room_enter               , evacuees_density               , terminal_door , points                  , origin_room , orig_type , has_door,   teleport_from, teleport_to, adjacents, stair_direction, exit_weight, room_exits_weights)")
        return (name                                , v['floor'] , global_type_id , None           , None           , type_pri , v['type'] , type_tri , v['bbox']['x0'] , v['bbox']['y0'] , v['bbox']['z0'] , v['bbox']['width'] , v['bbox']['depth'] , v['bbox']['height'] , None        , None , None , None        , None      , None    , self.conf['material_ceiling']['type'] , self.conf['material_floor']['type'] , self.conf['material_wall']['type'] , 0              , 0               , 0          , None        , None           , None         , None          , None      , None , None , None , None     , None     , None     , 0                 , v['attrs']['mvent_throughput'] , v['attrs']['exit_type'] , v['attrs']['room_enter'] , v['attrs']['evacuees_density'] , None          , json.dumps(v['points']) , None        , v['type'] , None,       teleport_from, teleport_to, None, stair_direction, exit_weight, room_exits_weights)

# }}}
    def _enhancements(self):# {{{
        ''' 
        Is HVENT vertical or horizontal? Apart from what is width and height
        for geometry, HVENTS have their cfast_width always along the wall

        Doors and Holes will be later interescted with parallel walls
        (obstacles). We inspect is_vertical and make the doors just enough
        smaller to avoid perpendicular intersections. 
        
        Since obstacles are generated to right/top direction, we need to
        address the overlapping coming from left/bottom. So we make doors
        shorter at x0 and y0, but not at x1 and y1. At the end our door=90cm
        are now 86cm. 
        '''

        self.outside_compa=self.s.query("SELECT count(*) FROM aamks_geom WHERE type_pri='COMPA'")[0]['count(*)']+1
        self.floors=        [z['floor'] for z in self.s.query("SELECT DISTINCT floor FROM aamks_geom ORDER BY floor")]
        self.all_doors=     [z['name'] for z in self.s.query("SELECT name FROM aamks_geom WHERE type_tri='DOOR' ORDER BY name") ]

        self.s.query("UPDATE aamks_geom SET is_vertical=0, cfast_width=width WHERE type_pri='HVENT' AND width > depth")
        self.s.query("UPDATE aamks_geom SET is_vertical=1, cfast_width=depth WHERE type_pri='HVENT' AND width < depth")

        self.s.query("UPDATE aamks_geom SET room_area=width*depth WHERE type_pri='COMPA'")
        self.s.query("UPDATE aamks_geom SET x1=x0+width, y1=y0+depth, z1=z0+height, center_x=x0+width/2, center_y=y0+depth/2, center_z=z0+height/2")

        self.s.query("UPDATE aamks_geom SET y0=y0+?, depth=depth-? WHERE type_tri='DOOR' AND is_vertical=1", (self.walls_width, self.walls_width))
        self.s.query("UPDATE aamks_geom SET x0=x0+?, width=width-? WHERE type_tri='DOOR' AND is_vertical=0", (self.walls_width, self.walls_width))

# }}}
    def _make_id2compa_name(self):# {{{
        ''' 
        Create a map of ids to names for COMPAS, e.g. _id2compa_name[4]='ROOM_1_4' 
        This map is stored to sqlite because path.py needs it. 
        Still true after mesh travelling?
        ''' 

        self._id2compa_name=OrderedDict() 
        for v in self.s.query("select name,global_type_id from aamks_geom where type_pri='COMPA' ORDER BY global_type_id"):
            self._id2compa_name[v['global_type_id']]=v['name']
        self._id2compa_name[self.outside_compa]='OUTSIDE'

# }}}
    def _add_names_to_vents_from_to(self):# {{{
        ''' 
        Vents from/to use indices, but names will be simpler for AAMKS and for
        debugging. Hvents/Vvents lower_id/higher_id are already taken care of
        in _find_intersections_between_floors() 
        '''

        query=[]
        for v in self.s.query("select vent_from,vent_to,name from aamks_geom where type_pri IN('HVENT', 'VVENT', 'MVENT')"):
            query.append((self._id2compa_name[v['vent_from']], self._id2compa_name[v['vent_to']], v['name']))
        self.s.executemany('UPDATE aamks_geom SET vent_from_name=?, vent_to_name=? WHERE name=?', query)
# }}}
    def _recalculate_vents_from_to(self):# {{{
        ''' 
        CFAST requires that towers slices are mapped back to the original cuboids
        '''

        update=[]
        for hi,lo in self.towers_parents.items():
            z=self.s.query("SELECT name,vent_from,vent_from_name,vent_to_name,vent_to FROM aamks_geom WHERE type_pri='HVENT' AND vent_from=? OR vent_to=? ORDER BY name", (hi,hi))
            for i in z:
                if i['vent_from_name'] == 'OUTSIDE':
                    update.append((i['vent_to'], i['vent_from'], i['vent_to_name'], i['vent_from_name'], i['name']))
        self.s.executemany("UPDATE aamks_geom SET vent_from=?, vent_to=?, vent_from_name=?, vent_to_name=?  WHERE name=?", update)

# }}}
    def _calculate_sills(self):# {{{
        ''' 
        Sill is the distance relative to the floor. Say there's a HVENT H
        between rooms A and B. Say A and B may have variate z0 (floor elevations).
        We find 'hvent_from' and then we use it's z0. This z0 is the needed
        'relative 0' for the calcuation. 
        '''

        update=[]
        for v in self.s.query("SELECT global_type_id, z0, vent_from, vent_from_name FROM aamks_geom WHERE type_pri='HVENT' ORDER BY name"): 
            floor_baseline=self.s.query("SELECT z0 FROM aamks_geom WHERE global_type_id=? AND type_pri='COMPA'", (v['vent_from'],))[0]['z0']
            update.append((v['z0']-floor_baseline, v['global_type_id']))
        self.s.executemany("UPDATE aamks_geom SET sill=? WHERE type_pri='HVENT' AND global_type_id=?", update)

# }}}
    def _terminal_doors(self):# {{{
        ''' 
        Doors that lead to outside or lead to staircases ('s%') are terminal
        Doors that lead to outside on floor 0 or lead to DESTINATION ('d%') are terminal
        '''
        update=[]
        #z=self.s.query("SELECT name,exit_type FROM aamks_geom WHERE type_pri='HVENT' AND (vent_from_name LIKE 's%' OR vent_to_name LIKE 's%' OR vent_to_name='OUTSIDE')")
        # z=self.s.query("SELECT name,exit_type FROM aamks_geom WHERE (type_pri='HVENT' OR type_pri='DESTINATION' )AND (name='d13' OR name='d2' OR name='n22')")
        z=self.s.query("SELECT name,exit_type FROM aamks_geom WHERE (type_pri='HVENT' AND vent_to_name='OUTSIDE')")

        for i in z:
            update.append((i['exit_type'], i['name']))
        self.s.executemany("UPDATE aamks_geom SET terminal_door=? WHERE name=?", update)

# }}}
    def _compa_has_doors(self):# {{{
        ''' 
        Halls may not have doors on some floors. Evacuees should not be placed on such floors, so we need to detect that.
        '''
        update=[]
        compas=self.s.query("SELECT name from aamks_geom where type_pri='COMPA'")
        for r in compas:
            doors=self.s.query("SELECT name from aamks_geom where vent_from_name=? or vent_to_name=? limit 1", (r['name'], r['name']))
            if len(doors)>0:
                update.append((r['name'],))

        self.s.executemany("UPDATE aamks_geom SET has_door=1 WHERE name=?", update)

# }}}
    def _auto_detectors_and_sprinklers(self):# {{{
        if len(''.join([ str(i) for i in self.conf['heat_detectors'].values() ])) > 0:
            self.s.query("UPDATE aamks_geom set heat_detectors = 1 WHERE type_pri='COMPA'")
        if len(''.join([ str(i) for i in self.conf['smoke_detectors'].values() ])) > 0:
            self.s.query("UPDATE aamks_geom set smoke_detectors = 1 WHERE type_pri='COMPA'")
        if len(''.join([ str(i) for i in self.conf['sprinklers'].values() ])) > 0:
            self.s.query("UPDATE aamks_geom set sprinklers = 1 WHERE type_pri='COMPA'")
# }}}

# INTERSECTIONS
    def _aamks_geom_into_polygons(self):# {{{
        ''' aamks_geom into shapely polygons for intersections '''
        self.aamks_polies=OrderedDict()
        self.aamks_polies['COMPA']=OrderedDict()
        self.aamks_polies['HVENT']=OrderedDict()
        self.aamks_polies['VVENT']=OrderedDict()
        self.aamks_polies['MVENT']=OrderedDict()
        for floor in self.floors:
            for elem in self.aamks_polies.keys():
                self.aamks_polies[elem][floor]=OrderedDict()
            for v in self.s.query("SELECT * FROM aamks_geom WHERE type_pri NOT IN('OBST', 'EVACUEE', 'FIRE', 'FLOOR_TELEPORT') AND floor=?", (floor,)):
                self.aamks_polies[v['type_pri']][floor][v['global_type_id']]=box(v['x0'], v['y0'], v['x0']+v['width'], v['y0']+v['depth'])
# }}}
    def _get_faces(self):# {{{
        ''' 
        Cfast faces and offsets calculation. HVENTS have self.doors_width, so
        we only consider intersection.length > self.doors_width. Faces are
        properties of the doors. They are calculated in respect to the room of
        lower id. The orientation of faces in each room:

                3
            +-------+
          4 |       | 2
            +-------+
                1
        '''

        for floor in self.floors:
            for i in self.s.query("SELECT vent_from as compa_id, global_type_id as vent_id FROM aamks_geom WHERE type_pri='HVENT' AND floor=?", (floor,)):
                hvent_poly=self.aamks_polies['HVENT'][floor][i['vent_id']]
                compa_poly=self.aamks_polies['COMPA'][floor][i['compa_id']]
                compa=[(round(x),round(y)) for x,y in compa_poly.exterior.coords]
                lines=OrderedDict()
                lines['RIGHT']=LineString([compa[0], compa[1]])
                lines['REAR']=LineString([compa[1], compa[2]])
                lines['LEFT']=LineString([compa[2], compa[3]])
                lines['FRONT']=LineString([compa[3], compa[0]])
                for key, line in lines.items():
                    if hvent_poly.intersection(line).length > self.doors_width:
                        pt=list(zip(*line.xy))[0]
                        if key =='REAR' or key =='LEFT':
                            pt=list(zip(*line.xy))[1]
                        face=key
                        offset=hvent_poly.distance(Point(pt))
                        self.s.query("UPDATE aamks_geom SET face=?, face_offset=? WHERE global_type_id=? AND type_pri='HVENT'", (face,offset,i['vent_id'])) 
# }}}
    def _hvents_per_room(self):# {{{
        '''
        If there are more than one vent in a room Cfast needs them enumerated.
        '''

        i=0
        j=0
        update=[]
        for v in self.s.query("SELECT name,vent_from,vent_to FROM aamks_geom WHERE type_pri='HVENT' ORDER BY vent_from,vent_to"):
            if v['vent_from']!=i: 
                i=v['vent_from']
                j=0
            j+=1
            update.append((j,v['name']))
        self.s.executemany('UPDATE aamks_geom SET hvent_room_seq=? WHERE name=?', (update))
# }}}
    def _vvents_per_room(self):# {{{
        '''
        If there are more than one vent in a room Cfast needs them enumerated.
        '''
        i=0
        j=0
        update=[]
        for v in self.s.query("SELECT name,vent_from,vent_to FROM aamks_geom WHERE type_pri='VVENT' ORDER BY vent_from,vent_to"):
            if v['vent_from']!=i: 
                i=v['vent_from']
                j=0
            j+=1
            update.append((j,v['name']))
        self.s.executemany('UPDATE aamks_geom SET vvent_room_seq=? WHERE name=?', (update))
# }}}
    def _find_intersections_within_floor(self):# {{{
        ''' 
        Find intersections (hvents vs compas). This is how we know which doors
        belong to which compas. We expect that HVENT intersects either:

            a) room_from, room_to  (two rectangles)
            b) room_from, outside  (one rectangle)

        If the door originates at the very beginning of the room, then it also
        has a tiny intersection with some third rectangle which we filter out
        with:

            intersection.length > 100 (intersection perimeter, 100 is arbitrary)

        self.aamks_polies is a dict of floors:
            COMPA: OrderedDict([(1, OrderedDict([(42, <shapely.geometry.polygon.Polygon object at 0x2b2206282e48>), (43, <shapely.geometry.polygon.Polygon object at 0x2b2206282eb8>), (44, <shapely.geometry.polygon.Polygon object at 0x2b2206282f28>)))]) ...
            HVENT: OrderedDict([(1, OrderedDict([(21, <shapely.geometry.polygon.Polygon object at 0x2b2206282fd0>), (22, <shapely.geometry.polygon.Polygon object at 0x2b2206293048>)))]) ...
            VVENT: OrderedDict([(1, OrderedDict([(1, <shapely.geometry.polygon.Polygon object at 0x2b2206298550>)]))])

        We aim at having vc_intersections (Vent_x_Compa intersections) dict of vents. Each vent collects two compas: 
            1: [48, 29]
            2: [49, 29]
            3: [11 ]    -> [11, 99(Outside)] 
            
        v=sorted(v) asserts that we go from lower_vent_id to higher_vent_id

        Also, we need to make sure room A and room B do intersect if there is door from A to B.
        '''

        update=[]
        for floor,vents_dict in self.aamks_polies['HVENT'].items():
            all_hvents=[z['global_type_id'] for z in self.s.query("SELECT global_type_id FROM aamks_geom WHERE type_pri='HVENT' AND floor=? ORDER BY name", floor) ]
            vc_intersections={key:[] for key in all_hvents }
            for vent_id,vent_poly in vents_dict.items():
                for compa_id,compa_poly in self.aamks_polies['COMPA'][floor].items():
                    if vent_poly.intersection(compa_poly).length > 100:
                        vc_intersections[vent_id].append(compa_id)

            for vent_id,v in vc_intersections.items():
                v=sorted(v)
                if len(v) == 2 and self.aamks_polies['COMPA'][floor][v[0]].intersects(self.aamks_polies['COMPA'][floor][v[1]]) == False:
                    name=self.s.query("SELECT name FROM aamks_geom WHERE type_pri='HVENT' AND global_type_id=?", (vent_id,))[0]['name']
                    self.fatal("{}: space between compas.".format(name))
                if len(v) == 1:
                    v.append(self.outside_compa)
                if len(v) > 2 or len(v)<1:
                    name=self.s.query("SELECT name FROM aamks_geom WHERE type_pri='HVENT' AND global_type_id=?", (vent_id,))[0]['name']
                    self.fatal("{}: door intersects no rooms or more than 2 rooms.".format(name))
                update.append((v[0], v[1], vent_id))
        self.s.executemany("UPDATE aamks_geom SET vent_from=?, vent_to=? where global_type_id=? and type_pri='HVENT'", update)
# }}}
    def _find_intersections_within_rooms(self):# {{{
        update=[]
        for floor,rooms_dict in self.aamks_polies['COMPA'].items():
            all_rooms={z['global_type_id']: z['name'].split('.')[0] for z in self.s.query("SELECT name, global_type_id FROM aamks_geom WHERE type_pri='COMPA' AND floor=? ORDER BY name", floor)}
            vc_intersections={key:[] for key in all_rooms.keys() }
            for compa1_id,compa1_poly in rooms_dict.items():
                for compa2_id,compa2_poly in self.aamks_polies['COMPA'][floor].items():
                    length = compa1_poly.intersection(compa2_poly).length
                    if length > 100 and compa1_id != compa2_id:
                        fraction_to = length/compa1_poly.length
                        fraction_from = length/compa2_poly.length
                        vc_intersections[compa1_id].append(f'{all_rooms[compa2_id]};{fraction_to:.3f};{fraction_from:.3f}')
            for room_id, v in vc_intersections.items():        
                update.append((",".join(v), room_id))
        self.s.executemany("UPDATE aamks_geom SET adjacents=? where global_type_id=? and type_pri='COMPA'", update)

# }}}
    def _find_intersections_between_floors(self):# {{{
        '''
        Similar to _find_intersections_within_floor() This time we are looking for a
        vvent (at floor n) which intersects a compa at it's floor (floor n)
        and a compa above (floor n+1) We will iterate over two_floors, which
        can contain: a) the set of compas from (floor n) and (floor n+1) b)
        the set of compas from (floor n) only if it is the top most floor --
        outside_compa will come into play

        As opposed to _find_intersections_between_floors() vents go from higher to lower:
            "UPDATE aamks_geom SET vent_to=?, vent_from=?"

            intersection.length > 100 (intersection perimeter, 100 is arbitrary)
        '''
        
        update=[]
        for floor,vents_dict in self.aamks_polies['VVENT'].items():
            all_vvents=[z['global_type_id'] for z in self.s.query("SELECT global_type_id FROM aamks_geom WHERE type_pri='VVENT' AND floor=? ORDER BY name", floor) ]
            vc_intersections={key:[] for key in all_vvents }
            for vent_id,vent_poly in vents_dict.items():
                try:
                    two_floors=self.aamks_polies['COMPA'][floor]+self.aamks_polies['COMPA'][floor+1]
                except:
                    two_floors=self.aamks_polies['COMPA'][floor]
                for compa_id,compa_poly in two_floors.items():
                    if vent_poly.intersection(compa_poly).length > 100:
                        vc_intersections[vent_id].append(compa_id)

            for vent_id,v in vc_intersections.items():
                v=sorted(v)
                if len(v) == 1:
                    v.append(self.outside_compa)
                if len(v) > 2 or len(v)<1:
                    name=self.s.query("SELECT name FROM aamks_geom WHERE type_pri='VVENT' AND global_type_id=?", (vent_id,))[0]['name']
                    self.fatal('{}: vvent intersects no rooms or more than 2 rooms.'.format(name))
                update.append((v[0], v[1], vent_id))
        self.s.executemany("UPDATE aamks_geom SET vent_to=?, vent_from=? where global_type_id=? and type_pri='VVENT'", update)

# }}}
    def _towers_slices(self):# {{{
        ''' 
        This is for evacuation only and cannot interfere with fire models
        (fire_model_ignore=1). Most STAI(RCASES) or HALL(S) are drawn on floor
        0, but they are tall and need to cross other floors (towers). Say we
        have floor bottoms at 0, 3, 6, 9, 12 metres and STAI's top is at 9
        metres - the STAI belongs to floors 0, 1, 2. We INSERT (x,y) STAI
        slices on proper floors. The slices are enumerated from 100000. 
        
        '''

        towers={}

        for w in self.s.query("SELECT name,z0 as tower_z0,height+z0 as tower_z1,floor,height,type_sec FROM aamks_geom WHERE type_sec in ('STAI','HALL')"):
            floor_max_z=self.s.query("SELECT max(z1) FROM aamks_geom WHERE type_sec NOT IN('STAI','HALL') AND floor=?", (w['floor'],))[0]['max(z1)']
            if w['tower_z1'] >= floor_max_z + 200:

                towers[w['name']]=[]
                current_floor=w['floor']

                for floor in self.floors:
                    for v in self.s.query("SELECT min(z0) FROM aamks_geom WHERE type_pri='COMPA' AND floor=?", (floor,)):
                        if v['min(z0)'] < w['tower_z1'] and v['min(z0)'] >= w['tower_z0']:
                            towers[w['name']].append(floor)
                towers[w['name']].remove(current_floor)

        self.towers_parents={}
        high_global_type_id=1000001
        for orig_name,floors in towers.items():
            orig_record=self.s.query("SELECT global_type_id,type_pri,type_sec,type_tri,x0,y0,width,depth,x1,y1,room_area,room_enter,evacuees_density,points,1 as fire_model_ignore, terminal_door FROM aamks_geom WHERE name=?", (orig_name,))[0]
            parent_id=orig_record['global_type_id']
            kk=list(orig_record.keys())
            kk.append('floor')
            kk.append('name')
            for flo in floors:
                self.towers_parents[high_global_type_id]=parent_id
                orig_record['global_type_id']=high_global_type_id
                vv=list(orig_record.values())
                vv.append(flo)
                vv.append("{}.{}".format(orig_name,flo))
                self.s.query("INSERT INTO aamks_geom ({}) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)".format(",".join(kk)), tuple(vv))
                high_global_type_id+=1

# }}}
    def _find_mvent_intersections(self):# {{{
        ''' 
        Find the room containing the mvent.
        '''

        update=[]
        for floor,vents_dict in self.aamks_polies['MVENT'].items():
            all_mvents=[z['global_type_id'] for z in self.s.query("SELECT global_type_id FROM aamks_geom WHERE type_pri='MVENT' AND floor=? ORDER BY name", floor) ]
            vc_intersections={key:[] for key in all_mvents }
            for vent_id,vent_poly in vents_dict.items():
                for compa_id,compa_poly in self.aamks_polies['COMPA'][floor].items():
                    if vent_poly.intersection(compa_poly).length > 100:
                        vc_intersections[vent_id].append(compa_id)

            for vent_id,v in vc_intersections.items():
                v=sorted(v)
                if len(v) > 1: 
                    name=self.s.query("SELECT name FROM aamks_geom WHERE type_pri='MVENT' AND global_type_id=?", (vent_id,))[0]['name']
                    self.fatal('{}: mvent crosses more than a single room.'.format(name))
                update.append((v[0], v[0], vent_id))
        self.s.executemany("UPDATE aamks_geom SET vent_from=?, vent_to=? where global_type_id=? and type_pri='MVENT'", update)

# }}}
    def _mvent_is_vertical(self):# {{{
        ''' 
        Normally, is_vertical context is x or y. For mvent the context is z.
        '''

        update=[]
        z=self.s.query("SELECT global_type_id,name,width,depth,height FROM aamks_geom WHERE type_pri='MVENT'") 
        for i in z:
            if i['height']<i['width'] and i['height']<i['depth']:
                update.append((0, i['global_type_id']))
            else:
                update.append((1, i['global_type_id']))
        self.s.executemany("UPDATE aamks_geom SET is_vertical=? where global_type_id=? and type_pri='MVENT'", update)

# }}}

# ASSERTIONS
    def _assert_faces_ok(self):# {{{
        ''' Are all hvents' faces fine? '''

        for v in self.s.query("SELECT * FROM aamks_geom WHERE type_tri='DOOR' ORDER BY vent_from,vent_to"):
            if v['face_offset'] is None: 
                print('{} idx {}: problem with cfast face calculation at ({} {})'.format(v['orig_type'], v['global_type_id'], v['x0'], v['y0']))
                exit()
# }}}
    def _assert_room_has_door(self):# {{{
        ''' 
        Each room must have at least one type_tri DOOR. 
        Doesn't apply to staircase slices (orig_type is null).
        '''

        doors_intersect_room_ids=[]
        for i in self.s.query("SELECT vent_from,vent_to FROM aamks_geom WHERE type_tri='DOOR'"):
            doors_intersect_room_ids.append(i['vent_from'])
            doors_intersect_room_ids.append(i['vent_to'])

        all_interected_room=set(doors_intersect_room_ids)
        for i in self.s.query("SELECT name,floor,global_type_id FROM aamks_geom WHERE type_pri='COMPA' AND orig_type is not null"):
            if i['global_type_id'] not in all_interected_room:
                self.fatal('{}: room without door.'.format(i['name']))
# }}}

    def fatal(self, title):# {{{
        ''' 
        Errors go to apainter. 
        '''

        print(title)
        sys.exit()
# }}}

    def _debug(self):# {{{
        #dd(os.environ['AAMKS_PROJECT'])
        #self.s.dumpall()
        #self.s.dump_geoms()
        #dd(self.s.query("select * from aamks_geom where name='d13'")[0])
        #dd(self.s.query("select * from world2d"))
        #exit()
        #self.s.dump()
        #exit()
        pass
        
# }}}
