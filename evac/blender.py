import bpy
import bmesh
import json
import os
from include import Sqlite
from include import Json
from include import Dump as dd
from include import Colors

class BlenderNavmesh():
    ''' 
    Blender navmesh triangles producer. Must be run inside blender:
        blender -b -P blender.py

    The input is rooms and doors which produce the scene of obstacles.
    todo: how about obstacles in sqlite?
    '''

    def __init__(self):# {{{
        self.s=Sqlite("{}/aamks.sqlite".format(os.environ['AAMKS_PROJECT']), 1) 
        self.json=Json()
        self._make_materials()
        self.navmeshes={}

        for floor in json.loads(self.s.query("SELECT * FROM floors")[0]['json']).keys():
            self._blender_clear()
            self._navmesh_collector=[]
            self._make_rooms(floor)
            self._make_doors(floor)
            self._cut_doors(floor)
            self._make_navmesh()
            self._save_navmesh(floor)
        self._db_write_navmeshes()

# }}}
    def _blender_clear(self):# {{{
        bpy.ops.object.select_all(action='SELECT')
        bpy.ops.object.delete()
# }}}
    def _make_materials(self):# {{{
        c=Colors()
        self.materials=dict()
        colors=self.json.read("{}/geom/colors.json".format(os.environ['AAMKS_PATH']))['darkColors']
        for k,v in colors.items():
            mat = bpy.data.materials.new(k)
            mat.diffuse_color = c.hex2rgb(v)
            if k in ('ROOM', 'COR', 'STAI', 'HALL'):
                mat.use_transparency=True
                mat.alpha=0.4
            self.materials[k]=mat

# }}}
    def _make_rooms(self,floor):# {{{
        ''' 
        Input rooms are boxen. We create obstacles (walls and floors) of them. 
        0.001 prevents z-fighting of overlaping polygons. 
        '''

        for i in self.s.query("SELECT * FROM aamks_geom WHERE type_pri='COMPA' AND floor=? ORDER BY name", (floor,)): 
            origin=(i['center_x']/100, i['center_y']/100, i['center_z']/100)
            size=(0.001+0.5*i['width']/100, 0.001+0.5*i['depth']/100, 0.001+0.5*i['height']/100)
            outset=[ (i+0.1)/i for i in size ]
            self._make_room(i['name'],i['type_sec'],origin,size,outset)
            self._navmesh_collector.append(i['name'])

# }}}
    def _make_doors(self,floor):# {{{
        for i in self.s.query("SELECT * FROM aamks_geom WHERE type_tri='DOOR' AND floor=? ORDER BY name", (floor,)): 
            origin=(i['center_x']/100, i['center_y']/100, i['center_z']/100)
            size=[0.5*i['width']/100, 0.5*i['depth']/100, 0.5*i['height']/100]
            for s in range(len(size)):
                if size[s] < 0.1:
                    size[s]=0.5
            self._make_door(i['name'],i['type_sec'],origin,size)

# }}}
    def _make_door(self,name,mat,origin,size):# {{{
        bpy.ops.mesh.primitive_cube_add(location=origin)
        bpy.ops.transform.resize(value=size)
        orig=bpy.context.object
        orig.data.materials.append(self.materials[mat])
        orig.name=name
        orig.show_name=True

# }}}
    def _make_room(self,name,mat,origin,size,outset):# {{{
        ''' 
        Except from just adding the room we create an obstacle from it:
        smaller (original) cuts in bigger (outset). 
        The smaller needs to cut ceiling in the bigger, so we make it taller.
        '''

        ''' smaller '''
        bpy.ops.mesh.primitive_cube_add(location=origin)
        bpy.ops.transform.resize(value=size)
        smaller=bpy.context.object
        into_ceiling=0.2
        bpy.ops.transform.resize(value=(1, 1, 1+into_ceiling))
        smaller.location.z +=(size[2]*into_ceiling)

        ''' bigger '''
        bpy.ops.mesh.primitive_cube_add(location=origin)
        bpy.ops.transform.resize(value=size)
        bigger=bpy.context.object
        bigger.data.materials.append(self.materials[mat])
        bigger.show_transparent=True
        bigger.name=name
        bpy.ops.transform.resize(value=outset)

        ''' bigger - smaller'''
        bpy.ops.object.modifier_add(type='BOOLEAN')
        bigger.modifiers['Boolean'].operation='DIFFERENCE'
        bigger.modifiers['Boolean'].object=smaller 
        bpy.ops.object.modifier_apply(apply_as='DATA', modifier='Boolean')

        bigger.select=False
        smaller.select=True
        bpy.ops.object.delete()

# }}}
    def _cut_doors(self,floor):# {{{
        bpy.ops.object.select_all(action='DESELECT')
        for compa in self.s.query("SELECT name FROM aamks_geom WHERE type_pri='COMPA' AND floor=? ORDER BY name", (floor,)): 
            compa=bpy.data.objects[compa['name']]
            bpy.context.scene.objects.active = compa
            for door in self.s.query("SELECT name FROM aamks_geom WHERE type_tri='DOOR' AND floor=? ORDER BY name", (floor,)): 
                door=bpy.data.objects[door['name']]
                bpy.ops.object.modifier_add(type='BOOLEAN')
                bpy.context.object.modifiers['Boolean'].operation='DIFFERENCE'
                bpy.context.object.modifiers['Boolean'].object=door
                bpy.ops.object.modifier_apply(apply_as='DATA', modifier='Boolean')
                bpy.ops.object.select_all(action='DESELECT')

        for door in self.s.query("SELECT name FROM aamks_geom WHERE type_tri='DOOR' AND floor=? ORDER BY name", (floor,)): 
            door=bpy.data.objects[door['name']]
            door.select=True
            bpy.ops.object.delete()

# }}}
    def _make_navmesh(self):# {{{
        bpy.ops.object.select_all(action='DESELECT')
        for i in self._navmesh_collector:
            bpy.data.objects[i].select=True
        bpy.ops.object.duplicate()
        bpy.ops.object.join()
        navmesh_input=bpy.context.object
        bpy.ops.mesh.navmesh_make()
        bpy.ops.object.select_all(action='DESELECT')
        navmesh_input.select=True
        bpy.ops.object.delete()
# }}}
    def _save_navmesh(self,floor):# {{{
        navmesh= bpy.data.objects['Navmesh'].data
        self.navmeshes[floor]=[]
        for face in navmesh.polygons:  
            ff=[]
            for vert in face.vertices:
                local_point = navmesh.vertices[vert].co
                ff.append((local_point[0], local_point[1]))
            self.navmeshes[floor].append(ff)
# }}}
    def _db_write_navmeshes(self):# {{{
        try:
            self.s.query('DROP TABLE navmeshes')
        except: 
            pass

        self.s.query('CREATE TABLE navmeshes(json)')
        self.s.query('INSERT INTO navmeshes VALUES (?)', (json.dumps(self.navmeshes),))
        self.s.dumpall()
# }}}

BlenderNavmesh()
