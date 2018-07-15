$(function()  { 
	var canvas=[screen.width*0.99,screen.height-300];
	var db=TAFFY(); // http://taffydb.com/working_with_data.html
	var selected_rect='';
	var zt={'x':0, 'y':0, 'k':1}; // zoom transform
	var gg=make_gg();
	var svg;
	var counter=0;
	var g_aamks;
	var g_snap_lines;
	var ax={};
	var snap_dist=20;
	var snap_lines={};
	site();

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
		COR  : { l: "q" , c: "#3465a4" },
		DOOR : { l: "d" , c: "#fce94f" },
		HOLE : { l: "z" , c: "#e9b96e" },
		WIN  : { l: "w" , c: "#cc0000" },
		STAI : { l: "s" , c: "#5c3566" },
		HALL : { l: "a" , c: "#ad7fa8" },
		ClosD: { l: "c" , c: "#8f5902" },
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
			return (event.button === 0 ||
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
			if (e.key == gg[key].l) { rect_create(gg[key].c, gg[key].l); }
		}
	});

	$(this).keydown((e) => { 
		if (e.key == 'Control') { 
			$("#zoomer").attr("visibility", "visible");
		}
	});

	$(this).keyup((e) => { 
		if (e.key == 'Control') { 
			$("#zoomer").attr("visibility", "hidden");
		}
	});

//}}}
// selected //{{{
	$('body').click(function(evt){
		if (evt.target.id != '' && ( evt.target.id != 'g_snap_lines' && evt.target.id != 'g_aamks' && evt.target.id != 'zoomer' && evt.target.id != 'img' )) { 
			d3.selectAll('rect').attr('fill-opacity', 0.4);
			$("#"+evt.target.id).attr('fill-opacity', 0.1);
			selected_rect=evt.target.id;
			var x=db({'name':selected_rect}).select("name", "id", "geom", "x", "y");
			$("status").html("INFO: "+JSON.stringify(x));
			console.log("selected", selected_rect);
		}
		if (evt.target.id != '' && ( evt.target.id == 'zoomer' || evt.target.id == 'img' )) { 
			d3.selectAll('rect').attr('fill-opacity', 0.4);
			selected_rect=''
		}
	});

	$(this).keypress((e) => { 
		if (e.key == 'x' && selected_rect != "") { 
			$("#"+selected_rect).remove();
			db({"name":selected_rect}).remove();
		}
	});
	//}}}
	function make_snap_lines() { //{{{
		var lines=db().select("lines");
		snap_lines['horiz']=[];
		snap_lines['vert']=[];

		for(var points in lines) { 
			snap_lines['horiz'].push(lines[points][0][1]);
			snap_lines['horiz'].push(lines[points][2][1]);
			snap_lines['vert'].push(lines[points][0][0]);
			snap_lines['vert'].push(lines[points][1][0]);
		}
		snap_lines['horiz']=Array.from(new Set(snap_lines['horiz']));
		snap_lines['vert']=Array.from(new Set(snap_lines['vert']));
	}
//}}}
	function show_snap_lines() { //{{{
		d3.select("#g_snap_lines").selectAll("line").remove();
		for(var i in snap_lines['vert']) { 
			co=snap_lines['vert'][i];
			g_snap_lines.append('line').attr('id', 'vert_'+i).attr('class', 'snap_lines').attr('x1', co).attr('x2', co).attr('y1', -1000).attr('y2', 1000);
		}
		for(var i in snap_lines['horiz']) { 
			co=snap_lines['horiz'][i];
			g_snap_lines.append('line').attr('id', 'horiz_'+i).attr('class', 'snap_lines').attr('y1', co).attr('y2', co).attr('x1', -1000).attr('x2', 1000);
		}
	}
