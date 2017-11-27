<?php

require_once("models/global_values/fdsEntitiesTextEditor.php");

// TODO: pousuwac niepotrzebne unset

$rampInited = [];

// Tutaj unset i przygotowanie jsona do skladania fdsa
function parseJson($json) {/*{{{*/

	$json['general']['misc']['gvec'] = "" . $json['general']['misc']['gvec_x'] . "," . $json['general']['misc']['gvec_y'] . "," . $json['general']['misc']['gvec_z'] . ""; 
	unset($json['general']['misc']['gvec_x']);
	unset($json['general']['misc']['gvec_y']);
	unset($json['general']['misc']['gvec_z']);

	return $json;
}
/*}}}*/
function fdsarr2str2($json, $amper) {/*{{{*/

	// Wartosci domyslne
    global $fdsEntities;
	// Atrybuty zawsze widoczne w pliku tekstowym
	$fdsVisible = array('title', 'chid', 't_end');
	// Atrybuty zawsze usuniete w pliku tekstowym
	$fdsHidden = array();

	foreach($json as $key=>$value) {

		// testowanie
		//if($key == 'noise'){
		//	$value1 = $fdsEntities[$amper][$key]['default'][0];
		//	$result[]=sprintf("%s=%s,%s", strtoupper($key), $value, $value1);
		//	continue;
		//}
		//if($key == 'surf_id' && $amper == 'vent' && $value == 'hvac'){
		//	error_log("Amper: " . $amper);
		//	error_log("Key: " . $key);
		//	error_log("Value: ;" . $value . ";");
		//	error_log("Default: " . $fdsEntities[$amper][$key]['default'][0]);
		//	error_log("Type: " . $fdsEntities[$amper][$key]['type']);
		//}

		// Jezeli nie ma takiego atrybutu to pomijaj
		if(!isset($fdsEntities[$amper][$key])){
			continue;
		}

		// Cast'uj dla okreslonych typow danych
		if($fdsEntities[$amper][$key]['type'] == 'Real'){
			$value = (real)$value;
		}
		else if($fdsEntities[$amper][$key]['type'] == 'Logical'){
			if((string)$value == 'true' || $value == 1) $value = ".TRUE.";
			else $value = ".FALSE.";
		}

		//error_log("Cast value: " . $value);

		// Schowaj jezeli pusty atrybut typu character
		if(!is_array($value)){
			if ((empty($value) and !is_numeric($value)) or (string)$value == "") {
				if (!in_array($key, $fdsVisible))
					unset($json[$key]);
					continue;
			}
		}

		// Castuj character
		if($fdsEntities[$amper][$key]['type'] == 'Character'){
			// Jeżeli kolor to zawsze na duze litery
			if($key == 'color' or $value == 'hvac' or $key == 'quantity')
				$value = "'" . strtoupper($value) ."'";
			else
				$value = "'" . $value ."'";
		}

		// Schowaj jezeli na liscie ukrytych
		if(in_array($key, $fdsHidden)){
			unset($json[$key]);
			continue;
		}
		// Zawsze wyswietlaj
		else if (in_array($key, $fdsVisible)){
			$result[]=sprintf("%s=%s", strtoupper($key), $value);
			continue;
		}
		// Schowaj jezeli wartosc domyslna
		else if($fdsEntities[$amper][$key]['type'] == 'Logical'){
			if($value == ".TRUE." and $fdsEntities[$amper][$key]['default'][0] == "true"){
				unset($json[$key]);
				continue;
			}
			else if($value == ".FALSE." and $fdsEntities[$amper][$key]['default'][0] == "false"){
				unset($json[$key]);
				continue;
			}
			else{
				$result[]=sprintf("%s=%s", strtoupper($key), $value);
				continue;
			}
		}
		else if(isset($fdsEntities[$amper][$key]['default'][0]) and $fdsEntities[$amper][$key]['type'] == 'Character'){
			if(strtoupper($value) == strtoupper("'" . $fdsEntities[$amper][$key]['default'][0] . "'")){
				unset($json[$key]);
				continue;
			}
			else {
				$result[]=sprintf("%s=%s", strtoupper($key), $value);
			}
		}
		else if(isset($fdsEntities[$amper][$key]['default'][0]) and $value == $fdsEntities[$amper][$key]['default'][0]){
			unset($json[$key]);
			continue;
		}
		else {
			if(is_array($value)){
				if($fdsEntities[$amper][$key]['type'] == 'CharacterDoublet')
					$result[]=sprintf("%s='%s'", strtoupper($key), join("','", $value));
				else
					$result[]=sprintf("%s=%s", strtoupper($key), join(',', $value));
			}
			else {
				$result[]=sprintf("%s=%s", strtoupper($key), $value);
			}
			continue;
		}
	}
	$value = $amper;

	if(!is_null($result))
		return join(", ",$result);
	else
		return;


}
/*}}}*/
function convertXb($array){/*{{{*/
	return join(',',$array);
}
/*}}}*/
function convertXyz($array){/*{{{*/
	return join(',',$array);
}
/*}}}*/
function convertRamp($array, $id){/*{{{*/
	$ramp = [];
	foreach($array as $key=>$value){
		$ramp[] = sprintf("&RAMP ID='%s' T=%s, F=%s /", $id, $value['t'], $value['f']); 
	}
	return $ramp;

}
/*}}}*/

