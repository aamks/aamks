# IMPORT# {{{
from collections import OrderedDict
import csv
import re
import os
import sys
import inspect
import json
import time
import bisect
from ast import literal_eval as make_tuple
from numpy.random import randint
from include import Sqlite
from include import Json
import logging
from math import exp
from include import Dump as dd

# }}}


class SmokeQuery:

    def __init__(self, floor):
        '''
        * On class init we read tessellation and such (happens once).
        * We are getting read_cfast_record(T) calls in say 5s intervals:
          We only store this single T'th record in a dict.
        * We are getting lots of get_conditions((x,y),param) calls after
          read_cfast_record(T) returns the needed CFAST record.

        Map each cell to a compa:
            (1000, 600): R_1,  (1100, 600): R_2,  ...

        After CFAST produces the conditions at time T, feed _compa_conditions.
        For any evacuee's (x,y) it will be easy to find the square he is in. If
        we have rectangles in our square we use some optimizations to find the
        correct rectangle. Finally fetch the conditions via cell-compa map.
        ''' 

        self.json = Json()
        try:
            self.s=Sqlite("aamks.sqlite", 1)
        except:
            print("mimooh finals CFAST fallback, not for production!")
            self.s=Sqlite("{}/aamks.sqlite".format(os.environ['AAMKS_PROJECT']), 1)

        self.config=self.json.read('{}/evac/config.json'.format(os.environ['AAMKS_PATH']))
        self._read_tessellation(floor)
        self._make_cell2compa()
        self._init_compa_conditions()
        self._cfast_headers()

    def _read_tessellation(self, floor):# {{{
        ''' 
        Python has this nice dict[(1,2)], but json cannot handle it. We have
        passed it as dict['(1,2)'] and now need to bring back from str to
        tuple.
        '''

        floors=json.loads(self.s.query("SELECT * FROM floors")[0]['json'])
        self.floor_dim = floors[floor]

        json_tessellation=json.loads(self.s.query("SELECT * FROM tessellation")[0]['json'])
        tessellation=json_tessellation[floor]
        self._square_side=tessellation['square_side']
        self._query_vertices=OrderedDict()
        for k,v in tessellation['query_vertices'].items():
            self._query_vertices[make_tuple(k)]=v
# }}}
    def _make_cell2compa_record(self,cell):# {{{
        try:
            self._cell2compa[cell]=self.s.query("SELECT name from aamks_geom WHERE type_pri='COMPA' "
                                                "AND ?>=x0 AND ?>=y0 AND ?<x1 AND ?<y1",
                                                (cell[0], cell[1], cell[0], cell[1]))[0]['name']
        except:
            pass
# }}}
    def _make_cell2compa(self):#{{{
        self._cell2compa=OrderedDict()
        for k,v in self._query_vertices.items():
            self._make_cell2compa_record(k)
            for pt in list(zip(v['x'], v['y'])):
                self._make_cell2compa_record(pt)
#}}}
    def _results(self,query,cell):# {{{
        ''' Outside is for debugging - should never happen in aamks. '''
        try:
            compa=self._cell2compa[cell]
        except Exception as e:
            compa="outside"
            logging.ERROR("Agent outside needs fixing: {}".format(e))

        return self._compa_conditions[compa]
# }}}

    def _init_compa_conditions(self):  # {{{
        ''' 
        Prepare dict structure for cfast csv values. Csv contain some params that are
        relevant for aamks and some that are not.

            self._compa_conditions['R_1']: OrderedDict([('TIME', None), ('CEILT' , None) , ...)
            self._compa_conditions['R_2']: OrderedDict([('TIME', None), ('CEILT' , None) , ...)
            self._compa_conditions['R_3']: OrderedDict([('TIME', None), ('CEILT' , None) , ...)

        self._compa_conditions['outside']=OrderedDict() is more for debugging.
        '''

        self.relevant_params = ('CEILT', 'DJET', 'FLHGT', 'FLOORT', 'HGT',
        'HRR', 'HRRL', 'HRRU', 'IGN', 'LLCO', 'LLCO2', 'LLH2O', 'LLHCL',
        'LLHCN', 'LLN2', 'LLO2', 'LLOD', 'LLT', 'LLTS', 'LLTUHC', 'LWALLT',
        'PLUM', 'PRS', 'PYROL', 'TRACE', 'ULCO', 'ULCO2', 'ULH2O', 'ULHCL',
        'ULHCN', 'ULN2', 'ULO2', 'ULOD', 'ULT', 'ULTS', 'ULTUHC', 'UWALLT',
        'VOL')

        self.all_compas=[i['name'] for i in self.s.query("SELECT name FROM aamks_geom where type_pri = 'COMPA'")]

        self._compa_conditions = OrderedDict()
        for compa in self.all_compas:
            self._compa_conditions[compa] = OrderedDict([(x, None) for x in ['TIME']+list(self.relevant_params)])
        self._compa_conditions['outside']=OrderedDict([('TIME',None)])
