import matplotlib as mtl
mtl.use('Agg') 
import json
from collections import OrderedDict
import psycopg2
import seaborn as sns
import numpy as np
import matplotlib.pyplot as plt
import matplotlib.colors as clr
from matplotlib.collections import PatchCollection
from statsmodels.distributions.empirical_distribution import ECDF as ecdf
import matplotlib.ticker as tic
import sys
sys.path.insert(0, '/usr/local/aamks')
import os
import time
import shutil
#from event_tree_en import EventTreeFED
#from event_tree_en import EventTreeSteel
import scipy.stats as stat
import collections
from include import Sqlite
from include import Psql
from matplotlib.patches import Rectangle as rect
import csv
from include import Dump as dd
from math import sqrt
import warnings
import pandas as pd



'''Import all necessary low-level results from DB'''
class GetData:
    def __init__(self, scenario_dir):
        self.dir = scenario_dir
        self.configs = self._get_json(f'{scenario_dir}/conf.json')
        self.horisontal_time=dict({'0': 3, '1': 36, '2': 72, '3': 112, '4': 148, '5': 184, '6': 220})   # ???
        self.p = Psql()
        self.s = Sqlite(f'{self.dir}/aamks.sqlite')
        self.raw = {}

    def _get_json(self, path):
        f = open(path, 'r')
        dump = json.load(f, object_pairs_hook=OrderedDict)
        f.close()
        return dump

    # query DB
    def _quering(self, selects: str, tab='simulations', wheres=[], raw=False, typ='int'):
        base = f"SELECT {selects} FROM {tab} WHERE project = {self.configs['project_id']} AND scenario_id = {self.configs['scenario_id']}"
        q = " AND ".join([base] + wheres)
        results = self.p.query(q)

        if raw:
            return np.array(results)
        elif typ == 'int':
            return np.array([int(i[0]) for i in results])
        elif typ == 'float':
            return np.array([float(i[0]) for i in results])

    def to_csv(self):
        query = f"COPY (SELECT * FROM simulations where project = {self.configs['project_id']} AND scenario_id = {self.configs['scenario_id']}) TO STDOUT WITH CSV DELIMITER ';' HEADER"
        self.p.copy_expert(sql=query, csv_file=os.path.join(self.dir, 'picts','data.csv'))

    def dcbe(self):
        r = self._quering('dcbe_time', wheres=["dcbe_time is not null", "dcbe_time < 9999"])

        self.raw['dcbe'] = r
        return r

    def wcbe_r(self):
        r = self._quering('run_time', wheres=["dcbe_time is not null", "dcbe_time < 9999"])

        self.raw['wcbe_r'] = r
        return r

    def wcbe(self):
        r = self._quering('wcbe',  wheres=["dcbe_time is not null"], raw=True)
        data = []
        dcbe = [json.loads(i[0]) for i in r]
        for i in dcbe:
            for key in i.keys():
                i.update({key: (i[key] + int(self.horisontal_time[key]))})
            item = max(i.values())
            if item > 0:
                data.append(item)
        data = np.array(data)
        self.raw['wcbe'] = data

        return data

    def min_hgt(self):
        r = self._quering('min_hgt_compa * 100', wheres=['min_hgt_compa < 12.8'], typ='float')
    
        self.raw['min_hgt'] = r
        return r

    def min_hgt_cor(self):
        r = self._quering('min_hgt_cor * 100', wheres=['min_hgt_cor < 12.8'], typ='float')
    
        self.raw['min_hgt_cor'] = r
        return r

    def min_vis(self):
        r = self._quering('min_vis_compa', wheres=['min_vis_compa < 60'], typ='float')
    
        self.raw['min_vis'] = r
        return r

    def min_vis_cor(self):
            r = self._quering('min_vis_cor', wheres=['min_vis_cor < 60'], typ='float')
        
            self.raw['min_vis_cor'] = r
            return r

    def max_temp(self):
        data = self._quering('max_temp', wheres=['dcbe_time is not null', 'max_temp < 900'], typ='float')
        dist = getattr(stat, 'norm')
        param = dist.fit(data)

        self.raw['max_temp'] = np.array(data)

        return np.array(data)

    def feds(self):
        r = self._quering('fed, id', wheres=['dcbe_time IS NOT NULL'], raw=True)
        self.raw['feds'] = r

        return r

    def results(self):
        r = self._quering('results', wheres=['dcbe_time IS NOT NULL'], raw=True)
        r_dicts = [json.loads(i[0]) for i in r]

        self.raw['results'] = r_dicts

        return r_dicts  # list(dict)
    
    def fed_der_df(self):
        fed_der_df_data = []
        col_names = ['cell_id', 'x_min', 'x_max', 'y_min', 'y_max', 'samples_number', 'fed_growth_sum']

        self.geometry() if 'geometry' not in self.raw.keys() else None

        for f in range(self.raw['geometry']['floors']+1):
             fed_der_df_data.append(pd.DataFrame(self._quering(', '.join(col_names),
                 tab='fed_growth_cells_data', wheres=[f'floor={f}'], raw=True), columns=col_names))

        self.raw['fed_der_df'] = fed_der_df_data

        return fed_der_df_data

    def geometry(self):
        geom_data = {}

        geom_data['floors'] = int(max(self._quering('DISTINCT floor', tab='fed_growth_cells_data', raw=True)))
        geom_data['area'] = self.s.query('SELECT sum(room_area) as total FROM aamks_geom')[0]['total'] / 10000
        
        for label, prefixes in {'rooms':['r', 'c', 'a'], 'doors':['d'], 'obsts':['t']}.items():
            geom_data[label] = []
            for f in range(geom_data['floors']+1):
                g = []
                for p in prefixes:
                    g.extend(self.s.query(
                    f"SELECT points, type_sec FROM aamks_geom as a WHERE a.floor = '{f}' and a.name LIKE '{p}%';"))
                geom_data[label].append(g)

        self.raw['geometry'] = geom_data

        return geom_data
        

    # ask for all data
    def _all(self):
        self.dcbe()
        self.wcbe()
        self.wcbe_r()
        self.min_hgt()
        self.min_hgt_cor()
        self.min_vis()
        self.min_vis_cor()
        self.max_temp()
        self.feds()
        self.geometry()
        self.fed_der_df()
        self.results()

    # return raw data
    def drop(self, with_fed=True):
        self._all()

        if with_fed:
            return self.raw
        else:
            raw_no_fed = dict(self.raw)
            raw_no_fed.pop('feds')
            return raw_no_fed