function fds_object_GENERAL_HEAD($data) {/*{{{*/
	$parsed = fdsarr2str2($data, "head");
	if(!empty($parsed))
		return array(sprintf("&HEAD %s /",$parsed));
	return array();
}
/*}}}*/
function fds_object_GENERAL_INIT($data) {/*{{{*/
	$parsed = fdsarr2str2($data, "init");
	if(!empty($parsed))
		return array(sprintf("&INIT %s /",$parsed));
	return array();
}
/*}}}*/
function fds_object_GENERAL_MISC($data) {/*{{{*/
	$parsed = fdsarr2str2($data, "misc");
	if(!empty($parsed))
		return array(sprintf("&MISC %s /",$parsed));
	return array();
}
/*}}}*/
function fds_object_GENERAL_TIME($data) {/*{{{*/
	$parsed = fdsarr2str2($data, "time");
	if(!empty($parsed))
		return array(sprintf("&TIME %s /",$parsed));
	return array();
}
/*}}}*/
function fds_object_GEOMETRY_MESHES($data) {/*{{{*/
	$out=[];
	foreach($data as $key=>$v) {
		$out[]=sprintf("&MESH IJK=%s,%s,%s, XB=%s /",$v['i'],$v['j'],$v['k'], convertXb($v['xb']));
		//extract($v['open']);
		//extract($v['xb']);
		//if ($mx1=="'TRUE'") { $out[]=sprintf("&VENT XB=%s,%s,%s,%s,%s,%s, SURF_ID='OPEN' /", $x1, $x1, $y1, $y2, $z1, $z2); }
		//if ($mx2=="'TRUE'") { $out[]=sprintf("&VENT XB=%s,%s,%s,%s,%s,%s, SURF_ID='OPEN' /", $x2, $x2, $y1, $y2, $z1, $z2); }
		//if ($my1=="'TRUE'") { $out[]=sprintf("&VENT XB=%s,%s,%s,%s,%s,%s, SURF_ID='OPEN' /", $x1, $x2, $y1, $y1, $z1, $z2); }
		//if ($my2=="'TRUE'") { $out[]=sprintf("&VENT XB=%s,%s,%s,%s,%s,%s, SURF_ID='OPEN' /", $x1, $x2, $y2, $y2, $z1, $z2); }
		//if ($mz1=="'TRUE'") { $out[]=sprintf("&VENT XB=%s,%s,%s,%s,%s,%s, SURF_ID='OPEN' /", $x1, $x2, $y1, $y2, $z1, $z1); }
		//if ($mz2=="'TRUE'") { $out[]=sprintf("&VENT XB=%s,%s,%s,%s,%s,%s, SURF_ID='OPEN' /", $x1, $x2, $y1, $y2, $z2, $z2); }
	}
	return $out;
}
/*}}}*/
function fds_object_GEOMETRY_OPENS($data) {/*{{{*/
	$opens=[];
	foreach($data as $key=>$val) {
		$val['xb'] = convertXb($val['xb']);
		$parsedOpen = fdsarr2str2($val, 'vent');
		$opens[]=sprintf("&VENT %s,  /", $parsedOpen);
	}
	return $opens;
}
/*}}}*/

