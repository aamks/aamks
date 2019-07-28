# MODULES {{{
import sys
import re
import os
import shutil
import math
from collections import OrderedDict
import json
import getopt
from pprint import pprint
import codecs
from subprocess import Popen,call

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

from include import Sqlite
from include import Psql
from include import Json
from include import Dump as dd
from include import SimIterations

# }}}

class CfastMcarlo():
    def __init__(self):# {{{
        ''' Generate montecarlo cfast.in. Log what was drawn to psql. '''

        self.json=Json()
        self.conf=self.json.read("{}/conf.json".format(os.environ['AAMKS_PROJECT']))
        if self.conf['fire_model']=='FDS':
            return
        self.s=Sqlite("{}/aamks.sqlite".format(os.environ['AAMKS_PROJECT']))
        self.p=Psql()
        self._psql_collector=OrderedDict()
        self.s.query("CREATE TABLE fire_origin(name,is_room,x,y,z,floor,sim_id)")

        si=SimIterations(self.conf['project_id'], self.conf['number_of_simulations'])
        for self._sim_id in range(*si.get()):
            seed(self._sim_id)
            self._new_psql_log()
            self._make_cfast()
            self._write()
# }}}

# DISTRIBUTIONS / DRAWS
    def _draw_outdoor_temp(self):# {{{
        outdoor_temp=round(normal(self.conf['outdoor_temperature']['mean'],self.conf['outdoor_temperature']['sd']),2)
        self._psql_log_variable('outdoort',outdoor_temp)
        return outdoor_temp
# }}}
    def _save_fire_origin(self, fire_origin):# {{{
        fire_origin.append(self._sim_id)
        self.s.query('INSERT INTO fire_origin VALUES (?,?,?,?,?,?,?)', fire_origin)

        self._psql_log_variable('fireorigname',fire_origin[0])
        self._psql_log_variable('fireorig',fire_origin[1])
# }}}
    def _draw_fire_origin(self):# {{{
        is_origin_in_room=binomial(1,self.conf['fire_starts_in_a_room'])
        
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
        x=round(compa['x0']/100+compa['width']/(2.0*100),2)
        y=round(compa['y0']/100+compa['depth']/(2.0*100),2)
        z=round(compa['height']/100.0 * (1-math.log10(uniform(1,10))),2)

        fire_origin+=[x,y,z]
        fire_origin+=[compa['floor']]
        self._save_fire_origin(fire_origin)

        collect=('FIRE', compa['global_type_id'], round(compa['width']/(2.0*100),2), round(compa['depth']/(2.0*100),2), z, 1, 'TIME' ,'0','0','0','0','medium')
        return (','.join(str(i) for i in collect))

# }}}
    def _fire_origin(self):# {{{
        '''
        Either deterministic fire from Apainter, or probabilistic (_draw_fire_origin()). 
        '''

        if len(self.s.query("SELECT * FROM aamks_geom WHERE type_pri='FIRE'")) > 0:
            z=self.s.query("SELECT * FROM aamks_geom WHERE type_pri='FIRE'")
            i=z[0]
            x=i['center_x']/100.0
            y=i['center_y']/100.0
            z=(i['z1']-i['z0'])/100.0
            room=self.s.query("SELECT floor,name,type_sec,global_type_id FROM aamks_geom WHERE floor=? AND type_pri='COMPA' AND fire_model_ignore!=1 AND x0<=? AND y0<=? AND x1>=? AND y1>=?", (i['floor'], i['x0'], i['y0'], i['x1'], i['y1']))
            if room[0]['type_sec'] in ('COR','HALL'):
                fire_origin=[room[0]['name'], 'non_room', x, y, z, room[0]['floor']]
            else:
                fire_origin=[room[0]['name'], 'room', x, y , z,  room[0]['floor']]
            self._save_fire_origin(fire_origin)
            collect=('FIRE', room[0]['global_type_id'], x, y, z, 1, 'TIME' ,'0','0','0','0','medium')
            cfast_fire=(','.join(str(i) for i in collect))
        else:
            cfast_fire=self._draw_fire_origin()

        return cfast_fire
