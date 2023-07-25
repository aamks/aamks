import matplotlib as mtl
mtl.use('Agg') 
import json
from collections import OrderedDict
import psycopg2
import seaborn as sns
import numpy as np
import matplotlib.pyplot as plt
import matplotlib.colors as clr
import matplotlib
from matplotlib.collections import PatchCollection
from statsmodels.distributions.empirical_distribution import ECDF as ecdf
import matplotlib.ticker as tic
import sys
sys.path.insert(0, '/usr/local/aamks')
import os
import time
import shutil
from event_tree_en import EventTreeFED
from event_tree_en import EventTreeSteel
import scipy.stats as stat
import collections
from include import Sqlite
from include import Psql
from matplotlib.patches import Rectangle
import csv
from include import Dump as dd
from math import sqrt
import warnings



'''Import all necessary low-level results from DB'''
class GetData:
    def __init__(self, scenario_dir):
        self.dir = scenario_dir
        self.configs = self._get_json(f'{scenario_dir}/conf.json')
        self.horisontal_time=dict({'0': 3, '1': 36, '2': 72, '3': 112, '4': 148, '5': 184, '6': 220})   # ???
        self.p = Psql()
        self.raw = {}

    def _get_json(self, path):
        f = open(path, 'r')
        dump = json.load(f, object_pairs_hook=OrderedDict)
        f.close()
        return dump

    # query DB
    def _quering(self, selects: str, wheres=[], raw=False, typ='int'):
        base = f"SELECT {selects} FROM simulations WHERE project = {self.configs['project_id']} AND scenario_id = {self.configs['scenario_id']}"
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

    def area(self):
        s = Sqlite(f'{self.dir}/aamks.sqlite')
        r = s.query('SELECT sum(room_area) as total FROM aamks_geom')[0]['total'] / 10000

        self.raw['area'] = r 
        return r

    
    def feds(self):
        r = self._quering('fed, id', wheres=['dcbe_time IS NOT NULL'], raw=True)
        self.raw['feds'] = r

        return r

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
        self.area()
        self.feds()

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
    def __init__(self, feds: list(), fire_prob=1):
        self.feds = feds # raw FEDs for each iteration, floor and agent
        print('[OK] FED imported')

        self.cdffeds = self._rawFED2CDF() # number of death probabilities per agent per iteration (NO FLOOR)
        print('[OK] CDF of FED calculated')
        self.n = len(self.cdffeds) # number of iterations
        self.iterations = [RiskIteration(i, calculate=True) for i in self.cdffeds]    # list of iterations (RiskIteration objects)
        print('[OK] Iterations analyzed')
        self.risks = {}
        self.fire = fire_prob   # fire probability [1/year]

    # remove floor division in FED data and process it to P(death) = CDF(ln(FED))
    def _rawFED2CDF(self):
        cdfs = []
        for i in self.feds:
            cdf_i = []
            for floor in json.loads(i[0]).values():
                with warnings.catch_warnings():     # FED = 0 is interpreted as 0 probability of death
                    warnings.simplefilter('ignore')
                    cdf_i.extend(stat.norm.cdf(np.log(floor)))
            cdfs.append(cdf_i)
                
        return cdfs

    def calc_scenario(self, key):
        if key in ('pdf_fn', 'fn_curve'):
            scenario_value = []
            n = 0
            while True: 
                try:
                    scenario_value.append(np.mean([i.risks[key][n] for i in self.iterations]) * self.fire)
                except IndexError:
                    break
                n += 1
        else:
            scenario_value = np.mean([i.risks[key] for i in self.iterations]) * self.fire

        self.risks[key] = scenario_value
        
        print(f'[OK] {key} value for whole scenario calculated')

        return scenario_value

    def all(self):
        # calculate values for iterations if necessary
        for i in self.iterations:
            i.all() if not i.risks else None
        [self.calc_scenario(k) for k in self.iterations[0].risks.keys()]    # calculate values for scenario
        return self.risks
                        