function fds_object_FIRES_COMBUSTION($data) {/*{{{*/
	if(!empty($data['fuel']['spec'])){
		unset($data['fuel']['formula']);
		unset($data['fuel']['c']);
		unset($data['fuel']['h']);
		unset($data['fuel']['n']);
		unset($data['fuel']['o']);
	}
	else if (!empty($data['fuel']['formula'])) {
		unset($data['fuel']['spec']);
		unset($data['fuel']['c']);
		unset($data['fuel']['h']);
		unset($data['fuel']['n']);
		unset($data['fuel']['o']);
	} else {
		unset($data['fuel']['spec']);
		unset($data['fuel']['formula']);
	}

	$parsed = fdsarr2str2($data['fuel'], "reac");
	if(!empty($parsed))
		return array(sprintf("&REAC %s /",$parsed));
	return array();

}
/*}}}*/
function fds_object_FIRES_RADIATION($data) {/*{{{*/
	$parsed = fdsarr2str2($data, "radi");
	if(!empty($parsed))
		return array(sprintf("&RADI %s /",$parsed));
	return array();
}
/*}}}*/
function fds_object_FIRES_FIRES($data, $ramps) {/*{{{*/
	global $rampInited;
	$fires=[];

	foreach($data as $key=>$value) {
		if($value['surf']['fire_type'] == "constant_hrr"){
			unset($value['surf']['fire_type']);

			// To do usuniecia po poprawce Michala
			$value['surf']['id'] = $value['id'];

			$hrr_type = $value['surf']['hrr']['hrr_type'];
			$value['surf']["$hrr_type"] = $value['surf']['hrr']['value'];
			unset($value['surf']['hrr']);

			$parsed = fdsarr2str2($value['surf'], "surf");
			if(!empty($parsed))
				$fires[] = sprintf("&SURF %s /",$parsed);

			$fires[]=sprintf("&VENT SURF_ID='%s', XB=%s /", $value['surf']['id'], convertXb($value['vent']['xb']));
			continue;
		}

		if($value['surf']['fire_type'] == "time_dependent_hrrpua"){
			unset($value['surf']['fire_type']);

			// To do usuniecia po poprawce Michala
			$value['surf']['id'] = $value['id'];

			$hrr_type = $value['surf']['hrr']['hrr_type'];
			$value['surf']["$hrr_type"] = $value['surf']['hrr']['value'];

			if($value['surf']['hrr']['time_function'] == "ramp"){
				$value['surf']['ramp_q'] = $value['surf']['ramp_id'];
			} else if($value['surf']['hrr']['time_function'] == "tauq"){
				$value['surf']['tau_q'] = $value['surf']['hrr']['tau_q'];
			}

			$parsed = fdsarr2str2($value['surf'], "surf");
			if(!empty($parsed))
				$fires[] = sprintf("&SURF %s /",$parsed);

			$fires[]=sprintf("&VENT SURF_ID='%s', XB=%s /", $value['surf']['id'], convertXb($value['vent']['xb']));

			if($value['surf']['hrr']['time_function'] == 'ramp'){
				foreach($ramps as $k=>$v){
					if($v['id'] == $value['surf']['ramp_q'] and !in_array($value['surf']['ramp_q'], $rampInited)){
						$ramp = convertRamp($v['steps'], $v['id']);
						$rampInited[] = $value['surf']['ramp_id'];
					}
				}
				$fires=array_merge($fires, $ramp);
			}
			continue;
		}

		if($value['surf']['fire_type'] == "radially_spreading"){
			unset($value['surf']['fire_type']);
			unset($value['surf']['ramp_id']);

			// To do usuniecia po poprawce Michala
			$value['surf']['id'] = $value['id'];

			$hrr_type = $value['surf']['hrr']['hrr_type'];
			$value['surf']["$hrr_type"] = $value['surf']['hrr']['value'];
			$spread_rate = $value['surf']['hrr']['spread_rate'];
			unset($value['surf']['hrr']);

			$parsed = fdsarr2str2($value['surf'], "surf");
			if(!empty($parsed))
				$fires[] = sprintf("&SURF %s /",$parsed);

			$fires[]=sprintf("&VENT SURF_ID='%s', XB=%s, XYZ=%s, SPREAD_RATE=%s /", $value['surf']['id'], convertXb($value['vent']['xb']), convertXyz($value['vent']['xyz']), $spread_rate);
			continue;

		}

	}
	return $fires;
	

}
/*}}}*/

