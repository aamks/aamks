// globals//{{{
// cd $AAMKS_PATH/gui/apainter/js/; git log -p apainter.js | v
//
var win=[ $(window).width()-30, $(window).height()-50];
var db=TAFFY(); // http://taffydb.com/working_with_data.html
var zt={'x':0, 'y':0, 'k':1}; // zoom transform
var cg={}; // current geom, the one that is currently selected, created, removed, etc.
var cgID;
var gg;
var ggx;
var zoom;
var currentView='2d';
var activeLetter='r';
var svg;
var floor=0;
var floorsCount=1;
var floorsZ0={0:0};
var floors_dimz={0:350};
var building;
var buildingLabels;
var ax={};
var snapLinesSvg;
var snapLinesArr={};
var defaults={'door_dimz': 200, 'floor_teleport_width':70,'door_width': 90, 'window_dimz': 150, 'window_offsetz': 100 };
var activeSnap={};
var undoBuffer=[];
var evacueeRadius;
var threejsPlay=1;
var floor_teleport_up_direction=0;
var floor_teleport_down_direction=0;
var external_doors = [];
var teleports = [];
var rooms_and_adjecent_doors_and_holes = {};
var virtual_obj_parents = {};
//}}}
function debug() {//{{{
	console.clear();

	dd(undoBuffer);
	//dd($("#ufloor"+floor)[0]);
	//dd($('#apainter-svg')[0]); 
	//dd($('#uimg0')[0]); 
	//ddd();
	//return;
	//dd($('#building')[0]);
	//dd($('#floor0')[0]);
	//dd(db2cadjson());
	//dd($('#floor0')[0]);
	//dd("f2", $('#ufloor2')[0]);
	//_.each(db({'letter':'s'}).get(), function(v) {
	//});
}
//}}}
function tempChrome() {//{{{
	// At some point chrome will enable separate css transformations and this call will be removed
	d3.select('body').append('temp_checker').attr("id", "temp_checker").style("scale", 1);
	if(d3.select('#temp_checker').style("scale")=='') {
		$("body").html("<br><br><br><center>Aamks requires the experimental web features of Google Chrome.<br>You can paste the orange text to the address bar and enable them<br><span style='color: orange'>chrome://flags/#enable-experimental-web-platform-features</span>"); 
		throw new Error("");
	}
} //}}}
// on start{{{
$(function()  { 
	window.oncontextmenu = function () { return false; }    // cancel default menu  
	tempChrome();
	$.getJSON("inc.json", function(x) {
		gg=x['aamksGeoms'];
		ggx=x['aamksGeomsMap'];
		evacueeRadius=x['evacueeRadius'];
		sceneBuilder();
		importCadJson();
		if (session_editable != 0){
		keyboardEvents();
		registerListeners();
		registerListenersUnderlay();
		$('right-menu-box').fadeOut();
		} else {
			$('legend0').html(`<h3 style="background-color:#c60c0c; font-size:16px; display:inline-block;">
				You have already launched this scenario - it is in read-only mode. To make changes create a new scenario or copy/reset this one.`);
			$('legend2').html('');
			start3dView();
		}
		//dd($('#building')[0]);
	});
});
//}}}
function registerListeners() {//{{{
	$("right-menu-box").on("click"     , "#btn_copy_to_floor"       , function() { floorCopy() });
	$("right-menu-box").on("click"     , "#btn_add_floor"           , function() { addFloor() });
	$("right-menu-box").on("click"     , "#btn_delete_floor"        , function() { deleteFloor() });
	$("right-menu-box").on("mouseover" , ".bulkProps"               , function() { cgSelect($(this).attr('id')                                                                    , 1 , 0); });
	$("right-menu-box").on("click"     , '.bulkProps'               , function() { cgSelect($(this).attr('id'));  });
	$("body").on("click"               , '#apainter-save'           , function() { if($("#cad-json-textarea").val()===undefined) { db2cadjson(); } else { saveTxtCadJson(); } });
	$("body").on("click"               , '#apainter-next-view'      , function() { nextView(); });
	$("body").on("click"               , '#button-help'             , function() { showHelpBox(); });
	$("body").on("click"               , '#button-setup'            , function() { showGeneralBox(); });
	$("body").on("click"               , '.legend'                  , function() { activeLetter=$(this).attr('letter'); cgStartDrawing(); });
	$("body").on("change"              , '#alter-mvent-throughput'  , function() { saveRightBox(); });
	$("body").on("change"              , '#alter-flow-direction'    , function() { saveRightBox(); });
	$("body").on("change"              , '#alter-air-grille-surface', function() { saveRightBox(); });
	$("body").on("keyup"               , '#alter-polypoints'        , function() { saveRightBox(); });
	$("body").on("keyup"               , '#alter-z0'                , function() { saveRightBox(); });
	$("body").on("keyup"               , '#alter-z1'                , function() { saveRightBox(); });
	$("body").on("keyup"               , '#alter-px'                , function() { saveRightBox(); });
	$("body").on("keyup"               , '#alter-py'                , function() { saveRightBox(); });
	$("body").on("mouseleave"          , 'right-menu-box'           , function() { saveRightBox(); showCgPropsBox(); });
	$("body").on("change"              , '#floor'                   , function() { saveRightBox(); showCgPropsBox(); showGeneralBox();});

	$("body").on("mousedown", "#apainter-svg", function(e){
		if(e.which==3) {
			cgEscapeCreate();
			if (['circle', 'polyline'].includes(event.target.tagName)) { 
				cgSelect(event.target.id);
			} else { 
				cg={};
			}
		}
	});

}
//}}}
function keyboardEvents()  { // {{{
	$(this).keyup((e) =>   { if (e.target.nodeName != 'INPUT' && e.key in gg && ! e.ctrlKey )   { cgEscapeCreate(); activeLetter=e.key; cgStartDrawing(); } });
	$(this).keydown((e) => { if (e.target.nodeName != 'INPUT' && e.key == 'v')                  { cgEscapeCreate(); nextView(); } });
	$(this).keydown((e) => { if (e.target.nodeName != 'INPUT' && e.key == 'p')                  { $("#p1").remove() ; } });
	$(this).keydown((e) => { if (e.target.nodeName != 'INPUT' && e.key == 'n')                  { cgEscapeCreate(); changeFloor(calcNextFloor()); start2dView(); } });
	$(this).keydown((e) => { if (e.target.nodeName != 'INPUT' && e.key == '=')                  { cgEscapeCreate(); resetView(); } });
	$(this).keyup((e) =>   { if (e.target.nodeName != 'INPUT' && e.key == 'i' && e.ctrlKey)     { startTxtView(); } }) ;
	$(this).keydown((e) => { if (e.target.nodeName != 'INPUT' && e.key == 'r' && e.ctrlKey)     { alert('Refreshing will clear unsaved Aamks data. Continue?') ; } }) ;
	$(this).keydown((e) => { if (e.target.nodeName != 'INPUT' && e.key == 's' && e.ctrlKey)     { cgEscapeCreate(); e.preventDefault(); db2cadjson(); importCadJson(); } }) ;
	$(this).keyup((e) =>   { if (e.target.nodeName != 'INPUT' && e.key == 'z' && e.ctrlKey)     { undoApply(); } }) ;
	$(this).keydown((e) => { if (e.target.nodeName != 'INPUT' && e.key == 'x' && ! isEmpty(cg)) { cgEscapeCreate(); cgRemove(); }});
	$(this).keydown((e) => { if (e.target.nodeName != 'INPUT' && e.key == 'l')                  { cgEscapeCreate(); bulkProps(); } });
	$(this).keydown((e) => { if (e.key == 'Escape')												{ escapeAll(); } });
	// debug
	$(this).keydown((e) => { if (e.target.nodeName != 'INPUT' && e.key == ']') { debug(); }});
}
//}}}
function dddx() {//{{{
	dd(cg.name, JSON.stringify(cg.polypoints));
}
//}}}
function ddd(current=0) {//{{{
	if(current!=0) { 
		dd(db({'name': cg.name}).get()[0]);
	} else {
		dd(db().get());
	}
}
//}}}
function dddX() {//{{{
	_.each(db().get(), function(v) {
		dd(v.name, JSON.stringify(v.polypoints));
	});
}
//}}}
function escapeAll(rmbClose=1) {//{{{
	cgEscapeCreate(); 
	legend(); 
	$("#buildingLabels").html(""); 
	$("#apainter-texts-pos").html(''); 
	if(rmbClose==1) { $("right-menu-box").css("display", "none"); }
	underlayPointerEvents(stopDragging=1);
}
//}}}
function getBbox() {//{{{
	p0=[1000000,null], p1=[null,-1000000];
	_.each(cg.polypoints, function(point) { 
		if(point[0] < p0[0]) { p0=point; }
		if(point[0] == p0[0] && point[1] < p0[1] ) { p0=point; }
		if(point[1] > p1[1]) { p1=point; }
		if(point[1] == p1[1] && point[0] > p1[0] ) { p1=point; }
	});
	return {'min': { 'x': p0[0], 'y': p0[1] }, 'max': {'x': p1[0], 'y': p1[1] } };
}
//}}}

function getPointsTriangleFloorTeleport(m){
	string_points = "";
	if (m?.polypoints?.[0]?.[0] !== undefined)
	{
		string_points += m.polypoints[0][0].toString();
		string_points +=",";
		string_points += (m.polypoints[0][1]).toString();
		string_points += " ";

		string_points += m.polypoints[1][0].toString();
		string_points +=",";
		string_points += (m.polypoints[1][1]).toString();
		string_points += " ";

		string_points += m.polypoints[2][0].toString();
		string_points +=",";
		string_points += (m.polypoints[2][1]).toString();
		string_points += " ";

		string_points += m.polypoints[3][0].toString();
		string_points +=",";
		string_points += (m.polypoints[3][1]).toString();
	}
	return string_points;
}


function cgSvg(pparent='auto') { //{{{
	if(pparent=='auto')  { pparent="#floor"+cg.floor; }
	if (cg.type == 'evacuee') { 
		var elem='circle';
	} else {
		var elem='polyline';
	}
	d3.select(pparent)
		.append(elem)
		.attr('id', cg.name)
		.attr('class', gg[cg.letter].t + " " +gg[cg.letter].x)
		.attr('points', svgPolyline(cg))
		.attr('cx', cg.polypoints[0][0])
		.attr('cy', cg.polypoints[0][1])
		.attr('r', evacueeRadius)
}


