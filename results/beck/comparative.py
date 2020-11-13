import matplotlib as mtl# {{{
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
from include import Psql
# }}}
class processDists:

    def __init__(self):# {{{
        self.losses = dict()
        self.labels = []
        self.success = list()
        self.floors = 0
        self.total = list()
        self.dead = 0
        self.dir = sys.argv[1]
        #self.dir = "/home/aamks_users/mzimny94@gmail.com/SFPE_Case_study/S1"
        self.configs = self._get_json('{}/conf.json'.format(self.dir))
        self.p = Psql()
        if os.path.exists('{}/../picts'.format(self.dir)):
            shutil.rmtree('{}/../picts'.format(self.dir))
        os.makedirs('{}/../picts'.format(self.dir))
# }}}
    def get_scenarios(self):# {{{
            query = "SELECT distinct scenario_id FROM simulations where project = {}".format(self.configs['project_id'])
            results = self.p.query(query)
            s_list = [i[0] for i in results]
            return s_list

# }}}
    def plot_dcbe_dist(self, scenario_list):# {{{
        plt.clf()
        n = 1
        for proj in scenario_list:
            query = "SELECT dcbe_time FROM simulations where project = {} AND scenario_id = {} \
            AND dcbe_time is not null AND dcbe_time < 9999".format(self.configs['project_id'], proj)
            results = self.p.query(query)
            dcbe = [int(i[0]) for i in results]
            sns_plot = sns.distplot(dcbe, kde_kws={'cumulative': True, 'label': 'CDF CD{}'.format(n)}, bins=50)
            n+=1
        sns_plot.set(xlabel='Time [s]', ylabel='Probability [-]')
        fig = sns_plot.get_figure()
        fig.savefig("{}/../picts/m_dcbe.png".format(self.dir))
        plt.clf()
# }}}
    def plot_wcbe_dist(self, scenario_list):# {{{
        plt.clf()
        n = 1
        for proj in scenario_list:
            add = 0
            query = "SELECT wcbe FROM simulations where project = {} AND scenario_id = {} \
            AND dcbe_time is not null".format(self.configs['project_id'], proj)

            results = self.p.query(query)
            wcbe = list()
            dcbe = [json.loads(i[0]) for i in results]
            for i in dcbe:
                for value in i.values():
                    if value > 0:
                        #wcbe.append(lognorm(s=1, loc=30, scale=2.92).rvs() + add)
                        wcbe.append(value + lognorm(s=1, loc=30, scale=2.92).rvs())
            sns_plot = sns.distplot(wcbe, kde_kws={'cumulative': True, 'label': 'CDF CD{}'.format(n)}, bins=50)
            n+=1
        sns_plot.set(xlabel='Time [s]', ylabel='Probability [-]')
        fig = sns_plot.get_figure()
        fig.savefig("{}/../picts/m_wcbe.png".format(self.dir))
        plt.clf()
# }}}
    def plot_min_height(self):# {{{
        query = "SELECT min_hgt_compa * 100 FROM simulations where project = {} AND min_hgt_compa < 12.8"\
            .format(self.configs['project_id'])
        results = self.p.query(query)
        dcbe = [float(i[0]) for i in results]
        sns_plot = sns.distplot(dcbe, hist_kws={'cumulative': True}, kde_kws={'cumulative': True, 'label': 'CDF'}, bins=50)
        fig = sns_plot.get_figure()
        fig.savefig("{}/picts/height.png".format(self.dir))
        plt.clf()
# }}}
    def plot_run_time(self, scenario_list):# {{{
        n=1
        for proj in scenario_list:
            query = "SELECT run_time/60 FROM simulations where project = {} AND scenario_id = {} \
            AND dcbe_time is not null and run_time< 10000".format(self.configs['project_id'], proj)

            results = self.p.query(query)
            dcbe = [int(i[0]) for i in results]
            sns_plot = sns.distplot(dcbe, kde_kws={'cumulative': True, 'label': 'CDF CD{}'.format(n)}, bins=50)
            n+=1
        sns_plot.set(xlabel='Run-time [min]', ylabel='Probability [-]')
        fig = sns_plot.get_figure()
        fig.savefig("{}/../picts/runtime.png".format(self.dir))
        plt.clf()
# }}}
    def plot_min_height_cor(self, scenario_list):# {{{
        n=1
        for proj in scenario_list:
            query = "SELECT min_hgt_cor FROM simulations where project = {} AND scenario_id = {} \
            AND dcbe_time is not null".format(self.configs['project_id'], proj)
            results = self.p.query(query)
            dcbe = [float(i[0]) for i in results]
            sns_plot = sns.distplot(dcbe, kde_kws={'cumulative': True, 'label': 'CDF CD{}'.format(n)}, hist=False, bins=50)
            n+=1

        sns_plot.set(xlabel='Height [m]', ylabel='Probability [-]')
        fig = sns_plot.get_figure()
        fig.savefig("{}/../picts/m_hgt_cor.png".format(self.dir))
        plt.clf()
