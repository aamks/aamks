<?php
# Start session
session_name('wizfds');
session_start();

# Include db connection
require_once("models/sql/dbConnect.php");
$db=new dbConnect();

require_once("models/fds/json2fds.php");

# Generowanie wynikow
# require_once("aamks_gui_server/class/fds/genResults.php");
# $mFDS=new GenResults();

require_once("models/risk/json2risk.php");


// Obsługa sesji przy zapytaniach rest/*{{{*/


// 1. Przetrzymujemy ID
// 2. Przetrzymujemy timestamp
// 3. Przetrzymujemy ip
// Przy logowaniu sprawdzamy czy nie ma session id, jezeli jest to sprawdzamy timestamp i aders ip ...
$result = $db->pg_read("SELECT session_id, access_time, access_ip FROM users where id = ". $_SESSION['user_id'] .";");
extract($result[0]);

if($session_id == ""){
	$update=$db->pg_change("UPDATE users SET session_id = '". session_id('wizfds') ."', access_time = current_timestamp, access_ip = '". $_SERVER['REMOTE_ADDR'] ."' where id = ". $_SESSION['user_id'] .";");
} else {
	$check=$db->pg_read("SELECT access_time from users where current_timestamp - access_time < INTERVAL '20 minutes' and id = ". $_SESSION['user_id'] .";");
	if(count($check) > 0){
		$update=$db->pg_change("UPDATE users SET access_time = current_timestamp where id = ". $_SESSION['user_id'] .";");
	}
}

$now = time();
if (isset($_SESSION['discard_after']) && $now > $_SESSION['discard_after']) {
	// this session has worn out its welcome; kill it and start a brand new one
	session_unset();
	session_destroy();
	session_name('wizfds');
	session_start();
}
// either new or old, it should live at most for another hour
$_SESSION['discard_after'] = $now + 3600;
//error_log($_SESSION['discard_after']);
//error_log(session_id('wizfds'));
/*}}}*/

# Manual router:
# https://github.com/nikic/FastRoute

# howto /*{{{*/
# 0. Dodać w aamks_gui_server/view/partials/fs-left-menu.php
# 1. Tworzymy aamks_gui_server/view/partials/fs-test.php
# 2. Dodać w public/js/app.js
# 3. Dodać w public/js/directives/fs-test.directive.js
# 4. Dodać w public/js/directives/directives.js
# 5. Dodać w aamks_gui_server/view/index.php ładowanie dyrektywy *.js
# 6. Dodać tutaj 
#	przekazywanie argumentow
#	function echoFn($args){
#		$post=file_get_contents('php://input');
#		$postData=json_decode($post);
#		$res=Array(
#			"meta"=>Array(
#				"status" => "success",
#				"from" => "updateProject()",
#				"details" => Array("Your user settings have been successfully loaded ")
#			),
#			"data"=>Array(
#				"dupa"=>$postData->dupa,
#				"cycki"=>$postData->cycki,
#				"args"=>$argsData['cycki'],
#
#			)
#		);
#		echo json_encode($res);	
#	}
/*}}}*/
function dd($arr) {/*{{{*/
	# to jest cos jak var_dump() albo print_r(), nie usuwajcie mimoohszkowi
	print_r($arr);
}
/*}}}*/
// utils // {{{

function nullToEmpty($arg) {
	if(is_null($arg)) {
		return "";
	} else {
		return $arg;
	}
}
function rrmdir($dir) { 
	if (is_dir($dir)) { 
		$objects = scandir($dir); 
		foreach ($objects as $object) { 
			if ($object != "." && $object != "..") { 
				if (is_dir($dir."/".$object))
					rrmdir($dir."/".$object);
				else
					unlink($dir."/".$object); 
			} 
		}
		rmdir($dir); 
	} 
}
function my_shell_exec($cmd, &$stdout=null, &$stderr=null) {
	$proc = proc_open($cmd,[
		1 => ['pipe','w'],
		2 => ['pipe','w'],
	],$pipes);
	$stdout = stream_get_contents($pipes[1]);
	fclose($pipes[1]);
	$stderr = stream_get_contents($pipes[2]);
	fclose($pipes[2]);
	return proc_close($proc);
}
// }}} //

// MAIN
# main/*{{{*/
require_once("router/vendor/autoload.php");

	function getIndex() {
		include("views/index.php");
	}
	function welcome() {
		include("views/welcome.php");
	}
	function login() {
		include("views/login.php");
	}

	function logout() {
		session_destroy(); $_SESSION=''; session_start();  
		$res=Array(
				"meta"=>Array(
					"status" => "success",
					"from" => "logout()",
					"details" => Array("User successfully logout")
				),
				"data"=>array()
			);
		echo json_encode($res);	

		//header("Location: https://wizfds.inf.sgsp.edu.pl/login");
	}
	function getPartials($args) {
		//var_dump("aamks_gui_server/view/partials/".$args['name'].".php");
		$exists=include("views/".$args['name'].".php");
		if(!$exists) {
			header("HTTP/1.0 404 Not Found");		
		}
	}
/*}}}*/

