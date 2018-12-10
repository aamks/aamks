<?php
#		$_SESSION['nn']->msg("Activation completed")                                                                  ;
#		$_SESSION['header_ok'][]="Activation complete";
#		$_SESSION['header_err'][]="Activation not complete";
session_name('aamks');
require_once("inc.php"); 
if(isset($_SESSION['g_login'])){
	$_SESSION['g_name']=$_SESSION['g_login']['g_name'];
	$_SESSION['g_email'] =$_SESSION['g_login']['g_email'];
	$_SESSION['g_user_id']=$_SESSION['g_login']['g_user_id'];
	$_SESSION['g_picture']=$_SESSION['g_login']['g_picture'];
	do_google_login();
}

function salt($password){/*{{{*/
	$salted=substr(md5($password.md5(getenv("AAMKS_SALT"))),0,20);
	return($salted);
}/*}}}*/
function google_js_login(){/*{{{*/
	 if(isset($_POST['g_user_id'])){
		$_SESSION['g_name']=$_POST['g_name'];
		$_SESSION['g_email']=$_POST['g_email'];
		$_SESSION['g_user_id']=$_POST['g_user_id'];
		$_SESSION['g_picture']=$_POST['g_picture'];
		do_google_login();
	}
}/*}}}*/
function me(){/*{{{*/
	return("https://$_SERVER[SERVER_NAME]$_SERVER[SCRIPT_NAME]");
}/*}}}*/
function login_form(){/*{{{*/
	global $g_ret;
	$loginURL=$g_ret[0];
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
	<div class='g-signin2' data-onsuccess='onSignIn' data-theme='dark'  data-longtitle='true' ></div>
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
		$ret=$_SESSION['nn']->query("SELECT * FROM users where email= $1 and password = $2", array($_POST['email'], $salted));
		if(!empty($ret)){//password and email match
			if($salted==$ret[0]['password']){
				$_SESSION['nn']->set_user_variables($ret[0]);
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
	echo "<div style='position:fixed;top:10px'>
		<img width=160 src=logo.svg><br><br><br>
		<a href=apainter class=blink>apainter</a><br>
		<a href=form.php?form1 class=blink>form1</a><br>
		<a href=workers/vis/master.html class=blink>visualization</a><br>
		</div> ";
}
/*}}}*/
 function password_input($name,$required){/*{{{*/
	if(!empty($required)){$req=" required ";}else{ $req="";}
	 $password_input="<input type=password size=32 autocomplete=off $req name=$name placeholder='password' pattern='(?=^.{8,}$)(?=.*[!@#$%^&*])(?=.*\d)(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$' title='at least 8 chars - lowecase, uppercase, digit, character from (!@#$%^&*)'>";
	 return $password_input;
# psql aamks -c "select * from users";
}/*}}}*/
function register_form(){/*{{{*/
   $form = "<br><br>
		<form method=POST>
		<center>
		<img src=logo.svg>
		<table>
		<tr><td>name<td><input name=name placeholder='John Doe' size=32 required autocomplete='off' >
		<tr><td>email<td><input type=email name=email placeholder='email' size=32 required autocomplete='off' >
		<tr><td>password<td>".password_input("password",1)."
		<tr><td>repeat password<td>".password_input("rpassword",1)."
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
	extract($_POST);
	$ret=$_SESSION['nn']->query("SELECT * FROM users WHERE email = $1 ", array($_POST['email'] ));
	if (!empty($ret[0])){
		$_SESSION['nn']->fatal("Email address already used in AAMKS!");
	}
	$salted=salt($password);
	$token=md5(time());
	$ret=$_SESSION['nn']->query("insert into users (username, email, password, activation_token) values ($1,$2,$3,$4) returning id", array($name, $email, $salted,$token));

	nice_mail($email,"Welcome to AAMKS","Confirm your email address and activate your AAMKS account <br> 
		<a href=https://$_SERVER[SERVER_NAME]/index.php?activation_token=$token>Click here</a>");
	echo "Email sent to $email";
}/*}}}*/
function activate_user(){/*{{{*/
	$ret=$_SESSION['nn']->query("SELECT * FROM users WHERE activation_token= $1 AND activation_token !='already activated'", array($_GET['activation_token'] ));
	if (empty($ret[0])){
		$_SESSION['nn']->fatal("Activation token not valid");
	}else{
		$_SESSION['nn']->query("UPDATE users SET activation_token ='already activated' WHERE id= $1", array($ret[0]['id'])) ;
		$_SESSION['nn']->set_user_variables($ret[0])                                                                                         ;
	}
}/*}}}*/
function nice_mail($address,$subject,$body){/*{{{*/
        $headers  = 'MIME-Version: 1.0' . "\r\n";
        $headers .= 'Content-type: text/html; charset=UTF-8' . "\r\n";
        $headers .= 'From:Aamks<do_not_reply@szach.in>' . "\r\n";
        mail($address, $subject, $body, $headers);
}/*}}}*/
function reset_password(){/*{{{*/
	$token=md5(salt(time()));
	$k=rand(10,10000);
	if(empty($_GET['reset'])){//start of reseting proces
		if($ret=$_SESSION['nn']->query("UPDATE users SET reset_token = $1 where email = $2 returning id", array($token, $_SESSION['reset_email']))){
			nice_mail($_SESSION['reset_email'],"AAMKS reset password $k","Reset the AAMKS password <a href=".me()."?reset=$token>HERE</a>") ;
			echo "Email sent to $_SESSION[reset_email]"                                                                                  ;
			$_SESSION['nn']->msg("Check mail for reset instructions");

		}else{//did not enter email address
			header("location:".me()); 
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
		echo $form;
		}else{//do the reseting
			if($ret=$_SESSION['nn']->query("UPDATE users SET password = $1, reset_token = NULL where email = $2 AND reset_token = $3 returning *", array(salt($_POST['password']), $_SESSION['reset_email'], $_GET['reset']))){
				$_SESSION['header_ok'][]="DONE!";
				$_SESSION['nn']->set_user_variables($ret[0]);
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
		<tr><td>name<td><input name=name placeholder='name' size=32 required autocomplete='off' value='$_SESSION[username]' >
		<tr style='display:none'><td>email-readonly<td><input id='username' readonly name='username'  size=32 value='$_SESSION[email]' >
		<tr><td>password<td>".password_input("password",0)."
		</table><br>
		<input type=submit name=save value='Save'>
		</form>
		</div>
		";
}/*}}}*/
function edit_user(){/*{{{*/
	if(empty($_SESSION['user_id'])){
	header("location:".me());
	}
	if(!isset($_POST['save'])){ //from not submited
	}else{ //form submited
		if(!empty($_POST['password'])){ //did not changed password
			$_SESSION['nn']->query("UPDATE users SET password = $1, username = $2 where id= $3", array(salt($_POST['password']), $_POST['name'], $_SESSION['user_id']));
		}else{
			$_SESSION['nn']->query("UPDATE users SET username = $1 where id= $2", array($_POST['name'], $_SESSION['user_id']));
		}
		$_SESSION['username']=$_POST['name'];
		$_SESSION['header_ok'][]="SAVED";
		header("location:".me());
		}
	edit_user_form();	
}/*}}}*/
function google_login_prep(){/*{{{*/ //TODO to be deleted
	global $g_ret;
	require_once 'vendor/autoload.php';
	$client = new Google_Client();
	$client->setAuthConfig('g_api.json');
	$redirect_uri = 'https://$_SERVER[SERVER_NAME]/index.php';
	$client->setRedirectUri($redirect_uri);
	$client->addScope("https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email");
	#$client-revokeToken(); //logout
	$loginURL=$client->createAuthUrl();
	$g_ret[0]=$loginURL;
	$g_ret[1]=$client;
	#dd($g_ret);
	$_SESSION['nn']->fatal("Just checking!");
	exit();
	return $g_ret;
}/*}}}*/
function get_data_prep(){/*{{{*/
		global $g_ret;
		$client=$g_ret[1];
	$token = $client->fetchAccessTokenWithAuthCode($_GET['code']);
	if(isset($token['error'])){
		echo "There is something wrong";
		login_form();
		exit();
	}
	if(isset($token['id_token'])){ //got the token
		get_data_from_google($token);
	}
}/*}}}*/
function get_data_from_google($token){/*{{{*/
		global $g_ret;
		$client=$g_ret[1];
		$oAuth = new Google_Service_Oauth2($client);
		$userData = $oAuth->userinfo_v2_me->get();
		$_SESSION['g_name']=$userData['name'];
		$_SESSION['g_email']=$userData['email'];
		$_SESSION['g_user_id']=$userData['id'];
		$_SESSION['g_picture']=$userData['picture'];
		do_google_login();
}/*}}}*/
function do_google_login(){/*{{{*/
	$ret=$_SESSION['nn']->query("SELECT * FROM users WHERE email = $1 ", array($_SESSION['g_email'] )); //
	if (!empty($ret[0])){ //alredy there is a user with that email. -need to Join it
		$_SESSION['nn']->query("UPDATE users SET 
		google_id = $1, picture = $2 ,activation_token ='already activated' where email = $3 ", array($_SESSION['g_user_id'], $_SESSION['g_picture'],$_SESSION['g_email'] )); //
		$_SESSION['header_ok'][]="Email already used in Aamks! - merging accounts";
		$ret[0]['picture']=$_SESSION['g_picture'];
	}else { //there is no user with that email in AAMKS - we need to create it
		$ret1=$_SESSION['nn']->query("insert into users (username, email, google_id,picture, password, activation_token) values ($1,$2,$3,$4,$5,$6) returning id", array( $_SESSION['g_name'], $_SESSION['g_email'], $_SESSION['g_user_id'], $_SESSION['g_picture'], "no password yet", "already activated"));
		$ret[0]=array("id"=>$ret1[0]['id'],"username"=>$_SESSION['g_name'],"email"=>$_SESSION['g_email'], "picture"=>$_SESSION['g_picture']);
		$_SESSION['header_ok'][]="Created google aamks account";
	}
	dd($_SESSION);
	unset($_SESSION['g_name']);
	unset($_SESSION['g_email']);
	unset($_SESSION['g_user_id']);
	unset($_SESSION['g_picture']);
	$_SESSION['g_login']=0;
	unset($_SESSION['g_login']);
	dd($_SESSION);
	exit();
	$_SESSION['nn']->set_user_variables($ret[0]);
}/*}}}*/
function my_projects(){/*{{{*/
	if(!empty($_GET['delete'])){
		delete_project($_GET['delete']);
	}
	//TODO regexp for project name
	if(isset($_POST['submit'])){
		$_SESSION['nn']->query("INSERT INTO projects (name,user_id) VALUES ($1,$2)", array($_POST['project_name'], $_SESSION['user_id']));
	}
	echo "
		<div style='background:#555;position:fixed;margin-left:200px;margin-top:100px;width:900px'>
		My projects <br>
		<form method=POST>
			<input type=text name=project_name pattern='[\w-]*'> 
			<input type=submit name=submit value='ADD PROJECT'>
			</form>
		<table>
	";
	$ret=$_SESSION['nn']->query("SELECT * FROM projects WHERE user_id=$1 ORDER BY 1", array($_SESSION['user_id'] ));
	foreach( $ret as $project){
		echo "<tr>
			<td><a href=?project=$project[id]>$project[name]</a>
			<td><a href=?projects&delete=$project[id]>DELETE</a>";

	}
	echo "</table></div> ";
}/*}}}*/
function project_info(){/*{{{*/
	echo "
		<div style='background:#555;position:relativefixed;margin-left:200px;margin-top:100px;width:900px'>
		Project INFO <br><br>
		<form method=POST>

	";
	if(isset($_POST['submit'])){
		$_SESSION['nn']->query("UPDATE projects SET name=$1 WHERE id=$2 and user_id=$3", array($_POST['project_name'], $_POST['project_id'], $_SESSION['user_id']  ));
		#$_SESSION['header_ok'][]="SAVED";
		$_SESSION['nn']->msg("SAVED!")                                                                  ;
	}
	$ret=$_SESSION['nn']->query("SELECT * FROM projects WHERE user_id=$1 AND id=$2 ORDER BY 1", array($_SESSION['user_id'], $_GET['project'] ));
	foreach( $ret as $project){
		//TODO regexp for name 
		echo "
			<input type=text name=project_name value='$project[name]' >
			<input type=hidden name=project_id value='$project[id]'>
			Created: ".substr($project['created'],0,19)." 
			Modified: ".substr($project['modified'],0,19)."<br>
			//TODO = add scenarios
			<input type=submit name=submit value='Save'>
			</form>
			";
			
	}
	echo "</div> ";
	my_projects();
}/*}}}*/
function main() { /*{{{*/
	global $g_ret; //google login handler
	$_SESSION['home_url']="/aamks/index.php";
	if(empty($_SESSION['nn'])) { $_SESSION['nn']=new Aamks("Aamks") ; }
	echo '<script src="js/google_sign.js"></script>';
	$_SESSION['nn']->htmlHead("Aamks");
	if(isset($_GET['edit_user'])) { edit_user();}
	$_SESSION['nn']->logoutButton();
	if(isset($_GET['projects'])) { my_projects();}
	if(isset($_GET['project'])) { project_info();}
	menu(); //last
}
/*}}}*/
function delete_project($project_id){/*{{{*/
		$_SESSION['nn']->query("DELETE FROM projects WHERE id=$1 and user_id=$2", array( $project_id, $_SESSION['user_id']  ));
		$_SESSION['nn']->msg("GONE!");
}/*}}}*/
main();
?>
