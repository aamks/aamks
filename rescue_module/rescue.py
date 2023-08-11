import os
from collections import OrderedDict
from numpy.random import choice
from numpy.random import uniform
from numpy.random import normal
from numpy.random import lognormal
from numpy.random import binomial
from numpy.random import gamma
from numpy.random import triangular
from numpy.random import seed
from numpy.random import randint
from numpy import array as npa
from include import Json
from collections import OrderedDict
from math import floor
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import statistics
import openpyxl
from scipy import stats

class Rescue():
    def __init__(self, conf, sim_id):
        self.conf = conf
        self.sim_id = sim_id
        self.electronic = bool(int(self.conf["RESCUE"]["electronic"]))  # electronic/phone_call 1/0
        self.distance_short = self.conf["RESCUE"]["dist_short"] # distance from nearest fire department
        self.distance_long = self.conf["RESCUE"]["dist_long"] # distance from second nearest fire department
        self.cpr = bool(int(self.conf["RESCUE"]["CPR"]))
        self.data = {}

    def main(self):
        self.get_pre_intervention_time()        
        self.get_intervention_time() 
        self.get_all_times() 
        self.save_params()

    def get_pre_intervention_time(self):
        if self.electronic == True:
            self.data["Type"] = "electronic"
            self.get_detection()
            self.get_t1()
            self.get_t2()
            self.pre_intervention_time = self.t_detection + self.t_1 + self.t_2
            if self.cpr == True:
                self.get_cpr()
                self.pre_intervention_time += self.t_cpr            
        else:
            self.data["Type"] = "phone call"
            self.get_observation()
            self.get_pre_phone_call()
            self.get_phone_call()
            self.pre_intervention_time = self.t_observation + self.t_pre_phone_call + self.t_phone_call
            self.pre_intervention_time = round(self.pre_intervention_time, 1)
        self.data["Pre intervention"] = self.pre_intervention_time
 
    def get_intervention_time(self):
        self.get_alarm()
        self.get_arrival()
        self.get_diagnosis()
        self.intervention_time = self.t_alarm + self.t_arrival + self.t_diagnosis 
        self.intervention_time = round(self.intervention_time, 1)
        self.data["Intervention"] = self.intervention_time

    def get_all_times(self): 
        self.total_time = int(self.pre_intervention_time + self.intervention_time)   
        self.data["Total"] = self.total_time


    """   ---Time components---   """

    def get_detection(self):
        """ Detection time - user defined """
        self.t_detection = self.conf["RESCUE"]["detection"]
        self.data["detection"] = self.t_detection

    def get_t1(self):
        """ T1 time - user defined """
        self.t_1 = self.conf["RESCUE"]["t1"]
        self.data["T1"] = self.t_1    
    
    def get_t2(self):
        """ T2 time -- user defined """
        self.t_2 = self.conf["RESCUE"]["t2"] 
        self.data["T2"] = self.t_2

    def get_cpr(self):
        """ CPR - phone call time in electronic, calculated only when CPR in form = 1 (True)) """
        self.t_cpr = self.gamma_result(alpha=4.493, beta=0.02947, alpha_uncertain=0.02, beta_uncertain=0.00013)
        self.data["CPR"] = self.t_cpr

    def get_observation(self):
        """ Time from ignition to observe the fire """
        observation = self.lognormal_result(mean=1.1927, sigma=1.4375, mean_uncertain=0.0036, sigma_uncertain=0.003)
        observation_seconds = observation*60
        self.t_observation = round(observation_seconds,2)
        self.data["Observation"] = self.t_observation

    def get_pre_phone_call(self):
        """ Time from observing fire to make a call """
        pre_phone_call = self.lognormal_result(mean=-0.1849, sigma=1.3975, mean_uncertain=0.041, sigma_uncertain=0.041)
        pre_phone_call_seconds = pre_phone_call * 60
        self.t_pre_phone_call = round(pre_phone_call_seconds,2)
        self.data["Pre Phone Call"] = self.t_pre_phone_call 

    def get_phone_call(self):
        """ Phone call with security services """
        self.t_phone_call = self.gamma_result(alpha=4.493, beta=0.02947, alpha_uncertain=0.02, beta_uncertain=0.00013)
        self.data["Phone Call"] = self.t_phone_call

    def get_alarm(self):
        """ Alarming time """       
        self.t_alarm = self.lognormal_result(mean=4.219, sigma=0.2617, mean_uncertain=0.011, sigma_uncertain=0.0097) 
        self.data["Alarm"] = self.t_alarm

    def get_arrival(self):
        """ Arrival time """
        self.day_or_night_from_probability()
        self.get_distance()
        distance_params = self.find_distance_params()
        mean, mean_uncertain = distance_params[self.day_or_night][0]
        sigma, sigma_uncertain = distance_params[self.day_or_night][1]
        self.t_arrival = self.lognormal_result(mean, sigma, mean_uncertain, sigma_uncertain) 
        self.data["Arrival"] = self.t_arrival
    
    def get_diagnosis(self):
        """ Reconnaissance time- adding with 15% propability """
        add_diagnosis = choice([True, False], p=[0.15, 0.85])
        self.data["Add diagnosis?"] = add_diagnosis
        if add_diagnosis:
            diagnosis_times =           [1, 2, 3, 4, 5, 7, 10, 15]
            diagnosis_propability=      [0.01, 0.26, 0.22, 0.06, 0.3, 0.02, 0.08, 0.05]
            t_diagnosis = choice(npa(diagnosis_times), p=diagnosis_propability)
        else:
            t_diagnosis = 0
        self.t_diagnosis = t_diagnosis*60 
        self.data["Diagnosis"] = self.t_diagnosis
      
    def day_or_night_from_probability(self):   
        """ Defying is it a day or night by propability """
        self.day_or_night = choice(["day","night"],p=[1-0.178, 0.178])
        self.data['Day or night'] = self.day_or_night

    def get_distance(self):
        """ Get the distance depending of the propability - fire department that has shorter distance has more propability to be dispatched"""
        self.distance = choice(npa([self.distance_short, self.distance_long]), p=[0.9862, 0.0138])
        self.data['distance'] = self.distance
        
    def find_distance_params(self):
        """ Find parameters of mi and sigma when distance and day is calculated """
        arrival_data = OrderedDict()
        arrival_data = {
            "1": {
                "day": [(5.244, 0.005), (0.513, 0.004)],
                "night": [(5.344, 0.01), (0.52, 0.007)]
                },
            "2":{
                "day": [(5.616,0.004 ), (0.378, 0.003)],
                "night": [( 5.673, 0.006) , (0.41 ,0.004)]
                },         
            "3":{
                "day": [(5.804, 0.003), (0.335 , 0.002)],
                "night": [(5.891,0.005 ), (0.352 ,0.003 )]
                },         
            "4":{
                "day": [( 5.981, 0.003 ), (0.294 ,0.002 )],
                "night": [(6.047 , 0.005 ), (0.307 , 0.004 )]
                },         
            "5":{
                "day": [( 6.126, 0.003), (0.274 , 0.002)],
                "night": [(6.192 ,0.006 ), (0.279 ,0.004 )]
                },         
            "6":{
                "day": [(6.247 ,0.004 ), (0.252 , 0.003)],
                "night": [( 6.309, 0.008 ), (0.264 ,0.006 )]
                },         
            "7":{
                "day": [( 6.355 ,0.005 ), (0.243 , 0.004)],
                "night": [(6.407, 0.01), (0.24 ,0.007 )]
                },         
            "8":{
                "day": [(6.443 ,0.006 ), (0.232 ,0.005 )],
                "night": [(6.479 ,0.013 ), (0.248 ,0.009 )]
                },         
            "9":{
                "day": [( 6.522, 0.008 ), (0.206 , 0.006)],
                "night": [(6.569 ,0.017 ), (0.221 ,0.012 )]
                },         
            "10":{
                "day": [(6.603 ,0.009 ), (0.213 ,0.006 )],
                "night": [(6.647 ,0.015 ), (0.0204 ,0.011 )]
                },         
            "11":{
                "day": [(6.685 ,0.013 ), (0.192 , 0.009)],
                "night": [(6.76 ,0.032 ), (0.251 ,0.022 )]
                },           
            "12":{
                "day": [(6.758,0.014 ), (0.184 , 0.01)],
                "night": [(6.819 ,0.029 ), (0.233 ,0.02 )]
                },           
            "13":{
                "day": [(6.821, 0.024), (0.199 , 0.017)],
                "night": [(6.818, 0.031), (0.156 , 0.022)]
                },           
            "14":{
                "day": [(6.901 ,0.031), (0.187 ,0.022 )],
                "night": [( 6.81, 0.046), (0.131 , 0.033)]
                },           
            "15":{
                "day": [(6.917, 0.023), (0.142 , 0.017)],
                "night": [(7.346, 0.129), ( 0.29, 0.091)]
                },           
            "20":{
                "day": [(7.078 ,0.036 ), (0.268 , 0.025)],
                "night": [(7.136 ,0.058 ), (0.269 ,0.041)]
                },   
            } 
        for key,value in arrival_data.items():
            if int(key) < self.distance: 
                pass
            else:  
                distance_params = value
                self.data["Distance_parameters" ] = distance_params
                return distance_params

    def lognormal_result(self, mean, sigma, mean_uncertain, sigma_uncertain):
        mean_with_uncertainity = self.uncertain(mean, mean_uncertain)
        sigma_with_uncertainity = self.uncertain(sigma, sigma_uncertain)
        result_long = lognormal(mean_with_uncertainity, sigma_with_uncertainity)
        result = round(result_long,2)
        return result

    def gamma_result(self, alpha, beta, alpha_uncertain, beta_uncertain):
        alpha_with_uncertainity = self.uncertain(alpha, alpha_uncertain)
        beta_with_uncertainity = self.uncertain(beta, beta_uncertain)
        theta = 1/beta_with_uncertainity
        result_long = gamma(alpha_with_uncertainity, theta)
        result = round(result_long,2)
        return result

    def uncertain(self, main, uncert):
        return round(uniform(main-uncert, main+uncert), 5)

    def save_params(self):
        rescue_txt_pwd = os.path.join(os.environ['AAMKS_PROJECT'], 'workers', str(self.sim_id), "rescue.txt")
        with open (rescue_txt_pwd,"a") as file:
            file.write("--- Time parameters --- \n")
            for (k,v) in self.data.items():
                line = str(str(k)+ " : " +str(v)+ "\n")
                file.write(line)
            file.write("\n")