//API:
// PROJECTS
	function createProject() {/*{{{*/
	
		$user_id=$_SESSION['user_id'];
		$post=file_get_contents('php://input');

		try {
			//$postData=json_decode($post);
			global $db;

			$result=$db->pg_read("select uuid from categories where user_id=$1", array($user_id));
			if(count($result) < 1){
				$category_id = '0000-0000-0000';
			} else {
				$category_id = $result[0]['uuid'];
			}
			$data=Array(
				"user_id"=>$user_id,
				"name"=>"New project",
				"description"=>"Project description",
				"category_id"=>$category_id
			);
			
			$result=$db->pg_create("insert into projects(user_id,name,description,category_id) values ($1, $2, $3, $4) returning id", $data);
			
			$id=$result[0]['id'];
			$data['id']=$id;

			$path="/home/eggman_users/".$_SESSION['email']."/$id";
			system("mkdir -p $path");

		} catch(Exception $e) {
			$result="error";
		}

		if($result!="error" && !is_null($id) && $id!="") {
			$res=Array(
				"meta"=>Array(
					"status" => "success",
					"from" => "createProject()",
					"details" => Array($data['name']." created", $path)
				),
				"data"=>$data
			);
		} else {
			$res=Array(
				"meta"=>Array(
					"bd"=>$result,
					"status" => "error",
					"from" => "createProject()",
					"details" => Array("Server error! Project was not created")
				),
				"data"=>array()
			);

		}
		echo json_encode($res);	
	}/*}}}*/
	function deleteProject($args) {/*{{{*/

		$post=file_get_contents('php://input');
		$postData=json_decode($post);
		
		try {
			$data=Array(
				"id"=>$args['id']
			);

			global $db;
			$db_result_scenarios=$db->pg_change("delete from scenarios where project_id=$1;", $data);
			$db_result_risk=$db->pg_change("delete from risk_scenarios where project_id=$1;", $data);
			$db_result_projects=$db->pg_change("delete from projects where id=$1;", $data);

			if($db_result_projects==1) {
				$path="/home/eggman_users/".$_SESSION['email']."/".$data['id'];
				rrmdir($path);
			}

		} catch(Exception $e) {
			$result="error";
		}
		if($result!="error" && $db_result_projects==1) {
			$res=Array(
				"meta"=>Array(
					"status" => "success",
					"from" => "deleteProject()",
					"details" => Array("Project was deleted")
				),
				"data"=>$data
			);
		} else {
			$res=Array(
				"meta"=>Array(
					"status" => "error",
					"from" => "deleteProject()",
					"details" => Array("Server error! Project was not deleted")
				),
				"data"=>$postData
			);

		}
		echo json_encode($res);	
	}/*}}}*/
	function updateProject($args) {/*{{{*/
		
		global $db;
		$post=file_get_contents('php://input');
		
		try {
			$postData=json_decode($post);
			$data=Array(
				"id"=>nullToEmpty($postData->id),
				"name"=>nullToEmpty($postData->name),
				"description"=>nullToEmpty($postData->description),
				"category_id"=>nullToEmpty($postData->category)
			);
			

			$db_result=$db->pg_change("update projects set name=$2, description=$3, category_id=$4 where id=$1;", $data);
			
			
		} catch(Exception $e) {
			$result="error";
		}
		if($result!="error" && $db_result==1) {
			$res=Array(
				"meta"=>Array(
					"status" => "success",
					"from" => "updateProject()",
					"details" => Array("Project ".$postData->name." updated")
				),
				"data"=>$postData,
			);
		} else {
			$res=Array(
				"meta"=>Array(
					"status" => "error",
					"from" => "updateProject()",
					"details" => Array("Project ".$postData->name." was not updated")
				),
				"data"=>$postData
			);

		}
		echo json_encode($res);	




	}/*}}}*/
	function getProjects() {/*{{{*/
		
		$user_id=$_SESSION['user_id'];

		// SELECT z PROJECTS, ale też dla każdego projektu select z tabeli scenariusze: Nazwa, czy ma plik DWG, czy ma plik FDS
		try {

			global $db;
			$data = array();

			$result=$db->pg_read("select id, name, description, category_id from projects where user_id=$1 order by name", array($_SESSION['user_id']));
			
			foreach($result as $project) {

				// FDS scenarios
				if(isset($scenarios)) unset($scenarios);
				$scenarios = array();

				$resultScenario=$db->pg_read("select id, project_id, name, fds_file, ac_file, ac_hash from scenarios where project_id=$1 order by name", array($project['id']));
				if(!empty($resultScenario)) {
					foreach($resultScenario as $scenario){
						if($scenario['fds_file']!="") {
							$hasFDS=true;
						} else {
							$hasFDS=false;
						}
						if($scenario['ac_file']!="") {
							$hasDWG=true;
						} else {

							$hasDWG=false;
						}		

						$scenarios[] = Array(
							"id"=>$scenario['id'],
							//"project_id"=>$scenario['project_id'],
							"name"=>$scenario['name'],
							
							//"fds_object"=>$scenario['fds_object'],
							//"ui_state"=>$scenario['ui_state']
							"has_fds_file"=>$hasFDS,
							"has_ac_file"=>$hasDWG
						);
					}
				}

				// Risk scenarios
				if(isset($risk_scenarios)) unset($risk_scenarios);
				$risk_scenarios = array();

				$resultRiskScenario=$db->pg_read("select id, project_id, name, ac_file, ac_hash from risk_scenarios where project_id=$1", array($project['id']));
				if(!empty($resultRiskScenario)) {
					foreach($resultRiskScenario as $scenario){
						if($scenario['ac_file']!="") {
							$hasDWG=true;
						} else {
							$hasDWG=false;
						}

						$risk_scenarios[] = Array(
							"id"=>$scenario['id'],
							//"project_id"=>$scenario['project_id'],
							"name"=>$scenario['name'],
							//"risk_object"=>$scenario['risk_object'],
							//"ui_state"=>$scenario['ui_state']
							//"ui_state"=>$scenario['ui_state']
							"has_ac_file"=>$hasDWG
							//"hasDWGFile"=>$scenario['hasDWGFile']
						);
					}
				}

				$data[] = Array(
					"id"=>$project['id'],
					"name"=>$project['name'],
					"description"=>$project['description'],
					"category"=>$project['category_id'], 
					"scenarios"=>$scenarios,
					"risk_scenarios"=>$risk_scenarios
				);
			}
		} catch(Exception $e) {
			$result = "error";
		}
		
		if($result!="error") {
			$res=Array(
				"meta"=>Array(
					"status" => "info",
					"from" => "getProjects()",
					"details" => Array("Projects loaded")
				),
				"data"=>$data
			);
		} else {
			$res=Array(
				"meta"=>Array(
					"status" => "error",
					"from" => "getProjects()",
					"details" => Array("Server error! Projects were not loaded properly")
				),
				"data"=>array()
			);
		}
		echo json_encode($res);	

	}/*}}}*/

