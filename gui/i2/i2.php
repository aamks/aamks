<?php
session_name('aamks');
require_once("inc.php") ; 
function login_form(){/*{{{*/
   $form = "
    <br><br>
    <form method=POST>
    <center>
    <h1>AAMKS</h1>
    <table>
    <tr><td>email<td><input name=login  placeholder='email' size=32 required autocomplete='off' >
    <tr><td>password<td><input type=password name='password' size=32 placeholder='password' >
    </table><br>
    <input style='font-size: 20px' type=submit name=logMeIn value='Login'>
	<br><br>
	<img src=g_signin.png><br>
	<a href=?register>Register in AAMKS</a>
    </form>
    </center>
	";
	if(!isset($_POST['logMeIn'])){
		echo $form;
	}else{
		echo "Do login";
	}
	if(isset($_POST['register'])){
		echo"Register";
	}
	
	print_r($_REQUEST);
}/*}}}*/

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

	if(empty($_SESSION['userid'])){
		login_form();
	}

#	$_SESSION['nn']->logoutButton();
#	menu();
}
/*}}}*/
main();

?>
