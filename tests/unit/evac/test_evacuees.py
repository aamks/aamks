from unittest import TestCase
from evac.evacuees import Evacuees
from evac.evacuee import Evacuee


class TestEvacuees(TestCase):

    @classmethod
    def setUp(cls) -> None:
        cls.evacuees = Evacuees()
        cls.fake_id = 1.0

    def test_add_pedestrian(self):
        self.add_one_pedestrian_to_array()
        count = self.evacuees.get_number_of_pedestrians()
        self.assertEqual(count, 1)

    def add_one_pedestrian_to_array(self):
        pedestrian = self.get_real_pedestrian()
        self.evacuees.add_pedestrian(pedestrian)

    def get_real_pedestrian(self):
        return Evacuee(origin=tuple([1486, 594]), v_speed=80.96, h_speed=132.23, pre_evacuation=30.18,
                       alpha_v=0.81, beta_v=-0.06,
                       node_radius=90)

    def test_add_pedestrian_throw_exception_when_pedestrian_is_not_Evacuee(self):
        fake_pedestrian = ""
        with self.assertRaises(AssertionError):
            self.evacuees.add_pedestrian(fake_pedestrian)

    def test_get_number_of_pedestrians(self):
        empty_len = self.evacuees.get_number_of_pedestrians()
        self.add_one_pedestrian_to_array()
        none_empty = self.evacuees.get_number_of_pedestrians()

        self.assertEqual(empty_len, 0)
        self.assertEqual(none_empty, 1)

    def test_set_and_get_speed_of_pedestrian(self):
        self.add_one_pedestrian_to_array()
        expected_speed = 132.23
        self.evacuees.set_speed_to_pedestrian(0, expected_speed)
        speed = self.evacuees.get_speed_of_pedestrian(0)
        self.assertEqual(expected_speed, speed)

    def test_set_and_get_speed_of_pedestrian_should_throw_exception_when_incompatible_type(self):
        with self.assertRaises(AssertionError):
            self.evacuees.set_speed_to_pedestrian(1.0, 1.0)

        with self.assertRaises(AssertionError):
            self.evacuees.set_speed_to_pedestrian(1, 1)

        with self.assertRaises(AssertionError):
            self.evacuees.get_speed_of_pedestrian(1.0)

    def test_set_and_get_speed_max_of_pedestrian(self):
        self.add_one_pedestrian_to_array()
        expected_speed = 132.23
        self.evacuees.set_speed_to_pedestrian(0, expected_speed)
        max_speed = self.evacuees.get_speed_max_of_pedestrian(0)
        self.assertEqual(expected_speed, max_speed)

    def test_set_and_get_speed_max_of_pedestrian_should_throw_exception_when_incompatible_type(self):
        with self.assertRaises(AssertionError):
            self.evacuees.set_speed_to_pedestrian(1.0, 1.0)

        with self.assertRaises(AssertionError):
            self.evacuees.set_speed_to_pedestrian(1, 1)

        with self.assertRaises(AssertionError):
            self.evacuees.get_speed_of_pedestrian(1.0)

    def test_set_and_get_origin_of_pedestrian(self):
        test_origin = ("t1", "t2", "t3")
        self.add_one_pedestrian_to_array()
        self.evacuees.set_origin_to_pedestrian(0, test_origin)
        origin = self.evacuees.get_origin_of_pedestrian(0)
        self.assertEqual(test_origin, origin)

    def test_set_and_get_origin_of_pedestrian_should_throws_exception_when_incompatible_type(self):
        test_tuple = ("test", "test")
        with self.assertRaises(AssertionError):
            self.evacuees.set_origin_to_pedestrian(1.0, test_tuple)

        with self.assertRaises(AssertionError):
            self.evacuees.set_origin_to_pedestrian(1, "")

        with self.assertRaises(AssertionError):
            self.evacuees.get_origin_of_pedestrian(self.fake_id)

    def test_set_and_get_goal_of_pedestrian(self):
        self.add_one_pedestrian_to_array()
        set_goal = [[100, 100], [1480, 600]]
        expected_goal = [100, 100]
        self.evacuees.set_goal(0, set_goal)
        goal = self.evacuees.get_goal(0)
        self.assertEqual(expected_goal, goal)

    def test_set_and_get_goal_should_throw_exception_when_incompatible_type(self):
        test_goal = [[100, 100], [1480, 600]]
        with self.assertRaises(AssertionError):
            self.evacuees.set_goal(self.fake_id, test_goal)

        with self.assertRaises(AssertionError):
            self.evacuees.set_origin_to_pedestrian(1, "")

        with self.assertRaises(AssertionError):
            self.evacuees.get_origin_of_pedestrian(self.fake_id)

    def test_set_roadmap_to_pedestrian(self):
        test_list = ["t1", "t2"]
        self.add_one_pedestrian_to_array()
        self.evacuees.set_roadmap_to_pedestrian(0, test_list)

        self.assertEqual(self.evacuees.pedestrians[0].roadmap, test_list)

    def test_set_roadmap_to_pedestrian_should_throw_exception_when_incompatible_type(self):
        test_list = ["t1", "t2"]
        with self.assertRaises(AssertionError):
            self.evacuees.set_goal(self.fake_id, test_list)

        with self.assertRaises(AssertionError):
            self.evacuees.set_origin_to_pedestrian(1, "")

        with self.assertRaises(AssertionError):
            self.evacuees.get_origin_of_pedestrian(self.fake_id)

    def test_set_and_get_pre_evacuation_time_of_pedestrian(self):
        test_evac_time = 20.1
        self.add_one_pedestrian_to_array()
        self.evacuees.set_pre_evacuation_time_to_pedestrian(0, test_evac_time)

        self.assertEqual(test_evac_time, self.evacuees.get_pre_evacuation_time_of_pedestrian(0))

    def test_set_and_get_pre_evacuation_time_to_pedestrian_should_throw_exception_when_incompatible_type(self):
        with self.assertRaises(AssertionError):
            self.evacuees.set_pre_evacuation_time_to_pedestrian(self.fake_id, 20.0)

        with self.assertRaises(AssertionError):
            self.evacuees.set_pre_evacuation_time_to_pedestrian(1, "")

        with self.assertRaises(AssertionError):
            self.evacuees.get_pre_evacuation_time_of_pedestrian(self.fake_id)

    def test_set_and_get_velocity_of_pedestrian(self):
        velocity = (20.1, 20.2)
        self.add_one_pedestrian_to_array()
        self.evacuees.set_velocity_to_pedestrian(0, velocity)

        self.assertEqual(velocity, self.evacuees.get_velocity_of_pedestrian(0))

    def test_set_and_get_velocity_to_pedestrian_should_throw_exception_when_incompatible_type(self):
        with self.assertRaises(AssertionError):
            self.evacuees.set_velocity_to_pedestrian(self.fake_id, 20.0)

        with self.assertRaises(AssertionError):
            self.evacuees.set_velocity_to_pedestrian(1, "")

        with self.assertRaises(AssertionError):
            self.evacuees.get_velocity_of_pedestrian(self.fake_id)

    def test_calculate_pedestrian_velocity(self):
        current_time = 20
        expected_velocity = (0, 0)
        self.add_one_pedestrian_to_array()
        # TODO investigate bugs
        self.evacuees.pedestrians[0].optical_density_at_position = 1
        self.evacuees.pedestrians[0].goal = [100, 100]
        self.evacuees.calculate_pedestrian_velocity(0, current_time)

        self.assertEqual(expected_velocity, self.evacuees.get_velocity_of_pedestrian(0))

    def test_set_and_get_position_to_pedestrian(self):
        position = (20.0, 30.0)
        self.add_one_pedestrian_to_array()
        self.evacuees.set_position_to_pedestrian(0, position)

        self.assertEqual(position, self.evacuees.get_position_of_pedestrian(0))

    def test_set_and_get_position_of_pedestrian_should_throw_exception_when_incompatible_type(self):
        with self.assertRaises(AssertionError):
            self.evacuees.set_velocity_to_pedestrian(self.fake_id, "")

        with self.assertRaises(AssertionError):
            self.evacuees.set_velocity_to_pedestrian(1, "")

        with self.assertRaises(AssertionError):
            self.evacuees.get_velocity_of_pedestrian(self.fake_id)

    def test_set_and_get_exit_door(self):
        exit_doors = ["d1", "d2"]
        self.add_one_pedestrian_to_array()
        self.evacuees.set_exit_door(0, exit_doors)

        self.assertEqual(exit_doors, self.evacuees.get_exit_door(0))

    def test_set_and_get_exit_door_should_throw_exception_when_incompatible_type(self):
        exit_doors = ["d1", "d2"]
        with self.assertRaises(AssertionError):
            self.evacuees.set_exit_door(self.fake_id, exit_doors)

        with self.assertRaises(IndexError):
            self.evacuees.set_exit_door(1, "")

        with self.assertRaises(AssertionError):
            self.evacuees.get_exit_door(self.fake_id)

    def test_mark_exit_as_blocked(self):
        exit_doors = ["d1", "d2"]
        self.add_one_pedestrian_to_array()
        self.evacuees.mark_exit_as_blocked(0, exit_doors)

        list_exit_doors = self.evacuees.get_blocked_exits(0)
        self.assertEqual(1, len(list_exit_doors))

    def test_clear_blocked_exits(self):
        exit_doors = ["d1", "d2"]
        self.add_one_pedestrian_to_array()
        self.evacuees.mark_exit_as_blocked(0, exit_doors)

        self.evacuees.clear_blocked_exits(0)
        self.assertEqual(0, len(self.evacuees.get_blocked_exits(0)))

    def test_set_optical_density(self):
        optical_density = 0.1
        self.add_one_pedestrian_to_array()
        self.evacuees.set_optical_density(0, optical_density)

        self.assertEqual(optical_density, self.evacuees.pedestrians[0].optical_density_at_position)

    def test_set_optical_density_should_throw_exception_when_incompatible_type(self):
        optical_density = 0.1
        with self.assertRaises(AssertionError):
            self.evacuees.set_optical_density(self.fake_id, optical_density)

    def test_get_first_evacuees_time(self):
        self.add_one_pedestrian_to_array()
        time = self.evacuees.get_first_evacuees_time()

        self.assertEqual(30.18, time)
    # probably bug
    # def test_update_speed_of_pedestrian(self):
    #     self.add_one_pedestrian_to_array()
    #     self.evacuees.update_speed_of_pedestrian(0)
    #     speed = self.evacuees.pedestrians[0].speed
    #
    #     self.assertEqual(0.0, speed)

    def test_update_fed_of_pedestrian_and_get_fed(self):
        expected_fed = 2.0
        self.add_one_pedestrian_to_array()
        self.evacuees.update_fed_of_pedestrian(0, expected_fed)

        self.assertEqual(expected_fed, self.evacuees.get_fed_of_pedestrian(0))

    def test_set_finish_to_agent(self):
        self.add_one_pedestrian_to_array()
        self.evacuees.set_finish_to_agent(0)

        self.assertEqual(0, self.evacuees.get_finshed_of_pedestrian(0))

    def test_set_num_of_obstacle_neighbours(self):
        neighbours = 2
        self.add_one_pedestrian_to_array()
        self.evacuees.set_num_of_obstacle_neighbours(0, neighbours)

        self.assertEqual(neighbours, self.evacuees.pedestrians[0].num_of_obstacle_neighbours)

    def test_set_num_of_orca_lines(self):
        lines = 2
        self.add_one_pedestrian_to_array()
        self.evacuees.set_num_of_obstacle_neighbours(0, lines)

        self.assertEqual(lines, self.evacuees.pedestrians[0].num_of_obstacle_neighbours)