// FDS SCENARIOS
	function createScenario($args) {/*{{{*/ 
		
		try {
			$post=file_get_contents('php://input');
			$postData=json_decode($post);
			$data=Array(
				"project_id"=>nullToEmpty($args['project_id']),
				"name"=>"New FDS scenario",
				"fds_file"=>"",
				"fds_object"=>"",
				"ui_state"=>json_encode(nullToEmpty($postData->ui_state)),
				"ac_file"=>"",
				"ac_hash"=>""
				
			);
			global $db;
			$result=$db->pg_create("insert into scenarios(project_id, name, fds_file, fds_object, ui_state, ac_file, ac_hash) values ($1, $2, $3, $4, $5, $6, $7) returning id", $data);

			$id=$result[0]['id'];
			$data['id']=$id;

			
		} catch(Exception $e) {
			$result="error";
		}

		if($result!="error" && !is_null($id) && $id!="") {
			// Utworz katalog ze scenariuszem
			$path="/home/eggman_users/".$_SESSION['email']."/".$args['project_id']."/fds/$id";
			system("mkdir -p $path");

			
			$decoded_ui=json_decode($data['ui_state']);
			$data['ui_state']=$decoded_ui;

			$res=Array(
				"meta"=>Array(
					"status" => "success",
					"from" => "createScenario()",
					"details" => Array($data['name']." created")
				),
				"data"=>$data
			);
		} else {
			$res=Array(
				"meta"=>Array(
					"status" => "error",
					"from" => "createScenario()",
					"details" => Array("Server error! Project was not created properly")
				),
				"data"=>array()
			);
		}
		echo json_encode($res);	
	}
/*}}}*/
	function updateScenario($args) {/*{{{*/

		global $db;
		$post=file_get_contents('php://input');

		try {
			$postData=json_decode($post);
			if($postData->type=="head") {
				$data=Array(
					"id"=>nullToEmpty($postData->data->id),
					"name"=>nullToEmpty($postData->data->name)
					//"has_fds_file"=>nullToEmpty($postData->data->has_fds_file),
					//"has_ac_file"=>nullToEmpty($postData->data->has_ac_file)
				);
				$db_result=$db->pg_change("update scenarios set name=$2 where id=$1;", $data);

			} else {
				$data=Array(
					"id"=>nullToEmpty($args['id']),
					"name"=>nullToEmpty($postData->data->name),
					"fds_file"=>nullToEmpty($postData->data->fds_file),
					"fds_object"=>json_encode(nullToEmpty($postData->data->fds_object)),
					"ui_state"=>json_encode(nullToEmpty($postData->data->ui_state)),
					//"fds_object"=>nullToEmpty($postData->data->fds_object),
					//"ui_state"=>nullToEmpty($postData->data->ui_state),
					"ac_file"=>nullToEmpty($postData->data->ac_file),
					"ac_hash"=>nullToEmpty($postData->data->ac_hash)
				);
				$db_result=$db->pg_change("update scenarios set name=$2, fds_file=$3, fds_object=$4, ui_state=$5, ac_file=$6, ac_hash=$7 where id=$1;", $data);
			}
			
		} catch(Exception $e) {
			$result="error";
		}
		
		if($result!="error" && $db_result==1) {
			$data['ui_state']=$postData->data->ui_state;
			$data['fds_object']=$postData->data->fds_object;
			
			$res=Array(
				"meta"=>Array(
					"status" => "success",
					"from" => "updateScenario()",
					"details" => Array("Scenario ".$postData->data->name." updated sucessfully")
				),
				"data"=>$data
			);
		} else {
			$res=Array(
				"meta"=>Array(
					"status" => "error",
					"from" => "updateScenario()",
					"details" => Array("Server error! Scenario not updated")
				),
				"data"=>array()
			);
		}
		echo json_encode($res);	
	}
/*}}}*/
	function deleteScenario($args) {/*{{{*/

		try {
			$data=Array(
				"id"=>$args['id']
			);
			global $db;
			$db_result_projects=$db->pg_read("select project_id from scenarios where id=$1", $data);
			$db_result_scenarios=$db->pg_change("delete from scenarios where id=$1;", $data);
			$result="success";

		} catch(Exception $e) {
			$result="error";
		}
		if($result!="error" && $db_result_scenarios==1) {
			// Usun katalog scenariusza
			$path="/home/eggman_users/".$_SESSION['email']."/".$db_result_projects[0]['project_id']."/fds/".$args['id'];
			rrmdir($path);

			$res=Array(
				"meta"=>Array(
					"status" => "success",
					"from" => "deleteScenario()",
					"details" => Array("Scenario deleted")
				),
				"data"=>$data
			);
		} else {
			$res=Array(
				"meta"=>Array(
					"status" => "error",
					"from" => "deleteScenario()",
					"details" => Array("Server error! Scenario not deleted")
				),
				"data"=>array()
			);
		}
		echo json_encode($res);	
	}
