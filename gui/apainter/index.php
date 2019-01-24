<?php
session_name('aamks');
require_once("inc.php"); 

function head() { /*{{{*/
	echo "<!DOCTYPE html>
		<HTML>
		<HEAD>
		<TITLE>Apainter</TITLE>
		<META http-equiv=Content-Type content='text/html; charset=utf-8' />
		<link href='https://fonts.googleapis.com/css?family=Roboto' rel='stylesheet'>
		<lINK rel='stylesheet' type='text/css' href='css.css'>
		</HEAD>
		<script src='../js/jquery.js'></script>
		<script src='js/taffy-min.js'></script>
		<script src='js/d3.v4.min.js'></script>
		<script src='js/utils.js'></script>
		<script src='js/apainter.js'></script>
		<script src='js/menus_apainter.js'></script>
		<script src='js/view3d.js'></script>
		<div id=ajax_msg></div>
		";
}
/*}}}*/
function main() { /*{{{*/
	head();
	if(isset($_SESSION['main'])) { echo " <script>var session_scenario='".$_SESSION['main']['scenario_name']."';</script>"; }
}
/*}}}*/
main();
?>
