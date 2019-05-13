import matplotlib as mtl
mtl.use('Agg') 
import json
from collections import OrderedDict
import psycopg2
import seaborn as sns
import numpy as np
import matplotlib.pyplot as plt
from statsmodels.distributions.empirical_distribution import ECDF as ecdf
import matplotlib.ticker as tic
from ete3 import Tree, TreeStyle, TextFace
import sys
import os
import shutil
from event_tree_en import EventTreeFED
from event_tree_en import EventTreeSteel
import scipy.stats as stat
import collections
from include import Sqlite
import csv
from numpy.random import binomial
from scipy.stats.distributions import lognorm
from collections import OrderedDict


class processDists:

    def __init__(self):
        self.losses = dict()
        self.labels = []
        self.losses_num = []
        self.t_k = 0
        self.total = 0
        self.dead = 0
        self.dir = sys.argv[1]
        self.configs = self._get_json('{}/conf.json'.format(self.dir))
        try:
            self.psql_connection=psycopg2.connect("dbname='aamks' user='aamks' host=192.168.0.10 password='hulakula'")

        except:
            print("postresql fatal")
        if os.path.exists('{}/picts'.format(self.dir)):
            shutil.rmtree('{}/picts'.format(self.dir))
        os.makedirs('{}/picts'.format(self.dir))

    def query(self, query):
        cursor = self.psql_connection.cursor()
        cursor.execute(query)
        return cursor.fetchall()

    def plot_dcbe_dist(self, project_list):
#        plt.clf()
        n = 1
        for proj in project_list:
            query = "SELECT dcbe_time FROM simulations where project = {} AND dcbe_time is not null AND dcbe_time < 9999".format(proj)
            results = self.query(query)
            dcbe = [int(i[0]) for i in results]
            sns_plot = sns.distplot(dcbe, kde_kws={'cumulative': True, 'label': 'CDF A{}'.format(n)}, bins=50)
            n+=1
        fig = sns_plot.get_figure()
        fig.savefig("{}/picts/m_dcbe.png".format(self.dir))
        plt.clf()

    def plot_wcbe_dist(self, project_list):
        n = 1
        for proj in project_list:
            add = 0
            query = "SELECT wcbe FROM simulations where project = {} AND dcbe_time is not null".format(proj)
            if proj == 4:
                add = lognorm(s=1, loc=899, scale=5.92).rvs() * binomial(1, 0.3)
            results = self.query(query)
            wcbe = list()
            dcbe = [json.loads(i[0]) for i in results]
            for i in dcbe:
                for value in i.values():
                    if proj == 4:
                        wcbe.append(lognorm(s=1, loc=30, scale=2.92).rvs() + add)
                    if value > 0:
                        wcbe.append(value)
            sns_plot = sns.distplot(wcbe, kde_kws={'cumulative': True, 'label': 'CDF A{}'.format(n)}, bins=50)
            n+=1
#        plt.xlabel('WCBE [s]')
#        plt.ylabel('Prawdopodobieństwo')
        fig = sns_plot.get_figure()
        fig.savefig("{}/picts/m_wcbe.png".format(self.dir))
        plt.clf()

    def plot_min_height(self):
        query = "SELECT min_hgt_compa * 100 FROM simulations where project = {} AND min_hgt_compa < 12.8"\
            .format(self.configs['project_id'])
        results = self.query(query)
        dcbe = [float(i[0]) for i in results]
        sns_plot = sns.distplot(dcbe, hist_kws={'cumulative': True}, kde_kws={'cumulative': True, 'label': 'CDF'}, bins=50)
#        sns.plt.xlabel('Wysokość warstwy dymu [cm]')
#        sns.plt.ylabel('Prawdopodobieństwo')
        fig = sns_plot.get_figure()
        fig.savefig("{}/picts/height.png".format(self.dir))
        plt.clf()

    def plot_run_time(self, project_list):
        n=1
        for proj in project_list:
            query = "SELECT run_time FROM simulations where project = {} AND dcbe_time is not null ".format(proj)
            results = self.query(query)
            dcbe = [int(i[0]) for i in results]
            sns_plot = sns.distplot(dcbe, kde_kws={'cumulative': True, 'label': 'Runtime CDF A{}'.format(n)}, bins=50)
#        sns.plt.xlabel('Wysokość warstwy dymu [cm]')
#        sns.plt.ylabel('Prawdopodobieństwo')
            n+=1
        fig = sns_plot.get_figure()
        fig.savefig("{}/picts/runtime.png".format(self.dir))
        plt.clf()

    def plot_min_height_cor(self):
        query = "SELECT min_hgt_cor * 100 FROM simulations where project = {} AND min_hgt_cor < 12.8"\
            .format(self.configs['project_id'])
        results = self.query(query)
        dcbe = [float(i[0]) for i in results]
        sns_plot = sns.distplot(dcbe, hist_kws={'cumulative': True}, kde_kws={'cumulative': True, 'label': 'CDF'}, bins=50)
