// globals//{{{
var canvas=[screen.width-30,screen.height-190];
var db=TAFFY(); // http://taffydb.com/working_with_data.html
var zt={'x':0, 'y':0, 'k':1}; // zoom transform
var gg;
var ggx;
var zoom;
var fire_model='CFAST';
var currentView=0;
var selected_geom='';
var active_letter='r';
var svg;
var floor=0;
var floors_count=1;
var floor_zorig=0;
var building;
var snapLines;
var ax={};
var snap_dist=50;
var snap_lines={};
var defaults={'door_dimz': 200, 'door_width': 90, 'floor_dimz': 350, 'window_dimz': 150, 'window_offsetz': 100 };
var vh_snap=[];
var evacueeRadius;
//}}}
// on start{{{
$(function()  { 
	temp_chrome_transforms();
	$.getJSON("inc.json", function(x) {
		gg=x['aamksGeoms'];
		ggx=x['aamksGeomsMap'];
		evacueeRadius=x['evacueeRadius'];
		canvas_builder();
		import_cadjson();
		register_listeners();
		register_underlay_listeners();
		$('right-menu-box').fadeOut();

		//dd($('#building')[0]);
	});
});
//}}}

function temp_chrome_transforms() {//{{{
	// At some point chrome will enable separate css transformations and this call will be removed
	d3.select('body').append('temp_checker').attr("id", "temp_checker").style("scale", 1);
	if(d3.select('#temp_checker').style("scale")=='') {
		$("body").html("Aamks requires the experimental web features of Google Chrome.<br>You can paste the orange text to the address bar and enable them<br><span style='color: orange'>chrome://flags/#enable-experimental-web-platform-features</span>"); 
		throw new Error("");
	}
} //}}}
function ddd() {//{{{
	dd(db().get());
}
//}}}
function rrRecalculate(geom) {//{{{
	// real x,y are calculated as minimum/maximum values from rr
	// z needs separate calculations here.

	geom.x0 = Math.min(Math.round(geom.rr.x0), Math.round(geom.rr.x1));
	geom.x1 = Math.max(Math.round(geom.rr.x0), Math.round(geom.rr.x1));
	geom.y0 = Math.min(Math.round(geom.rr.y0), Math.round(geom.rr.y1));
	geom.y1 = Math.max(Math.round(geom.rr.y0), Math.round(geom.rr.y1));
	if(geom.type=='evacuee') {
		geom.z0=floor_zorig;
		geom.z1=floor_zorig + 50;
	} else if(geom.type=='door') {
		geom.z0=floor_zorig;
		geom.z1=floor_zorig + geom.dimz;
	} else if(geom.type=='obst') {
		geom.z0=floor_zorig;
		geom.z1=floor_zorig + 100;
	} else if(geom.type=='vvent') {
		geom.z0=floor_zorig + defaults.floor_dimz - 4;
		geom.z1=geom.z0 + 8;
	} else if(geom.type=='mvent') {
		geom.z0=floor_zorig + geom.mvent_offsetz;
		geom.z1=floor_zorig + geom.dimz + geom.mvent_offsetz;
	} else if(geom.type=='window') {
		geom.z0=floor_zorig + geom.window_offsetz;
		geom.z1=floor_zorig + geom.dimz + geom.window_offsetz;
	} else {
		geom.z0=floor_zorig;
		geom.z1=floor_zorig + geom.dimz;
	}

	return geom;
}
//}}}
function createSvg(geom) { //{{{
	if (gg[geom.letter].t == 'evacuee') { 
		var elem='circle';
	} else {
		var elem='rect';
	}
	d3.select("#floor"+geom.floor)
		.append(elem)
		.attr('id', geom.name)
		.attr('r', evacueeRadius)
		.attr('fill', gg[geom.letter].c)
		.attr('class', gg[geom.letter].t)
		.style('stroke', gg[geom.letter].stroke)
		.style('stroke-width', gg[geom.letter].strokeWidth)

	$("#"+geom.name)
		.attr('x', geom.x0)
		.attr('y', geom.y0)
		.attr('cx', geom.x0)
		.attr('cy', geom.y0)
		.attr('width', geom.x1 - geom.x0)
		.attr('height', geom.y1 - geom.y0)
}
//}}}
function updateVis(geom) {//{{{
	if(geom.type=='door') { 
		if(geom.exit_type=='secondary') { 
			$("#"+geom.name).css({ stroke: "#000" });   
		} else if(geom.exit_type=='primary') { 
			$("#"+geom.name).css({ stroke: "#f0f" });   
		} else if(geom.exit_type=='auto') { 
			$("#"+geom.name).css({ stroke: gg[geom.letter].stroke });   
		}
	} else if (geom.type=='room') { 
		if(geom.room_enter=='no') { 
			$("#"+geom.name).attr('fill', "#000");
		} else if(geom.room_enter=='yes') { 
			$("#"+geom.name).attr('fill', gg[geom.letter].c);
		}
	}
}
//}}}
function dbInsert(geom, relax=0) { //{{{
	// On the occassions we are massively called from import_cadjson() and alike
	// we don't want to auto call the heavy updateSnapLines() each time -- it is sufficient 
	// that import_cadjson() makes a single updateSnapLines() call after hundreds
	// of geoms are DbInserted().

	var lines=[];
	if(geom.type=='room') {
		lines.push([geom.x0, geom.y0], [geom.x1, geom.y0], [geom.x1, geom.y1], [geom.x0, geom.y1]);
	} else {
		lines.push([-10000, -10000], [-10000, -10000], [-10000, -10000], [-10000, -10000]);
	}
	selected_geom=geom.name;
    if (['fire'].includes(geom.type)) { geom.room_enter="no"; }
	if(geom.type!='underlay_scaler') {
		db.insert({ "name": geom.name, "idx": geom.idx, "cad_json": geom.cad_json, "letter": geom.letter, "type": geom.type, "lines": lines, "x0": geom.x0, "y0": geom.y0, "z0": geom.z0, "x1": geom.x1, "y1": geom.y1, "z1": geom.z1, "dimx": geom.x1-geom.x0, "dimy": geom.y1-geom.y0, "dimz": geom.dimz, "floor": geom.floor, "window_offsetz": geom.window_offsetz, "mvent_offsetz": geom.mvent_offsetz, "mvent_throughput": geom.mvent_throughput, "exit_type": geom.exit_type, "room_enter": geom.room_enter });
		if(relax==0) { apainter_properties_box(); updateSnapLines(); }
	} 
}
//}}}
function nextId() {//{{{
	var next=db({"type": gg[active_letter].t}).max("idx");
	if(next == undefined) { 
		next=1;
	} else {
		next+=1;
	}
	
	return next;
}
//}}}
function buildingDetachZoomer() {//{{{
	d3.select("#apainter-svg").call(d3.zoom().on("zoom", null)).on("mousedown.zoom", null);
}
//}}}
function buildingAttachZoomer() {//{{{
	d3.select("#apainter-svg")
		.call(d3.zoom()
			.scaleExtent([1 / 30, 4])
			.translateExtent([[-1200, -1200], [1000000 , 1000000]])
			.on("zoom", zoomed_canvas)
		)
		.on("dblclick.zoom", null);
}
//}}}
function resetView(){//{{{
	zoom.transform(svg, d3.zoomIdentity.translate(100,100).scale(0.2));
}
//}}}
function zoomInit() { //{{{
	zoom = d3.zoom().on("zoom", zoomed_canvas);
	resetView();
	buildingAttachZoomer(); 
}
//}}}
function zoomed_canvas() {//{{{
	zt=d3.event.transform;
	building.attr("transform", zt);
	snapLines.attr("transform", zt);
	$("#snapper").attr("transform", zt);
	ax.gX.call(ax.xAxis.scale(d3.event.transform.rescaleX(ax.x)))
	ax.gY.call(ax.yAxis.scale(d3.event.transform.rescaleY(ax.y)));
}
//}}}
function calc_next_floor() {//{{{
	if (floor == floors_count - 1) {
		return 0;
	} else {
		return floor+1;
	}
}
//}}}
function blink_selected() {//{{{
	$("#"+selected_geom).css('stroke-width', '100px');
	$("#"+selected_geom).animate({ 'stroke-width': gg[active_letter].strokeWidth}, 400);
}
//}}}
function next_view() {//{{{
	//console.log(currentView);

	// For production
	// if(currentView==0) { currentView=1; view3d(); }
	// else if(currentView==1) { currentView=0; close3dview(); }

	// For devel we have this 3 view cycles
	if(fire_model=='FDS') { return; }
	if(currentView==0) { currentView=1; view3d(); }
	else if(currentView==1) { currentView=2; close3dview(); textarea_edit_cad_json(); }
	else if(currentView==2) { currentView=0; cad_json_textarea_close(); }
	//console.log(currentView);
	//console.log("===========");
}
//}}}
function remove_geom(geom) {//{{{
	$("#"+geom).remove();
	db({"name":geom}).remove();
	updateSnapLines();
}
//}}}

