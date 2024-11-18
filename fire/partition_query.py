# IMPORT# {{{
from collections import OrderedDict
import csv
import re
import os
import json
import bisect
from include import Sqlite
from include import Json
from math import exp
from include import Dump as dd
import numpy as np
# }}}

class PartitionQuery:
    def __init__(self, floor, sim_id=None):# {{{
        '''
        * On class init we read cell2compa map and and query_vertices from sqlite.
        * We are getting read_cfast_record(T) calls in say 10s intervals:
          We only store this single T'th record in a dict.
        * We are getting lots of get_conditions((x,y),param) calls after
self.project_conf['simulation_time']        read_cfast_record(T) returns the needed CFAST record.

        Sqlite sends: 
            a) cell2compa:
                (1000, 600): R_1

            b) query_vertices:
                (1000, 600): [1000, 1100, 1200], [ 10, 10, 12 ]

        After CFAST produces the conditions at time T, feed _compa_conditions.
        For any evacuee's (x,y) it will be easy to find the square he is in. If
        we have rectangles in our square we use some optimizations to find the
        correct rectangle. Finally fetch the conditions via cell-compa map.
        ''' 

        self.json = Json()
        if os.environ['AAMKS_WORKER'] == 'slurm':
            new_sql_path = os.path.join(os.environ['AAMKS_PROJECT'], f"aamks_{sim_id}.sqlite")
            self.s=Sqlite(new_sql_path)
        else:
            self.s=Sqlite("{}/aamks.sqlite".format(os.environ['AAMKS_PROJECT']))
        self.json.s = self.s
        #try:
        #    self.s=Sqlite("aamks.sqlite", 1) # We are the worker with aamks.sqlite copy in our working dir
        #except:
        #    self.s=Sqlite("{}/aamks.sqlite".format(os.environ['AAMKS_PROJECT']), 1) # We are the server

        self.floor=str(floor)
        self.floors_meta=json.loads(self.s.query("SELECT * FROM floors_meta")[0]['json'])
        self.config=self.json.read(os.path.join(os.environ['AAMKS_PATH'], 'evac', 'config.json'))
        self.project_conf=self.json.read('{}/conf.json'.format(os.environ['AAMKS_PROJECT']))

        self._sqlite_query_vertices()
        self._sqlite_cell2compa()
        self._init_compa_conditions()

        if self.project_conf['fire_model'] == 'CFAST':
            self._cfast_headers() 
        elif self.project_conf['fire_model'] == 'None':
            for room,data in self.compa_conditions.items():
                for k,v in data.items():
                    self.compa_conditions[room][k]=0


# }}}
    def _sqlite_query_vertices(self):# {{{
        ''' 
        Python has this nice dict[(1,2)], but json cannot handle it. We have
        passed it as dict['1x2'] and now need to bring back from str to
        tuple.
        '''

        son=json.loads(self.s.query("SELECT * FROM query_vertices")[0]['json'])
        d=son[self.floor]
        self._square_side=d['square_side']
        self._query_vertices=OrderedDict()
        for k,v in d['query_vertices'].items():
            z=tuple( int(n) for n in k.split("x") )
            self._query_vertices[z]=v
# }}}
    def _sqlite_cell2compa(self):# {{{
        son=json.loads(self.s.query("SELECT * FROM cell2compa")[0]['json'])
        d=son[self.floor]
        self._cell2compa=OrderedDict()
        for k,v in d.items():
            z=tuple( int(n) for n in k.split("x") )
            self._cell2compa[z]=v
