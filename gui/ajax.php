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
	$collect=[ "simulation_id" => 1, "project_name" => "three", "simulation_time" => 200, "time_shift" => 0  ];
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
	$collect=[ "simulation_id" => 1, "project_name" => "three", "simulation_time" => 900, "time_shift" => 0  ];
	$collect['data']=$arr;
	echo json_encode(array("msg"=>"ajaxSingleAnimFun(): OK", "err"=>0, "data"=>$collect));
}
/*}}}*/
function ajaxApainter() { /*{{{*/
	$src=$_POST['cadfile'];
	$dest=$_SESSION['main']['working_home']."/cad.json";
	$z=file_put_contents($dest, $src);
	if($z>0) { 
		echo json_encode(array("msg"=>"ajaxApainter(): OK", "err"=>0, "data"=>""));
	} else { 
		echo json_encode(array("msg"=>"ajaxApainter(): Cannot write $dest", "err"=>1, "data"=>""));
	}
}
/*}}}*/
function ajaxGoogleLogin() { /*{{{*/
	# TODO
	$_SESSION['google_data']=$_POST['google_data'];
#	$_SESSION['nn']->set_user_variables($r);
	echo json_encode(array("msg"=>"ajaxGoogleLogin(): OK", "err"=>0,  "data"=>$_SESSION['main']));

	# $_SESSION['g_name']=$_SESSION['g_login']['g_name'];
	# $_SESSION['g_email'] =$_SESSION['g_login']['g_email'];
	# $_SESSION['g_user_id']=$_SESSION['g_login']['g_user_id'];
	# $_SESSION['g_picture']=$_SESSION['g_login']['g_picture'];

}
/*}}}*/
function main() { /*{{{*/
	if(!empty($_SESSION['main']['user_id'])) { 
		header('Content-type: application/json');
		if(!is_writable($_SESSION['main']['working_home'])) { 
			echo json_encode(array("msg"=>"ajaxMain(): Cannot write ".$_SESSION['main']['working_home'], "err"=>1, "data"=>0));
			exit();
		}
		if(isset($_GET['pdf2svg']))        { ajaxPdf2svg(); }
		if(isset($_GET['apainter']))       { ajaxApainter(); }
		if(isset($_GET['getAnimsList']))   { ajaxAnimsList(); }
		if(isset($_GET['getAnimsStatic'])) { ajaxAnimsStatic(); }
		if(isset($_GET['getSingleAnim']))  { ajaxSingleAnim(); }
	}
		if(isset($_GET['googleLogin']))    { ajaxGoogleLogin(); }
}
/*}}}*/
main();
?>