'''Classes for calculating values that describe risk in case of fire.
Basic references: Krasuski A., "Multisimulation: Stochastic simulations for the assessment of building fire safety", 2019; Jokman et al. "An overview of quantitative risk measures for loss of life and economic damage", 2003;  Meacham B., Ultimate Health & Safety (UHS) Quantification: Individual and Societal Risk Quantification for Use in National Construction Code (NCC), 2016'''

class RiskScenario:
    def __init__(self, results_from_psql: list, fire_prob=1):
        #self.feds = results_from_psql # raw FEDs for each iteration, floor and agent
        #print('[OK] FED imported')

      #  self.cdffeds = self._rawFED2CDF() # number of death probabilities per agent per iteration (NO FLOOR)
        #print('[OK] CDF of FED calculated')
        self.iterations = results_from_psql    # list of iterations (results from RiskIteration)
        self.n = len(self.iterations) # number of iterations
        self.risks = {}
        self.fire = fire_prob   # fire probability [1/year]


    def calc_scenario(self, key):
        if key in ('pdf_fn', 'fn_curve'):
            scenario_value = []
            n = 0
            while True: 
                try:
                    scenario_value.append(np.mean([i[key][n] for i in self.iterations]) * self.fire)
                except IndexError:
                    break
                n += 1
        else:
            scenario_value = np.mean([i[key] for i in self.iterations]) * self.fire

        self.risks[key] = scenario_value
        
        print(f'[OK] {key} value for whole scenario calculated')

        return scenario_value

    def all(self):
        [self.calc_scenario(k) for k in self.iterations[0].keys()]    # calculate values for scenario

        return self.risks

