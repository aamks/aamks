$(function()  { 

// globals//{{{
	var canvas=[screen.width*0.99,screen.height-250];
	var db=TAFFY(); // http://taffydb.com/working_with_data.html
	var selected_rect='';
	var zt={'x':0, 'y':0, 'k':1}; // zoom transform
	var gg=make_gg();
	var svg;
	var counter=0;
	var g_aamks;
	var g_snap_lines;
	var ax={};
	var snap_dist=15;
	var snap_lines={};
	var door_dimz=200;
	var door_width=90;
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
		ROOM : { l: "r" , c: "#729fcf" },
		COR  : { l: "c" , c: "#3465a4" },
		DOOR : { l: "d" , c: "#73d216" },
		HOLE : { l: "z" , c: "#c4a000" },
		WIN  : { l: "w" , c: "#cc0000" },
		STAI : { l: "s" , c: "#5c3566" },
		HALL : { l: "a" , c: "#ad7fa8" },
		ClosD: { l: "q" , c: "#fce94f" },
		ElktD: { l: "e" , c: "#ce5c00" },
		VVNT : { l: "v" , c: "#ef2929" }
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
			if (e.key == gg[key].l) { create_rect(gg[key].c, gg[key].l); }
		}
	});

	$(this).keydown((e) => { 
		if (e.key == 'Shift') { 
			$("#zoomer").attr("visibility", "visible");
		}
	});

	$(this).keyup((e) => { 
		if (e.key == 'Shift') { 
			$("#zoomer").attr("visibility", "hidden");
		}
	});

//}}}
// select //{{{
	$('body').click(function(evt){
		var not_geoms_arr=['svg', 'g_snap_lines', 'g_aamks', 'zoomer', 'img', 'setup-box'];
		if (evt.target.id != '' && ! not_geoms_arr.includes(evt.target.id)) { 
			d3.selectAll('rect').attr('fill-opacity', 0.4);
			$("#"+evt.target.id).attr('fill-opacity', 0.1);
			selected_rect=evt.target.id;
			show_selected_properties(selected_rect);
		}
		if (evt.target.id != '' && not_geoms_arr.includes(evt.target.id)) { 
			d3.selectAll('rect').attr('fill-opacity', 0.4);
			selected_rect=''
			$('setup-box').fadeOut(0);
		}
	});

	$(this).keypress((e) => { 
		if (e.key == 'x' && selected_rect != "") { 
			$("#"+selected_rect).remove();
			db({"name":selected_rect}).remove();
			make_snap_lines();
		}
	});
	//}}}
function show_selected_properties(selected_rect) {//{{{
	d3.select('setup-box').html(
		"<table>"+
		"<tr><td>name <td><input id=alter_name type=hidden value="+db({'name':selected_rect}).select("name")[0]+">"+db({'name':selected_rect}).select("name")[0]+
		"<tr><td>x0	<td>"+db({'name':selected_rect}).select("x0")[0]+
		"<tr><td>y0	<td>"+db({'name':selected_rect}).select("y0")[0]+
		"<tr><td>x-dim<td>"+db({'name':selected_rect}).select("width")[0]+
		"<tr><td>y-dim<td>"+db({'name':selected_rect}).select("depth")[0]+
		"<tr><td>z-dim<td><input id=alter_dimz type=text size=3 value="+db({'name':selected_rect}).select("height")[0]+">"+
		"</table>"
		);
	$('setup-box').fadeIn();
}
//}}}
	function make_snap_lines() { //{{{
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
		for(var key in gg) {
			$('legend').append("<div class=legend style='background-color: "+gg[key].c+"'>"+gg[key].l+" "+key+"</div>");
		}
	}