function fds_object_VENTILATION_SURFS($data, $ramps) {/*{{{*/
	global $rampInited;
	$surfs=[];
	foreach($data as $key=>$value) {

		if($value['flow']['type'] == "volumeFlow"){
			$value['volume_flow'] = $value['flow']['volume_flow'];
			unset($value['flow']);
		} else if($value['flow']['type'] == "velocity"){
			$value['vel'] = $value['flow']['velocity'];
			unset($value['flow']);
		} else if($value['flow']['type'] == "massFlow"){
			$value['mass_flux'] = $value['flow']['mass_flow'];
			unset($value['flow']);
		}

		if($value['heater']['active'] == true){
			$value['tmp_front'] = $value['heater']['tmp_front'];
		}
		unset($value['heater']);

		if($value['louver']['active'] == true){
			$value['vel_t'] = [$value['louver']['tangential1'], $value['louver']['tangential2']];
		}
		unset($value['louver']);

		if(isset($value['ramp_id'])){
			$ramp = [];
			$value['ramp_v'] = $value['ramp_id'];
			unset($value['ramp_id']);

			if(!in_array($value['ramp_v'], $rampInited)){
				foreach($ramps as $k=>$v){
					if($v['id'] == $value['ramp_v']){
						$ramp = convertRamp($v['steps'], $v['id']);
						$rampInited[] = $value['ramp_v'];
					}
				}
			}
			$parsed = fdsarr2str2($value, "surf");
			$surfs[] = sprintf("&SURF %s /",$parsed);
			$surfs=array_merge($surfs, $ramp);
		} else {
			$parsed = fdsarr2str2($value, "surf");
			$surfs[] = sprintf("&SURF %s /",$parsed);
		}

	}
	return $surfs;
}
/*}}}*/
function fds_object_VENTILATION_VENTS($data) {/*{{{*/
	$vents=[];
	foreach($data as $key=>$val) {
		$parsed = fdsarr2str2($val, 'vent');
		$vents[]=sprintf("&VENT %s /", $parsed); 
	}
	return $vents;
}
/*}}}*/
function fds_object_VENTILATION_JETFANS($data, $ramps) {/*{{{*/
	global $rampInited;
	$jetfans=[];
	foreach($data as $key=>$val) {
		if(isset($val['ramp_id']) and !in_array($val['ramp_id'], $rampInited)){
			foreach($ramps as $k=>$v){
				if($v['id'] == $val['ramp_id']){
					$ramp = convertRamp($v['steps'], $v['id']);
					$rampInited[] = $val['ramp_id'];
				}
			}
			$jetfans=array_merge($jetfans, $ramp);
			$jetfans[] = "";
		}

		if($val['devc']['active'] == true){
			$devc = [];
			$devc['id'] = "$val[id]_devc";
			$devc['xyz'] = convertXyz(Array("x"=>($val['xb']['x1'] + ($val['xb']['x2'] - $val['xb']['x1']) / 2), "y"=>($val['xb']['y1'] + ($val['xb']['y2'] - $val['xb']['y1']) / 2), "z"=>($val['xb']['z1'] + ($val['xb']['z2'] - $val['xb']['z1']) / 2)));
			$devc['quantity'] = "TEMPERATURE";
			$devc['setpoint'] = $val['devc']['setpoint'];
			$devc['initial_state'] = true;
			$parsedDevc = fdsarr2str2($devc, 'devc');
			$jetfans[]=sprintf("&DEVC %s /", $parsedDevc);
		}

		$obstDuct = [];
		$obstDuct['xb'] = convertXb($val['xb']);
		$obstDuct['color'] = 'silver';
		if($val['devc']['active'] == true)
			$obstDuct['devc_id'] = "$val[id]_devc";
		$parsedObstDuct = fdsarr2str2($obstDuct, 'obst');
		$jetfans[]=sprintf("&OBST %s /", $parsedObstDuct);
		// VENT in/out/*{{{*/
		$ventIn = [];
		$ventIn['id'] = "$val[id]_vent_in";
		$ventIn['surf_id'] = 'hvac';
		$ventIn['color'] = 'blue';

		$ventOut = [];
		$ventOut['id'] = "$val[id]_vent_out";
		$ventOut['surf_id'] = 'hvac';
		$ventOut['color'] = 'red';
		if($val['louver']['active'] == true){
			$ventOut['uvw'] = [$val['louver']['tangential1'], $val['louver']['tangential2'], $val['louver']['tangential3']];
		}

		if($val['direction'] == '+x'){
			$ventIn['xb'] = convertXb(Array("x1"=>$val['xb']['x1']  , "x2"=>$val['xb']['x1'] , "y1"=>$val['xb']['y1'] , "y2"=>$val['xb']['y2'] , "z1"=>$val['xb']['z1'] , "z2"=>$val['xb']['z2']));
			$ventOut['xb'] = convertXb(Array("x1"=>$val['xb']['x2'] , "x2"=>$val['xb']['x2'] , "y1"=>$val['xb']['y1'] , "y2"=>$val['xb']['y2'] , "z1"=>$val['xb']['z1'] , "z2"=>$val['xb']['z2']));
		} else if($val['direction'] == '-x'){
			$ventIn['xb'] = convertXb(Array("x1"=>$val['xb']['x2']  , "x2"=>$val['xb']['x2'] , "y1"=>$val['xb']['y1'] , "y2"=>$val['xb']['y2'] , "z1"=>$val['xb']['z1'] , "z2"=>$val['xb']['z2']));
			$ventOut['xb'] = convertXb(Array("x1"=>$val['xb']['x1'] , "x2"=>$val['xb']['x1'] , "y1"=>$val['xb']['y1'] , "y2"=>$val['xb']['y2'] , "z1"=>$val['xb']['z1'] , "z2"=>$val['xb']['z2']));
		}
		else if($val['direction'] == '+y'){
			$ventIn['xb'] = convertXb(Array("x1"=>$val['xb']['x1']  , "x2"=>$val['xb']['x2'] , "y1"=>$val['xb']['y1'] , "y2"=>$val['xb']['y1'] , "z1"=>$val['xb']['z1'] , "z2"=>$val['xb']['z2']));
			$ventOut['xb'] = convertXb(Array("x1"=>$val['xb']['x1'] , "x2"=>$val['xb']['x2'] , "y1"=>$val['xb']['y2'] , "y2"=>$val['xb']['y2'] , "z1"=>$val['xb']['z1'] , "z2"=>$val['xb']['z2']));
		} else if($val['direction'] == '-y'){
			$ventIn['xb'] = convertXb(Array("x1"=>$val['xb']['x1']  , "x2"=>$val['xb']['x2'] , "y1"=>$val['xb']['y2'] , "y2"=>$val['xb']['y2'] , "z1"=>$val['xb']['z1'] , "z2"=>$val['xb']['z2']));
			$ventOut['xb'] = convertXb(Array("x1"=>$val['xb']['x1'] , "x2"=>$val['xb']['x2'] , "y1"=>$val['xb']['y1'] , "y2"=>$val['xb']['y1'] , "z1"=>$val['xb']['z1'] , "z2"=>$val['xb']['z2']));
		}
		else if($val['direction'] == '+z'){
			$ventIn['xb'] = convertXb(Array("x1"=>$val['xb']['x1']  , "x2"=>$val['xb']['x2'] , "y1"=>$val['xb']['y1'] , "y2"=>$val['xb']['y2'] , "z1"=>$val['xb']['z1'] , "z2"=>$val['xb']['z1']));
			$ventOut['xb'] = convertXb(Array("x1"=>$val['xb']['x1'] , "x2"=>$val['xb']['x2'] , "y1"=>$val['xb']['y1'] , "y2"=>$val['xb']['y2'] , "z1"=>$val['xb']['z2'] , "z2"=>$val['xb']['z2']));
		} else if($val['direction'] == '-z'){
			$ventIn['xb'] = convertXb(Array("x1"=>$val['xb']['x1']  , "x2"=>$val['xb']['x2'] , "y1"=>$val['xb']['y1'] , "y2"=>$val['xb']['y2'] , "z1"=>$val['xb']['z2'] , "z2"=>$val['xb']['z2']));
			$ventOut['xb'] = convertXb(Array("x1"=>$val['xb']['x1'] , "x2"=>$val['xb']['x2'] , "y1"=>$val['xb']['y1'] , "y2"=>$val['xb']['y2'] , "z1"=>$val['xb']['z1'] , "z2"=>$val['xb']['z1']));
		}

		$parsedVentIn = fdsarr2str2($ventIn, 'vent');
		$jetfans[]=sprintf("&VENT %s /", $parsedVentIn);

		$parsedVentOut = fdsarr2str2($ventOut, 'vent');
		$jetfans[]=sprintf("&VENT %s /", $parsedVentOut);
		/*}}}*/

		$hvacIn = [];
		$hvacIn['id'] = "$val[id]_hvac_in";
		$hvacIn['type_id'] = "NODE";
		$hvacIn['duct_id'] = "'$val[id]_hvac_duct'";
		$hvacIn['vent_id'] = "$val[id]_vent_in";
		$parsedHvacIn = fdsarr2str2($hvacIn, 'hvac');
		$jetfans[]=sprintf("&HVAC %s /", $parsedHvacIn);

		$hvacOut = [];
		$hvacOut['id'] = "$val[id]_hvac_out";
		$hvacOut['type_id'] = "NODE";
		$hvacOut['duct_id'] = "'$val[id]_hvac_duct'";
		$hvacOut['vent_id'] = "$val[id]_vent_out";
		$parsedHvacOut = fdsarr2str2($hvacOut, 'hvac');
		$jetfans[]=sprintf("&HVAC %s /", $parsedHvacOut);

		$hvacDuct = [];
		$hvacDuct['id'] = "$val[id]_hvac_duct";
		$hvacDuct['type_id'] = "DUCT";
		$hvacDuct['node_id'] = [$hvacIn['id'], $hvacOut['id']];
		if($val['flow']['type'] == 'volumeFlow'){
			$hvacDuct['volume_flow'] = $val['flow']['volume_flow'];
		} else if($val['flow']['type'] == 'massFlow'){
			$hvacDuct['mass_flow'] = $val['flow']['mass_flow'];
		}
		if($val['area']['type'] == 'area'){
			$hvacDuct['area'] = $val['area']['area'];
		} else if($val['area']['type'] == 'perimeter'){
			$hvacDuct['perimeter'] = $val['area']['perimeter'];
		} else if($val['area']['type'] == 'diameter'){
			$hvacDuct['diameter'] = $val['area']['diameter'];
		}
		if(isset($val['ramp_id']) and $val['ramp_id'] != ""){
			$hvacDuct['ramp_id'] = "$val[ramp_id]";
		}
		$parsedHvacDuct = fdsarr2str2($hvacDuct, 'hvac');
		$jetfans[]=sprintf("&HVAC %s /", $parsedHvacDuct);

	}
	return $jetfans;
}
/*}}}*/