//}}}
	function rect_create(color, geom) {//{{{
		var self = this;
		var mouse;

		svg.on('mousedown', function() {
			mouse=d3.mouse(this);
			var x0=(mouse[0]-zt.x)/zt.k;
			var y0=(mouse[1]-zt.y)/zt.k;
			self.name=geom+"_"+counter;
			counter++;
			self.rr = { 'x0': x0, 'y0': y0, 'x1': x0, 'y1': y0 };
			self.rect=g_aamks.append('rect').attr('id', self.name).attr('fill-opacity',0.4).attr('fill', color).attr('stroke-width', 1).attr('stroke', color).attr('class', 'rectangle');
			intersectRect(mouse,self,'x0');

			svg.on('mousemove', function() {
				mouse = d3.mouse(this);
				self.rr.x1=(mouse[0]-zt.x)/zt.k;
				self.rr.y1=(mouse[1]-zt.y)/zt.k;
				intersectRect(mouse,self,'x1');
				updateRect();
			});  
		});

		function updateRect() {  
			$("#"+self.name).attr({
				x: Math.min(self.rr.x0   , self.rr.x1) ,
				y: Math.min(self.rr.y0   , self.rr.y1) ,
				x1: Math.max(self.rr.x0  , self.rr.x1) ,
				y1: Math.max(self.rr.y0  , self.rr.y1) ,
				width: Math.abs(self.rr.x1 - self.rr.x0) ,
				height: Math.abs(self.rr.y1 - self.rr.y0)
			});   
		}

		svg.on('mouseup', function() {
			svg.on('mousedown', null);
			svg.on('mousemove', null);
			db_insert(self);
			make_snap_lines();
			show_snap_lines();
		});

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
		lines.push([geom.rr.x0, geom.rr.y0], [geom.rr.x1, geom.rr.y0], [geom.rr.x1, geom.rr.y1], [geom.rr.x0, geom.rr.y1]);
		db.insert({"name": geom.name, "lines": lines });
		var x=db().select("name", "lines");
		$("status").html(JSON.stringify(x));
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
function make_setup_box() {//{{{
	$('show-setup-box').click(function() {
		$('setup-box').toggle(400);
	});
	d3.select('body').append('setup-box').html("				\
		<table>													\
		<tr><td>letter + mouse1 <td> create						\
		<tr><td>ctrl + mouse2	    <td> zoom/drag              \
		<tr><td>x				    <td> deletes selected       \
		<tr><td>hold shift			<td> disable snapping       \
		</table>                                                \
		");
}
//}}}
function site() { //{{{
	d3.select('body').append('show-setup-box').html("[help]");
	d3.select('body').append('legend');
	d3.select('body').append('logger').html("logger");
	svg = d3.select('body').append('svg').attr("width", canvas[0]).attr("height", canvas[1]);
	axes();
	g_aamks = svg.append("g").attr("id", "g_aamks");
	g_snap_lines= svg.append("g").attr("id", "g_snap_lines");
	svg.append('circle').attr('id', 'snapper').attr('cx', 100).attr('cy', 100).attr('r',5).attr('fill-opacity',1).attr('fill', "#ff8800");
	legend();
	make_setup_box();
	d3.select('body').append('br');
	d3.select('body').append('status');
}
//}}}
// snap //{{{
function intersectRect(m,rect,tt) {
	if (event.shiftKey) {
		$('#snapper').attr('opacity', 0);
		return;
	} 
	$("logger").html(JSON.stringify({m}));
	$('#snapper').attr('opacity', 0);
	var lines=db().select("lines");
	for(var points in lines) {
		for(var p in lines[points]) {
			px=lines[points][p][0]
			py=lines[points][p][1]
			if (	
				m[0] > px - snap_dist &&
				m[0] < px + snap_dist &&
				m[1] > py - snap_dist &&
				m[1] < py + snap_dist ) { 
					$('#snapper').attr('opacity', 1).attr({ cx: px , cy: py });
					if(tt=='x1') { 
						rect.rr.x1=px;
						rect.rr.y1=py;
					} else {
						rect.rr.x0=px;
						rect.rr.y0=py;
					}
					return;
			}
		}
	}
				
}
//}}}

});
