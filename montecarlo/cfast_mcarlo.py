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
from numpy import full as npf
from numpy import round as npround
from numpy import mean, trapz
from scipy.stats import pareto
from include import Sqlite
from include import Psql
from include import Json
from collections import OrderedDict

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
    
    def _cfast_record(self, key):
        if type(self.samples[key]) == dict:
            record = ''
            for k, v in self.samples[key].items():
                if type(v) == list:
                    record +=  ', '.join([f'{k} = {join2str(v, ", ")}' ]) + ', '
                else:
                    record += join2str([k, v], ' = ', quotes=True) + ', '
            return f'&{key} ' + record[:-2] + ' /\n'
        #&TABL
        elif type(self.samples[key]) == list:
            table = ''
            for i in self.samples[key]:
                record = f'&{key} '
                for k, v in i.items():
                    if k == 'LABELS':
                        record +=  f' {k} = ' + join2str(v, ', ', quotes=True, force=True)
                    elif type(v) == list:
                        record +=  f' {k} = ' + join2str(v, ', ')
                    else:
                        record +=  join2str([k, v], ' = ', quotes=True)
                table += record + '/\n'
            return table

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

    def do_iterations(self):
        self._make_cfast()
        self._write()

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
            self._section_heat_detectors(),
            self._section_smoke_detectors(),
            self._section_sprinklers(),
            '',
            '&TAIL /'
        )

        with open("{}/workers/{}/cfast.in".format(os.environ['AAMKS_PROJECT'],self._sim_id), "w") as output:
            output.write("\n".join(filter(None,txt)))
