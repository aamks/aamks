import os 
import sys
sys.path.insert(1, '/usr/local/aamks')
import json
from subprocess import Popen,PIPE
from include import Json
from include import Sqlite
from collections import OrderedDict
from include import Psql
from include import CreateAnimEntry
import logging
logger = logging.getLogger("rs_collector.py")
logger.setLevel(logging.DEBUG)
fh = logging.FileHandler("/home/aamks_users/aamks.log")
fh.setLevel(logging.DEBUG)
ch = logging.StreamHandler()
ch.setLevel(logging.DEBUG)
formatter = logging.Formatter('%(asctime)s - %(name)-14s - %(levelname)s - %(message)s')
fh.setFormatter(formatter)
ch.setFormatter(formatter)
logger.addHandler(fh)
logger.addHandler(ch)


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
        logger.info(f'Start results_collector.py: {host} {meta_file} {sim_id}')
        self.meta = self.json.read(self.meta_file)
        self.s = Sqlite("{}/aamks.sqlite".format(self.meta['path_to_project']))
        self._animation_save()
        self.psql_report()
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
        cae.save(params, "{}/workers/anims.json".format(self.meta['path_to_project']))
        logger.info("Animation updated and saved")
#}}}
    def psql_report(self):
        p = Psql()
        fed=json.dumps(self.meta['psql']['fed'])
        fed_symbolic=json.dumps(self.meta['psql']['fed_symbolic'])
        rset = json.dumps(self.meta['psql']['rset'])
        query = "SELECT Count(*) FROM fed_growth_cells_data where project_id = {} AND scenario_id = {} ".format(self.meta['project_id'], self.meta['scenario_id'])
        results = p.query(query)
        count = [i[0] for i in results]
        if count[0] == 0:
            for key in self.meta['psql']['fed_heatmaps_table_schema']:
                for i in range(len(self.meta['psql']['fed_heatmaps_table_schema'][key])):
                    for j in range(len(self.meta['psql']['fed_heatmaps_table_schema'][key][0])):
                        values = (self.meta['psql']['fed_heatmaps_table_schema'][key][i][j]["number"],self.meta['scenario_id'],self.meta['project_id'],self.meta['psql']['fed_heatmaps_table_schema'][key][i][j]["floor"],self.meta['psql']['fed_heatmaps_table_schema'][key][i][j]["x_min"],self.meta['psql']['fed_heatmaps_table_schema'][key][i][j]["x_max"],self.meta['psql']['fed_heatmaps_table_schema'][key][i][j]["y_min"],self.meta['psql']['fed_heatmaps_table_schema'][key][i][j]["y_max"],0,0)
                        p.query("INSERT INTO fed_growth_cells_data(cell_id, scenario_id, project_id, floor, x_min, x_max, y_min, y_max, fed_growth_sum, samples_number) VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)", values)
        
        for key in self.meta['psql']['fed_heatmaps_data_to_insert']:
            for row in self.meta['psql']['fed_heatmaps_data_to_insert'][key]:
                query = "UPDATE fed_growth_cells_data SET fed_growth_sum = fed_growth_sum + {}, samples_number = samples_number + {} WHERE cell_id={} and scenario_id={} and project_id={} and floor={}".format(round(row["sum"],2), row["count"], row['cell_number'], self.meta['scenario_id'], self.meta['project_id'], int(key))
                p.query(query)

        p.query("UPDATE simulations SET fed = '{}', fed_symbolic = '{}', wcbe='{}', run_time = {}, dcbe_time = {}, min_vis_compa = {}, max_temp = {}, host = '{}', min_hgt_compa = {}, min_vis_cor = {}, min_hgt_cor = {} WHERE project=%s AND scenario_id=%s AND iteration=%s".format(fed, fed_symbolic, rset, self.meta['psql']['runtime'], self.meta['psql']['cross_building_results']['dcbe'], self.meta['psql']['cross_building_results']['min_vis_compa'], self.meta['psql']['cross_building_results']['max_temp_compa'], self.meta['worker'], self.meta['psql']['cross_building_results']['min_hgt_compa'],self.meta['psql']['cross_building_results']['min_vis_cor'],self.meta['psql']['cross_building_results']['min_hgt_cor']), (self.meta['project_id'], self.meta['scenario_id'], self.meta['sim_id']))
        logger.info("Database updated")

try:
    host = sys.argv[1]
    meta_file = sys.argv[2]
    sim_id = sys.argv[3]
    ResultsCollector(host, meta_file, sim_id)
except Exception as e:
    logger.error(e)


