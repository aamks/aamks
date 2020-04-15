# MODULES {{{
import os
import math
from collections import OrderedDict

from numpy.random import choice
from numpy.random import uniform
from numpy.random import normal
from numpy.random import lognormal
from numpy.random import binomial
from numpy.random import gamma
from numpy.random import triangular
from numpy.random import seed
from numpy import array as npa
from math import sqrt
from scipy.stats import pareto

from include import Sqlite
from include import Psql
from include import Json
from include import Dump as dd
from include import SimIterations

# }}}

class CfastMcarlo():
    #TODO properly logging variables into psql; HALL, SHAFT; TRIGGERS; LEAK_AREA; OUTSIDE to upper in geom
    MATL = {'concrete': {'CONDUCTIVITY': 1.75, 'SPECIFIC_HEAT': 1., 'DENSITY': 2200., 'EMISSIVITY': 0.94, 'THICKNESS': 0.15},
            'gypsum': {'CONDUCTIVITY': 0.3, 'SPECIFIC_HEAT': 1.09, 'DENSITY': 1000., 'EMISSIVITY': 0.85, 'THICKNESS': 0.03},
            'glass': {'CONDUCTIVITY': 0.8, 'SPECIFIC_HEAT': 0.84, 'DENSITY': 2500., 'EMISSIVITY': 0.9, 'THICKNESS': 0.013},
            'block': {'CONDUCTIVITY': 0.3, 'SPECIFIC_HEAT': 0.84, 'DENSITY': 800., 'EMISSIVITY': 0.85, 'THICKNESS': 0.2},
            'brick': {'CONDUCTIVITY': 0.3, 'SPECIFIC_HEAT': 0.9, 'DENSITY': 840., 'EMISSIVITY': 0.85, 'THICKNESS': 0.2}
            }
    CHEM = {"CARBON": 6, "CHLORINE": 0, "HYDROGEN": 10, "NITROGEN": 0, "OXYGEN": 5}

    def __init__(self):# {{{
        ''' Generate montecarlo cfast.in. Log what was drawn to psql. '''
        self.json=Json()
        self.read_json()
        self.create_sqlite_db()
        self.connect_psql_db()
        self.do_iterations()

    def read_json(self):
        self.conf=self.json.read("{}/conf.json".format(os.environ['AAMKS_PROJECT']))
        #if self.conf['fire_model']=='FDS':
        return self.conf['project_id']

    def create_sqlite_db(self):
        self.s=Sqlite("{}/aamks.sqlite".format(os.environ['AAMKS_PROJECT']))
        try:
            self.s.query("CREATE TABLE fire_origin(name,is_room,x,y,z,floor,f_id,sim_id)")
        except Exception as e:
            print(e)
        return self.s

    def connect_psql_db(self):
        self.p=Psql()
        self._psql_collector=OrderedDict()
        return self.p

    def do_iterations(self):
        si=SimIterations(self.conf['project_id'], self.conf['scenario_id'], self.conf['number_of_simulations'])
        for self._sim_id in range(*si.get()):
            seed(self._sim_id)
            self._new_psql_log()
            #self._make_cfast()
            #self._write()
# }}}

# DISTRIBUTIONS / DRAWS
    def _draw_outdoor_temp(self):# {{{
        outdoor_temp=round(normal(self.conf['outdoor_temperature']['mean'],self.conf['outdoor_temperature']['sd']),2)
        self._psql_log_variable('outdoort',outdoor_temp)
        return outdoor_temp
# }}}
    def _save_fire_origin(self, fire_origin):# {{{
        fire_origin.append(self._sim_id)
        self.s.query('INSERT INTO fire_origin VALUES (?,?,?,?,?,?,?,?)', fire_origin)
        self._psql_log_variable('fireorigname',fire_origin[0])
        self._psql_log_variable('fireorig',fire_origin[1])