function fds_object_GEOMETRY_MATLS($data, $ramps) {/*{{{*/
	global $rampInited;
	$matls=[];
	foreach($data as $key=>$val) {
		$parsed = fdsarr2str2($val, "matl");
		$matls[]=sprintf("&MATL %s /",$parsed);
		if($val['conductivity_ramp']['id'] and !in_array($val['conductivity_ramp'], $rampInited)){
			foreach($ramps as $k=>$v){
				if($v['id'] == $val['conductivity_ramp']){
					$ramp = convertRamp($v['steps'], $v['id']);
					$rampInited[] = $val['conductivity_ramp'];
				}
			}
			$matls=array_merge($matls, $ramp);
			$matls[]="";
		}
		if($val['specific_heat_ramp']['id'] and !in_array($val['specific_heat_ramp'], $rampInited)){
			foreach($ramps as $k=>$v){
				if($v['id'] == $val['specific_heat_ramp']){
					$ramp = convertRamp($v['steps'], $v['id']);
					$rampInited[] = $val['specific_heat_ramp'];
				}
			}
			$matls=array_merge($matls, $ramp);
			$matls[]="";
		}
	}
	return $matls;
}
/*}}}*/
function fds_object_GEOMETRY_SURFS($data) {/*{{{*/
	$surfs=[];
	foreach($data as $key=>$val) {

		$layers=$val['layers'];
		unset($val['layers']);

		$parsed = fdsarr2str2($val, "surf");

		if (count($layers)!=0) { 

			$matls=[];
			$thickness=[];
			foreach($layers as $kk=>$vv) {
				$fractions=[];
				$thickness[]=$vv['thickness'];
				foreach($vv['materials'] as $id=>$arr) {
					$matls[]=sprintf(" MATL_ID(%s,%s)='%s'", $kk+1, $id+1, $arr['matl_id']);
					$fractions[]=$arr['fraction'];
				}
				if(count($fractions)>1)
					$matls[]=sprintf(" MATL_MASS_FRACTION=(%s,1:%s)=%s", $kk+1, count($fractions), join(",",$fractions));
				else
					$matls[]=" ";
			}
			$surfs[]=sprintf("&SURF %s,%s, THICKNESS=%s /", $parsed, join(',', $matls), join(',',$thickness));
			continue;
		}
		$surfs[]=sprintf("&SURF %s /", $parsed);

	}
	return $surfs;
}
/*}}}*/
function fds_object_GEOMETRY_OBSTS($data) {/*{{{*/
	$obsts=[];
	$i = 1;

	foreach($data as $key=>$val) {

		$surf_type=strtoupper($val['surf']['type']);
		unset($val['surf']['type']);
		$surfs_array = array_values($val['surf']);
		array_walk($surfs_array, function(&$value, $key) { $value = "'".$value."'"; });
		$surfs=join(',', $surfs_array);
		unset($val['surf']);

		$parsed = fdsarr2str2($val, "obst");

		if($surfs != "")
			$obsts[]=sprintf("&OBST %s, %s=%s /", $parsed, $surf_type, $surfs);
		else
			$obsts[]=sprintf("&OBST %s /", $parsed);
		
		//if($i >= 100){
		//	$obsts[]="Click to see more elements ...";
		//	break;
		//}
	}
	return $obsts;
}
/*}}}*/
function fds_object_GEOMETRY_HOLES($data) {/*{{{*/
	$holes=[];
	foreach($data as $key=>$val) {
		$xb = convertXb($val['xb']);
		unset($val['xb']);

		$parsed = fdsarr2str2($val, "hole");
		$holes[]=sprintf("&HOLE %s, XB=%s /", $parsed, $xb);
	}
	return $holes;

}
/*}}}*/

