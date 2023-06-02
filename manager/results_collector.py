import os 
import sys
sys.path.insert(1, '/usr/local/aamks')
import json
import pandas as pd
from subprocess import Popen,PIPE
from include import Json
from include import Sqlite
from include import SendMessage
from collections import OrderedDict
from include import Psql
from include import CreateAnimEntry


class ResultsCollector():
    def __init__(self, host, meta_file, sim_id):# {{{
        '''
        1. aamksrun makes gearman pass these jobs to workers:
            /usr/local/aamks/tests/worker.py
        2. Worker calls gearman server aOut function
        3. This file implements gearman's aOut function:
            * download results.json with configuration to workers/123/report_123.json
            * download animation.zip to workers/123/anim.zip
        '''
        self.host = host
        self.meta_file = meta_file
        self.sim_id = int(sim_id)
        self.meta = None
        self.json = Json()
        SendMessage(host + meta_file + sim_id)

        if os.environ['AAMKS_WORKER'] == 'gearman':
            self._fetch_meta()
            self.meta = self.json.read(self.meta_file)
            self._get_meta_animation()
            self.s = Sqlite("{}/aamks.sqlite".format(self.meta['path_to_project']))
            self._animation_save()
            self.psql_report()
        else:
            self.meta = self.json.read(self.meta_file)
            self.s = Sqlite("{}/aamks.sqlite".format(self.meta['path_to_project']))
            self._animation_save()
            self.psql_report()
#}}}

    def _fetch_meta(self):# {{{
        try:
            Popen(["scp", "{}:{}".format(self.host, self.meta_file), self.meta_file]).wait()
            SendMessage("self.meta copied")
        except Exception as e:
            SendMessage(e)
        else:
            pass
#}}}
    def _get_meta_animation(self):
        source = self.host+':'+self.meta['path_to_project']+'workers/'+str(self.meta['sim_id'])+'/'+self.meta['animation']
        dest = self.meta['path_to_project']+'workers/'+str(self.meta['sim_id'])+'/'+self.meta['animation']
        SendMessage(source + " " + dest)
        Popen(["scp", source, dest])
        SendMessage("Animation data copied")
#}}}

    def _animation_save(self):# {{{
        params=OrderedDict()
        params['sort_id']=self.sim_id
        params['title']="sim.{}".format(self.sim_id)
        params['srv']=0
        params['fire_origin'] = self.s.query("select floor, x, y from fire_origin where sim_id=?", (self.sim_id,))[0]
        params['highlight_geom']=None
        params['anim']="{}/{}_{}_{}_anim.zip".format(self.sim_id, self.meta['project_id'], self.meta['scenario_id'], self.sim_id)

        cae=CreateAnimEntry()
        cae.save(params, "{}workers/anims.json".format(self.meta['path_to_project']))
        SendMessage("Animation updated and saved")
#}}}
    def psql_report(self):
        p = Psql()
        fed = json.dumps(self.meta['psql']['fed'])
        fed_symbolic = json.dumps(self.meta['psql']['fed_symbolic'])
        rset = json.dumps(self.meta['psql']['rset'])
        dfeds = [pd.read_json(i) for i in self.meta['psql']['dfed'].values()]

        # fed_growth_cells table
        def check_for_data(x, floor):
            return  bool(p.query(f"""SELECT * FROM fed_growth_cells_data
                    WHERE x_min={x['xmin']} AND x_max={x['xmax']} AND y_min={x['ymin']} AND y_max={x['ymax']}
                    AND scenario_id={self.meta['scenario_id']} AND project={self.meta['project_id']} AND floor={floor}"""))

        def update_fed_growth(x, floor):
            if check_for_data(x, floor):
                query = f"""UPDATE fed_growth_cells_data SET fed_growth_sum = fed_growth_sum + {x['total_dfed']},
                        samples_number = samples_number + 1
                        WHERE x_min={x['xmin']} AND x_max={x['xmax']} AND y_min={x['ymin']} AND y_max={x['ymax']}
                        AND scenario_id={self.meta['scenario_id']} AND project={self.meta['project_id']} AND floor={floor}"""
            else:
                query = f"""INSERT INTO fed_growth_cells_data(scenario_id, project, floor, x_min, x_max, y_min, y_max, fed_growth_sum, samples_number)
                        VALUES ({self.meta['scenario_id']}, {self.meta['project_id']}, {floor}, {x['xmin']}, {x['xmax']}, 
                        {x['ymin']}, {x['ymax']}, {x['total_dfed']}, 1)"""
            p.query(query)

        [dfed.apply(update_fed_growth, axis=1, floor=f) for f, dfed in enumerate(dfeds)]

        # simulations table
        p.query(f"""UPDATE simulations SET fed = '{fed}', fed_symbolic = '{fed_symbolic}', wcbe='{rset}', 
                run_time = {self.meta['psql']['runtime']}, dcbe_time = {self.meta['psql']['cross_building_results']['dcbe']},
                min_vis_compa = {self.meta['psql']['cross_building_results']['min_vis_compa']},
                max_temp = {self.meta['psql']['cross_building_results']['max_temp_compa']}, host = '{self.meta['worker']}',
                min_hgt_compa = {self.meta['psql']['cross_building_results']['min_hgt_compa']},
                min_vis_cor = {self.meta['psql']['cross_building_results']['min_vis_cor']},
                min_hgt_cor = {self.meta['psql']['cross_building_results']['min_hgt_cor']},
                results = '{self.meta['psql']['i_risk']}'
                WHERE project={self.meta['project_id']} AND scenario_id={self.meta['scenario_id']} AND iteration={self.meta['sim_id']}""")
        SendMessage("Database updated")

try:
    host = sys.argv[1]
    meta_file = sys.argv[2]
    sim_id = sys.argv[3]
    ResultsCollector(host, meta_file, sim_id)
except Exception as e:
    SendMessage(e)


