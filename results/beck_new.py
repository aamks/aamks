import matplotlib as mtl
#mtl.use('Agg') 
import matplotlib.ticker as tic
import matplotlib.pyplot as plt
import matplotlib.colors as clr
from matplotlib.collections import PatchCollection
from matplotlib.patches import Rectangle as rect
import json
from collections import OrderedDict
import seaborn as sns
import numpy as np
from statsmodels.distributions.empirical_distribution import ECDF as ecdf
import sys
sys.path.insert(0, '/usr/local/aamks')
import os
import time
import shutil
#from event_tree_en import EventTreeFED
#from event_tree_en import EventTreeSteel
import scipy.stats as stat
from include import Sqlite, Psql
import warnings
import pandas as pd
from zipfile import ZipFile
import logging
from pylatex import Document, Section, Itemize, Command, Figure, MultiColumn, Package
from pylatex.utils import italic, bold, NoEscape
from pylatex.table import Tabular
from pylatex.basic import NewPage

log_file = sys.argv[1] + '/aamks.log' if len(sys.argv) > 1 else os.getenv('AAMKS_PROJECT') + '/aamks.log'
logger = logging.getLogger('AAMKS.beck.py')
logger.setLevel(logging.DEBUG)
fh = logging.FileHandler(log_file)
fh.setLevel(logging.DEBUG)
ch = logging.StreamHandler()
ch.setLevel(logging.DEBUG)
formatter = logging.Formatter('%(asctime)s - %(name)-14s - %(levelname)s - %(message)s')
fh.setFormatter(formatter)
ch.setFormatter(formatter)
logger.addHandler(fh)
logger.addHandler(ch)
logger.warning('Start AAMKS post process')
def go_back(path='.', n=1): return os.sep.join(os.path.abspath(path).split(os.sep)[:-n])

def calc_rmse(p: float, n: float, confidence: float = None):
    rmse = np.sqrt(p * (1 - p) / n)
    if not confidence:
        return rmse
    else:
        return stat.norm.interval(confidence)[1] * rmse



'''Import all necessary low-level results from DB'''
class GetData:
    def __init__(self, scenario_dir):
        self.dir = scenario_dir
        self.configs = self._get_json(f'{scenario_dir}/conf.json')
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

    def tot_heat(self):
        r = self._quering('tot_heat/1000000', wheres=['dcbe_time is not null', 'tot_heat > 0'], typ='float')

        self.raw['tot_heat'] = np.array(r)

        return np.array(r)

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
        
        for label, prefixes in {'rooms':['r', 'c', 'a', 's'], 'doors':['d'], 'obsts':['t']}.items():
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
        self.tot_heat()
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
        
        logger.debug(f'[OK] {key} value for whole scenario calculated')

        return scenario_value

    def all(self):
        [self.calc_scenario(k) for k in self.iterations[0].keys()]    # calculate values for scenario
        self.convergence('individual')

        return self.risks

    def convergence(self, key):
        self.risks[f'conv_{key}'] = []
        for n, i in enumerate(self.iterations):
            val = np.mean([self.iterations[j][key] for j in range(n+1)])
            self.risks[f'conv_{key}'].append(val)

class RiskIteration:
    def __init__(self, feds_per_floor: list, calculate=False):
        self.p = self._rawFED2CDF(feds_per_floor) # probabilities of death for agents in THIS iteration
        self.n  = len(self.p)    # number of agents
        self.risks = {}
        if calculate:
            self.all()

    # remove floor division in FED data and process it to P(death) 
        # we assume that incapacitation during evacuation results in serious injuries or death
        # acc. Purser 2010, we assume that FED=1 results in incapacitation in 50% of poulation, but FED=0.3 only in 11.3%
        # P_inc(FED) is lognorm distribution (Purser 2010, more?)
    def _rawFED2CDF(self, feds: list):
        with warnings.catch_warnings():
            warnings.simplefilter('ignore')
            cdfs = stat.norm.cdf(np.log(feds))
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
            rmse = [calc_rmse(fn, i, confidence=0.95) for fn in fn_mc]

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
            df['data'] = self.data[f][['x_max', 'y_max', 'fed_growth_sum']]
            df['data'] = df['data'].pivot_table(columns='x_max', index='y_max', aggfunc='sum').astype(float)
            df['data'] = df['data'].fillna(-1)
            df['data'] = df['data'].apply(lambda x: x/self.n_iter)
            df['data'] = df['data'].to_numpy()
            self.plot['range'] = max(df['data'].max(), self.plot['range'])

        return self.plot


