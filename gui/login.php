<?php
use PHPMailer\PHPMailer\PHPMailer;

require_once("inc.php");
function sendMail($to, $subject, $message) { #{{{
	if(getenv("AAMKS_USE_MAIL")==0) {
		$_SESSION['nn']->cannot($message);
	}
	require_once('vendor/autoload.php');
	$mail = new PHPMailer();
	$mail->CharSet = 'UTF-8';
	$mail->Encoding = 'base64';
	$mail->isSMTP();
	$mail->Host = 'smtp.office365.com';
	$mail->Port = 587;
	$mail->SMTPSecure = 'tls';
	$mail->SMTPAuth = true; // false?
	// $mail->SMTPKeepAlive = true;
	// $mail->Mailer = “smtp”;
	$mail->Username = getenv("AAMKS_MAIL_SENDER");
	$mail->Password = getenv("AAMKS_MAIL_PASSWORD");
	$mail->addAddress($to);
	$mail->Subject = $subject;
	$mail->isHTML(true);
	$mail->Body = "$message";
	$mail->AltBody = "$message";
	$mail->setFrom(getenv("AAMKS_MAIL_SENDER"), 'AAMKS');
	#$mail->SMTPDebug = 2;
	$mail->send();
	$_SESSION['nn']->cannot($mail->ErrorInfo);
}
function update_template($url, $template){
	$path = getenv("AAMKS_PATH");
	$str = file_get_contents("$path/gui/mail_template/$template.html");
	$str = str_replace("{url}", $url, $str);
	return $str;
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
 ////maintenance
 // echo "<center><br><br><img src=logo_m.svg><br><br><br>We are changing for you!<br><i><a href='mailto:aamks@apoz.edu.pl'>Let us know </a> if you want to receive a notification when service is up again</i></center>";
 // exit();
	$inf = "";
	if(isset($_GET['session_finished_information'])) {
		$inf = '<div style="width:30%; background-color: #fce4e4;border: 1px solid #fcc2c3; padding: 20px 30px;"><span style ="color: #cc0033;font-family: Helvetica, Arial, sans-serif;font-size: 13px;font-weight: bold;line-height: 20px; text-shadow: 1px 1px rgba(250,250,250,.3);">Session expired - please log in again.</span></div><br>';
	 	unset($_GET['session_finished_information']);
	}
    echo "
    <br><br>
    <form method=POST>
    <center>
   $inf
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
	Forgot your password?
	<a href=?reset>Reset</a>
    </form>
    </center>
	";
	changes();
	exit();
	#<br>or<br><br>
	#<div class='g-signin2' data-onsuccess='onSignIn' data-theme='dark'  data-longtitle='true' ></div>
	#<br><br> <br><br> <br><br> <br><br>
	//taken from $form for now (Finland)
} #}}}
function changes(){/*{{{*/
	if(isset($_SESSION['main']['user_id'])) { return; }
    echo "
    <br><br>
    <center>
	<strong>Recent updates</strong><br>
    <table>
    <tr><td>2024-09-30</td><td>--></td><td>Server update with important bugfixes for v2.1.0</td></tr>
    <tr><td>2024-09-17</td><td>--></td><td>Animator <a href=https://github.com/aamks/aamks/pull/318>patch</a> applied for backward compatibility</td></tr>
    <tr><td>2024-09-13</td><td>--></td><td>Server update to <a href=https://github.com/aamks/aamks/releases/tag/v2.1.0>AAMKS v2.1.0</a></td></tr>
    <tr><td>2024-03-05</td><td>--></td><td>Server update to <a href=https://github.com/aamks/aamks/releases/tag/v2.0.1>AAMKS v2.0.1</a></td></tr>
    <tr><td>2024-01-25</td><td>--></td><td>Server update to <a href=https://github.com/aamks/aamks/releases/tag/v2.0.0>AAMKS v2.0.0</a></td></tr>    </table><br>
	Visit our <a href='https://github.com/aamks/aamks/'>GitHub</a> or <a href='https://github.com/aamks/aamks/wiki'>wiki</a> to find out more.
    <br><br>Feel free to contact us if you would like to test full version of AAMKS or need any support.
    <br>Contact person: Wojciech Kowalski <a href='mailto:aamks@apoz.edu.pl'>aamks@apoz.edu.pl</a>
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
		if($salted==$ret[0]['password'] && $ret[0]['activation_token'] == 'already activated'){
			$_SESSION['nn']->ch_main_vars($ret[0]);
		 	header("Location: projects.php?projects_list");
		} else {
			echo "<center><br><br><a href=https://$_SERVER[SERVER_NAME]/aamks/login.php><p class='button'>Login page</p></a>";
			$_SESSION['nn']->fatal("Email address not activated!");
		}
	}else{
		$_SESSION['nn']->cannot("Wrong email or password");
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
		echo "<center><br><br><a href=https://$_SERVER[SERVER_NAME]/aamks/login.php><p class='button'>Login page</p></a>";
		$_SESSION['nn']->fatal("Email address already used in AAMKS!");
	}
	$salted=salt($password);
	$token=md5(time());
	$_SESSION['nn']->query("insert into users (user_name, email, password, activation_token,active_scenario) values ($1,$2,$3,$4,$5)", array($name, $email, $salted,$token,1));
	$_SESSION['nn']->msg("We send you email to activation account. Check inbox or spam folder for activation link!");
	sendMail($email,"AAMKS activation account",update_template("https://$_SERVER[SERVER_NAME]/aamks/login.php?activation_token=$token", 'activation'));

	//echo "<br>activation account <a href=login.php?activation_token=$token>Click here</a>";
	//header("Location: login.php"); // Finland only
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
		echo "<center><br><br><a href=https://$_SERVER[SERVER_NAME]/aamks/login.php><p class='button'>Login page</p></a>";
		$_SESSION['nn']->fatal("Activation token not valid");
	} else {
		$_SESSION['nn']->query("UPDATE users SET activation_token='already activated' WHERE id=$1", array($r[0]['id'])) ;
		$pid = $_SESSION['nn']->query("insert into projects (user_id, project_name) values ($1,$2) RETURNING id", array($r[0]['id'], 'demo'));
		$tid = $_SESSION['nn']->query("insert into scenarios (project_id, scenario_name) values ($1,$2) RETURNING id", array($pid[0]['id'], 'three'));
		$nid = $_SESSION['nn']->query("insert into scenarios (project_id, scenario_name) values ($1,$2) RETURNING id", array($pid[0]['id'], 'navmesh'));
		$sid = $_SESSION['nn']->query("insert into scenarios (project_id, scenario_name) values ($1,$2) RETURNING id", array($pid[0]['id'], 'simple'));

		$_SESSION['nn']->query("CREATE TEMP TABLE tmp (like simulations)");
		$_SESSION['nn']->query("INSERT INTO tmp SELECT * FROM simulations WHERE project = 1 AND scenario_id IN (1, 2, 3) AND iteration IN (1,2,3,4,5,6,7,8,9,10)");
		$_SESSION['nn']->query("UPDATE tmp SET id = nextval('simulations_id_seq')");
		$_SESSION['nn']->query("UPDATE tmp SET project = $1", array($pid[0]['id']));
		$_SESSION['nn']->query("UPDATE tmp SET scenario_id = $1 WHERE scenario_id = 1", array($sid[0]['id']));
		$_SESSION['nn']->query("UPDATE tmp SET scenario_id = $1 WHERE scenario_id = 2", array($nid[0]['id']));
		$_SESSION['nn']->query("UPDATE tmp SET scenario_id = $1 WHERE scenario_id = 3", array($tid[0]['id']));
		$_SESSION['nn']->query("INSERT INTO simulations SELECT * from tmp");
		$_SESSION['nn']->query("DROP TABLE tmp");

		$_SESSION['nn']->query("update users set active_scenario = $1 where id=$2", array($sid[0]['id'], $r[0]['id']));
		$ret=$_SESSION['nn']->query("SELECT *,u.id AS user_id, s.id AS scenario_id, p.id AS project_id FROM users u LEFT JOIN projects p ON (u.id=p.user_id) LEFT JOIN scenarios s ON (p.id=s.project_id) WHERE s.id=u.active_scenario AND u.id=$1", array($r[0]['id']));

		$AAMKS_PATH=getenv("AAMKS_PATH");
		$user_dir="/home/aamks_users/".$ret[0]['email'];

		system("
			mkdir -p $user_dir
			cp -r $AAMKS_PATH/installer/demo/ $user_dir
		");
		run_conf_subst($user_dir, $pid[0]['id'], $sid[0]['id'], $nid[0]['id'], $tid[0]['id']);
		//$_SESSION['nn']->ch_main_vars($ret[0]);
		$_SESSION['nn']->msg("Account activated! You can login now!");
		//header("location:/aamks/login.php");
	}

	# psql aamks -c 'select * from users';
	# psql aamks -c 'select * from scenarios';
	# psql aamks -c "delete from users ";
}/*}}}*/
function reset_password(){/*{{{*/
	$token=md5(salt(time()));
	$k=rand(10,10000);
	$expFormat = mktime(date("H")+24, date("i"), date("s"), date("m") ,date("d"), date("Y"));
	$expDate = date("Y-m-d H:i:s",$expFormat);
	if(empty($_GET['reset'])){//start of reseting proces
		$form = "
		<form method=POST> <center>
		<br><br>
		<div class=frame>
		<table>
		<tr><td>Your e-mail<td><input type=email name=email size=32 >
		</table><br>
		<input type=submit name=reset value='Reset password'>
		</div>
		</form>
		</center> ";/*}}}*/
		if(!isset($_POST['reset'])){//show reset form
	# echo 'select * from users' | psql aamks
		echo $form;
		}else{
			$reset_email = $_POST['email'];
			$result = $_SESSION['nn']->query("SELECT * FROM users WHERE email= '" . $reset_email . "'");
			if(empty($result)){
				echo "<center><br><br><a href=https://$_SERVER[SERVER_NAME]/aamks/login.php><p class='button'>Login page</p></a>";
				$_SESSION['nn']->fatal("There is no such email in our database!");
				header("location:/aamks/login.php");
				exit();
			}else{
				$ret=$_SESSION['nn']->query("UPDATE users SET reset_token = $1, access_time = $2 where email = $3 returning id", array($token, $expDate, $reset_email));
				$_SESSION['nn']->msg("Email sent, check inbox or spam folder for reset link!");
				sendMail($reset_email,"AAMKS reset password",update_template("https://$_SERVER[SERVER_NAME]/aamks/login.php?reset=$token", "password_reset"));
				//echo "Email sent to $reset_email" ;
				//echo " <a href=".loginphp()."?reset=$token>HERE</a>";
			}
		}
	}else{
/*{{{FORM*/
	   $form = "
		<form method=POST id='passForm'> <center>
		<br><br>
		<div class=frame>
		<table>
		<tr><td>Set new password<td><input type=password id='password' size=32 placeholder='new password' >
		<tr><td>Confirm password<td><input type=password id='password2' size=32 placeholder='new password' >
		</table><br>
		<input type=submit name=reset value='RESET'>
		</div>
		</form>
		</center>
		<script>
		document.getElementById('passForm').addEventListener('submit', function(event){
			const regex = /^(?=.*[!@#$%^&*(),.?:{}|<>])(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/
			const pass = document.getElementById('password').value;
			const pass2 = document.getElementById('password2').value;
			if (!regex.test(pass) ) {
				event.preventDefault();
				amsg({'msg': 'Password must be at least 8 characters long, contain at least one special character, one lowercase letter, one uppercase letter, and one digit!', 'err':2, 'duration': 3000 });
			} else if (pass !== pass2) {
				event.preventDefault();
				amsg({'msg': 'Password do not match!', 'err':2, 'duration': 3000 });
			}
		});
		</script>";/*}}}*/
		if(!isset($_POST['reset'])){//show reset form
	# echo 'select * from users' | psql aamks
		echo $form;
		}else{//do the reseting
			$result = $_SESSION['nn']->query("SELECT * FROM users WHERE reset_token = $1", array($_GET['reset']));
			if(!empty($result)){
				if($result[0]['access_time'] >= date("Y-m-d H:i:s")){
					if($ret=$_SESSION['nn']->query("UPDATE users SET password = $1, reset_token = NULL, access_time = NULL where email = $2 AND reset_token = $3 returning *", array(salt($_POST['password']), $result[0]['email'], $_GET['reset']))){
						$_SESSION['header_ok'][]="Password changed!";
						//$ret=$_SESSION['nn']->query("SELECT *,u.id AS user_id, s.id AS scenario_id, p.id AS project_id FROM users u LEFT JOIN projects p ON (u.id=p.user_id) LEFT JOIN scenarios s ON (p.id=s.project_id) WHERE s.id=u.active_scenario AND u.id=$1", array($ret[0]['id']));
                        // [WK] bug - wrong active scenario. I suppose it is not crucial to sustain actvie scenario when resetting the account
                        $ret=$_SESSION['nn']->query("SELECT *,u.id AS user_id, s.id AS scenario_id, p.id AS project_id FROM users u LEFT JOIN projects p ON (u.id=p.user_id) LEFT JOIN scenarios s ON (p.id=s.project_id) WHERE u.id=$1", array($ret[0]['id']));
						$_SESSION['nn']->ch_main_vars($ret[0]);
						header("Location: projects.php");
						exit();
					}else{
						echo "<center><br><br><a href=https://$_SERVER[SERVER_NAME]/aamks/login.php><p class='button'>Login page</p></a>";
						$_SESSION['nn']->fatal("Something goes wrong. Please try again!");
					}
				}else{
					echo "<center><br><br><a href=https://$_SERVER[SERVER_NAME]/aamks/login.php><p class='button'>Login page</p></a>";
					$_SESSION['nn']->fatal("This forget password link has been expired!");
				}
			}else{
				echo "<center><br><br><a href=https://$_SERVER[SERVER_NAME]/aamks/login.php><p class='button'>Login page</p></a>";
				$_SESSION['nn']->fatal("Wrong token!");
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