# }}}

    def extend_compas_by_devices(self):
        with open('cfast_devices.csv', 'r') as csvfile:
            reader = csv.reader(csvfile, delimiter=',')
            skip = next(reader)
            skip = next(reader)
            devices_names = next(reader)
            for name in devices_names[1:]: 
                if name not in self.all_compas:
                    self.all_compas.append(name)
        
                


    def _init_compa_conditions(self):  # {{{
        ''' 
        Prepare dict structure for cfast csv values. Csv contain some params that are
        relevant for aamks and some that are not.

            self._compa_conditions['R_1']: OrderedDict([('TIME', None), ('CEILT' , None) , ...)
            self._compa_conditions['R_2']: OrderedDict([('TIME', None), ('CEILT' , None) , ...)
            self._compa_conditions['R_3']: OrderedDict([('TIME', None), ('CEILT' , None) , ...)

        self._compa_conditions['outside']=OrderedDict() is more for debugging.
        '''

        self.relevant_params = ('COMPA', 'CEILT', 'DJET', 'FLHGT', 'FLOORT', 'HGT',
        'HRR', 'HRRL', 'HRRU', 'IGN', 'LLCO', 'LLCO2', 'LLH2O', 'LLHCL',
        'LLHCN', 'LLN2', 'LLO2', 'LLOD', 'LLT', 'LLTS', 'LLTUHC', 'LWALLT',
        'PLUM', 'PRS', 'PYROL', 'TRACE', 'ULCO', 'ULCO2', 'ULH2O', 'ULHCL',
        'ULHCN', 'ULN2', 'ULO2', 'ULOD', 'ULT', 'ULTS', 'ULTUHC', 'UWALLT','VOL',
        'SENST','SENSACT','SENSGAST','SENSGASV') # from devices.csv - location in csv are "sp1","sp2" , for rest is 'r1' or 'c1'
        

        self._default_conditions={}
        for i in self.relevant_params:
            self._default_conditions[i]=0
        self._default_conditions['ULO2']=20
        self.all_compas=[i['name'] for i in self.s.query("SELECT name FROM aamks_geom where type_pri = 'COMPA'")]
        self.extend_compas_by_devices() 
        self.compa_conditions = OrderedDict()
        for compa in self.all_compas:
            self.compa_conditions[compa] = OrderedDict([(x, None) for x in ['TIME'] + list(self.relevant_params)])
            self.compa_conditions[compa]['COMPA']=compa
        self.compa_conditions['outside']=OrderedDict([('TIME', None)])
# }}}


    def _cfast_headers(self):# {{{
        
        
        '''
        in old version:
        CFAST must have produced the first lines of csv by now, which is the header.
        Get 3 first rows from n,s,w files and make headers: params and geoms.
        Happens only once.
        in newer version:
        the same, but in files: 'compartments', 'devices', 'vents', 'walls'


        '''

        self._headers=OrderedDict()
        for letter in ['compartments', 'devices', 'vents', 'walls']:
            f = 'cfast_{}.csv'.format(letter)
            with open(f, 'r') as csvfile:
                reader = csv.reader(csvfile, delimiter=',')
                headers = []
                for x in range(3):
                    headers.append([field.replace(' ', '') for field in next(reader)])
                    headers[x]
                if letter=='compartments':
                    headers[0], headers[1] = zip(*[xx.split('_') for xx in headers[0][1:]])
                    headers[0] = list(headers[0])
                    headers[1] = list(headers[1])
                    headers[0].insert(0, 'Time')
                    headers[1].insert(0, '')
                else:
                    headers[0] = [re.sub('_.*', '', xx) for xx in headers[0]]
                    headers[1] = ['']*len(headers[1])


            self._headers[letter]=OrderedDict()
            self._headers[letter]['params']=headers[0]
            self._headers[letter]['params_sec']=headers[1]
            self._headers[letter]['geoms']=headers[2]
        