#    def all(self):
#        # calculate values for iterations if necessary
#        for i in self.iterations:
#            i.all() if not i.risks else None
#        [self.calc_scenario(k) for k in self.iterations[0].risks.keys()]    # calculate values for scenario
#        return self.risks
                        

class RiskIteration:
    def __init__(self, feds_per_floor: list(), calculate=False):
        self.p = self._rawFED2CDF(feds_per_floor) # probabilities of death for agents in THIS iteration
        self.n  = len(self.p)    # number of agents
        self.risks = {}
        if calculate:
            self.all()

    # remove floor division in FED data and process it to P(death) = CDF(ln(FED))
    def _rawFED2CDF(self, feds: dict):
        cdfs = []
        for fed in feds.values():
            with warnings.catch_warnings():     # FED = 0 is interpreted as 0 probability of death
                warnings.simplefilter('ignore')
                cdfs.extend(stat.norm.cdf(np.log(fed)))
                
        return cdfs

    # probability of randomly taken person been found dead in case of fire
    def individual(self):
        ind = sum(self.p) / self.n

        self.risks['individual'] = ind
        return ind

    # PDF of x people been found dead in case of fire
    def pdf_fn(self, mc=True):
        fn = self._pdf_fn_mc() if mc else self._pdf_fn_comb()

        self.risks['pdf_fn'] = list(fn)

        return list(fn)

    # assess the probability of x deads in fire with MC sampling
    def _pdf_fn_mc(self, rmse_threshold=0.01):
        def calc_rmse(p: float, n: float): return sqrt(p * (1 - p) / n)
        def ask_the_moirai(feds: list): return np.random.binomial(1, p=feds)

        #print('MonteCarlo assesment of PDF for FN in progress...', end='\r')
        fn_mc = np.array([0] * (self.n + 1))
        rmse = [1] * (self.n + 1)

        # draw samples from LN distributions of death untill RMSE threshold is met but at least
        i = 1
        while any([i < self.n, max(rmse) > rmse_threshold]):
            # draw a sample
            n_deads = sum([ask_the_moirai(agent) for agent in self.p])

            # update PDF
            fn_mc = fn_mc * (i-1)/i
            fn_mc[n_deads] += 1/i

            # calculate RMSE
            rmse = [calc_rmse(fn, i) for fn in fn_mc]

#            if max(rmse) > rmse_threshold:
#                print(f'{i} {max(rmse)}', end='\r')
#            elif not any([i < self.n, max(rmse) > rmse_threshold]):
#                print(i)
            i += 1
        #print(f'RMSE of PDF values{rmse}')

        return fn_mc#, rmse
        
    def _pdf_fn_comb(self):
        fn_comb = []
        for x in range(self.n + 1): 
            fnx = []
            combo = list(comb(self.p, x)) # all combinations of dead agents 
            for dead in combo:
                dead = list(dead)
                alive = [1 - a for a in self.p]     # assuming all agents are alive
                [alive.remove(1 - d) for d in dead]   # remove dead from alive list
                fnx.append(prod(dead + alive))
            fn_comb.append(sum(fnx))
        
        if round(sum(fn_comb), 4) != 1:
            raise ValueError('Integral of PDF is not equal to 1')

        return fn_comb  

    # complementary cumulated distribution function of x people been found dead in case of fire
    def fn_curve(self):
        if 'pdf_fn' not in self.risks.keys():
            self.pdf_fn()

        fn_c = [sum(self.risks['pdf_fn'][i:]) for i in range(self.n)]

        self.risks['fn_curve'] = fn_c
        return fn_c

    # integral of pdf_fn multiplied by aversion-of-risk factor (ranges from 1 to 2, default 1.4 [Jokman et al. 2003])
    # RI_COMAH
    def societal(self, aversion=1.4):
        if 'pdf_fn' not in self.risks.keys():
            self.pdf_fn()
        
        #soc = integ.trapezoid([i ** aversion * fn for i, fn in enumerate(self.risks['pdf_fn'])])
        soc = sum([i ** aversion * fn for i, fn in enumerate(self.risks['pdf_fn'])])

        self.risks['societal'] = soc
        return soc

    # aggregadet weighted risk
    def awr(self):
        if 'individual' not in self.risks.keys():
            self.individual()

        awr_val = self.risks['individual'] * self.n

        self.risks['awr'] = awr_val
        
        return awr_val

    # scaled risk integral [time of area beeing occupied by self.n people]
    def sri(self, time=1):
        if 'individual' not in self.risks.keys():
            self.individual()

        sri_val = (self.n + self.n ** 2) / 2 * self.risks['individual'] #* time * area

        self.risks['sri'] = sri_val
        return sri_val

    # calculate risks for iteration, i - number of iteration
    def all(self):
        # individual risk
        self.individual()

        #societal risk
        self.pdf_fn()
        self.fn_curve()
        self.societal()
        self.awr()
        self.sri()
        
        return self.risks
    
    def export(self):
        return json.dumps(self.risks)


