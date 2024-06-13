<?php
session_name('aamks');
require_once("../inc.php"); 

function main() {
	if(!array_key_exists('nn', $_SESSION))
	{
		header("Location: ../login.php?session_finished_information=1");
	}
	$_SESSION['nn']->htmlHead("Animator");
	$_SESSION['nn']->menu();

	$data = $_SESSION['nn']->query("SELECT * from simulations where project = ".$_SESSION['main']['project_id']." and scenario_id = ".$_SESSION['main']['scenario_id']." and status = '0' and status is not null order by iteration desc;");
	echo '
	<section class="container">
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
		$link = "<a href='anim.php?iter=" . $sim['iteration'] . "'>Go to anim</a>";
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
		<td>" . number_format(max($wcbe), 0, ".", "") . " </td>
		<td>" . number_format($sim['dcbe_time'], 0, ".", "") . " </td>
		<td>" . sprintf("%.4e", $results['individual']) . "</td>
		<td>" . sprintf("%.4e", $results['societal']) . "</td>
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

// We use fancyTable.js from https://github.com/myspace-nu/jquery.fancyTable on MIT License


// Copyright (c) 2018 Johan Johansson

// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:

// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.
}
main();

?>