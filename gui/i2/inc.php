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

	}

/*}}}*/
	private function reportbug($arr) {/*{{{*/
		$arr[]=""; $arr[]=""; 
		$reportquery=join("\n" , array('--------' , date("G:i:s"), $_SERVER['REMOTE_ADDR'], $_SERVER['HTTP_USER_AGENT'], $_SERVER['REQUEST_URI'], $arr[0] , $arr[1] , $arr[2] , "\n\n"));
		mail('mimoohowy@gmail.com, stanislaw.lazowy@gmail.com', 'aamks bug!', "$reportquery", "from: mimooh@inf.sgsp.edu.pl"); 
		echo "<fatal>".$arr[0]."</fatal>"; 
		echo "<br><br><br><br><br><a href=".$_SESSION['home_url']."><img id=home src=css/home.svg></a>";
		die();
}
/*}}}*/
	public function isChecked($val) {/*{{{*/
		if($val==1) { return 'div-yes'; }
			return 'div-no'; 
	}
	/*}}}*/
	public function htmlHead($site) { /*{{{*/
		$header="<!DOCTYPE html>
		<html> 
		<head>
			<meta charset='utf-8'>
			<title>$site</title>
			<link href='https://fonts.googleapis.com/css?family=Roboto' rel='stylesheet'>
			<link rel='stylesheet' href='css/css.css'>
			<meta name='viewport' content='width=device-width, initial-scale=1, minimum-scale=1'>
			<script src='js/jquery.js'></script>
			<script src='js/aamks.js'></script>
		</head>
		<body class=$site>";
		echo "$header";
		$this->anyMessages();
    }
/*}}}*/
	public function jabber_send($msg="content", $to="mimooh@jabber.at") {/*{{{*/
		exec("echo $msg | sendxmpp -d -t -u mimooh -p somepass -j jabber.at $to > /dev/null &");
	}
/*}}}*/
	public function logoutButton() {/*{{{*/
		if(isset($_REQUEST['logout'])) { session_destroy(); header('Location: /i2/i2.php'); }
		//if(empty($_SESSION['user_id'])) { header('Location: /login.php'); }
		echo "<div style='float:right; text-align:right; font-size:12px'>";
		echo "<a href=?edit_user ><img src=$_SESSION[picture] width=50px height=50px></a>";
		echo "<a href=?edit_user class=blink>".$_SESSION['username']."</a>";
		echo "<a href=?projects class=blink>My projects</a>
			<a href=?logout=1 class=blink>Logout</a>
			</div>
		";
	}
/*}}}*/
	public function fatal($msg) {/*{{{*/
		echo "<fatal> $msg </fatal>";
		echo "<br><br><br><br><br><br><a href=".$_SESSION['home_url']."><img id=home src=css/home.svg></a>";
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
		$caller=debug_backtrace()[1]['function'];
		$connect=pg_connect("dbname=aamks host=".getenv("AAMKS_SERVER")." user=aamks password=".getenv("AAMKS_PG_PASS"));

		($result=pg_query_params($connect, $qq, $arr)) || $this->reportBug(array("DB error\n\ncaller: $caller()\n\n", "$qq", pg_last_error($connect)));

		$k=pg_fetch_all($result);
		if($success==1) { echo "<msg>Saved</msg>"; }
		if(is_array($k)) { 
			return $k;
		} else {
			return array();
		}
    }
/*}}}*/
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
			$this->reportbug(["Too many login failures. Wait 60s."]);
		}
	}/*}}}*/
	public function anyMessages() {/*{{{*/
		if(!empty($_SESSION['header_err'])) { 
			echo "<cannot>Error: ".implode("<br><br>Error: ", $_SESSION['header_err'])."</cannot>";
			$_SESSION['header_err']=[];
		} else if(!empty($_SESSION['header_ok'])) { 
			echo "<msg>".implode("<br><br>", $_SESSION['header_ok'])."</msg>";
			$_SESSION['header_ok']=[];
		}
	}
	/*}}}*/


}

