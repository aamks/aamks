<?php
session_name('aamks');
require_once("lib.form.php"); 
session_start();
#phpinfo();
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
class Aamks {/*{{{*/
	public function __construct($site){
		if($site!="ajax") { $this->htmlHead($site); } 
		$_SESSION['header_err']=[];
		$_SESSION['header_ok']=[];
		$_SESSION['header_ok_confirm']=[];
		$_SESSION['home_url']="/aamks/index.php";
	}

/*}}}*/

	public function ch_main_vars($r) { #{{{
		if(!array_key_exists('user_id', $r) || !array_key_exists('user_name', $r) || !array_key_exists('user_photo', $r) || !array_key_exists('project_id', $r) || !array_key_exists('project_name', $r) || !array_key_exists('scenario_id', $r) || !array_key_exists('scenario_name', $r)) { dd($r); die("ch_main_vars() bug"); }
		if(empty($r['preferences'])) { $r['preferences']=$this->mk_default_preferences($r['user_id']); }

		$prefs=json_decode($r['preferences'],1);
		ksort($prefs);
		unset($r['preferences']);

		$_SESSION['main']['user_id']=$r['user_id'];
		$_SESSION['main']['project_id']=$r['project_id'];
		$_SESSION['main']['user_name']=$r['user_name'];
		$_SESSION['main']['user_photo']=$r['user_photo'];
		$_SESSION['main']['project_name']=$r['project_name'];
		$_SESSION['main']['scenario_id']=$r['scenario_id'];
		$_SESSION['main']['scenario_name']=$r['scenario_name'];
		$_SESSION['main']['user_home']="/home/aamks_users/$r[email]";
		$_SESSION['main']['working_home']="/home/aamks_users/$r[email]/$r[project_name]/$r[scenario_name]";

		$_SESSION['prefs']=[];
		foreach($prefs as $k=>$v) { 
			$_SESSION['prefs'][$k]=$v;
		}
		$this->query("UPDATE users SET active_scenario=$1 WHERE id=$2", array($r['scenario_id'], $_SESSION['main']['user_id']));
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
	public function scenario_from_template($header='form.php?edit') { # {{{
		$template_json=get_template_defaults('setup1');
		$template_json['project_id']=$_SESSION['main']['project_id'];
		$template_json['scenario_id']=$_SESSION['main']['scenario_id'];
		$s=json_encode($template_json, JSON_NUMERIC_CHECK);
		$this->write_scenario($s, $header);
	}
/*}}}*/

	private function assert_json_ids($data) { #{{{
		// User is not allowed to alter their project/scenario ids
		// At least textarea editor would allow for this

		$conf=json_decode($data,1);
		$conf['project_id']=$_SESSION['main']['project_id'];
		$conf['scenario_id']=$_SESSION['main']['scenario_id'];
		return json_encode($conf, JSON_NUMERIC_CHECK);
	}
	/*}}}*/
	public function write_scenario($data, $header='form.php?edit') { #{{{
		$data=$this->assert_json_ids($data);
		$file=$_SESSION['main']['working_home']."/conf.json";
		$saved=file_put_contents($file, $data);
		chmod($file, 0666);
		if($saved<=0) { 
			$_SESSION['header_err'][]="problem saving $file";
		}
		header("Location: $header");
	}
	/*}}}*/

	public function rawMenu() { #{{{
		$r=$_SESSION['nn']->query("SELECT s.* FROM scenarios s LEFT JOIN projects p ON s.project_id=p.id WHERE user_id=$1 ORDER BY modified DESC", array($_SESSION['main']['user_id']));
		$menu='';
		$menu.="<close-left-menu-box><img src=/aamks/css/close.svg></close-left-menu-box><br>";
		$menu.="<img width=100 src=/aamks/logo.svg><br><br>";
		$menu.="<font color='red'>ATTENTION</font><br><font size=1>This is beta-version of<br>AAMKS. Please report<br> bugs and feedback at:<br><a href='mailto:projectaamks@gmail.com'>projectaamks@gmail.com</a></font><br><br>";
		$menu.="<a id=menu-active-scenario-label href=/aamks/form.php?edit class=bblink>".$_SESSION['main']['scenario_name']."</a><br>";
		$menu.="<a class=blink href=/aamks/projects.php?projects_list>Projects</a><br>";
		$menu.="<a class=blink href=/aamks/apainter/index.php>Apainter</a><br>";
		$menu.="<a class=blink href=/aamks/animator/index.php>Animator</a><br>";
		$menu.="<a class=blink href=/aamks/simulations.php>Summary</a><br>";
		$menu.="<a class=blink id=launch_simulation>Launch</a><br>";
		$menu.="<a class=blink href=/aamks/halt.php>Manage jobs</a><br>";
		$menu.="<br>";
		$menu.="Scenario<br><select id='choose_scenario'>\n";
		$menu.="<option value=".$_SESSION['main']['scenario_id'].">".$_SESSION['main']['scenario_name']."</option>\n";
		foreach($r as $k=>$v) {
			$menu.="<option value='$v[id]'>$v[scenario_name]</option>\n";
		}
		$menu.="</select>\n";
		return $menu;
	}
/*}}}*/
	public function menu($title='') { /*{{{*/
		$this->logoutButton();
		$menu=$this->rawMenu();
		echo "<left-menu-box> $menu </left-menu-box> <div id=content-main style='height: 95vh; margin-left: 150px; padding: 0px;'>";
		if(!empty($title)) { echo "<tt>$title</tt>"; }
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
			<script src='https://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.17.21/lodash.min.js'></script>
			<script src='/aamks/js/taffy-min.js'></script>
			<script src='https://apis.google.com/js/platform.js' async defer></script>
			<div id='hidden_form_container' style='display:none;'></div> 
		</head>
		<body>
		<div id=amsg></div>
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
		echo "<fatal>$msg</fatal>";
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
		// During installation AAMKS_PG_PASS should be chosen and written to
		// /etc/apache2/envvars file
        extract($_SESSION);
		if(!empty(debug_backtrace()[1])) { 
			$caller=debug_backtrace()[1]['function'];
		} else {
			$caller="None";
		}
		$connect=pg_connect("dbname=aamks host=127.0.0.1 user=aamks password=".getenv("AAMKS_PG_PASS"));
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
#psql aamks -c 'update users set preferences=NULL';
	if (!empty($ret[0])){ //alredy there is a user with that email. -need to Join it
		if(empty($ret[0]['google_id'])){ //if user already has a google_id
			$_SESSION['nn']->query("UPDATE users SET 
			google_id = $1, user_photo = $2 ,activation_token ='already activated' where email = $3 ", array($_SESSION['g_user_id'], $_SESSION['g_picture'],$_SESSION['g_email'] )); //
			$_SESSION['header_ok'][]="Email already used in Aamks! - merging accounts";
			$ret[0]['user_photo']=$_SESSION['g_picture'];
		}
	}else { //there is no user with that email in AAMKS - we need to create it
		$ret1=$_SESSION['nn']->query("insert into users (user_name, email, google_id,user_photo, password, activation_token) values ($1,$2,$3,$4,$5,$6) returning id", array( $_SESSION['g_name'], $_SESSION['g_email'], $_SESSION['g_user_id'], $_SESSION['g_picture'], "no password yet", "already activated"));
		$ret[0]=array("id"=>$ret1[0]['id'],"username"=>$_SESSION['g_name'],"email"=>$_SESSION['g_email'], "user_photo"=>$_SESSION['g_picture']);
		$_SESSION['header_ok'][]="Created google aamks account";
	}
	unset($_SESSION['g_name']);
	unset($_SESSION['g_email']);
	unset($_SESSION['g_user_id']);
	unset($_SESSION['g_picture']);
	unset($_SESSION['google_data']);
	return $ret[0];
}/*}}}*/
	public function preferences_update_param($key,$val){/*{{{*/
		$r=$this->query("SELECT preferences FROM users WHERE id=$1", array($_SESSION['main']['user_id']));
		$z=json_decode($r[0]['preferences'], 1);
		$z[$key]=$val;
		$r=$this->query("UPDATE users SET preferences=$1 WHERE id=$2", array(json_encode($z), $_SESSION['main']['user_id']));
		$_SESSION['prefs'][$key]=$val;

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

	private function mk_default_preferences($user_id) { #{{{
		$default_preferences='{"apainter_editor": "easy", "navmesh_debug": 0, "apainter_labels": 1, "partitioning_debug": 0 }';
		$this->query("UPDATE users SET preferences=$1 WHERE id=$2", array($default_preferences, $user_id));
		return $default_preferences;
	}
/*}}}*/
	private function reportbug($details) {/*{{{*/
		$home="<a href=".$_SESSION['home_url']."><img id=home src=/aamks/css/home.svg></a>";
		$reportquery=join("\n\n" , array(date("G:i:s"), "srv:$_SERVER[SERVER_NAME]", "cli:$_SERVER[REMOTE_ADDR]", $_SERVER['HTTP_USER_AGENT'], $_SERVER['REQUEST_URI'], $details, "\n\n"));
		$ignore=0;
		if(preg_match("/(invalid input syntax for integer)|(nieprawidłowa składnia wejścia dla typu integer)/", $details)) { $ignore=1; } # webcrawlers, not really query bugs
		if(preg_match("/MJ12bot/", $_SERVER['HTTP_USER_AGENT']))                                                           { $ignore=1; } # webcrawlers, not really query bugs

		if($ignore==0) {
			# TODO: setup $AAMKS_NOTIFY
			# TODO: replace mail() with gmail
			mail('mimoohowy@gmail.com, stanislaw.lazowy@gmail.com', 'aamks bug!', "$reportquery", "from: mimooh@inf.sgsp.edu.pl"); 
		}
		echo "<fatal>DB error. Reported to the administrator.<br>$home</fatal>"; 
		die();
}
/*}}}*/
}

