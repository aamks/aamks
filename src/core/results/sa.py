import sys
import numpy as np
import os
import re
from include import Sqlite, Psql, Json
import json
from statistics import mean 
from scipy.stats import spearmanr
import matplotlib.pyplot as plt
from SALib.analyze import sobol, hdmr
from SALib.plotting import bar
from numpy import array, arange, floor
from numpy.random import randn
import pandas as pd
import collections


class SensitivityAnalysis:
    VARS = ['alpha', 'fireload', 'hrrpeak', 'max_area', 'co_yield', 'soot_yield', 'hcn_yield',
            'heat_of_combustion',  'rad_frac', 'outdoor_temp']
            #'fireorig']

    def __init__(self, workdir=None, y='individual'):
        self.p = Psql()
        self.j = Json()
        self.dir = workdir if workdir else sys.argv[1]
        self.configs = self.j.read('{}/conf.json'.format(self.dir))
        self.s = Sqlite("{}/aamks.sqlite".format(self.dir))
        self.variables = sys.argv[2:] if len(sys.argv) > 2 else self.VARS
        self.y = y

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
        query = f"SELECT {', '.join(self.variables)}, results, fireorigname FROM simulations WHERE \
                scenario_id={self.configs['scenario_id']} AND status='0'"
        self.samples = pd.DataFrame(self.p.query(query), columns=self.variables + ['results', 'fireorigname'])
        self.results = pd.json_normalize(self.samples.pop('results').apply(json.loads))
        self.fire_room = self.samples.pop('fireorigname')

    def _modify_samples(self):
        # is fire originated in the room
        def room_or_not(rec): return True if rec == 'room' else False
        #self.samples['fireorig'] = self.samples['fireorig'].map(room_or_not)
        #self.samples['heigh'] = self.samples['heigh'].replace('', 0)

        try:
            self.samples = self.samples.astype(float)
        except:
            raise ValueError('Unable to convert to float')

        self.results = self.results[self.y]

    
    def _do_sobol(self, second_order):
        m = 2 if second_order else 1
        n = int(len(self.results[self.y]) - floor(len(self.results[self.y]) % (m*problem['num_vars']+2)))
        si = sobol.analyze(self.problem, self.results[self.y].iloc[:n].to_numpy(), 
                print_to_console=True, calc_second_order=second_order)
        return si

    def _do_hdmr(self):
        try:
            si = hdmr.analyze(self.problem, self.samples.to_numpy(), self.results.to_numpy(), K=1,
                print_to_console=True)#, calc_second_order=second_order)
            return si
        except RuntimeError:
            return 0 
        
    def _my_plot_hdmr(self, si):
        c = ['royalblue', 'firebrick']  # 0 for non-important 1 for important
        titles = {
            'Sa': 'Uncorrelated contribution of a term',
            'Sb': 'Correlated contribution of a term',
            'S': 'Total contribution of a particular term (Sa and Sb sum)',
            'ST': f'Total contribution to output ({self.y}) variation'
            }

        for s in ['Sa', 'Sb', 'S', 'ST']:
            plt.close('all')
            fig, ax = plt.subplots()
            ax.set_ylabel(s)
            ax.set_title(titles[s])
            for i, n in enumerate(si['names']):
                if s == 'ST':
                    plt.xscale("log")
                    ax.barh(n, si[s][i], xerr=si[f'{s}_conf'][i], align='center', alpha=0.8, ecolor='black',
                            capsize=5, color=c[int(si['select'][i])])
                else:
                    plt.yscale("log")
                    plt.xticks(rotation=90)
                    ax.bar(n, si[s][i], yerr=si[f'{s}_conf'][i], align='center', alpha=0.8, ecolor='black',
                            capsize=5, color=c[int(si['select'][i])])

            plt.tight_layout()
            plt.savefig(os.path.join(self.dir, 'picts', f'sobol_{s}.png'))

    def main(self, spearman=True):
        if spearman:
            sa = SA_old(self.dir)
            ranks, d_factor = sa.calculate_indvidual_risk()
            sa.plot_ranks(ranks, d_factor)
        self._define_problem()
        self._import_samples()
        self._modify_samples()
        si = self._do_hdmr()
        if si:
            self._my_plot_hdmr(si)


class SA_old:
    def __init__(self, workdir=None):
        self.p = Psql()
        self.j = Json()
        self.dir = workdir if workdir else sys.argv[1]
        self.configs = self.j.read('{}/conf.json'.format(self.dir))
        self.s = Sqlite("{}/aamks.sqlite".format(self.dir))

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
        query = "SELECT soot_yield, hrrpeak, co_yield, alpha, heat_of_combustion, rad_frac, results, fed \
        FROM simulations where project = {} AND scenario_id = {} AND results \
        is not null".format(self.configs['project_id'], self.configs['scenario_id'])
        results = self.p.query(query)

        # create DataFrame with samples. Replace empty results with 0,0
        df = pd.DataFrame(results, columns=['soot yield', 'hrr peak', 'co yield', 'growth rate', 'heat of combustion', 'radiative fraction', 'risk', 'fed'])

        for index, row in df.iterrows():
            row['soot yield'] = float(row['soot yield'])
            row['hrr peak'] = float(row['hrr peak'])
            row['co yield'] = float(row['co yield'])
            row['growth rate'] = float(row['growth rate'])
            row['heat of combustion'] = float(row['heat of combustion'])
            row['radiative fraction'] = float(row['radiative fraction'])
            row['risk'] = json.loads(row['risk'])['individual']
            row['fed'] = sum(json.loads(row['fed']))

        for colname, colvalues in df.items():
            if colname in ['risk', 'fed'] or sum(colvalues.astype(float))==0:
                continue
            ranks.update({colname: spearmanr(colvalues, df['risk'])})
            d_factor.update({colname: spearmanr(colvalues, df['fed'])})

        df.to_csv("{}/picts/sa.csv".format(self.dir))
        return ranks, d_factor
    
    def plot_ranks(self, ranks, d_factor):
        plt.rcdefaults()
        plt.rcParams["figure.figsize"] = [12, 7]
        labels = ranks.keys()
        y_pos = arange(len(labels))
        corr = [i[0] for i in list(ranks.values())]
        pvalue = [i[1] for i in list(ranks.values())]
        corr_d = [i[0] for i in list(d_factor.values())]
        pvalue_d = [i[1] for i in list(d_factor.values())]
        df = pd.DataFrame({'i_risk': corr, 'FED': corr_d}, index=labels)
        ax = df.plot.barh()
        ax.set_yticks(y_pos)
        ax.set_yticklabels(labels)
        ax.invert_yaxis()  # labels read top-to-bottom
        ax.set_xlabel('Spearman Range Correlation Coeficient')
        ax.set_title('Sensitivity analysis')
        
        plt.savefig("{}/picts/spearman.png".format(self.dir))


if __name__ == '__main__':
    s = SensitivityAnalysis()
    s.main()

