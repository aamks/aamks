<?php
session_name('aamks');
require_once("inc.php"); 
require_once("inc.firedb.php"); 

function read_json($json_path) { /*{{{*/
	// todo: remove else at some point
	// /usr/local/aamks/gui/interface/src/app/enums/risk/enums/risk-enums.ts
	if(is_readable($json_path)) { 
		$conf=json_decode(file_get_contents($json_path),1);
	} else {
		$conf=json_decode('{ "project_id": 1, "scenario_id": 1, "number_of_simulations": 1, "simulation_time": 100, "indoor_temperature": 20, "building_profile": [ { "type": "Bank", "management": "M1", "complexity": "B1", "alarming": "A1" } ], "material": [ { "ceiling": "concrete", "thickness": 0.3 }, { "floor": "concrete", "thickness": 0.3 }, { "wall": "brick", "thickness": 0.3 } ], "heat_detectors": [ { "temp_mean": "", "temp_sd": "", "RTI": "", "not_broken": "" } ], "smoke_detectors": [ { "temp_mean": "", "temp_sd": "", "not_broken": "" } ], "sprinklers": [ { "temp_mean": "", "temp_sd": "", "density_mean": "", "density_sd": "", "RTI": "", "not_broken": "" } ], "NSHEVS": [ { "activation_time": "" } ], "outdoor_temperature": [ { "min": 100, "max": 1000 } ], "indoor_pressure": 101325, "windows": [ { "min": -99999, "max": -5, "quarter": -5, "full": 0.11 }, { "min": -5, "max": 15, "quarter": 0, "full": 0.5 }, { "min": 15, "max": 27, "quarter": 0, "full": 0.5 }, { "min": 27, "max": 99999, "quarter": 0, "full": 0.5 } ], "doors": [ { "E": 0.04, "C": 0.14, "D": 0.5 } ], "vvents_not_broken": 0.96, "c_const": 8, "evacuees_max_h_speed": [ { "mean": 120, "sd": 20 } ], "evacuees_max_v_speed": [ { "mean": 80, "sd": 20 } ], "evacuees_alpha_v": [ { "mean": 0.706, "sd": 0.069 } ], "evacuees_beta_v": [ { "mean": -0.057, "sd": 0.015 } ], "fire_starts_in_a_room": 0.8, "hrrpua": [ { "min": 300, "mode": 500, "max": 1300 } ], "hrr_alpha": [ { "min": 0.0029, "mode": 0.0029, "max": 0.188 } ], "evacuees_concentration": [ { "ROOM": 3, "COR": 20, "STAI": 20, "HALL": 20 } ], "pre_evac": [ { "mean": 29.13, "sd": 8.87 } ], "pre_evac_fire_origin": [ { "mean": 59.85, "sd": 1.48 } ] }',1);
	}
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
	$select="<select name=post[building_profile][0][type]>";
	$select.="<option value='$in'>$in</option>";
	foreach(get_building(0,1) as $k) { 
		$select.="<option value='$k'>$k</option>";
	}
	$select.="</select>";
	return $select;
}
/*}}}*/
function droplist_alarming($in) { /*{{{*/
	$select="<select name=post[building_profile][0][alarming]>";
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
	$select="<select name=post[building_profile][0][complexity]>";
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
	$select="<select name=post[building_profile][0][management]>";
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
function form_plain_arr_switchable($key,$input_arr) { #{{{
	$arr=$input_arr[0];
	$z='';
	if(strlen(implode("", $arr))>0) {
		$z.="<div id=$key-switch class='grey no-display'>none</div>";
		$z.="<table id='$key-table' class='noborder'>";
	} else {
		$z.="<div id=$key-switch class='grey'>none</div>";
		$z.="<table id='$key-table' class='noborder no-display'>";
	}
	$i=0;
	$z.="<tr>";
	foreach($arr as $kk => $vv) { 
		$z.="<td>".get_help($kk)."<br><input size=8 type=text name=post[$key][$i][$kk] value='$vv'>";
	}
	$i++;
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
function building_fields($v) {/*{{{*/
	if(!isset($v[0])) { $v[0]=array("type"=>"", "management"=>"", "complexity"=> "", "alarming"=> ""); }
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
function empty_building_fields() {/*{{{*/
	$z="";
	foreach(array("type", "management", "complexity", "alarming") as $k) {
		$z.="<input type=hidden name=post[building_profile][0][$k] value=''>";
	}
	return $z;
}
/*}}}*/
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
	$help["temp_mean"]			     = ["temp mean"                                         , "help for temp mean" ]                                                      ;

	foreach($help as $k=>$v) { 
		$help[$k][1]="<withHelp>?<help>$v[1]</help></withHelp>";
	}
	$_SESSION['help']=$help;
}
/*}}}*/
function calculate_profile($arr) { #{{{
	$arr['code']=get_building($arr['type'])['code'];
	extract($arr);
	$evacuees_concentration=get_building($arr['type'])['evacuees_concentration'];
	$hrr_alpha_mode=get_building($arr['type'])['hrr_alpha_mode'];
	$hrrpua_mode=get_building($arr['type'])['hrrpua_mode'];
	$pre_evac=get_profile_code(implode(",", array($code,$management,$complexity,$alarming)));
	$pre_evac_fire_origin=get_profile_code(implode(",", array($code,"fire_origin")));
	return array(
		'evacuees_concentration'=>$evacuees_concentration,
		'hrr_alpha_mode'=>$hrr_alpha_mode,
		'hrrpua_mode'=>$hrrpua_mode,
		'pre_evac'=>$pre_evac, 
		'pre_evac_fire_origin'=>$pre_evac_fire_origin
	);
}
/*}}}*/

function update_form1() {/*{{{*/
	if(empty($_POST['update_form1'])) { return; }
	$out=$_POST['post'];
	$out+=get_defaults('setup1');
	$z=calculate_profile($_POST['post']['building_profile'][0]);
	$out['evacuees_concentration']=array($z['evacuees_concentration']);
	$out['hrr_alpha'][0]['mode']=$z['hrr_alpha_mode'];
	$out['hrrpua'][0]['mode']=$z['hrrpua_mode'];
	$out['pre_evac']=array($z['pre_evac']);
	$out['pre_evac_fire_origin']=array($z['pre_evac_fire_origin']);
	$s=json_encode($out, JSON_NUMERIC_CHECK);
	file_put_contents("mimooh.json", $s);
	$_SESSION['header_ok'][]="written to <a class=blink href=mimooh.json>mimooh.json</a>";
	header("Location: conf_aamks.php");
}
/*}}}*/
function update_form2() {/*{{{*/
	if(empty($_POST['update_form2'])) { return; }
	$out=$_POST['post'];
	$s=json_encode($out, JSON_NUMERIC_CHECK);
	file_put_contents("mimooh.json", $s);
	$_SESSION['header_ok'][]="written to <a class=blink href=mimooh.json>mimooh.json</a>";
	header("Location: conf_aamks.php");
}
/*}}}*/
function update_form3() {/*{{{*/
	if(empty($_POST['update_form3'])) { return; }
	dd($_POST);
	file_put_contents("mimooh.json", $_POST['json']);
	$_SESSION['header_ok'][]="written to <a class=blink href=mimooh.json>mimooh.json</a>";
	header("Location: conf_aamks.php");
}
/*}}}*/
function update_form4() {/*{{{*/
	if(empty($_POST['update_form4'])) { return; }
	$z=calculate_profile($_POST['post']['building_profile'][0]);
	dd($z);
}
/*}}}*/

function form1($json_path=NULL) { /*{{{*/
	$help=$_SESSION['help'];
	$json=read_json($json_path);
	echo "<form method=post>";
	echo "<table>";
	foreach(array("outdoor_temperature","indoor_pressure","windows","doors","vvents_not_broken","c_const","evacuees_max_h_speed","evacuees_max_v_speed","evacuees_alpha_v","evacuees_beta_v","fire_starts_in_a_room","hrrpua","hrr_alpha","evacuees_concentration","pre_evac","pre_evac_fire_origin") as $advanced) { 
		unset ($json[$advanced]);
	}

	foreach($json as $k=>$v)        {
		if($k=='project_id')                 { echo "<tr><td>".get_help($k)."<td>$v <input type=hidden name=post[$k] value='$v'>"; }
		else if($k=='scenario_id')           { echo "/$v							<input type=hidden name=post[$k] value='$v'>"; }
		else if($k=='number_of_simulations') { echo "<tr><td>".get_help($k)."<td><input type=text automplete=off size=10 name=post[$k] value='$v'>"; }
		else if($k=='simulation_time')       { echo "<tr><td>".get_help($k)."<td><input type=text automplete=off size=10 name=post[$k] value='$v'>"; }
		else if($k=='indoor_temperature')    { echo "<tr><td>".get_help($k)."<td><input type=text automplete=off size=10 name=post[$k] value='$v'>"; }
		else if($k=='building_profile')      { echo "<tr><td>".get_help($k)."<td>".building_fields($v); }
		else if($k=='heat_detectors')        { echo "<tr><td><a class='rlink switch' id='$k'>heat detectors</a><td>".form_plain_arr_switchable($k,$v); }
		else if($k=='smoke_detectors')       { echo "<tr><td><a class='rlink switch' id='$k'>smoke detectors</a><td>".form_plain_arr_switchable($k,$v); }
		else if($k=='sprinklers')            { echo "<tr><td><a class='rlink switch' id='$k'>$k</a><td>".form_plain_arr_switchable($k,$v); }
		else if($k=='NSHEVS')                { echo "<tr><td><a class='rlink switch' id='$k'>$k</a><td>".form_plain_arr_switchable($k,$v); }
		else if($k=='material')              { echo "<tr><td>".get_help($k)."<td>".form_material($v); }
		else                                 { echo "<tr><td>".get_help($k)."<td>".form_plain_arr($k,$v); }
	}
	echo "</table>";
	echo "<input type=submit name=update_form1 value='submit'></form>";
}
/*}}}*/
function form2($json_path=NULL) { /*{{{*/
	$help=$_SESSION['help'];
	$json=read_json($json_path);
	echo "<form method=post>";
	echo "<table>";
	foreach($json as $k=>$v)                 {
		if($k=='project_id')                 { echo "<tr><td>".get_help($k)."<td>$v <input type=hidden name=post[$k] value='$v'>"; }
		else if($k=='scenario_id')           { echo "/$v							<input type=hidden name=post[$k] value='$v'>"; }
		else if($k=='number_of_simulations') { echo "<tr><td>".get_help($k)."<td><input type=text automplete=off size=10 name=post[$k] value='$v'>"; }
		else if($k=='simulation_time')       { echo "<tr><td>".get_help($k)."<td><input type=text automplete=off size=10 name=post[$k] value='$v'>"; }
		else if($k=='indoor_temperature')    { echo "<tr><td>".get_help($k)."<td><input type=text automplete=off size=10 name=post[$k] value='$v'>"; }
		else if($k=='building_profile')      { echo empty_building_fields(); }
		else if($k=='heat_detectors')        { echo "<tr><td><a class='rlink switch' id='$k'>heat detectors</a><td>".form_plain_arr_switchable($k,$v); }
		else if($k=='smoke_detectors')       { echo "<tr><td><a class='rlink switch' id='$k'>smoke detectors</a><td>".form_plain_arr_switchable($k,$v); }
		else if($k=='sprinklers')            { echo "<tr><td><a class='rlink switch' id='$k'>$k</a><td>".form_plain_arr_switchable($k,$v); }
		else if($k=='NSHEVS')                { echo "<tr><td><a class='rlink switch' id='$k'>$k</a><td>".form_plain_arr_switchable($k,$v); }
		else if($k=='material')              { echo "<tr><td>".get_help($k)."<td>".form_material($v); }
		else if($k=='indoor_pressure')       { echo "<tr><td>".get_help($k)."<td><input type=text automplete=off size=10 name=post[$k] value='$v'>"; }
		else if($k=='vvents_not_broken')     { echo "<tr><td>".get_help($k)."<td><input type=text automplete=off size=10 name=post[$k] value='$v'>"; }
		else if($k=='c_const')               { echo "<tr><td>".get_help($k)."<td><input type=text automplete=off size=10 name=post[$k] value='$v'>"; }
		else if($k=='fire_starts_in_a_room') { echo "<tr><td>".get_help($k)."<td><input type=text automplete=off size=10 name=post[$k] value='$v'>"; }
		else                                 { echo "<tr><td>".get_help($k)."<td>".form_plain_arr($k,$v); }
	}
	echo "</table>";
	echo "<input type=submit name=update_form2 value='submit'></form>";
}
/*}}}*/
function form3($json_path=NULL) { /*{{{*/
	echo "
	<wheat>
	You can directly manipulate conf_aamks.json.<br>
	Aamks will not forgive any errors here.<br>
	</wheat>";
	
	$help=$_SESSION['help'];
	$json=json_encode(read_json($json_path), JSON_PRETTY_PRINT);
	echo "<form method=post>";
	echo "<textarea name=json cols=80 rows=40>\n\n$json\n\n\n</textarea><br>";
	echo "<input type=submit name=update_form3 value='submit'></form>";
}
/*}}}*/
function form4() { /*{{{*/
	echo "<wheat> The browser of the building profiles </wheat>";
	$v=array();
	if(isset($_POST['post']['building_profile'][0])) { 
		$v[0]=$_POST['post']['building_profile'][0];
	} 
	
	echo "<form method=post>";
	echo building_fields($v);
	echo "<input type=submit name=update_form4 value='submit'></form>";
}
/*}}}*/

function menu() {/*{{{*/
	echo "
	<a class=blink href=i2.php>menu</a>
	<a class=blink href=?form1>easy</a>
	<a class=blink href=?form2>advanced</a>
	<a class=blink href=?form3>direct</a>
	<a class=blink href=?form4>building profiles</a>
	<br>
	";
}
/*}}}*/
function main() {/*{{{*/
	if(empty($_SESSION['nn'])) { $_SESSION['nn']=new Aamks("Aamks") ; }
	$_SESSION['nn']->htmlHead("Aamks");
	menu();
	make_help();

	if(isset($_GET['form1'])) { update_form1(); form1("mimooh.json"); }
	if(isset($_GET['form2'])) { update_form2(); form2("mimooh.json"); }
	if(isset($_GET['form3'])) { update_form3(); form3("mimooh.json"); }
	if(isset($_GET['form4'])) { form4(); update_form4(); }
	

}
/*}}}*/

main();
?>