# }}}

    def _draw_fire_origin(self):# {{{
        is_origin_in_room = binomial(1, self.conf['fire_starts_in_a_room'])
        
        self.all_corridors_and_halls=[z['name'] for z in self.s.query("SELECT name FROM aamks_geom WHERE type_pri='COMPA' AND fire_model_ignore!=1 AND type_sec in('COR','HALL') ORDER BY global_type_id") ]
        self.all_rooms=[z['name'] for z in self.s.query("SELECT name FROM aamks_geom WHERE type_sec='ROOM' ORDER BY global_type_id") ]
        fire_origin=[]
        if is_origin_in_room==1 or len(self.all_corridors_and_halls)==0:
            fire_origin.append(str(choice(self.all_rooms)))
            fire_origin.append('room')
        else:
            fire_origin.append(str(choice(self.all_corridors_and_halls)))
            fire_origin.append('non_room')

        compa=self.s.query("SELECT * FROM aamks_geom WHERE name=?", (fire_origin[0],))[0]
        x=int(compa['x0']+compa['width']/2.0)
        y=int(compa['y0']+compa['depth']/2.0)
        z=int(compa['height'] * (1-math.log10(uniform(1,10))))

        fire_origin+=[x,y,z]
        fire_origin+=[compa['floor']]
        fire_origin.append("f{}".format(compa['global_type_id']))
        print(fire_origin)
        self._save_fire_origin(fire_origin)

        collect = []
        collect.append("&FIRE ID = 'f{}'".format(compa['global_type_id']))
        collect.append("COMP_ID = '{}'".format(compa['name']))
        collect.append("FIRE_ID = 'f{}'".format(compa['global_type_id']))
        collect.append("LOCATION = {}, {} /".format(round(0.01 * compa['width']/2.0, 2), round(0.01 * compa['depth']/2.0,2)))#, round(0.01 * z,2), 1, 'TIME' ,'0','0','0','0','medium')
        return (', '.join(str(i) for i in collect))

# }}}
    def _fire_origin(self):# {{{
        '''
        Either deterministic fire from Apainter, or probabilistic (_draw_fire_origin()). 
        '''

        if len(self.s.query("SELECT * FROM aamks_geom WHERE type_pri='FIRE'")) > 0:
            z=self.s.query("SELECT * FROM aamks_geom WHERE type_pri='FIRE'")
            i=z[0]
            x=i['center_x']
            y=i['center_y']
            z=i['z1']-i['z0']
            room=self.s.query("SELECT floor,name,type_sec,global_type_id,x0,y0 FROM aamks_geom WHERE floor=? AND type_pri='COMPA' AND fire_model_ignore!=1 AND x0<=? AND y0<=? AND x1>=? AND y1>=?", (i['floor'], i['x0'], i['y0'], i['x1'], i['y1']))
            if room[0]['type_sec'] in ('COR','HALL'):
                fire_origin=[room[0]['name'], 'non_room', x, y, z, room[0]['floor']]
            else:
                fire_origin=[room[0]['name'], 'room', x, y , z,  room[0]['floor']]

            fire_origin += "f{}".format(room[0]['global_type_id'])
            self._save_fire_origin(fire_origin)

            collect = []
            collect.append("&FIRE ID = 'f{}'".format(room[0]['global_type_id']))
            collect.append("COMP_ID = '{}'".format(room[0]['name']))
            collect.append("FIRE_ID = 'f{}'".format(room[0]['global_type_id']))
            collect.append("LOCATION = {}, {} /".format(round(0.01 * (x-room[0]['x0']), 2), round(0.01 * (y-room[0]['y0']), 2)))
            cfast_fire=(', '.join(str(i) for i in collect))
        else:
            cfast_fire=self._draw_fire_origin()

        return cfast_fire
