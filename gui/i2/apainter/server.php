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
	$dest="$_SESSION[AAMKS_PROJECT]/cad.json";
	$z=file_put_contents($dest, $_POST['cadfile']);
	if($z>0) { 
		echo json_encode(array("msg"=>"OK $dest", "err"=>0));
	} else { 
		echo json_encode(array("msg"=>"Cannot write $dest", "err"=>1));
	}
}
/*}}}*/

$_SESSION['user_id']=1;
$_SESSION['AAMKS_PROJECT']="/home/aamks_users/mimoohowy@gmail.com/1/risk/1";
#$_SESSION['AAMKS_PROJECT']="/home/aamks_users/mimoohowy@gmail.com/1/risk/1/cad.json";

if(isset($_GET['pdf2svg']))  { pdf2svg(); }
if(isset($_GET['apainter'])) { apainter(); }
?>
