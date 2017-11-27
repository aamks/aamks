<?php

//require_once("server/view/global-values-array.php");

function json2risk($json) {/*{{{*/
	$json=$json['risk_object'];

	//error_log(json_encode($json));

	$risk=array(
		"GENERAL" => array(
			"PROJECT_NAME" => $json['general']['project_name'],
			"BUILDING_CATEGORY" => $json['building']['type'],
			"SIMULATION_TIME" => $json['general']['simulation_time'],
			"NUMBER_OF_SIMULATIONS" => $json['general']['number_of_simulations'],
			"VISUALIZATION_RESOLUTION" => 10,
			"DUMP_DISTRIBUTIONS" => 0,   
			"MATERIAL_CEILING" => $json['materials']['ceiling']['id'],
			"MATERIAL_FLOOR" => $json['materials']['floor']['id'],
			"MATERIAL_WALL" => $json['materials']['wall']['id'],
			"AUTO_DETECTORS" => (int)$json['building']['has_fire_detectors'],
			"AUTO_SPRINKLERS" => (int)$json['building']['has_sprinklers'],
			"C_CONST" => 8,
			"LAYER_HEIGHT" => 1.8
		),
		"EGGMAN_CONF" => array(
			"TIME_STEP" => 0.05,
			"NUM_OF_STEPS" => $json['general']['simulation_time'] * 20,
			"NEIGHBOR_DISTANCE" => 80,
			"MAX_NEIGHBOR" => 5,
			"TIME_HORIZON" => 1.0,
			"TIME_HORIZON_OBSTACLE" => 0.05,
			"RADIUS" => 30,
			"NODE_RADIUS" => 30,
			"WALL_MARGIN" => 30
		),
		"COLORS" => array(
			"ROOM" => "#d6d6d6",
			"COR"  => "#aa66ff",
			"HALL" => "#aaff00",
			"STAI" => "#ff0080",
			"W"    => "#4f96ff",
			"D"    => "#ff8000",
			"E"    => "#80ff00",
			"C"    => "#ffff00",
			"HOLE" => "#00a0a0",
			"VNT"  => "#00e0b5" 
		)
	);

	return $risk;
}
/*}}}*/

?>
