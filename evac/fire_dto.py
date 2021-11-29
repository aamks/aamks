import csv
import re
from collections import OrderedDict
from math import exp
import bson
import math


class FIRE_DTO:
    def __init__(self, sql_connection, aamks_vars):

        self.csvTuples4 = []
        self.parsed = OrderedDict()

        self.time_step = aamks_vars['conf']['AAMKS_CONF']['TIME_STEP']
        self.layer_height = aamks_vars['conf']['GENERAL']['LAYER_HEIGHT']

        self.path_to_cfast_dir = aamks_vars['conf']['GENERAL']['WORKSPACE']
        self.project_name = aamks_vars['conf']['GENERAL']['PROJECT_NAME']
        self.c_const = aamks_vars['conf']['GENERAL']['C_CONST']
        self.fire_origin = aamks_vars['conf']['GENERAL']['ROOM_OF_FIRE_ORIGIN']
        self.sql_connection = sql_connection

    def __getattr__(self, item):
        return self.__dict__[item]

    def __setattr__(self, key, value):
        self.__dict__[key] = value

    def query(self, query, params = tuple()):
        cursor = self.sql_connection.cursor()
        cursor.execute(query, params)
        return cursor.fetchall()

    def _make_times(self):
        ''' We assume that times from the first column of (cfast_compartments.csv)(old cfast_n.csv) is the way to go '''
        file = '{}/cfast_compartments.csv'.format(self.path_to_cfast_dir)
        col1 = [x.split(',')[0] for x in open(file).readlines()]
        times = []
        for i in col1[4:]:
            times.append(float(i))
        return times

    def _get_all_compas(self):
        query = "SELECT name FROM aamks_geom where type_pri = 'COMPA' "
        cursor = self.sql_connection.cursor()
        cursor.execute(query, tuple())
        results = cursor.fetchall()
        all_geoms = tuple(i['name'] for i in results)
        return all_geoms

    def _prepare_dict_for_csv_fields(self):  # {{{
        '''Placeholder dict for csv values
        Collect allParams (predefined, all interesting stuff from compartment file (old s,n,w + f) files) and allGeoms (calculated)
        '''
        # TODO! calculate allGeoms, because they're fixed here!
        times = self._make_times()
        self.allGeoms = self._get_all_compas()

        self.allParams = ('CEILT', 'DJET', 'FLHGT', 'FLOORT', 'HGT', 'HRR', 'HRRL', 'HRRU', 'IGN', 'LLCO', 'LLCO2',
                          'LLH2O', 'LLHCL', 'LLHCN', 'LLN2', 'LLO2', 'LLOD', 'LLT', 'LLTS', 'LLTUHC', 'LWALLT', 'PLUM',
                          'PRS', 'PYROL', 'TRACE', 'ULCO', 'ULCO2', 'ULH2O', 'ULHCL', 'ULHCN', 'ULN2', 'ULO2', 'ULOD',
                          'ULT', 'ULTS', 'ULTUHC', 'UWALLT', 'VOL')

        self.parsed = OrderedDict()
        for g in self.allGeoms:
            for t in times:
                self.parsed[(g, t)] = OrderedDict([(x, None) for x in self.allParams])

    def _parse_csv_compartments(self):
        ''' Parse aamks csv output from _comparmetns.csv(CFASTv 7.7, in CFAST 7.3 n,s,w.csv) file. Create csvTuple for sqlite and csvDict '''

        file = '{}/cfast_compartments.csv'.format(self.path_to_cfast_dir)
        with open(file, 'r') as csvfile:
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
                if params[m] in self.allParams and geoms[m] in self.allGeoms:
                    self.parsed[geoms[m], time][params[m]] = row[m]

    def create_dbs(self):
        self._prepare_dict_for_csv_fields()
        self._parse_csv_compartments()

        columns = ['GEOM', 'TIME'] + list(self.allParams)

        sqliteInputRows = []
        for k, v in self.parsed.items():
            sqliteInputRows.append(k + tuple(vv for kk, vv in self.parsed[k].items()))

        cursor = self.sql_connection.cursor()

        cursor.execute("CREATE TABLE aamks_csv ({})".format(','.join(columns)))
        cursor.execute("CREATE INDEX time_ind ON aamks_csv (GEOM, TIME)")
        cursor.executemany(
            "INSERT INTO aamks_csv values(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
            sqliteInputRows)

    def get_optical_density_in_room(self, position, time):
        """

        :type time: float
        :type position: tuple
        """
        assert isinstance(time, float), "%time is not float type"

        query = "SELECT HGT, ULOD, LLOD, type_sec FROM aamks_csv c JOIN aamks_geom s ON c.GEOM = s.name " \
                "WHERE x0 < {} AND x1 > {} AND y0 < {} AND y1 > {} AND type_pri='COMPA' " \
                "AND TIME > {} AND TIME < {} ".format(position[0], position[0], position[1], position[1], time,
                                                      time + 30)

        cursor = self.sql_connection.cursor()
        cursor.execute(query, tuple())
        results = cursor.fetchall()

        if len(results) == 0:
            return 0

        if results[0]['type_sec'] == 'STAI':
            density = 0
        else:
            if results[0]['HGT'] < self.layer_height:
                density = results[0]['ULOD']
            density = results[0]['LLOD']
        return density

    def get_fed(self, position, time):
        query = "SELECT HGT, ULCO, LLCO, ULHCN, LLHCN, ULCO2, LLCO2, ULO2, LLO2, ULHCL, LLHCL, time, type_sec FROM aamks_csv c " \
                "JOIN aamks_geom s ON c.geom = s.name WHERE x0 < {} AND x1 > {} AND y0 < {} " \
                "AND y1 > {} AND type_pri='COMPA' AND time > {} AND time < {} ".format(position[0], position[0],
                                                                                       position[1], position[1], time,
                                                                                       time + 30)

        cursor = self.sql_connection.cursor()
        cursor.execute(query, tuple())
        results = cursor.fetchall()

        if len(results) == 0:
            return 0.

        if results[0]['type_sec'] == 'STAI':  # TODO może to się ładniej zrobić
            fed_total = 0.
        else:
            if results[0]['HGT'] < self.layer_height:
                co = results[0]['ULCO'] * 10000
                o2 = results[0]['ULO2']
                co2 = results[0]['ULCO2']
                hcn = results[0]['ULHCN'] * 10000
                hcl = results[0]['ULHCL'] * 10000

            co = results[0]['LLCO'] * 10000
            o2 = results[0]['LLO2']
            co2 = results[0]['LLCO2']
            hcn = results[0]['LLHCN'] * 10000
            hcl = results[0]['LLHCL'] * 10000

            fed_co = 2.764e-5 * (co ** 1.036) * (self.time_step / 60)
            fed_hcn = (exp(hcn / 43) / 220 - 0.0045) * (self.time_step / 60)
            fed_hcl = (hcl / 1900) * self.time_step
            fed_o2 = (self.time_step / 60) / (60 * exp(8.13 - 0.54 * (20.9 - o2)))
            hv_co2 = exp(0.1903 * co2 + 2.0004) / 7.1
            fed_total = (fed_co + fed_hcn + fed_hcl) * hv_co2 + fed_o2

        return fed_total

    def get_dcbe_time(self):
        query = "SELECT MIN(TIME) as TIME, GEOM FROM aamks_csv c JOIN aamks_geom s ON c.geom = s.name " \
                "WHERE s.type_sec = 'COR' AND HGT < {} AND ULOD > 0.7 ".format(self.layer_height)
        cursor = self.sql_connection.cursor()
        cursor.execute(query, tuple())
        results = cursor.fetchall()
        if results[0]['TIME'] == None:
            return 99999, 'NONE'
        else:
            return results[0]['TIME'], results[0]['GEOM']

    def get_min_height(self):
        query = "SELECT MIN(HGT) as HGT FROM aamks_csv c JOIN aamks_geom s ON c.geom = s.name WHERE s.type_sec = 'COR'"
        cursor = self.sql_connection.cursor()
        cursor.execute(query, tuple())
        results = cursor.fetchall()
        return results[0]['HGT']

    def get_max_temp(self):
        query = "SELECT MAX(ULT) as ULT FROM aamks_csv"
        cursor = self.sql_connection.cursor()
        cursor.execute(query, tuple())
        results = cursor.fetchall()
        return results[0]['ULT']

    def get_min_visibility(self):
        query = "SELECT MAX(ULOD) as ULOD FROM aamks_csv c JOIN aamks_geom s ON c.geom = s.name WHERE s.type_sec = 'COR'"
        cursor = self.sql_connection.cursor()
        cursor.execute(query, tuple())
        results = cursor.fetchall()
        ULOD = results[0]['ULOD']
        if ULOD == 0:
            vis = 300
        else:
            vis = self.c_const/(ULOD/math.log10(math.e))
        return vis

    def dump_fire_data(self):
        query = "SELECT DISTINCT time from aamks_csv order by time asc"
        times = self.query(query)
        data = []
        for step in times:
            time_row = [step['TIME']]
            query = "SELECT time, GEOM, HGT, ULOD, ULCO FROM aamks_csv where time = {}".format(step['TIME'])
            results = self.query(query)
            for i in range(len(results)):
                time_row.append([results[i]['GEOM'], results[i]['HGT'], results[i]['ULOD'], results[i]['ULCO']])
            data.append(time_row)
        d = {"fire":{
            "origin": self.fire_origin,
            "position": {
                "x": 1,
                "y": 1,
                "z": 0
            },
            "start_size": {
                "width": 2.5,
                "height": 2,
                "depth": 2.5
            },
            "evolution": {
                "_dt_comment": "delta time",
                "dt": 5,
                "_data_comment": "dane zawieraja jak przeskalowac start_size co dt sekund",
                "data": [1.0, 1.1, 1.2]
            }
        },
            "smoke_data": data
        }
        return d