'''Calculations of FED absorption heatmap
based on previously processed results from fed_growth_cells_data table'''
class Heatmap:
    def __init__(self, fed_growth_data: pd.DataFrame, geom: dict, n_iter = int):
        self.data = fed_growth_data
        self.geom = geom
        self.n_iter = n_iter

        self.plot = {'range': 0, 'floors': [{} for i in range(geom['floors']+1)]}
    
    def calc(self):
        for f, df in enumerate(self.plot['floors']):
            df['xes'] = np.array(sorted([min(self.data[f]['x_min']), *self.data[f]['x_max'].unique()]))
            df['yes'] = np.array(sorted([min(self.data[f]['y_min']), *self.data[f]['y_max'].unique()]))
            df['data'] = self.data[f][['x_max', 'y_max', 'fed_growth_sum']].pivot(columns='x_max',
                    index='y_max').astype(float).fillna(-1).apply(lambda x: x/self.n_iter).to_numpy()

            self.plot['range'] = max(df['data'].max(), self.plot['range'])

        return self.plot


'''Event Tree class'''
class EventTreeFED:
    def __init__(self, scenario_dir):
        self.dir = scenario_dir
        self.branches = {
                'ignition': ['Fire ignition', 1e-5],
                'selfputout': ['Early suppresion', 0.05],
                'fat': ['Fatalities?', 0.01],
                'fat10': ['>10 fatalities?', 0.002],
                'fat100': ['>100 fatalities?', 0.0004]
                }


    def draw(self):
        fig = plt.figure(figsize=(10, 5))
        ax = fig.add_axes([0, 0, 1.0, 1])

        # add frame
        p = rect((0.05, 0.1), 0.765, 0.693, fill=False, transform=ax.transAxes, clip_on=False)
        ax.add_patch(p)

        # add headers
        for i, head in enumerate(self.branches.keys()):
            left, width = .05+i/6.5, .15
            bottom, height = .8, .10
            right = left + width
            top = bottom + height

            p = rect((left, bottom), width, height, fill=False, transform=ax.transAxes, clip_on=False)
            ax.text(0.5 * (left + right), 0.5 * (bottom + top), self.branches[head][0], horizontalalignment='center', verticalalignment='center',
                    fontsize=12, color='blue', transform=ax.transAxes)
            ax.add_patch(p)

        # add latest column
        p = rect((0.818, 0.8), 0.16, 0.10, fill=False, transform=ax.transAxes, clip_on=False)
        ax.text(0.5 * 1.8, 0.5 * 1.7, 'Probability', horizontalalignment='center', verticalalignment='center',
                    fontsize=12, color='black', transform=ax.transAxes)
        ax.add_patch(p)


        general = [[0.1, 1.1], [0.3, 0.3], 'P = {}'.format(self.branches['ignition'][1])]
        ax.plot(general[0], general[1], linewidth=2)
        ax.text(0.3, 0.32, 'YES')
        ax.text(0.3, 0.25, general[2])

        simple_div = [[1.1, 1.1], [0.1, 0.5]]
        ax.plot(simple_div[0], simple_div[1], color='b', linewidth=2)

        suppressed = [[1.1, 4.4], [0.5, 0.5], 'P = {}'.format(self.branches['selfputout'][1])]
        ax.plot(suppressed[0], suppressed[1], linewidth=2, color='g')
        ax.text(1.5, 0.52, 'YES')
        ax.text(1.5, 0.45, suppressed[2])

        suppressed = [[1.1, 2.2], [0.1, 0.1], 'P = {}'.format(1-self.branches['selfputout'][1])]
        ax.plot(suppressed[0], suppressed[1], linewidth=2, color='b')
        ax.text(1.5, 0.12, 'NO')
        ax.text(1.5, 0.05, suppressed[2])

        simple_div = [[2.2, 2.2], [-0.1, 0.3]]
        ax.plot(simple_div[0], simple_div[1], color='b', linewidth=2)

        dcbe = [[2.2, 4.4], [0.3, 0.3], 'P = {}'.format('%.3f' % (self.branches['fat'][1]))]
        ax.plot(dcbe[0], dcbe[1], linewidth=2, color='g')
        ax.text(2.5, 0.32, 'YES')
        ax.text(2.5, 0.25, dcbe[2])

        dcbe = [[2.2, 3.3], [-0.1, -0.1], 'P = {}'.format(1-self.branches['fat'][1])]
        ax.plot(dcbe[0], dcbe[1], linewidth=2, color='b')
        ax.text(2.5, -0.08, 'NO')
        ax.text(2.5, -0.15, dcbe[2])

        simple_div = [[3.3, 3.3], [-0.325, 0.115]]
        ax.plot(simple_div[0], simple_div[1], color='b', linewidth=2)



