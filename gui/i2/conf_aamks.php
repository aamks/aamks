<?php
session_name('aamks');
require_once("inc.php"); 

# /usr/local/aamks/gui/interface/src/app/enums/risk/enums/risk-enums.ts

function make_buildings_db() { /*{{{*/
	$bdb=array();
	$bdb['hotel']=array(     'label'=> 'Hotel'                            , 'type'=> 'c1' , 'alphaMod'=> 0.047  , 'hrrpua'=> 500 , 'evacRoomDensity'=> 1   , 'evacCorridorDensity'=> 1   , 'evacStaircaseDensity'=> 1  , 'evacHallDensity'=> 1)   ;
	$bdb['office1']=array(   'label'=> 'Office (closed plan)'             , 'type'=> 'b'  , 'alphaMod'=> 0.012  , 'hrrpua'=> 500 , 'evacRoomDensity'=> 8   , 'evacCorridorDensity'=> 20  , 'evacStaircaseDensity'=> 50 , 'evacHallDensity'=> 30)  ;
	$bdb['office2']=array(   'label'=> 'Office (open plan)'               , 'type'=> 'a'  , 'alphaMod'=> 0.012  , 'hrrpua'=> 500 , 'evacRoomDensity'=> 50  , 'evacCorridorDensity'=> 10  , 'evacStaircaseDensity'=> 50 , 'evacHallDensity'=> 10)  ;
	$bdb['arcade']=array(    'label'=> 'Amusement arcade'                 , 'type'=> 'b'  , 'alphaMod'=> 0.012  , 'hrrpua'=> 500 , 'evacRoomDensity'=> 0.5 , 'evacCorridorDensity'=> 10  , 'evacStaircaseDensity'=> 30 , 'evacHallDensity'=> 4)   ;
	$bdb['library']=array(   'label'=> 'Archive/library'                  , 'type'=> 'b'  , 'alphaMod'=> 0.047  , 'hrrpua'=> 500 , 'evacRoomDensity'=> 5   , 'evacCorridorDensity'=> 20  , 'evacStaircaseDensity'=> 20 , 'evacHallDensity'=> 20)  ;
	$bdb['gallery']=array(   'label'=> 'Art gallery'                      , 'type'=> 'b'  , 'alphaMod'=> 0.012  , 'hrrpua'=> 500 , 'evacRoomDensity'=> 5   , 'evacCorridorDensity'=> 20  , 'evacStaircaseDensity'=> 20 , 'evacHallDensity'=> 20)  ;
	$bdb['assembly']=array(  'label'=> 'Assembly hall'                    , 'type'=> 'b'  , 'alphaMod'=> 0.012  , 'hrrpua'=> 500 , 'evacRoomDensity'=> 30  , 'evacCorridorDensity'=> 30  , 'evacStaircaseDensity'=> 30 , 'evacHallDensity'=> 30)  ;
	$bdb['bank']=array(      'label'=> 'Bank'                             , 'type'=> 'b'  , 'alphaMod'=> 0.0029 , 'hrrpua'=> 500 , 'evacRoomDensity'=> 3   , 'evacCorridorDensity'=> 20  , 'evacStaircaseDensity'=> 20 , 'evacHallDensity'=> 20)  ;
	$bdb['bar']=array(       'label'=> 'Bar'                              , 'type'=> 'b'  , 'alphaMod'=> 0.012  , 'hrrpua'=> 500 , 'evacRoomDensity'=> 0.3 , 'evacCorridorDensity'=> 10  , 'evacStaircaseDensity'=> 10 , 'evacHallDensity'=> 10)  ;
	$bdb['bazaar']=array(    'label'=> 'Bazaar'                           , 'type'=> 'b'  , 'alphaMod'=> 0.047  , 'hrrpua'=> 500 , 'evacRoomDensity'=> 2   , 'evacCorridorDensity'=> 20  , 'evacStaircaseDensity'=> 20 , 'evacHallDensity'=> 20)  ;
	$bdb['business']=array(  'label'=> 'Business centre'                  , 'type'=> 'b'  , 'alphaMod'=> 0.012  , 'hrrpua'=> 500 , 'evacRoomDensity'=> 7   , 'evacCorridorDensity'=> 20  , 'evacStaircaseDensity'=> 20 , 'evacHallDensity'=> 20)  ;
	$bdb['canteen']=array(   'label'=> 'Canteen'                          , 'type'=> 'a'  , 'alphaMod'=> 0.012  , 'hrrpua'=> 500 , 'evacRoomDensity'=> 1   , 'evacCorridorDensity'=> 10  , 'evacStaircaseDensity'=> 20 , 'evacHallDensity'=> 10)  ;
	$bdb['school']=array(    'label'=> 'School'                           , 'type'=> 'a'  , 'alphaMod'=> 0.012  , 'hrrpua'=> 500 , 'evacRoomDensity'=> 2   , 'evacCorridorDensity'=> 10  , 'evacStaircaseDensity'=> 20 , 'evacHallDensity'=> 20)  ;
	$bdb['mall']=array(      'label'=> 'Schopping mall'                   , 'type'=> 'b'  , 'alphaMod'=> 0.012  , 'hrrpua'=> 500 , 'evacRoomDensity'=> 4   , 'evacCorridorDensity'=> 10  , 'evacStaircaseDensity'=> 10 , 'evacHallDensity'=> 4)   ;
	$bdb['dance']=array(     'label'=> 'Dance area'                       , 'type'=> 'b'  , 'alphaMod'=> 0.012  , 'hrrpua'=> 500 , 'evacRoomDensity'=> 0.5 , 'evacCorridorDensity'=> 1   , 'evacStaircaseDensity'=> 1  , 'evacHallDensity'=> 1)   ;
	$bdb['dormitory']=array( 'label'=> 'Dromitory'                        , 'type'=> 'c2' , 'alphaMod'=> 0.012  , 'hrrpua'=> 500 , 'evacRoomDensity'=> 5   , 'evacCorridorDensity'=> 10  , 'evacStaircaseDensity'=> 10 , 'evacHallDensity'=> 10)  ;
	$bdb['exibition']=array( 'label'=> 'Exhibiotion area'                 , 'type'=> 'b'  , 'alphaMod'=> 0.047  , 'hrrpua'=> 500 , 'evacRoomDensity'=> 1.5 , 'evacCorridorDensity'=> 1.5 , 'evacStaircaseDensity'=> 10 , 'evacHallDensity'=> 1.5) ;
	$bdb['factory']=array(   'label'=> 'Factory area'                     , 'type'=> 'a'  , 'alphaMod'=> 0.047  , 'hrrpua'=> 500 , 'evacRoomDensity'=> 5   , 'evacCorridorDensity'=> 10  , 'evacStaircaseDensity'=> 20 , 'evacHallDensity'=> 10)  ;
	$bdb['gym']=array(       'label'=> 'Gym or leisure centre'            , 'type'=> 'b'  , 'alphaMod'=> 0.012  , 'hrrpua'=> 500 , 'evacRoomDensity'=> 1   , 'evacCorridorDensity'=> 1   , 'evacStaircaseDensity'=> 1  , 'evacHallDensity'=> 1)   ;
	$bdb['museum']=array(    'label'=> 'Museum'                           , 'type'=> 'b'  , 'alphaMod'=> 0.012  , 'hrrpua'=> 500 , 'evacRoomDensity'=> 0.6 , 'evacCorridorDensity'=> 10  , 'evacStaircaseDensity'=> 10 , 'evacHallDensity'=> 10)  ;
	$bdb['restaurant']=array('label'=> 'Restaurant'                       , 'type'=> 'b'  , 'alphaMod'=> 0.012  , 'hrrpua'=> 500 , 'evacRoomDensity'=> 1   , 'evacCorridorDensity'=> 10  , 'evacStaircaseDensity'=> 10 , 'evacHallDensity'=> 10)  ;
	$bdb['shop']=array(      'label'=> 'Shop sales'                       , 'type'=> 'b'  , 'alphaMod'=> 0.047  , 'hrrpua'=> 500 , 'evacRoomDensity'=> 2   , 'evacCorridorDensity'=> 5   , 'evacStaircaseDensity'=> 10 , 'evacHallDensity'=> 2)   ;
	$bdb['storage']=array(   'label'=> 'Storage or warehousing'           , 'type'=> 'a'  , 'alphaMod'=> 0.18   , 'hrrpua'=> 500 , 'evacRoomDensity'=> 30  , 'evacCorridorDensity'=> 30  , 'evacStaircaseDensity'=> 30 , 'evacHallDensity'=> 30)  ;
	$bdb['theatre']=array(   'label'=> 'Theatre cinema concert hall'      , 'type'=> 'b'  , 'alphaMod'=> 0.012  , 'hrrpua'=> 500 , 'evacRoomDensity'=> 0.4 , 'evacCorridorDensity'=> 10  , 'evacStaircaseDensity'=> 10 , 'evacHallDensity'=> 10)  ;
	$bdb['medical1']=array(  'label'=> 'Medical day centre'               , 'type'=> 'd1' , 'alphaMod'=> 0.012  , 'hrrpua'=> 500 , 'evacRoomDensity'=> 7   , 'evacCorridorDensity'=> 10  , 'evacStaircaseDensity'=> 10 , 'evacHallDensity'=> 10)  ;
	$bdb['hospital']=array(  'label'=> 'Hospital / nursing home'          , 'type'=> 'd2' , 'alphaMod'=> 0.012  , 'hrrpua'=> 500 , 'evacRoomDensity'=> 10  , 'evacCorridorDensity'=> 20  , 'evacStaircaseDensity'=> 20 , 'evacHallDensity'=> 20)  ;
	$bdb['airport']=array(   'label'=> 'Railway / bus station or airport' , 'type'=> 'e'  , 'alphaMod'=> 0.012  , 'hrrpua'=> 500 , 'evacRoomDensity'=> 2   , 'evacCorridorDensity'=> 10  , 'evacStaircaseDensity'=> 10 , 'evacHallDensity'=> 10)  ;
	$_SESSION['buildings_db']=$bdb;
}
/*}}}*/
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
			"sprinklers_rti": 50,

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

		} ,

		"advanced": {

		}

	}',1);

	return $conf;
}
/*}}}*/