'''Basic plot class, containes all types of plots we use and their settings'''
class Plot:
    def __init__(self, scenario_dir):
        self.dir = scenario_dir

    # when data is list of P(N) and indexes are N values
    def pdf_n(self, data, path=None, label=None, n_bins=40):
        # draw data form P(N) distribution
        if type(data) != dict:
            data = {'Fatalities': data}

        samples = {}
        for k, v in data.items():
            max_fat = 1
            for i, j in enumerate(reversed(v)):
                if j > 0:
                    max_fat = len(v) - i
                    break
            binwdth = max(int(max_fat / n_bins), 1)

            # due to MC aproximation error sum of PDF elements can be lower than 1
            checksum = sum(v[:max_fat])
            if checksum != 1:
                v[0] += 1 - checksum

            samples[k] = [np.random.choice(np.arange(max_fat), p=v[:max_fat]) for i in range(1000)]

        try:
            try:
                plot = sns.histplot(samples, stat='density', kde=True, binwidth=binwdth)
            except np.linalg.LinAlgError:
                plot = sns.histplot(samples, stat='density', kde=False, binwidth=binwdth)
        except ValueError:
            fig = plt.figure()
            plt.text(0.5, 0.5, f'No valid data available for histogram',
                    horizontalalignment='center', verticalalignment='center',
                    bbox=dict(facecolor='red', alpha=0.5))
            if path:
                fig.savefig(os.path.join(self.dir, 'picts', f'{path}.png'))
            plt.close(fig)
            return 1

        if label:
            plot.set(xlabel=label[0])

        fig = plot.figure
        fig.tight_layout()

        if path:
            fig.savefig(os.path.join(self.dir, 'picts', f'{path}.png'))
        plt.close(fig)
        

    # PDF from datapoints
    def pdf(self, data, path=None, label=None):
        try:
            plot = sns.displot(data, kde=True, stat='density')
        except np.linalg.LinAlgError:
            plot = sns.displot(data, kde=False, stat='density')

        if label:
            plot.set_axis_labels(*label)
        fig = plot.fig
        fig.tight_layout()
        if path:
            fig.savefig(os.path.join(self.dir, 'picts', f'{path}.png'))
        plt.close(fig)

    # CDF  of ASET/RSET data
    def cdf_ovl(self, data, path=None, label=None):
        def cdf(d): return np.array(d).cumsum() / d.sum()
        def ccdf(d): return 1 - cdf(d)

        fig, ax = plt.subplots()
        r = plt.plot(cdf(data['ASET']), label='ASET')
        a = plt.plot(ccdf(data['RSET']), label='RSET')

        if label:
            plt.xlabel(label[0])
            plt.ylabel(label[1])
        plt.legend()
        fig.tight_layout()
        if path:
            fig.savefig(os.path.join(self.dir, 'picts', f'{path}.png'))
        plt.close(fig)

    # CDF  of data
    def cdf(self, data, path=None, label=None):
        if type(data) != dict:
            data = {'CDF': data}

        fig, ax = plt.subplots()
        palette = sns.color_palette()

        for i, k in enumerate(data.keys()):
            sns.histplot(data[k], cumulative=True, kde=True, stat='probability', bins=25, fill=True, color=palette[i],
                kde_kws={'cut': 1, 'bw_adjust': 0.4, 'clip': [0, 1e6]}, ax=ax, label=k)

        #labels
        if label:
            plt.xlabel(label[0])
            plt.ylabel(label[1])
        plt.legend()

        fig.tight_layout()
        if path:
            fig.savefig(os.path.join(self.dir, 'picts', f'{path}.png'))
        plt.close(fig)

    # FN_curve of data set x
    def fn_curve(self, data, path=None, label=None):
        #lims = [0, 10]    #[xmax, ymin]
        if type(data) != dict:
            data = {'FN curve': data}

        fig, ax = plt.subplots()
            
        [ax.plot(v, '-', label=k) for k, v in data.items()]

        # axis labels
        ax.set_xlabel(label[0])
        ax.set_ylabel(label[1])
        plt.legend()

        # axis formatting
        ax.semilogx()
        ax.semilogy()
        ax.grid(which='both')
        ax.yaxis.set_major_formatter('{x}')
        ax.xaxis.set_major_formatter(tic.ScalarFormatter())
        maxx = max(*[len(i) for i in data.values()]*2)
        ax.set_xlim(left=1, right=maxx)
        miny=1
        for d in data.values():
            for j in d:
                miny = j if 0<j<miny else miny
                
        ax.set_ylim(bottom=miny, top=1)
        fig.tight_layout()

        if path:
            fig.savefig(os.path.join(self.dir, 'picts', f'{path}.png'))
        
        plt.close(fig)

    # pie chart
    def pie(self, pdf_fn, legend=None):
        fig, ax = plt.subplots()
        colors = ['lightcoral', 'lightskyblue']
        try:
            fatal_scenarios_rate = pdf_fn
            sizes = [1 - fatal_scenarios_rate, fatal_scenarios_rate]
            labels = ['Failure', 'Success']
            explode = (0.1, 0)
            plt.pie(sizes, explode=explode, labels=labels, colors=colors, autopct='%1.1f%%', shadow=True)
            plt.axis('equal')
        except TypeError:
            s = np.array([i[0] for i in pdf_fn.values()])
            f = 1 - s
            b = np.zeros(len(pdf_fn))
            for e, i in enumerate([s, f]):
                a = ax.bar(legend, i, color=colors[1-e], bottom=b)
                b += i
                ax.bar_label(a, label_type='center')


        fig.savefig(os.path.join(self.dir, 'picts', 'pie_fault.png'))
        plt.close(fig)

    # plot heatmap of FED absorption
    def heatmap(self, hm: Heatmap, lab='Average FED absorbed in cell [-]'):
        for f in range(hm.geom['floors']+1):
            # initial figure definition
            fig = plt.figure()
            ax = fig.add_subplot(111)

            # colors
            my_cmap = clr.LinearSegmentedColormap.from_list('', ['white', 'coral', 'darkred'])
            colors = {'ROOM': '#8C9DCE', 'COR': '#385195', 'HALL': '#DBB55B', 'CONTOUR': '#000000', 
                    'DOOR': clr.rgb2hex(my_cmap(0)), 'OBSTACLE': '#707070'}
            
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
            c.set_clim(vmin=0)
            fig.colorbar(c, ax=ax, fraction=0.03, pad=0.04, label=lab)
            fig.tight_layout()
            
            # save figure
            fig.savefig(os.path.join(self.dir, 'picts', f'floor_{f}.png'))#, dpi=170)
            plt.close(fig)

    def conv(self, data, path=None, label=None, conf=0.95):
        fig, ax = plt.subplots()
        ax.plot(data, label='IR')
        lower = [max([d-calc_rmse(d,n+1,confidence=conf), 0]) for n, d in enumerate(data)]
        ax.plot(lower, ls='-.', c='black', label=f'IR +/- {int(conf*100)}% RMSE')
        upper = [d+calc_rmse(d,n+1,confidence=conf) for n, d in enumerate(data)]
        ax.plot(upper, ls='-.', c='black')
        ax.plot([data[-1]]*len(data), ls='--',c='grey', label='mean')
        ax.fill_between(range(len(data)), lower, upper, alpha=0.2)

        #labels
        if label:
            plt.xlabel(label[0])
            plt.ylabel(label[1])
        plt.legend()

        fig.tight_layout()
        if path:
            fig.savefig(os.path.join(self.dir, 'picts', f'{path}.png'))
        plt.close(fig)



