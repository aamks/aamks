# IMPORT# {{{
from collections import OrderedDict
import csv
import re
import os
import sys
import inspect
import bisect
from ast import literal_eval as make_tuple
from numpy.random import randint
from include import Sqlite
from include import Json
from include import Dump as dd

# }}}

class SmokeQuery():
    def __init__(self):
        ''' 
        On init fill each cell with smoke conditions. Then you can query an (x,y). 
        ''' 
        #print("{}/workers/tessellation.json".format(os.environ['AAMKS_PROJECT']))
        self.json=Json() 
        self.s=Sqlite("{}/aamks.sqlite".format(os.environ['AAMKS_PROJECT']))
        self.conf=self.json.read("{}/conf_aamks.json".format(os.environ['AAMKS_PROJECT']))
        self._read_tessellation()
        self._init_conditions()
        self._make_cell2compa()
        self._make_parsed_placeholder()
        self._parse()
        self.conditions_fill_compas()

    def _make_parsed_placeholder(self):  # {{{
        '''
        Placeholder dict for csv values. 
        '''

        self.all_params = ('CEILT', 'DJET', 'FLHGT', 'FLOORT', 'HGT', 'HRR', 'HRRL', 'HRRU', 'IGN', 'LLCO', 'LLCO2',
                          'LLH2O', 'LLHCL', 'LLHCN', 'LLN2', 'LLO2', 'LLOD', 'LLT', 'LLTS', 'LLTUHC', 'LWALLT', 'PLUM',
                          'PRS', 'PYROL', 'TRACE', 'ULCO', 'ULCO2', 'ULH2O', 'ULHCL', 'ULHCN', 'ULN2', 'ULO2', 'ULOD',
                          'ULT', 'ULTS', 'ULTUHC', 'UWALLT', 'VOL')
        self.all_compas=(i['name'] for i in self.s.query("SELECT name FROM aamks_geom where type_pri = 'COMPA'"))

        self.parsed = OrderedDict()
        for i in self.all_compas:
            for t in range(0,self.conf['GENERAL']['SIMULATION_TIME']+10,10):
                self.parsed[(i, t)] = OrderedDict([(x, None) for x in self.all_params])
# }}}
    def _parse(self):# {{{
        ''' Parse aamks csv output from n,s,w files for sqlite. '''

        for letter in ['n', 's', 'w']:
            f = '{}/fire/test/cfast_{}.csv'.format(os.environ['AAMKS_PATH'], letter)
            with open(f, 'r') as csvfile:
                reader = csv.reader(csvfile, delimiter=',')
                headers = []
                for x in range(4):
                    headers.append([field.replace(' ', '') for field in next(reader)])
                    headers[x]
                headers[0] = [re.sub("_.*", "", xx) for xx in headers[0]]

                csvData = list()
                for row in reader:
                    csvData.append(tuple(round(float(j), 2) for j in row))

            params = headers[0]
            geoms = headers[2]

            for row in csvData:
                time = row[0]
                for m in range(len(row)):
                    if params[m] in self.all_params and geoms[m] in self.all_compas:
                        self.parsed[geoms[m], time][params[m]] = row[m]
        # todo: feed conditions dd(self.parsed)
# }}}
    def _create_dbs(self):# {{{
        self._parse()

        columns = ['GEOM', 'TIME'] + list(self.all_params)

        sqliteInputRows = []
        for k, v in self.parsed.items():
            sqliteInputRows.append(k + tuple(vv for kk, vv in self.parsed[k].items()))

        cursor = self.sql_connection.cursor()

        cursor.execute("CREATE TABLE aamks_csv ({})".format(','.join(columns)))
        cursor.execute("CREATE INDEX time_ind ON aamks_csv (GEOM, TIME)")
        cursor.executemany("INSERT INTO aamks_csv values(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)", sqliteInputRows)
# }}}
    def _read_tessellation(self):# {{{
        ''' 
        Python has this nice dict[(1,2)], but json cannot handle it. We have
        passed it as dict['(1,2)'] and know need to bring back from str to
        tuple.
        '''

        f=self.json.read("{}/workers/tessellation.json".format(os.environ['AAMKS_PROJECT']))
        self.side=f['side']
        self.floor_dim=f['floor_dim']
        self.query_vertices=OrderedDict()
        for k,v in f['query_vertices'].items():
            self.query_vertices[make_tuple(k)]=v
# }}}
    def _init_conditions(self):# {{{
        self._compa_conditions=dict()
        for i in self.s.query("SELECT name from aamks_geom WHERE type_pri='COMPA'"):
            self._compa_conditions[i['name']]=dict()
        self._compa_conditions['outside']=dict()
# }}}
    def _make_cell2compa_record(self,cell):# {{{
        try:
            z=self.s.query("SELECT name from aamks_geom WHERE type_pri='COMPA' AND ?>=x0 AND ?>=y0 AND ?<x1 AND ?<y1", (cell[0], cell[1], cell[0], cell[1]))[0]['name']
        except:
            z='outside'
        self.cell2compa[cell]=z
# }}}
    def _make_cell2compa(self):#{{{
        self.cell2compa=OrderedDict()
        for k,v in self.query_vertices.items():
            self._make_cell2compa_record(k)
            for pt in list(zip(v['x'], v['y'])):
                self._make_cell2compa_record(pt)
#}}}
    def conditions_fill_compas(self):#{{{
        ''' Cfast writes to csv files. We parse and write the data to cells '''

        for k,v in self._compa_conditions.items():
            self._compa_conditions[k]['compa']=k
            self._compa_conditions[k]['smoke']=1
            self._compa_conditions[k]['vis']=2
#}}}
    def query(self,q):# {{{
        ''' 
        First we find to which square our q belongs. If this square has 0 rectangles
        then we return conditions from the square. If the square has rectangles
        we need to loop through those rectangles. Finaly we read the smoke
        conditions from the cell. 
        '''

        x=self.floor_dim['minx'] + self.side * int((q[0]-self.floor_dim['minx'])/self.side) 
        y=self.floor_dim['miny'] + self.side * int((q[1]-self.floor_dim['miny'])/self.side)

        if len(self.query_vertices[x,y]['x'])==0:
            return "Conditions at {}x{} (cell {}x{}): {}".format(q[0],q[1], x,y, self._compa_conditions[self.cell2compa[x,y]])
        else:
            for i in range(bisect.bisect(self.query_vertices[(x,y)]['x'], q[0]),0,-1):
                if self.query_vertices[(x,y)]['y'][i-1] < q[1]:
                    rx=self.query_vertices[(x,y)]['x'][i-1]
                    ry=self.query_vertices[(x,y)]['y'][i-1]
                    return "Conditions at {}x{} (cell {}x{}): {}".format(q[0],q[1], rx,ry, self._compa_conditions[self.cell2compa[rx,ry]])
# }}}