function droplist_geometry_type($in) {/*{{{*/
	if(empty($in)) { $in='pl'; }
	$select="<select name=post[geometry_type]>";
	$select.="<option value='$in'>$in</option>";
	$select.="<option value=''></option>";
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
function droplist_alarming($in) { /*{{{*/
	$select="<select name=post[alarming]>";
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
	$select="<select name=post[complexity]>";
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
	$select="<select name=post[management]>";
	$select.="<option value='$in'>$in</option>";
	$select.="<option value=''></option>";
	$select.="<option value=M1>M1</option>";
	$select.="<option value=M2>M2</option>";
	$select.="<option value=M3>M3</option>";
	$select.="</select>";
	return $select;
}
/*}}}*/
function droplist_detectors_type($in) {/*{{{*/
	$select="<select name=post[detectors_type]>";
	$select.="<option value='$in'>$in</option>";
	$select.="<option value=''></option>";
	$select.="<option value=heat>heat</option>";
	$select.="<option value=smoke>smoke</option>";
	$select.="</select>";
	return $select;
}
/*}}}*/
function droplist_sprinklers_type($in) {/*{{{*/
	$select="<select name=post[sprinklers_type]>";
	$select.="<option value='$in'>$in</option>";
	$select.="<option value=''></option>";
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
	$z="<table class=noborder>";
	$i=0;
	foreach($arr as $k => $v) { 
		$z.="<tr>";
		foreach($v as $kk => $vv) { 
			if(in_array($kk, array('ceiling', 'wall', 'floor') )) { 
				$z.="<td>".get_help($kk)."<td>".droplist_material($i,$kk,$vv); 
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
	#dd(json_encode($_POST['post'], JSON_NUMERIC_CHECK));
	dd($_POST['post']);
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
		else if($k=='scenario_id')            { echo "<tr><td>".get_help($k)."<td>$v"; }
		else if($k=='geometry_type')          { echo "<tr><td>".get_help($k)."<td>".droplist_geometry_type($v); }
		else if($k=='material')               { echo "<tr><td>$k<td>".form_material($v); }
		else if($k=='detectors_type')         { echo "<tr><td>".get_help($k)."<td>".droplist_detectors_type($v); }
		else if($k=='sprinklers_type')        { echo "<tr><td>".get_help($k)."<td>".droplist_sprinklers_type($v); }
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
		else if($k=='pre_evac_fire_origin')   { echo "<tr><td>".get_help($k)."<td>".form_plain_arr($k,$v); }
		else if($k=='pre_evac_ordinary')      { echo "<tr><td>".get_help($k)."<td>".form_plain_arr($k,$v); }
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
	$help["detectors_temp"]			 = ["detectors_temp"        , "write me..."]                  ;
	$help["detectors_obscur"]		 = ["detectors_obscur"      , "write me..."]                  ;
	$help["detectors_not_broken"]	 = ["detectors_not_broken"  , "write me..."]                  ;
	$help["windows"]				 = ["windows"               , "help for the windows <br>aa <br>aa <br>aa <br>aa <br>aa <br>aa <br>aa " ]        ;

	foreach($help as $k=>$v) { 
		$help[$k][1]="<withHelp>?<help>$v[1]</help></withHelp>";
	}
	$_SESSION['help']=$help;
}
/*}}}*/

?>
