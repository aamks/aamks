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
			"indoor_temperature":  { "min": -5, "max": 10 },
			"outdoor_temperature": { "min": -5, "max": 10 },
			"indoor_pressure": 101325,
			"geometry_type": "office1",
			"material": [ 
				{ "ceiling": "concrete" , "thickness" : 0.3 } ,
				{ "floor":   "concrete" , "thickness" : 0.3 } ,
				{ "wall":     "brick"   , "thickness" : 0.3 } 
			]
		} ,

		"advanced": {
			"detectors": false,
			"detectors_type": "heat",
			"detectors_temp":   { "mean": 68, "sd": 5 },
			"detectors_obscur": { "mean": 0, "sd": 5 },
			"detectors_not_broken": 0.96,

			"sprinklers": false,
			"sprinklers_temp":    { "mean": 68, "sd": 3 },
			"sprinklers_density": { "mean": 0.0005, "sd": 0.0001 },
			"sprinklers_not_broken": 0.96,
			"sprinklers_rti": 50,

			"nshevs": false,
			"nshevs_activation_time": 0,

			"hrrpua":	 { "min": 300    , "mode": 1000  , "max": 1300 }  ,
			"hrr_alpha": { "min": 0.0029 , "mode": 0.047 , "max": 0.188 } ,

			"windows": [ 
				{ "min": -99999 , "max": -5    , "quarter": -5 , "full": 0.11 } ,
				{ "min": -5     , "max": 15    , "quarter": 0  , "full": 0.5 }  ,
				{ "min": 15     , "max": 27    , "quarter": 0  , "full": 0.5 }  ,
				{ "min": 27     , "max": 99999 , "quarter": 0  , "full": 0.5 }
			], 

			"doors": { "E": 0.04, "C": 0.14, "D": 0.5 },
			"vvents_not_broken": 0.96,
			"c_const": 8,
			"pre_evac_fire_origin": { "mean": 59.85 , "sd": 1.48 } ,
			"pre_evac_ordinary":    { "mean": 29.13 , "sd": 8.87 } ,

			"evacuees_concentration": [
				{ "room": "COR"  , "value": 20 } ,
				{ "room": "STAI" , "value": 50 } ,
				{ "room": "ROOM" , "value": 8  } ,
				{ "room": "HALL" , "value": 30 }
			],

			"evacuees_max_h_speed" : { "mean" : 120    , "sd" : 20 }    ,
			"evacuees_max_v_speed" : { "mean" : 80     , "sd" : 20 }    ,
			"evacuees_alpha_v"     : { "mean" : 0.706  , "sd" : 0.069 } ,
			"evacuees_beta_v"      : { "mean" : -0.057 , "sd" : 0.015 } ,
			"fire_starts_in_room"  : 0.8

		}
	}',1);

	return $conf;
}
/*}}}*/
function make_help() { /*{{{*/
	$help=[];
	$help["project_id"]              = ["project_id", "Some help" ]      ;
	$help["scenario_id"]             = ["scenario_id", "We must write something here"] ;
	$help["number_of_simulations"]   = ["number of simulations"   , "write me..."] ;
	$help["simulation_time"]         = ["simulation time"         , "write me..."] ;
	$help["indoor_temperature_min"]  = ["indoor_temperature_min"  , "write me..."] ;
	$help["indoor_temperature_max"]  = ["indoor_temperature_max"  , "write me..."] ;
	$help["outdoor_temperature_min"] = ["outdoor_temperature_min" , "write me..."] ;
	$help["outoor_temperature_max"]  = ["outoor_temperature_max"  , "write me..."] ;
	$help["indoor_pressure"]         = ["indoor_pressure"         , "write me..."] ;
	$help["geometry_type"]           = ["geometry_type"           , "write me..."] ;
	$help["material_ceiling"]        = ["material_ceiling"        , "write me..."] ;
	$help["ceiling_thickness"]       = ["ceiling_thickness"       , "write me..."] ;
	$help["material_floor"]          = ["material_floor"          , "write me..."] ;
	$help["floor_thickness"]         = ["floor_thickness"         , "write me..."] ;
	$help["material_wall"]           = ["material_wall"           , "write me..."] ;
	$help["wall_thickness"]          = ["wall_thickness"          , "write me..."] ;

	foreach($help as $k=>$v) { 
		$help[$k][1]="<withHelp>?<help>$v[1]</help></withHelp>";
	}
	return $help;
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
function material_ceiling_droplist($in) {/*{{{*/
	if(empty($in)) { $in='pl'; }
	$select="<select name=post[material_ceiling]>";
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
function material_wall_droplist($in) {/*{{{*/
	if(empty($in)) { $in='pl'; }
	$select="<select name=post[material_wall]>";
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
function material_floor_droplist($in) {/*{{{*/
	if(empty($in)) { $in='pl'; }
	$select="<select name=post[material_floor]>";
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
function form($json_path=NULL) { /*{{{*/
	$help=make_help();
	$json=read_json($json_path);
	echo "<form method=post>";
	echo "<table>";
	echo "<tr><th>param<th colspan=4>value<th>help";
	$input="input type=text autocomplete=off";
	$ceiling_thickness=" <td>ceiling_thickness<td> <input type=text size=2 name=post[ceiling_thickness] value=".$json['basic']['ceiling_thickness'].">";
	$floor_thickness="   <td>floor_thickness  <td> <input type=text size=2 name=post[floor_thickness]   value=".$json['basic']['floor_thickness'].">";
	$wall_thickness="    <td>wall_thickness   <td> <input type=text size=2 name=post[wall_thickness]    value=".$json['basic']['wall_thickness'].">";
	unset($json['basic']['ceiling_thickness']);
	unset($json['basic']['floor_thickness']);
	unset($json['basic']['wall_thickness']);
	foreach($json['basic'] as $k=>$v)   {
		if($k=='project_id')            { echo "<tr><td>".$help[$k][0]."<td colspan=4>$v<td>".$help[$k][1]; }
		else if($k=='scenario_id')      { echo "<tr><td>".$help[$k][0]."<td colspan=4>$v<td>".$help[$k][1]; }
		else if($k=='geometry_type')    { echo "<tr><td>".$help[$k][0]."<td colspan=4>".geometry_type_droplist($v)."<td>".$help[$k][1]; }
		else if($k=='material_ceiling') { echo "<tr><td>".$help[$k][0]."<td>".material_ceiling_droplist($v)."<td>$ceiling_thickness<td>".$help[$k][1]; }
		else if($k=='material_wall')    { echo "<tr><td>".$help[$k][0]."<td>".material_wall_droplist($v)."<td>$wall_thickness<td>".$help[$k][1]; }
		else if($k=='material_floor')   { echo "<tr><td>".$help[$k][0]."<td>".material_floor_droplist($v)."<td>$floor_thickness<td>".$help[$k][1]; }
		else                            { echo "<tr><td>".$help[$k][0]."<td colspan=4><input type=text automplete=off size=10 name=post[$k] value='$v'><td>".$help[$k][1]; }
	}
	echo "</table>";
	echo "<input type=submit name=update_conf value='submit'></form>";
}
/*}}}*/
function update() {/*{{{*/
	if(empty($_POST['update_conf'])) { return; }
	dd($_POST['post']);
}
/*}}}*/
function main() {/*{{{*/
	if(empty($_SESSION['nn'])) { $_SESSION['nn']=new Aamks("Aamks") ; }
	$_SESSION['nn']->htmlHead("Aamks");
	echo "<a class=blink href=apainter>apainter</a><br>";
	update();
	form();
}
/*}}}*/
main();

?>