# }}}
    def cfast_has_time(self,time):# {{{
        ''' 
        CFAST dumps 4 header records and then data records. 
        Data records are indexed by time with delta='SMOKE_QUERY_RESOLUTION' from self.config (default 10s).
        '''

        if self.project_conf['fire_model'] == 'None':
            return 1

        needed_record_id = int(time / self.config['SMOKE_QUERY_RESOLUTION'])
        with open('cfast_compartments.csv') as f:
            num_data_records = sum(1 for _ in f) - 4
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

        if self.project_conf['fire_model'] == 'None':
            for room,data in self.compa_conditions.items():
                self.compa_conditions[room]['TIME']=time
                self.compa_conditions[room]['ULO2']=20
            return
        # 'letter' can be changed to name - missleading
        needed_record = None
        for letter in ['compartments','devices','vents','walls']:
            f = 'cfast_{}.csv'.format(letter)
            with open(f, 'r') as csvfile:
                reader = csv.reader(csvfile, delimiter=',')
                for x in range(4):
                    next(reader)
                for row in reader:
                    if round(float(row[0])) == time:
                        needed_record=[(float(j)) for j in row]
                        needed_record[0]=round(float(row[0]))
                        break

            for compa in self.all_compas:
                self.compa_conditions[compa]['TIME']=needed_record[0]
            self.compa_conditions['outside']['TIME']=needed_record[0]

            for m in range(len(needed_record)):
                if self._headers[letter]['params'][m] in self.relevant_params and self._headers[letter]['geoms'][m] in self.all_compas:
                    self.compa_conditions[self._headers[letter]['geoms'][m]][self._headers[letter]['params'][m]] = needed_record[m]
                




# }}}
    def xy2room(self,q):# {{{
        ''' 
        First we find to which square our q belongs. If this square has 0 rectangles
        then we return conditions from the square. If the square has rectangles
        we need to loop through those rectangles. 
        '''

        x=self.floors_meta[self.floor]['minx'] + self._square_side * int((q[0]-self.floors_meta[self.floor]['minx'])/self._square_side) 
        y=self.floors_meta[self.floor]['miny'] + self._square_side * int((q[1]-self.floors_meta[self.floor]['miny'])/self._square_side)
        if q[0]< self.floors_meta[self.floor]['minx'] or q[0] > self.floors_meta[self.floor]['maxx'] or q[1] < self.floors_meta[self.floor]['miny'] or q[1] > self.floors_meta[self.floor]['maxy']:
            return "outside"

        if len(self._query_vertices[x,y]['x'])==1:
            return self._cell2compa[(x,y)] if (x,y) in self._cell2compa else "outside"
        else:
            for i in range(bisect.bisect(self._query_vertices[(x,y)]['x'], q[0]),0,-1):
                if self._query_vertices[(x,y)]['y'][i-1] < q[1]:
                    rx=self._query_vertices[(x,y)]['x'][i-1]
                    ry=self._query_vertices[(x,y)]['y'][i-1]
                    return self._cell2compa[(rx,ry)] if (rx,ry) in self._cell2compa else "outside"
        return "outside"
# }}}
    def get_conditions(self,q):# {{{
        ''' 
        Same as xy2room, except it returns conditions, not just the room.
        '''


        if q[0] < self.floors_meta[self.floor]['minx'] or q[0] > self.floors_meta[self.floor]['maxx'] or q[1] < self.floors_meta[self.floor]['miny'] or q[1] > self.floors_meta[self.floor]['maxy']:
            # agent is outside building:
            return {'COMPA': 'outside'}


        if self.project_conf['fire_model'] == 'None':
            return self._default_conditions

        x=self.floors_meta[self.floor]['minx'] + self._square_side * int((q[0]-self.floors_meta[self.floor]['minx'])/self._square_side) 
        y=self.floors_meta[self.floor]['miny'] + self._square_side * int((q[1]-self.floors_meta[self.floor]['miny'])/self._square_side)

        if len(self._query_vertices[x,y]['x'])==1:
            if (x,y) in self._cell2compa:
                attempt_room = self._cell2compa[(x,y)]
                room = re.search(r'(s\d+)(\.\d+)?', attempt_room).group(1) if attempt_room.startswith("s") else attempt_room
            else:
                room = None
            conditions = self.compa_conditions[room] if room != None else {'COMPA': 'outside'}
            return conditions
        else:
            for i in range(bisect.bisect(self._query_vertices[(x,y)]['x'], q[0]),0,-1):
                if self._query_vertices[(x,y)]['y'][i-1] <= q[1]:
                    rx=self._query_vertices[(x,y)]['x'][i-1]
                    ry=self._query_vertices[(x,y)]['y'][i-1]
                    if (rx,ry) in self._cell2compa:
                        attempt_room = self._cell2compa[(rx,ry)]
                        room = re.search(r'(s\d+)(\.\d+)?', attempt_room).group(1) if attempt_room.startswith("s") else attempt_room
                    else:
                        room = None
                    conditions = self.compa_conditions[room] if room != None else {'COMPA': 'outside'}
                    return conditions
                    #return self.compa_conditions[self._cell2compa[(rx,ry)]] if (rx,ry) in self._cell2compa else {'COMPA': 'outside'} \
        return {'COMPA': 'outside'} 
