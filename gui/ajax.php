<?php
session_name('aamks');
require_once("inc.php"); 
function ajaxAnimsList() { /*{{{*/
	$f=$_SESSION['main']['working_home']."/workers/anims.json";
	if(is_file($f)) { 
		$data=json_decode(file_get_contents($f));
		echo json_encode(array("msg"=>"ajaxAnimsList(): OK", "err"=>0,  "data"=> $data));
	} else {
		echo json_encode(array("msg"=>"ajaxAnimsList(): $z", "err"=>1, "data"=>0));
	}
}
/*}}}*/
function ajaxAnimsStatic() { /*{{{*/
	$f=$_SESSION['main']['working_home']."/workers/static.json";
	if(is_file($f)) { 
		$data=json_decode(file_get_contents($f));
		echo json_encode(array("msg"=>"ajaxAnimsStatic(): OK", "err"=>0,  "data"=> $data));
	} else {
		echo json_encode(array("msg"=>"ajaxAnimsStatic(): $z", "err"=>1, "data"=>0));
	}
}
/*}}}*/
function ajaxSingleAnim() { /*{{{*/
	if($_POST['unzip']=='funUpDown') { 
		ajaxSingleAnimFunUpDown();
	} else if($_POST['unzip']=='funCircle') { 
		ajaxSingleAnimFunCircle();
	} else { 
		$f=$_SESSION['main']['working_home']."/workers/$_POST[unzip]";
		if(is_file($f)) { 
			$z=json_decode(shell_exec("unzip -qq -c $f anim.json"));
		}
		if(!empty($z)) { 
			echo json_encode(array("msg"=>"ajaxSingleAnim(): OK", "err"=>0, "data"=>$z));
		} else {
			echo json_encode(array("msg"=>"ajaxSingleAnim(): $z", "err"=>1, "data"=>0));
		}
	}
}
/*}}}*/
function ajaxSingleAnimFunCircle() { /*{{{*/
	$arr=[];
	$colors=["H", "M", "L", "N"];
	for($t=0; $t<15; $t+=2.5) { 
		$record=[];
		for($a=0; $a<19; $a++) { 
			$record[]=[ 2450 + round(100*cos($t+$a/3)), 1000 - round(100*sin($t+$a/3)), 0, 0, $colors[$a%4], 1 ];
			$record[]=[ 2450 + round(200*cos($t+$a/3)), 1000 + round(200*sin($t+$a/3)), 0, 0, $colors[$a%4], 1 ];
			$record[]=[ 2450 + round(300*cos($t+$a/3)), 1000 - round(300*sin($t+$a/3)), 0, 0, $colors[$a%4], 1 ];
		}
		$arr[]=$record;
	}
	$collect=[ "simulation_id" => 1, "project_name" => "demo", "simulation_time" => 200, "time_shift" => 0  ];
	$collect['data']=$arr;
	echo json_encode(array("msg"=>"ajaxSingleAnimFun(): OK", "err"=>0, "data"=>$collect));
}
/*}}}*/
function ajaxSingleAnimFunUpDown() { /*{{{*/
	$arr=[];
	$colors=["H", "M", "L", "N"];
	$y=[];
	for($t=0; $t<10; $t+=1) { 
		$record=[];
		for($a=0; $a<370; $a++) { 
			$y[$a]=rand(520,980);
			$color=floor($a/100);
			$record[]=[ 1020 + 8*$a, $y[$a], 0, 0, $colors[$color], 1 ];
			$y[$a]+=1500-2*$y[$a];
		}
		$arr[]=$record;
		#dd2($arr);
	}
	$collect=[ "simulation_id" => 1, "project_name" => "demo", "simulation_time" => 900, "time_shift" => 0  ];
	$collect['data']=$arr;
	echo json_encode(array("msg"=>"ajaxSingleAnimFun(): OK", "err"=>0, "data"=>$collect));
}
/*}}}*/
function ajaxApainterExport() { /*{{{*/
	$src=$_POST['cadfile'];
	$dest=$_SESSION['main']['working_home']."/cad.json";
	$z=file_put_contents($dest, $src);
	if($z>0) { 
		echo json_encode(array("msg"=>"ajaxApainterExport(): OK", "err"=>0, "data"=>""));
	} else { 
		echo json_encode(array("msg"=>"ajaxApainterExport(): Cannot export $dest", "err"=>1, "data"=>""));
	}
}
/*}}}*/
function ajaxApainterImport() { /*{{{*/
	$cadfile=file_get_contents($_SESSION['main']['working_home']."/cad.json");
	if(json_decode($cadfile)) { 
		echo json_encode(array("msg"=>"ajaxApainterImport(): OK" , "err"=>0 , "data"=>$cadfile));
	} else { 
		echo json_encode(array("msg"=>"ajaxApainterImport(): Cannot import cad.json", "err"=>1, "data"=>""));
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
		echo json_encode(array("msg"=>"ajaxPdf2svg(): OK", "err"=>0,  "data"=>$svg));
	} else {
		echo json_encode(array("msg"=>"ajaxPdf2svg(): $z", "err"=>1, "data"=>0));
	}
}
/*}}}*/
function main() { /*{{{*/
	header('Content-type: application/json');
	if(!empty($_SESSION['main']['user_id'])) {
		if(isset($_GET['pdf2svg']))          { ajaxPdf2svg(); }
		if(isset($_GET['exportApainter']))   { ajaxApainterExport(); }
		if(isset($_GET['importApainter']))   { ajaxApainterImport(); }
		if(isset($_GET['getAnimsList']))     { ajaxAnimsList(); }
		if(isset($_GET['getAnimsStatic']))   { ajaxAnimsStatic(); }
		if(isset($_GET['getSingleAnim']))    { ajaxSingleAnim(); }
	}
	if(isset($_GET['googleLogin']))    { ajaxGoogleLogin(); }
}
/*}}}*/
main();
?>
