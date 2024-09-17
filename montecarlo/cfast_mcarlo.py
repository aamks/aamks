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
from numpy import insert as npins
from numpy import round as npround
from numpy import mean
from scipy.stats import pareto
from include import Sqlite
from include import Psql
from include import Json
from rescue_module.rescue import *
import numpy as np

from montecarlo.evac_mcarlo import lognorm_params_from_percentiles, lognorm_percentiles_from_params

# }}}
def join2str(l, sep, quotes=False, force=False):
    joined = []
    for o in l:
        if type(o) == str and quotes:
            joined.append(f"'{o}'")
        else:
            joined.append(str(o))
    joined[0] = l[0] if quotes and not force else joined[0]

    return sep.join(joined)


# staircase entities are named like s1.1, s1.2, s2.1, s2.2 in order to produce navmesh on subsequent floors
# CFAST, however, treats each staircas as one compartment called s1, s2 and so on without irrelevant floor info
def cfast_name(aamks_geom_name):
    return aamks_geom_name.split('.')[0]


# TODO properly logging VVENTS and MVENTS into psql; DOORS BROKEN AFTER FIRE; HCN, HCL DISTRIBUTION, Fire development intervals
class CfastMcarlo():
    MATL = {'concrete': {'CONDUCTIVITY': 1.75, 'SPECIFIC_HEAT': 1., 'DENSITY': 2200., 'EMISSIVITY': 0.94, 'THICKNESS': 0.15},
            'gypsum': {'CONDUCTIVITY': 0.3, 'SPECIFIC_HEAT': 1.09, 'DENSITY': 1000., 'EMISSIVITY': 0.85, 'THICKNESS': 0.03},
            'glass': {'CONDUCTIVITY': 0.8, 'SPECIFIC_HEAT': 0.84, 'DENSITY': 2500., 'EMISSIVITY': 0.9, 'THICKNESS': 0.013},
            'block': {'CONDUCTIVITY': 0.3, 'SPECIFIC_HEAT': 0.84, 'DENSITY': 800., 'EMISSIVITY': 0.85, 'THICKNESS': 0.2},
            'brick': {'CONDUCTIVITY': 0.3, 'SPECIFIC_HEAT': 0.9, 'DENSITY': 840., 'EMISSIVITY': 0.85, 'THICKNESS': 0.2}
            }
    def __init__(self, sim_id):# {{{
        ''' Generate montecarlo cfast.in. Log what was drawn to psql. '''
        self.json=Json()
        self.read_json()
        self.create_sqlite_db()
        self._sim_id = sim_id
        # why seed is used - it eliminates 'free' nature of pseudo-random
        #seed(self._sim_id)
        self.config = self.json.read(os.path.join(os.environ['AAMKS_PATH'], 'evac', 'config.json'))
        self.p = Psql()
        self.__draw()

    def __draw(self):
        d = DrawAndLog(self._sim_id)
        d.all()
        self.samples = d.sections
        self._psql_collector = d.data_for_psql
    
    def _cfast_record(self, key, name=None):
        name = name if name is not None else key
        if type(self.samples[key]) == dict:
            record = ''
            for k, v in self.samples[key].items():
                if type(v) == list:
                    record +=  ', '.join([f'{k} = {join2str(v, ", ")}' ]) + ', '
                else:
                    record += join2str([k, v], ' = ', quotes=True) + ', '
            return f'&{name} ' + record[:-2] + ' /\n'
        #&TABL
        elif type(self.samples[key]) == list:
            table = ''
            for i in self.samples[key]:
                record = f'&{name}'
                for k, v in i.items():
                    if k == 'LABELS':
                        record +=  f' {k} = ' + join2str(v, ', ', quotes=True, force=True)
                    elif type(v) == list:
                        record +=  f' {k} = ' + join2str(v, ', ')
                    else:
                        record +=  ' ' + join2str([k, v], ' = ', quotes=True)
                table += record + '/\n'
            return table

    def read_json(self):
        self.conf=self.json.read("{}/conf.json".format(os.environ['AAMKS_PROJECT']))

    def create_sqlite_db(self):
        self.s=Sqlite("{}/aamks.sqlite".format(os.environ['AAMKS_PROJECT']))
        t_name= ""
        try:
            t_name = self.s.query("SELECT tbl_name FROM sqlite_master WHERE type = 'table' AND name = 'fire_origin'")[0]
        except Exception as e:
            self.s.query("CREATE TABLE fire_origin(name,is_room,x,y,z,loc_x, loc_y,floor,f_id,height,devc,major,sim_id)")
            t_name = self.s.query("SELECT tbl_name FROM sqlite_master WHERE type = 'table' AND name = 'fire_origin'")[0]
        return t_name

    def do_iterations(self):
        self._make_cfast()
        self._write()
        self.s.close()

# CFAST SECTIONS
    def _make_cfast(self):# {{{
        ''' Compose cfast.in sections '''

        txt=(
            self._section_preamble(),
            self._section_matl(),
            self._section_compa(),
            self._section_windows(),
            self._section_doors_and_holes(),
            self._section_vvent(),
            self._section_mvent(),
            self._section_fire(),
            self._section_connections(),
            self._section_targets(),
            self._section_heat_detectors(),
            self._section_smoke_detectors(),
            self._section_sprinklers(),
            '',
            '&TAIL /'
        )

        with open("{}/workers/{}/cfast.in".format(os.environ['AAMKS_PROJECT'],self._sim_id), "w") as output:
            output.write("\n".join(filter(None,txt)))
        os.chmod("{}/workers/{}/cfast.in".format(os.environ['AAMKS_PROJECT'],self._sim_id), 0o666)
