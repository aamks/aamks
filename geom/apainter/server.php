<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: *');
session_start();

function pdf2svg() { /*{{{*/
	$in=$_FILES['file']['tmp_name'];
	$z=shell_exec("pdf2svg $in out.svg 2>&1");
	$svg='';
	if(empty($z)) { 
		$svg=shell_exec("cat out.svg"); 
		$svg=preg_replace("/#/", "%23", $svg);
	}
	echo json_encode(array("err"=>$z, "svg"=>$svg));
}
/*}}}*/
function apainter() { /*{{{*/
	$z=file_put_contents($_SESSION['AAMKS_PROJECT']."/cad.json", 'cad data');
	$m=json_decode($_POST);
	#echo json_encode(array("err"=> json_decode($_POST)));
	echo json_encode(array("msg"=>$m, "err"=>$z));
}
/*}}}*/

$_SESSION['user_id']=1;
$_SESSION['AAMKS_PROJECT']="/home/aamks_users/mimoohowy@gmail.com/1/risk/1";
#$_SESSION['AAMKS_PROJECT']="/home/aamks_users/mimoohowy@gmail.com/1/risk/1/cad.json";

if(isset($_GET['pdf2svg']))  { pdf2svg(); }
if(isset($_GET['apainter'])) { apainter(); }
?>
