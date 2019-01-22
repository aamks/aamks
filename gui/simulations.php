<?php

session_name('aamks');
require_once("inc.php"); 

function listing() {/*{{{*/
	extract($_SESSION['main']);
	$sim="$project_id/$scenario_id";
	echo "<table>
	<tr><td>project<td>$project_name ($project_id)
	<tr><td>scenario<td>$scenario_name ($scenario_id)
	</table>
	<form method=post style='display:inline'>
		<input type=hidden name=sim value=$sim>
		<input type=submit name=launch value=launch>
	</form>
	";
}
/*}}}*/
function launch() {/*{{{*/
	if(empty($_POST['launch'])) { return; }
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
	$_SESSION['nn']->htmlHead("Simulations");
	$_SESSION['nn']->menu('Manage simulations');
	listing();
	launch();
	status();
}
/*}}}*/

main();
?>
