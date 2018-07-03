# MODULES
# {{{
import json
from collections import OrderedDict
import shutil
import os
import re
import sys
from pprint import pprint
import codecs
from subprocess import Popen,PIPE
from shapely.geometry import box, Polygon, LineString, Point, MultiPolygon
from shapely.ops import polygonize
from numpy.random import choice
from math import sqrt
import itertools
from geom.inkscapereader import InkscapeReader
from include import Sqlite
from include import Json
from include import Dump as dd
from gui.vis.vis import Vis

# }}}

class Geom():
    def __init__(self):# {{{
        self.s=Sqlite("{}/aamks.sqlite".format(os.environ['AAMKS_PROJECT']))
        self.json=Json()
        self.conf=self.json.read("{}/conf_aamks.json".format(os.environ['AAMKS_PROJECT']))
        self._make_elem_counter()
        self._geometry_reader()
        self._geometry2sqlite()
        self._init_helper_variables()
        self._init_dd_geoms()
        self._make_fake_wells()
        self._floors_details()
        self._aamks_geom_into_polygons()
        self._aamks_geom_orientation()
        self._make_id2compa_name()
        self._find_horiz_intersections()
        self._get_faces()
        self._hvents_per_room()
        self._find_vertical_intersections()
        self._vvents_per_room()
        self._add_names_to_vents_from_to()
        self._calculate_sills()
        self._auto_detectors_and_sprinklers()
        self._create_obstacles()
        self.make_vis('Create obstacles')
        self._assert_faces_ok()
        self._assert_room_has_door()
        #self.s.dumpall()
