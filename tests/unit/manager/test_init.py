import os
import json
from unittest import TestCase
from manager.init import OnInit
from unittest.mock import patch, MagicMock, call, PropertyMock
from freezegun import freeze_time

class TestOnInit(TestCase):
    def setUp(self) -> None:
        self.MockPsql = patch('include.Psql').start()
        self.MockJson = patch('manager.init.Json').start()
        self.mock_json_instance = self.MockJson.return_value
        self.mock_json_instance.read.return_value = json.loads('{"project_id": 1, "scenario_id": 3, "number_of_simulations": 2,  "animations_number": 1}')
        self.mock_psql_instance = self.MockPsql.return_value
        self.mock_psql_instance.query = MagicMock()
        self.call_insert = 0
        def side_effect(query, args=None):
            if query == "SELECT max(iteration)+1 FROM simulations WHERE project=1 AND scenario_id=3 AND host IS NOT NULL":
                return [[11]]
            if query.startswith("INSERT INTO simulations(iteration,project,scenario_id,job_id,is_anim"):
                if self.call_insert == 0:
                    self.call_insert += 1
                    return self.test_insert(1, args)
                else:
                    return self.test_insert(2, args)
            else:
                raise Exception("Unknown query: " + query)
                                
        self.mock_psql_instance.query.side_effect = side_effect

    @freeze_time("2024-01-01")
    def test_init(self):
        self.on_init = OnInit()
        folder_1 = f'{os.environ["AAMKS_PROJECT"]}/workers/11'
        folder_2 = f'{os.environ["AAMKS_PROJECT"]}/workers/12'
        self.assertTrue(os.path.exists(folder_1))
        self.assertTrue(os.path.exists(folder_2))

        
    def test_insert(self, attempt=1, args=(11, 1, 3, '20240101-00:00:00.000000_11', 1)):
        if attempt == 1:
            expected = (11, 1, 3, '20240101-00:00:00.000000_11', 1)
        else:
            expected = (12, 1, 3, '20240101-00:00:00.000000_12', 0)
        self.assertEqual(args, expected)