//}}}
	function db_insert(geom) { //{{{
		var lines=[];
		x0 = Math.min(Math.round(geom.rr.x0), Math.round(geom.rr.x1));
		x1 = Math.max(Math.round(geom.rr.x0), Math.round(geom.rr.x1));
		y0 = Math.min(Math.round(geom.rr.y0), Math.round(geom.rr.y1));
		y1 = Math.max(Math.round(geom.rr.y0), Math.round(geom.rr.y1));
		lines.push([x0, y0], [x1, y0], [x1, y1], [x0, y1]);
		db.insert({"name": geom.name, "lines": lines, "x0": x0, "y0": y0, "width": x1-x0, "depth": y1-y0, "height": door_dimz });
		var x=db().select("name");
		$("status").html(x.length + " | " + JSON.stringify(x));
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
function rewrite_setup_box() {//{{{
	d3.select('setup-box').html(
		"<table>"+
		"<tr><td>letter + mouse1     <td> create"+
		"<tr><td>shift + mouse2	    <td> zoom/drag"+
		"<tr><td>mouse1 on element<td> properties"+
		"<tr><td>hold ctrl			<td> disable snapping"+ 
		"<tr><td>x	<td> deletes selected"+
		"<tr><td colspan=2 style='text-align: center'><br>Since now"+
		"<tr><td>door's width		<td><input id=door_width type=text size=2   name=door_width  value="+door_width+">"+
		"<tr><td>door's z-dim <td><input id=door_dimz type=text size=2	name=door_dimz value="+door_dimz+">"+
		"<tr><td>room's z-dim <td><input id=floor_dimz type=text size=2 name=floor_dimz value="+floor_dimz+">"+
		"</table>"
		);
}
//}}}
function make_setup_box() {//{{{
	d3.select('body').append('setup-box');
	$('show-setup-box').click(function() {
		$('setup-box').toggle();
		rewrite_setup_box();
	});
	$('setup-box').mouseleave(function() {
		if ($("#door_dimz").val() != null) { 
			door_dimz=$("#door_dimz").val();
			door_width=$("#door_width").val();
			floor_dimz=$("#floor_dimz").val();
		} else if ($("#alter_dimz").val() != null) { 
			db({"name":$("#alter_name").val() }) .update({ "height": $("#alter_dimz").val() });
		}

		$('setup-box').fadeOut(0);
		rewrite_setup_box();
	});
}
//}}}
function snap_me(m,rect,after_click) {//{{{
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
				if(after_click==1) { 
					rect.rr.x1=p;
				} else {
					rect.rr.x0=p;
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
				if(after_click==1) { 
					rect.rr.y1=p;
				} else {
					rect.rr.y0=p;
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
	function create_rect(color, geom) {//{{{
		// After a letter is clicked we react to mouse events
		// The most tricky scenario is when first mouse click happens before mousemove.

		counter++;
		var mouse;
		var after_click=0;
		var self = this;
		self.rr={};
		self.name=geom+"_"+counter;
		self.rect=g_aamks.append('rect').attr('id', self.name).attr('fill-opacity',0.4).attr('fill', color).attr('stroke-width', 1).attr('stroke', color).attr('class', 'rectangle');
		var mx, my;
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
			snap_me(mouse,self,after_click);
			updateRect();
		});  

		svg.on('mouseup', function() {
			if(self.rr.x0 == self.rr.x1 && self.rr.y0 == self.rr.y1) { 
				$("#"+this.name).remove();
				counter--;
			} else {
				db_insert(self);
				make_snap_lines();
			}
			after_click=0;
			$('#snapper').attr('fill-opacity', 0);
			svg.on('mousedown', null);
			svg.on('mousemove', null);
			svg.on('mouseup', null);
		});

		function updateRect() {  
			if(after_click==0) { return; }
			$("#"+self.name).attr({
				x: Math.min(self.rr.x0   , self.rr.x1) ,
				y: Math.min(self.rr.y0   , self.rr.y1) ,
				width: Math.abs(self.rr.x1 - self.rr.x0) ,
				height: Math.abs(self.rr.y1 - self.rr.y0)
			});   
		}

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
	d3.select('body').append('br');
	d3.select('body').append('status');
}
//}}}

});