# }}}

    def _draw_fire_chem(self):
        z = self.s.query("SELECT f_id, name FROM fire_origin")
        collect = []
        collect.append("&CHEM ID = '{}'".format(z[0]['f_id']))
        for spec, s_value in self.CHEM.items():
            collect.append("{} = {}".format(spec, s_value))
        collect.append("HEAT_OF_COMBUSTION = {}".format(round(uniform(self.conf['heatcom']['min'], self.conf['heatcom']['max'])/1000, 0)))
        collect.append("RADIATIVE_FRACTION = {} /".format(round(gamma(self.conf['radfrac']['k'], self.conf['radfrac']['theta']), 3))) #TODO LOW VARIABILITY, CHANGE DIST
        return (', '.join(str(i) for i in collect))

    def _draw_fire_properties(self, intervals):# {{{
        '''
        Generate fire. Alpha t square on the left, then constant in the
        middle, then fading on the right. At the end read hrrs at given times.
        '''
        z = self.s.query("SELECT f_id, name FROM fire_origin")
        fire_origin = z[0]['name']

        co_yield = [round(uniform(self.conf['co_yield']['min'], self.conf['co_yield']['max']),3)] * intervals
        soot_yield = [round(uniform(self.conf['soot_yield']['min'], self.conf['soot_yield']['max']),3)] * intervals
        hcn_yield = [round(uniform(self.conf['hcn_yield']['min'], self.conf['hcn_yield']['max']),3)] * intervals
        hcl_yield = [round(uniform(self.conf['hcl_yield']['min'], self.conf['hcl_yield']['max']),3)] * intervals
        params = {"CO_YIELD": co_yield, "SOOT_YIELD": soot_yield, "HCN_YIELD": hcn_yield, "HCL_YIELD": hcl_yield}
        return params
# }}}

    def _draw_fire_development(self): # {{{
        hrrpua_d=self.conf['hrrpua']
        hrr_alpha=self.conf['hrr_alpha']

        '''
        Fire area is draw from pareto distrubution regarding the BS PD-7974-7. 
        There is lack of vent condition - underventilated fires
        '''
        p = pareto(b=0.668, scale=0.775)
        fire_area = p.rvs(size=1)[0]
        orig_area = self.s.query("SELECT (width * depth)/10000 as area FROM aamks_geom WHERE name='{}'".format(fire_origin[0]))[0]['area']

        if fire_area > orig_area:
            fire_area = orig_area

        self.hrrpua=int(triangular(hrrpua_d['min'], hrrpua_d['mode'], hrrpua_d['max']))
        hrr_peak=int(self.hrrpua * 1000 * fire_area)
        self.alpha=int(triangular(hrr_alpha['min'], hrr_alpha['mode'], hrr_alpha['max'])*1000)

        self._psql_log_variable('hrrpeak', hrr_peak/1000)
        self._psql_log_variable('alpha', self.alpha/1000.0)
        self._psql_log_variable('area', fire_area)

        # left
        t_up_to_hrr_peak = int((hrr_peak/self.alpha)**0.5)
        interval = int(round(t_up_to_hrr_peak/10))
        times0 = list(range(0, t_up_to_hrr_peak, interval))+[t_up_to_hrr_peak]
        hrrs0 = [int((self.alpha * t ** 2)) for t in times0]

        # middle
        t_up_to_starts_dropping = 15 * 60
        times1 = [t_up_to_starts_dropping]
        hrrs1 = [hrr_peak]

        # right
        t_up_to_drops_to_zero=t_up_to_starts_dropping+t_up_to_hrr_peak
        interval = int(round((t_up_to_drops_to_zero - t_up_to_starts_dropping)/10))
        times2 = list(range(t_up_to_starts_dropping, t_up_to_drops_to_zero, interval))+[t_up_to_drops_to_zero]
        hrrs2 = [int((self.alpha * (t - t_up_to_drops_to_zero) ** 2)) for t in times2 ]

        times = list(times0 + times1 + times2)
        hrrs = list(hrrs0 + hrrs1 + hrrs2)

        return times, hrrs

# }}}
    def _draw_window_opening(self,outdoor_temp): # {{{
        ''' 
        Windows are open / close based on outside temperatures but even
        still, there's a distribution of users willing to open/close the
        windows. Windows can be full-open (1), quarter-open (0.25) or closed
        (0). 
        '''

        draw_value=uniform(0,1)
        for i in self.conf['windows']:
            if outdoor_temp > i['min'] and outdoor_temp <= i['max']:
                if draw_value < i['full']:
                    how_much_open=1 
                elif draw_value < i['full'] + i['quarter']:
                    how_much_open=0.25 
                else:
                    how_much_open=0 
        #self._psql_log_variable('w',how_much_open)
        return how_much_open
        
