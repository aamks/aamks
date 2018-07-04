import bpy
import bmesh
import json
import os
from include import Sqlite
from include import Json
from include import Dump as dd
from include import Colors

class BlenderAamksEvac():
    ''' 
    Blender for development debuging. Blender produces navmesh triangles.
    '''

    def __init__(self):# {{{
        self._newest_sim_id()
        self.s=Sqlite("{}/aamks.sqlite".format(os.environ['AAMKS_PROJECT']), 1) 
        self.json=Json()
        self._navmesh_collector=[]
        self._init_blender()
        self._make_materials()
        self._make_rooms()
        self._make_doors()
        self._cut_doors()
        self._make_navmesh()
# }}}
    def _newest_sim_id(self):# {{{
        self._sim_id=os.popen("ls -t {}/workers | grep -v vis | head -n 1".format(os.environ['AAMKS_PROJECT'])).read().strip()
# }}}
    def _init_blender(self):# {{{
        bpy.ops.object.lamp_add(type="SUN", radius=5, location=(0,0,50))
        bpy.context.object.data.energy=0.2
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
    def _make_rooms(self):# {{{
        ''' 0.001 prevents z-fighting of overlaping polygons. '''

        for i in self.s.query("SELECT * FROM aamks_geom WHERE type_pri='COMPA' ORDER BY name"): 
            origin=(i['center_x']/100, i['center_y']/100, i['center_z']/100)
            size=(0.001+0.5*i['width']/100, 0.001+0.5*i['depth']/100, 0.001+0.5*i['height']/100)
            outset=[ (i+0.1)/i for i in size ]
            self._make_room(i['name'],i['type_sec'],origin,size,outset)
            self._navmesh_collector.append(i['name'])

# }}}
    def _make_doors(self):# {{{
        for i in self.s.query("SELECT * FROM aamks_geom WHERE type_tri='DOOR' ORDER BY name"): 
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
        The smaller needs to cut ceiling in the bigger.
        '''

        bpy.ops.mesh.primitive_cube_add(location=origin)
        bpy.ops.transform.resize(value=size)
        bigger=bpy.context.object
        smaller=bigger.copy()
        smaller.data=bigger.data.copy()

        bigger.select=False
        smaller.select=True
        into_ceiling=0.2
        bpy.ops.transform.resize(value=(1, 1, 1+into_ceiling))
        bpy.ops.transform.translate(value=(0, 0, (size[2]*into_ceiling)))
        smaller.select=False

        bigger.data.materials.append(self.materials[mat])
        bigger.show_transparent=True
        bigger.name=name

        bigger.select=True
        bpy.ops.transform.resize(value=outset)

        bpy.ops.object.modifier_add(type='BOOLEAN')
        bigger.modifiers['Boolean'].operation='DIFFERENCE'
        bigger.modifiers['Boolean'].object=smaller 
        bpy.ops.object.modifier_apply(apply_as='DATA', modifier='Boolean')
        bigger.select=False

        smaller.select=True
        bpy.ops.object.delete()

# }}}
    def _cut_doors(self):# {{{
        bpy.ops.object.select_all(action='DESELECT')
        for compa in self.s.query("SELECT name FROM aamks_geom WHERE type_pri='COMPA' ORDER BY name"): 
            compa=bpy.data.objects[compa['name']]
            bpy.context.scene.objects.active = compa
            for door in self.s.query("SELECT name FROM aamks_geom WHERE type_tri='DOOR' ORDER BY name"): 
                door=bpy.data.objects[door['name']]
                bpy.ops.object.modifier_add(type='BOOLEAN')
                bpy.context.object.modifiers['Boolean'].operation='DIFFERENCE'
                bpy.context.object.modifiers['Boolean'].object=door
                bpy.ops.object.modifier_apply(apply_as='DATA', modifier='Boolean')
                bpy.ops.object.select_all(action='DESELECT')

        for door in self.s.query("SELECT name FROM aamks_geom WHERE type_tri='DOOR' ORDER BY name"): 
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

        current_obj = bpy.context.active_object  
          
        collect=''
        for face in current_obj.data.polygons:  
            for vert in face.vertices:
                local_point = current_obj.data.vertices[vert].co
                collect+="{};{};".format(local_point[0], local_point[1])
            collect+="\n"

        with open("/home/mimooh/nav.txt", "w") as f: 
            f.write(collect)
        print(collect)

# }}}

BlenderAamksEvac()
