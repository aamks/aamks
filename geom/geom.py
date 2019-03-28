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
from include import Sqlite
from include import Json
from include import Dump as dd
from include import Navmesh
from include import Vis

# }}}

class Geom():
    def __init__(self):# {{{
        self.json=Json()
        self.s=Sqlite("{}/aamks.sqlite".format(os.environ['AAMKS_PROJECT']))
        self.raw_geometry=self.json.read("{}/cad.json".format(os.environ['AAMKS_PROJECT']))
        self.conf=self.json.read("{}/conf.json".format(os.environ['AAMKS_PROJECT']))
        self._doors_width=32
        self._wall_width=4
        self._make_elem_counter()
        self._geometry2sqlite()
        self._enhancements()
        self._init_dd_geoms()
        self._make_fake_wells()
        self._floors_details()
        self._aamks_geom_into_polygons()
        self._make_id2compa_name()
        self._find_intersections_within_floor()
        self._get_faces()
        self._hvents_per_room()
        self._find_intersections_between_floors()
        self._vvents_per_room()
        self._add_names_to_vents_from_to()
        self._calculate_sills()
        self._auto_detectors_and_sprinklers()
        self._create_obstacles()
        self.make_vis('Create obstacles')
        self._navmesh()
        self._assert_faces_ok()
        self._assert_room_has_door()
        #self.s.dumpall()
        #self.s.dump()
# }}}

    def _floors_details(self):# {{{
        ''' 
        Floor dimensions are needed here and there, therefore we store it in
        sqlite. Canvas size is 1600 x 800 in css.css. Calculate how to scale
        the whole floor to fit the canvas. Minima don't have to be at (0,0) in
        autocad, therefore we also need to translate the drawing for the
        canvas. 
        '''

        values=OrderedDict()
        for floor in self.floors:
            minx=self.s.query("SELECT min(x0) AS minx FROM aamks_geom WHERE floor=?", (floor,))[0]['minx']
            miny=self.s.query("SELECT min(y0) AS miny FROM aamks_geom WHERE floor=?", (floor,))[0]['miny']
            maxx=self.s.query("SELECT max(x1) AS maxx FROM aamks_geom WHERE floor=?", (floor,))[0]['maxx']
            maxy=self.s.query("SELECT max(y1) AS maxy FROM aamks_geom WHERE floor=?", (floor,))[0]['maxy']
            z0=self.s.query("SELECT z0 FROM aamks_geom WHERE floor=?", (floor,))[0]['z0']

            width= maxx - minx
            height= maxy - miny

            center=(minx + int(width/2), miny + int(height/2), z0)

            animation_scale=round(min(1600/width,800/height)*0.95, 2) # 0.95 is canvas padding
            animation_translate=[ int(maxx-0.5*width), int(maxy-0.5*height) ]

            values[floor]=OrderedDict([('width', width) , ('height', height) , ('z', z0), ('center', center), ('minx', minx) , ('miny', miny) , ('maxx', maxx) , ('maxy', maxy) , ('animation_scale', animation_scale), ('animation_translate',  animation_translate)])
        self.s.query("CREATE TABLE floors(json)")
        self.s.query('INSERT INTO floors VALUES (?)', (json.dumps(values),))
# }}}
    def _geometry2sqlite(self):# {{{
        ''' 
        Parse geometry and place geoms in sqlite. The lowest floor is always 0.
        The self.raw_geometry example for floor("0"):

            "0": [
                "ROOM": [
                    [ [ 3.0 , 4.8 , 0.0 ] , [ 4.8 , 6.5 , 3.0 ] ] ,
                    [ [ 3.0 , 6.5 , 0.0 ] , [ 6.8 , 7.4 , 3.0 ] ] 
                ]
            ]

        Each geom entity will be classified as DOOR, WINDOW, ROOM etc, and will
        get a unique name via elem_counter. Some columns in db are left empty
        for now. 

        Sqlite's aamks_geom table must use two unique ids a) 'name' for
        visualisation and b) 'global_type_id' for cfast enumeration. 
        '''

        data=[]
        for floor,gg in self.raw_geometry.items():
            for k,arr in gg.items():
                for v in arr:
                    p0=[ int(i) for i in v[0] ]
                    p1=[ int(i) for i in v[1] ]
                    width= p1[0]-p0[0]
                    depth= p1[1]-p0[1]
                    height=p1[2]-p0[2]
                    try:
                        attr=v[2]
                    except:
                        attr=None
                    record=self._prepare_geom_record(k,[p0,p1],width,depth,height,floor,attr)
                    if record != False:
                        data.append(record)
        self.s.query("CREATE TABLE aamks_geom(name,floor,global_type_id,hvent_room_seq,vvent_room_seq,type_pri,type_sec,type_tri,exit_type,room_enter,x0,y0,z0,width,depth,height,cfast_width,sill,face,face_offset,vent_from,vent_to,material_ceiling,material_floor,material_wall,heat_detectors,smoke_detectors,sprinklers,is_vertical,vent_from_name,vent_to_name, how_much_open, room_area, x1, y1, z1, center_x, center_y, center_z, fire_model_ignore)")
        self.s.executemany('INSERT INTO aamks_geom VALUES ({})'.format(','.join('?' * len(data[0]))), data)
        #dd(self.s.dump())
