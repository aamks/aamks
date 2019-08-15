<?php
session_name('aamks');
require_once("../inc.php"); 

function css() { #{{{
	$json=json_decode(file_get_contents("../../inc.json"),1);
	$css='';
	$css.="<style>\n";
	$css.="body { overflow: hidden; }\n";

	foreach($json['aamksGeoms'] as $v) {
		if(!empty($v['legendary']) || $v['x']=='UNDERLAY_SCALER') { $css.=".$v[x] { fill: $v[c]; stroke: $v[stroke]; stroke-width: $v[strokeWidth]; }\n"; }
	}
	foreach($json['aamksGeomsAttribs'] as $k=>$v) {
		if(isset($v['fill']))   { $css.=".$k { fill: $v[fill] !important; }\n"; }
		if(isset($v['stroke'])) { $css.=".$k { stroke: $v[stroke] !important; }\n"; }
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
	<script src='js/apainter_underlay.js'></script>
	<script src='js/view3d.js'></script>
	";
	echo css();
}
/*}}}*/
function main() { /*{{{*/
	$_SESSION['nn']->htmlHead("Apainter");
	site();
	if(isset($_SESSION['main'])) { echo " <script>var session_scenario='".$_SESSION['main']['scenario_name']."';</script>"; }
}
/*}}}*/
main();
?>
