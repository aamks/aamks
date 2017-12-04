# MODULES
# {{{
from pprint import pprint
import json
from collections import OrderedDict
import shutil
import os
import re
import sys
from pprint import pprint
import codecs
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
        self._create_sqlite_table()
        self._make_elem_counter()
        geometry_data=self._geometry_reader()
        self._geometry2sqlite(geometry_data)
        self._init_helper_variables()
        self._invert_y()
        self.make_vis('Create geometry')
        self._make_fake_wells()
        self._aamks_geom_into_polygons()
        self._aamks_geom_orientation()
        self._make_id2compa_name()
        self._find_horiz_intersections()
        self._remove_fake_wells()
        self._get_faces()
        self._hvents_per_room()
        self._find_vertical_intersections()
        self._vvents_per_room()
        self._add_names_to_vents_from_to()
        self._calculate_sills()
        self._auto_detectors_and_sprinklers()
        self._rooms_into_obstacles()
        self.make_vis('Create obstacles')
        self._find_room_intersects_doors_or_holes()
        self._assert_faces_ok()
        self._assert_room_has_door()
        self._save()
# }}}

    def _create_sqlite_table(self):# {{{
        ''' Init sqlite aamks_geom table. Must use two unique ids a) 'name' for visualisation b) 'global_type_id' for cfast enumeration. '''
        self.s.query("CREATE TABLE aamks_geom('name','floor','global_type_id','hvent_room_seq','vvent_room_seq','type_pri','type_sec','type_tri','x0','y0','z0','width','depth','height','cfast_width','sill','face','face_offset','vent_from','vent_to','material_ceiling','material_floor','material_wall','sprinkler','detector','is_vertical','vent_from_name','vent_to_name', 'how_much_open', 'room_area', 'x1', 'y1', 'z1', 'center_x', 'center_y', 'center_z')")
# }}}
    def _geometry_reader(self):# {{{
        g=self.conf['GENERAL']['INPUT_GEOMETRY']
        if g=="cad.json":
            geometry_data=self.json.read("{}/cad.json".format(os.environ['AAMKS_PROJECT']))
        if g=="input.svg":
            InkscapeReader()
            geometry_data=self.json.read("{}/svg.json".format(os.environ['AAMKS_PROJECT']))

        return geometry_data
# }}}
    def _geometry2sqlite(self,geometry_data):# {{{
        ''' Parse geometry and place geoms in sqlite. The lowest floor is always 1. The geometry_data example for floor(1):

            "1": [
                "ROOM": [
                    [ [ 3.0 , 4.8 , 0.0 ] , [ 4.8 , 6.5 , 3.0 ] ] ,
                    [ [ 3.0 , 6.5 , 0.0 ] , [ 6.8 , 7.4 , 3.0 ] ] 
                ]
            ]

        Each geom entity will be classified as DOOR, WINDOW, ROOM etc, and will get a unique name via elem_counter
        Some columns in db are left empty for now.
        We multiply geometries * 100 and work on integer cm. This prevents us from the issues with shapely floats and rounding.
        '''

        data=[]
        for floor,gg in geometry_data.items():
            floor=int(floor)
            for k,arr in gg.items():
                for v in arr:
                    v[0]=[ int(i*100) for i in v[0] ]
                    v[1]=[ int(i*100) for i in v[1] ]
                    width= v[1][0]-v[0][0]
                    depth= v[1][1]-v[0][1]
                    height=v[1][2]-v[0][2]
                    data.append(self._prepare_geom_record(k,v,width,depth,height,floor))
        self.s.executemany('INSERT INTO aamks_geom VALUES ({})'.format(','.join('?' * len(data[0]))), data)
#}}}
    def _invert_y(self):# {{{
        ''' 
        Cad and inkscape have their (0,0) in bottom left. We will present
        geometries on web with (0,0) in top left, hence we need to invert Y.
        '''
        miny=self.s.query("SELECT min(y0) AS r FROM aamks_geom")[0]['r']
        maxy=self.s.query("SELECT max(y1) AS r FROM aamks_geom")[0]['r']
        height=maxy-miny
        self.s.query("UPDATE aamks_geom SET y0=?-y1, y1=?-y0, center_y=?-center_y", (height,height,height))