# }}}

    def _floors_details(self):# {{{
        ''' 
        Floor dimensions are needed here and there, therefore we store it in
        sqlite. Canvas size is 1600 x 800 in css.css. Calculate how to scale
        the whole floor to fit the canvas. Minima don't have to be at (0,0) in
        autocad, therefore we also need to translate the drawing for the
        canvas. Y needs to be inverted for js, hence -int(maxy-0.5*height).
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
            animation_translate=[ int(maxx-0.5*width), -int(maxy-0.5*height) ]

            values[floor]=OrderedDict([('width', width) , ('height', height) , ('z', z0), ('center', center), ('minx', minx) , ('miny', miny) , ('maxx', maxx) , ('maxy', maxy) , ('animation_scale', animation_scale), ('animation_translate',  animation_translate)])
        self.s.query("CREATE TABLE floors(json)")
        self.s.query('INSERT INTO floors VALUES (?)', (json.dumps(values),))
# }}}
    def _geometry_reader(self):# {{{
        ''' 
        By convention: read cad.json first, otherwise make InkscapeReader()
        read input.svg. 
        '''

        try:
            self.geometry_data=self.json.read("{}/cad.json".format(os.environ['AAMKS_PROJECT']))
        except:
            InkscapeReader()
            self.geometry_data=self.json.read("{}/svg.json".format(os.environ['AAMKS_PROJECT']))

# }}}
    def _geometry2sqlite(self):# {{{
        ''' 
        Parse geometry and place geoms in sqlite. The lowest floor is always 0.
        The self.geometry_data example for floor("0"):

            "0": [
                "ROOM": [
                    [ [ 3.0 , 4.8 , 0.0 ] , [ 4.8 , 6.5 , 3.0 ] ] ,
                    [ [ 3.0 , 6.5 , 0.0 ] , [ 6.8 , 7.4 , 3.0 ] ] 
                ]
            ]

        Each geom entity will be classified as DOOR, WINDOW, ROOM etc, and will
        get a unique name via elem_counter Some columns in db are left empty
        for now. We multiply geometries * 100 and work on integer cm. This
        prevents us from the issues with shapely floats and rounding.

        Sqlite's aamks_geom table must use two unique ids a) 'name' for
        visualisation and b) 'global_type_id' for cfast enumeration. 
        '''

        data=[]
        for floor,gg in self.geometry_data.items():
            for k,arr in gg.items():
                for v in arr:
                    p0=[ int(i*100) for i in v[0] ]
                    p1=[ int(i*100) for i in v[1] ]
                    width= p1[0]-p0[0]
                    depth= p1[1]-p0[1]
                    height=p1[2]-p0[2]
                    record=self._prepare_geom_record(k,[p0,p1],width,depth,height,floor)
                    if record != False:
                        data.append(record)
        self.s.query("CREATE TABLE aamks_geom(name,floor,global_type_id,hvent_room_seq,vvent_room_seq,type_pri,type_sec,type_tri,x0,y0,z0,width,depth,height,cfast_width,sill,face,face_offset,vent_from,vent_to,material_ceiling,material_floor,material_wall,sprinkler,detector,is_vertical,vent_from_name,vent_to_name, how_much_open, room_area, x1, y1, z1, center_x, center_y, center_z, fire_model_ignore)")
        self.s.executemany('INSERT INTO aamks_geom VALUES ({})'.format(','.join('?' * len(data[0]))), data)
#}}}
    def _prepare_geom_record(self,k,v,width,depth,height,floor):# {{{
        ''' Format a record for sqlite. Hvents get fixed width 4 cm '''
        # OBST
        if k in ('OBST'):
            return False

        # COMPA
        elif k in ('ROOM', 'COR', 'HALL', 'STAI'):      
            type_pri='COMPA'
            type_tri=''
        
        # VVENT      
        elif k in ('VNT'):                  
            type_pri='VVENT'
            height=10 
            type_tri=''
        
        # HVENT  
        elif k in ('D', 'C', 'E', 'HOLE', 'W'): 
            width=max(width,4)
            depth=max(depth,4)
            type_pri='HVENT'
            if k in ('D', 'C', 'E', 'HOLE'): 
                type_tri='DOOR'
            elif k in ('W'):
                type_tri='WIN'

        self._elem_counter[type_pri]+=1
        global_type_id=self._elem_counter[type_pri]
        name='{}_{}'.format(k[0], global_type_id)

        #data.append('name' , 'floor' , 'global_type_id' , 'hvent_room_seq' , 'vvent_room_seq' , 'type_pri' , 'type_sec' , 'type_tri' , 'x0'    , 'y0'    , 'z0'    , 'width' , 'depth' , 'height' , 'cfast_width' , 'sill' , 'face' , 'face_offset' , 'vent_from' , 'vent_to' , 'material_ceiling'                              , 'material_floor'                              , 'material_wall'                              , 'sprinkler' , 'detector' , 'is_vertical' , 'vent_from_name' , 'vent_to_name' , 'how_much_open' , 'room_area' , 'x1' , 'y1' , 'z1' , 'center_x' , 'center_y' , 'center_z' , 'fire_model_ignore')
        return (name        , floor   , global_type_id   , None             , None             , type_pri   , k          , type_tri   , v[0][0] , v[0][1] , v[0][2] , width   , depth   , height   , None          , None   , None   , None          , None        , None      , self.conf['characteristic']['material_ceiling'] , self.conf['characteristic']['material_floor'] , self.conf['characteristic']['material_wall'] , 0           , 0          , None          , None             , None           , None            , None        , None , None , None , None       , None       , None       , 0)

# }}}
    def _init_helper_variables(self):# {{{
        self.outside_compa=self.s.query("SELECT count(*) FROM aamks_geom WHERE type_pri='COMPA'")[0]['count(*)']+1
        self.floors=        [z['floor'] for z in self.s.query("SELECT DISTINCT floor FROM aamks_geom ORDER BY floor")]
        self.all_doors=     [z['name'] for z in self.s.query("SELECT name FROM aamks_geom WHERE type_tri='DOOR' ORDER BY name") ]

        self.s.query("UPDATE aamks_geom SET room_area=round(width*depth/10000,2) WHERE type_pri='COMPA'")
        self.s.query("UPDATE aamks_geom SET x1=x0+width, y1=y0+depth, z1=z0+height, center_x=x0+width/2, center_y=y0+depth/2, center_z=z0+height/2")

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
                z[floor]['circles'].append({ "xy": (i['center_x'], i['center_y']) , "radius": 200             , "fillColor": "#fff" , "opacity": 0.3 } )

            # Example usage anywhere inside aamks:

            # z=self.json.read('{}/dd_geoms.json'.format(os.environ['AAMKS_PROJECT']))
            # z["0"]['rectangles'].append( { "xy": (1000 , 1000) , "width": 200             , "depth": 300        , "strokeColor": "#fff" , "strokeWidth": 2  , "fillColor": "#f80" , "opacity": 0.7 } )
            # z["0"]['rectangles'].append( { "xy": (0    , 0)    , "width": 200              , "depth": 200        , "strokeColor": "#fff" , "strokeWidth": 2  , "fillColor": "#f80" , "opacity": 0.7 } )
            # z["0"]['lines'].append(      { "xy": (2000 , 200)  , "x1": 3400               , "y1": 500           , "strokeColor": "#fff" , "strokeWidth": 2  , "opacity": 0.7 } )
            # z["0"]['texts'].append(      { "xy": (1000 , 1000) , "content": "(1000x1000)" , "fontSize": 400      , "fillColor":"#06f"    , "opacity":0.7 } )
            # self.json.write(z, '{}/dd_geoms.json'.format(os.environ['AAMKS_PROJECT']))

            # from gui.vis.vis import Vis
            # Vis(None, 'image', 'dd_geoms example')

        self.json.write(z, '{}/dd_geoms.json'.format(os.environ['AAMKS_PROJECT']))
# }}}
    def _make_fake_wells(self):# {{{
        ''' 
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
        in _find_vertical_intersections() 
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
        if self.conf['infrastructure']['has_detectors']:
            self.s.query("UPDATE aamks_geom set detector = 1 WHERE type_pri='COMPA'")
        if self.conf['infrastructure']['has_sprinklers']:
            self.s.query("UPDATE aamks_geom set sprinkler = 1 WHERE type_pri='COMPA'")
