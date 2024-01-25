<?php

session_name('aamks');
require_once("inc.php"); 

# echo "SELECT preferences FROM users WHERE id=1" | psql aamks
function update_prefs() { #{{{
	if(!isset($_POST['update_prefs'])) { return; }
	foreach($_POST['update_prefs'] as $k=>$v) {
		if(is_numeric($v)) { $v=intval($v); }
		if(!array_key_exists('nn', $_SESSION))
		{
			header("Location: login.php?session_finished_information=1");
		}
		$_SESSION['nn']->preferences_update_param($k, $v);
	}
}
/*}}}*/
function prefs_form() { # {{{
	if(!isset($_GET['edit_user'])) { return; }
	echo "<div style='display:flex'>";
		echo "<div>";
			echo "<form method=post>";
			echo "<input type=hidden>";
			echo "<table>";
			foreach($_SESSION['prefs'] as $k=>$v) {
				echo "<tr><td>$k<td><input autocomplete=off name=update_prefs[$k] value=$v>";
			}
			echo "</table><br><center><input type=submit value='Save'></center></form><br><br>";
		echo "</div>";

		echo "<div>";
			dd($_SESSION['main']);
			$path=getenv("AAMKS_PATH");
			echo "<tt>$path/evac/config.json</tt>";
			dd(read_evac_config_json());
			$z=shell_exec("env | grep AAMKS | grep -v PASS | grep -v SALT");
			echo "<tt>/etc/apache2/envvars conf</tt>";
			dd($z);
		echo "</div>";
	echo "</div>";
}
/*}}}*/

function main() {/*{{{*/
	if(!array_key_exists('nn', $_SESSION))
	{
		header("Location: login.php?session_finished_information=1");
	}
	$_SESSION['nn']->htmlHead("Aamks setup");
	$_SESSION['nn']->menu('Aamks setup');
	update_prefs();
	prefs_form();
	echo "<a class=blink href=/aamks/form.php?bprofiles>Building profiles</a>";
}
/*}}}*/

main();
?>