#}}}
    def _prepare_geom_record(self,k,v,width,depth,height,floor):# {{{
        ''' Format a record for sqlite. Hvents get fixed width 4 cm '''
        # COMPA
        if k in ('ROOM', 'COR', 'HALL', 'STAI'):      
            type_pri='COMPA'
            type_tri=''
        
        # VVENT      
        elif k in ('VNT'):                  
            type_pri='VVENT'
            height=10 
            type_tri=''
        
        # HVENT  
        else:                               
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

        #data.append('name' , 'floor' , 'global_type_id' , 'hvent_room_seq' , 'vvent_room_seq' , 'type_pri' , 'type_sec' , 'type_tri' , 'x0'    , 'y0'    , 'z0'    , 'width' , 'depth' , 'height' , 'cfast_width' , 'sill' , 'face' , 'face_offset' , 'vent_from' , 'vent_to' , 'material_ceiling'                       , 'material_floor'                       , 'material_wall'                       , 'sprinkler' , 'detector' ,  'is_vertical' , 'vent_from_name' , 'vent_to_name' , 'how_much_open' , 'room_area' , 'x1' , 'y1' , 'z1' , 'center_x' , 'center_y' , 'center_z')
        return (name        , floor   , global_type_id   , None             , None             , type_pri   , k          , type_tri   , v[0][0] , v[0][1] , v[0][2] , width   , depth   , height   , None          , None   , None   , None          , None        , None      , self.conf['GENERAL']['MATERIAL_CEILING'] , self.conf['GENERAL']['MATERIAL_FLOOR'] , self.conf['GENERAL']['MATERIAL_WALL'] , 0           , 0          ,  None          , None             , None           , None            , None        , None , None , None , None       , None       , None         )

# }}}
    def _init_helper_variables(self):# {{{
        self.outside_compa=self.s.query("SELECT count(*) FROM aamks_geom WHERE type_pri='COMPA'")[0]['count(*)']+1
        self.floors=        [z['floor'] for z in self.s.query("SELECT DISTINCT floor FROM aamks_geom ORDER BY floor")]
        self.all_doors=     [z['name'] for z in self.s.query("SELECT name FROM aamks_geom WHERE type_tri='DOOR' ORDER BY name") ]

        self.s.query("UPDATE aamks_geom SET room_area=width*depth/10000 WHERE type_pri='COMPA'")
        self.s.query("UPDATE aamks_geom SET x1=x0+width, y1=y0+depth, z1=z0+height, center_x=x0+width/2, center_y=y0+depth/2, center_z=z0+height/2")

# }}}
    def _make_fake_wells(self):# {{{
        ''' Most STAI(RCASES) or HALL(S) are drawn on floor 1, but they are tall and need to cross other floors. We call them WELLs. 
        Say we have floor bottom lines at 0, 3, 6, 9, 12 metres and WELL's top is at 9 metres - the WELL belongs to floors 0, 3, 6.
        We INSERT fake (x,y) WELL rectangles on proper floors in order to calculate vent_from / vent_to properly. 
        The WELL's rectangle name (row['name']) on each floor is the same as the origin. 
        WELLs are temporary objects and will be removed after we are done with intersections. We identify them by row['name']='WELL' '''

        self._wells_add_floors={}
        for w in self.s.query("SELECT floor,global_type_id,height FROM aamks_geom WHERE type_sec in ('STAI','HALL')"):
            self._wells_add_floors[(w['floor'], w['global_type_id'])]=[]
            current_floor=w['floor']

            for floor in self.floors:
                for v in self.s.query("SELECT min(z0) FROM aamks_geom WHERE type_pri='COMPA' AND floor=?", (floor,)):
                    if v['min(z0)'] < w['height']:
                        self._wells_add_floors[(w['floor'], w['global_type_id'])].append(floor)
            self._wells_add_floors[(w['floor'], w['global_type_id'])].remove(current_floor)

        for w, floors in self._wells_add_floors.items():
            row=self.s.query("SELECT * FROM aamks_geom WHERE type_pri='COMPA' AND global_type_id=?", (w[1],))[0]
            for floor in floors:
                row['name']='WELL'
                row['floor']=floor
                self.s.query('INSERT INTO aamks_geom VALUES ({})'.format(','.join('?' * len(row.keys()))), list(row.values()))

# }}}
    def _make_id2compa_name(self):# {{{
        ''' Create a map of ids to names for COMPAS, e.g. _id2compa_name[4]='ROOM_1_4' '''
        self._id2compa_name=OrderedDict()
        for v in self.s.query("select name,global_type_id from aamks_geom where type_pri='COMPA'"):
            self._id2compa_name[v['global_type_id']]=v['name']
        self._id2compa_name[self.outside_compa]='outside'
