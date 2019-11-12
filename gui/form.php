<?php
session_name('aamks');
require_once("inc.php"); 

function read_aamks_conf_json() { /*{{{*/
	$_SESSION['nn']->assert_working_home_exists();
	if(!is_file($_SESSION['main']['working_home']."/conf.json")) { 
		$_SESSION['nn']->scenario_from_template();
	}
	$json_path=$_SESSION['main']['working_home']."/conf.json";
	if(is_readable($json_path)) { 
		$f=file_get_contents($json_path);
	} else {
		$_SESSION['nn']->fatal("Cannot open: $json_path");
	}

	$conf=json_decode($f,1);
	if(empty($conf)) { 
		$_SESSION['nn']->fatal("Broken json: $json_path");
	} 
	return $conf;
}
/*}}}*/

function droplist_fire_model($in) {/*{{{*/
	$select="<select name=post[fire_model]>";
	$select.="<option value='$in'>$in</option>";
	$select.="<option value=CFAST>CFAST</option>";
	$select.="<option value=FDS>FDS</option>";
	$select.="<option value=None>None</option>";
	$select.="</select>";
	return $select;
}
/*}}}*/
function droplist_dipatch_evacuees($in) {/*{{{*/
	$select="<select name=post[dispatch_evacuees]>";
	$select.="<option value='$in'>$in</option>";
	$select.="<option value='manual+probabilistic'>manual+probabilistic</option>";
	$select.="<option value='probabilistic+manual'>probabilistic+manual</option>";
	$select.="<option value='manual'>manual</option>";
	$select.="</select>";
	return $select;
}
/*}}}*/
function droplist_material($k,$in) {/*{{{*/
	$select="<select name=post[$k][type]>";
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
	$select="<select required name=post[building_profile][type]>";
	$select.="<option value='$in'>$in</option>";
	foreach(get_building(0,1) as $k) { 
		$select.="<option value='$k'>$k</option>";
	}
	$select.="</select>";
	return $select;
}
/*}}}*/
function droplist_alarming($in) { /*{{{*/
	$select="<select required name=post[building_profile][alarming]>";
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
	$select="<select required name=post[building_profile][complexity]>";
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
	$select="<select required name=post[building_profile][management]>";
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
function form_material($json) { #{{{
	$m_array=array("material_ceiling"=>'ceiling', "material_floor"=>'floor', "material_wall"=>'wall');
	$z="";
	$z="<table class=noborder>";
	foreach($m_array as $k=>$v) { 
		$z.="<tr>";
		$z.="<td>$v<td>".droplist_material($k,$json[$k]['type']); 
		$z.="<td>thickness<td><input autocomplete=off size=2 type=text name=post[$k][thickness] value='".$json[$k]['thickness']."'>";
	}
	$z.="</table>";
	return $z;
}
/*}}}*/
function form_plain_arr_switchable($key,$arr) { #{{{
	$z='';
	if(strlen(implode("", $arr))>0) {
		$z.="<div id=$key-switch class='grey no-display'>none</div>";
		$z.="<table id='$key-table' class='noborder'>";
	} else {
		$z.="<div id=$key-switch class='grey'>none</div>";
		$z.="<table id='$key-table' class='noborder no-display'>";
	}
	$z.="<tr>";
	foreach($arr as $k => $v) { 
		$z.="<td>".get_help($k)."<br><input autocomplete=off size=8 type=text name=post[$key][$k] value='$v'>";
	}
	$z.="</table>";
	return $z;
}
/*}}}*/
function form_assoc($key,$arr) { #{{{
	$z="";
	$z.="<table class=noborder>";
	$z.="<tr>";
	foreach($arr as $k=>$v) { 
		$z.="<td>".get_help($k)."<br><input autocomplete=off size=8 type=text name=post[$key][$k] value='$v'>";
	}
	$z.="</table>";
	return $z;
}
/*}}}*/
function form_arr($key,$arr) { #{{{
	$z="";
	$z="<table class=noborder>";
	$i=0;
	foreach($arr as $k => $v) { 
		$z.="<tr>";
		foreach($v as $kk => $vv) { 
			$z.="<td>".get_help($kk)."<br><input autocomplete=off size=8 type=text name=post[$key][$i][$kk] value='$vv'>";
		}
		$i++;
	}
	$z.="</table>";
	return $z;
}
/*}}}*/
function building_fields($v, $variant='easy') {/*{{{*/
	if(empty($v)) { $v=array("type"=>"", "management"=>"", "complexity"=> "", "alarming"=> ""); }
	if($variant == 'easy') {
		$z=[];
		$z[]="type<br>".droplist_building_profile($v['type']); 
		$z[]=get_help("management")."<br>".droplist_management($v['management']); 
		$z[]="complexity<br>".droplist_complexity($v['complexity']); 
		$z[]="alarming<br>".droplist_alarming($v['alarming']); 
		$out="<tr><td>".get_help("building_profile")."<td><table class=noborder><tr><td>".implode("<td>", $z)."</table>";
	} else {
		$out="";
		foreach($v as $k=>$v) {
			$out.="<input autocomplete=off type=hidden name=post[building_profile][$k] value=''>";
		}
	}
	return $out;
}
/*}}}*/
function calculate_profile($arr) { #{{{
	$arr['code']=get_building($arr['type'])['code'];
	extract($arr);
	$evacuees_density=get_building($arr['type'])['evacuees_density'];
	$hrr_alpha_mode=get_building($arr['type'])['hrr_alpha_mode'];
	$hrrpua_mode=get_building($arr['type'])['hrrpua_mode'];
	$pre_evac=get_profile_code(implode(",", array($code,$management,$complexity,$alarming)));
	$pre_evac_fire_origin=get_profile_code(implode(",", array($code,"fire_origin")));
	return array(
		'evacuees_density'=>$evacuees_density,
		'hrr_alpha_mode'=>$hrr_alpha_mode,
		'hrrpua_mode'=>$hrrpua_mode,
		'pre_evac'=>$pre_evac, 
		'pre_evac_fire_origin'=>$pre_evac_fire_origin
	);
}
/*}}}*/
function alarming_defaults($x) {/*{{{*/
	if($x=='A1') { return array('mean' =>  0   , 'sd' =>  0)   ; }
	if($x=='A2') { return array('mean' =>  180 , 'sd' =>  120) ; }
	if($x=='A3') { return array('mean' =>  300 , 'sd' =>  180) ; }
	return array('mean' =>  0, 'sd' =>  0) ;  # In case none of the alarming is chosen
}
/*}}}*/
function update_form_easy() {/*{{{*/
	if(empty($_POST['update_form_easy'])) { return; }
	$out=$_POST['post'];
	$out+=get_defaults('setup1');
	$z=calculate_profile($_POST['post']['building_profile']);
	$out['alarming']=alarming_defaults($out['building_profile']['alarming']);
	$out['evacuees_density']=$z['evacuees_density'];
	$out['hrr_alpha']['mode']=$z['hrr_alpha_mode'];
	$out['hrrpua']['mode']=$z['hrrpua_mode'];
	$out['pre_evac']=$z['pre_evac'];
	$out['pre_evac_fire_origin']=$z['pre_evac_fire_origin'];
	$s=json_encode($out, JSON_NUMERIC_CHECK);
	$_SESSION['nn']->write_scenario($s);
}
/*}}}*/
function update_form_advanced() {/*{{{*/
	if(empty($_POST['update_form_advanced'])) { return; }
	$out=$_POST['post'];
	$s=json_encode($out, JSON_NUMERIC_CHECK);
	$_SESSION['nn']->write_scenario($s);
}
/*}}}*/
function update_form_text() {/*{{{*/
	if(empty($_POST['update_form_text'])) { return; }
	json_decode($_POST['json']);
	if (json_last_error() != JSON_ERROR_NONE) { $_SESSION['nn']->fatal("JSON: ".json_last_error_msg()."<br>Reverting to the previous version of the config." ); return; }
	$_SESSION['nn']->write_scenario($_POST['json']);
}
/*}}}*/
function update_form_bprofiles() {/*{{{*/
	if(empty($_POST['update_form_bprofiles'])) { return; }
	$z=calculate_profile($_POST['post']['building_profile']);
	dd($z);
}
/*}}}*/

function form_fields_advanced() { #{{{
	$json=read_aamks_conf_json();
	extract($json);
	echo "<form method=post>";
	echo "<input autocomplete=off type=submit name=update_form_advanced value='Save'><br><br>";
	echo "<table>";
	echo "<tr><td>".get_help('project_id')."<td>$project_id <input autocomplete=off type=hidden name=post[project_id] value='$project_id'>"; 
	echo "/$scenario_id	<input autocomplete=off type=hidden name=post[scenario_id] value='$scenario_id'>"; 
	echo "<tr><td>".get_help('number_of_simulations')."<td><input autocomplete=off type=text automplete=off size=10 name=post[number_of_simulations] value='$number_of_simulations'>"; 
	echo "<tr><td>".get_help('simulation_time')."<td><input autocomplete=off type=text automplete=off size=10 name=post[simulation_time] value='$simulation_time'>"; 
	echo "<tr><td>".get_help('fire_model')."<td>".droplist_fire_model($fire_model); 
	echo "<tr><td>".get_help('dispatch_evacuees')."<td>".droplist_dipatch_evacuees($dispatch_evacuees); 
	echo "<tr><td>".get_help('indoor_temperature')."<td><input autocomplete=off type=text automplete=off size=10 name=post[indoor_temperature] value='$indoor_temperature'>"; 
	echo "<tr><td>".get_help('outdoor_temperature')."<td>".form_assoc('outdoor_temperature',$outdoor_temperature); 
	echo "<tr><td>".get_help('indoor_pressure')."<td><input autocomplete=off type=text automplete=off size=10 name=post[indoor_pressure] value='$indoor_pressure'>"; 
	echo "<tr><td>".get_help('humidity')."<td><input autocomplete=off type=text automplete=off size=10 name=post[humidity] value='$humidity'>"; 
	echo "<tr><td>".get_help('evac_clusters')."<td><input autocomplete=off type=text automplete=off size=10 name=post[evac_clusters] value='$evac_clusters'>"; 
	echo building_fields($building_profile, 'advanced');
	echo "<tr><td>".get_help('material')."<td>".form_material($json); 
	echo "<tr><td><a class='rlink switch' id='heat_detectors'>heat detectors</a><td>".form_plain_arr_switchable('heat_detectors',$heat_detectors); 
	echo "<tr><td><a class='rlink switch' id='smoke_detectors'>smoke detectors</a><td>".form_plain_arr_switchable('smoke_detectors',$smoke_detectors); 
	echo "<tr><td><a class='rlink switch' id='sprinklers'>sprinklers</a><td>".form_plain_arr_switchable('sprinklers',$sprinklers); 
	echo "<tr><td><a class='rlink switch' id='NSHEVS'>NSHEVS</a><td>".form_plain_arr_switchable('NSHEVS',$NSHEVS); 
	echo "<tr><td>".get_help('windows')."<td>".form_arr('windows',$windows); 
	echo "<tr><td>".get_help('vents_open')."<td>".form_assoc('vents_open',$vents_open); 
	echo "<tr><td>".get_help('c_const')."<td><input autocomplete=off type=text automplete=off size=10 name=post[c_const] value='$c_const'>"; 
	echo "<tr><td>".get_help('fire_starts_in_a_room')."<td><input autocomplete=off type=text automplete=off size=10 name=post[fire_starts_in_a_room] value='$fire_starts_in_a_room'>"; 
	echo "<tr><td>".get_help('hrrpua')."<td>".form_assoc('hrrpua',$hrrpua); 
	echo "<tr><td>".get_help('hrr_alpha')."<td>".form_assoc('hrr_alpha',$hrr_alpha); 
	echo "<tr><td>".get_help('evacuees_max_h_speed')."<td>".form_assoc('evacuees_max_h_speed',$evacuees_max_h_speed); 
	echo "<tr><td>".get_help('evacuees_max_v_speed')."<td>".form_assoc('evacuees_max_v_speed',$evacuees_max_v_speed); 
	echo "<tr><td>".get_help('evacuees_alpha_v')."<td>".form_assoc('evacuees_alpha_v',$evacuees_alpha_v); 
	echo "<tr><td>".get_help('evacuees_beta_v')."<td>".form_assoc('evacuees_beta_v',$evacuees_beta_v); 
	echo "<tr><td>".get_help('evacuees_density')."<td>".form_assoc('evacuees_density',$evacuees_density); 
	echo "<tr><td>".get_help('alarming')."<td>".form_assoc('alarming',$alarming); 
	echo "<tr><td>".get_help('pre_evac')."<td>".form_assoc('pre_evac',$pre_evac); 
	echo "<tr><td>".get_help('pre_evac_fire_origin')."<td>".form_assoc('pre_evac_fire_origin',$pre_evac_fire_origin); 
	echo "</table>";
	echo "</form>";
}
/*}}}*/
function form_fields_easy() { #{{{
	$json=read_aamks_conf_json();
	extract($json);
	echo "<form method=post>";
	echo "<input autocomplete=off type=submit name=update_form_easy value='Save'><br><br>";
	echo "<table>";
	echo "<tr><td>".get_help('project_id')."<td>$project_id <input autocomplete=off type=hidden name=post[project_id] value='$project_id'>"; 
	echo "/$scenario_id	<input autocomplete=off type=hidden name=post[scenario_id] value='$scenario_id'>"; 
	echo "<tr><td>".get_help('number_of_simulations')."<td><input autocomplete=off type=text automplete=off size=10 name=post[number_of_simulations] value='$number_of_simulations'>"; 
	echo "<tr><td>".get_help('simulation_time')."<td><input autocomplete=off type=text automplete=off size=10 name=post[simulation_time] value='$simulation_time'>"; 
	echo building_fields($building_profile, 'easy');
	echo "<tr><td>".get_help('material')."<td>".form_material($json); 
	echo "<tr><td><a class='rlink switch' id='heat_detectors'>heat detectors</a><td>".form_plain_arr_switchable('heat_detectors',$heat_detectors); 
	echo "<tr><td><a class='rlink switch' id='smoke_detectors'>smoke detectors</a><td>".form_plain_arr_switchable('smoke_detectors',$smoke_detectors); 
	echo "<tr><td><a class='rlink switch' id='sprinklers'>sprinklers</a><td>".form_plain_arr_switchable('sprinklers',$sprinklers); 
	echo "<tr><td><a class='rlink switch' id='NSHEVS'>NSHEVS</a><td>".form_plain_arr_switchable('NSHEVS',$NSHEVS); 
	echo "</table>";
	echo "</form>";
}
/*}}}*/
function form_text() { /*{{{*/
	$help=$_SESSION['help'];
	$json=json_encode(read_aamks_conf_json(), JSON_PRETTY_PRINT);
	echo "<form method=post>";
	echo "<input autocomplete=off type=submit name=update_form_text value='Save'><br>";
	echo "<textarea name=json style='height:90vh; width:700px'>\n\n$json\n\n\n</textarea><br>";
	echo "</form>";
}
/*}}}*/
function form_bprofiles() { /*{{{*/
	$v=array();
	if(isset($_POST['post']['building_profile'])) { 
		$v=$_POST['post']['building_profile'];
	} 
	
	echo "<form method=post>";
	echo "<table>";
	echo building_fields($v);
	echo "</table>";
	echo "<input autocomplete=off type=submit name=update_form_bprofiles value='check'></form>";
}
/*}}}*/

function editors() {/*{{{*/
	$td="style='color: #111'";
	$editors_help="
	<orange>easy</orange> reasonable defaults, asking for the very basics 
	<hr>
	<orange>advanced</orange> access to distributions and other details
	<hr>
	<orange>text</orange> direct access to even more, possibly not documented params 
	";
	$xx='';
	foreach(array('easy','advanced','text') as $v) { 
		$sty='';
		if($_SESSION['prefs']['apainter_editor']!=$v) { $sty="style='background: #555; color: #aaa'"; }
		$xx.="<input autocomplete=off $sty type=submit name='change_editor' value='$v'>";
	}
	echo "
	<div style='position:absolute; left:600px; top:0px; white-space:nowrap'>Editor: 
	<form style='display: inline' method=post>
		$xx
		<withHelp>?<help>$editors_help</help></withHelp>
	</form>
	</div>";
}
/*}}}*/
function change_editor() {/*{{{*/
	if(!isset($_POST['change_editor'])) { return; }
	$_SESSION['nn']->preferences_update_param("apainter_editor", $_POST['change_editor']);
	header("Location: ?edit");
	exit();
}
/*}}}*/
function form_delete() { #{{{
	// There are demo/* built-in scenarios which must never be deleted
	// This way we make sure there will always be a fallback in $_SESSION['main']

	if($_SESSION['main']['project_name']=='demo' && in_array($_SESSION['main']['scenario_name'], array("simple", "navmesh", "three", "fds"))) { return; }
	echo "<form method=post>";
	echo "<input autocomplete=off style='float:right; margin: 0px 50px 400px 0px' type=submit name=delete_scenario value='delete this scenario'>";
	echo "</form>";
}
/*}}}*/
function delete_scenario() {/*{{{*/
	// After we have delete a scenario, the current scenario will be the newest one in the database.
	// TODO: assert there is at least one scenario always 

	# psql aamks -c 'select * from scenarios'
	# psql aamks -c 'select * from users'
	# psql aamks -c "SELECT u.email, p.project_name, u.preferences, u.user_photo, u.user_name, p.id AS project_id, s.scenario_name, s.id AS scenario_id  FROM projects p LEFT JOIN scenarios s ON (p.id=s.project_id) LEFT JOIN users u ON(p.user_id=u.id) WHERE u.id=1 AND s.id IS NOT NULL  ORDER BY s.modified DESC "
	if(!isset($_POST['delete_scenario'])) { return; }
	$_SESSION['nn']->query("DELETE FROM scenarios WHERE id=$1", array($_SESSION['main']['scenario_id']));
	$disk_delete=implode("/", array($_SESSION['main']['user_home'], $_SESSION['main']['project_name'], $_SESSION['main']['scenario_name']));
	system("rm -rf $disk_delete");
	unset($_SESSION['main']['scenario_id']);
	$r=$_SESSION['nn']->query("SELECT u.id AS user_id, u.email, p.project_name, u.preferences, u.user_photo, u.user_name, p.id AS project_id, s.scenario_name, s.id AS scenario_id  FROM projects p LEFT JOIN scenarios s ON (p.id=s.project_id) LEFT JOIN users u ON(p.user_id=u.id) WHERE u.id=$1 AND s.id IS NOT NULL ORDER BY s.modified DESC LIMIT 1",array($_SESSION['main']['user_id']));
	$_SESSION['nn']->ch_main_vars($r[0]);
	header("Location: projects.php?projects_list");
	# TODO: remove from db?
	exit();
}
/*}}}*/

function main() {/*{{{*/
	$_SESSION['nn']->htmlHead("Scenario properties");
	$_SESSION['nn']->menu();
	change_editor();
	delete_scenario();
	make_help();

	if(isset($_GET['edit'])) { 
		$e=$_SESSION['prefs']['apainter_editor'];
		if($e=='easy')     { update_form_easy()     ; form_fields_easy()     ; }
		if($e=='advanced') { update_form_advanced() ; form_fields_advanced() ; }
		if($e=='text')     { update_form_text()     ; form_text()            ; }
		form_delete();
	}

	if(isset($_GET['bprofiles'])) { $_SESSION['nn']->menu('Building profiles'); form_bprofiles(); update_form_bprofiles(); exit(); }

	editors();
}
/*}}}*/

main();
?>
