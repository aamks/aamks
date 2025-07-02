# MODULES
# {{{
import json
import os
import sys
import copy
from pprint import pprint
from collections import OrderedDict
from shapely.geometry import box, Polygon, LineString, Point, MultiPolygon, LinearRing
from shapely.ops import polygonize
from shapely.ops import unary_union
from shapely.ops import triangulate


from numpy.random import uniform
from math import sqrt
import math
from pathlib import Path

from evac.polymesh import Polymesh
from fire.partition_query import PartitionQuery
from evac.pathfinder.navmesh_baker import NavmeshBaker
from evac.pathfinder.navmesh import Navmesh as Pynavmesh
import evac.pathfinder
import matplotlib.pyplot as plt

from include import Sqlite, Json, DDgeoms, Vis
from include import Dump as dd

# }}}

class Navmesh: 
    def __init__(self, sim_id=None):# {{{
        ''' 

        ============================================

        This is how we are supposed to be called:

        nav=Navmesh()
        nav.build(floor)
        nav.nav_query(src, dst)

            or if you want to block r1 and r2 and have the navmeshes named:

        navs=dict()
        navs[('r1','r2')]=Navmesh()
        navs[('r1','r2')].build(floor,('r1','r2'))
        navs[('r1','r2')].nav_query(src, dst)

            for performance reasons navmesh looks ahead up to 16 segments, but we can extend this:

        nav.nav_query(src, dst, maxStraightPath=300)

        '''
        self.json=Json()
        new_sql_path = os.path.join(os.environ['AAMKS_PROJECT'], "workers", f"{sim_id}", f"aamks_{sim_id}.sqlite")
        if os.path.exists(new_sql_path):
            self.s=Sqlite(new_sql_path)
        else:
            self.s=Sqlite("{}/aamks.sqlite".format(os.environ['AAMKS_PROJECT']))
        self.json.s = self.s
        self._test_colors=[ "#f80", "#f00", "#8f0", "#08f" ]
        self.polymesh = Polymesh()
        self.navmesh=OrderedDict()
        self.partition_query={}
        self.evacuee_radius=self.json.read('{}/inc.json'.format(os.environ['AAMKS_PATH']))['evacueeRadius']
        self.vertex_positions = []
        self.polygons_of_the_geometry = []
        self.sim_id = sim_id
        self.obj = ""
        self.wd = None
# }}}

    def build(self,fire,floor,wd,bypass_rooms=[]):# {{{

        self.floor=floor
        self.bypass_rooms=bypass_rooms
        self._get_name(bypass_rooms)
        file_obj=self._obj_make(bypass_rooms)
        self.wd = wd
        input_path = Path(wd)
        scenario_dir = input_path.parents[1]
        no_fire_navmesh = f"pynavmesh_no_fire{floor}.nav"
        file_path = scenario_dir / no_fire_navmesh
        if file_path.exists():
            self.first_navmesh, self.navmesh = self.modify_navmesh_add_fire_obst(file_path,fire,floor)
            
        else:
            base_dir = input_path.parents[1]
            self.baker = NavmeshBaker()
            mesh = self.polymesh.import_obj(self.obj)
            polygons = self.get_polygons_for_pynavmesh(mesh)
            self.baker.add_geometry(mesh.vertices, polygons)
            self.baker.bake()
            first_navmesh_path = '/'.join([str(scenario_dir), 'pynavmesh_no_fire'+self.nav_name])
            self.baker.save_to_text(first_navmesh_path)
            self.first_navmesh, self.navmesh = self.modify_navmesh_add_fire_obst(first_navmesh_path,fire,floor)

 

