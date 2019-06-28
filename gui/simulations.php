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
	$r=$_SESSION['nn']->query("SELECT count(*) AS finished FROM simulations WHERE project = $project_id and dcbe_time is not null");
	$finished=$r[0]['finished'];
	$r=$_SESSION['nn']->query("SELECT count(*) AS total FROM simulations WHERE project = $project_id");
	$total=$r[0]['total'];
	echo "<br>Complete: $finished of $total &nbsp; &nbsp; <wheat>ctrl+r to refresh</wheat>";
}
/*}}}*/

/*}}}*/
function show_pictures() {/*{{{*/
	$f=$_SESSION['main']['working_home'];

	/*Generate pictures with using beck.py script*/
	$aamks=getenv("AAMKS_PATH");
	
	$cmd="cd $aamks/results/beck; python3 beck.py $f 2>&1"; 
	$z=shell_exec("$cmd");

	echo "<br>$z";
	$counter = 1;
	$pictures_list = array(array('pie_fault','title'), array('lossesdead','title'), array('lossesheavy','title'), array('losseslight','title'), array('lossesneglegible','title'), array('ccdf','title'), array('dcbe','title'), array('wcbe','title'), array('height','title'), array('hgt_cor','title'), array('temp','title'), array('vis','title'), array('vis_cor','title'), array('tree','title'), array('tree_steel','title'));
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
