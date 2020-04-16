from unittest import TestCase
from montecarlo.cfast_mcarlo import CfastMcarlo
from numpy.random import normal


class TestEvacuee(TestCase):
    @classmethod
    def setUp(cls) -> None:
        cls.cfast_mcarlo = CfastMcarlo(1)

    def test_read_json(self):
        expected_id = 4
        id = self.cfast_mcarlo.read_json()
        self.assertEqual(expected_id, id)

    def test_create_sqlite_db(self):
        t_name = self.cfast_mcarlo.create_sqlite_db()
        self.assertEqual(t_name['tbl_name'], 'fire_origin')

    def test_connect_psql_db(self):
        x = self.cfast_mcarlo.connect_psql_db()
        columns = x.query("SELECT column_name FROM information_schema.columns WHERE table_schema = 'public' AND table_catalog='aamks' AND table_name = 'simulations'")
        a_columns = [['id'], ['project'], ['scenario_id'], ['iteration'], ['host'], ['run_time'], ['fireorig'], ['fireorigname'],
             ['heat_detectors'], ['smoke_detectors'], ['hrrpeak'], ['sootyield'], ['coyield'], ['alpha'], ['area'], ['heigh'],
             ['heatcom'], ['radfrac'], ['q_star'], ['trace'], ['w'], ['outdoort'], ['door'], ['dcloser'], ['delectr'], ['vnt'],
             ['vvent'], ['sprinklers'], ['wcbe'], ['dcbe_time'], ['dcbe_compa'],['fed'], ['min_hgt_compa'], ['min_hgt_cor'],
             ['min_vis_compa'], ['min_vis_cor'], ['max_temp'], ['status'], ['animation'], ['modified']]
        self.assertListEqual(columns, a_columns)

    def test_draw_outdoor_temp(self):# {{{
        outdoor_temp = round(normal(self.cfast_mcarlo.conf['outdoor_temperature']['mean'],self.cfast_mcarlo.conf['outdoor_temperature']['sd']),2)
        self.assertGreater(outdoor_temp, -30)
        self.assertLess(outdoor_temp, 30)


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
        self.assertEqual(len(x), 578)


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