# }}}
    def _draw_fire_properties(self,intervals):# {{{
        i              = OrderedDict()
        i['coyield']   = round(uniform(0.01,0.043),3)
        i['sootyield'] = round(uniform(0.11,0.17),3)
        i['trace']     = 0
        i['q_star']    = round(uniform(0.5,2),3)
        i['heigh']     = 0
        i['radfrac']   = round(gamma(124.48,0.00217),3)
        i['heatcom']   = round(uniform(16400000,27000000),1)
        for k,v in i.items():
            self._psql_log_variable(k,v)

        result=OrderedDict()
        result['sootyield']='SOOT,{}'.format(','.join([str(i['sootyield'])]*intervals))
        result['coyield']='CO,{}'.format(','.join([str(i['coyield'])]*intervals))
        result['trace']='TRACE,{}'.format(','.join([str(i['trace'])]*intervals))
        result['q_star']=i['q_star']
        result['heigh']='HEIGH,{}'.format(','.join([str(i['heigh'])]*intervals))
        result['radfrac']=str(i['radfrac'])
        result['heatcom']=str(i['heatcom'])
        return result
# }}}
    def _draw_fire_development(self): # {{{
        ''' 
        Generate fire. Alpha t square on the left, then constant in the
        middle, then fading on the right. At the end read hrrs at given times.
        '''

        hrrpua=self.conf['hrrpua']
        hrr_alpha=self.conf['hrr_alpha']
        #'TODO:' HRR_PEAK is calculated as if each room was 10 m2, by HRRPUA times 10. It should be better addressed, by choosing room area and vent characteristics

        hrr_peak=int(triangular(hrrpua['min'] , hrrpua['mode']    , hrrpua['max']) * 10000)
        alpha=int(triangular(hrr_alpha['min'] , hrr_alpha['mode'] , hrr_alpha['max'])*1000)

        self._psql_log_variable('hrrpeak',hrr_peak/1000)
        self._psql_log_variable('alpha',alpha/1000.0)

        # left
        t_up_to_hrr_peak=int((hrr_peak/alpha)**0.5)
        interval=int(round(t_up_to_hrr_peak/10))
        times0=list(range(0, t_up_to_hrr_peak, interval))+[t_up_to_hrr_peak]
        hrrs0=[ int((alpha * t ** 2)) for t in times0 ]

        # middle
        t_up_to_starts_dropping=15 * 60
        times1=[t_up_to_starts_dropping]
        hrrs1=[hrr_peak]

        # right
        t_up_to_drops_to_zero=t_up_to_starts_dropping+t_up_to_hrr_peak
        interval=int(round((t_up_to_drops_to_zero - t_up_to_starts_dropping)/10))
        times2=list(range(t_up_to_starts_dropping, t_up_to_drops_to_zero, interval))+[t_up_to_drops_to_zero]
        hrrs2=[ int((alpha * (t - t_up_to_drops_to_zero) ** 2 )) for t in times2 ]

        times=list(times0 + times1 + times2)
        hrrs=list(hrrs0 + hrrs1 + hrrs2)

        return (times, hrrs)


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
            self._section_preamble(outdoor_temp),
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
    def _section_preamble(self,outdoor_temp):# {{{
        ''' 
        We use 600 as time, since Cfast will be killed by aamks. 
        '''

        txt=(
        'VERSN,7,{}_{}'.format('SIM', self.conf['project_id']),
        'TIMES,{},-120,10,10'.format(self.conf['simulation_time']),
        'EAMB,{},101300,0'.format(273+outdoor_temp),
        'TAMB,293.15,101300,0,50',
        'DTCHECK,1.E-9,100',
        '',
        )
        return "\n".join(txt)

# }}}
    def _section_matl(self):# {{{
        txt=(
        '!! MATL,name,param1,param2,param3,param4,param5,param6',
        'MATL,concrete,1.7,840,2500,0.4,0.9,concrete',
        'MATL,gypsum,0.3,1000,1000,0.02,0.85,gipsum',
        'MATL,glass,0.8,840,2500,0.013,0.9,glass',
        'MATL,block,0.3,840,800,0.03,0.85,floor',
        'MATL,brick,0.3,840,800,0.03,0.85,brick',
        '',
        )
        return "\n".join(txt)
