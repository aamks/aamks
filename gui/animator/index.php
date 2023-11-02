<?php
session_name('aamks');
require_once("../inc.php"); 

function main() {
	if(!array_key_exists('nn', $_SESSION))
	{
		header("Location: ../login.php?session_finished_information=1");
	}
	$_SESSION['nn']->htmlHead("Animator");

	$data = $_SESSION['nn']->query("SELECT * from simulations where project = ".$_SESSION['main']['project_id']." and scenario_id = ".$_SESSION['main']['scenario_id'].";");
	echo '
	<section class="container" style="margin-left:150px;">
  <h2 class="title">Search Table Record for '.$_SESSION['main']['project_name'].' / '.$_SESSION['main']['scenario_name'].'</h2>

  <table class="table" id="animTable">
    <thead>
      <tr id="trAnim">
        <th>hrrpeak</th>
        <th>alpha</th>
        <th>heat_of_combustion</th>
		<th>max temp</th>
		<th>min_hgt_compa</th>
		<th>min_hgt_cor</th>
		<th>min_vis_compa</th>
		<th>min_vis_cor</th>
		<th>tot_heat</th>
        <th>wcbe</th>
		<th>dcbe</th>
		<th>individual</th>
		<th>societal</th>
		<th>modified</th>
		<th>animation</th>
      </tr>
    </thead>

    <tbody id="sim">
	';
	foreach ($data as $key=>&$sim) {
		$results = json_decode($sim['results'], true);
		$wcbe = json_decode($sim['wcbe'], true);
		if($sim['status'] == 0){
			$link = "<a href='anim.php?id=" . $sim['id'] . "'>Go to anim</a>";
		} else { $link=""; }
		$modified = substr($sim['modified'], 0, 19);
		echo "<tr>
		<td>{$sim['hrrpeak']}</td>
		<td>{$sim['alpha']}</td>
		<td>{$sim['heat_of_combustion']}</td>
		<td>{$sim['max_temp']}</td>
		<td>{$sim['min_hgt_compa']}</td>
		<td>{$sim['min_hgt_cor']}</td>
		<td>{$sim['min_vis_compa']}</td>
		<td>{$sim['min_vis_cor']}</td>
		<td>{$sim['tot_heat']}</td>
		<td>{$wcbe['0']}</td>
		<td>{$sim['dcbe_time']}</td>
		<td>{$results['individual']}</td>
		<td>{$results['societal']}</td>
		<td>{$modified}</td>
		<td>{$link}</td>
		</tr>
		";
	}
	echo '<input style="background:white;" type="text" class="search" id=search onkeyup="searchTable()" placeholder="Item to filter.." />';
	echo '<input type="checkbox" id="animcheck"><button onclick="sortTable();">Enable sorting by column</button>';
	echo ' </tbody>
	</table>';
	echo '</section>';
}
main();

?>