function cgSvgVirtualObj(obj) { //{{{

	if (obj.name in virtual_obj_parents){

		for (let i = 0; i < virtual_obj_parents[obj.name].length; i++) {
	 		pparent="#floor"+virtual_obj_parents[obj.name][i][2];
			var elem='polyline';
			d3.select(pparent)
			.append(elem)
			.attr('id', virtual_obj_parents[obj.name][i][0])
			.attr('class', gg[virtual_obj_parents[obj.name][i][1]].t + " " +gg[virtual_obj_parents[obj.name][i][1]].x)
			.attr('points', svgPolyline(obj))
			.attr('cx', obj.polypoints[0][0])
			.attr('cy', obj.polypoints[0][1])
			.attr('r', evacueeRadius)

		}
	}
}
//}}}
function cgDb(undoRegister=1) { //{{{
	if(cg.type=='underlay_scaler') { return; }
	var lines=[];

	if(cg.type=='room') {
		_.each(cg.polypoints, function(point) { 
			lines.push(point);
		});
	} else {
		lines.push([-100000, -100000], [-100000, -100000], [-100000, -100000], [-100000, -100000]);
	}
	db({"name": cg.name}).remove();

	addDefaultCgProps();
	cad_json=generateObjectCadJson(cg);

	b=getBbox();
	db.insert({"name": cg.name, "idx": cg.idx, "cad_json": cad_json, "letter": cg.letter, "type": cg.type, "lines": lines, "polypoints": cg.polypoints, "z": cg.z, "floor": cg.floor, "mvent_throughput": cg.mvent_throughput, "flow_direction":cg.flow_direction, "air_grille_surface":cg.air_grille_surface, "exit_weight":cg.exit_weight,"room_exits_weights":cg.room_exits_weights, "evacuees_density": cg.evacuees_density, "minx": b.min.x, "miny": b.min.y, "maxx": b.max.x, "maxy": b.max.y, "teleport_from":cg.teleport_from, "teleport_to":cg.teleport_to});
	if(undoRegister==1) { undoBufferRegister('insert'); }

}
//}}}

function cgDbVirtualObj(parent) { //{{{
	var lines=[];
	if(parent.type=='room') {
		_.each(parent.polypoints, function(point) { 
			lines.push(point);
		});
	} else {
		lines.push([-100000, -100000], [-100000, -100000], [-100000, -100000], [-100000, -100000]);
	}

	virtual_obj_name_map = {'s':'vs', 'a':'va'}
	virtual_obj_map = {'s':gg[virtual_obj_name_map['s']]['t'], 'a':gg[virtual_obj_name_map['a']]['t']}


	let z_min = parent.z[0];
	let z_max = parent.z[1];
	let floors = [];

	for(let floor = 0; floor < floorsCount; floor++){
		if (floorsZ0[floor] > z_min && floorsZ0[floor] < z_max)
			if (floor != parent.floor)
				floors.push(floor);
	}
	if (parent.name in virtual_obj_parents){
		for (let i = 0; i < virtual_obj_parents[parent.name].length; i++) {
			var vObjId = virtual_obj_parents[parent.name][i][0];
	 		db({"name": vObjId}).remove();
	 		document.getElementById(vObjId).remove();
		}
	}

	virtual_obj_parents[parent.name] = [];

	b=getBbox();
	_.each(floors, function(floor){
		vcgIDx=db({"type": virtual_obj_map[parent.letter]}).max("idx")+1;
		vcgName = virtual_obj_name_map[parent.letter]+vcgIDx;

		db.insert({"name": vcgName, "idx": vcgIDx, "cad_json": parent.cad_json, 
			"letter": virtual_obj_name_map[parent.letter], "type": virtual_obj_map[parent.letter], "lines": lines, 
			"polypoints": parent.polypoints, "z": parent.z, "floor": parent.floor,
			"exit_weight":parent.exit_weight,"room_exits_weights":parent.room_exits_weights, 
			"evacuees_density": parent.evacuees_density, "minx": b.min.x, "miny": b.min.y, 
			"maxx": b.max.x, "maxy": b.max.y, "teleport_from":parent.teleport_from, "teleport_to":parent.teleport_to});

		virtual_obj_parents[parent.name].push([vcgName,virtual_obj_name_map[parent.letter],floor]);

	})
}
//}}}

function generateObjectCadJson(obj){
	cad_json = {};
	cad_json['points']=JSON.stringify(obj.polypoints);
	cad_json['idx']=obj.idx;
	cad_json['z']=JSON.stringify(obj.z);

	if(obj.type=='door') {
		if (obj.exit_weight != null)
			cad_json["exit_weight"]=obj.exit_weight;
	} else if(obj.type=='room') {
		cad_json["evacuees_density"]=obj.evacuees_density;
		if (obj.room_exits_weights != null)
			cad_json["room_exits_weights"]=obj.room_exits_weights; 
	} else if(obj.type=='mvent') {
		cad_json["mvent_throughput"]=obj.mvent_throughput;
		if (obj.flow_direction != null)
			cad_json["flow_direction"]=obj.flow_direction;
		if (obj.air_grille_surface != null)
			cad_json["air_grille_surface"]=obj.air_grille_surface;
	}else if(obj.type=='floor_teleport') {
		cad_json["teleport_from"]=obj.teleport_from;
		cad_json["teleport_to"]=obj.teleport_to;
		if (obj.exit_weight != null)
			cad_json["exit_weight"]=obj.exit_weight;
	}

	return cad_json;
}

function undoApply() {//{{{
	escapeAll();
	if (undoBuffer.length==0) { return; }
	cg=undoBuffer.pop();
	if(cg.op=='insert') { 
		cgRemove(undoRegister=0);
	} else {
		$("#"+cg.name).remove(); cgDb(undoRegister=0); cgSvg(); updateSnapLines();
	}
}
//}}}
function undoBufferRegister(op) {//{{{
	var data=deepcopy(db({"name": cg.name}).get()[0]);
	data.op=op;
	undoBuffer.push(data);
}
//}}}
function cgIdUpdate() {//{{{
	var similarTypes = ['door', 'hole', 'window'];
	if (similarTypes.includes(gg[activeLetter].t)){
		var maxIdDoor = db({"type": similarTypes[0]}).max("idx");
		var maxIdHole = db({"type": similarTypes[1]}).max("idx");
		var maxIdWin = db({"type": similarTypes[2]}).max("idx");
		cgID = Math.max(maxIdDoor, maxIdHole, maxIdWin)+1;
	}
	else
		cgID=db({"type": gg[activeLetter].t}).max("idx")+1;
}
//}}}
function resetView(){//{{{
	zoom.transform(svg, d3.zoomIdentity.translate(100,100).scale(0.2));
}
//}}}
function zoomInit() { //{{{
	// d3 is mysterious. They talk about event.button which is always 0 in chrome/linux
	// event which works for me: 0: wheelScroll, 1: mouseLeft, 2: wheelPress

	zoom = d3.zoom().on("zoom", zoomedwin);
	resetView();

	d3.select("#apainter-svg")
		.call(d3.zoom()
			.scaleExtent([1 / 30, 4])
			.translateExtent([[-1200, -1200], [1000000 , 1000000]])
			.on("zoom", zoomedwin)
			.filter(function(){ return (event.which === 0 || event.which === 2 ); })
		)
		.on("dblclick.zoom", null);
}
//}}}
function zoomedwin() {//{{{
	zt=d3.event.transform;
	building.attr("transform", zt);
	buildingLabels.attr("transform", zt);
	snapLinesSvg.attr("transform", zt);
	$("#snapper").attr("transform", zt);
	ax.gX.call(ax.xAxis.scale(d3.event.transform.rescaleX(ax.x)))
	ax.gY.call(ax.yAxis.scale(d3.event.transform.rescaleY(ax.y)));
}
//}}}
function calcNextFloor() {//{{{
	if (floor >= floorsCount - 1) {
		return 0;
	} else {
		return floor+1;
	}
}
//}}}

function close2dView() {//{{{
	$("view2d").css("display", "none");
	$("#apainter-svg").css("display", "none");
}
//}}}
function close3dView() {//{{{
	$("view3d").css("display", "none");
	threejsPlay=0;
}
//}}}
function closeTxtView() {//{{{
	$("#div-cad-json-textarea").remove();
}
//}}}
function start2dView() {//{{{
	currentView='2d'; 
	close3dView();
	$("view2d").css("display", "block");
	$("#apainter-svg").css("display", "block");
}
//}}}
function start3dView() {//{{{
	threejsPlay=1;
	currentView='3d'; 
	close2dView();
	view3d();
	$("view3d").css("display", "block");
}
//}}}
function startTxtView(pretty_json="") {//{{{
	close2dView();
	close3dView();
	closeTxtView();
	currentView='txt'; 
	if(pretty_json=="") { var pretty_json=db2cadjson(); }
	$("body").append(
		"<div id=div-cad-json-textarea><br><br>"+
		"<textarea id=cad-json-textarea>"+pretty_json+"</textarea>"+
		"</div>"
	);
}
//}}}

function nextView() {//{{{
	$("right-menu-box").css("display", "none");
	closeTxtView();

	if(currentView=='2d')       { start3dView(); }
	else if(currentView=='3d')  { start2dView(); }
	else if(currentView=='txt') { start2dView(); }
}
//}}}
function cgRemove(undoRegister=1) {//{{{
	if(undoRegister==1) { undoBufferRegister('remove'); }
	$("#"+cg.name).remove();
	db({"name":cg.name}).remove();
	updateSnapLines();
	if($("#gg_listing").length==0) { 
		$("right-menu-box").css("display", "none"); 
	} else {
		bulkProps(); 
	}
	showBuildingLabels();
	$(".building-vertex").remove() 
	if (cg.type == 'door' || cg.type == 'hole'){	
		_.each(db({'floor': cg.floor, 'type': 'room'}).get(), function(m){
			if (m.room_exits_weights !== undefined && cg.idx in m.room_exits_weights)
				delete m.room_exits_weights[cg.idx];
		});
	}
}
//}}}

function updateSnapLines() { //{{{
	var lines=db({'floor': floor}).select("lines");
	d3.select("#snapLinesSvg").selectAll("line").remove();
	snapLinesArr['horiz']=[];
	snapLinesArr['vert']=[];
	var below, above, right, left;

	appendSnapLinesSvg(lines);

	// add snap lines for virtual compartments
	for (let key in virtual_obj_parents) {
		for (let i = 0; i < virtual_obj_parents[key].length; i++) {
			if(virtual_obj_parents[key][i][2] == floor){
				var lines=db({'name': key}).select("lines");
				appendSnapLinesSvg(lines);
				break;
			}
		}
	}

	snapLinesArr['horiz']=Array.from(new Set(snapLinesArr['horiz']));
	snapLinesArr['vert']=Array.from(new Set(snapLinesArr['vert']));
}

function appendSnapLinesSvg(lines){
	for(var points in lines) { 
		below = lines[points][0][1];
		above = lines[points][2][1];
		right = lines[points][0][0];
		left  = lines[points][1][0];

		snapLinesArr['horiz'].push(below);
		snapLinesArr['horiz'].push(above);
		snapLinesArr['vert'].push(right);
		snapLinesArr['vert'].push(left);

		snapLinesSvg.append('line').attr('id' , 'sh_'+below).attr('class' , 'snap_v').attr('y1' , below).attr('y2' , below).attr('x1' , -100000).attr('x2' , 100000).attr("visibility", "hidden");
		snapLinesSvg.append('line').attr('id' , 'sh_'+above).attr('class' , 'snap_v').attr('y1' , above).attr('y2' , above).attr('x1' , -100000).attr('x2' , 100000).attr("visibility", "hidden");
		snapLinesSvg.append('line').attr('id' , 'sv_'+right).attr('class' , 'snap_h').attr('x1' , right).attr('x2' , right).attr('y1' , -100000).attr('y2' , 100000).attr("visibility", "hidden");
		snapLinesSvg.append('line').attr('id' , 'sv_'+left).attr('class'  , 'snap_h').attr('x1' , left).attr('x2'  , left).attr('y1'  , -100000).attr('y2' , 100000).attr("visibility", "hidden");

	}
}
//}}}
function axes() { //{{{
	ax.x = d3.scaleLinear()
		.domain([-1, win[0]+ 1])
		.range([-1, win[0]+ 1 ]);

	ax.y = d3.scaleLinear()
		.domain([-1, win[1] + 1])
		.range([-1, win[1] + 1]);

	ax.xAxis = d3.axisBottom(ax.x)
		.ticks(screen.width/800)
		.tickSize(win[1])
		.tickPadding(2 - win[1]);

	ax.yAxis = d3.axisRight(ax.y)
		.ticks(screen.height/800)
		.tickSize(win[0])
		.tickPadding(2 - win[0]);
	svg.append("g").attr("id", "axes");

	ax.gX = d3.select("#axes").append("g")
		.attr("class", "axis axis--x")
		.call(ax.xAxis);

	ax.gY = d3.select("#axes").append("g")
		.attr("class", "axis axis--y")
		.call(ax.yAxis);
}