'''Generating plots and results visualization - the head class'''
class PostProcess:
    plot_type = {
        'pdf':[
            {'name':'wcbe_r','lab':['Required Safe Egress Time - Run Time [s]', 'PDF [-]']},
                {'name':'dcbe', 'lab':['Available Safe Egress Time [s]', 'PDF [-]']},
                {'name':'wcbe', 'lab':['Required Safe Egress Time [s]', 'PDF [-]']},
                {'name':'min_hgt', 'lab':['Minimum Upper Layer Height [cm]', 'PDF [-]']},
                {'name':'min_hgt_cor', 'lab':['Minimum Upper Layer Height in Corridors [cm]', 'PDF [-]']},
                {'name':'min_vis', 'lab':['Minimum Visibility [m]', 'PDF [-]']},
                {'name':'min_vis_cor', 'lab':['Minimum Visibility in Corridors [m]', 'PDF [-]']},
                {'name':'max_temp', 'lab':['Maximum Hot Gas Temperature [°C]', 'PDF [-]']},
                {'name':'tot_heat', 'lab':['Total Heat Released in Fire [MJ]', 'PDF [-]']}
                ], 
            'pdf_n':[
                {'name':'pdf_fn', 'lab':['Number of fatalities [-]', 'Probability [-]']},
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
                ],
            'conv':[
                {'name':'conv_individual', 'lab':['Iteration [-]', 'Individual risk [-]']}
                ]}

    def __init__(self, scen_dir=None):
        if scen_dir:
            self.dir = os.path.abspath(scen_dir)
        else:
            self.dir = sys.argv[1] if len(sys.argv) > 1 else os.getenv('AAMKS_PROJECT')
        self.dir = os.path.abspath(self.dir)
        self.gd = GetData(self.dir)
        self.data = {**self.gd.drop(with_fed=False), **RiskScenario(self.gd.raw['results']).all()} # results for THE SCENARIO
        self.n = len(self.gd.raw['feds'])  # number of finished iterations taken for results analysis
        self.probs = []#{}


    # save data
    def save(self, no_zip=False):
        self.gd.to_csv()
        self._summarize()
        Report(self).to_pdf(make=True)
        self._to_txt()
        if not no_zip:
            self._zip_pictures()
            self._zip_full()

    # add some summaries to self.data
    def _summarize(self):
        # https://stats.stackexchange.com/questions/267432/coefficient-of-overlapping-ovl-for-two-distributions
        def try_kde(sample):
            try:
                return stat.gaussian_kde(sample)
            except np.linalg.LinAlgError:
                return stat.gaussian_kde(np.insert(sample[1:], 0, sample[0]*0.99999))

        def ovl(samp1, samp2, number_bins=1000):
            if samp1.size == 0 or samp2.size == 0:
                return 0
            arr1 = try_kde(samp1)
            arr2 = try_kde(samp2)

            positions = np.arange(int(max(*samp1, *samp2)*1.2))
            arr1(positions)
            arr2(positions)

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
            if x_smp.size != 0:
                return np.mean(x_smp), np.std(x_smp) 
            else:
                return 0, 0 

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
                '##Individual risk approximation error (RMSE with 95% confidence interval included)[-]',
                f'{calc_rmse(self.data["individual"], self.n, confidence=0.95)}',
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


    def _zip_pictures(self):
        with ZipFile(os.path.join(self.dir, 'picts', 'picts.zip'), 'w') as zf:
            for f in os.scandir(os.path.join(self.dir, 'picts')):
                if f.name.lower().endswith(('.png', '.jpg', '.jpeg')):
                    zf.write(f.path, arcname=f.name)

    def _zip_full(self):
        with ZipFile(os.path.join(self.dir, 'picts', 'data.zip'), 'w') as zf:
            for f in os.scandir(os.path.join(self.dir, 'picts')):
                if not f.name.lower().endswith('.zip'):
                    zf.write(f.path, arcname=f.name)
            try:
                zf.write('/home/aamks_users/aamks.log', arcname='aamks.log')
            except FileNotFoundError:
                logger.error('No log file found - /home/aamks_users/aamks.log')

                
    # produce standard postprocess content
    def produce(self):
        if os.path.exists(f'{self.dir}/picts'):
            shutil.rmtree(f'{self.dir}/picts')
        os.makedirs(f'{self.dir}/picts')

        def tm(x): 
            logger.debug(f'{x}: {time.time() - self.t}')
            self.t = time.time()
        p = Plot(self.dir)
        tm('Plot')
        [p.pdf_n(self.data[d['name']], path=f"{d['name']}", label=d['lab']) for d in self.plot_type['pdf_n']]
        tm('plot pdf_n')
        h = Heatmap(self.data['fed_der_df'], self.data['geometry'], self.n)
        tm('Heatmap')
        h.calc()
        tm('heatmap calc')
        p.heatmap(h)
        tm('plot heat')
        [p.conv(self.data[d['name']], path=f"{d['name']}", label=d['lab']) for d in self.plot_type['conv']]
        tm('plot conv')
        [p.cdf(self.data[d['name']], path=f"{d['name']}_cdf", label=d['lab']) for d in self.plot_type['cdf']]
        tm('plot cdf')
        [p.pdf(self.data[d['name']], path=f"{d['name']}_pdf", label=d['lab']) for d in self.plot_type['pdf']]
        tm('plot pdf')
        p.pdf({'ASET': self.data['dcbe'], 'RSET': self.data['wcbe']}, label=['Time [s]', 'Density [-]'], path='overlap')
        p.cdf_ovl({'RSET': np.array(self.data['wcbe']), 'ASET': self.data['dcbe']}, label=['Time [s]', 'Density [-]'], path='overlap_n')
        tm('plot overlap')
        [p.fn_curve(self.data[d['name']], path=d['name'], label=d['lab']) for d in self.plot_type['fn_curve']]
        tm('plot fn_curve')
        p.pie(self.data['pdf_fn'][0])
        tm('plot pie')

        self.save()
        tm('save')


