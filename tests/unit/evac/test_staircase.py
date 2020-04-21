from unittest import TestCase
from evac.staircase import Queue
from evac.staircase import Staircase
from matplotlib import pyplot as plt

class TestStairCase(TestCase):
    @classmethod
    def setUp(cls) -> None:
        cls.staircase = Staircase(name='S1', floors=9, number_queues=2, doors=1, width=500, height=2965/3, offsetx=1500, offsety=0)

    def test_create_queues(self):
        x = self.staircase.create_queues()
        print(x)

    def test_create_floor_positions(self):
        d = self.staircase.create_floor_positions(0)
        x, y = zip(*d)
        plt.plot(x, y, 'o')
        plt.show()
        print(x)

    def test_create_positions(self):
        d = self.staircase.create_positions()
        x, y = zip(*d)
        plt.plot(x, y, 'o')
        plt.show()

    def test_add_to_queues(self):
        x = self.staircase.add_to_queues(2, "e1")
        self.assertTrue(x)
        is_in_queue = self.staircase.check_if_in("e1")
        self.assertIsInstance(is_in_queue, list)
        x = self.staircase.add_to_queues(2, "e1")
        self.assertTrue(x)
        expected_in_queue = 1
        actual_in_queue = self.staircase.total_number_of_people()
        self.assertEqual(actual_in_queue, expected_in_queue)
        x = self.staircase.add_to_queues(2, "e2")
        self.assertTrue(x)
        expected_in_queue = 2
        actual_in_queue = self.staircase.total_number_of_people()
        self.assertEqual(actual_in_queue, expected_in_queue)

    def test_move(self):
        self.staircase.add_to_queues(2, "e1")
        self.staircase.show_status()
        self.staircase.move()
        is_in_queue = self.staircase.check_if_in("e1")
        print(is_in_queue)
        self.staircase.show_status()
        self.staircase.move()
        is_in_queue = self.staircase.check_if_in("e1")
        print(is_in_queue)
        self.staircase.show_status()
