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



class processDists:

    def __init__(self):
        self.losses = dict()
        self.labels = []
        self.losses_num = []
        self.t_k = 0
        self.total = 0
        self.dead = 0
        self.dcbe = []
        self.dir = sys.argv[1]
        self.configs = self._get_json(f'{self.dir}/conf.json')
        self.p = Psql()
        self.avg_risk = list()
        self.err_risk = list()
        if os.path.exists(f'{self.dir}/picts'):
            shutil.rmtree(f'{self.dir}/picts')
        os.makedirs(f'{self.dir}/picts')
        self.horisontal_time=dict({'0': 3, '1': 36, '2': 72, '3': 112, '4': 148, '5': 184, '6': 220})

    # basic and the most used type of plot in the code
    def cdf(self, data, path=None, label=None, hist=False):
        if hist: 
            plot = sns.displot(data, cumulative=False, stat='density', bins=50)
        else:
            plot = sns.displot(data, cumulative=True, kde=True, stat='density', bins=50, fill=True, kde_kws={'cut': 2})
        if label:
            plot.set_axis_labels(label)
        fig = plot.fig
        if path:
            fig.savefig(os.path.join(self.dir, 'picts', path))
        plt.clf()
    
    # template for psql query
    def quering(self, selects: str, wheres=[], raw=False, typ='int'):
        base = f"SELECT {selects} FROM simulations WHERE project = {self.configs['project_id']} AND scenario_id = {self.configs['scenario_id']}"
        query = " AND ".join([base] + wheres)
        results = self.p.query(query)

        if raw:
            return results 
        elif typ == 'int':
            return [int(i[0]) for i in results]
        elif typ == 'float':
            return [float(i[0]) for i in results]
        

    def plot_dcbe_dist(self):
        data = self.quering('dcbe_time', wheres=["dcbe_time is not null", "dcbe_time < 9999"])
        self.cdf(data, path="dcbe.png")

    def plot_wcbe_dist_r(self):
        data = self.quering('run_time', wheres=["dcbe_time is not null", "dcbe_time < 9999"])
        self.cdf(data, path="wcbe_r.png", hist=True)

    def plot_wcbe_dist(self):
        raw = self.quering('wcbe',  wheres=["dcbe_time is not null"], raw=True)
        data = list()
        dcbe = [json.loads(i[0]) for i in raw]
        for i in dcbe:
            for key in i.keys():
                i.update({key: (i[key] + int(self.horisontal_time[key]))})
            item = max(i.values())
            if item > 0:
                data.append(item)
        self.cdf(data, path="wcbe.png")

    def plot_min_height(self):
        data = self.quering('min_hgt_compa * 100', wheres=['min_hgt_compa < 12.8'], typ='float')
        self.cdf(data, path="height.png")

    def plot_min_height_cor(self):
        data = self.quering('min_hgt_cor * 100', wheres=['min_hgt_cor < 12.8'], typ='float')
        self.cdf(data, path="hgt_cor.png")

    def plot_min_vis(self):
        data = self.quering('min_vis_compa', wheres=['min_vis_compa < 60'], typ='float')
        self.cdf(data, path="vis.png")

    def plot_min_vis_cor(self):
        data = self.quering('min_vis_cor', wheres=['min_vis_cor < 60'], typ='float')
        self.cdf(data, path="vis_cor.png")


    def plot_max_temp(self):
        data = self.quering('max_temp', wheres=['dcbe_time is not null', 'max_temp < 900'], typ='float')
        dist = getattr(stat, 'norm')
        param = dist.fit(data)
        dcbe_n = np.array(data)
        self.t_k= len(dcbe_n[dcbe_n > 450])
        self.cdf(dcbe_n, path='temp.png')

    def calculate_ccdf(self):
        losses={'dead': list(), 'heavy': list(), 'light': list(), 'neglegible': list()}
        results = self.quering('fed, id', wheres=['dcbe_time IS NOT NULL'], raw=True)

        self.total = len(results) # number of reults (simulations finished)
        row = [json.loads(i[0]) for i in results]
        fed=list()
        for i in row:
            temp_list = list()
            for key, values in i.items():
                temp_list = temp_list + values
                #print(f"KEY: {key}, VALUE: {values}\n")
            fed.append(collections.Counter(np.array(temp_list)))

        for item in fed:
            if ('H' in item) or ('M' in item) or ('L' in item):
                self.dcbe.append(1)

            for key in item.keys():
                if key == 'H':
                    losses['dead'].append(item[key])
                if key == 'M':
                    losses['heavy'].append(item[key])
                if key == 'L':
                    losses['light'].append(item[key])
                if key == 'N':
                    losses['neglegible'].append(item[key])

        for k in losses.keys():
            l = len(losses[k])
            if  l < self.total:
                losses[k] = losses[k] + [0] * (self.total - l)

        self.losses = losses

    def plot_ccdf(self):
        fig = plt.figure(figsize=(12, 3))
        axs = [fig.add_subplot(131), fig.add_subplot(132), fig.add_subplot(133)]

        xtic = tic.MaxNLocator(3)

        wykres = 0

        for key in self.losses.keys():
            if key == 'neglegible':
                continue
            if len(self.losses[key]) == 0:
                print(key )
                continue 
            elif sum(self.losses[key]) == 0:
                lab = 'deaths' if key == 'dead' else f'{key} injuries'
                plt.text(0.5, 0.5, f'No data available for {lab}',horizontalalignment='center',
     verticalalignment='center', transform=axs[wykres].transAxes,
     bbox=dict(facecolor='red', alpha=0.5))
                axs[wykres].set_facecolor('#555555')
                continue

            dane = ecdf(self.losses[key], side='left')
            print(key, sorted(self.losses[key]), 1-dane(sorted(self.losses[key])))
            axs[wykres].plot(sorted(self.losses[key]), 1-dane(sorted(self.losses[key])), '-o')
            axs[wykres].set_xlabel('Number of people')
            axs[wykres].set_ylabel('Likelihood')
            axs[wykres].set_title(key)
            axs[wykres].set_xlim(left=0)
            wykres += 1

        fig.tight_layout()
        fig.savefig(f'{self.dir}/picts/ccdf.png')
        fig.clf()


    # to calculate risk per one person
    # WK # Where is individual risk calculated?
    def calculate_indvidual_risk(self):
        results = self.quering('i_risk', wheres=['dcbe_time is not null','i_risk is not null'], raw=True)
        row = [json.loads(i[0]) for i in results]
        print(results)
        exit()
        risk=list()
        for i in row:
            for values in i.values():
                risk.append(values)
                self.avg_risk.append(sum(risk)/len(risk))
                self.err_risk.append(1.96*sqrt((self.avg_risk[-1]*(1 - self.avg_risk[-1]))/len(risk)))
        return sum(risk)/len(risk)

    def plot_risk_convergence(self, init_risk):
        #fig = plt.figure(figsize=(10, 3))
        fig = plt.figure()
        ax = plt.axes()

        avg_risk = list(np.array(self.avg_risk)*init_risk)
        upper_e = list(np.array(avg_risk) + np.array(self.err_risk)*init_risk)
        lower_e = list(np.array(avg_risk) - np.array(self.err_risk)*init_risk)

        ax.plot(range(len(avg_risk)), avg_risk, label='mean value')
        ax.plot(range(len(avg_risk)), lower_e, '--k', label='-2sigma')
        ax.plot(range(len(avg_risk)), upper_e, '-.k', label='+2sigma')
        plt.ylim(0,max(upper_e))
        plt.ylabel('mean and error value')
        plt.xlabel('sample size')
        plt.legend()
        fig.savefig('{}/picts/convergence.png'.format(self.dir))
        fig.clf()

    def plot_ccdf_percentage(self):

        fig = plt.figure(figsize=(12, 3))
        axs = [fig.add_subplot(131), fig.add_subplot(132), fig.add_subplot(133)]

        for i in range(3):
            l_updated = np.array(self.losses[i])
            dane = ecdf(l_updated)
            axs[i].plot(sorted(l_updated), (1-dane(sorted(l_updated)))*100)
            axs[i].set_xlabel('Number of people')
            axs[i].set_ylabel('Share %')
            axs[i].set_title(self.labels[i])
            #axs[i].xaxis.set_major_formatter(tic.FormatStrFormatter('%4.f'))

        fig.tight_layout()
        fig.savefig('{}/picts/ccdf_per.png'.format(self.dir))
        fig.clf()

    def _get_json(self, path):
        f = open(path, 'r')
        dump = json.load(f, object_pairs_hook=OrderedDict)
        f.close()
        return dump

    def plot_losses_hist(self):
        labels = ['Death', 'Heavy injury', 'Light injury', 'Neglegible']

        wykres = 0
        for i, key in enumerate(self.losses.keys()):
            if len(self.losses[key]) == 0:
                continue
            elif sum(self.losses[key]) == 0:
                lab = 'deaths' if key == 'dead' else f'{key} injuries'
                fig = plt.figure()
                plt.text(0.5, 0.5, f'No data available for {lab} histogram',
                        horizontalalignment='center', verticalalignment='center',
                        bbox=dict(facecolor='red', alpha=0.5))
                plt.title(labels[i])
                fig.savefig(f'{self.dir}/picts/losses{key}.png')
                fig.clf()
            else:
                plot = sns.displot(self.losses[key], bins=20).set(title=labels[i])
                plot.set_axis_labels('Number of casualities', 'Number of scenarios')
                plot.savefig(f'{self.dir}/picts/losses{key}.png')


    def plot_pie_fault(self):
        fig = plt.figure()
        sizes = [len(self.losses['dead']), self.total-len(self.losses['dead'])]
        labels = ['Failure', 'Success']
        colors = ['lightcoral', 'lightskyblue']
        explode = (0.1, 0)
        plt.pie(sizes, explode=explode, labels=labels, colors=colors, autopct='%1.1f%%', shadow=True)
        plt.axis('equal')
        fig.savefig(f'{self.dir}/picts/pie_fault.png')
        fig.clf()

    def calculate_barrois(self, area):
        other_building = [1.18, 1e-4, -1.87, -0.20]
        office = [0.056, 3e-6, -0.65, -0.05]
        warehouse = [3.82, 2e-6, -2.08, -0.05]
        commercial = [7e-5, 6e-6, -0.65, -0.05]
        nursing = [2e-4, 5e-6, -0.61, -0.05]
        educational = [0.003, 3e-6, -1.26, -0.05]
        building = {'other_building': other_building, 'office': office, 'warehouse': warehouse, 'commercial': commercial,
                    'nursing': nursing, 'educational': educational}
        b_type = 'commercial'
        ignition = building[b_type][0]*(area) ** (building[b_type][2]) + \
                   building[b_type][1] * (area) ** (building[b_type][3])
        return ignition

    def dcbe_values(self):
        results = self.quering('count(*)', wheres=['dcbe_time < 9999'], raw=True)
        lower = results[0][0]/self.total

        results = self.quering('avg(dcbe_time)', wheres=['dcbe_time < 9999'], raw=True) 
        mean = results[0][0]

        return [lower, mean]

    def wcbe_values(self):
        return self.quering('avg(wcbe)', wheres=['dcbe_time IS NOT NULL'], raw=True)[0][0]

    def min_height_values(self):
        lower = self.quering('count(*)', wheres=['min_hgt_cor < 0.5'], raw=True)[0][0] / self.total
        mean = self.quering('avg(min_hgt_compa)', wheres=['min_hgt_cor < 1.8'], raw=True)[0][0]

        return [lower, mean]

    def vis_values(self):
        lower = self.quering('count(*)', wheres=['min_vis_cor < 30'], raw=True)[0][0] / self.total
        mean = self.quering('avg(min_hgt_compa)', wheres=['min_vis_cor < 60'], raw=True)[0][0]

        return [lower, mean]

    def temp_values(self):
        lower = self.quering('count(*)', wheres=['max_temp > 450'], raw=True)[0][0] / self.total
        mean = self.quering('avg(max_temp)', wheres=['dcbe_time IS NOT NULL'], raw=True)[0][0]

        return [lower, mean]

    def copy_data(self):
        query = f"COPY (SELECT * FROM simulations where project = {self.configs['project_id']} AND scenario_id = {self.configs['scenario_id']}) TO STDOUT WITH CSV DELIMITER ';' HEADER"
        self.p.copy_expert(sql=query, csv_file=f'{self.dir}/picts/data.csv')

    def calculate_building_area(self):
        s=Sqlite(f'{self.dir}/aamks.sqlite')
        result = s.query('SELECT sum(room_area) as total FROM aamks_geom');

        return result[0]['total'] / 10000 # [ha] ?

    def plot_heatmap_positions_fed_growth(self):
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