#}}}
    def _prepare_geom_record(self,k,v,width,depth,height,floor,attr):# {{{
        ''' Format a record for sqlite. Hvents get fixed width self._doors_width cm '''
        # OBST
        if k in ('OBST',):
            type_pri='OBST'
            type_tri=''

        # EVACUEE
        elif k in ('EVACUEE',):                  
            type_pri='EE'
            type_tri=''

        # MVENT      
        elif k in ('MVENT',):                  
            type_pri='MVENT'
            type_tri=''

        # VVENT      
        elif k in ('VVENT',):                  
            type_pri='VVENT'
            height=10 
            type_tri=''

        # COMPA
        elif k in ('ROOM', 'COR', 'HALL', 'STAI'):      
            type_pri='COMPA'
            type_tri=''
        
        
        # HVENT  
        elif k in ('D', 'C', 'E', 'HOLE', 'W'): 
            width=max(width,self._doors_width)
            depth=max(depth,self._doors_width)
            type_pri='HVENT'
            if k in ('D', 'C', 'E', 'HOLE'): 
                type_tri='DOOR'
            elif k in ('W'):
                type_tri='WIN'

        self._elem_counter[type_pri]+=1
        global_type_id=self._elem_counter[type_pri]
        name='{}_{}'.format(k[0], global_type_id)

        #self.s.query("CREATE TABLE aamks_geom(name , floor , global_type_id , hvent_room_seq , vvent_room_seq , type_pri , type_sec , type_tri , exit_type , room_enter , x0      , y0      , z0      , width , depth , height , cfast_width , sill , face , face_offset , vent_from , vent_to , material_ceiling                      , material_floor                      , material_wall                      , heat_detectors , smoke_detectors , sprinklers , is_vertical , vent_from_name , vent_to_name , how_much_open , room_area , x1   , y1   , z1   , center_x , center_y , center_z , fire_model_ignore)")
        return (name                                , floor , global_type_id , None           , None           , type_pri , k        , type_tri , attr      , attr       , v[0][0] , v[0][1] , v[0][2] , width , depth , height , None        , None , None , None        , None      , None    , self.conf['material_ceiling']['type'] , self.conf['material_floor']['type'] , self.conf['material_wall']['type'] , 0              , 0               , 0          , None        , None           , None         , None          , None      , None , None , None , None     , None     , None     , 0)

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

        self.s.query("UPDATE aamks_geom SET room_area=round(width*depth/10000,2) WHERE type_pri='COMPA'")
        self.s.query("UPDATE aamks_geom SET x1=x0+width, y1=y0+depth, z1=z0+height, center_x=x0+width/2, center_y=y0+depth/2, center_z=z0+height/2")

        self.s.query("UPDATE aamks_geom SET y0=y0+?, depth=depth-? WHERE type_tri='DOOR' AND is_vertical=1", (self._wall_width, self._wall_width))
        self.s.query("UPDATE aamks_geom SET x0=x0+?, width=width-? WHERE type_tri='DOOR' AND is_vertical=0", (self._wall_width, self._wall_width))