# }}}
    def _draw_door_and_hole_opening(self,Type):# {{{
        ''' 
        Door may be open or closed, but Hole is always open and we don't need
        to log that.
        '''
        vents=self.conf['vents_open']

        if Type=='HOLE':
            how_much_open=1
        else:
            how_much_open=binomial(1,vents[Type])
            #self._psql_log_variable(Type.lower(),how_much_open)

        return how_much_open
# }}}
    def _draw_heat_detectors_triggers(self):# {{{
        mean=self.conf['heat_detectors']['temp_mean']
        sd=self.conf['heat_detectors']['temp_sd']
        zero_or_one=binomial(1,self.conf['heat_detectors']['not_broken'])
        chosen=round(normal(mean, sd),2) * zero_or_one
        self._psql_log_variable('heat_detectors',chosen)
        return str(chosen)
# }}}
    def _draw_smoke_detectors_triggers(self):# {{{
        mean=self.conf['smoke_detectors']['temp_mean']
        sd=self.conf['smoke_detectors']['temp_sd']
        zero_or_one=binomial(1,self.conf['smoke_detectors']['not_broken'])
        chosen=round(normal(mean, sd),2) * zero_or_one
        self._psql_log_variable('smoke_detectors',chosen)
        return str(chosen)
# }}}
    def _draw_sprinklers_triggers(self):# {{{
        mean=self.conf['sprinklers']['temp_mean']
        sd=self.conf['sprinklers']['temp_sd']
        zero_or_one=binomial(1,self.conf['sprinklers']['not_broken'])
        chosen=round(normal(mean, sd),2) * zero_or_one
        self._psql_log_variable('sprinklers',chosen)
        return str(chosen)
# }}}
    def _psql_log_variable(self,attr,val): #{{{
        self._psql_collector[self._sim_id][attr].append(val)
# }}}

# CFAST SECTIONS
    def _make_cfast(self):# {{{
        ''' Compose cfast.in sections '''

        outdoor_temp=self._draw_outdoor_temp()
        txt=(
            self._section_preamble(self.conf['project_id'], self.conf['scenario_id'], self.conf['simulation_time'], outdoor_temp),
            self._section_matl(),
            self._section_compa(),
            self._section_halls_onez(),
            self._section_windows(outdoor_temp),
            self._section_doors_and_holes(),
            self._section_vvent(),
            self._section_mvent(),
            self._section_fire(),
            self._section_heat_detectors(),
            self._section_smoke_detectors(),
            self._section_sprinklers(),
        )

        with open("{}/workers/{}/cfast.in".format(os.environ['AAMKS_PROJECT'],self._sim_id), "w") as output:
            output.write("\n".join(filter(None,txt)))
# }}}
    def _section_preamble(self, project_id, scenario_id, simulation_time, outdoor_temp, indoor_temp=20, pressure=101325, humidity=50, o_limit=0.15):# {{{
        ''' 
        We use 600 as time, since Cfast will be killed by aamks. 
        '''

        txt=(
        '&HEAD VERSION = 7.5, TITLE = P_ID_{}_S_ID_{}/'.format(project_id, scenario_id),
        '&TIMES SIMULATION = {}., PRINT = 100., SMOKEVIEW = 100., SPREADSHEET = 10. /'.format(simulation_time),
        '&INIT PRESSURE = {}, RELATIVE_HUMIDITY = {}, INTERIOR_TEMPERATURE = {}., EXTERIOR_TEMPERATURE = {}. /'.format(pressure, humidity, indoor_temp, outdoor_temp),
        '&MISC LOWER_OXYGEN_LIMIT = {} /'.format(o_limit),
        '',
        )
        return "\n".join(txt)

# }}}
    def _section_matl(self):# {{{
        txt = ['!! SECTION MATL']
        for mat, m_params in self.MATL.items():
            row = "&MATL ID = '{}', ".format(mat)
            for key, value in m_params.items():
                if key == 'THICKNESS':
                    row = row + key + " = " + str(value) + " /"
                else:
                    row = row + key + " = " + str(value) + ", "
            txt.append(row)
        return "\n".join(txt)