# }}}
    def _section_preamble(self):# {{{
        txt=(
        f"&HEAD VERSION = 7724, TITLE = 'P_ID_{self.conf['project_id']}_S_ID_{self.conf['scenario_id']}' /",
        f"&TIME SIMULATION = {self.conf['simulation_time']}, PRINT = {self.config['SMOKE_QUERY_RESOLUTION']}, SMOKEVIEW = {self.config['SMOKE_QUERY_RESOLUTION']}, SPREADSHEET = {self.config['SMOKE_QUERY_RESOLUTION']} /",
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
        ''' Randomize how windows are opened/closed. '''
        txt=['!! SECTION WINDOWS']
        for i, v in enumerate(self.s.query("SELECT * FROM aamks_geom WHERE type_tri='WIN' ORDER BY vent_from,vent_to")):
            how_much_open = self.samples['windows'][i][0]
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
            txt.append(', '.join(str(j) for j in collect))

        self.s.executemany('UPDATE aamks_geom SET how_much_open=? WHERE name=?', self.samples['windows'])

        return "\n".join(txt)+"\n" if len(txt)>1 else ""
# }}}
    def _section_doors_and_holes(self):# {{{
        ''' Randomize how doors are opened/close. '''

        txt=['!! SECTION DOORS AND HOLES']
        hvents_setup = self.samples['hvents']
        for i, v in enumerate(self.s.query("SELECT * FROM aamks_geom WHERE type_tri='DOOR' ORDER BY vent_from, vent_to")):
            how_much_open = self.samples['hvents'][i][0]
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
            txt.append(', '.join(str(j) for j in collect))

        self.s.executemany('UPDATE aamks_geom SET how_much_open=? WHERE name=?', hvents_setup)

        return "\n".join(txt)+"\n" if len(txt)>1 else ""
# }}}
    def _section_vvent(self):# {{{
        # VVENT AREA, SHAPE, INITIAL_FRACTION
        txt=['!! SECTION NATURAL VENT']
        for i, v in enumerate(self.s.query("SELECT distinct v.name, v.room_area, v.type_sec, v.vent_from_name, v.vent_to_name, v.vvent_room_seq, v.width, v.depth, (v.x0 - c.x0) + 0.5*v.width as x0, (v.y0 - c.y0) + 0.5*v.depth as y0 FROM aamks_geom v JOIN aamks_geom c on v.vent_to_name = c.name WHERE v.type_sec='VVENT' ORDER BY v.vent_from,v.vent_to")):
            how_much_open = self.samples['vvents'][i][0]           # end state with probability of working
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

            txt.append(', '.join(str(j) for j in collect))

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
            collect.append("OFFSETS = {}, {}".format(round(v['x0']/100.0, 2), round(v['y0']/100.0, 2)))
            # TODO add detection time to running mechanical ventilation
            activation_delay = self.conf['NSHEVS']['activation_time']
            start_up = self.conf['NSHEVS']['startup_time']
            collect.append(f"CRITERION = 'TIME' T = {activation_delay},{activation_delay+start_up} F = 0,1 /")
            txt.append(', '.join(str(i) for i in collect))
        return "\n".join(txt)+"\n" if len(txt) > 1 else ""

    def _deterministic_fire(self):# {{{
        '''
        Either deterministic fire from Apainter, or probabilistic (_draw_fire_origin()). 
        '''
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

        return ', '.join(str(i) for i in collect)
# }}}
    def _section_fire(self):# {{{
        if len(self.s.query("SELECT * FROM aamks_geom WHERE type_pri='FIRE'")) > 0:
            fire_preamble = self._deterministic_fire()
        else:
            fire_preamble = self._cfast_record('FIRE')

        txt = (
            '!! SECTION FIRE',
            '\n',
            fire_preamble,
            self._cfast_record('CHEM'),
            self._cfast_record('TABL'),
            ''
        )
        return "".join(txt)+"\n"
# }}}
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
        for v in self.s.query("SELECT * from aamks_geom WHERE type_pri='COMPA' AND fire_model_ignore!=1 AND sprinklers=1"):
            try:
                temp, dens = self.samples['sprinklers']    # ACTIVATION_TEMPERATURE,
            except ValueError:
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
            pairs.append("{}='{}'".format(k,','.join(str(x) for x in v )))
        data=', '.join(pairs)

        self.p.query("UPDATE simulations SET {} WHERE project=%s AND scenario_id=%s AND iteration=%s".format(data), (self.conf['project_id'], self.conf['scenario_id'], self._sim_id))

#}}}


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
             'dcloser', 'door', 'sprinklers', 'heat_of_combustion', 'delectr', 'vvent', 'rad_frac']

    def __init__(self, sim_id):
        self.json = Json()
        self.__read_json()
        self.__connectDB(sim_id)
        self.config = self.json.read(os.path.join(os.environ['AAMKS_PATH'], 'evac', 'config.json'))
        self._scen_fuel = {}
        self._fire_id = ''
        self._fire_height = 0
        self._comp_type = ''

        self.sections = {}


    def __read_json(self):
        self.conf=self.json.read("{}/conf.json".format(os.environ['AAMKS_PROJECT']))
        return self.conf['project_id']

    def __connectDB(self, sim_id):
        self._sim_id = sim_id
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

        return self.sections['INIT']
# }}}
    '''&FIRE'''
    def _save_fire_origin(self, fire_origin):# {{{
        fire_origin.append(self._sim_id)
        fire_origin = fire_origin[:2] + fire_origin[2] + fire_origin[4:]
        self.s.query('INSERT INTO fire_origin VALUES (?,?,?,?,?,?,?,?)', fire_origin)
        fr=self.s.query('SELECT * FROM fire_origin WHERE sim_id={}'.format(self._sim_id))
        self._psql_log_variables([('fireorigname', fire_origin[0]),
                                      ('fireorig', fire_origin[1])])
