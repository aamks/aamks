# MODULES {{{
import os
import math
from collections import OrderedDict
from numpy.random import choice
from numpy.random import uniform
from numpy.random import normal
from numpy.random import binomial
from numpy.random import gamma
from numpy.random import triangular
from numpy.random import seed
from numpy import array as npa
from scipy.stats import pareto
from include import Sqlite
from include import Psql
from include import Json
from collections import OrderedDict

# }}}

# TODO properly logging VVENTS and MVENTS into psql; DOORS BROKEN AFTER FIRE; HCN, HCL DISTRIBUTION, Fire development intervals
class CfastMcarlo():
    MATL = {'concrete': {'CONDUCTIVITY': 1.75, 'SPECIFIC_HEAT': 1., 'DENSITY': 2200., 'EMISSIVITY': 0.94, 'THICKNESS': 0.15},
            'gypsum': {'CONDUCTIVITY': 0.3, 'SPECIFIC_HEAT': 1.09, 'DENSITY': 1000., 'EMISSIVITY': 0.85, 'THICKNESS': 0.03},
            'glass': {'CONDUCTIVITY': 0.8, 'SPECIFIC_HEAT': 0.84, 'DENSITY': 2500., 'EMISSIVITY': 0.9, 'THICKNESS': 0.013},
            'block': {'CONDUCTIVITY': 0.3, 'SPECIFIC_HEAT': 0.84, 'DENSITY': 800., 'EMISSIVITY': 0.85, 'THICKNESS': 0.2},
            'brick': {'CONDUCTIVITY': 0.3, 'SPECIFIC_HEAT': 0.9, 'DENSITY': 840., 'EMISSIVITY': 0.85, 'THICKNESS': 0.2}
            }
    CHEM = {"CARBON": 6, "CHLORINE": 0, "HYDROGEN": 10, "NITROGEN": 0, "OXYGEN": 5}

    def __init__(self, sim_id):# {{{
        ''' Generate montecarlo cfast.in. Log what was drawn to psql. '''
        self.json=Json()
        self.read_json()
        self.create_sqlite_db()
        self.connect_psql_db()
        self._sim_id = sim_id
        self._new_psql_log()
        seed(self._sim_id)

    def read_json(self):
        self.conf=self.json.read("{}/conf.json".format(os.environ['AAMKS_PROJECT']))
        #if self.conf['fire_model']=='FDS':
        return self.conf['project_id']

    def create_sqlite_db(self):
        self.s=Sqlite("{}/aamks.sqlite".format(os.environ['AAMKS_PROJECT']))
        t_name= ""
        try:
            t_name = self.s.query("SELECT tbl_name FROM sqlite_master WHERE type = 'table' AND name = 'fire_origin'")[0]
        except Exception as e:
            self.s.query("CREATE TABLE fire_origin(name,is_room,x,y,z,floor,f_id,sim_id)")
            t_name = self.s.query("SELECT tbl_name FROM sqlite_master WHERE type = 'table' AND name = 'fire_origin'")[0]
        return t_name

    def connect_psql_db(self):
        self.p=Psql()
        self._psql_collector=OrderedDict()
        return self.p

    def do_iterations(self):
        self._make_cfast()
        self._write()
# }}}

# DISTRIBUTIONS / DRAWS
    def _draw_outdoor_temp(self):# {{{
        outdoor_temp=round(normal(self.conf['outdoor_temperature']['mean'], self.conf['outdoor_temperature']['sd']),2)
        self._psql_log_variable('outdoor_temp', outdoor_temp)
        return outdoor_temp
