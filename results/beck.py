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
from ete3 import Tree #, TreeStyle, TextFace
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
        self.configs = self._get_json('{}/conf.json'.format(self.dir))
        self.p = Psql()
        self.avg_risk = list()
        self.err_risk = list()
        if os.path.exists('{}/picts'.format(self.dir)):
            shutil.rmtree('{}/picts'.format(self.dir))
        os.makedirs('{}/picts'.format(self.dir))
        self.horisontal_time=dict({'0': 3, '1': 36, '2': 72, '3': 112, '4': 148, '5': 184, '6': 220})

    def plot_dcbe_dist(self):
#        plt.clf()
        query = "SELECT dcbe_time FROM simulations where project = {} AND scenario_id = {} AND dcbe_time is not null AND dcbe_time < 9999".format(self.configs['project_id'], self.configs['scenario_id'])
        results = self.p.query(query)
        dcbe = [int(i[0]) for i in results]
        sns_plot = sns.distplot(dcbe, hist_kws={'cumulative': True}, kde_kws={'cumulative': True}, bins=50)
        #plt.xlabel=('DCBE [s]')
        #plt.xlim([0,499])
        fig = sns_plot.get_figure()
        fig.savefig("{}/picts/dcbe.png".format(self.dir))
        plt.clf()

    def plot_wcbe_dist_r(self):
#        plt.clf()
        query = "SELECT run_time FROM simulations where project = {} AND scenario_id = {} AND dcbe_time is not null AND dcbe_time < 9999".format(self.configs['project_id'], self.configs['scenario_id'])
        results = self.p.query(query)
        dcbe = [int(i[0]) for i in results]
        sns_plot = sns.distplot(dcbe, hist_kws={'cumulative': True}, kde_kws={'cumulative': True}, bins=50)
        #plt.xlabel=('DCBE [s]')
        #plt.xlim([0,499])
        fig = sns_plot.get_figure()
        fig.savefig("{}/picts/wcbe_r.png".format(self.dir))
        plt.clf()

    def plot_wcbe_dist(self):
        query = "SELECT wcbe FROM simulations where project = {} AND scenario_id = {} AND dcbe_time is not null".format(self.configs['project_id'], self.configs['scenario_id'])
        results = self.p.query(query)
        wcbe = list()
        dcbe = [json.loads(i[0]) for i in results]
        for i in dcbe:
            for key in i.keys():
                i.update({key: (i[key] + int(self.horisontal_time[key]))})
            item = max(i.values())
            if item > 0:
                wcbe.append(item)
        sns_plot = sns.distplot(wcbe, hist_kws={'cumulative': True}, kde_kws={'cumulative': True, 'label': 'CDF'}, bins=50)
#        plt.xlabel('WCBE [s]')
#        plt.ylabel('Prawdopodobieństwo')
        fig = sns_plot.get_figure()
        fig.savefig("{}/picts/wcbe.png".format(self.dir))
        plt.clf()

    def plot_min_height(self):
        query = "SELECT min_hgt_compa * 100 FROM simulations where project = {} AND scenario_id = {} AND min_hgt_compa < 12.8"\
            .format(self.configs['project_id'], self.configs['scenario_id'])
        results = self.p.query(query)
        dcbe = [float(i[0]) for i in results]
        sns_plot = sns.distplot(dcbe, hist_kws={'cumulative': True}, kde_kws={'cumulative': True, 'label': 'CDF'}, bins=50)
#        sns.plt.xlabel('Wysokość warstwy dymu [cm]')
#        sns.plt.ylabel('Prawdopodobieństwo')
        fig = sns_plot.get_figure()
        fig.savefig("{}/picts/height.png".format(self.dir))
        plt.clf()

    def plot_min_height_cor(self):
        query = "SELECT min_hgt_cor * 100 FROM simulations where project = {} AND scenario_id = {} AND min_hgt_cor < 12.8"\
            .format(self.configs['project_id'], self.configs['scenario_id'])
        results = self.p.query(query)
        dcbe = [float(i[0]) for i in results]
        sns_plot = sns.distplot(dcbe, hist_kws={'cumulative': True}, kde_kws={'cumulative': True, 'label': 'CDF'}, bins=50)
#        sns.plt.xlabel('Wysokość warstwy dymu [cm]')
#        sns.plt.ylabel('Prawdopodobieństwo')
        fig = sns_plot.get_figure()
        fig.savefig("{}/picts/hgt_cor.png".format(self.dir))
        plt.clf()


    def plot_min_vis(self):
        query = "SELECT min_vis_compa FROM simulations where project = {} AND scenario_id = {} AND min_vis_compa < 60".format(self.configs['project_id'], self.configs['scenario_id'])
        results = self.p.query(query)
        vis = [float(i[0]) for i in results]
        sns_plot = sns.distplot(vis, hist_kws={'cumulative': True}, kde_kws={'cumulative': True, 'label': 'CDF'}, bins=50)