# }}}
    def _make_elem_counter(self):# {{{
        ''' 
        Geom primary types are enumerated globally for the building in sqlite.
        Each of the types has separate numbering starting from 1. ROOM_2_8
        refers to the eight compartment in the building which happens to exist
        on floor 2.
        '''

        self._elem_counter={}
        for i in ('COMPA', 'HVENT', 'VVENT'):
            self._elem_counter[i]=0
# }}}

# INTERSECTIONS
    def _aamks_geom_into_polygons(self):# {{{
        ''' aamks_geom into shapely polygons '''
        self.aamks_polies=OrderedDict()
        self.aamks_polies['COMPA']=OrderedDict()
        self.aamks_polies['HVENT']=OrderedDict()
        self.aamks_polies['VVENT']=OrderedDict()
        for floor in self.floors:
            for elem in self.aamks_polies.keys():
                self.aamks_polies[elem][floor]=OrderedDict()
            for v in self.s.query("SELECT * FROM aamks_geom WHERE floor=?", (floor,)):
                self.aamks_polies[v['type_pri']][floor][v['global_type_id']]=box(v['x0'], v['y0'], v['x0']+v['width'], v['y0']+v['depth'])
# }}}
    def _aamks_geom_orientation(self):# {{{
        ''' 
        Is HVENT vertical or horizontal? Apart from what is width and height
        for geometry, HVENTS have their cfast_width always along the wall
        '''

        # TODO: faster, but the same as previous?
        self.s.query("UPDATE aamks_geom SET is_vertical=0, cfast_width=width WHERE type_pri='HVENT' AND width > depth ")
        self.s.query("UPDATE aamks_geom SET is_vertical=1, cfast_width=depth WHERE type_pri='HVENT' AND width < depth ")

        # for v in self.s.query("SELECT * from aamks_geom WHERE type_pri='HVENT' order by name"):
        #     print(v['width'], v['depth'])
        #     if v['width'] > v['depth']:
        #         self.s.query("UPDATE aamks_geom SET is_vertical=0 WHERE name=?" , (v['name']  , ))
        #         self.s.query("UPDATE aamks_geom SET cfast_width=? WHERE name=?" , (v['width'] , v['name']))
        #     else:
        #         self.s.query("UPDATE aamks_geom SET is_vertical=1 WHERE name=?" , (v['name']  , ))
        #         self.s.query("UPDATE aamks_geom SET cfast_width=? WHERE name=?" , (v['depth'] , v['name']))
