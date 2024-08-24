<?php
session_name('aamks');
require_once("inc.php");

function ajaxAddUnderlay() { #{{{
	shell_exec("mkdir -p ".$_SESSION['main']['working_home']."/underlays/");
	$dest=$_SESSION['main']['working_home']."/underlays/$_POST[floor].$_POST[type]";
	if($_POST['type']=='pdf') {
		$z=ajaxPdf2svg();
	} else {
		$z=file_put_contents($dest, base64_decode($_POST['base64']));
	}

	if($z>0) {
		echo json_encode(array("msg"=>"", "err"=>0, "data"=> ""));
	} else {
		echo json_encode(array("msg"=>"ajaxAddUnderlay(): ".error_get_last()['message'] , "err"=>1, "data"=>""));
	}
}
/*}}}*/
function ajaxPdf2svg() { /*{{{*/
	$src=$_SESSION['main']['working_home']."/underlays/$_POST[floor].pdf";
	$dest=$_SESSION['main']['working_home']."/underlays/$_POST[floor].svg";
	file_put_contents($src, base64_decode($_POST['base64']));
	exec("pdf2svg $src $dest && rm -rf $src", $x, $z);
	if(empty($z)) { return 1; } else { return 0; }
}
/*}}}*/
function ajaxRemoveUnderlay() { #{{{
	$dest=$_SESSION['main']['working_home']."/underlays/$_POST[floor]";
	shell_exec("rm $dest.*");
}
/*}}}*/
function ajaxGetUnderlay() { #{{{
	if($_POST['type']=='pdf') { $_POST['type']='svg'; }
	$src=$_SESSION['main']['working_home']."/underlays/$_POST[floor].$_POST[type]";
	if(in_array($_POST['type'], array("jpeg", "png"))) {
		$data64=shell_exec("base64 $src");
		$img="data:image/$_POST[type];base64,$data64";
	}
	if(in_array($_POST['type'], array("svg"))) {
		$img=shell_exec("cat $src");
		$img=preg_replace("/#/", "%23", $img);
		$img="data:image/svg+xml;utf8,$img";
	}
	echo json_encode(array("msg"=> '', "err"=>0, "data"=>$img));
}
/*}}}*/
function ajaxChangeActiveScenario() { #{{{
	if(!array_key_exists('nn', $_SESSION))
		{
			header("Location: login.php?session_finished_information=1");
		}
	$r=$_SESSION['nn']->query("SELECT u.id AS user_id, u.email,s.project_id,s.id AS scenario_id,s.scenario_name, u.preferences, u.user_photo, u.user_name, p.project_name FROM scenarios s JOIN projects p ON s.project_id=p.id JOIN users u ON p.user_id=u.id WHERE s.id=$1 AND p.user_id=$2",array($_POST['ch_scenario'], $_SESSION['main']['user_id']));
	$_SESSION['nn']->ch_main_vars($r[0]);
	echo json_encode(array("msg"=>"", "err"=>0, "data"=>$_SESSION['main']['scenario_name']));
}
/*}}}*/
function ajaxUserPreferences() { #{{{
	if(!array_key_exists('nn', $_SESSION))
	{
		header("Location: login.php?session_finished_information=1");
	}
	$r=$_SESSION['nn']->query("SELECT preferences FROM users WHERE id=$1",array($_SESSION['main']['user_id']));
	echo json_encode(array("msg"=>"", "err"=>0, "data"=>json_decode($r[0]['preferences'],1)));
}
function ajaxUserInfo() { #{{{
	echo json_encode($_SESSION['main']['working_home']."/picts/", 1);
}
/*}}}*/
function ajaxLaunchSimulation() { #{{{
	$aamks=getenv("AAMKS_PATH");
	$working_home=$_SESSION['main']['working_home'];
	$user_id=$_SESSION['main']['user_id'];
	if(!is_file("$working_home/cad.json")) {
		echo json_encode(array("msg"=>"You need to draw and save the project in <a class=blink href=/aamks/apainter>Apainter</a> first", "err"=>1, "data"=>''));
		return;
	}
	if(!is_file("$working_home/conf.json")) {
		echo json_encode(array("msg"=>"You need to <a class=blink href=/aamks/form.php?edit>Setup scenario</a> first", "err"=>1, "data"=>''));
		return;
	}
	$nos=json_decode(file_get_contents("$working_home/conf.json"), 1)['number_of_simulations'];
	if(!isset($nos)) {
		echo json_encode(array("msg"=>"Problem with the number of simulations. <a class=blink href=/aamks/form.php?edit>Setup scenario</a>", "err"=>1, "data"=>''));
		return;
	}

	run_aamks($working_home, $user_id);
	echo json_encode(array("msg"=>"$nos simulations launched", "err"=>0, "data"=>''));

}
/*}}}*/
function ajaxMenuContent() { /*{{{*/
	# psql aamks -c "select p.*,s.* from scenarios s LEFT JOIN projects p ON s.project_id=p.id WHERE user_id=1"
	# psql aamks -c "select * from scenarios"
	# psql aamks -c "select * from projects"
	if(!array_key_exists('nn', $_SESSION))
	{
		header("Location: login.php?session_finished_information=1");
	}
	$menu=$_SESSION['nn']->rawMenu();
	echo json_encode(array("msg"=>"", "err"=>0,  "data"=> $menu));
}
/*}}}*/
function ajaxAnimsList() { /*{{{*/
	$f=$_SESSION['main']['working_home']."/workers/anims.json";
	if(is_file($f)) {
		$data=json_decode(file_get_contents($f));
		if(empty($data)) {
			echo json_encode(array("msg"=>"Empty or broken json $f", "err"=>1, "data"=>''));
		} else {
			echo json_encode(array("msg"=>"", "err"=>0,  "data"=> $data));
		}
	} else {
		echo json_encode(array("msg"=>"No output for ".$_SESSION['main']['scenario_name']." yet", "err"=>1, "data"=>''));
	}
}
/*}}}*/
function ajaxAnimsStatic() { /*{{{*/
	$f=$_SESSION['main']['working_home']."/workers/static.json";
	if(is_file($f)) {
		$data=json_decode(file_get_contents($f));
		if(empty($data)) {
			echo json_encode(array("msg"=>"Empty or broken json $f", "err"=>1, "data"=>''));
		} else {
			echo json_encode(array("msg"=>"", "err"=>0,  "data"=> $data));
		}
	} else {
		echo json_encode(array("msg"=>"No output for ".$_SESSION['main']['scenario_name']." yet", "err"=>1, "data"=>''));
	}
}
/*}}}*/
function ajaxSingleAnim() { /*{{{*/
	if($_POST['unzip']=='funExplode') {
		funExplode();
	} else if($_POST['unzip']=='funCircle') {
		funCircle();
	} else {
		$f=$_SESSION['main']['working_home']."/workers/$_POST[unzip]";
		if(is_file($f)) {
			$z=shell_exec("unzip -qq -c $f anim.json");
		}
		if(!empty($z)) {
			echo json_encode(array("msg"=>"", "err"=>0, "data"=>$z));
		} else {
			echo json_encode(array("msg"=>"ajaxSingleAnim(): Empty or broken json $f $z", "err"=>1, "data"=>''));
		}
	}
}
/*}}}*/
function funCircle() { /*{{{*/
	$frames=[];
	$colors=["N", "L", "M", "H"];
	$floor=new stdClass;
	for($t=0; $t<15; $t+=2.5) {
		$floor->{'0'}=[];
		for($a=0; $a<19; $a++) {
			$floor->{'0'}[]=[ 2600 + round(100*cos($t+$a/3)), 1200 - round(100*sin($t+$a/3)), 0, 0, $colors[$a%4], 1 ];
			$floor->{'0'}[]=[ 2600 + round(200*cos($t+$a/3)), 1200 + round(200*sin($t+$a/3)), 0, 0, $colors[$a%4], 1 ];
			$floor->{'0'}[]=[ 2600 + round(300*cos($t+$a/3)), 1200 - round(300*sin($t+$a/3)), 0, 0, $colors[$a%4], 1 ];
		}
		$frames[][]=$floor->{'0'};
	}
	$collect=[ "simulation_id" => 1, "project_name" => "demo", "simulation_time" => 900, "time_shift" => 0, "animations" => array() ];
	$collect['animations']['evacuees']=$frames;
	$collect['animations']['rooms_opacity']=[];
	echo json_encode(array("msg"=>"", "err"=>0, "data"=> json_encode($collect)));
}
/*}}}*/
function funExplode() { /*{{{*/
	$frames=[];
	$colors=["M", "L", "N", "H" ];
	$floor=new stdClass;
	$agents=2000;
	for($t=0; $t<4; $t+=1) {
		if($t%2==0) { $radius=800; }
		$floor->{'0'}=[];
		for($a=0; $a<$agents; $a++) {
			$radius+=log(999,99999999);
			$floor->{'0'}[]=[ 2600+$radius*cos(2*pi()*$a/$agents*15), 1200+$radius*sin(2*pi()*$a/$agents*15), 0, 0, $colors[rand(0,3)], 1 ];
		}

		$frames[][]=$floor->{'0'};
	}

	$collect=[ "simulation_id" => 1, "project_name" => "demo", "simulation_time" => 900, "time_shift" => 0, "animations" => array() ];
	$collect['animations']['evacuees']=$frames;
	$collect['animations']['rooms_opacity']=[];
	echo json_encode(array("msg"=>"", "err"=>0, "data"=> json_encode($collect)));
}
/*}}}*/
function ajaxApainterExport() { /*{{{*/
	$src=$_POST['data'];
	$dest=$_SESSION['main']['working_home']."/cad.json";
	$z=file_put_contents($dest, $src);
	chmod($dest, 0666);

	if($z>0) {
		echo json_encode(array("msg"=>"File saved", "err"=>0, "data"=>""));
	} else {
		echo json_encode(array("msg"=>"ajaxApainterExport(): ".error_get_last()['message'] , "err"=>1, "data"=>""));
	}
}
/*}}}*/
function ajaxApainterImport() { /*{{{*/
	// Apainter always checks if there's a file to import.
	// It's not an error if the file is missing -- it has been not yet created.

	if(is_file($_SESSION['main']['working_home']."/cad.json")) {
		$cadfile=file_get_contents($_SESSION['main']['working_home']."/cad.json");
		if(json_decode($cadfile)) {
			echo json_encode(array("msg"=>"" , "err"=>0 , "data"=>json_decode($cadfile)));
			return;
		} else {
			echo json_encode(array("msg"=>"ajaxApainterImport(): Broken cad.json", "err"=>1, "data"=>""));
			return;
		}
	}
}
/*}}}*/
function ajaxGoogleLogin() { /*{{{*/
	$_SESSION['google_data']=$_POST['google_data'];
	$_POST['google_data']['dnr']=0; //Do Not Reload page in JS/google_login.js
	if(isset($_SESSION['g_dnr'])){
		$_POST['google_data']['dnr']=1; //Do Not Reload page in JS/google_login.js
	}
	$_SESSION['g_dnr']=1;
	echo json_encode(array("msg"=>"ajaxGoogleLogin(): OK", "err"=>0,  "data"=>$_POST['google_data']));
	$_SESSION['g_name']=$_SESSION['google_data']['g_name'];
	$_SESSION['g_email'] =$_SESSION['google_data']['g_email'];
	$_SESSION['g_user_id']=$_SESSION['google_data']['g_user_id'];
	$_SESSION['g_picture']=$_SESSION['google_data']['g_picture'];
	if(!array_key_exists('nn', $_SESSION))
	{
		header("Location: login.php?session_finished_information=1");
	}
	$ret[0]=$_SESSION['nn']->do_google_login();
	$_SESSION['nn']->ch_main_vars($ret[0]);
}
/*}}}*/