#        sns.plt.xlabel('Zasięg widzialności [m]')
#        sns.plt.ylabel('Prawdopodobieństwo')
        fig = sns_plot.get_figure()
        fig.savefig("{}/picts/vis.png".format(self.dir))
        plt.clf()

    def plot_min_vis_cor(self):
        query = "SELECT min_vis_cor FROM simulations where project = {} AND scenario_id = {} AND min_vis_cor < 60".format(self.configs['project_id'], self.configs['scenario_id'])
        results = self.p.query(query)
        vis = [float(i[0]) for i in results]
        sns_plot = sns.distplot(vis, hist_kws={'cumulative': True}, kde_kws={'cumulative': True, 'label': 'CDF'}, bins=50)
        #sns.plt.xlabel('Zasięg widzialności [m]')
        #sns.plt.ylabel('Prawdopodobieństwo')
        fig = sns_plot.get_figure()
        fig.savefig("{}/picts/vis_cor.png".format(self.dir))
        plt.clf()


    def plot_max_temp(self):
        query = "SELECT max_temp FROM simulations where project = {} AND scenario_id = {} and dcbe_time is " \
                "not null".format(self.configs['project_id'], self.configs['scenario_id'])
        results = self.p.query(query)
        dcbe = [float(i[0]) for i in results]
        dist = getattr(stat, 'norm')
        param = dist.fit(dcbe)
        #print(param)
        dcbe_n = np.array(dcbe)
        self.t_k= len(dcbe_n[dcbe_n > 450])
        sns_plot = sns.distplot(dcbe, hist_kws={'cumulative': True}, kde_kws={'cumulative': True, 'label': 'CDF'}, bins=50)
#        sns.plt.xlabel('Temperatura ')
#        sns.plt.ylabel('Prawdopodobieństwo')
        fig = sns_plot.get_figure()
        fig.savefig("{}/picts/temp.png".format(self.dir))
        plt.clf()

    def calculate_ccdf(self):
        losses={'dead': list(), 'heavy': list(), 'light': list(), 'neglegible': list()}

        query = "SELECT fed, id FROM simulations where project = {} and scenario_id = {} " \
                "and dcbe_time IS NOT NULL".format(self.configs['project_id'], self.configs['scenario_id'])
        results = self.p.query(query)
        self.total = len(results)
        row = [json.loads(i[0]) for i in results]
        fed=list()
        for i in row:
            temp_list = list()
            for key, values in i.items():
                temp_list = temp_list + values
                #print("KEY: {}, VALUE: {}\n".format(key, values))
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
                continue 
            dane = ecdf(self.losses[key])
            axs[wykres].plot(sorted(self.losses[key]), 1-dane(sorted(self.losses[key])))
            axs[wykres].set_xlabel('Number of people')
            axs[wykres].set_ylabel('Likelihood')
            axs[wykres].set_title(key)
            wykres += 1
            #axs[i].xaxis.set_major_formatter(tic.FormatStrFormatter('%4.f'))

        fig.tight_layout()
        fig.savefig('{}/picts/ccdf.png'.format(self.dir))
        fig.clf()

    def calculate_indvidual_risk(self):
        query = "SELECT i_risk FROM simulations where project = {} AND scenario_id = {} AND dcbe_time is not null AND i_risk is not null".format(self.configs['project_id'], self.configs['scenario_id'])
        results = self.p.query(query)
        row = [json.loads(i[0]) for i in results]
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
        for key in self.losses.keys():
            if len(self.losses[key]) == 0:
                continue
            fig = plt.figure()
            plt.hist(self.losses[key], bins=20)
            plt.title(key)
            plt.xlabel('Number of casualities')
            plt.ylabel('Number of scenarios ')
            fig.savefig('{}/picts/losses{}.png'.format(self.dir, key))
            fig.clf()

    def plot_pie_fault(self):
        fig = plt.figure()
        sizes = [len(self.losses['dead']), self.total-len(self.losses['dead'])]
        labels = ['Failure', 'Success']
        colors = ['lightcoral', 'lightskyblue']
        explode = (0.1, 0)
        plt.pie(sizes, explode=explode, labels=labels, colors=colors, autopct='%1.1f%%', shadow=True)
        plt.axis('equal')
        fig.savefig('{}/picts/pie_fault.png'.format(self.dir))
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
        b_type = 'other_building'
        ignition = building[b_type][0]*(area) ** (building[b_type][2]) + \
                   building[b_type][1] * (area) ** (building[b_type][3])
        return ignition

    def dcbe_values(self):
        query = "SELECT count(*) FROM simulations where project = {} AND scenario_id = {} AND dcbe_time < 9999".format(
            self.configs['project_id'], self.configs['scenario_id'])
        results = self.p.query(query)
        lower = results[0][0]/self.total

        query = "SELECT avg(dcbe_time) FROM simulations where project = {} AND scenario_id = {} AND dcbe_time < 9999".format(
            self.configs['project_id'], self.configs['scenario_id'])
        results = self.p.query(query)
        mean = results[0][0]
        return [lower, mean]

    def wcbe_values(self):
        query = "SELECT avg(wcbe) FROM simulations where project = {} AND scenario_id = {} AND dcbe_time IS NOT NULL".format(
            self.configs['project_id'], self.configs['scenario_id'])
        results = self.p.query(query)
        return results[0][0]

    def min_height_values(self):
        query = "SELECT count(*) FROM simulations where project = {} AND scenario_id = {} AND min_hgt_cor < 0.5" \
            .format(self.configs['project_id'], self.configs['scenario_id'])
        results = self.p.query(query)
        lower = results[0][0] / self.total

        query = "SELECT avg(min_hgt_compa) FROM simulations where project = {} AND scenario_id = {} AND min_hgt_cor < 1.8" \
            .format(self.configs['project_id'], self.configs['scenario_id'])
        results = self.p.query(query)
        mean = results[0][0]
        return [lower, mean]

    def vis_values(self):
        query = "SELECT count(*) FROM simulations where project = {} AND scenario_id = {} AND min_vis_cor < 30".format(
            self.configs['project_id'], self.configs['scenario_id'])
        results = self.p.query(query)
        lower = results[0][0] / self.total

        query = "SELECT avg(min_vis_compa) FROM simulations where project = {} AND scenario_id = {} AND min_vis_cor < 60".format(
            self.configs['project_id'], self.configs['scenario_id'])
        results = self.p.query(query)
        mean = results[0][0]
        return [lower, mean]

    def temp_values(self):
        query = "SELECT count(*) FROM simulations where project = {} AND scenario_id = {} AND max_temp > 450".format(
            self.configs['project_id'], self.configs['scenario_id'])
        results = self.p.query(query)
        lower = results[0][0] / self.total

        query = "SELECT avg(max_temp) FROM simulations where project = {} AND scenario_id = {} and dcbe_time is " \
                "not null".format(self.configs['project_id'], self.configs['scenario_id'])
        results = self.p.query(query)
        mean = results[0][0]
        return [lower, mean]

    def copy_data(self):
        query = "COPY (SELECT * FROM simulations where project = {} AND scenario_id = {}) TO STDOUT WITH CSV DELIMITER ';' HEADER".format(self.configs['project_id'], self.configs['scenario_id'])
        self.p.copy_expert(sql=query, csv_file='{}/picts/data.csv'.format(p.dir))

    def calculate_building_area(self):
        s=Sqlite("{}/aamks.sqlite".format(self.dir))
        result = s.query("SELECT sum(room_area) as total FROM aamks_geom");
        return result[0]['total']/10000

    def plot_heatmap_positions_fed_growth(self):

        aamks_sqlite = Sqlite("{}/aamks.sqlite".format(self.dir))
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

            fig = plt.figure()
            plt.grid(False)
            ax = fig.add_subplot(111)
            colors = {'ROOM': '#8C9DCE', 'COR': '#385195', 'HALL': '#DBB55B', 'CONTOUR': '#000000', 'DOOR': '#005000'}
            cmap = matplotlib.cm.get_cmap('Reds')
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