# }}}
    def _add_names_to_vents_from_to(self):# {{{
        ''' Vents from/to use indices, but names will be simpler for AAMKS and for debugging. 
        Hvents/Vvents lower_id/higher_id are already taken care of in _find_vertical_intersections()
        '''
        query=[]
        for v in self.s.query("select vent_from,vent_to,name from aamks_geom where type_pri IN('HVENT', 'VVENT')"):
            query.append((self._id2compa_name[v['vent_from']], self._id2compa_name[v['vent_to']], v['name']))
        self.s.executemany('UPDATE aamks_geom SET vent_from_name=?, vent_to_name=? WHERE name=?', query)
# }}}
    def _calculate_sills(self):# {{{
        ''' Sill is the distance relative to the floor. Say there's a HVENT H between rooms A and B. Say A and B have variate z0 (floor elevations). How do we calculate the height of the sill?
        The CFAST.in solution is simple: We find 'hvent_from' for H and then we use it's z0. This z0 is the needed 'relative 0' for the calcuation. '''

        for v in self.s.query("SELECT global_type_id, z0, vent_from  FROM aamks_geom WHERE type_pri='HVENT' ORDER BY name"): 
            floor_baseline=self.s.query("SELECT z0 FROM aamks_geom WHERE global_type_id=? AND type_pri='COMPA'", (v['vent_from'],))[0]['z0']
            self.s.query("UPDATE aamks_geom SET sill=? WHERE type_pri='HVENT' AND global_type_id=?", (v['z0']-floor_baseline, v['global_type_id']))

# }}}
    def _auto_detectors_and_sprinklers(self):# {{{
        if self.conf['GENERAL']['AUTO_DETECTORS'] == 1:
            self.s.query("UPDATE aamks_geom set detector = 1 WHERE type_pri='COMPA'")
        if self.conf['GENERAL']['AUTO_SPRINKLERS'] == 1:
            self.s.query("UPDATE aamks_geom set sprinkler = 1 WHERE type_pri='COMPA'")
# }}}
    def _make_elem_counter(self):# {{{
        ''' Geom primary types are enumerated globally for the building in sqlite. 
        Each of the types has separate numbering starting from 1.
        ROOM_2_8 refers to the eight compartment in the building which happens to exist on floor 2 
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
        ''' Is HVENT vertical or horizontal? 
        Apart from what is width and height for geometry, HVENTS have their cfast_width always along the wall
        '''
        for v in self.s.query("SELECT * from aamks_geom WHERE type_pri='HVENT' order by name"):
            if v['width'] > v['depth']:
                self.s.query("UPDATE aamks_geom SET is_vertical=0 WHERE name=?" , (v['name']  , ))
                self.s.query("UPDATE aamks_geom SET cfast_width=? WHERE name=?" , (v['width'] , v['name']))
            else:
                self.s.query("UPDATE aamks_geom SET is_vertical=1 WHERE name=?" , (v['name']  , ))
                self.s.query("UPDATE aamks_geom SET cfast_width=? WHERE name=?" , (v['depth'] , v['name']))
# }}}
    def _get_faces(self):# {{{
        ''' Cfast faces and offsets calculation. 
        HVENTS have width=4, so we only consider intersection.length > 4
        Faces are properties of doors. They are calculated in respect to the room of lower id. 
        The orientation of faces in each room:
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
        '''Cfast requires that hvents in each room are enumerated.'''
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
        ''' Cfast requires that vvents in each room are enumerated. '''
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

        for vent_id,v in vc_intersections.items():
            v=sorted(v)
            v.append(self.outside_compa)
            if len(v) not in (2,3):
                self.make_vis('Door intersects no rooms or more than 2 rooms.', vent_id)
            self.s.query("UPDATE aamks_geom SET vent_from=?, vent_to=? where global_type_id=? and type_pri='HVENT'", (v[0],v[1],vent_id))

# }}}
    def _remove_fake_wells(self):# {{{
        ''' Removing fake WELLs after we are done with horizontal intersections. '''
        self.s.query("DELETE FROM aamks_geom WHERE name='WELL'")
