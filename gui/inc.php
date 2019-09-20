<?php
session_name('aamks');
session_start();
ini_set('error_reporting', E_ALL);
ini_set('display_errors',1);
ini_set('display_startup_errors',1);
setlocale(LC_TIME, "pl_PL");

# debug/*{{{*/
// A better print_r();
function dd() {
	echo "<dd>";
	foreach(func_get_args() as $v) {
		echo "<pre>";
		$out=print_r($v,1);
		echo htmlspecialchars($out);
		echo "</pre>";
	}
	echo "<br><br><br><br>";
	echo "</dd>";
}
function dd2($arr) {
	$out=print_r($arr,1);
	echo $out;
}
function dd3($arr) {
	$out="<pre>".htmlspecialchars(print_r($arr,1))."</pre>";
	return $out;
}

/*}}}*/
function init_main_vars() { #{{{
	#psql aamks -c 'select * from users'
	#psql aamks -c 'select * from projects'
	if(isset($_SESSION['main']['project_id'])) { return; }
	$r=$_SESSION['nn']->query("SELECT u.id AS user_id, u.email, p.project_name, u.active_editor, u.user_photo, u.user_name, p.id AS project_id, s.scenario_name, s.id AS scenario_id  FROM users u LEFT JOIN scenarios s ON (u.active_scenario=s.id) LEFT JOIN projects p ON(p.id=s.project_id) WHERE u.id=$1 AND u.active_scenario=s.id",array($_SESSION['main']['user_id']));
	$_SESSION['nn']->ch_main_vars($r[0]);
	//dd($_SESSION);
}
/*}}}*/