#        sns.plt.xlabel('Wysokość warstwy dymu [cm]')
#        sns.plt.ylabel('Prawdopodobieństwo')
        fig = sns_plot.get_figure()
        fig.savefig("{}/picts/hgt_cor.png".format(self.dir))
        plt.clf()


    def plot_min_vis(self):
        query = "SELECT min_vis_compa FROM simulations where project = {} AND min_vis_compa < 60".format(self.configs['project_id'])
        results = self.query(query)
        vis = [float(i[0]) for i in results]
        sns_plot = sns.distplot(vis, hist_kws={'cumulative': True}, kde_kws={'cumulative': True, 'label': 'CDF'}, bins=50)
#        sns.plt.xlabel('Zasięg widzialności [m]')
#        sns.plt.ylabel('Prawdopodobieństwo')
        fig = sns_plot.get_figure()
        fig.savefig("{}/picts/vis.png".format(self.dir))
        plt.clf()

    def plot_min_vis_cor(self):
        query = "SELECT min_vis_cor FROM simulations where project = {} AND min_vis_cor < 60".format(self.configs['project_id'])
        results = self.query(query)
        vis = [float(i[0]) for i in results]
        sns_plot = sns.distplot(vis, hist_kws={'cumulative': True}, kde_kws={'cumulative': True, 'label': 'CDF'}, bins=50)
        #sns.plt.xlabel('Zasięg widzialności [m]')
        #sns.plt.ylabel('Prawdopodobieństwo')
        fig = sns_plot.get_figure()
        fig.savefig("{}/picts/vis_cor.png".format(self.dir))
        plt.clf()


    def plot_max_temp(self):
        query = "SELECT max_temp FROM simulations where project = {} and dcbe_time is " \
                "not null".format(self.configs['project_id'])
        results = self.query(query)
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

    def calculate_ccdf(self, project_list):

        fig = plt.figure(figsize=(12, 3))
        axs = [fig.add_subplot(131), fig.add_subplot(132), fig.add_subplot(133)]

        xtic = tic.MaxNLocator(3)
        n = 1
        for proj in project_list:

            losses = OrderedDict()
            losses={'fatalities': list(), 'heavy injured': list(), 'light injured': list(), 'neglegible': list()}

            query = "SELECT fed, id FROM simulations where project = {} " \
                "and dcbe_time IS NOT NULL".format(proj)
            results = self.query(query)
            self.total = len(results)
            row = [json.loads(i[0]) for i in results]
            fed=list()
            for i in row:
                for values in i.values():
                    fed.append(collections.Counter(np.array(values)))

            for item in fed:
                for key in item.keys():
                    if key == 'H':
                        losses['fatalities'].append(item[key])
                    if key == 'M':
                        losses['heavy injured'].append(item[key])
                    if key == 'L':
                        losses['light injured'].append(item[key])
                    if key == 'N':
                        losses['neglegible'].append(item[key])

            wykres = 0
            for key in losses.keys():
                if key == 'neglegible':
                    continue
                if len(losses[key]) == 0:
                    continue 
                dane = ecdf(losses[key])
                axs[wykres].plot(sorted(losses[key]), 1-dane(sorted(losses[key])), label='A{}'.format(n))
                axs[wykres].legend()
                axs[wykres].set_xlabel('Number of people')
                axs[wykres].set_ylabel('Likelihood')
                axs[wykres].set_title(key)
                wykres += 1
            #axs[i].xaxis.set_major_formatter(tic.FormatStrFormatter('%4.f'))
            n+=1

        fig.tight_layout()
        fig.savefig('{}/picts/m_ccdf.png'.format(self.dir))
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

    def plot_event_tree(self):
        t = Tree("((1:0.001, 0.1:0.23, 0.001, >0.001), NIE);")
        t = Tree("((D: 0.723274, F: 0.567784)1.000000: 0.067192, (B: 0.279326, H: 0.756049)1.000000: 0.807788);")
        t.support = 0.1
        ts = TreeStyle()
        ts.show_leaf_name = True
        ts.show_branch_length = True
        ts.show_branch_support = True

        t.add_face(TextFace(" hola "), column=0, position = 'branch-right')
        t.show(tree_style=ts)


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
        labels = 'Success', 'Failure'
        colors = ['lightskyblue', 'lightcoral']
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
        b_type = 'educational'
        ignition = building[b_type][0]*(area) ** (building[b_type][2]) + \
                   building[b_type][1] * (area) ** (building[b_type][3])
        return ignition

    def dcbe_values(self):
        query = "SELECT count(*) FROM simulations where project = {} AND dcbe_time < 9999".format(
            self.configs['project_id'])
        results = self.query(query)
        lower = results[0][0]/self.total

        query = "SELECT avg(dcbe_time) FROM simulations where project = {} AND dcbe_time < 9999".format(
            self.configs['project_id'])
        results = self.query(query)
        mean = results[0][0]
        return [lower, mean]

    def wcbe_values(self):
        query = "SELECT avg(wcbe) FROM simulations where project = {} AND dcbe_time IS NOT NULL".format(
            self.configs['project_id'])
        results = self.query(query)
        return results[0][0]

    def min_height_values(self):
        query = "SELECT count(*) FROM simulations where project = {} AND min_hgt_cor < 0.5" \
            .format(self.configs['project_id'])
        results = self.query(query)
        lower = results[0][0] / self.total

        query = "SELECT avg(min_hgt_compa) FROM simulations where project = {} AND min_hgt_cor < 1.8" \
            .format(self.configs['project_id'])
        results = self.query(query)
        mean = results[0][0]
        return [lower, mean]

    def vis_values(self):
        query = "SELECT count(*) FROM simulations where project = {} AND min_vis_cor < 30".format(
            self.configs['project_id'])
        results = self.query(query)
        lower = results[0][0] / self.total

        query = "SELECT avg(min_vis_compa) FROM simulations where project = {} AND min_vis_cor < 60".format(
            self.configs['project_id'])
        results = self.query(query)
        mean = results[0][0]
        return [lower, mean]

    def temp_values(self):
        query = "SELECT count(*) FROM simulations where project = {} AND max_temp > 450".format(
            self.configs['project_id'])
        results = self.query(query)
        lower = results[0][0] / self.total

        query = "SELECT avg(max_temp) FROM simulations where project = {} and dcbe_time is " \
                "not null".format(self.configs['project_id'])
        results = self.query(query)
        mean = results[0][0]
        return [lower, mean]

    def calculate_building_area(self):
        s=Sqlite("{}/aamks.sqlite".format(self.dir))
        result = s.query("SELECT sum(room_area) as total FROM aamks_geom");
        return result[0]['total']