class RiskIteration:
    def __init__(self, deathprobs: list(), calculate=False):
        self.p = deathprobs # probabilities of death for agents in THIS iteration
        self.n  = len(deathprobs)
        self.risks = {}
        if calculate:
            self.all()

    # probability of randomly taken person been found dead in case of fire
    def individual(self):
        ind = sum(self.p) / self.n

        self.risks['individual'] = ind
        return ind

    # PDF of x people been found dead in case of fire
    def pdf_fn(self, mc=True):
        fn = self.pdf_fn_mc() if mc else self.pdf_fn_comb()

        self.risks['pdf_fn'] = fn
        return fn

    # assess the probability of x deads in fire with MC sampling
    def pdf_fn_mc(self, rmse_threshold=0.01):
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

            if max(rmse) > rmse_threshold:
                print(f'{i} {max(rmse)}', end='\r')
            elif not any([i < self.n, max(rmse) > rmse_threshold]):
                print(i)
            i += 1
        #print(f'RMSE of PDF values{rmse}')

        return fn_mc#, rmse
        
    def pdf_fn_comb(self):
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
    def sri(self, time):
        pass    # to be developed

        if 'individual' not in self.risks.keys():
            self.individual()

        sri_val = (self.n + self.n ** 2) / 2 * self.risks['individual'] * time * self.risks['area']

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
        #self.sri()
        
        return self.risks


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


