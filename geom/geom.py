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

class Geom():
    def __init__(self):# {{{
        self.json=Json()
        self.s=Sqlite("{}/aamks.sqlite".format(os.environ['AAMKS_PROJECT']))
        self.raw_geometry=self.json.read("{}/cad.json".format(os.environ['AAMKS_PROJECT']))
        self.conf=self.json.read("{}/conf.json".format(os.environ['AAMKS_PROJECT']))
        self.geomsMap=self.json.read("{}/inc.json".format(os.environ['AAMKS_PATH']))['aamksGeomsMap']
        self._doors_width=32
        self._wall_width=4
        self._geometry2sqlite()
        self._enhancements()
        self._init_dd_geoms()
        self._make_towers()
        self._floors_meta()
        self._global_meta()
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
        self._make_world2d()
        self._assert_faces_ok()
        self._assert_room_has_door()
        self._debug()
# }}}
    def _floors_meta(self):# {{{
        ''' 
        Floor dimensions are needed here and there. 
        '''

        self.floors_meta=OrderedDict()
        self._world_minx=9999999
        self._world_miny=9999999
        self._world_maxx=-9999999
        self._world_maxy=-9999999
        for floor in self.floors:
            minx=self.s.query("SELECT min(x0) AS minx FROM aamks_geom WHERE floor=?", (floor,))[0]['minx']
            miny=self.s.query("SELECT min(y0) AS miny FROM aamks_geom WHERE floor=?", (floor,))[0]['miny']
            maxx=self.s.query("SELECT max(x1) AS maxx FROM aamks_geom WHERE floor=?", (floor,))[0]['maxx']
            maxy=self.s.query("SELECT max(y1) AS maxy FROM aamks_geom WHERE floor=?", (floor,))[0]['maxy']
            z0=self.s.query("SELECT z0 FROM aamks_geom WHERE floor=?", (floor,))[0]['z0']

            width= maxx - minx
            height= maxy - miny
            center=(minx + int(width/2), miny + int(height/2), z0)
            self.floors_meta[floor]=OrderedDict([('width', width) , ('height', height) , ('z', z0), ('center', center), ('minx', minx) , ('miny', miny) , ('maxx', maxx) , ('maxy', maxy)])

            self._world_minx=min(self._world_minx, minx)
            self._world_miny=min(self._world_miny, miny)
            self._world_maxx=max(self._world_maxx, maxx)
            self._world_maxy=max(self._world_maxy, maxy)
            self._world_miny=min(self._world_miny, miny)

        self.s.query("CREATE TABLE floors_meta(json)")
        self.s.query('INSERT INTO floors_meta VALUES (?)', (json.dumps(self.floors_meta),))

# }}}
    def _global_meta(self):# {{{
        self.s.query("CREATE TABLE global_meta(json)")
        self.global_meta={}

        if len(self.floors_meta) > 1:
            self.global_meta['multifloor_building']=1
        else: 
            self.global_meta['multifloor_building']=0

        self.s.query('INSERT INTO global_meta(json) VALUES (?)', (json.dumps(self.global_meta),))

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

        Some columns in db are left empty for now. 

        Sqlite's aamks_geom table must use two unique ids 
        a) 'name' for visualisation and 
        b) 'global_type_id' for cfast enumeration. 
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
                    attrs=self._prepare_attrs(v[2])
                    record=self._prepare_geom_record(k,[p0,p1],width,depth,height,floor,attrs)
                    if record != False:
                        data.append(record)
        self.s.query("CREATE TABLE aamks_geom(name,floor,global_type_id,hvent_room_seq,vvent_room_seq,type_pri,type_sec,type_tri,x0,y0,z0,width,depth,height,cfast_width,sill,face,face_offset,vent_from,vent_to,material_ceiling,material_floor,material_wall,heat_detectors,smoke_detectors,sprinklers,is_vertical,vent_from_name,vent_to_name, how_much_open, room_area, x1, y1, z1, center_x, center_y, center_z, fire_model_ignore,mvent_throughput,exit_type,room_enter)")
        self.s.executemany('INSERT INTO aamks_geom VALUES ({})'.format(','.join('?' * len(data[0]))), data)
        #dd(self.s.dump())
