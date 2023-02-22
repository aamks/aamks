from unittest import TestCase
from unittest.mock import patch
import pytest
import random
from evac.staircase import Queue, Staircase


class TestQueueCase(TestCase):
    @classmethod
    def setUp(self) -> None:
        self.q = Queue("Name", 2, 10)
        self.random_0 = random.Random(2) # = 0
        self.random_1 = random.Random(1) # = 1
    
    @patch('evac.staircase.random')
    def test_get_rand0(self, random):
        random.randint._mock_side_effect = self.random_0.randint
        assert self.q.get_rand() == 0

    @patch('evac.staircase.random')
    def test_get_rand1(self, random):
        random.randint._mock_side_effect = self.random_1.randint
        assert self.q.get_rand() == 1

    def test_incorrect_initial(self):
        with pytest.raises(TypeError) as e:
            q = Queue("Name", "1", "10")
        assert str(e.value) == "can't multiply sequence by non-int of type 'str'"
    
    def test_len_queue(self):
        "Added [None] of top queue to check upstream"
        assert len(self.q) == 20

    def test_add_to_empty_should_add(self):
        assert self.q[9] is None
        assert self.q.add(9, "added") == 1
        assert self.q[9] == "added"

    @patch('evac.staircase.random')
    def test_add_to_occupied_above_should_add(self, random):
        random.randint._mock_side_effect = self.random_0.randint
        self.q[10] = "agent"
        assert self.q[10] == "agent"  
        assert self.q[9] is None  
        assert self.q.add(9, "added") == 1
        assert self.q[9] == "added"
    
    @patch('evac.staircase.random')
    def test_add_to_occupied_above_should_not_add(self, random):
        random.randint._mock_side_effect = self.random_1.randint
        self.q[10] = "agent"
        assert self.q[10] == "agent"  
        assert self.q[9] is None  
        assert self.q.add(9, "added") == 0
        assert self.q[9] is None

    @patch('evac.staircase.random')
    def test_add_to_occupied_should_return(self, random):
        random.randint._mock_side_effect = self.random_0.randint
        self.q[9] = "agent"
        assert self.q[9] == "agent"  
        assert self.q.moved is False  
        assert self.q.add(9, "added") == 2
        assert self.q[9] == "agent"

    @patch('evac.staircase.random')
    def test_add_to_occupied_should_not_return(self, random):
        random.randint._mock_side_effect = self.random_1.randint
        self.q[10] = "agent" # [9] moved up because of insert 
        self.q.moved = True
        assert self.q.add(9, "added") == 0
        assert self.q[9] == None

    def test_insert(self):
        assert self.q.moved is False
        self.q.insert(9, "added")
        assert self.q[9] == "added"
        assert self.q.moved is True
        assert len(self.q) == 20+1

    def test_pop_with_None(self):
        assert len(self.q) == 20
        assert self.q[0] is None
        
        assert self.q.pop() is False
        assert len(self.q) == 20
    
    def test_pop_with_not_None(self):
        assert len(self.q) == 20
        self.q[0] = "agent"
        assert self.q[0] == "agent"
        
        assert self.q.pop() == "agent"
        assert len(self.q) == 20

    def test_pop_none_with_None(self):
        assert len(self.q) == 20
        assert self.q[0] is None
        
        assert self.q.pop_none() is True
        assert len(self.q) == 20
    
    def test_pop_none_with_not_None(self):
        assert len(self.q) == 20
        self.q[0] = "agent"
        assert self.q[0] == "agent"
        
        assert self.q.pop_none() is True
        assert len(self.q) == 20

    def test_pop_none_with_full_que(self):
        self.q.queue = list(range(21))
        assert len(self.q) == 21
        assert self.q.pop_none() is False

    def test_only_pop_with_None(self):
        assert len(self.q) == 20
        assert self.q[0] is None

        assert self.q.only_pop() is False
        assert len(self.q) == 20-1

    def test_only_pop_with_not_None(self):
        self.q[0] = "agent"
        assert len(self.q) == 20
        assert self.q[0] == "agent"

        assert self.q.only_pop() == "agent"
        assert len(self.q) == 20-1

    def test_can_move_in_next_step(self):
        self.q[9] = 'agent'
        assert self.q.can_move_in_next_step(9) == True

    def test_can_move_in_next_step_when_full(self):
        self.q.queue = list(range(9))
        assert self.q.can_move_in_next_step(9) == False
        
    def test_can_move_in_next_step_0(self):
        assert self.q.can_move_in_next_step(0) == True
