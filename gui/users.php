<?php

session_name('aamks');
require_once("inc.php"); 


function main() {/*{{{*/
	$_SESSION['nn']->htmlHead("Aamks setup");
	$_SESSION['nn']->menu('Aamks setup');
	echo "<a class=blink href=/aamks/projects.php?session_dump>System variables</a><br>";
	echo "<a class=blink href=/aamks/form.php?bprofiles>Building profiles</a>";
}
/*}}}*/

main();
?>
