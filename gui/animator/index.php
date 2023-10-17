<?php
session_name('aamks');
require_once("../inc.php"); 

function main() {
	$_SESSION['nn']->htmlHead("Animator");

	$data = $_SESSION['nn']->query("SELECT * from simulations where project = ".$_SESSION['main']['project_id']." and scenario_id = ".$_SESSION['main']['scenario_id']." and status = 0 and status is not null;");
	echo '
	<section class="container" style="margin-left:150px;">
  <h2 class="title">Search Table Record for '.$_SESSION['main']['project_name'].' / '.$_SESSION['main']['scenario_name'].'</h2>
	<p>You can sort data by columns head and filter column using one of the comparators "<, <=, >, >=" or by intervall e.g. "10..20"</p>
  <table id="animTable">
    <thead>';
	echo '<tr>
	  <th data-sortas="numeric" style="width:45px">iteration</th>
	  <th data-sortas="numeric">hrrpeak</th>
	  <th data-sortas="numeric">alpha</th>
	  <th data-sortas="numeric">heat of combustion</th>
	  <th data-sortas="numeric">max temp</th>
	  <th data-sortas="numeric">min hgt compa</th>
	  <th data-sortas="numeric">min hgt cor</th>
	  <th data-sortas="numeric">min vis compa</th>
	  <th data-sortas="numeric">min vis cor</th>
	  <th data-sortas="numeric">total heat</th>
	  <th data-sortas="numeric">RSET</th>
	  <th data-sortas="numeric">ASET</th>
	  <th data-sortas="numeric">individual</th>
	  <th data-sortas="numeric">societal</th>
	  <th data-sortas="datetime">modified</th>
	  <th>animation</th>
	</tr>
    </thead>

    <tbody>
	';
	foreach ($data as $key=>&$sim) {
		$results = json_decode($sim['results'], true);
		$wcbe = json_decode($sim['wcbe'], true);
		$link = "<a href='anim.php?id=" . $sim['id'] . "'>Go to anim</a>";
		$modified = substr($sim['modified'], 0, 19);
		echo "<tr>
		<td>{$sim['iteration']}</td>
		<td>" . number_format($sim['hrrpeak'], 1, ".", "") . " </td>
		<td>" . number_format($sim['alpha'], 4, ".", "") . " </td>
		<td>" . number_format($sim['heat_of_combustion'], 1, ".", "") . " </td>
		<td>" . number_format($sim['max_temp'], 4, ".", "") . " </td>
		<td>" . number_format($sim['min_hgt_compa'], 4, ".", "") . " </td>
		<td>" . number_format($sim['min_hgt_cor'], 4, ".", "") . " </td>
		<td>" . number_format($sim['min_vis_compa'], 4, ".", "") . " </td>
		<td>" . number_format($sim['min_vis_cor'], 1, ".", "") . " </td>
		<td>" . number_format($sim['tot_heat'], 1, ".", "") . " </td>
		<td>" . number_format($wcbe['0'], 0, ".", "") . " </td>
		<td>" . number_format($sim['dcbe_time'], 0, ".", "") . " </td>
		<td>{$results['individual']}</td>
		<td>{$results['societal']}</td>
		<td>{$modified}</td>
		<td>{$link}</td>
		</tr>
		";
	}
	echo ' </tbody>	</table></section>';
	echo '<script src="/aamks/js/fancyTable.js"></script>';
	echo '<script>
			$(document).ready(function(){
				$("#animTable").fancyTable({
					exactMatch: "auto",
				});
			});
			</script>';
}
main();

?>
