import csv
import os
import re
from collections import OrderedDict
from include import Sqlite
from include import Json
from include import Dump as dd

class CsvCfast:
    def __init__(self):
        self.s=Sqlite("{}/aamks.sqlite".format(os.environ['AAMKS_PROJECT']))
        self.json=Json()
        self.conf=self.json.read("{}/conf_aamks.json".format(os.environ['AAMKS_PROJECT']))
        self._make_parsed_placeholder()
        self._parse()

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
            for t in range(0,self.conf['GENERAL']['SIMULATION_TIME']+30,30):
                self.parsed[(i, t)] = OrderedDict([(x, None) for x in self.all_params])

    def _parse(self):
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
        dd(self.parsed)

    def create_dbs(self):
        self._parse()

        columns = ['GEOM', 'TIME'] + list(self.all_params)

        sqliteInputRows = []
        for k, v in self.parsed.items():
            sqliteInputRows.append(k + tuple(vv for kk, vv in self.parsed[k].items()))

        cursor = self.sql_connection.cursor()

        cursor.execute("CREATE TABLE aamks_csv ({})".format(','.join(columns)))
        cursor.execute("CREATE INDEX time_ind ON aamks_csv (GEOM, TIME)")
        cursor.executemany("INSERT INTO aamks_csv values(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)", sqliteInputRows)