function addFloor() {//{{{
	floor = floorsCount;
	floorsCount++;
	building.append("g").attr("id", "floor"+floor).attr("class", "floor").attr('fill-opacity',0.4);
	setNewFloorAttr(floor);
	floors_dimz[floor] = floors_dimz[floor-1];
	floorsZ0[floor] = getSumDimZLower(floor);
}

function deleteFloor() {//{{{
	let _floor = Number($("#floor").val());
	deletefloorZData();
	floorsCount--;
	d3.select('floor'+_floor).remove();
	setLowerFloorAttr(_floor-1);
	floor = _floor-1;
	showGeneralBox();
}

function deletefloorZData(){
	var keys = Object.keys(floors_dimz);
	var lastKey = keys[keys.length - 1];
	delete floors_dimz[lastKey];
	keys = Object.keys(floorsZ0);
	lastKey = keys[keys.length - 1];
	delete floorsZ0[lastKey];
}

function changeFloor(requested_floor) {//{{{
	if(floor > floorsCount-1) { 
		return;
	}
	undoBuffer=[];
	escapeAll();
	$("#p1").remove();
	floor=requested_floor;
	setNewFloorAttr(floor);
}

function setNewFloorAttr(floor) {//{{{
	$(".floor").attr("visibility","hidden");
	$("#floor"+floor).attr("visibility","visible");

	updateSnapLines();
	$("#apainter-texts-floor").html("floor "+floor+"/"+floorsCount);
	$("#apainter-texts-floor").clearQueue().finish();
	$("#apainter-texts-floor").css("opacity",1).animate({"opacity": 0.1}, 1000);
}

function setLowerFloorAttr(floor) {//{{{
	$(".floor").attr("visibility","hidden");
	$("#floor"+floor).attr("visibility","visible");

	updateSnapLines();
	$("#apainter-texts-floor").html("floor "+floor+"/"+floorsCount);
	$("#apainter-texts-floor").clearQueue().finish();
	$("#apainter-texts-floor").css("opacity",1).animate({"opacity": 0.1}, 1000);
}

//}}}
function activeSnapX(m) {//{{{
	for(var point in snapLinesArr['vert']) {
		p=snapLinesArr['vert'][point];
		if (m.x > p - cg.snapForce && m.x < p + cg.snapForce) { 
			activeSnap.x=p;
			break;
		}
	}
}
//}}}
function activeSnapY(m) {//{{{
	for(var point in snapLinesArr['horiz']) {
		p=snapLinesArr['horiz'][point];
		if (m.y > p - cg.snapForce && m.y < p + cg.snapForce) { 
			activeSnap.y=p;
			break;
		}
	}
}
//}}}
function snappingHide(hideDot=1) {//{{{
	d3.selectAll('.snap_v').attr('visibility', 'hidden');
	d3.selectAll('.snap_h').attr('visibility', 'hidden');
	if(hideDot==1) { $('#snapper').attr('fill-opacity', 0); }
}
//}}}
function snap(m) {//{{{
	activeSnap={};
	if(!['room', 'hole', 'window', 'door'].includes(cg.type)) { return; }
	snappingHide(0);
	if (event.ctrlKey) { $('#snapper').attr('fill-opacity', 0); return; } 

	activeSnapX(m); 
	activeSnapY(m); 

    if (['window', 'door'].includes(cg.type)) { snapKeepDirection(m); }
	if(isEmpty(activeSnap)) { snappingHide();  } else { snappingShow(m); }
}

//}}}
function snapKeepDirection(m) {//{{{
	// Prevent ortho-changing snapping 
	if (!('y' in activeSnap) && 'x' in activeSnap) { cg.preferredSnap='x'; }
	if (!('x' in activeSnap) && 'y' in activeSnap) { cg.preferredSnap='y'; }
	activeSnap={};
	if(cg.preferredSnap=='x') { 
		activeSnapX(m); 
	} else {
		activeSnapY(m); 
	}
}
//}}}
function snappingShow(m) {//{{{
	$('#snapper').attr('fill-opacity', 1).attr({ r: 10, cx: m.x, cy: m.y}); 
	if("x" in activeSnap) { 
		$("#sv_"+activeSnap.x).attr("visibility", "visible"); 
		$('#snapper').attr({ cx: activeSnap.x}); 
	}
	if("y" in activeSnap) { 
		$("#sh_"+activeSnap.y).attr("visibility", "visible"); 
		$('#snapper').attr({ cy: activeSnap.y});
	}

	if("x" in activeSnap && "y" in activeSnap) { $('#snapper').attr({ r: 30}); }
}
//}}}
function cgInit() {//{{{
	//delete cg.growing;
	cgIdUpdate();
	cg.name=activeLetter+cgID;
	cg.idx=cgID;
	cg.infant=1;
	cg.floor=floor;
	cg.letter=activeLetter;
	cg.type=gg[activeLetter].t;
	cg.mvent_throughput=1.5;
	cg.air_grille_surface = null;
	cg.flow_direction = null;
	cg.exit_weight = 10;
	cg.room_exits_weights = {};
	cg.z=[floorsZ0[floor]];
	cg.polypoints=[];
	cg.preferredSnap=null;
	if(cg.type=='hole') { cg.snapForce=100; } else { cg.snapForce=50; }
	if (cg.type=='fire') {
		cg.z.push(cg.z[0] + 250);
	} else if (cg.type=='evacuee') {
		cg.z.push(cg.z[0] + 150);
	} else if (cg.type=='obst') {
		cg.z.push(cg.z[0] + 100);
	} else if (cg.type=='mvent') {
		cg.z.push(cg.z[0] + 50);
	} else if (cg.type=='vvent') {
		cg.z.push(cg.z[0] + 50);
	} else if (cg.type=='window') {
		cg.z=[floorsZ0[floor] + defaults.window_offsetz]; 
		cg.z.push(cg.z[0] + defaults.window_dimz);
	} else if (cg.type=='door') {
		cg.z.push(cg.z[0] + defaults.door_dimz); 
	} else if (cg.type=='room') {
		cg.z.push(cg.z[0] + floors_dimz[floor]);
		cg.evacuees_density='auto';
	} else {
		cg.z.push(cg.z[0] + floors_dimz[floor]);
	}
}
//}}}
function scaleMouse(pos) {//{{{
	return {'x': Math.round((pos[0]-zt.x)/zt.k), 'y': Math.round((pos[1]-zt.y)/zt.k) };
} //}}}
function cgCreate() {//{{{
	cgInit();
	svg.on('mousedown', function() {

		if(d3.event.which==1) {
			m=scaleMouse(d3.mouse(this));
			cg.growing=1;
			cgDecidePoints(m);
			cgSvg();
			cg.bbox=getBbox();
			delete cg.infant;
		} else if(d3.event.which==3) {
			cgEscapeCreate();
		}
	});
	svg.on('mousemove', function() {
		m=scaleMouse(d3.mouse(this));
		snap(m);
		cgDecidePoints(m);
		cgUpdateSvg(); 
		updatePosInfo(m);
	});  
	svg.on('mouseup', function() {
		checkNegativeCords();
		if(assertCgReady()) {
			delete cg.growing;
			cgUpdateSvg();
			cgDb();
			updateSnapLines();
		}
		if(holeOnExternalWall()){
			cgRemove(undoRegister=0);
		}
		snappingHide();
		cgInit();
		showBuildingLabels();
	});
}
//}}}

function addDefaultCgProps(){
	if(cg.type=='mvent') {
		var zones = getConnectedZones(cg);
		var mventWithDuct = false;
		if (zones.length === 1) {
			// mechanical vent with duct leading outside
    		zones.push("OUTSIDE");
			mventWithDuct = true;
		}
		r1 = zones[0];
		r2 = zones[1];
		if (r1==null && r2==null){
			amsg({'err':1, 'msg':"Coorect mvent size and localization because it intersects not properly"}); 
		}
		else
		{
			// add this property for newly created mvent so that the flow_direction and 
			// air_grille_surface fields  (only in case of mventWithDuct==true)
			// are not set to null or undefined (they must always be set to something)
			// different from (null or undefined)
			if(cg.flow_direction == null)
			{
				cg.flow_direction=`${r1} to ${r2}`;
			}

			if(cg.air_grille_surface == null)
			{
				if(mventWithDuct == true){
					cg.air_grille_surface='x_min';
				}

			}
		}
	} 
}
function checkNegativeCords(){
	var negative = false
	cg.polypoints.forEach(function(array){array.forEach(function(x){
		if(x < 0){
			negative = true
		}
	})})
	if(negative){
		delete cg.growing;
		cgInit();
		amsg({'err':1, 'msg':"Object in negative coordinates! You can not draw here!"}); 
	}
}

function holeOnExternalWall(){
	if (cg.letter == 'z'){
		var external = IsHoleExternal(cg);
		if (external){
			amsg({'err':2, 'msg':"You drew a hole in the outside wall. You can't do that. The holes are used to connect compartments. In the external wall you can draw normal door, windows, mechanical or normal vents."}); 
		}
		return external;
	}
}
function getRoomTypeApainterObjects(){
	var room_types_objects =[];
	var name;
	var cad_json;

	for(var letter in gg) {
		if (gg[letter]['t'] == 'room') { 
			_.each(db({"letter": letter}).select("cad_json","name"), function(m) {
				room_types_objects.push(m);
			});
		}
	}

    var rooms = [];

    room_types_objects.forEach( room => {
    	r_points = getMinMaxXY(room[0]);
		const [zmin, zmax] = JSON.parse(room[0]['z']);
    	rooms.push({  name:room[1],zmin:zmin, zmax:zmax, xmin: r_points[0], xmax: r_points[2], ymin: r_points[1], ymax: r_points[3] });
    });

    return rooms;

}

function IsHoleExternal(geometry){

	const [r1, r2] = getConnectedZones(geometry);

	if(r1 == 'OUTSIDE' || r2 == 'OUTSIDE')
		return true;
	return false;
}


