from unittest import TestCase
from redis_aamks.manager import RedisManager


class TestEvacuee(TestCase):
    @classmethod
    def setUp(cls) -> None:
        cls.ResultCollector = RedisManager()

    def test_read_json(self):
        expected_id = 4
        id = self.cfast_mcarlo.read_json()
        self.assertEqual(expected_id, id)

