from evac.evacuee import Evacuee
import logging

#logging.basicConfig(filename='aamks.log', level=logging.DEBUG,
                        #format='%(asctime)s %(levelname)s: %(message)s')


class Evacuees:
    def __init__(self):
        self.pedestrians = []



    def add_pedestrian(self, pedestrian):
        assert isinstance(pedestrian, Evacuee), "%pedestrian is not Pedestrian class object"
        self.pedestrians.append(pedestrian)

    def get_number_of_pedestrians(self) -> int:
        return len(self.pedestrians)

    def set_speed_to_pedestrian(self, ped_no, speed):
        assert isinstance(ped_no, int), "%ped_no is not an integer"
        assert isinstance(speed, float), "% origin is not a float type"
        self.pedestrians[ped_no].speed = speed

    def get_speed_of_pedestrian(self, ped_no):
        assert isinstance(ped_no, int), '%ped_no is not an integer'
        return self.pedestrians[ped_no].speed

    def get_speed_max_of_pedestrian(self, ped_no):
        assert isinstance(ped_no, int), '%ped_no is not an integer'
        return self.pedestrians[ped_no].max_speed

    def get_origin_of_pedestrian(self, ped_no):
        assert isinstance(ped_no, int), '%ped_no is not an integer'
        return self.pedestrians[ped_no].origin

    def set_origin_to_pedestrian(self, ped_no, origin):
        assert isinstance(ped_no, int), "%ped_no is not an integer"
        assert isinstance(origin, tuple), "% origin is not a tuple type"
        self.pedestrians[ped_no].origin = origin

    def get_roadmap_of_pedestrian(self, ped_no):
        assert isinstance(ped_no, int), '%ped_no is not an integer'
        return self.pedestrians[ped_no].roadmap

    def set_roadmap_to_pedestrian(self, ped_no, roadmap):
        assert isinstance(ped_no, int), "%ped_no is not an integer"
        assert isinstance(roadmap, list), "%roadmap is not a list"
        self.pedestrians[ped_no].roadmap = roadmap

    def get_pre_evacuation_time_of_pedestrian(self, ped_no):
        assert isinstance(ped_no, int), '%ped_no is not an integer'
        return self.pedestrians[ped_no].pre_evacuation_time

    def set_pre_evacuation_time_to_pedestrian(self, ped_no, pre_evacuation_time):
        """

        :type pre_evacuation_time: float
        """
        assert isinstance(ped_no, int), "%ped_no is not an integer"
        assert isinstance(pre_evacuation_time, float), "%pre_evacuation_time is not a float"
        self.pedestrians[ped_no].pre_evacuation_time = pre_evacuation_time

    def get_velocity_of_pedestrian(self, ped_no):
        assert isinstance(ped_no, int), '%ped_no is not an integer'
        return self.pedestrians[ped_no].velocity

    def set_velocity_to_pedestrian(self, ped_no, velocity):
        """

        :type velocity: float
        """
        assert isinstance(ped_no, int), "%ped_no is not an integer"
        assert isinstance(velocity, tuple), "%pre_evacuation_time is not a float"
        self.pedestrians[ped_no].velocity = velocity

    def calculate_pedestrian_velocity(self, ped_no, current_time):
        assert isinstance(ped_no, int), '%ped_no is not an integer'
        self.pedestrians[ped_no].calculate_velocity(current_time)

    def set_position_to_pedestrian(self, ped_no: int, position: tuple) -> None:
        """

        :type position: tuple
        """
        assert isinstance(ped_no, int), "%ped_no is not an integer"
        assert isinstance(position, tuple), "%position is not a list"
        self.pedestrians[ped_no].position = position

    def get_position_of_pedestrian(self, ped_no):
        assert isinstance(ped_no, int), '%ped_no is not an integer'

        return self.pedestrians[ped_no].position

    def get_focus_of_pedestrian(self, ped_no):
        assert isinstance(ped_no, int), '%ped_no is not an integer'
        #logging.info('Evacuee {} at position'.format(ped_no))
        return self.pedestrians[ped_no].focus

    def update_state(self, ped_no: int, visible: bool) -> object:
        assert isinstance(ped_no, int), '%ped_no is not an integer'
        return self.pedestrians[ped_no].update_state(visible, ped_no)

    def get_first_evacuees_time(self):
        pre_evacuation_times = [self.pedestrians[i].pre_evacuation_time for i in range(len(self.pedestrians))]
        return round(min(pre_evacuation_times), 2)

    def update_speed_of_pedestrian(self, ped_no, optical_density):
        self.pedestrians[ped_no].update_speed(optical_density)

    def update_fed_of_pedestrian(self, ped_no, fed):
        self.pedestrians[ped_no].update_fed(fed)

    def get_fed_of_pedestrian(self, ped_no):
        assert isinstance(ped_no, int), '%ped_no is not an integer'
        return self.pedestrians[ped_no].fed

    def get_finshed_of_pedestrian(self, ped_no):
        assert isinstance(ped_no, int), '%ped_no is not an integer'
        return self.pedestrians[ped_no].finished
