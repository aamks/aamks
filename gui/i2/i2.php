<?php
session_name('aamks');
require_once("inc.php") ; 

function hello() {
	echo "Welcome to aamks";
}

function main() { /*{{{*/
	if(empty($_SESSION['nn'])) { $_SESSION['nn']=new Aamks("Aamks") ; }
	$_SESSION['nn']->htmlHead("aamks");
	//$_SESSION['nn']->logoutButton();
	hello();
}
/*}}}*/
main();

?>