# }}}
    def _section_compa(self):# {{{
        txt=['!! SECTION COMPA']
        for v in self.s.query("SELECT * from aamks_geom WHERE type_pri='COMPA' AND fire_model_ignore!=1 ORDER BY global_type_id"):
            collect=[]
            collect.append("&COMP ID = '{}'".format(v['name']))                        # COMP ID
            collect.append('WIDTH = {}'.format(round(v['width']/100.0, 2)))            # WIDTH
            collect.append('DEPTH = {}'.format(round(v['depth']/100.0, 2)))            # DEPTH
            collect.append('HEIGHT = {}'.format(round(v['height']/100.0, 2)))          # HEIGHT
            collect.append('ORIGIN = {}, {}, {}'.format(round(v['x0']/100.0, 2), round(v['y0']/100.0, 2), round(v['z0']/100.0, 2)))    # ORIGIN
            collect.append("CEILING_MATL_ID = '{}'".format(v['material_ceiling']))      # CEILING_MATERIAL_NAME
            collect.append("WALL_MATL_ID = '{}'".format(v['material_wall']))            # CEILING_MATERIAL_NAME
            collect.append("FLOOR_MATL_ID = '{}'".format(v['material_floor']))          # CEILING_MATERIAL_NAME
            collect.append('GRID = 50, 50, 50 /')
            txt.append(', '.join(str(i) for i in collect))
        return "\n".join(txt)+"\n" if len(txt)>1 else ""
# }}}
    def _section_halls_onez(self):# {{{
        txt=['!! ONEZ,id']
        for v in self.s.query("SELECT * from aamks_geom WHERE type_sec in ('STAI', 'COR') AND fire_model_ignore!=1 order by type_sec"):

            collect=[]
            if v['type_sec']=='COR':
                collect.append('HALL')
            else:
                collect.append('ONEZ')
            collect.append(v['global_type_id'])
            txt.append(','.join(str(i) for i in collect))

        return "\n".join(txt)+"\n" if len(txt)>1 else ""
# }}}
    def _section_windows(self,outdoor_temp):# {{{
        ''' Randomize how windows are opened/closed. '''
        txt=['!! SECTION WINDOWS']
        windows_setup=[]
        for v in self.s.query("SELECT * FROM aamks_geom WHERE type_tri='WIN' ORDER BY vent_from,vent_to"):
            how_much_open=self._draw_window_opening(outdoor_temp)
            windows_setup.append((how_much_open, v['name']))
            if how_much_open == 0:
                continue
            collect=[]
            collect.append("&VENT TYPE = 'WALL'")                                                      # HVENT
            collect.append("ID = '{}'".format(v['name']))                                              # HVENT
            collect.append("COMP_IDS = '{}', '{}'".format(v['vent_from_name'], v['vent_to_name']))     # FROM_TO
            collect.append("WIDTH = {}".format(round(v['cfast_width']/100.0, 2)))            # WIDTH
            collect.append("TOP = {}".format(round((v['sill']+v['height'])/100.0, 2)))       # TOP (height of the top of the hvent relative to the floor)
            collect.append("BOTTOM = {}".format(round(v['sill']/100.0, 2)))                  # BOTTOM
            collect.append("OFFSET = {}".format(round(v['face_offset']/100.0, 2)))           # COMPARTMENT1_OFFSET
            collect.append("FACE = '{}'".format(v['face']))                                  # FACE
            collect.append("CRITERION = 'TIME' T = 0,1 F = 0,{} /".format(how_much_open))         # OPEN CLOSE
            txt.append(', '.join(str(i) for i in collect))

        self.s.executemany('UPDATE aamks_geom SET how_much_open=? WHERE name=?', windows_setup)

        return "\n".join(txt)+"\n" if len(txt)>1 else ""
