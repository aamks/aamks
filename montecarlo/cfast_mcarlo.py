# MODULES {{{
import sys
import re
import os
import shutil
import math
from collections import OrderedDict
import psycopg2
import psycopg2.extras # needed? 
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

        self.s=Sqlite("{}/aamks.sqlite".format(os.environ['AAMKS_PROJECT']))
        self.p=Psql()
        self.json=Json()
        self.conf=self.json.read("{}/conf_aamks.json".format(os.environ['AAMKS_PROJECT']))
        self.dists=self.json.read("{}/distributions.json".format(os.environ['AAMKS_PROJECT']))
        self._psql_collector=OrderedDict()

        si=SimIterations(self.conf['PROJECT_NAME'], self.conf['NUMBER_OF_SIMULATIONS'])
        for self._sim_id in range(*si.get()):
            seed(self._sim_id)
            self._new_psql_log()
            self._make_cfast()
            self._write()
# }}}

# DISTRIBUTIONS / DRAWS
    def _draw_outdoor_temp(self):# {{{
        mean,std_dev=self.dists['outdoor_temperature']['mean_and_sd']
        outdoor_temp=round(normal(mean,std_dev),2)
        self._psql_log_variable('outdoort',outdoor_temp)
        return outdoor_temp
# }}}
    def _draw_fire(self):# {{{
        origin_in_room=binomial(1,self.dists['building_category'][self.conf['BUILDING_CATEGORY']]['origin_of_fire']['fire_starts_in_room_probability'])
        
        self.all_corridors_and_halls=[z['name'] for z in self.s.query("SELECT name FROM aamks_geom WHERE type_pri='COMPA' and type_sec in('COR','HALL') ORDER BY name") ]
        self.all_rooms=[z['name'] for z in self.s.query("SELECT name FROM aamks_geom WHERE type_sec='ROOM' ORDER BY name") ]
        if origin_in_room==1 or len(self.all_corridors_and_halls)==0:
            chosen=str(choice(self.all_rooms))
            self._psql_log_variable('fireorig','room')
            self._psql_log_variable('fireorigname',chosen)
        else:
            chosen=str(choice(self.all_corridors_and_halls))
            self._psql_log_variable('fireorig','non_room')
            self._psql_log_variable('fireorigname',chosen)
        self.conf['ROOM_OF_FIRE_ORIGIN']=chosen

        compa=self.s.query("SELECT * FROM aamks_geom WHERE name=? and type_pri='COMPA'", (chosen,))[0]
        x=round(compa['width']/(2.0*100),2)
        y=round(compa['depth']/(2.0*100),2)
        z=round(compa['height']/100.0 * (1-math.log10(uniform(1,10))),2)

        collect=('FIRE', compa['global_type_id'], x, y, z, 1, 'TIME' ,'0','0','0','0','medium')
        return (','.join(str(i) for i in collect))

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
        Generate the fire. Alpha t square on the left, then constant in the
        middle, then fading on the right. At the end read hrrs at given times.
        '''

        i=self.dists['building_category'][self.conf['BUILDING_CATEGORY']]['heat_release_rate']
        hrr_peak=int(uniform(i['max_HRR'][0],i['max_HRR'][1])*1000)
        alpha=int(triangular(i['alfa_min_mode_max'][0], i['alfa_min_mode_max'][1], i['alfa_min_mode_max'][2])*1000)

        self._psql_log_variable('hrrpeak',hrr_peak)
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

        return (times,hrrs)
# }}}
    def _draw_window_opening(self,outdoor_temp): # {{{
        ''' 
        Windows are opened / closed based on outside temperatures but even
        still, there's a distribution of users willing to open/close the
        windows. Windows can be full-open (1), quarter-open (0.25) or closed
        (0). 
        '''

        draw_value=uniform(0,1)
        for i in self.dists['window_open']['setup']:
            if outdoor_temp > i['outside_temperature_range'][0] and outdoor_temp <= i['outside_temperature_range'][1]:
                if draw_value < i['window_is_full_open_probability']:
                    how_much_open=1 
                elif draw_value < i['window_is_full_open_probability'] + i['window_is_quarter_open_probability']:
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

        if Type=='D':
            how_much_open=binomial(1,self.dists['door_open']['standard_door_is_open_probability'])
            self._psql_log_variable(Type.lower(),how_much_open)
        elif Type=='C':
            how_much_open=binomial(1,self.dists['door_open']['door_closer_door_is_open_probability'])
            self._psql_log_variable(Type.lower(),how_much_open)
        elif Type=='E':
            how_much_open=binomial(1,self.dists['door_open']['electro_magnet_door_is_open_probability'])
            self._psql_log_variable(Type.lower(),how_much_open)
        elif Type=='VNT':
            how_much_open=binomial(1,self.dists['door_open']['vvents_no_failure_probability'])
            self._psql_log_variable(Type.lower(),how_much_open)
        elif Type=='HOLE':
            how_much_open=1

        return how_much_open
# }}}
    def _draw_fire_detector_triggers(self):# {{{
        mean,std_dev=self.dists['fire_detector_trigger_temperature']['mean_and_sd']
        zero_or_one=binomial(1,self.dists['fire_detector_trigger_temperature']['not_broken_probability'])
        chosen=round(normal(mean, std_dev),2) * zero_or_one
        self._psql_log_variable('detector',chosen)
        return str(chosen)
# }}}
    def _draw_sprinkler_triggers(self):# {{{
        mean,std_dev=self.dists['sprinkler_trigger_temperature']['mean_and_sd']
        zero_or_one=binomial(1,self.dists['sprinkler_trigger_temperature']['not_broken_probability'])
        chosen=round(normal(mean, std_dev),2) * zero_or_one
        self._psql_log_variable('sprinkler',chosen)
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
            self._section_detector(),
            self._section_sprinkler(),
            self._section_static(),
        )

        with open("{}/workers/{}/cfast.in".format(os.environ['AAMKS_PROJECT'],self._sim_id), "w") as output:
            output.write("\n".join(filter(None,txt)))
# }}}
    def _section_preamble(self,outdoor_temp):# {{{
        txt=(
        'VERSN,7,{}'.format(self.conf['PROJECT_NAME']),
        'TIMES,{},-120,10,10'.format(self.conf['SIMULATION_TIME']),
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
        'MATL,CONCRETE,1.7,840,2500,0.4,0.9,concrete',
        'MATL,GYPSUM,0.3,1000,1000,0.02,0.85,gipsum',
        'MATL,GLASS,0.8,840,2500,0.013,0.9,glass',
        'MATL,BLOCK,0.3,840,800,0.03,0.85,floor',
        '',
        )
        return "\n".join(txt)
# }}}
    def _section_compa(self):# {{{
        txt=['!! COMPA,name,width,depth,height,x,y,z,matl_ceiling,matl_floor,matl_wall']
        for v in self.s.query("SELECT * from aamks_geom WHERE type_pri='COMPA'"):
            collect=[]
            collect.append('COMPA')                    # COMPA
            collect.append(v['name'])                  # NAME
            collect.append(round(v['width']/100.0,2))  # WIDTH
            collect.append(round(v['depth']/100.0,2))  # DEPTH
            collect.append(round(v['height']/100.0,2)) # INTERNAL_HEIGHT
            collect.append(round(v['x0']/100.0,2))      # ABSOLUTE_X_POSITION
            collect.append(round(v['y0']/100.0,2))      # ABSOLUTE_Y_POSITION
            collect.append(round(v['z0']/100.0,2))      # z
            collect.append(v['material_ceiling'])      # CEILING_MATERIAL_NAME
            collect.append(v['material_floor'])        # FLOOR_MATERIAL_NAME
            collect.append(v['material_wall'])         # WALL_MATERIAL_NAME
            txt.append(','.join(str(i) for i in collect))

        return "\n".join(txt)+"\n" if len(txt)>1 else ""
# }}}
    def _section_halls_onez(self):# {{{
        txt=['!! ONEZ,id']
        for v in self.s.query("SELECT * from aamks_geom WHERE type_sec in ('STAI', 'COR') order by type_sec"):
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
            how_much_open=self._draw_window_opening(outdoor_temp)  # HOLE_CLOSE
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
        # TODO: check room_area
        txt=['!! VVENT,top,bottom,id,area,shape,rel_type,criterion,target,i_time, i_frac, f_time, f_frac, offset_x, offset_y']
        for v in self.s.query("SELECT distinct v.room_area, v.type_sec, v.vent_from, v.vent_to, v.vvent_room_seq, v.width, v.depth, (v.x0 - c.x0) + 0.5*v.width as x0, (v.y0 - c.y0) + 0.5*v.depth as y0 FROM aamks_geom v JOIN aamks_geom c on v.vent_to_name = c.name WHERE v.type_pri='VVENT' AND c.type_pri = 'COMPA' ORDER BY v.vent_from,v.vent_to"):
            collect=[]
            collect.append('VVENT')                                         # VVENT AREA, SHAPE, INITIAL_FRACTION
            collect.append(v['vent_from'])                                  # COMPARTMENT1
            collect.append(v['vent_to'])                                    # COMPARTMENT2
            collect.append(v['vvent_room_seq'])                             # VENT_NUMBER
            collect.append(v['room_area'])                                  # AREA OF THE ROOM, feb.2018: previously: round((v['width']*v['depth'])/1e4, 2)
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
    def _section_detector(self):# {{{
        txt=['!! DETECTORS,type,compa,temp,width,depth,height,rti,supress,density']
        for v in self.s.query("SELECT * from aamks_geom WHERE type_pri='COMPA' and detector = 1"):
            temp = self._draw_sprinkler_triggers()                # ACTIVATION_TEMPERATURE,
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
                collect.append(80)                                # RTI,
                collect.append(0)                                  # SUPPRESSION,
                collect.append(7E-05)                              # SPRAY_DENSITY
                txt.append(','.join(str(i) for i in collect))

        return "\n".join(txt)+"\n" if len(txt)>1 else ""

# }}}
    def _section_sprinkler(self):# {{{
        txt=['!! SPRINKLERS,type,compa,temp,width,depth,height,rti,supress,density']
        for v in self.s.query("SELECT * from aamks_geom WHERE type_pri='COMPA' and sprinkler=1"):
            temp = self._draw_sprinkler_triggers() # ACTIVATION_TEMPERATURE,
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
        area = (((npa(hrrs)/1000)/(fire_properties['q_star'] * 1.204 * 1.005 * 293 * sqrt(9.81))) ** (2/5)) + 0.0001
        txt=(
            '!! FIRE,compa,x,y,z,fire_number,ignition_type,ignition_criterion,ignition_target,?,?,name',
            self._draw_fire(),
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
    def _section_static(self):# {{{
        ''' 
        This section is for any static data defined in
        self.conf['CFAST_STATIC_RECORDS']. It will be added to all your
        cfast.in files. Useful for stuff that aamks doesn't produce, but you
        want in each of your 1.000 cfast.in files.
        '''

        txt=self.conf['CFAST_STATIC_RECORDS']
        return "\n".join(txt)+"\n" if len(txt)>1 else ""
# }}}

    def _new_psql_log(self):#{{{
        ''' Init the collector for storing montecarlo cfast setup. Variables will be registered later one at a time. '''
        self._psql_collector[self._sim_id]=OrderedDict([
            ('fireorig'     , [])     ,
            ('fireorigname' , [])     ,
            ('detector'     , [])     ,
            ('hrrpeak'      , [])     ,
            ('sootyield'    , [])     ,
            ('coyield'      , [])     ,
            ('alpha'        , [])     ,
            ('trace'        , [])     ,
            ('area'         , [])     ,
            ('q_star'       , [])     ,
            ('heigh'        , [])     ,
            ('w'            , [])     ,
            ('outdoort'     , [])     ,
            ('c'            , [])     ,
            ('d'            , [])     ,
            ('sprinkler'    , [])     ,
            ('heatcom'      , [])     ,
            ('e'            , [])     ,
            ('vnt'          , [])     ,
            ('radfrac'      , [])     ,
        ])
#}}}
    def _write(self):#{{{
        ''' 
        Write cfast variables to postgres. Also, since we invent
        ROOM_OF_FIRE_ORIGIN here, we need to pass it to evac via
        sim_id/evac.json. Both column names and the values for psql come from
        trusted source, so there should be no security issues with just joining
        dict data (non-parametrized query). 
        '''

        pairs=[]
        for k,v in self._psql_collector[self._sim_id].items():
            pairs.append("{}='{}'".format(k,','.join(str(x) for x in v )))
        data=', '.join(pairs)
        self.p.query("UPDATE simulations SET {} WHERE project=%s AND iteration=%s".format(data), (self.conf['PROJECT_NAME'], self._sim_id))

        self.json.write(self.conf, "{}/workers/{}/evac.json".format(os.environ['AAMKS_PROJECT'],self._sim_id))
#}}}

