<?php
session_name('aamks');
require_once("models/sql/dbConnect.php");
$db=new dbConnect();  
function loginForm() {/*{{{*/
	
	echo "
	<form method='post' action=".$_SERVER['REQUEST_URI'].">

	<div class='login'>
		<div><label>Log into Aamks</label></div>
		<div><input type='email' name='email' placeholder='E-mail address'></div>
		<div><input type='password' name='password' placeholder='Password'></div>
		<div><input type='submit' name='check' value='Login'></div>
		<div><input type='submit' name='addUserShowForm' value='Register'></div>
		<!--<div class='footer'>
			<div>Create an Account</div>
			<div>Remove an Account</div>
		</div>-->
	</div>

	</form>
	";

}
/*}}}*/
function registerForm() {/*{{{*/
	echo "
	<form method='post' action=".$_SERVER['REQUEST_URI'].">
		<div class='register'>
			<div><label>Register new user</label></div>
			<div><input type='text' name='userName' required placeholder='Name'></div>
			<div><input type='email' name='email' required placeholder='E-mail address'></div>
			<div><input onkeyup='checkPasswordMatch();' id='txtNewPassword' type='password' name='password' placeholder='Password'></div>
			<div><input onkeyup='checkPasswordMatch();' id='txtConfirmPassword' type='password' name='password2' placeholder='Repeat password'></div>
			<input type='hidden' name='makeRegister' value=1/> 
			<div><input id='registerButton' type='submit' value='Register'></div>
			<div id='divCheckPasswordMatch'></div>
		</div>
	</form>
	";
}
/*}}}*/
function check() {/*{{{*/
	global $db;
	if(!empty($_POST['email']) and !empty($_POST['password'])) {
		$result=$db->pg_read("SELECT * from users where email=$1", array($_POST['email']));
		if(!empty($result) and strlen($result[0]['password'])>1) {
			extract($result[0]);
			if(password_verify($_POST['password'], $password)) {
				session_regenerate_id(True);
				$_SESSION['user_id']="$id";
				$_SESSION['email']="$email";
				$_SESSION['editor']="$editor";

				//header("Location: https://wizfds.inf.sgsp.edu.pl/");
				header("Location: https://". $_SERVER['SERVER_NAME']);
				return;
			}
		}
	}
	echo "<div class='login-error'>Invalid e-mail or password. Try again.</div>";
}
/*}}}*/
function makeRegister() {/*{{{*/
	global $db;
	if(!empty($_POST['email']) and !empty($_POST['password'])) {
		$result=$db->pg_read("SELECT * from users where email=$1", array($_POST['email']));
		if(!empty($result)) { echo $_POST['email']." already exists.<br>"; exit(); }
		$pass=password_hash($_POST['password'], PASSWORD_DEFAULT);
		$result=$db->pg_create("INSERT INTO users (email, password, editor, websocket_host, websocket_port, username) values($1, $2, $3, $4, $5, $6) returning id;", array($_POST['email'], $pass, 'normal', 'localhost', 2012, $_POST['userName']));
		$user_id = $result[0]['id'];
		$result=$db->pg_create("INSERT INTO categories (user_id, label, active, visible, uuid) values($1, $2, $3, $4, uuid_generate_v4());", array($user_id, 'current', true, true));
		$result=$db->pg_create("INSERT INTO categories (user_id, label, active, visible, uuid) values($1, $2, $3, $4, uuid_generate_v4());", array($user_id, 'archive', true, true));
		$result=$db->pg_create("INSERT INTO categories (user_id, label, active, visible, uuid) values($1, $2, $3, $4, uuid_generate_v4());", array($user_id, 'finished', true, true));
		system("mkdir /home/aamks_users/".$_POST['email']);
	}
}
/*}}}*/

# init /*{{{*/
if(!isset($_SESSION['email'])) { 
	echo "
	<html>
	<head>
	<title>
		aamks - Simulation Modules
	</title>
	<meta charset='utf-8'/>
	<link href='/login.css' rel='stylesheet' />
	<link href='https://fonts.googleapis.com/css?family=Play' rel='stylesheet'>
	<link href='https://fonts.googleapis.com/icon?family=Material+Icons' rel='stylesheet'>
	<script type='text/javascript' src='https://ajax.googleapis.com/ajax/libs/jquery/1/jquery.min.js'></script>
	</head>
	<body>
	<div ng-app='loginapp'>
	";
	if(isset($_REQUEST['check'])) { check(); } 
	if(isset($_REQUEST['makeRegister'])) { makeRegister(); check(); } 
	if(isset($_REQUEST['addUserShowForm'])) { registerForm(); } 
	else { loginForm(); }
	echo "
	<div class='login-support'>Support: mateusz.fliszkiewicz@fkce.pl, akrasuski@consultrisk.pl</div>
	<script src='/js/lib/angular/angular.js'></script>
	<!--login app-->
	<script type='text/javascript'>
	function checkPasswordMatch() { 
		var password = $('#txtNewPassword').val(); 
		var confirmPassword = $('#txtConfirmPassword').val(); 
		if (password != confirmPassword) {
			$('#registerButton').prop('disabled', true);
			$('#divCheckPasswordMatch').html('Passwords not matching...'); 
		}
		else {
			$('#registerButton').prop('disabled', false);
			$('#divCheckPasswordMatch').html(''); 
		}
	} 
	</script>
	</body>
	</html>
	";
} 

/*}}}*/

#mimooh - przenioslem przekierowanie header do funkcji check - jezeli jest poprawne haslo to przekieruj na adres projects ..