class Report:
    picts = {
        'pie_fault': 'The share of iterations with failure of safety systems (at least one person with FED > 1)',
        'pdf_fn': 'Fatalities histogram (PDF)', 
        'fn_curve': 'FN curve for the scenario', 
        'dcbe_cdf': 'Cumulative distribution function of ASET', 
        'wcbe_cdf': 'Cumulative distribution function of RSET', 
        'overlap': 'Probability density functions of RSET and ASET', 
        'min_hgt_cdf': 'Cumulative distribution function of minimal hot layer height', 
        'min_hgt_cor_cdf': 'Cumulative distribution function of minimal hot layer height on the evacuation routes', 
        'max_temp_cdf': 'Cumulative distribution function of maximal temperature', 
        'min_vis_cdf': 'Cumulative distribution function of the minimal visibility', 
        'min_vis_cor_cdf': 'Cumulative distribution function of the minimal visibility on the evacuation routes', 
        'conv_individual': 'Convergence of individual risk in subsequent iterations'
        }

    def __init__(self, postprocess: PostProcess):
        self.pp = postprocess
        self.doc = Document(geometry_options={'margin': '2cm'})
        self.title = 'MULTISIMULATION RESULTS'
        self.author = self.pp.dir.split('/')[-3]
        self.project = self.pp.dir.split('/')[-2]
        self.scenario = self.pp.dir.split('/')[-1]

    def _preamble(self):
        self.doc.packages.append(Package('array'))
        self.doc.preamble.append(Command('title', self.title))
        self.doc.preamble.append(NoEscape(r'\title{\includegraphics[width=4cm]{/usr/local/aamks/gui/logo.png}\\'+self.title+'}'))
        self.doc.preamble.append(Command('author', self.author))
        self.doc.preamble.append(Command('date', NoEscape(r'\today')))
        #with self.doc.create(Figure(position = 'htbp')) as fig: 
            #fig.add_image(f'/usr/local/aamks/gui/logo.png', width='4cm')
        self.doc.append(NoEscape(r'\maketitle'))
        self.doc.append(NoEscape(r'\renewcommand{\arraystretch}{1.5}'))

        #self.doc.append(NoEscape(r'\bigskip'))
        #self.doc.append(NoEscape(r'\tableofcontents'))
        #self.doc.append(NewPage())
        

    def _makerows(self):
        rows = {'General':[], 'Risk indices': [], 'Evacuation': [], 'Fire': []}
        rows['General'].append(['Software version', 'v2.0.1', '2024-02-28'])
        rows['General'].append(['Project name', self.project, ''])
        rows['General'].append(['Scenario name', self.scenario, ''])
        rows['General'].append(['Number of iterations', self.pp.n, ''])

        rows['Risk indices'].append(['Individual risk', f'{self.pp.data["individual"]:.3e} [--]', f'with a 95% confidence RMSE of \
            {calc_rmse(self.pp.data["individual"], self.pp.n, confidence=0.95):.3e}'])
        rows['Risk indices'].append(['Societal risk (WRI)', f'{self.pp.data["societal"]:.3e} [fatal.]', 'risk aversion included'])
        rows['Risk indices'].append(['Societal risk (AWR)', f'{self.pp.data["awr"]:.3e} [fatal.]', ''])

        rows['Evacuation'].append(['RSET', f'{self.pp.data["summary"]["rset"][0]:.1f} s', f'mean with standard deviation\
                of {self.pp.data["summary"]["rset"][1]:.1f} s'])
        rows['Evacuation'].append(['ASET', f'{self.pp.data["summary"]["aset"][0]:.1f} s', f'mean with standard deviation\
                of {self.pp.data["summary"]["aset"][1]:.1f} s'])
        rows['Evacuation'].append(['Overlapping index of ASET/RSET', f'{self.pp.data["summary"]["ovl"]} s', ''])
        
        rows['Fire'].append(['Upper layer temperature', f'{self.pp.data["summary"]["hgt"][0]:.1f}°C', f'mean of maximum\
                value with a standard deviation of {self.pp.data["summary"]["hgt"][1]:.1f}°C'])
        rows['Fire'].append(['Neutral plane heihgt', f'{self.pp.data["summary"]["height"][0]:.1f} cm', f'mean of minimum\
                value with a standard deviation of {self.pp.data["summary"]["height"][1]:.1f} cm'])
        rows['Fire'].append(['Visibility', f'{self.pp.data["summary"]["vis"][0]:.1f} m', f'mean of minimum value with a\
                standard deviation of {self.pp.data["summary"]["vis"][1]:.1f} m'])

        return rows

    def _summary(self):
        with self.doc.create(Section('Summary sheet', numbering=False)):
            self.doc.append(NoEscape(r'\bigskip'))
            headers = [bold('Paramter'), bold('Value'), bold('Additional remarks')]

            with self.doc.create(Tabular('|m{3.5cm}|m{4cm}|m{8cm}|')) as tab:
                tab.add_hline()
                tab.add_row(headers)
                tab.add_hline()
                for subhead, rows in self._makerows().items():
                    tab.add_row((MultiColumn(3, align='|c|', data=bold(subhead)),))
                    tab.add_hline()
                    for row in rows:
                        tab.add_row(row)
                        tab.add_hline()
        self.doc.append(NewPage())

    # those plots should be described and segregated
    def _appendix(self):
        def add_pict(pict):
            with self.doc.create(Figure(position = 'htbp')) as fig: 
                fig.add_image(f'{self.pp.dir}/picts/{pict}.png')
                fig.add_caption(self.picts[pict])

        with self.doc.create(Section('Plots', numbering=False)):
            # convergence
            add_pict('conv_individual')

            # pie
            add_pict('pie_fault')

            # FN
            add_pict('fn_curve')

            # add PDF fatalities
            add_pict('pdf_n')

            # heatmaps
            with self.doc.create(Figure(position = 'htbp')) as fig: 
                i = 0
                while True:
                    pth = f'{self.pp.dir}/picts/floor_{i}.png'
                    if not os.path.isfile(pth):
                        break
                    fig.add_image(pth)
                    fig.add_caption(f'Heatmap of FED absorption on level {i}')
                    i += 1

    def make(self):
        self._preamble()
        self._summary()
        self._appendix()
        
        return self.doc

    def to_pdf(self, make=False, tex=False):
        self.make() if make else None
        self.doc.generate_pdf(f'{self.pp.dir}/picts/report', clean_tex=not tex)


