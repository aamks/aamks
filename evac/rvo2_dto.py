import warnings
warnings.simplefilter('ignore', RuntimeWarning)
import rvo2
from evac.evacuees import Evacuees
from math import ceil
import logging
import os
import json
from include import Navmesh
from shapely.geometry import LineString


class EvacEnv:

    def __init__(self, aamks_vars):
        self.evacuees = Evacuees
        self.max_speed = 0
        self.current_time = 0
        self.positions = []
        self.velocities = []
        self.velocity_vector = []
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
        self.nav = None

        f = open('{}/{}/config.json'.format(os.environ['AAMKS_PATH'], 'evac'), 'r')
        self.config = json.load(f)

        self.general = aamks_vars

        self.sim = rvo2.PyRVOSimulator(self.config['TIME_STEP'], self.config['NEIGHBOR_DISTANCE'],
                                       self.config['MAX_NEIGHBOR'], self.config['TIME_HORIZON'],
                                       self.config['TIME_HORIZON_OBSTACLE'], self.config['RADIUS'],
                                       self.max_speed)

        logging.basicConfig(filename='aamks.log', level='logging.{}'.format(self.config['LOGGING_MODE']),
                            format='%(asctime)s %(levelname)s: %(message)s')

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

    @staticmethod
    def discretize_time(time):
        return int(ceil(time/10.0)) * 10

    def save_data_for_visualization(self):
        self.trajectory.append(self.positions)
        self.velocity_vector.append(self.velocities)
        self.fed_vec.append(self.fed)
        self.finished_vec.append(self.finished)

    def update_agents_position(self):
        for i in range(self.evacuees.get_number_of_pedestrians()):
            if (self.evacuees.get_finshed_of_pedestrian(i)) == 0:
                self.sim.setAgentPosition(i, (10000+i * 200, 10000))
                continue
            else:
                self.evacuees.set_position_to_pedestrian(i, self.sim.getAgentPosition(i))
        self.positions = [tuple((int(self.sim.getAgentPosition(i)[0]), int(self.sim.getAgentPosition(i)[1]))) for (i)
                          in range(self.sim.getNumAgents())]
        for i in range(self.evacuees.get_number_of_pedestrians()):
            logging.debug('AGENT: {}, POSITION: {}'.format(i, self.evacuees.get_position_of_pedestrian(i)))

    def update_agents_velocity(self):
        for i in range(self.evacuees.get_number_of_pedestrians()):
            self.evacuees.calculate_pedestrian_velocity(i, self.current_time)
        for i in range(self.evacuees.get_number_of_pedestrians()):
            self.sim.setAgentPrefVelocity(i, self.evacuees.get_velocity_of_pedestrian(i))
        self.velocities = [tuple((int(self.sim.getAgentPrefVelocity(i)[0]), int(self.sim.getAgentPrefVelocity(i)[1]))) for (i)
                           in range(self.sim.getNumAgents())]

    def set_exit_door(self):
        for evacuee in range(self.evacuees.get_number_of_pedestrians()):
            paths = list()

            if (self.evacuees.get_exit_door(evacuee) not in self.evacuees.get_blocked_exits(evacuee)) and self.evacuees.get_exit_door(evacuee) is not None:
                continue
            if len(self.evacuees.get_blocked_exits(evacuee)) == len(self.general['doors']):
                continue

            for door in self.general['doors']:
                path = self.nav.query([self.evacuees.get_position_of_pedestrian(evacuee), (door['center_x'], door['center_y'])],
                                                  maxStraightPath=100, floor=str(self.floor))
                paths.append(LineString(path).length)

            closest_exit = paths.index(min(paths))
            self.evacuees.set_exit_door(ped_no=evacuee, exit_door=(self.general['doors'][closest_exit]['center_x'], self.general['doors'][closest_exit]['center_y']))

    def set_goal(self):
        for i in range(self.evacuees.get_number_of_pedestrians()):
            if (self.evacuees.get_finshed_of_pedestrian(i)) == 0:
                continue
            else:
                goal = self.nav.query([self.evacuees.get_position_of_pedestrian(i), self.evacuees.get_exit_door(i)])
                self.evacuees.set_goal(ped_no=i, goal=goal)

        self.finished = [self.evacuees.get_finshed_of_pedestrian(i) for i in range(self.sim.getNumAgents())]
        for i in range(self.sim.getNumAgents()):
            self.focus.append(self.evacuees.get_goal_of_pedestrian(i))

    def update_speed(self):
        logging.debug('Flooor {} udated speed'.format(self.floor))
        for i in range(self.evacuees.get_number_of_pedestrians()):
            if (self.evacuees.get_finshed_of_pedestrian(i)) == 0:
                continue
            else:
                optical_density = self.smoke_query.get_visibility(self.evacuees.get_position_of_pedestrian(i),
                                                                               self.current_time, self.floor)

                self.evacuees.update_speed_of_pedestrian(i, optical_density)
                self.sim.setAgentMaxSpeed(i, self.evacuees.get_speed_of_pedestrian(i))

    def update_fed(self):
        for i in range(self.evacuees.get_number_of_pedestrians()):
            if(self.evacuees.get_finshed_of_pedestrian(i)) == 0:
                continue
            else:
                fed = self.smoke_query.get_fed(self.evacuees.get_position_of_pedestrian(i), self.current_time, self.floor)
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
            obst = list()
            for n in obstacles[i]:
                obst.append(n[0:2])
            self.sim.addObstacle(obst)
        self.sim.processObstacles()
        return self.sim.getNumObstacleVertices(), 2

    def generate_nav_mesh(self):
        self.nav = Navmesh()
        self.nav.build(obj=str(self.floor)+'.obj')

    def do_step(self):
        self.sim.doStep()

    def get_number_of_evacuees(self):
        return self.sim.getNumAgents()

    def update_time(self):
        self.current_time += self.config['TIME_STEP']

    def get_simulation_time(self):
        return self.sim.getGlobalTime()

    def get_rset_time(self) -> None:
        exited = self.finished.count(0)
        logging.info('Time: {}, floor: {}, evacuated: {}'.format(self.get_simulation_time(), self.floor, exited))
        if (exited > len(self.finished) * 0.1) and self.per_9 == 0:
            self.per_9 = self.current_time
        if all(x == 0 for x in self.finished) and self.rset == 0:
            self.rset = self.current_time

    def record_data(self):
        data = []
        for i in range(len(self.trajectory)):
            if (i % self.config['VISUALIZATION_RESOLUTION']) == 0:
                time_row = []
                for n in range(self.sim.getNumAgents()):
                    time_row.append([self.trajectory[i][n][0], self.trajectory[i][n][1], self.velocity_vector[i][n][0],
                                     self.velocity_vector[i][n][1], self.fed_vec[i][n], self.finished_vec[i][n]])
                data.append(time_row)

        json_content = {'number_of_evacuees': self.sim.getNumAgents(),
             'frame_rate': self.config['TIME_STEP'] * self.config['VISUALIZATION_RESOLUTION'],
             'project_name': self.general['project_id'],
             'simulation_id': self.general['SIM_ID'],
             'simulation_time': self.get_simulation_time(),
             'time_shift': self.evacuees.get_first_evacuees_time(),
             'data': data
             }
        return json_content

    def do_simulation(self, time):
        time_range = int(time/self.config['TIME_STEP'])
        for step in range(time_range - 100, time_range):
            self.set_goal()
            self.update_speed()
            self.update_agents_velocity()
            self.sim.doStep()
            logging.debug('Simulation step: {}'.format(step))
            self.update_agents_position()
            #self.update_state()
            self.update_time()
            self.update_fed()
            self.save_data_for_visualization()
            self.get_rset_time()
            if self.rset != 0:
                break