# }}}
    def _draw_compartment(self):
        # find fire compartment
        is_origin_in_room = binomial(True, self.conf['fire_starts_in_a_room'])
        all_corridors_and_halls = [z['name'] for z in self.s.query("SELECT name FROM aamks_geom WHERE type_pri='COMPA' AND fire_model_ignore!=1 AND type_sec in('COR','HALL') ORDER BY global_type_id") ]
        all_rooms = [z['name'] for z in self.s.query("SELECT name FROM aamks_geom WHERE type_sec='ROOM' ORDER BY global_type_id") ]

        comp = {}
        if is_origin_in_room or not all_corridors_and_halls:
            comp['name'] = str(choice(all_rooms))
            comp['type'] = 'room'
        else:
            comp['name'] = str(choice(all_corridors_and_halls))
            comp['type'] = 'non_room'
        self._comp_type = comp['type']

        return comp
    
    def _locate_in_the_middle(self, fire_room):
        location = {}
        # locate fire in compartment
        compa = self.s.query("SELECT * FROM aamks_geom WHERE name=?", (fire_room, ))[0]

        # [WK] why not random but in the middle?
        x=int(compa['x0']+compa['width']/2.0)
        y=int(compa['y0']+compa['depth']/2.0)
        self._fire_height = round((compa['height'] * (1-math.log10(uniform(1,9)))) / 100, 2)
        z = int(self._fire_height * 100) + compa['height'] * int(compa['floor'])

        location['global'] = [x,y,z]    #[cm]
        location['local'] = [round(lc/100, 2) for lc in [int(compa['width']/2), int(compa['depth']/2)]]   #[m]
        location['floor'] = compa['floor']
        location['fire_id'] = "f{}".format(compa['global_type_id'])
        self._fire_id = location['fire_id']

        self._psql_log_variable('heigh', self._fire_height)

        return location

    def _draw_fire_preamble(self):# {{{
        comp = self._draw_compartment() 
        loc = self._locate_in_the_middle(comp['name'])
        self._save_fire_origin([comp['name'], comp['type']] + list(loc.values()))

        # save in CFAST dict
        self.sections['FIRE'] = {"ID": loc['fire_id'],
                                "COMP_ID": comp['name'],
                                "FIRE_ID": loc['fire_id'],
                                "LOCATION": loc['local']}

        return self.sections['FIRE']
# }}}
    '''&CHEM'''
    def __draw_fuel(self):
        if self.conf['fuel'] == 'random':
            self._scen_fuel = self.FUELS[choice(list(self.FUELS))]
        elif self.conf['fuel'] == 'user':
            self._scen_fuel = {k: self.conf[k] for k in self.FUELS['WOOD'].keys()}
        else:
            self._scen_fuel = self.FUELS[self.conf['fuel']]

    def _draw_fire_chem(self):# {{{
        if not self._scen_fuel:
            self.__draw_fuel()

        heat_of_combustion = round(normal(self._scen_fuel['heatcom']['mean'], self._scen_fuel['heatcom']['sd']), 0)     #[MJ/kg]
        rad_frac = round(gamma(self.conf['radfrac']['k'], self.conf['radfrac']['theta']), 3)#TODO LOW VARIABILITY, CHANGE DIST

        self.sections['CHEM'] = {'ID': self.sections['FIRE']['FIRE_ID'],
                'HEAT_OF_COMBUSTION': heat_of_combustion * 1000, 
                'RADIATIVE_FRACTION': rad_frac}
        for spec, s_value in self._scen_fuel['molecule'].items():
            self.sections['CHEM'][spec] = s_value

        self._psql_log_variables([('heat_of_combustion', heat_of_combustion),
                                            ('rad_frac', rad_frac)])#,
                                                #('fuel', self._scen_fuel)])  #[MJ/kg], [-], [string]
        return self.sections['CHEM']
