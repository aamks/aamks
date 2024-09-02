<?php

session_name('aamks');
require_once("inc.php"); 

function listing() {/*{{{*/
    extract($_SESSION['main']);
    $path=$_SESSION['main']['working_home'];
    $exploded = explode('/', $path);
	$f = implode('/', array_slice($exploded, 0, -1));
    $directories = glob($f . '/_comp/*' , GLOB_ONLYDIR);
    $r=$_SESSION['nn']->query("SELECT scenario_name FROM scenarios WHERE project_id=$1 ORDER BY modified DESC", array($_SESSION['main']['project_id']));
	echo "<form method='POST' action=''>
			<input type='submit' style='font-size:12pt; font-weight: bold' name='btn-beck' value='Launch post-processing'>
            <input type='submit' style='font-size:10pt; font-weight: bold' name='btn-log' value='Check log'>
            <br><br> Scenarios to be compared:";
        foreach ($r as $s) {
            $scenario = $s['scenario_name'];
            echo "&nbsp;<input type='checkbox' id=$scenario name='comp[]' value=$scenario><label>$scenario</label>";
        }
            echo "<br><input type='submit' style='font-size:10pt; font-weight: bold' name='btn-comp' value='Compare scenarios'></form>";
        
        echo "<a href='simulations.php'><button>Results $scenario_name</button></a>";
        foreach ($directories as $comp_path){
            $scenarios_name = substr($comp_path, strrpos($comp_path, '/')+1);
            $comp_link = str_replace("-", "<>", $scenarios_name);
            echo "<a href='?comp=$comp_link'><button>Results $scenarios_name</button></a>";
        }
}
/*}}}*/
function status() {/*{{{*/
	extract($_SESSION['main']);
	$f=$_SESSION['main']['working_home'];
	$f = substr($f, strpos($f, '/', 1));
	$r=$_SESSION['nn']->query("SELECT count(*) AS finished FROM simulations WHERE project = $project_id and scenario_id = $scenario_id and dcbe_time is not null");
	$finished=$r[0]['finished'];
	$r=$_SESSION['nn']->query("SELECT count(*) AS total FROM simulations WHERE project = $project_id and scenario_id = $scenario_id");
	$total=$r[0]['total'];
	echo "<br>Complete: $finished of $total";
    echo "&nbsp;&nbsp; <br>Postprocess finished at: ";
    if (array_key_exists('pp_time', $_SESSION)) {
        echo date('Y-m-d H:i:s', $_SESSION['pp_time']);
    } else {
        echo 'No time of last postprocessing found';
        }
}
/*}}}*/
function downloads() {/*{{{*/
	$f=$_SESSION['main']['working_home'];
    if (isset($_GET['comp'])){ 
        $f = substr($f, strpos($f, '/', 1));
        $f = substr($f, 0, strrpos($f, '/'));
        $scens = explode('<>', $_GET['comp']);
        $dir = implode('-', $scens);
        $f = $f."/_comp/".$dir;
        echo "<br><br><br><font size=4><strong>Download results</strong></font><br><br>";
        echo "&nbsp; &nbsp;  <button onclick=checkUrl('$f/picts/report.pdf')>Report (.PDF)</button>";
        echo "&nbsp; &nbsp;  <button onclick=checkUrl('$f/picts/txt.zip')>Summary TXT files (.ZIP)</button>";
        echo "&nbsp; &nbsp;  <button onclick=checkUrl('$f/picts/picts.zip')>Pictures (.ZIP)</button>";
        echo "&nbsp; &nbsp;  <button onclick=checkUrl('$f/picts/csv.zip')>Detailed CSV databases (.ZIP)</button>";
        echo "&nbsp; &nbsp;  <button onclick=checkUrl('$f/picts/data.zip')>Full results (.ZIP)</button>";
    }else{
        $f = substr($f, strpos($f, '/', 1));
        echo "<br><br><br><font size=4><strong>Download results</strong></font><br><br>";
        echo "&nbsp; &nbsp;  <button onclick=checkUrl('$f/picts/report.pdf')>Report (.PDF)</button>";
        echo "&nbsp; &nbsp;  <button onclick=checkUrl('$f/picts/data.txt')>Summary file (.TXT)</button>";
        echo "&nbsp; &nbsp;  <button onclick=checkUrl('$f/picts/picts.zip')>Pictures (.ZIP)</button>";
        echo "&nbsp; &nbsp;  <button onclick=checkUrl('$f/picts/data.csv')>Detailed database (.CSV)</button>";
        echo "&nbsp; &nbsp;  <button onclick=checkUrl('$f/picts/data.zip')>Full results (.ZIP)</button>";
    }
}
/*}}}*/
function last_log(){/*{{{*/
	$f=$_SESSION['main']['working_home'];

    $cmd = "tail -10 $f/aamks.log";
	$z=shell_exec("$cmd");
    echo "<br><br><br><font size=4><strong>Last logs</strong></font><br><br>";
    echo nl2br($z);
    $_POST['btn-log'] = False;
}
function compare() {/*{{{*/
	$f=$_SESSION['main']['working_home'];
    $scens = implode(' ', $_POST['comp']);
    run_beck_new($f, $scens);
/*}}}*/
}
function make_pictures() {/*{{{*/
	$f=$_SESSION['main']['working_home'];
    echo run_beck_new($f);
/*}}}*/
}
function prevNext($k, $t, $d) {
    return ($r=($k+$d)%$t)>=0?$r:$r+=$t;
}
function show_results() {/*{{{*/
    if (isset($_GET['comp'])){ 
        $scens = explode('<>', $_GET['comp']);
        $dir = implode('-', $scens);
        $text = implode(', ', $scens);
        $f = $_SESSION['main']['user_home']."/".$_SESSION['main']['project_name']."/_comp/".$dir;

        $pictures_list = array(
            array('pie_fault','The share of iterations with failure of safety systems (at least one fatality) for scenarios: '.$text),
            array('pdf_fn','Fatalities histograms (PDF) for scenarios: '.$text), 
            array('fn_curve','FN curves for scenarios: '.$text), 
            array('dcbe_cdf','Cumulative distribution function of ASET for scenarios: '.$text), 
            array('wcbe_cdf','Cumulative distribution function of RSET for scenarios: '.$text), 
            array('min_hgt_cdf','Cumulative distribution function of minimal hot layer height for scenarios: '.$text), 
            array('min_hgt_cor_cdf','Cumulative distribution function of minimal hot layer height on the evacuation routes for scenarios: '.$text), 
            array('max_temp_cdf','Cumulative distribution function of maximal temperature for scenarios: '.$text), 
            array('min_vis_cdf','Cumulative distribution function of the minimal visibility for scenarios: '.$text), 
            array('min_vis_cor_cdf','Cumulative distribution function of the minimal visibility on the evacuation routes for scenarios: '.$text), 
        );
    }else{
        $f=$_SESSION['main']['working_home'];
	$path = $f."/picts/";
	if (!file_exists($path.'data.txt')) {
		echo '<br><br><font size=4><strong>No data available. Launch postprocessing first.</font></strong>';
		return False;
	}
        $pictures_list = array(
            array('pie_fault','The share of iterations with failure of safety systems (at least one fatality)'),
            array('pdf_fn','Fatalities histogram (PDF)'), 
            array('fn_curve','FN curve for the scenario'), 
            array('dcbe_cdf','Cumulative distribution function of ASET'), 
            array('wcbe_cdf','Cumulative distribution function of RSET'), 
            array('overlap','Probability density functions of RSET and ASET'), 
            array('min_hgt_cdf','Cumulative distribution function of minimal hot layer height'), 
            array('min_hgt_cor_cdf','Cumulative distribution function of minimal hot layer height on the evacuation routes'), 
            array('max_temp_cdf','Cumulative distribution function of maximal temperature'), 
            array('min_vis_cdf','Cumulative distribution function of the minimal visibility'), 
            array('min_vis_cor_cdf','Cumulative distribution function of the minimal visibility on the evacuation routes'), 
        );

        // find how many heatmaps are in picts
            
            $cmd = "cd $path; ls -d floor* 2>&1";
            $result=shell_exec("$cmd");
            $result_array=explode("\n",$result);
            //$floor = 0;
            foreach ($result_array as $pic) {
                if (strpos($pic, "floor") !== false) {
                    array_push($pictures_list, array(substr($pic, 0, -4), 'Spatial distribution of average FED absorbtion in single scenario' ));//(level'.$floor.')'));
                    //$floor += 1;
                }
            }
    }
	downloads();
   
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
        echo "<br><br><br><font size=4><strong>Figures</strong></font><br><br>";
        echo '<br><a href="simulations.php?pid='.prevNext($k, $total, -1).$j.'"><button>', $button_left, '</button></a>';
        echo '    <a href="simulations.php?pid='.prevNext($k, $total, 1).$j.'"><button>', $button_right, '</button></a>';
        $file=$f."/picts/".$pictures_list[$k][0].".png";
        $size_info=getimagesize($file);
        $data64=shell_exec("base64 $file");
        echo "<br><p>Figure ". ($k+1) .". <strong>".$pictures_list[$k][1]."</strong></p>";
        echo "<img class='results-pictures' style='width:".$size_info[0]."px;height:".$size_info[1]."px;' src='data:image/png;base64, $data64'/>";
	show_data();
}
function startsWith( $haystack, $needle ) {
     $length = strlen( $needle );
     return substr( $haystack, 0, $length ) === $needle;
}
function show_data() {/*{{{*/
	$f=$_SESSION['main']['working_home'];

    $heads = array('Individual risk', 'IR RMSE (inc. 95% CI)', 'Societal risk (WRI)', 'Societal risk (AWR)', 'Societal risk (SRI)', 'RSET',
        'ASET', 'Overlapping index', 'Maximum temperature', 'Minimum neutral plane level', 'Minimum visibility');
    $units = array('-', '-', 'fatalities', 'fatalities', '(fatalities+fatalities<sup>2</sup>)/m<sup>2</sup>', 's', 's', 's', '°C', 'cm', 'm');
    $data = array();

    if (isset($_GET['comp'])){
        $scens = explode('<>', $_GET['comp']);
        $dir = implode('-', $scens);
        $f = $_SESSION['main']['user_home']."/".$_SESSION['main']['project_name']."/_comp/".$dir;
        
        //collect data from each scenario TXT
        foreach ($scens as $s){
            $d = array();
            $txt_file = file_get_contents($f."/picts/".$s."_data.txt");
            $rows = explode("\n", $txt_file);
            for($i = 0; $i < count($rows); ++$i) {
                if (!startsWith($rows[$i], "#")){
                    $d[] = $rows[$i];
                };};
            $data[$s] = $d;
        };
    }else{
        //collect data for single scenario
        $scens = array('Value');
        $txt_file = file_get_contents($f."/picts/data.txt");
        $d = array();
        $rows = explode("\n", $txt_file);
        for($i = 0; $i < count($rows); ++$i) {
            if (!startsWith($rows[$i], "#")){
                $d[] = $rows[$i];
            };
            $data['Value'] = $d;
        };
    }
    //Risk indices table
    echo "<br><br><br><font size=4><strong>Risk indices</strong></font><br><br>";
    echo "<table><tr><th><strong>Parameter</strong></th><th><strong>Unit</strong></th>";
    foreach ($scens as $s){echo "<th><strong>".$s."</strong></th>";};
    echo "</tr>";

    for($i = 0; $i < 4; ++$i) {
        echo "<tr><td>".$heads[$i]."</td><td>".$units[$i]."</td>";
        foreach ($data as $d){echo "<td>".round($d[$i], 4)."</td>";};
        echo "</tr>";
    }

    echo "</table>";
    
    //Multisimulation output table
    echo "<br><br><br><font size=4><strong>Multisimulation output</strong></font><br><br>";
    echo "<table><tr><th><strong>Parameter</strong></th><th><strong>Unit</strong></th>";
    foreach ($scens as $s){echo "<th><strong>".$s." mean</strong></th><th><strong>".$s." std dev</strong></th>";};
    echo "</tr>";

    for($i = 5; $i < 11; ++$i) {
        echo "<tr><td>".$heads[$i]."</td><td>".$units[$i]."</td>";
        foreach ($data as $d){
            $d = explode(',', $d[$i]);
            if (count($d) < 2){
                echo "<td>".round($d[0], 2)."</td><td>-</td>";}else{
                echo "<td>".round($d[0], 2)."</td>";
                echo "<td>".round($d[1], 2)."</td>";}}

        echo "</tr>";
    }

    echo "</table>";
}
/*}}}*/

function main() {/*{{{*/
    if(!array_key_exists('nn', $_SESSION))
        {
            header("Location: login.php?session_finished_information=1");
        }
    if (isset($_GET['comp'])){
        $scens = explode('<>', $_GET['comp']);
        $dir = implode('-', $scens);
        $title = implode(', ', $scens);  
        $_SESSION['nn']->htmlHead("Comparison");
        $_SESSION['nn']->menu("Comparison: ".$title);
    }else{
        $_SESSION['nn']->htmlHead("Multisimulation results");
        $_SESSION['nn']->menu('Multisimulation results');
    }

	listing();
	status();

	if (isset($_POST['btn-log'])) {
		last_log();
    }

	show_results();

	if (isset($_POST['btn-beck'])) {
		make_pictures();
    }

	if (isset($_POST['btn-comp'])) {
        compare();
    }
}
/*}}}*/

main();
?>
