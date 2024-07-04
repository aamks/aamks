from collections import OrderedDict
from unittest import TestCase
from unittest.mock import patch, MagicMock, call, PropertyMock
from montecarlo.cfast_mcarlo import DrawAndLog, Fire, CfastMcarlo
from include import Json
import os
from numpy.random import seed
from copy import deepcopy


class TestDrawAndLog(TestCase):
    def setUp(self) -> None:
        # Patch variables
        self.old_environ = os.environ.copy()
        os.environ['AAMKS_PROJECT'] = '/home/aamks_users/demo@aamks/demo/three'
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
                return
            if query.startswith("SELECT * FROM aamks_geom WHERE type_tri='WIN'"):
                return [OrderedDict([('name', 'w4'), ('floor', '0'), ('global_type_id', 4), ('hvent_room_seq', 2), ('vvent_room_seq', None), ('type_pri', 'HVENT'), ('type_sec', 'WIN'), ('type_tri', 'WIN'), ('x0', 1313), ('y0', 454), ('z0', 100), ('width', 259), ('depth', 32), ('height', 150), ('cfast_width', 259), ('sill', 100), ('face', 'FRONT'), ('face_offset', 263.0), ('vent_from', 2), ('vent_to', 11), ('material_ceiling', 'concrete'), ('material_floor', 'concrete'), ('material_wall', 'concrete'), ('heat_detectors', 0), ('smoke_detectors', 0), ('sprinklers', 0), ('is_vertical', 0), ('vent_from_name', 'r2'), ('vent_to_name', 'OUTSIDE'), ('how_much_open', None), ('room_area', None), ('x1', 1572), ('y1', 486), ('z1', 250), ('center_x', 1442), ('center_y', 470), ('center_z', 175), ('fire_model_ignore', 0), ('mvent_throughput', None), ('exit_type', None), ('room_enter', None), ('evacuees_density', None), ('terminal_door', None), ('points', '[[1313, 486], [1572, 486], [1572, 454], [1313, 454]]'), ('origin_room', None), ('orig_type', 'WIN'), ('has_door', None), ('teleport_from', None), ('teleport_to', None), ('adjacents', None), ('stair_direction', None), ('exit_weight', None), ('room_exits_weights', None)])]
            if query.startswith("SELECT adjacents FROM aamks_geom"):
                return [{'adjacents':'r8;0.255;0.152'}]
            if query.startswith("UPDATE"):
                return None
            if query == "SELECT name FROM aamks_geom WHERE type_sec='VVENT' ORDER BY vent_from, vent_to":
                return [OrderedDict([('name', 'b1')]), OrderedDict([('name', 'b2')])]
            if query.startswith("SELECT width*depth/10000 AS area FROM aamks_geom WHERE name="):
                return [OrderedDict([('area', 92)])]
            if query.startswith("SELECT width, depth, height FROM aamks_geom WHERE name="):
                return [OrderedDict([('width', 980), ('depth', 945), ('height', 350)])]
            if query.startswith("SELECT name from aamks_geom WHERE type_pri='COMPA' AND fire_model_ignore!=1"):
                return [OrderedDict([('name', 'r1')]), OrderedDict([('name', 'c2')])]
            else:
                raise Exception("Unknown query: " + query)
        self.mock_sqlite_instance.query.side_effect = side_effect

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
        expected = ['r8', 'room', 2480, 862, 350, 3.95, 3.92, '1', 'f8', 0, 't_f8']

        self.assertEqual(args[:-2], expected)

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

        self.assertEqual(self.draw._fire_openings, [(2.59, 1.5, 1)])
        self.assertEqual(self.draw.data_for_psql['123']['w'], [1])
        self.assertEqual(self.draw.sections['VENT'], [{'TYPE': 'WALL', 'ID': 'w4', 'COMP_IDS': ["'r2'", "'OUTSIDE'"], 'WIDTH': 2.59, 'TOP': 2.5, 'BOTTOM': 1.0, 'OFFSET': 2.63, 'FACE': 'FRONT', 'CRITERION': ["'TIME'", 'T = 0,1', 'F = 0,1']}])

    @patch('montecarlo.cfast_mcarlo.uniform')
    @patch.object(DrawAndLog, 'sections', new_callable=PropertyMock, create=True)
    @patch.object(DrawAndLog, '_fire', new_callable=PropertyMock, create=True)
    def test_draw_windows_opening_quarter_open(self, mock_fire, mock_sections, mock_uniform):
        mock_uniform.return_value = 0.14
        mock_fire.return_value.f_id = 'f2'
        mock_sections.return_value = {'INIT': {'EXTERIOR_TEMPERATURE': 10}}

        self.draw._draw_windows_opening()

        self.assertEqual(self.draw._fire_openings, [(2.59, 1.5, 0.25)])
        self.assertEqual(self.draw.data_for_psql['123']['w'], [0.25])
        self.assertEqual(self.draw.sections['VENT'], [{'TYPE': 'WALL', 'ID': 'w4', 'COMP_IDS': ["'r2'", "'OUTSIDE'"], 'WIDTH': 2.59, 'TOP': 2.5, 'BOTTOM': 1.0, 'OFFSET': 2.63, 'FACE': 'FRONT', 'CRITERION': ["'TIME'", 'T = 0,1', 'F = 0,0.25']}])

    @patch('montecarlo.cfast_mcarlo.uniform')
    @patch.object(DrawAndLog, 'sections', new_callable=PropertyMock, create=True)
    @patch.object(DrawAndLog, '_fire', new_callable=PropertyMock, create=True)
    def test_draw_windows_opening_not_open(self, mock_fire, mock_sections, mock_uniform):
        mock_uniform.return_value = 1
        mock_fire.return_value.f_id = 'f2'
        mock_sections.return_value = {'INIT': {'EXTERIOR_TEMPERATURE': 10}}

        self.draw._draw_windows_opening()

        self.assertEqual(self.draw._fire_openings, [])
        self.assertEqual(self.draw.data_for_psql['123']['w'], [0])
        self.assertEqual(self.draw.sections['VENT'], [{'TYPE': 'WALL', 'ID': 'w4', 'COMP_IDS': ["'r2'", "'OUTSIDE'"], 'WIDTH': 2.59, 'TOP': 2.5, 'BOTTOM': 1.0, 'OFFSET': 2.63, 'FACE': 'FRONT', 'CRITERION': 'TEMPERATURE', 'SETPOINT': 200, 'PRE_FRACTION': 0, 'POST_FRACTION': 1, 'DEVC_ID': 't_w4'}])

    def test_draw_doors_and_holes_opening(self):
        # to do after update
        self.assertEqual(2+2, 5)

    @patch('montecarlo.cfast_mcarlo.binomial')
    def test_vvents_opening(self, mock_binomial):
        mock_binomial.return_value = 1

        self.draw._draw_vvents_opening()

        self.assertEqual(self.draw.data_for_psql['123']['vvent'], [1, 1])
        self.assertEqual(self.draw.sections['vvents'], [(1, 'b1'), (1, 'b2')])

    @patch.object(DrawAndLog, '_fire', new_callable=PropertyMock, create=True)
    @patch.object(DrawAndLog, '_fires', new_callable=PropertyMock, create=True)
    def test_draw_fires_chem(self, mock_fires, mock_fire):
        mock_fire.return_value.f_id = 'f2'
        mock_fires.return_value = [Fire('r4', 'room', 2132, 1136, 32, 0.48, 6.67, '0', 'f2', 0.32, 't_f4', 1)]
        seed(0)
        heat_of_combustion = 44000.0
        rad_frac = 0.277

        self.draw._draw_fires_chem()

        self.assertEqual(self.draw.sections['CHEM'], [{'ID': 'f2', 'HEAT_OF_COMBUSTION': heat_of_combustion, 'RADIATIVE_FRACTION': rad_frac, 'CARBON': 2, 'HYDROGEN': 4, 'OXYGEN': 0, 'NITROGEN': 0, 'CHLORINE': 0}])
        self.assertEqual(self.draw.data_for_psql['123']['heat_of_combustion'], [heat_of_combustion])
        self.assertEqual(self.draw.data_for_psql['123']['rad_frac'], [rad_frac])

    @patch.object(DrawAndLog, '_scen_fuel', new_callable=PropertyMock, create=True)
    @patch.object(DrawAndLog, '_fire_openings', new_callable=PropertyMock, create=True)
    @patch.object(DrawAndLog, '_fires', new_callable=PropertyMock, create=True)
    @patch.object(DrawAndLog, '_fire', new_callable=PropertyMock, create=True)
    def test_draw_fires_table(self, mock_fire, mock_fires, mock_openings, mock_scen_fuel):
        fire = Fire('r4', 'room', 2132, 1136, 32, 0.48, 6.67, '0', 'f2', 0.32, 't_f4', 1)
        mock_fire.return_value = fire
        mock_fires.return_value = [fire]
        mock_scen_fuel.return_value = {'yields': {'soot': {'mean': 0.113, 'sd': 0}, 'co': {'mean': 0.903, 'sd': 0}, 'hcn': {'mean': 0, 'sd': 0}}}
        mock_openings.return_value = [(0.86, 2.0, 1)]
        seed(0)
        alpha = 0.091420059722687

        self.draw._draw_fires_table()

        # self.assertEqual(self.draw.sections['TABL'], [{'ID': 'f2', 'HEAT_OF_COMBUSTION': heat_of_combustion, 'RADIATIVE_FRACTION': rad_frac, 'CARBON': 2, 'HYDROGEN': 4, 'OXYGEN': 0, 'NITROGEN': 0, 'CHLORINE': 0}])
        self.assertEqual(self.draw.alpha, alpha)
        self.assertEqual(self.draw.data_for_psql['123']['alpha'], [alpha])
        self.assertEqual(self.draw.data_for_psql['123']['fireload'], [1695])
        self.assertEqual(self.draw.data_for_psql['123']['hrrpeak'], [1961])
        self.assertEqual(self.draw.data_for_psql['123']['max_area'], [92])
        self.assertEqual(self.draw.data_for_psql['123']['co_yield'], [1.4109375])
        self.assertEqual(self.draw.data_for_psql['123']['soot_yield'], [0.12359375])
        self.assertEqual(self.draw.data_for_psql['123']['hcn_yield'], [0])
        self.assertEqual(self.draw.sections['TABL'][0], {'ID': 'f2', 'LABELS': ['TIME', 'HRR', 'HEIGHT', 'AREA', 'CO_YIELD', 'SOOT_YIELD', 'HCN_YIELD']})
        self.assertEqual(self.draw.sections['TABL'][1], {'ID': 'f2', 'DATA': [0, 0, 0.32, 0.0, 0.903, 0.113, 0.0]})
        self.assertEqual(len(self.draw.sections['TABL']), 33)

    @patch.object(DrawAndLog, '_fire', new_callable=PropertyMock, create=True)
    def test_draw_connections(self, mock_fire):
        mock_fire.return_value.room = 'r1'

        self.draw._draw_connections()

        self.assertEqual(self.draw.sections['CONN'], [{'COMP_ID': 'r1', 'COMP_IDS': 'r8', 'F': 0.255, 'TYPE': 'WALL'},
                                                      {'COMP_ID': 'r8', 'COMP_IDS': 'r1', 'F': 0.152, 'TYPE': 'WALL'}])

    @patch.object(DrawAndLog, '_fires', new_callable=PropertyMock, create=True)
    def test_draw_fire_targets(self, mock_fires):
        mock_fires.return_value = [Fire('r1', 'room', 2132, 1136, 32, 0.48, 6.67, '0', 'f1', 0.32, 't_f1', 1),
                                   Fire('r4', 'room', 2132, 1136, 32, 0.48, 6.67, '0', 'f2', 0.32, 't_f2', 0)]

        self.draw._draw_fire_targets()

        self.assertEqual(self.draw.sections['DEVC'], [{'COMP_ID': 'r4','DEPTH_UNITS': 'M','ID': 't_f2','LOCATION': [0.48, 6.67, 0],
                                                       'NORMAL': [0.0, 0.0, 1.0],'TEMPERATURE_DEPTH': 0,'TYPE': 'PLATE'}])

    def test_draw_window_and_door_targets(self):
        # to do after update
        self.assertEqual(2+2, 5)

    @patch('montecarlo.cfast_mcarlo.binomial')
    def test_draw_triggers(self, mock_binomial):
        mock_binomial.return_value = 1
        seed(0)

        [self.draw._draw_triggers(d) for d in ['heat_detectors', 'smoke_detectors', 'sprinklers']]

        self.assertEqual(self.draw.sections['heat_detectors'], [68.82, 62.0])
        self.assertEqual(self.draw.data_for_psql['123']['heat_detectors'], [68.82, 62.0])
        self.assertEqual(self.draw.sections['smoke_detectors'], [24.96, 27.48])
        self.assertEqual(self.draw.data_for_psql['123']['smoke_detectors'], [24.96, 27.48])
        self.assertEqual(self.draw.sections['sprinklers'], [[63.74, 9.02272e-05], [61.9, 9.84864e-05]])
        self.assertEqual(self.draw.data_for_psql['123']['sprinklers'], [[63.74, 9.02272e-05], [61.9, 9.84864e-05]])

