<?php
header('Access-Control-Allow-Origin: *');
//header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

$in=$_FILES['file']['tmp_name'];
$z=shell_exec("pdf2svg $in out.svg 2>&1");
echo json_encode(array("err"=>$z, "data"=>[1,2,3]));
?>