# }}}
    def _save_fire_origin(self, fire_origin):# {{{
        fire_origin.append(self._sim_id)
        self.s.query('INSERT INTO fire_origin VALUES (?,?,?,?,?,?,?,?)', fire_origin)
        fr=self.s.query('SELECT * FROM fire_origin WHERE sim_id={}'.format(self._sim_id))
        self._psql_log_variable('fireorigname', fire_origin[0])
        self._psql_log_variable('fireorig', fire_origin[1])
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
        self._save_fire_origin(fire_origin)

        z = self.s.query("SELECT f_id, name FROM fire_origin")

        collect = []
        collect.append("&FIRE ID = '{}'".format(z[0]['f_id']))
        collect.append("COMP_ID = '{}'".format(compa['name']))
        collect.append("FIRE_ID = '{}'".format(z[0]['f_id']))
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

            f = self.s.query("SELECT f_id, name FROM fire_origin")

            collect = []
            collect.append("&FIRE ID = '{}'".format(f[0]['f_id']))
            collect.append("COMP_ID = '{}'".format(room[0]['name']))
            collect.append("FIRE_ID = 'f{}'".format(f[0]['f_id']))
            collect.append("LOCATION = {}, {} /".format(round(0.01 * (x-room[0]['x0']), 2), round(0.01 * (y-room[0]['y0']), 2)))
            cfast_fire=(', '.join(str(i) for i in collect))
        else:
            cfast_fire=self._draw_fire_origin()

        return cfast_fire
# }}}
    def _draw_fire_chem(self):# {{{
        z = self.s.query("SELECT f_id, name FROM fire_origin")

        heat_of_combustion = round(uniform(self.conf['heatcom']['min'], self.conf['heatcom']['max'])/1000, 0)
        self._psql_log_variable('heat_of_combustion', heat_of_combustion)

        rad_frac = round(gamma(self.conf['radfrac']['k'], self.conf['radfrac']['theta']), 3)#TODO LOW VARIABILITY, CHANGE DIST
        self._psql_log_variable('rad_frac', rad_frac)

        collect = []
        collect.append("&CHEM ID = '{}'".format(z[0]['f_id']))
        for spec, s_value in self.CHEM.items():
            collect.append("{} = {}".format(spec, s_value))
        collect.append("HEAT_OF_COMBUSTION = {}".format(heat_of_combustion))
        collect.append("RADIATIVE_FRACTION = {} /".format(rad_frac))
        return (', '.join(str(i) for i in collect))
# }}}
    def _draw_fire_properties(self):# {{{
        '''
        Generate fire. Alpha t square on the left, then constant in the
        middle, then fading on the right. At the end read hrrs at given times.
        '''
        z = self.s.query("SELECT f_id, name FROM fire_origin")
        fire_origin = z[0]['name']
        orig_area = self.s.query("SELECT (width * depth)/10000 as area FROM aamks_geom WHERE name='{}'".format(fire_origin))[0]['area']
        hrrpua_d=self.conf['hrrpua']
        hrr_alpha=self.conf['hrr_alpha']

        '''
        Fire area is draw from pareto distrubution regarding the BS PD-7974-7. 
        There is lack of vent condition - underventilated fires
        '''
        p = pareto(b=self.conf['fire_area']['b'], scale=self.conf['fire_area']['scale'])
        fire_area = round(p.rvs(size=1)[0], 2)
        if fire_area > orig_area:
            fire_area = orig_area

        self.hrrpua=int(triangular(hrrpua_d['min'], hrrpua_d['mode'], hrrpua_d['max']))
        hrr_peak=int(self.hrrpua * fire_area)
        self.alpha=int(triangular(hrr_alpha['min'], hrr_alpha['mode'], hrr_alpha['max'])*1000)

        # left
        t_up_to_hrr_peak = int((hrr_peak/self.alpha)**0.5)
        interval = int(round(t_up_to_hrr_peak/10))
        if interval == 0:
            interval = 10
        times0 = list(range(0, t_up_to_hrr_peak, interval))+[t_up_to_hrr_peak]
        hrrs0 = [int((self.alpha * t ** 2)) for t in times0]

        # middle
        t_up_to_starts_dropping = 15 * 60
        times1 = [t_up_to_starts_dropping]
        hrrs1 = [hrr_peak]

        # right
        t_up_to_drops_to_zero=t_up_to_starts_dropping+t_up_to_hrr_peak
        interval = int(round((t_up_to_drops_to_zero - t_up_to_starts_dropping)/10))
        if interval == 0:
            interval = 10
        times2 = list(range(t_up_to_starts_dropping, t_up_to_drops_to_zero, interval))+[t_up_to_drops_to_zero]
        hrrs2 = [int((self.alpha * (t - t_up_to_drops_to_zero) ** 2)) for t in times2 ]

        times = list(times0 + times1 + times2)
        hrrs = list(hrrs0 + hrrs1 + hrrs2)
        area = list(npa(hrrs)/hrr_peak * fire_area)
        area = [round(i, 2) for i in area]

        h = self.s.query("SELECT * FROM aamks_geom where name = '{}'".format(z[0]['name']))
        h=int(h[0]['height']/100 * (1-math.log10(uniform(1,10))))

        params = OrderedDict()
        steps = len(times)
        co_yield = [round(uniform(self.conf['co_yield']['min'], self.conf['co_yield']['max']), 3)] * steps
        soot_yield = [round(uniform(self.conf['soot_yield']['min'], self.conf['soot_yield']['max']), 3)] * steps
        hcn_yield = [round(uniform(self.conf['hcn_yield']['min'], self.conf['hcn_yield']['max']), 3)] * steps
        hcl_yield = [round(uniform(self.conf['hcl_yield']['min'], self.conf['hcl_yield']['max']), 3)] * steps
        height = [h] * steps
        trace_yield = [0] * steps
        params = {"TIME": times, "HRR": hrrs, "HEIGHT": height, "AREA": area, "CO_YIELD": co_yield, "SOOT_YIELD": soot_yield, "HCN_YIELD": hcn_yield, "HCL_YIELD": hcl_yield, "TRACE_YIELD": trace_yield}

        self._psql_log_variable('hrrpeak', hrr_peak)
        self._psql_log_variable('alpha', self.alpha/1000.0)
        self._psql_log_variable('max_area', fire_area)
        self._psql_log_variable('co_yield', co_yield[0])
        self._psql_log_variable('soot_yield', soot_yield[0])
        self._psql_log_variable('hcn_yield', hcn_yield[0])
        self._psql_log_variable('hcl_yield', hcl_yield[0])
        self._psql_log_variable('heigh', height[0])
        return params, z[0]['f_id']
