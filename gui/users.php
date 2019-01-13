<?php

session_name('aamks');
require_once("inc.php"); 


function main() {/*{{{*/
	$_SESSION['nn']->htmlHead("Aamks");
	$_SESSION['nn']->menu('user setup');
	echo "todo";
}
/*}}}*/

main();
?>
