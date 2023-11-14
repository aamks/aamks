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
    '23' => 'Unable to read CFAST results',
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
	    <input type='submit' style='font-size:12pt; font-weight: bold' name='btn-check-conv-cur' value='Calc uncertainties'><withHelp>?<help>Show convergence of individual risk<br>and perform sensitivity analysis</help></withHelp>&nbsp;&nbsp;
	    <input type='submit' style='font-size:10pt; font-weight: bold' name='btn-status' value='Status table'><br>
	    <input type='submit' style='font-size:12pt; font-weight: bold' name='btn-retry' value='Retry'><withHelp>?<help>Retry jobs finished with status 1</help></withHelp>&nbsp;&nbsp;
        </form>
<form method='POST' action=''>
	Developers only:&nbsp;
	<input autocomplete=off type=text placeholder='project ID' required name=project title='project ID to be checked'> 
	<input autocomplete=off type=text placeholder='scenario ID' required name=scenario title='scenario ID to be checked'> 
	    <input type='submit' style='font-size:10pt; font-weight: bold' name='btn-check-status' value='Check status'>
	    <input type='submit' style='font-size:10pt; font-weight: bold' name='btn-halt' value='Remove jobs'></form><br>";
}

function query_cur() {
    if(!array_key_exists('nn', $_SESSION))
    {
        header("Location: login.php?session_finished_information=1");
    }
	$r = $_SESSION['nn']->query("SELECT iteration, status, job_id FROM simulations WHERE scenario_id=$1 AND project=$2 AND job_id IS NOT NULL AND job_id != '' ORDER BY modified DESC", array($_SESSION['main']['scenario_id'], $_SESSION['main']['project_id'] ));
	echo $_SESSION['main']['project_id']."/".$_SESSION['main']['scenario_id'];
	return $r;
}


function query_any() {
    if(!array_key_exists('nn', $_SESSION))
    {
        header("Location: login.php?session_finished_information=1");
    }
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
    '23' => 0,
    '30' => 0,
    '31' => 0,
    '32' => 0,
    '33' => 0,
    '90' => 0,
    '91' => 0,
    '' => 0,
    'in progress' => 0,
];
    $sum = 0;
    echo "<table><tr><th>Detailes</th><th>Summary</th></tr><tr><td valign='top'>";
	echo "<table><tr><th>Iteration</th><th>Status</th><th>Description</th></tr>";

	foreach ($r as $element) {
		echo "<tr>";
		echo "<td align='center'>".$element['iteration']."</td>";

        if ($element['status'] > 1000 & $element['status']<1100 ){
            $sum += 1;
            $statuses['in progress'] += 1;
            echo "<td>".($element['status']-1000)."%</td><td>Job in progress</td></tr>"; // Add a line break after each inner array
        }
        elseif($element['status'] == 1100){
                echo "<td>".($element['status']-1000)."%</td><td>Job finished</td></tr>";
        }
        else{
			$statuses[$element['status']] += 1;
			$sum += 1;
			echo "<td>".$element['status']."</td><td>".$_SESSION['codes'][$element['status']]."</td></tr>"; // Add a line break after each inner array
		}

	
    }
    echo "</table></td>"; // Add a line break after each inner array
	echo "<td valign='top'><table><tr><td><strong>SUM</strong><td>$sum</td></tr><tr><th>Code</th><th>Number of iterations</th></tr>";
	foreach ($statuses as $c => $d) { echo "<tr><td>$c</td><td>$d</td></tr>";}
    echo "</table>";
    echo "</td></tr></table>";
}