# }}}
    def plot_min_vis_cor(self, scenario_list):# {{{
        n=1
        for proj in scenario_list:
            query = "SELECT min_vis_cor FROM simulations where project = {} AND scenario_id = {} \
            AND dcbe_time is not null AND min_vis_cor<60".format(self.configs['project_id'], proj)
            results = self.p.query(query)
            dcbe = [float(i[0]) for i in results]
            sns_plot = sns.distplot(dcbe, kde_kws={'cumulative': True, 'label': 'CDF CD{}'.format(n)}, hist=False, bins=50)
            n+=1

        sns_plot.set(xlabel='Distance [m]', ylabel='Probability [-]')
        fig = sns_plot.get_figure()
        fig.savefig("{}/../picts/m_vis_cor.png".format(self.dir))
        plt.clf()

# }}}
    def plot_max_temp(self, scenario_list):# {{{
        n=1
        temp=list()
        for proj in scenario_list:
            query = "SELECT max_temp FROM simulations where project = {}  AND scenario_id = {} \
            and dcbe_time is not null".format(self.configs['project_id'], proj)
            results = self.p.query(query)
            for i in results:
                i = float(i[0])
                if i > 600:
                    i = 600
                temp.append(i)
            sns_plot = sns.distplot(temp, hist=False, kde_kws={'cumulative': True, 'label': 'CDF CD{}'.format(n)}, bins=50)
            n+=1

        sns_plot.set(xlabel='Temperature [C]', ylabel='Probability [-]')
        fig = sns_plot.get_figure()
        fig.savefig("{}/../picts/m_temp.png".format(self.dir))
        plt.clf()
# }}}
    def calculate_ccdf(self, scenario_list):# {{{

        fig = plt.figure(figsize=(12, 3))
        axs = [fig.add_subplot(131), fig.add_subplot(132), fig.add_subplot(133)]

        xtic = tic.MaxNLocator(3)
        n = 1
        for proj in scenario_list:
            success = 0
            total = 0
            losses = OrderedDict()
            losses={'fatalities': list(), 'seriously injured': list(), 'light injured': list(), 'neglegible': list()}

            query = "SELECT fed, id FROM simulations where project = {} AND scenario_id = {} \
            AND dcbe_time is not null".format(self.configs['project_id'], proj)
            results = self.p.query(query)
            self.total.append(len(results))
            row = [json.loads(i[0]) for i in results]
            fed=list()
            for i in row:
                f = {'H':0, 'M':0, 'L':0, 'N':0}
                for values in i.values():
                    s = 0
                    x = collections.Counter(np.array(values))
                    if 'H' in x.keys():
                        f['H']+=x['H']
                    if 'M' in x.keys():
                        f['M']+=x['M']
                    if 'L' in x.keys():
                        f['L']+=x['L']
                fed.append(f)
                if (f['H']==0) and (f['M']==0) and (f['M']==0):
                    success+=1

            for item in fed:
                for key in item.keys():
                    if key == 'H':
                        losses['fatalities'].append(item[key])
                    if key == 'M':
                        losses['seriously injured'].append(item[key])
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
                axs[wykres].plot(sorted(losses[key]), 1-dane(sorted(losses[key])), label='CD{}'.format(n))
                axs[wykres].legend()
                axs[wykres].set_xlabel('Number of people')
                axs[wykres].set_ylabel('Likelihood')
                axs[wykres].set_title(key)
                wykres += 1
            #axs[i].xaxis.set_major_formatter(tic.FormatStrFormatter('%4.f'))
            self.success.append(success)
            n+=1

        fig.tight_layout()
        fig.savefig('{}/../picts/m_ccdf.png'.format(self.dir))
        fig.clf()
# }}}
    def plot_pie_fault(self):# {{{
        labels = 'Success', 'Failure'
        colors = ['lightskyblue', 'lightcoral']
        fig = plt.figure(figsize=(12, 4))
        axs = [fig.add_subplot(141), fig.add_subplot(142), fig.add_subplot(143),fig.add_subplot(144)]
        
        for i in range(len(self.total)):
            sizes = [self.success[i], self.total[i]-self.success[i]]
            axs[i].pie(sizes, labels=labels, colors=colors, autopct='%1.1f%%', shadow=True, explode=(0.1, 0))
            axs[i].set_title('CD{}'.format(i+1))

        #plt.pie(sizes, explode=explode, labels=labels, colors=colors, autopct='%1.1f%%', shadow=True)
        #plt.axis('equal')
        fig.savefig('{}/../picts/pie_fault.png'.format(self.dir))
        fig.clf()
# }}}
    def _get_json(self, path):
        f = open(path, 'r')
        dump = json.load(f, object_pairs_hook=OrderedDict)
        f.close()
        return dump

p = processDists()
s_list = p.get_scenarios()
s_list = [351,349]
p.plot_dcbe_dist(scenario_list=s_list)
p.plot_wcbe_dist(scenario_list=s_list)
p.plot_min_height_cor(scenario_list=s_list)
p.plot_min_vis_cor(scenario_list=s_list)
p.plot_max_temp(scenario_list=s_list)
p.plot_run_time(scenario_list=s_list)
p.calculate_ccdf(scenario_list=s_list)
p.plot_pie_fault()

print('Charts are ready to display')
