<?php
session_name('aamks');
require_once("../inc.php"); 

function site() { /*{{{*/
	echo "<!DOCTYPE html>
	<HTML>
	<HEAD>
	<META http-equiv=Content-Type content='text/html; charset=utf-8' />
	<LINK href='https://fonts.googleapis.com/css?family=Roboto' rel='stylesheet'>
	<LINK rel='stylesheet' type='text/css' href='../css/painters.css'>
	</HEAD>
	<script src='../js/jquery.js'></script>
	<script src='../js/utils.js'></script>
	<script src='js/taffy-min.js'></script>
	<script src='js/d3.v4.min.js'></script>
	<script src='js/apainter.js'></script>
	<script src='js/menus_apainter.js'></script>
	<script src='js/view3d.js'></script>
	<div id=ajax_msg></div>
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