def plot_all(proc: processDists):
    proc.calculate_ccdf()
    proc.plot_ccdf()
    proc.plot_pie_fault()
    proc.plot_heatmap_positions_fed_growth()

    sns.set_theme()
    proc.plot_dcbe_dist()
    proc.plot_wcbe_dist()
    proc.plot_wcbe_dist_r()
    proc.plot_min_height()
    proc.plot_min_height_cor()
    proc.plot_max_temp()
    proc.plot_min_vis()
    proc.plot_min_vis_cor()
    #wprint(proc.wcbe_time(1000))
    #proc.plot_ccdf_percentage()
    proc.plot_losses_hist()
    proc.copy_data()
    #print(proc.total)

#[fed_f, fed_m, fed_l, fed_n], [bar, p_dcbe, p_ext, p_tk]
def tree_planting(proc: processDists, feds: list, probs: list):
    for m in ('F', 'M'):
        t = EventTreeFED(building=proc.dir, p_general=probs[0], p_develop=probs[2], p_dcbe=probs[1], p_fed_n=feds[3], p_fed_l=feds[2], p_fed_m=feds[1], p_fed_f=feds[0], mode=m)
        t.draw_tree()

    s = EventTreeSteel(building=proc.dir, p_general=probs[0], p_develop=probs[2], p_Tk=probs[3], p_time_less=0.001)
    s.draw_tree()