#        c = patches.Ellipse(xy=(0.671, 0.159), width=0.02, height=0.04, fill=True, transform=ax.transAxes, clip_on=False, color='b')
#        ax.add_patch(c)
#        p1 = float(self.p_general) * self.p_develop * self.p_dcbe * fed
#        ax.text(4.65, -0.335, r'$P_4 =  %.2E$' % Decimal(p1))
#
#        c = patches.Ellipse(xy=(0.671, 0.442), width=0.02, height=0.04, fill=True, transform=ax.transAxes, clip_on=False, color='g')
#        ax.add_patch(c)
#        p = float(self.p_general) * self.p_develop * self.p_dcbe * (1- self.p_fed_f)
#        ax.text(4.65, 0.094, r'$P_3 =  %.2E$' % Decimal(p))
#
#        c = patches.Ellipse(xy=(0.671, 0.562), width=0.02, height=0.04, fill=True, transform=ax.transAxes, clip_on=False, color='g')
#        ax.add_patch(c)
#        p2 = float(self.p_general) * self.p_develop * (1 - self.p_dcbe) 
#        ax.text(4.65, 0.29, r'$P_2 =  %.2E$' % Decimal(p2))
#
#        c = patches.Ellipse(xy=(0.671, 0.687), width=0.02, height=0.04, fill=True, transform=ax.transAxes, clip_on=False, color='g')
#        ax.add_patch(c)
#        p = float(self.p_general) * (1 - self.p_develop)
#        ax.text(4.65, 0.48, r'$P_1 =  %.2E$' % Decimal(p))

        fig.savefig(os.path.join(self.dir, 'picts', 'tree.png'))



