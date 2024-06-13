from collections import OrderedDict
from unittest import TestCase
from unittest.mock import patch, MagicMock, call, PropertyMock
from montecarlo.cfast_mcarlo import DrawAndLog
from include import Json
import os
from numpy.random import normal, seed
from copy import deepcopy


class TestDrawAndLog(TestCase):
    def setUp(self) -> None:
        # Patch variables
        self.old_environ = os.environ.copy()
        os.environ['AAMKS_PROJECT'] = '/usr/local/aamks/installer/demo/three'
        os.environ['AAMKS_PATH'] = '/usr/local/aamks'
        # Patch classes
        self.MockJson = patch('montecarlo.cfast_mcarlo.Json').start()
        self.MockSqlite = patch('montecarlo.cfast_mcarlo.Sqlite').start()
        # Arrange
        self.mock_json_instance = self.MockJson.return_value  
        self.mock_json_instance.read = MagicMock()  # Mocking the read method without return_value to check calls
        self.mock_sqlite_instance = self.MockSqlite.return_value  
        self.mock_sqlite_instance.query = MagicMock()
        self.call_fire_count = 0
        def side_effect(query, args=None):
            if query == "SELECT * FROM aamks_geom WHERE type_pri='FIRE'":
                if self.call_fire_count == 0:
                    self.call_fire_count += 1
                    return [1]
                if self.call_fire_count == 1:
                    return [OrderedDict([('name', 'y1'), ('floor', '1'), ('x0', 2375), ('y0', 740), ('z0', 350), ('center_x', 2480), ('center_y', 862), ('x1', 2585), ('y1', 985)])]
                elif self.call_fire_count == 2:
                    self.call_fire_count -= 1
                    return []
            if query.startswith("SELECT floor,name,type_sec,global_type_id,x0,y0,z0"):
                return [OrderedDict([('floor', '1'), ('name', 'r8'), ('type_sec', 'ROOM'), ('global_type_id', 8), ('x0', 2085), ('y0', 470), ('z0', 350)])]
            if query == "INSERT INTO fire_origin VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)":
                self.test_save_fire_origin(args)
            if query.startswith("SELECT * FROM aamks_geom WHERE type_tri='WIN'"):
                return OrderedDict([('name', 'w4'), ('floor', '0'), ('global_type_id', 4), ('hvent_room_seq', 2), ('vvent_room_seq', None), ('type_pri', 'HVENT'), ('type_sec', 'WIN'), ('type_tri', 'WIN'), ('x0', 1313), ('y0', 454), ('z0', 100), ('width', 259), ('depth', 32), ('height', 150), ('cfast_width', 259), ('sill', 100), ('face', 'FRONT'), ('face_offset', 263.0), ('vent_from', 2), ('vent_to', 11), ('material_ceiling', 'concrete'), ('material_floor', 'concrete'), ('material_wall', 'concrete'), ('heat_detectors', 0), ('smoke_detectors', 0), ('sprinklers', 0), ('is_vertical', 0), ('vent_from_name', 'r2'), ('vent_to_name', 'OUTSIDE'), ('how_much_open', None), ('room_area', None), ('x1', 1572), ('y1', 486), ('z1', 250), ('center_x', 1442), ('center_y', 470), ('center_z', 175), ('fire_model_ignore', 0), ('mvent_throughput', None), ('exit_type', None), ('room_enter', None), ('evacuees_density', None), ('terminal_door', None), ('points', '[[1313, 486], [1572, 486], [1572, 454], [1313, 454]]'), ('origin_room', None), ('orig_type', 'WIN'), ('has_door', None), ('teleport_from', None), ('teleport_to', None), ('adjacents', None), ('stair_direction', None), ('exit_weight', None), ('room_exits_weights', None)])
                
            if query.startswith("SELECT adjacents FROM aamks_geom"):
                return [{'adjacents':'r8;0.255;0.152'}]
            if query.startswith("UPDATE aamks_geom SET how_much_open="):
                return test_update_windows(args)
            else:
                # Define default return value if the query doesn't match
                return None
        self.mock_sqlite_instance.query.side_effect = side_effect
        #self.mock_sqlite_instance.some_attribute = "expected_value"  # Example attribute setup

        self.draw = DrawAndLog(sim_id='123')
        self.draw.conf = Json().read('/usr/local/aamks/installer/demo/three/conf.json')

    def test_draw_init(self):
        self.assertEqual(self.draw._sim_id, '123')
        self.assertIsInstance(self.draw.data_for_psql, OrderedDict)
        self.MockJson.assert_called_once()
        self.mock_json_instance.read.assert_has_calls([call(f'{os.environ["AAMKS_PROJECT"]}/conf.json'), call(f'{os.environ["AAMKS_PATH"]}/evac/config.json')])
        self.MockSqlite.assert_called_once_with(f'{os.environ["AAMKS_PROJECT"]}/aamks.sqlite')

    def tearDown(self):
        patch.stopall() # Stop patching after the test
        os.environ = self.old_environ # Restore original environment variables
        self.call_fire_count = 0

    def test_draw_initial(self):
        # # Arrange
        seed(0)
        outdoor_temp = 27.64
        indoor_temp = 22.8
        pressure = 102304
        humidity = 51
        # # Act
        self.draw._draw_initial()
        # # Assert
        self.assertEqual(self.draw.sections['INIT']['EXTERIOR_TEMPERATURE'], outdoor_temp)
        self.assertEqual(self.draw.sections['INIT']['INTERIOR_TEMPERATURE'], indoor_temp)
        self.assertEqual(self.draw.sections['INIT']['PRESSURE'], pressure)
        self.assertEqual(self.draw.sections['INIT']['RELATIVE_HUMIDITY'], humidity)
        self.assertEqual(self.draw.data_for_psql['123']['outdoor_temp'], [outdoor_temp])

    def test_draw_fires_deterministic(self):
        expected = [{'ID': 'f8', 'COMP_ID': 'r8', 'FIRE_ID': 'f8', 'LOCATION': [3.95, 3.92]}]

        self.draw._draw_fires()

        self.assertEqual(self.draw._fire.room, 'r8')
        self.assertEqual(len(self.draw._fires), 1)
        self.assertEqual(self.draw.sections['FIRE'], expected)

    def test_save_fire_origin(self, args = ['r8', 'room', 2480, 862, 350, 3.95, 3.92, '1', 'f8', 0, 't_f8', 1, '123']):
        expected = ['r8', 'room', 2480, 862, 350, 3.95, 3.92, '1', 'f8', 0, 't_f8', 1, '123']

        self.assertEqual(args[:-2], expected[:-2])

    @patch.object(DrawAndLog, '_draw_compartment')
    @patch.object(DrawAndLog, '_locate_randomly')
    def test_draw_fires_random(self, mock_locate, mock_draw_comp):
        self.call_fire_count = 2
        mock_draw_comp.return_value = {'name':'r8','type':'room'}
        # mock_locate.return_value = [{'x':2480, 'y':862, 'z':350, 'loc_x':3.95, 'loc_y':3.92, 'floor':'1', 'f_id':'f8', 'height':0, 'devc':'t_f8', 'major': 0}, 'room']
        loc = [{'x':2480, 'y':862, 'z':350, 'loc_x':3.95, 'loc_y':3.92, 'floor':'1', 'f_id':'f8', 'height':0, 'devc':'t_f8', 'major': 0}, 'room']
        mock_locate.side_effect = lambda x: deepcopy(loc)
        expected = [{'ID': 'f8', 'COMP_ID': 'r8', 'FIRE_ID': 'f8', 'LOCATION': [3.95, 3.92]}, 
                    {'ID': 'f8', 'COMP_ID': 'r8', 'FIRE_ID': 'f8', 'LOCATION': [3.95, 3.92], 'IGNITION_CRITERION': 'TEMPERATURE', 'DEVC_ID': 't_f8', 'SETPOINT': 200}]

        self.draw._draw_fires()

        self.assertEqual(self.draw.data_for_psql['123']['heigh'], [0])
        self.assertEqual(self.draw.data_for_psql['123']['fireorigname'], ['r8'])
        self.assertEqual(self.draw.data_for_psql['123']['fireorig'], ['room'])
        self.assertEqual(len(self.draw._fires), 2)
        self.assertEqual(self.draw._fire.major, 1)
        self.assertEqual(self.draw.sections['FIRE'], expected)
    
    @patch('montecarlo.cfast_mcarlo.choice')
    def test_draw_fuel_random(self, mock_choice):
        mock_choice.return_value = 'PE'
        expected = self.draw.FUELS['PE']

        self.draw._draw_fuel()

        self.assertEqual(self.draw._scen_fuel, expected)

    @patch('montecarlo.cfast_mcarlo.uniform')
    @patch.object(DrawAndLog, 'sections', new_callable=PropertyMock, create=True)
    @patch.object(DrawAndLog, '_fire', new_callable=PropertyMock, create=True)
    def test_draw_windows_opening_full_open(self, mock_fire, mock_sections, mock_uniform):
        mock_uniform.return_value = 0.01
        mock_fire.return_value.f_id = 'f2'
        mock_sections.return_value = {'INIT': {'EXTERIOR_TEMPERATURE': 10}}

        self.draw._draw_windows_opening()
        self.assertEqual(self.draw._scen_fuel, 5)
    @patch('montecarlo.cfast_mcarlo.uniform')
    @patch.object(DrawAndLog, 'sections', new_callable=PropertyMock, create=True)
    def test_draw_windows_opening_quarter_open(self, mock_sections, mock_uniform):
        mock_uniform.return_value = 0.14
        mock_sections.return_value = {'INIT': {'EXTERIOR_TEMPERATURE': 10}}

        self.draw._draw_windows_opening()
        self.assertEqual(self.draw._scen_fuel, 5)
    @patch('montecarlo.cfast_mcarlo.uniform')
    @patch.object(DrawAndLog, 'sections', new_callable=PropertyMock, create=True)
    def test_draw_windows_opening_not_open(self, mock_sections, mock_uniform):
        mock_uniform.return_value = 1
        mock_sections.return_value = {'INIT': {'EXTERIOR_TEMPERATURE': 10}}

        self.draw._draw_windows_opening()
        self.assertEqual(self.draw._scen_fuel, 5)
    def test_update_windows(self, args):
        how_much_open, name = args
        self.assertIn(how_much_open, [0, 0.25, 1])
        self.assertEqual(name, 'w4')

    def test_section_preamble(self):
        preamble = "&HEAD VERSION = 7500, TITLE = 'P_ID_4_S_ID_1' /\n&TIME SIMULATION = 400, PRINT = 100, SMOKEVIEW = 100, " \
                   "SPREADSHEET = 10 /\n&INIT PRESSURE = 101325 RELATIVE_HUMIDITY = 50 INTERIOR_TEMPERATURE = 20 " \
                   "EXTERIOR_TEMPERATURE = 20 /\n&MISC LOWER_OXYGEN_LIMIT = 0.15 /\n"
        temp = 20
        p_id = 4
        s_id = 1
        indoor_temp = 20
        pressure = 101325
        humidity = 50
        o_limit = 0.15
        simulation_time = 400
        x = self.cfast_mcarlo._section_preamble(p_id, s_id, simulation_time, temp)
        self.assertMultiLineEqual(x, preamble)
        x = self.cfast_mcarlo._section_preamble(p_id, s_id, simulation_time, temp, indoor_temp=indoor_temp, pressure=pressure, humidity=humidity, o_limit=o_limit)
        self.assertMultiLineEqual(x, preamble)

    def test_section_matl(self):
        x = self.cfast_mcarlo._section_matl()
        self.assertEqual(len(x), 604)

    def test_build_compa_row(self):
        name = 'r1'
        width = 12
        depth =  3
        height = 2
        ceiling_matl_id = 'brick'
        wall_matl_id = 'wood'
        floor_matl_id = 'concrete'
        type_sec = 'ROOM'
        origin = [1,2,3]
        leak_area = [3.5E-4, 5.2E-5]
        grid = [50, 50, 50]
        c_row = self.cfast_mcarlo._build_compa_row(name, width, depth, height, ceiling_matl_id, wall_matl_id, floor_matl_id, type_sec, origin, leak_area, grid)
        actual_row = ', '.join(str(i) for i in c_row)
        correct_compa = "&COMP ID = '{}', WIDTH = {}, DEPTH = {}, HEIGHT = {}, CEILING_MATL_ID = '{}', " \
                        "WALL_MATL_ID = '{}', FLOOR_MATL_ID = '{}', ORIGIN = {}, {}, {}, " \
                        "LEAK_AREA = {}, {}, GRID = {}, {}, {} /".format(name, width, depth, height, ceiling_matl_id, wall_matl_id, floor_matl_id,
                                      origin[0], origin[1], origin[2], leak_area[0], leak_area[1], grid[0], grid[1], grid[2])
        self.assertEqual(actual_row, correct_compa)
        type_sec = 'COR'
        c_row = self.cfast_mcarlo._build_compa_row(name, width, depth, height, ceiling_matl_id, wall_matl_id, floor_matl_id, type_sec, origin, leak_area, grid)
        actual_row = ', '.join(str(i) for i in c_row)
        correct_compa = "&COMP ID = '{}', WIDTH = {}, DEPTH = {}, HEIGHT = {}, CEILING_MATL_ID = '{}', " \
                        "WALL_MATL_ID = '{}', FLOOR_MATL_ID = '{}', HALL = .TRUE., ORIGIN = {}, {}, {}, " \
                        "LEAK_AREA = {}, {}, GRID = {}, {}, {} /".format(name, width, depth, height, ceiling_matl_id, wall_matl_id, floor_matl_id,
                                                                         origin[0], origin[1], origin[2], leak_area[0], leak_area[1], grid[0], grid[1], grid[2])
        self.assertEqual(actual_row, correct_compa)

    def test_section_windows(self):
        outdoor_temp = 20
        txt = self.cfast_mcarlo._section_windows(outdoor_temp)
        expected = "&VENT TYPE = 'WALL', ID = 'w1', COMP_IDS = 'r1', 'OUTSIDE', WIDTH = 1.4, TOP = 2.5, BOTTOM = 1.0, OFFSET = 2.8, FACE = '1', CRITERION = 'TIME' T = 0,1 F = 0,1 /"
        actual = txt.splitlines()[1]
        self.assertEqual(actual, expected)

    def test_section_doors_and_holes(self):
        txt = self.cfast_mcarlo._section_doors_and_holes()
        expected = "&VENT TYPE = 'WALL', ID = 'd4', COMP_IDS = 'c2', 'r3', WIDTH = 0.9, TOP = 2.0, BOTTOM = 0.0, OFFSET = 12.09, FACE = '1', CRITERION = 'TIME' T = 0 F = 1 /"
        actual = txt.splitlines()[1]
        self.assertEqual(actual, expected)


    def test_section_vvent(self):
        x = self.cfast_mcarlo._section_vvent()
        self.assertEqual(len(x), 484)

    def test_section_mvent(self):
        x = self.cfast_mcarlo._section_mvent()
        self.assertEqual(len(x), 594)


    def test_draw_fire_development(self):
        x = self.cfast_mcarlo._draw_fire_development()
        self.assertEqual(len(x), 1678)

    def test_draw_fire_origin(self):
        txt = self.cfast_mcarlo._draw_fire_origin()
        expected = "&FIRE ID = 'f1', COMP_ID = 'r1', FIRE_ID = 'f1', LOCATION = 4.4, 3.83 /"
        #actual = txt.splitlines()
        self.assertEqual(txt, expected)

    def test_draw_fire_properties(self):
        params = self.cfast_mcarlo._draw_fire_properties()
        actual_keys = list(params[0].keys())
        expected_keys = ['TIME', 'HRR', 'HEIGHT', 'AREA', 'CO_YIELD', 'SOOT_YIELD', 'HCN_YIELD', 'HCL_YIELD', 'TRACE_YIELD']
        self.assertEqual(actual_keys, expected_keys)
        self.assertGreater(len(params[0]['HRR']), 20)
    
    def test_connect_psql_db(self):
        x = self.cfast_mcarlo.connect_psql_db()
        columns = x.query("SELECT column_name FROM information_schema.columns WHERE table_schema = 'public' AND table_catalog='aamks' AND table_name = 'simulations'")
        a_columns = [['id'], ['project'], ['scenario_id'], ['iteration'], ['host'], ['run_time'], ['fireorig'], ['fireorigname'],
             ['heat_detectors'], ['smoke_detectors'], ['hrrpeak'], ['sootyield'], ['coyield'], ['alpha'], ['area'], ['heigh'],
             ['heatcom'], ['radfrac'], ['q_star'], ['trace'], ['w'], ['outdoort'], ['door'], ['dcloser'], ['delectr'], ['vnt'],
             ['vvent'], ['sprinklers'], ['wcbe'], ['dcbe_time'], ['dcbe_compa'],['fed'], ['min_hgt_compa'], ['min_hgt_cor'],
             ['min_vis_compa'], ['min_vis_cor'], ['max_temp'], ['status'], ['animation'], ['modified']]
        self.assertListEqual(columns, a_columns)