class Nozzles:
    def __init__(self, conf, sim_id, alpha, hrr_peak):
        self.conf = conf
        self.sim_id = sim_id
        self.dh = self.conf["RESCUE"]["fire_distance_horizontal"]
        self.dv = self.conf["RESCUE"]["fire_distance_vertical"]
        self.pressure_after_drop = 0.6 - (self.dh/1000 + self.dv/100) 
        self.k = 175
        self.alpha = alpha
        self.hrr_peak = hrr_peak
        self.water_flow = self.k * (10*self.pressure_after_drop)**(1/2) / 60   
        self.power = round(self.water_flow *2.6 *1000 *0.5, 0)     
        self.times = []
        self.data = OrderedDict()
        self.data['alpha'] = self.alpha

    def get_times(self):
        self.nozzles_times = []
        for time in self.conf["NOZZLES"].values():     
            if time >= 0:     
                self.nozzles_times.append(time)
        self.t_start = min(self.nozzles_times)
 
    def get_times_and_powers(self):
        time = 0
        powers = []
        times = []
        while self.alpha*time**2 < self.power:
            times.append(time)
            powers.append(self.alpha*time**2)
            time+=1
        powers.append(self.power)
        times.append(time)
        tab_p_diff = []
        for i in range(len(powers)-1):
            p_diff = powers[i+1]-powers[i]
            tab_p_diff.append(round(p_diff,2))
       
        self.tab_p_diff = [0] + tab_p_diff
        self.nozzle_worktime = times
        self.t_end = max(self.nozzles_times)+ self.nozzle_worktime[-1]


    def get_action_time(self):
        self.action_time = [x for x in range(self.t_start, self.t_end+1)]

    def get_all_worktimes(self):
        self.time_tabs = []
        for nozzle_time in self.nozzles_times:
            times = [time+nozzle_time for time in self.nozzle_worktime]
            self.time_tabs.append(times)

    def create_power_absorb_table(self):
        times = []
        hrrs = []
        hrr_fire = self.hrr_peak
        for block in self.time_tabs:
            for time, hrr in zip(block, self.tab_p_diff):
                if hrr_fire>0:
                    hrr_fire -= hrr
                    if hrr_fire >0:
                        times.append(time)
                        hrrs.append(hrr_fire)
                else:
                    times.append(time)
                    hrrs.append(0)
                    self.all_hrrs = hrrs
                    self.all_times = times
                    return times, hrrs
    
    def create_fire_table(self):
        times = []
        hrrs = []
        # print("tab p diff",self.tab_p_diff)
        for block in self.time_tabs:
            #print(block)
            for time, hrr in zip(block, self.tab_p_diff):
                #print(time, hrr)
                times.append(time)
                hrrs.append(hrr)
        self.all_hrrs = hrrs
        self.all_times = times
        self.dic = {}
        self.final_nozzles_times = []
        self.final_nozzles_hrrs = []
        for t in self.action_time:
            self.dic[t]=0
        for block in self.time_tabs:
            for elem in range(len(block)):
                self.dic[block[elem]] += self.tab_p_diff[elem]
        for key,value in self.dic.items():
            self.final_nozzles_times.append(key)
            self.final_nozzles_hrrs.append(value)
        


    def merge_arrays_last_occurrence(self, array1, array2):
        merged_pairs = {}
        for val1, val2 in zip(array1, array2):
            merged_pairs[val1] = val2
        unique_values = set(array1)
        self.final_pairs = [(val1, merged_pairs[val1]) for val1 in unique_values]
        # for val1, val2 in self.final_pairs:
        #     print(val1,": ", val2)
    
    def generate_final_times_and_hrrs(self):
        self.calculated_times = []
        self.calculated_hrrs= []
        for time, hrr in self.final_pairs:
            self.calculated_times.append(time)
            self.calculated_hrrs.append(hrr)
        # print("calc times",self.calculated_times)
        # print("calc hrrs ",self.calculated_hrrs)
        
    def prepare_data(self):
        self.data['Nozzle times'] = self.nozzles_times
        self.data['Nozzle Power'] = self.power
        self.data['Time start'] = self.t_start
        self.data['Time end'] = self.t_end
        self.data['Nozzle working time table'] = self.nozzle_worktime
        self.data['Table of consumed power for one nozzle'] = self.tab_p_diff
        self.data['Table of nozzles times'] = self.time_tabs
        self.data['All times'] = self.all_times
        self.data['All hrrs'] = self.all_hrrs  
        self.data['Sum of powers'] = sum(self.tab_p_diff)  


    def save_params(self):
        rescue_txt_pwd = os.path.join(os.environ['AAMKS_PROJECT'], 'workers', str(self.sim_id), "rescue.txt")
        with open (rescue_txt_pwd,"a") as file:
            file.write("--- Nozzle Parameters --- \n")
            for (k,v) in self.data.items():
                line = str(str(k)+ " : " +str(v)+ "\n")
                file.write(line)
            file.write("\n")
            
    def main(self):
        self.get_times()
        self.get_times_and_powers()
        self.get_action_time()
        self.get_all_worktimes()
        #self.create_power_absorb_table()
        self.create_fire_table()
        self.merge_arrays_last_occurrence(self.all_times, self.all_hrrs)
        self.prepare_data()
        self.save_params()
        self.generate_final_times_and_hrrs()