# }}}
    def get_visibility(self, position):# {{{
        conditions = self.get_conditions(position)
        #print('FLOOR: {}, ROOM: {}, HGT: {}, TIME: {}'.format(floor, room, conditions['HGT'], time))

        if conditions == 'outside':
            print('outside')

        if re.search(r'(s\d+)', conditions['COMPA']):
            return conditions['ULOD'], conditions['COMPA']
        
        if 'HGT' in conditions.keys():
            hgt = conditions['HGT']
            if hgt == None:
                return 0, conditions['COMPA']
        else:
            return 0, conditions['COMPA']

        if hgt > self.config['LAYER_HEIGHT']:
            return conditions['LLOD'], conditions['COMPA']
        else:
            return conditions['ULOD'], conditions['COMPA']
# }}}
    # deprecated
    def get_fed_deprecated(self, position):# {{{
        conditions = self.get_conditions(position)

        hgt = conditions['HGT']
        if hgt == None:
            return 0.

        if hgt > self.config['LAYER_HEIGHT']:
            layer = 'L'
        else:
            layer = 'U'

        fed_co = 2.764e-5 * ((conditions[layer+'LCO'] * 1000000) ** 1.036) * (self.config['TIME_STEP'] / 60)
        fed_hcn = (exp((conditions[layer+'LHCN'] * 10000) / 43) / 220 - 0.0045) * (self.config['TIME_STEP'] / 60)  # units convertion error
        fed_hcl = ((conditions[layer+'LHCL'] * 1000000) / 1900) * self.config['TIME_STEP']  # time units convertion error
        fed_o2 = (self.config['TIME_STEP'] / 60) / (60 * exp(8.13 - 0.54 * (20.9 - conditions[layer+'LO2'])))
        hv_co2 = exp(0.1903 * conditions[layer+'LCO2'] + 2.0004) / 7.1
        fed_total = (fed_co + fed_hcn + fed_hcl) * hv_co2 + fed_o2

        return fed_total
# }}}

    # source: Purser, D. Application of human and animal exposure studies [in:] Stec, A. and Hull, T. Fire Toxicity, 2010
    def get_fed_purser(self, position):# {{{
        def ppm(x): return x*1e4    # %mol to ppm conversion
        conditions = self.get_conditions(position)

        # when position of evacuee is outside the building we assume no FED absorbed
        if conditions['COMPA'] == 'outside':
            return 0.
        
        hgt = conditions['HGT']
        if re.search(r'(s\d+)', conditions['COMPA']):
            hgt = self.config['LAYER_HEIGHT']
        
        if hgt == None:
            return 0.

        if hgt > self.config['LAYER_HEIGHT']:
            layer = 'L'
        else:
            layer = 'U'

        # doses of chemical compunds lethal for 50% of populations over 30 min period + 14 days = LC_50 * 30 min [ppm*min]
        lc50_30 = {     
                'co': 162000,     #LC_50 = 5400
                'hcn': 4950,    #LC_50 = 165
                'hcl': 114000,    #LC_50 = 3800
                }

        # actual concentrations of compunds from CFAST
        c = {       
                'co2': conditions[layer+'LCO2'], 
                'o2': conditions[layer+'LO2'], 
                'co': conditions[layer+'LCO'],
                'hcn': conditions[layer+'LHCN'],
                'hcl': conditions[layer+'LHCL']
                }

        # hiperventilation coefficient
        v_co2 = 1 + (exp(0.14 * c['co2']) - 1) / 2      
        
        # fractional doses for species
        dt = self.config['TIME_STEP'] / 60    #[min]
        feds = {}
        for spec in lc50_30.keys():
            feds[spec] = ppm(c[spec]) * dt / lc50_30[spec]

        hypoxia = dt / exp(8.13 - 0.54 * (21 - c['o2']))

        # acidosis factor [possible mistake in the source - 400 ppm is approx. concentration of CO2 in the air]
        # it gives 0.002 (in the source 0.02) for normal conditions.
        # However, CFAST default CO2 concentration is 0.0, so any positive concentration is for extensive CO2
        af = c['co2'] * 0.05

        # total FED absorbed in time step dt
        fed_total = sum(feds.values()) * v_co2 + hypoxia + af

        return fed_total