# }}}
    def _section_compa(self):# {{{
        txt=['!! COMPA,name,width,depth,height,x,y,z,matl_ceiling,matl_floor,matl_wall']
        for v in self.s.query("SELECT * from aamks_geom WHERE type_pri='COMPA' AND fire_model_ignore!=1 ORDER BY global_type_id"):
            collect=[]
            collect.append('COMPA')                    # COMPA
            collect.append(v['name'])                  # NAME
            collect.append(round(v['width']/100.0,2))  # WIDTH
            collect.append(round(v['depth']/100.0,2))  # DEPTH
            collect.append(round(v['height']/100.0,2)) # INTERNAL_HEIGHT
            collect.append(round(v['x0']/100.0,2))     # ABSOLUTE_X_POSITION
            collect.append(round(v['y0']/100.0,2))     # ABSOLUTE_Y_POSITION
            collect.append(round(v['z0']/100.0,2))     # ABSOLUTE_Z_POSITION
            collect.append(v['material_ceiling'])      # CEILING_MATERIAL_NAME
            collect.append(v['material_floor'])        # FLOOR_MATERIAL_NAME
            collect.append(v['material_wall'])         # WALL_MATERIAL_NAME
            txt.append(','.join(str(i) for i in collect))

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
        txt=['!! WINDOWS, from,to,id,width,soffit,sill,offset,face,open']
        windows_setup=[]
        for v in self.s.query("SELECT * FROM aamks_geom WHERE type_tri='WIN' ORDER BY vent_from,vent_to"):
            collect=[]
            collect.append('HVENT')                                # HVENT
            collect.append(v['vent_from'])                         # COMPARTMENT1
            collect.append(v['vent_to'])                           # COMPARTMENT2
            collect.append(v['hvent_room_seq'])                    # HVENT_NUMBER
            collect.append(round(v['cfast_width']/100.0,2))        # WIDTH
            collect.append(round((v['sill']+v['height'])/100.0,2)) # SOFFIT (height of the top of the hvent relative to the floor)
            collect.append(round(v['sill']/100.0,2))               # SILL
            collect.append(round(v['face_offset']/100.0,2))        # COMPARTMENT1_OFFSET
            collect.append(v['face'])                              # FACE
            how_much_open=self._draw_window_opening(outdoor_temp)  
            windows_setup.append((how_much_open, v['name']))
            collect.append(how_much_open)  
            txt.append(','.join(str(i) for i in collect))

        self.s.executemany('UPDATE aamks_geom SET how_much_open=? WHERE name=?', windows_setup)

        return "\n".join(txt)+"\n" if len(txt)>1 else ""
# }}}
    def _section_doors_and_holes(self):# {{{
        ''' Randomize how doors are opened/close. '''

        txt=['!! DOORS, from,to,id,width,soffit,sill,offset,face,open']
        hvents_setup=[]
        for v in self.s.query("SELECT * FROM aamks_geom WHERE type_tri='DOOR' ORDER BY vent_from,vent_to"):
            collect=[]
            collect.append('HVENT')                                       # HVENT
            collect.append(v['vent_from'])                                # COMPARTMENT1
            collect.append(v['vent_to'])                                  # COMPARTMENT2
            collect.append(v['hvent_room_seq'])                           # VENT_NUMBER
            collect.append(round(v['cfast_width']/100.0,2))               # WIDTH
            collect.append(round((v['sill']+v['height'])/100.0,2))        # SOFFIT (height of the top of the hvent relative to the floor)
            collect.append(round(v['sill']/100.0,2))                      # SILL
            collect.append(round(v['face_offset']/100.0,2))               # COMPARTMENT1_OFFSET
            collect.append(v['face'])                                     # FACE
            how_much_open=self._draw_door_and_hole_opening(v['type_sec']) # HOLE_CLOSE
            hvents_setup.append((how_much_open, v['name']))
            collect.append(how_much_open)  
            txt.append(','.join(str(i) for i in collect))

        self.s.executemany('UPDATE aamks_geom SET how_much_open=? WHERE name=?', hvents_setup)

        return "\n".join(txt)+"\n" if len(txt)>1 else ""