# }}}
    def _section_doors_and_holes(self):# {{{
        ''' Randomize how doors are opened/close. '''

        txt=['!! SECTION DOORS AND HOLES']
        hvents_setup=[]
        for v in self.s.query("SELECT * FROM aamks_geom WHERE type_tri='DOOR' ORDER BY vent_from,vent_to"):
            how_much_open=self._draw_door_and_hole_opening(v['type_sec']) # HOLE_CLOSE
            hvents_setup.append((how_much_open, v['name']))
            if how_much_open == 0:
                continue
            collect=[]
            collect.append("&VENT TYPE = 'WALL")                                             # TYPE
            collect.append("ID = '{}'".format(v['name']))                                    # VENT ID
            collect.append("COMP_IDS = '{}', '{}'".format(v['vent_from_name'], v['vent_to_name']))     # FROM_TO
            collect.append("WIDTH = {}".format(round(v['cfast_width']/100.0, 2)))            # WIDTH
            collect.append("TOP = {}".format(round((v['sill']+v['height'])/100.0, 2)))       # TOP (height of the top of the hvent relative to the floor)
            collect.append("BOTTOM = {}".format(round(v['sill']/100.0, 2)))                  # BOTTOM
            collect.append("OFFSET = {}".format(round(v['face_offset']/100.0, 2)))           # COMPARTMENT1_OFFSET
            collect.append("FACE = '{}'".format(v['face']))                                  # FACE
            collect.append("CRITERION = 'TIME' T = 0 F = {} /".format(how_much_open))         # OPEN CLOSE
            txt.append(', '.join(str(i) for i in collect))

        self.s.executemany('UPDATE aamks_geom SET how_much_open=? WHERE name=?', hvents_setup)

        return "\n".join(txt)+"\n" if len(txt)>1 else ""
# }}}
    def _section_vvent(self):# {{{
        # VVENT AREA, SHAPE, INITIAL_FRACTION
        txt=['!! SECTION NATURAL VENT']
        #for v in self.s.query("SELECT distinct v.room_area, v.type_sec, v.vent_from, v.vent_to, v.vvent_room_seq, v.width, v.depth, (v.x0 - c.x0) + 0.5*v.width as x0, (v.y0 - c.y0) + 0.5*v.depth as y0 FROM aamks_geom v JOIN aamks_geom c on v.vent_to_name = c.name WHERE v.type_pri='VVENT' AND c.type_pri = 'COMPA' ORDER BY v.vent_from,v.vent_to"):
        for v in self.s.query("SELECT distinct v.name, v.room_area, v.type_sec, v.vent_from_name, v.vent_to_name, v.vvent_room_seq, v.width, v.depth, (v.x0 - c.x0) + 0.5*v.width as x0, (v.y0 - c.y0) + 0.5*v.depth as y0 FROM aamks_geom v JOIN aamks_geom c on v.vent_to_name = c.name WHERE v.type_sec='VVENT' ORDER BY v.vent_from,v.vent_to"):
            how_much_open = self._draw_door_and_hole_opening(v['type_sec'])           # end state with probability of working
            collect=[]
            collect.append("&VENT TYPE = 'CEILING'")                                                  # VENT TYPE
            collect.append("ID = '{}'".format(v['name']))                                             # VENT ID
            collect.append("COMP_IDS = '{}', '{}'".format(v['vent_from_name'], v['vent_to_name']))    # FROM_TO
            collect.append("AREA = '{}'".format(round((v['width']*v['depth'])/1e4, 2)))               # AREA OF THE VENT,
            collect.append("SHAPE = 'SQUARE'")
            collect.append("OFFSETS = {}, {}".format(round(v['x0']/100.0, 2), round(v['y0']/100.0, 2)))           # COMPARTMENT1_OFFSET
            collect.append("CRITERION = 'TIME' T = 0,90 F = 0,{} /".format(how_much_open))         # OPEN CLOSE

            txt.append(', '.join(str(i) for i in collect))

        return "\n".join(txt)+"\n" if len(txt)>1 else ""