/*}}}*/
	function getScenario($args) {/*{{{*/

		$result = "";

		try {
			$post=file_get_contents('php://input');
			$data=Array(
				"id"=>nullToEmpty($args['id'])
			);
			
			global $db;
			$db_result=$db->pg_read("select id, project_id, name,fds_file, fds_object, ui_state, ac_file, ac_hash from scenarios where id=$1", $data);

		} catch(Exception $e) {
			$result="error";
		}

		if($result!="error" && !is_null($db_result)) {
			
			$decoded_ui=json_decode($db_result[0]['ui_state']);
			$decoded_object=json_decode($db_result[0]['fds_object']);

			$res_data=array(
				"id"=>$db_result[0]['id'],
				"project_id"=>$db_result[0]['project_id'],
				"name"=>$db_result[0]['name'],
				"fds_file"=>$db_result[0]['fds_file'],
				"fds_object"=>$decoded_object,
				"ui_state"=>$decoded_ui,
				"ac_file"=>$db_result[0]['ac_file'],
				"ac_hash"=>$db_result[0]['ac_hash']
			);

			$res=Array(
				"meta"=>Array(
					"status" => "info",
					"from" => "getScenario()",
					"details" => Array("Scenario ".$db_result[0]['name']." loaded")
				),
				"data"=>$res_data
			);
		} else {
			$res=Array(
				"meta"=>Array(
					"status" => "error",
					"from" => "getScenario()",
					"details" => Array("Server error! Scenario not loaded")
				),
				"data"=>array()
			);

		}
		echo json_encode($res);	
	}
/*}}}*/
function runFdsSimulaion($args){/*{{{*/
		global $db;

		// Sprawdz czy ma dostep do obliczen
		//$allowedId = array(1, 3, 4, 5, 6, 10);
		$allowedId = array(1);

		if(!in_array((int)$_SESSION['user_id'], $allowedId)) {
			$res=Array(
				"meta"=>Array(
					"status" => "error",
					"from" => "runFdsSimulaion()",
					"details" => Array("You have no permission to run sumulations")
				),
				"data"=>""
			);
		}
		else {
			$post=json_decode(file_get_contents('php://input'),1);
			$text=json2fds($post);

			$res=Array(
				"meta"=>Array(
					"status" => "success",
					"from" => "runFdsSimulaion()",
					"details" => Array("Simulation run")
				),
				"data"=>""
			);

			// zapisz do katalogu uzytkownika
			$path="/home/eggman_users/".$_SESSION['email']."/".$post['project_id']."/fds/".$post['id'];
			system("mkdir -p $path");
			array_map('unlink', glob("$path/*.fds"));

			$text.="\nFDSVER=6";
			$text.="\nPATH='".$_SESSION['email']."/".$post['project_id']."/fds/".$post['id']."'";

			file_put_contents("$path/".$post['fds_object']['general']['head']['chid'].".fds", $text);

			// tutaj run sim ... powinna symulacja uruchamiac się w folderze projektu nie w /mnt/duch/obliczenia ...
			// trzeba zmienic na folder users w /mnt/duch/obliczenia
			system("cp $path/".$post['fds_object']['general']['head']['chid'].".fds /mnt/fds/tmp/");
			system("sudo -u mimooh /usr/bin/python /mnt/fds/bin/admin.py -n -v 6 &");
		}

		echo json_encode($res);	
}/*}}}*/

// FDS POSTPROCESSING

// DEAMONS
	function checkRiskScenario($args) {/*{{{*/ 

		//try {
		//	$post=file_get_contents('php://input');
		//	$postData=json_decode($post);
		//	$data=Array(
		//		"project_id"=>nullToEmpty($args['project_id']),
		//		"name"=>"New risk scenario",
		//		"risk_object"=>"",
		//		"ui_state"=>json_encode(nullToEmpty($postData->ui_state)),
		//		"ac_file"=>"",
		//		"ac_hash"=>""
		//		
		//	);
		//	global $db;
		//	$result=$db->pg_create("insert into risk_scenarios(project_id, name, risk_object, ui_state, ac_file, ac_hash) values ($1, $2, $3, $4, $5, $6) returning id", $data);
		//	
		//	$id=$result[0]['id'];
		//	$data['id']=$id;

		//	$path="/home/simo_users/".$_SESSION['email']."/".$args['project_id']."/risk/$id";
		//	system("mkdir -p $path");

		//} catch(Exception $e) {
		//	$result="error";
		//}

		//if($result!="error" && !is_null($id) && $id!="") {
		//	
		//	$decoded_ui=json_decode($data['ui_state']);
		//	$data['ui_state']=$decoded_ui;

		//	$res=Array(
		//		"meta"=>Array(
		//			"status" => "success",
		//			"from" => "createRiskScenario()",
		//			"details" => Array($data['name']." created")
		//		),
		//		"data"=>$data
		//	);
		//} else {
		//	$res=Array(
		//		"meta"=>Array(
		//			"status" => "error",
		//			"from" => "createRiskScenario()",
		//			"details" => Array("An error has occur - project was not created properly")
		//		),
		//		"data"=>array()
		//	);
		//}
		//echo json_encode($res);	
	}
/*}}}*/

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

			$path="/home/eggman_users/".$_SESSION['email']."/".$args['project_id']."/risk/$id";
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
					"details" => Array("An error has occur - project was not created properly")
				),
				"data"=>array()
			);
		}
		echo json_encode($res);	
	}