# }}}
    def _section_vvent(self):# {{{
        # VVENT AREA, SHAPE, INITIAL_FRACTION
        txt=['!! VVENT,top,bottom,id,area,shape,rel_type,criterion,target,i_time, i_frac, f_time, f_frac, offset_x, offset_y']
        #for v in self.s.query("SELECT distinct v.room_area, v.type_sec, v.vent_from, v.vent_to, v.vvent_room_seq, v.width, v.depth, (v.x0 - c.x0) + 0.5*v.width as x0, (v.y0 - c.y0) + 0.5*v.depth as y0 FROM aamks_geom v JOIN aamks_geom c on v.vent_to_name = c.name WHERE v.type_pri='VVENTS' AND c.type_pri = 'COMPA' ORDER BY v.vent_from,v.vent_to"):
        for v in self.s.query("SELECT distinct v.room_area, v.type_sec, v.vent_from, v.vent_to, v.vvent_room_seq, v.width, v.depth, (v.x0 - c.x0) + 0.5*v.width as x0, (v.y0 - c.y0) + 0.5*v.depth as y0 FROM aamks_geom v JOIN aamks_geom c on v.vent_to_name = c.name WHERE v.type_sec='VVENT' ORDER BY v.vent_from,v.vent_to"):
            collect=[]
            collect.append('VVENT')                                         # VVENT AREA, SHAPE, INITIAL_FRACTION
            collect.append(v['vent_from'])                                  # COMPARTMENT1
            collect.append(v['vent_to'])                                    # COMPARTMENT2
            collect.append(v['vvent_room_seq'])                             # VENT_NUMBER
            collect.append(round((v['width']*v['depth'])/1e4, 2))           # AREA OF THE ROOM, feb.2018: previously: round((v['width']*v['depth'])/1e4, 2)
            collect.append(2)                                               # Type of dumper 1 - round, 2 - squere
            collect.append('TIME')                                          # Type of realease
            collect.append('')                                              # empty for time release
            collect.append('')                                              # empty for time release
            collect.append(60)                                              # start work on time 
            collect.append(0)                                               # intial state before triggering 
            collect.append(120)                                             # end work on time 
            #collect.append(1)           # end state with probability of working 
            collect.append(self._draw_door_and_hole_opening(v['type_sec']))           # end state with probability of working 
            collect.append(round(v['x0']/100,2))                             # Offset_x
            collect.append(round(v['y0']/100,2))                             # Offset_y


            txt.append(','.join(str(i) for i in collect))

        return "\n".join(txt)+"\n" if len(txt)>1 else ""
# }}}
    def _section_mvent(self):# {{{
        # VVENT AREA, SHAPE, INITIAL_FRACTION
        txt=['!!VVENT,first_comp,second_comp,id,orientation1,height_in,area_in,orientation2,height_out,area_out,flowm3/s,press_l,press_u,release,nix,nix,initial_time,initial_fraction,final_time,final_fraction']
        collect=[]
        #collect.append('MVENT,28,35,1,V,2.3,0.48,H,3,0.48,1.7,200,300,TIME,,,60,0,70,1,1,1')
        #collect.append('MVENT,28,35,2,V,2.3,0.48,H,3,0.48,1.7,200,300,TIME,,,60,0,70,1,2.5,1')
        #collect.append('MVENT,35,28,3,V,2.3,0.48,H,3,0.48,1.7,200,300,TIME,,,60,0,70,1,10,1')
        #collect.append('MVENT,35,28,4,V,2.3,0.48,H,3,0.48,1.7,200,300,TIME,,,60,0,70,1,11,1')
        #collect.append('MVENT,30,35,1,V,2.3,0.48,H,3,0.48,1.7,200,300,TIME,,,60,0,70,1,1,1')
        #collect.append('MVENT,31,35,2,V,2.3,0.48,H,3,0.48,1.7,200,300,TIME,,,60,0,70,1,1,1')
        #collect.append('MVENT,35,30,3,V,2.3,0.48,H,3,0.48,1.7,200,300,TIME,,,60,0,70,1,1,4')
        #collect.append('MVENT,35,31,4,V,2.3,0.48,H,3,0.48,1.7,200,300,TIME,,,60,0,70,1,2,1')
        txt.append('\n'.join(str(i) for i in collect))

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
    def _fire_obstacle(self):# {{{
        '''
        Fire Obstacle prevents humans to walk right through the fire. Currently
        we build the rectangle xx * yy around x,y. Perhaps this size could be
        some function of fire properties.
        '''

        xx=150
        yy=150

        z=self.s.query("SELECT * FROM fire_origin") 
        i=z[0]
        i['x']=int(i['x'] * 100)
        i['y']=int(i['y'] * 100)
        i['z']=int(i['z'] * 100)

        points=[ [i['x']-xx, i['y']-yy, 0], [i['x']+xx, i['y']-yy, 0], [i['x']+xx, i['y']+yy, 0], [i['x']-xx, i['y']+yy, 0], [i['x']-xx, i['y']-yy, 0] ]

        obstacles=self.json.readdb("obstacles")
        obstacles['fire']={ i['floor']: points }
        self.s.query("UPDATE obstacles SET json=?", (json.dumps(obstacles),)) 

# }}}
    def _section_fire(self):# {{{
        times, hrrs=self._draw_fire_development()
        fire_properties = self._draw_fire_properties(len(times))
        fire_origin=self._fire_origin()
        self._fire_obstacle()
        area = (((npa(hrrs)/1000)/(fire_properties['q_star'] * 1.204 * 1.005 * 293 * sqrt(9.81))) ** (2/5)) + 0.0001
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
        self.p.query("UPDATE simulations SET {} WHERE project=%s AND iteration=%s".format(data), (self.conf['project_id'], self._sim_id))

#}}}