'''Basic plot class, containes all types of plots we use and their settings'''
class Plot:
    def __init__(self, scenario_dir):
        self.dir = scenario_dir

    # when data is list of P(N) and indexes are N values
    def pdf_n(self, data, path=None, label=None):
        fig, ax = plt.subplots()
        ax.bar(range(len(data)), data)

        ax.set_xlabel(label[0])
        ax.set_ylabel(label[1])

        fig.tight_layout()
        if path:
            fig.savefig(os.path.join(self.dir, 'picts', f'{path}.png'))
        plt.clf()

    # PDF from datapoints
    def pdf(self, data, path=None, label=None):
        plot = sns.displot(data, cumulative=False, stat='density', bins=50)
        if label:
            plot.set_axis_labels(*label)
        fig = plot.fig
        fig.tight_layout()
        if path:
            fig.savefig(os.path.join(self.dir, 'picts', f'{path}.png'))
        plt.clf()

    # CDF  of data
    def cdf(self, data, path=None, label=None):
        plot = sns.displot(data, cumulative=True, kde=True, stat='density', bins=50, fill=True, kde_kws={'cut': 2})
        if label:
            plot.set_axis_labels(*label)
        fig = plot.fig
        fig.tight_layout()
        if path:
            fig.savefig(os.path.join(self.dir, 'picts', f'{path}.png'))
        plt.clf()

    # FN_curve of data set x
    def fn_curve(self, data, path=None, label=None):
        #lims = [0, 10]    #[xmax, ymin]

        fig, ax = plt.subplots()
        ax.plot(data, '-')

        # axis labels
        ax.set_xlabel(label[0])
        ax.set_ylabel(label[1])
        
        # axis formatting
        ax.semilogx()
        ax.semilogy()
        ax.grid(which='both')
        ax.yaxis.set_major_formatter('{x}')
        ax.xaxis.set_major_formatter(tic.ScalarFormatter())
        ax.set_xlim(left=1, right=len(data))
        ax.set_ylim(bottom=min([i if i>0 else 2 for i in data]), top=1)
        fig.tight_layout()

        if path:
            fig.savefig(os.path.join(self.dir, 'picts', f'{path}.png'))
        
        plt.clf()

    # pie chart
    def pie(self, fatal_scenarios_rate):
        fig = plt.figure()
        sizes = [1 - fatal_scenarios_rate, fatal_scenarios_rate]
        labels = ['Failure', 'Success']
        colors = ['lightcoral', 'lightskyblue']
        explode = (0.1, 0)
        plt.pie(sizes, explode=explode, labels=labels, colors=colors, autopct='%1.1f%%', shadow=True)
        plt.axis('equal')
        fig.savefig(os.path.join(self.dir, 'picts', 'pie_fault.png'))
        plt.clf()

    # plot heatmap of FED absorption
    def heatmap(self, hm: Heatmap, lab='Total FED absorbed in cell [-]'):
        for f in range(hm.geom['floors']+1):
            # initial figure definition
            fig = plt.figure()
            ax = fig.add_subplot(111)

            # colors
            my_cmap = mtl.colors.LinearSegmentedColormap.from_list('', ['white', 'coral', 'darkred'])
            colors = {'ROOM': '#8C9DCE', 'COR': '#385195', 'HALL': '#DBB55B', 'CONTOUR': '#000000', 
                    'DOOR': mtl.colors.rgb2hex(my_cmap(0)), 'OBSTACLE': '#707070'}
            
            # plot fed growth data
            dat = hm.plot['floors'][f]
            c = ax.pcolormesh(dat['xes'], dat['yes'], dat['data'], cmap=my_cmap, vmax=hm.plot['range'])

            # add geometry entities to patches and plot them
            patches = []
            def pts2rect(pts):
                xys = list(zip(*json.loads(pts)))
                return tuple(min(xys[i]) for i in range(2)), max(xys[0]) - min(xys[0]), max(xys[1]) - min(xys[1])

            for room in hm.geom['rooms'][f]:
                patches.append(rect(*pts2rect(room['points']), lw=1.5, edgecolor=colors['CONTOUR'], fill=None))
            for door in hm.geom['doors'][f]:
                patches.append(rect(*pts2rect(door['points']), lw=1.5, edgecolor=None, facecolor=colors['DOOR']))
            for obst in hm.geom['obsts'][f]:
                patches.append(rect(*pts2rect(obst['points']), lw=1.5, edgecolor=None, facecolor=colors['OBSTACLE']))

            ax.add_collection(PatchCollection(patches, match_original=True))

            # figure settings
            plt.gca().axes.get_xaxis().set_visible(False)
            plt.gca().axes.get_yaxis().set_visible(False)
            plt.xlim([dat['xes'].min() - 100, dat['xes'].max() + 100])
            plt.ylim([dat['yes'].min() - 100, dat['yes'].max() + 100])
            ax.set_ylim(ax.get_ylim()[::-1])
            ax.set_title(f'Level {f}')
            ax.set_xlabel('x axis')
            ax.set_ylabel('y axis')
            plt.gca().set_aspect('equal', adjustable='box')
            fig.colorbar(c, ax=ax, fraction=0.03, pad=0.04, label=lab)
            fig.tight_layout()
            
            # save figure
            fig.savefig(os.path.join(self.dir, 'picts', f'floor_{f}.png'))#, dpi=170)
            plt.clf()


