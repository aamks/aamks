import sys
import numpy as np
import os
import re
sys.path.insert(0, '/usr/local/aamks')
from include import Sqlite, Psql, Json
import json
from statistics import mean 
from scipy.stats import spearmanr
import matplotlib.pyplot as plt
from SALib.analyze import sobol, hdmr
from numpy import array, arange, floor
from numpy.random import randn
import pandas as pd
import collections


'''from SALib.plotting.hdmr.py'''
def plot(Si, direct):
    # Close all figures
    plt.close("all")

    # Extract necessary data from Si
    try:
        problem = Si.problem
    except AttributeError:
        problem = Si

    Em = Si["Em"]
    RT = Si["RT"]
    Y_em = Si["Y_em"]
    idx = Si["idx"]
    X = Si["X"]
    Y = Si["Y"]

    # Get number of bootstrap from Runtime and sample size N
    K = RT.shape[0]
    N = Y.shape[0]
    row = 2
    col = 5

    try:
        ax = Si._plot()
    except AttributeError:
        # basic bar plot not found or is not available
        pass

    # Plot emulator performance
    Y_p = np.linspace(np.min(Y), np.max(Y), N, endpoint=True)

    start = max(0, K - 10)
    for i in range(start, K):
        # Only showing the last 10
        if (i % (row * col) == 0) or (i == 0):
            fig = plt.figure(frameon=False)
            fig.suptitle("Showing last 10 Bootstrap Trials")
            it = 1

        title_str = f"Trial {K - i}"
        ax = fig.add_subplot(row, col, it, frameon=True, title=title_str)
        ax.plot(Em["Y_e"][:, i], Y[idx[:, i]], "r+", label="Emulator")
        ax.plot(Y_p, Y_p, "darkgray", label="1:1 Line")
        ax.axis("square")
        ax.set_xlim(np.min(Y), np.max(Y))
        ax.set_ylim(np.min(Y), np.max(Y))
        it += 1

        if i == (K - 1):
            handles, labels = ax.get_legend_handles_labels()
            fig.legend(handles, labels, loc="center right", bbox_to_anchor=(1.0, 0.5))

    fig.tight_layout()

    # Now plot regression lines of component functions
    row = 4
    col = 3
    last_bootstrap = idx[:, -1]
    for i in range(problem["num_vars"]):
        if (i % (row * col) == 0) or (i == 0):
            fig = plt.figure(frameon=False)
            it = 1
        title_str = (
            "Regression of parameter " + problem["names"][i] + r"$^{(Last Trial)}$"
        )
        ax = fig.add_subplot(row, col, it, frameon=True, title=title_str)
        ax.plot(X[last_bootstrap, i], Y[last_bootstrap], "r.")
        ax.plot(X[last_bootstrap, i], np.mean(Em["f0"]) + Y_em[:, i], "k.")
        ax.legend(
            [r"$\widetilde{Y}$", "$f_" + str(i + 1) + "$"],
            loc="upper left",
            bbox_to_anchor=(1.04, 1.0),
        )
        it += 1

        fig.tight_layout()
        if (row*col)%3 ==0:
            plt.savefig(direct+f'_{i}.png')

    return ax

class SensitivityAnalysis:
    VARS = ['alpha', 'fireload', 'hrrpeak', 'max_area', 'co_yield', 'soot_yield', 'hcn_yield',
            'heat_of_combustion', 'heigh', 'rad_frac', 'outdoor_temp',
            'fireorig']

    def __init__(self):
        self.p = Psql()
        self.j = Json()
        self.dir = sys.argv[1]
        self.configs = self.j.read('{}/conf.json'.format(self.dir))
        self.s = Sqlite("{}/aamks.sqlite".format(self.dir))
        self.variables = sys.argv[2:] if len(sys.argv) > 2 else self.VARS

        self.problem = {}
        self.samples = pd.DataFrame()
        self.results = pd.DataFrame()

    def _define_problem(self):
        self.problem = {
            'num_vars': len(self.variables),
            'names': self.variables#,
            #'bounds': [[]] * len(self.variables)
        }

    def _import_samples(self):
        query = f"SELECT {', '.join(self.variables)}, results, fireorigname FROM simulations WHERE scenario_id={self.configs['scenario_id']} AND status='0'"
        self.samples = pd.DataFrame(self.p.query(query), columns=self.variables+['results', 'fireorigname'])
        self.results = pd.json_normalize(self.samples.pop('results').apply(json.loads))
        self.fire_room = self.samples.pop('fireorigname')

    def _modify_samples(self):
        # is fire originated in the room
        def room_or_not(rec): return True if rec == 'room' else False
        self.samples['fireorig'] = self.samples['fireorig'].map(room_or_not)

        try:
            self.samples = self.samples.astype(float)
        except:
            breakpoint()
        self.results = self.results['individual']

    