function getConnectedZones(geometry){

    function hasVolumeIntersection(a, b) {
        return (
            a.xmin < b.xmax && a.xmax > b.xmin &&
            a.ymin < b.ymax && a.ymax > b.ymin &&
            a.zmin < b.zmax && a.zmax > b.zmin
        );
    }

    function isLineOrPlaneIntersection(a, b) {
        return (
            (a.xmin === b.xmax || a.xmax === b.xmin) &&
            (a.ymin === b.ymax || a.ymax === b.ymin) &&
            (a.zmin === b.zmax || a.zmax === b.zmin)
        );
    }

	function isObjectOutside(object, rooms) {
	    const vertices = [
	        { x: object.xmin, y: object.ymin, z: object.zmin },
	        { x: object.xmin, y: object.ymin, z: object.zmax },
	        { x: object.xmin, y: object.ymax, z: object.zmin },
	        { x: object.xmin, y: object.ymax, z: object.zmax },
	        { x: object.xmax, y: object.ymin, z: object.zmin },
	        { x: object.xmax, y: object.ymin, z: object.zmax },
	        { x: object.xmax, y: object.ymax, z: object.zmin },
	        { x: object.xmax, y: object.ymax, z: object.zmax }
	    ];

	    for (let vertex of vertices) {
	        const { x, y, z } = vertex;

	        const isInsideAnyRoom = rooms.some(room =>
	            x >= room.xmin && x <= room.xmax &&
	            y >= room.ymin && y <= room.ymax &&
	            z >= room.zmin && z <= room.zmax
	        );

	        if (!isInsideAnyRoom) {
	            return true;
	        }
	    }

	    return false;
	}


    // Calculate the bounding box for the geometry
    var xValues = geometry.polypoints.map(vertex => vertex[0]);
    var yValues = geometry.polypoints.map(vertex => vertex[1]);
    const xmin = Math.min(...xValues);
    const xmax = Math.max(...xValues);
    const ymin = Math.min(...yValues);
    const ymax = Math.max(...yValues);
    const zmin = geometry.z[0];
    const zmax = geometry.z[1];

    let object = { xmin: xmin, xmax: xmax, ymin: ymin, ymax: ymax, zmin: zmin, zmax: zmax };

    // Get all rooms
    let rooms = getRoomTypeApainterObjects();
    let connectedZones = [];

    for (let room of rooms) {
        if (hasVolumeIntersection(object, room) && !isLineOrPlaneIntersection(object, room)) {
            connectedZones.push(room.name);
        }
    }

    if (connectedZones.length == 0){
        amsg({ 'err': 2, 'msg': "The connection object does not intersect any zones. Please correct apainter geometry." });
        return [null, null];
	}


    if (isObjectOutside(object, rooms.filter(room => connectedZones.includes(room.name)))) {
		// the cuboid passes through the room but also sticks out
		connectedZones.push('OUTSIDE');
	}
    

    // Ensure proper result structure
    if (connectedZones.length > 2) {
        amsg({ 'err': 2, 'msg': "The connection object intersects more than 2 zones. Please correct apainter geometry." });
        return [null, null];
    }

    if (connectedZones.length == 1) {
		// the cuboid is inside one room
        return [connectedZones[0]];
    }

	return connectedZones;
}

function updatePosInfo(m) {//{{{
	if(cg.infant==1) {
		$("#apainter-texts-pos").html(m.x+" "+m.y+" "+cg.z[0]);
	} else {
		b=getBbox();
		$("#apainter-texts-pos").html(m.x+" "+m.y+" "+cg.z[0]+" &nbsp; &nbsp;  size: "+(b.max.x-b.min.x)+" "+ (b.max.y-b.min.y) +" "+(cg.z[1]-cg.z[0]));
	}
}
//}}}
function ctrlDrawing(m) {//{{{
	if("infant" in cg && "growing" in cg) { cg.polypoints.push([m.x,m.y]); } 
	if(cg.polypoints.length==0) { return; }
	p0=[cg.polypoints[0][0], cg.polypoints[0][1]];
	p1=[m.x, cg.polypoints[0][1]];
	p2=[m.x, m.y];
	p3=[cg.polypoints[0][0], m.y];
	cg.polypoints=[p0,p1,p2,p3];
}
//}}}
function cgDecidePoints(m) {//{{{
	if (event.ctrlKey) { ctrlDrawing(m); return; }

	if("x" in activeSnap) { px=activeSnap.x; } else { px=m.x; }
	if("y" in activeSnap) { py=activeSnap.y; } else { py=m.y; }
	if("growing" in cg) { cg.polypoints.push([px,py]); }
	if(cg.polypoints.length==0) { return; }

	switch (cg.type) {
		case 'floor_teleport':
		if (activeLetter == 'kd')
		{
			switch (floor_teleport_down_direction % 4) {
				//arrow left downstairs
				case 0:
					p0=[px, py];
					p1=[px+defaults.floor_teleport_width, py-10];
					p2=[px+defaults.floor_teleport_width, py+10];
					p3=[px, py];
					cg.teleport_from = [px+defaults.floor_teleport_width, py]
					cg.teleport_to = [px, py]
					break;
				//arrow up downstairs
				case 1:
					p0=[px, py];
					p1=[px+10, py+defaults.floor_teleport_width];
					p2=[px-10, py+defaults.floor_teleport_width];
					p3=[px, py];
					cg.teleport_from = [px, py+defaults.floor_teleport_width]
					cg.teleport_to = [px, py]
					break;
				//arrow right downstairs
				case 2:
					p0=[px, py];
					p1=[px-defaults.floor_teleport_width, py+10];
					p2=[px-defaults.floor_teleport_width, py-10];
					p3=[px, py];
					cg.teleport_from = [px-defaults.floor_teleport_width, py]
					cg.teleport_to = [px, py]
					break;
				//arrow down downstairs
				case 3:
					p0=[px, py];
					p1=[px-10, py-defaults.floor_teleport_width];
					p2=[px+10, py-defaults.floor_teleport_width];
					p3=[px, py];
					cg.teleport_from = [px, py-defaults.floor_teleport_width]
					cg.teleport_to = [px, py]
					break;
				
				default:
					break;
			}
		}
		else if (activeLetter == 'ku')
		{
			switch (floor_teleport_up_direction % 4) {
			//arrow left upstairs
				case 0:
					p0=[px, py];
					p1=[px+defaults.floor_teleport_width, py-10];
					p2=[px+defaults.floor_teleport_width, py+10];
					p3=[px, py];
					cg.teleport_from = [px+defaults.floor_teleport_width, py]
					cg.teleport_to = [px, py]
					break;
				//arrow up upstairs
				case 1:
					p0=[px, py];
					p1=[px+10, py+defaults.floor_teleport_width];
					p2=[px-10, py+defaults.floor_teleport_width];
					p3=[px, py];
					cg.teleport_from = [px, py+defaults.floor_teleport_width]
					cg.teleport_to = [px, py]
					break;
				//arrow right upstairs
				case 2:
					p0=[px, py];
					p1=[px-defaults.floor_teleport_width, py+10];
					p2=[px-defaults.floor_teleport_width, py-10];
					p3=[px, py];
					cg.teleport_from = [px-defaults.floor_teleport_width, py]
					cg.teleport_to = [px, py]
					break;
				//arrow down upstairs
				case 3:
					p0=[px, py];
					p1=[px-10, py-defaults.floor_teleport_width];
					p2=[px+10, py-defaults.floor_teleport_width];
					p3=[px, py];
					cg.teleport_from = [px, py-defaults.floor_teleport_width]
					cg.teleport_to = [px, py]
					break;
				default:
					break;
			}
		}
		break;
		case 'door':
			if("x" in activeSnap) { 
				p0=[px-16, py-defaults.door_width];
				p1=[px+16, py-defaults.door_width];
				p2=[px+16, py];
				p3=[px-16, py];
			} else {
				p0=[px,py-16];
				p1=[px+defaults.door_width,py-16];
				p2=[px+defaults.door_width,py+16];
				p3=[px,py+16];
			}
			break;
		case 'window': case 'hole':
			if(isEmpty(activeSnap)) { cg.polypoints=cg.polypoints.slice(0,3); return; }
			if(cg.preferredSnap==null) { 
				b=getBbox(); 
				if(b.max.x-b.min.x > 32)       { cg.preferredSnap='y'; }
				else if(b.max.y-b.min.y > 32 ) { cg.preferredSnap='x'; }
			}
			if(cg.preferredSnap==null) { return; }

			if(cg.preferredSnap=='y') { 
				p0=[cg.polypoints[0][0], py+16];
				p1=[px, py+16];
				p2=[px, py-16];
				p3=[cg.polypoints[0][0], py-16];
			} else {
				p0=[px-16, cg.polypoints[0][1]];
				p1=[px+16, cg.polypoints[0][1]];
				p2=[px+16, py];
				p3=[px-16, py]; 
			} 
			break;
		default:
			p0=[cg.polypoints[0][0], cg.polypoints[0][1]];
			p1=[px, cg.polypoints[0][1]];
			p2=[px, py];
			p3=[cg.polypoints[0][0], py];
			break;
	}
	cg.polypoints=[p0,p1,p2,p3];

}
//}}}
function assertCgReady() {//{{{
	if(cg.type=='floor_teleport') { return true; }
	if(cg.type=='evacuee') { cg.polypoints=[cg.polypoints[0]]; return true; }
	if(cg.polypoints.length<2) { $("#"+cg.name).remove(); return false; }
	if(cg.polypoints[0][0]==cg.polypoints[1][0] && cg.polypoints[0][1]==cg.polypoints[1][1]) { $("#"+cg.name).remove(); return false; }

	if(cg.type=='underlay_scaler') { 
		b=getBbox();
		underlayForm(b.max.x-b.min.x);
		return true;
	}

	return true;
}
//}}}
function svgPolyline(m) {//{{{
	if (m.type == 'floor_teleport') 
		return getPointsTriangleFloorTeleport(m);
	points=deepcopy(m.polypoints);
	points.push(points[0]);
	points.push(points[1]);
	return points.join(" ");
}

//}}}
function cgUpdateSvg() {  //{{{
	$("#"+cg.name).attr({ 'points': svgPolyline(cg) });   
}
//}}}

function manageTeleportArrows() {//{{{
	if (activeLetter == 'ku' || activeLetter == 'kd')
	{
		content = "";
		arrows = ["&#8592;", "&#8593;", "&#8594;","&#8595;"];
		if (activeLetter == 'ku' )
		{
			floor_teleport_up_direction+=1;
			switch (floor_teleport_up_direction % 4) {
				case 0:
					content = arrows[0] + " floor_teleport up";
					break;
				case 1:
					content = arrows[1] + " floor_teleport up";
					break;
				case 2:
					content = arrows[2] + " floor_teleport up";
					break;
				case 3:
					content = arrows[3] + " floor_teleport up";
					break;
				default:
					break;
				}
		}
		else if (activeLetter == 'kd' )
		{
			floor_teleport_down_direction+=1;
			switch (floor_teleport_down_direction % 4) {
				case 0:
					content = arrows[0] + " floor_teleport down";
					break;
				case 1:
					content = arrows[1] + " floor_teleport down";
					break;
				case 2:
					content = arrows[2] + " floor_teleport down";
					break;
				case 3:
					content = arrows[3] + " floor_teleport down";
					break;
				default:
					break;
				}
		}
		document.getElementById("legend_"+activeLetter).innerHTML = content;
	}
}