class Aamks {/*{{{*/
	public function __construct($site){
		if($site!="ajax") { $this->htmlHead($site); } 
		$_SESSION['header_err']=[];
		$_SESSION['header_ok']=[];
		$_SESSION['header_ok_confirm']=[];
		$_SESSION['home_url']="/aamks/index.php";
	}

/*}}}*/
	private function reportbug($details) {/*{{{*/
		$home="<a href=".$_SESSION['home_url']."><img id=home src=/aamks/css/home.svg></a>";
		$reportquery=join("\n\n" , array(date("G:i:s"), $_SERVER['REMOTE_ADDR'], $_SERVER['HTTP_USER_AGENT'], $_SERVER['REQUEST_URI'], $details, "\n\n"));
		mail('mimoohowy@gmail.com, stanislaw.lazowy@gmail.com', 'aamks bug!', "$reportquery", "from: mimooh@inf.sgsp.edu.pl"); 
		echo "<fatal>DB error. Reported to the administrator.<br>$home</fatal>"; 
		die();
}
/*}}}*/
	public function assert_working_home_exists() { # {{{
		// Things must exist. Otherwise we risk the redirection loops.
		if(!is_dir($_SESSION['main']['working_home'])) { 
			$this->fatal($_SESSION['main']['working_home']." doesn't exist.<br><br>
			This shouldn't happen. You need to remove the project or scenario or contact the admins.");
		}
	}
/*}}}*/
	public function rawMenu() { #{{{
		$r=$_SESSION['nn']->query("SELECT s.* FROM scenarios s LEFT JOIN projects p ON s.project_id=p.id WHERE user_id=$1 ORDER BY modified DESC", array($_SESSION['main']['user_id']));
		$menu='';
		$menu.="<img width=100 src=/aamks/logo.svg><br><br>";
		$menu.="<a id=menu-active-scenario-label href=/aamks/form.php?edit class=bblink>".$_SESSION['main']['scenario_name']."</a><br>";
		$menu.="<a class=blink href=/aamks/projects.php?projects_list>Projects</a><br>";
		$menu.="<a class=blink href=/aamks/apainter/index.php>Apainter</a><br>";
		$menu.="<a class=blink href=/aamks/animator/index.php>Animator</a><br>";
		$menu.="<a class=blink href=/aamks/simulations.php>Simulations</a><br>";
		$menu.="<a class=blink id=launch_simulation>Launch</a><br>";
		$menu.="<a class=blink href=/aamks/projects.php?session_dump>Vars</a><br>";
		$menu.="<br>";
		$menu.="Scenario<br><select id='choose_scenario'>\n";
		$menu.="<option value=".$_SESSION['main']['scenario_id'].">".$_SESSION['main']['scenario_name']."</option>\n";
		foreach($r as $k=>$v) {
			$menu.="<option value='$v[id]'>$v[scenario_name]</option>\n";
		}
		$menu.="</select>\n";
		$menu.='</left-menu-box>';
		return $menu;
	}
/*}}}*/
	public function menu($title) { /*{{{*/
		$this->logoutButton();
		$menu=$this->rawMenu();
		echo "<div>
			<left-menu-box><br>$menu</left-menu-box>
			<div style='margin-bottom:400px; position:absolute; top: 10px; left: 200px; min-width:700px'>";
		echo "<tt>$title</tt>";
	}
	/*}}}*/
	public function ch_main_vars($r) { #{{{
		if(!array_key_exists('user_id', $r) || !array_key_exists('user_name', $r) || !array_key_exists('user_photo', $r) || !array_key_exists('active_editor', $r) || !array_key_exists('project_id', $r) || !array_key_exists('project_name', $r) || !array_key_exists('scenario_id', $r) || !array_key_exists('scenario_name', $r)) { dd($r); die("ch_main_vars() bug"); }

		$_SESSION['main']['user_id']=$r['user_id'];
		$_SESSION['main']['user_name']=$r['user_name'];
		$_SESSION['main']['user_photo']=$r['user_photo'];
		$_SESSION['main']['active_editor']=$r['active_editor'];
		$_SESSION['main']['project_id']=$r['project_id'];
		$_SESSION['main']['project_name']=$r['project_name'];
		$_SESSION['main']['scenario_id']=$r['scenario_id'];
		$_SESSION['main']['scenario_name']=$r['scenario_name'];
		$_SESSION['main']['user_home']="/home/aamks_users/$r[email]";
		$_SESSION['main']['working_home']="/home/aamks_users/$r[email]/$r[project_name]/$r[scenario_name]";
		$this->query("UPDATE users SET active_scenario=$1 WHERE id=$2", array($r['scenario_id'], $_SESSION['main']['user_id']));
		$this->query("UPDATE users SET active_editor=$1 WHERE id=$2", array($r['active_editor'], $_SESSION['main']['user_id']));
	}
	/*}}}*/
	public function isChecked($val) {/*{{{*/
		if($val==1) { return 'div-yes'; }
			return 'div-no'; 
	}
	/*}}}*/
	public function htmlHead($site) { /*{{{*/
		# TODO: w form.php ja tez wlaczam inc.php. Pytanie czy cale to google jest w inc.php potrzebne.
		# moze powinno byc w index.php:main() wiecej tych rzeczy?

		# TODO: looks like a good place to control whether the user is logged in
		# if(empty($_SESSION['main']['user_id'])) { 
		# 	header("Location: /aamks/index.php");
		# 	exit();
		# }

		$header="<!DOCTYPE html>
		<html> 
		<head>
			<meta charset='utf-8'>
			<title>$site</title>
			<link href='https://fonts.googleapis.com/css?family=Roboto' rel='stylesheet'>
			<link rel='stylesheet' href='/aamks/css/aamks.css'>
			<link rel='shortcut icon' type='image/x-icon' href='/aamks/favicon.ico' />
			<meta name='viewport' content='width=device-width, initial-scale=1, minimum-scale=1'>
			<meta name='google-signin-scope' content='profile email'>
			<meta name='google-signin-client_id' content='352726998172-lmrbrs6c2sgpug4nc861hfb04f3s0sr6.apps.googleusercontent.com'>
			<script src='/aamks/js/jquery.js'></script>
			<script src='/aamks/js/form.js'></script>
			<script src='/aamks/js/utils.js'></script>
			<script type='module' src='/aamks/js/lodash.min.js'></script>
			<script src='/aamks/js/taffy-min.js'></script>
			<script src='https://apis.google.com/js/platform.js' async defer></script>
			<div id='hidden_form_container' style='display:none;'></div> 
		</head>
		<body>
		<div id=ajax_msg></div>
		";
		echo "$header";
		$this->anyMessages();
    }
/*}}}*/
	public function jabber_send($msg="content", $to="mimooh@jabber.at") {/*{{{*/
		exec("echo $msg | sendxmpp -d -t -u mimooh -p somepass -j jabber.at $to > /dev/null &");
	}
/*}}}*/
	public function logoutButton() {/*{{{*/
		if(!isset($_SESSION['main']['user_id'])) { header("Location: login.php"); }

		//$setup_user="<a href=/aamks/users.php?edit_user><img src=".$_SESSION['main']['user_photo']." style='width:50px; height:50px; padding-right:4px;'></a>";
		$setup_user="<a href=/aamks/users.php?edit_user class=blink>".$_SESSION['main']['user_name']."</a>";
		echo "
		<div style='position:fixed; top: 20px; right: 10px; text-align:right'>
		<a href=login.php?logout=1 class=blink >Logout</a><br>
		$setup_user
		</div>
		";
	}
/*}}}*/
	public function fatal($msg) {/*{{{*/
		$home="<a href=".$_SESSION['home_url']."><img id=home src=/aamks/css/home.svg></a>";
		echo "<fatal> $msg <br>$home</fatal>";
		die();
	}
/*}}}*/
	public function extractDate($date_str) {/*{{{*/
		return substr($date_str, 0, 10);
	}
/*}}}*/
	public function extractTime($date_str) {/*{{{*/
		return substr($date_str, 11, 8);
	}
/*}}}*/
	public function extractDateAndTime($date_str) {/*{{{*/
		return substr($date_str, 0, 19);
	}
/*}}}*/
	public function extractDateAndTimeShort($date_str) {/*{{{*/
		return substr($date_str, 0, 16);
	}
/*}}}*/
	public function msg($msg) {/*{{{*/
		echo "<msg>$msg</msg>";
		ob_flush();
		flush();
	}
/*}}}*/
	public function cannot($msg) {/*{{{*/
		echo "<cannot>$msg</cannot>";
	}
/*}}}*/
	public function query($qq,$arr=[],$success=0) { /*{{{*/
		// During installation AAMKS_SERVER and AAMKS_PG_PASS should be chosen and written to
		// /etc/apache2/envvars file
        extract($_SESSION);
		if(!empty(debug_backtrace()[1])) { 
			$caller=debug_backtrace()[1]['function'];
		} else {
			$caller="None";
		}
		$connect=pg_connect("dbname=aamks host=".getenv("AAMKS_SERVER")." user=aamks password=".getenv("AAMKS_PG_PASS"));
		$arr_str=implode(",", $arr);
		($result=pg_query_params($connect, $qq, $arr)) || $this->reportBug(implode("\n\n", array("caller: $caller()", "$qq", "params: [$arr_str]", pg_last_error($connect))));

		$k=pg_fetch_all($result);
		if($success==1) { $_SESSION['header_ok'][]="Saved"; }
		if(is_array($k)) { 
			return $k;
		} else {
			return array();
		}
    }
/*}}}*/
public function do_google_login(){/*{{{*/
	$ret=$_SESSION['nn']->query("SELECT * FROM users WHERE email = $1 ", array($_SESSION['g_email'] )); //
#psql aamks -c 'delete from users';
#psql aamks -c 'select * from users';
#psql aamks -c 'update users set google_id = NULL';
	if (!empty($ret[0])){ //alredy there is a user with that email. -need to Join it
		if(empty($ret[0]['google_id'])){ //if user already has a google_id
			$_SESSION['nn']->query("UPDATE users SET 
			google_id = $1, picture = $2 ,activation_token ='already activated' where email = $3 ", array($_SESSION['g_user_id'], $_SESSION['g_picture'],$_SESSION['g_email'] )); //
			$_SESSION['header_ok'][]="Email already used in Aamks! - merging accounts";
			$ret[0]['picture']=$_SESSION['g_picture'];
		}
	}else { //there is no user with that email in AAMKS - we need to create it
		$ret1=$_SESSION['nn']->query("insert into users (username, email, google_id,picture, password, activation_token) values ($1,$2,$3,$4,$5,$6) returning id", array( $_SESSION['g_name'], $_SESSION['g_email'], $_SESSION['g_user_id'], $_SESSION['g_picture'], "no password yet", "already activated"));
		$ret[0]=array("id"=>$ret1[0]['id'],"username"=>$_SESSION['g_name'],"email"=>$_SESSION['g_email'], "picture"=>$_SESSION['g_picture']);
		$_SESSION['header_ok'][]="Created google aamks account";
	}
	unset($_SESSION['g_name']);
	unset($_SESSION['g_email']);
	unset($_SESSION['g_user_id']);
	unset($_SESSION['g_picture']);
	unset($_SESSION['google_data']);
	return $ret[0];
}/*}}}*/
	public function querydd($qq,$arr=[]){ /*{{{*/
		# query debugger
		echo "<pre>";
		echo "$qq ";
		print_r($arr);
		echo "<br>";
		return array();
    }
	/*}}}*/
	public function prepare_pg_insert($arr) {/*{{{*/
		// Prepare $keys and $dolars from $_POST['arr'] for the query:
		// Example $arr=array("name"=>"Kowalski", "telefon"=>"612");
		// query("INSERT INTO przewozy($keys) VALUES($dolars) RETURNING id", $_POST['arr']);
		$keys=array_keys($arr);
		$dolars=[];
		foreach(array_keys($keys) as $k) {
			$dolars[]="\$".($k+1);
		}
		return array('keys'=>join(",", $keys), 'dolars'=>join(",", $dolars));
	}
/*}}}*/
	public function prepare_pg_update($arr) {/*{{{*/
		// Example $arr=array("name"=>"Kowalski", "telefon"=>"612");
		// $uu="name=$1, telefon=$2
		// query("UPDATE t set $uu WHERE id=1"), $_POST['arr']);
		
		$uu=[];
		foreach(array_keys($arr) as $k=>$v) {
			$uu[]="$v=\$".($k+1);
		}
		return implode(", ",$uu);
	}
/*}}}*/
	public function check_brute_force(){/*{{{*/
		$r=$this->query("SELECT count(*) from logins_log where inserted > now() - interval '1 minutes' and login_id=999 and ip=$1", array($_SERVER['REMOTE_ADDR']));
		if(($r[0]['count']) >= 4) {
			$this->reportbug("Too many login failures. Wait 60s.");
		}
	}/*}}}*/
	public function anyMessages() {/*{{{*/
		if(!empty($_SESSION['header_err'])) { 
			echo "<cannot>Error: ".implode("<br><br>Error: ", $_SESSION['header_err'])."</cannot>";
			$_SESSION['header_err']=[];
		} else if(!empty($_SESSION['header_ok'])) { 
			echo "<msg>".implode("<br><br>", $_SESSION['header_ok'])."</msg>";
			$_SESSION['header_ok']=[];
		} else if(!empty($_SESSION['header_ok_confirm'])) { 
			echo "<msg_confirm>".implode("<br><br>", $_SESSION['header_ok_confirm'])."</msg_confirm>";
			$_SESSION['header_ok_confirm']=[];
		}
	}
	/*}}}*/
}

