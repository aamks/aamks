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
from include import Dump as dd

# }}}

class SmokeQuery():
    def __init__(self, floor):# {{{
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
        # print("temp: /usr/local/aamks/current/workers/1/")
        # os.chdir("/usr/local/aamks/current/workers/1/")
        self.s = Sqlite("aamks.sqlite")
        self._read_tessellation(floor)
        self._make_cell2compa()
        self._init_compa_conditions()
        self._cfast_headers()
        # }}}
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
            self._cell2compa[cell]=self.s.query("SELECT name from aamks_geom WHERE type_pri='COMPA' AND ?>=x0 AND ?>=y0 AND ?<x1 AND ?<y1", (cell[0], cell[1], cell[0], cell[1]))[0]['name']
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
        except:
            compa="outside"
            time=0
            print("Agent outside needs fixing")
        #z=self.json.read('{}/paperjs_extras.json'.format(os.environ['AAMKS_PROJECT']))
        #z['circles'].append( { "xy": q, "radius": 10, "fillColor": "#f0f", "opacity": 0.9 } )
        #z['circles'].append( { "xy": r, "radius": 10, "fillColor": "#0ff", "opacity": 0.6 } )
        #z['texts'].append(   { "xy": q, "content": " "+compa, "fontSize": 50, "fillColor":"#f0f", "opacity":0.8 })
        #self.json.write(z, '{}/paperjs_extras.json'.format(os.environ['AAMKS_PROJECT']))

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
    def _cfast_has_time(self,time):# {{{
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

        if self._cfast_has_time(time) == 0:
            return 0

        for letter in ['n', 's', 'w']:
            f = 'cfast_{}.csv'.format(letter)
            with open(f, 'r') as csvfile:
                reader = csv.reader(csvfile, delimiter=',')
                for x in range(4):
                    next(reader)
                for row in reader:
                    if int(float(row[0])) == time:
                        needed_record=[int(float(j)) for j in row]
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

# s=SmokeQuery("1")
# s.read_cfast_record(30)
# print(s.get_conditions((2001,100)))
