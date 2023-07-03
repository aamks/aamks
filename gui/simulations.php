<?php

session_name('aamks');
require_once("inc.php"); 

function listing() {/*{{{*/
	extract($_SESSION['main']);
	$sim="$project_id/$scenario_id";
	echo "<form method='POST' action=''>
			<input type='submit' name='btn-beck' value='Launch post-processing'>
		</form>";


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
	echo "&nbsp; &nbsp; Get your detailed data: <a href=$f/picts/data.csv><wheat>Download CSV</wheat></a>";
    echo "&nbsp;&nbsp;Postprocess finished at: ";
    if (array_key_exists('pp_time', $_SESSION)) {
        echo date('Y-m-d H:i:s', $_SESSION['pp_time']);
    } else {
        echo 'No time of last postprocessing found';
        }
}
/*}}}*/

/*}}}*/
function make_pictures() {/*{{{*/
	$f=$_SESSION['main']['working_home'];

	/*Generate pictures with using beck.py script*/
	$aamks=getenv("AAMKS_PATH");
	
	$cmd="cd $aamks/results; python3 beck_new.py $f 2>&1";
    // Output a 'waiting message'
	$z=shell_exec("$cmd");
    $_SESSION['pp_time'] =  $_SERVER['REQUEST_TIME'];
    $URL = "/aamks/simulations.php";
    echo '<META HTTP-EQUIV="refresh" content="0;URL=' . $URL . '">';
/*}}}*/
}

function prevNext($k, $t, $d) {
    return ($r=($k+$d)%$t)>=0?$r:$r+=$t;
}

function show_pictures() {/*{{{*/
	$f=$_SESSION['main']['working_home'];

	$counter = 1;
    $pictures_list = array(
        array('pie_fault','The share of iterations with failure of safety systems (at least one fatality)'),
        array('pdf_fn','Fatalities histogram (PDF)'), 
        array('fn_curve','FN curve for the scenario'), 
        array('dcbe','Cumulative distribution function of ASET'), 
        array('wcbe','Cumulative distribution function of RSET'), 
        array('overlap','Histograms and kernel density functions of RSET and ASET'), 
        array('min_hgt','Cumulative distribution function of minimal hot layer height in '), 
        array('min_hgt_cor','Cumulative distribution function of minimal hot layer height on the evacuation routes'), 
        array('max_temp','Cumulative distribution function of maximal temperature'), 
        array('min_vis','Cumulative distribution function of the minimal visibility'), 
        array('min_vis_cor','Cumulative distribution function of the minimal visibility on the evacuation routes'), 
        //array('tree_f','Event tree for fatalities due to toxic gases')
    );

    // find how many heatmaps are in picts
        
        $path = $f."/picts/";
		$cmd = "cd $path; ls -d floor* 2>&1";
		$result=shell_exec("$cmd");
		$result_array=explode("\n",$result);
	    //$floor = 0;
		foreach ($result_array as $pic) {
			if (strpos($pic, "floor") !== false) {
	            array_push($pictures_list, array(substr($pic, 0, -4), 'Spatial distribution of total FED absorbtion' ));//(level'.$floor.')'));
	            //$floor += 1;
	        }
	    }
   
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
        
        echo "<br><br><br><font size=4><strong>Figures</strong></font><br><br>";
        echo '<br><a href="simulations.php?pid='.prevNext($k, $total, -1).'"><button>', $button_left, '</button></a>';
        echo '    <a href="simulations.php?pid='.prevNext($k, $total, 1).'"><button>', $button_right, '</button></a>';
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


    // to be loaded from txt file in the future
    $txt_file = file_get_contents($f."/picts/data.txt");
    $rows = explode("\n", $txt_file);
    $data = array();
    for($i = 0; $i < count($rows); ++$i) {
        if (!startsWith($rows[$i], "#")){
            $data[] = $rows[$i];
        };
    };

    echo "<br><br><br><font size=4><strong>Risk indices</strong></font><br><br>";

	echo "<form method='POST' action=''>
		<input autocomplete=off type=text placeholder='fire probability [1/year]' name=fire_prob required  title='fire probability [1/year]'> 
	</form>";

    $ir = $data[0]; //* $fire_prob;
    $wri = $data[1]; //* $fire_prob;
    $awr = $data[2]; //* $fire_prob;
    $sri = $data[3]; //* $fire_prob;


    echo "<table><tr><th><strong>Parameter</strong></th><th><strong>Unit</strong></th><th><strong>Value</strong></th></tr>";
    echo "<tr><td>Individual risk</td><td>-</td><td>".round($ir, 5)."</td>";
    echo "<tr><td>Societal risk (WRI)</td><td>fatalities</td><td>".round($wri, 5)."</td>";
    echo "<tr><td>Societal risk (AWR)</td><td>fatalities</sup></td><td>".round($awr, 5)."</td>";
    echo "<tr><td>Societal risk (SRI)</td><td>(fatalities+fatalities<sup>2</sup>)/m<sup>2</sup></td><td>".round($sri, 5)."</td>";
    echo "</table>";

    echo "<br><br><br><font size=4><strong>Multisimulation output</strong></font><br><br>";

    $rset = explode(",", $data[4]);
    $aset = explode(",", $data[5]);
    $ovl = $data[6];
    $max_hgt = explode(",", $data[7]);
    $min_lvl = explode(",", $data[8]);
    $min_vis = explode(",", $data[9]);

    echo "<table><tr><th><strong>Parameter</strong></th><th><strong>Mean value</strong></th><th><strong>Std Dev</strong></th><th><strong>Unit</strong></th></tr>";
    echo "<tr><td>RSET</td><td>".round($rset[0], 1)."</td><td>".round($rset[1], 1)."</td><td>s</td>";
    echo "<tr><td>ASET</td><td>".round($aset[0], 1)."</td><td>".round($aset[1], 1)."</td><td>s</td>";
    echo "<tr><td>Overlapping index</td><td>".round($ovl, 4)."</td><td></td><td>s</td>";
    echo "<tr><td>Maximum temperature</td><td>".round($max_hgt[0], 1)."</td><td>".round($max_hgt[1], 1)."</td><td>°C</td>";
    echo "<tr><td>Minimum neutral plane level</td><td>".round($min_lvl[0], 1)."</td><td>".round($min_lvl[1], 1)."</td><td>cm</td>";
    echo "<tr><td>Minimum visibility</td><td>".round($min_vis[0], 3)."</td><td>".round($min_vis[1], 3)."</td><td>m</td>";
    echo "</table>";

}
/*}}}*/

function main() {/*{{{*/
	$_SESSION['nn']->htmlHead("Multisimulation results");
	$_SESSION['nn']->menu('Multisimulation results');
	listing();
	status();
	show_pictures();

	if (isset($_POST['btn-beck'])) {
		make_pictures();
    }

}
/*}}}*/

main();
?>