# }}}

    def modify_navmesh_add_fire_obst(self,first_navmesh_path,fire,floor):
        save_navmesh_path = '/'.join([self.wd, 'pynavmesh'+self.nav_name+'_first'])
        ############################# comment down for testing
        if fire['floor'] == floor:
            fire_center_x = fire['x']/100
            fire_center_y = fire['y']/100
            # fire_center_x = 31.7
            # fire_center_y = 5.9
            side_length = 2.5 
            half_side = side_length / 2

            # Tworzenie geometrii kwadratu
            exclusion_zone = box(fire_center_x - half_side, fire_center_y - half_side, fire_center_x + half_side, fire_center_y + half_side)
            

            fire_navmesh_filename = self.generate_navmesh_near_fire(fire_center_x,fire_center_y,half_side)

            fire_vertices, fire_indices, fire_elements = self.load_navmesh(fire_navmesh_filename)
            fire_navmesh_polygons = self.create_polygons(fire_vertices, fire_indices, fire_elements)

            vertices, indices, elements = self.load_navmesh(first_navmesh_path)

            # Tworzenie listy geometrii z siatki
            polygons = self.create_polygons(vertices, indices, elements)

            # Aktualizacja siatki nawigacyjnej
            updated_polygons = self.update_navmesh(polygons, exclusion_zone,fire_navmesh_polygons)

            # Konwersja z powrotem na format siatki
            updated_vertices, updated_indices, updated_elements = self.polygons_to_navmesh(updated_polygons)

            # Zapisanie zmodyfikowanej siatki do pliku

            self.save_navmesh(save_navmesh_path, updated_vertices, updated_indices, updated_elements)
        else:
            link_name = os.path.join(self.wd, 'pynavmesh' + self.nav_name + '_first')
            target_path = first_navmesh_path

            # Tworzenie dowiązania symbolicznego
            try:
                os.symlink(target_path, link_name)
            except FileExistsError:
                print(f"Dowiązanie {link_name} już istnieje.")

        ############################# comment up for testing
        vert, polygs = evac.pathfinder.read_from_text(save_navmesh_path)


        # save_navmesh_path = '/'.join([self.wd, 'pynavmesh'+self.nav_name+'_first'])
        # vert, polygs = evac.pathfinder.read_from_text(save_navmesh_path)


        self.first_navmesh = Pynavmesh(vert, polygs)
        self.navmesh = Pynavmesh(vert, polygs)

        return self.first_navmesh, self.navmesh

    def generate_navmesh_near_fire(self, fire_center_x,fire_center_y,half_side):
        mesh = self.polymesh.import_close_to_fire(self.obj, fire_center_x, fire_center_y,half_side)

        baker = NavmeshBaker()

        polygons = self.get_polygons_for_pynavmesh(mesh)
        baker.add_geometry(mesh.vertices, polygons)
        baker.bake()
        fire_navmesh_filename = '/'.join([self.wd, 'pynavmesh_fire'+self.nav_name])
        baker.save_to_text(fire_navmesh_filename)
        return fire_navmesh_filename

    def load_navmesh(self,file_path):
        with open(file_path, "r") as file:
            lines = file.readlines()
        vertices = list(map(float, lines[0].strip().split()))
        indices = list(map(int, lines[1].strip().split()))
        elements = list(map(int, lines[2].strip().split()))
        return vertices, indices, elements


    def save_navmesh(self,file_path, vertices, indices, elements):
        with open(file_path, "w") as file:
            file.write(" ".join(map(str, vertices)) + "\n")
            file.write(" ".join(map(str, indices)) + "\n")
            file.write(" ".join(map(str, elements)))

    # Funkcja do stworzenia listy geometrii z siatki
    def create_polygons(self,vertices, indices, elements):
        polygons = []
        index = 0
        for num_vertices in elements:
            polygon_indices = indices[index:index + num_vertices]
            polygon_vertices = [(vertices[i * 3], vertices[i * 3 + 2]) for i in polygon_indices]
            polygons.append(Polygon(polygon_vertices))
            index += num_vertices
        return polygons


    def decompose_to_trapezoids(self,polygon, exclusion_zone):
        """
        Dekomponuje polygon na trójkąty, ignorując obszar exclusion_zone.
        """
        triangles = []

        if polygon.is_empty:
            return triangles

        # Obliczamy różnicę: usuwamy exclusion_zone z polygonu
        difference = polygon.difference(exclusion_zone)

        # Sprawdzamy, czy wynik to wielokąt lub zbiór wielokątów
        if difference.geom_type == "Polygon":
            geometries = [difference]
        elif difference.geom_type == "MultiPolygon":
            geometries = list(difference.geoms)
        else:
            return triangles  # Zwracamy pustą listę, jeśli geometria jest nieobsługiwana

        # Triangulujemy wszystkie części (z wyjątkiem exclusion_zone)
        for geom in geometries:
            raw_triangles = triangulate(Polygon(geom, [exclusion_zone]))

            # Dodajemy tylko trójkąty, które są poprawne
            for tri in raw_triangles:
                # if tri.is_valid and not tri.is_empty and not tri.intersects(exclusion_zone):
                if tri.is_valid and not tri.is_empty:
                    if tri.intersects(exclusion_zone) and not tri.touches(exclusion_zone) and not tri.overlaps(exclusion_zone): 
                        continue
                    else:
                        triangles.append(tri)
        return triangles

    def update_navmesh(self,polygons, exclusion_zone,fire_navmesh_polygons):
        updated_polygons = []
        updated_polygons_zone = []
        for polygon in polygons:
            if polygon.intersects(exclusion_zone):
                difference = polygon.difference(exclusion_zone)
                # printtt(difference)
                if not difference.is_empty:
                    if difference.geom_type == "Polygon":
                        trapezoids = self.decompose_to_trapezoids(difference,exclusion_zone)
                        updated_polygons_zone.extend(trapezoids)
                    elif difference.geom_type == "MultiPolygon":
                        for sub_polygon in difference.geoms:
                            trapezoids = self.decompose_to_trapezoids(sub_polygon,exclusion_zone)
                            updated_polygons_zone.extend(trapezoids)
            else:
                updated_polygons.append(polygon)




        for polygon in fire_navmesh_polygons:
            if polygon.intersects(exclusion_zone):
                intersection = polygon.intersection(exclusion_zone)
                if not intersection.is_empty:
                    if intersection.geom_type == "Polygon":
                        updated_polygons_zone.append(intersection)
                    elif intersection.geom_type == "MultiPolygon":
                        for sub_polygon in intersection.geoms:
                            updated_polygons_zone.append(sub_polygon)
        


        
        groups = self.group_adjacent(updated_polygons_zone)
        merged_regions = []
        for comp in groups:
            group_polys = [updated_polygons_zone[i] for i in comp]
            merged = unary_union(group_polys)
            merged_regions.append(merged)


        for reg in merged_regions:
            raw_triangles = triangulate(reg)
            inside_tris = [t for t in raw_triangles if reg.contains(t.centroid)]
            for tri in inside_tris:
                updated_polygons.append(tri)



        return updated_polygons


    def group_adjacent(self, polygons):
        """
        Wejście: lista obiektów shapely.geometry.Polygon.
        Wyjście: lista list – każda podlista to indeksy polygonów, które są ze sobą połączone.
        """
        n = len(polygons)
        visited = [False] * n
        groups = []

        # Funkcja BFS/DFS po „grafie” przyległości
        def dfs(start_idx):
            stack = [start_idx]
            comp = []
            visited[start_idx] = True
            while stack:
                i = stack.pop()
                comp.append(i)
                for j in range(n):
                    if not visited[j] and polygons[i].intersects(polygons[j]):
                        visited[j] = True
                        stack.append(j)
            return comp

        for i in range(n):
            if not visited[i]:
                groups.append(dfs(i))
        return groups

    def polygons_to_navmesh(self, polygons):
        vertices = []
        indices = []
        elements = []
        vertex_map = {}
        current_index = 0

        for polygon in polygons:
            # Pobierz punkty granicy z pominięciem ostatniego duplikatu
            polygon_vertices = list(polygon.exterior.coords)[:-1]

            # Sprawdź, czy są w kolejności CCW
            if LinearRing(polygon_vertices).is_ccw:
                polygon_vertices.reverse()  # Odwróć do CW

            element_indices = []

            for vertex in polygon_vertices:
                if vertex not in vertex_map:
                    vertex_map[vertex] = current_index
                    vertices.extend([vertex[0], 0.0, vertex[1]])  # Format: X, Y=0.0, Z
                    current_index += 1
                element_indices.append(vertex_map[vertex])

            indices.extend(element_indices)
            elements.append(len(element_indices))

        return vertices, indices, elements

    def get_polygons_for_pynavmesh(self, mesh):
        index = 0
        polygons = []
        for s in mesh.faces_vertex_count:
            polygon = []
            for i in range(s):
                polygon.append(mesh.faces_definition[index])
                index += 1
                polygons.append(polygon)
        return polygons

    def nav_query(self,src,dst,maxStraightPath=16):# {{{
        path = self.navmesh.search_path((src[0]/100, 0.0, src[1]/100), (dst[0]/100, 0.0, dst[1]/100))
        path_to_return = []
        if len(path) > 0:
            for i in path:
                path_to_return.append((i[0]*100, i[2]*100))
            return path_to_return
        else:
            return ['err']

    def nav_query_first_navmesh(self,src,dst,maxStraightPath=16):# {{{
        path = self.first_navmesh.search_path((src[0]/100, 0.0, src[1]/100), (dst[0]/100, 0.0, dst[1]/100))
        path_to_return = []
        if len(path) > 0:
            for i in path:
                path_to_return.append((i[0]*100, i[2]*100))
            return path_to_return
        else:
            return ['err']

            