# }}}
    def _get_faces(self):# {{{
        ''' 
        Cfast faces and offsets calculation. HVENTS have width=4, so we only
        consider intersection.length > 4 Faces are properties of doors. They
        are calculated in respect to the room of lower id. The orientation of
        faces in each room:
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
                    if hvent_poly.intersection(line).length > 4:
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
    def _find_horiz_intersections(self):# {{{
        ''' Find horizontal intersections (hvents vs compas). This is how we know which doors belong to which compas. 
        We expect that HVENT intersects either:
            a) room_from, room_to  (two rectangles)
            b) room_from, outside  (one rectangle)
        If the door originates at the very beginning of the room, then it also has a tiny intersection with some third rectangle, hence we check: intersection.length > 4

        self.aamks_polies is a dict of floors:
            COMPA: OrderedDict([(1, OrderedDict([(42, <shapely.geometry.polygon.Polygon object at 0x2b2206282e48>), (43, <shapely.geometry.polygon.Polygon object at 0x2b2206282eb8>), (44, <shapely.geometry.polygon.Polygon object at 0x2b2206282f28>)))]) ...
            HVENT: OrderedDict([(1, OrderedDict([(21, <shapely.geometry.polygon.Polygon object at 0x2b2206282fd0>), (22, <shapely.geometry.polygon.Polygon object at 0x2b2206293048>)))]) ...
            VVENT: OrderedDict([(1, OrderedDict([(1, <shapely.geometry.polygon.Polygon object at 0x2b2206298550>)]))])

        We aim at having vc_intersections (Vent_x_Compa intersections) dict of vents. Each vent collects two compas: 
            1: [48, 29]
            2: [49, 29]
            3: [48, 49]
            4: [47, 29]
            5: [47, 11]
            6: [49, 11]
            
        v=sorted(v) asserts that we go from lower_vent_id to higher_vent_id
        '''

        all_hvents=[z['global_type_id'] for z in self.s.query("SELECT global_type_id FROM aamks_geom WHERE type_pri='HVENT' ORDER BY name") ]
        vc_intersections={key:[] for key in all_hvents }

        for floor,vents_dict in self.aamks_polies['HVENT'].items():
            for vent_id,vent_poly in vents_dict.items():
                for compa_id,compa_poly in self.aamks_polies['COMPA'][floor].items():
                    if vent_poly.intersection(compa_poly).length > 4:
                        vc_intersections[vent_id].append(compa_id)

        update=[]
        for vent_id,v in vc_intersections.items():
            v=sorted(v)
            v.append(self.outside_compa)
            if len(v) not in (2,3):
                self.make_vis('Door intersects no rooms or more than 2 rooms.', vent_id)
            update.append((v[0], v[1], vent_id))
        self.s.executemany("UPDATE aamks_geom SET vent_from=?, vent_to=? where global_type_id=? and type_pri='HVENT'", update)

# }}}
    def _find_vertical_intersections(self):# {{{
        '''
        Similar to _find_horiz_intersections() This time we are looking for a
        vvent (at floor n) which intersects a compa at it's floor (floor n)
        and a compa above (floor n+1) We will iterate over two_floors, which
        can contain: a) the set of compas from (floor n) and (floor n+1) b)
        the set of compas from (floor n) only if it is the top most floor --
        outside_compa will come into play

        Opposed to _find_horiz_intersections() vents go from higher to lower:
            "UPDATE aamks_geom SET vent_to=?, vent_from=?"
        '''
        
        all_vvents=[z['global_type_id'] for z in self.s.query("SELECT global_type_id FROM aamks_geom WHERE type_pri='VVENT' ORDER BY name") ]
        vc_intersections={key:[] for key in all_vvents}
        for floor,vents_dict in self.aamks_polies['VVENT'].items():
            for vent_id,vent_poly in vents_dict.items():
                try:
                    two_floors=self.aamks_polies['COMPA'][floor]+self.aamks_polies['COMPA'][floor+1]
                except:
                    two_floors=self.aamks_polies['COMPA'][floor]
                for compa_id,compa_poly in two_floors.items():
                    if vent_poly.intersection(compa_poly).length > 4:
                        vc_intersections[vent_id].append(compa_id)

        update=[]
        for vent_id,v in vc_intersections.items():
            v=sorted(v)
            v.append(self.outside_compa)
            if len(v) not in (2,3):
                self.make_vis('Door intersects no rooms or more than 2 rooms.', vent_id)
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
        for floor,gg in self.geometry_data.items():
            data['points'][floor]=[]
            data['named'][floor]=[]
            boxen=[]
            for v in gg['OBST']:
                boxen.append(box(int(v[0][0]*100), int(v[0][1]*100), int(v[1][0]*100), int(v[1][1]*100)))
            boxen+=self._rooms_into_boxen(floor)
            data['named'][floor]=self._boxen_into_rectangles(boxen)
            for i in boxen:
                data['points'][floor].append([(int(x),int(y)) for x,y in i.exterior.coords])
        self.s.query("CREATE TABLE obstacles(json)")
        self.s.query("INSERT INTO obstacles VALUES (?)", (json.dumps(data),))
#}}}
    def _rooms_into_boxen(self,floor):# {{{
        ''' 
        For a roomX we create a roomX_ghost, we move it by wall_width, which
        must match the width of hvents. Then we create walls via logical
        operations. We then intersect the walls with the doors to have openings
        in the walls. The door's width can originate on top of the wall, but
        such intersections don't count. Only intesections of area >
        wall_width**2 count -- only doors that have long side on the wall. 
        For comfortable debuging filter geoms in self.s.query(). 
        '''

        wall_width=4
        walls=[]
        for i in self.s.query("SELECT * FROM aamks_geom WHERE floor=? AND type_pri='COMPA' ORDER BY name", (floor,)):
            walls.append((i['x0']+wall_width , i['y0']            , i['x0']+i['width']            , i['y0']+wall_width)                )
            walls.append((i['x0']+i['width'] , i['y0']            , i['x0']+i['width']+wall_width , i['y0']+i['depth']+wall_width)     )
            walls.append((i['x0']+wall_width , i['y0']+i['depth'] , i['x0']+i['width']            , i['y0']+i['depth']+wall_width)     )
            walls.append((i['x0']            , i['y0']            , i['x0']+wall_width            , i['y0']+i['depth']+wall_width)     )
        walls_polygons=([box(ii[0],ii[1],ii[2],ii[3]) for ii in set(walls)])

        doors_polygons=[]
        for i in self.s.query("SELECT * FROM aamks_geom WHERE floor=? AND type_tri='DOOR' ORDER BY name", (floor,)):
            doors_polygons.append(box(i['x0'], i['y0'], i['x0']+i['width'], i['y0']+i['depth']))
            
        boxen=[]
        for wall in walls_polygons:
            for door in doors_polygons:
                if wall.intersection(door).area > wall_width**2:
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
                self.make_vis('Room without door', i['global_type_id'], 'COMPA')
# }}}


    def make_vis(self, title, faulty_id='', type_pri='HVENT'):# {{{
        ''' 
        This method is for visualizing both errors and just how things look. 
        If faulty_id comes non-empty then we are signaling an error.
        '''

        if faulty_id != '':
            r=self.s.query("SELECT name,floor FROM aamks_geom WHERE type_pri=? AND global_type_id=?", (type_pri,faulty_id))[0]
            fatal="Fatal: {}: {}".format(r['name'], title)
            Vis(r['name'], 'image', "<ered>{}</ered>".format(fatal))
            print("\n\n{}. Running xdg-open http://localhost:8123/workers/vis/master.html. See your webbrowser.".format(fatal))
            Popen('xdg-open http://localhost:8123/workers/vis/master.html', shell=True)
            sys.exit()
        else:
            Vis(None, 'image', title)
# }}}
