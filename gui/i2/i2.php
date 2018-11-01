<?php
session_name('aamks');
require_once("inc.php"); 
require_once("salt.php");
function me(){/*{{{*/
	return("https://$_SERVER[SERVER_NAME]$_SERVER[SCRIPT_NAME]");
}/*}}}*/
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
		$salted=salt($_POST['password']);
		$ret=$_SESSION['nn']->query("SELECT * FROM nusers where email= $1 and password = $2", array($_POST['email'], $salted));
		if(!empty($ret)){//password and email match
			if($salted==$ret[0]['password']){
				set_user_variables($ret[0]);
			}
		}else{
			$_SESSION['reset_email']=$_POST['email'];
			$_SESSION['nn']->cannot("Wrong email or password");
			echo "<center><br><br><br><br><br>Generate new password for email ".$_POST['email']." click <a href=?reset>HERE</a> or try to login once more<br><br>
				<br><br> <br><br> <br><br> <br><br> <br><br> <br>
				";
			echo $form ;
		}
	}
	if(isset($_POST['register'])){
		echo"Register";
	}
	
}/*}}}*/
function menu() { /*{{{*/
	echo "
	<img width=160 src=logo.svg><br><br><br>
	<a href=/i2/apainter class=blink>Create geometry</a><br>
	<a href=/i2/workers/vis/master.html class=blink>Visualization</a><br>
	";
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
		#$_SESSION['nn']->query("UPDATE nusers SET activation_token ='alredy activated' WHERE id= $1", array($ret[0]['id'])) ;
	#	$_SESSION['nn']->msg("Activation completed")                                                                  ;
#		$_SESSION['header_ok'][]="Activation complete";
#		$_SESSION['header_err'][]="Activation not complete";
#		$_SESSION['header_err'][]="Activation not complete";

		set_user_variables($ret[0])                                                                                         ;
# psql aamks -c "select reset_token from nusers";

	}

}/*}}}*/
function nice_mail($address,$subject,$body){/*{{{*/
        $headers  = 'MIME-Version: 1.0' . "\r\n";
        $headers .= 'Content-type: text/html; charset=UTF-8' . "\r\n";
        $headers .= 'From:AAMKS<do_not_reply@szach.in>' . "\r\n";
        mail($address, $subject, $body, $headers);
}/*}}}*/
function set_user_variables($ret){/*{{{*/
	$_SESSION['user_id']=$ret['id'];
	$_SESSION['username']=$ret['username'];
	$_SESSION['email']=$ret['email'];
	$_SESSION['picture']=$ret['picture'];
	header("location:".me());
}/*}}}*/
function reset_password(){/*{{{*/
	$token=md5(salt(time()));
	$k=rand(10,10000);
	if(empty($_GET['reset'])){//start of reseting proces
		if($ret=$_SESSION['nn']->query("UPDATE nusers SET reset_token = $1 where email = $2 returning id", array($token, $_SESSION['reset_email']))){
			nice_mail($_SESSION['reset_email'],"AAMKS reset password $k","Reset the AAMKS password <a href=".me()."?reset=$token>HERE</a>") ;
			echo "Email sent to $_SESSION[reset_email]"                                                                                  ;
		}else{//did not enter email address
			header("location:".me()); 
		}
	}else{
/*{{{FORM*/
	   $form = "
		<form method=POST> <center>
		<br><br>
		<div style='border: 1px solid #555; padding: 10px; width: 360px'>
		<table>
		<tr><td>login<td><input type=email name=email value='$_SESSION[reset_email]' readonly size=32 >
		<tr><td>new password<td><input type=password name='password' size=32 placeholder='new password' >
		</table><br>
		<input type=submit name=reset value='RESET'>
		</div>
		</form>
		</center> ";/*}}}*/
		if(!isset($_POST['reset'])){//show reset form
		echo $form;
		}else{//do the reseting
			if($ret=$_SESSION['nn']->query("UPDATE nusers SET password = $1, reset_token = NULL where email = $2 AND reset_token = $3 returning *", array(salt($_POST['password']), $_SESSION['reset_email'], $_GET['reset']))){
				set_user_variables($ret[0]);
				$_SESSION['nn']->msg("Password changed");
			}else{
				$_SESSION['nn']->fatal("NOT Good!!");
			}
		}
	}
	exit();
}/*}}}*/
function edit_user_form(){/*{{{*/
	echo "<div style='float:right;background:#555555;width:400px;margin-top:50px;margin-right:100px'>
		<form method=POST>
		<table>
		<tr><td>name<td><input name=name placeholder='name' size=32 required autocomplete='off' value='$_SESSION[username]' >
		<tr><td>password<td><input type=text name='password' size=32 placeholder='password' autocomplete='off' >
		</table><br>
		<input type=submit name=save value='Save'>
		</form>
		</div>
		";
}/*}}}*/
function edit_user(){/*{{{*/
	if(!isset($_POST['save'])){ //from not submited
		edit_user_form(); //print form
	}else{ //form submited
		if(!empty($_POST['password'])){ //did not changed password
			$_SESSION['nn']->query("UPDATE nusers SET password = $1, username = $2 where id= $3", array(salt($_POST['password']), $_POST['name'], $_SESSION['user_id']));
		}else{
			$_SESSION['nn']->query("UPDATE nusers SET username = $1 where id= $2", array($_POST['name'], $_SESSION['user_id']));
		}
		$_SESSION['nn']->msg("SAVED");
		$_SESSION['username']=$_POST['name'];
		edit_user_form();	
		}
# psql aamks -c "select * from nusers";
}/*}}}*/

function main() { /*{{{*/
	$_SESSION['home_url']="https://stanley.szach.in/i2/i2.php";
	if(empty($_SESSION['nn'])) { $_SESSION['nn']=new Aamks("Aamks") ; }
	$_SESSION['nn']->htmlHead("i2");
	if(isset($_GET['register'])) { register_form();}
	if(isset($_GET['reset'])) { reset_password();}
	if(isset($_GET['activation_token'])) { activate_user();}
	if(isset($_GET['edit_user'])) { edit_user();}

	if(empty($_SESSION['user_id'])){
		login_form();
	}else{
		$_SESSION['nn']->logoutButton();
		menu();
	}


}
/*}}}*/
main();

?>
