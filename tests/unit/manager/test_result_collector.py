from unittest import TestCase
from manager.results_collector import ResultsCollector


class TestEvacuee(TestCase):
    @classmethod
    def setUp(cls) -> None:
        cls.ResultCollector = ResultsCollector(1)

    def test_read_json(self):
        expected_id = 4
        id = self.cfast_mcarlo.read_json()
        self.assertEqual(expected_id, id)

