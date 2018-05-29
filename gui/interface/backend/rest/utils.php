<?php

function nullToEmpty($arg) {
	if(is_null($arg)) {
		return "";
	} else {
		return $arg;
	}
}

function rrmdir($dir) { 
	if (is_dir($dir)) { 
		$objects = scandir($dir); 
		foreach ($objects as $object) { 
			if ($object != "." && $object != "..") { 
				if (is_dir($dir."/".$object))
					rrmdir($dir."/".$object);
				else
					unlink($dir."/".$object); 
			} 
		}
		rmdir($dir); 
	} 
}

function my_shell_exec($cmd, &$stdout=null, &$stderr=null) {
	$proc = proc_open($cmd,[
		1 => ['pipe','w'],
		2 => ['pipe','w'],
	],$pipes);
	$stdout = stream_get_contents($pipes[1]);
	fclose($pipes[1]);
	$stderr = stream_get_contents($pipes[2]);
	fclose($pipes[2]);
	return proc_close($proc);
}

?>
