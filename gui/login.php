<?php

function gmail($to, $subject, $msg) { #{{{
	if(getenv("AAMKS_USE_GMAIL")==0) { die("gmail() not configured on this server"); }
	require_once 'vendor/phpmailer/phpmailer/src/Exception.php';
	require_once 'vendor/phpmailer/phpmailer/src/PHPMailer.php';
	require_once 'vendor/phpmailer/phpmailer/src/SMTP.php';

	$mail = new PHPMailer\PHPMailer\PHPMailer;
	$mail->CharSet = 'UTF-8';
	$mail->Encoding = 'base64';
	$mail->isSMTP();
	$mail->Host = 'smtp.gmail.com';
	$mail->Port = 587;
	$mail->SMTPSecure = 'tls';
	$mail->SMTPAuth = true;
	$mail->Username = getenv("AAMKS_GMAIL_USERNAME"); 
	$mail->Password = getenv("AAMKS_GMAIL_PASSWORD");
	$mail->setFrom('aamksproject@gmail.com', 'Aamks Project');		
	$mail->addReplyTo('aamksproject@gmail.com', 'Aamks Project');	
	$mail->addAddress($to);
	$mail->Subject = $subject;

	$mail->isHTML(true);                                  
    $mail->Body    = "$msg";
    $mail->AltBody = "$msg";

	if (!$mail->send()) {
		echo "Some Error!: " . $mail->ErrorInfo;
	} else {
		echo "Mail Sent to $to";
	}
}
/*}}}*/
function loginphp(){/*{{{*/
	return("$_SERVER[SCRIPT_NAME]");
}/*}}}*/
function salt($password){/*{{{*/
	$salted=substr(md5($password.md5(getenv("AAMKS_SALT"))),0,20);
	return($salted);
}/*}}}*/
function login_form(){/*{{{*/
	if(isset($_SESSION['main']['user_id'])) { return; }
    echo "
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
	New to Aamks?
	<a href=?register>Register</a>
    </form>
    </center>
	";
	exit();
	#<br>or<br><br>
	#<div class='g-signin2' data-onsuccess='onSignIn' data-theme='dark'  data-longtitle='true' ></div>
	#<br><br> <br><br> <br><br> <br><br>
	//taken from $form for now (Finland)
} #}}}
function do_login() { #{{{
	$salted=salt($_POST['password']);
	$ret=$_SESSION['nn']->query("SELECT *,u.id AS user_id, s.id AS scenario_id, p.id AS project_id FROM users u LEFT JOIN projects p ON (u.id=p.user_id) LEFT JOIN scenarios s ON (p.id=s.project_id) WHERE s.id=u.active_scenario AND u.email=$1 AND u.password=$2", array($_POST['email'], $salted));
	if(!empty($ret)){//password and email match
		if($salted==$ret[0]['password']){
			$_SESSION['nn']->ch_main_vars($ret[0]);
			header("Location: projects.php");
		}
	}else{
		$_SESSION['reset_email']=$_POST['email'];
		$_SESSION['nn']->cannot("Wrong email or password");
		echo "<center><br><br><br><br><br>Generate new password for email ".$_POST['email']." click <a href=?reset>HERE</a> or try to login once more<br><br>
			<br><br> <br><br> <br><br> <br><br> <br><br> <br>
			";
	}
	if(isset($_POST['register'])){
		echo"Register";
	}
}
/*}}}*/
function do_register(){/*{{{*/
	extract($_POST);
	$ret=$_SESSION['nn']->query("SELECT * FROM users WHERE email = $1 ", array($_POST['email'] ));
	if (!empty($ret[0])){
		$_SESSION['nn']->fatal("Email address already used in AAMKS!");
	}
	$salted=salt($password);
	$token=md5(time());
	$_SESSION['nn']->query("insert into users (user_name, email, password, activation_token,active_scenario) values ($1,$2,$3,$4,$5)", array($name, $email, $salted,$token,1));

	// TODO: enable for production!
	// gmail($email,"Welcome to AAMKS","Confirm your email address and activate your AAMKS account <br> 
	//	<a href=http://$_SERVER[SERVER_NAME]/aamks/login.php?activation_token=$token>Click here</a>");
	//echo "<br> or click here <a href=login.php?activation_token=$token>Click here</a>";  
	header("Location: login.php?activation_token=$token"); // Finland only
}/*}}}*/
function do_logout() { #{{{

	#echo "<div class='g-signin2' data-onsuccess='onSignIn' data-theme='dark'  data-longtitle='true' style='display:none' ></div>"; //to sign out of google 
	#TODO FINLAND
	$_SESSION=[];
	session_destroy();
	header("Location: login.php");
	//ob_flush();
	//flush();
	//sleep(2);
	//echo "<script type='text/javascript'> signOut(); </script> <meta http-equiv='Refresh' content='0; url=index.php' />	";
}
/*}}}*/
 function password_input($name,$required){/*{{{*/
	if(!empty($required)){$req=" required ";}else{ $req="";}
	 $password_input="<input type=password size=32 autocomplete=off $req name=$name placeholder='password' pattern='.{8,}' title='at least 8 chars - lowecase, uppercase, digit, character from (!@#$%^&*)'>";//finland ONLY
	 return $password_input;
# psql aamks -c "select * from users";
# psql aamks -c "delete  from users";
}/*}}}*/
function register_form(){/*{{{*/
   echo "<br><br>
		<form method=POST>
		<center>
		<img src=logo.svg>
		<table>
		<tr><td>name<td><input name=name placeholder='John Doe' size=32 required autocomplete='off' >
		<tr><td>email<td><input type=email name=email placeholder='email' size=32 required autocomplete='off' >
		<tr><td>password<td>".password_input("password",1)."
		<tr><td>repeat password<td>".password_input("rpassword",1)."
		</table><br>
		<input type=submit name=do_register value='Register'>
		<br><br>
		</form>
		</center>
		";
	exit();
}/*}}}*/
function activate_user(){/*{{{*/
	$r=$_SESSION['nn']->query("SELECT * FROM users WHERE activation_token= $1 AND activation_token !='already activated'", array($_GET['activation_token'] ));
	if (empty($r[0])){
		$_SESSION['nn']->fatal("Activation token not valid");
	} else {
		$_SESSION['nn']->query("UPDATE users SET activation_token='already activated' WHERE id=$1", array($r[0]['id'])) ;
		$pid=$_SESSION['nn']->query("insert into projects (user_id, project_name) values ($1,$2) RETURNING id", array($r[0]['id'], 'demo'));
		$_SESSION['nn']->query("insert into scenarios (project_id, scenario_name) values ($1,$2) RETURNING id", array($pid[0]['id'], 'three'));
		$_SESSION['nn']->query("insert into scenarios (project_id, scenario_name) values ($1,$2) RETURNING id", array($pid[0]['id'], 'navmesh'));
		$sid=$_SESSION['nn']->query("insert into scenarios (project_id, scenario_name) values ($1,$2) RETURNING id", array($pid[0]['id'], 'simple'));
		$_SESSION['nn']->query("update users set active_scenario = $1 where id=$2", array($sid[0]['id'], $r[0]['id']));
		$ret=$_SESSION['nn']->query("SELECT *,u.id AS user_id, s.id AS scenario_id, p.id AS project_id FROM users u LEFT JOIN projects p ON (u.id=p.user_id) LEFT JOIN scenarios s ON (p.id=s.project_id) WHERE s.id=u.active_scenario AND u.id=$1", array($r[0]['id']));

		$AAMKS_PATH=getenv("AAMKS_PATH"); 
		$user_dir="/home/aamks_users/".$ret[0]['email'];

		system("
			mkdir -p $user_dir
			cp -r $AAMKS_PATH/installer/demo/ $user_dir
		");
		$_SESSION['nn']->ch_main_vars($ret[0]);
		header("location:/aamks/projects.php"); 
	}

	# psql aamks -c 'select * from users';
	# psql aamks -c 'select * from scenarios';
	# psql aamks -c "delete from users ";
}/*}}}*/
function reset_password(){/*{{{*/
	$token=md5(salt(time()));
	$k=rand(10,10000);
	if(empty($_GET['reset'])){//start of reseting proces
		if($ret=$_SESSION['nn']->query("UPDATE users SET reset_token = $1 where email = $2 returning id", array($token, $_SESSION['reset_email']))){
			gmail($_SESSION['reset_email'],"AAMKS reset password $k","Reset the AAMKS password <a href=".loginphp()."?reset=$token>HERE</a>") ;
			echo "Email sent to $_SESSION[reset_email]" ;
			echo " <a href=".loginphp()."?reset=$token>HERE</a>";
			$_SESSION['nn']->msg("Check mail for reset instructions");

		}else{//did not enter email address
			header("location:".loginphp()); 
		}
	}else{
/*{{{FORM*/
	   $form = "
		<form method=POST> <center>
		<br><br>
		<div class=frame>
		<table>
		<tr><td>login<td><input type=email name=email value='$_SESSION[reset_email]' readonly size=32 >
		<tr><td>new password<td><input type=password name='password' size=32 placeholder='new password' >
		</table><br>
		<input type=submit name=reset value='RESET'>
		</div>
		</form>
		</center> ";/*}}}*/
		if(!isset($_POST['reset'])){//show reset form
	# echo 'select * from users' | psql aamks
		echo $form;
		}else{//do the reseting
			if($ret=$_SESSION['nn']->query("UPDATE users SET password = $1, reset_token = NULL where email = $2 AND reset_token = $3 returning *", array(salt($_POST['password']), $_SESSION['reset_email'], $_GET['reset']))){
				$_SESSION['header_ok'][]="DONE!";
				$ret=$_SESSION['nn']->query("SELECT *,u.id AS user_id, s.id AS scenario_id, p.id AS project_id FROM users u LEFT JOIN projects p ON (u.id=p.user_id) LEFT JOIN scenarios s ON (p.id=s.project_id) WHERE s.id=u.active_scenario AND u.id=$1", array($ret[0]['id']));
				$_SESSION['nn']->ch_main_vars($ret[0]);
				header("Location: projects.php");
			}else{
				$_SESSION['nn']->fatal("Did not change the password!!");
			}
		}
	}
	exit();
}/*}}}*/
function edit_user_form(){/*{{{*/
	echo "<div style='position:absolute;float:right;background:#555;width:400px;top:80px;right:10px'>
		<form method=POST>
		<table>
		<tr><td>name<td><input name=name placeholder='name' size=32 required autocomplete='off' value='".$_SESSION['main']['user_name']."' >
		<tr style='display:none'><td>email-readonly<td><input id='username' readonly name='username' size=32 value='".$_SESSION['main']['email']."' >
		<tr><td>password<td>".password_input("password",0)."
		</table><br>
		<input type=submit name=save value='Save'>
		</form>
		</div>
		";
}/*}}}*/
function edit_user(){/*{{{*/
	if(empty($_SESSION['main']['user_id'])){
		header("location:".loginphp());
	}
	if(!isset($_POST['save'])){ //from not submited
	}else{ //form submited
		if(!empty($_POST['password'])){ //did not changed password
			$_SESSION['nn']->query("UPDATE users SET password = $1, username = $2 where id= $3", array(salt($_POST['password']), $_POST['name'], $_SESSION['main']['user_id']));
		}else{
			$_SESSION['nn']->query("UPDATE users SET username = $1 where id= $2", array($_POST['name'], $_SESSION['main']['user_id']));
		}
		$_SESSION['main']['user_name']=$_POST['name'];
		$_SESSION['header_ok'][]="SAVED";
		header("location:".loginphp());
		}
	edit_user_form();	
}/*}}}*/

function main() { /*{{{*/
	require_once("inc.php"); 
	if(empty($_SESSION['nn'])) { $_SESSION['nn']=new Aamks("Aamks") ; }
	$_SESSION['nn']->htmlHead("Aamks");
	if(isset($_GET['edit_user'])) { edit_user();}

	if(isset($_GET['logout']))           { do_logout(); }
	if(isset($_POST['logMeIn']))         { do_login(); }
	if(isset($_POST['do_register']))     { do_register(); }
	if(isset($_GET['register']))         { register_form();}
	if(isset($_GET['reset']))            { reset_password();}
	if(isset($_GET['activation_token'])) { activate_user();}

	login_form();
	$_SESSION['nn']->logoutButton();
}
/*}}}*/

main();

?>
