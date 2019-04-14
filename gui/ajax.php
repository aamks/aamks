<?php
session_name('aamks');
require_once("inc.php"); 

function ajaxChangeActiveScenario() { #{{{
	$r=$_SESSION['nn']->query("SELECT u.email,s.project_id,s.id AS scenario_id,s.scenario_name, u.active_editor, u.user_photo, u.user_name, p.project_name FROM scenarios s JOIN projects p ON s.project_id=p.id JOIN users u ON p.user_id=u.id WHERE s.id=$1 AND p.user_id=$2",array($_POST['ch_scenario'], $_SESSION['main']['user_id']));
	$_SESSION['nn']->ch_main_vars($r[0]);
	echo json_encode(array("msg"=>"", "err"=>0, "data"=>$_SESSION['main']['scenario_name']));
}
/*}}}*/
function ajaxLaunchSimulation() { #{{{
	$aamks=getenv("AAMKS_PATH");
	$working_home=$_SESSION['main']['working_home'];
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
	$cmd="cd $aamks; python3 aamks.py $working_home 2>&1"; 

	$z=shell_exec("$cmd");
	if(empty($z)) { 
		echo json_encode(array("msg"=>"$nos simulations launched", "err"=>0, "data"=>''));
	} else {
		echo json_encode(array("msg"=>"$z", "err"=>1, "data"=>$z));
	}
}
/*}}}*/
function ajaxMenuContent() { /*{{{*/
	# psql aamks -c "select p.*,s.* from scenarios s LEFT JOIN projects p ON s.project_id=p.id WHERE user_id=1"
	# psql aamks -c "select * from scenarios"
	# psql aamks -c "select * from projects"
	$menu=$_SESSION['nn']->rawMenu();
	$close_button="<close-left-menu-box><img src=/aamks/css/close.svg></close-left-menu-box><br>";
	echo json_encode(array("msg"=>"", "err"=>0,  "data"=> $close_button.$menu));
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
	$arr=[];
	$colors=["N", "N", "N", "N"];
	for($t=0; $t<15; $t+=2.5) { 
		$record=[];
		for($a=0; $a<19; $a++) { 
			$record[]=[ 2600 + round(100*cos($t+$a/3)), 1200 - round(100*sin($t+$a/3)), 0, 0, $colors[$a%4], 1 ];
			$record[]=[ 2600 + round(200*cos($t+$a/3)), 1200 + round(200*sin($t+$a/3)), 0, 0, $colors[$a%4], 1 ];
			$record[]=[ 2600 + round(300*cos($t+$a/3)), 1200 - round(300*sin($t+$a/3)), 0, 0, $colors[$a%4], 1 ];
		}
		$arr[]=$record;
	}
	$collect=[ "simulation_id" => 1, "project_name" => "demo", "simulation_time" => 900, "time_shift" => 0, "animations" => array() ];
	$collect['animations']['evacuees']=$arr;
	$collect['animations']['rooms_opacity']=[];
	echo json_encode(array("msg"=>"", "err"=>0, "data"=> json_encode($collect)));
}
/*}}}*/
function funExplode() { /*{{{*/
	$arr=[];
	$colors=["M", "L", "N", "H" ];
	$y=[];
	for($t=0; $t<4; $t+=1) { 
		$record=[];
		for($a=0; $a<700; $a++) { 
			$color=floor($a/100)%4;
			$record[]=[ 2600+$t*rand(-12,12)*$a/10, 1200+$t*rand(-12,12)*$a/10, 0, 0, $colors[$color], 1 ];
		}
		$arr[]=$record;
	}
	$collect=[ "simulation_id" => 1, "project_name" => "demo", "simulation_time" => 900, "time_shift" => 0, "animations" => array() ];
	$collect['animations']['evacuees']=$arr;
	$collect['animations']['rooms_opacity']=[];
	echo json_encode(array("msg"=>"", "err"=>0, "data"=> json_encode($collect)));
}
/*}}}*/
function ajaxApainterExport() { /*{{{*/
	$src=$_POST['cadfile'];
	$dest=$_SESSION['main']['working_home']."/cad.json";
	$z=file_put_contents($dest, $src);

	if($z>0) { 
		echo json_encode(array("msg"=>"ajaxApainterExport(): OK", "err"=>0, "data"=>""));
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
		} else { 
			echo json_encode(array("msg"=>"ajaxApainterImport(): Broken cad.json", "err"=>1, "data"=>""));
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
	$ret[0]=$_SESSION['nn']->do_google_login();
	$_SESSION['nn']->set_user_variables($ret[0]);
}
/*}}}*/
function ajaxPdf2svg() { /*{{{*/
	$src=$_FILES['file']['tmp_name'];
	$dest=$_SESSION['main']['working_home']."/out.svg";
	$z=shell_exec("pdf2svg $src $dest 2>&1");
	$svg='';
	if(empty($z)) { 
		$svg=shell_exec("cat $dest"); 
		$svg=preg_replace("/#/", "%23", $svg);
		echo json_encode(array("msg"=>"", "err"=>0,  "data"=>$svg));
	} else {
		echo json_encode(array("msg"=>"ajaxPdf2svg(): $z", "err"=>1, "data"=>""));
	}
}
/*}}}*/
function main() { /*{{{*/
	header('Content-type: application/json');

	ini_set('display_errors', 1);

	if(!empty($_SESSION['main']['user_id']))            {

		if(isset($_GET['ajaxPdf2svg']))                 { ini_set('display_errors', 0) ; ajaxPdf2svg()              ; ini_set('display_errors', 1); }
		if(isset($_GET['ajaxApainterExport']))          { ini_set('display_errors', 0) ; ajaxApainterExport()       ; ini_set('display_errors', 1); }
		if(isset($_GET['ajaxApainterImport']))          { ini_set('display_errors', 0) ; ajaxApainterImport()       ; ini_set('display_errors', 1); }
		if(isset($_GET['ajaxAnimsList']))               { ini_set('display_errors', 0) ; ajaxAnimsList()            ; ini_set('display_errors', 1); }
		if(isset($_GET['ajaxAnimsStatic']))             { ini_set('display_errors', 0) ; ajaxAnimsStatic()          ; ini_set('display_errors', 1); }
		if(isset($_GET['ajaxSingleAnim']))              { ini_set('display_errors', 0) ; ajaxSingleAnim()           ; ini_set('display_errors', 1); }
		if(isset($_GET['ajaxMenuContent']))             { ini_set('display_errors', 0) ; ajaxMenuContent()          ; ini_set('display_errors', 1); }
		if(isset($_GET['ajaxLaunchSimulation']))        { ini_set('display_errors', 0) ; ajaxLaunchSimulation()     ; ini_set('display_errors', 1); }
		if(isset($_GET['ajaxChangeActiveScenario']))    { ini_set('display_errors', 0) ; ajaxChangeActiveScenario() ; ini_set('display_errors', 1); }
		if(isset($_GET['ajaxChangeActiveScenarioAlt'])) { ini_set('display_errors', 0) ; ajaxChangeActiveScenario() ; ini_set('display_errors', 1); }
	}
	if(isset($_GET['googleLogin']))    { ajaxGoogleLogin(); }
}
/*}}}*/
main();
?>
