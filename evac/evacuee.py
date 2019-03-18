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
        self.fed = 0
        self.distance = 1
        self.velocity = (0, 0)
        self.speed = 0
        self.thermal_injury = 0
        self.position = origin
        self.finished = 1
        self.node_radius = node_radius
        self.pre_evacuation_time = pre_evacuation

        self.alpha_v = alpha_v
        self.beta_v = beta_v
        self.max_speed = h_speed

        logging.basicConfig(filename='aamks.log', level=logging.DEBUG,
                            format='%(asctime)s %(levelname)s: %(message)s')

    def __getattr__(self, name):
        return self.__dict__[name]

    def __setattr__(self, key, value):
        self.__dict__[key] = value

    @property
    def focus(self):
        #logging.info('Roadmap {}, current goal for visible {}'.format(self.roadmap, self.goal_s))
        if self.goal_s < 0:
            self.goal_s = 0
        return tuple(self.roadmap[self.goal_s])

    def update_fed(self, fed):
        assert isinstance(fed, float), '%fed is not required type float'
        self.fed += fed

    def update_thermal_injury(self, thermal_injury):
        assert isinstance(thermal_injury, float), '%thermal_injury is not a float'
        self.thermal_injury = thermal_injury

    def set_goal(self, goal):
        assert isinstance(goal, list), '%goal is not a list'
        dist = cdist([self.position], [goal[-1]], 'euclidean')
        if dist < 30:
            self.finished = 0
        else:
            self.goal = goal[1]


    def calculate_velocity(self, current_time):
        self.unnorm_vector = tuple(map(sub, self.goal, self.position))
        self.distance = (sqrt(self.unnorm_vector[0] ** 2 + self.unnorm_vector[1] ** 2))

        if current_time > self.pre_evacuation_time:
            norm_vector = tuple((self.unnorm_vector[0] / self.distance, self.unnorm_vector[1] / self.distance))
            self.velocity = (norm_vector[0] * self.speed, norm_vector[1] * self.speed)

    def update_speed(self, optical_density):
        extinction_coefficient = optical_density * 2.303
        if self.beta_v == 0:
            self.beta_v = 0.00000001
        self.speed = max(self.max_speed * 0.1, self.max_speed * (1 + self.beta_v/self.alpha_v * extinction_coefficient))