# }}}
    def _init_dd_geoms(self):# {{{
        ''' 
        dd_geoms are some optional extra rectangles, points, lines and
        circles that are written to on top of our geoms. Useful for developing
        and debugging features. Must come early, because visualization depends
        on it. 

        Procedure:  
            * z=self.json.read('{}/dd_geoms.json'.format(os.environ['AAMKS_PROJECT']))
            *   z["0"]['circles'].append({ "xy": (i['center_x'], i['center_y']),"radius": 200, "fillColor": "#fff" , "opacity": 0.3 } )
            *   z["0"]['circles'].append({ "xy": (i['center_x'], i['center_y']),"radius": 200, "fillColor": "#fff" , "opacity": 0.3 } )
            * self.json.write(z, '{}/dd_geoms.json'.format(os.environ['AAMKS_PROJECT']))
        '''

        z=dict()
        for floor in self.floors:
            z[floor]=dict()
            z[floor]['rectangles']=[]      
            z[floor]['lines']=[]           
            z[floor]['circles']=[]         
            z[floor]['texts']=[]           
            z[floor]['rectangles']=[]      
            for i in self.s.query("SELECT * FROM aamks_geom WHERE type_tri='DOOR' AND floor=?", (floor,)): 
                z[floor]['circles'].append({ "xy": (i['center_x'] , i['center_y']) , "radius": 90 , "fillColor": "#fff" , "opacity": 0.05 } )

            # Example usage anywhere inside aamks:

            # z=self.json.read('{}/dd_geoms.json'.format(os.environ['AAMKS_PROJECT']))
            # z["0"]['rectangles'].append( { "xy": (1000 , 1000) , "width": 200             , "depth": 300        , "strokeColor": "#fff" , "strokeWidth": 2  , "fillColor": "#f80" , "opacity": 0.7 } )
            # z["0"]['rectangles'].append( { "xy": (0    , 0)    , "width": 200              , "depth": 200        , "strokeColor": "#fff" , "strokeWidth": 2  , "fillColor": "#f80" , "opacity": 0.7 } )
            # z["0"]['lines'].append(      { "xy": (2000 , 200)  , "x1": 3400               , "y1": 500           , "strokeColor": "#fff" , "strokeWidth": 2  , "opacity": 0.7 } )
            # z["0"]['texts'].append(      { "xy": (1000 , 1000) , "content": "(1000x1000)" , "fontSize": 400      , "fillColor":"#06f"    , "opacity":0.7 } )
            # self.json.write(z, '{}/dd_geoms.json'.format(os.environ['AAMKS_PROJECT']))

            # Vis(None, 'image', 'dd_geoms example')

        self.json.write(z, '{}/dd_geoms.json'.format(os.environ['AAMKS_PROJECT']))
# }}}
    def _make_fake_wells(self):# {{{
        ''' 
        TODO: are we using this?

        This is for evacuation only and cannot interfere with fire models
        (fire_model_ignore=1). Most STAI(RCASES) or HALL(S) are drawn on floor
        0, but they are tall and need to cross other floors. We call them
        WELLs. Say we have floor bottoms at 0, 3, 6, 9, 12 metres and WELL's
        top is at 9 metres - the WELL belongs to floors 0, 1, 2. We INSERT fake
        (x,y) WELL slices on proper floors in order to calculate vent_from /
        vent_to properly. 
        '''

        return

        add_wells={}
        for w in self.s.query("SELECT floor,global_type_id,height FROM aamks_geom WHERE type_sec in ('STAI','HALL')"):
            add_wells[(w['floor'], w['global_type_id'])]=[]
            current_floor=w['floor']

            for floor in self.floors:
                for v in self.s.query("SELECT min(z0) FROM aamks_geom WHERE type_pri='COMPA' AND floor=?", (floor,)):
                    if v['min(z0)'] < w['height']:
                        add_wells[(w['floor'], w['global_type_id'])].append(floor)
            add_wells[(w['floor'], w['global_type_id'])].remove(current_floor)

        for w, floors in add_wells.items():
            row=self.s.query("SELECT * FROM aamks_geom WHERE type_pri='COMPA' AND global_type_id=?", (w[1],))[0]
            for floor in floors:
                row['fire_model_ignore']=1
                row['floor']=floor
                self.s.query('INSERT INTO aamks_geom VALUES ({})'.format(','.join('?' * len(row.keys()))), list(row.values()))

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
        self._id2compa_name[self.outside_compa]='outside'

# }}}
    def _add_names_to_vents_from_to(self):# {{{
        ''' 
        Vents from/to use indices, but names will be simpler for AAMKS and for
        debugging. Hvents/Vvents lower_id/higher_id are already taken care of
        in _find_intersections_between_floors() 
        '''

        query=[]
        for v in self.s.query("select vent_from,vent_to,name from aamks_geom where type_pri IN('HVENT', 'VVENT')"):
            query.append((self._id2compa_name[v['vent_from']], self._id2compa_name[v['vent_to']], v['name']))
        self.s.executemany('UPDATE aamks_geom SET vent_from_name=?, vent_to_name=? WHERE name=?', query)
