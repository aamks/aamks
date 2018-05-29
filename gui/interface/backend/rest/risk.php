<?php
// RISK SCENARIOS
	function createRiskScenario($args) {/*{{{*/ 

		try {
			$post=file_get_contents('php://input');
			$postData=json_decode($post);
			$data=Array(
				"project_id"=>nullToEmpty($args['project_id']),
				"name"=>"New risk scenario",
				"risk_object"=>"",
				"ui_state"=>json_encode(nullToEmpty($postData->ui_state)),
				"ac_file"=>"",
				"ac_hash"=>""
				
			);
			global $db;
			$result=$db->pg_create("insert into risk_scenarios(project_id, name, risk_object, ui_state, ac_file, ac_hash) values ($1, $2, $3, $4, $5, $6) returning id", $data);
			
			$id=$result[0]['id'];
			$data['id']=$id;

			$path="/home/aamks_users/".$_SESSION['email']."/".$args['project_id']."/risk/$id";
			system("mkdir -p $path");

		} catch(Exception $e) {
			$result="error";
		}

		if($result!="error" && !is_null($id) && $id!="") {
			
			$decoded_ui=json_decode($data['ui_state']);
			$data['ui_state']=$decoded_ui;

			$res=Array(
				"meta"=>Array(
					"status" => "success",
					"from" => "createRiskScenario()",
					"details" => Array($data['name']." created")
				),
				"data"=>$data
			);
		} else {
			$res=Array(
				"meta"=>Array(
					"status" => "error",
					"from" => "createRiskScenario()",
					"details" => Array("An error has occur - scenario was not created properly")
				),
				"data"=>array()
			);
		}
		echo json_encode($res);	
	}
/*}}}*/
	function updateRiskScenario($args) {/*{{{*/
		global $db;
		$result = "";

		$post = file_get_contents('php://input');
		error_log($post);

		try {
			$postData=json_decode($post);
			if($postData->type=="head") {
				$data=Array(
					"id"=>nullToEmpty($postData->data->id),
					"name"=>nullToEmpty($postData->data->name)
					//"has_fds_file"=>nullToEmpty($postData->data->has_fds_file),
					//"has_ac_file"=>nullToEmpty($postData->data->has_ac_file)
				);
				$db_result=$db->pg_change("update risk_scenarios set name=$2 where id=$1;", $data);

			} else {
				$data=Array(
					"id"=>nullToEmpty($args['id']),
					"name"=>nullToEmpty($postData->data->name),
					"riskObject"=>json_encode(nullToEmpty($postData->data->riskObject)),
					"uiState"=>json_encode(nullToEmpty($postData->data->uiState)),
					"acFile"=>nullToEmpty($postData->data->acFile),
					"acHash"=>nullToEmpty($postData->data->acHash)
				);
				$db_result=$db->pg_change("update risk_scenarios set name=$2, risk_object=$3, ui_state=$4, ac_file=$5, ac_hash=$6 where id=$1;", $data);
			}
			
		} catch(Exception $e) {
			$result="error";
		}
		
		if($result!="error" && $db_result==1) {
			//$data['ui_state']=$postData->data->ui_state;
			//$data['risk_object']=$postData->data->risk_object;
			
			$res=Array(
				"meta"=>Array(
					"status" => "success",
					"from" => "updateRiskScenario()",
					"details" => Array("Scenario ".$postData->data->name." updated sucessfully")
				),
				"data"=>$data
			);
		} else {
			$res=Array(
				"meta"=>Array(
					"status" => "error",
					"from" => "updateRiskScenario()",
					"details" => Array("Server error! Scenario not updated")
				),
				"data"=>array()
			);
		}
		echo json_encode($res);	
	}