# }}}
    def _draw_fire_development(self): # {{{
        params = self._draw_fire_properties()
        txt = []
        f_id = params[1]
        collect = []
        labels = "', '".join(params[0].keys())
        collect.append("&TABL ID = '{}', LABELS = '{}' /".format(f_id, labels))
        for i in range(len(params[0]['TIME'])):
            row = []
            for p_keys in params[0].keys():
                row.append(str(params[0][p_keys][i]))
            collect.append("&TABL ID = '{}', DATA = ".format(f_id)+", ".join(row)+ " /")
        txt = "\n".join(collect)
        return txt


# }}}
    def _draw_window_opening(self,outdoor_temp): # {{{
        ''' 
        Windows are open / close based on outside temperatures but even
        still, there's a distribution of users willing to open/close the
        windows. Windows can be full-open (1), quarter-open (0.25) or closed
        (0). 
        '''

        draw_value=uniform(0, 1)
        how_much_open = 0
        for i in self.conf['windows']:
            if outdoor_temp > i['min'] and outdoor_temp <= i['max']:
                if draw_value < i['full']:
                    how_much_open=1 
                elif draw_value < i['full'] + i['quarter']:
                    how_much_open=0.25 
                else:
                    how_much_open=0 
        self._psql_log_variable('w',how_much_open)
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
            self._psql_log_variable(Type.lower(),how_much_open)

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
            self._section_windows(outdoor_temp),
            self._section_doors_and_holes(),
            self._section_vvent(),
            self._section_mvent(),
            self._section_fire(),
            self._section_heat_detectors(),
            self._section_smoke_detectors(),
            self._section_sprinklers(),
            '',
            '&TAIL /'
        )

        with open("{}/workers/{}/cfast.in".format(os.environ['AAMKS_PROJECT'],self._sim_id), "w") as output:
            output.write("\n".join(filter(None,txt)))
