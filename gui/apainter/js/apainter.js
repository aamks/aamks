const LETTERS = {
	TELEPORT_DOWN: 'kd',
	TELEPORT_UP: 'ku'
}
/**
 * @typedef {Object} ApainterState
 * @property {{ width:number, height:number }} win
 * @property {{ x:number, y:number, k:number }} zoomTransform
 * @property {'2d'|'3d'|'txt'} currentView
 * @property {string} activeLetter
 * @property {number} currentFloor
 * @property {number} floorsCount
 * @property {Object<number,number>} floorsZ0
 * @property {Object<number,number>} floorsDimZ
 * @property {{doorDimZ:number,floorTeleportWidth:number,doorWidth:number,
 * 		windowDimZ:number,windowOffsetZ:number,evacueeRadius:number, 
 * 		obstAndCompartmentMarginWidth:number, snapForceHole:number, snapForceOther:number,
 * 		zAdjFire:number, zAdjEvac:number, zAdjObst:number, zAdjVent:number,
 * 		mventThroughput:number, exitWeight:number}} defaults
 * @property {{x?:number,y?:number}} activeSnap
 * @property {any[]} undoBuffer
 * @property {number} threejsPlay
 * @property {number} floorTeleportUpDir
 * @property {number} floorTeleportDownDir
 * @property {any[]} externalDoors
 * @property {Object<string,any>} roomsAndAdjDoorsAndHoles
 * @property {Object<string,any>} virtualObjParents
 * @property {SVGSVGElement|null} svg
 * @property {d3.Selection|null} building
 * @property {d3.Selection|null} buildingLabels
 * @property {d3.Selection|null} snapLinesSvg
 * @property {{horiz:number[],vert:number[]}} snapLinesArr
 * @property {{x:any,y:any,gX:any,gY:any}} ax
 * @property {any} gg
 * @property {any} ggx
 * @property {any|null} zoom
 * @property {any[]} scene
 */
/** @type {ApainterState} */
var state = {
  win: {width: $(window).width() - 30, 
		height: $(window).height() - 50 },
  zoomTransform: { x: 0, y: 0, k: 1 },
  currentView: '2d',
  activeLetter: 'r',
  currentFloor: 0,
  floorsCount: 1,
  floorsZ0: { 0: 0 },
  floorsDimZ: { 0: 350 },
  defaults: {
    doorDimZ: 200,
    floorTeleportWidth: 70,
    doorWidth: 90,
    windowDimZ: 150,
    windowOffsetZ: 100,
	evacueeRadius: 25,
	obstAndCompartmentMarginWidth: 26,
	snapForceHole: 100,
	snapForceOther: 50,
	zAdjFire: 250,
	zAdjEvac: 150,
	zAdjObst: 100,
	zAdjVent: 50,
	mventThroughput: 1.5,
	exitWeight: 10
  },
  activeSnap: {},
  undoBuffer: [],
  threejsPlay: 1,
  floorTeleportUpDir: 0,
  floorTeleportDownDir: 0,
  externalDoors: [],
  roomsAndAdjDoorsAndHoles: {},
  virtualObjParents: {},
  svg: null,
  building: null,
  buildingLabels: null,
  snapLinesSvg: null,
  snapLinesArr: { horiz: [], vert: [] },
  ax: { x: null, y: null, gX: null, gY: null },
  gg: null,
  ggx: null,
  zoom: null,
  scene: {
    objects: []  // all rooms, doors, windows, etc.
  }
};
/**
 * @typedef {{z0:number,z1:number}} ZRange
 * @typedef {'room'|'door'|'window'|'hole'|'obst'|'mvent'|'vvent'|'floor_teleport'|'evacuee'|'fire'|'underlay_scaler'|'virtualobj'} ObjectType
 * @typedef {Object} SceneObject
 * @property {string} name
 * @property {number} idx
 * @property {number} infant
 * @property {string} letter
 * @property {any[]} polypoints
 * @property {any[]} lines
 * @property {ObjectType} type
 * @property {number} floor
 * @property {ZRange} z
 * @property {number} minx
 * @property {number} miny
 * @property {number} maxx
 * @property {number} maxy
 * @property {?number} [exitWeight]
 * @property {('auto'|number)} [evacueesDensity]
 * @property {Object<string,number>} [roomExitsWeights]
 * @property {?number} [mventThroughput]
 * @property {?string} [flowDirection]
 * @property {?number} [airGrilleSurface]
 * @property {{x:number,y:number}|null} [teleportFrom]
 * @property {{x:number,y:number}|null} [teleportTo]
 * @property {string} preferredSnap
 * @property {number} snapForce
 * 
 */
/** @type {SceneObject|null} */
var currentGeom = null;

function dbAll() {
  return state.scene.objects;
}
function dbWhere(filter) {
  return state.scene.objects.filter(function(o) {
    return Object.keys(filter).every(function(k) {
		const cond = filter[k];
    	if (typeof cond === 'function') {
        	return cond(o[k]);
      	}
		return o[k] === filter[k]; });
  });
}
function dbGet(filter) {
  return dbWhere(filter)[0] || null;
}
function dbInsert(obj) {
  state.scene.objects.push(JSON.parse(JSON.stringify(obj))); // deep copy
}
function dbRemove(filter) {
  state.scene.objects = state.scene.objects.filter(function(o) {
    return !Object.keys(filter).every(function(k) { return o[k] === filter[k]; });
  });
}
function dbRemoveByName(name) {
  state.scene.objects = state.scene.objects.filter(function(o) { return o.name !== name; });
}
function dbUpdate(filter, updates) {
  const matches = dbWhere(filter);
  matches.forEach(function(o) {
    Object.assign(o, updates);
  });
}
function dbUpdateCurrentGeom() {
  if (!currentGeom) return;
  const { name, ...updates } = currentGeom;
  dbUpdate({ name }, updates);
}
function dbMax(filter, field) {
  var arr = dbWhere(filter);
  if (!arr.length) return 0;
  return Math.max.apply(null, arr.map(function(o) { return o[field] || 0; }));
}
function dbMaxMinXY() {
  var arr = dbAll();
  minx = Math.min.apply(null, arr.map(function(o) { return o.minx || 0; }));
  maxx = Math.max.apply(null, arr.map(function(o) { return o.maxx || 0; }));
  maxy = Math.max.apply(null, arr.map(function(o) { return o.maxy || 0; }));
  miny = Math.min.apply(null, arr.map(function(o) { return o.miny || 0; }));
  return {minx, maxx, miny, maxy};
}
function dbBetweenNames(rect) {
  return dbWhere({
	minx: function(v) { return v <= rect.maxx; },
	maxx: function(v) { return v >= rect.minx; },
	miny: function(v) { return v <= rect.maxy; },
	maxy: function(v) { return v >= rect.miny; },
	floor: state.currentFloor}).map(function(o) {
		return o.name;
	});
}
function dbSelect(filter, fields) {
  return dbWhere(filter).map(function(o) {
	if (!Array.isArray(fields)) {
      return o[fields];
    }
    return fields.map(function(f) { return o[f]; });
  });
}
function dbClear() {
  state.scene.objects = [];
}
function getTypeApainterObjects(type, floor=null) {
  return state.scene.objects.filter(function(o) {
	if (floor !== null && o.floor !== floor) {
		return false;
	}
    return state.gg[o.letter].t === type;
  });
}
function debug() {
	console.clear();
	dd(state.scene.objects);
	dd(currentGeom);
	//dd($("#ufloor"+floor)[0]);
	//dd($('#apainter-svg')[0]); 
	//_.each(dbWhere({'letter':'s'}), function(v) {
}

$(function()  { 
	window.oncontextmenu = function () { return false; }    // cancel default menu  
	$.getJSON("inc.json", function(x) {
		state.gg=x['aamksGeoms'];
		state.ggx=x['aamksGeomsMap'];
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
	});
});
//}}}
function registerListeners() {//{{{
	$("right-menu-box").on("click"     , "#btn_copy_to_floor"       , function() { floorCopy() });
	$("right-menu-box").on("click"     , "#btn_add_floor"           , function() { addFloor() });
	$("right-menu-box").on("click"     , "#btn_delete_floor"        , function() { deleteFloor() });
	$("right-menu-box").on("mouseover" , ".bulkProps"               , function() { cgSelect($(this).attr('id'),1,0);});
	$("right-menu-box").on("click"     , '.bulkProps'               , function() { cgSelect($(this).attr('id'));  });
	$("body").on("click"               , '#apainter-save'           , function() { if($("#cad-json-textarea").val()===undefined) { db2cadjson(); } else { saveTxtCadJson(); } });
	$("body").on("click"               , '#apainter-next-view'      , function() { nextView(); });
	$("body").on("click"               , '#button-help'             , function() { showHelpBox(); });
	$("body").on("click"               , '#button-setup'            , function() { showGeneralBox(); });
	$("body").on("click"               , '.legend'                  , function() { state.activeLetter=$(this).attr('letter'); cgStartDrawing(); });
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
		if (e.which !== 3) return;
		cgEscapeCreate();
		if (['circle', 'polygon'].includes(e.target.tagName)) { 
			cgSelect(e.target.id);
		} else { 
			currentGeom={};
		}
	})
}

function keyboardEvents()  { // {{{
	$(this).keyup((e) =>   { if (e.target.nodeName != 'INPUT' && e.key in state.gg && ! e.ctrlKey )   { cgEscapeCreate(); state.activeLetter=e.key; cgStartDrawing(); } });
	$(this).keydown((e) => { if (e.target.nodeName != 'INPUT' && e.key == 'v')                  { cgEscapeCreate(); nextView(); } });
	$(this).keydown((e) => { if (e.target.nodeName != 'INPUT' && e.key == 'p')                  { $("#p1").remove() ; } });
	$(this).keydown((e) => { if (e.target.nodeName != 'INPUT' && e.key == 'n')                  { cgEscapeCreate(); changeFloor(calcNextFloor()); start2dView(); } });
	$(this).keydown((e) => { if (e.target.nodeName != 'INPUT' && e.key == '=')                  { cgEscapeCreate(); resetView(); } });
	$(this).keyup((e) =>   { if (e.target.nodeName != 'INPUT' && e.key == 'i' && e.ctrlKey)     { startTxtView(); } }) ;
	$(this).keydown((e) => { if (e.target.nodeName != 'INPUT' && e.key == 'r' && e.ctrlKey)     { alert('Refreshing will clear unsaved Aamks data. Continue?') ; } }) ;
	$(this).keydown((e) => { if (e.target.nodeName != 'INPUT' && e.key == 's' && e.ctrlKey)     { cgEscapeCreate(); e.preventDefault(); db2cadjson(); importCadJson(); } }) ;
	$(this).keyup((e) =>   { if (e.target.nodeName != 'INPUT' && e.key == 'z' && e.ctrlKey)     { undoApply(); } }) ;
	$(this).keydown((e) => { if (e.target.nodeName != 'INPUT' && e.key == 'x' && ! isEmpty(currentGeom)) { cgEscapeCreate(); cgRemove(); }});
	$(this).keydown((e) => { if (e.target.nodeName != 'INPUT' && e.key == 'l')                  { cgEscapeCreate(); bulkProps(); } });
	$(this).keydown((e) => { if (e.key == 'Escape')												{ escapeAll(); } });
	// debug
	$(this).keydown((e) => { if (e.target.nodeName != 'INPUT' && e.key == ']') { debug(); }});
}
//}}}
function escapeAll(rmbClose=1) {//{{{
	cgEscapeCreate(); 
	legend(); 
	$("#buildingLabels").html(""); 
	$("#apainter-texts-pos").html(''); 
	if(rmbClose==1) { $("right-menu-box").css("display", "none"); }
	setUnderlayDragMode(false);
}
//}}}
function cgIdUpdate(letter) {//{{{
	let similarTypes = ['door', 'hole', 'window'];
	if (similarTypes.includes(state.gg[letter].t)){
		let maxIdDoor = dbMax({"type": similarTypes[0]}, "idx")
		let maxIdHole = dbMax({"type": similarTypes[1]}, "idx")
		let maxIdWin = dbMax({"type": similarTypes[2]}, "idx");
		cgID = Math.max(maxIdDoor, maxIdHole, maxIdWin)+1;
	}
	else
		cgID=dbMax({"type": state.gg[letter].t}, "idx")+1;
	return cgID;
}
//}}}
function updateBbox(obj) {
  var minx = Infinity, miny = Infinity, maxx = -Infinity, maxy = -Infinity;
  for (const [x, y] of obj.polypoints) {
	if (x < minx) minx = x;
	if (y < miny) miny = y;
	if (x > maxx) maxx = x;
	if (y > maxy) maxy = y;
  }
  if (!isFinite(minx)) {
    minx = miny = maxx = maxy = 0;
  }
  obj.minx = minx;
  obj.miny = miny;
  obj.maxx = maxx;
  obj.maxy = maxy;
}