#    def do_sobol(self, second_order):
#        m = 2 if second_order else 1
#        n = int(len(self.results['individual']) - floor(len(self.results['individual']) % (m*problem['num_vars']+2)))
#        si = sobol.analyze(self.problem, self.results['individual'].iloc[:n].to_numpy(), 
#                print_to_console=True, calc_second_order=second_order)
#        return si

    def do_hdmr(self):
        si = hdmr.analyze(self.problem, self.samples.to_numpy(), self.results.to_numpy(), K=1,
                print_to_console=True)#, calc_second_order=second_order)
        return si
        
    def plot(self, si):
        axes = hdmr.plot(si)
        fig = plt.gcf()  # get current figure
        fig.set_size_inches(10, 4)
        plt.tight_layout()
        plt.savefig(os.path.join(self.dir, 'picts', 'hdmr.png'))

    def main(self, second_order=False):
        self._define_problem()
        self._import_samples()
        self._modify_samples()
        si = self.do_hdmr()
        plot(si, os.path.join(self.dir, 'picts', 'hdmr.png'))


class SA_old:

    def __init__(self):
        self.p = Psql()
        self.j = Json()
        self.dir = sys.argv[1]
        #self.dir = "/home/aamks_users/mzimny94@gmail.com/SFPE_Case_study/S1"
        self.configs = self.j.read('{}/conf.json'.format(self.dir))
        self.s = Sqlite("{}/aamks.sqlite".format(self.dir))

    def _door_to_fire_orig_open(self, d_type, mask, c_id):
        vent_to, vent_from = list(), list()
        row=0
        d_open=0
        for v in self.s.query("SELECT global_type_id, vent_to, vent_from FROM aamks_geom WHERE type_tri='{}' AND type_sec='DOOR' ORDER BY vent_from,vent_to".format(d_type)):
            if (v['vent_to'] == c_id) or (v['vent_from'] == c_id):
                try:
                    if mask[row] == 1:
                        d_open = 1
                except:
                    breakpoint()
            row+=1
        return d_open

    def calculate_indvidual_risk(self):
        rooms, sprinklered_rooms = list(), list()
        c_id = list()
        # distinguish rooms with sprinklers
        for v in self.s.query("SELECT name from aamks_geom WHERE type_pri='COMPA' AND fire_model_ignore!=1 AND sprinklers=1"):
            sprinklered_rooms.append(v['name'])
        for v in self.s.query("SELECT name, global_type_id from aamks_geom WHERE type_pri='COMPA' AND fire_model_ignore!=1"):
            rooms.append(v['name'])
            c_id.append(v['global_type_id'])

        ranks = dict()
        d_factor = dict()
        # download samples of input parameters (deterministic iteration input)
        query = "SELECT soot_yield, hrrpeak, door, co_yield, alpha, fireorig, heat_of_combustion, rad_frac, dcloser, delectr, vvent, sprinklers, fireorigname, results, fed \
        FROM simulations where project = {} AND scenario_id = {} AND results \
        is not null".format(self.configs['project_id'], self.configs['scenario_id'])
        results = self.p.query(query)

        # create DataFrame with samples. Replace empty results with 0,0
        df = pd.DataFrame(results, columns=['soot yield', 'hrr peak', 'doors p', 'co yield', 'growth rate', 'fire origin', 'heat of combustion', 'radiative fraction', 'doors c', 'doors e', 'vvent', 'sprinklers', 'fname', 'risk', 'fed'])
        df['doors p'].replace("", "0", inplace=True)
        df['doors c'].replace("", "0", inplace=True)
        df['doors e'].replace("", "0", inplace=True)
        df['vvent'].replace("", "0", inplace=True)
        df['sprinklers'].replace("", "0,0", inplace=True)
        df['fire origin'].replace("room", "0", inplace=True)
        df['fire origin'].replace("non_room", "1", inplace=True)
        #df['fire orig open'] = ['0'] * len(df['risk'])
        #df['doors open'] = ['0'] * len(df['risk'])

        for index, row in df.iterrows():
            if len(sprinklered_rooms) > 0:
                s_name = sprinklered_rooms.index(row['fname'])
                #row['sprinklers'] = float(list(map(float, row['sprinklers'].split(',')))[s_name])
                row['sprinklers'] = 0 
                if row['sprinklers'] > 0:
                    row['sprinklers'] = 0
                else:
                    row['sprinklers'] = 1
            else:
                row['sprinklers'] = 0
                #row['sprinklers'] = sum(map(float, row['sprinklers'].split(',')))
            fname = rooms.index(row['fname'])
            orig_id = c_id[fname]

            door_p_sec = list(map(int, row['doors p'].split(',')))
            row['fire orig open'] = int(self._door_to_fire_orig_open("DOOR", door_p_sec, orig_id))
            row['doors p'] = sum(door_p_sec)

            door_c_sec = list(map(int, row['doors c'].split(',')))
            row['fire orig open'] = row['fire orig open'] + int(self._door_to_fire_orig_open("DCLOSER", door_c_sec, orig_id))
            row['doors c'] = sum(door_c_sec)
            row['doors open'] = sum(door_c_sec) + sum(door_p_sec)

            row['doors e'] = sum(map(int, row['doors e'].split(',')))
            row['vvent'] = sum(map(int, row['vvent'].split(',')))

            row['soot yield'] = float(row['soot yield'])
            row['hrr peak'] = float(row['hrr peak'])
            row['co yield'] = float(row['co yield'])
            row['growth rate'] = float(row['growth rate'])
            row['fire origin'] = int(row['fire origin'])
            row['heat of combustion'] = float(row['heat of combustion'])
            row['radiative fraction'] = float(row['radiative fraction'])
            row['risk'] = json.loads(row['risk'])['individual']
            row['fed'] = sum(json.loads(row['fed']))
            row['doors open'] = int(row['doors open'])

        #df['soot yield'] = df['soot yield'].apply(float)

        for colname, colvalues in df.iteritems():
            if colname=='risk':
                continue
            if colname=='fname':
                continue
            if colname=='doors c':
                continue
            if colname=='doors p':
                continue
            if colname=='fed':
                continue
            #print(colname)
            if sum(colvalues.astype(float))==0:
                continue
            ranks.update({colname: spearmanr(colvalues, df['risk'])})
            d_factor.update({colname: spearmanr(colvalues, df['fed'])})

        df.to_csv("{}/picts/sa.csv".format(self.dir))
        return ranks, d_factor
    
    def plot_ranks(self, ranks, d_factor):
        plt.rcdefaults()
        plt.rcParams["figure.figsize"] = [12, 7]
        #fig, ax = plt.subplots(figsize=(12,5))
        labels = ranks.keys()
        y_pos = arange(len(labels))
        corr = [i[0] for i in list(ranks.values())]
        pvalue = [i[1] for i in list(ranks.values())]
        corr_d = [i[0] for i in list(d_factor.values())]
        pvalue_d = [i[1] for i in list(d_factor.values())]
        df = pd.DataFrame({'i_risk': corr, 'FED': corr_d}, index=labels)
        
        #ax.barh(y_pos, corr, align='center')
        #ax.barh(y_pos, corr_d, align='center')
        #ax.barh(y_pos, corr, xerr=pvalue, align='center')
        ax = df.plot.barh()
        ax.set_yticks(y_pos)
        ax.set_yticklabels(labels)
        ax.invert_yaxis()  # labels read top-to-bottom
        ax.set_xlabel('Spearman Range Correlation Coeficient')
        ax.set_title('Sensitivity analysis')
        
        plt.savefig("{}/picts/sa.png".format(self.dir))



sa = SA_old()
ranks, d_factor = sa.calculate_indvidual_risk()
sa.plot_ranks(ranks, d_factor)

s = SensitivityAnalysis()
s.main()


