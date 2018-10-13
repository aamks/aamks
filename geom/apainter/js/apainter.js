// globals//{{{
var canvas=[screen.width*0.99,screen.height-180];
var db=TAFFY(); // http://taffydb.com/working_with_data.html
var zt={'x':0, 'y':0, 'k':1}; // zoom transform
var gg;
var DbInsert;
var Attr_cad_json;
var CreateSvg;
var selected_geom='';
var gg_opacity=0.4;
var droplist_letter='r';
var svg;
var floor=0;
var floors_count=1;
var floor_zorig=0;
var counter=0;
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
var underlay_imgs={};
var underlay_draggable=0;
var vh_snap=[];
//}}}

$(function()  { 
site();

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
	} else if(geom.type=='mvent') {
		geom.z0=floor_zorig + geom.mvent_offsetz;
		geom.z1=floor_zorig + geom.dimz + geom.mvent_offsetz;
	} else {
		geom.z0=floor_zorig;
		geom.z1=floor_zorig + geom.dimz;
	}

	geom=Attr_cad_json(geom);
	return geom;
}
//}}}
CreateSvg=function create_svg(geom) { //{{{
	if (gg[letter].t == 'evacuee') { 
		var elem='circle';
	} else {
		var elem='rect';
	}
	g_floor=d3.select("#floor"+geom.floor);
	g_floor.append(elem)
		.attr('id', geom.name)
		.attr('r', 25)
		.attr('fill', gg[letter].c)
		.attr('class', gg[letter].t)
		.style('stroke', gg[letter].stroke)
		.style('stroke-width', gg[letter].strokewidth)

	$("#"+geom.name)
		.attr('x', geom.x0)
		.attr('y', geom.y0)
		.attr('cx', geom.x0)
		.attr('cy', geom.y0)
		.attr('width', geom.x1 - geom.x0)
		.attr('height', geom.y1 - geom.y0)
}
//}}}
Attr_cad_json=function cad_json_dbinsert(geom) { //{{{
	// Create cad_json attribute for the DB. underlay.js uses us too.
	if(geom.type=='door') {
		geom.cad_json=`[[ ${geom.x0}, ${geom.y0}, ${geom.z0} ], [ ${geom.x1}, ${geom.y1}, ${geom.z1} ], "${geom.is_exit}" ]`; 
	} else if(geom.type=='mvent') {
		geom.cad_json=`[[ ${geom.x0}, ${geom.y0}, ${geom.z0} ], [ ${geom.x1}, ${geom.y1}, ${geom.z1} ], { "throughput": ${geom.mvent_throughput}, "offset": ${geom.mvent_offsetz}} ]`; 
	} else {
		geom.cad_json=`[[ ${geom.x0}, ${geom.y0}, ${geom.z0} ], [ ${geom.x1}, ${geom.y1}, ${geom.z1} ]]`; 
	}
	return geom;
}
//}}}
DbInsert=function db_insert(geom) { //{{{
	// Function exported for underlay.js also
	var lines=[];
	if(geom.type=='room') {
		lines.push([geom.x0, geom.y0], [geom.x1, geom.y0], [geom.x1, geom.y1], [geom.x0, geom.y1]);
	} else {
		lines.push([-10000, -10000], [-10000, -10000], [-10000, -10000], [-10000, -10000]);
	}
	selected_geom=geom.name;
	if(geom.type!='underlay_scaler') {
		db.insert({ "name": geom.name, "cad_json": geom.cad_json, "letter": geom.letter, "type": geom.type, "lines": lines, "x0": geom.x0, "y0": geom.y0, "z0": geom.z0, "x1": geom.x1, "y1": geom.y1, "z1": geom.z1, "dimx": geom.x1-geom.x0, "dimy": geom.y1-geom.y0, "dimz": geom.dimz, "floor": geom.floor, "mvent_offsetz": geom.mvent_offsetz, "mvent_throughput": geom.mvent_throughput, "is_exit": geom.is_exit });
		show_selected_properties(geom.name);
		geoms_changed();
	}
	//console.log("painter", db().select( "cad_json", "dimx", "dimy", "dimz", "floor", "is_exit", "letter", "mvent_offsetz", "mvent_throughput", "name", "type", "x0", "y0", "z0", "x1", "y1", "z1"));
}
//}}}

