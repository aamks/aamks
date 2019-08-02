<?php
session_name('aamks');
require_once("inc.php"); 
require_once("lib.form.php"); 

function read_aamks_conf_json() { /*{{{*/
	$_SESSION['nn']->assert_working_home_exists();
	if(!is_file($_SESSION['main']['working_home']."/conf.json")) { 
		$template=file_get_contents(getenv("AAMKS_PATH")."/installer/demo/simple/conf.json");
		$template_json=json_decode($template,1);
		$template_json['project_id']=$_SESSION['main']['project_id'];
		$template_json['scenario_id']=$_SESSION['main']['scenario_id'];
		$s=json_encode($template_json, JSON_NUMERIC_CHECK);
		write($s);
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
	$select="<select name=post[building_profile][type]>";
	$select.="<option value='$in'>$in</option>";
	foreach(get_building(0,1) as $k) { 
		$select.="<option value='$k'>$k</option>";
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
function assert_json_ids($data) { #{{{
	// User is not allowed to alter their project/scenario ids
	// At least textarea editor would allow for this

	$conf=json_decode($data,1);
	$conf['project_id']=$_SESSION['main']['project_id'];
	$conf['scenario_id']=$_SESSION['main']['scenario_id'];
	return json_encode($conf, JSON_NUMERIC_CHECK);
}
/*}}}*/
function write($data) { #{{{
	$data=assert_json_ids($data);
	$file=$_SESSION['main']['working_home']."/conf.json";
	$saved=file_put_contents($file, $data);
	if($saved<=0) { 
		$_SESSION['header_err'][]="problem saving $file";
	}
	header("Location: form.php?edit");
}
/*}}}*/
function update_form_easy() {/*{{{*/
	if(empty($_POST['update_form_easy'])) { return; }
	$out=$_POST['post'];
	$out+=get_defaults('setup1');
	$z=calculate_profile($_POST['post']['building_profile']);
	$out['evacuees_concentration']=$z['evacuees_concentration'];
	$out['hrr_alpha']['mode']=$z['hrr_alpha_mode'];
	$out['hrrpua']['mode']=$z['hrrpua_mode'];
	$out['pre_evac']=$z['pre_evac'];
	$out['pre_evac_fire_origin']=$z['pre_evac_fire_origin'];
	$s=json_encode($out, JSON_NUMERIC_CHECK);
	write($s);
}
/*}}}*/
function update_form_advanced() {/*{{{*/
	if(empty($_POST['update_form_advanced'])) { return; }
	$out=$_POST['post'];
	$s=json_encode($out, JSON_NUMERIC_CHECK);
	write($s);
}
/*}}}*/
function update_form_text() {/*{{{*/
	if(empty($_POST['update_form_text'])) { return; }
	write($_POST['json']);
}
/*}}}*/
function update_form4() {/*{{{*/
	if(empty($_POST['update_form4'])) { return; }
	$z=calculate_profile($_POST['post']['building_profile']);
	dd($z);
}
/*}}}*/

function form_fields_iterator($json,$variant) { #{{{
	// In conf.json there are 3 types of values for each key: value, array, assoc 

	foreach($json as $k=>$v) {

		if($k=='project_id')             { echo "<tr><td>".get_help($k)."<td>$v <input autocomplete=off type=hidden name=post[$k] value='$v'>"; }
		else if($k=='scenario_id')       { echo "/$v							<input autocomplete=off type=hidden name=post[$k] value='$v'>"; }
		else if($k=='building_profile')  { echo building_fields($v, $variant); }
		else if($k=='heat_detectors')    { echo "<tr><td><a class='rlink switch' id='$k'>heat detectors</a><td>".form_plain_arr_switchable($k,$v); }
		else if($k=='smoke_detectors')   { echo "<tr><td><a class='rlink switch' id='$k'>smoke detectors</a><td>".form_plain_arr_switchable($k,$v); }
		else if($k=='sprinklers')        { echo "<tr><td><a class='rlink switch' id='$k'>$k</a><td>".form_plain_arr_switchable($k,$v); }
		else if($k=='NSHEVS')            { echo "<tr><td><a class='rlink switch' id='$k'>$k</a><td>".form_plain_arr_switchable($k,$v); }
		else if($k=='material_ceiling')  { echo "<tr><td>".get_help('material')."<td>".form_material($json); }
		else if($k=='dispatch_evacuees') { echo "<tr><td>".get_help('dispatch_evacuees')."<td>".droplist_dipatch_evacuees($v); }
		else if($k=='fire_model')        { echo "<tr><td>".get_help('fire_model')."<td>".droplist_fire_model($v); }

		else if($k=='material_floor')         { }
		else if($k=='material_wall')          { }
		else {
			if(is_array($v) and isset($v[0])) {
				echo "<tr><td>".get_help($k)."<td>".form_arr($k,$v); 
			} else if(is_array($v) and !isset($v[0])) {
				echo "<tr><td>".get_help($k)."<td>".form_assoc($k,$v); 
			} else {
				echo "<tr><td>".get_help($k)."<td><input autocomplete=off type=text automplete=off size=10 name=post[$k] value='$v'>"; 
			}
		}
	}
}
/*}}}*/
function form($variant) { /*{{{*/
	// variant is easy or advanced
	$update_var='update_form_advanced';
	$json=read_aamks_conf_json();
	if($variant=='easy') { 
		foreach(array("fire_model", "dispatch_evacuees", "navmesh_debug", "outdoor_temperature","indoor_pressure","windows","vents_open","c_const","evacuees_max_h_speed","evacuees_max_v_speed","evacuees_alpha_v","evacuees_beta_v","fire_starts_in_a_room","hrrpua","hrr_alpha","evacuees_concentration","pre_evac","pre_evac_fire_origin") as $i) { 
			unset ($json[$i]);
		}
		$update_var='update_form_easy';
	}

	echo "<form method=post>";
	echo "<table>";
	form_fields_iterator($json,$variant);
	echo "</table>";
	echo "<center><br><input autocomplete=off type=submit name=$update_var value='submit'></center></form>";
}
/*}}}*/
function form_text() { /*{{{*/
	echo "
	<br><wheat>
	You can directly manipulate conf.json. Aamks will not forgive any errors here.
	</wheat><br><br>";
	
	$help=$_SESSION['help'];
	$json=json_encode(read_aamks_conf_json(), JSON_PRETTY_PRINT);
	echo "<form method=post>";
	echo "<textarea name=json cols=80 rows=25>\n\n$json\n\n\n</textarea><br>";
	echo "<br><center><input autocomplete=off type=submit name=update_form_text value='submit'></center></form>";
}
/*}}}*/
function form4() { /*{{{*/
	echo "<br><br><wheat> Browser of the building profiles </wheat><br><br>";
	$v=array();
	if(isset($_POST['post']['building_profile'])) { 
		$v=$_POST['post']['building_profile'];
	} 
	
	echo "<form method=post>";
	echo "<table>";
	echo building_fields($v);
	echo "</table>";
	echo "<input autocomplete=off type=submit name=update_form4 value='submit'></form>";
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
	foreach(array('easy','advanced','text') as $k=>$v) { 
		$sty='';
		if($_SESSION['main']['active_editor']==$k+1) { $sty="style='background: #616;'"; }
		$xx.="<input autocomplete=off $sty type=submit name=e".($k+1)." value='$v'>";
	}
	echo "<div style=float:right>
	Editor: 
	<form style='display: inline' method=post>
		<input autocomplete=off type=hidden name=change_editor>
		$xx
		<withHelp>?<help>$editors_help</help></withHelp>
	</form>
	<br><br> <br><br> <br><br>
	<br><br> <br><br> <br><br>
	<br><br> <br><br> <br><br>
	<br><br> <br><br> <br><br>
	<a style='opacity:0.1' class=blink href=/aamks/form.php?bprofiles>building profiles</a>
	<br>
	";
}
/*}}}*/
function change_editor() {/*{{{*/
	if(!isset($_POST['change_editor'])) { return; }
	if(isset($_POST['e1'])) { $_SESSION['main']['active_editor']=1; }
	if(isset($_POST['e2'])) { $_SESSION['main']['active_editor']=2; }
	if(isset($_POST['e3'])) { $_SESSION['main']['active_editor']=3; }
	$_SESSION['nn']->query("UPDATE users SET active_editor=$1 WHERE id=$2", array($_SESSION['main']['active_editor'], $_SESSION['main']['user_id']));
	header("Location: ?edit");
	exit();
}
/*}}}*/
function form_delete() { #{{{
	// demo/simple is the built-in scenario which must never be deleted
	// This way we make sure there will always be a fallback in $_SESSION['main']

	if($_SESSION['main']['scenario_name']=='simple' && $_SESSION['main']['project_name']=='demo') { return; }
	echo "<form method=post>";
	echo "<input autocomplete=off style='float:right' class=srlink type=submit name=delete_scenario value='delete this scenario'>";
	echo "</form>";
}
/*}}}*/
function delete_scenario() {/*{{{*/
	// After we have delete a scenario, the current scenario will be the newest one in the database.
	// TODO: assert there is at least one scenario always 

	# psql aamks -c 'select * from scenarios'
	# psql aamks -c "SELECT u.email, p.project_name, u.active_editor, u.user_photo, u.user_name, p.id AS project_id, s.scenario_name, s.id AS scenario_id  FROM projects p LEFT JOIN scenarios s ON (p.id=s.project_id) LEFT JOIN users u ON(p.user_id=u.id) WHERE u.id=1 AND s.id IS NOT NULL  ORDER BY s.modified DESC "
	if(!isset($_POST['delete_scenario'])) { return; }
	$_SESSION['nn']->query("DELETE FROM scenarios WHERE id=$1", array($_SESSION['main']['scenario_id']));
	$disk_delete=implode("/", array($_SESSION['main']['user_home'], $_SESSION['main']['project_name'], $_SESSION['main']['scenario_name']));
	system("rm -rf $disk_delete");
	unset($_SESSION['main']['scenario_id']);
	$r=$_SESSION['nn']->query("SELECT u.email, p.project_name, u.active_editor, u.user_photo, u.user_name, p.id AS project_id, s.scenario_name, s.id AS scenario_id  FROM projects p LEFT JOIN scenarios s ON (p.id=s.project_id) LEFT JOIN users u ON(p.user_id=u.id) WHERE u.id=$1 AND s.id IS NOT NULL ORDER BY s.modified DESC LIMIT 1",array($_SESSION['main']['user_id']));
	$_SESSION['nn']->ch_main_vars($r[0]);
	header("Location: projects.php?projects_list");
	# TODO: remove from db?
	exit();
}
/*}}}*/

function main() {/*{{{*/
	// 1: easy, 2: advanced, 3: text
	$_SESSION['nn']->htmlHead("Scenario properties");
	$_SESSION['nn']->menu("Scenario: ".$_SESSION['main']['scenario_name']);
	change_editor();
	delete_scenario();
	make_help();

	if(isset($_GET['edit'])) { 
		form_delete();
		$e=$_SESSION['main']['active_editor'];
		if($e==1) { update_form_easy(); form("easy"); }
		if($e==2) { update_form_advanced(); form("advanced"); }
		if($e==3) { update_form_text(); form_text(); }
	}

	if(isset($_GET['bprofiles'])) { form4(); update_form4(); }
	editors();
}
/*}}}*/

main();
?>