function drawGeom(geom, parentId='#floor') {
  parentId += geom.floor;
  let parent = d3.select(parentId);
  let elemName = (geom.type === 'evacuee') ? 'circle' : 'polygon';
    // Obst margin
  if (geom.type === 'obst') {
    parent.append(elemName)
      .attr('id', 'margin' + geom.name)
      .attr('class', 'OBSTMARGIN')
      .attr('points', scaleRectangleOutward(geom))
  }
  // Room margin
  if (geom.type === 'room') {
    parent.append(elemName)
      .attr('id', 'margin' + geom.name)
      .attr('class', 'COMPARTMENTMARGIN')
      .attr('points', scaleRectangleInward(geom))
  }
  let elem = parent.append(elemName)
    .attr('id', geom.name)
    .attr('class', geom.type + ' ' + state.gg[geom.letter].x);
  if (elemName === 'polygon') {
    elem.attr('points', flatPoints(geom));
  } else {
    let p0 = geom.polypoints[0] || [0, 0];
    elem.attr('cx', p0[0]).attr('cy', p0[1]).attr('r', state.defaults.evacueeRadius);
  }
}
function cgUpdate(){
	updateBbox(currentGeom);
	if(currentGeom.type=='underlay_scaler') { return; }
	currentGeom.lines = computeLines(currentGeom);
	dbUpdateCurrentGeom()
}
function cgDb(undoRegister=1) { //{{{
	if(currentGeom.type=='underlay_scaler') { return; }
    currentGeom.lines = computeLines(currentGeom);
	dbRemoveByName(currentGeom.name);
	addDefaultCgProps();

	dbInsert({"name": currentGeom.name, "idx": currentGeom.idx,
		"letter": currentGeom.letter, "type": currentGeom.type, "lines": currentGeom.lines,
		"polypoints": currentGeom.polypoints, "z": currentGeom.z, "floor": currentGeom.floor,
		"mventThroughput": currentGeom.mventThroughput, "flowDirection":currentGeom.flowDirection,
		"airGrilleSurface":currentGeom.airGrilleSurface, "exitWeight":currentGeom.exitWeight,
		"roomExitsWeights":currentGeom.roomExitsWeights, "evacueesDensity": currentGeom.evacueesDensity, 
		"minx": currentGeom.minx, "miny": currentGeom.miny, "maxx": currentGeom.maxx, "maxy": currentGeom.maxy, 
		"teleportFrom":currentGeom.teleportFrom, "teleportTo":currentGeom.teleportTo});

	if(undoRegister==1) { undoBufferRegister('insert'); }
}

function generateObjectCadJson(obj){
	cad_json = {};
	cad_json['points']=JSON.stringify(obj.polypoints);
	cad_json['idx']=obj.idx;
	cad_json['z']=JSON.stringify([obj.z.z0, obj.z.z1]);

	if(obj.type=='door') {
		if (obj.exitWeight != null)
			cad_json["exitWeight"]=obj.exitWeight;
	} else if(obj.type=='room') {
		cad_json["evacueesDensity"]=obj.evacueesDensity;
		if (obj.roomExitsWeights != null)
			cad_json["roomExitsWeights"]=obj.roomExitsWeights; 
	} else if(obj.type=='mvent') {
		cad_json["mventThroughput"]=obj.mventThroughput;
		if (obj.flowDirection != null)
			cad_json["flowDirection"]=obj.flowDirection;
		if (obj.airGrilleSurface != null)
			cad_json["airGrilleSurface"]=obj.airGrilleSurface;
	}else if(obj.type=='floor_teleport') {
		cad_json["teleportFrom"]=obj.teleportFrom;
		cad_json["teleportTo"]=obj.teleportTo;
		if (obj.exitWeight != null)
			cad_json["exitWeight"]=obj.exitWeight;
	}
	return cad_json;
}