'''Heatmap of FED absorption'''
#[WK] continue from here
class Heatmap:
    def __init__(self, scenario_dir, fed_growth):
        self.dir = scenario_dir
        self.fed_growth

    def plot(self):
        aamks_sqlite = Sqlite(f'{self.dir}/aamks.sqlite')
        postgresql_query = "SELECT distinct floor from fed_growth_cells_data where scenario_id = {} and project_id = {}".format(
            self.configs['scenario_id'], self.configs['project_id'])
        floors = self.p.query(postgresql_query)
        # position_fed_db = Sqlite("{}/fed_mesh.sqlite".format(self.dir))
        # floors = results[0]
        # floors = position_fed_db.query("SELECT DISTINCT floor_number from mesh_cells")

        for floor in floors:
            patches = []
            x_mesh_size = self.p.query(
                "SELECT DISTINCT x_max from fed_growth_cells_data where floor = {} and scenario_id = {} and project_id = {}".format(
                    floor['floor'], self.configs['scenario_id'], self.configs['project_id']))
            y_mesh_size = self.p.query(
                "SELECT DISTINCT y_max from fed_growth_cells_data where floor = {} and scenario_id = {} and project_id = {}".format(
                    floor['floor'], self.configs['scenario_id'], self.configs['project_id']))
            mesh_cells_table_one_floor = self.p.query(
                "SELECT cell_id, x_min, x_max, y_min, y_max, samples_number, fed_growth_sum from fed_growth_cells_data where floor = {} and scenario_id = {} and project_id = {}".format(
                    floor['floor'], self.configs['scenario_id'], self.configs['project_id']))
            samples_count = sum([x['samples_number'] for x in mesh_cells_table_one_floor])
            avg_samples_count_per_cell = samples_count / len(mesh_cells_table_one_floor)
            avg_fed_growth = []

            for cell in mesh_cells_table_one_floor:
                if cell['samples_number'] < avg_samples_count_per_cell:
                    cell.append(0)
                else:
                    cell.append(cell['fed_growth_sum'] / cell['samples_number'])

            rooms = aamks_sqlite.query(
                "SELECT points, type_sec FROM aamks_geom as a WHERE a.floor = '{}' and (a.name LIKE 'r%' or a.name LIKE 'c%' or a.name LIKE 'a%');".format(
                    floor['floor']))
            doors = aamks_sqlite.query(
                "SELECT points, type_sec FROM aamks_geom as a WHERE a.floor = '{}' and (a.name LIKE 'd%');".format(
                    floor['floor']))
            obstacles = aamks_sqlite.query(
                "SELECT points, type_sec FROM aamks_geom as a WHERE a.floor = '{}' and (a.name LIKE 't%');".format(
                    floor['floor']))  

            fig = plt.figure()
            plt.grid(False)

            # hide figure axes
            plt.gca().axes.get_xaxis().set_visible(False)
            plt.gca().axes.get_yaxis().set_visible(False)

            ax = fig.add_subplot(111)
            cmap = matplotlib.cm.get_cmap('Reds')
            light_red = cmap(0)
            colors = {'ROOM': '#8C9DCE', 'COR': '#385195', 'HALL': '#DBB55B', 'CONTOUR': '#000000', 'DOOR': matplotlib.colors.rgb2hex(light_red), 'OBSTACLE': '#707070'}
            
            max_fed_growth = float(max([cell[7] for cell in mesh_cells_table_one_floor]))
            no_fed_growth = False;

            if max_fed_growth == 0:
                no_fed_growth = True;
                max_fed_growth = 1

            for cell in mesh_cells_table_one_floor:
                height = cell['y_max'] - cell['y_min']
                width = cell['x_max'] - cell['x_min']
                patches.append(
                    matplotlib.patches.Rectangle((cell['x_min'], cell['y_min']), width, height,
                                                 facecolor=clr.to_hex(
                                                        list(cmap(float(cell[7]) / max_fed_growth))),
                                                 edgecolor=None,
                                                 alpha=1))

            for room in rooms:
                y = json.loads(room['points'])
                x_set = list(x[0] for x in json.loads(room['points']))
                y_set = list(x[1] for x in json.loads(room['points']))
                x_min = min(x_set)
                y_min = min(y_set)
                height = max(y_set) - min(y_set)
                width = max(x_set) - min(x_set)
                patches.append(
                    matplotlib.patches.Rectangle((x_min, y_min), width, height, lw=1.5,
                                                 edgecolor=colors['CONTOUR'], fill=None))

            for door in doors:
                y = json.loads(door['points'])
                x_set = list(x[0] for x in json.loads(door['points']))
                y_set = list(x[1] for x in json.loads(door['points']))
                x_min = min(x_set)
                y_min = min(y_set)
                height = max(y_set) - min(y_set)
                width = max(x_set) - min(x_set)
                patches.append(
                    matplotlib.patches.Rectangle((x_min, y_min), width, height, lw=1.5,
                                                 edgecolor=None,
                                                 facecolor=colors['DOOR']))

            for obstacle in obstacles:
                y = json.loads(obstacle['points'])
                x_set = list(x[0] for x in json.loads(obstacle['points']))
                y_set = list(x[1] for x in json.loads(obstacle['points']))
                x_min = min(x_set)
                y_min = min(y_set)
                height = max(y_set) - min(y_set)
                width = max(x_set) - min(x_set)
                patches.append(
                    matplotlib.patches.Rectangle((x_min, y_min), width, height, lw=1.5,
                                                 edgecolor=None,
                                                 facecolor=colors['OBSTACLE']))


            ax.add_collection(PatchCollection(patches, match_original=True))
            x_min = min([cell['x_min'] for cell in mesh_cells_table_one_floor])
            x_max = max([cell['x_max'] for cell in mesh_cells_table_one_floor])
            y_min = min([cell['y_min'] for cell in mesh_cells_table_one_floor])
            y_max = max([cell['y_max'] for cell in mesh_cells_table_one_floor])
            plt.xlim([x_min - 100, x_max + 100])
            plt.ylim([y_min - 100, y_max + 100])
            ax.set_ylim(ax.get_ylim()[::-1])
            ax.set_title("floor {}".format(floor['floor']))
            ax.set_xlabel('x axis')
            ax.set_ylabel('y axis')
            plt.gca().set_aspect('equal', adjustable='box')
            #fig.a.set_visible(False)

            fed_list_2_d = [[0 for y in y_mesh_size] for x in x_mesh_size]
            for i in range(len(fed_list_2_d)):
                for j in range(len(fed_list_2_d[0])):
                    fed_list_2_d[i][j] = float(mesh_cells_table_one_floor[j + i * len(y_mesh_size)][7])

            c = ax.pcolormesh(fed_list_2_d, cmap='Reds')

            if no_fed_growth == True:
                fed_list_2_d[0][0] = 0.1
                c = ax.pcolormesh(fed_list_2_d, cmap='Reds')

            fig.colorbar(c, ax=ax, fraction=0.046, pad=0.04)
            fig.savefig('{}/picts/floor_{}.png'.format(self.dir, floor['floor']), dpi=170)



