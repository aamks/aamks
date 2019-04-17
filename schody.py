import numpy.random as random  # {{{
import math
import matplotlib.pyplot as plt
import matplotlib.animation as anim
from matplotlib import patches as mpaths  # }}}

CZAS_INTERWALU = 900
LICZBA_AGENTOW = 40


class Queue:  # {{{

    def __init__(self, floor, floor_space):
        self.floor = floor
        self.floor_space = floor_space
        self.queue = floor*floor_space*[None]

    def if_free(self, floor):
        if self.queue[floor*self.floor_space] is None:
            if self.queue[floor*self.floor_space+1] is None:
                return 0
            else:
                return 1
        else:
            return 2

    def add(self, floor, data):
        self.queue[floor*self.floor_space] = data

    def insert(self, floor, data):
        self.queue.insert(floor*self.floor_space, data)
        self.queue = self.queue[:-1]

    def pop(self):
        data = self.queue.pop(0)
        self.queue.append(None)
        return data

    def que(self):
        return self.queue

    def len_que(self):
        return len(self.queue)


class Agent:  # {{{

    def __init__(self):
        self.name = ""
        floor = [0, 3, 6, 9, 12]
        self.position = (0.5, floor[random.randint(0, 5)])

    def __repr__(self):
        return str(self.name)

    def if_in(self):
        return random.randint(0, 3)  # }}}


class Pedestrians:  # {{{

    def __init__(self):
        self.agent = []
        self.QUEUE = Queue(7, 3)
        for i, z in enumerate('abcdefghijklmnoprst'):
            x = Agent()
            x.position = (i/30, i)
            x.name = z
            self.agent.append(x)
        self.traj = []
        self.floorque = {}
#        self.add_agent()
        self.do_traj()

    def add_agent(self):
        for i in range(LICZBA_AGENTOW):
            self.agent.append(Agent())

    def do_traj(self):
        for agent in self.agent:
            pietro = math.floor(agent.position[1]/3)
            if pietro in self.floorque:
                if agent not in self.floorque[pietro]:
                    self.floorque[pietro].append(agent)
            else:
                self.floorque[pietro] = [agent]
        for floor in self.floorque.keys():
            self.floorque[floor].sort(key=lambda x: x.position[0])
        krok = 0
        while True:
            krok += 1
            for floor in self.floorque.keys():
                if not self.QUEUE.if_free(floor):
                    try:
                        self.QUEUE.add(floor, self.floorque[floor].pop(0))
                    except:
                        pass
                elif self.QUEUE.if_free(floor) == 1:
                    try:
                        if not self.floorque[floor][0].if_in():
                            self.QUEUE.add(floor, self.floorque[floor].pop(0))
                    except:
                        pass
                else:
                    try:
                        if not self.floorque[floor][0].if_in():
                            self.QUEUE.insert(floor, self.floorque[floor].pop(0))
                            break
                    except:
                        pass
            try:
                self.QUEUE.pop().position = (2+krok/10, 1)
            except:
                pass
            for x, i in enumerate(self.QUEUE.que()):
                try:
                    i.position = (1, x)
                except:
                    pass
            print(self.QUEUE.que())
            print([x for x in self.QUEUE.que() if x is not None], len([x for x in self.QUEUE.que() if x is not None]))
            print("\n")

            traj = []
            for agent in self.agent:
                traj.append(agent.position)
            self.traj.append(traj)
            if len([x for x in self.QUEUE.que() if x is not None]) == 0:
                print("zakonczono w: ", krok, " krokach")
                break  # }}}


A = Pedestrians()


class Animation:  # {{{

    def __init__(self):
        self.fig = plt.figure()
        self.ax = plt.axes(xlim=(0, 5), ylim=(0, 15.1))
        self.trial = []
        self.trajectory = A.traj
        self.n_frames = len(self.trajectory)
        color = ['b', 'g', 'r', 'c', 'm', 'y', 'k', 'w']
        elipses = [mpaths.Ellipse(i, width=0.1, height=1, angle=0, color=color[random.randint(0, 7)]) for i in self.trajectory[0]]
        [self.trial.append(self.ax.add_patch(elipses[i])) for i in range(len(elipses))]
        plt.plot((0.9, 0.9, 4.1, 4.1), (0, 15, 15, 0), "r", lw=2)
        plt.plot((0.9, 4.1), (3, 3), "y", lw=2)
        plt.plot((0.9, 4.1), (6, 6), "y", lw=2)
        plt.plot((0.9, 4.1), (9, 9), "y", lw=2)
        plt.plot((0.9, 4.1), (12, 12), "y", lw=2)

    def init_animation(self):
        [self.trial[i].set_visible(True) for i in range(len(self.trial))]
        return self.trial

    def animate(self, i):
        for j in range(len(self.trajectory[0])):
            self.trial[j].center = self.trajectory[i][j]
        return self.trial

    def do_animation(self, n_interval):
        animate = anim.FuncAnimation(self.fig, self.animate, frames=self.n_frames, init_func=self.init_animation, interval=n_interval, blit=True)
        plt.show()  # }}}


Animation().do_animation(CZAS_INTERWALU)
