import warnings
warnings.simplefilter('ignore', RuntimeWarning)
import rvo2
import json
import shutil
import os
import re
import sys
import codecs
import itertools

from pprint import pprint
from collections import OrderedDict
from numpy.random import uniform
from math import sqrt
from include import Sqlite
from include import Json
from include import Dump as dd
from include import Vis

class EvacEnv:
    def __init__(self):
        #self.sim rvo2.PyRVOSimulator TIME_STEP , NEIGHBOR_DISTANCE , MAX_NEIGHBOR , TIME_HORIZON , TIME_HORIZON_OBSTACLE , RADIUS , MAX_SPEED
        self.sim = rvo2.PyRVOSimulator(0.05     , 40                , 5            , 1            , 0.05                  , 27     , 0)
        self._load_agents()

    def _load_agents(self):
        self.sim.addAgent((10,100))
        #dd(self.sim.getAgentPosition(0))
        #self.sim.setAgentPrefVelocity(i, self.evacuees.get_velocity_of_pedestrian(i))
        #self.sim.setAgentMaxSpeed(i, self.evacuees.get_speed_max_of_pedestrian(i))

e=EvacEnv()