# }}}
    def _cfast_headers(self):# {{{
        '''
        CFAST must have produced the first lines of csv by now, which is the header.
        Get 3 first rows from n,s,w files and make headers: params and geoms.
        Happens only once.
        '''

        self._headers=OrderedDict()
        for letter in ['n', 's', 'w']:
            f = 'cfast_{}.csv'.format(letter)
            with open(f, 'r') as csvfile:
                reader = csv.reader(csvfile, delimiter=',')
                headers = []
                for x in range(3):
                    headers.append([field.replace(' ', '') for field in next(reader)])
                    headers[x]
                headers[0] = [re.sub("_.*", "", xx) for xx in headers[0]]

            self._headers[letter]=OrderedDict()
            self._headers[letter]['params']=headers[0]
            self._headers[letter]['geoms']=headers[2]
# }}}
    def cfast_has_time(self,time):# {{{
        ''' 
        CFAST dumps 4 header records and then data records. 
        Data records are indexed by time with delta=10s.
        AAMKS has this delta hardcoded: CFAST dumps data in 10s intervals.
        '''

        needed_record_id=int(time/10)+1
        with open('cfast_n.csv') as f:
            num_data_records=sum(1 for _ in f)-4
        if num_data_records > needed_record_id:
            return 1
        else:
            return 0
# }}}

    def read_cfast_record(self, time):# {{{
        ''' 
        We had parsed headers separately. Now we only parse numbers from n,s,w files. 
        Application needs to call us prior to massive queries for conditions at (x,y).
        '''

        for letter in ['n', 's', 'w']:
            f = 'cfast_{}.csv'.format(letter)
            with open(f, 'r') as csvfile:
                reader = csv.reader(csvfile, delimiter=',')
                for x in range(4):
                    next(reader)
                for row in reader:
                    if int(float(row[0])) == time:
                        needed_record=[float(j) for j in row]
                        needed_record[0]=int(float(row[0]))
                        break

            for compa in self.all_compas:
                self._compa_conditions[compa]['TIME']=needed_record[0]
            self._compa_conditions['outside']['TIME']=needed_record[0]

            for m in range(len(needed_record)):
                if self._headers[letter]['params'][m] in self.relevant_params and self._headers[letter]['geoms'][m] in self.all_compas:
                    self._compa_conditions[self._headers[letter]['geoms'][m]][self._headers[letter]['params'][m]] = needed_record[m]
        return 1
# }}}
    def get_conditions(self,q):# {{{
        ''' 
        First we find to which square our q belongs. If this square has 0 rectangles
        then we return conditions from the square. If the square has rectangles
        we need to loop through those rectangles. Finally we read the smoke
        conditions from the cell. 
        '''

        x=self.floor_dim['minx'] + self._square_side * int((q[0]-self.floor_dim['minx'])/self._square_side) 
        y=self.floor_dim['miny'] + self._square_side * int((q[1]-self.floor_dim['miny'])/self._square_side)

        if len(self._query_vertices[x,y]['x'])==1:
            return self._results(q, (x,y))
        else:
            for i in range(bisect.bisect(self._query_vertices[(x,y)]['x'], q[0]),0,-1):
                if self._query_vertices[(x,y)]['y'][i-1] < q[1]:
                    rx=self._query_vertices[(x,y)]['x'][i-1]
                    ry=self._query_vertices[(x,y)]['y'][i-1]
                    return self._results(q, (rx,ry))
        return self._results(q, (x,y)) # outside!
# }}}
    def get_visibility(self, position, time):# {{{
        conditions = self.get_conditions(position)
        logging.debug('Query visibility at time: {} on position: {}'.format(time, position))

        hgt = conditions['HGT']
        if hgt == None:
            return 0

        if hgt > self.config['LAYER_HEIGHT']:
            return conditions['LLOD']
        else:
            return conditions['ULOD']
