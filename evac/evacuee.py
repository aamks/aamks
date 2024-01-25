from operator import sub
from math import sqrt
import logging
from scipy.spatial.distance import cdist


class Evacuee:

    def __init__(self, origin: tuple, v_speed, h_speed, pre_evacuation, alpha_v, beta_v, node_radius) -> None:
        """

        :type origin: tuple
        :type roadmap: list
        """

        self.origin = origin
        self.goal = None
        self.exit_door = None
        self.blocked_exits = list()
        self.fed = 0
        self.dfed = 0
        self.symbolic_fed = 'N'
        self.previous_step_fed = 0
        self.distance = 1
        self.velocity = (0, 0)
        self.speed = 0
        self.thermal_injury = 0
        self.position = origin
        self.finished = 1
        self.node_radius = node_radius
        self.pre_evacuation_time = pre_evacuation
        self.optical_density_at_position = 0.0
        self.unique_agent_id_on_different_floors = None
        self.target_teleport_coordinates = None

        self.alpha_v = alpha_v
        self.beta_v = beta_v
        self.max_speed = h_speed
        self.num_of_obstacle_neighbours = 0
        self.num_of_orca_lines = 0
        self.agent_has_no_escape = 0
        self.exit_coordinates = None

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
        if self.exit_coordinates is None:
            return
        dist = cdist([self.position], [self.exit_coordinates], 'euclidean')
        if dist < 50 and self.target_teleport_coordinates is not None:
            self.finished = 0

    def check_if_agent_reached_outside_door(self):
        if self.exit_coordinates is None:
            return
        dist = cdist([self.position], [self.exit_coordinates], 'euclidean')
        if dist < 50 and self.target_teleport_coordinates is None:
            self.finished = 0
            return True
        return False

    def set_goal(self, navmesh_path):
        assert isinstance(navmesh_path, list), '%goal is not a list'
        if self.agent_has_no_escape == 1:
            return
        dist_navmesh = cdist([self.position], [navmesh_path[-1]], 'euclidean')
        dist_coordinates = cdist([self.position], [self.exit_coordinates], 'euclidean')
        if (dist_coordinates < 50 or dist_navmesh < 50):
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

        if current_time > self.pre_evacuation_time:
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