'''Produce results of multiple scenarios on each plot'''
class Comparison:
    def __init__(self, scenarios, path=None):
        self.project_path = go_back(os.getenv('AAMKS_PROJECT') if not path else path)
        self.scen_names = sorted(scenarios)
        self.dir = os.path.join(self.project_path, '_comp', '-'.join(self.scen_names), 'picts')
        self.scens = self._scen_init(scenarios)
        self.data = self._merge_scens()
        self.t = 0
        self.plot_type = {
                'pdf':[
                    {'name':'wcbe_r','lab':['Required Safe Egress Time - Run Time [s]', 'PDF [-]']},
                    {'name':'dcbe', 'lab':['Available Safe Egress Time [s]', 'PDF [-]']},
                    {'name':'wcbe', 'lab':['Required Safe Egress Time [s]', 'PDF [-]']},
                    {'name':'min_hgt', 'lab':['Minimum Upper Layer Height [cm]', 'PDF [-]']},
                    {'name':'min_hgt_cor', 'lab':['Minimum Upper Layer Height in Corridors [cm]', 'PDF [-]']},
                    {'name':'min_vis', 'lab':['Minimum Visibility [m]', 'PDF [-]']},
                    {'name':'min_vis_cor', 'lab':['Minimum Visibility in Corridors [m]', 'PDF [-]']},
                    {'name':'tot_heat', 'lab':['Total Heat Released in Fire [MJ]', 'PDF [-]']},
                    {'name':'max_temp', 'lab':['Maximum Hot Gas Temperature [°C]', 'PDF [-]']}
                    ], 
                'pdf_n':[
                    {'name':'pdf_fn', 'lab':['Number of fatalities [-]', 'Probability [-]']},
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
        
    def _scen_init(self, args):
        scens = {}

        if 'all' in args:
            for i in os.scandir(self.project_path):
                scens[i.name] = PostProcess(scen_dir=i.path)
        else:
            for i in args:
                scens[i] = PostProcess(scen_dir=os.path.join(self.project_path, i))

        return scens

    def _merge_scens(self):
        data = {}
        for k in self.scens[self.scen_names[0]].data.keys():
            this_key = {}
            for s in self.scen_names:
                this_key[s] = self.scens[s].data[k]
            data[k] = this_key

        return data
    
    # save data
    def save(self):
        self._summarize_all()
        [self._zip_ext(i) for i in [('txt', '.txt'), ('picts', '.png', '.jpg', '.jpeg'), ('csv', '.csv')]]
        self._zip_full()

    # run summarize across all scenarios and copy data
    def _summarize_all(self):
        for name, scen in self.scens.items():
            scen.save(no_zip=True)
            [shutil.copyfile(os.path.join(scen.dir, 'picts', f), os.path.join(self.dir, f'{name}_{f}')) for f in ('data.txt', 'data.csv')]


    def _zip_ext(self, ext: tuple):
        with ZipFile(os.path.join(self.dir, f'{ext[0]}.zip'), 'w') as zf:
            for f in os.scandir(os.path.join(self.dir)):
                if f.name.lower().endswith(ext):
                    zf.write(f.path, arcname=f.name)

    def _zip_full(self):
        with ZipFile(os.path.join(self.dir, 'data.zip'), 'w') as zf:
            for f in os.scandir(os.path.join(self.dir)):
                if not f.name.lower().endswith('.zip'):
                    zf.write(f.path, arcname=f.name)
            try:
                zf.write('/home/aamks_users/aamks.log', arcname='aamks.log')
            except FileNotFoundError:
                logger.error('No log file found - /home/aamks_users/aamks.log')

            
    def produce(self):
        # plot together
        if os.path.exists(self.dir):
            shutil.rmtree(self.dir)
        os.makedirs(self.dir)

        def tm(x): 
            logger.debug(f'{x}: {time.time() - self.t}')
            self.t = time.time()
        p = Plot(go_back(self.dir))
        tm('Plot')
        [p.cdf(self.data[d['name']], path=f"{d['name']}_cdf", label=d['lab']) for d in self.plot_type['cdf']]
        tm('plot cdf')
        [p.pdf(self.data[d['name']], path=f"{d['name']}_pdf", label=d['lab']) for d in self.plot_type['pdf']]
        tm('plot pdf')
        [p.pdf_n(self.data[d['name']], path=d['name'], label=d['lab']) for d in self.plot_type['pdf_n']]
        tm('plot pdf_n')
        [p.fn_curve(self.data[d['name']], path=d['name'], label=d['lab']) for d in self.plot_type['fn_curve']]
        tm('plot fn_curve')
        p.pie(self.data['pdf_fn'], legend=self.scen_names)
        tm('plot pie')
        
        self.save()
        tm('save')
        
        

if __name__ == '__main__':
    if len(sys.argv) > 2:
        comp = Comparison(sys.argv[2:], path=sys.argv[1])
        comp.produce()
    else:
        pp = PostProcess()
        pp.t = time.time()
        pp.produce()
        from sa import SensitivityAnalysis as SA
        s = SA(pp.dir)
        s.main(spearman=True)
    exit()
    try:
        if len(sys.argv) > 2:
            comp = Comparison(sys.argv[2:], path=sys.argv[1])
            comp.produce()
        else:
            pp = PostProcess()
            pp.t = time.time()
            pp.produce()
            from sa import SensitivityAnalysis as SA
            s = SA(pp.dir)
            s.main(spearman=True)
    except Exception as e:
        logger.error(e)

    


