// globals//{{{
var canvas=[screen.width-30,screen.height-190];
var db=TAFFY(); // http://taffydb.com/working_with_data.html
var zt={'x':0, 'y':0, 'k':1}; // zoom transform
var cg={}; // current geom, the one that is currently selected, created, removed, etc.
var cgID;
var gg;
var ggx;
var zoom;
var fire_model='CFAST';
var currentView=0;
var activeLetter='r';
var svg;
var floor=0;
var floorsCount=1;
var floorZ0=0;
var building;
var ax={};
var snapForce=50;
var snapLinesSvg;
var snapLinesArr={};
var defaults={'door_dimz': 200, 'door_width': 90, 'floor_dimz': 350, 'window_dimz': 150, 'window_offsetz': 100 };
var activeSnap={};
var preferredSnap='x';
var evacueeRadius;
//}}}
// on start{{{
$(function()  { 
	tempChrome();
	$.getJSON("inc.json", function(x) {
		gg=x['aamksGeoms'];
		ggx=x['aamksGeomsMap'];
		evacueeRadius=x['evacueeRadius'];
		canvasBuilder();
		importCadJson();
		registerListeners();
		registerListenersUnderlay();
		$('right-menu-box').fadeOut();

		//dd($('#building')[0]);
	});
});
//}}}

