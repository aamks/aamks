<?php
// PROJECTS
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
							"hasFdsFile"=>$hasFDS,
							"hasAcFile"=>$hasDWG
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
							"hasAcFile"=>$hasDWG
							//"hasDWGFile"=>$scenario['hasDWGFile']
						);
					}
				}

				$data[] = Array(
					"id"=>$project['id'],
					"name"=>$project['name'],
					"description"=>$project['description'],
					"category"=>$project['category_id'], 
					"fdsScenarios"=>$scenarios,
					"riskScenarios"=>$risk_scenarios
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

			$path="/home/aamks_users/".$_SESSION['email']."/$id";
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

		//$post=file_get_contents('php://input');
		//$postData=json_decode($post);
		//$_SESSION['email'] = "mateusz.fliszkiewicz@fkce.pl";
		try {
			$data=Array(
				"id"=>$args['id']
			);

			global $db;
			$db_result_scenarios=$db->pg_change("delete from scenarios where project_id=$1;", $data);
			$db_result_risk=$db->pg_change("delete from risk_scenarios where project_id=$1;", $data);
			$db_result_projects=$db->pg_change("delete from projects where id=$1;", $data);

			if($db_result_projects==1) {
				$path="/home/aamks_users/".$_SESSION['email']."/".$data['id'];
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
				"data"=>""
			);

		}
		echo json_encode($res);	
	}/*}}}*/
	function updateProject($args) {/*{{{*/
		
		global $db;
		$result = "";
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
// CATEGORIES
	function getCategories($args) {/*{{{*/

		$_SESSION['user_id'] = 1;
		$user_id=$_SESSION['user_id'];

		global $db;
		$categories=$db->pg_read("select label, uuid, active, visible from categories where user_id=$1", array($user_id));
		
		$res=Array(
			"meta"=>Array(
				"status" => "info",
				"from" => "getCategories()",
				"details" => Array("Categories loaded")
			),
			"data"=>$categories
		);
		echo json_encode($res);	

	}
/*}}}*/
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
?>