function updateSnapLines() { //{{{
	// snap lines
	d3.select("#snapLines").selectAll("line").remove();
	var lines=db({'floor': floor}).select("lines");
	snap_lines['horiz']=[];
	snap_lines['vert']=[];
	var below, above, right, left;

	for(var points in lines) { 
		below = Math.round(lines[points][0][1]);
		above = Math.round(lines[points][2][1]);
		right = Math.round(lines[points][0][0]);
		left  = Math.round(lines[points][1][0]);

		snap_lines['horiz'].push(below);
		snap_lines['horiz'].push(above);
		snap_lines['vert'].push(right);
		snap_lines['vert'].push(left);

		snapLines.append('line').attr('id' , 'sh_'+below).attr('class' , 'snap_v').attr('y1' , below).attr('y2' , below).attr('x1' , 0).attr('x2' , 100000).attr("visibility", "hidden");
		snapLines.append('line').attr('id' , 'sh_'+above).attr('class' , 'snap_v').attr('y1' , above).attr('y2' , above).attr('x1' , 0).attr('x2' , 100000).attr("visibility", "hidden");
		snapLines.append('line').attr('id' , 'sv_'+right).attr('class' , 'snap_h').attr('x1' , right).attr('x2' , right).attr('y1' , 0).attr('y2' , 100000).attr("visibility", "hidden");
		snapLines.append('line').attr('id' , 'sv_'+left).attr('class'  , 'snap_h').attr('x1' , left).attr('x2'  , left).attr('y1'  , 0).attr('y2' , 100000).attr("visibility", "hidden");

	}
	snap_lines['horiz']=Array.from(new Set(snap_lines['horiz']));
	snap_lines['vert']=Array.from(new Set(snap_lines['vert']));
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
function guess_floors_z_origin() {//{{{
    // This is just a guess, user may overwrite via a form
	// Guess 1: Perhaps user has set the z-origin for this floor -- we will then find it in db()
	// Guess 2: If we are the first time on floor 5, then multiply floor0's dimz * 5
	// Guess 3: If there's no floor0 even or any other occassion z-origin=0
	var guess=db({"floor": floor, 'letter': 'r'}).select("z0");
	if(guess[0] != undefined) {
		$("#floor_zorig").val(guess[0]);
		floor_zorig=guess[0];
		return;
	}

	var guess=db({"floor": 0, 'letter': 'r'}).select("dimz");
	if(guess[0] != undefined) {
		$("#floor_zorig").val(guess[0]*floor);
		floor_zorig=guess[0]*floor;
		return;
	}

	$("#floor_zorig").val(0);
}
//}}}
function change_floor(requested_floor) {//{{{
	$("#p1").remove();
	$('right-menu-box').fadeOut(0);
	floor=requested_floor;
	guess_floors_z_origin();
	if(floor > floors_count-1) { 
		floors_count++;
		building.append("g").attr("id", "floor"+floor).attr("class", "floor").attr('fill-opacity',0.4);
	}

	$(".floor").attr("visibility","hidden");
	$("#floor"+floor).attr("visibility","visible");

	$(".underlay").attr("visibility","hidden");
	$("#underlay"+floor).attr("visibility","visible");

	updateSnapLines();
	d3.select("#floor_text").text("floor "+floor+"/"+floors_count);
	$("#floor_text").clearQueue().finish();
	$("#floor_text").css("opacity",1).animate({"opacity": 0.05}, 1000);
}
//}}}
function fix_hole_offset(rect) { //{{{
	// Detect orientation and fix hole offset. Other types, like windows, don't
	// need fixes.

	if(rect.type != 'hole') {
		return rect;
	}

	if(Math.abs(rect.rr.x1-rect.rr.x0) < Math.abs(rect.rr.y1-rect.rr.y0)) {
		rect.rr.y0-=16;
		rect.rr.y1+=16;
	} else {
		rect.rr.x0+=16;
		rect.rr.x1-=16;
	}
	return rect;
}
//}}}
function snap_vertical(m,rect,after_click) {//{{{
	for(var point in snap_lines['vert']) {
		p=snap_lines['vert'][point];
		if ((m[0]-zt.x)/zt.k > p - snap_dist && (m[0]-zt.x)/zt.k < p + snap_dist) { 
			$("#sv_"+p).attr("visibility", "visible");
			$('#snapper').attr('fill-opacity', 1).attr({ r: 10, cy: (m[1]-zt.y)/zt.k, cx: p });
			vh_snap.push(p);
			if (rect.type=='door') {
				rect.rr.x0=p-16;
				rect.rr.x1=p+16;
				rect.rr.y0=(m[1]-zt.y)/zt.k;
				rect.rr.y1=(m[1]-zt.y)/zt.k-defaults.door_width;
				return;
			} else if (rect.type=='room') { 
				if(after_click==1) { 
					rect.rr.x1=p;
				} else {
					rect.rr.x0=p;
				}
			} else {
				if(after_click==1) { 
					rect.rr.x1=p+16;
				} else {
					rect.rr.x0=p-16;
				}
			}
			break;
		}
	}
}
//}}}
function snap_horizontal(m,rect,after_click) {//{{{
	for(var point in snap_lines['horiz']) {
		p=snap_lines['horiz'][point];
		if ((m[1]-zt.y)/zt.k > p - snap_dist && (m[1]-zt.y)/zt.k < p + snap_dist) { 
			$("#sh_"+p).attr("visibility", "visible");
			$('#snapper').attr('fill-opacity', 1).attr({ r: 10, cx: (m[0]-zt.x)/zt.k, cy: p });
			vh_snap.push(p);
			if(rect.type=='door') {
				rect.rr.y0=p-16;
				rect.rr.y1=p+16;
				rect.rr.x0=(m[0]-zt.x)/zt.k;
				rect.rr.x1=(m[0]-zt.x)/zt.k+defaults.door_width;
				return;
			} else if (rect.type=='room') { 
				if(after_click==1) { 
					rect.rr.y1=p;
				} else {
					rect.rr.y0=p;
				}
			} else {
				if(after_click==1) { 
					rect.rr.y1=p-16;
				} else {
					rect.rr.y0=p+16;
				}
			}
			break;
		}
	}
}
//}}}
function snap(m,rect,after_click) {//{{{
	d3.selectAll('.snap_v').attr('visibility', 'hidden');
	d3.selectAll('.snap_h').attr('visibility', 'hidden');
	$('#snapper').attr('fill-opacity', 0);
	if (event.ctrlKey) { return; } 
	vh_snap=[];
	snap_vertical(m,rect,after_click);
	snap_horizontal(m,rect,after_click);

	if(rect.type!='door' && vh_snap.length==2) { 
		$('#snapper').attr({ r: 30, cx: vh_snap[0], cy: vh_snap[1]});
	}
}

//}}}
function create_self_props(self) {//{{{
	var counter=nextId();
	self.rr={};
	self.floor=floor;
	self.letter=active_letter;
	self.type=gg[active_letter].t;
	self.name=active_letter+counter;
	self.idx=counter;
	self.mvent_offsetz=0;
	self.mvent_throughput=0;
	self.exit_type='';
	if (self.type=='door') {
		self.dimz=defaults.door_dimz;
		self.exit_type='auto';
	} else if (self.type=='room') {
		self.dimz=defaults.floor_dimz;
		self.room_enter='yes';
	} else if (self.type=='mvent') {
		self.dimz=50;
	} else if (self.type=='window') {
		self.dimz=defaults.window_dimz;
		self.window_offsetz=defaults.window_offsetz;
	} else if (self.type=='fire') {
		self.dimz=100
	} else { 
		self.dimz=defaults.floor_dimz;
	}
}
//}}}
function new_geom() {//{{{
	// After a letter is clicked we react to mouse events
	// The most tricky scenario is when first mouse click happens before mousemove.
	// geom.rr.x0 & friends are temporary -- we don't want to recalculate min, max, width, heigh on every mouse drag
	// geom.x0 & friends are for db and some svg operations
	var mouse;
	var after_click=0;
	var mx, my;
	var self = this;
	create_self_props(self);
	$('right-menu-box').fadeOut(0);
	buildingDetachZoomer();
	svg.on('mousedown', function() {
		after_click=1;
		mouse=d3.mouse(this);
		mx=Math.round((mouse[0]-zt.x)/zt.k);
		my=Math.round((mouse[1]-zt.y)/zt.k);
		self.x0=mx;
		self.x1=mx;
		self.y0=my;
		self.y1=my;
		createSvg(self);
	});
	svg.on('mousemove', function() {
		mouse=d3.mouse(this);
		mx=Math.round((mouse[0]-zt.x)/zt.k);
		my=Math.round((mouse[1]-zt.y)/zt.k);
		if (after_click==0) { 
			self.rr = { 'x0': mx, 'y0': my, 'x1': mx, 'y1': my, 'cx': mx, 'cy': my };
		}
		else if (after_click==1 && self.rr.x0 == null) { 
			self.rr = { 'x0': mx, 'y0': my, 'cx': mx, 'cy': my };
		}
		self.rr.x1=mx;
		self.rr.y1=my;
		self.rr.cx=mx;
		self.rr.cy=my;
		if(['room', 'hole', 'window', 'door'].includes(self.type)) { snap(mouse,self,after_click); }
		if(after_click==1) { updateSvgElem(self); } 
	});  
	svg.on('mouseup', function() {
		if(['underlay_scaler'].includes(self.type))  { underlay_form(); }
		svg.on('mousedown', null);
		svg.on('mousemove', null);
		svg.on('mouseup', null);
		if(self.type=='evacuee') { 
			self.rr = { 'x0': self.x0, 'x1': self.x0+1, 'y0': self.y0, 'y1': self.y0+1 };
		}
		if(self.rr.x0 == self.rr.x1 || self.rr.y0 == self.rr.y1 || self.rr.x0 == null) { 
			$("#"+self.name).remove();
		} else {
			if (['hole', 'window'].includes(self.type)) { self=fix_hole_offset(self); }
			updateSvgElem(self);
			self=rrRecalculate(self);
			dbInsert(self);
		}
		after_click=0;
		$('#snapper').attr('fill-opacity', 0);
		buildingAttachZoomer();
	});
}
//}}}
function updateSvgElem(geom) {  //{{{
	$("#"+geom.name).attr({
		x: Math.min(geom.rr.x0   , geom.rr.x1) ,
		y: Math.min(geom.rr.y0   , geom.rr.y1) ,
		cx: Math.min(geom.rr.x0   , geom.rr.x1) ,
		cy: Math.min(geom.rr.y0   , geom.rr.y1) ,
		width: Math.abs(geom.rr.x1 - geom.rr.x0) ,
		height: Math.abs(geom.rr.y1 - geom.rr.y0)
	});   
}
//}}}
function canvas_builder() { //{{{
	d3.select('body').append('view3d');
	d3.select('body').append('view2d');
	d3.select('view2d').append('button-right-menu-box').attr("id", "button-help").html("HELP").style("padding-right", "50px");
	d3.select('view2d').append('button-right-menu-box').attr("id", "button-setup").html("SETUP");
	d3.select('view2d').append('legend0');
	d3.select('view2d').append('legend1');
	make_legend0("apainter");
	svg = d3.select('view2d').append('svg').attr("id", "apainter-svg").attr("width", canvas[0]).attr("height", canvas[1]);
	svg.append("filter").attr("id", "invertColorsFilter").append("feColorMatrix").attr("values", "-1 0 0 0 1 0 -1 0 0 1 0 0 -1 0 1 0 0 0 1 0");
	tt=svg.append("g").attr("id", "texts");
	tt.append("text").attr("x",130).attr("y",60).attr("id", "scenario_text").text(session_scenario);
	tt.append("text").attr("x",130).attr("y",140).attr("id", "shortcuts_help1").text("n: next floor");
	tt.append("text").attr("x",130).attr("y",155).attr("id", "shortcuts_help2").text("h: 3d view");
	tt.append("text").attr("x",130).attr("y",120).attr("id", "floor_text").text("floor "+floor+"/"+floors_count);

	axes();
	building = svg.append("g").attr("id", "building");
	building.append("g").attr("id", "floor0").attr("class", "floor").attr('fill-opacity',0.4);
	snapLines = svg.append("g").attr("id", "snapLines");
	svg.append('circle').attr('id', 'snapper').attr('cx', 100).attr('cy', 100).attr('r',30).attr('fill-opacity', 0).attr('fill', "#ff8800");
	legend();
	d3.select('view2d').append('right-menu-box');
	zoomInit();
	keyboard_events();


}
//}}}
