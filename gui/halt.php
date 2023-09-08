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
    '' => 'Job submitted. No data has been received from worker yet',
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
        <input type='submit' style='font-size:12pt; font-weight: bold' name='btn-halt-cur' value='Remove jobs'><withHelp>?<help>Remove current scenario jobs from the queue</help></withHelp>&nbsp;
	    <input type='submit' style='font-size:12pt; font-weight: bold' name='btn-check-status-cur' value='Check status'><withHelp>?<help>Check what is the status of this scenario iterations</help></withHelp>&nbsp;&nbsp;
	    <input type='submit' style='font-size:12pt; font-weight: bold' name='btn-check-conv-cur' value='Check convergence'><withHelp>?<help>Check what is the status of this scenario iterations</help></withHelp>&nbsp;&nbsp;
	    <input type='submit' style='font-size:10pt; font-weight: bold' name='btn-status' value='Status table'><br>
        </form>
<form method='POST' action=''>
	Developers only:&nbsp;
	<input autocomplete=off type=text placeholder='project ID' required name=project title='project ID to be checked'> 
	<input autocomplete=off type=text placeholder='scenario ID' required name=scenario title='scenario ID to be checked'> 
	    <input type='submit' style='font-size:10pt; font-weight: bold' name='btn-check-status' value='Check status'>
	    <input type='submit' style='font-size:10pt; font-weight: bold' name='btn-halt' value='Remove jobs'></form><br>";
}

function query_cur() {
	$r = $_SESSION['nn']->query("SELECT iteration, status, job_id FROM simulations WHERE scenario_id=$1 AND project=$2 AND job_id IS NOT NULL AND job_id != '' ORDER BY modified DESC", array($_SESSION['main']['scenario_id'], $_SESSION['main']['project_id'] ));
	echo $_SESSION['main']['project_id']."/".$_SESSION['main']['scenario_id'];
	return $r;
}


function query_any() {
	$r = $_SESSION['nn']->query("SELECT iteration, status, job_id FROM simulations WHERE scenario_id=$1 AND project=$2 AND job_id IS NOT NULL AND job_id != '' ORDER BY modified DESC", array($_POST['scenario'], $_POST['project'] ));
	echo $_POST['project']."/".$_POST['scenario'];
	return $r;
}

function check_stat($r) {
	$statuses = [
    '0' => 0,
    '1' => 0,
    '10' => 0,
    '11' => 0,
    '12' => 0,
    '13' => 0,
    '14' => 0,
    '15' => 0,
    '16' => 0,
    '17' => 0,
    '20' => 0,
    '21' => 0,
    '22' => 0,
    '30' => 0,
    '31' => 0,
    '32' => 0,
    '33' => 0,
    '90' => 0,
    '91' => 0,
    '' => 0,
    'halted' => 0,
];
    $sum = 0;
    echo "<table><tr><th>Detailes</th><th>Summary</th></tr><tr><td valign='top'>";
	echo "<table><tr><th>Iteration</th><th>Status</th><th>Description</th></tr>";

	foreach ($r as $element) {
		echo "<tr>";
		echo "<td align='center'>".$element['iteration']."</td>";
	
    $statuses[$element['status']] += 1;
    $sum += 1;
    echo "<td>".$element['status']."</td><td>".$_SESSION['codes'][$element['status']]."</td></tr>"; // Add a line break after each inner array
    }
    echo "</table></td>"; // Add a line break after each inner array
	 echo "<td valign='top'><table><tr><td><strong>SUM</strong><td>$sum</td></tr><tr><th>Code</th><th>Number of iterations</th></tr>";
		foreach ($statuses as $c => $d) { echo "<tr><td>$c</td><td>$d</td></tr>";}
    echo "</table>";
    echo "</td></tr></table>";
}


function stop($r) {
    $sum=0;
    echo "<table><tr><th>Detailes</th><th>Summary</th></tr><tr><td valign='top'>";
	echo "<table><tr><th>Job ID</th><th>Halted?</th><th>Status</th></tr>";

	foreach ($r as $element) {

    $cmd = "gearadmin --cancel-job=".$element['job_id'];

    // Output a 'waiting message'
        echo "<tr><td>".$element['iteration']."</td>";
	$z=shell_exec("$cmd");
	if ($z == null) { 
		$rr=$_SESSION['nn']->query("SELECT status FROM simulations WHERE job_id=$1", array($element['job_id'] ))[0];
		foreach ($rr as $foo) {	echo "<td align='center'>NO</td><td align='center'>$foo</td>";}
	}
	else{	echo "<td align='center'>$z</td><td></td>"; 
	$r=$_SESSION['nn']->query("UPDATE simulations SET status='90' WHERE job_id=$1", array($element['job_id'] ));
    $sum += 1;
	}
    
    //echo "<td>".$_SESSION['codes'][$element]."</td></tr>"; // Add a line break after each inner array
    echo "<tr>";
}
    echo "</table></td><td valign='top'>$sum jobs removed from queue</td></tr></table>"; // Add a line break after each inner array

}

function runPP() {
	$f=$_SESSION['main']['working_home'];
	$aamks=getenv("AAMKS_PATH");

	$cmd="cd $aamks/results; python3 beck_new.py $f 2>&1";

	// Output a 'waiting message'
	$z=shell_exec("$cmd");
	echo "Postprocess finished<br>";
}

function check_conv_current() {/*{{{*/
        $f=$_SESSION['main']['working_home'];
	$path = $f."/picts/";

        $pictures_list = array(
            array('conv_individual','Convergence of individual risk in subsequent iterations')
        );

        $file=$f."/picts/".$pictures_list[0][0].".png";
	if (!file_exists($file)) {
		echo '<br><br><font size=4>No convergence data available. Try <strong>Check convergence</strong> button.</font>';
		return False;
	}
        $size_info=getimagesize($file);
        $data64=shell_exec("base64 $file");
        echo "<br><font size=4>".$pictures_list[0][1]."</font>";
        echo "<img class='results-pictures' style='width:".($size_info[0]*.8)."px;height:".($size_info[1]*.8)."px;' src='data:image/png;base64, $data64'/>";


}


function main() {/*{{{*/
	$_SESSION['nn']->htmlHead("Manage jobs");
	$_SESSION['nn']->menu('Manage jobs');

	listing();
	//if halt stop()
	if (isset($_POST['btn-halt'])) {
		set_help();
		stop(query_any());
	}
	elseif (isset($_POST['btn-halt-cur'])) {
		set_help();
		stop(query_cur());
    }
	elseif (isset($_POST['btn-check-status'])) {
		set_help();
		check_stat(query_any());
    }
	elseif (isset($_POST['btn-check-status-cur'])) {
		set_help();
		check_stat(query_cur());
    }
	elseif (isset($_POST['btn-check-conv-cur'])) {
		runPP();
		check_conv_current();
    }	elseif (isset($_POST['btn-status'])) {
		set_help(true);
    }else{
	    check_conv_current();
    }




}
/*}}}*/

main();
?>