# }}}
    '''&TABL'''
    def _draw_fire_maxarea(self):
        '''
        Fire area is draw from pareto distrubution regarding the BS PD-7974-7. 
        There is lack of vent condition - underventilated fires
        '''
        orig_area = math.prod([dim * 2 for dim in self.sections['FIRE']['LOCATION']]) #[m2]
        p = pareto(b=self.conf['fire_area']['b'], scale=self.conf['fire_area']['scale'])
        fire_area = round(p.rvs(size=1)[0], 2)
        if fire_area > orig_area:
            fire_area = orig_area
        return fire_area

    def _fuel_control(self, times, hrrs, fire_area):
        fire_load_d = self.conf['fire_load'][self._comp_type] # [MJ/m2]
        load_density = int(lognormal(fire_load_d['mean'], fire_load_d['sd']))  # location, scale
        print(f'{load_density} MJ/m2 {self._comp_type}')
        fire_load = load_density * fire_area * 1000 #[kW]

        q = 0
        i_sym = 0
        prev = [0, 0]
        # trapezoidal integration rule
        for i in range(1, len(times)):
            dt = times[i] - prev[0]
            dq = (hrrs[i] + prev[1]) * dt / 2
            q += dq
            if q > fire_load / 2:
                i_sym = i
                break

        # limit HRR if fuel-controlled
        if i_sym:
            times = times[:i_sym+1] # ascending
            times += [2 * times[-1] - t for t in reversed(times)][:-1] # descending
            hrrs = hrrs[:i_sym+1] + list(reversed(hrrs[:i_sym]))

        return times, hrrs

    def _draw_hrr_area(self):
        '''
        Generate fire. Alpha t square on the left, then constant in the
        middle, then fading on the right. At the end read hrrs at given times.
        '''
        hrrpua_d = self.conf['hrrpua']    # [kW/m2]
        hrr_alpha = self.conf['hrr_alpha']    # [kW/s2]
        fire_area = self._draw_fire_maxarea()

        hrrpua = int(triangular(hrrpua_d['min'], hrrpua_d['mode'], hrrpua_d['max']))
        self.alpha = triangular(hrr_alpha['min'], hrr_alpha['mode'], hrr_alpha['max'])
        hrr_peak = int(hrrpua * fire_area)
        

        # left
        t_up_to_hrr_peak = int((hrr_peak/self.alpha)**0.5)
        interval = int(round(t_up_to_hrr_peak/10))
        if interval == 0:
            interval = 10
        times0 = list(range(0, t_up_to_hrr_peak, interval)) + [t_up_to_hrr_peak]
        hrrs0 = [int((self.alpha * t ** 2)) for t in times0]
        hrrs0[-1] = hrr_peak

        # middle
        # TODO to be fire load dependent
        t_up_to_starts_dropping = 15 * 60
        times1 = [t_up_to_starts_dropping]
        hrrs1 = [hrr_peak]
        times1 = []
        hrrs1 = []

        # right
        t_up_to_drops_to_zero=t_up_to_starts_dropping+t_up_to_hrr_peak
        interval = int(round((t_up_to_drops_to_zero - t_up_to_starts_dropping)/10))
        if interval == 0:
            interval = 10
        times2 = list(reversed(npf(len(times0), t_up_to_starts_dropping + max(times0)) - npa(times0)))
        hrrs2 = list(reversed(hrrs0))


        times = list(times0 + times1 + times2)
        hrrs = list(hrrs0 + hrrs1 + hrrs2)
        times, hrrs = self._fuel_control(times, hrrs, fire_area)   # limit acc. to fire load
        areas = list(npround(npa(hrrs) / hrr_peak * fire_area, 2))
        self._psql_log_variables([('hrrpeak', hrr_peak), ('alpha', self.alpha), ('max_area', fire_area)])

        return times, hrrs, areas, t_up_to_hrr_peak

    def _draw_yields(self, times, flash):
        yields_tab = {'co': [], 'soot': [], 'hcn': []}
        for t in times:
            multiplier = {'soot': 2.5, 'co': 10, 'hcn': 20} if t > flash else {'soot': 1, 'co': 1, 'hcn': 1}
            [yields_tab[k].append(max([round(normal(v['mean'], v['sd']) * multiplier[k], 5), 0])) for k, v in self._scen_fuel['yields'].items()]      #[g/g]

        self._psql_log_variables([('co_yield', mean(yields_tab['co'])),
                                ('soot_yield', mean(yields_tab['soot'])),
                                 ('hcn_yield', mean(yields_tab['hcn']))])
        return yields_tab
        
    def _draw_fire_table(self):# {{{
        # fire curve
        times, hrrs, areas, fully_dev_time = self._draw_hrr_area()

        # gather parameters
        heights = [self._fire_height] * len(times)  #constant
        yields = self._draw_yields(times, fully_dev_time)
        params = {"TIME": times, "HRR": hrrs, "HEIGHT": heights, "AREA": areas, "CO_YIELD": yields['co'], "SOOT_YIELD": yields['soot'], "HCN_YIELD": yields['hcn']}

        self.sections['TABL'] = [{'ID': self._fire_id, 'LABELS': list(params)}]
        
        for step in range(len(params['TIME'])):
            self.sections['TABL'].extend([{'ID': self._fire_id, 'DATA': [params[k][step] for k in params.keys()]}])
            
        return self.sections['TABL']
