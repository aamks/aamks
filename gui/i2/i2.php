<?php
session_name('aamks');
require_once("inc.php") ; 

function menu() { /*{{{*/
	echo "
	<img width=160 src=logo.svg><br><br><br>
	<a href=/i2/apainter class=blink>Create geometry</a><br>
	<a href=/i2/workers/vis/master.html class=blink>Visualization</a><br>
	";
}
/*}}}*/
function main() { /*{{{*/
	if(empty($_SESSION['nn'])) { $_SESSION['nn']=new Aamks("Aamks") ; }
	$_SESSION['nn']->htmlHead("i2");
	$_SESSION['nn']->logoutButton();
	menu();
}
/*}}}*/
main();

?>
