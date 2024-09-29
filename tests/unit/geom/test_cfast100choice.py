from collections import OrderedDict
from unittest import TestCase
from unittest.mock import patch, MagicMock, call, PropertyMock
import os
from geom.choose_100_rooms_cfast import CFAST100Choice

class TestCFAST100Choice(TestCase):
    def setUp(self) -> None:
        self.old_environ = os.environ.copy()
        os.environ['AAMKS_PROJECT'] = '/home/aamks_users/demo@aamks/demo/three'
        os.environ['AAMKS_PATH'] = '/usr/local/aamks'
        self.MockSqlite = patch('geom.choose_100_rooms_cfast.Sqlite').start()
        self.mock_sqlite_instance = self.MockSqlite.return_value
        self.mock_sqlite_instance.query = MagicMock()

        def side_effect(query, args=None):
            if query == "SELECT global_type_id, floor, center_x, center_y, center_z, x0, y0, z0, width, depth, height FROM aamks_geom WHERE type_pri='COMPA' and fire_model_ignore=0":
                return [OrderedDict([('global_type_id', 1), ('floor', '0'), ('center_x', 732), ('center_y', 752), ('center_z', 350), ('x0', 415), ('y0', 470), ('z0', 0), ('width', 635), ('depth', 565), ('height', 700)]),
                OrderedDict([('global_type_id', 2), ('floor', '0'), ('center_x', 1567), ('center_y', 942), ('center_z', 175), ('x0', 1050), ('y0', 470), ('z0', 0), ('width', 1035), ('depth', 945), ('height', 350)]),
                OrderedDict([('global_type_id', 3), ('floor', '0'), ('center_x', 2402), ('center_y', 1672), ('center_z', 175), ('x0', 1050), ('y0', 1415), ('z0', 0), ('width', 2705), ('depth', 515), ('height', 350)]),
                OrderedDict([('global_type_id', 6), ('floor', '1'), ('center_x', 1567), ('center_y', 942), ('center_z', 700), ('x0', 1050), ('y0', 470), ('z0', 350), ('width', 1035), ('depth', 945), ('height', 700)]),
                OrderedDict([('global_type_id', 7), ('floor', '1'), ('center_x', 2402), ('center_y', 1672), ('center_z', 525), ('x0', 1050), ('y0', 1415), ('z0', 350), ('width', 2705), ('depth', 515), ('height', 350)]),
                OrderedDict([('global_type_id', 9), ('floor', '2'), ('center_x', 2402), ('center_y', 1672), ('center_z', 875), ('x0', 1050), ('y0', 1415), ('z0', 700), ('width', 2705), ('depth', 515), ('height', 350)]),
                OrderedDict([('global_type_id', 10), ('floor', '2'), ('center_x', 2575), ('center_y', 942), ('center_z', 875), ('x0', 2085), ('y0', 470), ('z0', 700), ('width', 980), ('depth', 945), ('height', 350)])]

            if query == "SELECT center_x, center_y, center_z FROM aamks_geom WHERE type_pri='COMPA' AND global_type_id=7":
                return [OrderedDict([('center_x', 2402), ('center_y', 1672), ('center_z', 525)])]
            else:
                raise Exception("Unknown query: " + query)

        self.mock_sqlite_instance.query.side_effect = side_effect
        self.cfast100choice = CFAST100Choice()

    def tearDown(self):
        patch.stopall() # Stop patching after the test
        os.environ = self.old_environ # Restore original environment variables

    def test_get_100_closest_rooms(self):
        sorted = self.cfast100choice.get_100_closest_rooms(7)
        self.assertEqual(len(sorted), 7)
        self.assertEqual(sorted[0], (7, 0.0))
        self.assertEqual(sorted[1], (3, 350.0))
        self.assertEqual(sorted[6], (1, 1914.6605443263304))