class LaunchRescueModule:
    def __init__(self, conf, sim_id, alpha, hrr_peak, times, hrrs):
        self.conf = conf
        self.alpha = alpha
        self.sim_id = sim_id
        self.hrr_peak = hrr_peak
        self.main_dir = os.path.join(os.environ['AAMKS_PROJECT'], "rescue_results") # for creating rescue results
        self.data = OrderedDict()
        self.raw_times = times
        self.raw_hrrs = hrrs


    def main(self):
        self.rescue = Rescue(self.conf, self.sim_id)
        self.rescue.main()
        self.nozzles = Nozzles(self.conf, self.sim_id, self.alpha, self.hrr_peak)
        self.nozzles.main()
        #self.connect_estinguish_times_and_hrrs()
        self.save_params()
        #self.calculate_impact_of_nozzles()
        #self.make_plot()

    def connect_estinguish_times_and_hrrs(self):
        # left
        t_up_to_hrr_peak = int((self.hrr_peak/self.alpha)**0.5)
        interval = int(round(t_up_to_hrr_peak/10))
        if interval == 0:
            interval = 10
        times0 = list(range(0, t_up_to_hrr_peak, interval))+[t_up_to_hrr_peak]
        hrrs0 = [int((self.alpha * t ** 2)) for t in times0]
        # middle
        t_up_to_starts_dropping = self.rescue.total_time
        times1 = [t_up_to_starts_dropping]
        hrrs1 = [self.hrr_peak]
        #right
        times2 = [time+self.rescue.total_time+1 for time in self.nozzles.calculated_times]
        hrrs2 = self.nozzles.calculated_hrrs
        
        #all times
        self.all_times= [times0, times1, times2]
        self.all_hrrs = [hrrs0, hrrs1, hrrs2]
        self.data["Fire Times"] = self.all_times
        self.data["Fire HRRS"] = self.all_hrrs

    def calculate_impact_of_nozzles(self):
        self.corrected_times = [time+self.rescue.total_time for time in self.nozzles.final_nozzles_times]
        self.corrected_hrrs = self.nozzles.final_nozzles_hrrs
        self.dic = self.nozzles.dic
        new_dic ={}
        for t,hrr in zip(self.corrected_times, self.corrected_hrrs):
            new_dic[t] = hrr
        if self.corrected_times[0] > self.raw_times[-1]:
            result = "".join(["No impact due to rescue model:", str(self.corrected_times[0]), ">(", str(self.raw_times[-1])])
            self.data["Result"] = result
            self.make_plot(self.raw_times, self.raw_hrrs)
            return self.raw_times, self.raw_hrrs
        else:
            self.data["Result"] = "Rescue model has done changes in hrrs"
            for time,hrr in zip(self.raw_times, self.raw_hrrs):
                for t,h in new_dic.items():
                    if t==time:
                        power = new_dic[t]
                        for i in range(t-1, len(self.raw_hrrs)):
                            self.raw_hrrs[i] -= power
            ts = []
            hs = []
            for t, h in zip(self.raw_times, self.raw_hrrs):
                if h>=0:
                    ts.append(t)
                    hs.append(round(h,2))
                else:
                    ts.append(t)
                    hs.append(0)
                    break
            print(self.rescue.total_time, self.raw_hrrs[self.rescue.total_time])
            self.make_plot_rescue(ts,hs, self.rescue.total_time, self.raw_hrrs[self.rescue.total_time])
            return ts, hs

    def save_params(self):
        rescue_txt_pwd = os.path.join(os.environ['AAMKS_PROJECT'], 'workers', str(self.sim_id), "rescue.txt")
        with open (rescue_txt_pwd,"a") as file:
            file.write("--- Fire parameters --- \n")
            for (k,v) in self.data.items():
                line = str(str(k)+ " : " +str(v)+ "\n")
                file.write(line)

    def make_plot(self,x,y):
        worker_dir = os.path.join(os.environ['AAMKS_PROJECT'], 'workers', str(self.sim_id))
        # flat_times = [time for sublist in self.all_times for time in sublist]  #[a],[b],[c]] -> [*a,*b,*c]
        # flat_hrrs = [hrr for sublist in self.all_hrrs for hrr in sublist]
        plt.plot(x,y)
        plt.xlabel('Time (s)')
        plt.ylabel('HRR (W)')
        plt.savefig(os.path.join(worker_dir, "HRR.png"))

    def make_plot_rescue(self,x,y,px,py):
        worker_dir = os.path.join(os.environ['AAMKS_PROJECT'], 'workers', str(self.sim_id))
        # flat_times = [time for sublist in self.all_times for time in sublist]  #[a],[b],[c]] -> [*a,*b,*c]
        # flat_hrrs = [hrr for sublist in self.all_hrrs for hrr in sublist]
        plt.plot(x,y)
        text =  "("+str(px)+","+str(py)+")"+" Fire Brigade Arrived"
        plt.text(px,py, text,horizontalalignment='left')
        plt.xlabel('Time (s)')
        plt.ylabel('HRR (W)')
        plt.savefig(os.path.join(worker_dir, "HRR.png"))
