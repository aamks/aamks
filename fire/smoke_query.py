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
    def __init__(self, floor, path):
        ''' 
        Fill each cell with smoke conditions. Then you can query an (x,y). 
        For any evacuee's (x,y) it will be easy to find the square he is in. If
        we have rectangles in our square we use some optimizations to find the
        correct rectangle. Finally fetch the conditions from the cell. 
        ''' 

        self.json = Json()
        self.s = Sqlite("{}/aamks.sqlite".format(path))
        self.simulation_time = 100
        self._read_tessellation(floor)
        self._make_cell2compa()
        self._init_compa_conditions()
        self._cfast_headers()
        while 1:
             t = 20
             time.sleep(1)
             if self.read_cfast_records(t) == 1:
                 print(self.get_conditions((1, 1), t))
                 sys.exit()
             else:
                 print("CFAST not ready")

    def _read_tessellation(self, floor):# {{{
        ''' 
        Python has this nice dict[(1,2)], but json cannot handle it. We have
        passed it as dict['(1,2)'] and know need to bring back from str to
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
        dd(self._query_vertices)
# }}}
    def _make_cell2compa_record(self,cell):# {{{
        try:
            self.cell2compa[cell]=self.s.query("SELECT name from aamks_geom WHERE type_pri='COMPA' AND ?>=x0 AND ?>=y0 AND ?<x1 AND ?<y1", (cell[0], cell[1], cell[0], cell[1]))[0]['name']
        except:
            pass
# }}}
    def _make_cell2compa(self):#{{{
        self.cell2compa=OrderedDict()
        for k,v in self._query_vertices.items():
            self._make_cell2compa_record(k)
            for pt in list(zip(v['x'], v['y'])):
                self._make_cell2compa_record(pt)
#}}}
    def _results(self,q,r,time):# {{{
        ''' q=query, r=cell. Outside is for debugging - should never happen in aamks. '''
        try:
            compa=self.cell2compa[r]
        except:
            compa="outside"
            time=0
            print("Agent outside needs fixing")
        z=self.json.read('{}/paperjs_extras.json'.format(os.environ['AAMKS_PROJECT']))
        z['circles'].append( { "xy": q, "radius": 10, "fillColor": "#f0f", "opacity": 0.9 } )
        z['circles'].append( { "xy": r, "radius": 10, "fillColor": "#0ff", "opacity": 0.6 } )
        z['texts'].append(   { "xy": q, "content": " "+compa, "fontSize": 50, "fillColor":"#f0f", "opacity":0.8 })
        self.json.write(z, '{}/paperjs_extras.json'.format(os.environ['AAMKS_PROJECT']))
        return "Conditions at {} @ {}s ({},{}) in [{},{}]: {}".format(compa, time, q[0],q[1], r[0],r[1], self._compa_conditions[(compa,time)])
# }}}
    def _init_compa_conditions(self):  # {{{
        ''' 
        Prepare dict structure for cfast csv values. Csv contain some params that are
        relevant for aamks and some that are not. The keys are (compa, time):

            self._compa_conditions[('R_1' , 0)]: OrderedDict([('CEILT'  , None) , ('DJET' , None) , ...)
            self._compa_conditions[('R_1' , 10)]: OrderedDict([('CEILT' , None) , ('DJET' , None) , ...)
            self._compa_conditions[('R_1' , 20)]: OrderedDict([('CEILT' , None) , ('DJET' , None) , ...)

        self._compa_conditions[('outside', 0)]=OrderedDict() is more for debugging.
        '''

        self.relevant_params = ('CEILT', 'DJET', 'FLHGT', 'FLOORT', 'HGT',
        'HRR', 'HRRL', 'HRRU', 'IGN', 'LLCO', 'LLCO2', 'LLH2O', 'LLHCL',
        'LLHCN', 'LLN2', 'LLO2', 'LLOD', 'LLT', 'LLTS', 'LLTUHC', 'LWALLT',
        'PLUM', 'PRS', 'PYROL', 'TRACE', 'ULCO', 'ULCO2', 'ULH2O', 'ULHCL',
        'ULHCN', 'ULN2', 'ULO2', 'ULOD', 'ULT', 'ULTS', 'ULTUHC', 'UWALLT',
        'VOL')

        self.all_compas=[i['name'] for i in self.s.query("SELECT name FROM aamks_geom where type_pri = 'COMPA'")]

        self._compa_conditions = OrderedDict()
        for i in self.all_compas:
            for t in range(0, self.simulation_time+10, 10):
                self._compa_conditions[(i, t)] = OrderedDict([(x, None) for x in self.relevant_params])
        self._compa_conditions[('outside', 0)]=OrderedDict()
# }}}
    def _cfast_headers(self):# {{{
        ''' Get 3 first rows from n,s,w files and make headers: params and geoms. Happens only once.'''

        self._headers=OrderedDict()
        for letter in ['n', 's', 'w']:
            f = '{}/fire/test/cfast_{}.csv'.format(os.environ['AAMKS_PATH'], letter)
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
        '''

        needed_record=int(time/10)+1
        with open('/tmp/cfast_n.csv') as f:
            num_data_records=sum(1 for _ in f)-4
        if num_data_records > needed_record:
            return 1
        else:
            return 0
# }}}

    def read_cfast_records(self, time):# {{{
        ''' 
        We had parsed headers separately. Now we only parse numbers from n,s,w files. 
        Application needs to call us prior to massive queries for conditions at (x,y).
        '''

        if self._cfast_has_time(time) == 0:
            return 0

        for letter in ['n', 's', 'w']:
            f = '{}/fire/test/cfast_{}.csv'.format(os.environ['AAMKS_PATH'], letter)
            with open(f, 'r') as csvfile:
                reader = csv.reader(csvfile, delimiter=',')
                for x in range(4):
                    next(reader)
                csvData = list()
                for row in reader:
                    csvData.append(tuple(float(j) for j in row))

            for row in csvData:
                time = row[0]
                for m in range(len(row)):
                    if self._headers[letter]['params'][m] in self.relevant_params and self._headers[letter]['geoms'][m] in self.all_compas:
                        self._compa_conditions[self._headers[letter]['geoms'][m], time][self._headers[letter]['params'][m]] = row[m]
        return 1
# }}}
    def get_conditions(self,q,time):# {{{
        ''' 
        First we find to which square our q belongs. If this square has 0 rectangles
        then we return conditions from the square. If the square has rectangles
        we need to loop through those rectangles. Finally we read the smoke
        conditions from the cell. 
        '''

        x=self.floor_dim['minx'] + self._square_side * int((q[0]-self.floor_dim['minx'])/self._square_side) 
        y=self.floor_dim['miny'] + self._square_side * int((q[1]-self.floor_dim['miny'])/self._square_side)

        if len(self._query_vertices[x,y]['x'])==1:
            return self._results(q, (x,y), time)
        else:
            for i in range(bisect.bisect(self._query_vertices[(x,y)]['x'], q[0]),0,-1):
                if self._query_vertices[(x,y)]['y'][i-1] < q[1]:
                    rx=self._query_vertices[(x,y)]['x'][i-1]
                    ry=self._query_vertices[(x,y)]['y'][i-1]
                    return self._results(q, (rx,ry), time)
        return self._results(q, (x,y), time) # outside!
# }}}

