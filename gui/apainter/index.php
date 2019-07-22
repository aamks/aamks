<?php
session_name('aamks');
require_once("../inc.php"); 

function site() {/*{{{*/
	echo "
	<LINK rel='stylesheet' type='text/css' href='../css/painters.css'>
	<script src='js/d3.v4.min.js'></script>
	<script src='js/apainter.js'></script>
	<script src='js/apainter_underlay.js'></script>
	<script src='js/apainter_menus.js'></script>
	<script src='js/view3d.js'></script>
	";
}
/*}}}*/
function main() { /*{{{*/
	$_SESSION['nn']->htmlHead("Apainter");
	site();
	if(isset($_SESSION['main'])) { echo " <script>var session_scenario='".$_SESSION['main']['scenario_name']."';</script>"; }
}
/*}}}*/
main();
?>