function tempChrome() {//{{{
	// At some point chrome will enable separate css transformations and this call will be removed
	d3.select('body').append('temp_checker').attr("id", "temp_checker").style("scale", 1);
	if(d3.select('#temp_checker').style("scale")=='') {
		$("body").html("<br><br><br><center>Aamks requires the experimental web features of Google Chrome.<br>You can paste the orange text to the address bar and enable them<br><span style='color: orange'>chrome://flags/#enable-experimental-web-platform-features</span>"); 
		throw new Error("");
	}
} //}}}
function ddd() {//{{{
	dd(db().get());
}
//}}}
function cgPolish() {//{{{
	// real x,y are calculated as minimum/maximum values from rr
	// z needs separate calculations here.
	//dd('recalc', cg);

	cg.x0 = Math.min(Math.round(cg.x0), Math.round(cg.x1));
	cg.x1 = Math.max(Math.round(cg.x0), Math.round(cg.x1));
	cg.y0 = Math.min(Math.round(cg.y0), Math.round(cg.y1));
	cg.y1 = Math.max(Math.round(cg.y0), Math.round(cg.y1));
	if(cg.type=='evacuee') {
		if(cg.z0===undefined) { cg.z0=floorZ0; }
		cg.z1=cg.z0 + 50;
	} else if(cg.type=='door') {
		if(cg.z0===undefined) { cg.z0=floorZ0; }
		cg.z1=cg.z0  + cg.dimz;
	} else if(cg.type=='obst') {
		if(cg.z0===undefined) { cg.z0=floorZ0; }
		cg.z1=cg.z0 + 100;
	} else if(cg.type=='vvent') {
		//dd('start zolty', cg.z0, "floorZ0", floorZ0);
		if(cg.z0===undefined) { cg.z0=floorZ0 + defaults.floor_dimz - 4; }
		cg.z1=cg.z0 + 8;
		//dd('end zolty', cg.z0, "floorZ0", floorZ0);
		//dd("===");
	} else if(cg.type=='mvent') {
		//dd('start zielony', cg.z0, "floorZ0", floorZ0);
		if(cg.z0===undefined) { cg.z0=floorZ0; }
		cg.z1=cg.z0 + cg.dimz;
		//dd('end zielony', cg.z0, "floorZ0", floorZ0);
		//dd("===");
	} else if(cg.type=='window') {
		if(cg.z0===undefined) { cg.z0=floorZ0 + defaults.window_offsetz; }
		cg.z1=cg.z0 + cg.dimz;
	} else {
		if(cg.z0===undefined) { cg.z0=floorZ0; }
		cg.z1=cg.z0 + cg.dimz;
	}
}
//}}}
function cgSvg() { //{{{
	if (gg[cg.letter].t == 'evacuee') { 
		var elem='circle';
	} else {
		var elem='rect';
	}
	d3.select("#floor"+cg.floor)
		.append(elem)
		.attr('id', cg.name)
		.attr('r', evacueeRadius)
		.attr('fill', gg[cg.letter].c)
		.attr('class', gg[cg.letter].t)
		.attr('x', cg.x0)
		.attr('y', cg.y0)
		.attr('cx', cg.x0)
		.attr('cy', cg.y0)
		.attr('width', cg.x1 - cg.x0)
		.attr('height', cg.y1 - cg.y0)
		.style('stroke', gg[cg.letter].stroke)
		.style('stroke-width', gg[cg.letter].strokeWidth)

}
//}}}
function cgCss() {//{{{
	if(cg.type=='door') { 
		if(cg.exit_type=='secondary') { 
			$("#"+cg.name).css({ stroke: "#000" });   
		} else if(cg.exit_type=='primary') { 
			$("#"+cg.name).css({ stroke: "#f0f" });   
		} else if(cg.exit_type=='auto') { 
			$("#"+cg.name).css({ stroke: gg[cg.letter].stroke });   
		}
	} else if (cg.type=='room') { 
		if(cg.room_enter=='no') { 
			$("#"+cg.name).attr('fill', "#000");
		} else if(cg.room_enter=='yes') { 
			$("#"+cg.name).attr('fill', gg[cg.letter].c);
		}
	}
}
//}}}
function cgDb() { //{{{
	// On the occassions we are massively called from importCadJson() and alike
	// we don't want to auto call the heavy updateSnapLines() each time -- it is sufficient 
	// that importCadJson() makes a single updateSnapLines() call after hundreds
	// of geoms are DbInserted().

	var lines=[];
	if(cg.type=='room') {
		lines.push([cg.x0, cg.y0], [cg.x1, cg.y0], [cg.x1, cg.y1], [cg.x0, cg.y1]);
	} else {
		lines.push([-10000, -10000], [-10000, -10000], [-10000, -10000], [-10000, -10000]);
	}
    if (['fire'].includes(cg.type)) { cg.room_enter="no"; }
	if(cg.type!='underlay_scaler') {
		db.insert({ "name": cg.name, "idx": cg.idx, "cad_json": cg.cad_json, "letter": cg.letter, "type": cg.type, "lines": lines, "x0": cg.x0, "y0": cg.y0, "z0": cg.z0, "x1": cg.x1, "y1": cg.y1, "z1": cg.z1, "dimx": cg.x1-cg.x0, "dimy": cg.y1-cg.y0, "dimz": cg.dimz, "floor": cg.floor, "mvent_throughput": cg.mvent_throughput, "exit_type": cg.exit_type, "room_enter": cg.room_enter });
	} 
	
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

	zoom = d3.zoom().on("zoom", zoomedCanvas);
	resetView();

	d3.select("#apainter-svg")
		.call(d3.zoom()
			.scaleExtent([1 / 30, 4])
			.translateExtent([[-1200, -1200], [1000000 , 1000000]])
			.on("zoom", zoomedCanvas)
			.filter(function(){ return (event.which === 0 || event.which === 2 ); })
		)
		.on("dblclick.zoom", null);
}
//}}}
function zoomedCanvas() {//{{{
	zt=d3.event.transform;
	building.attr("transform", zt);
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
function cgBlink() {//{{{
	$("#"+cg.name).css('stroke-width', '100px');
	$("#"+cg.name).animate({ 'stroke-width': gg[activeLetter].strokeWidth}, 400);
}
//}}}
function nextView() {//{{{
	//console.log(currentView);

	// For production
	// if(currentView==0) { currentView=1; view3d(); }
	// else if(currentView==1) { currentView=0; close3dview(); }

	// For devel we have this 3 view cycles

	$("right-menu-box").css("display", "none");
	if(fire_model=='FDS') { return; }

	if(currentView==0)      { currentView=1; view3d(); }
	else if(currentView==1) { currentView=2; close3dview(); txtEditCadJson(); }
	else if(currentView==2) { currentView=0; closeTxtCadJson(); }

	//console.log(currentView);
	//console.log("===========");
}
//}}}
function cgRemove() {//{{{
	$("#"+cg.name).remove();
	db({"name":cg.name}).remove();
	updateSnapLines();
	if($("#gg_listing").length==0) { 
		$("right-menu-box").css("display", "none"); 
	} else {
		properties_type_listing(); 
	}
}
//}}}

function updateSnapLines() { //{{{
	d3.select("#snapLinesSvg").selectAll("line").remove();
	var lines=db({'floor': floor}).select("lines");
	snapLinesArr['horiz']=[];
	snapLinesArr['vert']=[];
	var below, above, right, left;

	for(var points in lines) { 
		below = Math.round(lines[points][0][1]);
		above = Math.round(lines[points][2][1]);
		right = Math.round(lines[points][0][0]);
		left  = Math.round(lines[points][1][0]);

		snapLinesArr['horiz'].push(below);
		snapLinesArr['horiz'].push(above);
		snapLinesArr['vert'].push(right);
		snapLinesArr['vert'].push(left);

		snapLinesSvg.append('line').attr('id' , 'sh_'+below).attr('class' , 'snap_v').attr('y1' , below).attr('y2' , below).attr('x1' , -10000).attr('x2' , 100000).attr("visibility", "hidden");
		snapLinesSvg.append('line').attr('id' , 'sh_'+above).attr('class' , 'snap_v').attr('y1' , above).attr('y2' , above).attr('x1' , -10000).attr('x2' , 100000).attr("visibility", "hidden");
		snapLinesSvg.append('line').attr('id' , 'sv_'+right).attr('class' , 'snap_h').attr('x1' , right).attr('x2' , right).attr('y1' , -10000).attr('y2' , 100000).attr("visibility", "hidden");
		snapLinesSvg.append('line').attr('id' , 'sv_'+left).attr('class'  , 'snap_h').attr('x1' , left).attr('x2'  , left).attr('y1'  , -10000).attr('y2' , 100000).attr("visibility", "hidden");

	}
	snapLinesArr['horiz']=Array.from(new Set(snapLinesArr['horiz']));
	snapLinesArr['vert']=Array.from(new Set(snapLinesArr['vert']));
}
//}}}
function axes() { //{{{
	ax.x = d3.scaleLinear()
		.domain([-1, canvas[0]+ 1])
		.range([-1, canvas[0]+ 1 ]);

	ax.y = d3.scaleLinear()
		.domain([-1, canvas[1] + 1])
		.range([-1, canvas[1] + 1]);

	ax.xAxis = d3.axisBottom(ax.x)
		.ticks(screen.width/200)
		.tickSize(canvas[1])
		.tickPadding(2 - canvas[1]);

	ax.yAxis = d3.axisRight(ax.y)
		.ticks(screen.height/200)
		.tickSize(canvas[0])
		.tickPadding(2 - canvas[0]);
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

	var guess=db({"floor": 0, 'letter': 'r'}).select("dimz");
	if(guess[0] != undefined) {
		$("#floorZ0").val(guess[0]*floor);
		floorZ0=guess[0]*floor;
		return;
	}

	$("#floorZ0").val(0);
}
//}}}
function changeFloor(requested_floor) {//{{{
	$("#p1").remove();
	$('right-menu-box').fadeOut(0);
	floor=requested_floor;
	guessFloorZ0();
	if(floor > floorsCount-1) { 
		floorsCount++;
		building.append("g").attr("id", "floor"+floor).attr("class", "floor").attr('fill-opacity',0.4);
	}

	$(".floor").attr("visibility","hidden");
	$("#floor"+floor).attr("visibility","visible");

	$(".underlay").attr("visibility","hidden");
	$("#underlay"+floor).attr("visibility","visible");

	updateSnapLines();
	d3.select("#floor_text").text("floor "+floor+"/"+floorsCount);
	$("#floor_text").clearQueue().finish();
	$("#floor_text").css("opacity",1).animate({"opacity": 0.05}, 1000);
}
//}}}
function cgFixOffset() { //{{{
	// Detect orientation and fix hole offset. 

	if(cg.type != 'hole') { return; }

	if(Math.abs(cg.x1-cg.x0) < Math.abs(cg.y1-cg.y0)) {
		cg.y0+=16;
		cg.y1-=16;
	} else {
		cg.x0+=16;
		cg.x1-=16;
	}
}
//}}}
function activeSnapX(mx,my) {//{{{
	for(var point in snapLinesArr['vert']) {
		p=snapLinesArr['vert'][point];
		if (mx > p - snapForce && mx < p + snapForce) { 
			activeSnap.x=p;
			break;
		}
	}
}
//}}}
function activeSnapY(mx,my) {//{{{
	for(var point in snapLinesArr['horiz']) {
		p=snapLinesArr['horiz'][point];
		if (my > p - snapForce && my < p + snapForce) { 
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
function snap(mx,my) {//{{{
	activeSnap={};
	if(!['room', 'hole', 'window', 'door'].includes(cg.type)) { return; }
	snappingHide(0);
	if (event.ctrlKey) { $('#snapper').attr('fill-opacity', 0); return; } 

	activeSnapX(mx,my); 
	activeSnapY(mx,my); 

    if (['window', 'door'].includes(cg.type)) { snapKeepDirection(mx,my); }
	if(isEmpty(activeSnap)) { snappingHide();  } else { snappingShow(mx,my); }
}

//}}}
function snapKeepDirection(mx,my) {//{{{
	// Prevent ortho-changing snapping 
	if (!('y' in activeSnap) && 'x' in activeSnap) { preferredSnap='x'; }
	if (!('x' in activeSnap) && 'y' in activeSnap) { preferredSnap='y'; }
	activeSnap={};
	if(preferredSnap=='x') { 
		activeSnapX(mx,my); 
	} else {
		activeSnapY(mx,my); 
	}
}
//}}}
function snappingShow(mx,my) {//{{{
	$('#snapper').attr('fill-opacity', 1).attr({ r: 10, cx: mx, cy: my}); 
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
	cgIdUpdate();
	cg.infant=1;
	cg.floor=floor;
	cg.letter=activeLetter;
	cg.type=gg[activeLetter].t;
	cg.name=activeLetter+cgID;
	cg.idx=cgID;
	cg.mvent_throughput=0;
	cg.exit_type='';
	if (cg.type=='door') {
		cg.dimz=defaults.door_dimz;
		cg.exit_type='auto';
	} else if (cg.type=='room') {
		cg.dimz=defaults.floor_dimz;
		cg.room_enter='yes';
	} else if (cg.type=='mvent') {
		cg.dimz=50;
	} else if (cg.type=='window') {
		cg.dimz=defaults.window_dimz;
	} else if (cg.type=='fire') {
		cg.dimz=100
	} else { 
		cg.dimz=defaults.floor_dimz;
	}
}
//}}}
function scaleMouse(pos) {//{{{
	return {'x': Math.round((pos[0]-zt.x)/zt.k), 'y': Math.round((pos[1]-zt.y)/zt.k) };
} //}}}
function cgCreate() {//{{{
	cgInit();
	svg.on('mousedown', function() {
		m=scaleMouse(d3.mouse(this));
		cgDecidePoints(m.x, m.y);
		cgSvg();
		cg.growing=1;
		delete cg.infant;
	});
	svg.on('mousemove', function() {
		m=scaleMouse(d3.mouse(this));
		snap(m.x, m.y);
		cgDecidePoints(m.x, m.y);
		cgUpdateSvg(); 
	});  
	svg.on('mouseup', function() {
		if(assertCgReady()) {
			cgFixOffset();
			cgUpdateSvg();
			cgPolish();
			cgDb();
			showCgPropsBox(); 
			updateSnapLines();
		}
		snappingHide();
		delete cg.growing;
		cgInit();
	});
}
//}}}
function dumpCgPos() {//{{{
	// func not really needed
	dd(cg.name, { x0: cg.x0, y0: cg.y0, x1: cg.x1, y1: cg.y1 });
}
//}}}
function cgDecidePoints(mx,my) {//{{{

	if("x" in activeSnap) { px=activeSnap.x; } else { px=mx; }
	if("y" in activeSnap) { py=activeSnap.y; } else { py=my; }
	if("infant" in cg) { cg.x0=px; cg.y0=py; }
	cg.x1=px; cg.y1=py; 
	if (event.ctrlKey) { return; }

	switch (cg.type) {
		case 'door':
			if("x" in activeSnap) { 
				cg.x0=px-16; cg.x1=px+16; cg.y1=py; cg.y0=py-defaults.door_width;
			} else {
				cg.y0=py-16; cg.y1=py+16; cg.x0=px; cg.x1=px+defaults.door_width;
			}
			break;
		case 'window': case 'hole':
			if("x" in activeSnap) { 
				if("infant" in cg) { cg.x0=px-16; }
				cg.x1=px+16;
			}
			if("y" in activeSnap) { 
				if("infant" in cg) { cg.y0=py-16; }
				cg.y1=py+16; 
			}
			break;
	}
}
//}}}
function assertCgReady() {//{{{
	if(cg.x0 == cg.x1 || cg.y0 == cg.y1 || cg.x0 == null) { 
		$("#"+cg.name).remove();
		return false;
	}

	if(cg.type=='underlay_scaler') { 
		underlayForm();
		return false;
	}
	return true;
}
//}}}
function cgUpdateSvg() {  //{{{
	$("#"+cg.name).attr({
		x: Math.min(cg.x0, cg.x1) ,
		y: Math.min(cg.y0, cg.y1) ,
		cx: Math.min(cg.x0, cg.x1) ,
		cy: Math.min(cg.y0, cg.y1) ,
		width: Math.abs(cg.x1 - cg.x0) ,
		height: Math.abs(cg.y1 - cg.y0)
	});   
}
//}}}
function canvasBuilder() { //{{{
	d3.select('body').append('view3d');
	d3.select('body').append('view2d');
	d3.select('body').append('legend0');
	d3.select('body').append('legend2');
	d3.select('view2d').append('legend1');
	make_legend0("apainter");
	make_legend2("apainter");
	svg = d3.select('view2d').append('svg').attr("id", "apainter-svg").attr("width", canvas[0]).attr("height", canvas[1]);
	svg.append("filter").attr("id", "invertColorsFilter").append("feColorMatrix").attr("values", "-1 0 0 0 1 0 -1 0 0 1 0 0 -1 0 1 0 0 0 1 0");
	tt=svg.append("g").attr("id", "texts");
	tt.append("text").attr("x",130).attr("y",60).attr("id", "scenario_text").text(session_scenario);
	tt.append("text").attr("x",130).attr("y",140).attr("id", "shortcuts_help1").text("n: next floor");
	tt.append("text").attr("x",130).attr("y",155).attr("id", "shortcuts_help2").text("h: next view");
	tt.append("text").attr("x",130).attr("y",120).attr("id", "floor_text").text("floor "+floor+"/"+floorsCount);

	axes();
	building = svg.append("g").attr("id", "building");
	building.append("g").attr("id", "floor0").attr("class", "floor").attr('fill-opacity',0.4);
	snapLinesSvg = svg.append("g").attr("id", "snapLinesSvg");
	svg.append('circle').attr('id', 'snapper').attr('cx', 100).attr('cy', 100).attr('r',30).attr('fill-opacity', 0).attr('fill', "#ff8800");
	legend();
	d3.select('view2d').append('right-menu-box');
	zoomInit();
	keyboardEvents();


}
//}}}
