<?php

session_name('aamks');
require_once("inc.php"); 

function listing() {/*{{{*/
	extract($_SESSION['main']);
	$sim="$project_id/$scenario_id";
}
/*}}}*/
function status() {/*{{{*/
	extract($_SESSION['main']);
	$r=$_SESSION['nn']->query("SELECT count(*) AS finished FROM simulations where project = $project_id and dcbe_time is not null");
	$finished=$r[0]['finished'];
	$r=$_SESSION['nn']->query("SELECT count(*) AS total FROM simulations where project = $project_id");
	$total=$r[0]['total'];
	echo "<br>Complete: $finished of $total &nbsp; &nbsp; <wheat>ctrl+r to refresh</wheat>";
}
/*}}}*/

/*}}}*/
function show_pictures() {/*{{{*/
	$f=$_SESSION['main']['working_home'];
	$aamks=getenv("AAMKS_PATH");
	$cmd="cd $aamks/results/beck; python3 beck.py $f 2>&1"; 
	$z=shell_exec("$cmd");
	echo "<br>$z";
}
/*}}}*/


function main() {/*{{{*/
	$_SESSION['nn']->htmlHead("Simulations");
	$_SESSION['nn']->menu('Manage simulations');
	listing();
	status();
	show_pictures();
}
/*}}}*/

main();
?>