# }}}
    def room_leaves(self,ee):# {{{
        self.partition_query[self.floor]=PartitionQuery(self.floor)
        room=self.partition_query[self.floor].xy2room(ee)
        closest={ 'len': 999999999, 'name': None, 'x': None, 'y': None }

        leaves={}
        for door in self._room_exit_doors(room):
            dest=self._move_dest_around_door({'e': ee, 'door': door, 'room': room})
            ll=self.path_length(ee,dest)
            leaves[ll]=(dest, door['name'])

        best_point, best_name=leaves[min(leaves.keys())]
        best_path=self.nav_query(ee, best_point, 300)
        candidates={'best_point': best_point, 'best_name': best_name, 'best_path': best_path, 'all': list(leaves.values())}
        return candidates

# }}}
    def path_length(self, src, dst):# {{{
        return LineString(self.nav_query(src, dst, 300)).length 
# }}}
    def nav_plot_path(self,points,ddgeoms,style={}):# {{{
        ss={ "strokeColor": "#fff", "strokeWidth": 14  , "opacity": 0.5 }
        for m,n in style.items():
            ss[m]=n
        ddgeoms.add({'floor': self.floor, 'type': 'path', "g": { "points": points } , 'style': ss } )
# }}}
    def test(self):# {{{
        self.conf=self.json.read("{}/conf.json".format(os.environ['AAMKS_PROJECT']))
        agents_pairs=4
        ee=self.s.query("SELECT name,x0,y0 FROM aamks_geom WHERE type_pri='EVACUEE' AND floor=? ORDER BY global_type_id LIMIT ?", (self.floor, agents_pairs*2))
        if len(ee) == 0: return
        evacuees=list(self._chunks(ee,2))
        self._test_evacuees_pairs(evacuees)
        if self.conf['fire_model'] != 'FDS':
            self._test_room_leaves((ee[0]['x0'], ee[0]['y0']))
        Vis({'highlight_geom': None, 'anim': None, 'title': 'Nav {} test'.format(self.nav_name), 'srv': 1})

