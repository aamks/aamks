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

function checkbox($in) {/*{{{*/
	if ($in){ $stat=' checked';}else{$stat='';}
	$select="<input type='hidden' name=post[r_cpr] value=0>";
	$select.="<input type='checkbox' name=post[r_cpr] value=1$stat>";
	return $select;
}
/*}}}*/
function droplist_rescue($in) {/*{{{*/
	$select="<select name=post[r_is]>";
	$select.="<option value='$in'>$in</option>";
	$select.="<option value='simple'>Simple (Pareto)</option>";
	$select.="<option value='complex'>Complex (Kuziora 2023)</option>";
	$select.="<option value='none'>None (for developers only)</option>";
	$select.="</select>";
	return $select;
}
/*}}}*/
function droplist_rescue_electronic($in) {/*{{{*/
	$select="<select name=post[r_trans]>";
	$select.="<option value='$in'>$in</option>";
	$select.="<option value='phone'>Phone call</option>";
	$select.="<option value='auto'>Automatic</option>";
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
	$select="<select id='$k' name=post[$k][type]>";
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
	$select="<select required id='buildingAlarming' name=post[building_profile][alarming]>";
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
	$select="<select required id='buildingComplexity' name=post[building_profile][complexity]>";
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
	$select="<select required id='buildingManagement' name=post[building_profile][management]>";
	$select.="<option value='$in'>$in</option>";
	$select.="<option value=''></option>";
	$select.="<option value=M1>M1</option>";
	$select.="<option value=M2>M2</option>";
	$select.="<option value=M3>M3</option>";
	$select.="</select>";
	return $select;
}
/*}}}*/
function droplist_fuel($in) { /*{{{*/
	$select="<select required id='fuel' name=post[fuel]>";
	$select.="<option value='$in'>$in</option>";
	$select.="<option value='PE'>PE</option>";
	$select.="<option value='PU'>PU</option>";
	$select.="<option value='PS'>PS</option>";
	$select.="<option value='PP'>PP</option>";
	$select.="<option value='PMMA'>PMMA</option>";
	$select.="<option value='PVC'>PVC</option>";
    $select.="<option value='WOOD'>wood</option>";
	$select.="<option value='user'>user-defined</option>";
	$select.="<option value='random'>random</option>";
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
		$z.="<td>thickness<td><input autocomplete=off size=2 type=text id='thick_$k' name=post[$k][thickness] value='".$json[$k]['thickness']."'>";
	}
	$z.="</table>";
	return $z;
}
/*}}}*/
function form_plain_arr_switchable($key,$arr) { #{{{
	$z='';
	if(strlen(implode("", $arr))>0) {
		$z.="<div id=$key-switch class='grey no-display'>None</div>";
		$z.="<table id='$key-table' class='noborder'>";
	} else {
		$z.="<div id=$key-switch class='grey'>None</div>";
		$z.="<table id='$key-table' class='noborder no-display'>";
	}
	$z.="<tr>";
	foreach($arr as $k => $v) {
		$id=$key."_".$k; 
		$z.="<td>".get_help($k)."<br><input autocomplete=off size=8 type=text id='$id' name=post[$key][$k] value='$v'>";
	}
	$z.="</table>";
	return $z;
}
/*}}}*/
function form_plain_arr_switchable2($key,$arr,$display) { #{{{
	$z='';
    if($display){
        $z.="<div id=$key-switch class='grey no-display'>From fuel</div>";
        $z.="<table id='$key-table' class='noborder'>";
    }else{
        $z.="<div id=$key-switch class='grey'>From fuel</div>";
        $z.="<table id='$key-table' class='noborder no-display'>";
    }
	
	$z.="<tr>";
    foreach($arr as $spec => $vspec)  { 
        if (is_array($vspec)){
            foreach($vspec as $k => $v) {
				$id=$spec."_".$k; 
                $z.="<td>".get_help($spec)."&nbsp".get_help($k)."<br><input autocomplete=off size=8 type=text id=$id name=post[$key][$spec][$k] value='$v'>";
            };
        }else{
			$id=$key."_".$spec;
            $z.="<td>".get_help($spec)."<br><input autocomplete=off size=8 type=text id=$id name=post[$key][$spec] value='$vspec'>";
                }
    }
	$z.="</table>";
	return $z;
}
/*}}}*/
function form_plain_arr_switchable3($key,$arr) { #{{{
	$z='';
	if(strlen(implode("", $arr))>0) {
		$z.="<div id=$key-switch class='grey no-display'>Required for complex rescue sub-model only</div>";
		$z.="<table id='$key-table' class='noborder'>";
	} else {
		$z.="<div id=$key-switch class='grey'>Required for complex rescue sub-model only</div>";
		$z.="<table id='$key-table' class='noborder no-display'>";
	}
	$z.="<tr>";
	foreach($arr as $k => $v) { 
		$id=$key."_".$k;
		$z.="<td>".get_help($k)."<br><input autocomplete=off size=8 type=text id=$id name=post[$key][$k] value='$v'>";
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
		$id=$key."_".$k;
		$z.="<td>".get_help($k)."<br><input autocomplete=off size=8 type=text id=$id name=post[$key][$k] value='$v'>";
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
			$id=$key."_".$kk.$i;
			$z.="<td>".get_help($kk)."<br><input autocomplete=off size=8 type=text id=$id name=post[$key][$i][$kk] value='$vv'>";
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
		$z[]=get_help("complexity")."<br>".droplist_complexity($v['complexity']); 
		$z[]=get_help("alarmingb")."<br>".droplist_alarming($v['alarming']); 
		$out="<tr><td>".get_help("building_profile")."<td><table class=noborder><tr><td>".implode("<td>", $z)."</table>";
	} else {
		$out="";
		foreach($v as $k=>$v) {
			$out.="<input autocomplete=off type=hidden name=post[building_profile][$k] value='$v'>";
		}
	}
	return $out;
}
/*}}}*/
function calculate_profile($arr) { #{{{
	$arr['code']=get_building($arr['type'])['code'];
	extract($arr);
	$params = get_building($arr['type']);
	$evacuees_density=$params['evacuees_density'];
	$hrr_alpha_min=$params['hrr_alpha_min'];
	$hrr_alpha_mode=$params['hrr_alpha_mode'];
	$hrr_alpha_max=$params['hrr_alpha_max'];
	$hrrpua_min=$params['hrrpua_min'];
	$hrrpua_mode=$params['hrrpua_mode'];
	$hrrpua_max=$params['hrrpua_max'];
	$pre_evac=get_profile_code(implode(",", array($code,$management,$complexity,$alarming)));
	$pre_evac_fire_origin=get_profile_code(implode(",", array($code,"fire_origin")));
	return array(
		'evacuees_density'=>$evacuees_density,
		'hrr_alpha_min'=>$hrr_alpha_min,
		'hrr_alpha_mode'=>$hrr_alpha_mode,
		'hrr_alpha_max'=>$hrr_alpha_max,
		'hrrpua_min'=>$hrrpua_min,
		'hrrpua_mode'=>$hrrpua_mode,
		'hrrpua_max'=>$hrrpua_max,
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
	$json=read_aamks_conf_json();
	$out+=$json;
	$min_sim_time = read_evac_config_json()['SMOKE_QUERY_RESOLUTION'];
	if ($out['simulation_time'] < $min_sim_time){
		$out['simulation_time'] = $min_sim_time;
		$_SESSION['nn']->msg('Simulation time increased due to SMOKE_QUERY_RESOLUTION!');
	}
	$z=calculate_profile($out['building_profile']);
	$out['alarming']=alarming_defaults($out['building_profile']['alarming']);
	$out['evacuees_density']=$z['evacuees_density'];
	$out['hrr_alpha']['min']=$z['hrr_alpha_min'];
	$out['hrr_alpha']['mode']=$z['hrr_alpha_mode'];
	$out['hrr_alpha']['max']=$z['hrr_alpha_max'];
	$out['hrrpua']['min']=$z['hrrpua_min'];
	$out['hrrpua']['mode']=$z['hrrpua_mode'];
	$out['hrrpua']['max']=$z['hrrpua_max'];
	$z['pre_evac_fire_origin']['1st'] = 0;
	$z['pre_evac_fire_origin']['99th'] = 0;
	$out['pre_evac_fire_origin']=$z['pre_evac_fire_origin'];
	if(empty($z['pre_evac']['mean'])){
		$_SESSION['nn']->cannot("There is no data in that building profile!<br> Go to advanced or text editor and fill
		 out pre-evacuation time, pre-evacuation in fire origin. ");
		$z['pre_evac']['mean'] = 0;
		$z['pre_evac']['sd'] = 0;
		$z['pre_evac']['1st'] = 0;
		$z['pre_evac']['99th'] = 0;
		$out['pre_evac']=$z['pre_evac'];
	}else{
		$z['pre_evac']['1st'] = 0;
		$z['pre_evac']['99th'] = 0;
		$out['pre_evac']=$z['pre_evac'];
	}
	$s=json_encode($out, JSON_NUMERIC_CHECK);
	$_SESSION['nn']->write_scenario($s);
}
/*}}}*/
function update_form_advanced() {/*{{{*/
	if(empty($_POST['update_form_advanced'])) { return; }
	$out=$_POST['post'];
	$min_sim_time = read_evac_config_json()['SMOKE_QUERY_RESOLUTION'];
	if ($out['simulation_time'] < $min_sim_time){
		$out['simulation_time'] = $min_sim_time;
		$_SESSION['nn']->msg('Simulation time increased due to SMOKE_QUERY_RESOLUTION!');
	}
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
	echo "<div id='error' style='clear:both; margin-top:30px; background-color:#c60c0c; font-size:16px; display:inline-block;'></div>";
	echo "<form id='form' method=post>";
	echo "<input autocomplete=off type=submit name=update_form_advanced value='Save'><br><br>";
	echo "<table style='margin-bottom:200px'>";
    echo "<tr><td>&nbsp;</td></tr><tr><th><strong>GENERAL</strong></th>";
	echo "<tr><td>".get_help('project_id')."<td>$project_id <input autocomplete=off type=hidden name=post[project_id] value='$project_id'>"; 
	echo "/$scenario_id	<input autocomplete=off type=hidden name=post[scenario_id] value='$scenario_id'>"; 
	echo "<tr><td>".get_help('number_of_simulations')."<td><input autocomplete=off type=text automplete=off size=10 id='number_of_simulations' name=post[number_of_simulations] value='$number_of_simulations'>"; 
	echo "<tr><td>".get_help('simulation_time')."<td><input autocomplete=off type=text automplete=off size=10 id='simulation_time' name=post[simulation_time] value='$simulation_time'>"; 

    echo "<tr><td>&nbsp;</td></tr><tr><th><strong>FIRE SUB-MODEL</strong></th>";
	echo "<tr><td>".get_help('fire_model')."<td>".droplist_fire_model($fire_model); 
	echo "<tr><td>".get_help('indoor_temperature')."<td>".form_assoc('indoor_temperature',$indoor_temperature); 
	echo "<tr><td>".get_help('outdoor_temperature')."<td>".form_assoc('outdoor_temperature',$outdoor_temperature); 
	echo "<tr><td>".get_help('pressure')."<td>".form_assoc('pressure',$pressure); 
	echo "<tr><td>".get_help('humidity')."<td>".form_assoc('humidity',$humidity); 
	echo building_fields($building_profile, 'advanced');
	echo "<tr><td>".get_help('material')."<td>".form_material($json); 
	echo "<tr><td>".get_help('windows')."<td>".form_arr('windows',$windows); 
	echo "<tr><td>".get_help('vents_open')."<td>".form_assoc('vents_open',$vents_open); 
	echo "<tr><td><a class='rlink switch' id='heat_detectors'>Heat detectors</a>".get_help('heat_detectors')."<td>".form_plain_arr_switchable('heat_detectors',$heat_detectors); 
	echo "<tr><td><a class='rlink switch' id='smoke_detectors'>Smoke detectors</a>".get_help('smoke_detectors')."<td>".form_plain_arr_switchable('smoke_detectors',$smoke_detectors); 
	echo "<tr><td><a class='rlink switch' id='sprinklers'>Sprinklers</a>".get_help('sprinklers')."<td>".form_plain_arr_switchable('sprinklers',$sprinklers); 
	echo "<tr><td><a class='rlink switch' id='NSHEVS'>NSHEVS</a>".get_help('NSHEVS')."<td>".form_plain_arr_switchable('NSHEVS',$NSHEVS); 
	echo "<tr><td>".get_help('c_const')."<td><input autocomplete=off type=text automplete=off size=10 id='c_const' name=post[c_const] value='$c_const'>"; 
	echo "<tr><td>".get_help('fire_starts_in_a_room')."<td><input autocomplete=off type=text automplete=off size=10 id='fire_starts_in_a_room' name=post[fire_starts_in_a_room] value='$fire_starts_in_a_room'>"; 
	echo "<tr><td>".get_help('hrrpua')."<td>".form_assoc('hrrpua',$hrrpua); 
	echo "<tr><td>".get_help('hrr_alpha')."<td>".form_assoc('hrr_alpha',$hrr_alpha); 
	echo "<tr><td>".get_help('radfrac')."<td>".form_assoc('radfrac',$radfrac); 
	echo "<tr><td>".get_help('fuel')."<td>".droplist_fuel($fuel); 
    if ($fuel=='user'){$disp = True;}else{$disp = False;}
	echo "<tr><td><a class='rlink switch' id='molecule'>Molecule</a>".get_help('molecule')."<td>".form_plain_arr_switchable2('molecule',$molecule,$disp); 
	echo "<tr><td><a class='rlink switch' id='heatcom'>Heat of combustion</a>".get_help('heatcom')."<td>".form_plain_arr_switchable2('heatcom',$heatcom,$disp); 
	echo "<tr><td><a class='rlink switch' id='yields'>Yields</a>".get_help('yields')."<td>".form_plain_arr_switchable2('yields',$yields,$disp); 
	echo "<tr><td><a class='rlink switch' id='fire_load'>Fire load</a>".get_help('fire_load')."<td>".form_plain_arr_switchable2('fire_load',$fire_load,True); 

    echo "<tr><td>&nbsp;</td></tr><tr><th><strong>EVACUATION SUB-MODEL</strong></th>";
	echo "<tr><td>".get_help('dispatch_evacuees')."<td>".droplist_dipatch_evacuees($dispatch_evacuees); 
	echo "<tr><td>".get_help('alarming')."<td>".form_assoc('alarming',$alarming); 
	echo "<tr><td>".get_help('pre_evac')."<td>".form_assoc('pre_evac',$pre_evac); 
	echo "<tr><td>".get_help('pre_evac_fire_origin')."<td>".form_assoc('pre_evac_fire_origin',$pre_evac_fire_origin); 
	echo "<tr><td>".get_help('evacuees_max_h_speed')."<td>".form_assoc('evacuees_max_h_speed',$evacuees_max_h_speed); 
	echo "<tr><td>".get_help('evacuees_max_v_speed')."<td>".form_assoc('evacuees_max_v_speed',$evacuees_max_v_speed); 
	echo "<tr><td>".get_help('evacuees_alpha_v')."<td>".form_assoc('evacuees_alpha_v',$evacuees_alpha_v); 
	echo "<tr><td>".get_help('evacuees_beta_v')."<td>".form_assoc('evacuees_beta_v',$evacuees_beta_v); 
	echo "<tr><td>".get_help('evacuees_density')."<td>".form_assoc('evacuees_density',$evacuees_density); 

    echo "<tr><td>&nbsp;</td></tr><tr><th><strong>RESCUE SUB-MODEL</strong></th>";
	echo "<tr><td>".get_help('r_is')."<td>".droplist_rescue($r_is); 
	echo "<tr><td>".get_help('fire_area')."<td>".form_assoc('fire_area',$fire_area); 
	echo "<tr><td>".get_help('r_trans')."<td>".droplist_rescue_electronic($r_trans); 
	echo "<tr><td><a class='rlink switch' id='r_times'>Times</a>".get_help('r_times')."<td>".form_plain_arr_switchable3('r_times',$r_times); 
	echo "<tr><td>".get_help('cpr')."<td>".checkbox($r_cpr); 
	echo "<tr><td><a class='rlink switch' id='r_distances'>Fire Unit</a>".get_help('r_distances')."<td>".form_plain_arr_switchable3('r_distances',$r_distances); 
	echo "<tr><td><a class='rlink switch' id='r_to_fire'>Firehoses</a>".get_help('r_to_fire')."<td>".form_plain_arr_switchable3('r_to_fire',$r_to_fire); 
	echo "<tr><td><a class='rlink switch' id='r_nozzles'>Nozzles</a>".get_help('r_nozzles')."<td>".form_plain_arr_switchable3('r_nozzles',$r_nozzles); 
	echo "</table>";
	echo "</form>";
}
/*}}}*/
function form_fields_easy() { #{{{
	$json=read_aamks_conf_json();
	extract($json);
	echo "<div id='error' style='clear:both; margin-top:30px; background-color:#c60c0c; font-size:16px; display:inline-block;'></div>";
	echo "<form id='form' method=post>";
	echo "<input autocomplete=off type=submit name=update_form_easy value='Save'><br><br>";
	echo "<table>";
	echo "<tr><td>".get_help('project_id')."<td>$project_id <input autocomplete=off type=hidden name=post[project_id] value='$project_id'>"; 
	echo "/$scenario_id	<input autocomplete=off type=hidden name=post[scenario_id] value='$scenario_id'>"; 
	echo "<tr><td>".get_help('number_of_simulations')."<td><input autocomplete=off type=text automplete=off size=10 id='number_of_simulations' name=post[number_of_simulations] value='$number_of_simulations'>"; 
	echo "<tr><td>".get_help('simulation_time')."<td><input autocomplete=off type=text automplete=off size=10 id='simulation_time' name=post[simulation_time] value='$simulation_time'>"; 
	echo building_fields($building_profile, 'easy');
	echo "<tr><td>".get_help('material')."<td>".form_material($json); 
	echo "<tr><td><a class='rlink switch' id='heat_detectors'>Heat detectors</a>".get_help('heat_detectors')."<td>".form_plain_arr_switchable('heat_detectors',$heat_detectors); 
	echo "<tr><td><a class='rlink switch' id='smoke_detectors'>Smoke detectors</a>".get_help('smoke_detectors')."<td>".form_plain_arr_switchable('smoke_detectors',$smoke_detectors); 
	echo "<tr><td><a class='rlink switch' id='sprinklers'>Sprinklers</a>".get_help('sprinklers')."<td>".form_plain_arr_switchable('sprinklers',$sprinklers); 
	echo "<tr><td><a class='rlink switch' id='NSHEVS'>NSHEVS</a>".get_help('NSHEVS')."<td>".form_plain_arr_switchable('NSHEVS',$NSHEVS); 
	echo "</table>";
	echo "</form>";
	echo "<div style='float:left; margin-top: 20px; padding-left: 10px'><a href='?bprofiles'><button>Check values for building profiles</button></a></div>";
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
	echo "<input style='position:absolute;' onclick=delScenario() type=submit value='Delete this scenario'>";
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
function validation_easy(){
	echo "<script>
	document.getElementById('form').addEventListener('submit', function(e) {
		e.preventDefault();
		const intPattern = /^-?\d+$/;
		const floatPattern = /^-?\d*(\.\d*)?$/;
		let errorMessage = ''
		const noSim = document.getElementById('number_of_simulations').value;
		const timeSim = document.getElementById('simulation_time').value;
		const material_ceiling = document.getElementById('material_ceiling').value;
		const material_floor = document.getElementById('material_floor').value;
		const material_wall = document.getElementById('material_wall').value;
		const thick_material_ceiling = document.getElementById('thick_material_ceiling').value;
		const thick_material_floor = document.getElementById('thick_material_floor').value;
		const thick_material_wall = document.getElementById('thick_material_wall').value;
		const heat_detectors_mean = document.getElementById('heat_detectors_mean').value;
		const heat_detectors_sd = document.getElementById('heat_detectors_sd').value;
		const heat_detectors_RTI = document.getElementById('heat_detectors_RTI').value;
		const heat_detectors_not_broken = document.getElementById('heat_detectors_not_broken').value;
		const smoke_detectors_mean = document.getElementById('smoke_detectors_mean').value;
		const smoke_detectors_sd = document.getElementById('smoke_detectors_sd').value;
		const smoke_detectors_not_broken = document.getElementById('smoke_detectors_not_broken').value;
		const sprinklers_mean = document.getElementById('sprinklers_mean').value;
		const sprinklers_sd = document.getElementById('sprinklers_sd').value;
		const sprinklers_density_mean_val = document.getElementById('sprinklers_density_mean').value;
		let sprinklersDensityMean = '';
		if (sprinklers_density_mean_val !== ''){sprinklersDensityMean = parseFloat(sprinklers_density_mean_val).toString();}
		const sprinklers_density_sd_val = document.getElementById('sprinklers_density_sd').value;
		let sprinklersDensitySd = '';
		if (sprinklers_density_sd_val !== ''){sprinklersDensitySd = parseFloat(sprinklers_density_sd_val).toString();}
		const sprinklers_RTI = document.getElementById('sprinklers_RTI').value;
		const sprinklers_not_broken = document.getElementById('sprinklers_not_broken').value;
		const NSHEVS_activation_time = document.getElementById('NSHEVS_activation_time').value;
		const NSHEVS_startup_time = document.getElementById('NSHEVS_startup_time').value;
		const buildingManagement = document.getElementById('buildingManagement').value;
		const buildingComplexity = document.getElementById('buildingComplexity').value;
		const buildingAlarming = document.getElementById('buildingAlarming').value;
		if ((!noSim.match(intPattern)) || (noSim <= 0)) {
		  errorMessage += 'Wrong Number of simulations! Field must be an integer &gt 0!<br>'
		} 	  
		if ((!timeSim.match(intPattern)) || (timeSim < 0)) {
		  errorMessage += 'Wrong Simulation time! Field must be an integer > 0!<br>'
		}		
		if ((buildingManagement === '') || (buildingComplexity === '') || (buildingAlarming === '')){
		 	errorMessage += 'Please select a building profile - management, complexity, alarming option!<br>';
		}
		if ((material_ceiling === '') || (material_floor === '') || (material_wall === '')){
			errorMessage += 'Please select materials for ceiling, floor and wall!<br>';
		}
		errorFloatwithoutZero('Materials ceiling thickness', thick_material_ceiling);
		errorFloatwithoutZero('Materials floor thickness', thick_material_floor);
		errorFloatwithoutZero('Materials wall thickness', thick_material_wall);
		errorMeanSd('Heat detectors', heat_detectors_mean, heat_detectors_sd);
		errorFloatwithoutZero('Heat detectors RTI', heat_detectors_RTI);
		errorProbability('Heat detectors reliability', heat_detectors_not_broken);
		errorMeanSd('Smoke detectors', smoke_detectors_mean, smoke_detectors_sd);
		errorProbability('Smoke detectors reliability', smoke_detectors_not_broken);
		errorMeanSd('Sprinklers', sprinklers_mean, sprinklers_sd);
		errorMeanSdonlyPositive('Sprinklers SprayDensity', sprinklersDensityMean, sprinklersDensitySd);
		errorFloatwithoutZero('Sprinklers RTI', sprinklers_RTI);
		errorProbability('Sprinklers reliability', sprinklers_not_broken);
		errorFloatwithZero('NSHEVS activation time', NSHEVS_startup_time);
		errorFloatwithZero('NSHEVS start-up time', NSHEVS_startup_time);

		function errorFloatwithoutZero(param, value){
			if((!value.match(floatPattern)) || (parseFloat(value) <= 0)){
				errorMessage += 'Wrong '+param+'! Field must be a float number > 0 with (.) separator!<br>';
			}
		}
		function errorFloatwithZero(param, value){
			if((!value.match(floatPattern)) || (parseFloat(value) < 0)){
				errorMessage += 'Wrong '+param+'! Field must be a float number >= 0 with (.) separator!<br>';
			}
		}
		function errorMeanSdonlyPositive(param, mean, sd){
			if ((!mean.match(floatPattern)) || (!sd.match(floatPattern))){
				errorMessage += 'Wrong '+param+' mean or sd! Field must be an empty string or a float number > 0 with (.) separator!<br>'
			}
			if (!isEmpty(mean) && (parseFloat(mean) <= 0)){
				errorMessage += 'Wrong '+param+' mean! Field must be an empty string or a float number > 0 with (.) separator!<br>'
			}
			if (!isEmpty(sd) && (parseFloat(sd) <= 0)){
				errorMessage += 'Wrong '+param+' sd! Field must be an empty string or a float number > 0 with (.) separator!<br>'
			}
		}
		function errorMeanSd(param, mean, sd){
			if ((!mean.match(floatPattern)) || (!sd.match(floatPattern)) || (parseFloat(sd) < 0)){
				errorMessage += 'Wrong '+param+' mean or sd! Field must be a float number >= 0 with (.) separator!<br>'
			}
		}
		function errorProbability(param, value){
			if((!value.match(floatPattern)) || (parseFloat(value) < 0) || (parseFloat(value) > 1)){
				errorMessage += 'Wrong '+param+'! Field must be a float number >=0 and <= 1!<br>';
			}
		}
		document.getElementById('error').innerHTML = errorMessage;
		if (isEmpty(errorMessage)){
			const updateForm = document.createElement('input');
			updateForm.setAttribute('name', 'update_form_easy');
			updateForm.setAttribute('value', 'Save');
			document.getElementById('form').appendChild(updateForm);
			document.getElementById('form').submit();
		}
	  });	
	</script>";
}
function validation_advanced(){
	echo "<script>
	const fuel = document.getElementById('fuel');
	fuel.addEventListener('change', (e) => {
		const molecule_table = document.getElementById('molecule-table')
		const molecule_switch = document.getElementById('molecule-switch')
		if(e.target.value == 'user'){ 
			molecule_table.className = 'noborder';
			molecule_switch.className = 'no-display';
		}else{
			molecule_table.className = 'noborder no-display';
			molecule_switch.className = 'grey';
		}
	});
	document.getElementById('form').addEventListener('submit', function(e) {
		e.preventDefault();
		const intPattern = /^-?\d+$/;
		const floatPattern = /^-?\d*(\.\d*)?$/;
		let errorMessage = ''
		const noSim = document.getElementById('number_of_simulations').value;
		const timeSim = document.getElementById('simulation_time').value;
		const material_ceiling = document.getElementById('material_ceiling').value;
		const material_floor = document.getElementById('material_floor').value;
		const material_wall = document.getElementById('material_wall').value;
		const thick_material_ceiling = document.getElementById('thick_material_ceiling').value;
		const thick_material_floor = document.getElementById('thick_material_floor').value;
		const thick_material_wall = document.getElementById('thick_material_wall').value;
		const heat_detectors_mean = document.getElementById('heat_detectors_mean').value;
		const heat_detectors_sd = document.getElementById('heat_detectors_sd').value;
		const heat_detectors_RTI = document.getElementById('heat_detectors_RTI').value;
		const heat_detectors_not_broken = document.getElementById('heat_detectors_not_broken').value;
		const smoke_detectors_mean = document.getElementById('smoke_detectors_mean').value;
		const smoke_detectors_sd = document.getElementById('smoke_detectors_sd').value;
		const smoke_detectors_not_broken = document.getElementById('smoke_detectors_not_broken').value;
		const sprinklers_mean = document.getElementById('sprinklers_mean').value;
		const sprinklers_sd = document.getElementById('sprinklers_sd').value;
		const sprinklers_density_mean_val = document.getElementById('sprinklers_density_mean').value;
		let sprinklersDensityMean = '';
		if (sprinklers_density_mean_val !== ''){sprinklersDensityMean = parseFloat(sprinklers_density_mean_val).toString();}
		const sprinklers_density_sd_val = document.getElementById('sprinklers_density_sd').value;
		let sprinklersDensitySd = '';
		if (sprinklers_density_sd_val !== ''){sprinklersDensitySd = parseFloat(sprinklers_density_sd_val).toString();}
		const sprinklers_RTI = document.getElementById('sprinklers_RTI').value;
		const sprinklers_not_broken = document.getElementById('sprinklers_not_broken').value;
		const NSHEVS_activation_time = document.getElementById('NSHEVS_activation_time').value;
		const NSHEVS_startup_time = document.getElementById('NSHEVS_startup_time').value;
		const indoor_temperature_mean = document.getElementById('indoor_temperature_mean').value;
		const indoor_temperature_sd = document.getElementById('indoor_temperature_sd').value;
		const outdoor_temperature_mean = document.getElementById('outdoor_temperature_mean').value;
		const outdoor_temperature_sd = document.getElementById('outdoor_temperature_sd').value;
		const pressure_mean = document.getElementById('pressure_mean').value;
		const pressure_sd = document.getElementById('pressure_sd').value;
		const humidity_mean = document.getElementById('humidity_mean').value;
		const humidity_sd = document.getElementById('humidity_sd').value;
		const vents_open_DELECTR = document.getElementById('vents_open_DELECTR').value;
		const vents_open_DCLOSER = document.getElementById('vents_open_DCLOSER').value;
		const vents_open_DOOR = document.getElementById('vents_open_DOOR').value;
		const vents_open_VVENT = document.getElementById('vents_open_VVENT').value;
		const c_const = document.getElementById('c_const').value;
		const fire_starts_in_a_room = document.getElementById('fire_starts_in_a_room').value;
		const hrrpua_min = document.getElementById('hrrpua_min').value;
		const hrrpua_mode = document.getElementById('hrrpua_mode').value;
		const hrrpua_max = document.getElementById('hrrpua_max').value;
		const hrr_alpha_min = document.getElementById('hrr_alpha_min').value;
		const hrr_alpha_mode = document.getElementById('hrr_alpha_mode').value;
		const hrr_alpha_max = document.getElementById('hrr_alpha_max').value;
		const radfrac_k = document.getElementById('radfrac_k').value;
		const radfrac_theta = document.getElementById('radfrac_theta').value;
		const molecule_C = document.getElementById('molecule_C').value;
		const molecule_H = document.getElementById('molecule_H').value;
		const molecule_O = document.getElementById('molecule_O').value;
		const molecule_N = document.getElementById('molecule_N').value;
		const molecule_Cl = document.getElementById('molecule_Cl').value;
		const heatcom_mean = document.getElementById('heatcom_mean').value;
		const heatcom_sd = document.getElementById('heatcom_sd').value;
		const soot_mean = document.getElementById('soot_mean').value;
		const soot_sd = document.getElementById('soot_sd').value;
		const co_mean = document.getElementById('co_mean').value;
		const co_sd = document.getElementById('co_sd').value;
		const hcn_mean = document.getElementById('hcn_mean').value;
		const hcn_sd = document.getElementById('hcn_sd').value;
		const room_mean = document.getElementById('room_mean');
		const room_sd = document.getElementById('room_sd');
		const room_1st = document.getElementById('room_1st');
		const room_99th = document.getElementById('room_99th');
		const non_room_mean = document.getElementById('non_room_mean');
		const non_room_sd = document.getElementById('non_room_sd');
		const non_room_1st = document.getElementById('non_room_1st');
		const non_room_99th = document.getElementById('non_room_99th');
		const alarming_mean = document.getElementById('alarming_mean').value;
		const alarming_sd = document.getElementById('alarming_sd').value;
		const pre_evac_mean = document.getElementById('pre_evac_mean');
		const pre_evac_sd = document.getElementById('pre_evac_sd');
		const pre_evac_1st = document.getElementById('pre_evac_1st');
		const pre_evac_99th = document.getElementById('pre_evac_99th');
		const pre_evac_fire_origin_mean = document.getElementById('pre_evac_fire_origin_mean');
		const pre_evac_fire_origin_sd = document.getElementById('pre_evac_fire_origin_sd');
		const pre_evac_fire_origin_1st = document.getElementById('pre_evac_fire_origin_1st');
		const pre_evac_fire_origin_99th = document.getElementById('pre_evac_fire_origin_99th');
		const evacuees_max_h_speed_mean = document.getElementById('evacuees_max_h_speed_mean').value;
		const evacuees_max_h_speed_sd = document.getElementById('evacuees_max_h_speed_sd').value;
		const evacuees_max_v_speed_mean = document.getElementById('evacuees_max_v_speed_mean').value;
		const evacuees_max_v_speed_sd = document.getElementById('evacuees_max_v_speed_sd').value;
		const evacuees_alpha_v_mean = document.getElementById('evacuees_alpha_v_mean').value;
		const evacuees_alpha_v_sd = document.getElementById('evacuees_alpha_v_sd').value;
		const evacuees_beta_v_mean = document.getElementById('evacuees_beta_v_mean').value;
		const evacuees_beta_v_sd = document.getElementById('evacuees_beta_v_sd').value;
		const evacuees_density_ROOM = document.getElementById('evacuees_density_ROOM').value;
		const evacuees_density_COR = document.getElementById('evacuees_density_COR').value;
		const evacuees_density_STAI = document.getElementById('evacuees_density_STAI').value;
		const evacuees_density_HALL = document.getElementById('evacuees_density_HALL').value;
		const fire_area_b = document.getElementById('fire_area_b').value;
		const fire_area_scale = document.getElementById('fire_area_scale').value;
		const r_times_detection = document.getElementById('r_times_detection').value;
		const r_times_t1 = document.getElementById('r_times_t1').value;
		const r_times_t2 = document.getElementById('r_times_t2').value;
		const r_distances_1st = document.getElementById('r_distances_1st').value;
		const r_distances_2nd = document.getElementById('r_distances_2nd').value;
		const r_to_fire_horizontal = document.getElementById('r_to_fire_horizontal').value;
		const r_to_fire_vertical = document.getElementById('r_to_fire_vertical').value;
		const r_nozzles_1st = document.getElementById('r_nozzles_1st').value;
		const r_nozzles_2nd = document.getElementById('r_nozzles_2nd').value;
		const r_nozzles_3rd = document.getElementById('r_nozzles_3rd').value;
		const r_nozzles_4th = document.getElementById('r_nozzles_4th').value;

		errorMeanSd('Initial indoor temperature', indoor_temperature_mean, indoor_temperature_sd);
		errorMeanSd('Initial outdoor temperature', outdoor_temperature_mean, outdoor_temperature_sd);
		errorMeanSd('Initial pressure', pressure_mean, pressure_sd);
		errorMeanSd('Initial humidity', humidity_mean, humidity_sd);

		for (let i = 0; i < 4; i++){
			if((!document.getElementById('windows_min'+i).value.match(intPattern)) || (!document.getElementById('windows_max'+i).value.match(intPattern)) ||
			(!document.getElementById('windows_quarter'+i).value.match(floatPattern)) || (parseFloat(document.getElementById('windows_quarter'+i).value) < 0) ||
			(parseFloat(document.getElementById('windows_quarter'+i).value) > 1) ||
			(!document.getElementById('windows_full'+i).value.match(floatPattern)) || (parseFloat(document.getElementById('windows_full'+i).value) < 0) ||
			(parseFloat(document.getElementById('windows_full'+i).value) > 1)){
				errorMessage += 'Wrong windows openness values in '+(i+1)+' row! Min or max must be integer value and probability must be float with (.) separator contains between 0 and 1!<br>'
				console.log(errorMessage);
			}
		}
		errorProbability('Openings DELECTR', vents_open_DELECTR);
		errorProbability('Openings DCLOSER', vents_open_DCLOSER);
		errorProbability('Openings DOOR', vents_open_DOOR);
		errorProbability('Openings VVENT', vents_open_VVENT);
		if ((!noSim.match(intPattern)) || (noSim <= 0)) {
		  errorMessage += 'Wrong Number of simulations! Field must be an integer &gt 0!<br>'
		} 	  
		if ((!timeSim.match(intPattern)) || (timeSim < 0)) {
			errorMessage += 'Wrong Simulation time! Field must be an integer > 0!<br>'
		}			
		if ((material_ceiling === '') || (material_floor === '') || (material_wall === '')){
			errorMessage += 'Please select materials for ceiling, floor and wall!<br>';
		}
		errorFloatwithoutZero('Materials ceiling thickness', thick_material_ceiling);
		errorFloatwithoutZero('Materials floor thickness', thick_material_floor);
		errorFloatwithoutZero('Materials wall thickness', thick_material_wall);
		errorMeanSd('Heat detectors', heat_detectors_mean, heat_detectors_sd);
		errorFloatwithoutZero('Heat detectors RTI', heat_detectors_RTI);
		errorProbability('Heat detectors reliability', heat_detectors_not_broken);
		errorMeanSd('Smoke detectors', smoke_detectors_mean, smoke_detectors_sd);
		errorProbability('Smoke detectors reliability', smoke_detectors_not_broken);
		errorMeanSd('Sprinklers', sprinklers_mean, sprinklers_sd);
		errorMeanSdonlyPositive('Sprinklers SprayDensity', sprinklersDensityMean, sprinklersDensitySd);
		errorFloatwithoutZero('Sprinklers RTI', sprinklers_RTI);
		errorProbability('Sprinklers reliability', sprinklers_not_broken);
		errorFloatwithZero('NSHEVS activation time', NSHEVS_startup_time);
		errorFloatwithZero('NSHEVS start-up time', NSHEVS_startup_time);
		errorFloatwithoutZero('C constant', c_const);
		errorProbability('Fire in ROOM', fire_starts_in_a_room);
		errorTriangular('HRRPUA', hrrpua_min, hrrpua_mode, hrrpua_max);
		errorTriangular('Fire growth rate', hrr_alpha_min, hrr_alpha_mode, hrr_alpha_max);
		errorFloatwithoutZero('Radiative fraction k', radfrac_k);
		errorFloatwithoutZero('Radiative fraction theta', radfrac_theta);

		if (fuel.value == 'user'){
			if((molecule_C == '') || (molecule_C == '') || (molecule_C == '') || (molecule_C == '') || (molecule_C == '')){
				errorMessage += 'Wrong user defined Molecule C, H, O, N or Cl! Field cannot be empty! Change Fuel or complete field!<br>';
			}
		}

		errorFloatwithZero('Molecule C', molecule_C);
		errorFloatwithZero('Molecule H', molecule_H);
		errorFloatwithZero('Molecule O', molecule_O);
		errorFloatwithZero('Molecule N', molecule_N);
		errorFloatwithZero('Molecule Cl', molecule_Cl);
		errorMeanSd('Heat of combustion', heatcom_mean, heatcom_sd);
		errorMeanSd('Yields soot', soot_mean, soot_sd);
		errorMeanSd('Yields co', co_mean, co_sd);
		errorMeanSd('Yields hcn', hcn_mean, hcn_sd);
		errorMeanSdwithPercentile('Fire load room', room_mean, room_sd, room_1st, room_99th);
		errorMeanSdwithPercentile('Fire load non room', non_room_mean, non_room_sd, non_room_1st, non_room_99th);
		errorMeanSd('Alarming time', alarming_mean, alarming_sd);
		errorMeanSdwithPercentile('Pre-evacuation time', pre_evac_mean, pre_evac_sd, pre_evac_1st, pre_evac_99th);
		errorMeanSdwithPercentile('Pre-evacuation time in fire origin', pre_evac_fire_origin_mean, pre_evac_fire_origin_sd, pre_evac_fire_origin_1st, pre_evac_fire_origin_99th);
		errorMeanSd('Horizontal speed', evacuees_max_h_speed_mean, evacuees_max_h_speed_sd);
		errorMeanSd('Vertical speed', evacuees_max_v_speed_mean, evacuees_max_v_speed_sd);
		errorMeanSd('Alpha speed', evacuees_alpha_v_mean, evacuees_alpha_v_sd);
		errorMeanSdlessZero('Beta speed', evacuees_beta_v_mean, evacuees_beta_v_sd);
		errorFloatwithZero('Evacuees density ROOM', evacuees_density_ROOM);
		errorFloatwithZero('Evacuees density COR', evacuees_density_COR);
		errorFloatwithZero('Evacuees density STAI', evacuees_density_STAI);
		errorFloatwithZero('Evacuees density HALL', evacuees_density_HALL);
		errorFloatwithoutZero('Pareto fire area b', fire_area_b);
		errorFloatwithoutZero('Pareto fire area scale', fire_area_scale);
		errorFloatwithZero('RESCUE Times detection', r_times_detection);
		errorFloatwithZero('RESCUE Times T1', r_times_t1);
		errorFloatwithZero('RESCUE Times T2', r_times_t2);
		errorFloatwithZero('RESCUE Fire Unit 1st', r_distances_1st);
		errorFloatwithZero('RESCUE Fire Unit 2nd', r_distances_2nd);
		errorFirstgreaterthanSec('RESCUE Fire Unit distance', r_distances_1st, r_distances_2nd);
		errorFloatwithZero('RESCUE Firehoses horizontal', r_to_fire_horizontal);
		errorFloat('RESCUE Firehoses vertical', r_to_fire_vertical);
		errorFloatminusOne('RESCUE Nozzles 1st', r_nozzles_1st);
		errorFirstgreaterthanSec('RESCUE Nozzles 1st 2nd', r_nozzles_1st, r_nozzles_2nd);
		errorFloatminusOne('RESCUE Nozzles 2nd', r_nozzles_2nd);
		errorFirstgreaterthanSec('RESCUE Nozzles 2nd 3rd', r_nozzles_2nd, r_nozzles_3rd);
		errorFloatminusOne('RESCUE Nozzles 3rd', r_nozzles_3rd);
		errorFirstgreaterthanSec('RESCUE Nozzles 3rd 4th', r_nozzles_3rd, r_nozzles_4th);
		errorFloatminusOne('RESCUE Nozzles 4th', r_nozzles_4th);

		function errorFloat(param, value){
			if(!value.match(floatPattern)){
				errorMessage += 'Wrong '+param+'! Field must be a float number with (.) separator!<br>';
			}
		}
		function errorFloatwithoutZero(param, value){
			if((!value.match(floatPattern)) || (parseFloat(value) <= 0)){
				errorMessage += 'Wrong '+param+'! Field must be a float number > 0 with (.) separator!<br>';
			}
		}
		function errorFloatwithZero(param, value){
			if((!value.match(floatPattern)) || (parseFloat(value) < 0)){
				errorMessage += 'Wrong '+param+'! Field must be a float number >= 0 with (.) separator!<br>';
			}
		}
		function errorFloatminusOne(param, value){
			if((!value.match(floatPattern)) || ((parseFloat(value) < 0) && (value != -1))){
				errorMessage += 'Wrong '+param+'! Field must be a float number >= 0 or -1 with (.) separator!<br>';
			}
		}
		function errorFirstgreaterthanSec(param, value1, value2){
			if(((parseFloat(value1) > parseFloat(value2)) && (value1 != -1) && (value2 != -1)) || ((value1 == -1) && (value2 != -1))){
				errorMessage += 'Wrong '+param+'! The previous parameter must be lower than the next one and != -1!<br>';
			}
		}
		function errorMeanSd(param, mean, sd){
			if ((!mean.match(floatPattern)) || (!sd.match(floatPattern)) || (parseFloat(sd) < 0)){
				errorMessage += 'Wrong '+param+' mean or sd! Field must be a float number >= 0 with (.) separator!<br>'
			}
		}
		function errorMeanSdlessZero(param, mean, sd){
			if ((!mean.match(floatPattern)) || (parseFloat(mean) > 0) || (!sd.match(floatPattern)) || (parseFloat(sd) < 0)){
				errorMessage += 'Wrong '+param+' mean or sd! Field must be a float number <= 0 with (.) separator!<br>'
			}
		}
		function errorMeanSdonlyPositive(param, mean, sd){
			if ((!mean.match(floatPattern)) || (!sd.match(floatPattern))){
				errorMessage += 'Wrong '+param+' mean or sd! Field must be an empty string or a float number > 0 with (.) separator!<br>'
			}
			if (!isEmpty(mean) && (parseFloat(mean) <= 0)){
				errorMessage += 'Wrong '+param+' mean! Field must be an empty string or a float number > 0 with (.) separator!<br>'
			}
			if (!isEmpty(sd) && (parseFloat(sd) <= 0)){
				errorMessage += 'Wrong '+param+' sd! Field must be an empty string or a float number > 0 with (.) separator!<br>'
			}
		}
		function errorProbability(param, value){
			if((!value.match(floatPattern)) || (parseFloat(value) < 0) || (parseFloat(value) > 1)){
				errorMessage += 'Wrong '+param+'! Field must be a float number >=0 and <= 1!<br>';
			}
		}
		function errorTriangular(param, min, mode, max){
			if ((!min.match(floatPattern)) || (parseFloat(min) < 0) || (!mode.match(floatPattern)) || (parseFloat(mode) < 0) || (parseFloat(mode) < parseFloat(min)) ||
			(!max.match(floatPattern)) || (parseFloat(max) < 0) || (parseFloat(max) < parseFloat(mode))){
				errorMessage += 'Wrong '+param+' min, mode or max! Field must be a float number > 0 with (.) separator! Min < Mode < Max!<br>'
			}
		}
		function errorMeanSdwithPercentile(param, mean, sd, per1, per9){
			if (((mean.value != 0) || (sd.value !=0 )) && ((per1.value != 0) || (per9.value != 0))){
				errorMessage += 'Wrong '+param+' choose mean and sd or 1st and 99th distribution!<br>';
			}
			if ((!mean.value.match(floatPattern)) || (parseFloat(mean.value) < 0) || (!sd.value.match(floatPattern)) || (parseFloat(sd.value) < 0)) {
				errorMessage += 'Wrong '+param+' mean, sd! Field must be a float number > 0 with (.) separator! 1st and 99th are not considered.<br>'
				per1.value = '';
				per9.value = '';
			}
			if ((!per1.value.match(floatPattern)) || (parseFloat(per1.value) < 0) || (!per9.value.match(floatPattern)) || (parseFloat(per9.value) < 0) || (parseFloat(per9.value) < parseFloat(per1.value))) {
				errorMessage += 'Wrong '+param+' 1st or 99th! Field must be a float number > 0 with (.) separator! 1st <= 99th ! Mean and sd are not considered.<br>'
				mean.value = '';
				sd.value = '';
			}
		}
		document.getElementById('error').innerHTML = errorMessage;
		if (isEmpty(errorMessage)){
			const updateForm = document.createElement('input');
			updateForm.setAttribute('name', 'update_form_advanced');
			updateForm.setAttribute('value', 'Save');
			document.getElementById('form').appendChild(updateForm);
			document.getElementById('form').submit();
		}
	  });
	</script>";
}

function main() {/*{{{*/
	if(!array_key_exists('nn', $_SESSION))
	{
		header("Location: login.php?session_finished_information=1");
	}
	$_SESSION['nn']->htmlHead("Scenario properties");
	$_SESSION['nn']->menu();
	change_editor();
	delete_scenario();
	make_help();
	form_delete();
	if(isset($_GET['edit'])) { 
		$e=$_SESSION['prefs']['apainter_editor'];
		if($e=='easy')     { update_form_easy()     ; form_fields_easy()     ; validation_easy()	 ;}
		if($e=='advanced') { update_form_advanced() ; form_fields_advanced() ; validation_advanced() ;}
		if($e=='text')     { update_form_text()     ; form_text()            ; }
	}

	if(isset($_GET['bprofiles'])) { $_SESSION['nn']->menu('Building profiles'); form_bprofiles(); update_form_bprofiles(); exit(); }

	editors();
}
/*}}}*/

main();
?>
