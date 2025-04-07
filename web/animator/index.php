<?php
session_name('aamks');
require_once("../inc.php"); 

function main() {
	if(!array_key_exists('nn', $_SESSION))
	{
		header("Location: ../login.php?session_finished_information=1");
	}
	if (isset($_COOKIE['is_remember'])) {
        setcookie("aamks", session_id(), time() + (86400 * 7), "/");
    } else {
        setcookie("aamks", session_id(), time() + 86400, "/");
    }
	$_SESSION['nn']->htmlHead("Animator");
	$_SESSION['nn']->menu();

	$data = $_SESSION['nn']->query("SELECT iteration, hrrpeak, alpha, heat_of_combustion, max_temp, min_hgt_compa, 
           min_hgt_cor, min_vis_compa, min_vis_cor, tot_heat, modified, is_anim, results, wcbe, dcbe_time 
    FROM simulations 
    WHERE project = {$_SESSION['main']['project_id']} 
      AND scenario_id = {$_SESSION['main']['scenario_id']} 
      AND status = '0' 
      AND status IS NOT NULL 
    ORDER BY iteration DESC 
    LIMIT 30;
	");
	echo '
	<section class="container">
  <h2 class="title">Search Table Record for '.$_SESSION['main']['project_name'].' / '.$_SESSION['main']['scenario_name'].'</h2>
	<p>You can sort loaded data by columns head and filter column using one of the comparators "<, <=, =, >, >=" or by intervall e.g. "10..20"</p>
	<p>After using the filter field, you can send a query using the button and return all records with the values ​​of the selected column. (use the correct comparator)</p>
	<p>Filters and sorting works on loaded data. The page loads dynamically while scrolling.</p>
  <table id="animTable">
    <thead>';
	echo '<tr>
	  <th data-sortas="numeric" columnName="iteration" style="width:45px">iteration</th>
	  <th data-sortas="numeric" columnName="hrrpeak">hrrpeak</th>
	  <th data-sortas="numeric" columnName="alpha">alpha</th>
	  <th data-sortas="numeric" columnName="heat_of_combustion">heat of combustion</th>
	  <th data-sortas="numeric" columnName="max_temp">max temp</th>
	  <th data-sortas="numeric" columnName="min_hgt_compa">min hgt compa</th>
	  <th data-sortas="numeric" columnName="min_hgt_cor">min hgt cor</th>
	  <th data-sortas="numeric" columnName="min_vis_compa">min vis compa</th>
	  <th data-sortas="numeric" columnName="min_vis_cor">min vis cor</th>
	  <th data-sortas="numeric" columnName="tot_heat">total heat</th>
	  <th data-sortas="numeric" columnName="wcbe">RSET</th>
	  <th data-sortas="numeric" columnName="dcbe_time">ASET</th>
	  <th data-sortas="numeric" columnName="results">individual</th>
	  <th data-sortas="numeric" columnName="results">societal</th>
	  <th data-sortas="datetime" columnName="modified">modified</th>
	  <th>animation</th>
	</tr>
    </thead>

    <tbody>
	';
	foreach ($data as $key=>&$sim) {
		$results = json_decode($sim['results'], true);
		$wcbe = json_decode($sim['wcbe'], true);
		if ($sim['is_anim'] == 1){
			$link = "<a href='anim.php?iter=" . $sim['iteration'] . "'>Go to anim</a>";
		} else {
			$link = 'no anim';
		}
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
			let currentPage = 1;
			let keepFetch = true;
			const loadRows = () => {
			if (keepFetch){
				$.get(`/aamks/ajax.php?ajaxAnimatorTable&page=${currentPage}`, function(data) {
					if (data.trim() !== "") {
						$("#animTable tbody").append(data);
						currentPage++;
					} else {
					 	keepFetch = false
						console.log("No more data!")
					}
				}).fail(function(){
				console.error("Error when fetching rows!")
				});
			}};
			$(document).ready(function(){
				loadRows();
				$("#animTable").fancyTable({
					exactMatch: "auto",
				});
			})
			$(window).on("scroll", function() {
				if ($(window).scrollTop() + $(window).height() >= $(document).height() - 400) {
					loadRows();
				}
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