<?php
session_name('aamks');
require_once("inc.php"); 
require_once("salt.php");
function login_form(){/*{{{*/
   $form = "
    <br><br>
    <form method=POST>
    <center>
	<img src=logo.svg>
	<br><br>
	<div style='border: 1px solid #555; padding: 10px; width: 360px'>
    <table>
    <tr><td>email<td><input name=email placeholder='email' size=32 required autocomplete='off' >
    <tr><td>password<td><input type=password name='password' size=32 placeholder='password' >
    </table><br>
    <input type=submit name=logMeIn value='Sign in'>
	</div>
	<br>or<br><br>
	<img src=g_signin.png>
	<br><br> <br><br> <br><br> <br><br>
	New to Aamks?
	<a href=?register>Register</a>
    </form>
    </center>
	";
	if(!isset($_POST['logMeIn'])){
		echo $form;
	}else{
		echo "Do login";
		$salted=salt($_POST['password']);
		echo "<br> Salted $salted<br>";
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
	$_SESSION['home_url']="https://stanley.szach.in/i2/i2.php";
	if(empty($_SESSION['nn'])) { $_SESSION['nn']=new Aamks("Aamks") ; }
	$_SESSION['nn']->htmlHead("i2");
	if(isset($_GET['register'])) { register_form();}
	if(isset($_GET['activation_token'])) { activate_user();}

	if(empty($_SESSION['userid'])){
		login_form();
	}


#	$_SESSION['nn']->logoutButton();
#	menu();
}
/*}}}*/
function register_form(){/*{{{*/
   $form = "
    <br><br>
    <form method=POST>
    <center>
	<img src=logo.svg>
    <table>
    <tr><td>name<td><input name=name placeholder='John Doe' size=32 required autocomplete='off' >
    <tr><td>email<td><input type=email name=email placeholder='email' size=32 required autocomplete='off' >
    <tr><td>password<td><input type=password name='password' size=32 placeholder='password' autocomplete='off' required >
    <tr><td>repeat password<td><input type=password name='rpassword' size=32 placeholder='password' autocomplete='off' required >
    </table><br>
    <input type=submit name=register value='Register'>
	<br><br>
    </form>
    </center>
	";
	if(!isset($_POST['register'])){
			echo $form;
	}else{
		do_register();
	}
	exit();

}/*}}}*/
function do_register(){/*{{{*/
# psql aamks -c "\d nusers";
	extract($_POST);
	$ret=$_SESSION['nn']->query("SELECT * FROM nusers WHERE email = $1 ", array($_POST['email'] ));
	if (!empty($ret[0])){
		$_SESSION['nn']->fatal("Email address already used in AAMKS!");
	}
	$salted=salt($password);
	$token=md5(time());
	$ret=$_SESSION['nn']->query("insert into nusers (username, email, password, activation_token) values ($1,$2,$3,$4) returning id", array($name, $email, $salted,$token));
	nice_mail($email,"Welcome to AAMKS","Confirm your email address and activate your AAMKS account <br> 
		<a href=https://stanley.szach.in/i2/i2.php?activation_token=$token>Click here</a>");

# psql aamks -c "select * from nusers";

}/*}}}*/
function activate_user(){/*{{{*/
	$ret=$_SESSION['nn']->query("SELECT * FROM nusers WHERE activation_token= $1 AND activation_token !='alredy activated'", array($_GET['activation_token'] ));
	if (empty($ret[0])){
		$_SESSION['nn']->fatal("Activation token not valid");
	}else{
		$_SESSION['nn']->query("UPDATE nusers SET activation_token ='alredy activated' WHERE id= $1", array($ret[0]['id'])) ;
		$_SESSION['nn']->msg("Activation completed")                                                                  ;
		set_user_variables($ret[0])                                                                                         ;
# psql aamks -c "select * from nusers";
# psql aamks -c "delete from nusers";
	}

}/*}}}*/
function nice_mail($address,$subject,$body){/*{{{*/
        $headers  = 'MIME-Version: 1.0' . "\r\n";
        $headers .= 'Content-type: text/html; charset=UTF-8' . "\r\n";
        $headers .= 'From:AAMKS<do_not_reply@szach.in>' . "\r\n";
        mail($address, $subject, $body, $headers);
}/*}}}*/
function set_user_variables($ret){
	print_r($ret);
}
main();

?>
