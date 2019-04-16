// globals//{{{
var canvas=[screen.width-30,screen.height-190];
var db=TAFFY(); // http://taffydb.com/working_with_data.html
var zt={'x':0, 'y':0, 'k':1}; // zoom transform
var gg;
var ggx;
var DbInsert;
var UpdateVis;
var NextIdx;
var currentView=0;
var CreateSvg;
var CanvasBuilder;
var selected_geom='';
var active_letter='r';
var svg;
var floor=0;
var floors_count=1;
var floor_zorig=0;
var g_aamks;
var g_floor;
var g_img;
var g_snap_lines;
var ax={};
var snap_dist=50;
var snap_lines={};
var default_door_dimz=200;
var default_door_width=90;
var default_floor_dimz=350;
var default_window_dimz=150;
var default_window_offsetz=100;
var underlay_imgs={};
var underlay_draggable=0;
var vh_snap=[];
var evacueeRadius;
//}}}

// on start{{{
$(function()  { 
	$.getJSON("inc.json", function(x) {
		gg=x['aamksGeoms'];
		ggx=x['aamksGeomsMap'];
		evacueeRadius=x['evacueeRadius'];
		CanvasBuilder();
		left_menu_box();
		import_cadjson();
		register_listeners();
	});
});
//}}}
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
		geom.z0=floor_zorig + default_floor_dimz - 4;
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
CreateSvg=function create_svg(geom) { //{{{
	if (gg[geom.letter].t == 'evacuee') { 
		var elem='circle';
	} else {
		var elem='rect';
	}
	g_floor=d3.select("#floor"+geom.floor);
	g_floor.append(elem)
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
UpdateVis=function updateVisPropsElem(geom) {//{{{
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
DbInsert=function db_insert(geom) { //{{{
	// Function exported for menus_apainter.js also
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
		show_selected_properties();
		geoms_changed();
	}
}
//}}}
NextIdx=function next_idx() {//{{{
	var next=db({"type": gg[active_letter].t}).max("idx");
	if(next == undefined) { 
		next=1;
	} else {
		next+=1;
	}
	
	return next;
}
//}}}

function canvas_zoomer() { //{{{
	var zoom = d3.zoom().on("zoom", zoomed_canvas);

	svg.append("rect")
		.attr("id", 'zoomer')
		.attr("width", canvas[0])
		.attr("height", canvas[1])
		.attr("opacity", 0)
		.attr("pointer-events", "visible")
		.attr("visibility", "hidden")
		.call(zoom)
		.call(zoom.transform, d3.zoomIdentity.translate(100,100).scale(0.2))
		.call(d3.zoom()
			.scaleExtent([1 / 30, 4])
			.filter(function(){
			return ( event.button === 0 ||
					 event.button === 1);
			})
			.translateExtent([[-1200, -1200], [1000000 , 1000000]])
			.on("zoom", zoomed_canvas)
		);
}
//}}}
function zoomed_canvas() {//{{{
	zt=d3.event.transform;
	zt.k = Math.round(zt.k * 100) / 100;
	zt.x = Math.round(zt.x * 100) / 100;
	zt.y = Math.round(zt.y * 100) / 100;
	g_aamks.attr("transform", zt);
	g_snap_lines.attr("transform", zt);
	$("#snapper").attr("transform", zt);
	ax.gX.call(ax.xAxis.scale(d3.event.transform.rescaleX(ax.x)));
	ax.gY.call(ax.yAxis.scale(d3.event.transform.rescaleY(ax.y)));
}
//}}}
function fadeout_setup_box() {//{{{
	if(gg[active_letter].t == 'underlay_scaler') { return; }
	$('right-menu-box').fadeOut(0);
	underlay_draggable=0;
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
function keyboard_events() {//{{{
	$(this).keypress((e) => { 
		if (e.key == 'g')     { properties_type_listing(); }
		else if (e.key in gg) { active_letter=e.key; new_geom(); }
	});
	$(this).keydown((e) =>  { if (e.key == 'h')     { alternative_view(); } });
	$(this).keydown((e) =>  { if (e.key == 'H')     { change_floor(calc_next_floor()); } }); 

	$(this).keyup((e) =>    { if (e.key == 'Shift') { $("#zoomer").attr("visibility", "hidden"); } });
	$(this).keydown((e) =>  { if (e.key == 'Shift') { $("#zoomer").attr("visibility", "visible"); } });
}
//}}}
function blink_selected() {//{{{
	$("#"+selected_geom).css('stroke-width', '100px');
	$("#"+selected_geom).animate({ 'stroke-width': gg[active_letter].strokeWidth}, 400);
}
//}}}
function geom_select_deselect() { //{{{
	$("right-menu-box").on("mouseover" , ".properties_type_listing" , function() { 
		selected_geom=$(this).attr('id');
		blink_selected();
	});
	$('svg').dblclick(function(evt){
		if (evt.target.tagName == 'rect' || evt.target.tagName == 'circle') { 
			selected_geom=evt.target.id;
			show_selected_properties();
			blink_selected();
		} else {
			selected_geom=''
		}
	});

	$(this).keypress((e) => { 
		if (e.key == 'x' && selected_geom != "") { 
			remove_geom(selected_geom);
			properties_type_listing();
		}
	});
}
	//}}}
function alternative_view() {//{{{
	//console.log(currentView);

	// For production
	// if(currentView==0) { currentView=1; view3d(); }
	// else if(currentView==1) { currentView=0; close3dview(); }

	// For devel we have this 3 view cycles
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
	geoms_changed();
}
//}}}
function properties_type_listing_plain() {//{{{
	var tbody='';
	tbody+="<tr><td>name<td>x0<td>y0<td>x-dim<td>y-dim<td>z-dim";
	var items=db({'letter': active_letter, 'floor': floor}).get();
	for (var i in items) { 
		tbody+="<tr><td class=properties_type_listing id="+ items[i]['name']+ ">"+ items[i]['name']+"</td>"+
			"<td>"+items[i]['x0']+
			"<td>"+items[i]['y0']+
			"<td>"+items[i]['dimx']+
			"<td>"+items[i]['dimy']+
			"<td>"+items[i]['dimz'];
	}
	return tbody;
}
//}}}
function properties_type_listing_mvent() {//{{{
	var tbody='';
	tbody+="<tr><td>name<td>x0<td>y0<td>x-dim<td>y-dim<td>z-dim<td>z-offset<td>throughput";
	var items=db({'letter': active_letter, 'floor': floor}).get();
	for (var i in items) { 
		tbody+="<tr><td class=properties_type_listing id="+ items[i]['name']+ ">"+ items[i]['name']+"</td>"+
			"<td>"+items[i]['x0']+
			"<td>"+items[i]['y0']+
			"<td>"+items[i]['dimx']+
			"<td>"+items[i]['dimy']+
			"<td>"+items[i]['dimz']+
			"<td>"+items[i]['mvent_offsetz']+
			"<td>"+items[i]['mvent_throughput'];
	}
	return tbody;
}
//}}}
function properties_type_listing_window() {//{{{
	var tbody='';
	tbody+="<tr><td>name<td>x0<td>y0<td>x-dim<td>y-dim<td>z-dim<td>z-offset";
	var items=db({'letter': active_letter, 'floor': floor}).get();
	for (var i in items) { 
		tbody+="<tr><td class=properties_type_listing id="+ items[i]['name']+ ">"+ items[i]['name']+"</td>"+
			"<td>"+items[i]['x0']+
			"<td>"+items[i]['y0']+
			"<td>"+items[i]['dimx']+
			"<td>"+items[i]['dimy']+
			"<td>"+items[i]['dimz']+
			"<td>"+items[i]['window_offsetz'];
	}
	return tbody;
}
//}}}
function properties_type_listing_door() {//{{{
	var tbody='';
	tbody+="<tr><td>name<td>x0<td>y0<td>x-dim<td>y-dim<td>z-dim<td>exit_type";
	var items=db({'letter': active_letter, 'floor': floor}).get();
	for (var i in items) { 
		tbody+="<tr><td class=properties_type_listing id="+ items[i]['name']+ ">"+ items[i]['name']+"</td>"+
			"<td>"+items[i]['x0']+
			"<td>"+items[i]['y0']+
			"<td>"+items[i]['dimx']+
			"<td>"+items[i]['dimy']+
			"<td>"+items[i]['dimz']+
			"<td>"+items[i]['exit_type'];
	}
	return tbody;
}
//}}}
function properties_type_listing_room() {//{{{
	var tbody='';
	tbody+="<tr><td>name<td>x0<td>y0<td>x-dim<td>y-dim<td>z-dim<td>enter";
	var items=db({'letter': active_letter, 'floor': floor}).get();
	for (var i in items) { 
		tbody+="<tr><td class=properties_type_listing id="+ items[i]['name']+ ">"+ items[i]['name']+"</td>"+
			"<td>"+items[i]['x0']+
			"<td>"+items[i]['y0']+
			"<td>"+items[i]['dimx']+
			"<td>"+items[i]['dimy']+
			"<td>"+items[i]['dimz']+
			"<td>"+items[i]['room_enter'];
	}
	return tbody;
}
//}}}
function properties_type_listing_evacuee() {//{{{
	var tbody='';
	tbody+="<tr><td>name<td>x0<td>y0";

	var items=db({'letter': active_letter, 'floor': floor}).get();
	for (var i in items) { 
		tbody+="<tr><td class=properties_type_listing id="+ items[i]['name']+ ">"+ items[i]['name']+"</td>"+
			"<td>"+items[i]['x0']+
			"<td>"+items[i]['y0'];
	}
	return tbody;
}
//}}}
function properties_type_listing() {//{{{
	var names='';
	names+='<div style="overflow-y: scroll; height: '+(canvas[1]-100)+'px">';
	names+='<wheat>Hover name, then <letter>x</letter> to delete</wheat>';
	names+='<table id=droplist_names_table style="margin-right:20px">';
	if (gg[active_letter].t=='mvent') { 
		names+=properties_type_listing_mvent();
	} else if (gg[active_letter].t=='window') { 
		names+=properties_type_listing_window();
	} else if (gg[active_letter].t=='door') { 
		names+=properties_type_listing_door();
	} else if (gg[active_letter].t=='evacuee') { 
		names+=properties_type_listing_evacuee();
	} else if (gg[active_letter].t=='room') { 
		names+=properties_type_listing_room();
	} else {
		names+=properties_type_listing_plain();
	}
	names+="</table>";
	names+="</div>";

	$('right-menu-box').html(names);
	$('right-menu-box').css('display','block');

	$('.properties_type_listing').click(function() {
		selected_geom=$(this).attr('id');
		show_selected_properties();
		blink_selected();
	});

}
//}}}

function make_dim_properties() {//{{{
	var prop='';
	if(gg[active_letter].t!='evacuee') {
		//var selected=db({'name':selected_geom}).select("exit_type")[0]; // TODO: some garbage line?
		prop+="<tr><td>x-dim<td><input id=alter_dimx type=text size=3 value="+db({'name':selected_geom}).select("dimx")[0]+">";
		prop+="<tr><td>y-dim<td><input id=alter_dimy type=text size=3 value="+db({'name':selected_geom}).select("dimy")[0]+">";
		prop+="<tr><td>z-dim<td><input id=alter_dimz type=text size=3 value="+db({'name':selected_geom}).select("dimz")[0]+">";
	} else {
		prop+="<input id=alter_dimx type=hidden value=0>";
		prop+="<input id=alter_dimy type=hidden value=0>";
		prop+="<input id=alter_dimz type=hidden value=0>";
	}
	return prop;
}
//}}}
function make_room_properties() {//{{{
	var prop='';
	if(gg[active_letter].t=='room') {
		var selected=db({'name':selected_geom}).select("room_enter")[0];
		prop+="<tr><td>enter <withHelp>?<help><orange>yes</orange> agents can evacuate via this room<br><hr><orange>no</orange> agents can not evacuate via this room</help></withHelp>";
		prop+="<td><select id=alter_room_enter>";
		prop+="<option value="+selected+">"+selected+"</option>";
		prop+="<option value='yes'>yes</option>";
		prop+="<option value='no'>no</option>";
		prop+="</select>";
	} else {
		prop+="<input id=alter_room_enter type=hidden value=0>";
	}
	return prop;
}
//}}}
function make_mvent_properties() {//{{{
	var mvent='';
	if(gg[active_letter].t=='mvent') {
		mvent+="<tr><td>z-offset<td>  <input id=alter_mvent_offsetz type=text size=3 value="+db({'name':selected_geom}).select("mvent_offsetz")[0]+">";
		mvent+="<tr><td>throughput<td>  <input id=alter_mvent_throughput type=text size=3 value="+db({'name':selected_geom}).select("mvent_throughput")[0]+">";
	} else {
		mvent+="<input id=alter_mvent_offsetz type=hidden value=0>";
		mvent+="<input id=alter_mvent_throughput type=hidden value=0>";
	}
	return mvent;
}
//}}}
function make_window_properties() {//{{{
	var win='';
	if(gg[active_letter].t=='window') {
		win+="<tr><td>z-offset<td>  <input id=alter_window_offsetz type=text size=3 value="+db({'name':selected_geom}).select("window_offsetz")[0]+">";
	} else {
		win+="<input id=alter_window_offsetz type=hidden value=0>";
	}
	return win;
}
//}}}
function make_door_properties() {//{{{
	var prop='';
	if(gg[active_letter].t=='door') {
		var selected=db({'name':selected_geom}).select("exit_type")[0];
		prop+="<tr><td>exit <withHelp>?<help><orange>auto</orange> any evacuee can use this door<br><hr><orange>primary</orange> many evacuees have had used this door to get in and will use it to get out<br><hr><orange>secondary</orange> extra door known to the personel</help></withHelp>";
		prop+="<td><select id=alter_exit_type>";
		prop+="<option value="+selected+">"+selected+"</option>";
		prop+="<option value='auto'>auto</option>";
		prop+="<option value='primary'>primary</option>";
		prop+="<option value='secondary'>secondary</option>";
		prop+="</select>";
	} else {
		prop+="<input id=alter_exit_type type=hidden value=0>";
	}
	return prop;
}
//}}}
function show_selected_properties() {//{{{
	active_letter=db({'name':selected_geom}).select("letter")[0];
	var room_properties=make_room_properties();
	var mvent_properties=make_mvent_properties();
	var window_properties=make_window_properties();
	var door_properties=make_door_properties();
	var dim_properties=make_dim_properties();
	d3.select('right-menu-box').html(
	    "<input id=geom_properties type=hidden value=1>"+
		"<wheat><letter>x</letter> to delete, <letter>g</letter> for listing</wheat>"+
		"<table>"+
	    "<tr><td>name <td>"+db({'name':selected_geom}).select("name")[0]+
		"<tr><td>x0	<td>	<input id=alter_x0 type=text size=3 value="+db({'name':selected_geom}).select("x0")[0]+">"+
		"<tr><td>y0	<td>	<input id=alter_y0 type=text size=3 value="+db({'name':selected_geom}).select("y0")[0]+">"+
		dim_properties+
		room_properties+
		mvent_properties+
		window_properties+
		door_properties+
		"</table>"
		);
	$('right-menu-box').fadeIn();

}
//}}}
function geoms_changed() { //{{{
	// snap lines
	d3.select("#g_snap_lines").selectAll("line").remove();
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

		g_snap_lines.append('line').attr('id' , 'sh_'+below).attr('class' , 'snap_v').attr('y1' , below).attr('y2' , below).attr('x1' , 0).attr('x2' , 100000).attr("visibility", "hidden");
		g_snap_lines.append('line').attr('id' , 'sh_'+above).attr('class' , 'snap_v').attr('y1' , above).attr('y2' , above).attr('x1' , 0).attr('x2' , 100000).attr("visibility", "hidden");
		g_snap_lines.append('line').attr('id' , 'sv_'+right).attr('class' , 'snap_h').attr('x1' , right).attr('x2' , right).attr('y1' , 0).attr('y2' , 100000).attr("visibility", "hidden");
		g_snap_lines.append('line').attr('id' , 'sv_'+left).attr('class'  , 'snap_h').attr('x1' , left).attr('x2'  , left).attr('y1'  , 0).attr('y2' , 100000).attr("visibility", "hidden");

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

	ax.gX = svg.append("g")
		.attr("class", "axis axis--x")
		.call(ax.xAxis);

	ax.gY = svg.append("g")
		.attr("class", "axis axis--y")
		.call(ax.yAxis);
}
//}}}
function guess_floors_z_origin() {//{{{
	// Guess 1: Perhaps user has set the z-origin for this floor -- we will then find it in db()
	// Guess 2: If we are the first time on floor 5, then multiply floor0's dimz * 5
	// Guess 3: If there's no floor0 even or any other occassion z-origin=0
	var guess=db({"floor": floor, 'letter': 'r'}).select("z0");
	if(guess[0] != undefined) {
		$("#floor_zorig").val(guess[0]);
		return;
	}

	var guess=db({"floor": 0, 'letter': 'r'}).select("dimz");
	if(guess[0] != undefined) {
		$("#floor_zorig").val(guess[0]*floor);
		return;
	}

	$("#floor_zorig").val(0);
}
//}}}
function change_floor(requested_floor) {//{{{
	if (floor == requested_floor) { return; }
	floor=requested_floor;
	guess_floors_z_origin();
	if(floor > floors_count-1) { 
		floors_count++;
		g_floor = g_aamks.append("g").attr("id", "floor"+floor).attr("class", "g_floor").attr('fill-opacity',0.4);
	}
	var active_f="#floor"+floor;
	var inactive_f=".g_floor:not("+active_f+")";
	g_floor=d3.select(active_f);
	$(inactive_f).animate({"opacity": 0}, 1000, function(){
		$(inactive_f).attr("visibility","hidden");
	});
	$(active_f).attr("visibility","visible").css("opacity",0).animate({"opacity": 1}, 1000);

	var active_img="#g_img"+floor;
	var inactive_img=".g_img:not("+active_img+")";
	g_img=d3.select(active_img);
	$(inactive_img).animate({"opacity": 0}, 1000, function(){
		$(inactive_img).attr("visibility","hidden");
	});
	$(active_img).attr("visibility","visible").css("opacity",0).animate({"opacity": 1}, 1000);

	geoms_changed();
	d3.select("#floor_text").text("floor "+floor);
	$("#floor_text").css("opacity",1).animate({"opacity": 0.05}, 1000);

}
//}}}
function save_setup_box() {//{{{
	// There's a single box for multiple forms
	// so we need to find out which form is submitted

	if ($("#general_setup").val() != null) { 
		change_floor(parseInt($("#floor").val()));
		floor_zorig=parseInt($("#floor_zorig").val());
		default_door_dimz=parseInt($("#default_door_dimz").val());
		default_door_width=parseInt($("#default_door_width").val());
		default_floor_dimz=parseInt($("#default_floor_dimz").val());
		default_window_dimz=parseInt($("#default_window_dimz").val());
		default_window_offsetz=parseInt($("#default_window_offsetz").val());
		legend();
	} 
	save_setup_box_underlay();
	var x=db({'name':selected_geom}).get();
	if (x.length==0) { return; }

	if ($("#geom_properties").val() != null) { 
		var geom={
			idx: x[0]['idx'],
			name: x[0]['name'],
			floor: x[0]['floor'],
			letter: x[0]['letter'],
			type: x[0]['type'],
			room_enter: $("#alter_room_enter").val(),
			exit_type: $("#alter_exit_type").val(),
			dimz: parseInt($("#alter_dimz").val()),
			window_offsetz: parseInt($("#alter_window_offsetz").val()),
			mvent_offsetz: parseInt($("#alter_mvent_offsetz").val()),
			mvent_throughput: parseInt($("#alter_mvent_throughput").val()),
			rr:{
				x0: parseInt($("#alter_x0").val()),
				y0: parseInt($("#alter_y0").val()),
				x1: parseInt($("#alter_x0").val())+parseInt($("#alter_dimx").val()),
				y1: parseInt($("#alter_y0").val())+parseInt($("#alter_dimy").val())
			}
		};
		// If the below is false, then geom from floorX is somehow controlled by the menu from floorY
		// which must be stopped. Happened, was fixed, but makes me careful...
		if(geom.floor == floor) { 
			db({"name": geom.name}).remove();
			updateSvgElem(geom);
			UpdateVis(geom);
			geom=rrRecalculate(geom);
			DbInsert(geom);
		}
	} 

}
//}}}
function make_setup_box() {//{{{
	d3.select('view2d').append('right-menu-box');
	$('button-right-menu-box').click(function() {
		help_utils_into_setup_box();
		$('right-menu-box').fadeIn();
	});

	$('right-menu-box').mouseleave(function() {
		save_setup_box();
	});

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
				rect.rr.y1=(m[1]-zt.y)/zt.k-default_door_width;
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
				rect.rr.x1=(m[0]-zt.x)/zt.k+default_door_width;
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
	var counter=NextIdx();
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
		self.dimz=default_door_dimz;
		self.exit_type='auto';
	} else if (self.type=='room') {
		self.dimz=default_floor_dimz;
		self.room_enter='yes';
	} else if (self.type=='mvent') {
		self.dimz=50;
	} else if (self.type=='window') {
		self.dimz=default_window_dimz;
		self.window_offsetz=default_window_offsetz;
	} else { 
		self.dimz=default_floor_dimz;
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
	fadeout_setup_box(); 
	svg.on('mousedown', function() {
		after_click=1;
		mouse=d3.mouse(this);
		mx=Math.round((mouse[0]-zt.x)/zt.k);
		my=Math.round((mouse[1]-zt.y)/zt.k);
		self.x0=mx;
		self.x1=mx;
		self.y0=my;
		self.y1=my;
		CreateSvg(self);
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
		if(['room', 'hole', 'window', 'door'].includes(self.type)) { 
			snap(mouse,self,after_click);
		}
		if(after_click==1) { updateSvgElem(self); } 
	});  
	svg.on('mouseup', function() {
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
			DbInsert(self);
		}
		after_click=0;
		$('#snapper').attr('fill-opacity', 0);
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
CanvasBuilder=function canvas_builder() { //{{{
	d3.select('body').append('view3d');
	d3.select('body').append('view2d');
	d3.select('view2d').append('button-right-menu-box').html("SETUP");
	d3.select('view2d').append('apainter-legend-static');
	d3.select('view2d').append('legend');
	d3.select('view2d').append('left-menu-box');
	svg = d3.select('view2d').append('svg').attr("id", "apainter-svg").attr("width", canvas[0]).attr("height", canvas[1]);
	svg.append("filter").attr("id", "invertColorsFilter").append("feColorMatrix").attr("values", "-1 0 0 0 1 0 -1 0 0 1 0 0 -1 0 1 0 0 0 1 0");
	svg.append("text").attr("x",130).attr("y",60).attr("id", "scenario_text").text(session_scenario);
	svg.append("text").attr("x",130).attr("y",120).attr("id", "floor_text").text("floor"+floor);
	axes();
	g_aamks = svg.append("g").attr("id", "g_aamks");
	g_floor = g_aamks.append("g").attr("id", "floor0").attr("class", "g_floor").attr('fill-opacity',0.4);
	g_snap_lines = svg.append("g").attr("id", "g_snap_lines");
	svg.append('circle').attr('id', 'snapper').attr('cx', 100).attr('cy', 100).attr('r',30).attr('fill-opacity', 0).attr('fill', "#ff8800");
	legend_static();
	legend();
	make_setup_box();
	canvas_zoomer();
	keyboard_events();
	geom_select_deselect();


}
//}}}

