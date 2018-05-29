<?php

	class dbConnect {

		public $host = 'localhost';
		public $port = '5432';
		public $db = 'aamks';
		public $dbUser = 'aamks';
		public $dbPass;

		public function pg_read($qq,$arr=[]) { 
			
			$dbPass = getenv('AAMKS_PG_PASS');
			$connect=pg_connect("host='$this->host' port='$this->port' dbname='$this->db' user='$this->dbUser' password='$this->dbPass'");
			($result=pg_query_params($connect, $qq, $arr)) || $this->reportBug(array("$qq", $arr, pg_last_error($connect)));
			$k=pg_fetch_all($result);
			pg_close();
			return($k);
		}
		
		public function pg_change($qq,$arr=[]) { 
			
			$dbPass = getenv('AAMKS_PG_PASS');
			$connect=pg_connect("host='$this->host' port='$this->port' dbname='$this->db' user='$this->dbUser' password='$this->dbPass'");
			($result=pg_query_params($connect, $qq, $arr)) || $this->reportBug(array("$qq", $arr, pg_last_error($connect))); 
			$rows=pg_affected_rows($result);
			pg_close();
			return($rows);
		}

		public function pg_create($qq,$arr=[]) { 
			
			$dbPass = getenv('AAMKS_PG_PASS');
			$connect=pg_connect("host='$this->host' port='$this->port' dbname='$this->db' user='$this->dbUser' password='$this->dbPass'");
			($result=pg_query_params($connect, $qq, $arr)) || $this->reportBug(array("$qq", $arr, pg_last_error($connect))); 
			$rows=pg_affected_rows($result);
			$k=pg_fetch_all($result);
			pg_close();
			return($k);
		}

		public function reportBug($arr) {

			$current_time=date("Y-m-d G:i:s");
			$params=print_r($arr[1],1);
			$reportQuery=join("\n" , array('--------' ,  $current_time."/".$_SERVER['REMOTE_ADDR'] , $_SERVER['REQUEST_URI'], $arr[0] , $params, $arr[2] , "\n\n"));
			mail('mateusz.fliszkiewicz@gmail.com', 'Aamks bug?', "$reportQuery", "From: aamks@inf.sgsp.edu.pl"); 
		}
	}
?>
