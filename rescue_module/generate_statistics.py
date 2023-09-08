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



class RescueResults():

    def __init__(self, conf, rescue, nozzles, estinguish,):
        self.conf = conf
        self.main_dir = os.path.join(os.environ['AAMKS_PROJECT'], "rescue_results")
        self.file = os.path.join(self.main_dir, "rescue.json")
        self.rescue = rescue
        self.nozzles = nozzles
 
    def save_params(self):
        sim_id = self.rescue.sim_id
        intervention_time =  self.rescue.total_time
        nozzles_time = [nozzle.time for nozzle in self.nozzles.all_nozzles]
        nozzles_power = [nozzle.power for nozzle in self.nozzles.all_nozzles]
        worker_dir = os.path.join(os.environ['AAMKS_PROJECT'], 'workers', str(self.rescue.sim_id), "rescue.txt")
        with open (worker_dir,"w+") as file:
            file.write("sim id: ")
            file.write( str(sim_id))
            file.write("\n")
            file.write("intervention time: ")
            file.write(str(intervention_time))
            file.write("\n")
            file.write("dh: "+ str(self.nozzles.dh)+ " "+ "dv: "+str(self.nozzles.dh))
            file.write("\n")
            file.write("pressure: " + str(self.nozzles.pressure_after_drop))
            file.write("\n")
            file.write("water flow: ")
            file.write(str(self.nozzles.water_flow))
            file.write("\n")
            file.write("nozzle times: ")
            file.writelines([(str(time)+" ") for time in nozzles_time])
            file.write("\n")
            file.write("nozzle Q: ")
            file.writelines([(str(time)+" ") for time in nozzles_time])
            file.write("\n")
            file.write("nozzle power: ")
            file.writelines([(str(power)+ " ") for power in nozzles_power])
            file.write("\n")
            file.write("----------")

    def main(self):
        self.create_dir()
        self.generate_results_flat()
        self.check_RMSE()
        self.save_results_to_json()
        self.save_results_to_xlsx()
        
        #self.generate_distribution_easy()
        #self.generate_distributions() 


    def create_dir(self):
        try:
            print(f"Trying to create new dir in {os.environ['AAMKS_PROJECT']}")
            os.mkdir(self.main_dir)
        except Exception as e:
            print(f" {e} \n New directory not created")

    
    def generate_results(self, num_of_simulations):
        self.conf["RESCUE"]["time_log"]=0
        self.conf["RESCUE"]["distance_long"]=20
        dists = [0.9, 1.9, 2.9, 3.9, 4.9, 5.9, 6.9, 7.9, 8.9, 9.9, 10.9, 11.9, 12.9, 13.9, 14.9, 15.9]
        self.results_dict = {}
        for dist in dists:
            results = []
            for sim in range(num_of_simulations):
                self.conf["RESCUE"]["dist_short"] = dist
                r = Rescue(self.conf)
                r.main()
                time = r.total_time
                results.append(time)
            avg = round(sum(results)/len(results),2)

            sub_results = {
            "all_results": results,
            "avg": avg
            }
            self.results_dict[str(dist)] = sub_results

    def generate_results_flat(self):
        self.conf["RESCUE"]["time_log"]=0    #bez printowania
        self.conf["RESCUE"]["distance_long"]=20 #druga jednostka w najmniej korzystnym miejscu
        dists = [0.9, 1.9, 2.9, 3.9, 4.9, 5.9, 6.9, 7.9, 8.9, 9.9, 10.9, 11.9, 12.9, 13.9, 14.9, 15.9]
        num_of_simulations = 2
        self.results_dict = {}
        for dist in dists:
            results = self.generate_results_for_one_distance(num_of_simulations, dist)
            self.results_dict[str(dist)] = results

    def generate_results_for_one_distance(self, num_of_simulations, dist):
        results = []
        for sim in range(num_of_simulations):
            self.conf["RESCUE"]["dist_short"] = dist
            r = Rescue(self.conf)
            r.main()
            time = r.total_time
            results.append(time)
        avg = sum(results)/len(results)
        results.append(avg)
        return results

    def check_RMSE(self):
        data =  self.results_dict["0.9"]    
        count_sim = len(data)
        smallest = min(data)
        std_dev = statistics.stdev(data) #ro
        RMSE = std_dev/count_sim**(1/2)
        if RMSE < (0.1 * smallest):
            return True
        else:
            return False

    def save_results_to_json(self):
        json = Json()
        with open(self.file, 'w+') as f:
            json.write(self.results_dict, self.file, pretty=0)

    def save_results_to_xlsx(self):
        df = pd.DataFrame(self.results_dict)
        df.to_excel(os.path.join(self.main_dir, "results.xlsx"), index=False)

    def generate_distributions(self):
        json = Json()
        with open(self.file) as f:
            all_data = json.read(self.file)
            for key,value in all_data.items():
                df = pd.DataFrame(value['all_results'])
                chart_title = (str(round(float(key) - 0.9, 1)) + "  -  " + str(round(float(key) + 0.1, 1)) + " (km)")
                if float(key)>15:
                    chart_title = " 15  -  20 (km)" 
                ax = df.hist(bins=100, range=[0,5000])
                #ax = df.plot.kde(title=chart_title, label="Time", legend=False)
                try:
                    os.mkdir(os.path.join(self.main_dir, "charts"))
                except:
                    pass
                plt.title(chart_title)
                plt.savefig(f"{self.main_dir}/charts/{key}.png")

    def generate_distribution_easy(self):    
        #for key, result in self.results_dict.items():
        result = self.results_dict["0.9"]
        plt.hist(result, bins=30, density=True)
        density = stats.gaussian_kde(result)
        x = np.linspace(0, 1, 200)
        plt.plot(x, density(x))
        plt.xlabel('Wartości')
        plt.ylabel('Gęstość')
        plt.title('Histogram i wykres gęstości')
        plt.show()