#}}}
    def _prepare_attrs(self,attrs):# {{{
        aa={"mvent_throughput": None, "exit_type": None, "room_enter": None }
        for k,v in attrs.items():
            aa[k]=v
        return aa
# }}}
    def _prepare_geom_record(self,k,v,width,depth,height,floor,attrs):# {{{
        ''' Format a record for sqlite. Hvents get fixed width self._doors_width cm '''
        # OBST
        if k in ('OBST',):
            type_pri='OBST'
            type_tri=''

        # EVACUEE
        elif k in ('EVACUEE',):                  
            type_pri='EVACUEE'
            type_tri=''

        # FIRE
        elif k in ('FIRE',):                  
            type_pri='FIRE'
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
        elif k in ('DOOR', 'DCLOSER', 'DELECTR', 'HOLE', 'WIN'): 
            width=max(width,self._doors_width)
            depth=max(depth,self._doors_width)
            type_pri='HVENT'
            if k in ('DOOR', 'DCLOSER', 'DELECTR', 'HOLE'): 
                type_tri='DOOR'
            elif k in ('WIN'):
                type_tri='WIN'

        global_type_id=attrs['idx'];
        name='{}{}'.format(self.geomsMap[k], global_type_id)

        #self.s.query("CREATE TABLE aamks_geom(name , floor , global_type_id , hvent_room_seq , vvent_room_seq , type_pri , type_sec , type_tri , x0      , y0      , z0      , width , depth , height , cfast_width , sill , face , face_offset , vent_from , vent_to , material_ceiling                      , material_floor                      , material_wall                      , heat_detectors , smoke_detectors , sprinklers , is_vertical , vent_from_name , vent_to_name , how_much_open , room_area , x1   , y1   , z1   , center_x , center_y , center_z , fire_model_ignore , mvent_throughput          , exit_type          , room_enter          )")
        return (name                                , floor , global_type_id , None           , None           , type_pri , k        , type_tri , v[0][0] , v[0][1] , v[0][2] , width , depth , height , None        , None , None , None        , None      , None    , self.conf['material_ceiling']['type'] , self.conf['material_floor']['type'] , self.conf['material_wall']['type'] , 0              , 0               , 0          , None        , None           , None         , None          , None      , None , None , None , None     , None     , None     , 0                 , attrs['mvent_throughput'] , attrs['exit_type'] , attrs['room_enter'] )

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
            z=self.json.read('{}/dd_geoms.json'.format(os.environ['AAMKS_PROJECT']))
            z["0"]['rectangles'].append( { "xy": (0    , 0)    , "width": 200              , "depth": 200        , "strokeColor": "#fff" , "strokeWidth": 2  , "fillColor": "#f80" , "opacity": 0.7 } )
            z["0"]['circles'].append({ "xy": (i['center_x'], i['center_y']),"radius": 200, "fillColor": "#fff" , "opacity": 0.3 } )
            self.json.write(z, '{}/dd_geoms.json'.format(os.environ['AAMKS_PROJECT']))
        '''

        z=dict()
        for floor in self.floors+['world2d']:
            z[floor]=dict()
            z[floor]['rectangles']=[]      
            z[floor]['lines']=[]           
            z[floor]['circles']=[]         
            z[floor]['texts']=[]           
            z[floor]['rectangles']=[]      
            #for i in self.s.query("SELECT * FROM aamks_geom WHERE type_tri='DOOR' AND floor=?", (floor,)): 
            #    z[floor]['circles'].append({ "xy": (i['center_x'] , i['center_y']) , "radius": 90 , "fillColor": "#fff" , "opacity": 0.05 } )

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

# TOWERS
    def _make_towers(self):# {{{
        ''' 
        This is for evacuation only and cannot interfere with fire models
        (fire_model_ignore=1). Most STAI(RCASES) or HALL(S) are drawn on floor
        0, but they are tall and need to cross other floors (towers). Say we
        have floor bottoms at 0, 3, 6, 9, 12 metres and STAI's top is at 9
        metres - the STAI belongs to floors 0, 1, 2. We INSERT fake (x,y) STAI
        slices on proper floors in order to calculate vent_from / vent_to
        properly. 

        These fake entities are enumerated from 100000

        '''

        next_id=100000
        towers={}
        for w in self.s.query("SELECT floor,height,name,type_sec FROM aamks_geom WHERE type_sec in ('STAI','HALL')"):
            towers[(w['floor'], w['name'], w['type_sec'])]=[]
            current_floor=w['floor']

            for floor in self.floors:
                for v in self.s.query("SELECT min(z0) FROM aamks_geom WHERE type_pri='COMPA' AND floor=?", (floor,)):
                    if v['min(z0)'] < w['height']:
                        towers[(w['floor'], w['name'], w['type_sec'])].append(floor)
            towers[(w['floor'], w['name'], w['type_sec'])].remove(current_floor)

        towers=self._drop_f0_only_towers(towers)
        
        for w, floors in towers.items():
            self.s.query("UPDATE aamks_geom set type_tri='TOWER_BASE' WHERE name=?", (w[1],))
            row=self.s.query("SELECT * FROM aamks_geom WHERE name=?", (w[1],))[0]
            orig_name=row['name']
            for floor in floors:
                row['fire_model_ignore']=1
                row['floor']=floor
                row['global_type_id']=next_id
                next_id+=1
                row['name']="{}.{}".format(orig_name,floor)
                row['type_tri']="TOWER_FLOOR"
                self.s.query('INSERT INTO aamks_geom VALUES ({})'.format(','.join('?' * len(row.keys()))), list(row.values()))

        self._towers_meta(towers)
# }}}
    def _drop_f0_only_towers(self,towers):# {{{
        '''
        Towers are for only more than one floor, as the vertical evacuation
        happens only there.
        '''

        drop=[]
        for w, floors in towers.items():
            if len(floors)==0:
                drop.append(w)
        for i in drop:
            del towers[i]
        return towers
# }}}
    def _towers_meta(self, towers):# {{{
        '''
        The floor segment of a staircase (FSoS) is a cuboid which may be
        perceived as a deformed plane originally. Then FSoS contains as many
        agents as just a flat floor (top projection) does.

        In Animator the agents will have the same balls sizes for top and side
        views. Therefore we need to scale the staircase height so that the same
        number of agents fits the given cuboid. 

        FSoS side projection must then equal room_area which must equal height
        x max(width,depth) since we pick max of width or depth for staircase
        projection. 

        We need to calculate how many FSoS'es there are for each staircase
        (tower_span).

        Assumption: on the top-most-floor there only fit two rows of agents,
        i.e. 2 x 54cm balls rows.

        '''

        for k,v in towers.items():
            towers[k]=['0']+v

        self._towers={}
        self._towers['x_offset']=300
        self._towers['animator_floor_height']=1000
        self._towers['top_floor_area']=120
        self._towers['towers']=towers
        if bool(towers):
            self._towers['max_spans']=self._towers_max_spans()
            self._towers['lines']=self._towers_lines()
            self._towers['rectangles']=self._towers_rectangles()
            self._towers['width']=self._towers_width()
            #self._towers['multifloor']=1
        else:
            #self._towers['multifloor']=None
            self._towers['width']=1
            self._towers['lines']={}
            self._towers['rectangles']={}
# }}}
    def _towers_max_spans(self):# {{{
        '''
        The number of floors in the heighest staircase 
        '''

        max_spans=-1
        for k,v in self._towers['towers'].items():
            if len(v) > max_spans: 
                max_spans=len(v)
                maxs=(k[2], max_spans)
        return maxs
# }}}
    def _towers_lines(self):# {{{
        '''
        Helper horizontal lines for Animator: 2, 1, 0
        '''
        maxs=self._towers['max_spans']
        animator_floor_height=self._towers['animator_floor_height']
        top_floor_area=self._towers['top_floor_area']
        lines=OrderedDict()
        for i in reversed(range(maxs[1])):
            lines[str(i)] = animator_floor_height * (maxs[1]-1-i) + top_floor_area
        return lines

# }}}
    def _towers_rectangles(self):# {{{
        '''
        All FSoS'es will be represented at constant height to better fit
        Animator. It will allow to compare to vertical speed at the same
        distance for each staircase and align the floors. We are free to deform
        any staircase in any way taking the resulting area (the capacity for
        evacuees) is not changed. Therefore we pick the preferred height and
        alter width to keep to original area.

        animator_floor_height=1000 seems like a reasonable height for animator.
        Speed of agents will be scaled to match the vertical movement in this
        height.
        '''

        animator_floor_height=self._towers['animator_floor_height']
        top_floor_area=self._towers['top_floor_area']
        towers=self._towers['towers']
        lines=self._towers['lines']

        t=OrderedDict()
        x_offset=self._towers['x_offset']
        for k,v in towers.items():
            rects=[]
            i=self.s.query("SELECT * FROM aamks_geom WHERE name=?", (k[1],))[0]
            width=int(i['width']*i['depth'] / animator_floor_height)
            for floor in v:
                rects.append({"floor": floor, "x0": x_offset, "y1": lines[floor], 'height': animator_floor_height, 'width': width})
            rects[-1]['height']=top_floor_area

            t[i['name']]=rects
            x_offset+=width+self._towers['x_offset']
        return t

# }}}
    def _towers_width(self):# {{{
        mmax=-99999
        for t in self._towers['rectangles'].values():
            for i in t:
                mmax=max(mmax,(i['width']+i['x0']))
        return mmax
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
            for v in self.s.query("SELECT * FROM aamks_geom WHERE type_pri NOT IN('OBST', 'EVACUEE', 'FIRE') AND floor=?", (floor,)):
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
                    self.make_vis("Space between compas", vent_id)
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
        for floor,gg in self.raw_geometry.items():
            data['points'][floor]=[]
            data['named'][floor]=[]
            boxen=[]
            for v in gg['OBST']:
                boxen.append(box(int(v[0][0]), int(v[0][1]), int(v[1][0]), int(v[1][1])))
                
            boxen+=self._rooms_into_boxen(floor)
            data['named'][floor]=self._boxen_into_rectangles(boxen)
            for i in boxen:
                data['points'][floor].append([(int(x),int(y), self.floors_meta[floor]['z']) for x,y in i.exterior.coords])
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

            walls.append((i['x0']+self._wall_width , i['y0']            , i['x0']+i['width']                  , i['y0']+self._wall_width)                )
            walls.append((i['x0']+i['width']       , i['y0']            , i['x0']+i['width']+self._wall_width , i['y0']+i['depth']+self._wall_width)     )
            walls.append((i['x0']+self._wall_width , i['y0']+i['depth'] , i['x0']+i['width']                  , i['y0']+i['depth']+self._wall_width)     )
            walls.append((i['x0']                  , i['y0']            , i['x0']+self._wall_width            , i['y0']+i['depth']+self._wall_width)     )

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

# WORLD 2D
    def _make_world2d(self):# {{{
        '''
        CFAST uses the real 3D model, but for RVO2 we flatten the world to 2D
        '''
        
        if self.global_meta['multifloor_building']==0:
            return

        self.s.query("CREATE TABLE world2d(name,floor,global_type_id,hvent_room_seq,vvent_room_seq,type_pri,type_sec,type_tri,x0,y0,z0,width,depth,height,cfast_width,sill,face,face_offset,vent_from,vent_to,material_ceiling,material_floor,material_wall,heat_detectors,smoke_detectors,sprinklers,is_vertical,vent_from_name,vent_to_name, how_much_open, room_area, x1, y1, z1, center_x, center_y, center_z, fire_model_ignore,mvent_throughput,exit_type,room_enter)")
        self.s.query("INSERT INTO world2d SELECT * FROM aamks_geom")

        # TODO: we should probably do without self.world2d_ty var, since later we've got this
        # self._towers={} thing, which should be even wiser.
        # ty stands for translate y

        self.world2d_ty=OrderedDict()
        last_maxy=-200

        z=self.json.read('{}/dd_geoms.json'.format(os.environ['AAMKS_PROJECT']))
        for floor in list(self.floors_meta.keys())[::-1]:
            meta=self.floors_meta[floor]
            ty=last_maxy+200-meta['miny']
            last_maxy+=meta['height']+400
            self.s.query("UPDATE world2d SET y0=y0+?, y1=y1+?, center_y=center_y+?, z0=0, z1=0, center_z=0 WHERE floor=?", (ty,ty,ty,floor))
            z['world2d']['lines'].append( { "xy": (self._world_minx-300 , last_maxy)     , "x1": self._world_maxx , "y1": last_maxy , "strokeColor": "#fff" , "strokeWidth": 4   , "opacity": 0.7 } )
            z['world2d']['texts'].append( { "xy": (self._world_minx-300 , last_maxy-50) , "content": floor       , "fontSize": 200 , "fillColor": "#fff"   , "opacity": 0.7 } )
            self.world2d_ty[floor]=ty

        self.s.query("UPDATE world2d SET floor='world2d'")
        self.json.write(z, '{}/dd_geoms.json'.format(os.environ['AAMKS_PROJECT']))
        self._make_world2d_staircases_lines()
        self._make_world2d_staircases()
        self._make_world2d_meta()
        self._make_world2d_obstacles()
        self.s.query("UPDATE aamks_geom SET name=name||'.0' WHERE type_tri='TOWER_BASE'")
        self.s.query("UPDATE world2d    SET name=name||'.0' WHERE type_tri='TOWER_BASE'")
        self.s.query("UPDATE aamks_geom SET vent_to_name=vent_to_name||'.0' WHERE vent_to_name LIKE 's%' AND vent_to_name NOT LIKE 's%.%'")
        self.s.query("UPDATE world2d    SET vent_to_name=vent_to_name||'.0' WHERE vent_to_name LIKE 's%' AND vent_to_name NOT LIKE 's%.%'")
# }}}
    def _make_world2d_staircases_lines(self):# {{{

        self._towers['x0']=self.s.query("SELECT max(x1) AS maxx FROM world2d")[0]['maxx']
        x0=self._towers['x0'] + self._towers['x_offset']
        x1=x0+self._towers['width']
        z=self.json.read('{}/dd_geoms.json'.format(os.environ['AAMKS_PROJECT']))
        for k,v in self._towers['lines'].items():
            z['world2d']['lines'].append( { "xy": (x0 , v)     , "x1": x1       , "y1": v         , "strokeColor": "#fff" , "strokeWidth": 4   , "opacity": 0.7 } )
            z['world2d']['texts'].append( { "xy": (x0 , v-50) , "content": k, "fontSize": 200 , "fillColor": "#fff"   , "opacity": 0.7 } )

        self.json.write(z, '{}/dd_geoms.json'.format(os.environ['AAMKS_PROJECT']))

    # }}}
    def _make_world2d_staircases(self):# {{{
        towers_offset=self.s.query("SELECT max(x1) AS maxx FROM world2d")[0]['maxx'] + self._towers['x_offset']
        for k,tt in self._towers['rectangles'].items():
            i=self.s.query("SELECT * FROM aamks_geom WHERE name=?", (k,))[0]
            for ii in tt:
                i['floor']='world2d'
                i['name']="{}|{}".format(k,ii['floor'])
                i['x0']=towers_offset+ii['x0']
                i['x1']=i['x0']+ii['width']
                i['y1']=ii['y1']
                i['width']=ii['width']
                i['y0']=i['y1']-ii['height']
                i['depth']=i['y1']-i['y0']
                i['type_tri']='TOWER_FLOOR'
                self.s.query("DELETE FROM world2d WHERE name=?", (i['name'],))
                self.s.dict_insert('world2d', i)
# }}}
    def _make_world2d_meta(self):# {{{
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

        world2d_meta=OrderedDict([('width', width) , ('height', height) , ('z', 0), ('center', center), ('minx', minx) , ('miny', miny) , ('maxx', maxx) , ('maxy', maxy), ('world2d_ty', self.world2d_ty)])
        self.s.query("CREATE TABLE world2d_meta(json)")
        self.s.query("INSERT INTO world2d_meta VALUES (?)", (json.dumps(world2d_meta),))
        self.s.query("UPDATE world2d SET x1=x0+width, y1=y0+depth, z1=z0+height, center_x=x0+width/2, center_y=y0+depth/2, center_z=z0+height/2")

# }}}
    def _make_world2d_obstacles(self):# {{{
        '''
        CFAST uses the real 3D model, but for RVO2 we flatten the world to 2D
        '''

        obstacles=self.json.readdb("obstacles")
        data={}
        data['points']=[]
        for floor,obsts in obstacles['points'].items():
            for obst in obsts:
                obst[0][1]+=self.world2d_ty[floor]
                obst[1][1]+=self.world2d_ty[floor]
                obst[2][1]+=self.world2d_ty[floor]
                obst[3][1]+=self.world2d_ty[floor]
                obst[4][1]+=self.world2d_ty[floor]

                obst[0][2]=300
                obst[1][2]=300
                obst[2][2]=300
                obst[3][2]=300
                obst[4][2]=300
                data['points'].append(obst)

        data['named']=[]
        for floor,obsts in obstacles['named'].items():
            for obst in obsts:
                obst['y0']+=self.world2d_ty[floor]
                data['named'].append(obst)

        staircase_obstacles=self._make_world2d_staircases_obstacles()
        data['points']+=staircase_obstacles['points']
        data['named']+=staircase_obstacles['named']

        self.s.query("CREATE TABLE world2d_obstacles(json)")
        self.s.query("INSERT INTO world2d_obstacles VALUES (?)", (json.dumps(data),))

# }}}
    def _make_world2d_staircases_obstacles(self):# {{{
        '''
        We are cutting holes in the bottom of each FSoS.
        The width of the hole is hardcoded to 200 cm (center_x +/-100).

        '''

        walls=[]

        for k,rects in self._towers['rectangles'].items():
            for i in rects:
                i['x0']+=self._towers['x0']+self._towers['x_offset']
                i['y0']=i['y1']-i['height']
                walls.append((i['x0']+i['width']       , i['y0']             , i['x0']+i['width']+self._wall_width , i['y0']+i['height']+self._wall_width) )
                walls.append((i['x0']                  , i['y0']             , i['x0']+self._wall_width            , i['y0']+i['height']+self._wall_width) )
                walls.append((i['x0']+i['width']/2+100 , i['y0']+i['height'] , i['x0']+i['width']                  , i['y0']+i['height']+self._wall_width) )
                walls.append((i['x0']+self._wall_width , i['y0']+i['height'] , i['x0']+i['width']/2-100            , i['y0']+i['height']+self._wall_width) )

            ceiling=(i['x0']+self._wall_width , i['y0'] , i['x0']+i['width'] , i['y0']+self._wall_width)
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

    def _debug(self):# {{{
        pass
        #dd(os.environ['AAMKS_PROJECT'])
        #self.s.dumpall()
        #self.s.dump_geoms()
        #dd(self.s.query("select * from aamks_geom"))
        #dd(self.s.query("select * from world2d where type_sec='STAI' or name='d14'"))
        #dd(self.s.query("select * from world2d"))
        #exit()
        #self.s.dump()
        
# }}}
