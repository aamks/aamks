import bpy
import bge
import json
import os
from include import Sqlite
from include import Json
from include import Dump as dd
from include import Colors

class BlenderAamksEvac():
    ''' 
    Aamks now uses blender game engine (BGE), currently https://upbge.org/.
    BGE has 3D rvo2 + navmesh so it should make evacuation easier. Obviously
    blender provides the awesome 3D visualizations too, so it's a great
    developing environment. 
    '''

    def __init__(self):# {{{
        self.s=Sqlite("/usr/local/aamks/current/aamks.sqlite") # TODO: update to worker's perspective
        self.json=Json()
        self._navmesh_collector=[]
        self._init_blender()
        self._make_materials()
        self._make_exit()
        self._make_floors()
        self._make_rooms()
        self._make_doors()
        self._cut_doors()
        self._make_stairs()
        self._make_navmesh()
        self._make_evacuees()
# }}}
    def _init_blender(self):# {{{
        bpy.ops.object.lamp_add(type="SUN", radius=5, location=(0,0,50))
        bpy.context.object.data.energy=0.2
# }}}

    def _make_materials(self):# {{{
        for material in bpy.data.materials:
            bpy.data.materials.remove(material)
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
    def _make_exit(self):# {{{
        bpy.ops.mesh.primitive_cube_add(location=(50,8,0.2))
        bpy.context.object.name='EXIT'
# }}}
    def _make_floors(self):# {{{
        for k,v in json.loads(self.s.query("SELECT * FROM floors")[0]['json']).items():
            name='floor{}'.format(k)
            bpy.ops.mesh.primitive_cube_add(location=(v['center'][0]/100, v['center'][1]/100, v['center'][2]/100))
            bpy.ops.transform.resize(value=(v['width']/200+3, v['height']/200+3, 0.05))
            bpy.context.object.name=name
            self._navmesh_collector.append(name)

# }}}
    def _make_rooms(self):# {{{
        ''' 0.001 prevents z-fighting of overlaping polygons. '''

        for i in self.s.query("SELECT * FROM aamks_geom WHERE type_pri='COMPA' ORDER BY name"): 
            origin=(i['center_x']/100, i['center_y']/100, i['center_z']/100)
            size=(0.001+0.5*i['width']/100, 0.001+0.5*i['depth']/100, 0.001+0.5*i['height']/100)
            inset=[]
            for s in size:
                inset.append((s-0.1)/s)
            #inset[2]=s+0.1
            self._make_room(i['name'],i['type_sec'],origin,size,inset)
            self._navmesh_collector.append(i['name'])

# }}}
    def _make_doors(self):# {{{
        for i in self.s.query("SELECT * FROM aamks_geom WHERE type_tri='DOOR' ORDER BY name"): 
            origin=(i['center_x']/100, i['center_y']/100, i['center_z']/100-0.1)
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
    def _make_room(self,name,mat,origin,size,inset):# {{{
        bpy.ops.mesh.primitive_cube_add(location=origin)
        bpy.ops.transform.resize(value=size)
        orig=bpy.context.object
        orig.data.materials.append(self.materials[mat])
        orig.show_transparent=True
        orig.name=name
        orig.show_name=True

        bpy.ops.object.duplicate_move()
        bpy.context.object.name="cube_cut"
        bpy.ops.transform.resize(value=inset)
        bpy.ops.object.select_all(action='DESELECT')
        bpy.context.scene.objects.active = orig
        bpy.ops.object.modifier_add(type='BOOLEAN')
        bpy.context.object.modifiers['Boolean'].operation='DIFFERENCE'
        bpy.context.object.modifiers['Boolean'].object=bpy.data.objects['cube_cut']
        bpy.ops.object.modifier_apply(apply_as='DATA', modifier='Boolean')
        bpy.ops.object.select_all(action='DESELECT')
        bpy.data.objects['cube_cut'].select=True
        bpy.ops.object.delete()

# }}}
    def _make_stairs(self):# {{{
        stairs=json.loads(self.s.query("SELECT json FROM staircaser")[0]['json'])
        stairs_names=[]
        for num,i in enumerate(stairs):
            name="stair_{}".format(num)
            bpy.ops.mesh.primitive_cube_add(location=i['center'])
            bpy.ops.transform.resize(value=i['size'])
            bpy.context.object.name=name
            stairs_names.append(name)

        bpy.ops.object.select_all(action='DESELECT')
        for i in stairs_names:
            bpy.data.objects[i].select=True
        bpy.ops.object.join()
        bpy.context.object.name='stairs'
        self._navmesh_collector.append('stairs')

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
        bpy.ops.object.duplicate_move()
        bpy.ops.object.join()
        bpy.context.object.name='navmesh_input'
        bpy.ops.mesh.navmesh_make()
        bpy.ops.object.select_all(action='DESELECT')
        #bpy.ops.object.delete()
        #bpy.data.objects['Navmesh'].hide=True

# }}}
    def _single_evacuee(self,name,pos,mat):# {{{
        bpy.ops.mesh.primitive_cylinder_add(radius=0.25, depth=1, location=(pos[0], pos[1], pos[2]+0.8))

        obj=bpy.context.object
        obj.data.materials.append(mat)
        obj.name=name
        obj.game.use_obstacle_create=True
        obj.game.obstacle_radius=0.1
        obj.game.physics_type='DYNAMIC'
        obj.game.radius=0.3

        sensors = obj.game.sensors
        controllers = obj.game.controllers
        actuators = obj.game.actuators

        logic=bpy.ops.logic
        logic.sensor_add(type='MOVEMENT', name=name)
        logic.actuator_add(type='STEERING', name=name)
        bpy.ops.logic.controller_add(object=obj.name)

        # Newly added logic blocks will be the last ones:
        sensor = sensors[-1]
        controller = controllers[-1]
        actuator = actuators[-1]
        sensor.axis='ALLAXIS'
        actuator.mode='PATHFOLLOWING'
        actuator.target = bpy.data.objects["EXIT"]
        actuator.navmesh= bpy.data.objects["Navmesh"]
        actuator.self_terminated= True
        #actuator.show_visualization= True
        actuator.acceleration=5
        actuator.velocity=15
        actuator.distance=0.3

        sensor.link(controller)
        actuator.link(controller)

        return name
# }}}
    def _make_evacuees(self):# {{{
        ''' Create from materials and coords. '''

        mat = bpy.data.materials.new("white")
        mat.diffuse_color = (1,1,1)

        self.evacuees=[]
        floors_data=self.json.read("/tmp/blender_evac.json")['FLOORS_DATA'] # TODO: update to worker's perspective
        for floor,data in floors_data.items():
            for name,setup in data['EVACUEES'].items():
                self._single_evacuee(name, setup['ORIGIN'], mat)
                self.evacuees.append(name)
# }}}

# clear belongs to blender window# {{{
# import bpy
# suzanne=bpy.data.objects['Suzanne']
# bpy.ops.object.select_all(action='SELECT')
# suzanne.select=False
# bpy.ops.object.delete()
# bpy.context.scene.objects.active = suzanne
# }}}

BlenderAamksEvac()
