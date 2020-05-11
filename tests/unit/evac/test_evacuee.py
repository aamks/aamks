from unittest import TestCase
from evac.evacuee import Evacuee


class TestEvacuee(TestCase):
    @classmethod
    def setUp(cls) -> None:
        cls.evacuee = Evacuee(origin=tuple([1486, 594]), v_speed=80.96, h_speed=132.23, pre_evacuation=30.18,
                              alpha_v=0.81, beta_v=-0.06,
                              node_radius=90)

    def test_update_fed(self):
        """Fed should be updated correctly"""
        increment = 3.0
        fed_before_increment = self.evacuee.fed
        self.evacuee.update_fed(increment)
        self.assertTrue(self.evacuee.max_speed, fed_before_increment + increment)

    def test_update_fed_throw_exception(self):
        """Update fed should throw exception when fed is not float"""
        with self.assertRaises(AssertionError):
            self.evacuee.update_fed(1)

    def test_update_thermal_injury(self):
        new_thermal_injury = 1.0
        self.evacuee.update_thermal_injury(new_thermal_injury)
        self.assertTrue(self.evacuee.thermal_injury, new_thermal_injury)

    def test_update_thermal_injury_throw_exception(self):
        """Update thermal_injury should throw exception when thermal_injury is not float"""
        with self.assertRaises(AssertionError):
            self.evacuee.update_thermal_injury(1)

    def test_set_goal_distance_over_50(self):
        goal = [[100, 100], [200, 200]]
        self.evacuee.set_goal(goal)

        expected_goal = [200, 200]
        self.assertEqual(self.evacuee.finished, 1)
        self.assertEqual(self.evacuee.goal, expected_goal)

    def test_set_goal_distance_under_50(self):
        goal = [[100, 100], [1480, 600]]
        self.evacuee.set_goal(goal)

        expected_goal = [100, 100]
        self.assertEqual(self.evacuee.finished, 0)
        self.assertEqual(self.evacuee.goal, expected_goal)

    def test_set_goal_throw_exception(self):
        """Set goal should throw exception when goal is not list"""
        with self.assertRaises(AssertionError):
            self.evacuee.set_goal(1)

    def test_calculate_velocity(self):
        """Velocity should be not 0 when speed is not 0 """
        current_time = 40
        self.evacuee.goal = [1500, 700]
        self.evacuee.speed = 2
        self.evacuee.calculate_velocity(current_time)

        self.assertIsNot(self.evacuee.velocity, (0, 0))

    def test_calculate_velocity_when_speed_is_0(self):
        """Velocity should be 0 when speed is 0 """
        current_time = 40
        self.evacuee.goal = [1500, 700]
        self.evacuee.speed = 0
        self.evacuee.calculate_velocity(current_time)
        self.assertEqual(self.evacuee.velocity, (0, 0))

    def test_update_speed(self):
        # It should be refactor to setter  -> currently is probably bug, class field optical_density_at_position is
        # always None
        self.evacuee.optical_density_at_position = 1

        self.evacuee.update_speed()
        expected_speed = 132.23
        self.assertEqual(self.evacuee.max_speed, expected_speed)

    def test_update_speed_should_be_update_beta_v(self):
        """Update speed should update beta_v if beta_v = 0  """
        #As above
        self.evacuee.optical_density_at_position = 1

        self.evacuee.beta_v = 0
        self.evacuee.update_speed()

        expected_beta_v = 0.00000001
        self.assertEqual(self.evacuee.beta_v, expected_beta_v)