'''Generating plots and results visualization - the head class'''
class PostProcess:
    def __init__(self):
        self.dir = sys.argv[1]
        self.gd = GetData(self.dir)
        self.data = {**self.gd.drop(with_fed=False), **RiskScenario(self.gd.raw['feds']).all()} # results for THE SCENARIO
        self.probs = []#{}

        self.plot_type = {
                'pdf':[
                    {'name':'wcbe_r','lab':['Required Safe Egress Time - Run Time [s]', 'PDF [-]']}
                    ], 
                'pdf_n':[
                    {'name':'pdf_fn', 'lab':['Number of fatalities', 'PDF [-]']},
                    ], 
                'cdf':[
                    {'name':'dcbe', 'lab':['Available Safe Egress Time [s]', 'CDF [-]']},
                    {'name':'wcbe', 'lab':['Required Safe Egress Time', 'CDF [-]']},
                    {'name':'min_hgt', 'lab':['Minimum Upper Layer Height [cm]', 'CDF [-]']},
                    {'name':'min_hgt_cor', 'lab':['Minimum Upper Layer Height in Corridors [cm]', 'CDF [-]']},
                    {'name':'min_vis', 'lab':['Minimum Visibility [m]', 'CDF [-]']},
                    {'name':'min_vis_cor', 'lab':['Minimum Visibility in Corridors [m]', 'CDF [-]']},
                    {'name':'max_temp', 'lab':['Maximum Hot Gas Temperature [°C]', 'CDF [-]']}
                    ], 
                'fn_curve':[
                    {'name':'fn_curve', 'lab':['Number of fatalities', 'Frequency']}
                    ]
                }


    # draw ETA for fatalities
    def plant(self):
        fig = plt.figure()
        plt.plot([0],[0])
        fig.savefig(os.path.join(self.dir, 'picts', 'tree_f.png'))
        return 0 

        t = EventTreeFED(building=post.dir, p_general=post.probs[0], p_develop=post.probs[2], p_dcbe=post.probs[1], p_fed_f=post.probs[3], mode='f')
        t.draw()

    # save data
    def save(self):
        self.gd.to_csv()
        self.to_txt()

    # add some summaries to self.data
    def summarize(self):
        pass

    # save data to TXT file
    def to_txt(self):
        with open(os.path.join(self.dir, 'picts', 'data.txt'), 'w') as g: 
#            dcbe_val = p.dcbe_values()
#            g.write("DCBE - PER: {}, MEAN: {}".format(dcbe_val[0], dcbe_val[1]))
#            #wcbe_val = p.wcbe_values()
#            #g.write("WCBE -  MEAN: {} s, {} min".format(wcbe_val, wcbe_val/60))
#            min_height_val = p.min_height_values()
#            g.write("MIN_HEIGHT - PER: {}, MEAN: {}".format(min_height_val[0], min_height_val[1]))
#            min_vis = p.vis_values()
#            g.write("MIN_VISIBILITY - PER: {}, MEAN: {}".format(min_vis[0], min_vis[1]))
#            temp_val = p.temp_values()
#            g.write("MAX_TEMP - PER: {}, MEAN: {}".format(temp_val[0], temp_val[1]))
#            g.write('P_dcbe: {}'.format(p_dcbe*bar*p_ext))
#            g.write('DEAD RATIO: {}'.format(sum(p.losses['d'])/p.total))
#            g.write('DEAD FACTOR: {}'.format(sum(p.losses['d'])/len(p.losses['d'])))
#            g.write('HEAVY FACTOR: {}'.format(sum(p.losses['h'])/len(p.losses['h'])))
#            print('DEAD FACTOR: {}'.format(sum(p.losses['d'])/len(p.losses['d'])))
#            print('HEAVY FACTOR: {}'.format(sum(p.losses['h'])/len(p.losses['h'])))
#            print('P_DCBE: {}'.format(len(p.dcbe)/p.total))
#            print('P_FED_F: {}'.format(fed_f))
#
            g.write('Summary data will be saved here.')

    # produce standard postprocess content
    def produce(self):
        if os.path.exists(f'{self.dir}/picts'):
            shutil.rmtree(f'{self.dir}/picts')
        os.makedirs(f'{self.dir}/picts')

        p = Plot(self.dir)
        [p.cdf(self.data[d['name']], path=d['name'], label=d['lab']) for d in self.plot_type['cdf']]
        [p.pdf(self.data[d['name']], path=d['name'], label=d['lab']) for d in self.plot_type['pdf']]
        [p.pdf_n(self.data[d['name']], path=d['name'], label=d['lab']) for d in self.plot_type['pdf_n']]
        [p.fn_curve(self.data[d['name']], path=d['name'], label=d['lab']) for d in self.plot_type['fn_curve']]
        p.pie(self.data['pdf_fn'][0])

        self.plant()

        self.save()
        

if __name__ == '__main__':
    pp = PostProcess()
    pp.produce()

    