# }}}
    def _find_vertical_intersections(self):# {{{
        ''' Similar to _find_horiz_intersections()
        This time we are looking for a vvent (at floor n) which intersects a compa at it's floor (floor n) and a compa above (floor n+1) 
        We will iterate over two_floors, which can contain:
        a) the set of compas from (floor n) and (floor n+1)
        b) the set of compas from (floor n) only if it is the top most floor -- outside_compa will come into play

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

        for vent_id,v in vc_intersections.items():
            v=sorted(v)
            v.append(self.outside_compa)
            if len(v) not in (2,3):
                self.make_vis('Door intersects no rooms or more than 2 rooms.', vent_id)
            self.s.query("UPDATE aamks_geom SET vent_to=?, vent_from=? where global_type_id=? and type_pri='VVENT'", (v[0],v[1],vent_id))

# }}}
    def _find_room_intersects_doors_or_holes(self):# {{{
        ''' Intersecting rooms with doors/holes for graphs. '''

        all_compas=[z['name'] for z in self.s.query("SELECT name FROM aamks_geom WHERE type_pri='COMPA' ORDER BY name") ]
        all_compas.append('outside')

        self.compa_intersects_doors=OrderedDict((key,[]) for key in all_compas)

        for v in self.s.query("select * from aamks_geom where type_tri='DOOR'"):
            self.compa_intersects_doors[self._id2compa_name[v['vent_from']]].append(v['name'])
            self.compa_intersects_doors[self._id2compa_name[v['vent_to']]].append(v['name'])
# }}}

    def _rooms_into_obstacles(self):# {{{
        ''' Convert to multiple rectangles, which can be transformed to FDS obsts. 
        For a roomX we create a roomX_ghost, we move it by wall_width, which must match the width of hvents. Then we create walls via logical operations.
        We then intersect the walls with the doors to have openings in the walls.
        The door's width can originate on top of the wall, but such intersections don't count. Only intesections of area > wall_width**2 count -- only doors that have long side on the wall.
        For comfortable debuging filter geoms in self.s.query(). 
        '''

        wall_width=4
        self.obstacles=OrderedDict()
        for floor in self.floors:
            walls=[]
            for i in self.s.query("SELECT * FROM aamks_geom WHERE floor=? AND type_pri='COMPA' ORDER BY name", (floor,)):
            #for i in self.s.query("SELECT * FROM aamks_geom WHERE name='ROOM_1_23' ORDER BY name"):
                walls.append((i['x0']+wall_width , i['y0']            , i['x0']+i['width']            , i['y0']+wall_width)                )
                walls.append((i['x0']+i['width'] , i['y0']            , i['x0']+i['width']+wall_width , i['y0']+i['depth']+wall_width)     )
                walls.append((i['x0']+wall_width , i['y0']+i['depth'] , i['x0']+i['width']            , i['y0']+i['depth']+wall_width)     )
                walls.append((i['x0']            , i['y0']            , i['x0']+wall_width            , i['y0']+i['depth']+wall_width)     )
            walls_polygons=([box(ii[0],ii[1],ii[2],ii[3]) for ii in set(walls)])

            doors_polygons=[]
            for i in self.s.query("SELECT * FROM aamks_geom WHERE floor=? AND type_tri='DOOR' ORDER BY name", (floor,)):
                doors_polygons.append(box(i['x0'], i['y0'], i['x0']+i['width'], i['y0']+i['depth']))
            #self.plot_x([ (i,None,"#ff00ff") for i in walls_polygons ] + [ (i,None,None) for i in doors_polygons])

                
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

            self.obstacles[floor]=[]

            for b in boxen:
                self.obstacles[floor].append([(int(i[0]), int(i[1])) for i in list(b.exterior.coords)[0:4]])
# }}}

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
    def _save(self):# {{{
        ''' Geometry will be written to geom.json and passed to workers. '''

        compas={}
        for floor in self.floors:
            compas[floor]=self.s.query('SELECT name, type_pri, type_sec, type_tri, x0, y0, z0, x1, y1, z1, width, depth, height, center_x, center_y, center_z, vent_from_name, vent_to_name, how_much_open FROM aamks_geom WHERE floor=? ', (floor,))

        dump_objects=OrderedDict()
        dump_objects['geom']=compas
        try: 
            dump_objects['obstacles']=self.obstacles
            dump_objects['compa_intersects_doors']=self.compa_intersects_doors
        except:
            pass

        self.json.write(dump_objects, "{}/geom.json".format(os.environ['AAMKS_PROJECT']))
# }}}

    def make_vis(self, title, faulty_id='', type_pri='HVENT', floor=1):# {{{
        ''' This method is for visualizing both errors and just how things look. 
        First we need to self._save() data to intermediate geom.json file. 

        '''
        self._save()
        if faulty_id != '':
            r=self.s.query("SELECT name,floor FROM aamks_geom WHERE type_pri=? AND global_type_id=?", (type_pri,faulty_id))[0]
            Vis(r['floor'], r['name'], 'image', "<ered>Fatal: {}</ered>".format(title))
            print("Fatal: {}: {}".format(r['name'], title))
            sys.exit()
        else:
            Vis(floor, None, 'image', title)
# }}}