function cgStartDrawing() {//{{{
	$('right-menu-box').fadeOut(0); 
	legend();
	$('#legend_'+activeLetter).css({'color': '#f00', 'background-color': '#000', 'border-bottom': "1px solid #0f0"});
	manageTeleportArrows()
	cgCreate();
	underlayPointerEvents(stopDragging=1);
}
//}}}
function cgEscapeCreate() {//{{{
	if(!isEmpty(cg) && "growing" in cg) { cgRemove(undoRegister=0); } 
	$(".temp-poly").remove();
	$("#apainter-texts-pos").html('');
	$(".building-vertex").remove() 
	$(".cg-selected").removeClass('cg-selected'); 
	svg.on('mousedown', null); svg.on('mousemove', null); svg.on('mouseup', null); 
	snappingHide();
	legend();
	if($("#gg_listing").length>0) { return; }
	if($("input#ufloor").length>0) { return; }
	$("right-menu-box").css("display", "none"); 
}
//}}}
function dbUpdateCadJsonStr() { //{{{
	// Create cad_json attribute for the DB
	var cad_json;
	var r=db().get();
	for (var rr in r) {	
		i=r[rr];
		cad_json=generateObjectCadJson(i);
		db({'name': i.name}).update({'cad_json': cad_json});
	}
}
//}}}
function saveTxtCadJson() {//{{{
	var json_data=$("#cad-json-textarea").val();
	ajaxSaveCadJson(json_data); 
}
//}}}
function svgGroupsInit(json) { //{{{
	$(".floor").remove();
	$(".snap_v").remove();
	$(".snap_h").remove();

	floorsCount=0;
	for (var _floor in json) { 
		d3.select("#building").append("g").attr("id", "floor"+_floor).attr("class", "floor").attr("fill-opacity", 0.4).attr('visibility',"hidden");
		floorsCount++;
	}
	$("#floor"+floor).attr('visibility',"visible").css("opacity", 1);
	$("#apainter-texts-floor").html("floor "+floor+"/"+floorsCount);
}


//}}}
function json2db(json) { //{{{
	// Geoms must come in order, otherwise we could see DOOR under ROOM if geoms were created in that order.
	db().remove();
	var letter;
	var arr;
	var geom;
	var elems=["ROOM","COR","STAI","HALL","OBST","VVENT","MVENT","HOLE","WIN","DOOR","FLOOR_TELEPORT_UP","FLOOR_TELEPORT_DOWN", "DCLOSER","DELECTR","EVACUEE","FIRE","UNDERLAY_SCALER"];
	virtual_obj_parents = {};

	_.each(json, function(floor_data,floor) { 
		_.each(elems, function(elem) { 
			_.each(floor_data[elem], function(record) { 
				letter=ggx[elem];
				cgMake(Number(floor),letter,record);
				cgDb();
				cgSvg();
				if(letter == 's' || letter=='a'){
					cgDbVirtualObj(cg);
					cgSvgVirtualObj(cg);
				}

			})
		})
	});
	updateSnapLines(); // This is a heavy call, which shouldn't be called for each cgDb()
	undoBuffer=[];
}
//}}}
function cgMake(floor,letter,record) { //{{{
	cg.polypoints=JSON.parse(record.points);
	cg.z=JSON.parse(record.z);
	cg.idx=record.idx;
	cg.name=letter+cg.idx;
	cg.letter=letter;
	cg.type=gg[letter].t;
	cg.floor=floor;

	if('exit_weight' in record)        { cg.exit_weight=record.exit_weight; }
	else { cg.exit_weight=undefined; }
	if('room_exits_weights' in record) { cg.room_exits_weights=record.room_exits_weights; }
	else { cg.room_exits_weights=undefined;}
	if('evacuees_density' in record) { cg.evacuees_density=record.evacuees_density; }
	if('mvent_throughput' in record) { cg.mvent_throughput=record.mvent_throughput; }
	if('flow_direction' in record)   { cg.flow_direction=record.flow_direction; }
	else { cg.flow_direction=undefined;}
	if('air_grille_surface' in record)   { cg.air_grille_surface=record.air_grille_surface; }
	else { cg.air_grille_surface=undefined;}
	if('teleport_from' in record)	 { cg.teleport_from=record.teleport_from; }
	if('teleport_to' in record)		 { cg.teleport_to=record.teleport_to; }
	
}
//}}}
function ajaxSaveCadJson(json_data) { //{{{
	$.post('/aamks/ajax.php?ajaxApainterExport', { 'data': json_data }, function (json) { 
		amsg(json); 
		importCadJson();
	});
}
//}}}
function getSumDimZLower(f) { //{{{
	let z_sum = 0;
	_.each(floors_dimz, function(floor_dimz,floor) { 
		if (floor < f)
			z_sum += floors_dimz[floor];
	});
	return z_sum;
}
//}}}
function setFloorsZ(json) { //{{{
	_.each(json, function(floor_data,floor) { 
		if (floor_data['FLOOR_DIM_Z'] != undefined)
			floors_dimz[floor] = floor_data['FLOOR_DIM_Z'];
		if (floor == 0)
			floorsZ0[floor] = 0;
		else
			floorsZ0[floor] = getSumDimZLower(floor);

	});
}
//}}}
function importCadJson() { //{{{
	$("#buildingLabels").html(""); 
	cgEscapeCreate(); 
	$.post('/aamks/ajax.php?ajaxApainterImport', { }, function (json) { 
		// We loop thru cgDb() here which updates the cg
		// At the end the last elem in the loop would be the cg
		// which may run into this-elem-doesnt-belong-to-this-floor problem.
		amsg(json); 
		svgGroupsInit(json.data);
		setFloorsZ(json.data);
		json2db(json.data);
		_.each(json.data, function(data,floor) { 
			importImgUnderlay(data['UNDERLAY_IMG'],floor); 
			importFloorUnderlay(data['UNDERLAY_FLOOR'],floor); 
		});
		cg={};
		d3.select('#floor_text').text("floor "+floor+"/"+floorsCount);
	});
}
//}}}
function legend() { //{{{
	$('legend1').html('');

	for(var letter in gg) {
		if(gg[letter].legendary==1) { 
			var x=db({"letter": letter}).select("name");
			$('legend1').append("<div class=legend letter="+letter+" id=legend_"+letter+" style='color: "+gg[letter].font+"; background-color: "+gg[letter].c+"' title='"+gg[letter].description+"'>"+letter+" "+gg[letter].fourLetter+"</div>");
		}
	}

}
//}}}
function anyholeOnExternalWall(){
	// hole
	var letter = 'z';
	var floor_holes;
	for(var floor=0; floor<floorsCount; floor++) { 
		floor_holes = [];
		_.each(db({"floor": floor, "letter": letter}).get(), function(m) {
			floor_holes.push(m);
		});

		for (let i = 0; i < floor_holes.length; i++) {
    		if (IsHoleExternal(floor_holes[i]))
    			return true;
		}
	}
	return false;
}

function isGeometryCorrect(){
	if(anyholeOnExternalWall()){
		amsg({'err':2, 'msg':`There is a hole in the outside wall. You can't do that. 
			The holes are used to connect compartments. In the external wall you can 
			draw normal door, windows, mechanical or normal vents. After correcting 
			the geometry, you will be able to save your changes`}); 
		return false;
	}
	return true;
}

function db2cadjson() {//{{{
	cgEscapeCreate();
	verifyIntersections();
	dbUpdateCadJsonStr();
	if(!isGeometryCorrect()){
		return;
	}
	cadjson={};

	for(var floor=0; floor<floorsCount; floor++) { 
		var geoms=[];
		cadjson[floor]={};
		for(var letter in gg) {
			if (gg[letter]['legendary'] == 0) { 
				continue; 
			}
			tt=gg[letter]['x'];
			cadjson[floor][tt]=[];
			_.each(db({"floor": floor, "letter": letter}).select("cad_json"), function(m) {
				cadjson[floor][tt].push(m);
			});
		}

		cadjson[floor]['UNDERLAY_IMG']=underlayImgSaveCad(floor);
		cadjson[floor]['UNDERLAY_FLOOR']=underlayFloorSaveCad(floor);
		cadjson[floor]['FLOOR_DIM_Z']=floors_dimz[floor];
	}
	pretty=JSON.stringify(cadjson,null,2);
	ajaxSaveCadJson(pretty);
	return pretty;
}
//}}}
function floorCopy() {	//{{{
	c2f=Number($("#copy_to_floor").val());
	floors_dimz[c2f] = floors_dimz[floor];
	floorsZ0[c2f] = getSumDimZLower(c2f);
	floorsCount++;
	building.append("g").attr("id", "floor"+c2f).attr({"class": "floor", "opacity": 0, "visibility": "hidden"});
	_.each(db({'floor': floor}).get(), function(m) {
		if (m.letter == 'va' || m.letter == 'vs'||
			m.letter == 's' || m.letter=='a'){
			return;
		}
		activeLetter=m.letter;
		cgIdUpdate();
		cg=deepcopy(m);
		cg.exit_weight=10;
		cg.room_exits_weights={};
		cg.air_grille_surface = null;
		cg.flow_direction = null;
		cg.floor=c2f;
		cg.idx=cgID;
		cg.name=cg.letter + cgID;
		cg.z[0]=floorsZ0[c2f];
		cg.z[1]=floorsZ0[c2f] + m.z[1]- m.z[0];
		cgDb(undoRegister=0);
		cgSvg();

	});



	$("#floor"+c2f).attr({"class": "floor", "fill-opacity": 0.4, "visibility": "hidden"});

	cg={};
	updateSnapLines();

	_.each(db({"letter": 's'}).get(), function(m){
		cgDbVirtualObj(m);
		cgSvgVirtualObj(m);
	});
	_.each(db({"letter": 'a'}).get(), function(m){
		cgDbVirtualObj(m);
		cgSvgVirtualObj(m);
	});


	showGeneralBox();
	amsg({'err':0, 'msg': "floor"+floor+" copied onto floor"+c2f});
}//}}}
function cgSelect(elems, blink=1, showProps=1) {//{{{
	let virtualObjEscapeSelect = false;
	$(".cg-selected").removeClass('cg-selected'); 
	if(typeof(elems)=="string") {
		arr=[elems];
	} else {
		arr=elems;
	}
	_.each(arr, function(v) { 
		cg=deepcopy(db({'name':v}).get()[0]);
		if (cg.letter == 'va' || cg.letter == 'vs'){
			virtualObjEscapeSelect = true;
			return;
		}
		if(blink==1)     { $("#"+cg.name).addClass('cg-selected').css( { 'stroke-width': '100px'}).animate( { 'stroke-width': 0}, 400, function() { $(this).removeAttr('style'); }); }
		if(showProps==1) { showCgPropsBox(); }
	});
	if (virtualObjEscapeSelect)
		return;
	m={'x': cg.minx, 'y': cg.miny};
	updatePosInfo(m);
	showBuildingLabels(1,[cg.name]);
}
//}}}
function bulkPlainProps() {//{{{
	var tbody='';
	tbody+="<tr><td>name<td>z<td>density";
	_.each(db({'letter': activeLetter, 'floor': floor}).get(), function (m) {
		tbody+="<tr><td class=bulkProps id="+ m.name + ">"+ m.name +"</td><td>"+m.z+"</td><td>"+m.evacuees_density;
	});
	return tbody;
}
//}}}
function bulkProps() {//{{{
	showBuildingLabels(1);
	var html='';
	html+='<div style="overflow-y: scroll; height: '+(win[1]-100)+'px">';
	html+='<wheat>Hover name,<br>then <letter>x</letter> to delete</wheat>';
	html+='<table id=gg_listing>';
	html+=bulkPlainProps();
	html+="</table>";
	html+="</div>";
	rightBoxShow(html, 0);
}
//}}}

