<?php

session_name('aamks');
require_once("inc.php"); 

function listing() {/*{{{*/
	//enter project id
	//enter scenario_id
	// halt jobs button
	echo "<form method='POST' action=''>
	    <input type='submit' style='font-size:12pt; font-weight: bold' name='btn-halt-cur' value='Halt current scenario'><br>
	Developers only:&nbsp;
	<input autocomplete=off type=text placeholder='project ID' name=project title='project ID to be stopped'> 
	<input autocomplete=off type=text placeholder='scenario ID' name=scenario title='scenario ID to be stopped'> 
	    <input type='submit' style='font-size:10pt; font-weight: bold' name='btn-halt' value='Halt jobs'>";
}

function stop() {
	$r=$_SESSION['nn']->query("SELECT job_id FROM simulations WHERE scenario_id=$1 AND project=$2 AND job_id IS NOT NULL AND job_id != '' ORDER BY job_id", array($_POST['scenario'], $_POST['project'] ));
	echo "<br>".$_POST['project']."/".$_POST['scenario']."<br>";
	echo "<br>Job ID --> Halting status<br>---------------------------<br>";

	foreach ($r as $innerArray) {
    foreach ($innerArray as $element) {

    $cmd = "gearadmin --cancel-job=$element";

    // Output a 'waiting message'
        echo $element . " --> ";
	$z=shell_exec("$cmd");
	if ($z == null) { 
		$rr=$_SESSION['nn']->query("SELECT status FROM simulations WHERE job_id=$1", array($element ))[0];
		foreach ($rr as $foo) {	echo "NO (".$foo.")";}
	}
	else{	echo $z; 
	$r=$_SESSION['nn']->query("UPDATE simulations SET status='halted' WHERE job_id=$1", array($element ));
	}
    }
    echo "<br>"; // Add a line break after each inner array
}

}
function stop_current() {
	$r=$_SESSION['nn']->query("SELECT job_id FROM simulations WHERE scenario_id=$1 AND project=$2 AND job_id IS NOT NULL AND job_id != '' ORDER BY job_id", array($_SESSION['main']['scenario_id'], $_SESSION['main']['project_id'] ));
	echo "<br>".$_SESSION['main']['project_id']."/".$_SESSION['main']['scenario_id']."<br>";
	echo "<br>Job ID --> Halting status<br>---------------------------<br>";

	foreach ($r as $innerArray) {
    foreach ($innerArray as $element) {

    $cmd = "gearadmin --cancel-job=$element";

    // Output a 'waiting message'
        echo $element . " --> ";
	$z=shell_exec("$cmd");
	if ($z == null) { 
		$rr=$_SESSION['nn']->query("SELECT status FROM simulations WHERE job_id=$1", array($element ))[0];
		foreach ($rr as $foo) {	echo "NO (".$foo.")";}
	}
	else{	echo $z; 
	$r=$_SESSION['nn']->query("UPDATE simulations SET status='halted' WHERE job_id=$1", array($element ));
	}
    }
    echo "<br>"; // Add a line break after each inner array
}}
/*}}}*/
/*}}}*/

function main() {/*{{{*/
	$_SESSION['nn']->htmlHead("Halting jobs");
	$_SESSION['nn']->menu('Halting jobs');

	listing();
	//if halt stop()
	if (isset($_POST['btn-halt'])) {
		stop();
    }
	if (isset($_POST['btn-halt-cur'])) {
		stop_current();
    }



}
/*}}}*/

main();
?>
