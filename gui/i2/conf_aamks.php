<?php
session_name('aamks');
require_once("inc.php"); 

function read_json($json_path) { /*{{{*/
	$conf=json_decode('
	{
		"basic": {
			"project_id": 1,
			"scenario_id": 1,
			"number_of_simulations": 1,
			"simulation_time": 100,
			"indoor_temperature_min": -5,
			"indoor_temperature_max":  10,
			"outdoor_temperature_min": -5,
			"outoor_temperature_max":  10,
			"indoor_pressure": 101325,
			"geometry_type": "office1",
			"material_ceiling": "concrete",
			"ceiling_thickness": "0.3",
			"material_floor": "concrete",
			"floor_thickness": "0.3",
			"material_wall": "brick",
			"wall_thickness": "0.2"
		}, 

		"advanced": {
			"detectors": false,
			"detectors_type": "heat",
			"detectors_trigger_temperature_mean": 68,
			"detectors_trigger_temperature_sd": 5,
			"detectors_trigger_obscuration_mean": 0,
			"detectors_trigger_obscuration_sd": 5,
			"detectors_not_broken_probability": 0.96,

			"sprinklers": false,
			"sprinklers_trigger_temperature_mean": 68,
			"sprinklers_trigger_temperature_sd": 3,
			"sprinklers_not_broken_probability": 0.96,
			"sprinklers_spray_density_mean": 0.0005,
			"sprinklers_spray_density_sd": 0.0001,
			"sprinklers_rti": 50,

			"nshevs": false,
			"nshevs_activation_time": 0,

			"hrr_pua_min": 300,
			"hrr_pua_mode": 1000,
			"hrr_pua_max": 1300,
			"hrr_alpha_min": 0.0029,
			"hrr_alpha_mode": 0.047,
			"hrr_alpha_max": 0.188,

			"window_conf": [ 
				{ "temp0": -99999 , "temp1": -5    , "quarter": -5 , "full": 0.11 } ,
				{ "temp0": -5     , "temp1": 15    , "quarter": 0  , "full": 0.5 }  ,
				{ "temp0": 15     , "temp1": 27    , "quarter": 0  , "full": 0.5 }  ,
				{ "temp0": 27     , "temp1": 99999 , "quarter": 0  , "full": 0.5 }
			]

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
