<?php

session_name('aamks');
require_once("inc.php"); 

function listing() {/*{{{*/
	extract($_SESSION['main']);
	$sim="$project_id/$scenario_id";
    //echo "<a class=blink href=?make_pictures>Run postprocess!</a>";
    echo "<form method=POST><input autocomplete=off type=submit name=postprocess value='Run postprocess'><input type=submit value='Reload pictures'></form>";

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
	if(empty($_POST['postprocess'])) { return; }
	$f=$_SESSION['main']['working_home'];

	/*Generate pictures with using beck.py script*/
	$aamks=getenv("AAMKS_PATH");
	
	$cmd="cd $aamks/results; python3 beck_new.py $f 2>&1"; 
    // Output a 'waiting message'

	$z=shell_exec("$cmd");
/*}}}*/
}

function show_pictures() {/*{{{*/
	$f=$_SESSION['main']['working_home'];

	$counter = 1;
    $pictures_list = array(
        array('pie_fault','The share of scenario with failure of safety systems (at least one dead)'),
        array('pdf_fn','Probability density function of deaths'), 
        array('fn_curve','FN curve of the building'), 
        array('dcbe','Cumulative distribution function of ASET'), 
        array('wcbe','Cumulative distribution function of RSET'), 
        array('min_hgt','Cumulative distribution function of minimal hot layer height'), 
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
#	$path = $f."/picts/";
#	$cmd = "cd $path; ls -d floor* 2>&1";
#	$result=shell_exec("$cmd");
#	$result_array=explode("\n",$result);
#	foreach ($result_array as $pic) {
#		if (strpos($pic, "floor") !== false) {
#			$file=$f."/picts/".$pic;
#			$size_info=getimagesize($file);
#			$data64=shell_exec("base64 $file");
#			echo "<img class='results-pictures' style='width:".$size_info[0]."px;height:".$size_info[1]."px;' src='data:image/png;base64, $data64'/>";
#			echo "<p>Figure ". $counter .". <strong>".$pic." Avarage fed growth on the floor divided into cells </strong></p>";
#			$counter += 1;
#		}
#	}
}
/*}}}*/


function main() {/*{{{*/
	$_SESSION['nn']->htmlHead("Simulations");
	$_SESSION['nn']->menu('Manage simulations');
	listing();
	status();
	show_pictures();
    make_pictures();
}
/*}}}*/

main();
?>