function make_gg() {//{{{
	return {
		r: { legendary: 1 , x: "ROOM"            , xx: "ROOM"            , t: "room"            , c: "#729fcf" , stroke: "#fff"    , font: "#fff" , strokewidth: 5 }   ,
		c: { legendary: 1 , x: "COR"             , xx: "COR"             , t: "room"            , c: "#3465a4" , stroke: "#fff"    , font: "#fff" , strokewidth: 5 }   ,
		d: { legendary: 1 , x: "DOOR"            , xx: "D"               , t: "door"            , c: "#73d216" , stroke: "#73d216" , font: "#fff" , strokewidth: 5 }   ,
		z: { legendary: 1 , x: "HOLE"            , xx: "HOLE"            , t: "hole"            , c: "#c4a000" , stroke: "#c4a000" , font: "#224" , strokewidth: 5 }   ,
		w: { legendary: 1 , x: "WIN"             , xx: "W"               , t: "window"          , c: "#fff"    , stroke: "#fff"    , font: "#444" , strokewidth: 4 }   ,
		s: { legendary: 1 , x: "STAI"            , xx: "STAI"            , t: "room"            , c: "#5c3566" , stroke: "#fff"    , font: "#fff" , strokewidth: 5 }   ,
		a: { legendary: 1 , x: "HALL"            , xx: "HALL"            , t: "room"            , c: "#e9b96e" , stroke: "#fff"    , font: "#000" , strokewidth: 5 }   ,
		q: { legendary: 1 , x: "ClosD"           , xx: "C"               , t: "door"            , c: "#cc0000" , stroke: "#cc0000" , font: "#fff" , strokewidth: 5 }   ,
		e: { legendary: 1 , x: "ElktD"           , xx: "E"               , t: "door"            , c: "#436"    , stroke: "#fff"    , font: "#fff" , strokewidth: 5 }   ,
		v: { legendary: 1 , x: "VVENT"           , xx: "VVENT"           , t: "vvent"            , c: "#ffaa00" , stroke: "#820"    , font: "#224" , strokewidth: 2.5 } ,
		b: { legendary: 1 , x: "MVENT"            , xx: "MVENT"            , t: "mvent"            , c: "#4e9a06" , stroke: "#080"    , font: "#fff" , strokewidth: 2.5 } ,
		t: { legendary: 1 , x: "OBST"            , xx: "OBST"            , t: "obst"            , c: "#ad7fa8" , stroke: "#404"    , font: "#224" , strokewidth: 0.5 } ,
		f: { legendary: 1 , x: "EVACUEE"         , xx: "EVACUEE"         , t: "evacuee"         , c: "#fff"    , stroke: "#fff"    , font: "#444" , strokewidth: 0 }   ,
		p: { legendary: 0 , x: "UNDERLAY_SCALER" , xx: "UNDERLAY_SCALER" , t: "underlay_scaler" , c: "#f0f"    , stroke: "#fff"    , font: "#444" , strokewidth: 0 }   ,
	}
}
//}}}
function canvas_zoomer() { //{{{
	var zoom = d3.zoom().on("zoom", zoomed_canvas);

	svg.append("rect")
		.attr("id", 'zoomer')
		.attr("width", canvas[0])
		.attr("height", canvas[1])
		.attr("fill", "#a40")
		.attr("opacity", 0)
		.attr("pointer-events", "visible")
		.attr("visibility", "hidden")
		.call(zoom)
		.call(zoom.transform, d3.zoomIdentity.scale(0.2))
		.call(d3.zoom()
			.scaleExtent([1 / 30, 4])
			.filter(function(){
			return ( event.button === 0 ||
					 event.button === 1);
			})
			.translateExtent([[-1000, -1000], [1000000 , 1000000]])
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
	if(gg[letter].t == 'underlay_scaler') { return; }
	$('setup-box').fadeOut(0);
	underlay_draggable=0;
}
//}}}
function keyboard_events() {//{{{
	$(this).keypress((e) => { 
		for(var letter in gg) {
			if (e.key == letter) { new_geom(letter); }
		}
	});

	$(this).keydown((e) =>  { if (e.key == 'h')     { alternative_view(); } });
	$(this).keypress((e) => { if (e.key == 'g')     { properties_type_listing(droplist_letter); } });
	$(this).keyup((e) =>    { if (e.key == 'Shift') { $("#zoomer").attr("visibility", "hidden"); } });
	$(this).keydown((e) =>  { if (e.key == 'Shift') { $("#zoomer").attr("visibility", "visible"); } });
}
//}}}
function geom_select_deselect() { //{{{
	$('svg').dblclick(function(evt){
		if (evt.target.tagName == 'rect' || evt.target.tagName == 'circle') { 
			selected_geom=evt.target.id;
			show_selected_properties(selected_geom);
		} else {
			selected_geom=''
			fadeout_setup_box();
		}
	});

	$(this).keypress((e) => { 
		if (e.key == 'x' && selected_geom != "") { 
			remove_geom(selected_geom);
		}
	});
}
	//}}}
function alternative_view() {//{{{
	$(".g_img").toggle();
	$(".axis").toggle();
	if(d3.select('#floor'+floor).attr('fill-opacity')==0.7) { 
		gg_opacity=0.4; 
	} else {
		gg_opacity=0.7; 
	}
	d3.select('#floor'+floor).attr('fill-opacity', gg_opacity);
}
//}}}
function remove_geom(geom) {//{{{
	$("#"+geom).remove();
	db({"name":geom}).remove();
	geoms_changed();
	fadeout_setup_box();
}
//}}}
function properties_type_listing_plain(letter) {//{{{
	var tbody='';
	tbody+="<tr><td>name<td>x0<td>y0<td>x-dim<td>y-dim<td>z-dim";
	var items=db({'letter': letter, 'floor': floor}).select("dimx", "dimy", "dimz", "name", "x0", "y0");
	for (var i in items) { 
		tbody+="<tr><td class=properties_type_listing id="+ items[i][3]+ ">"+ items[i][3]+"</td>"+
			"<td>"+items[i][4]+
			"<td>"+items[i][5]+
			"<td>"+items[i][0]+
			"<td>"+items[i][1]+
			"<td>"+items[i][2];
	}
	return tbody;
}
//}}}
function properties_type_listing_mvent(letter) {//{{{
	var tbody='';
	tbody+="<tr><td>name<td>x0<td>y0<td>x-dim<td>y-dim<td>z-dim<td>z-offset<td>throughput";
	var items=db({'letter': letter, 'floor': floor}).select("dimx", "dimy", "dimz", "mvent_offsetz", "mvent_throughput", "name", "x0", "y0");
	for (var i in items) { 
		tbody+="<tr><td class=properties_type_listing id="+ items[i][5]+ ">"+ items[i][5]+"</td>"+
			"<td>"+items[i][6]+
			"<td>"+items[i][7]+
			"<td>"+items[i][0]+
			"<td>"+items[i][1]+
			"<td>"+items[i][2]+
			"<td>"+items[i][3]+
			"<td>"+items[i][4];
	}
	return tbody;
}
//}}}
function properties_type_listing_door(letter) {//{{{
	var tbody='';
	tbody+="<tr><td>name<td>x0<td>y0<td>x-dim<td>y-dim<td>z-dim<td>is exit?";
	var items=db({'letter': letter, 'floor': floor}).select("dimx", "dimy", "dimz", "is_exit", "name", "x0", "y0");
	for (var i in items) { 
		tbody+="<tr><td class=properties_type_listing id="+ items[i][4]+ ">"+ items[i][4]+"</td>"+
			"<td>"+items[i][5]+
			"<td>"+items[i][6]+
			"<td>"+items[i][0]+
			"<td>"+items[i][1]+
			"<td>"+items[i][2]+
			"<td>"+items[i][3];
	}
	return tbody;
}
//}}}
function properties_type_listing_evacuee(letter) {//{{{
	var tbody='';
	tbody+="<tr><td>name<td>x0<td>y0";
	var items=db({'letter': letter, 'floor': floor}).select("name", "x0", "y0");
	for (var i in items) { 
		tbody+="<tr><td class=properties_type_listing id="+ items[i][0]+ ">"+ items[i][0]+"</td>"+
			"<td>"+items[i][1]+
			"<td>"+items[i][2];
	}
	return tbody;
}
//}}}
function properties_type_listing(letter) {//{{{
	droplist_letter=letter;
	var names='';
	names+='<div id=overflow-div style="height: '+(canvas[1]-100)+'px">';
	names+='<table id=droplist_names_table>';
	if (gg[letter].t=='mvent') { 
		names+=properties_type_listing_mvent(letter);
	} else if (gg[letter].t=='door') { 
		names+=properties_type_listing_door(letter);
	} else if (gg[letter].t=='evacuee') { 
		names+=properties_type_listing_evacuee(letter);
	} else {
		names+=properties_type_listing_plain(letter);
	}
	names+="</table>";
	names+="</div>";

	$('setup-box').html(names);
	$('setup-box').css('display','block');

	$('.properties_type_listing').click(function() {
		selected_geom=$(this).attr('id');
		show_selected_properties(selected_geom);
	});

}
//}}}
function make_mvent_properties(letter) {//{{{
	var mvent='';
	if(gg[letter].t=='mvent') {
		mvent+="<tr><td>z-offset<td>  <input id=alter_mvent_offsetz type=text size=3 value="+db({'name':selected_geom}).select("mvent_offsetz")[0]+">";
		mvent+="<tr><td>throughput<td>  <input id=alter_mvent_throughput type=text size=3 value="+db({'name':selected_geom}).select("mvent_throughput")[0]+">";
	} else {
		mvent+="<input id=alter_mvent_offsetz type=hidden value=0>";
		mvent+="<input id=alter_mvent_throughput type=hidden value=0>";
	}
	return mvent;
}
//}}}
function make_dim_properties(letter) {//{{{
	var prop='';
	if(gg[letter].t!='evacuee') {
		var selected=db({'name':selected_geom}).select("is_exit")[0];
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
function make_door_properties(letter) {//{{{
	var prop='';
	if(gg[letter].t=='door') {
		var selected=db({'name':selected_geom}).select("is_exit")[0];
		prop+="<tr><td>is_exit";
		prop+="<td><select id=alter_is_exit>";
		prop+="<option value="+selected+">"+selected+"</option>";
		prop+="<option value='exit_auto'>exit_auto</option>";
		prop+="<option value='exit_yes'>exit_yes</option>";
		prop+="<option value='exit_no'>exit_no</option>";
		prop+="</select>";
	} else {
		prop+="<input id=alter_is_exit type=hidden value=0>";
	}
	return prop;
}
//}}}
function show_selected_properties(selected_geom) {//{{{
	var letter=db({'name':selected_geom}).select("letter")[0];
	var stroke_width=$("#"+selected_geom).css('stroke-width');
	$("#"+selected_geom).css('stroke-width', '50px');
	$("#"+selected_geom).animate({ 'stroke-width': stroke_width }, 300);

	mvent_properties=make_mvent_properties(letter);
	door_properties=make_door_properties(letter);
	dim_properties=make_dim_properties(letter);
	droplist_letter=letter;
	d3.select('setup-box').html(
	    "<input id=geom_properties type=hidden value=1>"+
	    "<input id=alter_letter type=hidden value="+letter+">"+
		"<table>"+
	    "<tr><td>name <td><input id=alter_name type=hidden value="+db({'name':selected_geom}).select("name")[0]+">"+db({'name':selected_geom}).select("name")[0]+
		"<tr><td>x0	<td>	<input id=alter_x0 type=text size=3 value="+db({'name':selected_geom}).select("x0")[0]+">"+
		"<tr><td>y0	<td>	<input id=alter_y0 type=text size=3 value="+db({'name':selected_geom}).select("y0")[0]+">"+
		dim_properties+
		mvent_properties+
		door_properties+
	    "<tr><td>x<td>remove"+
	    "<tr><td>g<td class=more_properties letter="+letter+">more..."+
		"</table>"
		);
	$('setup-box').fadeIn();

	$('.more_properties').click(function() {
		properties_type_listing($(this).attr('letter'));
	});

}
//}}}
function geoms_changed() { //{{{
	// elems count
	// snap lines
	legend();
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
function legend() { //{{{
	$('legend').html('');

	for(var letter in gg) {
		if(gg[letter].legendary==1) { 
			var x=db({"letter": letter}).select("name");
			$('legend').append("<div class=legend letter="+letter+" id=legend_"+letter+" style='color: "+gg[letter].font+"; background-color: "+gg[letter].c+"'>"+letter+" "+gg[letter].x+" ("+x.length+")</div>");
		}
	}
	$('legend').append("&nbsp;&nbsp;<open3dview>[3dview]</open3dview>");
	$('legend').append(" <write>[save]</write>");

	$('write').click(function() { output_json(); });
	$('open3dview').click(function() { open3dview(); });

	$('.legend').click(function() {
		properties_type_listing($(this).attr('letter'));
	});


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
function change_floor() {//{{{
	if (floor == parseInt($("#floor").val())) { 
		return;
	}
	floor=parseInt($("#floor").val());
	if(floor > floors_count-1) { 
		floors_count=floor+1;
		g_floor = g_aamks.append("g").attr("id", "floor"+floor).attr("class", "g_floor").attr('fill-opacity',gg_opacity);
	}
	var active_f="#floor"+floor;
	var inactive_f=".g_floor:not("+active_f+")";
	g_floor=d3.select(active_f);
	$(inactive_f).animate({"opacity": 0}, 2000, function(){
		$(inactive_f).css("visibility","hidden");
	});
	$(active_f).css({ "visibility":"visible","opacity":0}).animate({"opacity": 1}, 2000);

	var active_img="#g_img"+floor;
	var inactive_img=".g_img:not("+active_img+")";
	g_img=d3.select(active_img);
	$(inactive_img).animate({"opacity": 0}, 2000, function(){
		$(inactive_img).css("visibility","hidden");
	});
	$(active_img).css({ "visibility":"visible","opacity":0}).animate({"opacity": 1}, 2000);

	geoms_changed();
	d3.select("#floor_text").text("floor "+floor);
	$("#floor_text").css({ "opacity":1 }).animate({"opacity": 0.05}, 2000);
	$("#floor_text").html("floor "+floor);

}
//}}}
function updateExitDoor(geom) {//{{{
	if(geom.type=='door') { 
		if(geom.is_exit=='exit_no') { 
			$("#"+geom.name).css({ stroke: "#000" });   
		} else if(geom.is_exit=='exit_yes') { 
			$("#"+geom.name).css({ stroke: "#f0f" });   
		} else if(geom.is_exit=='exit_auto') { 
			$("#"+geom.name).css({ stroke: gg[geom.letter].stroke });   
		}
	}
}
//}}}
function save_setup_box() {//{{{
	// There's a single box for multiple forms
	// so we need to find out which form is submitted

	if ($("#general_setup").val() != null) { 
		change_floor();
		floor_zorig=parseInt($("#floor_zorig").val());
		default_door_dimz=parseInt($("#default_door_dimz").val());
		default_door_width=parseInt($("#default_door_width").val());
		default_floor_dimz=parseInt($("#default_floor_dimz").val());
		legend();
	} 

	if ($("#geom_properties").val() != null) { 
		var geom={
			floor: floor,
			name: $("#alter_name").val(),
			letter: $("#alter_letter").val(),
			type: gg[letter].t,
			is_exit: $("#alter_is_exit").val(),
			dimz: parseInt($("#alter_dimz").val()),
			mvent_offsetz: parseInt($("#alter_mvent_offsetz").val()),
			mvent_throughput: parseInt($("#alter_mvent_throughput").val()),
			rr:{
				x0: parseInt($("#alter_x0").val()),
				y0: parseInt($("#alter_y0").val()),
				x1: parseInt($("#alter_x0").val())+parseInt($("#alter_dimx").val()),
				y1: parseInt($("#alter_y0").val())+parseInt($("#alter_dimy").val())
			}
		};
		db({"name":$("#alter_name").val()}).remove();
		updateSvgElem(geom);
		updateExitDoor(geom);
		geom=rrRecalculate(geom);
		DbInsert(geom);
	} 
	save_setup_box_underlay();

}
//}}}
function make_setup_box() {//{{{
	d3.select('view2d').append('setup-box');
	$('show-setup-box').click(function() {
		help_into_setup_box();
		$('setup-box').fadeIn();
	});

	$('setup-box').mouseleave(function() {
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
function create_self_props(self, letter) {//{{{
	self.rr={};
	self.floor=floor;
	self.letter=letter;
	self.type=gg[letter].t;
	self.name=gg[letter].x+counter;
	self.mvent_offsetz=0;
	self.mvent_throughput=0;
	self.is_exit='';
	if (self.type=='door') {
		self.dimz=default_door_dimz;
		self.is_exit='exit_auto';
	} else if (self.type=='mvent') {
		self.dimz=50
	} else { 
		self.dimz=default_floor_dimz;
	}
}
//}}}
function new_geom(letter) {//{{{
	// After a letter is clicked we react to mouse events
	// The most tricky scenario is when first mouse click happens before mousemove.
	// geom.rr.x0 & friends are temporary -- we don't want to recalculate min, max, width, heigh on every mouse drag
	// geom.x0 & friends are for db and some svg operations
	counter++;
	var mouse;
	var after_click=0;
	var mx, my;
	var self = this;
	create_self_props(self, letter);
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
			counter--;
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
function open3dview() {//{{{
	$.getScript("js/xeogl.min.js", function(){
		view3d();
	});
}
//}}}
function output_json() {//{{{
	// Instead of JSON.stringify we prefer our own pretty formatting.
	var json=[];
	for(var f=0; f<floors_count; f++) { 
		var geoms=[];
		for(var letter in gg) {
			var x=db({"floor": f, "letter": letter}).select("cad_json");
			var num_data=[];
			for (var r in x) { 
				num_data.push("\t\t\t"+x[r]);
			}
			var geom='';
			geom+='\t\t"'+gg[letter].xx+'": [';
			if(num_data.length>0) { 
				geom+="\n"+num_data.join(",\n");
				geom+='\n\t\t]';
			} else {
				geom+=' ]';
			}
			geoms.push(geom);
		}
		var ff='';
		ff+='\t"'+f+'": {\n';
		ff+=geoms.join(",\n");
		ff+='\n\t}';
		json.push(ff);
	}
	var pretty_json="{\n"+json.join(",\n")+"\n}\n";
	download("cad.json", pretty_json);
}
function download(filename, text) {//{{{
    var pom = document.createElement('a');
    pom.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    pom.setAttribute('download', filename);

    if (document.createEvent) {
        var event = document.createEvent('MouseEvents');
        event.initEvent('click', true, true);
        pom.dispatchEvent(event);
    }
    else {
        pom.click();
    }
}
//}}}
//}}}
function site() { //{{{
	gg=make_gg();
	d3.select('body').append('view3d');
	d3.select('body').append('view2d');
	d3.select('view2d').append('show-setup-box').html("[setup]");
	d3.select('view2d').append('legend');
	svg = d3.select('view2d').append('svg').attr("id", "svg").attr("width", canvas[0]).attr("height", canvas[1]);
	svg.append("filter").attr("id", "invertColorsFilter").append("feColorMatrix").attr("values", "-1 0 0 0 1 0 -1 0 0 1 0 0 -1 0 1 0 0 0 1 0");
	svg.append("text").attr("x",50).attr("y",80).attr("id", "floor_text").text("floor "+floor);
	axes();
	g_aamks = svg.append("g").attr("id", "g_aamks");
	g_floor = g_aamks.append("g").attr("id", "floor0").attr("class", "g_floor").attr('fill-opacity',gg_opacity);
	g_snap_lines = svg.append("g").attr("id", "g_snap_lines");
	svg.append('circle').attr('id', 'snapper').attr('cx', 100).attr('cy', 100).attr('r',30).attr('fill-opacity', 0).attr('fill', "#ff8800");
	legend();
	make_setup_box();
	canvas_zoomer();
	keyboard_events();
	geom_select_deselect();
}
//}}}

});
