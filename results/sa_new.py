import sys
import os
import json
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from SALib.analyze import sobol
sys.path.insert(0, '/usr/local/aamks')
from include import Psql, Json, Sqlite


class SensitivityAnalysis:
    VARS = {
            'hrrpeak': {'type': 'triangular', 'bounds': [100, 100000]},
            'fireload': {'type': 'lognorm', 'bounds': [50,2000]},
            'max_area': {'type': 'triangular', 'bounds': [0.1,100]},
            'iteration': {'type': 'triangular', 'bounds': [1,1000]},
            'alpha': {'type': 'triangular', 'bounds': [0.0027,0.18]}
            }

    def __init__(self):
        self.p = Psql()
        self.j = Json()
        self.dir = sys.argv[1]
        self.configs = self.j.read('{}/conf.json'.format(self.dir))
        self.s = Sqlite("{}/aamks.sqlite".format(self.dir))
        self.variables = sys.argv[2:] if len(sys.argv) > 2 else ['hrrpeak', 'alpha']

    def import_samples(self):
        query = f'SELECT {", ".join(self.variables)}, results FROM simulations WHERE scenario_id={self.configs["scenario_id"]} AND results IS NOT NULL'
        samples = pd.DataFrame(self.p.query(query), columns=self.variables+['results'])
        results = pd.json_normalize(samples.pop('results').apply(json.loads))

        return samples, results

    def define_problem(self):
        problem = {
            'num_vars': len(self.variables),
            'names': self.variables,
            'bounds': [self.VARS[i]['bounds'] for i in self.variables]
        }

        return problem
        
    def main(self):
        samples, results = self.import_samples()
        problem = self.define_problem()
        n = int(len(results['individual']) - np.floor(len(results['individual']) % (2*problem['num_vars']+2)))
        si = sobol.analyze(problem, results['individual'].iloc[:n].to_numpy(), print_to_console=True)
        axes = si.plot()
        axes[0].set_yscale('log')
        fig = plt.gcf()  # get current figure
        fig.set_size_inches(10, 4)
        plt.tight_layout()
        plt.savefig(os.path.join(self.dir, 'picts', 'sobol.png'))


s = SensitivityAnalysis()
s.main()


