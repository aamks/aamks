<?php
header('Access-Control-Allow-Origin: *');

function make_pdf() { /*{{{*/
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
function make_apainter() { /*{{{*/
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

if(isset($_POST['make_pdf']))      { make_pdf(); }
if(isset($_POST['make_apainter'])) { make_apainter(); }
?>