# }}}

    # source: Purser, D. and McAllister J. Assesment of Hazards to Occupants from Smoke, Toxic Gases and Heat [in:] Hurley, M. et al. SFPE Handbook of Fire Protection Engineering, vol. 3, 5th ed., 2016
    # activity_levels: 0 -> rest/sleep; 1 -> light work/walking; 2 -> heavy work/slow run/climbing the stairs
    def get_fed_sfpe(self, position, activity_level=1):# {{{
        def ppm(x): return x*1e4    # %mol to ppm conversion

        conditions = self.get_conditions(position)

        # when position of evacuee is outside the building we assume no FED absorbed
        if conditions['COMPA'] == 'outside':
            return 0.

        hgt = conditions['HGT']
        if hgt is None or hgt < self.config['LAYER_HEIGHT']:
            # one-zone model or (two-zone and heads in upper zone)
            layer = 'U'
        else:
            # two-zone model, heads in lower zone
            layer = 'L'

        # actual concentrations of compunds from CFAST [mol %]
        c = {       
                'co2': conditions[layer+'LCO2'], 
                'o2': conditions[layer+'LO2'], 
                'co': conditions[layer+'LCO'],
                'hcn': conditions[layer+'LHCN'],
                'hcl': conditions[layer+'LHCL']
                }

        # hiperventilation coefficient
        v_co2 = exp(0.1903 * c['co2'] + 2.0004) / 7.1
        
        # fractional doses for species
        dt = self.config['TIME_STEP'] / 60    #[min]

        feds = {}
        cohb_threshold = [40, 30, 20] #[%v/v]
        feds['co'] = 3.317e-5 * ppm(c['co'])**1.036 * dt / cohb_threshold[activity_level]    # stewart equation
        feds['hcn'] = ppm(c['hcn'])**2.36 * dt / 2.43e7     # from experiments on primates - general case 
        feds['hcl'] = ppm(c['hcl']) * dt / 60000     # 12000 ppm * 5 min is incapacitating dose for HCl

        hypoxia = dt / exp(8.13 - 0.54 * (20.9 - c['o2']))

        # breathing rate [l/min]
        v_e = [8.5, 25, 50]
        breath = min(v_e[activity_level] * v_co2, 70)   # 70 l/min is recommended upper limit

        # total FED absorbed in time step dt
        fed_total = sum(feds.values()) * breath + hypoxia 

        #print(f'SFPE: {fed_total}\nPurser: {self.get_fed_purser(position)}\nFDS+Evac: {self.get_fed_deprecated(position)}\n')
        return fed_total
# }}}

    def get_final_vars(self):# {{{
        '''
        The app should call us after CFAST produced all output. These are the
        summaries of various min values.
        '''

        if self.project_conf['fire_model'] == 'None':
            return {'dcbe': 0, 'min_hgt_cor':0, 'min_hgt_compa':0, 'max_temp_compa':0, 'min_vis_cor':0, 'min_vis_compa':0 }

        self._collect_final_vars()
        finals=OrderedDict()
        #dd(self.sf.query('SELECT * from finals order by param,value'))