function fds_object_OUTPUT_GENERAL($data) {/*{{{*/
	if(count($data["plot3d_quantities"]) > 0){
		$count = count($data["plot3d_quantities"]);
		$pl3dQuantities = ", PLOT3D_QUANTITY(1:$count)=";

		foreach($data["plot3d_quantities"] as $val) {
			$pl3dQuantities .="'". strtoupper($val) ."'";
			if($val != end($data["plot3d_quantities"]))
				$pl3dQuantities .= ", ";
		}
	}
	$parsed = fdsarr2str2($data, "dump");
	if(!empty($parsed))
		return array(sprintf("&DUMP %s%s /", $parsed, $pl3dQuantities));
	return array();
}
/*}}}*/
function fds_object_OUTPUT_BNDFS($data) {/*{{{*/
	$bndfs=[];
	foreach($data as $key=>$val) {
		if($val['marked']==true) {
			$parsed = fdsarr2str2($val, 'bndf');
			$bndfs[]=sprintf("&BNDF %s /", $parsed);
		}
	}
	return $bndfs;
}
/*}}}*/
function fds_object_OUTPUT_DEVCS($data) {/*{{{*/
	$devcs=[];
	foreach ($data as $key=>$val) {
		if($val['geometrical_type']=="point") unset($val['xb']);
		else unset($val['xyz']);

		if(($val['statistics']['integral_lower'] != -1e50 or $val['statistics']['integral_upper'] != 1e50) and ($val['statistics']['statistics'] == "volume integral" or $val['statistics']['statistics'] == "mass integral" or $val['statistics']['statistics'] == "area integral" or $val['statistics']['statistics'] == "surface integral"))
			$val['quantity_range'] = array($val['statistics']['integral_lower'], $val['statistics']['integral_upper']);
		$val['statistics'] = strtoupper($val['statistics']['statistics']);

		$parsed = fdsarr2str2($val, 'devc');
		$devcs[]=sprintf("&DEVC %s /", $parsed);
	}
	return $devcs;
}
/*}}}*/
function fds_object_OUTPUT_SLCFS($data) {/*{{{*/
	$slcfs=[];
	foreach($data as $key=>$val) {
		foreach ($val['quantities'] as $kk=>$vv) {
			if ($vv['marked']==true) {
				if($val['direction'] == 'x') $val['pbx'] = $val['value'];
				if($val['direction'] == 'y') $val['pby'] = $val['value'];
				if($val['direction'] == 'z') $val['pbz'] = $val['value'];
				$val['quantity']=$vv['name'];

				$parsed = fdsarr2str2($val, 'slcf');

				$slcfs[]=sprintf("&SLCF %s /", $parsed);
			}
		}
	}
	return $slcfs;
}
/*}}}*/
function fds_object_OUTPUT_ISOFS($data) {/*{{{*/
	$isofs=[];
	foreach($data as $key=>$val) {
		$parsed = fdsarr2str2($val, 'isof');
		$valuescollector=[];
		foreach($val['values'] as $kk=>$vv) {
			$valuescollector[]=sprintf(' VALUE(%s)=%s', $kk, $vv);
		}
		$isofs[]=sprintf("&ISOF %s,%s /", $parsed, join(',', $valuescollector));
	}
	return $isofs;
}
/*}}}*/
function fds_object_OUTPUT_PROPS($data) {/*{{{*/
	$out=[];
	foreach($data as $k=>$v) {
		extract($v);
		switch($smokeview_id) {
			case "'SMOKE DETECTOR'":
				$out[]=sprintf("&PROP ACTIVATION_OBSCURATION=%s, ID=%s, QUANTITY=%s, SMOKEVIEW_ID=%s /", $activation_obscuration, $id, $quantity, $smokeview_id);
				break;
			case "'NOZZLE'":
				if ($flow_rate==0) {
					$out[]=sprintf("&PROP ACTIVATION_TEMPERATURE=%s, ID=%s, K_FACTOR=%s, OFFSET=%s, OPERATING_PRESSURE=%s, PART_ID=%s, PARTICLE_VELOCITY=%s, PRESSURE_RAMP=%s, SPRAY_ANGLE=%s /", $activation_temperature, $id, $k_factor, $offset, $operating_pressure, $part_id, $particle_velocity, $pressure_ramp, join(',',array($spray_angle1, $spray_angle2)));
				} else {
					$out[]=sprintf("&PROP ACTIVATION_TEMPERATURE=%s, ID=%s, OFFSET=%s, PART_ID=%s, PARTICLE_VELOCITY=%s, SPRAY_ANGLE=%s, FLOW_RATE=%s /", $activation_temperature, $id, $offset, $part_id, $particle_velocity, join(',',array($spray_angle1, $spray_angle2)), $flow_rate);
				}
				break;
			case "'SPRINKLER'":
				if ($flow_rate==0) {
					$out[]=sprintf("&PROP ACTIVATION_TEMPERATURE=%s, ID=%s, K_FACTOR=%s, OFFSET=%s, OPERATING_PRESSURE=%s, PART_ID=%s, PARTICLE_VELOCITY=%s, PRESSURE_RAMP=%s, QUANTITY=%s, RTI=%s, SPRAY_ANGLE=%s /", $activation_temperature, $id, $k_factor, $offset, $operating_pressure, $part_id, $particle_velocity, $pressure_ramp, $quantity, $rti, join(',',array($spray_angle1, $spray_angle2)));
				} else {
					$out[]=sprintf("&PROP ACTIVATION_TEMPERATURE=%s, ID=%s, OFFSET=%s, PART_ID=%s, PARTICLE_VELOCITY=%s, QUANTITY=%s, RTI=%s, SPRAY_ANGLE=%s, FLOW_RATE=%s /", $activation_temperature, $id, $offset, $part_id, $particle_velocity, $quantity, $rti, join(',',array($spray_angle1, $spray_angle2)), $flow_rate);
				}
				break;
		}
	}
	return $out;
}
/*}}}*/

