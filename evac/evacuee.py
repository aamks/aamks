from operator import sub
from math import sqrt
import logging
from scipy.spatial.distance import cdist
from evac.compartment import Compartment
from typing import List, Optional
from evac.exit import CompartmentExit, RoomGoalExit, Teleport, TermianlDoorExit

class Evacuee:

    def __init__(self, origin: tuple, v_speed, h_speed, pre_evacuation, detection_constituents, detection_compa,
                 alpha_v, beta_v, node_radius, type, current_floor, reset_behavior_due_to_panic, id) -> None:
        """

        :type origin: tuple
        :type roadmap: list
        """

        self.origin = origin
        self.goal = None
        self.blocked_exits = list()
        self.fed = 0
        self.dfed = 0
        self.symbolic_fed = 'N'
        self.prev_symbolic_fed = 'N'
        self.previous_step_fed = 0
        self.distance = 1
        self.velocity = (0, 0)
        self.speed = 0
        self.thermal_injury = 0
        self.position = origin
        self.prev_position = (0, 0)
        self.finished = 1
        self.node_radius = node_radius
        self.pre_evacuation_time = pre_evacuation
        self.detection_constituents = detection_constituents
        self.detection_compa = detection_compa
        self.optical_density_at_position = 0.0
        self.unique_agent_id_on_different_floors = None

        self.alpha_v = alpha_v
        self.beta_v = beta_v
        self.max_speed = h_speed
        self.num_of_obstacle_neighbours = 0
        self.num_of_orca_lines = 0
        self.agent_has_no_escape = False
        self.exit = None
        self.path = None
        
        self.type = type
        self.leader = None
        self.current_floor = current_floor
        self.prev_floor = current_floor
        self.id = id
        self.current_compartment: Compartment = None
        # it resets moving behaviour due to smoke in next room or 
        # people running towards us (due to the fire that is further away)
        self.reset_behavior_due_to_panic = reset_behavior_due_to_panic
    def __getattr__(self, name):
        return self.__dict__[name]

    def __setattr__(self, key, value):
        self.__dict__[key] = value

    def update_fed(self, dfed):
        assert isinstance(dfed, float), '%fed is not required type float'
        self.dfed = dfed
        self.fed += dfed
        return self.fed

    def update_thermal_injury(self, thermal_injury):
        assert isinstance(thermal_injury, float), '%thermal_injury is not a float'
        self.thermal_injury = thermal_injury


    def set_position_to_pedestrian(self, position: tuple):
        """
        :type position: tuple
        """
        assert isinstance(position, tuple), "%position is not a list"
        self.position = position

    def get_teleport_reached_by_agent(self, current_floor_teleports):
        for teleport in current_floor_teleports:
            if cdist([tuple([teleport['center_x'], teleport['center_y']])], [self.position], 'euclidean') < 130:
                return [teleport['center_x'], teleport['center_y']]
        return None


    def has_agent_reached_teleport(self):
        if not isinstance(self.exit, Teleport):
            return
        dist = cdist([self.position], [(self.exit.x,self.exit.y)], 'euclidean')
        if dist < 50:
            self.finished = 0
            return True
        return False

    def check_if_agent_reached_outside_door(self):

        if not (isinstance(self.exit, TermianlDoorExit) or isinstance(self.exit, CompartmentExit)or isinstance(self.exit, RoomGoalExit)):
            return

        is_terminal = self.exit.is_terminal()
        dist = cdist([self.position], [(self.exit.x_direction,self.exit.y_direction)], 'euclidean')

        if dist < 50 and is_terminal:
            self.finished = 0
            return True
        if self.current_compartment.name == 'outside':
            self.finished = 0
            return True

        return False

    def set_goal(self, navmesh_path):
        if navmesh_path is None:
            self.goal = None
            return
        if self.agent_has_no_escape == 1:
            return

        if isinstance(self.exit, Teleport):
            exit_coordinates = (self.exit.x,self.exit.y)
        elif isinstance(self.exit, TermianlDoorExit) or isinstance(self.exit, CompartmentExit) or isinstance(self.exit, RoomGoalExit):
            exit_coordinates = (self.exit.x_direction,self.exit.y_direction)
        elif self.exit == 'follow_leader':
            exit_coordinates = self.leader.position
        else:
            raise Exception('self.exit has inappropriate class')

        dist_last_navmesh_point = cdist([self.position], [navmesh_path[-1]], 'euclidean')
        dist_first_navmesh_point = cdist([self.position], [navmesh_path[0]], 'euclidean')
        dist_coordinates = cdist([self.position], [exit_coordinates], 'euclidean')
        if ((dist_coordinates < 50 or dist_last_navmesh_point < 50) and dist_first_navmesh_point > 0.001):
            self.goal = [int(navmesh_path[0][0]), int(navmesh_path[0][1])]
        else:
            try:
                self.goal = [int(navmesh_path[1][0]), int(navmesh_path[1][1])]
            except:
                self.goal = [int(navmesh_path[0][0]), int(navmesh_path[0][1])]


    def calculate_velocity(self, current_time):
        if self.goal is None:
            self.velocity = (0, 0)
            return
        self.unnorm_vector = tuple(map(sub, self.goal, self.position))
        self.distance = (sqrt(self.unnorm_vector[0] ** 2 + self.unnorm_vector[1] ** 2))

        if current_time > self.leader.pre_evacuation_time:
            try:
                norm_vector = tuple((self.unnorm_vector[0] / self.distance, self.unnorm_vector[1] / self.distance))
                self.velocity = (norm_vector[0] * self.speed, norm_vector[1] * self.speed)
            except:
                self.velocity = (0, 0)

    def update_speed(self):
        extinction_coefficient = self.optical_density_at_position * 2.303
        if self.beta_v == 0:
            self.beta_v = 0.00000001
        self.speed = max(self.max_speed * 0.1, self.max_speed * (1 + self.beta_v/self.alpha_v * extinction_coefficient))

    def has_agent_moved(self):
        if self.prev_position != self.position:
            self.prev_position = self.position
            return True
        return False

    def has_agent_changed_floor(self):
        if self.prev_floor != self.current_floor:
            _prev_floor = self.prev_floor
            self.prev_floor = self.current_floor
            return _prev_floor
        return None
    
    def has_agent_changed_symbolic_fed(self):
        if self.symbolic_fed != self.prev_symbolic_fed:
            _prev_symbolic_fed = self.prev_symbolic_fed
            self.prev_symbolic_fed = self.symbolic_fed
            return _prev_symbolic_fed
        return None
    