function stop($r) {
    $sum=0;
    echo "<table><tr><th>Details</th><th>Summary</th></tr><tr><td valign='top'>";
	echo "<table><tr><th>Iteration</th><th>Halted?</th><th>Status</th></tr>";

	foreach ($r as $element) {
        echo "<tr><td>".$element['iteration']."</td>";
        if ($element['status']==''){
            $cmd = "gearadmin --cancel-job=".$element['job_id'];
            $z=shell_exec("$cmd");
            echo "<td align='center'>$z</td><td></td>";
            if(!array_key_exists('nn', $_SESSION))
            {
                header("Location: login.php?session_finished_information=1");
            }
            $r=$_SESSION['nn']->query("UPDATE simulations SET status='90' WHERE job_id=$1", array($element['job_id'] ));
            $sum += 1;
        }else{
            echo "<td align='center'>NO</td><td align='center'>".$element['status']."</td>";
        }
    echo "<tr>";
    }
    echo "</table></td><td valign='top'>$sum jobs removed from queue</td></tr></table>";
}

function runPP() {
	$f=$_SESSION['main']['working_home'];
	$aamks=getenv("AAMKS_PATH");

	$cmd="python3 $aamks/results/beck_new.py $f 2>&1";
	$z=shell_exec("$cmd");
	echo "Postprocess finished<br>";
}

function retry() {
   $f=$_SESSION['main']['working_home'];
   $aamks=getenv("AAMKS_PATH");
   $cmd="cd $aamks/manager; python3 init.py $f 2>&1";

   $z=shell_exec("$cmd");
   echo "$z jobs retried<br>";
}

function prevNext($k, $t, $d) {
    return ($r=($k+$d)%$t)>=0?$r:$r+=$t;
}

function show_picture($f, $pictures_list) {
   
    //total array size
    $total = sizeof($pictures_list);

    //current position in the array
    $k = 0;

    //displays left and right navigation buttons which execute prev/nextImage functions
    $button_left='<<< Previous figure';
    $button_right='Next figure >>>';


    //displays the current image
    if(isset($_GET['pid'])){
        $k = $_GET['pid'];
    }else{
        $_GET['pid'] = $k;
        }
    if(isset($_GET['comp'])){
        $j = "&comp=".$_GET['comp'];
    }else{
        $j = "";
        }
        
        echo "<br><br><br><font size=4><strong>Uncertainties</strong></font><br><br>";
        echo '<br><a href="halt.php?pid='.prevNext($k, $total, -1).$j.'"><button>', $button_left, '</button></a>';
        echo '    <a href="halt.php?pid='.prevNext($k, $total, 1).$j.'"><button>', $button_right, '</button></a>';
        $file=$f."/picts/".$pictures_list[$k][0].".png";

	if (!file_exists($file)) {
		echo '<br><br><font size=4>No data available. Try <strong>Calc uncertainties</strong> button.</font>';
		if ($_GET['pid'] > 1){
			echo '<br><br><font size=2>At least 300 iterations finished correctly are required to calculate
			       	Sobol indices.</font>';
		}
	}else{
		$size_info=getimagesize($file);
		$data64=shell_exec("base64 $file");
		echo "<br><p>Figure ". ($k+1) .". <strong>".$pictures_list[$k][1]."</strong></p>";
		echo "<img class='results-pictures' style='width:".(0.8*$size_info[0])."px;height:".(0.8*$size_info[1])."px;' src='data:image/png;base64, $data64'/>";
	}

}
function check_conv_current() {/*{{{*/
        $f=$_SESSION['main']['working_home'];
	$path = $f."/picts/";

        $pictures_list = array(
            array('conv_individual','Convergence of individual risk in subsequent iterations'),
            array('spearman','Spearman rank correlation of parameters'),
            array('sobol_ST','Total  contribution of parameters'),
            array('sobol_S','Total contribution of particular  terms'),
	    array('sobol_Sa','Uncorrelated contribution of particular  terms'),
            array('sobol_Sb','Correlated contribution of particular  terms'),
        );

	//echo "<table><tr><td valign='top'>";
	show_picture($f, $pictures_list);
	//echo "</td><td valign='top'>";
	#show_picture($f, $pictures_list[1]);
	//echo "</td></tr></table>";
}


function main() {/*{{{*/
    if(!array_key_exists('nn', $_SESSION))
    {
        header("Location: login.php?session_finished_information=1");
    }
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
    }  elseif (isset($_POST['btn-retry'])) {
       retry();
    }else{
	    check_conv_current();
    }




}
/*}}}*/

main();
?>
