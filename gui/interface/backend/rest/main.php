<?php
// MAIN
function getIndex() {/*{{{*/
	include("view/index.html");
}/*}}}*/
function login() {/*{{{*/
	include("login.php");
}/*}}}*/
function logout() {/*{{{*/
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
}/*}}}*/
// SETTINGS
	function getSettings($args) {/*{{{*/
		$user_id=$_SESSION['user_id'];

		global $db;
		$res=$db->pg_read("select username, editor, current_project_id, current_scenario_id, websocket_host, websocket_port from users where id=$1", array($user_id));

		$res=Array(
			"meta"=>Array(
			"status" => "info",
			"from" => "getSettings()",
			"details" => Array("Settings loaded")
		),
			"data"=>Array(
			"userId"=>$user_id,
			"userName"=>$res[0]['username'],
			"editor"=>$res[0]['editor'],
			"current_project_id"=>$res[0]['current_project_id'],
			"current_scenario_id"=>$res[0]['current_scenario_id'],
			"websocket_host"=>$res[0]['websocket_host'],
			"websocket_port"=>$res[0]['websocket_port']
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
?>