# }}}
    def _section_mvent(self):# {{{
        txt=['!! SECTION MECHANICAL VENT']
        #for v in self.s.query("SELECT distinct v.name, v.room_area, v.type_sec, v.vent_from_name, v.vent_to_name, v.vvent_room_seq, v.width, v.depth, (v.x0 - c.x0) + 0.5*v.width as x0, (v.y0 - c.y0) + 0.5*v.depth as y0 FROM aamks_geom v JOIN aamks_geom c on v.vent_to_name = c.name WHERE v.type_sec='MVENT' ORDER BY v.vent_from,v.vent_to"):
        for v in self.s.query( "SELECT * FROM aamks_geom WHERE type_sec = 'MVENT'"):
            collect=[]
            collect.append("&VENT TYPE = 'MECHANICAL'")  # VENT TYPE
            collect.append("ID = '{}'".format(v['name']))  # VENT ID
            collect.append("COMP_IDS = '{}', '{}'".format(v['vent_from_name'], v['vent_to_name']))    # FROM_TO
            area = round((v['width']*v['depth'])/1e4, 2)
            collect.append("AREAS = '{}, {}'".format(area, area))               # AREA OF THE VENT,
            collect.append("HEIGHTS = '{}, {}'".format(v['height'], v['height']))               # AREA OF THE VENT,
            collect.append("FLOW = {}".format(v['mvent_throughput']))  # FLOW ID
            collect.append("CUTOFFS = 200., 300.")  # CUTOFFS
            collect.append("ORIENTATION = 'VERTICAL'")  # ORIENTATION
            collect.append("OFFSETS = {}, {}".format(round(v['x0']/100.0, 2), round(v['y0']/100.0, 2)))           # COMPARTMENT1_OFFSET
            txt.append(', '.join(str(i) for i in collect))

        return "\n".join(txt)+"\n" if len(txt)>1 else ""
# }}}
    def _section_heat_detectors(self):# {{{
        txt=['!! DETECTORS,type,compa,temp,width,depth,height,rti,supress,density']
        for v in self.s.query("SELECT * from aamks_geom WHERE type_pri='COMPA' AND fire_model_ignore!=1 AND heat_detectors=1"):
            temp = self._draw_heat_detectors_triggers()                # ACTIVATION_TEMPERATURE,
            if temp == '0.0':
                collect = [] 
            else: 
                collect=[]
                collect.append('DETECT')                           # DETECT,
                collect.append('HEAT')                             # TYPE: HEAT,SMOKE,SPRINKLER 
                collect.append(v['global_type_id'])                # COMPARTMENT,
                collect.append(temp)                               # ACTIVATION_TEMPERATURE,
                collect.append(round(v['width']/(2.0*100),2))      # WIDTH
                collect.append(round(v['depth']/(2.0*100),2))      # DEPTH
                collect.append(round(v['height']/100.0,2))         # HEIGHT
                collect.append(80)                                 # RTI,
                collect.append(0)                                  # SUPPRESSION,
                collect.append(7E-05)                              # SPRAY_DENSITY
                txt.append(','.join(str(i) for i in collect))

        return "\n".join(txt)+"\n" if len(txt)>1 else ""

# }}}
    def _section_smoke_detectors(self):# {{{
        txt=['!! DETECTORS,type,compa,temp,width,depth,height,rti,supress,density']
        for v in self.s.query("SELECT * from aamks_geom WHERE type_pri='COMPA' AND fire_model_ignore!=1 AND smoke_detectors=1"):
            temp = self._draw_smoke_detectors_triggers()                # ACTIVATION_TEMPERATURE,
            if temp == '0.0':
                collect = [] 
            else: 
                collect=[]
                collect.append('DETECT')                           # DETECT,
                collect.append('SMOKE')                            # TYPE: HEAT,SMOKE,SPRINKLER 
                collect.append(v['global_type_id'])                # COMPARTMENT,
                collect.append(temp)                               # ACTIVATION_TEMPERATURE,
                collect.append(round(v['width']/(2.0*100),2))      # WIDTH
                collect.append(round(v['depth']/(2.0*100),2))      # DEPTH
                collect.append(round(v['height']/100.0,2))         # HEIGHT
                collect.append(80)                                 # RTI,
                collect.append(0)                                  # SUPPRESSION,
                collect.append(7E-05)                              # SPRAY_DENSITY
                txt.append(','.join(str(i) for i in collect))

        return "\n".join(txt)+"\n" if len(txt)>1 else ""