# }}}
    def _calculate_sills(self):# {{{
        ''' 
        Sill is the distance relative to the floor. Say there's a HVENT H
        between rooms A and B. Say A and B have variate z0 (floor elevations).
        How do we calculate the height of the sill? The CFAST.in solution is
        simple: We find 'hvent_from' for H and then we use it's z0. This z0 is
        the needed 'relative 0' for the calcuation. 
        '''

        update=[]
        for v in self.s.query("SELECT global_type_id, z0, vent_from  FROM aamks_geom WHERE type_pri='HVENT' ORDER BY name"): 
            floor_baseline=self.s.query("SELECT z0 FROM aamks_geom WHERE global_type_id=? AND type_pri='COMPA'", (v['vent_from'],))[0]['z0']
            update.append((v['z0']-floor_baseline, v['global_type_id']))
        self.s.executemany("UPDATE aamks_geom SET sill=? WHERE type_pri='HVENT' AND global_type_id=?", update)

# }}}
    def _auto_detectors_and_sprinklers(self):# {{{
        if len(''.join([ str(i) for i in self.conf['heat_detectors'].values() ])) > 0:
            self.s.query("UPDATE aamks_geom set heat_detectors = 1 WHERE type_pri='COMPA'")
        if len(''.join([ str(i) for i in self.conf['smoke_detectors'].values() ])) > 0:
            self.s.query("UPDATE aamks_geom set smoke_detectors = 1 WHERE type_pri='COMPA'")
        if len(''.join([ str(i) for i in self.conf['sprinklers'].values() ])) > 0:
            self.s.query("UPDATE aamks_geom set sprinklers = 1 WHERE type_pri='COMPA'")
# }}}
    def _make_elem_counter(self):# {{{
        ''' 
        Geom primary types are enumerated globally for the building in sqlite.
        Each of the types has separate numbering starting from 1. ROOM_2_8
        refers to the eight compartment in the building which happens to exist
        on floor 2.
        '''

        self._elem_counter={}
        for i in ('COMPA', 'HVENT', 'VVENT', 'OBST', 'EE', 'MVENT'):
            self._elem_counter[i]=0
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
            for v in self.s.query("SELECT * FROM aamks_geom WHERE type_pri NOT IN('OBST', 'EE') AND floor=?", (floor,)):
                self.aamks_polies[v['type_pri']][floor][v['global_type_id']]=box(v['x0'], v['y0'], v['x0']+v['width'], v['y0']+v['depth'])
