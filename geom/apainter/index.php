<?php
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
		<script src='js/apainter.js'></script>
		<script src='js/underlay.js'></script>
		<script src='js/view3d.js'></script>
	";
}
/*}}}*/
function main() { /*{{{*/
	head();
}
/*}}}*/
main();
?>
