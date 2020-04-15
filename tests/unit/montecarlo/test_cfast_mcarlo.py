from unittest import TestCase
from montecarlo.cfast_mcarlo import CfastMcarlo
from numpy.random import normal


class TestEvacuee(TestCase):
    @classmethod
    def setUp(cls) -> None:
        cls.cfast_mcarlo = CfastMcarlo()

    def test_read_json(self):
        expected_id = 4
        id = self.cfast_mcarlo.read_json()
        self.assertEqual(expected_id, id)

    def test_create_sqlite_db(self):
        link = self.cfast_mcarlo.create_sqlite_db()
        t_name = link.query("SELECT tbl_name FROM sqlite_master WHERE type = 'table' AND name = 'fire_origin'")[0]
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
        outdoor_temp=round(normal(self.cfast_mcarlo.conf['outdoor_temperature']['mean'],self.cfast_mcarlo.conf['outdoor_temperature']['sd']),2)
        self.cfast_mcarlo._psql_log_variable('outdoort',outdoor_temp)
        return outdoor_temp

    def test_section_preamble(self):
        preamble = '&HEAD VERSION = 7.5, TITLE = P_ID_4_S_ID_1/\n&TIMES SIMULATION = 400., PRINT = 100., SMOKEVIEW = 100., ' \
                   'SPREADSHEET = 10. /\n&INIT PRESSURE = 101325, RELATIVE_HUMIDITY = 50, INTERIOR_TEMPERATURE = 20., ' \
                   'EXTERIOR_TEMPERATURE = 20. /\n&MISC LOWER_OXYGEN_LIMIT = 0.15 /\n'
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
        self.assertEqual(len(x), 588)

    def test_section_compa(self):
        txt = self.cfast_mcarlo._section_compa()
        correct_compa = "&COMP ID = 'r1', WIDTH = 8.8, DEPTH = 7.65, HEIGHT = 3.5, ORIGIN = 9.45, 3.9, 0.0, " \
                        "CEILING_MATL_ID = 'concrete', WALL_MATL_ID = 'concrete', FLOOR_MATL_ID = 'concrete', GRID = 50, 50, 50 /"
        lines = txt.splitlines()
        self.assertEqual(len(lines), 5)
        self.assertEqual(lines[0], correct_compa)

    def test_section_windows(self):
        outdoor_temp = 20
        x = self.cfast_mcarlo._section_windows(outdoor_temp)
        print(x)

    def test_section_doors_and_holes(self):
        txt = self.cfast_mcarlo._section_doors_and_holes()
        print(txt)

    def test_section_vvent(self):
        x = self.cfast_mcarlo._section_vvent()
        print(x)

    def test_section_mvent(self):
        x = self.cfast_mcarlo._section_mvent()
        print(x)


    def test_draw_fire_development(self):
        x = self.cfast_mcarlo._draw_fire_development()
        print(x)

    def test_draw_fire_origin(self):
        x = self.cfast_mcarlo._draw_fire_origin()
        print(x)

    def test_draw_fire_chem(self):
        x = self.cfast_mcarlo._draw_fire_chem()
        print(x)

    def test_draw_fire_properties(self):
        x = self.cfast_mcarlo._draw_fire_properties(20)
        print(x)