/*}}}*/
	function deleteRiskScenario($args) {/*{{{*/

		try {
			$data=Array(
				"id"=>$args['id']
			);
			global $db;
			$db_result_projects=$db->pg_read("select project_id from risk_scenarios where id=$1", $data);
			$db_result_scenarios=$db->pg_change("delete from risk_scenarios where id=$1;", $data);
			$result="success";

		} catch(Exception $e) {
			$result="error";
		}
		if($result!="error" && $db_result_scenarios==1) {
			// Usun katalog scenariusza
			$path="/home/aamks_users/".$_SESSION['email']."/".$db_result_projects[0]['project_id']."/risk/".$args['id'];
			rrmdir($path);

			$res=Array(
				"meta"=>Array(
					"status" => "success",
					"from" => "deleteRiskScenario()",
					"details" => Array("Scenario deleted")
				),
				"data"=>$data
			);
		} else {
			$res=Array(
				"meta"=>Array(
					"status" => "error",
					"from" => "deleteRiskScenario()",
					"details" => Array("Server error! Scenario not deleted")
				),
				"data"=>array()
			);
		}
		echo json_encode($res);	
	}
/*}}}*/
function getRiskScenario($args) {/*{{{*/

		$result = "";

		try {
			$post=file_get_contents('php://input');
			$data=Array(
				"id"=>nullToEmpty($args['id'])
			);
			
			global $db;
			$db_result=$db->pg_read("select id, project_id, name, risk_object, ui_state, ac_file, ac_hash from risk_scenarios where id=$1", $data);

		} catch(Exception $e) {
			$result="error";
		}

		if($result!="error" && !is_null($db_result)) {
			
			$decoded_ui=json_decode($db_result[0]['ui_state']);
			$decoded_object=json_decode($db_result[0]['risk_object']);

			$res_data=array(
				"id"=>$db_result[0]['id'],
				"projectId"=>$db_result[0]['project_id'],
				"name"=>$db_result[0]['name'],
				"riskObject"=>$decoded_object,
				"uiState"=>$decoded_ui,
				"acFile"=>$db_result[0]['ac_file'],
				"acHash"=>$db_result[0]['ac_hash']
			);

			$res=Array(
				"meta"=>Array(
					"status" => "info",
					"from" => "getRiskScenario()",
					"details" => Array("Scenario ".$db_result[0]['name']." loaded")
				),
				"data"=>$res_data
			);
		} else {
			$res=Array(
				"meta"=>Array(
					"status" => "error",
					"from" => "getRiskScenario()",
					"details" => Array("Server error! Scenario not loaded")
				),
				"data"=>array()
			);
		}
		echo json_encode($res);	
	}
/*}}}*/
	function runRiskScenario($args) {/*{{{*/ 
		
		global $db;
		$post=json_decode(file_get_contents('php://input'),1);

		$path="/home/aamks_users/".$_SESSION['email']."/".$post['general']['project_id']."/risk/".$post['general']['scenario_id'];
		system("mkdir -p $path");
		array_map('unlink', glob("$path/*"));

		// Create cad.json
		file_put_contents("$path/cad.json", json_encode($post['geometry']));
		unset($post['geometry']);

		// Create conf_aamks.json
		file_put_contents("$path/conf_aamks.json", json_encode($post));

		// Run aamks
		my_shell_exec("python3 /home/svn/svn_mimooh/eggman/devel/eggman.py $path", $stdout, $stderr);

		// obsluga bledow: brak drzwi
		if($stderr == "") {
			$res=Array(
				"meta"=>Array(
					"status" => "success",
					"from" => "runRiskScenario()",
					"details" => Array($stdout)
				),
				"data"=>Array(
					"text"=>""
				)
			);
		}
		else if($stderr!= "") { // python fatal
			$res=Array(
				"meta"=>Array(
					"status" => "success",
					"from" => "runRiskScenario()",
					"details" => Array($stdout)
				),
				"data"=>Array(
					"text"=>""
				)
			);
		}
		else { // success
			$res=Array(
				"meta"=>Array(
					"status" => "error",
					"from" => "runRiskScenario()",
					"details" => Array($stderr)
				),
				"data"=>Array(
					"text"=> ""
				)
			);
		}
		echo json_encode($res);	
	}