function roomProps() {//{{{
	var pp="<input id=alter-evacuees-density type=hidden value='auto'>";
	if(cg.type=='room') {
		v=db({'name':cg.name}).get()[0];
		pp='';
		adjecentDoorsAndHoles = rooms_and_adjecent_doors_and_holes[cg.name];
		if (adjecentDoorsAndHoles !== undefined) {
			if (adjecentDoorsAndHoles.length > 0){
				pp+= "<tr><td colspan=2 style='text-align: center'>set the weight of the exit doors from this room";
				pp+= "<tr><td colspan=2 style='text-align: center'>0 - minimum weight - no agent will go there";
				pp+= "<tr><td colspan=2 style='text-align: center'>10 - maximum weight";
				adjecentDoorsAndHoles.forEach(function(obj){
					var obj_name = obj[1];
					var points = obj[0].points;

					if (obj_name.charAt(0)=="z")
						pp+= "<tr><td>exit hole " +obj_name+" weight:";
					else
						pp+= "<tr><td>exit door " +obj_name+" weight:";

					if ('room_exits_weights' in v && v.room_exits_weights !== undefined && v.room_exits_weights[obj[0].idx] !== undefined)
						pp+= "<td><input type=number id=room_exits_weights_"+cg.name+ "_"+obj_name+" name=room_exits_weights_"+cg.name+ "_"+obj_name+" min=0 max=10 value="+v.room_exits_weights[obj[0].idx]+">";
					else
						pp+= "<td><input type=number id=room_exits_weights_"+cg.name+ "_"+obj_name+" name=room_exits_weights_"+cg.name+ "_"+obj_name+" min=0 max=10 value=10>";

				});
			}
		}
		pp+="<tr><td>density <withHelp>?<help> Draws the given number of  evacuees per square metre. <br><orange>auto</orange> draws the evacuees according to the building profile.<br><br>You can alter global densities in Project > Editor: text<br>evacuees_density:<br>{ ROOM: 0.33, COR: 0.05, STAI: 0.05, HALL: 0.05 }</help></withHelp>";
		pp+="<td><input type=text style='width: 40px' id=alter-evacuees-density value='"+v.evacuees_density+"'>";
	}
	return pp;
}
//}}}
function mventProps() {//{{{
	var pp="";
	if(cg.type=='mvent') {
		v=db({'name':cg.name}).get()[0];
		var zones = getConnectedZones(cg);
		var mventWithDuct = false;
		if (zones.length === 1) {
			// mechanical vent with duct leading outside
    		zones.push("OUTSIDE");
			mventWithDuct = true;
		}
		r1 = zones[0];
		r2 = zones[1];
		if (r1==null && r2==null){
			pp += "<tr><td>coorect mvent size and localization because</td><td> it intersects not properly</td></tr>";
		}
		else
		{
			pp += "<tr><td colspan='2'>mvent "+cg.name+" is connecting: "+r1+" and "+r2+"</td></tr>";
			pp += "<tr><td>flow direction: <td><select id=alter-flow-direction name=flow_direction >";
			
			const flow1 = `${r1} to ${r2}`;
			const flow2 = `${r2} to ${r1}`;
			
			pp += `<option value='${flow1}' ${cg.flow_direction === flow1 ? "selected" : ""}>${flow1}</option>`;
			pp += `<option value='${flow2}' ${cg.flow_direction === flow2 ? "selected" : ""}>${flow2}</option>`;
			pp += "</select>";
			if(mventWithDuct == true){
				pp += "<tr><td>air grille surface: <td><select id=alter-air-grille-surface name=air-grille >";
				
				const surfaces = ["x_min", "x_max", "y_min", "y_max", "z_min", "z_max"];
				for (const surface of surfaces) {
					pp += `<option value='${surface}' ${cg.air_grille_surface === surface ? "selected" : ""}>${surface}</option>`;
				}
				pp += "</select>";
			}
			else{
				pp += "<tr><td>air grille surface:  ";
				pp += "<withHelp>     ?<help> The surface of the ventilation"
				pp += "<br>grille will be at the intersection";
				pp += "<br>of the MVENT and the wall/ceiling";
				pp += "<br>of the room on this floor";
				pp += "<br>through which the mvent passes";
				pp += "</help></withHelp></td></tr>";
			}
		}
		pp += "<tr><td>flow [m3/s]: <td>  <input id=alter-mvent-throughput type=number size=3 min=0 max=100 step=0.1 value="+v.mvent_throughput+">";
	} 
	return pp;
}

function vventProps() {//{{{
	var pp="";
	if(cg.type=='vvent') {
		v=db({'name':cg.name}).get()[0];
		var zones = getConnectedZones(cg);

		if (zones.length === 1) {
    		pp += "<tr><td>coorect vvent size and localization because</td><td> it intersects not properly</td></tr>";
		}
		r1 = zones[0];
		r2 = zones[1];
		if (r1==null && r2==null){
			pp += "<tr><td>coorect vvent size and localization because</td><td> it intersects not properly</td></tr>";
		}
		else
		{
			pp += "<tr><td colspan='2'>vvent "+cg.name+" is connecting: "+r1+" and "+r2+"</td></tr>";
		}
	} 
	return pp;
}


//}}}
function doorProps() {//{{{
	var pp="";
	if(cg.type=='door') {
		v=db({'name':cg.name}).get()[0];
		pp='';
		external_doors.forEach((door, index) => {
			var door_name = door[1];
			if (door_name == v.name){
				pp+= "<tr><td colspan=2 style='text-align: center'>set the general weight of the exit";
				pp+= "<tr><td colspan=2 style='text-align: center'>0 - minimum weight - no agent will go there";
				pp+= "<tr><td colspan=2 style='text-align: center'>10 - maximum weight";
				pp+= "<tr><td>exit door " +door_name+" weight:";
				if ('exit_weight' in v && v.exit_weight !== undefined)
					pp+= "<td><input type=number id=floor_exits_weights_"+door_name+ " name="+door_name+" min=0 max=10 value="+v.exit_weight+">";
				else
					pp+= "<td><input type=number id=floor_exits_weights_"+door_name+ " name="+door_name+" min=0 max=10 value=10>";
			}
		});

	}
	return pp;
}
//}}}
function teleportProps() {//{{{
	var pp="";
	if(cg.type=='floor_teleport') {
		v=db({'name':cg.name}).get()[0];
		pp='';
		teleports.forEach((teleport, index) => {
			teleport_name = teleport[1];
			if (teleport_name == v.name){
				pp+= "<tr><td colspan=2 style='text-align: center'>set the general weight of the exit";
				pp+= "<tr><td colspan=2 style='text-align: center'>0 - minimum weight - no agent will go there";
				pp+= "<tr><td colspan=2 style='text-align: center'>10 - maximum weight";
				pp+= "<tr><td>teleport " +teleport_name+" weight:";
				if ('exit_weight' in v && v.exit_weight !== undefined)
					pp+= "<td><input type=number id=floor_exits_weights_"+teleport_name+ " name=floor_exits_weights_"+teleport_name+" min=0 max=10 value="+v.exit_weight+">";
				else
					pp+= "<td><input type=number id=floor_exits_weights_"+teleport_name+ " name=floor_exits_weights_"+teleport_name+" min=0 max=10 value=10>";
			}
		});
	}
	return pp;
}
//}}}

function rightBoxShow(html, close_button=1) {//{{{
	$('right-menu-box').html("");
	if(close_button==1) { $('right-menu-box').append("<close-right-menu-box><img id=close-img-svg src=/aamks/css/close.svg></close-right-menu-box><br>"); }
	$('right-menu-box').append(html);
	$('right-menu-box').fadeIn(); 
	underlayPointerEvents();
}
//}}}

function getMinMaxXY(object){
	var points = JSON.parse(object['points'])
	x_min = points[0][0];
	x_max = points[0][0];
	y_min = points[0][1];
	y_max = points[0][1];
	for (const [key, value] of Object.entries(points)) {
		if (value[0] < x_min)
			x_min = value[0];
		else if (value[0] > x_max)
			x_max = value[0];

		if (value[1] < y_min)
			y_min = value[1];
		else if (value[1] > y_max)
			y_max = value[1];
	}

	return [x_min, y_min, x_max, y_max];

}

function getExternalDoors(doors,room_types_objects){
	external_doors = [];
	doors.forEach((door, index) => {
		var points = getMinMaxXY(door[0]);
		var first_side_door_point = [points[0], points[1]];
		var second_side_door_point = [points[2], points[3]];
		var is_first_side_door_point_inside = false;
		var is_second_side_door_point_inside = false;
		room_types_objects.forEach((room, index) => {
			room_points = getMinMaxXY(room[0]);
			room_min_X = room_points[0];
			room_max_X = room_points[2];
			room_min_Y = room_points[1];
			room_max_Y = room_points[3];
			if (first_side_door_point[0] <= room_max_X && 
				first_side_door_point[0] >= room_min_X &&
				first_side_door_point[1] <= room_max_Y &&
				first_side_door_point[1] >= room_min_Y)
				is_first_side_door_point_inside = true;
			if (second_side_door_point[0] <= room_max_X && 
				second_side_door_point[0] >= room_min_X &&
				second_side_door_point[1] <= room_max_Y &&
				second_side_door_point[1] >= room_min_Y)
				is_second_side_door_point_inside = true;
		});
		if (is_first_side_door_point_inside == false ||
			is_second_side_door_point_inside == false)
				external_doors.push(door);
		var is_first_side_door_point_outside = false;
		var is_second_side_door_point_outside = false;
	});
}
function getRoomsAndAdjecentDoorsAndHoles(doors_and_holes,room_types_objects, holes){
	rooms_and_adjecent_doors_and_holes = {};
	room_types_objects.forEach((room, index) => {
		rooms_and_adjecent_doors_and_holes[room[1]] = [];
		var room_points = getMinMaxXY(room[0]);
		var room_min_X = room_points[0];
		var room_max_X = room_points[2];
		var room_min_Y = room_points[1];
		var room_max_Y = room_points[3];
		doors_and_holes.forEach((obj, i) => {
			var IsAdjecantToRoom = false;
			points = getMinMaxXY(obj[0]);
			min_X = points[0];
			max_X = points[2];
			min_Y = points[1];
			max_Y = points[3];
			if (min_X >= room_min_X &&
				max_X <= room_max_X &&
				(min_Y < room_max_Y && min_Y > room_min_Y || 
				 max_Y > room_min_Y && max_Y < room_max_Y))
				IsAdjecantToRoom = true;
			if (min_Y >= room_min_Y &&
				max_Y <= room_max_Y &&
				(min_X < room_max_X && min_X > room_min_X ||
				 max_X > room_min_X && max_X < room_max_X))
				IsAdjecantToRoom = true;

			if (IsAdjecantToRoom == true)
				rooms_and_adjecent_doors_and_holes[room[1]].push(obj);
		});

	});

	joinRoomsConnectedByHoles(room_types_objects,holes)
}

function joinRoomsConnectedByHoles(room_types_objects, holes){

	rooms_pairs_joined_by_holes = getJoinedRoomsPairs(room_types_objects, holes);
	getJoinedRoomsAndAdjecentDoors(rooms_pairs_joined_by_holes);
}

