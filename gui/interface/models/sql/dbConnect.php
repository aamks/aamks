<?php

	class dbConnect {
		public function pg_read($qq,$arr=[]) { 
			
			$connect=pg_connect("host=localhost port=5432 dbname=wizfds user=fliszoostrozny password=dupa2014");
			$result=pg_query_params($connect, $qq, $arr); 
			// || $this->reportBug(array("$qq", $arr, pg_last_error($connect));
			$k=pg_fetch_all($result);
			pg_close();
			return($k);
		}
		
		public function pg_change($qq,$arr=[]) { 
			
			$connect=pg_connect("host=localhost port=5432 dbname=wizfds user=fliszoostrozny password=dupa2014");
			$result=pg_query_params($connect, $qq, $arr); 
			$rows=pg_affected_rows($result);
			
			pg_close();
			return($rows);
		}

		public function pg_create($qq,$arr=[]) { 
			
			$connect=pg_connect("host=localhost port=5432 dbname=wizfds user=fliszoostrozny password=dupa2014");
			$result=pg_query_params($connect, $qq, $arr); 
			$rows=pg_affected_rows($result);
			$k=pg_fetch_all($result);
			pg_close();
			return($k);
		}

	
		public function pgdd($qq,$arr){ 
			echo "$qq ";
			print_r($arr);
		}
		
		public function reportBug($arr) {
			$current_time=date("Y-m-d G:i:s");
			$params=print_r($arr[1],1);
			$reportQuery=join("\n" , array('--------' ,  $current_time."/".$_SERVER['REMOTE_ADDR'] , $_SERVER['REQUEST_URI'], $arr[0] , $params, $arr[2] , "\n\n"));
			//mail('m.ilnicki3@gmail.com', 'wizfds bug?', "$reportQuery", "From: wizfds@inf.sgsp.edu.pl"); 
			//die("<div class=die>Database error. This error is automatically reported to administrator.</div>");
			
		}


	}
?>
