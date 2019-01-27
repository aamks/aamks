<?php
session_name('aamks');
require_once("../inc.php"); 

function site() {/*{{{*/
	echo "<!DOCTYPE html>
	<HTML>
	<HEAD>
	<META http-equiv=Content-Type content='text/html; charset=utf-8' />
	<LINK href='https://fonts.googleapis.com/css?family=Roboto' rel='stylesheet'>
	<LINK rel='stylesheet' type='text/css' href='../css/painters.css'>
	</HEAD>
	<script src='../js/jquery.js'></script>
	<script src='../js/utils.js'></script>
	<script type='text/javascript' src='js/paper-full.js'></script>
	<script type='text/paperscript' canvas='canvas' src='js/animator.js'></script>
	<BODY>
	<div>
		<button-left-menu-box>A</button-left-menu-box><left-menu-box></left-menu-box>
		<legend-static></legend-static> &nbsp; Time: <sim-time></sim-time>
		&nbsp; &nbsp;
		<button-right-menu-box>SETUP</button-right-menu-box>
		
		<right-menu-box>
			<table>
				<tr><td>Animation           <td><choose-vis></choose-vis> 
				<tr><td>Highlight           <td><highlight-geoms></highlight-geoms> 
				<tr><td>Style               <td><change-style></change-style> 
				<tr><td>Labels size         <td><size-labels></size-labels> 
				<tr><td>Walls size          <td><size-walls></size-walls> 
				<tr><td>Doors size          <td><size-doors></size-doors> 
				<tr><td>Balls size          <td><size-balls></size-balls> 
				<tr><td>Vectors size        <td><size-velocities></size-velocities> 
				<tr><td>Speed               <td><animation-speed></animation-speed>
			</table>
		</right-menu-box>
	</div>
	<canvas-mouse-coords></canvas-mouse-coords>
	<svg-slider></svg-slider>
	<canvas id='canvas' resize hidpi='off' />
	";
}
/*}}}*/
function main() {/*{{{*/
	$_SESSION['nn']->htmlHead("Animator");
	site();
}
/*}}}*/

main();

?>
