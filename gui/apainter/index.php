<?php
session_name('aamks');
require_once("../inc.php"); 

function css() { #{{{
	$json=json_decode(file_get_contents("../../inc.json"),1);
	$css='';
	$css.="<style>\n";
	$css.="body { overflow: hidden; }\n";

	foreach($json['aamksGeoms'] as $v) {
		if(!empty($v['legendary']) || $v['x']=='UNDERLAY_SCALER'|| $v['x']=='VSTAI'|| $v['x']=='VHALL') 
			{ 
				$opacity = '1';
				if ($v['x']=='VSTAI'|| $v['x']=='VHALL')
					$opacity = '0.3';
				$css.=".$v[x] { fill: $v[c]; stroke: $v[stroke]; stroke-width: $v[strokeWidth]; opacity: $opacity }\n"; 
			}
	}

	$css.=".cg-selected { stroke: #ff0; fill: #ff8; }\n"; 
	$css.="</style>";
	return $css;
}
/*}}}*/
function site() {/*{{{*/
	echo "
	<script src='js/d3.v4.min.js'></script>
	<script src='js/polygon_tools.js'></script>
	<script src='js/apainter.js'></script>
	<script src='js/aunderlay.js'></script>
	<script src='js/view3d.js'></script>
	";
	echo css();
}
/*}}}*/
function main() { /*{{{*/
	if(!array_key_exists('nn', $_SESSION))
	{
		header("Location: ../login.php?session_finished_information=1");
	}
	$_SESSION['nn']->htmlHead("Apainter");
	site();
	if(isset($_SESSION['main'])) { 
		$conf_file = json_decode(file_get_contents($_SESSION['main']['working_home']."/conf.json"), true);
		if (array_key_exists('editable', $conf_file) && ($conf_file['editable'] == 0)){
			$editable = 0;
		} else {$editable = 1;}
		echo " <script>var session_scenario='".$_SESSION['main']['scenario_name']."';</script>";
		echo " <script>var session_editable='$editable';</script>"; 
	}
}
/*}}}*/
main();
?>