'''Generating plots and results visualization - the head class'''
class PostProcess:
    def __init__(self):
        self.dir = sys.argv[1] if len(sys.argv) > 1 else os.getenv('AAMKS_PROJECT')
        self.gd = GetData(self.dir)
        self.data = {**self.gd.drop(with_fed=False), **RiskScenario(self.gd.raw['results']).all()} # results for THE SCENARIO
        self.n = len(self.gd.raw['feds'])  # number of finished iterations taken for results analysis
        self.probs = []#{}

        self.plot_type = {
                'pdf':[
                    {'name':'wcbe_r','lab':['Required Safe Egress Time - Run Time [s]', 'PDF [-]']}
                    ], 
                'pdf_n':[
                    {'name':'pdf_fn', 'lab':['Number of fatalities [-]', 'Density [-]']},
                    ], 
                'cdf':[
                    {'name':'dcbe', 'lab':['Available Safe Egress Time [s]', 'CDF [-]']},
                    {'name':'wcbe', 'lab':['Required Safe Egress Time [s]', 'CDF [-]']},
                    {'name':'min_hgt', 'lab':['Minimum Upper Layer Height [cm]', 'CDF [-]']},
                    {'name':'min_hgt_cor', 'lab':['Minimum Upper Layer Height in Corridors [cm]', 'CDF [-]']},
                    {'name':'min_vis', 'lab':['Minimum Visibility [m]', 'CDF [-]']},
                    {'name':'min_vis_cor', 'lab':['Minimum Visibility in Corridors [m]', 'CDF [-]']},
                    {'name':'max_temp', 'lab':['Maximum Hot Gas Temperature [°C]', 'CDF [-]']}
                    ], 
                'fn_curve':[
                    {'name':'fn_curve', 'lab':['Number of fatalities [-]', 'Frequency [-]']}
                    ]
                }


    # draw ETA for fatalities
    def plant(self):
        t = EventTreeFED(self.dir)
        t.draw()

    # save data
    def save(self):
        self.gd.to_csv()
        self._summarize()
        self._to_txt()

    # add some summaries to self.data
    def _summarize(self):
        # https://stats.stackexchange.com/questions/267432/coefficient-of-overlapping-ovl-for-two-distributions
        def ovl(samp1, samp2, number_bins=1000):
            arr1 = stat.gaussian_kde(samp1)
            arr2 = stat.gaussian_kde(samp2)

            positions = np.arange(int(max(*samp1, *samp2)*1.2))
            arr1(positions)
            arr2(positions)
            fig, ax = plt.subplots()
            sax = ax.twinx()
            ax.hist(samp1, color='lightcoral', label='RSET')
            sax.plot(positions, arr1(positions), color='darkred', label='RSET')
            ax.hist(samp2, color='lightskyblue', label='ASET')
            sax.plot(positions, arr2(positions), color='dodgerblue', label='ASET')
            ax.legend()
            sax.legend(framealpha=0)
            ax.set_xlabel('Time [s]')
            sax.set_ylabel('KDE [-]')
            ax.set_ylabel('Frequency [-]')
            fig.tight_layout()
            fig.savefig(os.path.join(self.dir, 'picts', 'overlap.png'))
            

            # Determine the range over which the integration will occur
            min_value = np.min((samp1.min(), samp2.min()))
            max_value = np.min((samp1.max(), samp2.max()))

            # Determine the bin width
            bin_width = (max_value-min_value)/number_bins
            #For each bin, find min frequency
            lower_bound = min_value #Lower bound of the first bin is the min_value of both arrays
            min_arr = np.empty(number_bins) #Array that will collect the min frequency in each bin
            for b in range(number_bins):
                higher_bound = lower_bound + bin_width #Set the higher bound for the bin

                #Determine the share of samples in the interval
                min_arr[b] = min(*[i.integrate_box_1d(lower_bound, higher_bound) for i in [arr1, arr2]])
                #Conserve the lower frequency
                lower_bound = higher_bound #To move to the next range
            return min_arr.sum()    

        def stats(x_smp: list):
            return np.mean(x_smp), np.std(x_smp)

        self.data['summary'] = {
                'date': time.time,
                'rset': stats(self.data['wcbe']),
                'aset': stats(self.data['dcbe']),
                'ovl': ovl(self.data['wcbe'], self.data['dcbe']),
                'height': stats(self.data['min_hgt']),
                'hgt': stats(self.data['max_temp']),
                'vis': stats(self.data['min_vis'])
                }

    # save data to TXT file
    def _to_txt(self):
        to_write = [
                '# MULTISIMULATION RESULTS SUMMARY',
                f'## Number of iterations: {self.n}',
                #f'##This multisimulation was launched at {self.data["summary"]["date"]}',
                '# RISK INDICIES',
                '## all those can be furhter multiplied by probability of fire [1/year]',
                '##Individual [-]',
                f'{self.data["individual"]}',
                '## Societal (WRI) [fatalities]',
                f'{self.data["societal"]}',
                '## Societal (AWR) [fatalities]',
                f'{self.data["awr"]}',
                '## Societal (SRI) - T=1 [(fatalities + fatalities^2)/(m^2 * year)] (to be multiplied by time share)',
                f'{self.data["sri"]/self.data["geometry"]["area"]}',
                '# EVACUATION TIME',
                '## RSET mean and standard deviation value [s]',
                f'{self.data["summary"]["rset"][0]},{self.data["summary"]["rset"][1]}',
                '## ASET mean and standard deviation value [s]',
                f'{self.data["summary"]["aset"][0]},{self.data["summary"]["aset"][1]}',
                '## Overlapping Index of ASET and RSET distributions',
                f'{self.data["summary"]["ovl"]}',
                '# FIRE CHARACTERISTICS',
                '## Maximum upper gas layer temperature mean and standard deviation value [°C]',
                f'{self.data["summary"]["hgt"][0]},{self.data["summary"]["hgt"][1]}',
                '## Minimum neutral plane height mean and standard deviation value [cm]',
                f'{self.data["summary"]["height"][0]},{self.data["summary"]["height"][1]}',
                '## Minimum visibility mean and standard deviation value [m]',
                f'{self.data["summary"]["vis"][0]},{self.data["summary"]["vis"][1]}',
                ]

        with open(os.path.join(self.dir, 'picts', 'data.txt'), 'w') as g: 
            g.write('\n'.join(to_write))

    # produce standard postprocess content
    def produce(self):
        if os.path.exists(f'{self.dir}/picts'):
            shutil.rmtree(f'{self.dir}/picts')
        os.makedirs(f'{self.dir}/picts')

        def tm(x): 
            print(f'{x}: {time.time() - self.t}')
            self.t = time.time()
        p = Plot(self.dir)
        tm('Plot')
        h = Heatmap(self.data['fed_der_df'], self.data['geometry'], self.n)
        tm('Heatmap')
        h.calc()
        tm('heatmap calc')
        p.heatmap(h)
        tm('plot heat')
        [p.cdf(self.data[d['name']], path=d['name'], label=d['lab']) for d in self.plot_type['cdf']]
        tm('plot cdf')
        [p.pdf(self.data[d['name']], path=d['name'], label=d['lab']) for d in self.plot_type['pdf']]
        tm('plot pdf')
        [p.pdf_n(self.data[d['name']], path=d['name'], label=d['lab']) for d in self.plot_type['pdf_n']]
        tm('plot pdf_n')
        [p.fn_curve(self.data[d['name']], path=d['name'], label=d['lab']) for d in self.plot_type['fn_curve']]
        tm('plot fn_curve')
        p.pie(self.data['pdf_fn'][0])
        tm('plot pie')

        self.plant()
        tm('plant trees')

        self.save()
        tm('save')
        

if __name__ == '__main__':
    pp = PostProcess()
    pp.t = time.time()
    pp.produce()

    


