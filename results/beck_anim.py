import csv
import json
import os
from collections import defaultdict
import re
import sys
import numpy as np
from include import Psql
from matplotlib import pyplot as plt

relevant_params = ('Time', 'Outside', 'HRR', 'HRR_E1', 'HGT','LLOD', 'ULOD', 'ULCO', 'LLCO','ULCO2','LLCO2','ULHCN','LLHCN','ULHCL', 'LLHCL')

def draw(x, y, label_x, title, name):
    plt.plot(x, y)
    plt.xlabel(label_x)
    plt.title(title)
    plt.savefig(name)
    plt.close()

class Beck_Anim:
    def __init__(self, path, project, scenario, iter):
        self.path = path
        picts_dir = os.path.join(path, 'picts')
        if not os.path.exists(picts_dir):
            os.makedirs(picts_dir)
        self.iter = int(iter)
        self.project = int(project)
        self.scenario = int(scenario)
        self.dct = self.read_compartments()
        self.functioning_params = defaultdict(list)
        self.p = Psql()

        self.create_plot()
        self.push_params()

    def read_compartments(self):
        f = f"{self.path}/workers/{self.iter}/cfast_compartments.csv"
        with open(f, 'r') as csvfile:
            reader = csv.reader(csvfile, delimiter=',')
            params = [re.sub('_\d.*', '', field) for field in next(reader)]
            next(reader) # describe params
            rooms = [re.sub('f.*', 'fire', field)for field in next(reader)]
            uniq_rooms = set(rooms)
            dct = {}
            for room in uniq_rooms:
                dct[room] = defaultdict(list)
            next(reader) # units
            for row in reader:
                for i, val in enumerate(row):
                    if params[i] in relevant_params:
                        dct[rooms[i]][params[i]].append(float(val))
        return dct

    def create_plot(self):
        for room in self.dct.keys():
            if room == "Time":
                continue
            for param in self.dct[room].keys():
                if not all(v == 0 for v in self.dct[room][param]):
                    self.functioning_params[room].append(param)
                    draw(self.dct['Time']['Time'], self.dct[room][param], 'Time', param, f'{self.path}/picts/{self.iter}_{param}_{room}')
    
    def push_params(self):
        params = json.dumps(self.functioning_params)
        self.p.query("UPDATE simulations SET anim_params=%s WHERE project=%s AND scenario_id=%s AND iteration=%s;",(params, self.project, self.scenario, self.iter))


if __name__ == '__main__':
    Beck_Anim(sys.argv[1], sys.argv[2], sys.argv[3], sys.argv[4])
    #Beck_Anim('/home/aamks_users/demo@aamks/demo/three', '1', '3', '2')
