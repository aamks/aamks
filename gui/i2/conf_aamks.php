<?php
session_name('aamks');
require_once("inc.php"); 

# /usr/local/aamks/gui/interface/src/app/enums/risk/enums/risk-enums.ts

function make_buildings_db() { /*{{{*/
	$bdb=array();
	$bdb['Hotel']                     =array('type'=> 'c1' , 'hrr_alpha_mode'=> 0.047  , 'hrrpua'=> 500  , 'evacuees_concentration'=> array('ROOM'=>1    , 'COR'=> 1    , 'STAI'=> 1    , 'HALL'=> 1)  ) ;
	$bdb['Office (closed plan)']      =array('type'=> 'b'  , 'hrr_alpha_mode'=> 0.012  , 'hrrpua'=> 500  , 'evacuees_concentration'=> array('ROOM'=>8    , 'COR'=> 20   , 'STAI'=> 50   , 'HALL'=> 30) ) ;
	$bdb['Office (open plan)']        =array('type'=> 'a'  , 'hrr_alpha_mode'=> 0.012  , 'hrrpua'=> 500  , 'evacuees_concentration'=> array('ROOM'=>50   , 'COR'=> 10   , 'STAI'=> 50   , 'HALL'=> 10) ) ;
	$bdb['Amusement arcade']          =array('type'=> 'b'  , 'hrr_alpha_mode'=> 0.012  , 'hrrpua'=> 500  , 'evacuees_concentration'=> array('ROOM'=>0.5  , 'COR'=> 10   , 'STAI'=> 30   , 'HALL'=> 4)  ) ;
	$bdb['Archive/library']           =array('type'=> 'b'  , 'hrr_alpha_mode'=> 0.047  , 'hrrpua'=> 500  , 'evacuees_concentration'=> array('ROOM'=>5    , 'COR'=> 20   , 'STAI'=> 20   , 'HALL'=> 20) ) ;
	$bdb['Art gallery']               =array('type'=> 'b'  , 'hrr_alpha_mode'=> 0.012  , 'hrrpua'=> 500  , 'evacuees_concentration'=> array('ROOM'=>5    , 'COR'=> 20   , 'STAI'=> 20   , 'HALL'=> 20) ) ;
	$bdb['Assembly hall']             =array('type'=> 'b'  , 'hrr_alpha_mode'=> 0.012  , 'hrrpua'=> 500  , 'evacuees_concentration'=> array('ROOM'=>30   , 'COR'=> 30   , 'STAI'=> 30   , 'HALL'=> 30) ) ;
	$bdb['Bank']                      =array('type'=> 'b'  , 'hrr_alpha_mode'=> 0.0029 , 'hrrpua'=> 500  , 'evacuees_concentration'=> array('ROOM'=>3    , 'COR'=> 20   , 'STAI'=> 20   , 'HALL'=> 20) ) ;
	$bdb['Bar']                       =array('type'=> 'b'  , 'hrr_alpha_mode'=> 0.012  , 'hrrpua'=> 500  , 'evacuees_concentration'=> array('ROOM'=>0.3  , 'COR'=> 10   , 'STAI'=> 10   , 'HALL'=> 10) ) ;
	$bdb['Bazaar']                    =array('type'=> 'b'  , 'hrr_alpha_mode'=> 0.047  , 'hrrpua'=> 500  , 'evacuees_concentration'=> array('ROOM'=>2    , 'COR'=> 20   , 'STAI'=> 20   , 'HALL'=> 20) ) ;
	$bdb['Business centre']           =array('type'=> 'b'  , 'hrr_alpha_mode'=> 0.012  , 'hrrpua'=> 500  , 'evacuees_concentration'=> array('ROOM'=>7    , 'COR'=> 20   , 'STAI'=> 20   , 'HALL'=> 20) ) ;
	$bdb['Canteen']                   =array('type'=> 'a'  , 'hrr_alpha_mode'=> 0.012  , 'hrrpua'=> 500  , 'evacuees_concentration'=> array('ROOM'=>1    , 'COR'=> 10   , 'STAI'=> 20   , 'HALL'=> 10) ) ;
	$bdb['School']                    =array('type'=> 'a'  , 'hrr_alpha_mode'=> 0.012  , 'hrrpua'=> 500  , 'evacuees_concentration'=> array('ROOM'=>2    , 'COR'=> 10   , 'STAI'=> 20   , 'HALL'=> 20) ) ;
	$bdb['Schopping mall']            =array('type'=> 'b'  , 'hrr_alpha_mode'=> 0.012  , 'hrrpua'=> 500  , 'evacuees_concentration'=> array('ROOM'=>4    , 'COR'=> 10   , 'STAI'=> 10   , 'HALL'=> 4)  ) ;
	$bdb['Dance area']                =array('type'=> 'b'  , 'hrr_alpha_mode'=> 0.012  , 'hrrpua'=> 500  , 'evacuees_concentration'=> array('ROOM'=>0.5  , 'COR'=> 1    , 'STAI'=> 1    , 'HALL'=> 1)  ) ;
	$bdb['Dromitory']                 =array('type'=> 'c2' , 'hrr_alpha_mode'=> 0.012  , 'hrrpua'=> 500  , 'evacuees_concentration'=> array('ROOM'=>5    , 'COR'=> 10   , 'STAI'=> 10   , 'HALL'=> 10) ) ;
	$bdb['Exhibition area']           =array('type'=> 'b'  , 'hrr_alpha_mode'=> 0.047  , 'hrrpua'=> 500  , 'evacuees_concentration'=> array('ROOM'=>1.5  , 'COR'=> 1.5  , 'STAI'=> 10   , 'HALL'=> 1.5)) ;
	$bdb['Factory area']              =array('type'=> 'a'  , 'hrr_alpha_mode'=> 0.047  , 'hrrpua'=> 500  , 'evacuees_concentration'=> array('ROOM'=>5    , 'COR'=> 10   , 'STAI'=> 20   , 'HALL'=> 10) ) ;
	$bdb['Gym or leisure centre']     =array('type'=> 'b'  , 'hrr_alpha_mode'=> 0.012  , 'hrrpua'=> 500  , 'evacuees_concentration'=> array('ROOM'=>1    , 'COR'=> 1    , 'STAI'=> 1    , 'HALL'=> 1)  ) ;
	$bdb['Museum']                    =array('type'=> 'b'  , 'hrr_alpha_mode'=> 0.012  , 'hrrpua'=> 500  , 'evacuees_concentration'=> array('ROOM'=>0.6  , 'COR'=> 10   , 'STAI'=> 10   , 'HALL'=> 10) ) ;
	$bdb['Restaurant']                =array('type'=> 'b'  , 'hrr_alpha_mode'=> 0.012  , 'hrrpua'=> 500  , 'evacuees_concentration'=> array('ROOM'=>1    , 'COR'=> 10   , 'STAI'=> 10   , 'HALL'=> 10) ) ;
	$bdb['Shop sales']                =array('type'=> 'b'  , 'hrr_alpha_mode'=> 0.047  , 'hrrpua'=> 500  , 'evacuees_concentration'=> array('ROOM'=>2    , 'COR'=> 5    , 'STAI'=> 10   , 'HALL'=> 2)  ) ;
	$bdb['Storage or warehousing']    =array('type'=> 'a'  , 'hrr_alpha_mode'=> 0.18   , 'hrrpua'=> 500  , 'evacuees_concentration'=> array('ROOM'=>30   , 'COR'=> 30   , 'STAI'=> 30   , 'HALL'=> 30) ) ;
	$bdb['Theatre / concert hall']    =array('type'=> 'b'  , 'hrr_alpha_mode'=> 0.012  , 'hrrpua'=> 500  , 'evacuees_concentration'=> array('ROOM'=>0.4  , 'COR'=> 10   , 'STAI'=> 10   , 'HALL'=> 10) ) ;
	$bdb['Medical day centre']        =array('type'=> 'd1' , 'hrr_alpha_mode'=> 0.012  , 'hrrpua'=> 500  , 'evacuees_concentration'=> array('ROOM'=>7    , 'COR'=> 10   , 'STAI'=> 10   , 'HALL'=> 10) ) ;
	$bdb['Hospital / nursing home']   =array('type'=> 'd2' , 'hrr_alpha_mode'=> 0.012  , 'hrrpua'=> 500  , 'evacuees_concentration'=> array('ROOM'=>10   , 'COR'=> 20   , 'STAI'=> 20   , 'HALL'=> 20) ) ;
	$bdb['Railway station / airport'] =array('type'=> 'e'  , 'hrr_alpha_mode'=> 0.012  , 'hrrpua'=> 500  , 'evacuees_concentration'=> array('ROOM'=>2    , 'COR'=> 10   , 'STAI'=> 10   , 'HALL'=> 10) ) ;
	$bdb['Custom']					  =array('type'=> NULL , 'hrr_alpha_mode'=> NULL   , 'hrrpua'=> NULL , 'evacuees_concentration'=> array('ROOM'=>NULL , 'COR'=> NULL , 'STAI'=> NULL , 'HALL'=> NULL) ) ;
	$_SESSION['buildings_db']=$bdb ;
}
/*}}}*/
function read_json($json_path) { /*{{{*/
	$conf=json_decode('
	{
		"basic": {
			"project_id": 1,
			"scenario_id": 1,
			"number_of_simulations": 1,
			"simulation_time": 100,
			"building_profile": [ { "type": "Bank", "management": "M1", "complexity": "B1", "alarming": "A1" } ],
			"material": [ 
				{ "ceiling": "concrete" , "thickness" : 0.3 } ,
				{ "floor":   "concrete" , "thickness" : 0.3 } ,
				{ "wall":     "brick"   , "thickness" : 0.3 } 
			],

			"heat_detectors":  [ { "temp_mean": 68, "temp_sd": 5, "RTI": 50, "not_broken": 0.96 } ],
			"smoke_detectors": [ { "temp_mean": 68, "temp_sd": 5, "not_broken": 0.96 } ],
			"sprinklers":	   [ { "temp_mean": 68, "temp_sd": 5, "density_mean": 0.0005, "density_sd": 0.0001, "RTI": 50, "not_broken": 0.96 } ],
			"nshevs_activation_time": 0


		} ,

		"advanced": {
			"indoor_temperature":  [ { "min": -5, "max": 10 } ],
			"outdoor_temperature": [ { "min": -5, "max": 10 } ],
			"indoor_pressure": 101325,
			"pre_evac":				[ { "mean": 29.13 , "sd": 8.87 } ],
			"pre_evac_fire_origin": [ { "mean": 59.85 , "sd": 1.48 } ],

			"hrrpua":	 [ { "min": 300    , "mode": 1000  , "max": 1300 }  ],
			"hrr_alpha": [ { "min": 0.0029 , "mode": 0.047 , "max": 0.188 } ],

			"windows": [ 
				{ "min": -99999 , "max": -5    , "quarter": -5 , "full": 0.11 } ,
				{ "min": -5     , "max": 15    , "quarter": 0  , "full": 0.5 }  ,
				{ "min": 15     , "max": 27    , "quarter": 0  , "full": 0.5 }  ,
				{ "min": 27     , "max": 99999 , "quarter": 0  , "full": 0.5 }
			], 

			"doors": [ { "E": 0.04, "C": 0.14, "D": 0.5 } ],
			"vvents_not_broken": 0.96,
			"c_const": 8,

			"evacuees_concentration": [
				{ "COR": 20 } ,
				{ "STAI": 50 } ,
				{ "ROOM": 8  } ,
				{ "HALL": 30 }
			],

			"evacuees_max_h_speed" : [ { "mean" : 120    , "sd" : 20 }    ],
			"evacuees_max_v_speed" : [ { "mean" : 80     , "sd" : 20 }    ],
			"evacuees_alpha_v"     : [ { "mean" : 0.706  , "sd" : 0.069 } ],
			"evacuees_beta_v"      : [ { "mean" : -0.057 , "sd" : 0.015 } ],
			"fire_starts_in_room"  : 0.8

		}

	}',1);

	return $conf;
}
/*}}}*/

function droplist_material($i,$kk,$in) {/*{{{*/
	$select="<select name=post[material][$i][$kk]>";
	$select.="<option value='$in'>$in</option>";
	$select.="<option value=''></option>";
	$select.="<option value=brick>brick</option>";
	$select.="<option value=concrete>concrete</option>";
	$select.="<option value=gypsum>gypsum</option>";
	$select.="</select>";
	return $select;
}
/*}}}*/
function droplist_building_profile($in) {/*{{{*/
	if(empty($in)) { $in='pl'; }
	$select="<select name=post[building_profile][type]>";
	$select.="<option value='$in'>$in</option>";
	foreach(array_keys($_SESSION['buildings_db']) as $k) { 
		$select.="<option value=$k>$k</option>";
	}
	$select.="</select>";
	return $select;
}
/*}}}*/
function droplist_alarming($in) { /*{{{*/
	$select="<select name=post[building_profile][alarming]>";
	$select.="<option value='$in'>$in</option>";
	$select.="<option value=''></option>";
	$select.="<option value=A1>A1</option>";
	$select.="<option value=A2>A2</option>";
	$select.="<option value=A3>A3</option>";
	$select.="</select>";
	return $select;
}
/*}}}*/
function droplist_complexity($in) { /*{{{*/
	$select="<select name=post[building_profile][complexity]>";
	$select.="<option value='$in'>$in</option>";
	$select.="<option value=''></option>";
	$select.="<option value=B1>B1</option>";
	$select.="<option value=B2>B2</option>";
	$select.="<option value=B3>B3</option>";
	$select.="</select>";
	return $select;
}
/*}}}*/
function droplist_management($in) { /*{{{*/
	$select="<select name=post[building_profile][management]>";
	$select.="<option value='$in'>$in</option>";
	$select.="<option value=''></option>";
	$select.="<option value=M1>M1</option>";
	$select.="<option value=M2>M2</option>";
	$select.="<option value=M3>M3</option>";
	$select.="</select>";
	return $select;
}
/*}}}*/

function get_help($k) { # {{{
	if(isset($_SESSION['help'][$k])) { 
		return implode("&nbsp;", $_SESSION['help'][$k]);
	} else {
		return $k;
	}
}
/*}}}*/
function form_material($arr) { #{{{
	$z="";
	$z="<table class=noborder>";
	$i=0;
	foreach($arr as $k => $v) { 
		$z.="<tr>";
		foreach($v as $kk => $vv) { 
			if(in_array($kk, array('ceiling', 'wall', 'floor') )) { 
				$z.="<td>$kk<td>".droplist_material($i,$kk,$vv); 
			} else {
				$z.="<td>".get_help($kk)."<td><input size=2 type=text name=post[material][$i][$kk] value='$vv'><td>";
			}
		}
		$i++;
	}
	$z.="</table>";
	return $z;
}
/*}}}*/
function form_plain_arr($key,$arr) { #{{{
	$z="";
	$z="<table class=noborder>";
	$i=0;
	foreach($arr as $k => $v) { 
		$z.="<tr>";
		foreach($v as $kk => $vv) { 
			$z.="<td>".get_help($kk)."<br><input size=8 type=text name=post[$key][$i][$kk] value='$vv'>";
		}
		$i++;
	}
	$z.="</table>";
	return $z;
}
/*}}}*/
function update() {/*{{{*/
	if(empty($_POST['update_conf'])) { return; }
	#dd(json_encode($_POST['post'], JSON_NUMERIC_CHECK));
	dd($_POST['post']);
}
/*}}}*/
function building_fields($v) {/*{{{*/
	$x=$v[0];
	$z=[];
	$z[]="type<br>".droplist_building_profile($x['type']); 
	$z[]=get_help("management")."<br>".droplist_management($x['management']); 
	$z[]="complexity<br>".droplist_complexity($x['complexity']); 
	$z[]="alarming<br>".droplist_alarming($x['alarming']); 

	$out="<table class=noborder><tr><td>".implode("<td>", $z)."</table>";
	return $out;
}
/*}}}*/
function form($json_path=NULL) { /*{{{*/
	$help=$_SESSION['help'];
	$json=read_json($json_path);
	#dd($json);
	echo "<form method=post>";
	echo "<table>";
	echo "<tr><th>params<th>values";
	foreach($json['basic'] as $k=>$v) {

		if($k=='project_id')                  { echo "<tr><td>".get_help($k)."<td>$v"; }
		else if($k=='scenario_id')            { echo "/$v"; }
		else if($k=='building_profile')       { echo "<tr><td>".get_help($k)."<td>".building_fields($v); }
		else if($k=='pre_evac')               { echo "<tr><td>".get_help($k)."<td>".form_plain_arr($k,$v); }
		else if($k=='pre_evac_fire_origin')   { echo "<tr><td>".get_help($k)."<td>".form_plain_arr($k,$v); }
		else if($k=='material')               { echo "<tr><td>".get_help($k)."<td>".form_material($v); }
		else if($k=='heat_detectors')         { echo "<tr><td>".get_help($k)."<td>".form_plain_arr($k,$v); }
		else if($k=='smoke_detectors')        { echo "<tr><td>".get_help($k)."<td>".form_plain_arr($k,$v); }
		else if($k=='sprinklers')             { echo "<tr><td>".get_help($k)."<td>".form_plain_arr($k,$v); }
		else if($k=='indoor_temperature')     { echo "<tr><td>".get_help($k)."<td>".form_plain_arr($k,$v); }
		else if($k=='outdoor_temperature')    { echo "<tr><td>".get_help($k)."<td>".form_plain_arr($k,$v); }
		else if($k=='detectors_temp')         { echo "<tr><td>".get_help($k)."<td>".form_plain_arr($k,$v); }
		else if($k=='detectors_obscur')       { echo "<tr><td>".get_help($k)."<td>".form_plain_arr($k,$v); }
		else if($k=='sprinklers_temp')        { echo "<tr><td>".get_help($k)."<td>".form_plain_arr($k,$v); }
		else if($k=='sprinklers_density')     { echo "<tr><td>".get_help($k)."<td>".form_plain_arr($k,$v); }
		else if($k=='hrrpua')                 { echo "<tr><td>".get_help($k)."<td>".form_plain_arr($k,$v); }
		else if($k=='hrr_alpha')              { echo "<tr><td>".get_help($k)."<td>".form_plain_arr($k,$v); }
		else if($k=='windows')                { echo "<tr><td>".get_help($k)."<td>".form_plain_arr($k,$v); }
		else if($k=='doors')                  { echo "<tr><td>".get_help($k)."<td>".form_plain_arr($k,$v); }
		else if($k=='evacuees_concentration') { echo "<tr><td>".get_help($k)."<td>".form_plain_arr($k,$v); }
		else if($k=='evacuees_max_h_speed')   { echo "<tr><td>".get_help($k)."<td>".form_plain_arr($k,$v); }
		else if($k=='evacuees_max_v_speed')   { echo "<tr><td>".get_help($k)."<td>".form_plain_arr($k,$v); }
		else if($k=='evacuees_alpha_v')       { echo "<tr><td>".get_help($k)."<td>".form_plain_arr($k,$v); }
		else if($k=='evacuees_beta_v')        { echo "<tr><td>".get_help($k)."<td>".form_plain_arr($k,$v); }
		else                                  { echo "<tr><td>".get_help($k)."<td><input type=text automplete=off size=10 name=post[$k] value='$v'>"; }
	}
	echo "</table>";
	echo "<input type=submit name=update_conf value='submit'></form>";
}
/*}}}*/
function main() {/*{{{*/
	if(empty($_SESSION['nn'])) { $_SESSION['nn']=new Aamks("Aamks") ; }
	$_SESSION['nn']->htmlHead("Aamks");
	echo "<a class=blink href=apainter>apainter</a><br>";

	make_help();
	make_buildings_db();
	#dd($_SESSION['buildings_db']);
	update();
	form();
}
/*}}}*/
main();
function make_help() { /*{{{*/
	$help=[]                                                                                                                                                              ;
	$help["project_id"]              = ["scanario"                                          , "Some help" ]                                                               ;
	$help["number_of_simulations"]   = ["number of simulations"                             , "write me..."]                                                              ;
	$help["simulation_time"]         = ["simulation time"                                   , "write me..."]                                                              ;
	$help["indoor_temperature"]      = ["indoor_temperature"                                , "write me..."]                                                              ;
	$help["outdoor_temperature"]     = ["outdoor_temperature"                               , "write me..."]                                                              ;
	$help["indoor_pressure"]         = ["indoor_pressure"                                   , "write me..."]                                                              ;
	$help["ceiling"]				 = ["ceiling"                                           , "write me..."]                                                              ;
	$help["floor"]          		 = ["floor"                                             , "write me..."]                                                              ;
	$help["wall"]           		 = ["wall"                                              , "write me..."]                                                              ;
	$help["detectors"]           	 = ["detectors"                                         , "write me..."]                                                              ;
	$help["detectors_temp"]			 = ["detectors_temp"                                    , "write me..."]                                                              ;
	$help["detectors_obscur"]		 = ["detectors_obscur"                                  , "write me..."]                                                              ;
	$help["detectors_not_broken"]	 = ["detectors_not_broken"                              , "write me..."]                                                              ;
	$help["windows"]				 = ["windows"                                           , "help for the windows <br>aa <br>aa <br>aa <br>aa <br>aa <br>aa <br>aa " ]  ;
	$help["building_profile"]		 = ["building profile"                                  , "help for the windows <br>aa <br>aa <br>aa <br>aa <br>aa <br>aa <br>aa " ]  ;
	$help["material"]				 = ["material"                                          , "help for the material <br>aa <br>aa <br>aa <br>aa <br>aa <br>aa <br>aa " ] ;
	$help["pre_evac"]				 = ["pre-evacuation time"                               , "help for the material <br>aa <br>aa <br>aa <br>aa <br>aa <br>aa <br>aa " ] ;
	$help["pre_evac_fire_origin"]	 = ["pre-evacuation time in<br>the room of fire origin" , "fire origin room" ]                                                        ;
	$help["management"]			     = ["management"                                        , "help for management" ]                                                     ;
	$help["temp_mean"]			     = ["temp mean"                                         , "help for temp mean" ]                                                     ;

	foreach($help as $k=>$v) { 
		$help[$k][1]="<withHelp>?<help>$v[1]</help></withHelp>";
	}
	$_SESSION['help']=$help;
}
/*}}}*/

?>