# }}}

    def _bricked_wall(self, bypass_rooms=[]):# {{{
        '''
        For navmesh we may wish to turn some doors into bricks.
        '''

        bricked_wall=[]

        if len(bypass_rooms) > 0 :
            floors_meta=json.loads(self.s.query("SELECT json FROM floors_meta")[0]['json'])
            elevation=floors_meta[self.floor]['minz_abs']
            where=" WHERE "
            where+=" vent_from_name="+" OR vent_from_name=".join([ "'{}'".format(i) for i in bypass_rooms])
            where+=" OR vent_to_name="+" OR vent_to_name=".join([ "'{}'".format(i) for i in bypass_rooms])
            bypass_doors=self.s.query("SELECT name,x0,y0,x1,y1 FROM aamks_geom {}".format(where))

            for i in bypass_doors:
                bricked_wall.append([[i['x0'],i['y0'],elevation], [i['x1'],i['y0'],elevation], [i['x1'],i['y1'],elevation], [i['x0'],i['y1'],elevation], [i['x0'],i['y0'],elevation]])

        bricked_wall+=self.json.readdb("obstacles")['obstacles'][self.floor]

        return bricked_wall

# }}}
    def _obj_platform(self):# {{{
        z=self.s.query("SELECT x0,y0,x1,y1 FROM aamks_geom WHERE type_pri='COMPA' AND floor=?", (self.floor,))
        exit_doors = self.s.query("SELECT vent_to_name,vent_from_name,width,depth,center_x, center_y FROM aamks_geom WHERE terminal_door IS NOT NULL AND floor=?", (self.floor,))
        platforms=[]
        for i in z:
            platforms.append([ (i['x1'], i['y1']), (i['x1'], i['y0']), (i['x0'], i['y0']), (i['x0'], i['y1']) ])
        for i in exit_doors:
            # extra 150 px for each exit door point because navmesh baker bakes navigation mesh 
            # only on the inner surface at a distance greater than approximately cell_size 
            # plus agent_radius (read bake function in navmesh baker). If destination coordinates are in navmesh, 
            # then search_path doesnt need to call TrianglesBVH sample function - calculation is faster
            room_before_exit_center = self.s.query('SELECT points from aamks_geom WHERE name=? or name=?', (i['vent_to_name'],i['vent_from_name']))
            center_x, center_y = self.get_center_from_points(room_before_exit_center[0]['points'])
            #the outer vestibule is a virtual room - necessary to add a navigation mesh outside 
            #the exit door because agents disappear when they reach a target that is 1 m behind the exit door
            min_x, max_x, min_y, max_y = self._get_outer_vestibule_coordinates(center_x, center_y, i)
            platforms.append([ (min_x, min_y), (min_x, max_y), (max_x, max_y), (max_x,  min_y) ])
        return platforms

    def get_center_from_points(self, points):
        points_parsed_1 = points.replace('[', '')
        points_parsed_2 = points_parsed_1.replace(']', '')
        points = points_parsed_2.split(', ')
        int_points = [int(x) for x in points]
        return((int_points[0]+int_points[2]+int_points[4]+int_points[6])/4, (int_points[1]+int_points[3]+int_points[5]+int_points[7])/4)
    
    def _get_outer_vestibule_coordinates(self, last_room_center_x, last_room_center_y, door):
        if door['width'] < door['depth']:
            # exit door is vertical
            vestibule_height = (door['depth']/2 +30)
            if last_room_center_x > door['center_x']:
                #exit door leads to the left on the building plan
                return(door['center_x']-150, door['center_x'],door['center_y']-vestibule_height, door['center_y']+vestibule_height)
            if last_room_center_x < door['center_x']:
                #exit door leads to the right on the building plan
                return(door['center_x'], door['center_x']+150,door['center_y']-vestibule_height, door['center_y']+vestibule_height)
        else:
            # exit door is horizontal
            vestibule_width = (door['width']/2 +30)
            if last_room_center_y > door['center_y']:
                #The exit door leads downwards on the building plan
                return(door['center_x']-vestibule_width, door['center_x']+vestibule_width,door['center_y']-150, door['center_y'])
            
            if last_room_center_y < door['center_y']:
                #The exit door leads upwards on the building plan
                return(door['center_x']-vestibule_width, door['center_x']+vestibule_width,door['center_y'], door['center_y']+150)
            
        raise Exception("something is wrong with aamks.sqlite geometry, unable to set exit target from building 100 cm behind exit door")

