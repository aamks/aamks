<?php
session_name('aamks');
require_once("inc.php"); 

function head() { /*{{{*/
	echo "<!DOCTYPE html>
		<HTML>
		<HEAD>
		<TITLE>apainter</TITLE>
		<META http-equiv=Content-Type content='text/html; charset=utf-8' />
		<link href='https://fonts.googleapis.com/css?family=Roboto' rel='stylesheet'>
		<lINK rel='stylesheet' type='text/css' href='css.css'>
		</HEAD>
		<script src='js/jquery.js'></script>
		<script src='js/taffy-min.js'></script>
		<script src='js/d3.v4.min.js'></script>
		<script src='js/utils.js'></script>
		<script src='js/apainter.js'></script>
		<script src='js/setup_actions.js'></script>
		<script src='js/view3d.js'></script>
		<div id=ajax_msg></div>
	";
}
/*}}}*/
function vars() {/*{{{*/
	# project_name i email wyliczamy z bazy
	$project_name="three";
	$email="mimoohowy@gmail.com";

	$_SESSION['user_id']=25;
	$_SESSION['project_id']=1;
	$_SESSION['scenario_id']=1;
	$_SESSION['user_home']="/home/aamks_users/$email";
	$_SESSION['working_home']="/home/aamks_users/$email/$project_name/$_SESSION[scenario_id]";
	$vars=dd3($_SESSION);
	echo "<div id=var_dump><br>index.php: $vars</div>";

}
/*}}}*/
function main() { /*{{{*/
	head();
	if($_SERVER['SERVER_NAME']!='tygrys.inf.sgsp.edu.pl') { vars(); }
}
/*}}}*/
main();
?>
