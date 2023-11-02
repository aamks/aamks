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

	<div style='text-align:center;'>
	</div>
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
	<div class='grid' style='position: relative; display:grid; top: 30px; grid-template-columns: 3fr 1fr;'>
	<div>
		<canvas id='animator-canvas' resize hidpi='off'></canvas>
	</div>
	<div id='anim-info'>
	<div style='display:flex; justify-content: space-between;'>
	<label>Room:</label><select id='selRooms'></select>
	<label>Param:</label><select id='selParams'>
	<option selected='selected'>Select room first</option>
	</select>
	</div>
	<div class='photo'>
		<img id='image' src='' alt='An image will load here'>
	</div>
";
	$id = $_GET['id'];
	$project = $_SESSION['main']['project_id'];
	$scenario = $_SESSION['main']['scenario_id'];
	$data = $_SESSION['nn']->query("SELECT * from simulations where project='$project' and scenario_id='$scenario' and id='$id';");
	$results = json_decode($data[0]['results'], true);
	$wcbe = json_decode($data[0]['wcbe'], true);
	echo "<div><table><thead><tr>
	  <th>RSET</th>
	  <th>ASET</th>
	  <th>individual</th>
	</tr>
    </thead>
    <tbody>
	<tr>
	<td>" . number_format($wcbe['0'], 0, ".", "") . " </td>
	<td>" . number_format($data[0]['dcbe_time'], 0, ".", "") . " </td>
	<td>" . number_format($results['individual'], 4, ".", "") . " </td>
	</tr></tbody></table>
	<table><thead><tr>
	<th>WRI</th>
	<th>AWR</th>
	<th>SRI</th></tr>
	<tr>
	<td>" . number_format($results['societal'], 4, ".", "") . "</td>
	<td>" . number_format($results['awr'], 4, ".", "") . "</td>
	<td>" . number_format($results['sri'], 4, ".", "") . "</td>
	</tr></tbody></table></div></div></div>";
}
/*}}}*/
function refresh(){
	$id = $_GET['id'];
	$project = $_SESSION['main']['project_id'];
	$scenario = $_SESSION['main']['scenario_id'];
	$anims =  $_SESSION['nn']->query("SELECT animation FROM simulations WHERE project='$project' AND scenario_id='$scenario' AND id='$id';");
	$anim_json = "[";
	foreach ($anims as &$value){
		$anim_json = $anim_json . $value['animation'] . ",";
	}
	$anim_json = rtrim($anim_json, ",") . "]";
	$anims_file = $_SESSION['main']['working_home']."/workers/anims.json";
	$z=file_put_contents($anims_file, $anim_json);
	$anim_params =  $_SESSION['nn']->query("SELECT anim_params FROM simulations WHERE project='$project' AND scenario_id='$scenario' AND id='$id';");
	echo "<div id='anim_params' style='display: none;'>" .json_encode($anim_params) . "</div>";
}
function make_anim_pictures(){
	$id = $_GET['id'];
	$project = $_SESSION['main']['project_id'];
	$scenario = $_SESSION['main']['scenario_id'];
	$f=$_SESSION['main']['working_home'];
	$aamks=getenv("AAMKS_PATH");
	$data = $_SESSION['nn']->query("SELECT anim_params, iteration from simulations where project = '$project' and scenario_id = '$scenario' and id = '$id';");
	    $cmd="cd $aamks/results; python3 beck_anim.py $f $project $scenario ".$data[0]['iteration']." 2>&1";
	if (empty($data[0]['anim_params'])){
		$z=shell_exec("$cmd");
	};
}
function main() {/*{{{*/
	$_SESSION['nn']->htmlHead("Animator");
	site();
	make_anim_pictures();
	refresh();
}
/*}}}*/

main();

?>
