$(function()  { 
	var canvas=[screen.width*0.99,screen.height-300];
	var db=TAFFY(); // http://taffydb.com/working_with_data.html
	var selected_rect='';
	var zt={'x':0, 'y':0, 'k':1}; // zoom transform
	var colors={ ROOM:"#006694" , COR:"#002244" , D:"#888800" , HALL:"#00300a" , W:"#55aaff" , HOLE:"#008800" , STAI:"#280033" , C:"#883d00"  , E:"#660000" , VNT:"#aa00aa"   };
	var letters={ ROOM:"r"      , COR:"q"       , D:"d"       , HALL:"a"       , W:"w"       , HOLE:"z"       , STAI:"s"       , C:"c"        , E:"e"       , VNT:"v" };
	var anames={ ROOM:"Room"    , COR:"Corr"    , D:"Door"    , HALL:"Hall"    , W:"Win"     , HOLE:"Hole"    , STAI:"Stair"   , E:"D.Electr" , C:"D.Closr" , VNT:"Vvent"   };
	var svg;
	var g_aamks;
	var ax={};
	site();

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
		.attr("xlink:href", "/apainter/gfx.jpg");
//}}}
// keyboard//{{{
	$(this).keypress((e) => { 
		for(var key in letters) {
			if (e.key == letters[key]) { rect_create(colors[key], letters[key]); }
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
		if (evt.target.id != '' && ( evt.target.id != 'g_aamks' && evt.target.id != 'zoomer' && evt.target.id != 'img' )) { 
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
	function rect_create(color, geom) {//{{{
		var self = this;
		var mouse;
		var x0;
		var y0;

		svg.on('mousedown', function() {
			mouse=d3.mouse(this);
			name=db_insert(geom);
			x0=(mouse[0]-zt.x)/zt.k;
			y0=(mouse[1]-zt.y)/zt.k;
			self.name = name
			self.rectData = [ { x: x0, y: y0 }, { x: x0, y: y0 } ];
			self.rect=g_aamks.append('rect').attr('id', name).attr('fill-opacity',0.4).attr('fill', color).attr('stroke-width', 1).attr('stroke', color).attr('class', 'rectangle');

			svg.on('mousemove', function() {
				mouse = d3.mouse(this);
				self.rectData[1] = { x: (mouse[0]-zt.x)/zt.k, y: (mouse[1]-zt.y)/zt.k };
				updateRect();
			});  
		});

		svg.on('mouseup', function() {
			svg.on('mousedown', null);
			svg.on('mousemove', null);
		});

		function updateRect() {  
			$("#"+self.name).attr({
				x: self.rectData[1].x - self.rectData[0].x > 0 ? self.rectData[0].x :  self.rectData[1].x,
				y: self.rectData[1].y - self.rectData[0].y > 0 ? self.rectData[0].y :  self.rectData[1].y,
				width: Math.abs(self.rectData[1].x - self.rectData[0].x),
				height: Math.abs(self.rectData[1].y - self.rectData[0].y)
			});   

		}
	}
//}}}
	function legend() { //{{{
		for(var key in colors) {
			$('legend').append("<div class=legend style='background-color: "+colors[key]+"'>"+letters[key]+" "+anames[key]+"</div>");
		}
		$('legend').append(" ctrl+middlemouse: zoom/drag, letters draw, x deletes selected");
	}

//}}}
	function db_insert(geom) { //{{{
		var next=db({'geom':geom}).max("id") + 1;
		var name=geom+"_"+next;
		db.insert({"id": next, "geom": geom, "name": name, "x": "100.0", "y": "100.0" });
		var x=db().select("name");
		$("status").html(JSON.stringify(x));
		return name; 
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
function site() { //{{{
	d3.select('body').append('legend');
	svg = d3.select('body').append('svg').attr("width", canvas[0]).attr("height", canvas[1]);
	axes();
	g_aamks = svg.append("g").attr("id", "g_aamks");
	legend();
	d3.select('body').append('br');
	d3.select('body').append('status');
}
//}}}


});