# }}}
    def _draw_windows_opening(self): # {{{
        ''' 
        Windows are open / close based on outside temperatures but even
        still, there's a distribution of users willing to open/close the
        windows. Windows can be full-open (1), quarter-open (0.25) or closed
        (0). 
        '''
        self.sections['windows'] = []
        outdoor_temp = self.sections['INIT']['EXTERIOR_TEMPERATURE']
        for v in self.s.query("SELECT * FROM aamks_geom WHERE type_tri='WIN' ORDER BY vent_from,vent_to"):
            draw_value = uniform(0, 1)
            how_much_open = 0
            for i in self.conf['windows']:
                if outdoor_temp > i['min'] and outdoor_temp <= i['max']:
                    if draw_value < i['full']:
                        how_much_open=1 
                    elif draw_value < i['full'] + i['quarter']:
                        how_much_open=0.25 
                    else:
                        how_much_open=0 
            self.sections['windows'].append((how_much_open, v['name']))

            self._psql_log_variable('w',how_much_open)

        return self.sections['windows']
        
# }}}
    def _draw_doors_and_holes_opening(self):# {{{
        ''' 
        Door may be open or closed, but Hole is always open and we don't need
        to log that.
        '''
        self.sections['hvents'] = []
        for v in self.s.query("SELECT * FROM aamks_geom WHERE type_tri='DOOR' ORDER BY vent_from, vent_to"):
            vents = self.conf['vents_open']
            Type = v['type_sec']

            if Type=='HOLE':
                how_much_open=1
            else:
                how_much_open=binomial(1,vents[Type])
                self._psql_log_variable(Type.lower(),how_much_open)

            self.sections['hvents'].append((how_much_open, v['name']))

        return self.sections['hvents']
# }}}
    def _draw_vvents_opening(self):# {{{
        self.sections['vvents'] = []
        for v in self.s.query("SELECT distinct v.name, v.room_area, v.type_sec, v.vent_from_name, v.vent_to_name, v.vvent_room_seq, v.width, v.depth, (v.x0 - c.x0) + 0.5*v.width as x0, (v.y0 - c.y0) + 0.5*v.depth as y0 FROM aamks_geom v JOIN aamks_geom c on v.vent_to_name = c.name WHERE v.type_sec='VVENT' ORDER BY v.vent_from,v.vent_to"):
            vents = self.conf['vents_open']
            Type = v['type_sec']

            how_much_open=binomial(1,vents[Type])
            self._psql_log_variable(Type.lower(),how_much_open)

            self.sections['vvents'].append((how_much_open, v['name']))

        return self.sections['vvents']

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

        return self.sections[devc]
    
    def all(self):
        #&INIT
        self._draw_initial()
        #&FIRE
        self._draw_fire_preamble()
        self.__draw_fuel()
        #&CHEM
        self._draw_fire_chem()
        #&TABL
        self._draw_fire_table()
        #&VENTS
        self._draw_windows_opening()
        self._draw_doors_and_holes_opening()
        self._draw_vvents_opening()
        #&DEVC
        [self._draw_triggers(d) for d in ['heat_detectors', 'smoke_detectors', 'sprinklers']]
        