def risk(proc: processDists):
    fed_f = float('%.3f' % (proc.calculate_indvidual_risk()))
    fed_m = float('%.3f' % (len(proc.losses['heavy'])/proc.total))
    fed_l = float('%.3f' % (len(proc.losses['light'])/proc.total)) 
    fed_n = float('%.3f' % (len(proc.losses['neglegible'])/proc.total))

    p_dcbe = float('%.3f' % (len(proc.dcbe)/proc.total))
    p_ext = float('%.3f' % 0.17)
    p_tk = float('%.3f' % (proc.t_k/proc.total))

    bar = p.calculate_barrois(p.calculate_building_area())*p.calculate_building_area()
    #bar = 1.8e-2 / 2
    bar = (4e-3)/3 # z PD??
    print(bar)
    #bar = 1.3e-3
    print(p.calculate_building_area())
    #if p.losses_num[4] == 0:
    #    p.losses_num[4] = 1e-12

    init_riks = bar*p_ext*p_dcbe

    p.plot_risk_convergence(init_riks)

    with open('{}/picts/dane.txt'.format(p.dir), 'w') as g: 
        dcbe_val = p.dcbe_values()
        g.write("DCBE - PER: {}, MEAN: {}".format(dcbe_val[0], dcbe_val[1]))
        #wcbe_val = p.wcbe_values()
        #g.write("WCBE -  MEAN: {} s, {} min".format(wcbe_val, wcbe_val/60))
        min_height_val = p.min_height_values()
        g.write("MIN_HEIGHT - PER: {}, MEAN: {}".format(min_height_val[0], min_height_val[1]))
        min_vis = p.vis_values()
        g.write("MIN_VISIBILITY - PER: {}, MEAN: {}".format(min_vis[0], min_vis[1]))
        temp_val = p.temp_values()
        g.write("MAX_TEMP - PER: {}, MEAN: {}".format(temp_val[0], temp_val[1]))
        g.write('P_dcbe: {}'.format(p_dcbe*bar*p_ext))
        g.write('DEAD RATIO: {}'.format(sum(p.losses['dead'])/p.total))
        g.write('DEAD FACTOR: {}'.format(sum(p.losses['dead'])/len(p.losses['dead'])))
        g.write('HEAVY FACTOR: {}'.format(sum(p.losses['heavy'])/len(p.losses['heavy'])))
        print('DEAD FACTOR: {}'.format(sum(p.losses['dead'])/len(p.losses['dead'])))
        print('HEAVY FACTOR: {}'.format(sum(p.losses['heavy'])/len(p.losses['heavy'])))
        print('P_DCBE: {}'.format(len(p.dcbe)/p.total))
        print('P_FED_F: {}'.format(fed_f))

    return [fed_f, fed_m, fed_l, fed_n], [bar, p_dcbe, p_ext, p_tk] 


p = processDists()
plot_all(p)
feds, probs = risk(p)
tree_planting(p, feds, probs)

print('Charts are ready to display')