p = processDists()
p.plot_dcbe_dist()
p.plot_wcbe_dist()
p.plot_wcbe_dist_r()
p.plot_min_height()
p.plot_min_height_cor()
p.plot_max_temp()
p.plot_min_vis()
p.plot_min_vis_cor()
#wprint(p.wcbe_time(1000))
p.calculate_ccdf()
p.plot_ccdf()
#p.plot_ccdf_percentage()
p.plot_losses_hist()
p.plot_pie_fault()
p.copy_data()
#print(p.total)
p.plot_heatmap_positions_fed_growth()

bar = p.calculate_barrois(p.calculate_building_area())*p.calculate_building_area()
#bar = 10e-6 * 1530
#bar = (4e-3)/3
print(p.calculate_building_area())
#if p.losses_num[4] == 0:
#    p.losses_num[4] = 1e-12

fed_f = float('%.3f' % (p.calculate_indvidual_risk()))
fed_m = float('%.3f' % (len(p.losses['heavy'])/p.total))
fed_l = float('%.3f' % (len(p.losses['light'])/p.total))
fed_n = float('%.3f' % (len(p.losses['neglegible'])/p.total))
p_dcbe = float('%.3f' % (len(p.dcbe)/p.total))
p_ext = float('%.3f' % 0.17)
p_tk = float('%.3f' % (p.t_k/p.total))
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


t = EventTreeFED(building=p.dir, p_general=bar, p_develop=p_ext, p_dcbe=p_dcbe, p_fed_n=fed_n, p_fed_l=fed_l, p_fed_m=fed_m, p_fed_f=fed_f, mode='F')
t.draw_tree()
t = EventTreeFED(building=p.dir, p_general=bar, p_develop=p_ext, p_dcbe=p_dcbe, p_fed_n=fed_n, p_fed_l=fed_l, p_fed_m=fed_m, p_fed_f=fed_f, mode='M')
t.draw_tree()

s = EventTreeSteel(building=p.dir, p_general=bar, p_develop=p_ext, p_Tk=p_tk, p_time_less=0.001)
s.draw_tree()

print('Charts are ready to display')
