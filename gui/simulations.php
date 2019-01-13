<?php

session_name('aamks');
require_once("inc.php"); 

function listing() {/*{{{*/
	extract($_SESSION['main']);
	$sim="$project_id/$scenario_id";
	echo "<br><br>Simulation: $sim 
	<form method=post style='display:inline'>
		<input type=hidden name=sim value=$sim>
		<input type=submit name=run value=run>
	</form>
	";
}
/*}}}*/
function run() {/*{{{*/
	if(empty($_POST['run'])) { return; }
	$aamks=getenv("AAMKS_PATH");
	$scenario=$_SESSION['main']['working_home'];
	$cmd="cd $aamks; python3 aamks.py $scenario"; 

	$z=shell_exec("$cmd");
	if(!empty($z)) { 
		$_SESSION['header_ok'][]="OK: $cmd";
	} else {
		$_SESSION['header_err'][]="$cmd";
	}
	header("Location: simulations.php");
		
}
/*}}}*/
function status() {/*{{{*/
	$r=$_SESSION['nn']->query("SELECT count(*) AS finished FROM simulations");
	$finished=$r[0]['finished'];
	$total=200;
	echo "<br>Complete: $finished of $total &nbsp; &nbsp; <wheat>ctrl+r to refresh</wheat>";
}
/*}}}*/

function main() {/*{{{*/
	$_SESSION['nn']->htmlHead("Aamks Simulations");
	$_SESSION['nn']->menu();
	listing();
	run();
	status();
}
/*}}}*/

main();
?>
