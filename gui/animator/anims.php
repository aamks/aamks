<?php

session_name('aamks');
require_once("../inc.php"); 

function site() {/*{{{*/
	$home="<left-menu-button>A</left-menu-button><left-menu-box></left-menu-box>";
	echo "
    <link rel='stylesheet' type='text/css' href='css.css'>
	<script type='text/javascript' src='js/paper-full.js'></script>
	<script type='text/paperscript' canvas='canvas' src='js/animator.js'></script>
	<body>
	<div>

	

		$home <vis-title></vis-title> &nbsp; Time: <sim-time></sim-time>
		&nbsp; &nbsp;
		<show-animation-setup-box>[setup]</show-animation-setup-box>
		
		<animation-setup-box>
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
		</animation-setup-box>
	</div>
	<canvas-mouse-coords></canvas-mouse-coords>
	<svg-slider></svg-slider>

	<canvas id='canvas' resize hidpi='off' />
	";
}
/*}}}*/
function main() {/*{{{*/
	$_SESSION['nn']->htmlHead("Aamks Animations");
	site();
}
/*}}}*/

main();

?>
