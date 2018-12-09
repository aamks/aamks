<?php
session_name('aamks');
session_start();

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
	if($_POST['unzip']=='fun') { 
		ajaxSingleAnimFun();
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
function ajaxSingleAnimFun() { /*{{{*/
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
	$collect=[ "simulation_id" => 1, "project_name" => "three", "frame_rate" => 0.5, "simulation_time" => 200, "time_shift" => 0  ];
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
function main() { /*{{{*/
	if(!empty($_SESSION['main']['user_id'])) { 
		header('Content-type: application/json');
		if(!is_writable($_SESSION['main']['working_home'])) { 
			echo json_encode(array("msg"=>"ajaxMain(): Cannot write ".$_SESSION['main']['working_home'], "err"=>1, "data"=>0));
			exit();
		}
		if(isset($_GET['pdf2svg']))          { ajaxPdf2svg(); }
		if(isset($_GET['apainter']))         { ajaxApainter(); }
		if(isset($_GET['getAnimsList']))     { ajaxAnimsList(); }
		if(isset($_GET['getAnimsStatic']))   { ajaxAnimsStatic(); }
		if(isset($_GET['getSingleAnim']))    { ajaxSingleAnim(); }
	}
}
/*}}}*/
main();
?>
