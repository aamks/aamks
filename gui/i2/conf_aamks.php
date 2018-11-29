<?php
session_name('aamks');
require_once("inc.php"); 

# /usr/local/aamks/gui/interface/src/app/enums/risk/enums/risk-enums.ts

# json_orig {{{
/*
{
    "general": {
        "project_id": 1,
        "scenario_id": 1,
        "number_of_simulations": 5,
        "simulation_time": 1200,
        "indoor_temperature": [
            20,
            20
        ],
        "outdoor_temperature": [
            10.75,
            10.75
        ],
        "indoor_pressure": 101325,
        "auto_stircaser": false
    },
    "characteristic": {
        "geometry_type": "office1",
        "material_ceiling": "concrete",
        "ceiling_thickness": "0.3",
        "material_floor": "concrete",
        "floor_thickness": "0.3",
        "material_wall": "brick",
        "wall_thickness": "0.2"
    },
    "infrastructure": {
        "has_detectors": false,
        "detectors": {
            "comment": "desc",
            "type": "heat",
            "trigger_temperature_mean_and_sd": [
                68,
                5
            ],
            "trigger_obscuration_mean_and_sd": [
                0,
                5
            ],
            "not_broken_probability": 0.96
        },
        "has_sprinklers": false,
        "sprinklers": {
            "comment": "desc",
            "trigger_temperature_mean_and_sd": [
                68,
                3
            ],
            "not_broken_probability": 0.96,
            "spray_density_mean_and_sd": [
                0.0005,
                0.0001
            ],
            "rti": 50
        },
        "has_nshevs": false,
        "nshevs": {
            "activation_time": 0
        },
        "cfast_static_records": []
    },
    "settings": {
        "heat_release_rate": {
            "comment": "desc",
            "hrrpua_min_mode_max": [
                150,
                500,
                650
            ],
            "alpha_min_mode_max": [
                0.0029,
                0.012,
                0.188
            ]
        },
        "window_open": {
            "comment": "desc",
            "setup": [
                {
                    "outside_temperature_range": [
                        -99999,
                        -5
                    ],
                    "window_is_quarter_open_probability": 0,
                    "window_is_full_open_probability": 0.11
                },
                {
                    "outside_temperature_range": [
                        -5,
                        15
                    ],
                    "window_is_quarter_open_probability": 0,
                    "window_is_full_open_probability": 0.5
                },
                {
                    "outside_temperature_range": [
                        15,
                        27
                    ],
                    "window_is_quarter_open_probability": 0.45,
                    "window_is_full_open_probability": 0.45
                },
                {
                    "outside_temperature_range": [
                        27,
                        99999
                    ],
                    "window_is_quarter_open_probability": 0,
                    "window_is_full_open_probability": 0.5
                }
            ]
        },
        "door_open": {
            "comment": "desc",
            "electro_magnet_door_is_open_probability": 0.04,
            "door_closer_door_is_open_probability": 0.14,
            "standard_door_is_open_probability": 0.5,
            "vvents_no_failure_probability": 0.96
        },
        "c_const": 8,
        "pre_evacuation_time": {
            "comment": "desc",
            "mean_and_sd_room_of_fire_origin": [
                59.85,
                1.48
            ],
            "mean_and_sd_ordinary_room": [
                29.13,
                8.87
            ]
        },
        "evacuees_concentration": {
            "comment": "desc",
            "COR": 20,
            "STAI": 50,
            "ROOM": 8,
            "HALL": 30
        },
        "evacuees_speed_params": {
            "comment": "desc",
            "max_h_speed_mean_and_sd": [
                120,
                20
            ],
            "max_v_speed_mean_and_sd": [
                80,
                20
            ],
            "beta_v_mean_and_sd": [
                -0.057,
                0.015
            ],
            "alpha_v_mean_and_sd": [
                0.706,
                0.069
            ]
        },
        "origin_of_fire": {
            "comment": "desc",
            "fire_starts_in_room_probability": 0.8
        }
    }
}
*/
/*}}}*/
function read_json($json_path) { /*{{{*/
	$conf=json_decode('
	{
		"basic": {
			"project_id": 1,
			"scenario_id": 1,
			"number_of_simulations": 1,
			"simulation_time": 100,
			"indoor_temperature":  [ { "min": -5, "max": 10 } ],
			"outdoor_temperature": [ { "min": -5, "max": 10 } ],
			"indoor_pressure": 101325,
			"geometry_type": "office1",
			"material": [ 
				{ "ceiling": "concrete" , "thickness" : 0.3 } ,
				{ "floor":   "concrete" , "thickness" : 0.3 } ,
				{ "wall":     "brick"   , "thickness" : 0.3 } 
			],
			"detectors": false,
			"detectors_type": "heat",
			"detectors_temp":   [ { "mean": 68, "sd": 5 } ],
			"detectors_obscur": [ { "mean": 0, "sd": 5 } ],
			"detectors_not_broken": 0.96,

			"sprinklers": false,
			"sprinklers_temp":    [ { "mean": 68, "sd": 3 } ],
			"sprinklers_density": [ { "mean": 0.0005, "sd": 0.0001 } ],
			"sprinklers_not_broken": 0.96,
			"sprinklers_rti": 50
		} ,

		"advanced": {


			"nshevs": false,
			"nshevs_activation_time": 0,

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
			"pre_evac_fire_origin": [ { "mean": 59.85 , "sd": 1.48 } ],
			"pre_evac_ordinary":    [ { "mean": 29.13 , "sd": 8.87 } ],

			"evacuees_concentration": [
				{ "room": "COR"  , "value": 20 } ,
				{ "room": "STAI" , "value": 50 } ,
				{ "room": "ROOM" , "value": 8  } ,
				{ "room": "HALL" , "value": 30 }
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

function geometry_type_droplist($in) {/*{{{*/
	if(empty($in)) { $in='pl'; }
	$select="<select name=post[geometry_type]>";
	$select.="<option value='$in'>$in</option>";
	$select.="<option value=pl>pl</option>";
	$select.="<option value=en>en</option>";
	$select.="<option value=de>de</option>";
	$select.="<option value=ru>ru</option>";
	$select.="<option value=fr>fr</option>";
	$select.="<option value=bg>bg</option>";
	$select.="<option value=hu>hu</option>";
	$select.="<option value=uk>uk</option>";
	$select.="</select>";
	return $select;
}
/*}}}*/
function material_droplist($i,$kk,$in) {/*{{{*/
	if(empty($in)) { $in='pl'; }
	$select="<select name=post[material][$i][$kk]>";
	$select.="<option value='$in'>$in</option>";
	$select.="<option value=cegła>cegła</option>";
	$select.="<option value=brick>brick</option>";
	$select.="</select>";
	return $select;
}
/*}}}*/
function detectors_type_droplist($in) {/*{{{*/
	if(empty($in)) { $in='pl'; }
	$select="<select name=post[detectors_type]>";
	$select.="<option value='$in'>$in</option>";
	$select.="<option value=X>X</option>";
	$select.="<option value=Y>Y</option>";
	$select.="</select>";
	return $select;
}
/*}}}*/
function sprinklers_type_droplist($in) {/*{{{*/
	if(empty($in)) { $in='pl'; }
	$select="<select name=post[sprinklers_type]>";
	$select.="<option value='$in'>$in</option>";
	$select.="<option value=X>X</option>";
	$select.="<option value=Y>Y</option>";
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
	$z="<table>";
	$i=0;
	foreach($arr as $k => $v) { 
		$z.="<tr>";
		foreach($v as $kk => $vv) { 
			if(in_array($kk, array('ceiling', 'wall', 'floor') )) { 
				$z.="<td>".get_help($kk)."<td>".material_droplist($i,$kk,$vv); 
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
	$z="<table>";
	$i=0;
	foreach($arr as $k => $v) { 
		$z.="<tr>";
		foreach($v as $kk => $vv) { 
			$z.="<td>".get_help($kk)."<td><input size=8 type=text name=post[$key][$i][$kk] value='$vv'><td>";
		}
		$i++;
	}
	$z.="</table>";
	return $z;
}
/*}}}*/
function update() {/*{{{*/
	if(empty($_POST['update_conf'])) { return; }
	dd($_POST['post']);
}
/*}}}*/

function form($json_path=NULL) { /*{{{*/
	$help=$_SESSION['help'];
	$json=read_json($json_path);
	dd($json);
	echo "<form method=post>";
	echo "<table>";
	echo "<tr><th>params<th>values";
	foreach($json['basic'] as $k=>$v) {

		if($k=='project_id')               { echo "<tr><td>".get_help($k)."<td>$v"; }
		else if($k=='scenario_id')         { echo "<tr><td>".get_help($k)."<td>$v"; }
		else if($k=='geometry_type')       { echo "<tr><td>".get_help($k)."<td>".geometry_type_droplist($v); }
		else if($k=='material')            { echo "<tr><td>$k<td>".form_material($v); }
		else if($k=='detectors_type')      { echo "<tr><td>".get_help($k)."<td>".detectors_type_droplist($v); }
		else if($k=='sprinklers_type')     { echo "<tr><td>".get_help($k)."<td>".sprinklers_type_droplist($v); }
		else if($k=='indoor_temperature')  { echo "<tr><td>".get_help($k)."<td>".form_plain_arr($k,$v); }
		else if($k=='outdoor_temperature') { echo "<tr><td>".get_help($k)."<td>".form_plain_arr($k,$v); }
		else if($k=='detectors_temp')      { echo "<tr><td>".get_help($k)."<td>".form_plain_arr($k,$v); }
		else if($k=='detectors_obscur')    { echo "<tr><td>".get_help($k)."<td>".form_plain_arr($k,$v); }
		else if($k=='sprinklers_temp')     { echo "<tr><td>".get_help($k)."<td>".form_plain_arr($k,$v); }
		else if($k=='sprinklers_density')  { echo "<tr><td>".get_help($k)."<td>".form_plain_arr($k,$v); }
		else                               { echo "<tr><td>".get_help($k)."<td><input type=text automplete=off size=10 name=post[$k] value='$v'>"; }
	}
	echo "</table>";
	echo "<input type=submit name=update_conf value='submit'></form>";
}
/*}}}*/
function main() {/*{{{*/
	if(empty($_SESSION['nn'])) { $_SESSION['nn']=new Aamks("Aamks") ; }
	$_SESSION['nn']->htmlHead("Aamks");
	$_SESSION['help']=make_help();
	echo "<a class=blink href=apainter>apainter</a><br>";
	update();
	form();
}
/*}}}*/
main();
function make_help() { /*{{{*/
	$help=[]                                                                                      ;
	$help["project_id"]              = ["project_id"            , "Some help" ]                   ;
	$help["scenario_id"]             = ["scenario_id"           , "We must write something here"] ;
	$help["number_of_simulations"]   = ["number of simulations" , "write me..."]                  ;
	$help["simulation_time"]         = ["simulation time"       , "write me..."]                  ;
	$help["indoor_temperature"]      = ["indoor_temperature"    , "write me..."]                  ;
	$help["outdoor_temperature"]     = ["outdoor_temperature"   , "write me..."]                  ;
	$help["indoor_pressure"]         = ["indoor_pressure"       , "write me..."]                  ;
	$help["ceiling"]				 = ["ceiling"               , "write me..."]                  ;
	$help["floor"]          		 = ["floor"                 , "write me..."]                  ;
	$help["wall"]           		 = ["wall"                  , "write me..."]                  ;
	$help["detectors"]           	 = ["detectors"             , "write me..."]                  ;
	$help["detectors_temp"]			 = ["detectors_temp"        , "write me..."] ;
	$help["detectors_obscur"]		 = ["detectors_obscur"      , "write me..."] ;
	$help["detectors_not_broken"]	 = ["detectors_not_broken"  , "write me..."] ;

	foreach($help as $k=>$v) { 
		$help[$k][1]="<withHelp>?<help>$v[1]</help></withHelp>";
	}
	return $help;
}
/*}}}*/

?>
