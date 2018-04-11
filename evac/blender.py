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
    BGE has 3D rvo2 + navmesh so it should make simulation of the evacuation
    easier. Obviously blender provides some awesome 3D visualizations too, so
    it's a great developing environment. 
    '''

    def __init__(self, sim_id='newest'):# {{{
        self._sim_id=sim_id
        self.s=Sqlite("{}/workers/{}/aamks.sqlite".format(os.environ['AAMKS_PROJECT'], self._sim_id)) 
        self.json=Json()
        self._navmesh_collector=[]
        self._init_blender()
        self._make_materials()
        self._make_exit()
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
        bpy.ops.mesh.primitive_cube_add(location=(45,23,2))
        bpy.context.object.name='00_EXIT'
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
        smaller=bpy.context.object

        bpy.ops.object.duplicate_move()
        bigger=bpy.context.object

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
    def _make_stairs(self):# {{{
        try:
            stairs=json.loads(self.s.query("SELECT json FROM staircaser")[0]['json'])
        except:
            return
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
        navmesh_input=bpy.context.object
        bpy.ops.mesh.navmesh_make()
        bpy.ops.object.select_all(action='DESELECT')
        navmesh_input.select=True
        bpy.ops.object.delete()
        #bpy.data.objects['Navmesh'].hide=True

# }}}
    def _single_evacuee(self,name,pos,mat):# {{{
        agent_height=1.6
        bpy.ops.mesh.primitive_cylinder_add(radius=0.25, depth=agent_height, location=(pos[0], pos[1], pos[2]+0.5*agent_height*1.1))
        obj=bpy.context.object
        obj.data.materials.append(mat)
        obj.name=name
        obj.game.use_obstacle_create=True
        obj.game.obstacle_radius=0.27
        obj.game.physics_type='DYNAMIC'
        obj.game.radius=0.27
        obj.game.elasticity=0.9

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
        actuator.target = bpy.data.objects["00_EXIT"]
        actuator.navmesh= bpy.data.objects["Navmesh"]
        actuator.self_terminated= True
        actuator.show_visualization= True
        actuator.acceleration=5
        actuator.velocity=15
        actuator.distance=6

        sensor.link(controller)
        actuator.link(controller)

        return name
# }}}
    def _make_evacuees(self):# {{{
        ''' Create from materials and coords. '''

        mat = bpy.data.materials.new("white")
        mat.diffuse_color = (1,1,1)

        self.evacuees=[]
        floors_data=self.json.read("{}/workers/{}/evac.json".format(os.environ['AAMKS_PROJECT'], self._sim_id))['FLOORS_DATA']
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

# separate
# filename="{}/evac/blender.py".format(os.environ['AAMKS_PATH'])
# }}}

BlenderAamksEvac()