class TestStaircaseCase(TestCase):
    @classmethod
    def setUp(self) -> None:
        self.stairs = Staircase(floors=2, number_queues=2, exits=1)
        self.q1, self.q2 = self.stairs.ques
        self.random_0 = random.Random(2) # = 0, 0, 0, 2, 1
        self.random_1 = random.Random(3) # = 1, 1, 2, 3, 0

    @patch('evac.staircase.random')
    def test_add_to_empty(self, random):
        random.randint._mock_side_effect = self.random_1.randint
        assert self.stairs.add_to_queues(1, "added_1") is True
        assert self.q1[9] == "added_1"
        assert self.stairs.add_to_queues(1, "added_2") is True
        assert self.q2[9] == "added_2"
        assert self.stairs.add_to_queues(1, "added_3") is False

    @patch('evac.staircase.random')
    def test_add_to_one_empty(self, random):
        random.randint._mock_side_effect = self.random_1.randint
        self.q1[9] = "agent"
        assert self.stairs.add_to_queues(1, "added") is True
        assert self.q2[9] == "added"
        assert self.stairs.add_to_queues(1, "added") is False

    @patch('evac.staircase.random')
    def test_add_to_occupied_not_moved(self, random):
        random.randint._mock_side_effect = self.random_0.randint
        self.q1[9] = "agent"
        self.q2[9] = "agent"
        assert self.q1.moved is False
        assert self.q2.moved is False
        assert self.stairs.insert < self.stairs.exits
        
        assert self.stairs.add_to_queues(1, "added") is True
        assert self.q1[9] == "added"
        assert self.q1[10] == "agent"
        assert len(self.q1) == 20+1
        assert self.q1.moved == True
        assert self.stairs.insert == self.stairs.exits
        assert self.stairs.add_to_queues(1, "added") is False

    @patch('evac.staircase.random')
    def test_add_to_occupied_one_moved(self, random):
        random.randint._mock_side_effect = self.random_0.randint
        self.q1.moved = True
        self.q2.moved = False
        self.q1[9+1] = "agent"
        self.q2[9] = "agent"
        
        assert self.stairs.add_to_queues(1, "added") is True
        assert self.q2[9] == "added"
        assert self.q2[10] == "agent"
        assert len(self.q2) == 20+1
        assert self.q2.moved == True
        assert self.stairs.add_to_queues(1, "added") is False
        assert len(self.q1) == 20

    @patch('evac.staircase.random')
    def test_add_to_occupied_moved(self, random):
        random.randint._mock_side_effect = self.random_0.randint
        self.q1.moved = True
        self.q2.moved = True
        self.q1[10] = "agent"
        self.q2[10] = "agent"
        
        assert self.stairs.add_to_queues(1, "added") is False
        assert self.q1[10] == "agent"
        assert self.q2[10] == "agent"
        assert len(self.q1) == 20
        assert len(self.q2) == 20

    @patch('evac.staircase.random')
    def test_add_to_occupied_one_above_not_moved(self, random):
        random.randint._mock_side_effect = self.random_1.randint
        self.q1[9] = "agent"
        self.q1[10] = "agent"

        assert self.stairs.add_to_queues(1, "added") is True
        assert self.q2[9] == "added"
  
    @patch('evac.staircase.random')
    def test_add_to_occupied_one_above_moved(self, random):
        random.randint._mock_side_effect = self.random_0.randint
        self.q1[9] = "agent"
        self.q1.moved = True

        assert self.stairs.add_to_queues(1, "added") is True
        assert self.q1[9] == "agent"
        assert self.q2[9] == "added"

    @patch('evac.staircase.random')
    def test_add_to_two_occupied_one_above(self, random):
        random.randint._mock_side_effect = self.random_0.randint 
        self.q1[9] = "agent"
        self.q1[10] = "agent"
        self.q2[9] = "agent"

        assert self.stairs.add_to_queues(1, "added") is True
        assert self.q1[9] == "agent"
        assert self.q1[10] == "agent"
        assert self.q2[9] == "added"
        assert self.q2[10] == "agent"
        
    def test_sort_ques_not_changed(self):
        queue = self.stairs.sort_ques(1)
        assert queue[0] == self.q1
        assert queue[1] == self.q2

    def test_sort_ques_one_moved(self):
        self.q1.moved = True

        queue = self.stairs.sort_ques(1)
        assert queue[0] == self.q2
    
    def test_sort_ques_all(self):
        q3, q4, q5, q6, q7, q8 = [Queue(f'q{x}', 2, 10) for x in range(6)]
        self.q2.moved = True
        q3[10] = "agent"
        q4[10] = "agent"
        q4.moved = True
        q5[9] = "agent"
        q6[9] = "agent"
        q6[10] = "agent"
        q7[9] = "agent"
        q7.moved = True
        q8[9] = "agent"
        q8[10] = "agent"
        q8.moved = True
        self.stairs.ques = [q8, q7, q6, q5, q4, q3, self.q2, self.q1]

        sorted = self.stairs.sort_ques(9)
        assert sorted[0] == self.q1
        assert sorted[1] == self.q2
        assert sorted[2] == q3
        assert sorted[3] == q4
        assert sorted[4] == q5
        assert sorted[5] == q6
        assert sorted[6] == q7
        assert sorted[7] == q8

    def test_move_one_exit_not_moved(self):
        self.q1.get_in(0, 'agent')
        self.q1.get_in(5, 'agent')
        self.q2.get_in(0, 'agent')
        self.q2.get_in(5, 'agent')
        
        self.stairs.move()
        assert self.q1[0] == None
        assert self.q1[4] == 'agent'
        assert self.q2[0] == 'agent'
        assert self.q2[4] == 'agent'
        assert len(self.q1) == 20
        assert len(self.q2) == 20

    def test_move_one_exit_one_moved(self):
        self.q1.moved = True
        self.q1.get_in(0, 'agent')
        self.q1.get_in(5, 'agent')
        self.q2.get_in(0, 'agent')
        self.q2.get_in(5, 'agent')
        
        self.stairs.move()
        assert self.q1[0] == None
        assert self.q1[4] == 'agent'
        assert self.q1.moved == False
        assert self.q2[0] == 'agent'
        assert self.q2[4] == 'agent'
        assert len(self.q1) == 20-1
        assert len(self.q2) == 20

    def test_move_one_exit_two_moved(self):
        self.q1.moved = True
        self.q1.get_in(0, 'agent')
        self.q1.get_in(5, 'agent')
        self.q2.moved = True
        self.q2.get_in(0, 'agent')
        self.q2.get_in(5, 'agent')
        
        self.stairs.move()
        assert self.q1[0] == None
        assert self.q1[4] == 'agent'
        assert self.q1.moved == False
        assert self.q2[0] == 'agent'
        assert self.q2[4] == 'agent'
        assert self.q2.moved == False
        assert len(self.q1) == 20-1
        assert len(self.q2) == 20-1
    @patch('evac.staircase.random')
    def test_entrance(self, random):
        random.randint._mock_side_effect = self.random_0.randint
        assert self.stairs.is_accessible_entrance(0) == True
        assert self.stairs.add_to_queues(0, "1") == True
        assert self.stairs.is_accessible_entrance(0) == True
        assert self.stairs.add_to_queues(0, "2") == True
        assert self.stairs.is_accessible_entrance(0) == True
        assert self.stairs.add_to_queues(0, "3") == True
        assert self.stairs.is_accessible_entrance(0) == False
        assert self.stairs.add_to_queues(0, "0") == False
        assert self.stairs.is_accessible_entrance(1) == True
        assert self.stairs.add_to_queues(1, "4") == True
        assert self.stairs.is_accessible_entrance(1) == True
        assert self.stairs.add_to_queues(1, "5") == True
        assert self.stairs.is_accessible_entrance(1) == False
        assert self.stairs.add_to_queues(1, "0") == False
        assert self.stairs.is_accessible_entrance(2) == True
        assert self.stairs.add_to_queues(2, "6") == True
        assert self.stairs.is_accessible_entrance(2) == True
        assert self.stairs.add_to_queues(2, "7") == True
        assert self.stairs.is_accessible_entrance(2) == False
        assert self.stairs.add_to_queues(2, "0") == False

    # @pytest.fixture
    # def example_people_data():
    #     return [
    #         {
    #             "given_name": "Alfonsa",
    #             "family_name": "Ruiz",
    #             "title": "Senior Software Engineer",
    #         }
    #     ]

    # def test_format_data_for_display(self, example_people_data):
    #     assert self.format_data_for_display(example_people_data) == [
    #         "Alfonsa Ruiz: Senior Software Engineer",
    #     ]

    # @pytest.mark.parametrize("maybe_palindrome, expected_result", [
    #     ("", True),
    #     ("a", True),
    #     ("Bob", True),
    #     ("abc", False),
    #     ("abab", False),
    # ])
    # def test_is_palindrome(maybe_palindrome, expected_result):
    #     assert is_palindrome(maybe_palindrome) == expected_result