# }}}
    def _section_preamble(self, project_id, scenario_id, simulation_time, outdoor_temp, indoor_temp=20, pressure=101325, humidity=50, o_limit=0.15):# {{{
        ''' 
        We use 600 as time, since Cfast will be killed by aamks. 
        '''

        txt=(
        "&HEAD VERSION = 7500, TITLE = 'P_ID_{}_S_ID_{}' /".format(project_id, scenario_id),
        '&TIME SIMULATION = {}, PRINT = 100, SMOKEVIEW = 100, SPREADSHEET = 10 /'.format(simulation_time),
        '&INIT PRESSURE = {} RELATIVE_HUMIDITY = {} INTERIOR_TEMPERATURE = {} EXTERIOR_TEMPERATURE = {} /'.format(pressure, humidity, indoor_temp, outdoor_temp),
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
                if key == list(m_params.keys())[-1]:
                    row = row + key + " = " + str(value) + " /"
                else:
                    row = row + key + " = " + str(value) + ", "
            txt.append(row)
        return "\n".join(txt)
# }}}
    def _build_compa_row(self, name, width, depth, height, ceiling_matl_id, wall_matl_id, floor_matl_id, type_sec, origin, leak_area, grid):# {{{
        collect = []
        collect.append("&COMP ID = '{}'".format(name))
        collect.append('WIDTH = {}'.format(width))
        collect.append('DEPTH = {}'.format(depth))
        collect.append('HEIGHT = {}'.format(height))
        collect.append("CEILING_MATL_ID = '{}'".format(ceiling_matl_id))
        collect.append("WALL_MATL_ID = '{}'".format(wall_matl_id))
        collect.append("FLOOR_MATL_ID = '{}'".format(floor_matl_id))
        if type_sec == 'COR':
            collect.append('HALL = .TRUE.')
        if type_sec == 'STAI':
            collect.append('SHAFT = .TRUE.')
        collect.append('ORIGIN = {}, {}, {}'.format(origin[0], origin[1], origin[2]))
        collect.append('LEAK_AREA = {}, {}'.format(leak_area[0], leak_area[1]))
        collect.append('GRID = {}, {}, {} /'.format(grid[0], grid[1], grid[2]))
        return collect
# }}}
    def _section_compa(self):# {{{
        txt=['!! SECTION COMPA']
        for v in self.s.query("SELECT * from aamks_geom WHERE type_pri='COMPA' AND fire_model_ignore!=1 ORDER BY global_type_id"):
            name = v['name']
            width = round(v['width'] / 100.0, 2)
            depth = round(v['depth']/100.0, 2)
            height = round(v['height']/100.0, 2)
            ceiling_matl_id = v['material_ceiling']
            wall_matl_id  = v['material_wall']
            floor_matl_id = v['material_floor']
            type_sec = v['type_sec']
            origin = [round(v['x0']/100.0, 2), round(v['y0']/100.0, 2), round(v['z0']/100.0, 2)]
            leak_area = [3.5E-4, 5.2E-5]
            grid = [50, 50, 50]
            c_row = self._build_compa_row(name, width, depth, height, ceiling_matl_id, wall_matl_id, floor_matl_id, type_sec, origin, leak_area, grid)
            txt.append(', '.join(str(i) for i in c_row))
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
            collect.append("&VENT TYPE = 'WALL'")
            collect.append("ID = '{}'".format(v['name']))
            collect.append("COMP_IDS = '{}', '{}'".format(v['vent_from_name'], v['vent_to_name']))
            collect.append("WIDTH = {}".format(round(v['cfast_width']/100.0, 2)))
            collect.append("TOP = {}".format(round((v['sill']+v['height'])/100.0, 2)))
            collect.append("BOTTOM = {}".format(round(v['sill']/100.0, 2)))
            collect.append("OFFSET = {}".format(round(v['face_offset']/100.0, 2)))
            collect.append("FACE = '{}'".format(v['face']))
            collect.append("CRITERION = 'TIME' T = 0,1 F = 0,{} /".format(how_much_open))
            txt.append(', '.join(str(i) for i in collect))

        self.s.executemany('UPDATE aamks_geom SET how_much_open=? WHERE name=?', windows_setup)

        return "\n".join(txt)+"\n" if len(txt)>1 else ""
# }}}
    def _section_doors_and_holes(self):# {{{
        ''' Randomize how doors are opened/close. '''

        txt=['!! SECTION DOORS AND HOLES']
        hvents_setup=[]
        for v in self.s.query("SELECT * FROM aamks_geom WHERE type_tri='DOOR' ORDER BY vent_from, vent_to"):
            how_much_open=self._draw_door_and_hole_opening(v['type_sec']) # HOLE_CLOSE
            hvents_setup.append((how_much_open, v['name']))
            if how_much_open == 0:
                continue
            collect=[]
            vent_from_name = v['vent_from_name'].split(".")[0]
            vent_to_name = v['vent_to_name'].split(".")[0]
            collect.append("&VENT TYPE = 'WALL'")                                             # TYPE
            collect.append("ID = '{}'".format(v['name']))                                    # VENT ID
            collect.append("COMP_IDS = '{}', '{}'".format(vent_from_name, vent_to_name))     # FROM_TO
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
        for v in self.s.query("SELECT distinct v.name, v.room_area, v.type_sec, v.vent_from_name, v.vent_to_name, v.vvent_room_seq, v.width, v.depth, (v.x0 - c.x0) + 0.5*v.width as x0, (v.y0 - c.y0) + 0.5*v.depth as y0 FROM aamks_geom v JOIN aamks_geom c on v.vent_to_name = c.name WHERE v.type_sec='VVENT' ORDER BY v.vent_from,v.vent_to"):
            how_much_open = self._draw_door_and_hole_opening(v['type_sec'])           # end state with probability of working
            collect=[]
            vent_from_name = v['vent_from_name'].split(".")[0]
            vent_to_name = v['vent_to_name'].split(".")[0]
            collect.append("&VENT TYPE = 'CEILING'")                                                  # VENT TYPE
            collect.append("ID = '{}'".format(v['name']))                                             # VENT ID
            collect.append("COMP_IDS = '{}', '{}'".format(vent_from_name, vent_to_name))    # FROM_TO
            collect.append("AREA = {}".format(round((v['width']*v['depth'])/1e4, 2)))               # AREA OF THE VENT,
            collect.append("SHAPE = 'SQUARE'")
            collect.append("OFFSETS = {}, {}".format(round(v['x0']/100.0, 2), round(v['y0']/100.0, 2)))           # COMPARTMENT1_OFFSET
            collect.append("CRITERION = 'TIME' T = 0,90 F = 0,{} /".format(how_much_open))         # OPEN CLOSE

            txt.append(', '.join(str(i) for i in collect))

        return "\n".join(txt)+"\n" if len(txt)>1 else ""
# }}}
    def _section_mvent(self):# {{{
        txt=['!! SECTION MECHANICAL VENT']
        for v in self.s.query( "SELECT * FROM aamks_geom WHERE type_sec = 'MVENT'"):
            if v['mvent_throughput'] < 0:
                comp_ids = [v['vent_from_name'], 'OUTSIDE']
            else:
                comp_ids = ['OUTSIDE', v['vent_from_name']]
            if v['is_vertical'] is True:
                orientation = 'VERTICAL'
            else:
                orientation = 'HORIZONTAL'
            collect=[]
            collect.append("&VENT TYPE = 'MECHANICAL'")
            collect.append("ID = '{}'".format(v['name']))
            collect.append("COMP_IDS = '{}', '{}'".format(comp_ids[0], comp_ids[1]))
            area = round((v['width']*v['depth'])/1e4, 2)
            collect.append("AREAS = {}, {}".format(area, area))
            collect.append("HEIGHTS = {}, {}".format(round(v['height']/100, 2), round(v['height'], 2)))
            collect.append("FLOW = {}".format(abs(v['mvent_throughput'])))
            collect.append("CUTOFFS = 200, 300")
            collect.append("ORIENTATIONS = '{}'".format(orientation))
            collect.append("OFFSETS = {}, {} /".format(round(v['x0']/100.0, 2), round(v['y0']/100.0, 2)))
            txt.append(', '.join(str(i) for i in collect))
        return "\n".join(txt)+"\n" if len(txt) > 1 else ""
# }}}
    def _section_heat_detectors(self):# {{{
        txt=['!! HEAT DETECTORS']
        for v in self.s.query("SELECT * from aamks_geom WHERE type_pri='COMPA' AND fire_model_ignore!=1 AND heat_detectors=1"):
            temp = self._draw_heat_detectors_triggers()
            if temp == '0.0':
                collect = [] 
            else: 
                collect=[]

                collect.append("&DEVC ID = 'hd{}' TYPE = 'HEAT_DETECTOR'".format(v['global_type_id']))
                collect.append("COMP_ID = '{}'".format(v['name']))
                collect.append("LOCATION = {}, {}, {}".format(round(v['width']/(2.0*100), 2), round(v['depth']/(2.0*100), 2), round(v['height']/100.0, 2)))
                collect.append("SETPOINT = {}".format(temp))
                collect.append("RTI = {} /".format(5))
                txt.append(','.join(str(i) for i in collect))
        return "\n".join(txt)+"\n" if len(txt)>1 else ""

# }}}
    def _section_smoke_detectors(self):# {{{
        txt=['!! SMOKE DETECTORS']
        for v in self.s.query("SELECT * from aamks_geom WHERE type_pri='COMPA' AND fire_model_ignore!=1 AND smoke_detectors=1"):
            temp = self._draw_smoke_detectors_triggers()                # ACTIVATION_TEMPERATURE,
            if temp == '0.0':
                collect = [] 
            else: 
                collect=[]
                collect.append("&DEVC ID = 'sd{}' TYPE = 'SMOKE_DETECTOR'".format(v['global_type_id']))
                collect.append("COMP_ID = '{}'".format(v['name']))
                collect.append("LOCATION = {}, {}, {}".format(round(v['width']/(2.0*100), 2), round(v['depth']/(2.0*100), 2), round(v['height']/100.0, 2)))
                collect.append("SETPOINTS = {}, {} /".format(temp, temp))
                txt.append(','.join(str(i) for i in collect))
        return "\n".join(txt)+"\n" if len(txt)>1 else ""

# }}}
    def _section_sprinklers(self):# {{{
        txt=['!! SECTION SPRINKLERS']
        for v in self.s.query("SELECT * from aamks_geom WHERE type_pri='COMPA' AND fire_model_ignore!=1 AND sprinklers=1"):
            temp = self._draw_sprinklers_triggers() # ACTIVATION_TEMPERATURE,
            if temp == '0.0':
                collect = [] 
            else: 
                collect=[]
                collect.append("&DEVC ID = 'sp{}' TYPE = 'SPRINKLER'".format(v['global_type_id']))
                collect.append("COMP_ID = '{}'".format(v['name']))
                collect.append("LOCATION = {}, {}, {}".format(round(v['width']/(2.0*100), 2), round(v['depth']/(2.0*100), 2), round(v['height']/100.0, 2)))
                collect.append("SETPOINT = {}".format(temp))
                collect.append("RTI = {}".format(100))
                collect.append("SPRAY_DENSITY = {} /".format(7.E-5))
                txt.append(', '.join(str(i) for i in collect))
        return "\n".join(txt)+"\n" if len(txt)>1 else ""
# }}}
    def _section_fire(self):# {{{
        fire_origin = self._draw_fire_origin()
        fire_chem = self._draw_fire_chem()
        fire_development = self._draw_fire_development()
        txt = (
            '!! SECTION FIRE',
            '',
            fire_origin,
            fire_chem,
            fire_development
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
            ('soot_yield'      , []) ,
            ('co_yield'        , []) ,
            ('hcl_yield'       , []) ,
            ('hcn_yield'       , []) ,
            ('alpha'           , []) ,
            ('trace'           , []) ,
            ('max_area'        , []) ,
            ('heigh'           , []) ,
            ('w'               , []) ,
            ('outdoor_temp'    , []) ,
            ('dcloser'         , []) ,
            ('door'            , []) ,
            ('sprinklers'      , []) ,
            ('heat_of_combustion', []) ,
            ('delectr'         , []) ,
            ('vvent'           , []) ,
            ('rad_frac'        , []) ,
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