# }}}
    def _get_faces(self):# {{{
        ''' 
        Cfast faces and offsets calculation. HVENTS have self._doors_width, so
        we only consider intersection.length > self._doors_width Faces are
        properties of doors. They are calculated in respect to the room of
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
                lines[2]=LineString([compa[0], compa[1]])
                lines[3]=LineString([compa[1], compa[2]])
                lines[4]=LineString([compa[2], compa[3]])
                lines[1]=LineString([compa[3], compa[0]])
                for key,line in lines.items():
                    if hvent_poly.intersection(line).length > self._doors_width:
                        pt=list(zip(*line.xy))[0]
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
                    self.make_vis("Space between compas".format(floor), vent_id)
                if len(v) == 1:
                    v.append(self.outside_compa)
                if len(v) > 2:
                    self.make_vis('Door intersects no rooms or more than 2 rooms.', vent_id)
                update.append((v[0], v[1], vent_id))
        self.s.executemany("UPDATE aamks_geom SET vent_from=?, vent_to=? where global_type_id=? and type_pri='HVENT'", update)

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
                if len(v) > 2:
                    self.make_vis('Vent intersects no rooms or more than 2 rooms.', vent_id)
                update.append((v[0], v[1], vent_id))
        self.s.executemany("UPDATE aamks_geom SET vent_to=?, vent_from=? where global_type_id=? and type_pri='VVENT'", update)

# }}}

# OBSTACLES
    def _create_obstacles(self):# {{{
        ''' 
        Geometry may contain obstacles to model machines, FDS walls, bookcases,
        etc. Obstacles are not visible in CFAST, since they don't belong to
        aamks_geom table. 
        '''

        data=OrderedDict()
        data['points']=OrderedDict()
        data['named']=OrderedDict()
        floors_meta=json.loads(self.s.query("SELECT json FROM floors")[0]['json'])
        for floor,gg in self.raw_geometry.items():
            data['points'][floor]=[]
            data['named'][floor]=[]
            boxen=[]
            # TODO: once cad.json uses 'OBST': [], there's no need to try.
            try:
                for v in gg['OBST']:
                    boxen.append(box(int(v[0][0]), int(v[0][1]), int(v[1][0]), int(v[1][1])))
            except:
                pass
                
            boxen+=self._rooms_into_boxen(floor)
            data['named'][floor]=self._boxen_into_rectangles(boxen)
            for i in boxen:
                data['points'][floor].append([(int(x),int(y), floors_meta[floor]['z']) for x,y in i.exterior.coords])
        self.s.query("CREATE TABLE obstacles(json)")
        self.s.query("INSERT INTO obstacles VALUES (?)", (json.dumps(data),))
#}}}
    def _rooms_into_boxen(self,floor):# {{{
        ''' 
        For a roomX we create a roomX_ghost, we move it by self._wall_width,
        which must match the width of hvents. Then we create walls via logical
        operations. Finally doors cut the openings in walls.

        '''

        walls=[]
        for i in self.s.query("SELECT * FROM aamks_geom WHERE floor=? AND type_pri='COMPA' ORDER BY name", (floor,)):
            walls.append((i['x0']+self._wall_width , i['y0']            , i['x0']+i['width']            , i['y0']+self._wall_width)                )
            walls.append((i['x0']+i['width'] , i['y0']            , i['x0']+i['width']+self._wall_width , i['y0']+i['depth']+self._wall_width)     )
            walls.append((i['x0']+self._wall_width , i['y0']+i['depth'] , i['x0']+i['width']            , i['y0']+i['depth']+self._wall_width)     )
            walls.append((i['x0']            , i['y0']            , i['x0']+self._wall_width            , i['y0']+i['depth']+self._wall_width)     )
        walls_polygons=([box(ii[0],ii[1],ii[2],ii[3]) for ii in set(walls)])

        doors_polygons=[]
        for i in self.s.query("SELECT * FROM aamks_geom WHERE floor=? AND type_tri='DOOR' ORDER BY name", (floor,)):
            doors_polygons.append(box(i['x0'], i['y0'], i['x0']+i['width'], i['y0']+i['depth']))
            
        boxen=[]
        for wall in walls_polygons:
            for door in doors_polygons:
                wall=wall.difference(door)
            if isinstance(wall, MultiPolygon):
                for i in polygonize(wall):
                    boxen.append(i)
            elif isinstance(wall, Polygon):
                boxen.append(wall)
        return boxen 
# }}}
    def _boxen_into_rectangles(self,boxen):# {{{
        ''' 
        Transform shapely boxen into rectangles for paperjs visualization:
            [(x0,y0,width,height)]
        '''

        rectangles=[]

        for i in boxen:
            m=i.bounds
            coords=OrderedDict()
            coords["x0"]=int(m[0])
            coords["y0"]=int(m[1])
            coords["width"]=int(m[2]-m[0])
            coords["depth"]=int(m[3]-m[1])
            rectangles.append(coords)

        return rectangles
# }}}

# NAVMESH 
    def _navmesh(self):# {{{
        ''' 
        1. Create obj file from aamks geometries.
        2. Build navmesh with golang, obj is input
        3. Query navmesh with python
        '''

        self.nav=OrderedDict()
        z=self.s.query("SELECT json FROM obstacles")
        for floor,faces in json.loads(z[0]['json'])['points'].items():
            self._obj_num=0;
            obj='';
            for face in faces:
                obj+=self._obj_elem(face,99)
            for face in self._obj_platform(floor):
                obj+=self._obj_elem(face,0)
        
            with open("{}/{}.obj".format(os.environ['AAMKS_PROJECT'], floor), "w") as f: 
                f.write(obj)
            self.nav[floor]=Navmesh()
            self.nav[floor].build(obj, os.environ['AAMKS_PROJECT'], floor)
            #self._navmesh_test(floor)

        Vis({'highlight_geom': None, 'anim': None, 'title': 'Navmesh test', 'srv': 1})

# }}}
    def _obj_platform(self,floor):# {{{
        z=self.s.query("SELECT x0,y0,x1,y1 FROM aamks_geom WHERE type_pri='COMPA' AND floor=?", (floor,))
        platforms=[]
        for i in z:
            platforms.append([ (i['x1'], i['y1']), (i['x1'], i['y0']), (i['x0'], i['y0']), (i['x0'], i['y1']) ])
        return platforms

# }}}
    def _obj_elem(self,face,z):# {{{
        elem=''
        elem+="o Face{}\n".format(self._obj_num)
        for verts in face[:4]:
            elem+="v {}\n".format(" ".join([ str(i/100) for i in [verts[0], z, verts[1]]]))
        elem+="f {}\n\n".format(" ".join([ str(4*self._obj_num+i)+"//1" for i in [1,2,3,4]]))
        self._obj_num+=1
        return elem
# }}}
    def _navmesh_test(self,floor):# {{{
        colors=["#fff", "#f80", "#f00", "#8f0", "#08f", "#f0f" ]
        navmesh_paths=[]

        for x in range(6):
            src_dest=[]
            for i in self.s.query("SELECT * FROM aamks_geom WHERE type_pri='COMPA' AND floor=? ORDER BY RANDOM() LIMIT 2", (floor,)):
                src_dest.append([round(uniform(i['x0'], i['x1'])), round(uniform(i['y0'], i['y1']))])

            z=self.json.read('{}/dd_geoms.json'.format(os.environ['AAMKS_PROJECT']))
            z[floor]['circles'].append({ "xy": (src_dest[0]),"radius": 20, "fillColor": colors[x] , "opacity": 1 } )
            z[floor]['circles'].append({ "xy": (src_dest[1]),"radius": 20, "fillColor": colors[x] , "opacity": 1 } )
            self.json.write(z, '{}/dd_geoms.json'.format(os.environ['AAMKS_PROJECT']))
            navmesh_paths.append(self.nav[floor].query(src_dest, floor))
        self._navmesh_vis(floor,navmesh_paths,colors)
# }}}
    def _navmesh_vis(self,floor,navmesh_paths,colors):# {{{
        j=Json()
        z=j.read('{}/dd_geoms.json'.format(os.environ['AAMKS_PROJECT']))
        for cc,path in enumerate(navmesh_paths):
            for i,p in enumerate(path):
                try:
                    z[floor]['lines'].append({"xy":(path[i][0], path[i][1]), "x1": path[i+1][0], "y1": path[i+1][1] , "strokeColor": colors[cc], "strokeWidth": 2  , "opacity": 0.7 } )
                except:
                    pass

        j.write(z, '{}/dd_geoms.json'.format(os.environ['AAMKS_PROJECT']))
# }}}

# ASSERTIONS
    def _assert_faces_ok(self):# {{{
        ''' Are all hvents' faces fine? '''
        for v in self.s.query("SELECT * FROM aamks_geom WHERE type_tri='DOOR' ORDER BY vent_from,vent_to"):
            assert v['face_offset'] is not None, self.make_vis('Problem with cfast face calculation.', v['global_type_id'])
