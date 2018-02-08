import warnings
warnings.simplefilter('ignore', RuntimeWarning)
import rvo2
from evac.evacuees import Evacuees
from math import ceil
import logging


class EvacEnv:
    config = dict()
    config['TIME_STEP'] = 0.1
    config['NEIGHBOR_DISTANCE'] = 80
    config['MAX_NEIGHBOR'] = 5
    config['TIME_HORIZON'] = 1
    config['TIME_HORIZON_OBSTACLE'] = 0.05
    config['RADIUS'] = 60

    def __init__(self, aamks_vars):
        self.evacuees = Evacuees
        self.max_speed = 0
        self.current_time = 0
        self.positions = []
        self.velocities = []
        self.velocity_vector = []
        self.speeds = []
        self.speed_vec = []
        self.fed = []
        self.fed_vec = []
        self.finished = []
        self.finished_vec = []
        self.trajectory = []
        self.focus = []
        self.smoke_query = None
        self.rset = 0
        self.per_9 = 0
        self.floor = 0
        self.general = aamks_vars['GENERAL']
        self.config['NUM_OF_STEPS'] = aamks_vars['AAMKS_CONF']['NUM_OF_STEPS']

        self.sim = rvo2.PyRVOSimulator(self.config['TIME_STEP'], self.config['NEIGHBOR_DISTANCE'],
                                       self.config['MAX_NEIGHBOR'], self.config['TIME_HORIZON'],
                                       self.config['TIME_HORIZON_OBSTACLE'], self.config['RADIUS'],
                                       self.max_speed)

        logging.basicConfig(filename='aamks.log', level=logging.DEBUG,
                            format='%(asctime)s %(levelname)s: %(message)s')

    def __setattr__(self, key, value):
        self.__dict__[key] = value

    def __getattr__(self, item):
        return self.__dict__[item]

    def read_cfast_record(self, time):
        self.smoke_query.read_cfast_record(time)

    def place_evacuees(self, evacuees):
        assert isinstance(evacuees, Evacuees), '%evacuees is not type of Evacuees'
        self.evacuees = evacuees
        [self.sim.addAgent(self.evacuees.get_origin_of_pedestrian(i))
         for (i) in range(self.evacuees.get_number_of_pedestrians())]

        [self.sim.setAgentPrefVelocity(i, self.evacuees.get_velocity_of_pedestrian(i))
         for (i) in range(self.evacuees.get_number_of_pedestrians())]

        [self.sim.setAgentMaxSpeed(i, self.evacuees.get_speed_max_of_pedestrian(i))
         for i in range(self.evacuees.get_number_of_pedestrians())]

        #self.current_time = self.evacuees.get_first_evacuees_time()

    @staticmethod
    def discretize_time(time):
        return int(ceil(time/10.0)) * 10

    def save_data_for_visualization(self):
        self.trajectory.append(self.positions)
        self.velocity_vector.append(self.velocities)
        self.speed_vec.append(self.speeds)
        self.fed_vec.append(self.fed)
        self.finished_vec.append(self.finished)

    def update_agents_position(self):
        for i in range(self.evacuees.get_number_of_pedestrians()):
            if (self.evacuees.get_finshed_of_pedestrian(i)) == 1:
                self.sim.setAgentPosition(i, (10000+i, 10000))
                continue
            else:
                self.evacuees.set_position_to_pedestrian(i, self.sim.getAgentPosition(i))
        self.positions = [tuple((int(self.sim.getAgentPosition(i)[0]), int(self.sim.getAgentPosition(i)[1]))) for (i)
                          in range(self.sim.getNumAgents())]

    def update_agents_velocity(self):
        for i in range(self.evacuees.get_number_of_pedestrians()):
            self.evacuees.calculate_pedestrian_velocity(i, self.current_time)
        for i in range(self.evacuees.get_number_of_pedestrians()):
            self.sim.setAgentPrefVelocity(i, self.evacuees.get_velocity_of_pedestrian(i))
        self.velocities = [tuple((int(self.sim.getAgentPrefVelocity(i)[0]), int(self.sim.getAgentPrefVelocity(i)[1]))) for (i)
                           in range(self.sim.getNumAgents())]

    def update_state(self):
        for i in range(self.evacuees.get_number_of_pedestrians()):
            if (self.evacuees.get_finshed_of_pedestrian(i)) == 1:
                continue
            else:
                focus_visible = self.sim.queryVisibility(self.evacuees.get_position_of_pedestrian(i),
                                                     self.evacuees.get_focus_of_pedestrian(i))
                self.evacuees.update_state(i, focus_visible)
        self.finished = [self.evacuees.get_finshed_of_pedestrian(i) for i in range(self.sim.getNumAgents())]
        for i in range(self.sim.getNumAgents()):
            self.focus.append(self.evacuees.get_focus_of_pedestrian(i))

    def update_speed(self):
        logging.info('Flooor {} udated speed'.format(self.floor))
        for i in range(self.evacuees.get_number_of_pedestrians()):
            if (self.evacuees.get_finshed_of_pedestrian(i)) == 1:
                continue
            else:
                optical_density = self.smoke_query.get_visibility(self.evacuees.get_position_of_pedestrian(i),
                                                                               self.current_time)

                self.evacuees.update_speed_of_pedestrian(i, optical_density)
                self.sim.setAgentMaxSpeed(i, self.evacuees.get_speed_of_pedestrian(i))
        self.speeds = [int(self.evacuees.get_speed_of_pedestrian(i)) for (i) in range(self.sim.getNumAgents())]

    def update_fed(self):
        for i in range(self.evacuees.get_number_of_pedestrians()):
            if(self.evacuees.get_finshed_of_pedestrian(i)) == 1:
                continue
            else:
                fed = self.smoke_query.get_fed(self.evacuees.get_position_of_pedestrian(i), self.current_time)
                self.evacuees.update_fed_of_pedestrian(i, fed)
        fed = [self.evacuees.get_fed_of_pedestrian(i) for i in range(self.sim.getNumAgents())]
        c = None
        fed_symbilic = []
        for i in fed:
            if i < 0.01:
                c = 'N'
            elif i < 0.3:
                c = 'L'
            elif i < 1:
                c = 'M'
            else:
                c = 'H'
            fed_symbilic.append(c)
        self.fed = fed_symbilic

    def process_obstacle(self, obstacles):
        for i in range(len(obstacles)):
            self.sim.addObstacle(obstacles[i])
            self.sim.processObstacles()
        return self.sim.getNumObstacleVertices(), 2

    def do_step(self):
        self.sim.doStep()

    def get_number_of_evacuees(self):
        return self.sim.getNumAgents()

    def update_time(self):
        self.current_time += self.config['TIME_STEP']

    def get_simulation_time(self):
        return self.sim.getGlobalTime()

    def get_rset_time(self) -> None:
        exited = self.finished.count(1)
        if (exited > len(self.finished) * 0.1) and self.per_9 == 0:
            self.per_9 = self.current_time
        if all(x == 1 for x in self.finished) and self.rset == 0:
            self.rset = self.current_time

    def record_data(self):
        data = []
        for i in range(len(self.trajectory)):
            if (i % self.general['VISUALIZATION_RESOLUTION']) == 0:
                time_row = []
                for n in range(self.sim.getNumAgents()):
                    time_row.append([self.trajectory[i][n][0], self.trajectory[i][n][1], self.velocity_vector[i][n][0],
                                     self.velocity_vector[i][n][1], self.speed_vec[i][n], self.fed_vec[i][n],
                                     self.finished_vec[i][n]])
                data.append(time_row)

        json_content = {'number_of_evacuees': self.sim.getNumAgents(),
             'frame_rate': self.config['TIME_STEP'] * self.general['VISUALIZATION_RESOLUTION'],
             'project_name': self.general['PROJECT_NAME'],
             'simulation_id': self.general['SIM_ID'],
             'simulation_time': self.get_simulation_time(),
             'time_shift': self.evacuees.get_first_evacuees_time(),
             'data': data
             }
        return json_content

    def do_simulation(self, time):
        for step in range(int(time/self.config['TIME_STEP'])):
            self.sim.doStep()
            logging.info('Agents moving step: {}'.format(step))
            self.update_agents_position()
            self.update_state()
            self.update_time()
            self.update_agents_velocity()
            self.update_speed()
            self.update_fed()
            self.save_data_for_visualization()
            self.get_rset_time()
            if self.rset != 0:
                break