/*}}}*/
// RISK POSTPROCESSING
	function generateRiskResults($args) {/*{{{*/ 
		
		global $db;
		$post=json_decode(file_get_contents('php://input'),1);

		//$conf_simo=json2risk($post);

		$path="/home/aamks_users/".$_SESSION['email']."/".$post['project_id']."/risk/".$post['id'];
		error_log($path);

		my_shell_exec("python3 /home/svn/svn_mimooh/eggman/devel/beck/beck.py $path", $stdout, $stderr);

		// tutaj przeniesienie plikow out do /resources/

		// zwrocenie nazwy plikow do data->risk_matrix, itp...

		// obsluga bledow
		if($stdout != "") {
			$res=Array(
				"meta"=>Array(
					"status" => "success",
					"from" => "generateRiskResults()",
					"details" => Array($stdout)
				),
				"data"=>Array(
					"text"=> ""
				)
			);
		}
		else {
			$res=Array(
				"meta"=>Array(
					"status" => "error",
					"from" => "generateRiskResults()",
					"details" => Array($stderr)
				),
				"data"=>Array(
					"text"=>"/users/".$_SESSION['email']."/".$post['project_id']."/risk/".$post['id']."/picts/"
				)
			);
		}
		echo json_encode($res);	
	}
/*}}}*/

function getAnims($args) {/*{{{*/

		$result = "";

		try {
			$data=Array(
				"id"=>nullToEmpty($args['id']),
				"projectId"=>nullToEmpty($args['project_id'])
			);
			
			//global $db;
			//$db_result=$db->pg_read("select id, project_id, name, risk_object, ui_state, ac_file, ac_hash from risk_scenarios where id=$1", $data);

		} catch(Exception $e) {
			$result="error";
		}

		if($result!="error") {
			
			$path="/home/aamks_users/".$_SESSION['email']."/".$args['project_id']."/risk/". $args['id'] ."/workers/vis";

			$anims = file_get_contents("$path/anims.json");

			$res_data=array(
				"scenarioId"=>nullToEmpty($args['id']),
				"projectId"=>nullToEmpty($args['project_id']),
				"anims"=>$anims
			);

			$res=Array(
				"meta"=>Array(
					"status" => "info",
					"from" => "getAnims()",
					"details" => Array("Anims loaded")
				),
				"data"=>$res_data
			);
		} else {
			$res=Array(
				"meta"=>Array(
					"status" => "error",
					"from" => "getRiskScenario()",
					"details" => Array("Server error! Anims not loaded")
				),
				"data"=>array()
			);
		}
		echo json_encode($res);	
	}
/*}}}*/
function getStatic($args) {/*{{{*/

		$result = "";

		try {
			$data=Array(
				"id"=>nullToEmpty($args['id']),
				"projectId"=>nullToEmpty($args['project_id'])
			);
			
			//global $db;
			//$db_result=$db->pg_read("select id, project_id, name, risk_object, ui_state, ac_file, ac_hash from risk_scenarios where id=$1", $data);

		} catch(Exception $e) {
			$result="error";
		}

		if($result!="error") {
			
			$path="/home/aamks_users/".$_SESSION['email']."/".$args['project_id']."/risk/". $args['id'] ."/workers/vis";

			$static = file_get_contents("$path/static.json");

			$res_data=array(
				"scenarioId"=>nullToEmpty($args['id']),
				"projectId"=>nullToEmpty($args['project_id']),
				"static"=>$static
			);

			$res=Array(
				"meta"=>Array(
					"status" => "info",
					"from" => "getAnims()",
					"details" => Array("Anims loaded")
				),
				"data"=>$res_data
			);
		} else {
			$res=Array(
				"meta"=>Array(
					"status" => "error",
					"from" => "getRiskScenario()",
					"details" => Array("Server error! Anims not loaded")
				),
				"data"=>array()
			);
		}
		echo json_encode($res);	
	}
/*}}}*/
?>
