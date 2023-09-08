import os
from collections import OrderedDict
from numpy.random import choice
from numpy.random import uniform
from numpy.random import lognormal
from numpy.random import gamma
from numpy import array as npa
from include import Json
from collections import OrderedDict
from include import Psql
import json


class Rescue():
    def __init__(self, conf):
        self.conf = conf
        self.electronic = True if self.conf["r_trans"]=='auto' else False  # electronic/phone_call 1/0
        self.distance_short = self.conf["r_distances"]["1st"] # distance from nearest fire department
        self.distance_long = self.conf["r_distances"]["2nd"] # distance from second nearest fire department
        self.cpr = bool(int(self.conf["r_cpr"]))
        self.data = {}

    def main(self):
        self.get_pre_intervention_time()        
        self.get_intervention_time() 
        self.get_all_times() 

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
        self.t_detection = self.conf["r_times"]["detection"]
        self.data["detection"] = self.t_detection

    def get_t1(self):
        """ T1 time - user defined """
        self.t_1 = self.conf["r_times"]["t1"]
        self.data["T1"] = self.t_1    
    
    def get_t2(self):
        """ T2 time -- user defined """
        self.t_2 = self.conf["r_times"]["t2"] 
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


class Nozzles:
    def __init__(self, conf):
        self.dh = conf["r_to_fire"]["horizontal"]
        self.dv = conf["r_to_fire"]["vertical"]
        self.nozzles_data = conf["r_nozzles"]
        self.data = OrderedDict()

    def main(self):
        self.get_times()
        self.get_power()

    def get_times(self):
        self.nozzles_times = []
        for time in self.nozzles_data.values():     
            if time >= 0:     
                self.nozzles_times.append(time)
        self.data['Nozzles times'] = self.nozzles_times
 
    def get_power(self):
        k = 175
        pressure_after_drop = 0.6 - (self.dh/1000 + self.dv/100) 
        water_flow = k * (10*pressure_after_drop)**(1/2) / 60   
        self.power = round(water_flow *2.6 *1000 *0.5, 0)  
        self.data['Nozzle power'] = self.power

        
class LaunchRescueModule:
    def __init__(self, conf, sim_id):
        self.conf = conf
        self.q_and_t_tuples = []
        self.p = Psql()
        self._sim_id = sim_id

    def main(self):
        rescue = Rescue(self.conf)
        rescue.main()
        nozzles = Nozzles(self.conf)
        nozzles.main()
        self.prepare_data(rescue, nozzles)
        self.prepare_dict(rescue, nozzles)
        self.save_parameters_in_psql()

    def prepare_data(self, rescue, nozzles):
        rescue_time = rescue.total_time
        nozzles_times = nozzles.nozzles_times
        power = nozzles.power
        for t in nozzles_times:
            self.q_and_t_tuples.append((rescue_time+t, power))

    def prepare_dict(self, rescue, nozzles):
        all_data = OrderedDict()
        all_data.update(rescue.data)
        all_data.update(nozzles.data)
        str_data= OrderedDict() #values converted to str in all_data
        for k,v in all_data.items():
            str_data[k]= str(v)
        self.json_data = json.dumps(str_data)

    def save_parameters_in_psql(self):
        value = self.json_data
        self.p.query("UPDATE simulations SET rescue_params='{}' WHERE project=%s AND scenario_id=%s AND iteration=%s".format(value),(self.conf['project_id'], self.conf['scenario_id'], self._sim_id))


