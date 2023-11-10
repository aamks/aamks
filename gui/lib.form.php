<?php
function make_help() { /*{{{*/
	$help=[]                                                                                                                                                              ;
    //GENERAL SETTINGS
	$help["project_id"]              = ["Project & scenario"               , "Project ID/scenario ID"]                                                         ;
	$help["number_of_simulations"]   = ["Number of simulations"            , "The number of simulation to be launched"]                                                              ;
	$help["simulation_time"]         = ["Simulation time"                  , "Prescribed duration of single simulation (iteration) [s]"]                                                              ;
	$help["fire_model"]				 = ["Fire model"                       , "CFAST | FDS | None !!!currently only CFAST available!!!"]                                                              ;
    //FIRE MODEL
	$help["indoor_temperature"]      = ["Initial indoor temperature"               , "Parameters of normal distribution of initial indoor temperature [°C]"]                                                              ;
	$help["outdoor_temperature"]     = ["Initial outdoor temperature"              , "Parameters of normal distribution of initial outdoor temperature [°C]"]                                                              ;
	$help["pressure"]                = ["Initial pressure"                  , "Parameters of normal distribution of initial pressure [Pa]"]                                                              ;
	$help["humidity"]                = ["Initial humidity"                         , "Parameters of normal distribution of initial humidity [%RH]"]                                                              ;
	$help["material"]				 = ["Materials"                         , "Construction materials in the building. Those are uniform across walls, ceilings and floors respectively. Thickness unit is meter [m]  <br><table><tr><th>Material</th><th>Specific heat [kJ/(kg&middot;K)]</th><th>Conductivity [kW/(m&middot;K)]</th><th>Density [kg/m<sup>3</sup>]</th><th>Emissivity [-]</th><th>Fixed thickness [m]</th></tr><tr><td>Concrete</td><td>1.0</td><td>1.75</td><td>2200</td><td>0.94</td><td>0.15</td></tr><tr><td>Gypsum</td><td>1.09</td><td>0.3</td><td>1000</td><td>0.85</td><td>0.03</td></tr><tr><td>Brick</td><td>0.9</td><td>0.3</td><td>840</td><td>0.85</td><td>0.2</td></tr></table>" ] ;
	//$help["ceiling"]				 = ["ceiling"                          , "write me..."]                                                              ;
	//$help["floor"]          		 = ["floor"                            , "write me..."]                                                              ;
	//$help["wall"]           		 = ["wall"                             , "write me..."]                                                              ;
	$help["heat_detectors"]        	 = [""                                 , "Heat detectors - temperature of activation [°C] (press to switch on/off)"]                                                              ;
	$help["smoke_detectors"]      	 = [""                                 , "Smoke detectors - obscuration of activation [%/m] (press to switch on/off)"]                                                              ;
	$help["sprinklers"]         	 = [""                                 , "Sprinklers (press to switch on/off)"]                                                              ;
	$help["density_mean"]         	 = ["SprayDensity_m"                   , "Mean of spray density normal distribution [m/s]"]                                                              ;
	$help["density_sd"]         	 = ["SprayDensity_sd"                  , "Standard deviation of spray density normal distribution [m/s]"]                                                              ;
	$help["temp_mean"]			     = ["temp_mean"                        , "Mean of activation temperature normal distribution" ]                                                      ;
	$help["obsc_sd"]			     = ["obsc_sd"                          , "Standard deviation of activation obscuration normal distribution" ]                                                      ;
	$help["obsc_mean"]			     = ["obsc_mean"                        , "Mean of activation obscuration normal distribution" ]                                                      ;
	$help["temp_sd"]			     = ["temp_sd"                          , "Standard deviation of activation temperature normal distribution" ]                                                      ;
	$help["not_broken"]	             = ["reliability"                      , "Probability of proper functioning"]                                                              ;
	$help["RTI"]	                 = ["RTI"                              , "Response Time Index [(m&middot;s)<sup>1/2</sup>]"]                                                              ;
	$help["NSHEVS"]	                 = [""                                 , "Mechanical ventilation systems (press to switch on/off)"]                                                              ;
	$help["activation_time"]	     = ["activation time"                  , "Time to fans' start"]                                                              ;
	$help["startup_time"]	         = ["start-up"                         , "Fans' start-up time"]                                                              ;
	$help["windows"]				 = ["Windows openness"                 , "Each row defines probabilities of certain window state in given temperature range:<br> min - lower temperature for this row<br>max - upper temperature for this row<br>quarter - probability of window being partially (0.25) open<br>full - probability of window being fully open" ]  ;
	$help["vents_open"]	             = ["Openings"                         , "Probability of openness for different opening types"]                                                              ;
	$help["DELECTR"]	             = ["DELECTR"                          , "Door with electromagnetic holder and automatic closer"]                                                              ;
	$help["DCLOSER"]	             = ["DCLOSER"                          , "Door with automatic closer"]                                                              ;
	$help["DOOR"]	                 = ["DOOR"                             , "Regular door"]                                                              ;
	$help["VVENT"]	                 = ["VVENT"                            , "Vertical openings"]                                                              ;
	$help["c_const"]        	     = ["C constant"                       , "Constant used for visibility calculations"]                                                              ;
	$help["fire_starts_in_a_room"]	 = ["Fire in 'ROOM'?"                  , "Probability of fire initialized in 'ROOM' (rX) compartment type"]                                                              ;
	$help["hrrpua"]        	         = ["HRRPUA"                           , "Parameters of triangular distribution of Heat Release Rate Per Unit Area [kW/m<sup>2</sup>]"]                                                              ;
	$help["hrr_alpha"]    	         = ["Fire growth rate"                 , "Parameters of triangular distribution of Fire growth rate [kW/s<sup>2</sup>]"]                                                              ;
	$help["fuel"]    	             = ["Fuel"                             , "Fuel for CFAST combustion model. More information can be found on wiki page. Remember to set <i>Molecule</i>, <i>Heat of combustion</i>, <i>Yields</i> if <i>Fuel</i> is <b><i>user-defined</i></b>"]                                                              ;
	$help["molecule"]    	         = [""                                 , "<b>User-defined</b> formula of fuel molecule."]                                                              ;
	$help["heatcom"]             	 = [""                                 , "<b>User-defined</b> parameters of heat of combustion normal distribution [MJ/kg]"]                                                              ;
	$help["yields"]    	             = [""                                 , "<b>User-defined</b> parameters of species yields normal distribution [g/g]"]                                                              ;
	$help["radfrac"]    	         = ["Radiative fraction"               , "Parameters of gamma distribution of radiative fraction of HRR [-]"]                                                              ;
	$help["fire_load"]    	         = [""                                 , "Parameters OR 1st and 99th percentiles of log-normal distribution of fire load in ROOM and other comprtments types [MJ/m<sup>2</sup>]"]                                                              ;

    //EVACUTAION MODEL
	//$help["evac_clusters"]		     = ["evac_clusters"					   , "follow the leader, etc (TODO)."];                                                              ;
	$help["dispatch_evacuees"]		 = ["Evacuees dispatch mode"           , "<orange>manual+probabilistic</orange> probabilistic evacuees only in the rooms free of manual evacuees<hr> <orange>probabilistic+manual</orange> probabilistic evacuees first and then extra manual evacuees<hr> <orange>manual</orange> probabilistic evacuees are never added "]                                                              ;
	$help["pre_evac"]				 = ["Pre-evacuation time"              , "Parameters OR 1st and 99th percentile of log-normal distribution of pre-evacuation time [s]<br>(time from agent being alarmed to start of egrees) "  ] ;
	$help["pre_evac_fire_origin"]	 = ["Pre-evacuation<br>in fire origin" , "Parameters OR 1st and 99th percentile of log-normal distribution of pre-evacuation time in compartment of fire origin [s]<br>(time from agent being alarmed to start of egrees) " ]                                                        ;
	$help["alarming"]				 = ["Alarming time"                    , "Parameters of normal distribution of alarming time [s] !!!currently fixed to 0!!!" ] ;
	$help["evacuees_density"]		 = ["Evacuees density"                 , "Density of occupants in different compartments types [pers/m<sup>2</sup>]" ] ;
	$help["building_profile"]		 = ["Building profile"                 , "Default profiles for buildings. Description available on wiki page" ]  ;
	$help["management"]			     = ["Management lvl"                   , "Referring to PD 7974-6" ]                                                     ;
	$help["complexity"]			     = ["Complexity lvl"                   , "Referring to  PD 7974-6" ]                                                     ;
	$help["alarmingb"]			     = ["Alarming lvl"                     , "Referring to PD 7974-6" ]                                                     ;
	$help["evacuees_max_h_speed"]    = ["Horizontal speed"                 , "Parameters of normal distribution of nominal horizontal speed [cm/s]"]                                                              ;
	$help["evacuees_max_v_speed"]    = ["Vertical speed"                   , "Parameters of normal distribution of nominal vertical speed [cm/s] !!!currently not used!!!"]                                                              ;
	$help["evacuees_alpha_v"]        = ["Alpha speed"                      , "Parameters of normal distribution of alpha (used for speed reduction in somke) [-]"]                                                              ;
	$help["evacuees_beta_v"]         = ["Beta speed"                       , "Parameters of normal distribution of beta (used for speed rduction in smoke) [-]"]                                                              ;

    //RESCUE MODEL 
	$help["is_rescue"]			     = ["is rescue?"                        , "is rescue module used? 1/0" ]                                                      ;
	$help["electronic"]			     = ["electronic/phone"                       , "Electronic =1, phone call = 0" ]                                                      ;
	$help["detection"]			     = ["detection"                       , "Input detection time in seconds [s]" ]                                                      ;
	$help["t1"]			     = ["t1"                       , "Time T1- only with electronic [s]" ]                                                      ;
	$help["t2"]			     = ["t2"                       , "Time T2- only with electronic [s]" ]                                                      ;
	$help["CPR"]			     = ["CPR"                       , "Phone call time - only with electronic [s]" ]                                                      ;
	$help["dist_short"]			     = ["dist short"                       , "Distance to the nearest Fire Department [km]" ]                                                      ;
	$help["dist_long"]			     = ["dist long"                       , "Distance to the second Fire Department [km]" ]                                                      ;
	$help["fire_distance_horizontal"]			     = ["horizontal to fire"                       , "Longest distance beetween fire origin and entrance to the building in horizontal plane [m]" ]                                                      ;
	$help["fire_distance_vertical"]			     = ["vertical to fire"                       , "Longest distance beetween fire origin and entrance to the building in vertical plane [m]" ]                                                      ;
	$help["time_1"]			     = ["t1"                       , "Time from arrival to start putting fire from 1st nozzle [s]" ]                                                      ;
	$help["time_2"]			     = ["t2"                       , "Time from arrival to start putting fire from 2nd nozzle [s], -1 means that this nozzle does not exist" ]                                                      ;
	$help["time_3"]			     = ["t3"                       , "Time from arrival to start putting fire from 3rd nozzle [s], -1 means that this nozzle does not exist" ]                                                      ;	
	$help["time_4"]			     = ["t4"                       , "Time from arrival to start putting fire from 4th nozzle [s], -1 means that this nozzle does not exist" ]                                                      ;

	$help["r_is"]			     = ["Model"                       , "Simple - Pareto distribution of fire area<br>Complex - see Kuziora 2023" ]                                                      ;
	$help["r_trans"]			     = ["Transmission"                       , "Phone call - fire service is notified of fire via phone call<br>Automatic - automatic alarm transmission from FACP" ]                                                      ;
	$help["r_times"]			     = [""                       , "Time intervals for fire scenario [s]" ]                                                      ;
	$help["detection"]			     = ["detection"                       , "Time from fire initiation to detection" ]                                                      ;
	$help["t1"]			     = ["T1"                       , "Confirmation time"];
	$help["t2"]			     = ["T2"                       , "Reconnaissance time"];
	$help["cpr"]			     = ["CPR"                       , "Add phone call time?"];
    $help["r_distances"]			     = [""                       , "Distances to the nearest Fire Units [km]"];
	$help["r_to_fire"]			     = [""                       , "Maximum length (horizontal) and hydraulic head (vertical) of firehoses system [m]"];
	$help["r_nozzles"]			     = [""                       , "Time from fire unit arrival to application of subsequent water jets [s] (-1 if never ready)"];
    $help["fire_area"]    	         = ["Pareto fire area"                        , "Parameters of Pareto distribution of fire area [m<sup>2</sup>]"]                                                              ;

	foreach($help as $k=>$v) { 
		$help[$k][1]="<withHelp>?<help>$v[1]</help></withHelp>";
	}
	$_SESSION['help']=$help;
}
/*}}}*/
function get_building($q,$get_keys=0) { /*{{{*/
	$db['Hotel']                     =array('code'=> 'c1' , 'hrr_alpha_mode'=> 0.047  , 'hrrpua_mode'=> 500  , 'evacuees_density'=>  array('ROOM'=>1     , 'COR'=> 1     , 'STAI'=> 1     , 'HALL'=> 1)  ) ;
	$db['Office (closed plan)']      =array('code'=> 'b'  , 'hrr_alpha_mode'=> 0.012  , 'hrrpua_mode'=> 500  , 'evacuees_density'=>  array('ROOM'=>0.125 , 'COR'=> 0.05  , 'STAI'=> 0.02  , 'HALL'=> 0.033) ) ;
	$db['Office (open plan)']        =array('code'=> 'a'  , 'hrr_alpha_mode'=> 0.012  , 'hrrpua_mode'=> 500  , 'evacuees_density'=>  array('ROOM'=>0.02  , 'COR'=> 0.1   , 'STAI'=> 0.02  , 'HALL'=> 0.1) ) ;
	$db['Amusement arcade']          =array('code'=> 'b'  , 'hrr_alpha_mode'=> 0.012  , 'hrrpua_mode'=> 500  , 'evacuees_density'=>  array('ROOM'=>2.0   , 'COR'=> 0.1   , 'STAI'=> 0.033 , 'HALL'=> 0.25)  ) ;
	$db['Archive, library']          =array('code'=> 'b'  , 'hrr_alpha_mode'=> 0.047  , 'hrrpua_mode'=> 500  , 'evacuees_density'=>  array('ROOM'=>0.2   , 'COR'=> 0.05  , 'STAI'=> 0.05  , 'HALL'=> 0.05) ) ;
	$db['Art gallery']               =array('code'=> 'b'  , 'hrr_alpha_mode'=> 0.012  , 'hrrpua_mode'=> 500  , 'evacuees_density'=>  array('ROOM'=>0.2   , 'COR'=> 0.05  , 'STAI'=> 0.05  , 'HALL'=> 0.05) ) ;
	$db['Assembly hall']             =array('code'=> 'b'  , 'hrr_alpha_mode'=> 0.012  , 'hrrpua_mode'=> 500  , 'evacuees_density'=>  array('ROOM'=>0.033 , 'COR'=> 0.033 , 'STAI'=> 0.033 , 'HALL'=> 0.033) ) ;
	$db['Bank']                      =array('code'=> 'b'  , 'hrr_alpha_mode'=> 0.0029 , 'hrrpua_mode'=> 500  , 'evacuees_density'=>  array('ROOM'=>0.33  , 'COR'=> 0.05  , 'STAI'=> 0.05  , 'HALL'=> 0.05) ) ;
	$db['Bar']                       =array('code'=> 'b'  , 'hrr_alpha_mode'=> 0.012  , 'hrrpua_mode'=> 500  , 'evacuees_density'=>  array('ROOM'=>3.33  , 'COR'=> 0.1   , 'STAI'=> 0.1   , 'HALL'=> 0.1) ) ;
	$db['Bazaar']                    =array('code'=> 'b'  , 'hrr_alpha_mode'=> 0.047  , 'hrrpua_mode'=> 500  , 'evacuees_density'=>  array('ROOM'=>0.5   , 'COR'=> 0.05  , 'STAI'=> 0.05  , 'HALL'=> 0.05) ) ;
	$db['Business centre']           =array('code'=> 'b'  , 'hrr_alpha_mode'=> 0.012  , 'hrrpua_mode'=> 500  , 'evacuees_density'=>  array('ROOM'=>0.14  , 'COR'=> 0.05  , 'STAI'=> 0.05  , 'HALL'=> 0.05) ) ;
	$db['Canteen']                   =array('code'=> 'a'  , 'hrr_alpha_mode'=> 0.012  , 'hrrpua_mode'=> 500  , 'evacuees_density'=>  array('ROOM'=>1     , 'COR'=> 0.1   , 'STAI'=> 0.05  , 'HALL'=> 0.1) ) ;
	$db['School']                    =array('code'=> 'a'  , 'hrr_alpha_mode'=> 0.012  , 'hrrpua_mode'=> 500  , 'evacuees_density'=>  array('ROOM'=>0.5   , 'COR'=> 0.1   , 'STAI'=> 0.05  , 'HALL'=> 0.05) ) ;
	$db['Schopping mall']            =array('code'=> 'b'  , 'hrr_alpha_mode'=> 0.012  , 'hrrpua_mode'=> 500  , 'evacuees_density'=>  array('ROOM'=>0.25  , 'COR'=> 0.1   , 'STAI'=> 0.1   , 'HALL'=> 0.25)  ) ;
	$db['Dance area']                =array('code'=> 'b'  , 'hrr_alpha_mode'=> 0.012  , 'hrrpua_mode'=> 500  , 'evacuees_density'=>  array('ROOM'=>2.0   , 'COR'=> 1.0   , 'STAI'=> 1.0   , 'HALL'=> 1.0)  ) ;
	$db['Dromitory']                 =array('code'=> 'c2' , 'hrr_alpha_mode'=> 0.012  , 'hrrpua_mode'=> 500  , 'evacuees_density'=>  array('ROOM'=>0.2   , 'COR'=> 0.1   , 'STAI'=> 0.1   , 'HALL'=> 0.1) ) ;
	$db['Exhibition area']           =array('code'=> 'b'  , 'hrr_alpha_mode'=> 0.047  , 'hrrpua_mode'=> 500  , 'evacuees_density'=>  array('ROOM'=>0.66  , 'COR'=> 0.66  , 'STAI'=> 0.1   , 'HALL'=> 0.66)) ;
	$db['Factory area']              =array('code'=> 'a'  , 'hrr_alpha_mode'=> 0.047  , 'hrrpua_mode'=> 500  , 'evacuees_density'=>  array('ROOM'=>0.2   , 'COR'=> 0.1   , 'STAI'=> 0.05  , 'HALL'=> 0.1) ) ;
	$db['Gym or leisure centre']     =array('code'=> 'b'  , 'hrr_alpha_mode'=> 0.012  , 'hrrpua_mode'=> 500  , 'evacuees_density'=>  array('ROOM'=>1.0   , 'COR'=> 1.0   , 'STAI'=> 1.0   , 'HALL'=> 1.0)  ) ;
	$db['Museum']                    =array('code'=> 'b'  , 'hrr_alpha_mode'=> 0.012  , 'hrrpua_mode'=> 500  , 'evacuees_density'=>  array('ROOM'=>1.66  , 'COR'=> 0.1   , 'STAI'=> 0.1   , 'HALL'=> 0.1) ) ;
	$db['Restaurant']                =array('code'=> 'b'  , 'hrr_alpha_mode'=> 0.012  , 'hrrpua_mode'=> 500  , 'evacuees_density'=>  array('ROOM'=>1.0   , 'COR'=> 0.1   , 'STAI'=> 0.1   , 'HALL'=> 0.1) ) ;
	$db['Shop sales']                =array('code'=> 'b'  , 'hrr_alpha_mode'=> 0.047  , 'hrrpua_mode'=> 500  , 'evacuees_density'=>  array('ROOM'=>0.5   , 'COR'=> 0.2   , 'STAI'=> 0.1   , 'HALL'=> 0.5)  ) ;
	$db['Storage or warehousing']    =array('code'=> 'a'  , 'hrr_alpha_mode'=> 0.18   , 'hrrpua_mode'=> 500  , 'evacuees_density'=>  array('ROOM'=>0.033 , 'COR'=> 0.033 , 'STAI'=> 0.033 , 'HALL'=> 0.033) ) ;
	$db['Theatre, concert hall']     =array('code'=> 'b'  , 'hrr_alpha_mode'=> 0.012  , 'hrrpua_mode'=> 500  , 'evacuees_density'=>  array('ROOM'=>2.5   , 'COR'=> 0.1   , 'STAI'=> 0.1   , 'HALL'=> 0.1) ) ;
	$db['Medical day centre']        =array('code'=> 'd1' , 'hrr_alpha_mode'=> 0.012  , 'hrrpua_mode'=> 500  , 'evacuees_density'=>  array('ROOM'=>0.14  , 'COR'=> 0.1   , 'STAI'=> 0.1   , 'HALL'=> 0.1) ) ;
	$db['Hospital, nursing home']    =array('code'=> 'd2' , 'hrr_alpha_mode'=> 0.012  , 'hrrpua_mode'=> 500  , 'evacuees_density'=>  array('ROOM'=>0.1   , 'COR'=> 0.05  , 'STAI'=> 0.05  , 'HALL'=> 0.05) ) ;
	$db['Railway station, airport']  =array('code'=> 'e'  , 'hrr_alpha_mode'=> 0.012  , 'hrrpua_mode'=> 500  , 'evacuees_density'=>  array('ROOM'=>0.5   , 'COR'=> 0.1   , 'STAI'=> 0.1   , 'HALL'=> 0.1) ) ;
	if(empty($get_keys)) {  
		if(isset($db[$q])) { 
			return $db[$q];
		} else {
			return array('code'=>'', 'hrr_alpha_mode'=> '', 'hrrpua_mode'=> '', 'evacuees_density'=> array('ROOM'=>'', 'COR'=> '', 'STAI'=> '', 'HALL'=> '') ) ;
		}
	} else {
		return array_keys($db);
	}
}
/*}}}*/
function get_profile_code($q) { #{{{
	$db['a,fire_origin']  = [29.85,1.48];
	$db['a,M1,B1,A1']     = [29.71,2.96];
	$db['a,M1,B1,A2']     = [29.71,2.96];
	$db['a,M1,B1,A3']     = [];
	$db['a,M1,B2,A1']     = [29.71,2.96];
	$db['a,M1,B2,A2']     = [29.71,2.96];
	$db['a,M1,B2,A3']     = [];
	$db['a,M1,B3,A1']     = [59.71,2.96];
	$db['a,M1,B3,A2']     = [59.71,2.96];
	$db['a,M1,B3,A3']     = [];
	$db['a,M2,B1,A1']     = [59.42,5.92];
	$db['a,M2,B1,A2']     = [59.42,5.92];
	$db['a,M2,B1,A3']     = [];
	$db['a,M2,B2,A1']     = [59.42,5.92];
	$db['a,M2,B2,A2']     = [59.42,5.92];
	$db['a,M2,B2,A3']     = [];
	$db['a,M2,B3,A1']     = [89.42,5.92];
	$db['a,M2,B3,A2']     = [89.42,5.92];
	$db['a,M2,B3,A3']     = [];
	$db['a,M3,B1,A1']     = [899.42,5.92];
	$db['a,M3,B1,A2']     = [899.42,5.92];
	$db['a,M3,B1,A3']     = [];
	$db['a,M3,B2,A1']     = [899.42,5.92];
	$db['a,M3,B2,A2']     = [899.42,5.92];
	$db['a,M3,B2,A3']     = [];
	$db['a,M3,B3,A1']     = [929.42,5.92];
	$db['a,M3,B3,A2']     = [929.42,5.92];
	$db['a,M3,B3,A3']     = [929.42,5.92];
	$db['b,fire_origin']  = [59.85,1.48];
	$db['b,M1,B1,A1']     = [29.13,8.87];
	$db['b,M1,B1,A2']     = [29.13,8.87];
	$db['b,M1,B1,A3']     = [];
	$db['b,M1,B2,A1']     = [59.13,8.87];
	$db['b,M1,B2,A2']     = [59.13,8.87];
	$db['b,M1,B2,A3']     = [];
	$db['b,M1,B3,A1']     = [89.13,8.87];
	$db['b,M1,B3,A2']     = [89.13,8.87];
	$db['b,M1,B3,A3']     = [];
	$db['b,M2,B1,A1']     = [58.84,11.83];
	$db['b,M2,B1,A2']     = [58.84,11.83];
	$db['b,M2,B1,A3']     = [];
	$db['b,M2,B2,A1']     = [88.84,11.83];
	$db['b,M2,B2,A2']     = [88.84,11.83];
	$db['b,M2,B2,A3']     = [];
	$db['b,M2,B3,A1']     = [118.84,11.83];
	$db['b,M2,B3,A2']     = [118.84,11.83];
	$db['b,M2,B3,A3']     = [];
	$db['b,M3,B1,A1']     = [899.42,5.92];
	$db['b,M3,B1,A2']     = [899.42,5.92];
	$db['b,M3,B1,A3']     = [];
	$db['b,M3,B2,A1']     = [899.42,5.92];
	$db['b,M3,B2,A2']     = [899.42,5.92];
	$db['b,M3,B2,A3']     = [];
	$db['b,M3,B3,A1']     = [929.42,5.92];
	$db['b,M3,B3,A2']     = [929.42,5.92];
	$db['b,M3,B3,A3']     = [929.42,5.92];
	$db['c1,fire_origin'] = [59.85,1.48];
	$db['c1,M1,B1,A1']    = [29.71,2.96];
	$db['c1,M1,B1,A2']    = [29.71,2.96];
	$db['c1,M1,B1,A3']    = [];
	$db['c1,M1,B2,A1']    = [594.22,59.16];
	$db['c1,M1,B2,A2']    = [594.22,59.16];
	$db['c1,M1,B2,A3']    = [];
	$db['c1,M1,B3,A1']    = [59.71,2.96];
	$db['c1,M1,B3,A2']    = [59.71,2.96];
	$db['c1,M1,B3,A3']    = [];
	$db['c1,M2,B1,A1']    = [299.94,0.59];
	$db['c1,M2,B1,A2']    = [];
	$db['c1,M2,B1,A3']    = [];
	$db['c1,M2,B2,A1']    = [894.22,59.16];
	$db['c1,M2,B2,A2']    = [894.22,59.16];
	$db['c1,M2,B2,A3']    = [];
	$db['c1,M2,B3,A1']    = [];
	$db['c1,M2,B3,A2']    = [];
	$db['c1,M2,B3,A3']    = [];
	$db['c1,M3,B1,A1']    = [];
	$db['c1,M3,B1,A2']    = [];
	$db['c1,M3,B1,A3']    = [594.22,59.16];
	$db['c1,M3,B2,A1']    = [1199.94,0.59];
	$db['c1,M3,B2,A2']    = [1199.94,0.59];
	$db['c1,M3,B2,A3']    = [1199.94,0.59];
	$db['c1,M3,B3,A1']    = [];
	$db['c1,M3,B3,A2']    = [];
	$db['c1,M3,B3,A3']    = [];
	$db['c2,fire_origin'] = [59.85,1.48];
	$db['c2,M1,B1,A1']    = [29.71,2.96];
	$db['c2,M1,B1,A2']    = [29.71,2.96];
	$db['c2,M1,B1,A3']    = [];
	$db['c2,M1,B2,A1']    = [594.22,59.16];
	$db['c2,M1,B2,A2']    = [594.22,59.16];
	$db['c2,M1,B2,A3']    = [];
	$db['c2,M1,B3,A1']    = [59.71,2.96];
	$db['c2,M1,B3,A2']    = [59.71,2.96];
	$db['c2,M1,B3,A3']    = [];
	$db['c2,M2,B1,A1']    = [299.94,0.59];
	$db['c2,M2,B1,A2']    = [];
	$db['c2,M2,B1,A3']    = [];
	$db['c2,M2,B2,A1']    = [894.22,59.16];
	$db['c2,M2,B2,A2']    = [894.22,59.16];
	$db['c2,M2,B2,A3']    = [];
	$db['c2,M2,B3,A1']    = [];
	$db['c2,M2,B3,A2']    = [];
	$db['c2,M2,B3,A3']    = [];
	$db['c2,M3,B1,A1']    = [];
	$db['c2,M3,B1,A2']    = [];
	$db['c2,M3,B1,A3']    = [594.22,59.16];
	$db['c2,M3,B2,A1']    = [1199.94,0.59];
	$db['c2,M3,B2,A2']    = [1199.94,0.59];
	$db['c2,M3,B2,A3']    = [1199.94,0.59];
	$db['c2,M3,B3,A1']    = [];
	$db['c2,M3,B3,A2']    = [];
	$db['c2,M3,B3,A3']    = [];
	$db['c3,fire_origin'] = [59.85,1.48];
	$db['c3,M1,B1,A1']    = [29.71,2.96];
	$db['c3,M1,B1,A2']    = [29.71,2.96];
	$db['c3,M1,B1,A3']    = [];
	$db['c3,M1,B2,A1']    = [594.22,59.16];
	$db['c3,M1,B2,A2']    = [594.22,59.16];
	$db['c3,M1,B2,A3']    = [];
	$db['c3,M1,B3,A1']    = [59.71,2.96];
	$db['c3,M1,B3,A2']    = [59.71,2.96];
	$db['c3,M1,B3,A3']    = [];
	$db['c3,M2,B1,A1']    = [299.94,0.59];
	$db['c3,M2,B1,A2']    = [];
	$db['c3,M2,B1,A3']    = [];
	$db['c3,M2,B2,A1']    = [894.22,59.16];
	$db['c3,M2,B2,A2']    = [894.22,59.16];
	$db['c3,M2,B2,A3']    = [];
	$db['c3,M2,B3,A1']    = [];
	$db['c3,M2,B3,A2']    = [];
	$db['c3,M2,B3,A3']    = [];
	$db['c3,M3,B1,A1']    = [];
	$db['c3,M3,B1,A2']    = [];
	$db['c3,M3,B1,A3']    = [594.22,59.16];
	$db['c3,M3,B2,A1']    = [1199.94,0.59];
	$db['c3,M3,B2,A2']    = [1199.94,0.59];
	$db['c3,M3,B2,A3']    = [1199.94,0.59];
	$db['c3,M3,B3,A1']    = [];
	$db['c3,M3,B3,A2']    = [];
	$db['c3,M3,B3,A3']    = [];
	$db['d1,fire_origin'] = [59.85,1.48];
	$db['d1,M1,B1,A1']    = [28.84,11.83];
	$db['d1,M1,B1,A2']    = [28.84,11.83];
	$db['d1,M1,B1,A3']    = [];
	$db['d1,M1,B2,A1']    = [59.13,8.87];
	$db['d1,M1,B2,A2']    = [59.13,8.87];
	$db['d1,M1,B2,A3']    = [];
	$db['d1,M1,B3,A1']    = [89.13,8.87];
	$db['d1,M1,B3,A2']    = [89.13,8.87];
	$db['d1,M1,B3,A3']    = [];
	$db['d1,M2,B1,A1']    = [58.84,11.83];
	$db['d1,M2,B1,A2']    = [58.84,11.83];
	$db['d1,M2,B1,A3']    = [];
	$db['d1,M2,B2,A1']    = [894.22,59.16];
	$db['d1,M2,B2,A2']    = [894.22,59.16];
	$db['d1,M2,B2,A3']    = [];
	$db['d1,M2,B3,A1']    = [];
	$db['d1,M2,B3,A2']    = [];
	$db['d1,M2,B3,A3']    = [];
	$db['d1,M3,B1,A1']    = [899.94,0.59];
	$db['d1,M3,B1,A2']    = [899.94,0.59];
	$db['d1,M3,B1,A3']    = [899.94,0.59];
	$db['d1,M3,B2,A1']    = [1199.94,0.59];
	$db['d1,M3,B2,A2']    = [1199.94,0.59];
	$db['d1,M3,B2,A3']    = [1199.94,0.59];
	$db['d1,M3,B3,A1']    = [1259.94,0.59];
	$db['d1,M3,B3,A2']    = [1259.94,0.59];
	$db['d1,M3,B3,A3']    = [1259.94,0.59];
	$db['d2,fire_origin'] = [59.85,1.48];
	$db['d2,M1,B1,A1']    = [];
	$db['d2,M1,B1,A2']    = [];
	$db['d2,M1,B1,A3']    = [];
	$db['d2,M1,B2,A1']    = [297.11,29.56];
	$db['d2,M1,B2,A2']    = [297.11,29.56];
	$db['d2,M1,B2,A3']    = [];
	$db['d2,M1,B3,A1']    = [357.11,29.58];
	$db['d2,M1,B3,A2']    = [357.11,29.58];
	$db['d2,M1,B3,A3']    = [];
	$db['d2,M2,B1,A1']    = [];
	$db['d2,M2,B1,A2']    = [];
	$db['d2,M2,B1,A3']    = [];
	$db['d2,M2,B2,A1']    = [594.22,59.16];
	$db['d2,M2,B2,A2']    = [594.22,59.16];
	$db['d2,M2,B2,A3']    = [];
	$db['d2,M2,B3,A1']    = [654.22,59.16];
	$db['d2,M2,B3,A2']    = [654.22,59.16];
	$db['d2,M2,B3,A3']    = [];
	$db['d2,M3,B1,A1']    = [];
	$db['d2,M3,B1,A2']    = [];
	$db['d2,M3,B1,A3']    = [];
	$db['d2,M3,B2,A1']    = [594.22,59.16];
	$db['d2,M3,B2,A2']    = [594.22,59.16];
	$db['d2,M3,B2,A3']    = [];
	$db['d2,M3,B3,A1']    = [654.22,59.16];
	$db['d2,M3,B3,A2']    = [654.22,59.16];
	$db['d2,M3,B3,A3']    = [654.22,59.16];
	$db['e,fire_origin']  = [59.85,1.48];
	$db['e,M1,B1,A1']     = [];
	$db['e,M1,B1,A2']     = [];
	$db['e,M1,B1,A3']     = [];
	$db['e,M1,B2,A1']     = [];
	$db['e,M1,B2,A2']     = [];
	$db['e,M1,B2,A3']     = [];
	$db['e,M1,B3,A1']     = [88.56,14.79];
	$db['e,M1,B3,A2']     = [88.56,14.79];
	$db['e,M1,B3,A3']     = [];
	$db['e,M2,B1,A1']     = [];
	$db['e,M2,B1,A2']     = [];
	$db['e,M2,B1,A3']     = [];
	$db['e,M2,B2,A1']     = [];
	$db['e,M2,B2,A2']     = [];
	$db['e,M2,B2,A3']     = [];
	$db['e,M2,B3,A1']     = [118.27,17.75];
	$db['e,M2,B3,A2']     = [118.27,17.75];
	$db['e,M2,B3,A3']     = [];
	$db['e,M3,B1,A1']     = [];
	$db['e,M3,B1,A2']     = [];
	$db['e,M3,B1,A3']     = [];
	$db['e,M3,B2,A1']     = [];
	$db['e,M3,B2,A2']     = [];
	$db['e,M3,B2,A3']     = [];
	$db['e,M3,B3,A1']     = [899.94,0.59];
	$db['e,M3,B3,A2']     = [899.94,0.59];
	$db['e,M3,B3,A3']     = [899.94,0.59];

	if(isset($db[$q][0])) { 
		return array("mean"=>$db[$q][0], "sd"=>$db[$q][1]);
	} else {
		return array("mean"=>"", "sd"=>"");
	}
}
/*}}}*/
function get_template_defaults($q) {/*{{{*/
	// This file is based on demo/simple/conf.json, but may have a different fire_model or whatever
	// setups may be later mapped to countries -- that is another reason we don't just use demo/simple/conf.json

	// We need to sync all the keys here with
	// 1. form_fields_advanced() in form.php 
	// 2. installer/demos/


	$db['setup1']='
{
    "fire_model": "CFAST",
    "dispatch_evacuees": "manual+probabilistic",
    "number_of_simulations": 1,
    "simulation_time": 100,
    "indoor_temperature": {
        "mean": 22,
        "sd": 2
    },
    "humidity": {
        "mean": 40,
        "sd": 5
    },
    "building_profile": {
        "type": "Bank",
        "management": "M1",
        "complexity": "B1",
        "alarming": "A1"
    },
    "material_ceiling": {
        "type": "concrete",
        "thickness": 0.3
    },
    "material_floor": {
        "type": "concrete",
        "thickness": 0.3
    },
    "material_wall": {
        "type": "concrete",
        "thickness": 0.3
    },
    "heat_detectors": {
        "mean": "",
        "sd": "",
        "RTI": "",
        "not_broken": ""
    },
    "smoke_detectors": {
        "mean": "",
        "sd": "",
        "not_broken": ""
    },
    "sprinklers": {
        "mean": 60,
        "sd": 2,
        "density_mean": 0.0001,
        "density_sd": 0.00001,
        "RTI": 100,
        "not_broken": 0.95
    },
    "NSHEVS": {
        "activation_time": "",
        "startup_time": ""
    },
    "RESCUE": {
        "is_rescue": 0,
        "electronic": 0,
        "detection": 20,
        "t1": 20,
        "t2": 20,
	"CPR": 1, 
        "dist_short": 4,
        "dist_long": 8,
        "fire_distance_horizontal": 20,
        "fire_distance_vertical":5
    },
    "NOZZLES": {
	"time_1" : 0,
	"time_2": 40,
	"time_3": 80,
	"time_4": -1
    },

    "r_is":"simple",
    "r_trans":"phone",
    "r_cpr":0,
    "r_times": {
        "detection": "",
        "t1": "",
        "t2": ""},
    "r_distances": {
        "1st": "",
        "2nd": ""},
    "r_to_fire": {
        "horizontal": "",
        "vertical": ""},
    "r_nozzles": {
        "1st": "",
        "2nd": "",
        "3rd": "",
        "4th": ""},


	        
    "outdoor_temperature": {
        "mean": 10,
        "sd": 10
    },
    "pressure": {
        "mean": 101325,
        "sd": 1000
    },
    "windows": [
        {
            "min": -99999,
            "max": -5,
            "quarter": 0.05,
            "full": 0.01
        },
        {
            "min": -5,
            "max": 15,
            "quarter": 0.1,
            "full": 0.05
        },
        {
            "min": 15,
            "max": 27,
            "quarter": 0.15,
            "full": 0.2
        },
        {
            "min": 27,
            "max": 99999,
            "quarter": 0.2,
            "full": 0.3
        }
    ],
    "vents_open": {
        "DELECTR": 0.04,
        "DCLOSER": 0.14,
        "DOOR": 0.5,
        "VVENT": 0.96
    },
    "c_const": 8,
    "evacuees_max_h_speed": {
        "mean": 120,
        "sd": 20
    },
    "evacuees_max_v_speed": {
        "mean": 80,
        "sd": 20
    },
    "evacuees_alpha_v": {
        "mean": 0.706,
        "sd": 0.069
    },
    "evacuees_beta_v": {
        "mean": -0.057,
        "sd": 0.015
    },
    "fire_starts_in_a_room": 0.9,
    "hrrpua": {
        "min": 300,
        "mode": 500,
        "max": 1300
    },
    "hrr_alpha": {
        "min": 0.00293,
        "mode": 0.01172,
        "max": 0.1876
    },
    "yields":
    {
        "soot": {
          "mean": 0,
          "sd": 0
        },
        "co": {
          "mean": 0,
          "sd": 0
        },
        "hcn": {
          "mean": 0,
          "sd": 0
    }},
    "heatcom": {
      "mean": 17100,
      "sd": 2000
    },
    "molecule": {
      "C": "",
      "H": "",
      "O": "",
      "N": "",
      "Cl": ""
    },
    "fuel": "random",
    "fire_load":
    {
        "room": {
            "mean": "",
            "sd": "",
            "1st": 100,
            "99th": 2000
        },
        "non_room": {
            "mean": "",
            "sd": "",
            "1st": 100,
            "99th": 800
    }},
    "radfrac": {
      "k": 124.48,
      "theta": 0.00217
    },
    "fire_area": {
      "b": 0.668,
      "scale": 0.775
    },
    "evacuees_density": { 
		"ROOM": 0.33, 
		"COR": 0.05, 
		"STAI": 0.05, 
		"HALL": 0.05 
	},
    "alarming": {
        "mean": 0,
        "sd": 0
    },
    "pre_evac": {
        "mean": "",
        "sd": "",
        "1st": 60,
        "99th": 180
    },
    "pre_evac_fire_origin": {
        "mean": "",
        "sd": "",
        "1st": 15,
        "99th": 60
    }
}';

	return json_decode($db[$q],1);
}
/*}}}*/
?>
