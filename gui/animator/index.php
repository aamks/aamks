<?php
session_name('aamks');
require_once("../inc.php"); 

function site() {/*{{{*/
	$colors=json_decode(file_get_contents("inc.json"),1)['aamksGeoms'];
	$doses="
	<div style='display: flex'>
		<a target=blank_ href=https://www.google.com/search?q=fractional+effective+dose>FED</a>: 
		<div style='margin:5px; width:10px; height:10px; border-radius: 10px; border: 2px solid ".$colors['color_N']['stroke']."; background-color: ".$colors['color_N']['c']."; color: #000'></div>Neutral
		<div style='margin:5px; width:10px; height:10px; border-radius: 10px; border: 2px solid ".$colors['color_L']['stroke']."; background-color: ".$colors['color_L']['c']."; color: #000'></div>Low
		<div style='margin:5px; width:10px; height:10px; border-radius: 10px; border: 2px solid ".$colors['color_M']['stroke']."; background-color: ".$colors['color_M']['c']."; color: #000'></div>Medium
		<div style='margin:5px; width:10px; height:10px; border-radius: 10px; border: 2px solid ".$colors['color_H']['stroke']."; background-color: ".$colors['color_H']['c']."; color: #000'></div>High
	</div>
	";
	echo "

	<script type='text/javascript' src='js/paper-full.min.js'></script>
	<script type='text/javascript' src='js/animator.js'></script>
		
	<right-menu-box>
		<close-right-menu-box><img src=/aamks/css/close.svg></close-right-menu-box><br>
		<table>
			<tr><td><letter>Space</letter><td>pause/unpause animation
			<tr><td>Highlight           <td><highlight-geoms></highlight-geoms> 
			<tr><td>Style               <td><change-style></change-style> 
			<tr><td>Labels size         <td><size-labels></size-labels> 
			<tr><td>Walls size          <td><size-walls></size-walls> 
			<tr><td>Doors size          <td><size-doors></size-doors> 
			<tr><td>Evacuee&nbsp;radius <td><radius-evacuee></radius-evacuee> 
			<tr><td>Vectors&nbsp;size   <td><size-velocities></size-velocities> 
			<tr><td>Speed               <td><animation-speed></animation-speed>
			<tr><td colspan=2>$doses
		</table>
	</right-menu-box>

	<canvas-mouse-coords></canvas-mouse-coords>
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