# }}}
    def _obj_elem(self,face,z):# {{{
        elem=''
        if len(face[:4]) != 4:
            return ""
        elem+="o Face{}\n".format(self._obj_num)
        for verts in face[:4]:
            elem+="v {}\n".format(" ".join([ str(i/100) for i in [verts[0], z, verts[1]]]))
        elem+="f {}\n\n".format(" ".join([ str(4*self._obj_num+i)+"//1" for i in [1,2,3,4]]))
        self._obj_num+=1
        return elem
# }}}
    def _obj_make(self,bypass_rooms):# {{{
        ''' 
        1. Create obj file from aamks geometries.
        2. Build navmesh, obj is input
        3. Query navmesh with python
        4. bypass_rooms are the rooms excluded from navigation

        99 is the z-dim in cm

        '''

        z=self._bricked_wall(bypass_rooms)
        obj='';
        self._obj_num=0;
        for face in z:
            obj+=self._obj_elem(face,99)
        for face in self._obj_platform():
            obj+=self._obj_elem(face,0)
        
        path = f"{self.nav_name}.obj"
        with open(path, "w") as f: 
            f.write(obj)
        self.obj = obj
        return path

# }}}
    def _chunks(self,l, n):# {{{
        """Yield successive n-sized chunks from l."""
        for i in range(0, len(l), n):
            yield l[i:i + n]
# }}}
    def _get_name(self,bypass_rooms=[]):# {{{
        brooms=''
        if len(bypass_rooms)>0:
            brooms="-"+"-".join(bypass_rooms)
        self.nav_name="{}{}.nav".format(self.floor,brooms)

# }}}

    def _hole_connected_rooms(self): # {{{
        ''' 
        room A may be hole-connected to room B which may be hole-connnected to
        room C and so on -- recursion
        '''

        if self._hole_count == len(self._hole_rooms):
            return 
        else:
            self._hole_count=len(self._hole_rooms)
            tt=copy.deepcopy(self._hole_rooms)
            for room in self._hole_rooms.keys():
                for i in self.s.query("SELECT vent_from_name,vent_to_name FROM aamks_geom WHERE type_sec='HOLE' AND (vent_from_name=? OR vent_to_name=?)", (room, room)):
                    tt[i['vent_from_name']]=1
                    tt[i['vent_to_name']]=1
            self._hole_rooms=copy.deepcopy(tt)
            return self._hole_connected_rooms()
