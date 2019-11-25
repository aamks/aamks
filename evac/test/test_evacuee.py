import unittest
from unittest import TestCase

from evacuee import Evacuee


# python3 -m unittest discover

class TestEvacuee(unittest.TestCase):
    @classmethod
    def setUp(cls) -> None:
        cls.evacuee = Evacuee(origin=tuple([1486, 594]), v_speed=80.96, h_speed=132.23, pre_evacuation=30.18,
                              alpha_v=0.81, beta_v=-0.06,
                              node_radius=90)

    def test_update_fed(self):
        increment = 3.0
        max_speed_before_increment = self.evacuee.max_speed
        self.evacuee.update_fed(increment)
        self.assertTrue(self.evacuee.max_speed, max_speed_before_increment + increment)

    def test_update_fed_throw_exception(self):
        with self.assertRaises(AssertionError):
            self.evacuee.update_fed(1)

    def test_update_thermal_injury(self):
        self.evacuee.update_thermal_injury(1.0)
        self.assertTrue(self.evacuee.thermal_injury, 1.0)

    def test_update_thermal_injury_throw_exception(self):
        with self.assertRaises(AssertionError):
            self.evacuee.update_thermal_injury(1)

    # TODO What is goal ? example values needed
    def test_set_goal(self):
        self.fail()

    def test_calculate_velocity(self):
        self.fail()

    def test_update_speed_for_large_density_speed_should_be_calculate(self):
        self.fail()

    def test_update_speed_for_low_density_speed_should_be_decrease(self):
        self.fail()

    def test_calculate_max_speed_for_extinction(self):
        self.fail()


if __name__ == '__main__':
    unittest.main()