#        # min(time) for HGT_COR < 1.8
#        hgt = self.sf.query("SELECT MIN(time) FROM finals WHERE compa_type='c' AND param='HGT' AND value < 1.8")[0]['MIN(time)']
#        if hgt == None:
#            hgt = 9999
#        ulod = self.sf.query("SELECT MIN(time) FROM finals WHERE compa_type='c' AND param='ULOD' AND value > 0")[0]['MIN(time)']
#        if ulod == None:
#            ulod = 9999
#        ult = self.sf.query("SELECT MIN(time) FROM finals WHERE compa_type='c' AND param='ULT' AND value > 60")[0]['MIN(time)']
#        if ult == None:
#            ult = 9999
#        finals['dcbe']=max(hgt, ulod, ult)

        # min(HGT_COR) 
        q = self.sf.query("SELECT MIN(value) FROM finals WHERE compa_type='c' AND param='HGT'")[0]['MIN(value)']
        finals['min_hgt_cor']= (q if q else 0)

        # min(HGT_COMPA)
        finals['min_hgt_compa']=self.sf.query("SELECT MIN(value) FROM finals WHERE param='HGT'")[0]['MIN(value)']

        # min(ULT_COMPA)
        finals['max_temp_compa']=self.sf.query("SELECT MAX(value) FROM finals WHERE param='ULT'")[0]['MAX(value)']

        #min detection time - need to be tested in big simulations  
        #SENSACT gives only 0 (not activeted) or 1(activated) - query finds the least time 
        finals['min_time_detection']=self.sf.query("SELECT MIN(time) from finals where param='SENSACT' AND value>0")


        c_const = self.project_conf['c_const']
        # min(ULOD_COR)
        q = self.sf.query("SELECT MAX(value) FROM finals WHERE compa_type='c' AND param='ULOD'")[0]['MAX(value)']
        ul_od_cor = (q if q else 0)
        if ul_od_cor == 0:
            finals['min_vis_cor'] = 30
        else:
            finals['min_vis_cor'] = min([30, c_const / (ul_od_cor * 2.303)])


        # min(ULOD_COMPA)
        q = self.sf.query("SELECT MAX(value) FROM finals WHERE param='ULOD'")[0]['MAX(value)']
        ul_od_compa = (q if q else 0)
        if ul_od_compa == 0:
            finals['min_vis_compa'] = 30
        else:
            finals['min_vis_compa'] = min([30, c_const /(ul_od_compa * 2.303)])

        # total heat released
        hrrs = self.sf.query("SELECT value FROM finals WHERE param='HRR' AND param_sec='1'")
        finals['tot_heat'] = np.trapz([hrrs[i]['value'] for i in range(len(hrrs))], dx=self.config['SMOKE_QUERY_RESOLUTION'])


        return finals

        # }}}
    def _collect_final_vars(self):# {{{
        ''' 
        Create finals.sqlite for this very sim_id. Convert CFAST csvs into sqlite.
        '''

        finals=[]

        for letter in ['compartments', 'devices', 'vents','walls']:
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
                            if self._headers[letter]['geoms'][i] != 'outside':
                                if self._headers[letter]['geoms'][i] != 'medium':
                                    compa=self._headers[letter]['geoms'][i][0]
                                    finals.append((record[0], param, self._headers[letter]['params_sec'][i], record[i], self._headers[letter]['geoms'][i], compa))

        try:
            os.remove("finals.sqlite")
        except:
            pass
        self.sf=Sqlite("finals.sqlite", 2)
        self.sf.query("CREATE TABLE finals('time','param','param_sec','value','compa','compa_type')")
        self.sf.executemany('INSERT INTO finals VALUES ({})'.format(','.join('?' * len(finals[0]))), finals)
        

# }}}
