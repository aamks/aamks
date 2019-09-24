// globals//{{{
var win=[screen.width-30,screen.height-190];
var db=TAFFY(); // http://taffydb.com/working_with_data.html
var zt={'x':0, 'y':0, 'k':1}; // zoom transform
var cg={}; // current geom, the one that is currently selected, created, removed, etc.
var cgID;
var gg;
var ggx;
var zoom;
var fire_model='CFAST';
var currentView='2d';
var activeLetter='r';
var svg;
var floor=0;
var floorsCount=0;
var floorZ0=0;
var building;
var buildingLabels;
var ax={};
var snapLinesSvg;
var snapLinesArr={};
var defaults={'door_dimz': 200, 'door_width': 90, 'floor_dimz': 350, 'window_dimz': 150, 'window_offsetz': 100 };
var activeSnap={};
var undoBuffer=[];
var evacueeRadius;
//}}}
function debug() {//{{{
	console.clear();
	//ddd();
	//return;
	//dd($('#building')[0]);
	dd($('#floor0')[0]);
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
		registerListeners();
		registerListenersUnderlay();
		$('right-menu-box').fadeOut();
		//dd($('#building')[0]);
	});
});
//}}}
function registerListeners() {//{{{
	$("right-menu-box").on("click"     , "#btn_copy_to_floor"      , function() { floorCopy() });
	$("right-menu-box").on("click"     , '#setup_underlay'         , function() { underlay_form(); });
	$("right-menu-box").on("mouseover" , ".bulkProps"              , function() { cgSelect($(this).attr('id')                                                                    , 1 , 0); });
	$("right-menu-box").on("click"     , '.bulkProps'              , function() { cgSelect($(this).attr('id'));  });
	$("body").on("click"               , '#apainter-save'          , function() { if($("#cad-json-textarea").val()===undefined) { db2cadjson(); } else { saveTxtCadJson(); } });
	$("body").on("click"               , '#apainter-next-view'     , function() { nextView(); });
	$("body").on("click"               , '#button-help'            , function() { showHelpBox(); });
	$("body").on("click"               , '#button-setup'           , function() { showGeneralBox(); });
	$("body").on("click"               , '.legend'                 , function() { activeLetter=$(this).attr('letter'); cgStartDrawing(); });
	$("body").on("change"              , '#alter-room-enter'       , function() { saveRightBox(); });
	$("body").on("change"              , '#alter-exit-type'        , function() { saveRightBox(); });
	$("body").on("change"              , '#alter-mvent-throughput' , function() { saveRightBox(); });
	$("body").on("keyup"               , '#alter-polypoints'       , function() { saveRightBox(); });
	$("body").on("keyup"               , '#alter-px'               , function() { saveRightBox(); });
	$("body").on("keyup"               , '#alter-py'               , function() { saveRightBox(); });
	$("body").on("mouseleave"          , 'right-menu-box'          , function() { saveRightBox(); showCgPropsBox(); });

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
function keyboardEvents() {//{{{

	$(this).keypress((e) => { if (e.key in gg && ! e.ctrlKey)    { cgEscapeCreate(); activeLetter=e.key; cgStartDrawing(); } });
	$(this).keydown((e) =>  { if (e.key == 'Escape')             { escapeAll(); } });
	$(this).keydown((e) =>  { if (e.key == 'h')                  { cgEscapeCreate(); nextView(); } });
	$(this).keydown((e) =>  { if (e.key == 'p')                  { $("#p1").remove() ; } });
	$(this).keydown((e) =>  { if (e.key == 'n')                  { cgEscapeCreate(); changeFloor(calcNextFloor()); } });
	$(this).keydown((e) =>  { if (e.key == '=')                  { cgEscapeCreate(); resetView(); } });
	$(this).keydown((e) =>  { if (e.key == 'r' && e.ctrlKey)     { alert('Refreshing will clear unsaved Aamks data. Continue?') ; } }) ;
	$(this).keydown((e) =>  { if (e.key == 's' && e.ctrlKey)     { cgEscapeCreate(); e.preventDefault(); db2cadjson(); importCadJson(); } }) ;
	$(this).keyup((e) =>    { if (e.key == 'z' && e.ctrlKey)     { undoPop(); } }) ;
	$(this).keyup((e) =>    { if (e.key == 'F1' && e.ctrlKey)    { startTxtView(); } }) ;
	$(this).keypress((e) => { if (e.key == 'x' && ! isEmpty(cg)) { cgEscapeCreate(); cgRemove(); }});
	
	$(this).keypress((e) => { if (e.key == 'l')                  { cgEscapeCreate(); bulkProps(); } });
	// debug
	$(this).keypress((e) => { if (e.key == ']') { debug(); }});
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
		.attr('points', svgPolyline())
		.attr('cx', cg.polypoints[0][0])
		.attr('cy', cg.polypoints[0][1])
		.attr('r', evacueeRadius)
}
//}}}
function cgCss() {//{{{
	$("#"+cg.name).removeClass('room_enter_no').removeClass('exit_type_primary').removeClass('exit_type_secondary');
	if(cg.room_enter=='no')       { $("#"+cg.name).addClass('room_enter_no'); }
	if(cg.exit_type=='primary')   { $("#"+cg.name).addClass('exit_type_primary'); }
	if(cg.exit_type=='secondary') { $("#"+cg.name).addClass('exit_type_secondary');}
}
//}}}
function cgDb() { //{{{
	if(cg.type=='underlay_scaler') { return; }
	var lines=[];

	if(cg.type=='room') {
		_.each(cg.polypoints, function(point) { 
			lines.push(point);
		});
	} else {
		lines.push([-100000, -100000], [-100000, -100000], [-100000, -100000], [-100000, -100000]);
	}
	undoPush(deepcopy(cg));
	db({"name": cg.name}).remove();
	b=getBbox();
	db.insert({"name": cg.name, "idx": cg.idx, "cad_json": cg.cad_json, "letter": cg.letter, "type": cg.type, "lines": lines, "polypoints": cg.polypoints, "z": cg.z, "floor": cg.floor, "mvent_throughput": cg.mvent_throughput, "exit_type": cg.exit_type, "room_enter": cg.room_enter, "minx": b.min.x, "miny": b.min.y, "maxx": b.max.x, "maxy": b.max.y });
}
//}}}
function undoPop() {//{{{
	if (undoBuffer.length==0) { return; }
	cg=undoBuffer.pop();
	if(cg.op=='insert') { 
		cgRemove();
	} else {
		$("#"+cg.name).remove(); cgDb(); cgSvg(); cgCss(); updateSnapLines();
	}
	undoBuffer.pop();
	escapeAll();
}
//}}}
function undoPush(mm) {//{{{
	data=db({"name": mm.name}).get()[0]; // modify or remove
	if(data==undefined) { // insert
		data=mm;
		data.op='insert';
	} else {
		data.op='modify';
	}
	undoBuffer.push(data);
}
//}}}
function cgIdUpdate() {//{{{
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
	if (floor == floorsCount - 1) {
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
}
//}}}
function closeTxtView() {//{{{
	$("#div-cad-json-textarea").remove();
}
//}}}
function start2dView() {//{{{
	if(fire_model=='FDS') { return; }
	currentView='2d'; 
	close3dView();
	$("view2d").css("display", "block");
	$("#apainter-svg").css("display", "block");
}
//}}}
function start3dView() {//{{{
	if(fire_model=='FDS') { return; }
	currentView='3d'; 
	close2dView();
	view3d();
	$('#canvas3d').attr('width', win[0]).attr('height', win[1]);
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
	if(fire_model=='FDS') { return; }
	closeTxtView();

	if(currentView=='2d')       { start3dView(); }
	else if(currentView=='3d')  { start2dView(); }
	else if(currentView=='txt') { start2dView(); }
}
//}}}
function cgRemove() {//{{{
	undoBuffer.push(cg);
	$("#"+cg.name).remove();
	db({"name":cg.name}).remove();
	updateSnapLines();
	if($("#gg_listing").length==0) { 
		$("right-menu-box").css("display", "none"); 
	} else {
		bulkProps(); 
	}
	showBuildingLabels();
}
//}}}

function updateSnapLines() { //{{{
	var lines=db({'floor': floor}).select("lines");
	d3.select("#snapLinesSvg").selectAll("line").remove();
	snapLinesArr['horiz']=[];
	snapLinesArr['vert']=[];
	var below, above, right, left;

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
	snapLinesArr['horiz']=Array.from(new Set(snapLinesArr['horiz']));
	snapLinesArr['vert']=Array.from(new Set(snapLinesArr['vert']));
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
//}}}
function guessFloorZ0() {//{{{
    // This is just a guess, user may overwrite via a form
	// Guess 1: Perhaps user has set the z-origin for this floor -- we will then find it in db()
	// Guess 2: If we are the first time on floor 5, then multiply floor0's dimz * 5
	// Guess 3: If there's no floor0 even or any other occassion z-origin=0
	var guess=db({"floor": floor, 'letter': 'r'}).select("z0");
	if(guess[0] != undefined) {
		$("#floorZ0").val(guess[0]);
		floorZ0=guess[0];
		return;
	}

	var guess=db({"floor": 0, 'letter': 'r'}).select("z1") - db({"floor": 0, 'letter': 'r'}).select("z0");
	if(guess[0] != undefined) {
		$("#floorZ0").val(guess[0]*floor);
		floorZ0=guess[0]*floor;
		return;
	}

	$("#floorZ0").val(0);
}
//}}}
function changeFloor(requested_floor) {//{{{
	undoBuffer=[];
	escapeAll();
	$("#p1").remove();
	floor=requested_floor;
	guessFloorZ0();
	if(floor > floorsCount-1) { 
		floorsCount++;
		building.append("g").attr("id", "floor"+floor).attr("class", "floor").attr('fill-opacity',0.4);
	}

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
	delete cg.growing;
	cgIdUpdate();
	cg.name=activeLetter+cgID;
	cg.idx=cgID;
	cg.infant=1;
	cg.floor=floor;
	cg.letter=activeLetter;
	cg.type=gg[activeLetter].t;
	cg.mvent_throughput=0;
	cg.z=[floorZ0];
	cg.polypoints=[];
	cg.preferredSnap=null;
	if(cg.type=='hole') { cg.snapForce=100; } else { cg.snapForce=50; }
	if (cg.type=='fire') {
		cg.z.push(cg.z[0] + 50);
	} else if (cg.type=='evacuee') {
		cg.z.push(cg.z[0] + 50);
	} else if (cg.type=='obst') {
		cg.z.push(cg.z[0] + 100);
	} else if (cg.type=='mvent') {
		cg.z.push(cg.z[0] + 50);
	} else if (cg.type=='vvent') {
		cg.z=[floorZ0 + defaults.floor_dimz - 4];
		cg.z.push(cg.z[0] + 8);
	} else if (cg.type=='window') {
		cg.z=[floorZ0 + defaults.window_offsetz]; 
		cg.z.push(cg.z[0] + defaults.window_dimz);
	} else if (cg.type=='door') {
		cg.z.push(cg.z[0] + defaults.door_dimz); 
		cg.exit_type='auto';
	} else if (cg.type=='room') {
		cg.z.push(cg.z[0] + defaults.floor_dimz);
		cg.room_enter='yes';
	} else {
		cg.z.push(cg.z[0] + defaults.floor_dimz);
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
		if(assertCgReady()) {
			cgUpdateSvg();
			cgDb();
			updateSnapLines();
		}
		snappingHide();
		cgInit();
		showBuildingLabels();
	});
}
//}}}

function updatePosInfo(m) {//{{{
	if('minx' in cg) { 
		$("#apainter-texts-pos").html(m.x+" "+m.y+" "+cg.z[0]+" &nbsp; &nbsp;  size: "+Math.abs(cg.maxx-m.x)+" "+Math.abs(cg.maxy-m.y) +" "+(cg.z[1]-cg.z[0]));
	} else {
		$("#apainter-texts-pos").html(m.x+" "+m.y+" "+cg.z[0]);
	}
}
//}}}
function cgDecidePoints(m) {//{{{

	if (event.ctrlKey) { return; }
	if("x" in activeSnap) { px=activeSnap.x; } else { px=m.x; }
	if("y" in activeSnap) { py=activeSnap.y; } else { py=m.y; }
	if("growing" in cg) { cg.polypoints.push([px,py]); }
	if(cg.polypoints.length==0) { return; }

	switch (cg.type) {
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
	if(cg.type=='evacuee') { cg.polypoints=[cg.polypoints[0]]; return true; }
	if(cg.polypoints.length<2) { $("#"+cg.name).remove(); return false; }
	if(cg.polypoints[0][0]==cg.polypoints[1][0] && cg.polypoints[0][1]==cg.polypoints[1][1]) { $("#"+cg.name).remove(); return false; }

	if(cg.type=='underlay_scaler') { 
		b=getBbox();
		underlayForm(b.maxx-b.minx);
		return false;
	}

	return true;
}
//}}}
function svgPolyline() {//{{{
	points=deepcopy(cg.polypoints);
	points.push(points[0]);
	points.push(points[1]);
	return points.join(" ");
}
//}}}
function cgUpdateSvg() {  //{{{
	$("#"+cg.name).attr({ 'points': svgPolyline() });   
}
//}}}

function cgStartDrawing() {//{{{
	$('right-menu-box').fadeOut(0); 
	legend();
	$('#legend_'+activeLetter).css({'color': '#f00', 'background-color': '#000', 'border-bottom': "1px solid #0f0"});
	if(activeLetter=='m') { 
		cgPolyCreate();
	} else {
		cgCreate();
	}
}
//}}}
function cgEscapeCreate() {//{{{
	if(!isEmpty(cg) && "growing" in cg) { cgRemove(); } 
	$(".temp-poly").remove();
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
		cad_json={};
		cad_json['points']=JSON.stringify(i.polypoints);
		cad_json['idx']=i.idx;
		cad_json['z']=JSON.stringify(i.z);

		if(i.type=='door') {
			cad_json["exit_type"]=i.exit_type;
		} else if(i.type=='room') {
			cad_json["room_enter"]=i.room_enter; 
		} else if(i.type=='mvent') {
			cad_json["mvent_throughput"]=i.mvent_throughput;
		}

		db({'name': i.name}).update({'cad_json': cad_json});
	}
}
//}}}
function saveTxtCadJson() {//{{{
	var json_data=$("#cad-json-textarea").val();
	ajaxSaveCadJson(json_data, fire_model); 
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
	var elems=["ROOM","COR","STAI","HALL","OBST","VVENT","MVENT","HOLE","WIN","DOOR","DCLOSER","DELECTR","EVACUEE","FIRE","UNDERLAY_SCALER"];

	_.each(json, function(floor_data,floor) { 
		_.each(elems, function(elem) { 
			_.each(floor_data[elem], function(record) { 
				letter=ggx[elem];
				cgMake(Number(floor),letter,record);
				cgDb();
				cgSvg();
				cgCss();
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

	if('exit_type' in record)        { cg.exit_type=record.exit_type; }
	if('room_enter' in record)       { cg.room_enter=record.room_enter; }
	if('mvent_throughput' in record) { cg.mvent_throughput=record.mvent_throughput; }
}
//}}}
function ajaxSaveCadJson(json_data, fire_model) { //{{{
	$.post('/aamks/ajax.php?ajaxApainterExport', { 'data': json_data, 'fire_model': fire_model }, function (json) { 
		ajax_msg(json); 
		importCadJson();
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
		ajax_msg(json); 
		if(json.err=='FDS') {
			fire_model='FDS';
			startTxtView(json.data);
		} else {
			fire_model='CFAST';
			svgGroupsInit(json.data);
			json2db(json.data);
			_.each(json.data, function(data,floor) { 
				importImgUnderlay(data['UNDERLAY_IMG'],floor); 
				importFloorUnderlay(data['UNDERLAY_FLOOR'],floor); 
			});
			cg={};
			d3.select('#floor_text').text("floor "+floor+"/"+floorsCount);
		}
	});
}
//}}}
function legend() { //{{{
	$('legend1').html('');

	for(var letter in gg) {
		if(gg[letter].legendary==1) { 
			var x=db({"letter": letter}).select("name");
			$('legend1').append("<div class=legend letter="+letter+" id=legend_"+letter+" style='color: "+gg[letter].font+"; background-color: "+gg[letter].c+"'>"+letter+" "+gg[letter].x+"</div>");
		}
	}

}
//}}}
function dbReorder() {//{{{
	// Re-enumerate all elems in this fashion: r1, r2, r3, ..., d1, d2, d3, ...
	// CFAST expects elems to be numbered as above
	// Evacuees will be in original order for navmesh testing pairing: e1 > e2, e3 > e4, ...
	if(db({"type": 'fire'}).get().length > 1) { ajax_msg({ 'err': 1, 'msg': "Aamks allows for max one fire" }); }

	db.sort("idx");
	var ee=db({"type": 'evacuee'}).get();
	db({"type": 'evacuee'}).remove();

	var types=[ ['room'], ['door', 'hole', 'window'], ['vvent'], ['mvent'], ['obst']];
	db.sort("floor,minx,miny");
	for (var i in types) {
		var idx=1;
		var r=db({"type": types[i]}).get();
		db({"type": types[i]}).remove();
		for (var ii in r) {
			r[ii]['idx']=idx;
			r[ii]['name']=r[ii]['letter']+idx;
			db.insert(r[ii]);
			idx++;
		}
	}
	for (var i in ee) {
		ee[i]['idx']=idx;
		ee[i]['name']="e"+idx;
		db.insert(ee[i]);
		idx++;
	}
	dbUpdateCadJsonStr();
}
//}}}
function db2cadjson() {//{{{
	cgEscapeCreate();
	verifyIntersections();
	dbReorder();
	cadjson={};

	for(var floor=0; floor<floorsCount; floor++) { 
		var geoms=[];
		cadjson[floor]={};
		for(var letter in gg) {
			if (gg[letter]['legendary'] == 0) { continue; }
			tt=gg[letter]['x'];
			cadjson[floor][tt]=[];
			_.each(db({"floor": floor, "letter": letter}).select("cad_json"), function(m) {
				cadjson[floor][tt].push(m);
			});
		}

		cadjson[floor]['UNDERLAY_IMG']=underlayImgSaveCad(floor);
		cadjson[floor]['UNDERLAY_FLOOR']=underlayFloorSaveCad(floor);
	}
	pretty=JSON.stringify(cadjson,null,2);
	ajaxSaveCadJson(pretty, fire_model);
	return pretty;
}
//}}}
function floorCopy() {	//{{{
	c2f=Number($("#copy_to_floor").val());
	var guess=db({"floor": floor, 'letter': 'r'}).select("z1") - db({"floor": floor, 'letter': 'r'}).select("z0");
	if(guess[0] != undefined) {
		var z0=guess[0] * c2f;
	} else {
		var z0=defaults.floor_dimz * c2f;
	}
	floorsCount++;
	building.append("g").attr("id", "floor"+c2f).attr({"class": "floor", "opacity": 0, "visibility": "hidden"});
	_.each(db({'floor': floor}).get(), function(m) {
		if (m.letter == 's') { return; }
		activeLetter=m.letter;
		cgIdUpdate();
		cg=deepcopy(m);
		cg.floor=c2f;
		cg.idx=cgID;
		cg.name=cg.letter + cgID;
		cg.z0=z0;
		cg.z1=z0 + m.z1 - m.z0;
		cgDb();
		cgSvg();
	});
	$("#floor"+c2f).attr({"class": "floor", "fill-opacity": 0.4, "visibility": "hidden"});

	cg={};
	updateSnapLines();
	showGeneralBox();
	ajax_msg({'err':0, 'msg': "floor"+floor+" copied onto floor"+c2f});
}//}}}
function cgSelect(elems, blink=1, showProps=1) {//{{{

	$(".cg-selected").removeClass('cg-selected'); 
	if(typeof(elems)=="string") {
		arr=[elems];
	} else {
		arr=elems;
	}
	_.each(arr, function(v) { 
		cg=deepcopy(db({'name':v}).get()[0]);
		if(blink==1)     { $("#"+cg.name).addClass('cg-selected').css( { 'stroke-width': '100px'}).animate( { 'stroke-width': 0}, 400, function() { $(this).removeAttr('style'); }); }
		if(showProps==1) { showCgPropsBox(); }
	});
	m={'x': cg.minx, 'y': cg.miny};
	updatePosInfo(m);
	showBuildingLabels(1,[cg.name]);
}
//}}}
function bulkPlainProps() {//{{{
	var tbody='';
	tbody+="<tr><td>name<td>z";
	_.each(db({'letter': activeLetter, 'floor': floor}).get(), function (m) {
		tbody+="<tr><td class=bulkProps id="+ m.name + ">"+ m.name +"</td><td>"+m.z;
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
	pp="<input id=alter-room-enter type=hidden value=0>";
	if(cg.type=='room') {
		v=db({'name':cg.name}).get()[0];
		pp='';
		pp+="<tr><td>enter <withHelp>?<help><orange>yes</orange> agents can evacuate via this room<br><hr><orange>no</orange> agents can not evacuate via this room</help></withHelp>";
		pp+="<td><select id=alter-room-enter>";
		pp+="<option value="+v.room_enter+">"+v.room_enter+"</option>";
		pp+="<option value='yes'>yes</option>";
		pp+="<option value='no'>no</option>";
		pp+="</select>";
	}
	return pp;
}
//}}}
function mventProps() {//{{{
	pp="<input id=alter-mvent-throughput type=hidden value=0>";
	if(cg.type=='mvent') {
		v=db({'name':cg.name}).get()[0];
		pp="<tr><td>throughput<td>  <input id=alter-mvent-throughput type=text size=3 value="+v.mvent_throughput+">";
	} 
	return pp;
}
//}}}
function doorProps() {//{{{
	pp="<input id=alter-exit-type type=hidden value=0>";
	if(cg.type=='door') {
		v=db({'name':cg.name}).get()[0];
		pp='';
		pp+="<tr><td>exit <withHelp>?<help><orange>auto</orange> any evacuee can use this door<br><hr><orange>primary</orange> many evacuees have had used this door to get in and will use it to get out<br><hr><orange>secondary</orange> extra door known to the personel</help></withHelp>";
		pp+="<td><select id=alter-exit-type>";
		pp+="<option value="+v.exit_type+">"+v.exit_type+"</option>";
		pp+="<option value='auto'>auto</option>";
		pp+="<option value='primary'>primary</option>";
		pp+="<option value='secondary'>secondary</option>";
		pp+="</select>";
	}
	return pp;
}
//}}}

function rightBoxShow(html, close_button=1) {//{{{
	$('right-menu-box').html("");
	if(close_button==1) { $('right-menu-box').append("<close-right-menu-box><img src=/aamks/css/close.svg></close-right-menu-box><br>"); }
	$('right-menu-box').append(html);
	$('right-menu-box').fadeIn(); 
}
//}}}
function showGeneralBox() {//{{{
	rightBoxShow(
		"<table class=nobreak>"+
		"<input id=general_setup type=hidden value=1>"+
		"<tr><td colspan=2 style='text-align: center'>since now"+
		"<tr><td>floor<td><input id=floor type=text name=floor size=4 value="+floor+">"+ 
		"<tr><td>floor's z-origin <td><input id=floorZ0 type=text size=4 name=floorZ0 value="+floorZ0+">"+
		"<tr><td>door's width <td><input id=default_door_width type=text size=4 name=default_door_width  value="+defaults.door_width+">"+
		"<tr><td>door's z-dim <td><input id=default_door_dimz type=text size=4name=default_door_dimz value="+defaults.door_dimz+">"+
		"<tr><td>room's z-dim <td><input id=default_floor_dimz type=text size=4 name=default_floor_dimz value="+defaults.floor_dimz+">"+
		"<tr><td>window's z-dim <td><input id=default_window_dimz type=text size=4 name=default_window_dimz value="+defaults.window_dimz+">"+
		"<tr><td>window's z-offset <td><input id=default_window_offsetz type=text size=4 name=default_window_offsetz value="+defaults.window_offsetz+">"+
		"<tr><td colspan=2><button id=btn_copy_to_floor class=blink>copy</button> floor"+floor+" to floor <input id=copy_to_floor type=text style='width:20px' value=''>"+ 
		"</table>"
	);
}
//}}}
function showHelpBox() {//{{{
	rightBoxShow(
		"<table class=nobreak>"+
		"<tr><td><letter>letter</letter> + <letter>leftMouse</letter><td> create element"+
		"<tr><td><letter>rightMouse</letter><td> element properties"+
		"<tr><td>hold <letter>ctrl</letter> <td> disable snapping"+ 
		"<tr><td><letter>h</letter>	<td> 2D/3D views"+ 
		"<tr><td><letter>n</letter>	<td> loop floors"+ 
		"<tr><td><letter>x</letter>	<td> delete active"+
		"<tr><td><letter>l</letter>	<td> list all of active type"+
		"<tr><td><letter>ctrl</letter> + <letter>alt</letter>	<td> underlays"+
		"<tr><td><letter>ctrl</letter> + <letter>s</letter>	<td> save and read"+
		"<tr><td><letter>ctrl</letter> + <letter>z</letter> <td> undo"+ 
		"<tr><td><letter>ctrl</letter> + <letter>F1</letter> <td> geometry as text"+ 
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
	} else {
		b=getBbox();
		return "points:<br><textarea id=alter-polypoints>"+cg.polypoints.join("\n")+"</textarea><br>"+
		"z:<br><input id=alter-z value='"+cg.z.join(",")+"'>";
	}
}
//}}}
function showCgPropsBox() {//{{{
	showBuildingLabels(1);
	activeLetter=cg.letter;
	
	rightBoxShow(
	    "<input id=geom_properties type=hidden value=1>"+
	    "<center><red>&nbsp; "+cg.name+" &nbsp; "+gg[cg.letter]['x']+"</red><br>"+
		propsXYZ()+
		"<table>"+
		roomProps()+
		doorProps()+
		mventProps()+
		"</table>"+
		"<br><wheat><letter>x</letter> delete, <letter>l</letter> list</wheat>"+
		"", 0
	);

}
//}}}

function saveRightBoxGeneral() {//{{{
	if (floor != $("#floor").val()) { changeFloor(Number($("#floor").val())); }
	floorZ0=Number($("#floorZ0").val());
	defaults.door_dimz=Number($("#default_door_dimz").val());
	defaults.door_width=Number($("#default_door_width").val());
	defaults.floor_dimz=Number($("#default_floor_dimz").val());
	defaults.window_dimz=Number($("#default_window_dimz").val());
	defaults.window_offsetz=Number($("#default_window_offsetz").val());
	legend();
}
//}}}
function saveRightBoxCgProps() {//{{{
	if(cg.type=='evacuee') {
		cg.polypoints=[[Number($("#alter-px").val()), Number($("#alter-py").val())]];
		cg.z=[50,50];
		$("#"+cg.name).attr('cx', cg.polypoints[0][0]).attr('cy', cg.polypoints[0][1]);   
		cgUpdateSvg();
		cgDb();
	} else {
		cg.polypoints=[];
		_.each($("#alter-polypoints").val().split("\n"), function(m) { 
			arr=m.split(",");
			if(arr.length==2 && $.isNumeric(arr[0]) && $.isNumeric(arr[1])) { cg.polypoints.push([Number(arr[0]), Number(arr[1])]); }
		});
		cg.room_enter=$("#alter-room-enter").val();
		cg.exit_type=$("#alter-exit-type").val();
		cg.mvent_throughput=Number($("#alter-mvent-throughput").val());

		if(cg.floor != floor) { return; } // Just to be sure, there were (hopefully fixed) issues
		cgUpdateSvg();
		cgCss();
		cgDb();
		updateSnapLines();
	}

} 
//}}}
function saveRightBox() {//{{{
	if ($("#general_setup").val() != null)   { saveRightBoxGeneral(); }
	if ($("#geom_properties").val() != null) { saveRightBoxCgProps(); }
	
}
//}}}

function showBuildingLabels(aggressive=0, elems=[]) {//{{{
	$("#buildingLabels").html("");
	if(aggressive==1 || aamksUserPrefs.apainter_labels==1) { 
		var mm=d3.select("#buildingLabels");
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
					ajax_msg({'err':1, 'msg':"Overlaping rooms:<br>"+p1.name+"<br>"+p2.name}); 
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
	d3.select('view2d').append("div").attr("id", "apainter-texts-floor");
	d3.select('view2d').append("div").attr("id", "apainter-texts-keys").html("n: next floor<br>h: 2D/3D view");
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
	keyboardEvents();


}

//}}}
