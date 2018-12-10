<?php
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
class Aamks {/*{{{*/
	public function __construct($site){
		if($site!="ajax") { $this->htmlHead($site); } 
		$_SESSION['header_err']=[];
		$_SESSION['header_ok']=[];
		$_SESSION['header_ok_confirm']=[];

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
	public function isChecked($val) {/*{{{*/
		if($val==1) { return 'div-yes'; }
			return 'div-no'; 
	}
	/*}}}*/
	public function htmlHead($site) { /*{{{*/
		# TODO: w form.php ja tez wlaczam inc.php. Pytanie czy cale to google jest w inc.php potrzebne.
		# moze powinno byc w index.php:main() wiecej tych rzeczy?
		$header="<!DOCTYPE html>
		<html> 
		<head>
			<meta charset='utf-8'>
			<title>$site</title>
			<link href='https://fonts.googleapis.com/css?family=Roboto' rel='stylesheet'>
			<link rel='stylesheet' href='/aamks/css/css.css'>
			<link rel='shortcut icon' type='image/x-icon' href='/aamks/favicon.ico' />
			<meta name='viewport' content='width=device-width, initial-scale=1, minimum-scale=1'>
			<meta name='google-signin-scope' content='profile email'>
			<meta name='google-signin-client_id' content='352726998172-lmrbrs6c2sgpug4nc861hfb04f3s0sr6.apps.googleusercontent.com'>
			<script src='/aamks/js/jquery.js'></script>
			<script src='/aamks/js/form.js'></script>
			<script src='https://apis.google.com/js/platform.js' async defer></script>
			<div id='hidden_form_container' style='display:none;'></div> 
		</head>
		<body>";
		echo "$header";
		$this->anyMessages();
    }
/*}}}*/
	public function jabber_send($msg="content", $to="mimooh@jabber.at") {/*{{{*/
		exec("echo $msg | sendxmpp -d -t -u mimooh -p somepass -j jabber.at $to > /dev/null &");
	}
/*}}}*/
	public function logoutButton() {/*{{{*/
		if(isset($_REQUEST['logout'])) { 
			session_destroy(); 
			header('Location: /aamks/index.php'); 
			}
		if(empty($_SESSION['user_id'])) { 
			if(isset($_GET['register'])) { register_form();}
			if(isset($_GET['reset'])) { reset_password();}
			if(isset($_GET['activation_token'])) { activate_user();}
			login_form();
			#google_js_login();
			exit();
		}
		echo "<div style='float:right; text-align:right; font-size:12px'>";
		echo"<div class='g-signin2' data-onsuccess='onSignIn' data-theme='dark'  data-longtitle='true' style='display:none'></div>";
		if(!empty($_SESSION['picture'])){
			echo "<a href=?edit_user ><img src=$_SESSION[picture] width=50px height=50px></a>";
		}else{
			echo "<a href=?edit_user class=blink>".$_SESSION['username']."</a>";
		}
		echo "<a href=?projects class=blink>My projects</a>
			<a href=?logout=1 class=blink onclick='signOut();' >Logout</a>
			</div>";
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
	public function set_user_variables($r){/*{{{*/

		$_SESSION['main']['user_id']=$r['id'];
		$_SESSION['main']['user_home']="/home/aamks_users/$r[email]";
		$_SESSION['main']['user_name']=$r['name']; # zmiany nazw
		$_SESSION['main']['user_photo']=$r['picture']; # zmiany nazw 
		$_SESSION['main']['email']=$r['email'];
		$_SESSION['home_url']="/aamks/index.php";

		#header("location:".me()); //TO
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