function fds_object_PARTS($data) {/*{{{*/
	$out=[];
	foreach($data as $k=>$v) {
		$out[]=sprintf("&PART %s /",fdsarr2str2($v));
	}
	return $out;
}
/*}}}*/
function fds_object_RAMPFUNCTIONS($data) {/*{{{*/
	$out=[];
	foreach($data as $k=>$v) {
		foreach ($v['steps'] as $kk=>$vv) {
			$out[]=sprintf("&RAMP ID=%s, T=%s, F=%s /", $v['id'], $vv['f'], $vv['t']); 
		}
	}
	return $out;
}
/*}}}*/
function fds_object_SPECIES($data) {/*{{{*/
	$out=[];
	foreach($data as $k=>$v) {
		if (!empty($v['formula'])) {
			$out[]=sprintf("&SPEC ID=%s, FORMULA=%s /", $v['id'], $v['formula']); 
		} else {
			$out[]=sprintf("&SPEC ID=%s, MW=%s /", $v['id'], $v['mw']); 
		}
	}
	return $out;
}
/*}}}*/

function json2fds($json) {/*{{{*/
	//global $fdsEntities;
	//return $fdsEntities['head']['chid']['default'][0];
	$json=$json['fds_object'];
	unset($json['exporters']);
	unset($json['importers']);
	unset($json['removers']);
	// Zamien niestandardowe pola json'a
	$json=parseJson($json);
	// Usun puste i domyslne pola json'a
	//$json=removeEmptyDefault($json, "");
	//return $json;

	//$json=quotesAroundJsonStrings($json['fds_object']);

	#$json=readJson("in.json");
	$fds=[];

	$fds=array_merge($fds, array("# ---- General ----"));
	$fds=array_merge($fds,fds_object_GENERAL_HEAD($json['general']['head']));
	$fds=array_merge($fds,fds_object_GENERAL_TIME($json['general']['time']));
	$fds=array_merge($fds,fds_object_GENERAL_INIT($json['general']['init']));
	$fds=array_merge($fds,fds_object_GENERAL_MISC($json['general']['misc']));
	$fds[]="";
	$fds=array_merge($fds, array("# ---- Mesh ----"));
	$fds=array_merge($fds,fds_object_GEOMETRY_MESHES($json['geometry']['meshes']));
	$fds[]="";
	$fds=array_merge($fds,fds_object_GEOMETRY_OPENS($json['geometry']['opens']));

	$fds=array_merge($fds, array("# ---- Fire ----"));
	$fds=array_merge($fds,fds_object_FIRES_COMBUSTION($json['fires']['combustion']));
	$fds=array_merge($fds,fds_object_FIRES_RADIATION($json['fires']['radiation']));
	$fds[]="";
	$fds=array_merge($fds,fds_object_FIRES_FIRES($json['fires']['fires'], $json['ramps']['ramps']));
	$fds[]="";

	$fds=array_merge($fds, array("# ---- Ventilation ----"));
	$fds=array_merge($fds, array("## ---- SURF ----"));
	$fds=array_merge($fds,fds_object_VENTILATION_SURFS($json['ventilation']['surfs'], $json['ramps']['ramps']));
	$fds[]="";
	$fds=array_merge($fds, array("## ---- VENT ----"));
	$fds=array_merge($fds,fds_object_VENTILATION_VENTS($json['ventilation']['vents']));
	$fds[]="";
	$fds=array_merge($fds, array("## ---- JET-FAN ----"));
	$fds=array_merge($fds,fds_object_VENTILATION_JETFANS($json['ventilation']['jetfans'], $json['ramps']['ramps']));
	$fds[]="";

	$fds=array_merge($fds, array("# ---- Output ----"));
	$fds=array_merge($fds, array("## ---- GENERAL ----"));
	$fds=array_merge($fds,fds_object_OUTPUT_GENERAL($json['output']['general']));
	$fds[]="";
	$fds=array_merge($fds, array("## ---- BNDF ----"));
	$fds=array_merge($fds,fds_object_OUTPUT_BNDFS($json['output']['bndfs']));
	$fds[]="";
	$fds=array_merge($fds, array("## ---- DEVC ----"));
	$fds=array_merge($fds,fds_object_OUTPUT_DEVCS($json['output']['devcs']));
	$fds[]="";
	$fds=array_merge($fds, array("## ---- SLCF ----"));
	$fds=array_merge($fds,fds_object_OUTPUT_SLCFS($json['output']['slcfs']));
	$fds[]="";
	$fds=array_merge($fds, array("## ---- ISOF ----"));
	$fds=array_merge($fds,fds_object_OUTPUT_ISOFS($json['output']['isofs']));
	$fds[]="";
	//$fds=array_merge($fds, array("## ---- PROP ----"));
	//$fds=array_merge($fds,fds_object_OUTPUT_PROPS($json['output']['props']));
	$fds[]="";

	$fds=array_merge($fds, array("# ---- Geometry ----"));
	$fds=array_merge($fds, array("## ---- MATL ----"));
	$fds=array_merge($fds,fds_object_GEOMETRY_MATLS($json['geometry']['matls'], $json['ramps']['ramps']));
	$fds[]="";
	$fds=array_merge($fds, array("## ---- SURF ----"));
	$fds=array_merge($fds,fds_object_GEOMETRY_SURFS($json['geometry']['surfs']));
	$fds[]="";
	$fds=array_merge($fds, array("## ---- OBST ----"));
	$fds=array_merge($fds,fds_object_GEOMETRY_OBSTS($json['geometry']['obsts']));
	$fds[]="";
	$fds=array_merge($fds, array("## ---- HOLE ----"));
	$fds=array_merge($fds,fds_object_GEOMETRY_HOLES($json['geometry']['holes']));
	$fds[]="";
	$fds=array_merge($fds, array("&TAIL /"));



	//$fds=array_merge($fds, array("/ ---- Parts, Species ----"));
	//$fds=array_merge($fds,fds_object_PARTS($json['parts']['parts']));
	//$fds=array_merge($fds,fds_object_SPECIES($json['species']['species']));

	return join("\n",$fds);
}
/*}}}*/