# }}}
    def _section_sprinklers(self):# {{{
        txt=['!! SPRINKLERS,type,compa,temp,width,depth,height,rti,supress,density']
        for v in self.s.query("SELECT * from aamks_geom WHERE type_pri='COMPA' AND fire_model_ignore!=1 AND sprinklers=1"):
            temp = self._draw_sprinklers_triggers() # ACTIVATION_TEMPERATURE,
            if temp == '0.0':
                collect = [] 
            else: 
                collect=[]
                collect.append('DETECT')                           # DETECT,
                collect.append('SPRINKLER')                        # TYPE: HEAT,SMOKE,SPRINKLER 
                collect.append(v['global_type_id'])                # COMPARTMENT,
                collect.append(temp)                               # ACTIVATION_TEMPERATURE,
                collect.append(round(v['width']/(2.0*100),2))      # WIDTH
                collect.append(round(v['depth']/(2.0*100),2))      # DEPTH
                collect.append(round(v['height']/100.0,2))         # HEIGHT
                collect.append(50)                                 # RTI,
                collect.append(1)                                  # SUPPRESSION,
                collect.append(7E-05)                              # SPRAY_DENSITY
                txt.append(','.join(str(i) for i in collect))

        return "\n".join(txt)+"\n" if len(txt)>1 else ""
# }}}
    def _section_fire(self):# {{{
        times, hrrs=self._draw_fire_development()
        fire_properties = self._draw_fire_properties(len(times))
        fire_origin=self._fire_origin()
        area = (((npa(hrrs)/1000)/(2 * 1.204 * 1.005 * 293 * sqrt(9.81))) ** (2/5)) + 0.0001
        txt=(
            '!! FIRE,compa,x,y,z,fire_number,ignition_type,ignition_criterion,ignition_target,?,?,name',
            fire_origin,
            '',
            '!! CHEMI,?,?,?,?',
            'CHEMI,1,1.8,0.3,0.05,0,0.283,{}'.format(fire_properties['heatcom']),
            '',
            'TIME,'+','.join(str(i) for i in times),
            'HRR,'+','.join(str(round(i,3)) for i in hrrs),
            fire_properties['sootyield'],
            fire_properties['coyield'],
            fire_properties['trace'],
            'AREA,'+','.join(str(i) for i in area),
            fire_properties['heigh'],
            
        )
        return "\n".join(txt)+"\n"

# }}}

    def _new_psql_log(self):#{{{
        ''' Init the collector for storing montecarlo cfast setup. Variables will be registered later one at a time. '''
        self._psql_collector[self._sim_id]=OrderedDict([
            ('fireorig'        , []) ,
            ('fireorigname'    , []) ,
            ('heat_detectors'  , []) ,
            ('smoke_detectors' , []) ,
            ('hrrpeak'         , []) ,
            ('sootyield'       , []) ,
            ('coyield'         , []) ,
            ('alpha'           , []) ,
            ('trace'           , []) ,
            ('area'            , []) ,
            ('q_star'          , []) ,
            ('heigh'           , []) ,
            ('w'               , []) ,
            ('outdoort'        , []) ,
            ('dcloser'         , []) ,
            ('door'            , []) ,
            ('sprinklers'      , []) ,
            ('heatcom'         , []) ,
            ('delectr'         , []) ,
            ('vvent'           , []) ,
            ('radfrac'         , []) ,
        ])
#}}}
    def _write(self):#{{{
        ''' 
        Write cfast variables to postgres. Both column names and the values for
        psql come from trusted source, so there should be no security issues
        with just joining dict data (non-parametrized query). 
        '''

        pairs=[]
        for k,v in self._psql_collector[self._sim_id].items():
            pairs.append("{}='{}'".format(k,','.join(str(x) for x in v )))
        data=', '.join(pairs)
        self.p.query("UPDATE simulations SET {} WHERE project=%s AND scenario_id=%s AND iteration=%s".format(data), (self.conf['project_id'], self.conf['scenario_id'], self._sim_id))

#}}}

