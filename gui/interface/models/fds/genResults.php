<?php

class GenResults {

//	public function __construct($fds_object){
	public function __construct(){
		//$this->rawContent=explode(PHP_EOL, $raw);
		//$this->collectMsgErrors=[];
		//$this->collectMsgInfos=[];
		//$this->collectData=[];
		$this->calcCameraSettings();
	}

	private function getXB($meshes) {

		$distances = Array(
			"x"=>76.2,
			"y"=>45.9,
			"z"=>6
		);

		return $distances;
	}

	private function calcCameraSettings() {

		$windowWidth = 640;
		$windowHeight = 480;
		$windowFactor = $windowHeight / $windowWidth;

		$distances=$this->getXB("test");

		$zoom0 = 1;
		$rad2deg = 57.29577951;
		$deg2rad = 0.01745329;
		$zbar = $distances['y'] / $distances['x'];
		$width = ($zbar >= $windowFactor) ? $zbar / $windowFactor : 1;

		$ap = 45.0;

		$eyeFactor = -1.1 * $width / 2 / tan($ap * $deg2rad / 2);

		$eyeX = ($distances['x'] < $distances['y']) ? $distances['x'] / $distances['y'] / 2 : 0.5;
		$eyeY = ($distances['y'] < $distances['x']) ? $distances['y'] / $distances['x'] / 2 : 0.5;

		//error_log("eyeFactor: " . $eyeFactor);

		return $eyeFactor;

	}
}



?>
