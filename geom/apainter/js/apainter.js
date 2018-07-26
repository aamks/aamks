$(function()  { 
// todo:
// scrollable table
// zoom / translate everywhere
// clear gg_opacity calls
// active floor
// image load/properties

// globals//{{{
	var canvas=[screen.width*0.99,screen.height-180];
	var db=TAFFY(); // http://taffydb.com/working_with_data.html
	var selected_rect='';
	var zt={'x':0, 'y':0, 'k':1}; // zoom transform
	var gg_opacity=0.4;
	var gg=make_gg();
	var droplist_letter='r';
	var svg;
	var floor=0;
	var floor_zorig=0;
	var counter=0;
	var g_aamks;
	var g_snap_lines;
	var ax={};
	var snap_dist=15;
	var snap_lines={};
	var door_dimz=200;
	var door_width=40;
	var floor_dimz=350;
	site();
//}}}
// gg geoms //{{{
function make_gg() {
	// tango https://sobac.com/sobac/tangocolors.htm
	// Aluminium   #eeeeec #d3d7cf #babdb6
	// Butter      #fce94f #edd400 #c4a000
	// Chameleon   #8ae234 #73d216 #4e9a06
	// Orange      #fcaf3e #f57900 #ce5c00
	// Chocolate   #e9b96e #c17d11 #8f5902
	// Sky Blue    #729fcf #3465a4 #204a87
	// Plum        #ad7fa8 #75507b #5c3566
	// Slate       #888a85 #555753 #2e3436
	// Scarlet Red #ef2929 #cc0000 #a40000

	return {
		ROOM : { x: "ROOM"  , t: "room"   , l: "r" , c: "#729fcf" } ,
		COR  : { x: "COR"   , t: "room"   , l: "c" , c: "#3465a4" } ,
		D	 : { x: "DOOR"  , t: "door"   , l: "d" , c: "#73d216" } ,
		HOLE : { x: "HOLE"  , t: "hole"   , l: "z" , c: "#c4a000" } ,
		W	 : { x: "WIN"   , t: "window" , l: "w" , c: "#bbbbff" } ,
		STAI : { x: "STAI"  , t: "room"   , l: "s" , c: "#5c3566" } ,
		HALL : { x: "HALL"  , t: "room"   , l: "a" , c: "#e9b96e" } ,
		C	 : { x: "ClosD" , t: "door"   , l: "q" , c: "#ef2929" } ,
		E	 : { x: "ElktD" , t: "door"   , l: "e" , c: "#ce5c00" } ,
		VVNT : { x: "VVENT" , t: "vvnt"   , l: "v" , c: "#fce94f" } ,
		OBST : { x: "OBST"  , t: "obst"   , l: "t" , c: "#ad7fa8" }
	}
}
//}}}
// zoomer//{{{
	svg.append("rect")
		.attr("id", 'zoomer')
		.attr("width", canvas[0])
		.attr("height", canvas[1])
		.attr("fill", "#ax4400")
		.attr("opacity", 0)
		.attr("pointer-events", "visible")
		.attr("visibility", "hidden")
		.call(d3.zoom()
			.scaleExtent([1 / 10, 40])
			.filter(function(){
			return ( event.button === 0 ||
					 event.button === 1);
			})
			.translateExtent([[-10000, -10000], [10000 , 10000]])
			.on("zoom", zoomed));
	function zoomed() {
		g_aamks.attr("transform", d3.event.transform);
		zt = d3.event.transform;
		ax.gX.call(ax.xAxis.scale(d3.event.transform.rescaleX(ax.x)));
		ax.gY.call(ax.yAxis.scale(d3.event.transform.rescaleY(ax.y)));

	}
//}}}
// image//{{{
	g_aamks.append("svg:image")
		.attr("id", 'img')
		.attr("x", 0)
		.attr("y", 0)
		.attr("opacity", 0.3)
		.attr("xlink:href", "gfx.jpg");
//}}}
// keyboard//{{{
	$(this).keypress((e) => { 
		for(var key in gg) {
			if (e.key == gg[key].l) { create_rect(gg[key].c, gg[key].l, gg[key].t); }
		}
	});

	$(this).keydown((e) => { 
		if (e.key == 'Shift') { 
			$("#zoomer").attr("visibility", "visible");
		}
	});

	$(this).keydown((e) => { 
		if (e.key == 'f') { 
			alternative_view();
		}
	});

	$(this).keyup((e) => { 
		if (e.key == 'Shift') { 
			$("#zoomer").attr("visibility", "hidden");
		}
	});

	$(this).keypress((e) => { 
		if (e.key == 'g') { 
			properties_names_droplist(droplist_letter);
		}
	});

//}}}
// select //{{{
	$('body').dblclick(function(evt){
		if (evt.target.parentElement.id == 'g_aamks') { 
			if (['0.4', '0.7'].includes($("#"+evt.target.id).attr('fill-opacity'))) {
				selected_rect=evt.target.id;
				show_selected_properties(selected_rect);
			} else {
				d3.selectAll('rect').attr('fill-opacity', gg_opacity);
				$('setup-box').fadeOut(0);
			}
		} else {
			d3.selectAll('rect').attr('fill-opacity', gg_opacity);
			selected_rect=''
		}
	});

	$(this).keypress((e) => { 
		if (e.key == 'x' && selected_rect != "") { 
			remove_geom(selected_rect);
		}
	});
	//}}}
function alternative_view() {//{{{
	$("#img").toggle();
	$(".axis").toggle();
	if($("#img").css('display')=='none') {
		gg_opacity=0.7;
	} else {
		gg_opacity=0.4;
	}
	d3.selectAll('rect').attr('fill-opacity', gg_opacity);
}
//}}}
function remove_geom(geom) {//{{{
	$("#"+geom).remove();
	db({"name":geom}).remove();
	geoms_changed();
	$('setup-box').fadeOut(0);
}
//}}}
function properties_names_droplist(letter) {//{{{
	droplist_letter=letter;
	var names='';
	names+='<table>';
	names+="<tr><td>name<td>x0<td>y0<td>dim-x<td>dim-y<td>dim-z";
	var items=db({'letter': letter, 'floor': floor}).select("dimx", "dimy", "dimz", "name", "x0", "y0");
	for (var i in items) { 
		names+="<tr><td class=properties_names_droplist id="+ items[i][3]+ ">"+ items[i][3]+"</td>"+
			"<td>"+items[i][4]+
			"<td>"+items[i][5]+
			"<td>"+items[i][0]+
			"<td>"+items[i][1]+
			"<td>"+items[i][2];
	}
	names+="</table>";


	$('setup-box').html(names);
	$('setup-box').css('display','block');

	$('.properties_names_droplist').click(function() {
		selected_rect=$(this).attr('id');
		show_selected_properties(selected_rect);
	});

}
//}}}
function show_selected_properties(selected_rect) {//{{{
	var stroke=$("#"+selected_rect).css('stroke-width');
	$("#"+selected_rect).css('stroke-width', '10px');
	$("#"+selected_rect).animate({ 'stroke-width': stroke }, 300);

	var letter=db({'name':selected_rect}).select("letter")[0];
	droplist_letter=letter;
	d3.select('setup-box').html(
	    "<input id=alter_type type=hidden value="+db({'name':selected_rect}).select("type")[0]+">"+
	    "<input id=alter_letter type=hidden value="+letter+">"+
		"<table>"+
	    "<tr><td>name <td><input id=alter_name type=hidden value="+db({'name':selected_rect}).select("name")[0]+">"+db({'name':selected_rect}).select("name")[0]+
		"<tr><td>x0	<td>	<input id=alter_x0 type=text size=3 value="+db({'name':selected_rect}).select("x0")[0]+">"+
		"<tr><td>y0	<td>	<input id=alter_y0 type=text size=3 value="+db({'name':selected_rect}).select("y0")[0]+">"+
		"<tr><td>x-dim<td>	<input id=alter_dimx type=text size=3 value="+db({'name':selected_rect}).select("dimx")[0]+">"+
		"<tr><td>y-dim<td>	<input id=alter_dimy type=text size=3 value="+db({'name':selected_rect}).select("dimy")[0]+">"+
		"<tr><td>z-dim<td>  <input id=alter_dimz type=text size=3 value="+db({'name':selected_rect}).select("dimz")[0]+">"+
	    "<tr><td>x<td>remove"+
	    "<tr><td>g<td class=more_properties letter="+letter+">more..."+
		"</table>"
		);
	$('setup-box').fadeIn();

	$('.more_properties').click(function() {
		properties_names_droplist($(this).attr('letter'));
	});

}
//}}}
function geoms_changed() { //{{{
	// elems count
	// snap lines
	legend();
	d3.select("#g_snap_lines").selectAll("line").remove();
	var lines=db().select("lines");
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
	$('legend').html("f"+floor+" ");
	for(var key in gg) {
		var x=db({"letter": gg[key]['l']}).select("name");
		$('legend').append("<div class=legend letter="+gg[key].l+" id=legend_"+gg[key].l+" style='background-color: "+gg[key].c+"'>"+gg[key].l+" "+gg[key].x+" ("+x.length+")</div>");
	}
	$('legend').append("<write>[cad.json]</write>");

	$('write').click(function() {
		output_json();
	});

	$('.legend').click(function() {
		properties_names_droplist($(this).attr('letter'));
	});

}

//}}}
function db_insert(geom) { //{{{
	var lines=[];
	x0 = Math.min(Math.round(geom.rr.x0), Math.round(geom.rr.x1));
	x1 = Math.max(Math.round(geom.rr.x0), Math.round(geom.rr.x1));
	y0 = Math.min(Math.round(geom.rr.y0), Math.round(geom.rr.y1));
	y1 = Math.max(Math.round(geom.rr.y0), Math.round(geom.rr.y1));
	if(geom.type=='room') {
		lines.push([x0, y0], [x1, y0], [x1, y1], [x0, y1]);
	} else {
		lines.push([-10000, -10000], [-10000, -10000], [-10000, -10000], [-10000, -10000]);
	}
	var cad_json=`[[ ${x0}, ${y0}, ${floor_zorig} ], [ ${x1}, ${y1}, ${dimz} ]]`; 
	db.insert({ "name": geom.name, "cad_json": cad_json, "letter": geom.letter, "type": geom.type, "lines": lines, "x0": x0, "y0": y0, "dimx": x1-x0, "dimy": y1-y0, "dimz": geom.dimz, "floor": floor });
	selected_rect=geom.name;
	show_selected_properties(geom.name);
	geoms_changed();
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
		.ticks(10)
		.tickSize(canvas[1])
		.tickPadding(8 - canvas[1]);

	ax.yAxis = d3.axisRight(ax.y)
		.ticks(4)
		.tickSize(canvas[0])
		.tickPadding(8 - canvas[0]);

	ax.gX = svg.append("g")
		.attr("class", "axis axis--x")
		.call(ax.xAxis);

	ax.gY = svg.append("g")
		.attr("class", "axis axis--y")
		.call(ax.yAxis);
}
//}}}
function help_into_setup_box() {//{{{
	d3.select('setup-box').html(
		"<table>"+
		"<tr><td>letter + mouse1     <td> create"+
		"<tr><td>shift + mouse2	    <td> zoom/drag"+
		"<tr><td>double mouse1		<td> elem properties"+
		"<tr><td>hold ctrl			<td> disable snapping"+ 
		"<tr><td>f	<td> alternative view"+ 
		"<tr><td>x	<td> deletes selected"+
		"<tr><td>g	<td> list all of active type"+
		"<tr><td colspan=2 style='text-align: center'><br>since now"+
		"<tr><td>floor		  <td><input id=floor type=text size=4   name=floor value="+floor+">"+
		"<tr><td>floor's z-origin <td><input id=floor_zorig type=text size=4   name=floor_zorig value="+floor_zorig+">"+
		"<tr><td>door's width <td><input id=door_width type=text size=4   name=door_width  value="+door_width+">"+
		"<tr><td>door's z-dim <td><input id=door_dimz type=text size=4	name=door_dimz value="+door_dimz+">"+
		"<tr><td>room's z-dim <td><input id=floor_dimz type=text size=4 name=floor_dimz value="+floor_dimz+">"+
		"</table>"
		);
}
//}}}
function save_and_fadeout_properties() {//{{{
	if ($("#door_dimz").val() != null) { 
		floor=parseInt($("#floor").val());
		floor_zorig=parseInt($("#floor_zorig").val());
		door_dimz=parseInt($("#door_dimz").val());
		door_width=parseInt($("#door_width").val());
		floor_dimz=parseInt($("#floor_dimz").val());
		legend();
	} else if ($("#alter_dimz").val() != null) { 
		var geom={
			name: $("#alter_name").val(),
			letter: $("#alter_letter").val(),
			type: $("#alter_type").val(),
			dimz: $("#alter_dimz").val(),
			rr:{
				x0: $("#alter_x0").val(),
				y0: $("#alter_y0").val(),
				x1: parseInt($("#alter_x0").val())+parseInt($("#alter_dimx").val()),
				y1: parseInt($("#alter_y0").val())+parseInt($("#alter_dimy").val())
			}
		};
		db({"name":$("#alter_name").val()}).remove();
		updateSvgRect(geom);
		db_insert(geom);

	}

	$('setup-box').fadeOut(0);
}
//}}}
function make_setup_box() {//{{{
	d3.select('body').append('setup-box');
	$('show-setup-box').click(function() {
		help_into_setup_box();
		$('setup-box').toggle();
	});
	$('setup-box').mouseleave(function() {
		save_and_fadeout_properties();
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
		rect.rr.y0-=4;
		rect.rr.y1+=4;
	} else {
		rect.rr.x0+=4;
		rect.rr.x1-=4;
	}
	return rect;
}
//}}}
function snap_basic(m,rect,after_click) {//{{{
	d3.selectAll('.snap_v').attr('visibility', 'hidden');
	d3.selectAll('.snap_h').attr('visibility', 'hidden');
	$('#snapper').attr('fill-opacity', 0);
	if (event.ctrlKey) {
		return;
	} 
	var vh_snap=[];

	for(var point in snap_lines['vert']) {
		p=snap_lines['vert'][point];
		if (	
			m[0] > p - snap_dist &&
			m[0] < p + snap_dist ) { 
				if (rect.type=='room') { 
					if(after_click==1) { 
						rect.rr.x1=p;
					} else {
						rect.rr.x0=p;
					}
				} else {
					if(after_click==1) { 
						rect.rr.x1=p+4;
					} else {
						rect.rr.x0=p-4;
					}
				}
				$("#sv_"+p).attr("visibility", "visible");
				$('#snapper').attr('fill-opacity', 1).attr({ r: 2, cy: m[1], cx: p });
				vh_snap.push(p);
				break;
		}
	}

	for(var point in snap_lines['horiz']) {
		p=snap_lines['horiz'][point];
		if (	
			m[1] > p - snap_dist &&
			m[1] < p + snap_dist ) { 
				if (rect.type=='room') { 
					if(after_click==1) { 
						rect.rr.y1=p;
					} else {
						rect.rr.y0=p;
					}
				} else {
					if(after_click==1) { 
						rect.rr.y1=p-4;
					} else {
						rect.rr.y0=p+4;
					}
				}
				$("#sh_"+p).attr("visibility", "visible");
				$('#snapper').attr('fill-opacity', 1).attr({ r: 2, cx: m[0], cy: p });
				vh_snap.push(p);
				break;
		}
	}
	if(vh_snap.length==2) { 
		$('#snapper').attr({ r: 5, cx: vh_snap[0], cy: vh_snap[1]});
	}
}

//}}}
function snap_door(m,rect,after_click) {//{{{
	d3.selectAll('.snap_v').attr('visibility', 'hidden');
	d3.selectAll('.snap_h').attr('visibility', 'hidden');
	$('#snapper').attr('fill-opacity', 0);
	if (event.ctrlKey) {
		return;
	} 
	var vh_snap=[];

	for(var point in snap_lines['vert']) {
		p=snap_lines['vert'][point];
		if (	
			m[0] > p - snap_dist &&
			m[0] < p + snap_dist ) { 
				rect.rr.x0=p-4;
				rect.rr.x1=p+4;
				rect.rr.y0=m[1];
				rect.rr.y1=m[1]-door_width;
				$("#sv_"+p).attr("visibility", "visible");
				$('#snapper').attr('fill-opacity', 1).attr({ r: 2, cy: m[1], cx: p });
				vh_snap.push(p);
				return;
		}
	}

	for(var point in snap_lines['horiz']) {
		p=snap_lines['horiz'][point];
		if (	
			m[1] > p - snap_dist &&
			m[1] < p + snap_dist ) { 
				rect.rr.y0=p-4;
				rect.rr.y1=p+4;
				rect.rr.x0=m[0];
				rect.rr.x1=m[0]+door_width;
				$("#sh_"+p).attr("visibility", "visible");
				$('#snapper').attr('fill-opacity', 1).attr({ r: 2, cx: m[0], cy: p });
				vh_snap.push(p);
				return;
		}
	}
	//if(vh_snap.length==2) { 
	//	$('#snapper').attr({ r: 5, cx: vh_snap[0], cy: vh_snap[1]});
	//}
}

//}}}
function create_self_props(self, color, gg_type, letter) {//{{{
	self.rr={};
	self.type=gg_type;
	self.letter=letter;
	self.name=letter+counter;
	if (self.type=='door') {
		self.dimz=door_dimz;
	} else { 
		self.dimz=floor_dimz;
	}

	if (['room', 'obst', 'window'].includes(self.type)) { 
		self.rect=g_aamks.append('rect').attr('id', self.name).attr('fill-opacity',gg_opacity).attr('fill', color).style('stroke-width', 1).attr('stroke', '#fff').attr('class', 'g_rect');
	} else { 
		self.rect=g_aamks.append('rect').attr('id', self.name).attr('fill-opacity',gg_opacity).attr('fill', color).style('stroke-width', 0).attr('stroke', '#fff').attr('class', 'g_rect');
	}
}
//}}}
function create_rect(color, letter, gg_type) {//{{{
	// After a letter is clicked we react to mouse events
	// The most tricky scenario is when first mouse click happens before mousemove.
	d3.selectAll('rect').attr('fill-opacity', gg_opacity);
	counter++;
	var mouse;
	var after_click=0;
	var mx, my;
	var self = this;
	create_self_props(self, color, gg_type, letter);
	
	$('setup-box').fadeOut(0);
	svg.on('mousedown', function() {
		after_click=1;
	});

	svg.on('mousemove', function() {
		mouse=d3.mouse(this);
		mx=(mouse[0]-zt.x)/zt.k;
		my=(mouse[1]-zt.y)/zt.k;
		if (after_click==0) { 
			self.rr = { 'x0': mx, 'y0': my, 'x1': mx, 'y1': my };
		}
		else if (after_click==1 && self.rr.x0 == null) { 
			self.rr = { 'x0': mx, 'y0': my };
		}
		self.rr.x1=mx;
		self.rr.y1=my;
		if(['room', 'hole', 'window'].includes(gg_type)) { 
			snap_basic(mouse,self,after_click);
		} else if(['door'].includes(gg_type)) {
			snap_door(mouse,self,after_click);
		}
		if(after_click==1) { updateSvgRect(self); } // todo: is not always respected
	});  

	svg.on('mouseup', function() {
		svg.on('mousedown', null);
		svg.on('mousemove', null);
		svg.on('mouseup', null);
		if(self.rr.x0 == self.rr.x1 || self.rr.y0 == self.rr.y1) { 
			$("#"+this.name).remove();
			counter--;
		} else {
			if (['hole', 'window'].includes(self.type)) { self=fix_hole_offset(self); }
			updateSvgRect(self);
			db_insert(self);
		}
		after_click=0;
		$('#snapper').attr('fill-opacity', 0);
	});


}
//}}}
function updateSvgRect(geom) {  //{{{
	$("#"+geom.name).attr({
		x: Math.min(geom.rr.x0   , geom.rr.x1) ,
		y: Math.min(geom.rr.y0   , geom.rr.y1) ,
		width: Math.abs(geom.rr.x1 - geom.rr.x0) ,
		height: Math.abs(geom.rr.y1 - geom.rr.y0)
	});   
}
//}}}
function site() { //{{{
	d3.select('body').append('show-setup-box').html("[setup]");
	d3.select('body').append('legend');
	svg = d3.select('body').append('svg').attr("id", "svg").attr("width", canvas[0]).attr("height", canvas[1]);
	axes();
	g_aamks = svg.append("g").attr("id", "g_aamks");
	g_snap_lines= svg.append("g").attr("id", "g_snap_lines");
	svg.append('circle').attr('id', 'snapper').attr('cx', 100).attr('cy', 100).attr('r',5).attr('fill-opacity', 0).attr('fill', "#ff8800");
	legend();
	make_setup_box();
}
//}}}
function output_json() {//{{{
	// Instead of JSON.stringify we prefer our own pretty formatting.
	var json=[];
	for(var f=0; f<=floor; f++) { 
		var geoms=[];
		for(var key in gg) {
			var x=db({"floor": f, "letter": gg[key]['l']}).select("cad_json");
			var num_data=[];
			for (var r in x) { 
				num_data.push("\t\t\t"+x[r]);
			}
			var geom='';
			geom+='\t\t"'+key+'": [';
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
	console.log(pretty_json);
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

});
