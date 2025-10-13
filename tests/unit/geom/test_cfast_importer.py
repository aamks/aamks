import os
from include import Json 
from unittest import TestCase
from unittest.mock import patch
from geom.cfast_importer import CFASTimporter
from include import Sqlite


class TestCFASTimporter(TestCase):
    def setUp(self) -> None:
        self.maxDiff = None
        self.cfastimporter = CFASTimporter()
        self.cfastimporter.conf = Json().read("installer/demo/three/conf.json")
        self.cfastimporter.raw_geometry = Json().read("tests/unit/geom/test_cad.json")
        self.cfastimporter.geomsMap = Json().read("inc.json")['aamksGeomsMap']
        self.test_s = Sqlite("tests/unit/geom/test_aamks.sqlite")
        self.cfastimporter.s = self.test_s

    def test_init(self):
        self.assertEqual(self.cfastimporter.doors_width, 32)
        self.assertEqual(self.cfastimporter.walls_width, 4)
    
    def test_run(self):
        self.cfastimporter.s = Sqlite("tests/unit/geom/aamks.sqlite", 3)

        self.cfastimporter.run()
        # SELECT * except how_much_open None instead 0/1
        test = self.test_s.query("SELECT name,floor,global_type_id,hvent_room_seq,vvent_room_seq,type_pri,type_sec,type_tri,x0,y0,z0,width,depth,height,cfast_width,sill,face,face_offset,vent_from,vent_to,material_ceiling,material_floor,material_wall,heat_detectors,smoke_detectors,sprinklers,is_vertical,vent_from_name,vent_to_name, room_area, x1, y1, z1, center_x, center_y, center_z, fire_model_ignore, mvent_throughput, exit_type, room_enter, evacuees_density, terminal_door, points, origin_room, orig_type, has_door, teleport_from, teleport_to, adjacents, stair_direction, exit_weight, room_exits_weights FROM aamks_geom ORDER BY name")
        actual = Sqlite("tests/unit/geom/test_aamks.sqlite").query("SELECT name,floor,global_type_id,hvent_room_seq,vvent_room_seq,type_pri,type_sec,type_tri,x0,y0,z0,width,depth,height,cfast_width,sill,face,face_offset,vent_from,vent_to,material_ceiling,material_floor,material_wall,heat_detectors,smoke_detectors,sprinklers,is_vertical,vent_from_name,vent_to_name, room_area, x1, y1, z1, center_x, center_y, center_z, fire_model_ignore, mvent_throughput, exit_type, room_enter, evacuees_density, terminal_door, points, origin_room, orig_type, has_door, teleport_from, teleport_to, adjacents, stair_direction, exit_weight, room_exits_weights FROM aamks_geom ORDER BY name")

        self.assertEqual(test, actual)


