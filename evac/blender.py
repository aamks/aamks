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

    '''

    def __init__(self):# {{{
        self.json=Json()
        self.navmeshes={}
        self._camera_to_units()
        self._blender_clear()
        self._navmesh_collector=[]
        self._make_obstacles()
        # self._make_ground(floor)
        # self._make_navmesh()
        # self._save_navmesh(floor)
        # self._db_write_navmeshes()

# }}}
    def _camera_to_units(self):# {{{
        ''' 
        Units can be metres, centimetres, etc., so blender needs the proper
        camera clipping 

        '''

        for a in bpy.context.screen.areas:
            if a.type == 'VIEW_3D':
                for s in a.spaces:
                    if s.type == 'VIEW_3D':
                        s.clip_start = 10
                        s.clip_end = 100000
# }}}
    def _blender_clear(self):# {{{
        bpy.ops.object.select_all(action='SELECT')
        bpy.ops.object.delete()
# }}}
    def _make_obstacles(self):# {{{
        z=self.json.read("/home/mimooh/obst.json")
        for verts in z:
            edges = [(i, i+1) for i in range(0,len(verts)-1)]
            m = bpy.data.meshes.new("m")
            m.from_pydata(verts, edges, [])
            m.update()
            obj = bpy.data.objects.new("mm", m)
            bpy.context.scene.objects.link(obj)
        bpy.ops.object.select_all(action='SELECT')

        #dd(z)
        # for ii,i in enumerate(json.loads(self.s.query("SELECT * FROM obstacles")[0]['json'])['named'][floor]):
        #     name="obst_{}".format(ii)
        #     origin=((i['x0']+0.5*i['width'])/100, (i['y0']+0.5*i['depth'])/100, self.floors[floor]['z']/100+0.2)
        #     size=(0.001+0.5*i['width']/100, 0.001+0.5*i['depth']/100, 0.2)
        #     bpy.ops.mesh.primitive_cube_add(location=origin)
        #     bpy.ops.transform.resize(value=size)
        #     self._navmesh_collector.append(name)
        #     obst=bpy.context.object
        #     obst.name=name

# }}}
    def _make_ground(self,floor):# {{{
        for i in self.s.query("SELECT * FROM aamks_geom WHERE type_pri='COMPA' AND floor=?", (floor,)):
            origin=((i['x0']+0.5*i['width'])/100, (i['y0']+0.5*i['depth'])/100, self.floors[floor]['z']/100+0.1)
            size=(0.001+0.5*i['width']/100, 0.001+0.5*i['depth']/100, 0.1)
            bpy.ops.mesh.primitive_cube_add(location=origin)
            bpy.ops.transform.resize(value=size)
            self._navmesh_collector.append(i['name'])
            obst=bpy.context.object
            obst.name=i['name']

# }}}
    def _make_navmesh(self):# {{{
        bpy.ops.object.select_all(action='DESELECT')
        for i in self._navmesh_collector:
            bpy.data.objects[i].select=True
        bpy.ops.object.duplicate()
        bpy.ops.object.join()
        navmesh_input=bpy.context.object
        bpy.context.scene.game_settings.recast_data.agent_radius=0.3
        bpy.context.scene.game_settings.recast_data.climb_max=0
        bpy.context.scene.game_settings.recast_data.slope_max=0.1
        bpy.context.scene.game_settings.recast_data.cell_size=0.1
        bpy.ops.mesh.navmesh_make()
        bpy.ops.object.select_all(action='DESELECT')
        navmesh_input.select=True
        bpy.ops.object.delete()
# }}}
    def _save_navmesh(self,floor):# {{{
        ''' split navmesh into triangles: [(x0,y0), (x1,y1), (x2,y2)] . '''
        self.navmeshes[floor]=[]
        bpy.ops.object.select_all(action='DESELECT')
        navmesh=bpy.data.objects['Navmesh']
        navmesh.select=True
        bpy.ops.object.mode_set(mode='EDIT')
        bpy.ops.mesh.select_all(action='SELECT')
        bpy.ops.mesh.edge_split()
        bpy.ops.mesh.separate(type='LOOSE')
        bpy.ops.object.mode_set(mode='OBJECT')
        for i in [o for o in bpy.data.objects if o.select]:
            verts=i.data.vertices.values()
            #print(i.name, ((verts[0].co[0], verts[0].co[1]), (verts[1].co[0], verts[1].co[1]), (verts[2].co[0], verts[2].co[1])))
            #print(i.name, ((verts[0].co[2])))
            self.navmeshes[floor].append(((verts[0].co[0], verts[0].co[1]), (verts[1].co[0], verts[1].co[1]), (verts[2].co[0], verts[2].co[1])))
# }}}
    def _db_write_navmeshes(self):# {{{
        try:
            self.s.query('DROP TABLE navmeshes')
        except: 
            pass

        self.s.query('CREATE TABLE navmeshes(json)')
        self.s.query('INSERT INTO navmeshes VALUES (?)', (json.dumps(self.navmeshes),))
# }}}

BlenderNavmesh()