function undoApply() {//{{{
	escapeAll();
	if (state.undoBuffer.length==0) { return; }
	currentGeom=state.undoBuffer.pop();
	if(currentGeom.op=='insert') { 
		cgRemove(undoRegister=0);
	} else {
		$("#"+currentGeom.name).remove(); cgDb(undoRegister=0); drawGeom(currentGeom); updateSnapLines();
	}
}
//}}}
function undoBufferRegister(op) {//{{{
	var data=deepcopy(dbGet({"name": currentGeom.name}));
	if(data){
		data.op=op;
		state.undoBuffer.push(data);
	}
}
//}}}
function resetView(){//{{{
	state.zoom.transform(state.svg, d3.zoomIdentity.translate(100,100).scale(0.2));
}
//}}}
function zoomInit() {
  state.zoom = d3.zoom()
    .scaleExtent([1/30, 4])
    .translateExtent([[-1200, -1200], [1e6, 1e6]])
    .filter(zoomFilter)
    .on('zoom', zoomedwin);

  state.svg
    .call(state.zoom)
    .on('dblclick.zoom', null);  // disable dblclick zoom
  
  resetView();
}
//}}}
function zoomFilter(event) {
  // wheel scroll (0) or wheel press (1), ignore left/right click (0)/(2)
  return event.type === 'wheel' || event.button === 1;
}
function zoomedwin(event) {
  const t = event.transform;
  state.zoomTransform = t;
  state.building.attr('transform', t);
  state.buildingLabels.attr('transform', t);
  state.snapLinesSvg.attr('transform', t);
  $('#snapper').attr('transform', t);
  state.ax.gX.call(state.ax.xAxis.scale(t.rescaleX(state.ax.x)));
  state.ax.gY.call(state.ax.yAxis.scale(t.rescaleY(state.ax.y)));
}
//}}}
function calcNextFloor() {//{{{
	if (state.currentFloor >= state.floorsCount - 1) {
		return 0;
	} else {
		return state.currentFloor+1;
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
	state.threejsPlay=0;
}
//}}}
function closeTxtView() {//{{{
	$("#div-cad-json-textarea").remove();
}
//}}}
function start2dView() {//{{{
	state.currentView='2d'; 
	close3dView();
	$("view2d").css("display", "block");
	$("#apainter-svg").css("display", "block");
}
//}}}
function start3dView() {//{{{
	state.threejsPlay=1;
	state.currentView='3d'; 
	close2dView();
	view3d();
	$("view3d").css("display", "block");
}
//}}}
function startTxtView(pretty_json="") {//{{{
	close2dView();
	close3dView();
	closeTxtView();
	state.currentView='txt'; 
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

	if(state.currentView=='2d')       { start3dView(); }
	else if(state.currentView=='3d')  { start2dView(); }
	else if(state.currentView=='txt') { start2dView(); }
}
//}}}
function cgRemove(undoRegister=1) {//{{{
	if(undoRegister==1) { undoBufferRegister('remove'); }
	$("#"+currentGeom.name).remove();
	dbRemoveByName(currentGeom.name)
	updateSnapLines();
	if($("#gg_listing").length==0) { 
		$("right-menu-box").css("display", "none"); 
	} else {
		bulkProps(); 
	}
	showBuildingLabels();
	$(".building-vertex").remove() 
	if (currentGeom.type == 'door' || currentGeom.type == 'hole'){	
		_.each(dbWhere({'floor': currentGeom.floor, 'type': 'room'}), function(m){
			if (m.roomExitsWeights !== undefined && currentGeom.idx in m.roomExitsWeights)
				delete m.roomExitsWeights[currentGeom.idx];
		});
	}
	if (currentGeom.type == 'obst'){	
		$("#margin"+currentGeom.name).remove();
	}
	if (currentGeom.type == 'room'){	
		$("#margin"+currentGeom.name).remove();
	}
}
//}}}

function updateSnapLines() { //{{{
	const lines=dbSelect({'floor': state.currentFloor}, 'lines');
	d3.select("#snapLinesSvg").selectAll("line").remove();
	state.snapLinesArr['horiz']=[];
	state.snapLinesArr['vert']=[];

	appendSnapLinesSvg(lines);

	state.snapLinesArr['horiz']=Array.from(new Set(state.snapLinesArr['horiz']));
	state.snapLinesArr['vert']=Array.from(new Set(state.snapLinesArr['vert']));
}

function appendSnapLinesSvg(lines){
	for(var points in lines) { 
		var below = lines[points][0][1];
		var above = lines[points][2][1];
		var right = lines[points][0][0];
		var left  = lines[points][1][0];

		state.snapLinesArr['horiz'].push(below);
		state.snapLinesArr['horiz'].push(above);
		state.snapLinesArr['vert'].push(right);
		state.snapLinesArr['vert'].push(left);

		state.snapLinesSvg.append('line').attr('id' , 'sh_'+below).attr('class' , 'snap_v').attr('y1' , below).attr('y2' , below).attr('x1' , -100000).attr('x2' , 100000).attr("visibility", "hidden");
		state.snapLinesSvg.append('line').attr('id' , 'sh_'+above).attr('class' , 'snap_v').attr('y1' , above).attr('y2' , above).attr('x1' , -100000).attr('x2' , 100000).attr("visibility", "hidden");
		state.snapLinesSvg.append('line').attr('id' , 'sv_'+right).attr('class' , 'snap_h').attr('x1' , right).attr('x2' , right).attr('y1' , -100000).attr('y2' , 100000).attr("visibility", "hidden");
		state.snapLinesSvg.append('line').attr('id' , 'sv_'+left).attr('class'  , 'snap_h').attr('x1' , left).attr('x2'  , left).attr('y1'  , -100000).attr('y2' , 100000).attr("visibility", "hidden");
	}
}
//}}}
function axes() { //{{{
	state.ax.x = d3.scaleLinear()
		.domain([-1, state.win.width+ 1])
		.range([-1, state.win.width+ 1 ]);

	state.ax.y = d3.scaleLinear()
		.domain([-1, state.win.height + 1])
		.range([-1, state.win.height + 1]);

	state.ax.xAxis = d3.axisBottom(state.ax.x)
		.ticks(screen.width/800)
		.tickSize(state.win.height)
		.tickPadding(2 - state.win.height);

	state.ax.yAxis = d3.axisRight(state.ax.y)
		.ticks(screen.height/800)
		.tickSize(state.win.width)
		.tickPadding(2 - state.win.width);
	state.svg.append("g").attr("id", "axes");

	state.ax.gX = d3.select("#axes").append("g")
		.attr("class", "axis axis--x")
		.call(state.ax.xAxis);

	state.ax.gY = d3.select("#axes").append("g")
		.attr("class", "axis axis--y")
		.call(state.ax.yAxis);
}

function addFloor() {//{{{
	state.currentFloor = state.floorsCount;
	state.floorsCount++;
	state.building.append("g").attr("id", "floor"+state.currentFloor).attr("class", "floor").attr('fill-opacity',0.4);
	setNewFloorAttr(state.currentFloor);
	state.floorsDimZ[state.currentFloor] = state.floorsDimZ[state.currentFloor-1];
	state.floorsZ0[state.currentFloor] = getSumDimZLower(state.currentFloor);
	showGeneralBox();
}

function deleteFloor() {//{{{
	let _floor = Number($("#floor").val());
	deletefloorZData();
	state.floorsCount--;
	state.currentFloor = _floor-1;
	d3.select('#floor'+_floor).remove();
	setNewFloorAttr(_floor-1);
	showGeneralBox();
	dbRemove({floor: _floor});
}

function deletefloorZData(){
	var keys = Object.keys(state.floorsDimZ);
	var lastKey = keys[keys.length - 1];
	delete state.floorsDimZ[lastKey];
	keys = Object.keys(state.floorsZ0);
	lastKey = keys[keys.length - 1];
	delete state.floorsZ0[lastKey];
}

function changeFloor(requested_floor) {//{{{
	if(state.currentFloor > state.floorsCount-1) { 
		return;
	}
	state.undoBuffer=[];
	escapeAll();
	$("#p1").remove();
	state.currentFloor=requested_floor;
	setNewFloorAttr(state.currentFloor);
}

function setNewFloorAttr(floor) {//{{{
	$(".floor").attr("visibility","hidden");
	$("#floor"+floor).attr("visibility","visible");
	updateSnapLines();
	$("#apainter-texts-floor").html("floor "+(state.currentFloor + 1)+"/"+state.floorsCount);
	$("#apainter-texts-floor").clearQueue().finish();
	$("#apainter-texts-floor").css("opacity",1).animate({"opacity": 0.1}, 1000);
}
//}}}
function getEffectiveSnapForce() {
    const k = state.zoomTransform ? state.zoomTransform.k : 1;
    const baseSnap = currentGeom.snapForce;   // snap at k = 1 (in pixels)
    const minSnap = 5;
    const maxSnap = 100;
    return Math.max(minSnap, Math.min(maxSnap, baseSnap / k));
}
function activeSnapX(m) {//{{{
	const snapForce = getEffectiveSnapForce();
	for(var point in state.snapLinesArr['vert']) {
		p=state.snapLinesArr['vert'][point];
		if (m.x > p - snapForce && m.x < p + snapForce) { 
			state.activeSnap.x=p;
			break;
		}
	}
}
//}}}
function activeSnapY(m) {//{{{
	const snapForce = getEffectiveSnapForce();
	for(var point in state.snapLinesArr['horiz']) {
		p=state.snapLinesArr['horiz'][point];
		if (m.y > p - snapForce && m.y < p + snapForce) { 
			state.activeSnap.y=p;
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
	state.activeSnap={};
	if(!['room', 'hole', 'window', 'door'].includes(currentGeom.type)) { return; }
	snappingHide(0);
	if (event.ctrlKey) { $('#snapper').attr('fill-opacity', 0); return; } 

	activeSnapX(m); 
	activeSnapY(m); 

    if (['window', 'door'].includes(currentGeom.type)) { snapKeepDirection(m); }
	if(isEmpty(state.activeSnap)) { snappingHide();  } else { snappingShow(m); }
}

//}}}
function snapKeepDirection(m) {//{{{
	// Prevent ortho-changing snapping 
	if (!('y' in state.activeSnap) && 'x' in state.activeSnap) { currentGeom.preferredSnap='x'; }
	if (!('x' in state.activeSnap) && 'y' in state.activeSnap) { currentGeom.preferredSnap='y'; }
	state.activeSnap={};
	if(currentGeom.preferredSnap=='x') { 
		activeSnapX(m); 
	} else {
		activeSnapY(m); 
	}
}
//}}}
function snappingShow(m) {//{{{
	$('#snapper').attr('fill-opacity', 1).attr({ r: 10, cx: m.x, cy: m.y}); 
	if("x" in state.activeSnap) { 
		$("#sv_"+state.activeSnap.x).attr("visibility", "visible"); 
		$('#snapper').attr({ cx: state.activeSnap.x}); 
	}
	if("y" in state.activeSnap) { 
		$("#sh_"+state.activeSnap.y).attr("visibility", "visible"); 
		$('#snapper').attr({ cy: state.activeSnap.y});
	}

	if("x" in state.activeSnap && "y" in state.activeSnap) { $('#snapper').attr({ r: 30}); }
}
//}}}
function cgInit() {
  currentGeom = null;

  const idx = cgIdUpdate(state.activeLetter);
  const name = state.activeLetter + idx;

  /** @type {SceneObject} */
  let obj = {
    name: name,
    idx: idx,
	infant: 1,
    letter: state.activeLetter,
	polypoints: [],
    type: state.gg[state.activeLetter].t,
    floor: state.currentFloor,
    points: [],
	lines: [],
    z: { z0: state.floorsZ0[state.currentFloor], z1: state.floorsDimZ[state.currentFloor] },
    minx: 0,
    miny: 0,
    maxx: 0,
    maxy: 0,
    exitWeight: state.defaults.exitWeight,
    evacueesDensity: 'auto',
    roomExitsWeights: undefined,
    mventThroughput: state.defaults.mventThroughput,
    flowDirection: null,
    airGrilleSurface: null,
    teleportFrom: null,
    teleportTo: null,
	preferredSnap: null,
	snapForce: (state.gg[state.activeLetter].t == 'hole') ? state.defaults.snapForceHole : state.defaults.snapForceOther,
  };
  if (obj.type === 'fire') {
    obj.z.z1 = obj.z.z0 + state.defaults.zAdjFire;
  } else if (obj.type === 'evacuee') {
    obj.z.z1 = obj.z.z0 + state.defaults.zAdjEvac;
  } else if (obj.type === 'obst') {
    obj.z.z1 = obj.z.z0 + state.defaults.zAdjObst;
  } else if (obj.type === 'mvent' || obj.type === 'vvent') {
    obj.z.z1 = obj.z.z0 + state.defaults.zAdjVent;
  } else if (obj.type === 'window') {
    obj.z.z0 = state.floorsZ0[state.currentFloor] + state.defaults.windowOffsetZ;
    obj.z.z1 = obj.z.z0 + state.defaults.windowDimZ;
  } else if (obj.type === 'door') {
    obj.z.z1 = obj.z.z0 + state.defaults.doorDimZ;
  } else if (obj.type === 'room') {
    obj.z.z1 = obj.z.z0 + state.floorsDimZ[state.currentFloor];
	obj.evacueesDensity = 'auto';
  }
  currentGeom = obj;
}

function scaleMouse(pos) {//{{{
	return {'x': Math.round((pos[0]-state.zoomTransform.x)/state.zoomTransform.k), 'y': Math.round((pos[1]-state.zoomTransform.y)/state.zoomTransform.k) };
} //}}}
function cgCreate() {//{{{
	cgInit();
	state.svg.on('mousedown', function(event) {
		if(event.button === 0) { // left click
			m=scaleMouse(d3.pointer(event, this));
			currentGeom.growing=1;
			cgDecidePoints(m);
			drawGeom(currentGeom);
			updateBbox(currentGeom)
			delete currentGeom.infant;
		} else if(event.button === 2) { // right click
			cgEscapeCreate();
		}
	});
	state.svg.on('mousemove', function(event) {
		if (!currentGeom || !currentGeom.growing) { return; }
		m=scaleMouse(d3.pointer(event, this));
		snap(m);
		cgDecidePoints(m);
		cgUpdateSvg(m); 
		updatePosInfo(m);
	});  
	state.svg.on('mouseup', function(event) {
		checkNegativeCords();
		if(assertCgReady()) {
			delete currentGeom.growing;
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
	if(currentGeom.type=='mvent') {
		const [r1, r2] = getConnectedZones(currentGeom);
		if (r1==null || r2==null){
			amsg({'err':2, 'msg':"Coorect mvent size and localization because it intersects not properly", 'duration': 20000}); 
		}
		let mventWithDuct = false;
		if (r1 == 'OUTSIDE' || r2 == 'OUTSIDE') {
			// mechanical vent with duct leading outside
			mventWithDuct = true;
		}
		else
		{
			// add this property for newly created mvent so that the flowDirection and 
			// airGrilleSurface fields  (only in case of mventWithDuct==true)
			// are not set to null or undefined (they must always be set to something)
			// different from (null or undefined)
			if(currentGeom.flowDirection == null)
			{
				currentGeom.flowDirection=`${r1} to ${r2}`;
			}
			if(currentGeom.airGrilleSurface == null)
			{
				if(mventWithDuct == true){
					currentGeom.airGrilleSurface='x_min';
				}
			}
		}
	} 
}
function checkNegativeCords(){
	var negative = false
	currentGeom.polypoints.forEach(function(array){array.forEach(function(x){
		if(x < 0){
			negative = true
		}
	})})
	if(negative){
		delete currentGeom.growing;
		cgInit();
		amsg({'err':1, 'msg':"Object in negative coordinates! You can not draw here!"}); 
	}
}

function holeOnExternalWall(){
	if (currentGeom.letter == 'z'){
		var external = IsExternal(currentGeom);
		if (external){
			amsg({'err':2, 'msg':"You drew a hole in the outside wall. You can't do that. The holes are used to connect compartments. In the external wall you can draw normal door, windows, mechanical or normal vents."}); 
		}
		return external;
	}
}
function IsExternal(geometry){
	const [r1, r2] = getConnectedZones(geometry);
	if(r1 == 'OUTSIDE' || r2 == 'OUTSIDE')
		return true;
	return false;
}

function getConnectedZones(geometry){
    function hasVolumeIntersection(a, b) {
        return (
            a.minx < b.maxx && a.maxx > b.minx &&
            a.miny < b.maxy && a.maxy > b.miny &&
            a.z.z0 < b.z.z1 && a.z.z1 > b.z.z0
        );
    }
    function isLineOrPlaneIntersection(a, b) {
        return (
            (a.minx === b.maxx || a.maxx === b.minx) &&
            (a.miny === b.maxy || a.maxy === b.miny) &&
            (a.z.z0 === b.z.z1 || a.z.z1 === b.z.z0)
        );
    }
	function isObjectOutside(object, rooms) {
	    const vertices = [
	        { x: object.minx, y: object.miny, z: object.z.z0 },
	        { x: object.minx, y: object.miny, z: object.z.z1 },
	        { x: object.minx, y: object.maxy, z: object.z.z0 },
	        { x: object.minx, y: object.maxy, z: object.z.z1 },
	        { x: object.maxx, y: object.miny, z: object.z.z0 },
	        { x: object.maxx, y: object.miny, z: object.z.z1 },
	        { x: object.maxx, y: object.maxy, z: object.z.z0 },
	        { x: object.maxx, y: object.maxy, z: object.z.z1 }
	    ];
	    for (let vertex of vertices) {
	        const { x, y, z } = vertex;
	        const isInsideAnyRoom = rooms.some(room =>
	            x >= room.minx && x <= room.maxx &&
	            y >= room.miny && y <= room.maxy &&
	            z >= room.z.z0 && z <= room.z.z1
	        );
	        if (!isInsideAnyRoom) {
	            return true;
	        }
	    }
	    return false;
	}
    // Get all rooms
    let rooms = getTypeApainterObjects('room', geometry.floor - 1)
				.concat(
				getTypeApainterObjects('room', geometry.floor),
				getTypeApainterObjects('room', geometry.floor + 1)
				);
    let connectedZones = [];

    for (let room of rooms) {
        if (hasVolumeIntersection(geometry, room) && !isLineOrPlaneIntersection(geometry, room)) {
            connectedZones.push(room.name);
        }
    }
    if (connectedZones.length == 0){
        amsg({ 'err': 2, 'msg': "The connection object does not intersect any zones. Please correct apainter geometry.", 'duration': 8000 });
        return [null, null];
	}
    if (isObjectOutside(geometry, rooms.filter(room => connectedZones.includes(room.name)))) {
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
		connectedZones.push('OUTSIDE');
    }
	return connectedZones;
}

function updatePosInfo(m) {//{{{
	if(currentGeom.infant==1) {
		$("#apainter-texts-pos").html(m.x+" "+m.y+" "+currentGeom.z.z0);
	} else {
		updateBbox(currentGeom);
		$("#apainter-texts-pos").html(m.x+" "+m.y+" "+currentGeom.z.z0+" &nbsp; &nbsp;  size: "
			+(currentGeom.maxx-currentGeom.minx)+" "+ (currentGeom.maxy-currentGeom.miny) +" "+(currentGeom.z.z1-currentGeom.z.z0));
	}
}
//}}}
function ctrlDrawing(m) {//{{{
	if("infant" in currentGeom && "growing" in currentGeom) { currentGeom.polypoints.push([m.x,m.y]); } 
	if(currentGeom.polypoints.length==0) { return; }
	p0=[currentGeom.polypoints[0][0], currentGeom.polypoints[0][1]];
	p1=[m.x, currentGeom.polypoints[0][1]];
	p2=[m.x, m.y];
	p3=[currentGeom.polypoints[0][0], m.y];
	currentGeom.polypoints=[p0,p1,p2,p3];
}
//}}}
function cgDecidePoints(m) {//{{{
	if (event.ctrlKey) { ctrlDrawing(m); return; }

	if("x" in state.activeSnap) { px=state.activeSnap.x; } else { px=m.x; }
	if("y" in state.activeSnap) { py=state.activeSnap.y; } else { py=m.y; }
	if("growing" in currentGeom) { currentGeom.polypoints.push([px,py]); }
	if(currentGeom.polypoints.length==0) { return; }

	switch (currentGeom.type) {
		case 'floor_teleport':
		if (state.activeLetter == LETTERS.TELEPORT_DOWN)
		{
			switch (state.floorTeleportDownDir % 4) {
				//arrow left downstairs
				case 0:
					p0=[px, py];
					p1=[px+state.defaults.floorTeleportWidth, py-10];
					p2=[px+state.defaults.floorTeleportWidth, py+10];
					p3=[px, py];
					currentGeom.teleportFrom = [px+state.defaults.floorTeleportWidth, py]
					currentGeom.teleportTo = [px, py]
					break;
				//arrow up downstairs
				case 1:
					p0=[px, py];
					p1=[px+10, py+state.defaults.floorTeleportWidth];
					p2=[px-10, py+state.defaults.floorTeleportWidth];
					p3=[px, py];
					currentGeom.teleportFrom = [px, py+state.defaults.floorTeleportWidth]
					currentGeom.teleportTo = [px, py]
					break;
				//arrow right downstairs
				case 2:
					p0=[px, py];
					p1=[px-state.defaults.floorTeleportWidth, py+10];
					p2=[px-state.defaults.floorTeleportWidth, py-10];
					p3=[px, py];
					currentGeom.teleportFrom = [px-state.defaults.floorTeleportWidth, py]
					currentGeom.teleportTo = [px, py]
					break;
				//arrow down downstairs
				case 3:
					p0=[px, py];
					p1=[px-10, py-state.defaults.floorTeleportWidth];
					p2=[px+10, py-state.defaults.floorTeleportWidth];
					p3=[px, py];
					currentGeom.teleportFrom = [px, py-state.defaults.floorTeleportWidth]
					currentGeom.teleportTo = [px, py]
					break;
				
				default:
					break;
			}
		}
		else if (state.activeLetter == LETTERS.TELEPORT_UP)
		{
			switch (state.floorTeleportUpDir % 4) {
			//arrow left upstairs
				case 0:
					p0=[px, py];
					p1=[px+state.defaults.floorTeleportWidth, py-10];
					p2=[px+state.defaults.floorTeleportWidth, py+10];
					p3=[px, py];
					currentGeom.teleportFrom = [px+state.defaults.floorTeleportWidth, py]
					currentGeom.teleportTo = [px, py]
					break;
				//arrow up upstairs
				case 1:
					p0=[px, py];
					p1=[px+10, py+state.defaults.floorTeleportWidth];
					p2=[px-10, py+state.defaults.floorTeleportWidth];
					p3=[px, py];
					currentGeom.teleportFrom = [px, py+state.defaults.floorTeleportWidth]
					currentGeom.teleportTo = [px, py]
					break;
				//arrow right upstairs
				case 2:
					p0=[px, py];
					p1=[px-state.defaults.floorTeleportWidth, py+10];
					p2=[px-state.defaults.floorTeleportWidth, py-10];
					p3=[px, py];
					currentGeom.teleportFrom = [px-state.defaults.floorTeleportWidth, py]
					currentGeom.teleportTo = [px, py]
					break;
				//arrow down upstairs
				case 3:
					p0=[px, py];
					p1=[px-10, py-state.defaults.floorTeleportWidth];
					p2=[px+10, py-state.defaults.floorTeleportWidth];
					p3=[px, py];
					currentGeom.teleportFrom = [px, py-state.defaults.floorTeleportWidth]
					currentGeom.teleportTo = [px, py]
					break;
				default:
					break;
			}
		}
		break;
		case 'door':
			if("x" in state.activeSnap) { 
				p0=[px-16, py-state.defaults.doorWidth];
				p1=[px+16, py-state.defaults.doorWidth];
				p2=[px+16, py];
				p3=[px-16, py];
			} else {
				p0=[px,py-16];
				p1=[px+state.defaults.doorWidth,py-16];
				p2=[px+state.defaults.doorWidth,py+16];
				p3=[px,py+16];
			}
			break;
		case 'window': case 'hole':
			if(isEmpty(state.activeSnap)) { currentGeom.polypoints=currentGeom.polypoints.slice(0,3); return; }
			if(currentGeom.preferredSnap==null) { 
				updateBbox(currentGeom); 
				if(currentGeom.maxx-currentGeom.minx > 32)       { currentGeom.preferredSnap='y'; }
				else if(currentGeom.maxy-currentGeom.miny > 32 ) { currentGeom.preferredSnap='x'; }
			}
			if(currentGeom.preferredSnap==null) { return; }

			if(currentGeom.preferredSnap=='y') { 
				p0=[currentGeom.polypoints[0][0], py+16];
				p1=[px, py+16];
				p2=[px, py-16];
				p3=[currentGeom.polypoints[0][0], py-16];
			} else {
				p0=[px-16, currentGeom.polypoints[0][1]];
				p1=[px+16, currentGeom.polypoints[0][1]];
				p2=[px+16, py];
				p3=[px-16, py]; 
			} 
			break;
		default:
			p0=[currentGeom.polypoints[0][0], currentGeom.polypoints[0][1]];
			p1=[px, currentGeom.polypoints[0][1]];
			p2=[px, py];
			p3=[currentGeom.polypoints[0][0], py];
			break;
	}
	currentGeom.polypoints=[p0,p1,p2,p3];
}
//}}}
function assertCgReady() {//{{{
	if(currentGeom.type=='floor_teleport') { return true; }
	if(currentGeom.type=='evacuee') { currentGeom.polypoints=[currentGeom.polypoints[0]]; return true; }
	if(currentGeom.polypoints.length<2) { $("#"+currentGeom.name).remove(); return false; }
	if(currentGeom.polypoints[0][0]==currentGeom.polypoints[1][0] && currentGeom.polypoints[0][1]==currentGeom.polypoints[1][1]) { $("#"+currentGeom.name).remove(); return false; }

	if(currentGeom.type=='underlay_scaler') { 
		updateBbox(currentGeom)
		currentGeom.growing=0
		underlayForm(currentGeom.maxx-currentGeom.minx);
		return true;
	}
	return true;
}
//}}}
function flatPoints(obj) {//{{{
	return obj.polypoints.join(" ");
}
function scaleRectangleOutward(obj) {
 	const adjustedPoints = [
	  [obj.minx - state.defaults.obstAndCompartmentMarginWidth, obj.miny - state.defaults.obstAndCompartmentMarginWidth], // Top-left corner
	  [obj.maxx + state.defaults.obstAndCompartmentMarginWidth, obj.miny - state.defaults.obstAndCompartmentMarginWidth], // Top-right corner
	  [obj.maxx + state.defaults.obstAndCompartmentMarginWidth, obj.maxy + state.defaults.obstAndCompartmentMarginWidth], // Bottom-right corner
	  [obj.minx - state.defaults.obstAndCompartmentMarginWidth, obj.maxy + state.defaults.obstAndCompartmentMarginWidth], // Bottom-left corner
	];
	return adjustedPoints.join(" ");
}
function scaleRectangleInward(obj) {
	let halfStrokeWidth = state.defaults.obstAndCompartmentMarginWidth/2;
	// Calculate outward offset for each corner of the rectangle
	const adjustedPoints = [
	  [obj.minx + halfStrokeWidth, obj.miny + halfStrokeWidth], // Top-left corner
	  [obj.maxx - halfStrokeWidth, obj.miny + halfStrokeWidth], // Top-right corner
	  [obj.maxx - halfStrokeWidth, obj.maxy - halfStrokeWidth], // Bottom-right corner
	  [obj.minx + halfStrokeWidth, obj.maxy - halfStrokeWidth], // Bottom-left corner
	];
	return adjustedPoints.join(" ");
}
//}}}
function cgUpdateSvg(m=null) {  //{{{
	if(currentGeom.type=='evacuee') {
		if(m) currentGeom.polypoints[0] = [m.x, m.y]
		$("#"+currentGeom.name).attr('cx', currentGeom.polypoints[0][0]).attr('cy', currentGeom.polypoints[0][1]);
	}
	$("#"+currentGeom.name).attr({ 'points': flatPoints(currentGeom) });   
	if (currentGeom.type =='obst')
		$("#margin"+currentGeom.name).attr({ 'points': scaleRectangleOutward(currentGeom) });   
	if (currentGeom.type =='room' || currentGeom.type =='vroom')
		$("#margin"+currentGeom.name).attr({ 'points': scaleRectangleInward(currentGeom) });
}
//}}}

function manageTeleportArrows() {//{{{
	if (state.activeLetter == LETTERS.TELEPORT_UP || state.activeLetter == LETTERS.TELEPORT_DOWN)
	{
		content = "";
		arrows = ["&#8592;", "&#8593;", "&#8594;","&#8595;"];
		if (state.activeLetter == LETTERS.TELEPORT_UP )
		{
			state.floorTeleportUpDir+=1;
			switch (state.floorTeleportUpDir % 4) {
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
		else if (state.activeLetter == LETTERS.TELEPORT_DOWN )
		{
			state.floorTeleportDownDir+=1;
			switch (state.floorTeleportDownDir % 4) {
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
		document.getElementById("legend_"+state.activeLetter).innerHTML = content;
	}
}

function cgStartDrawing() {//{{{
	$('right-menu-box').fadeOut(0); 
	legend();
	$('#legend_'+state.activeLetter).css({'color': '#f00', 'background-color': '#000', 'border-bottom': "1px solid #0f0"});
	manageTeleportArrows()
	cgCreate();
	setUnderlayDragMode(false);
}
//}}}
function cgEscapeCreate() {//{{{
	if(!isEmpty(currentGeom) && "growing" in currentGeom) { cgRemove(undoRegister=0); } 
	$(".temp-poly").remove();
	$("#apainter-texts-pos").html('');
	$(".building-vertex").remove() 
	$(".cg-selected").removeClass('cg-selected'); 
	state.svg.on('mousedown', null); state.svg.on('mousemove', null); state.svg.on('mouseup', null); 
	snappingHide();
	legend();
	if($("#gg_listing").length>0) { return; }
	if($("input#ufloor").length>0) { return; }
	$("right-menu-box").css("display", "none"); 
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

	state.floorsCount=0;
	for (var _floor in json) { 
		d3.select("#building").append("g").attr("id", "floor"+_floor).attr("class", "floor").attr("fill-opacity", 0.4).attr('visibility',"hidden");
		state.floorsCount++;
	}
	$("#floor"+state.currentFloor).attr('visibility',"visible").css("opacity", 1);
	$("#apainter-texts-floor").html("floor "+(state.currentFloor + 1)+"/"+state.floorsCount);
}
//}}}
function json2db(json) { //{{{
	dbClear();
	// Geoms must come in order, otherwise we could see DOOR under ROOM if geoms were created in that order.
	var letter;
	var lastGeom;
	var elems=["ROOM","COR","STAI","HALL","OBST","VVENT","MVENT","HOLE","WIN","DOOR","FLOOR_TELEPORT_UP","FLOOR_TELEPORT_DOWN", "DCLOSER","DELECTR","EVACUEE","FIRE","UNDERLAY_SCALER"];
	_.each(json, function(floor_data,floor) { 
		_.each(elems, function(elem) { 
			_.each(floor_data[elem], function(record) { 
				letter=state.ggx[elem];
				var geom = createGeomFromRecord(floor, letter, record);
				dbInsert(geom);
				drawGeom(geom); 
				if(letter == 's' || letter=='a'){
					createAndDrawVirtualObjs(geom)
				}
				lastGeom=geom;
			})
		})
	});
	currentGeom = lastGeom;
	updateSnapLines(); // This is a heavy call, which shouldn't be called for each cgDb()
	state.undoBuffer=[];
}
function createAndDrawVirtualObjs(parentGeom) {
  removeVirtualObjs(parentGeom.name);
  const floors = findIntersectingFloors(parentGeom);
  const virtualObjNameMap = { 's': 'vs', 'a': 'va' };
  const virtualObjMap = { 
    's': state.gg['vs'].t, // vroom
    'a': state.gg['va'].t  // vroom
  };
  floors.forEach(function(floor) {
    const vObj = createVirtualObj(parentGeom, floor, virtualObjNameMap, virtualObjMap);
    state.scene.objects.push(vObj);
    drawGeom(vObj);
    state.virtualObjParents[parentGeom.name].push(vObj)
  });
}

function removeVirtualObjs(parentName) {
  if (!(parentName in state.virtualObjParents)){
    state.virtualObjParents[parentName] = [];
	return;
  }
  state.virtualObjParents[parentName].forEach(function(vObj) {
    dbRemoveByName(vObj.name);
    d3.select('#' + vObj.name)?.remove();
    d3.select('#margin' + vObj.name)?.remove();
  });
}

function createVirtualObj(parentGeom, floor, virtualObjNameMap, virtualObjMap) {
  var vcgIDx = dbMax({ type: virtualObjMap[parentGeom.letter] }, 'idx') + 1;
  var vcgName = virtualObjNameMap[parentGeom.letter] + vcgIDx;
  
  return {
    name: vcgName,
    idx: vcgIDx,
    floor: floor,
    letter: virtualObjNameMap[parentGeom.letter],
    type: virtualObjMap[parentGeom.letter],
    lines: parentGeom.lines,
    polypoints: parentGeom.polypoints,
    z: parentGeom.z,
    exitWeight: parentGeom.exitWeight,
    roomExitsWeights: parentGeom.roomExitsWeights,
    evacueesDensity: parentGeom.evacueesDensity,
    minx: parentGeom.minx,
    miny: parentGeom.miny,
    maxx: parentGeom.maxx,
    maxy: parentGeom.maxy,
    teleportFrom: parentGeom.teleportFrom,
    teleportTo: parentGeom.teleportTo
  };
}
function findIntersectingFloors(parentGeom) {
  var z_min = parentGeom.z.z0;
  var z_max = parentGeom.z.z1;
  var floors = [];
  
  for (var floor = 0; floor < state.floorsCount; floor++) {
    if (state.floorsZ0[floor] > z_min && state.floorsZ0[floor] < z_max) {
      if (floor !== parentGeom.floor) {
        floors.push(floor);
      }
    }
  }
  return floors;
}
//}}}
function createGeomFromRecord(floor, letter, record) {
  let zArr = JSON.parse(record.z)
  var geom = {
    name: letter + record.idx,
    idx: record.idx,
    letter: letter,
    type: state.gg[letter].t,
    floor: Number(floor),
    polypoints: JSON.parse(record.points),
    z: {z0: zArr[0], z1: zArr[1]},
    minx: 0, miny: 0, maxx: 0, maxy: 0
  };
  ['exitWeight', 'roomExitsWeights', 'evacueesDensity', 
   'mventThroughput', 'flowDirection', 'airGrilleSurface',
   'teleportFrom', 'teleportTo'].forEach(function(field) {
    if (field in record) {
      geom[field] = record[field];
    }
  });
  
  updateBbox(geom);
  geom.lines = computeLines(geom);
  
  return geom;
}
function computeLines(geom) {
  let lines = [];
  if (geom.type === 'room') {
    geom.polypoints.forEach(function(point) { 
      lines.push(point); 
    });
  } else {
    lines = [-100000,-100000,-100000,-100000,-100000,-100000,-100000,-100000];
  }
  return lines;
}
function ajaxSaveCadJson(json_data) { //{{{
	if(!isGeometryCorrect()){
		return;
	}
	$.post('/aamks/ajax.php?ajaxApainterExport', { 'data': json_data }, function (json) { 
		amsg(json); 
		importCadJson();
	});
}
//}}}
function getSumDimZLower(f) { //{{{
	let z_sum = 0;
	_.each(state.floorsDimZ, function(floor_dimz,floor) { 
		if (floor < f)
			z_sum += floor_dimz;
	});
	return z_sum;
}
//}}}
function setFloorsZ(json) { //{{{
	_.each(json, function(floor_data,floor) { 
		if (floor_data['FLOOR_DIM_Z'] != undefined)
			state.floorsDimZ[floor] = floor_data['FLOOR_DIM_Z'];
		if (floor == 0)
			state.floorsZ0[floor] = 0;
		else
			state.floorsZ0[floor] = getSumDimZLower(floor);
	});
}
//}}}
function importCadJson() { //{{{
	$("#buildingLabels").html(""); 
	cgEscapeCreate(); 
	$.post('/aamks/ajax.php?ajaxApainterImport', { }, function (json) { 
		// We loop thru cgDb() here which updates the currentGeom
		// At the end the last elem in the loop would be the currentGeom
		// which may run into this-elem-doesnt-belong-to-this-floor problem.
		amsg(json); 
		svgGroupsInit(json.data);
		setFloorsZ(json.data);
		json2db(json.data);
		_.each(json.data, function(data,floor) { 
			importImgUnderlay(data['UNDERLAY_IMG'],floor); 
			importFloorUnderlay(data['UNDERLAY_FLOOR'],floor); 
		});
		d3.select('#floor_text').text("floor "+state.currentFloor+"/"+state.floorsCount);
	});
}
//}}}
function legend() { //{{{
	$('legend1').html('');
	for(var letter in state.gg) {
		if(state.gg[letter].legendary==1) { 
			var x=dbSelect({"letter": letter}, "name");
			$('legend1').append("<div class=legend letter="+letter+" id=legend_"+letter+" style='color: "+state.gg[letter].font+"; background-color: "+state.gg[letter].c+"' title='"+state.gg[letter].description+"'><letter>"+letter+"</letter>"+state.gg[letter].fourLetter+"</div>");
		}
	}
}
//}}}
function anyWindowOnInteriorWall(){
	let windows = getTypeApainterObjects("window")
	let wronglyPlaced = []
	windows.forEach(function(window) {
		if (!IsExternal(window)){
			wronglyPlaced.push(`Window: ${window.name}, floor: ${window.floor}`);
		}
	});
	return wronglyPlaced;
}
function anyHoleOnExternalWall(){
	let holes = getTypeApainterObjects("hole")
	let wronglyPlaced = []
	holes.forEach(function(hole) {
		if (IsExternal(hole)){
			wronglyPlaced.push(`Hole: ${hole.name}, floor: ${hole.floor}`);
		}
	});
	return wronglyPlaced;
}
function anyVentWronglyPlaced(){
	let vents = getTypeApainterObjects('vvent').concat(getTypeApainterObjects('mvent'));
	let wronglyPlaced = []
	vents.forEach(function(vent) {
		zones = getConnectedZones(vent);
		if (zones.every(z => z === null)){
			wronglyPlaced.push(`Vent: ${vent.name}, floor: ${vent.floor}`);
		}
	});
	return wronglyPlaced;
}
function wrongTeleportLocation(){
	const teleportsDown = dbWhere({"letter": LETTERS.TELEPORT_DOWN});
	const teleportsUp = dbWhere({"letter": LETTERS.TELEPORT_UP})
	const compartments = {};
	const obsts = {};

	for(let f=0; f<state.floorsCount; f++) { 
		const rooms  = getTypeApainterObjects('room', f);
		const vrooms = getTypeApainterObjects('vroom', f);
		const floorObsts = getTypeApainterObjects('obst', f);

		compartments[f] = [...rooms, ...vrooms];
		obsts[f] = floorObsts;
	}
    const badNames = [];
    // Helper to check a single teleport end
    function checkEnd(teleport, floorIdx, point) {
      if (floorIdx < 0 || floorIdx >= state.floorsCount) {
        // No such floor
        badNames.push(`Teleport: ${teleport.name}, floor: ${teleport.floor}`);
        return;
      }
      const comps = compartments[floorIdx] || [];
      const obs   = obsts[floorIdx] || [];
      if (checkIfPointIsInAnyMargin(point, comps, obs)) {
        badNames.push(`Teleport: ${teleport.name}, floor: ${teleport.floor}`);
      }
    }
    teleportsDown.forEach(tp => {
      checkEnd(tp, tp.floor, tp.teleportFrom);
      checkEnd(tp, tp.floor - 1, tp.teleportTo);
    });
    teleportsUp.forEach(tp => {
      checkEnd(tp, tp.floor, tp.teleportFrom);
      checkEnd(tp, tp.floor + 1, tp.teleportTo);
    });
    return badNames;
}

function checkIfPointIsInAnyMargin(point, compartments,obsts){
	// check obsts
	let xmin;
	let xmax;
	let ymin;
	let ymax;
	let innerXmin;
	let innerXmax;
	let innerYmin;
	let innerYmax;
	// check margins
	if (typeof obsts !== "undefined"){
		for (let i = 0; i < obsts.length; i++) {
			xmin = obsts[i].minx
			xmax = obsts[i].maxx
			ymin = obsts[i].miny
			ymax = obsts[i].maxy
			if ((point[0] >= (xmin - state.defaults.obstAndCompartmentMarginWidth)) && (point[0] <= (xmax + state.defaults.obstAndCompartmentMarginWidth))
				&& (point[1] >= (ymin - state.defaults.obstAndCompartmentMarginWidth)) && (point[1] <= (ymax + state.defaults.obstAndCompartmentMarginWidth)) )
				return true;
		}
	}
	for (let i = 0; i < compartments.length; i++) {
		xmin = compartments[i].minx
		xmax = compartments[i].maxx
		ymin = compartments[i].miny
		ymax = compartments[i].maxy
		innerXmin = xmin + state.defaults.obstAndCompartmentMarginWidth;
		innerXmax = xmax - state.defaults.obstAndCompartmentMarginWidth;
		innerYmin = ymin + state.defaults.obstAndCompartmentMarginWidth;
		innerYmax = ymax - state.defaults.obstAndCompartmentMarginWidth;
		if ((point[0] >= xmin && point[0] <= xmax
			&& point[1] >= ymin && point[1] <= ymax)
			&& !(point[0] >= innerXmin && point[0] <= innerXmax
			&& point[1] >= innerYmin && point[1] <= innerYmax))
			return true;
	}
	return false;
}
function isGeometryCorrect(){
	let msg = "";
	teleports = wrongTeleportLocation();
	if (teleports.length > 0){
		msg += `Wrong teleport location. The beginning and end of the teleport 
		should be outside the transparent-white internal margins of COMPARTMENT objects 
		and the outer margins of OBST objects (the beginning and end of the teleport 
		cannot be too close to the wall and obst). This applies to the beginning of 
		the teleport for the floor on which the teleport is located and the end of 
		the teleport in relation to the floor above if the teleport leads up and the 
		floors below if the teleport leads down. The problem concerns teleporters:<br>
		${teleports.join('<br>')}<br>`;
	}
	holes = anyHoleOnExternalWall()
	if(holes.length > 0){
		msg += `There is a hole in the outside wall. You can't do that. 
			The holes are used to connect compartments. In the external wall you can 
			draw normal door, windows, mechanical or normal vents. Wrongly placed holes:<br>
			${holes.join('<br>')}<br>`
	}
	windows = anyWindowOnInteriorWall();
	if(windows.length > 0){
		msg += `There is a window in the interior wall. You can't do that. 
			Windows can only be located on the external wall. Wrongly placed windows:<br>
			${windows.join('<br>')}<br>`
	}
	vents = anyVentWronglyPlaced()
	if(vents.length > 0){
		msg += `There is a vent which is not connected to any room. You can't do that. 
			Vents should be located in such a way that they are connected to at least one room. 
			After correcting the geometry, you will be able to save your changes
			Wrongly placed vents:<br>
			${vents.join('<br>')}<br>`
	}
	if (msg.length > 0){
		msg += "After correcting the geometry, you will be able to save your changes!"
		amsg({'err':2, 'msg':msg, 'duration': 8000}); 
		return false
	}
	return true;
}
function db2cadjson() {//{{{
	cgEscapeCreate();
	verifyIntersections();
	cadjson={};

	for(var floor=0; floor<state.floorsCount; floor++) { 
		cadjson[floor]={};
		for(var letter in state.gg) {
			if (state.gg[letter]['legendary'] == 0) { 
				continue; 
			}
			tt=state.gg[letter]['x'];
			cadjson[floor][tt]=[];
			_.each(dbWhere({"floor": floor, "letter": letter}), function(obj) {
				cad = generateObjectCadJson(obj);
				cadjson[floor][tt].push(cad);
			});
		}
		cadjson[floor]['UNDERLAY_IMG']=underlayImgSaveCad(floor);
		cadjson[floor]['UNDERLAY_FLOOR']=underlayFloorSaveCad(floor);
		cadjson[floor]['FLOOR_DIM_Z']=state.floorsDimZ[floor];
	}
	pretty=JSON.stringify(cadjson,null,2);
	ajaxSaveCadJson(pretty);
	return pretty;
}
//}}}
function floorCopy() {	//{{{
	c2f=Number($("#copy_to_floor").val()-1);
	state.floorsDimZ[c2f] = state.floorsDimZ[state.currentFloor];
	state.floorsZ0[c2f] = getSumDimZLower(c2f);
	state.floorsCount++;
	state.building.append("g").attr("id", "floor"+c2f).attr({"class": "floor", "opacity": 0, "visibility": "hidden"});
	_.each(dbWhere({'floor': state.currentFloor}), function(m) {
		if (m.letter == 'va' || m.letter == 'vs'||
			m.letter == 's' || m.letter=='a' || 
			m.letter=='y'){
			return;
		}
		state.activeLetter=m.letter;
  		const idx = cgIdUpdate(m.letter);
		currentGeom=deepcopy(m);
		currentGeom.idx=idx;
		currentGeom.exitWeight=state.defaults.exitWeight;
		currentGeom.roomExitsWeights={};
		currentGeom.airGrilleSurface = null;
		currentGeom.flowDirection = null;
		currentGeom.floor=c2f;
		currentGeom.name=currentGeom.letter + idx;
		currentGeom.z.z0=state.floorsZ0[c2f];
		currentGeom.z.z1=state.floorsZ0[c2f] + m.z.z1- m.z.z0;
		cgDb(undoRegister=0);
		drawGeom(currentGeom);

	});
	$("#floor"+c2f).attr({"class": "floor", "fill-opacity": 0.4, "visibility": "hidden"});
	currentGeom={};
	updateSnapLines();
	_.each(dbWhere({"letter": 's'}), function(m){
		createAndDrawVirtualObjs(m);
	});
	_.each(dbWhere({"letter": 'a'}), function(m){
		createAndDrawVirtualObjs(m);
	});
	changeFloor(c2f);
	showGeneralBox();
	amsg({'err':0, 'msg': "floor "+(state.currentFloor+1)+" copied onto floor "+(c2f+1)});
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
		// right click on obst or compartment margin:
		let elem = dbWhere({'name':v});
		if(elem.length == 0){
			virtualObjEscapeSelect = true;
			return;
		}
		currentGeom=deepcopy(elem[0]);
		if (currentGeom.letter == 'va' || currentGeom.letter == 'vs'){
			virtualObjEscapeSelect = true;
			return;
		}
		if(blink==1)     { $("#"+currentGeom.name).addClass('cg-selected').css( { 'stroke-width': '100px'}).animate( { 'stroke-width': 0}, 400, function() { $(this).removeAttr('style'); }); }
		if(showProps==1) { showCgPropsBox(); }
	});
	if (virtualObjEscapeSelect)
		return;
	m={'x': currentGeom.minx, 'y': currentGeom.miny};
	updatePosInfo(m);
	showBuildingLabels(1,[currentGeom.name]);
}
//}}}
function bulkPlainProps() {//{{{
	var tbody='';
	tbody+="<tr><td>name<td>z<td>density";
	_.each(dbWhere({'type': (type) =>
		['d', 'q', 'e', 'w', 'z'].includes(state.activeLetter) ? ['door', 'window', 'hole'].includes(type) : type === state.gg[state.activeLetter].t,
		'floor': state.currentFloor}), function (m) {
		tbody+="<tr><td class=bulkProps id="+ m.name + ">"+ m.name +"</td><td>"+m.z.z0+" - "+m.z.z1+"</td>"
	if(m.type == 'room') tbody+="<td>"+m.evacueesDensity;
	});
	return tbody;
}
//}}}
function bulkProps() {//{{{
	showBuildingLabels(1);
	var html='';
	html+='<div style="overflow-y: scroll; height: '+(state.win.height-100)+'px">';
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
	if(currentGeom.type=='room') {
		getFloorExits();
		pp='';
		adjecentDoorsAndHoles = state.roomsAndAdjDoorsAndHoles[currentGeom.name];
		if (adjecentDoorsAndHoles !== undefined) {
			if (adjecentDoorsAndHoles.length > 0){
				pp+= "<tr><td colspan=2 style='text-align: center'>set the weight of the exit doors from this room";
				pp+= "<tr><td colspan=2 style='text-align: center'>0 - minimum weight - no agent will go there";
				pp+= "<tr><td colspan=2 style='text-align: center'>10 - maximum weight";
				adjecentDoorsAndHoles.forEach(function(obj){
					if (obj.name.charAt(0)=="z")
						pp+= "<tr><td>exit hole " +obj.name+" weight:";
					else
						pp+= "<tr><td>exit door " +obj.name+" weight:";

					if ('roomExitsWeights' in currentGeom && currentGeom.roomExitsWeights !== undefined && currentGeom.roomExitsWeights[obj.idx] !== undefined)
						pp+= "<td><input type=number id=roomExitsWeights_"+currentGeom.name+ "_"+obj.name+" name=roomExitsWeights_"+
					currentGeom.name+ "_"+obj.name+" min=0 max=10 value="+currentGeom.roomExitsWeights[obj.idx]+">";
					else
						pp+= "<td><input type=number id=roomExitsWeights_"+currentGeom.name+ "_"+obj.name+" name=roomExitsWeights_"+
					currentGeom.name+ "_"+obj.name+" min=0 max=10 value=10>";

				});
			}
		}
		pp+="<tr><td>density <withHelp>?<help> Draws the given number of  evacuees per square metre. <br><orange>auto</orange> draws"+
		"the evacuees according to the building profile.<br><br>You can alter global densities in Project > Editor: text<br>"+
		"evacueesDensity:<br>{ ROOM: 0.33, COR: 0.05, STAI: 0.05, HALL: 0.05 }</help></withHelp>";
		pp+="<td><input type=text style='width: 40px' id=alter-evacuees-density value='"+currentGeom.evacueesDensity+"'>";
	}
	return pp;
}
//}}}
function mventProps() {//{{{
	var pp="";
	if(currentGeom.type=='mvent') {
		const [r1, r2] = getConnectedZones(currentGeom);
		let mventWithDuct = false;
		if (r1 == 'OUTSIDE' || r2 == 'OUTSIDE') {
			// mechanical vent with duct leading outside
			mventWithDuct = true;
		}
		if (r1==null || r2==null){
			pp += "<tr><td>coorect mvent size and localization because</td><td> it intersects not properly</td></tr>";
		} else {
			pp += "<tr><td colspan='2'>mvent "+currentGeom.name+" is connecting: "+r1+" and "+r2+"</td></tr>";
			pp += "<tr><td>flow direction: <td><select id=alter-flow-direction name=flowDirection >";
			
			const flow1 = `${r1} to ${r2}`;
			const flow2 = `${r2} to ${r1}`;
			
			pp += `<option value='${flow1}' ${currentGeom.flowDirection === flow1 ? "selected" : ""}>${flow1}</option>`;
			pp += `<option value='${flow2}' ${currentGeom.flowDirection === flow2 ? "selected" : ""}>${flow2}</option>`;
			pp += "</select>";
			if(mventWithDuct == true){
				pp += "<tr><td>air grille surface: <td><select id=alter-air-grille-surface name=air-grille >";
				
				const surfaces = ["x_min", "x_max", "y_min", "y_max", "z_min", "z_max"];
				for (const surface of surfaces) {
					pp += `<option value='${surface}' ${currentGeom.airGrilleSurface === surface ? "selected" : ""}>${surface}</option>`;
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
		pp += "<tr><td>flow [m3/s]: <td>  <input id=alter-mvent-throughput type=number size=3 min=0 max=100 step=0.1 value="+currentGeom.mventThroughput+">";
	} 
	return pp;
}

function vventProps() {//{{{
	var pp="";
	if(currentGeom.type=='vvent') {
		const [r1, r2] = getConnectedZones(currentGeom);
		if (r1==null || r2==null){
			pp += "<tr><td>coorect vvent size and localization because</td><td> it intersects not properly</td></tr>";
		}
		else
		{
			pp += "<tr><td colspan='2'>vvent "+currentGeom.name+" is connecting: "+r1+" and "+r2+"</td></tr>";
		}
	} 
	return pp;
}
//}}}
function doorProps() {//{{{
	var pp="";
	if(currentGeom.type=='door') {
		pp='';
		pp+= "<tr><td colspan=2 style='text-align: center'>set the general weight of the exit";
		pp+= "<tr><td colspan=2 style='text-align: center'>0 - minimum weight - no agent will go there";
		pp+= "<tr><td colspan=2 style='text-align: center'>10 - maximum weight";
		pp+= "<tr><td>exit door " +currentGeom.name+" weight:";
		if ('exitWeight' in currentGeom && currentGeom.exitWeight !== undefined)
			pp+= "<td><input type=number id=floor_exits_weights_"+currentGeom.name+ " name="+currentGeom.name+" min=0 max=10 value="+currentGeom.exitWeight+">";
		else
			pp+= "<td><input type=number id=floor_exits_weights_"+currentGeom.name+ " name="+currentGeom.name+" min=0 max=10 value=10>";
	}
	return pp;
}
//}}}
function teleportProps() {//{{{
	var pp="";
	if(currentGeom.type=='floor_teleport') {
		pp='';
		pp+= "<tr><td colspan=2 style='text-align: center'>set the general weight of the exit";
		pp+= "<tr><td colspan=2 style='text-align: center'>0 - minimum weight - no agent will go there";
		pp+= "<tr><td colspan=2 style='text-align: center'>10 - maximum weight";
		pp+= "<tr><td>teleport " +currentGeom.name+" weight:";
		if ('exitWeight' in currentGeom && currentGeom.exitWeight !== undefined)
			pp+= "<td><input type=number id=floor_exits_weights_"+currentGeom.name+ " name=floor_exits_weights_"+currentGeom.name+" min=0 max=10 value="+currentGeom.exitWeight+">";
		else
			pp+= "<td><input type=number id=floor_exits_weights_"+currentGeom.name+ " name=floor_exits_weights_"+currentGeom.name+" min=0 max=10 value=10>";
	}
	return pp;
}
//}}}
function rightBoxShow(html, close_button=1) {//{{{
	$('right-menu-box').html("");
	if(close_button==1) { $('right-menu-box').append("<close-right-menu-box><img id=close-img-svg src=/aamks/css/close.svg></close-right-menu-box><br>"); }
	$('right-menu-box').append(html);
	$('right-menu-box').fadeIn();
}
//}}}
function getExternalDoors(doors,roomTypesObjects){
	doors.forEach(door => {
		let is_first_side_door_point_inside = false;
		let is_second_side_door_point_inside = false;
		roomTypesObjects.forEach(room => {
			if (door.minx <= room.maxx && 
				door.minx >= room.minx &&
				door.miny <= room.maxy &&
				door.miny >= room.miny)
				is_first_side_door_point_inside = true;
			if (door.maxx <= room.maxx && 
				door.maxx >= room.minx &&
				door.maxy <= room.maxy &&
				door.maxy >= room.miny)
				is_second_side_door_point_inside = true;
		});
		if (is_first_side_door_point_inside == false ||
			is_second_side_door_point_inside == false)
				state.externalDoors.push(door);
	});
}
function getRoomsAndAdjecentDoorsAndHoles(doorsAndHoles,roomTypesObjects, holes){
	state.roomsAndAdjDoorsAndHoles = {};
	roomTypesObjects.forEach(room => {
		state.roomsAndAdjDoorsAndHoles[room.name] = [];
		doorsAndHoles.forEach(obj => {
			var IsAdjecantToRoom = false;
			if (obj.minx >= room.minx &&
				obj.maxx <= room.maxx &&
				(obj.miny < room.maxy && obj.miny > room.miny || 
				 obj.maxy > room.miny && obj.maxy < room.maxy))
				IsAdjecantToRoom = true;
			if (obj.miny >= room.miny &&
				obj.maxy <= room.maxy &&
				(obj.minx < room.maxx && obj.minx > room.minx ||
				 obj.maxx > room.minx && obj.maxx < room.maxx))
				IsAdjecantToRoom = true;

			if (IsAdjecantToRoom == true)
				state.roomsAndAdjDoorsAndHoles[room.name].push(obj);
		});
	});
	joinRoomsConnectedByHoles(roomTypesObjects,holes)
}

function joinRoomsConnectedByHoles(roomTypesObjects, holes){
	rooms_pairs_joined_by_holes = getJoinedRoomsPairs(roomTypesObjects, holes);
	getJoinedRoomsAndAdjecentDoors(rooms_pairs_joined_by_holes);
}

function getJoinedRoomsPairs(roomTypesObjects, holes){
	rooms_pairs_joined_by_holes = [];
	vhall_holes = [];
	holes.forEach(hole => {
		joined_rooms = [];
		roomTypesObjects.forEach(room => {
			if (hole.minx >= room.minx &&
				hole.maxx <= room.maxx &&
				(hole.miny < room.maxy && hole.miny > room.miny || 
				 hole.maxy > room.miny && hole.maxy < room.maxy))
				joined_rooms.push(room.name)
			else if (hole.miny >= room.miny &&
				hole.maxy <= room.maxy &&
				(hole.minx < room.maxx && hole.minx > room.minx ||
				 hole.maxx > room.minx && hole.maxx < room.maxx))
				joined_rooms.push(room.name)
		});
		if (joined_rooms.length == 2){
			rooms_pairs_joined_by_holes.push([joined_rooms[0],joined_rooms[1]]);
		}
		else
			vhall_holes.push(hole);
	});
	vhall_holes.forEach((hole, i) => {
		for (let key in state.roomsAndAdjDoorsAndHoles){
			state.roomsAndAdjDoorsAndHoles[key] = state.roomsAndAdjDoorsAndHoles[key].filter(innerArray => innerArray[1] !== hole.name);
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
			adjecentDoorsAndHolesConcated = adjecentDoorsAndHoles.concat(state.roomsAndAdjDoorsAndHoles[grouped_rooms[i][j]]);
			adjecentDoorsAndHoles = adjecentDoorsAndHolesConcated;
		}
		adjecentDoorsAndHoles = [...new Set(adjecentDoorsAndHoles)];
		for (let j = 0; j < grouped_rooms[i].length; j++) {
			state.roomsAndAdjDoorsAndHoles[grouped_rooms[i][j]] = adjecentDoorsAndHoles;
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
	const doors = getTypeApainterObjects('door', state.currentFloor);
	const holes = getTypeApainterObjects('hole', state.currentFloor);
	const doorsAndHoles = [...doors, ...holes];
	const roomTypesObjects = getTypeApainterObjects('room', state.currentFloor);
	const vstai = getTypeApainterObjects('vroom', state.currentFloor).filter(function(obj){ return obj.letter == 'vstai'});
	roomTypesObjects.push(...vstai);
	// getExternalDoors(doors,roomTypesObjects);
	getRoomsAndAdjecentDoorsAndHoles(doorsAndHoles, roomTypesObjects, holes);
}

function validateRightBoxXY(input){
	let value = parseInt(input.value);
	if (input.id == 'alter-x-min'){
		let alter_x_max = parseInt(document.getElementById("alter-x-max").value);
		if (value < 0) {
			input.value = 0;
		}
		else if (value >= alter_x_max) {
			input.value = alter_x_max-1;
		}
		document.getElementById("alter-width").innerHTML = alter_x_max-input.value;
	}
	else if (input.id == 'alter-x-max'){
		let alter_x_min = parseInt(document.getElementById("alter-x-min").value);
		if (value < 0) {
			input.value = 0;
		}
		else if (value <= alter_x_min) {
			input.value = alter_x_min+1;
		}
		document.getElementById("alter-width").innerHTML = input.value-alter_x_min;
	}
	else if (input.id == 'alter-y-min'){
		let alter_y_max = parseInt(document.getElementById("alter-y-max").value);
		if (value < 0) {
			input.value = 0;
		}
		else if (value >= alter_y_max) {
			input.value = alter_y_max-1;
		}
		document.getElementById("alter-length").innerHTML = alter_y_max-input.value;
	}
	else if (input.id == 'alter-y-max'){
		let alter_y_min = parseInt(document.getElementById("alter-y-min").value);
		if (value < 0) {
			input.value = 0;
		}
		else if (value <= alter_y_min) {
			input.value = alter_y_min+1;
		}
		document.getElementById("alter-length").innerHTML = input.value-alter_y_min;
	}
	saveRightBoxCgProps();
}

function validateRightBoxInput(input) {
    let value = parseInt(input.value);
    var limitedZObj = ['r', 'c', 'd', 'z', 'w', 'q', 'e', 't'];
    var stairAndHall = ['s', 'a'];
    var vents = ['m', 'b'];

    if (limitedZObj.includes(currentGeom.letter)){
    	if (input.id == 'alter-z1'){
	    	let alter_z0 = parseInt(document.getElementById("alter-z0").value);
	    	if (value > state.floorsZ0[currentGeom.floor] + state.floorsDimZ[currentGeom.floor]) {
    			input.value = state.floorsZ0[currentGeom.floor] + state.floorsDimZ[currentGeom.floor];
				document.getElementById("warning").innerHTML = "Cant' exceed the floor height!";
    		}
	    	else if (value <= alter_z0) {
    			input.value =  alter_z0+1;
    		}
    	}
		else if (input.id == 'alter-z0'){
	    	let alter_z1 = parseInt(document.getElementById("alter-z1").value);
    		if (value < state.floorsZ0[currentGeom.floor]) {
				input.value = state.floorsZ0[currentGeom.floor];
				document.getElementById("warning").innerHTML = "Height below floor height!";
			}
    		else if (value >= alter_z1) {
				input.value = alter_z1-1;
			}
		}
    }
    else if (stairAndHall.includes(currentGeom.letter)){
		if (input.id == 'alter-z0'){
			if (value < state.floorsZ0[currentGeom.floor]) {
				input.value = state.floorsZ0[currentGeom.floor];
			}
			else if (value > state.floorsZ0[currentGeom.floor] + state.floorsDimZ[currentGeom.floor]) {
				input.value = state.floorsZ0[currentGeom.floor];
			}
		}
    }
    else if (vents.includes(currentGeom.letter)){
    	if (input.id == 'alter-z1'){
	    	if (value > state.floorsZ0[currentGeom.floor] + state.floorsDimZ[currentGeom.floor] + 4) {
    			input.value = state.floorsZ0[currentGeom.floor] + state.floorsDimZ[currentGeom.floor] + 4;
    		}
	    	else if (value < state.floorsZ0[currentGeom.floor]) {
    			input.value =  state.floorsZ0[currentGeom.floor];
    		}
    	}
		else if (input.id == 'alter-z0'){
    		if (value < state.floorsZ0[currentGeom.floor] - 4) {
				input.value = state.floorsZ0[currentGeom.floor] - 4;
			}
    		else if (value > state.floorsZ0[currentGeom.floor] + state.floorsDimZ[currentGeom.floor]) {
				input.value = state.floorsZ0[currentGeom.floor] + state.floorsDimZ[currentGeom.floor];
			}
		}
    }

    else if (input.id == 'default_door_dimz'){
    	if (value > state.floorsDimZ[currentGeom.floor]) {
    		input.value = state.floorsDimZ[currentGeom.floor];
    	}
    }
    else if (input.id =='default_window_dimz'){
    	let window_offsetz = parseInt(document.getElementById("default_window_offsetz").value);
    	if (value+window_offsetz > state.floorsDimZ[currentGeom.floor]) {
    		input.value = state.floorsDimZ[currentGeom.floor] - window_offsetz;
    	}
    }

    else if (input.id =='default_window_offsetz'){
    	let window_dimz= parseInt(document.getElementById("default_window_dimz").value);
    	if (value+window_dimz > state.floorsDimZ[currentGeom.floor]) {
    		input.value = state.floorsDimZ[currentGeom.floor] - window_dimz;
    	}
    }
	if (input.id == 'alter-z0'){
    	let alter_z1 = parseInt(document.getElementById("alter-z1").value);
		document.getElementById("alter-height").innerHTML = alter_z1-input.value;
	}
	if (input.id == 'alter-z1'){
    	let alter_z0 = parseInt(document.getElementById("alter-z0").value);
		document.getElementById("alter-height").innerHTML = input.value-alter_z0;
	}
	saveRightBoxCgProps();
}

function showGeneralBox() { //{{{
	html = "<table class=nobreak>"+
		"<input id=general_setup type=hidden value=1>"+
		"<tr><td colspan=2 style='text-align: center'>Since now"+
		"<tr><td>floor<td><select id=floor name=floor style='width: 6ch;'>";
	for (let i = 0; i < state.floorsCount; i++) {
		if (i === state.currentFloor) {
			html += `<option value="${i}" selected>${i + 1}</option>`;
		} else {
			html += `<option value="${i}">${i + 1}</option>`;
		}
	}
	html+=	"</select>"+
		"<tr><td>floor z-origin <td><input id=floorZ0 type=number name=floorZ0 value="+state.floorsZ0[state.currentFloor]+" disabled style='background-color: darkgrey; color: #333; width: 6ch;'>"+
		"<tr><td>floor height <td><input id=default_floor_dimz type=number name=default_floor_dimz value="+state.floorsDimZ[state.currentFloor]+" style='width: 7ch;'+>"+
		"<tr><td><td><tr><td><td><tr><td><td><tr><td><td><tr><td><td><tr><td><td>"+
		"<tr><td>door's width <td><input id=default_door_width type=number name=default_door_width value="+state.defaults.doorWidth+" style='width: 6ch;'>"+
		"<tr><td>door's height <td><input id=default_door_dimz type=number name=default_door_dimz oninput='validateRightBoxInput(this)' value="+state.defaults.doorDimZ+" style='width: 6ch;'>"+
		"<tr><td>window's height <td><input id=default_window_dimz type=number name=default_window_dimz oninput='validateRightBoxInput(this)' value="+state.defaults.windowDimZ+" style='width: 6ch;'>"+
		"<tr><td>window's z-offset <td><input id=default_window_offsetz type=number name=default_window_offsetz oninput='validateRightBoxInput(this)' value="+state.defaults.windowOffsetZ+" style='width: 6ch;'>"+
		"</table><br>"+
		"<table class=nobreak>"+
		"<withHelp>?<help>door's height cannot be higher than floor height<br><hr> window's height+z-offset cannot be higher than floor height</help></withHelp>"+
		"<tr><td colspan=2 style='text-align: center'>utils"+
		"<tr><td colspan=2><button id=btn_add_floor class=blink>Add floor</button>"+ 
		"<tr><td colspan=2><button id=btn_copy_to_floor class=blink>copy</button> floor "+(state.currentFloor+1)+" to floor <input id=copy_to_floor type=text value="+(state.floorsCount+1)+" disabled style='background-color: darkgrey; color: #333; width: 3ch;'>";
		if (state.floorsCount == state.currentFloor +1)
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
		"<tr><td><letter>rightMouse</letter><td> click element properties"+
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
	if(currentGeom.type=='evacuee') { 
		return "<br>X <input id=alter-px value="+currentGeom.polypoints[0][0]+ sty+"><br>"+
		"Y <input id=alter-py value="+currentGeom.polypoints[0][1]+ sty+"><br>";
	} else{
		var html = "<div>points:<div>"+
		"<label>x-min<input id=alter-x-min type=number onchange='validateRightBoxXY(this)' style='width: 8ch;' value='"+currentGeom.minx+"'></label>"+
		"<label>x-max<input id=alter-x-max type=number onchange='validateRightBoxXY(this)' style='width: 8ch;' value='"+currentGeom.maxx+"'></label></div>"+
		"<div>Width: <span id=alter-width>"+(currentGeom.maxx-currentGeom.minx)+"</span></div>"+
		"<div><label>y-min<input id=alter-y-min type=number onchange='validateRightBoxXY(this)' style='width: 8ch;' value='"+currentGeom.miny+"'></label>"+
		"<label>y-max<input id=alter-y-max type=number onchange='validateRightBoxXY(this)' style='width: 8ch;' value='"+currentGeom.maxy+"'></label></div>"+
		"<div>Length: <span id=alter-length>"+(currentGeom.maxy-currentGeom.miny)+"</span></div>"+
		"</div>";
		if (currentGeom.letter == LETTERS.TELEPORT_UP || currentGeom.letter == LETTERS.TELEPORT_DOWN || currentGeom.letter == "p")
			return html;
		else{
			html += "<div><label>z-min:<input id=alter-z0 type=number onchange='validateRightBoxInput(this)' style='width: 8ch;' value='"+currentGeom.z.z0+"'></label>"+
			"<label>z-max:<input id=alter-z1 type=number onchange='validateRightBoxInput(this)' style='width: 8ch;' value='"+currentGeom.z.z1+"'></label></div>"+
			"<div>Height: <span id=alter-height>"+(currentGeom.z.z1-currentGeom.z.z0)+"</span></div>";
		}
		return html;
	}
}
//}}}
function showCgPropsBox() {//{{{
	if(currentGeom.letter==undefined)					 { return; }   // mouse leaving right boxes
	if(dbGet({'name':currentGeom.name})==undefined) { return; }   // clicking right boxes while new element is very infant
	if($("#uimg_remove").length)				 { return; }   // return if underlay menu
	showBuildingLabels(1);
	state.activeLetter=currentGeom.letter;
	rightBoxShow(
	    "<input id=geom_properties type=hidden value=1>"+
	    "<center><red>&nbsp; "+currentGeom.name+" &nbsp; "+state.gg[currentGeom.letter]['x']+"</red>"+
		propsXYZ()+
		"<div id='warning' style='width:200px; background: #600; color: #fff;'></div>"+
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
	state.defaults.doorDimZ=Number($("#default_door_dimz").val());
	state.defaults.doorWidth=Number($("#default_door_width").val());
	state.floorsDimZ[state.currentFloor]=Number($("#default_floor_dimz").val());
	state.defaults.windowDimZ=Number($("#default_window_dimz").val());
	state.defaults.windowOffsetZ=Number($("#default_window_offsetz").val());
	// the if line below should be after state.floorsDimZ[floor]=Number($("#default_floor_dimz").val());
	// so that it assigns the correct value to the state.floorsDimZ[floor] variable before changing floor
	if (state.currentFloor != $("#floor").val()) { changeFloor(Number($("#floor").val())); }
	legend();
}
//}}}
function validateForm() {//{{{
	if(!currentGeom.evacueesDensity.match(/^auto$|^\d*\.?\d*$/)) { amsg({'err':1, 'msg': "Examples of valid density values:<br>auto<br>0.12"}); }
	if($.isNumeric($("#alter-evacuees-density").val())) { currentGeom.evacueesDensity=Number($("#alter-evacuees-density").val()); } 
}
//}}}
function setIfNotEmpty(selector, prop, asFloat = false) {
  const rawValue = $.trim($(selector).val());
  if (rawValue === "") return;
  const value = asFloat ? parseFloat(rawValue) : rawValue;
  if (!asFloat || !Number.isNaN(value)) currentGeom[prop] = value;
}

function saveRightBoxCgProps() {//{{{
	if(currentGeom.type=='evacuee') {
		currentGeom.polypoints=[[Number($("#alter-px").val()), Number($("#alter-py").val())]];
		currentGeom.z.z0=50
		currentGeom.z.z1=50
		$("#"+currentGeom.name).attr('cx', currentGeom.polypoints[0][0]).attr('cy', currentGeom.polypoints[0][1]);   
		cgUpdateSvg();
		cgUpdate();
	} else {
		let z_has_changed = false;
		currentGeom.polypoints=[];
		const x_min = Number($("#alter-x-min").val());
		const x_max = Number($("#alter-x-max").val());
		const y_min = Number($("#alter-y-min").val());
		const y_max = Number($("#alter-y-max").val());
		currentGeom.polypoints.push([x_min, y_min]);
		currentGeom.polypoints.push([x_max, y_min]);
		currentGeom.polypoints.push([x_max, y_max]);
		currentGeom.polypoints.push([x_min, y_max]);
		setIfNotEmpty("#alter-evacuees-density", "evacueesDensity");
		setIfNotEmpty("#floor_exits_weights_" + currentGeom.name, "exitWeight");
		setIfNotEmpty("#alter-flow-direction", "flowDirection");
		setIfNotEmpty("#alter-air-grille-surface", "airGrilleSurface");
		setIfNotEmpty("#alter-mvent-throughput", "mventThroughput", asFloat=true);
		if (currentGeom.type == 'room'){
			currentGeom.roomExitsWeights = getRoomExitWeight(currentGeom.name);
		}
		validateForm();
		var z0=Number($("#alter-z0").val());
		var z1=Number($("#alter-z1").val());
		if (!isNaN(z0) && !isNaN(z1)){
			if (currentGeom.z.z0 != z0 || currentGeom.z.z1 != z1)
			{
				z_has_changed = true;
				if (z1 < z0)
					z1=z0;
				currentGeom.z.z0=z0
				currentGeom.z.z1=z1
			}
		}
		if(currentGeom.floor != state.currentFloor) { return; } // Just to be sure, there were (hopefully fixed) issues
		cgUpdateSvg();
		cgUpdate();
		updateSnapLines();
		// property of hall or stair object was changed so we have to check if 
		// we need to create virtual hall/stair additionaly
		if(currentGeom.letter == 's' || currentGeom.letter=='a')
			if (z_has_changed){
				createAndDrawVirtualObjs(currentGeom);
			}
	}
} 
function getRoomExitWeight(roomName) {//{{{
	let adjecentDoorsAndHolesWeights={};
	adjecentDoorsAndHoles = state.roomsAndAdjDoorsAndHoles[roomName];
	adjecentDoorsAndHoles.forEach(function(obj){
		adjecentDoorsAndHolesWeights[obj.idx] = $("#roomExitsWeights_"+roomName+"_"+obj.name).val();
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
	if(['room', 'obst', 'mvent', 'fire', 'vvent'].includes(currentGeom.type)) { 
		_.each(currentGeom.polypoints, function(p) { 
			mm.append("text").attr("class","building-vertex").attr("x",p[0]+5).attr("y",p[1]-15).text(p[0]+", "+p[1]);
		});
	}
	if(['evacuee', 'door', 'hole'].includes(currentGeom.type)) { 
        if (currentGeom.polypoints.length>0) { 
            p=currentGeom.polypoints[0];
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
				_.each(dbWhere({'name': vv}), function(v) { 
					if (['d', 'q', 'e'].includes(state.activeLetter)) { x=v.minx; y=v.miny-30 } else { x=v.minx+15; y=v.miny+50; }
					mm.append("text").attr("class","building-label").attr("x",x).attr("y",y).text(v.name);
				});
			});
		} else {
			_.each(dbWhere({'floor': state.currentFloor, 'letter': state.activeLetter}), function(v) { 
				if (['d', 'q', 'e'].includes(state.activeLetter)) { x=v.minx; y=v.miny-30 } else { x=v.minx+15; y=v.miny+50; }
				mm.append("text").attr("class","building-label").attr("x",x).attr("y",y).text(v.name);
			});
		}
	}
}
//}}}
function verifyIntersections() {//{{{
	var pp=PolygonTools.polygon;
	for(var f=0; f<state.floorsCount; f++) {
		_.each(dbWhere({'floor': f, 'type': 'room'}), function(p1) { 
			_.each(dbWhere({'floor': f, 'type': 'room'}), function(p2) { 
				if(p1.name!=p2.name && pp.intersection(p1.polypoints,p2.polypoints).length>0) { 
					cgSelect([p1.name, p2.name]);
					state.activeLetter=p1.letter;
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
	d3.select('view2d').append("div").attr("id", "apainter-texts-floor").html("floor "+(state.currentFloor + 1)+"/"+state.floorsCount);
	d3.select('view2d').append("div").attr("id", "apainter-texts-keys").html("<letter>n</letter> next floor");
	d3.select('view2d').append("div").attr("id", "apainter-texts-pos");
	make_legend0("apainter");
	make_legend2("apainter");
	state.svg = d3.select('view2d').append('svg').attr("id", "apainter-svg").attr("width", state.win.width).attr("height", state.win.height);
	state.svg.append("filter").attr("id", "invertColorsFilter").append("feColorMatrix").attr("values", "-1 0 0 0 1 0 -1 0 0 1 0 0 -1 0 1 0 0 0 1 0");
	axes();
	state.building = state.svg.append("g").attr("id", "building");
	state.buildingLabels=state.svg.append("g").attr("id", "buildingLabels");
	state.building.append("g").attr("id", "floor0").attr("class", "floor").attr('fill-opacity',0.4);
	state.snapLinesSvg = state.svg.append("g").attr("id", "snapLinesSvg");
	state.svg.append('circle').attr('id', 'snapper').attr('cx', 100).attr('cy', 100).attr('r',30).attr('fill-opacity', 0).attr('fill', "#ff8800");
	legend();
	d3.select('view2d').append('right-menu-box');
	zoomInit();
}
//}}}