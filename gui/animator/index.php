<?php
session_name('aamks');
require_once("../inc.php"); 

function site() {/*{{{*/
	$colors=json_decode(file_get_contents("inc.json"),1)['aamksGeoms'];
	$doses="
	<div style='display: flex'>
		<a target=blank_ href=https://www.google.com/search?q=fractional+effective+dose>FED</a>: 
		<div style='margin:5px; width:10px; height:10px; border-radius: 10px; border: 2px solid ".$colors['doseN']['stroke']."; background-color: ".$colors['doseN']['c']."; color: #000'></div>Neutral
		<div style='margin:5px; width:10px; height:10px; border-radius: 10px; border: 2px solid ".$colors['doseL']['stroke']."; background-color: ".$colors['doseL']['c']."; color: #000'></div>Low
		<div style='margin:5px; width:10px; height:10px; border-radius: 10px; border: 2px solid ".$colors['doseM']['stroke']."; background-color: ".$colors['doseM']['c']."; color: #000'></div>Medium
		<div style='margin:5px; width:10px; height:10px; border-radius: 10px; border: 2px solid ".$colors['doseH']['stroke']."; background-color: ".$colors['doseH']['c']."; color: #000'></div>High
	</div>
	";
	echo "
	<LINK rel='stylesheet' type='text/css' href='../css/painters.css'>
	<script type='text/javascript' src='js/paper-full.min.js'></script>
	<script type='module' src='js/lodash.min.js'></script>
	<script type='text/paperscript' canvas='animator-canvas' src='js/animator.js'></script>
	<div>
		<button-left-menu-box>A</button-left-menu-box><left-menu-box></left-menu-box>
		<animator-title></animator-title> 
		<animator-time></animator-time>
		<button-right-menu-box>SETUP</button-right-menu-box>
		
		<right-menu-box>
			<close-right-menu-box><img src=/aamks/css/close.svg></close-right-menu-box><br>
			<table>
				<tr><td>Animation           <td><choose-vis></choose-vis> 
				<tr><td>Highlight           <td><highlight-geoms></highlight-geoms> 
				<tr><td>Style               <td><change-style></change-style> 
				<tr><td>Labels size         <td><size-labels></size-labels> 
				<tr><td>Walls size          <td><size-walls></size-walls> 
				<tr><td>Doors size          <td><size-doors></size-doors> 
				<tr><td>Evacuee radius      <td><radius-evacuee></radius-evacuee> 
				<tr><td>Vectors size        <td><size-velocities></size-velocities> 
				<tr><td>Speed               <td><animation-speed></animation-speed>
				<tr><td colspan=2>$doses
			</table>
		</right-menu-box>
	</div>
	<canvas-mouse-coords></canvas-mouse-coords>
	<svg-slider></svg-slider>
	<canvas id='animator-canvas' resize hidpi='off' />
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