function ajaxCheckProgress(){
	$user_id=$_SESSION['main']['user_id'];
	$scenario_id = $_SESSION['main']['scenario_id'];
	if(!array_key_exists('nn', $_SESSION))
	{
		header("Location: login.php?session_finished_information=1");
	}
	$all_sims = $_SESSION['nn']->query('SELECT COUNT(*)	 FROM "simulations" WHERE "scenario_id"=$1', array($scenario_id));
	$bad_sims = $_SESSION['nn']->query('SELECT COUNT(*) FROM "simulations" WHERE "scenario_id" = $1 AND "status"::numeric BETWEEN $2 AND $3', array($scenario_id, 1, 100));
	$good_sims = $_SESSION['nn']->query('SELECT COUNT(*)	 FROM "simulations" WHERE "scenario_id"=$1 AND "status"=$2 ', array($scenario_id, "0"));
	$active_sims = $_SESSION['nn']->query('SELECT "iteration" ,"status" FROM "simulations" WHERE "scenario_id"=$1 AND "status"::numeric>$2 ', array($scenario_id,1000));
	$active = array();
	$x = 0;
	foreach ($active_sims as $row) {
		$iteration = $row['iteration'];
		if($row['status']=='1100'){
			$status = substr($row['status'],-3,3);
		}
		else{
			$status = substr($row['status'],-2);
		}
		$active[] = "<tr><td id='left_column'>No:".$iteration."</td>:<td>".$status."%</td><tr>";
		$x+=1;
	}
	$all = $all_sims[0]['count'];
	$bad = $bad_sims[0]['count'];
	$good = $good_sims[0]['count'];

	echo json_encode(array("msg"=>"","bad"=>json_encode($all_sims), "err"=>0,  "data"=>json_encode($result), "good"=>$good, "bad"=>$bad, "all"=>$all, "active"=>$active));
}
function ajaxShowImage(){
	$f=$_SESSION['main']['working_home'].'/picts/'.$_GET['img'];
	$img = file_get_contents($f);
	$base64Image = base64_encode($img);
	echo json_encode('data:image/jpeg;base64,'.$base64Image);
}
function main() { /*{{{*/
	header('Content-type: application/json');
	ini_set('display_errors', 1);

	// sanitize all $_POST, Cyril Vallicari from https://www.ziwit.com/ thanks for schooling me! :)
	// Aamks is now secure but broken :( We cannot globally escape $_POST because it hurts json files etc.
	/*

	foreach($_POST as $k=>$v) {
		$_POST[$k]=escapeshellcmd($v);
		echo $_POST;
		}
	*/


	if(!empty($_SESSION['main']['user_id']))            {

		if(isset($_GET['ajaxPdf2svg']))                 { ini_set('display_errors', 0) ; ajaxPdf2svg()              ; ini_set('display_errors', 1) ; }
		if(isset($_GET['ajaxApainterExport']))          { ini_set('display_errors', 0) ; ajaxApainterExport()       ; ini_set('display_errors', 1) ; }
		if(isset($_GET['ajaxApainterImport']))          { ini_set('display_errors', 0) ; ajaxApainterImport()       ; ini_set('display_errors', 1) ; }
		if(isset($_GET['ajaxAnimsList']))               { ini_set('display_errors', 0) ; ajaxAnimsList()            ; ini_set('display_errors', 1) ; }
		if(isset($_GET['ajaxAnimsStatic']))             { ini_set('display_errors', 0) ; ajaxAnimsStatic()          ; ini_set('display_errors', 1) ; }
		if(isset($_GET['ajaxSingleAnim']))              { ini_set('display_errors', 0) ; ajaxSingleAnim()           ; ini_set('display_errors', 1) ; }
		if(isset($_GET['ajaxMenuContent']))             { ini_set('display_errors', 0) ; ajaxMenuContent()          ; ini_set('display_errors', 1) ; }
		if(isset($_GET['ajaxLaunchSimulation']))        { ini_set('display_errors', 0) ; ajaxLaunchSimulation()     ; ini_set('display_errors', 1) ; }
		if(isset($_GET['ajaxUserPreferences']))         { ini_set('display_errors', 0) ; ajaxUserPreferences()      ; ini_set('display_errors', 1) ; }
		if(isset($_GET['ajaxUserInfo']))         		{ ini_set('display_errors', 0) ; ajaxUserInfo()      		; ini_set('display_errors', 1) ; }
		if(isset($_GET['ajaxChangeActiveScenario']))    { ini_set('display_errors', 0) ; ajaxChangeActiveScenario() ; ini_set('display_errors', 1) ; }
		if(isset($_GET['ajaxChangeActiveScenarioAlt'])) { ini_set('display_errors', 0) ; ajaxChangeActiveScenario() ; ini_set('display_errors', 1) ; }
		if(isset($_GET['ajaxGetUnderlay']))             { ini_set('display_errors', 0) ; ajaxGetUnderlay()          ; ini_set('display_errors', 1) ; }
		if(isset($_GET['ajaxAddUnderlay']))             { ini_set('display_errors', 0) ; ajaxAddUnderlay()          ; ini_set('display_errors', 1) ; }
		if(isset($_GET['ajaxRemoveUnderlay']))          { ini_set('display_errors', 0) ; ajaxRemoveUnderlay()       ; ini_set('display_errors', 1) ; }
		if(isset($_GET['ajaxCheckProgress']))          	{ ini_set('display_errors', 0) ; ajaxCheckProgress()       	; ini_set('display_errors', 1) ; }
		if(isset($_GET['ajaxShowImage']))	          	{ ini_set('display_errors', 0) ; ajaxShowImage()	       	; ini_set('display_errors', 1) ; }
	}
	if(isset($_GET['googleLogin']))    { ajaxGoogleLogin(); }
}
/*}}}*/
main();
?>
