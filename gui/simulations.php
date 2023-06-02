<?php

session_name('aamks');
require_once("inc.php"); 

function listing() {/*{{{*/
	extract($_SESSION['main']);
	$sim="$project_id/$scenario_id";
	echo "<form method='POST' action=''>
			<input type='submit' name='btn-beck' value='Postprocess'>
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
	echo "&nbsp; &nbsp; Get your detailed data: <a href=$f/picts/data.csv><wheat>Data</wheat></a>";
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
        array('min_hgt','Cumulative distribution function of minimal hot layer height in '), 
        array('min_hgt_cor','Cumulative distribution function of minimal hot layer height on the evacuation routes'), 
        array('max_temp','Cumulative distribution function of maximal temperature'), 
        array('min_vis','Cumulative distribution function of the minimal visibility'), 
        array('min_vis_cor','Cumulative distribution function of the minimal visibility on the evacuation routes'), 
        //array('tree_f','Event tree for fatalities due to toxic gases')
    );

	foreach($pictures_list as $picture) {
		$file=$f."/picts/".$picture[0].".png";
		$size_info=getimagesize($file);
		$data64=shell_exec("base64 $file");
		echo "<img class='results-pictures' style='width:".$size_info[0]."px;height:".$size_info[1]."px;' src='data:image/png;base64, $data64'/>";
		echo "<p>Figure ". $counter .". <strong>".$picture[1]."</strong></p>";
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

    echo "<br>Results loaded at: ";
    echo  date('Y-m-d H:i:s', $_SERVER['REQUEST_TIME']);

    // to be loaded from txt file in the future
    echo "<br><br><strong>RESULTS SUMMARY</strong><br>";
    echo "<table><tr><th><strong>Parameter</strong></th><th><strong>Unit</strong></th><th><strong>Value</strong></th></tr>";
    echo "<tr><td>Individual risk</td><td>fatalities/y</td><td>???</td>";
    echo "<tr><td>Societal risk (BSI)</td><td>fatalities/y</td><td>???</td>";
    echo "<tr><td>Societal risk (AWR)</td><td>fatalities/m2/y</td><td>???</td>";
    echo "<tr><td>Societal risk (SRI)</td><td>pers/m2/y</td><td>???</td>";
    echo "</table>";

}
/*}}}*/

function main() {/*{{{*/
	$_SESSION['nn']->htmlHead("Postprocess");
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