function getJoinedRoomsPairs(room_types_objects, holes){
	rooms_pairs_joined_by_holes = [];
	vhall_holes = [];
	holes.forEach((hole, i) => {
		points = getMinMaxXY(hole[0]);
		hole_min_X = points[0];
		hole_max_X = points[2];
		hole_min_Y = points[1];
		hole_max_Y = points[3];
		joined_rooms = [];
		room_types_objects.forEach((room, index) => {
			room_points = getMinMaxXY(room[0]);
			room_min_X = room_points[0];
			room_max_X = room_points[2];
			room_min_Y = room_points[1];
			room_max_Y = room_points[3];
			if (hole_min_X >= room_min_X &&
				hole_max_X <= room_max_X &&
				(hole_min_Y < room_max_Y && hole_min_Y > room_min_Y || 
				 hole_max_Y > room_min_Y && hole_max_Y < room_max_Y))
				joined_rooms.push(room[1])
			else if (hole_min_Y >= room_min_Y &&
				hole_max_Y <= room_max_Y &&
				(hole_min_X < room_max_X && hole_min_X > room_min_X ||
				 hole_max_X > room_min_X && hole_max_X < room_max_X))
				joined_rooms.push(room[1])
		});
		if (joined_rooms.length == 2){
			rooms_pairs_joined_by_holes.push([joined_rooms[0],joined_rooms[1]]);
		}
		else
			vhall_holes.push(hole);

	});

	vhall_holes.forEach((hole, i) => {
		for (let key in rooms_and_adjecent_doors_and_holes){
			rooms_and_adjecent_doors_and_holes[key] = rooms_and_adjecent_doors_and_holes[key].filter(innerArray => innerArray[1] !== hole[1]);
		}
	});

	return rooms_pairs_joined_by_holes;
}

function getJoinedRoomsAndAdjecentDoors(rooms_pairs_joined_by_holes){
	grouped_rooms = groupRoomsByHoleConnections(rooms_pairs_joined_by_holes);
	adjecentDoorsAndHoles = [];

	for (let i = 0; i < grouped_rooms.length; i++) {
		adjecentDoorsAndHolesConcated = [];
		adjecentDoorsAndHoles = [];
		for (let j = 0; j < grouped_rooms[i].length; j++) {
			adjecentDoorsAndHolesConcated = adjecentDoorsAndHoles.concat(rooms_and_adjecent_doors_and_holes[grouped_rooms[i][j]]);
			adjecentDoorsAndHoles = adjecentDoorsAndHolesConcated;
		}

		adjecentDoorsAndHoles = [...new Set(adjecentDoorsAndHoles)];

		for (let j = 0; j < grouped_rooms[i].length; j++) {
			rooms_and_adjecent_doors_and_holes[grouped_rooms[i][j]] = adjecentDoorsAndHoles;
		}
	}
}

function groupRoomsByHoleConnections(rooms_pairs_joined_by_holes){
	groupedRooms = [];
	for (let k = 0; k < rooms_pairs_joined_by_holes.length; k++) {
		room_1 = rooms_pairs_joined_by_holes[k][0];
		room_2 = rooms_pairs_joined_by_holes[k][1];

		// readOnlyGroupedRooms if only for reading, we modify groupedRooms array,
		// both arrays are equal - deep copy
		const readOnlyGroupedRooms = groupedRooms;
		if (groupedRooms.length == 0)
		{
			groupedRooms.push([room_1,room_2]);
			continue;
		}
		rooms_already_in_existing_group = false;
		for (let i = 0; i < readOnlyGroupedRooms.length; i++) {
			if (readOnlyGroupedRooms[i].includes(room_1) && readOnlyGroupedRooms[i].includes(room_2))
			{
				// this case happens then there is holes connection loop
				rooms_already_in_existing_group = true;
				break;
			}
  			else if (readOnlyGroupedRooms[i].includes(room_1))
  			{
  				groupedRooms[i].push(room_2);
  				rooms_already_in_existing_group = true;
  				break;
  			}
  			else if (readOnlyGroupedRooms[i].includes(room_2))
  			{
  				groupedRooms[i].push(room_1);
  				rooms_already_in_existing_group = true;
  				break;
  			}
		}
		if (!rooms_already_in_existing_group)
			groupedRooms.push([room_1,room_2]);
	}
	return groupedRooms;
}

function getFloorExits(){
	cgEscapeCreate();
	verifyIntersections();
	dbUpdateCadJsonStr();
	var doors =[];
	var holes = [];
	var room_types_objects =[];
	var doors_and_holes = [];

	for(var letter in gg) {
		if (gg[letter]['t'] == 'door') { 
			_.each(db({"floor": floor, "letter": letter}).select("cad_json","name"), function(m) {
			doors.push(m);
			doors_and_holes.push(m);
			});
		}
	}

	for(var letter in gg) {
		if (gg[letter]['t'] == 'hole') { 
			_.each(db({"floor": floor, "letter": letter}).select("cad_json","name"), function(m) {
			doors_and_holes.push(m);
			holes.push(m);
			});
		}
	}

	for(var letter in gg) {
		if (gg[letter]['t'] == 'room') { 
			_.each(db({"floor": floor, "letter": letter}).select("cad_json","name"), function(m) {
				room_types_objects.push(m);
			});
		}
	}

	// var stairsNotVirtual = array
    // 	.filter(subArray => subArray[1].startsWith('s'))
    // 	.map(subArray => subArray[1]);

    // if (stairsNotVirtual.length > 0) {

    // }

	// include virtual stairs from virtual_obj_parents variable
	// virtual hall is not walkable
	for(var letter of ['s']){
		for(var _floor=0; _floor<floorsCount; _floor++) { 
			_.each(db({"floor": _floor, "letter": letter}).select("cad_json","name"), function(m) {
				cad_json = m[0];
				name = m[1];
				if (name in virtual_obj_parents){
					for (let i = 0; i < virtual_obj_parents[name].length; i++) {
						if (virtual_obj_parents[name][i][2] == floor){
							room_types_objects.push([cad_json,name]);
						}
					}
				}

			});
		}
	}

	getExternalDoors(doors,room_types_objects);
	var floor_teleport_up_letter = 'ku';
	var floor_teleport_down_letter = 'kd';
	teleports = []
	_.each(db({"floor": floor, "letter": floor_teleport_up_letter}).select("cad_json","name"), function(m) {
		teleports.push(m);
	});
	_.each(db({"floor": floor, "letter": floor_teleport_down_letter}).select("cad_json","name"), function(m) {
	teleports.push(m);
	});
	getRoomsAndAdjecentDoorsAndHoles(doors_and_holes, room_types_objects, holes);

}

function validateRightBoxInput(input) {
    let value = parseInt(input.value);
    var limitedZObj = ['r', 'c', 'd', 'z', 'w', 'q', 'e', 't'];
    var stairAndHall = ['s', 'a'];
    var vents = ['m', 'b'];


    if (limitedZObj.includes(cg.letter)){
    	if (input.id == 'alter-z1'){
	    	if (value > floorsZ0[cg.floor] + floors_dimz[cg.floor]) {
    			input.value = floorsZ0[cg.floor] + floors_dimz[cg.floor];
    		}
	    	else if (value < floorsZ0[cg.floor]) {
    			input.value =  floorsZ0[cg.floor] + floors_dimz[cg.floor];
    		}
    	}
		else if (input.id == 'alter-z0'){
    		if (value < floorsZ0[cg.floor]) {
				input.value = floorsZ0[cg.floor];
			}
    		else if (value > floorsZ0[cg.floor] + floors_dimz[cg.floor]) {
				input.value = floorsZ0[cg.floor];
			}
		}
    }
    else if (stairAndHall.includes(cg.letter)){
		if (input.id == 'alter-z0'){
			if (value < floorsZ0[cg.floor]) {
				input.value = floorsZ0[cg.floor];
			}
			else if (value > floorsZ0[cg.floor] + floors_dimz[cg.floor]) {
				input.value = floorsZ0[cg.floor];
			}
		}
    }
    else if (vents.includes(cg.letter)){
    	if (input.id == 'alter-z1'){
	    	if (value > floorsZ0[cg.floor] + floors_dimz[cg.floor] + 4) {
    			input.value = floorsZ0[cg.floor] + floors_dimz[cg.floor] + 4;
    		}
	    	else if (value < floorsZ0[cg.floor]) {
    			input.value =  floorsZ0[cg.floor];
    		}
    	}
		else if (input.id == 'alter-z0'){
    		if (value < floorsZ0[cg.floor] - 4) {
				input.value = floorsZ0[cg.floor] - 4;
			}
    		else if (value > floorsZ0[cg.floor] + floors_dimz[cg.floor]) {
				input.value = floorsZ0[cg.floor] + floors_dimz[cg.floor];
			}
		}
    }

    else if (input.id == 'default_door_dimz'){
    	if (value > floors_dimz[floor]) {
    		input.value = floors_dimz[floor];
    	}
    }
    else if (input.id =='default_window_dimz'){
    	let window_offsetz = parseInt(document.getElementById("default_window_offsetz").value);
    	if (value+window_offsetz > floors_dimz[floor]) {
    		input.value = floors_dimz[floor] - window_offsetz;
    	}
    }

    else if (input.id =='default_window_offsetz'){
    	let window_dimz= parseInt(document.getElementById("default_window_dimz").value);
    	if (value+window_dimz > floors_dimz[floor]) {
    		input.value = floors_dimz[floor] - window_dimz;
    	}
    }
}