# }}}
    def get_fed(self, position, time):# {{{
        logging.debug('Query FED at time: {} on position: {}'.format(time, position))
        conditions = self.get_conditions(position)
        hgt = conditions['HGT']
        if hgt == None:
            return 0.

        if hgt > self.config['LAYER_HEIGHT']:
            layer = 'L'
        else:
            layer = 'U'

        fed_co = 2.764e-5 * ((conditions[layer+'LCO'] * 10000) ** 1.036) * (self.config['TIME_STEP'] / 60)
        fed_hcn = (exp((conditions[layer+'LHCN'] * 10000) / 43) / 220 - 0.0045) * (self.config['TIME_STEP'] / 60)
        fed_hcl = ((conditions['LLHCL'] * 10000) / 1900) * self.config['TIME_STEP']
        fed_o2 = (self.config['TIME_STEP'] / 60) / (60 * exp(8.13 - 0.54 * (20.9 - conditions[layer+'LO2'])))
        hv_co2 = exp(0.1903 * conditions[layer+'LCO2'] + 2.0004) / 7.1
        fed_total = (fed_co + fed_hcn + fed_hcl) * hv_co2 + fed_o2

        return fed_total
# }}}

    def get_final_vars(self):# {{{
        '''
        The app should call us after CFAST produced all output. These are the
        summaries of various min values.
        '''

        self._collect_final_vars()
        #dd(self.sf.query('SELECT * from finals order by param,value'))
        finals=OrderedDict()

        # min(time) for HGT_COR < 1.8
        dcbe = self.sf.query("SELECT MIN(time) FROM finals WHERE compa_type='C' AND param='HGT' AND value < 1.8")[0]['MIN(time)']
        if dcbe == None:
            finals['dcbe'] = 9999
        else:
            finals['dcbe'] = dcbe

        # min(HGT_COR) 
        finals['min_hgt_cor']=self.sf.query("SELECT MIN(value) FROM finals WHERE compa_type='C' AND param='HGT'")[0]['MIN(value)']

        # min(HGT_COMPA)
        finals['min_hgt_compa']=self.sf.query("SELECT MIN(value) FROM finals WHERE param='HGT'")[0]['MIN(value)']

        # min(ULT_COMPA)
        finals['max_temp_compa']=self.sf.query("SELECT MAX(value) FROM finals WHERE param='ULT'")[0]['MAX(value)']

        c_const = 5
        # min(ULOD_COR)
        ul_od_cor = self.sf.query("SELECT MAX(value) FROM finals WHERE compa_type='C' AND param='ULOD'")[0]['MAX(value)']
        if ul_od_cor == 0:
            finals['min_vis_cor'] = 30
        else:
            finals['min_vis_cor'] = c_const / (ul_od_cor * 2.303)


        # min(ULOD_COMPA)
        ul_od_compa = self.sf.query("SELECT MAX(value) FROM finals WHERE param='ULOD'")[0]['MAX(value)']
        if ul_od_compa == 0:
            finals['min_vis_compa'] = 30
        else:
            finals['min_vis_compa'] = c_const /(ul_od_compa * 2.303)

        return finals

        # }}}
    def _collect_final_vars(self):# {{{
        ''' 
        Create finals.sqlite for this very sim_id. Convert CFAST csvs into sqlite.
        '''

        finals=[]

        for letter in ['n', 's']:
            f = 'cfast_{}.csv'.format(letter)
            with open(f, 'r') as csvfile:
                reader = csv.reader(csvfile, delimiter=',')
                for x in range(4):
                    next(reader)
                for row in reader:
                    record=[float(j) for j in row]
                    record[0]=int(float(row[0]))
                    for i,param in enumerate(self._headers[letter]['params']):
                        if param != 'Time':
                            if self._headers[letter]['geoms'][i] != 'Outside':
                                if self._headers[letter]['geoms'][i] != 'medium':
                                    compa=self._headers[letter]['geoms'][i][0]
                                    finals.append((record[0], param, record[i], self._headers[letter]['geoms'][i], compa))

        try:
            os.remove("finals.sqlite")
        except:
            pass
        self.sf=Sqlite("finals.sqlite")
        self.sf.query("CREATE TABLE finals('time','param','value','compa','compa_type')")
        self.sf.executemany('INSERT INTO finals VALUES ({})'.format(','.join('?' * len(finals[0]))), finals)
# }}}