# }}}
    def _section_preamble(self):# {{{
        if self.conf['simulation_time'] > 3600 or self.config['SMOKE_QUERY_RESOLUTION'] != 1:
            raise Exception('The simulation time must be less than 3600 seconds and the frequency of saving cfast simulation results to csv files must be equal to 1s for the dynamic modification of cfast simulation parameters via sockets to work properly')
        txt=(
        f"&HEAD VERSION = 7724, TITLE = 'P_ID_{self.conf['project_id']}_S_ID_{self.conf['scenario_id']}' /",
        f"&TIME SIMULATION = {self.conf['simulation_time']+1}, PRINT = {self.config['SMOKE_QUERY_RESOLUTION']}, SMOKEVIEW = {self.config['SMOKE_QUERY_RESOLUTION']}, SPREADSHEET = {self.config['SMOKE_QUERY_RESOLUTION']} /",
        self._cfast_record('INIT'),
        f"&MISC LOWER_OXYGEN_LIMIT = 0.15, MAX_TIME_STEP = 0.1/",
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
        collect.append(f"&COMP ID = '{name}'")
        collect.append(f'WIDTH = {width}')
        collect.append(f'DEPTH = {depth}')
        collect.append(f'HEIGHT = {height}')
        collect.append(f"CEILING_MATL_ID = '{ceiling_matl_id['type']}'")
        collect.append(f"WALL_MATL_ID = '{wall_matl_id['type']}'")
        collect.append(f"FLOOR_MATL_ID = '{floor_matl_id['type']}'")
        collect.append(f"CEILING_THICKNESS = {ceiling_matl_id['thickness']}")
        collect.append(f"WALL_THICKNESS = {wall_matl_id['thickness']}")
        collect.append(f"FLOOR_THICKNESS = {floor_matl_id['thickness']}")
        if type_sec == 'COR':
            collect.append('HALL = .TRUE.')
        if type_sec == 'STAI':
            collect.append('SHAFT = .TRUE.')
        collect.append(f'ORIGIN = {join2str(origin, ", ")}')
        collect.append(f'LEAK_AREA = {join2str(leak_area, ", ")}')
        collect.append(f'GRID = {join2str(grid, ", ")} /')
        return collect
# }}}
    def _section_compa(self):# {{{
        txt=['!! SECTION COMPA']
        for v in self.s.query("SELECT * from aamks_geom WHERE type_pri='COMPA' AND fire_model_ignore!=1 ORDER BY global_type_id"):
            name = v['name']
            width = round(v['width'] / 100.0, 2)
            depth = round(v['depth']/100.0, 2)
            height = round(v['height']/100.0, 2)
            ceiling_matl = self.conf['material_ceiling']
            wall_matl  = self.conf['material_wall']
            floor_matl = self.conf['material_floor']
            type_sec = v['type_sec']
            origin = [round(v['x0']/100.0, 2), round(v['y0']/100.0, 2), round(v['z0']/100.0, 2)]
            leak_area = [3.5E-4, 5.2E-5]
            grid = [50, 50, 50]
            c_row = self._build_compa_row(name, width, depth, height, ceiling_matl, wall_matl, floor_matl, type_sec, origin, leak_area, grid)
            txt.append(', '.join(str(i) for i in c_row))
        return "\n".join(txt)+"\n" if len(txt)>1 else ""
# }}}
    def _section_windows(self):# {{{
        txt = (
            '!! SECTION WINDOWS',
            '\n',
            self._cfast_record('VENT'),
        )
        return "".join(txt)
# }}}

    def _section_doors_and_holes(self):# {{{
        txt = (
            '!! SECTION DOORS AND HOLES',
            '\n',
            self._cfast_record('DOORS', 'VENT'),
        )
        return "".join(txt)
# }}}
    def _section_vvent(self):# {{{
        # VVENT AREA, SHAPE, INITIAL_FRACTION
        txt=['!! SECTION NATURAL VENT']
        for i, v in enumerate(self.s.query("SELECT distinct v.name, v.room_area, v.type_sec, v.vent_from_name, v.vent_to_name, v.vvent_room_seq, v.width, v.depth, (v.x0 - c.x0) + 0.5*v.width as x0, (v.y0 - c.y0) + 0.5*v.depth as y0 FROM aamks_geom v JOIN aamks_geom c on v.vent_to_name = c.name WHERE v.type_sec='VVENT' ORDER BY v.vent_from,v.vent_to")):
            how_much_open = self.samples['vvents'][i][0]           # end state with probability of working
            collect=[]
            collect.append("&VENT TYPE = 'CEILING'")                                                  # VENT TYPE
            collect.append("ID = '{}'".format(v['name']))                                             # VENT ID
            collect.append("COMP_IDS = '{}', '{}'".format(cfast_name(v['vent_from_name']), cfast_name(v['vent_to_name'])))
            collect.append("AREA = {}".format(round((v['width']*v['depth'])/1e4, 2)))               # AREA OF THE VENT,
            collect.append("SHAPE = 'SQUARE'")
            collect.append("OFFSETS = {}, {}".format(round(v['x0']/100.0, 2), round(v['y0']/100.0, 2)))           # COMPARTMENT1_OFFSET
            collect.append("CRITERION = 'TIME' T = 0,90 F = 0,{} /".format(how_much_open))         # OPEN CLOSE

            txt.append(', '.join(str(j) for j in collect))

        return "\n".join(txt)+"\n" if len(txt)>1 else ""
# }}}
    def _section_mvent(self):# {{{
        txt=['!! SECTION MECHANICAL VENT']
        for v in self.s.query( "SELECT * FROM aamks_geom WHERE type_sec = 'MVENT'"):
            if v['mvent_throughput'] < 0:
                comp_ids = [cfast_name(v['vent_from_name']), 'OUTSIDE']
            else:
                comp_ids = ['OUTSIDE', cfast_name(v['vent_from_name'])]
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
            collect.append("OFFSETS = {}, {}".format(round(v['x0']/100.0, 2), round(v['y0']/100.0, 2)))
            # TODO add detection time to running mechanical ventilation
            activation_delay = self.conf['NSHEVS']['activation_time']
            start_up = self.conf['NSHEVS']['startup_time']
            collect.append(f"CRITERION = 'TIME' T = {activation_delay},{activation_delay+start_up} F = 0,1 /")
            txt.append(', '.join(str(i) for i in collect))
        return "\n".join(txt)+"\n" if len(txt) > 1 else ""

    def _section_fire(self):# {{{
        txt = (
            '!! SECTION FIRE',
            '\n',
            self._cfast_record('FIRE'),
            self._cfast_record('CHEM'),
            self._cfast_record('TABL'),
        )
        return "".join(txt)
# }}}
    def _section_connections(self):# {{{
        txt = (
            '!! CONNECTIONS',
            '\n',
            self._cfast_record('CONN'),
        )
        return "".join(txt)
# }}}
    def _section_targets(self):
        if 'DEVC' in self.samples:
            txt = (
                '!! SECTION TARGETS',
                '\n',
                self._cfast_record('DEVC'),
            )
            return "".join(txt)
    def _section_heat_detectors(self):# {{{
        txt=['!! HEAT DETECTORS']
        for i, v in enumerate(self.s.query("SELECT * from aamks_geom WHERE type_pri='COMPA' AND fire_model_ignore!=1 AND heat_detectors=1")):
            #temp = self._draw_heat_detectors_triggers()
            temp = self.samples['heat_detectors'][i]
            if temp == 0:
                collect = [] 
            else: 
                collect=[]

                collect.append("&DEVC ID = 'hd{}' TYPE = 'HEAT_DETECTOR'".format(v['global_type_id']))
                collect.append("COMP_ID = '{}'".format(v['name']))
                collect.append("LOCATION = {}, {}, {}".format(round(v['width']/(2.0*100), 2), round(v['depth']/(2.0*100), 2), round(v['height']/100.0, 2)))
                collect.append("SETPOINT = {}".format(temp))
                collect.append("RTI = {} /".format(self.conf['heat_detectors']['RTI']))
                txt.append(','.join(str(j) for j in collect))
        return "\n".join(txt)+"\n" if len(txt)>1 else ""

# }}}
    def _section_smoke_detectors(self):# {{{
        txt=['!! SMOKE DETECTORS']
        for i, v in enumerate(self.s.query("SELECT * from aamks_geom WHERE type_pri='COMPA' AND fire_model_ignore!=1 AND smoke_detectors=1")):
            smoke_obscuration = self.samples['smoke_detectors'][i]
            if smoke_obscuration == 0:
                collect = [] 
            else: 
                collect=[]
                collect.append("&DEVC ID = 'sd{}' TYPE = 'SMOKE_DETECTOR'".format(v['global_type_id']))
                collect.append("COMP_ID = '{}'".format(v['name']))
                collect.append("LOCATION = {}, {}, {}".format(round(v['width']/(2.0*100), 2), round(v['depth']/(2.0*100), 2), round(v['height']/100.0, 2)))
                collect.append("SETPOINT = {} /".format(smoke_obscuration))
                txt.append(','.join(str(i) for i in collect))
        return "\n".join(txt)+"\n" if len(txt)>1 else ""

# }}}
    def _section_sprinklers(self):# {{{
        txt=['!! SECTION SPRINKLERS']
        for i, v in enumerate(self.s.query("SELECT * from aamks_geom WHERE type_pri='COMPA' AND fire_model_ignore!=1 AND sprinklers=1")):
            try:
                temp, dens = self.samples['sprinklers'][i]    # ACTIVATION_TEMPERATURE,
            except TypeError:
                collect =[]
            else: 
                collect=[]
                collect.append("&DEVC ID = 'sp{}' TYPE = 'SPRINKLER'".format(v['global_type_id']))
                collect.append("COMP_ID = '{}'".format(v['name']))
                collect.append("LOCATION = {}, {}, {}".format(round(v['width']/(2.0*100), 2), round(v['depth']/(2.0*100), 2), round(v['height']/100.0, 2)))
                collect.append(f"SETPOINT = {temp}")
                collect.append(f"RTI = {self.conf['sprinklers']['RTI']}")
                collect.append(f"SPRAY_DENSITY = {dens} /")
                txt.append(', '.join(str(i) for i in collect))
        return "\n".join(txt)+"\n" if len(txt)>1 else ""
# }}}
# }}}
#}}}
    def _write(self):#{{{
        ''' 
        Write cfast variables to postgres. Both column names and the values for
        psql come from trusted source, so there should be no security issues
        with just joining dict data (non-parametrized query). 
        '''

        pairs=[]
        for k,v in self._psql_collector[self._sim_id].items():
            pairs.append("{}='{}'".format(k,','.join(str(x) for x in v ) if v else '0'))
        data=', '.join(pairs)

        self.p.query("UPDATE simulations SET {} WHERE project=%s AND scenario_id=%s AND iteration=%s".format(data), (self.conf['project_id'], self.conf['scenario_id'], self._sim_id))

#}}}

class Fire:
    def __init__(self, room, is_room, x, y, z, loc_x, loc_y, floor, f_id, height, devc, major):
        self.room = room
        self.is_room = is_room
        self.x = x
        self.y = y
        self.z = z
        self.loc_x = loc_x
        self.loc_y = loc_y
        self.floor = floor
        self.f_id = f_id
        self.height = height
        self.devc = devc
        self.major = major

        
class DrawAndLog:
    FUELS = {"WOOD": {"molecule":{ "CARBON": 1, "HYDROGEN": 1.7, "OXYGEN": 0.72, "NITROGEN": 0.001, "CHLORINE": 0},
                "heatcom":  {'mean': 17.1, 'sd': 0}, 
                "yields": {"soot": {'mean': 0.015, 'sd': 0}, "co": {'mean': 0.004, 'sd': 0}, "hcn": {'mean': 0.126, 'sd': 0}}},
             "PVC": {"molecule":{ "CARBON": 2, "HYDROGEN": 3, "OXYGEN": 0, "NITROGEN": 0, "CHLORINE": 1},
                "heatcom":  {'mean': 16.4, 'sd': 0}, 
                "yields": {"soot": {'mean': 0.113, 'sd': 0}, "co": {'mean': 0.903, 'sd': 0}, "hcn": {'mean': 0, 'sd': 0}}},
             "PMMA": {"molecule":{ "CARBON": 5, "HYDROGEN": 8, "OXYGEN": 2, "NITROGEN": 0, "CHLORINE": 0},
                "heatcom":  {'mean': 25.2, 'sd': 0}, 
                "yields": {"soot": {'mean': 0.022, 'sd': 0}, "co": {'mean': 0.010, 'sd': 0}, "hcn": {'mean': 0, 'sd': 0}}},
             "PP": {"molecule":{ "CARBON": 3, "HYDROGEN": 6, "OXYGEN": 0, "NITROGEN": 0, "CHLORINE": 0},
                "heatcom":  {'mean': 43.4, 'sd': 0}, 
                "yields": {"soot": {'mean': 0.059, 'sd': 0}, "co": {'mean': 0.024, 'sd': 0}, "hcn": {'mean': 0, 'sd': 0}}},
             "PE": {"molecule":{ "CARBON": 2, "HYDROGEN": 4, "OXYGEN": 0, "NITROGEN": 0, "CHLORINE": 0},
                "heatcom":  {'mean': 43.6, 'sd': 0}, 
                "yields": {"soot": {'mean': 0.06, 'sd': 0}, "co": {'mean': 0.024, 'sd': 0}, "hcn": {'mean': 0, 'sd': 0}}},
             "PU": {"molecule":{ "CARBON": 1, "HYDROGEN": 1.2, "OXYGEN": 0.2, "NITROGEN": 0.08, "CHLORINE": 0},
                "heatcom":  {'mean': 28, 'sd': 0}, 
                "yields": {"soot": {'mean': 0.113, 'sd': 0}, "co": {'mean': 0.024, 'sd': 0}, "hcn": {'mean': 0, 'sd': 0}}},
             "PS": {"molecule":{ "CARBON": 8, "HYDROGEN": 8, "OXYGEN": 0, "NITROGEN": 0, "CHLORINE": 0},
                "heatcom":  {'mean': 39.2, 'sd': 0}, 
                "yields": {"soot": {'mean': 0.164, 'sd': 0}, "co": {'mean': 0.06, 'sd': 0}, "hcn": {'mean': 0, 'sd': 0}}}}
        #TODO to be imported from postgres
    PSQL_HEADERS = ['fireorig', 'fireorigname', 'heat_detectors', 'smoke_detectors', 'hrrpeak', 'soot_yield',
             'co_yield', 'hcl_yield', 'hcn_yield', 'alpha', 'trace', 'max_area', 'heigh', 'w', 'outdoor_temp',
             'dcloser', 'door', 'sprinklers', 'heat_of_combustion', 'delectr', 'vvent', 'rad_frac', 'fireload']

    def __init__(self, sim_id):
        self._sim_id = sim_id
        self.json = Json()
        self.__read_json()
        self.__connectDB()
        self.config = self.json.read(os.path.join(os.environ['AAMKS_PATH'], 'evac', 'config.json'))
        self._scen_fuel = {}
        self._fire = None
        self._fires = []
        self._fire_openings = []
        self.sections = {}

    def __read_json(self):
        self.conf=self.json.read("{}/conf.json".format(os.environ['AAMKS_PROJECT']))

    def __connectDB(self):
        self.s = Sqlite("{}/aamks.sqlite".format(os.environ['AAMKS_PROJECT']))
        self.data_for_psql=OrderedDict()
        self.__new_psql_log()

    def __new_psql_log(self):#{{{
        ''' Init the collector for storing montecarlo cfast setup. Variables will be registered later one at a time. '''
        self.data_for_psql[self._sim_id]=OrderedDict([(h,  []) for h in self.PSQL_HEADERS])

    def _psql_log_variable(self, attr, val): #{{{
        self.data_for_psql[self._sim_id][attr].append(val)

    def _psql_log_variables(self, attrs_vals): #{{{
        for av in attrs_vals:
            self.data_for_psql[self._sim_id][av[0]].append(av[1])

    def _draw_initial(self):# {{{
        self.sections['INIT'] = {}
        self.sections['INIT']['EXTERIOR_TEMPERATURE'] = round(normal(self.conf['outdoor_temperature']['mean'], self.conf['outdoor_temperature']['sd']),2)
        self.sections['INIT']['INTERIOR_TEMPERATURE'] = round(normal(self.conf['indoor_temperature']['mean'], self.conf['indoor_temperature']['sd']),2)
        self.sections['INIT']['PRESSURE'] = round(normal(self.conf['pressure']['mean'], self.conf['pressure']['sd']))
        self.sections['INIT']['RELATIVE_HUMIDITY'] = round(normal(self.conf['humidity']['mean'], self.conf['humidity']['sd']))

        self._psql_log_variable('outdoor_temp', self.sections['INIT']['EXTERIOR_TEMPERATURE'])
# }}}
    '''&FIRE'''
    def _save_fire_origin(self, fire_origin):# {{{
        self._fires.append(Fire(*fire_origin))
        fire_origin.append(self._sim_id)
        self.s.query('INSERT INTO fire_origin VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)', fire_origin)
# }}}
    def _draw_compartment(self):
        # calculate probabilistic space (events and probabilities) from sqlite import format
        def prob_space(compa_list):
            omega = [element[0] for element in compa_list]
            ranks = [element[1] for element in compa_list]
            ranks_sum = sum(ranks)
            probabilities = [rank/ranks_sum for rank in ranks]
            return omega, probabilities
        # find fire compartment
        is_origin_in_room = binomial(True, self.conf['fire_starts_in_a_room'])
        all_corridors_and_halls = [[z['name'], z['width']*z['depth']] for z in self.s.query("SELECT name, width, depth FROM aamks_geom WHERE type_pri='COMPA' AND fire_model_ignore!=1 AND type_sec in('COR','HALL') ORDER BY global_type_id") ]
        all_rooms = [[z['name'], z['width']*z['depth']] for z in self.s.query("SELECT name, width, depth FROM aamks_geom WHERE type_sec='ROOM' ORDER BY global_type_id") ]
        
        comp = {}
        if is_origin_in_room or not all_corridors_and_halls:
            omega, probs = prob_space(all_rooms)
            comp['type'] = 'room'
        else:
            omega, probs = prob_space(all_corridors_and_halls)
            comp['type'] = 'non_room'
        comp['name'] = str(choice(omega, p=probs))

        return comp
    
    def _locate_in_the_middle(self, fire_room):
        loc = {}
        # locate fire in compartment
        room = self.s.query("SELECT * FROM aamks_geom WHERE name=?", (fire_room, ))[0]

        x=int(room['x0']+room['width']/2.0)
        y=int(room['y0']+room['depth']/2.0)
        fire_height = round((room['height'] * (1-math.log10(uniform(10**0.1,10)))) / 100, 2)
        z = int(fire_height * 100) + room['z0']

        loc['x'], loc['y'], loc['z'] = [x,y,z]    #[cm]
        loc['loc_x'], loc['loc_y'] = [round(lc/100, 2) for lc in [int(room['width']/2), int(room['depth']/2)]]   #[m]
        loc['floor'] = room['floor']
        loc['fire_id'] = f"f{room['global_type_id']}"
        loc['height'] = fire_height
        loc['major'] = 0

        self._psql_log_variable('heigh', fire_height)

        return loc

    def _locate_randomly(self, fire_room):
        loc = {}
        # locate fire in compartment
        room = self.s.query("SELECT * FROM aamks_geom WHERE name=?", (fire_room, ))[0]

        # draw location (uniform across the compartment)
        dx = uniform(0, room['width'])
        dy = uniform(0, room['depth'])

        x = int(room['x0']+dx)
        y = int(room['y0']+dy)
        fire_height = round((room['height'] * (1-math.log10(uniform(10**0.1,10)))) / 100, 2)
        z = int(fire_height * 100) + room['z0']

        loc['x'], loc['y'], loc['z'] = [x,y,z]    #[cm]
        loc['loc_x'], loc['loc_y'] = [round(lc/100, 2) for lc in [dx, dy]]   #[m]
        loc['floor'] = room['floor']
        loc['fire_id'] = f"f{room['global_type_id']}"
        loc['height'] = fire_height
        loc['devc'] = f"t_f{room['global_type_id']}"
        loc['major'] = 0
        comp_type = 'room' if room['type_sec'] == 'ROOM' else 'non_room'

        return loc, comp_type

    def _deterministic_fire(self):
        comp, loc = {}, {}
        fire = self.s.query("SELECT * FROM aamks_geom WHERE type_pri='FIRE'")[0]
        room = self.s.query("SELECT floor,name,type_sec,global_type_id,x0,y0,z0 FROM aamks_geom WHERE floor=? AND type_pri='COMPA' AND fire_model_ignore!=1 AND x0<=? AND y0<=? AND x1>=? AND y1>=?", 
                (fire['floor'], fire['x0'], fire['y0'], fire['x1'], fire['y1']))[0]

        loc['x'], loc['y'], loc['z'] =  [fire['center_x'], fire['center_y'], fire['z0']]
        loc['loc_x'], loc['loc_y'] = [round(i/100, 2) for i in [fire['center_x'] - room['x0'], fire['center_y'] - room['y0']]]
        loc['floor'] = room['floor']
        loc['fire_id'] = f"f{room['global_type_id']}"
        loc['height'] = fire['z0'] - room['z0']
        loc['devc'] = f"t_f{room['global_type_id']}"
        loc['major'] = 0

        comp['name'] = room['name']
        comp['type'] = 'room' if room['type_sec'] == 'ROOM' else 'non_room'

        return comp, loc

    def _draw_fires(self):# {{{
        if len(self.s.query("SELECT * FROM aamks_geom WHERE type_pri='FIRE'")) > 0:
            comp, loc = self._deterministic_fire()
            loc['major'] = 1
            self._save_fire_origin([comp['name'], comp['type']] + list(loc.values()))
        else:
            comp = self._draw_compartment() 
            loc, _ = self._locate_randomly(comp['name'])
            loc['major'] = 1
            self._save_fire_origin([comp['name'], comp['type']] + list(loc.values()))

            comps = self.s.query(f"SELECT adjacents FROM aamks_geom WHERE name='{comp['name']}'")[0]['adjacents']
            for comp in comps.split(","):
                comp_name = comp.split(";")[0]
                loc, comp_type = self._locate_randomly(comp_name)
                self._save_fire_origin([comp_name, comp_type] + list(loc.values()))

        for fire in self._fires:
            if fire.major == 1:
                self._fire = fire
        self.sections['FIRE'] = [self._draw_major_fire_preamble(), *self._draw_fires_preamble()]


    def _draw_major_fire_preamble(self):
            self._psql_log_variables([('heigh', self._fire.height), ('fireorigname', self._fire.room),
                                      ('fireorig', self._fire.is_room)])
            fire = {"ID": self._fire.f_id,
                    "COMP_ID": self._fire.room,
                    "FIRE_ID": self._fire.f_id,
                    "LOCATION": [self._fire.loc_x, self._fire.loc_y]}
            return fire
    def _draw_fires_preamble(self):
        fires = []
        for fire in self._fires:
            if fire.major != 1:
                fires.append({"ID": fire.f_id,
                                "COMP_ID": fire.room,
                                "FIRE_ID": fire.f_id,
                                "LOCATION": [fire.loc_x, fire.loc_y],
                                "IGNITION_CRITERION": self.conf['new_fire']['criterion'],
                                "DEVC_ID": fire.devc,
                                "SETPOINT": self.conf['new_fire']['setpoint']})
        return fires
# }}}
    '''&CHEM'''
    def __draw_fuel(self):
        if self.conf['fuel'] == 'random':
            self._scen_fuel = self.FUELS[choice(list(self.FUELS))]
        elif self.conf['fuel'] == 'user':
            self._scen_fuel = {k: self.conf[k] for k in self.FUELS['WOOD'].keys()}
        else:
            self._scen_fuel = self.FUELS[self.conf['fuel']]

    def _draw_fire_chem(self, fire_id):# {{{
        if not self._scen_fuel:
            self.__draw_fuel()

        heat_of_combustion = round(normal(self._scen_fuel['heatcom']['mean'], self._scen_fuel['heatcom']['sd']), 0)     #[MJ/kg]
        rad_frac = round(gamma(self.conf['radfrac']['k'], self.conf['radfrac']['theta']), 3)#TODO LOW VARIABILITY, CHANGE DIST

        chem = {'ID': fire_id,
                'HEAT_OF_COMBUSTION': heat_of_combustion * 1000, 
                'RADIATIVE_FRACTION': rad_frac}
        for spec, s_value in self._scen_fuel['molecule'].items():
            chem[spec] = s_value
        return chem
    def _draw_fires_chem(self):
        self.sections['CHEM'] = [self._draw_fire_chem(fire.f_id) for fire in self._fires]
        for i in self.sections['CHEM']:
            if i['ID'] == self._fire.f_id:
                self._psql_log_variables([('heat_of_combustion', i['HEAT_OF_COMBUSTION']),
                                                    ('rad_frac', i['RADIATIVE_FRACTION'])]) #,
                                                    #('fuel', self._scen_fuel)])  #[MJ/kg], [-], [string]
# }}}
    '''&TABL'''
    def _draw_fire_maxarea(self, fire_room_name):
        '''
        Fire area is draw from pareto distrubution regarding the BS PD-7974-7. 
        There is lack of vent condition - underventilated fires
        '''
        orig_area = self.s.query(f"SELECT width*depth/10000 AS area FROM aamks_geom WHERE name='{fire_room_name}'")[0]['area']    # [m2]
        if self.conf['r_is']!='simple':
            fire_area = orig_area
        else:
            p = pareto(b=self.conf['fire_area']['b'], scale=self.conf['fire_area']['scale'])
            fire_area = round(p.rvs(size=1)[0], 2)  #[m2]
            if fire_area > orig_area:
                fire_area = orig_area
        return fire_area    #[m2]

    def _flashover_q(self, fire_room_name, model='max'):
        fire_room = self.s.query(f"SELECT width, depth, height FROM aamks_geom WHERE name='{fire_room_name}'")[0]
        a_o = sum([math.prod(o) for o in self._fire_openings])    # because openings dimensions in m
        a_t = (2 * (fire_room['width'] + fire_room['depth']) * fire_room['height']) / 1e4 - a_o    # because dimensions in cm 
        h_o = sum([o[1] for o in self._fire_openings])     # because openings dimensions in m
        thomas =  7.83 * a_t + 378 * a_o * h_o ** 0.5
        babrauskass = 750 * a_o * h_o ** 0.5
        if model == 'Thomas':
            return thomas
        elif model == 'Babrauskass':
            return babrauskass
        else:
            return max([thomas, babrauskass])

    def _draw_hrr_area_cont_func(self, fire):
        hrrpua_d = self.conf['hrrpua']    # [kW/m2]
        hrr_alpha = self.conf['hrr_alpha']    # [kW/s2]
        fire_area = self._draw_fire_maxarea(fire.room)
        hrrpua = int(triangular(hrrpua_d['min'], hrrpua_d['mode'], hrrpua_d['max']))
        self.alpha = triangular(hrr_alpha['min'], hrr_alpha['mode'], hrr_alpha['max'])

        def find_peak_hrr():
            well_vent = hrrpua * fire_area 
            under_vent = self._flashover_q(fire.room)
            if well_vent < under_vent:
                return int(well_vent), False
            else:
                return int(under_vent), True
        hrr_peak, flashover = find_peak_hrr()

        fire_load_d = self.conf['fire_load'][fire.is_room] # [MJ/m2]
        if fire_load_d['mean']!='' and fire_load_d['sd']!='':
            load_density = int(lognormal(fire_load_d['mean'], fire_load_d['sd']))  # location, scale
        elif fire_load_d['1st']!='' and fire_load_d['99th']!='':
            params = lognorm_params_from_percentiles(fire_load_d['1st'], fire_load_d['99th'])
            load_density = int(lognormal(*params))  # location, scale
        else:
            raise ValueError(f'Invalid fire load density input data - check the form.')
        
        hrr = HRR(self.conf, self._sim_id)
        t_up_to_hrr_peak = int((hrr_peak/self.alpha)**0.5)
        hrr.add_tsquared([0, t_up_to_hrr_peak], self.alpha)
        hrr.add_const([t_up_to_hrr_peak, hrr.sim_time], hrr_peak)
        hrr.fuel_control(load_density * fire_area)
        hrr.firefighting()

        times, hrrs = hrr.get_old_format(plot=False)
        areas = list(npround(npa(hrrs) / hrrpua, 2))
        flashover = t_up_to_hrr_peak if flashover else self.conf['simulation_time']*2

        if fire == self._fire:
            self._psql_log_variables([('fireload', load_density), ('hrrpeak', hrr_peak), ('alpha', self.alpha), ('max_area', fire_area)])

        return times, hrrs, areas, flashover

    def _draw_yields(self, times, flash, fire):
        yields_tab = {'co': [], 'soot': [], 'hcn': []}
        for t in times:
            multiplier = {'soot': 2.5, 'co': 10, 'hcn': 20} if t >= flash else {'soot': 1, 'co': 1, 'hcn': 1}
            [yields_tab[k].append(max([round(normal(v['mean'], v['sd']) * multiplier[k], 5), 0])) for k, v in self._scen_fuel['yields'].items()]      #[g/g]
        if fire == self._fire:
            self._psql_log_variables([('co_yield', mean(yields_tab['co'])),
                                    ('soot_yield', mean(yields_tab['soot'])),
                                    ('hcn_yield', mean(yields_tab['hcn']))])
        return yields_tab
        
    def _draw_fire_table(self, fire):# {{{
        # fire curve
        times, hrrs, areas, flash_time = self._draw_hrr_area_cont_func(fire)

        # gather parameters
        heights = [fire.height] * len(times)  #constant
        yields = self._draw_yields(times, flash_time, fire)
        params = {"TIME": times, "HRR": hrrs, "HEIGHT": heights, "AREA": areas, "CO_YIELD": yields['co'], "SOOT_YIELD": yields['soot'], "HCN_YIELD": yields['hcn']}

        tabl = [{'ID': fire.f_id, 'LABELS': list(params)}]
        
        for step in range(len(params['TIME'])):
            tabl.extend([{'ID': fire.f_id, 'DATA': [params[k][step] for k in params.keys()]}])
            
        return tabl
    def _draw_fires_table(self):
        tabl = []
        for fire in self._fires:
            tabl.extend(self._draw_fire_table(fire))

        self.sections['TABL'] = tabl

# }}}
    def _draw_windows_opening(self): # {{{
        ''' 
        Windows are open / close based on outside temperatures.
        Windows can be full-open (1), quarter-open (0.25) or closed (0).
        If window is closed can be fully opened by reaching temperature or heat flux.
        '''
        windows = []
        outdoor_temp = self.sections['INIT']['EXTERIOR_TEMPERATURE']
        for v in self.s.query("SELECT * FROM aamks_geom WHERE type_tri='WIN' ORDER BY vent_from,vent_to"):
            draw_value = uniform(0, 1)
            win = { "TYPE": 'WALL',
                    "ID": v['name'],
                    "COMP_IDS": [f"'{cfast_name(v['vent_from_name'])}'", f"'{cfast_name(v['vent_to_name'])}'"],
                    "WIDTH": round(v['cfast_width']/100.0, 2),
                    "TOP": round((v['sill']+v['height'])/100.0, 2),
                    "BOTTOM": round(v['sill']/100.0, 2),
                    "OFFSET": round(v['face_offset']/100.0, 2),
                    "FACE": v['face']}
            for i in self.conf['windows']:
                if outdoor_temp > i['min'] and outdoor_temp <= i['max']:
                    if draw_value < i['full']:
                        how_much_open=1 
                        win['CRITERION'] = ["'TIME'", 'T = 0,1', "F = 0,{}".format(how_much_open)]
                    elif draw_value < i['full'] + i['quarter']:
                        how_much_open=0.25 
                        win['CRITERION'] = ["'TIME'", 'T = 0,1', "F = 0,{}".format(how_much_open)]
                    else:
                        how_much_open=0
                        win['CRITERION'] = self.conf['windows_break']['criterion']
                        win['SETPOINT'] = self.conf['windows_break']['setpoint']
                        win['PRE_FRACTION'] = 0
                        win['POST_FRACTION'] = 1
                        win['DEVC_ID'] = f"t_{v['name']}"
            windows.append(win)
            self.s.query(f"UPDATE aamks_geom SET how_much_open={how_much_open} WHERE name='{v['name']}'") 

            if how_much_open and (v['vent_from'] == int(self._fire.f_id[1:]) or v['vent_to'] == int(self._fire.f_id[1:])):
                self._fire_openings.append((v['width']/100, v['height']/100, how_much_open))

            self._psql_log_variable('w',how_much_open)

        self.sections.setdefault('VENT', []).extend(windows)
# }}}
    def _draw_doors_and_holes_opening(self):# {{{
        ''' 
        Door may be open or closed, but Hole is always open and we don't need
        to log that.
        '''
        doors = []
        pre_evac = self.conf['pre_evac']
        if pre_evac['mean'] and pre_evac['sd']:
            # if distribution parameters are given
            first_percentile = round(lognorm_percentiles_from_params(pre_evac['mean'], pre_evac['sd'])[0], 1)
        elif pre_evac['1st'] and pre_evac['99th']:
            # if percentiles are given
            first_percentile = pre_evac['1st']
        else:
            raise ValueError(f'Invalid pre-evacuation time input data - check the form.')
        
        for v in self.s.query("SELECT * FROM aamks_geom WHERE type_tri='DOOR' ORDER BY vent_from, vent_to"):
            vents = self.conf['vents_open']
            v_type = v['type_sec']
            door = { "TYPE": 'WALL',
                    "ID": v['name'],
                    "COMP_IDS": [f"'{cfast_name(v['vent_from_name'])}'", f"'{cfast_name(v['vent_to_name'])}'"],
                    "WIDTH": round(v['cfast_width']/100.0, 2),
                    "TOP": round((v['sill']+v['height'])/100.0, 2),
                    "BOTTOM": round(v['sill']/100.0, 2),
                    "OFFSET": round(v['face_offset']/100.0, 2),
                    "FACE": v['face']}
            
            if v_type=='HOLE':
                how_much_open=1
                door['CRITERION'] = ["'TIME'", f'T = 0', f'F = {how_much_open}']
            else:
                how_much_open=binomial(1,vents[v_type])
                self._psql_log_variable(v_type.lower(),how_much_open)

            times = ",".join(str(x) for x in range(0, self.conf['simulation_time'], 1))
            if how_much_open == 0:
                how_much_open_list = ",".join("0" for _ in range(int(self.conf['simulation_time']/1)))
            else:
                how_much_open_list = ",".join("1" for _ in range(int(self.conf['simulation_time']/1)))

            if 'CRITERION' not in door:
                door['CRITERION'] = ["'TIME'", f'T = {times}', f'F={how_much_open_list}']
            
            doors.append(door)

            self.s.query(f"UPDATE aamks_geom SET how_much_open={how_much_open} WHERE name='{v['name']}'")

            if (v['vent_from'] == int(self._fire.f_id[1:]) or v['vent_to'] == int(self._fire.f_id[1:])):
                self._fire_openings.append((v['width']/100, v['height']/100, how_much_open))
        
        self.sections['DOORS'] = doors
# }}}
    def _draw_vvents_opening(self):# {{{
        self.sections['vvents'] = []
        for v in self.s.query("SELECT distinct v.name, v.room_area, v.type_sec, v.vent_from, v.vent_to, v.vvent_room_seq, v.width, v.depth, (v.x0 - c.x0) + 0.5*v.width as x0, (v.y0 - c.y0) + 0.5*v.depth as y0 FROM aamks_geom v JOIN aamks_geom c on v.vent_to_name = c.name WHERE v.type_sec='VVENT' ORDER BY v.vent_from,v.vent_to"):
            vents = self.conf['vents_open']
            Type = v['type_sec']

            how_much_open=binomial(1,vents[Type])
            self._psql_log_variable(Type.lower(),how_much_open)

            self.sections['vvents'].append((how_much_open, v['name']))

    def _draw_fire_targets(self):
        targets = []
        for fire in self._fires:
            if fire.major != 1:
                targets.append({'ID': fire.devc,
                                'COMP_ID': fire.room, 
                                'LOCATION': [fire.loc_x, fire.loc_y, 0],
                                'TYPE': 'PLATE',
                                'NORMAL': [0., 0., 1.],
                                'TEMPERATURE_DEPTH': 0,
                                'DEPTH_UNITS': 'M'
                                })
        if targets:
            self.sections.setdefault('DEVC', []).extend(targets)
    def _draw_window_and_door_targets(self):
        targets = []
        for v in self.s.query("SELECT v.name, v.vent_from_name, v.vent_to_name, v.face, v.face_offset, v.type_sec, v.width as wwidth, v.depth as wdepth, v.sill, v.height, r.width, r.depth FROM aamks_geom v JOIN aamks_geom r on v.vent_from_name = r.name WHERE v.type_sec='WIN' OR v.type_sec='DOOR'"):
            z = round((v['sill']+v['height']*0.5)/100, 2)
            if v['face'] == 'RIGHT':
                x = 0
                y = round((v['depth']-v['face_offset']-v['wdepth']*0.50)/100, 2)
                normal = [1., 0., 0.]
            if v['face'] == 'LEFT':
                x = v['width']/100
                y = round((v['face_offset']+v['wdepth']*0.5)/100, 2)
                normal = [-1., 0., 0.]
            if v['face'] == 'REAR':
                x = round((v['width']-v['face_offset']-v['wwidth']*0.5)/100, 2)
                y = v['depth']/100
                normal = [0., -1., 0.]
            if v['face'] == 'FRONT':
                x = round((v['face_offset']+v['wwidth']*0.5)/100, 2)
                y = 0
                normal = [0., 1., 0.]

            targets.append({'ID': f"t_{v['name']}",
                            'COMP_ID': cfast_name(v['vent_from_name']),
                            'LOCATION': [x, y, z],
                            'TYPE': 'PLATE',
                            'NORMAL': normal,
                            'TEMPERATURE_DEPTH': 0,
                            'DEPTH_UNITS': 'M'
                            })
            # if v['type_sec'] == 'DOOR':
            #     # find room vent_to_name if vent_to_name is not outside
            #     if v['vent_to_name'] != 'OUTSIDE':
            #         room = self.s.query("SELECT * FROM aamks_geom WHERE name=v['vent_to_name']")
                    # add target t2 on the other side of the door
                       #          targets.append({'ID': f"t2_{v['name']}",
                       # .........
                       #      })

        if targets:
            self.sections.setdefault('DEVC', []).extend(targets)

    def _draw_triggers(self, devc: str):# {{{
        self.sections[devc] = []
        for v in self.s.query(f"SELECT * from aamks_geom WHERE type_pri='COMPA' AND fire_model_ignore!=1 AND {devc}=1"):
            if binomial(1,self.conf[devc]['not_broken']):
                chosen = max(round(normal(self.conf[devc]['mean'], self.conf[devc]['sd']),2), 0)
                try:
                    chosen = [chosen, max(round(normal(self.conf[devc]['density_mean'], self.conf[devc]['density_sd']),10), 0)]
                except KeyError:
                    pass
            else:
                chosen = 0

            self._psql_log_variable(devc,chosen)
            self.sections[devc].append(chosen)
    
    def _draw_connections(self):
        conn = []
        comps = self.s.query(f"SELECT adjacents FROM aamks_geom WHERE name='{self._fire.room}'")[0]['adjacents']
        for comp in comps.split(","):
            comp_name, fraction_to, fraction_from = comp.split(";")
            conn.append({'TYPE': 'WALL', #CEILING, FLOOR or WALL
                        'COMP_ID': self._fire.room,
                        'COMP_IDS': comp_name,
                        'F': float(fraction_to)
                        })
            conn.append({'TYPE': 'WALL',
                        'COMP_ID': comp_name,
                        'COMP_IDS': self._fire.room,
                        'F': float(fraction_from)
                        })
        self.sections['CONN'] = conn
    
    def all(self):
        #&INIT
        self._draw_initial()
        #&FIRE
        self._draw_fires()
        self.__draw_fuel()
        #&VENTS
        self._draw_windows_opening()
        self._draw_doors_and_holes_opening()
        self._draw_vvents_opening()
        #&CHEM
        self._draw_fires_chem()
        #&TABL
        self._draw_fires_table()
        #&CONN
        self._draw_connections()
        #&DEVC
        self._draw_fire_targets()
        self._draw_window_and_door_targets()
        [self._draw_triggers(d) for d in ['heat_detectors', 'smoke_detectors', 'sprinklers']]
        

class HRR:
    def __init__(self, conf, _sim_id):
        self.conf = conf
        self.sim_time = conf['simulation_time']
        self.domains = npa([[.0, float(self.sim_time)]])
        self.functions = npa([[.0, .0, .0]])
        self._sim_id = _sim_id

    def all(self): return {'t': self.domains, 'f': self.functions}    #t = [t0, t1] are time domains for functions f = [c, b, a] for f(t) = at^2 + bt +c

    def _break_domains(self, t, v=False):
        if t[0] > self.sim_time:
            if not v:
                return False
            raise ValueError(f'Lower limit {t[0]} must not be greater than simulation time {self.sim_time}')
        elif t[0] > t[1]:
            if not v:
                return False
            raise ValueError(f'Lower limit must be lower than upper limit {t}')
        elif t[0] == t[1]:
            if not v:
                return False
            raise ValueError(f'Lower and upper limits must not be equal {t}')

        add_i = 0 
        for i, domain in enumerate(self.domains):
            # break the domain in two if necessary (be careful about indexes here)
            for tb in t:
                if domain[0] < tb < domain[1]:
                    self.domains = npins(self.domains, i+add_i+1, [tb, domain[1]], axis=0)
                    self.functions = npins(self.functions, i+add_i+1, self.functions[i+add_i], axis=0)
                    self.domains[i+add_i][1] = tb
                    add_i += 1

    def _update_funcs(self, t, f, v=False):
        if t[0] > self.sim_time:
            if not v:
                return False
            raise ValueError(f'Lower limit {t[0]} must not be greater than simulation time {self.sim_time}')
        elif t[0] > t[1]:
            if not v:
                return False
            raise ValueError(f'Lower limit must be lower than upper limit {t}')
        elif t[0] == t[1]:
            if not v:
                return False
            raise ValueError(f'Lower and upper limits must not be equal {t}')

        for i, domain in enumerate(self.domains):
            # update function if existing domain is in updated function domain
            if t[0] <= domain[0] and domain[1] <= t[1]:
                self.functions[i] += f

    def _check_for_sim_time(self):
        for i, d in enumerate(self.domains):
            if d[0] > self.sim_time:
                self.domains = self.domains[:i]
                self.functions = self.functions[:i]
                return True
            elif d[1] > self.sim_time:
                self._break_domains([self.sim_time,d[1]])
                self.domains = self.domains[:i+1]
                self.functions = self.functions[:i+1]
                return True
        return False
            
    def _check_for_positive(self):
        for i, f in enumerate(self.functions):
            roots = np.roots(f[::-1])
            real_roots = roots[np.isreal(roots)].real
            for r in real_roots:
                if self.domains[i][0] < r < self.domains[i][1]:
                    self.clear([r, self.sim_time])
                    return r 

    def clear(self, domain):
        self._break_domains(domain)
        for i, d in enumerate(self.domains):
            if domain[0] <= d[0] and d[1] <= domain[1]:
                self.functions[i] = [0,0,0]

    def add(self, domain, function):
        new_f = function
        self._break_domains(domain)
        self._update_funcs(domain, function)
                
    def subtract(self, domain, function):
        function *= -1
        self.add(domain, function)

    def add_const(self, domain, const):
        self.add(domain, npa([const, 0, 0]))

    def subtract_const(self, domain, const):
        self.subtract(domain, npa([const, 0, 0]))

    def add_tsquared(self, domain, alpha, rising=True):
        if rising:
            f = npa([alpha * domain[0] ** 2, -2 * alpha * domain[0], alpha])
        else:
            f = npa([alpha * (domain[1]) ** 2, -2 * alpha * (domain[1]), alpha])

        self.add(domain, f)

    def add_inversed_tsquared(self, domain, alpha, rising=True):
        self.add_tsquared(domain, alpha, rising=not rising)

    def subtract_tsquared(self, domain, alpha, rising=True):
        alpha *= -1
        self.add_tsquared(domain, alpha, rising=rising)

    def subtract_inversed_tsquared(self, domain, alpha, rising=True):
        alpha *= -1
        self.add_inversed_tsquared(domain, alpha, rising=rising)

    def _mirror(self, t): 
        self._mirror_functions(self._mirror_domains(t))

    def _mirror_domains(self, t):
        self._break_domains([t, self.sim_time])
        # i - index of the first domain to be changed
        for i, d in enumerate(self.domains):
            if d[0] == t:
                self.domains = self.domains[:i]
                for x in self.domains[::-1]:
                    t_0 = self.domains[-1][1]
                    dt = x[1] - x[0]
                    self.domains = np.append(self.domains, [[t_0, t_0+dt]], axis=0)
                return i

    # i - index of the first domain to be changed
    def _mirror_functions(self, i):
        self.functions = np.vstack((self.functions[:i], np.zeros(self.functions[:i].shape)))
        for j, f in enumerate(self.functions[:i]):
            if f[0]:
                self.add_const(self.domains[-j-1], f[0])
            if f[1]:
                self.add(self.domains[-j-1], [0, -f[1], 0])
            if f[2]:
                self.add_inversed_tsquared(self.domains[-j-1], f[2])
            # HRR functions are limited to second degree 

    def fuel_control(self, fireload):
        def df_dt(f): return npa([n * x**(n-1) for n, x in enumerate(f)])
        # c is initial value always added to the integral of f over d
        def int_d(f, d, c=0): return sum([c] + [x * (d[1]**(n+1)-d[0]**(n+1)) / (n+1) for n, x in enumerate(f)])

        fireload *= 1000 #[kJ]
        
        sum_q = 0
        # iterate over time domains
        for i, domain in enumerate(self.domains):
            new_t = [domain]
            len_t = domain[1] - domain[0]
            while True:
                tot_q = 0
                # iterate over subdomains (whole domain in the first iteration)
                for subdomain in new_t:
                    tot_q += int_d(self.functions[i], subdomain, c=sum_q)
                    if tot_q > fireload/2:
                        # - break (sub)domain where half of fireload is burnt
                        len_t = (subdomain[1] - subdomain[0])/2
                        new_t = [[subdomain[0], subdomain[0] + len_t], [subdomain[1] - len_t, subdomain[1]]]
                        break
                    else:
                        #   - add heat released in the domain to sum
                        sum_q = tot_q
                if len_t < 1:
                    # - mirror if you know exactly where (subdomain's length < 1s)
                    self._mirror(int(new_t[0][1]))
                    break
                elif tot_q > fireload/2:
                    #   - continue the loop until length of subdomain is < 1 s
                    continue
                else:
                    # if less than half of fireload is burnt in the domain:
                    #   - continue to the next domain
                    break
            # break out the domain loop if you already mirrored HRR curve
            if len_t < 1:
                break

    def _nozzle(self, t, q):
        a = uniform(0.1,0.5)    #alpha values to be confirmed
        dt = (q/a)**0.5
        if t >= self.sim_time:
            return False
        elif t + dt >= self.sim_time:
            self.subtract_tsquared([t,self.sim_time], a)
            return True
        else:
            self.subtract_tsquared([t,t+dt], a)
            self.subtract_const([t+dt,self.sim_time], q)
            return True

    def firefighting(self):
        if self.is_rescue():
            rescue_launcher = LaunchRescueModule(self.conf, self._sim_id)
            rescue_launcher.main()
            q_and_t_tuples = rescue_launcher.q_and_t_tuples
            for (time, q) in q_and_t_tuples:
                self._nozzle(time, q)

        self._check_for_sim_time()
        self._check_for_positive()

    def is_rescue(self): 
        # Trying to get rescue parameter which old projects don't have 
        try:
            if self.conf["r_is"] == 'complex':
                return True
            else:
                return False
        except KeyError:
            print("KeyError. is_rescue not set")
            return False
        except ValueError:
            print("ValueError. Wrong value given ")
            return False
        except Exception as e:
            print(f"Error during getting rescue parameter: {e}")
            return False

    
    def _val(self, t, lim=0):
        for i, domain in enumerate(self.domains):
            if any([domain[0] > t or t > domain[1], t == domain[1] and lim>0, t == domain[0] and lim<0]):
                continue
            else:
                return int(sum([j * t ** p for p, j in enumerate(self.functions[i])]))

    def _is_linear(self, f):
        return True if sum(f[2:]) == 0 else False
                
    def get_old_format(self, resolution=5, plot=False):
        def pl(t, hs):
            import matplotlib.pyplot as plt
            plt.plot(t, hs)
            plt.savefig('hrr.png')

        times, hrrs = [], []
        for i, domain in enumerate(self.domains):
            if self._is_linear(self.functions[i]):
                times.extend(domain)
                hrrs.extend([self._val(domain[0], lim=1), self._val(domain[1], lim=-1)])
            else:
                for j in range(int(npround(domain[0])), int(npround(domain[1])), resolution):
                    times.append(j)
                    hrrs.append(self._val(j))

        #CFAST has 199 records limit
        while True:
            if len(times) > 199:
                times, hrrs = self.get_old_format(resolution=resolution*2)
            else:
                break
        pl(times,hrrs) if plot else None
        return times, hrrs