# }}}
    def _room_exit_doors(self,room): # {{{
        ''' 
        An agents is found in room A. If room A is connected to room B via a
        hole, then we are looking for way out via doors in the "merged" AB
        room. 

        room A may be hole-connected to room B which may be hole-connnected to
        room C and so on, hence recursive _hole_connected_rooms() need to
        calculate _hole_rooms
        '''

        self._hole_rooms={room: 1}
        self._hole_count=0
        self._hole_connected_rooms()
        doors={}
        for rr in self._hole_rooms.keys():
            z=self.s.query("SELECT name, type_sec, x0, y0, x1, y1, center_x, center_y, is_vertical FROM aamks_geom WHERE type_sec='DOOR' AND (vent_from_name=? OR vent_to_name=?)", (rr, rr))
            for d in z:
                doors[d['name']]=d
        return list(doors.values())
# }}}
    def _move_dest_around_door(self,data):# {{{
        '''
        For the hole-connnected rooms the dest point must be calculated
        relative to the ROOM (inside, outside). It won't do relative to the
        EVACUEE position (left, right, above, below). 
        '''
        top_right=self.partition_query[self.floor].xy2room([data['door']['x1'], data['door']['y0']])

        #print(data['door']['name'], top_right, [data['door']['x1'], data['door']['y0']])
        if data['door']['is_vertical']==1:
            if top_right in self._hole_rooms.keys():
                dest=(data['door']['center_x'] - self.evacuee_radius*4, data['door']['center_y'])
            else:
                dest=(data['door']['center_x'] + self.evacuee_radius*4, data['door']['center_y'])
        else:
            if top_right in self._hole_rooms.keys():
                dest=(data['door']['center_x'], data['door']['center_y'] + self.evacuee_radius*4)
            else:
                dest=(data['door']['center_x'], data['door']['center_y'] - self.evacuee_radius*4)

        return dest
# }}}

    def _test_evacuees_pairs(self,evacuees):# {{{
        ddgeoms=DDgeoms()
        ddgeoms.open()
        for x,i in enumerate(evacuees):
            src=(i[0]['x0'], i[0]['y0'])
            dst=(i[1]['x0'], i[1]['y0'])
            color=self._test_colors[x] if x <= len(self._test_colors) else "#fff"
            ddgeoms.add({'floor': self.floor, 'type': 'circle', "g": { 'p0': src, "radius": 30 }, "style": { "fillColor": color , "opacity": 1 }})
            ddgeoms.add({'floor': self.floor, 'type': 'circle', "g": { 'p0': dst, "radius": 30 }, "style": { "fillColor": color , "opacity": 1 }})
            self.nav_plot_path(self.nav_query(src, dst, 300),ddgeoms,style={ 'strokeColor': color } )
        ddgeoms.write()
# }}}
    def _test_room_leaves(self,ee):# {{{
        ''' 
        radius=3.5 is the condition for the agent to reach the behind-doors target 
        '''

        ddgeoms=DDgeoms()
        ddgeoms.open()

        mm=self.room_leaves(ee)
        for dest in mm['all']:
            ddgeoms.add({'floor': self.floor, 'type': 'circle', "g": { "p0": dest[0], "radius": self.evacuee_radius*3.5 }, "style": { "fillColor": "#f80", "opacity": 0.3 }} )
            ddgeoms.add({'floor': self.floor, 'type': 'circle', "g": { "p0": dest[0], "radius": self.evacuee_radius*0.5 }, "style": { "fillColor": "#f80", "opacity": 0.5 }} )

        ddgeoms.add({'floor': self.floor, 'type': 'circle', "g": { "p0": mm['best_point'], "radius": self.evacuee_radius*3.5 }, "style": { "fillColor": "#f80", "opacity": 0.3 }} )
        ddgeoms.add({'floor': self.floor, 'type': 'circle', "g": { "p0": mm['best_point'], "radius": self.evacuee_radius*0.5 }, "style": { "fillColor": "#f80", "opacity": 0.5 }} )

        self.nav_plot_path(mm['best_path'], ddgeoms, style={ "strokeColor": "#f80", "strokeWidth": 6 } )
        ddgeoms.write()
# }}}
