<?php

session_name('aamks');
require_once("inc.php"); 

function set_help($show=false) {
	$_SESSION['codes'] = [
    '0' => 'Iteration finished without any error',
    '1' => 'Unknown error',
    '10' => 'Unknown error in setting up simulation on worker',
    '11' => 'Error in creating workspaces',
    '12' => 'Downloading conf.json failed',
    '13' => 'Downloading evac.json failed',
    '14' => 'Downloading aamks.sqlite failed',
    '15' => 'Downloading cfast.in failed',
    '16' => 'Downloading $AAMKS_PATH/evac/conf.json failed',
    '17' => 'Loading evac.json failed',
    '20' => 'Unknown CFAST error',
    '21' => 'CFAST timeout (after 600 s)',
    '22' => 'CFAST pressure error',
    '30' => 'Unknown Evac error',
    '31' => 'Error in setting up floors (evac.rvo2_dto.EvacEnv)',
    '32' => 'Error in connecting with smoke query (fires.partition_query.PartitionQuery)',
    '33' => 'Error reading smoke query record (fires.partition_query.PartitionQuery.cfast_has_time())',
    '90' => 'Iteration halted remotely (cancelled at the queuing stage)',
    '91' => 'Iteration halted manually (also this code has to be set by hand)',
    '' => '',
    'halted' => 'deprecated code 90',
];
	if ($show) { echo "<table><tr><th>Code</th><th>Description</th></tr>";
		foreach ($_SESSION['codes'] as $c => $d) { echo "<tr><td>$c</td><td>$d</td></tr>";}
		echo "</table>";
	}
}

function listing() {/*{{{*/
	//enter project id
	//enter scenario_id
	// halt jobs button
	echo "<form method='POST' action=''>
	    <input type='submit' style='font-size:12pt; font-weight: bold' name='btn-halt-cur' value='Halt current scenario'>
	    <input type='submit' style='font-size:12pt; font-weight: bold' name='btn-check-status' value='Check status'>&nbsp;&nbsp;
	    <input type='submit' style='font-size:10pt; font-weight: bold' name='btn-status' value='Status table'><br>
	Developers only:&nbsp;
	<input autocomplete=off type=text placeholder='project ID' name=project title='project ID to be stopped'> 
	<input autocomplete=off type=text placeholder='scenario ID' name=scenario title='scenario ID to be stopped'> 
	    <input type='submit' style='font-size:10pt; font-weight: bold' name='btn-halt' value='Halt jobs'><br>";
}

function check_stat() {
	$r=$_SESSION['nn']->query("SELECT iteration, status FROM simulations WHERE scenario_id=$1 AND project=$2 AND job_id IS NOT NULL AND job_id != '' ORDER BY modified DESC", array($_SESSION['main']['scenario_id'], $_SESSION['main']['project_id'] ));
	echo "<br>".$_SESSION['main']['project_id']."/".$_SESSION['main']['scenario_id']."<br>";
	echo "<table><tr><th>Iteration</th><th>Status</th><th>Description</th></tr>";

	foreach ($r as $innerArray) {
		echo "<tr>";
    foreach ($innerArray as $element) {
		echo "<td align='center'>$element</td>";
	}
    echo "<td>".$_SESSION['codes'][$element]."</td></tr>"; // Add a line break after each inner array
    }
    echo "</table>"; // Add a line break after each inner array
}

function stop() {
	$r=$_SESSION['nn']->query("SELECT job_id FROM simulations WHERE scenario_id=$1 AND project=$2 AND job_id IS NOT NULL AND job_id != '' ORDER BY modified DESC", array($_POST['scenario'], $_POST['project'] ));
	echo "<br>".$_POST['project']."/".$_POST['scenario']."<br>";
	echo "<table><tr><th>Job ID</th><th>Halted?</th><th>Status</th></tr>";

	foreach ($r as $innerArray) {
    foreach ($innerArray as $element) {

    $cmd = "gearadmin --cancel-job=$element";

    // Output a 'waiting message'
        echo "<tr><td>$element</td>";
	$z=shell_exec("$cmd");
	if ($z == null) { 
		$rr=$_SESSION['nn']->query("SELECT status FROM simulations WHERE job_id=$1", array($element ))[0];
		foreach ($rr as $foo) {	echo "<td align='center'>NO</td><td align='center'>$foo</td>";}
	}
	else{	echo "<td align='center'>$z</td><td></td>"; 
	$r=$_SESSION['nn']->query("UPDATE simulations SET status='90' WHERE job_id=$1", array($element ));
	}
    }
    //echo "<td>".$_SESSION['codes'][$element]."</td></tr>"; // Add a line break after each inner array
    echo "<tr>";
}
    echo "</table>"; // Add a line break after each inner array

}
function stop_current() {
	$r=$_SESSION['nn']->query("SELECT job_id FROM simulations WHERE scenario_id=$1 AND project=$2 AND job_id IS NOT NULL AND job_id != '' ORDER BY modified DESC", array($_SESSION['main']['scenario_id'], $_SESSION['main']['project_id'] ));
	echo "<br>".$_SESSION['main']['project_id']."/".$_SESSION['main']['scenario_id']."<br>";
	echo "<table><tr><th>Job ID</th><th>Halted?</th><th>Status</th></tr>";

	foreach ($r as $innerArray) {
    foreach ($innerArray as $element) {

    $cmd = "gearadmin --cancel-job=$element";

    // Output a 'waiting message'
        echo "<tr><td>$element</td>";
	$z=shell_exec("$cmd");
	if ($z == null) { 
		$rr=$_SESSION['nn']->query("SELECT status FROM simulations WHERE job_id=$1", array($element ))[0];
		foreach ($rr as $foo) {	echo "<td align='center'>NO</td><td align='center'>$foo</td>";}
	}
	else{	echo "<td align='center'>$z</td><td></td>"; 
	$r=$_SESSION['nn']->query("UPDATE simulations SET status='90' WHERE job_id=$1", array($element ));
	}
    }
    //echo "<td>".$_SESSION['codes'][$element]."</td></tr>"; // Add a line break after each inner array
    echo "<tr>";
}
    echo "</table>"; // Add a line break after each inner array
}
/*}}}*/
/*}}}*/

function main() {/*{{{*/
	$_SESSION['nn']->htmlHead("Manage jobs");
	$_SESSION['nn']->menu('Manage jobs');

	listing();
	//if halt stop()
	if (isset($_POST['btn-halt'])) {
		set_help();
		stop();
    }
	if (isset($_POST['btn-halt-cur'])) {
		set_help();
		stop_current();
    }
	if (isset($_POST['btn-check-status'])) {
		set_help();
		check_stat();
    }
	if (isset($_POST['btn-status'])) {
		set_help(true);
    }



}
/*}}}*/

main();
?>