# }}}
    def _assert_room_has_door(self):# {{{
        ''' Each room must have at least one type_tri DOOR. '''
        doors_intersect_room_ids=[]
        for i in self.s.query("SELECT vent_from,vent_to FROM aamks_geom WHERE type_tri='DOOR'"):
            doors_intersect_room_ids.append(i['vent_from'])
            doors_intersect_room_ids.append(i['vent_to'])

        all_interected_room=set(doors_intersect_room_ids)
        for i in self.s.query("SELECT name,floor,global_type_id FROM aamks_geom WHERE type_pri='COMPA'"):
            if i['global_type_id'] not in all_interected_room:
                self.make_vis('Room without door (see Animator)', i['global_type_id'], 'COMPA')
# }}}

    def make_vis(self, title, faulty_id='', type_pri='HVENT'):# {{{
        ''' 
        This method is for visualizing both errors and just how things look. 
        If faulty_id comes non-empty then we are signaling an error.
        '''

        if faulty_id != '':
            r=self.s.query("SELECT name,floor FROM aamks_geom WHERE type_pri=? AND global_type_id=?", (type_pri,faulty_id))[0]
            fatal="Fatal: {}: {}".format(r['name'], title)
            Vis({'highlight_geom': r['name'], 'anim': None, 'title': "<div id=python_msg>{}</div>".format(fatal), 'srv': 1})
            print(fatal)
            sys.exit()
        else:
            Vis({'highlight_geom': None, 'anim': None, 'title': title, 'srv': 1})
# }}}