class TestCfastMcarlo(TestCase):
    def setUp(self) -> None:
        # Patch variables
        self.old_environ = os.environ.copy()
        os.environ['AAMKS_PROJECT'] = '/home/aamks_users/demo@aamks/demo/three'
        os.environ['AAMKS_PATH'] = '/usr/local/aamks'
        # Patch classes
        self.MockJson = patch('montecarlo.cfast_mcarlo.Json').start()
        self.MockPsql = patch('montecarlo.cfast_mcarlo.Psql').start()
        self.MockSqlite = patch('montecarlo.cfast_mcarlo.Sqlite').start()
        self.MockDrawAndLog = patch('montecarlo.cfast_mcarlo.DrawAndLog').start()
        # Arrange

        self.mock_json_instance = self.MockJson.return_value
        self.mock_json_instance.read = MagicMock()  # Mocking the read method without return_value to check calls
        self.mock_sqlite_instance = self.MockSqlite.return_value
        self.mock_sqlite_instance.query = MagicMock()
        self.mock_psql_instance = self.MockPsql.return_value
        self.mock_psql_instance.query = MagicMock()

        def side_effect(query, args=None):
            if query.startswith("SELECT tbl_name FROM sqlite_master WHERE type = 'table' AND name = 'fire_origin'"):
                return [OrderedDict([('tbl_name', 'fire_origin')])]
            if query.startswith("SELECT name, vent_from_name, vent_to_name, width, depth FROM aamks_geom WHERE type_sec='VVENT'"):
                return [OrderedDict([('name', 'b2'), ('vent_from_name', 'r8'), ('vent_to_name', 'r10'), ('width', 365), ('depth', 285)]),
                        OrderedDict([('name', 'b1'), ('vent_from_name', 's1.1'), ('vent_to_name', 'OUTSIDE'), ('width', 240), ('depth', 250)])]
            if query.startswith( "SELECT name, vent_from_name, vent_to_name, width, depth, height, mvent_throughput, is_vertical FROM aamks_geom WHERE type_sec = 'MVENT'"):
                return [OrderedDict([('name', 'm1'), ('vent_from_name', 'r2'), ('vent_to_name', 'r2'), ('width', 105), ('depth', 400), ('height', 50), ('mvent_throughput', -1), ('is_vertical', 0)]),
                        OrderedDict([('name', 'm2'), ('vent_from_name', 'c9'), ('vent_to_name', 'c9'), ('width', 125), ('depth', 120), ('height', 200), ('mvent_throughput', 0), ('is_vertical', 1)])]
            if query.startswith("SELECT global_type_id, name, width, depth, height from aamks_geom WHERE type_pri='COMPA' AND fire_model_ignore!=1"):
                return [OrderedDict([('global_type_id', 2), ('name', 'r2'), ('width', 1035), ('depth', 945), ('height', 350)]),
                        OrderedDict([('global_type_id', 1), ('name', 's1'), ('width', 635), ('depth', 565), ('height', 700)])]

        self.mock_sqlite_instance.query.side_effect = side_effect

        self.cfast_mcarlo = CfastMcarlo('123')
        self.cfast_mcarlo.conf = Json().read('/usr/local/aamks/installer/demo/three/conf.json')
        self.cfast_mcarlo.config = Json().read('/usr/local/aamks/evac/config.json')

    def tearDown(self):
        patch.stopall() # Stop patching after the test
        os.environ = self.old_environ # Restore original environment variables

    def test_init(self):
        self.assertEqual(self.cfast_mcarlo._sim_id, '123')
        self.MockSqlite.assert_called_once_with(f'{os.environ["AAMKS_PROJECT"]}/aamks.sqlite')
        self.MockJson.assert_called_once()
        self.MockPsql.assert_called_once()
        self.mock_json_instance.read.assert_has_calls([call(f'{os.environ["AAMKS_PROJECT"]}/conf.json'), call(f'{os.environ["AAMKS_PATH"]}/evac/config.json')])
        self.MockDrawAndLog.assert_called_once()

    @patch.object(CfastMcarlo, 'samples', new_callable=PropertyMock, create=True)
    def test_section_preamble(self, mock_samples):
        exterior_temp = 20
        indoor_temp = 20
        pressure = 101325
        humidity = 50
        preamble = f"&HEAD VERSION = 7724, TITLE = 'P_ID_{self.cfast_mcarlo.conf['project_id']}_S_ID_{self.cfast_mcarlo.conf['scenario_id']}' /\n" \
                   f"&TIME SIMULATION = {self.cfast_mcarlo.conf['simulation_time']}, PRINT = {self.cfast_mcarlo.config['SMOKE_QUERY_RESOLUTION']}, " \
                   f"SMOKEVIEW = {self.cfast_mcarlo.config['SMOKE_QUERY_RESOLUTION']}, SPREADSHEET = {self.cfast_mcarlo.config['SMOKE_QUERY_RESOLUTION']} /\n" \
                   f"&MISC LOWER_OXYGEN_LIMIT = 0.15, MAX_TIME_STEP = 0.1 /\n" \
                   f"&INIT EXTERIOR_TEMPERATURE = {exterior_temp}, INTERIOR_TEMPERATURE = {indoor_temp}, PRESSURE = {pressure}, RELATIVE_HUMIDITY = {humidity} /\n"
        mock_samples.return_value = {'INIT': {'EXTERIOR_TEMPERATURE': exterior_temp, 'INTERIOR_TEMPERATURE': indoor_temp, 'PRESSURE': pressure, 'RELATIVE_HUMIDITY': humidity}}

        actual_row = self.cfast_mcarlo._section_preamble()

        self.assertMultiLineEqual(actual_row, preamble)

    def test_build_compa_row(self):
        name = 'r1'
        width = 12
        depth =  3
        height = 2
        ceiling_matl_id = OrderedDict([('type', 'concrete'), ('thickness', 0.3)])
        wall_matl_id = OrderedDict([('type', 'concrete'), ('thickness', 0.3)])
        floor_matl_id = OrderedDict([('type', 'concrete'), ('thickness', 0.3)])
        type_sec = 'ROOM'
        origin = [1,2,3]
        leak_area = [3.5E-4, 5.2E-5]
        grid = [50, 50, 50]
        c_row = self.cfast_mcarlo._build_compa_row(name, width, depth, height, ceiling_matl_id, wall_matl_id, floor_matl_id, type_sec, origin, leak_area, grid)
        actual_row = ', '.join(str(i) for i in c_row)
        correct_compa = "&COMP ID = '{}', WIDTH = {}, DEPTH = {}, HEIGHT = {}, CEILING_MATL_ID = '{}', " \
                        "WALL_MATL_ID = '{}', FLOOR_MATL_ID = '{}', CEILING_THICKNESS = {}, WALL_THICKNESS = {}, FLOOR_THICKNESS = {}, ORIGIN = {}, {}, {}, " \
                        "LEAK_AREA = {}, {}, GRID = {}, {}, {} /".format(name, width, depth, height, ceiling_matl_id['type'], wall_matl_id['type'], floor_matl_id['type'],
                                      ceiling_matl_id['thickness'], wall_matl_id['thickness'], floor_matl_id['thickness'],
                                      origin[0], origin[1], origin[2], leak_area[0], leak_area[1], grid[0], grid[1], grid[2])
        self.assertEqual(actual_row, correct_compa)
        type_sec = 'COR'
        c_row = self.cfast_mcarlo._build_compa_row(name, width, depth, height, ceiling_matl_id, wall_matl_id, floor_matl_id, type_sec, origin, leak_area, grid)
        actual_row = ', '.join(str(i) for i in c_row)
        correct_compa = "&COMP ID = '{}', WIDTH = {}, DEPTH = {}, HEIGHT = {}, CEILING_MATL_ID = '{}', " \
                        "WALL_MATL_ID = '{}', FLOOR_MATL_ID = '{}', CEILING_THICKNESS = {}, WALL_THICKNESS = {}, FLOOR_THICKNESS = {}, HALL = .TRUE., ORIGIN = {}, {}, {}, " \
                        "LEAK_AREA = {}, {}, GRID = {}, {}, {} /".format(name, width, depth, height, ceiling_matl_id['type'], wall_matl_id['type'], floor_matl_id['type'],
                                                                         ceiling_matl_id['thickness'], wall_matl_id['thickness'], floor_matl_id['thickness'],
                                                                         origin[0], origin[1], origin[2], leak_area[0], leak_area[1], grid[0], grid[1], grid[2])
        self.assertEqual(actual_row, correct_compa)
        type_sec = 'STAI'
        c_row = self.cfast_mcarlo._build_compa_row(name, width, depth, height, ceiling_matl_id, wall_matl_id, floor_matl_id, type_sec, origin, leak_area, grid)
        actual_row = ', '.join(str(i) for i in c_row)
        correct_compa = "&COMP ID = '{}', WIDTH = {}, DEPTH = {}, HEIGHT = {}, CEILING_MATL_ID = '{}', " \
                        "WALL_MATL_ID = '{}', FLOOR_MATL_ID = '{}', CEILING_THICKNESS = {}, WALL_THICKNESS = {}, FLOOR_THICKNESS = {}, SHAFT = .TRUE., ORIGIN = {}, {}, {}, " \
                        "LEAK_AREA = {}, {}, GRID = {}, {}, {} /".format(name, width, depth, height, ceiling_matl_id['type'], wall_matl_id['type'], floor_matl_id['type'],
                                                                         ceiling_matl_id['thickness'], wall_matl_id['thickness'], floor_matl_id['thickness'],
                                                                         origin[0], origin[1], origin[2], leak_area[0], leak_area[1], grid[0], grid[1], grid[2])
        self.assertEqual(actual_row, correct_compa)

    @patch.object(CfastMcarlo, 'samples', new_callable=PropertyMock, create=True)
    def test_section_vvent(self, mock_samples):
        mock_samples.return_value = {'vvents': [(1, 'b2'), (1, 'b1')]}
        correct_row = "!! SECTION NATURAL VENT\n" \
        "&VENT TYPE = 'CEILING', ID = 'b2', COMP_IDS = 'r8', 'r10', AREA = 10.4, SHAPE = 'SQUARE', OFFSETS = 0, 0, CRITERION = 'TIME' T = 0,90 F = 0,1 /\n" \
        "&VENT TYPE = 'CEILING', ID = 'b1', COMP_IDS = 's1', 'OUTSIDE', AREA = 6.0, SHAPE = 'SQUARE', OFFSETS = 0, 0, CRITERION = 'TIME' T = 0,90 F = 0,1 /\n"

        actual_row = self.cfast_mcarlo._section_vvent()

        self.assertEqual(actual_row, correct_row)

    def test_section_mvent(self):
        correct_row = "!! SECTION MECHANICAL VENT\n" \
        "&VENT TYPE = 'MECHANICAL', ID = 'm1', COMP_IDS = 'r2', 'OUTSIDE', AREAS = 4.2, 4.2, HEIGHTS = 0.5, 50, FLOW = 1, CUTOFFS = 200, 300, ORIENTATIONS = 'HORIZONTAL', OFFSETS = 0, 0, CRITERION = 'TIME' T = 60,120 F = 0,1 /\n" \
        "&VENT TYPE = 'MECHANICAL', ID = 'm2', COMP_IDS = 'OUTSIDE', 'c9', AREAS = 1.5, 1.5, HEIGHTS = 2.0, 200, FLOW = 0, CUTOFFS = 200, 300, ORIENTATIONS = 'VERTICAL', OFFSETS = 0, 0, CRITERION = 'TIME' T = 60,120 F = 0,1 /\n"

        actual_row = self.cfast_mcarlo._section_mvent()

        self.assertEqual(actual_row, correct_row)

    @patch.object(CfastMcarlo, 'samples', new_callable=PropertyMock, create=True)
    def test_cfast_record(self, mock_samples):
        mock_samples.return_value = {'VENT': [{'TYPE': 'WALL', 'ID': 'w4', 'COMP_IDS': ["'r2'", "'OUTSIDE'"], 'WIDTH': 2.59, 'TOP': 2.5, 'BOTTOM': 1.0, 'OFFSET': 2.63, 'FACE': 'FRONT', 'CRITERION': 'TEMPERATURE', 'SETPOINT': 200, 'PRE_FRACTION': 0, 'POST_FRACTION': 1, 'DEVC_ID': 't_w4'}]}
        correct_row = "&VENT TYPE = 'WALL' ID = 'w4' COMP_IDS = 'r2', 'OUTSIDE' WIDTH = 2.59 TOP = 2.5 BOTTOM = 1.0 OFFSET = 2.63 FACE = 'FRONT' CRITERION = 'TEMPERATURE' SETPOINT = 200 PRE_FRACTION = 0 POST_FRACTION = 1 DEVC_ID = 't_w4'/\n"

        actual_row = self.cfast_mcarlo._cfast_record('VENT')

        self.assertEqual(actual_row, correct_row)

    @patch.object(CfastMcarlo, 'samples', new_callable=PropertyMock, create=True)
    def test_section_heat_detectors(self, mock_samples):
        mock_samples.return_value = {'heat_detectors': [64.34, 0]}
        correct_row = "!! HEAT DETECTORS\n&DEVC ID = 'hd2' TYPE = 'HEAT_DETECTOR', COMP_ID = 'r2', LOCATION = 5.17, 4.72, 3.5, SETPOINT = 64.34, RTI = 5 /\n"

        actual_row = self.cfast_mcarlo._section_heat_detectors()

        self.assertEqual(actual_row, correct_row)

    @patch.object(CfastMcarlo, 'samples', new_callable=PropertyMock, create=True)
    def test_section_smoke_detectors(self, mock_samples):
        mock_samples.return_value = {'smoke_detectors': [26.41, 0]}
        correct_row = "!! SMOKE DETECTORS\n&DEVC ID = 'sd2' TYPE = 'SMOKE_DETECTOR', COMP_ID = 'r2', LOCATION = 5.17, 4.72, 3.5, SETPOINT = 26.41 /\n"

        actual_row = self.cfast_mcarlo._section_smoke_detectors()

        self.assertEqual(actual_row, correct_row)

    @patch.object(CfastMcarlo, 'samples', new_callable=PropertyMock, create=True)
    def test_section_sprinklers(self, mock_samples):
        mock_samples.return_value = {'sprinklers': [[62.67, 9.84776e-05], [0]]}
        correct_row = "!! SECTION SPRINKLERS\n&DEVC ID = 'sp2' TYPE = 'SPRINKLER', COMP_ID = 'r2', LOCATION = 5.17, 4.72, 3.5, SETPOINT = 62.67, RTI = 100, SPRAY_DENSITY = 9.84776e-05 /\n"

        actual_row = self.cfast_mcarlo._section_sprinklers()

        self.assertEqual(actual_row, correct_row)

    @patch.object(CfastMcarlo, '_psql_collector', new_callable=PropertyMock, create=True)
    def test__write_psql_db(self, mock_collector):
        mock_collector.return_value = {'123': {"fireorig": ['non_room'], "fireorigname":['a6']}}

        self.cfast_mcarlo._write()

        self.mock_psql_instance.query.assert_has_calls([call("UPDATE simulations SET fireorig='non_room', fireorigname='a6' WHERE project=%s AND scenario_id=%s AND iteration=%s", (1, 3, '123'))])
        # columns = x.query("SELECT column_name FROM information_schema.columns WHERE table_schema = 'public' AND table_catalog='aamks' AND table_name = 'simulations'")
        # a_columns = [['id'], ['project'], ['scenario_id'], ['iteration'], ['host'], ['run_time'], ['fireorig'], ['fireorigname'],
        #      ['heat_detectors'], ['smoke_detectors'], ['hrrpeak'], ['sootyield'], ['coyield'], ['alpha'], ['area'], ['heigh'],
        #      ['heatcom'], ['radfrac'], ['q_star'], ['trace'], ['w'], ['outdoort'], ['door'], ['dcloser'], ['delectr'], ['vnt'],
        #      ['vvent'], ['sprinklers'], ['wcbe'], ['dcbe_time'], ['dcbe_compa'],['fed'], ['min_hgt_compa'], ['min_hgt_cor'],
        #      ['min_vis_compa'], ['min_vis_cor'], ['max_temp'], ['status'], ['animation'], ['modified']]
        # self.assertListEqual(columns, a_columns)
