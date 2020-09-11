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
	$f=$_SESSION['main']['working_home'];
	$f = substr($f, strpos($f, '/', 1));
	$r=$_SESSION['nn']->query("SELECT count(*) AS finished FROM simulations WHERE project = $project_id and scenario_id = $scenario_id and dcbe_time is not null");
	$finished=$r[0]['finished'];
	$r=$_SESSION['nn']->query("SELECT count(*) AS total FROM simulations WHERE project = $project_id and scenario_id = $scenario_id");
	$total=$r[0]['total'];
	echo "<br>Complete: $finished of $total &nbsp; &nbsp; <wheat>ctrl+r to refresh</wheat>";
	echo "&nbsp; &nbsp; Get your detailed data: <a href=$f/picts/data.csv><wheat>Data</wheat></a>";
}
/*}}}*/

/*}}}*/
function show_pictures() {/*{{{*/
	$f=$_SESSION['main']['working_home'];

	/*Generate pictures with using beck.py script*/
	$aamks=getenv("AAMKS_PATH");
	
	$cmd="cd $aamks/results; python3 beck.py $f 2>&1"; 
	$z=shell_exec("$cmd");

	if (!empty($z)){
		echo "<br><orange>Some charts cannot be created due to the incomplited data</orange>";
	}
	#echo "<br>$z";
	$counter = 1;
	$pictures_list = array(array('pie_fault','The share of scenario with failure of safety systems'), array('lossesdead','Number of scenarios with fatalities with respect to number of peaople affected'), array('lossesheavy','Number of scenarios with heavy injured with respect to number of peaople affected'), array('losseslight','Number of scenarios with heavy injured with respect to number of peaople affected'), array('lossesneglegible','title'), array('ccdf','FN curve'), array('dcbe','Cumulative distribution function of ASET'), array('wcbe','Cumulative distribution function of RSET'), array('height','Cumulative distribution function of minimal hot layer height'), array('hgt_cor','Cumulative distribution function of minimal hot layer heigh on the evacuation routes'), array('temp','Cumulative distribution function of maximal temperature'), array('vis','Cumulative distribution function of the minimal visibility'), array('vis_cor','Cumulative distribution function of the minimal visibility on the evacuation routes'), array('tree_F','Event tree for fatalities due to toxic gases'), array('tree_M','Event tree for casulties due toxic gases'), array('tree_steel','Event for construction stability'));
	foreach($pictures_list as $picture) {
		$file=$f."/picts/".$picture[0].".png";
		$size_info=getimagesize($file);
		$data64=shell_exec("base64 $file");
		echo "<img class='results-pictures' style='width:".$size_info[0]."px;height:".$size_info[1]."px;' src='data:image/png;base64, $data64'/>";
		echo "<p>Figure ". $counter .". <strong>".$picture[1]."</strong></p>";
		$counter += 1;
	}
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