p = processDists()
p.plot_dcbe_dist(project_list=[4,9,5,8])
p.plot_wcbe_dist(project_list=[4,9,5,8])
p.plot_run_time(project_list=[9,4,5,8])
#p.plot_min_height()
#p.plot_min_height_cor()
#p.plot_max_temp()
#p.plot_min_vis()
#p.plot_min_vis_cor()
#wprint(p.wcbe_time(1000))
p.calculate_ccdf(project_list=[5,9,4,8])
#p.plot_ccdf()
#p.plot_ccdf_percentage()
#p.plot_losses_hist()
#p.plot_pie_fault()
#print(p.total)

#bar = p.calculate_barrois(p.calculate_building_area())*p.calculate_building_area()
#bar = 10e-6 * 1530
#print(p.calculate_building_area())
#if p.losses_num[4] == 0:
#    p.losses_num[4] = 1e-12
#
#fed_f = float('%.3f' % (len(p.losses['dead'])/p.total))
#fed_m = float('%.3f' % (len(p.losses['heavy'])/p.total))
#fed_l = float('%.3f' % (len(p.losses['light'])/p.total))
#fed_n = float('%.3f' % (len(p.losses['neglegible'])/p.total))
#t_kryt = float('%.3f' % (len(p.losses['dead'])/p.total))
#p_ext = float('%.3f' % 0.17)
#p_tk = float('%.3f' % (p.t_k/p.total))
#
#with open('{}/picts/dane.txt'.format(p.dir), 'w') as g: 
#    dcbe_val = p.dcbe_values()
#    g.write("DCBE - PER: {}, MEAN: {}".format(dcbe_val[0], dcbe_val[1]))
#    #wcbe_val = p.wcbe_values()
#    #g.write("WCBE -  MEAN: {} s, {} min".format(wcbe_val, wcbe_val/60))
#    min_height_val = p.min_height_values()
#    g.write("MIN_HEIGHT - PER: {}, MEAN: {}".format(min_height_val[0], min_height_val[1]))
#    min_vis = p.vis_values()
#    g.write("MIN_VISIBILITY - PER: {}, MEAN: {}".format(min_vis[0], min_vis[1]))
#    temp_val = p.temp_values()
#    g.write("MAX_TEMP - PER: {}, MEAN: {}".format(temp_val[0], temp_val[1]))
#    g.write('P_dcbe: {}'.format(t_kryt*bar*p_ext))
#
#
#t = EventTreeFED(building=p.dir, p_general=bar, p_develop=p_ext, p_dcbe=t_kryt, p_fed_n=fed_n, p_fed_l=fed_l, p_fed_m=fed_m, p_fed_f=fed_f)
#t.draw_tree()
#
#s = EventTreeSteel(building=p.dir, p_general=bar, p_develop=p_ext, p_Tk=p_tk, p_time_less=0.001)
#s.draw_tree()
##p.plot_event_tree()

print('Charts are ready to display')