#$json=readJson("examples/in.json");
#json2fds($json);

// Old
function fdsarr2str($arr) {/*{{{*/
	$result=[];
	foreach($arr as $k=>$v) {
		if (!empty($v))
			$result[]=sprintf("%s=%s", strtoupper($k), $v);
		else if (empty($v) and !is_numeric($v))
			$result[]=sprintf("%s='%s'", strtoupper($k), $v);
		else if (empty($v) and is_numeric($v))
			$result[]=sprintf("%s=%s", strtoupper($k), $v);
	}
	return join(", ",$result);
}
/*}}}*/
function removeEmptyDefault($json, $amper)/*{{{*/
{
	// Wartosci domyslne
    global $fdsEntities;
	// Atrybuty zawsze widoczne w pliku tekstowym
	$fdsVisible = array('title', 'chid');
	// Atrybuty zawsze usuniete w pliku tekstowym
	$fdsHidden = array('uuid');

	foreach ($json as $key => $value) {
		if (is_array($value)) {
			//echo "Run: " . $key . "<br/>";
			$json[$key] = removeEmptyDefault($json[$key], $key);
		}

		//if(in_array($amper, array('', 'general', 'fires', 'geometry', 'output', 'parts', 'rampFunctions', 'species'))){
		//	//echo "Key continue: " . $key . "<br/>";
		//	continue;
		//}
		
		// Sprawdzenie typu i zmiana
		if($fdsEntities[$amper][$key]['type'] == 'Character'){
			$json[$key] = "'-" . $value ."-'";
		}
		else if($fdsEntities[$amper][$key]['type'] == 'Real'){
			$json[$key] = (real)$value;
		}

		// Schowaj jezeli pusty atrybut 
		if (empty($json[$key]) and !is_numeric($json[$key])) {
			if (!in_array($key, $fdsVisible))
				unset($json[$key]);
		}
		else if(!is_array($value)) {

			if(in_array($key, $fdsHidden)){
				unset($json[$key]);
			}
			// Wyswietl pomimo ze wartosc domyslna
			if (in_array($key, $fdsVisible)){
				continue;
			}
			// Schowaj jezeli wartosc domyslna
			//if($value == "'" . $fdsEntities[$amper][$key]['default'][0] ."'" or $value == $fdsEntities[$amper][$key]['default'][0]){
			//if($value == $fdsEntities[$amper][$key]['default'][0]){
			//	unset($json[$key]);
			//}
			//print_r();
			//echo "<br/><br/>";
		}
	}
	return $json;
}
/*}}}*/
function quotesAroundJsonStrings($obj) {/*{{{*/
	if (is_array($obj)) {
		return array_map('quotesAroundJsonStrings',$obj);
	} else {
		if (preg_match('/[a-zA-Z]/', $obj)) {  $obj="'$obj'"; }
		return $obj;
	}
}
/*}}}*/
function readJson($file) {/*{{{*/
	$json=json_decode(file_get_contents($file),1);

	return quotesAroundJsonStrings($json2);
}
/*}}}*/
?>