function showGeneralBox() { //{{{
	html = "<table class=nobreak>"+
		"<input id=general_setup type=hidden value=1>"+
		"<tr><td colspan=2 style='text-align: center'>Since now"+

		"<tr><td>floor<td><select id=floor name=floor style='width: 6ch;'>";
	for (let i = 0; i < floorsCount; i++) {
		if (i === floor) {
			html += `<option value="${i}" selected>${i}</option>`;
		} else {
			html += `<option value="${i}">${i}</option>`;
		}
	}
	html+=	"</select>"+
		"<tr><td>floor z-origin <td><input id=floorZ0 type=number name=floorZ0 value="+floorsZ0[floor]+" disabled style='background-color: darkgrey; color: #333; width: 6ch;'>"+

		"<tr><td>floor height <td><input id=default_floor_dimz type=number name=default_floor_dimz value="+floors_dimz[floor]+" style='width: 6ch;'+>"+
		"<tr><td><td><tr><td><td><tr><td><td><tr><td><td><tr><td><td><tr><td><td>"+
		"<tr><td>door's width <td><input id=default_door_width type=number name=default_door_width value="+defaults.door_width+" style='width: 6ch;'>"+
		"<tr><td>door's height <td><input id=default_door_dimz type=number name=default_door_dimz oninput='validateRightBoxInput(this)' value="+defaults.door_dimz+" style='width: 6ch;'>"+
		"<tr><td>window's height <td><input id=default_window_dimz type=number name=default_window_dimz oninput='validateRightBoxInput(this)' value="+defaults.window_dimz+" style='width: 6ch;'>"+
		"<tr><td>window's z-offset <td><input id=default_window_offsetz type=number name=default_window_offsetz oninput='validateRightBoxInput(this)' value="+defaults.window_offsetz+" style='width: 6ch;'>"+
		"</table><br>"+
		"<table class=nobreak>"+
		"<withHelp>?<help>door's height cannot be higher than floor height<br><hr> window's height+z-offset cannot be higher than floor height</help></withHelp>"+
		"<tr><td colspan=2 style='text-align: center'>utils"+
		"<tr><td colspan=2><button id=btn_add_floor class=blink>Add floor</button>"+ 
		"<tr><td colspan=2><button id=btn_copy_to_floor class=blink>copy</button> floor "+floor+" to floor <input id=copy_to_floor type=text value="+Object.keys(floors_dimz).length+" disabled style='background-color: darkgrey; color: #333; width: 3ch;'>";
		

		if (floorsCount == floor +1)
		{
			html+=	"<tr><td colspan=2><button id=btn_delete_floor class=blink>Delete floor</button>";
		}

		html+=	"</table>";

	rightBoxShow(html);
}
//}}}
function showHelpBox() {//{{{
	rightBoxShow(
		"<table class=nobreak>"+
		"<tr><td><letter>letter</letter> + <letter>leftMouse</letter><td> create element"+
		"<tr><td><letter>rightMouse</letter><td> element properties"+
		"<tr><td>hold <letter>ctrl</letter> <td> disable snapping"+ 
		"<tr><td><letter>v</letter>	<td> 2D/3D views"+ 
		"<tr><td><letter>n</letter>	<td> loop floors"+ 
		"<tr><td><letter>x</letter>	<td> delete active"+
		"<tr><td><letter>l</letter>	<td> list all of active type"+
		"<tr><td><letter>ctrl</letter> + <letter>i</letter>		<td> geometry as text"+ 
		"<tr><td><letter>ctrl</letter> + <letter>s</letter>		<td> save and read"+
		"<tr><td><letter>ctrl</letter> + <letter>z</letter>		<td> undo"+ 
		"<tr><td><letter>=</letter>	<td> original zoom"+
		"<tr><td><letter>escape</letter><td> cancel create"+
		"</table>"
	);
}
//}}}
function propsXYZ() {//{{{
	sty=" style='width: 40px' ";
	if(cg.type=='evacuee') { 
		return "X <input id=alter-px value="+cg.polypoints[0][0]+ sty+"><br>"+
		"Y <input id=alter-py value="+cg.polypoints[0][1]+ sty+"><br>";
	} else{
		var html = "points:<br><textarea id=alter-polypoints>"+cg.polypoints.join("\n")+"</textarea><br>"
		if (cg.letter == 'ku' || cg.letter == "kd")
			return html;
		else{
			html += "<br>z0:<input id=alter-z0 type=number oninput='validateRightBoxInput(this)' style='width: 8ch;' value='"+cg.z[0]+
			"'><br>z1:<input id=alter-z1 type=number oninput='validateRightBoxInput(this)' style='width: 8ch;' value='"+cg.z[1]+"'>";
		}
		return html;
	}
}
//}}}
function showCgPropsBox() {//{{{

	if(cg.letter==undefined)					 { return; }   // mouse leaving right boxes
	if(db({'name':cg.name}).get()[0]==undefined) { return; }   // clicking right boxes while new element is very infant
	if($("#uimg_remove").length)				 { return; }   // return if underlay menu
	showBuildingLabels(1);
	getFloorExits();
	activeLetter=cg.letter;
	rightBoxShow(
	    "<input id=geom_properties type=hidden value=1>"+
	    "<center><red>&nbsp; "+cg.name+" &nbsp; "+gg[cg.letter]['x']+"</red>"+
		propsXYZ()+
		"<table style='table-layout: auto; width: auto; border-collapse: collapse;''>"+
		roomProps()+
		doorProps()+
		teleportProps()+
		mventProps()+
		vventProps()+
		"</table>"+
		"<br><wheat><letter>x</letter> delete, <letter>l</letter> list</wheat>"+
		"", 0
	);
}
//}}}

function saveRightBoxGeneral() {//{{{
	defaults.door_dimz=Number($("#default_door_dimz").val());
	defaults.door_width=Number($("#default_door_width").val());
	floors_dimz[floor]=Number($("#default_floor_dimz").val());
	defaults.window_dimz=Number($("#default_window_dimz").val());
	defaults.window_offsetz=Number($("#default_window_offsetz").val());
	// the if line below should be after floors_dimz[floor]=Number($("#default_floor_dimz").val());
	// so that it assigns the correct value to the floors_dimz[floor] variable before changing floor
	if (floor != $("#floor").val()) { changeFloor(Number($("#floor").val())); }
	legend();
}
//}}}
function validateForm() {//{{{
	if(!cg.evacuees_density.match(/^auto$|^\d*\.?\d*$/)) { amsg({'err':1, 'msg': "Examples of valid density values:<br>auto<br>0.12"}); }
	if($.isNumeric($("#alter-evacuees-density").val())) { cg.evacuees_density=Number($("#alter-evacuees-density").val()); } 
}
//}}}
function saveRightBoxCgProps() {//{{{
	if(cg.type=='evacuee') {
		cg.polypoints=[[Number($("#alter-px").val()), Number($("#alter-py").val())]];
		cg.z=[50,50];
		$("#"+cg.name).attr('cx', cg.polypoints[0][0]).attr('cy', cg.polypoints[0][1]);   
		cgUpdateSvg();
		cgDb(undoRegister=0);
	} else {
		let z_has_changed = false;
		cg.polypoints=[];
		_.each($("#alter-polypoints").val().split("\n"), function(m) { 
			arr=m.split(",");
			if(arr.length==2 && $.isNumeric(arr[0]) && $.isNumeric(arr[1])) { cg.polypoints.push([Number(arr[0]), Number(arr[1])]); }
		});
		cg.evacuees_density=$("#alter-evacuees-density").val();
		cg.exit_weight=$("#floor_exits_weights_"+cg.name).val();
		if (cg.type == 'room'){
			cg.room_exits_weights = getRoomExitWeight(cg.name);
		}
		cg.mvent_throughput=parseFloat($("#alter-mvent-throughput").val());
		cg.flow_direction=$("#alter-flow-direction").val();
		cg.air_grille_surface=$("#alter-air-grille-surface").val(); 
		validateForm();
		var z0=Number($("#alter-z0").val());
		var z1=Number($("#alter-z1").val());
		if (!isNaN(z0) && !isNaN(z1)){
			if (cg.z[0] != z0 || cg.z[1] != z1)
			{
				z_has_changed = true;
				if (z1 < z0)
					z1=z0;
				cg.z=[z0, z1];
			}
		}

		if(cg.floor != floor) { return; } // Just to be sure, there were (hopefully fixed) issues
		cgUpdateSvg();
		cgDb(undoRegister=0);
		updateSnapLines();
		// property of hall or stair object was changed so we have to check if 
		// we need to create virtual hall/stair additionaly
		if(cg.letter == 's' || cg.letter=='a')
			if (z_has_changed){
				cgDbVirtualObj(cg);
				cgSvgVirtualObj(cg);
			}

	}

} 

function getRoomExitWeight() {//{{{
	adjecentDoorsAndHoles = rooms_and_adjecent_doors_and_holes[cg.name];
	adjecentDoorsAndHolesWeights={};
	adjecentDoorsAndHoles.forEach(function(obj){
		var obj_name = obj[1];
		adjecentDoorsAndHolesWeights[obj[0].idx] = $("#room_exits_weights_"+cg.name+"_"+obj_name).val();
	});
	return adjecentDoorsAndHolesWeights;
}

//}}}
function saveRightBox() {//{{{
	if ($("#general_setup").val() != null)   { saveRightBoxGeneral(); }
	if ($("#geom_properties").val() != null) { saveRightBoxCgProps(); }
	
}
//}}}

function enumVertices() {//{{{
	var mm=d3.select("#buildingLabels");
	if(['room', 'obst', 'mvent', 'fire', 'vvent'].includes(cg.type)) { 
		_.each(cg.polypoints, function(p) { 
			mm.append("text").attr("class","building-vertex").attr("x",p[0]+5).attr("y",p[1]-15).text(p[0]+", "+p[1]);
		});
	}
	if(['evacuee', 'door', 'hole'].includes(cg.type)) { 
        if (cg.polypoints.length>0) { 
            p=cg.polypoints[0];
            mm.append("text").attr("class","building-vertex").attr("x",p[0]+50).attr("y",p[1]+80).text(p[0]+", "+p[1]);
        }
	}
}
//}}}
function showBuildingLabels(aggressive=0, elems=[]) {//{{{
	$("#buildingLabels").html("");
	if(aggressive==1 || aamksUserPrefs.apainter_labels==1) { 
		var mm=d3.select("#buildingLabels");
		enumVertices();
		if(elems.length>0) {
			_.each(elems, function(vv) { 
				_.each(db({'name': vv}).get(), function(v) { 
					if (['d', 'q', 'e'].includes(activeLetter)) { x=v.minx; y=v.miny-30 } else { x=v.minx+15; y=v.miny+50; }
					mm.append("text").attr("class","building-label").attr("x",x).attr("y",y).text(v.name);
				});
			});
		} else {
			_.each(db({'floor': floor, 'letter': activeLetter}).get(), function(v) { 
				if (['d', 'q', 'e'].includes(activeLetter)) { x=v.minx; y=v.miny-30 } else { x=v.minx+15; y=v.miny+50; }
				mm.append("text").attr("class","building-label").attr("x",x).attr("y",y).text(v.name);
			});
		}
	}
}
//}}}
function verifyIntersections() {//{{{
	var pp=PolygonTools.polygon;
	for(var f=0; f<floorsCount; f++) {
		_.each(db({'floor': f, 'type': 'room'}).get(), function(p1) { 
			_.each(db({'floor': f, 'type': 'room'}).get(), function(p2) { 
				if(p1.name!=p2.name && pp.intersection(p1.polypoints,p2.polypoints).length>0) { 
					cgSelect([p1.name, p2.name]);
					activeLetter=p1.letter;
					bulkProps();
					amsg({'err':1, 'msg':"Overlaping rooms:<br>"+p1.name+"<br>"+p2.name}); 
				}
			});
		});
	}
}
//}}}

function sceneBuilder() { //{{{
	d3.select('body').append('view3d');
	d3.select('body').append('view2d');
	d3.select('body').append('legend0');
	d3.select('body').append('legend2');
	d3.select('view2d').append('legend1');
	d3.select('view2d').append("div").attr("id", "apainter-texts-floor").html("floor "+floor+"/"+floorsCount);
	d3.select('view2d').append("div").attr("id", "apainter-texts-keys").html("n: next floor");
	d3.select('view2d').append("div").attr("id", "apainter-texts-pos");
	make_legend0("apainter");
	make_legend2("apainter");
	svg = d3.select('view2d').append('svg').attr("id", "apainter-svg").attr("width", win[0]).attr("height", win[1]);
	svg.append("filter").attr("id", "invertColorsFilter").append("feColorMatrix").attr("values", "-1 0 0 0 1 0 -1 0 0 1 0 0 -1 0 1 0 0 0 1 0");
	axes();
	building = svg.append("g").attr("id", "building");
	buildingLabels=svg.append("g").attr("id", "buildingLabels");
	building.append("g").attr("id", "floor0").attr("class", "floor").attr('fill-opacity',0.4);
	snapLinesSvg = svg.append("g").attr("id", "snapLinesSvg");
	svg.append('circle').attr('id', 'snapper').attr('cx', 100).attr('cy', 100).attr('r',30).attr('fill-opacity', 0).attr('fill', "#ff8800");
	legend();
	d3.select('view2d').append('right-menu-box');
	zoomInit();
}

//}}}