/*}}}*/
	function updateRiskScenario($args) {/*{{{*/

		global $db;
		$post=file_get_contents('php://input');

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
					"risk_object"=>json_encode(nullToEmpty($postData->data->risk_object)),
					"ui_state"=>json_encode(nullToEmpty($postData->data->ui_state)),
					"ac_file"=>nullToEmpty($postData->data->ac_file),
					"ac_hash"=>nullToEmpty($postData->data->ac_hash)
				);
				$db_result=$db->pg_change("update risk_scenarios set name=$2, risk_object=$3, ui_state=$4, ac_file=$5, ac_hash=$6 where id=$1;", $data);
			}
			
		} catch(Exception $e) {
			$result="error";
		}
		
		if($result!="error" && $db_result==1) {
			$data['ui_state']=$postData->data->ui_state;
			$data['risk_object']=$postData->data->risk_object;
			
			$res=Array(
				"meta"=>Array(
					"status" => "success",
					"from" => "updateRiskScenario()",
					"details" => Array("Risk scenario updated")
				),
				"data"=>$data
			);
		} else {
			$res=Array(
				"meta"=>Array(
					"status" => "error",
					"from" => "updateRiskScenario()",
					"details" => array()
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
			$path="/home/eggman_users/".$_SESSION['email']."/".$db_result_projects[0]['project_id']."/risk/".$args['id'];
			rrmdir($path);

			$res=Array(
				"meta"=>Array(
					"status" => "success",
					"from" => "deleteRiskScenario()",
					"details" => array()
				),
				"data"=>$data
			);
		} else {
			$res=Array(
				"meta"=>Array(
					"status" => "error",
					"from" => "deleteRiskScenario()",
					"details" => array()
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
				"project_id"=>$db_result[0]['project_id'],
				"name"=>$db_result[0]['name'],
				"risk_object"=>$decoded_object,
				"ui_state"=>$decoded_ui,
				"ac_file"=>$db_result[0]['ac_file'],
				"ac_hash"=>$db_result[0]['ac_hash']
			);

			$res=Array(
				"meta"=>Array(
					"status" => "info",
					"from" => "getRiskScenario()",
					"details" => Array("Risk scenario loaded")
				),
				"data"=>$res_data
			);
		} else {
			$res=Array(
				"meta"=>Array(
					"status" => "error",
					"from" => "getRiskScenario()",
					"details" => Array("An error has occured")
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
		$conf_simo=json2risk($post);

		$path="/home/eggman_users/".$_SESSION['email']."/".$post['project_id']."/risk/".$post['id'];
		system("mkdir -p $path");
		array_map('unlink', glob("$path/*"));

		file_put_contents("$path/cad.json", json_encode($post['risk_object']['geometry']));
		copy("../aamks_gui_server/class/risk/distributions.json", "$path/distributions.json");
		file_put_contents("$path/conf_eggman.json", json_encode($conf_simo));
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
		//else if($stderr!= "") { // python fatal
		//	$res=Array(
		//		"meta"=>Array(
		//			"status" => "success",
		//			"from" => "runRiskScenario()",
		//			"details" => Array($stdout)
		//		),
		//		"data"=>Array(
		//			"text"=>""
		//		)
		//	);
		//}
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

		$path="/home/eggman_users/".$_SESSION['email']."/".$post['project_id']."/risk/".$post['id'];
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

// LIBRARY
function getLibrary($args) {/*{{{*/

		$user_id=$_SESSION['user_id'];

		try {
			$post=file_get_contents('php://input');
			$data=Array(
				"user_id"=>nullToEmpty($user_id)
			);
			
			global $db;
			$db_result=$db->pg_read("select id, json from library where user_id=$1", $data);
			$result="success";

		} catch(Exception $e) {
			$result="error";
		}

		if($result!="error" && !is_null($db_result)) {
			$decoded_library=json_decode($db_result[0]['json']);
			$res_data=$decoded_library;

			$res=Array(
				"meta"=>Array(
					"status" => "info",
					"from" => "getScenario()",
					"details" => Array("Library loaded")
				),
				"data"=>$res_data
			);
		} else {
			$res=Array(
				"meta"=>Array(
					"status" => "error",
					"from" => "getScenario()",
					"details" => Array("Server error! Library not loaded")
				),
				"data"=>array()
			);

		}
		echo json_encode($res);	
}/*}}}*/
function updateLibrary($args) {/*{{{*/
		global $db;
		$post=file_get_contents('php://input');
		$user_id=$_SESSION['user_id'];

		try {
			$data=Array(nullToEmpty($user_id), nullToEmpty($post));

			$db_result=$db->pg_read("select id from library where user_id=$1", Array($data[0]));
			if($db_result == ''){
				$db->pg_create("insert into library (user_id) values ($1)", Array($data[0]));
			}

			$db_result=$db->pg_change("update library set json=$2 where user_id=$1;", $data);
			$result="success";
			
		} catch(Exception $e) {
			$result="error";
		}
		
		if($result!="error" && $db_result==1) {
			$res=Array(
				"meta"=>Array(
					"status" => "success",
					"from" => "updateLibrary()",
					"details" => array("Library updated")
				),
				"data"=>$data[1]
			);
		} else {
			$res=Array(
				"meta"=>Array(
					"status" => "error",
					"from" => "updateLibrary()",
					"details" => array("Server error! Library nor updated")
				),
				"data"=>array()
			);
		}
		echo json_encode($res);	

}/*}}}*/

// SETTINGS
	function getSettings($args) {/*{{{*/
		$user_id=$_SESSION['user_id'];

		global $db;
		$res=$db->pg_read("select username, editor, current_project_id, current_scenario_id, websocket_host, websocket_port from users where id=$1", array($user_id));
		$cat=$db->pg_read("select label, uuid, active, visible from categories where user_id=$1", array($user_id));
		
		$res=Array(
			"meta"=>Array(
				"status" => "info",
				"from" => "getSettings()",
				"details" => Array("Settings loaded")
			),
			"data"=>Array(
				"id"=>$user_id,
				"userName"=>$res[0]['username'],
				"editor"=>$res[0]["editor"],
				"current_project_id"=>$res[0]['current_project_id'],
				"current_scenario_id"=>$res[0]['current_scenario_id'],
				"websocket_host"=>$res[0]['websocket_host'],
				"websocket_port"=>$res[0]['websocket_port'],
				"categories"=>$cat
			)
		);
		echo json_encode($res);	

	}
/*}}}*/
	function updateSettings($args) {/*{{{*/
		
		$user_id=$_SESSION['user_id'];
		$post=file_get_contents('php://input');
		try {
			$postData=json_decode($post);
			$data=Array(
				"id"=>$user_id,
				"userName"=>nullToEmpty($postData->userName),
				"editor"=>nullToEmpty($postData->editor),
				"current_project_id"=>nullToEmpty($postData->current_project_id),
				"current_scenario_id"=>nullToEmpty($postData->current_scenario_id),
				"websocket_host"=>nullToEmpty($postData->websocket_host),
				"websocket_port"=>nullToEmpty($postData->websocket_port)
			);
			
			global $db;
			$result=$db->pg_change("update users set username=$2, editor=$3, current_project_id=$4, current_scenario_id=$5, websocket_host=$6, websocket_port=$7 where id=$1;", $data);

		} catch(Exception $e) {
			$result="error";
		}

		if($result!="error" && $result>0) {
			$res=Array(
				"meta"=>Array(
					"status" => "success",
					"from" => "updateUser()",
					"details" => Array("User settings have been successfully updated")
				),
				"data"=>$data
			);
		} else {
			$res=Array(
				"meta"=>Array(
					"status" => "error",
					"from" => "updateUser()",
					"details" => Array("An error has occur - settings were not saved properly")
				),
				"data"=>array()
			);

		}
		echo json_encode($res);	


	}
	/*}}}*/

// CATEGORIES
	function createCategory() {/*{{{*/
	
		$user_id=$_SESSION['user_id'];
		$post=file_get_contents('php://input');

		try {
			$postData=json_decode($post);

			$data=Array(
				"user_id"=>$user_id,
				"label"=>$postData->label,
				"uuid"=>$postData->uuid,
				"active"=>json_encode(nullToEmpty($postData->active)),
				"visible"=>json_encode(nullToEmpty($postData->visible))
			);
			
			global $db;
			$result=$db->pg_create("insert into categories (user_id, label, uuid, active, visible) values ($1, $2, $3, $4, $5)", $data);

		} catch(Exception $e) {
			$result="error";
		}

		if($result!="error") {
			$res=Array(
				"meta"=>Array(
					"status" => "success",
					"from" => "createCategory()",
					"details" => Array("Category created")
				),
				"data"=>$data
			);
		} else {
			$res=Array(
				"meta"=>Array(
					"bd"=>$result,
					"status" => "error",
					"from" => "createCategory()",
					"details" => Array("Category was not created")
				),
				"data"=>array()
			);

		}
		echo json_encode($res);	
	}/*}}}*/
	function deleteCategory($args) {/*{{{*/
	
		global $db;
		
		try {
			$data=Array(
				"uuid"=>$args['uuid']
			);

			$result=$db->pg_change("delete from categories where uuid=$1;", $data);

		} catch(Exception $e) {
			$result="error";
		}
		if($result!="error") {
			$res=Array(
				"meta"=>Array(
					"status" => "success",
					"from" => "deleteCategory()",
					"details" => array("Category deleted")
				),
				"data"=>$data
			);
		} else {
			$res=Array(
				"meta"=>Array(
					"status" => "error",
					"from" => "deleteCategory()",
					"details" => array("Category was not deleted")
				),
				"data"=>$data
			);
		}
		echo json_encode($res);	


	}/*}}}*/
	function updateCategory($args) {/*{{{*/
		global $db;
		$post=file_get_contents('php://input');
		
		try {
			$postData=json_decode($post);
			$data=Array(
				"label"=>nullToEmpty($postData->label),
				"uuid"=>nullToEmpty($postData->uuid),
				"active"=>json_encode(nullToEmpty($postData->active)),
				"visible"=>json_encode(nullToEmpty($postData->visible))
			);

			$db_result=$db->pg_change("update categories set label=$1, active=$3, visible=$4 where uuid=$2;", $data);
			
		} catch(Exception $e) {
			$result="error";
		}
		if($result!="error" && $db_result==1) {
			$res=Array(
				"meta"=>Array(
					"status" => "success",
					"from" => "updateCategory()",
					"details" => array("Category updated")
				),
				"data"=>$postData
			);
		} else {
			$res=Array(
				"meta"=>Array(
					"status" => "error",
					"from" => "updateCategory()",
					"details" => array("Category was not updated")
				),
				"data"=>$postData
			);
		}
		echo json_encode($res);	
	}/*}}}*/

// JSON <--> FDS
function fdsObjectToText($args) {/*{{{*/
		// przyjmuje caly scenariusz, przekształca reprezentację obiektową ze scenario.fds_object na tekst i wstawia pod scenario.fds_file, odsyła cały scenariusz. Ewentualnie koryguje błędy w fds_object
		global $db;
		$post=json_decode(file_get_contents('php://input'),1);
		$text=json2fds($post);

		$res=Array(
			"meta"=>Array(
				"status" => "success",
				"from" => "fdsObjectToText()",
				"details" => array("FDS file updated")
			),
			"data"=>$text
		);

		$text.="\nFDSVER=6";
		$text.="\nPATH='".$_SESSION['email']."/".$post['project_id']."/fds/".$post['id']."'";

		// zapisz do katalogu uzytkownika
		$path="/home/eggman_users/".$_SESSION['email']."/".$post['project_id']."/fds/".$post['id'];
		system("mkdir -p $path");
		array_map('unlink', glob("$path/*.fds"));
		file_put_contents("/home/eggman_users/".$_SESSION['email']."/".$post['project_id']."/fds/".$post['id']."/".$post['fds_object']['general']['head']['chid'].".fds", $text);

		echo json_encode($res);	
}
/*}}}*/
function fdsTextToObject($args) {/*{{{*/

		// przyjmuje caly scenariusz, przekształca reprezentację tekstowa ze scenario.fds_file na obiekt i wstawia pod scenario.fds_object, odsyła cały scenariusz. Ewentualnie koryguje błędy w fds_file
		global $db;
		$post=json_decode(file_get_contents('php://input'),1);

		$text=$post;

		$res=Array(
			"meta"=>Array(
				"status" => "success",
				"from" => "fdsTextToObject()",
				"details" => array()
			),
			"data"=>$text
		);
		echo json_encode($res);	
}
/*}}}*/

// GLOBALS
	/*{{{ globals  */
function getGlobals($args) {
	include("models/global_values/global-values.php");
}

/*}}}*/

// FILES
/*{{{ fds-file  */
function downloadFdsFile($args) {


}

function uploadFdsFile($args) {

}

/*}}}*/
/*{{{ cfast-file  */
function cfastFile($args) {


}

/*}}}*/

// ROUTER
# router /*{{{*/
# howto/*{{{*/
#  > Poniżej propozycja API, z opisem co robi dana funkcja i kiedy jest
#  > wywoływana. Jestem otwarty na wszelkie zmiany i propozycje, ale TERAZ,
#  > bo później będzie naprawdę bardzo dużo przerabiania, szczególnie np.
#  > edycja bibliotek będzie podpięta w bardzo wielu miejscach. Jak dostanę
#  > od Was akceptację, wpiszę te wszystkie metody do pliku index.php i
#  > dołożę bardziej szczegółowe opisy, oraz  zaimplementuję po stronie
#  > przeglądarki, żeby można było zobaczyć, jaki przychodzi POST. Ale na
#  > razie uzgodnijmy finalnie same metody, ich nazwy i momenty ich
#  > wyzwalania, bo to się ciężko przerabia.
#  > 
#  > API:
#  > 
#  > GET /api/projects - pobiera wszystkie projekty użytkownika, wraz z
#  > listą scenariuszy. Kazdy scenariusz w liście zawiera tylko ID, nazwę,
#  > nazwę pliku autocad. Wywoływany tylko przy starcie aplikacji

#  > POST /api/projects - tworzy nowy, pusty projekt bez scenariuszy.
#  > Wywoływany po naciśnięciu "Add (project)" w formularzu projektów

#  > PUT /api/project/id - uaktualnia projekt (nazwę, opis, kategorię) LUB
#  > nazwę scenariusza projektu, jeżeli edycja tej nazwy odbywała się w
#  > liście scenariuszy (bez ściągniętego całego scenariusza). Wywolywany
#  > przy każdej zmianie nazwy, opisu lub kategorii projektu w formularzu
#  > projektów LUB zmianie nazwy scenariusza danego projektu

#  > DELETE /api/project/id - usuwa projekt i jego wszystkie scenariusze.
#  > Wywoływany przy usuwaniu projektu w formularzu projektów
#  > 
#  > 
#  > GET /api/scenario/id - pobiera cały scenariusz, łącznie z obiektem
#  > FDS, reprezentacją tekstową, stanem UI. Wywoływany przy kliknięciu
#  > nazwy scenariusza w formularzu projektów i przejściu do jego edycji

#  > POST /api/scenarios/project_id - tworzy nowy, pusty scenariusz.
#  > Wywoływany po kliknięciu "Add (scenario)" w formularzu projektów

#  > PUT /api/scenario/id - uaktualnia scenariusz. Wywoływany przy każdym
#  > zapisie scenariusza na żądanie oraz przy przejściu z jednego
#  > scenariusza do innego w formularzu projektów

#  > DELETE /api/scenario/id - usuwa scenariusz. Wywoływany przy usuwaniu
#  > scenariusza w formularzu projektów
#  > 
#  > GET /api/fds-file/scenario_id - pobiera plik FDS (reprezentację
#  > tekstową scenariusza). Wywoływany po kliknięciu w przycisk "pobierz
#  > plik FDS" (strzałka w dół) przy nazwie scenariusza w formularzu
#  > projektów. Wynika to z tego, że przycisk jest dostępny dla każdego
#  > scenariusza, a wformularzu projektów scenariusze nie są załadowane w
#  > calości (tylko nazwa i ID)

#  > POST /api/fds-file/scenario_id - wysyła plik FDS, jeżeli użytkownik do
#  > istniejącego scenariusza dodaje własny plik FDS. Wywoływany przy
#  > kliknięciu "upload Fds file" obok scenariusza w formularzu projektów.
#  > 

#  > Funkcje:
#  >     GET /api/fds-json
#  >     GET /api/wiz-json
#  >     GET /api/enums-json
#  > 
#  > zostają zastąpione przez:
#  > GET /api/globals - pobiera jednocześnie wartości domyślne dla amperów,
#  > własnych pól wizfds (innych niż atrybuty amperów), wszystkie listy
#  > (ENUMy). Wywoływany tylko przy starcie aplikacji
#  > 
#  > GET /api/settings/user_id - pobiera ustawienia użytkownika. Wywoływany
#  > przy starcie aplikacji
#  > PUT /api/settings/user_id - zapisuje ustawienia użytkownika.
#  > Wywoływany przy każdej zmianie ustawień użytkownika
#  > 
#  > POST /api/text-to-object - wysyła cały scenariusz FDS, obiekt wraz z
#  > reprezentacją tekstową, zwraca scenariusz FDS gdzie z reprezentacji
#  > tekstowej zaktualizowany jest obiekt FDS, może przy okazji zapisywać
#  > stan UI lub cały scenariusz - wg uznania. Wywoływany przy przejściu z
#  > edytora tekstowego do wizualnego. Jeżeli zwróci błąd, przejście nie
#  > będzie możliwe

#  > POST /api/object-to-text - wysyła cały scenariusz FDS, obiekt wraz
#  > reprezentacją tekstową, zwraca scenariusz FDS gdzie z obiektu FDS
#  > aktualizowana jest reprezentacja tekstowa, przy okazji może zapisywać
#  > się scenariusz. Wywoływany przy przejściu z edytora wizualnego do
#  > tekstowgo. Jeżeli zwróci błąd, przejście nie będzie możliwe
#  > 
#  > 
#  > GET /api/library - pobiera bibliotekę. Wywoływany przy starcie aplikacji
#  > PUT /api/library - aktualizuje bibliotekę. Wywoływany przy każdej
#  > zmianie w elemencie bibliotecznym, chyba że będzie zacinać, to np przy
#  > tworzeniu, usuwaniu elementów oraz przy wyjściu z formularza edycji
#  > elementu
/*}}}*/
function main() {

if(isset($_SESSION['user_id'])){
		$dispatcher = FastRoute\simpleDispatcher(function(FastRoute\RouteCollector $r) {
			$r->addRoute('GET'    , '/'                                , 'getIndex');
			$r->addRoute('POST'   , '/login'                           , 'login');
			$r->addRoute('GET'    , '/login'                           , 'login');
			$r->addRoute('GET'    , '/logout'                          , 'logout');
			$r->addRoute('GET'    , '/partials/{name:.+}'              , 'getPartials');
			//API
			$r->addRoute('GET'    , '/api/projects'                    , 'getProjects');
			$r->addRoute('POST'   , '/api/projects'                    , 'createProject');
			$r->addRoute('DELETE' , '/api/project/{id}'                , 'deleteProject');
			$r->addRoute('PUT'    , '/api/project/{id}'                , 'updateProject');

			$r->addRoute('PUT'    , '/api/scenario/{id}'               , 'updateScenario');
			$r->addRoute('POST'   , '/api/scenarios/{project_id}'      , 'createScenario');
			$r->addRoute('DELETE' , '/api/scenario/{id}'               , 'deleteScenario');
			$r->addRoute('GET'    , '/api/scenario/{id}'               , 'getScenario');

			$r->addRoute('POST'   , '/api/objtotext'                   , 'fdsObjectToText');
			$r->addRoute('POST'   , '/api/texttoobj'                   , 'fdsTextToObject');

			$r->addRoute('POST'   , '/api/runfdssimulation'            , 'runFdsSimulaion');

			$r->addRoute('PUT'    , '/api/risk-scenario/{id}'          , 'updateRiskScenario');
			$r->addRoute('POST'   , '/api/risk-scenarios/{project_id}' , 'createRiskScenario');
			$r->addRoute('DELETE' , '/api/risk-scenario/{id}'          , 'deleteRiskScenario');
			$r->addRoute('GET'    , '/api/risk-scenario/{id}'          , 'getRiskScenario');
			$r->addRoute('POST'   , '/api/risk-scenario/{id}'          , 'runRiskScenario');

			$r->addRoute('POST'   , '/api/risk-scenario/generate-results/{id}'          , 'generateRiskResults');

			$r->addRoute('GET'    , '/api/settings/{id}'               , 'getSettings');
			$r->addRoute('PUT'    , '/api/settings/{id}'               , 'updateSettings');

			$r->addRoute('POST'   , '/api/category'                    , 'createCategory');
			$r->addRoute('DELETE' , '/api/category/{uuid}'             , 'deleteCategory');
			$r->addRoute('PUT'    , '/api/category/{uuid}'             , 'updateCategory');

			$r->addRoute('GET'    , '/api/library'                     , 'getLibrary');
			$r->addRoute('PUT'    , '/api/library'                     , 'updateLibrary');

			$r->addRoute('GET'    , '/api/globals'                     , 'getGlobals');

			$r->addRoute('GET'    , '/api/fds-file/{scenario_id}'      , 'downloadFdsFile');
			$r->addRoute('PUT'    , '/api/fds-file/{scenario_id}'      , 'uploadFdsFile');
		});

	} else {
		$dispatcher = FastRoute\simpleDispatcher(function(FastRoute\RouteCollector $r) {
			$r->addRoute(['GET' , 'POST'] , '/'        , 'login');
			//$r->addRoute(['GET' , 'POST'] , '/'        , 'welcome');
			$r->addRoute(['GET' , 'POST'] , '/{id:.+}' , 'login');
		});
 	}

	// Fetch method and URI from somewhere
	$httpMethod = $_SERVER['REQUEST_METHOD'];
	$uri = rawurldecode(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH));

	$routeInfo = $dispatcher->dispatch($httpMethod, $uri);

	switch ($routeInfo[0]) {
	    case FastRoute\Dispatcher::NOT_FOUND:
			header("HTTP/1.0 404 Not Found");		
			echo "404 error handling";
			break;
	    case FastRoute\Dispatcher::METHOD_NOT_ALLOWED:
			$allowedMethods = $routeInfo[1];
			header("HTTP/1.0 405 Method Not Allowed");		
			break;
	    case FastRoute\Dispatcher::FOUND:
			$handler = $routeInfo[1];
			$vars = $routeInfo[2]; 
			call_user_func($handler, $vars);
			break;
	}
}
/*}}}*/

main();
?>
