<?php

session_name('aamks');
require_once("inc.php"); 

function listing() {/*{{{*/
	extract($_SESSION['main']);
	$sim="$project_id/$scenario_id";
	echo "<form method='POST' action=''>
			<input type='submit' name='btn-beck' value='Launch post-processing'>
		</form>";
	echo "<form method='POST' action=''>
		<input type='submit' name='btn-images' value='Reload images'>
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
    show_data();
    show_pictures();

/*}}}*/
}

function show_pictures() {/*{{{*/
	$f=$_SESSION['main']['working_home'];

	$counter = 1;
    $pictures_list = array(
        array('pie_fault','The share of iterations with failure of safety systems (at least one fatality)'),
        array('pdf_fn','Fatalities histogram'), 
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

    echo "<br><br><br><font size=5><strong>Figures</strong></font><br><br>";

	foreach($pictures_list as $picture) {
		$file=$f."/picts/".$picture[0].".png";
		$size_info=getimagesize($file);
		$data64=shell_exec("base64 $file");
		echo "<img class='results-pictures' style='width:".$size_info[0]."px;height:".$size_info[1]."px;' src='data:image/png;base64, $data64'/>";
		echo "<p>Figure ". $counter .". <strong>".$picture[1]."</strong></p><br>";
		$counter += 1;
	}
	$path = $f."/picts/";
	$cmd = "cd $path; ls -d floor* 2>&1";
	$result=shell_exec("$cmd");
	$result_array=explode("\n",$result);
	foreach ($result_array as $pic) {
		if (strpos($pic, "floor") !== false) {
			$file=$f."/picts/".$pic;
			$size_info=getimagesize($file);
			$data64=shell_exec("base64 $file");
			echo "<img class='results-pictures' style='width:".$size_info[0]."px;height:".$size_info[1]."px;' src='data:image/png;base64, $data64'/>";
			echo "<p>Figure ". $counter .". <strong>Spatial distribution of total FED absorbtion</strong></p>";
			$counter += 1;
		}
	}
}
function show_data() {/*{{{*/
	$f=$_SESSION['main']['working_home'];
    function startsWith( $haystack, $needle ) {
     $length = strlen( $needle );
     return substr( $haystack, 0, $length ) === $needle;
}

    echo "<br>Results loaded at: ";
    echo  date('Y-m-d H:i:s', $_SERVER['REQUEST_TIME']);

    // to be loaded from txt file in the future
    $txt_file = file_get_contents($f."/picts/data.txt");
    $rows = explode("\n", $txt_file);
    $data = array();
    for($i = 0; $i < count($rows); ++$i) {
        if (!startsWith($rows[$i], "#")){
            $data[] = $rows[$i];
        };
    };

    echo "<br><br><br><font size=5><strong>Risk indices</strong></font><br><br>";

	echo "<form method='POST' action=''>
		<input autocomplete=off type=text placeholder='fire probability [1/year]' name=fire_prob required  title='fire probability [1/year]'> 
	</form>";

    $ir = $data[0]; //* $fire_prob;
    $wri = $data[1]; //* $fire_prob;
    $awr = $data[2]; //* $fire_prob;
    $sri = $data[3]; //* $fire_prob;


    echo "<table><tr><th><strong>Parameter</strong></th><th><strong>Unit</strong></th><th><strong>Value</strong></th></tr>";
    echo "<tr><td>Individual risk</td><td>-</td><td>".$ir."</td>";
    echo "<tr><td>Societal risk (WRI)</td><td>fatalities</td><td>".$wri."</td>";
    echo "<tr><td>Societal risk (AWR)</td><td>fatalities</sup></td><td>".$awr."</td>";
    echo "<tr><td>Societal risk (SRI)</td><td>(fatalities+fatalities<sup>2</sup>)/m<sup>2</sup></td><td>".$sri."</td>";
    echo "</table>";

    echo "<br><br><br><font size=5><strong>Multisimulation output</strong></font><br><br>";

    $rset = explode(",", $data[4]);
    $aset = explode(",", $data[5]);
    $ovl = $data[6];
    $max_hgt = explode(",", $data[7]);
    $min_lvl = explode(",", $data[8]);
    $min_vis = explode(",", $data[9]);

    echo "<table><tr><th><strong>Parameter</strong></th><th><strong>Mean value</strong></th><th><strong>Std Dev</strong></th><th><strong>Unit</strong></th></tr>";
    echo "<tr><td>RSET</td><td>".$rset[0]."</td><td>".$rset[1]."</td><td>s</td>";
    echo "<tr><td>ASET</td><td>".$aset[0]."</td><td>".$aset[1]."</td><td>s</td>";
    echo "<tr><td>Overlapping index</td><td>".$ovl."</td><td></td><td>s</td>";
    echo "<tr><td>Maximum temperature</td><td>".$max_hgt[0]."</td><td>".$max_hgt[1]."</td><td>°C</td>";
    echo "<tr><td>Minimum neutral plane level</td><td>".$min_lvl[0]."</td><td>".$min_lvl[1]."</td><td>cm</td>";
    echo "<tr><td>Minimum visibility</td><td>".$min_vis[0]."</td><td>".$min_vis[1]."</td><td>m</td>";
    echo "</table>";

}
/*}}}*/

function main() {/*{{{*/
	$_SESSION['nn']->htmlHead("Multisimulation results");
	$_SESSION['nn']->menu('Multisimulation results');
	listing();
	status();
	//show_pictures();
    //make_pictures();

	if (isset($_POST['btn-beck'])) {
		make_pictures();
	}

	if (isset($_POST['btn-images'])) {
        show_data();
		show_pictures();
	}
}
/*}}}*/

main();
?>
