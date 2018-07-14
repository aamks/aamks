$(function()  { 
	var canvas=[screen.width*0.99,screen.height-300];
	var db=TAFFY(); // http://taffydb.com/working_with_data.html
	var selected_rect='';
	var zt={'x':0, 'y':0, 'k':1}; // zoom transform
	var colors={ ROOM:"#006694" , COR:"#002244" , D:"#888800" , HALL:"#00300a" , W:"#55aaff" , HOLE:"#008800" , STAI:"#280033" , C:"#883d00"  , E:"#660000" , VNT:"#aa00aa"   };
	var letters={ ROOM:"r"      , COR:"q"       , D:"d"       , HALL:"a"       , W:"w"       , HOLE:"z"       , STAI:"s"       , C:"c"        , E:"e"       , VNT:"v" };
	var anames={ ROOM:"Room"    , COR:"Corr"    , D:"Door"    , HALL:"Hall"    , W:"Win"     , HOLE:"Hole"    , STAI:"Stair"   , E:"D.Electr" , C:"D.Closr" , VNT:"Vvent"   };
	var svg;
	var counter=0;
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
		.attr("xlink:href", "gfx.jpg");
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

		svg.on('mousedown', function() {
			mouse=d3.mouse(this);
			var x0=(mouse[0]-zt.x)/zt.k;
			var y0=(mouse[1]-zt.y)/zt.k;
			self.name=geom+"_"+counter;
			counter++;
			self.rr = { 'x0': x0, 'y0': y0, 'x1': x0, 'y1': y0 };
			self.rect=g_aamks.append('rect').attr('id', self.name).attr('fill-opacity',0.4).attr('fill', color).attr('stroke-width', 1).attr('stroke', color).attr('class', 'rectangle');

			svg.on('mousemove', function() {
				mouse = d3.mouse(this);
				self.rr.x1=(mouse[0]-zt.x)/zt.k;
				self.rr.y1=(mouse[1]-zt.y)/zt.k;
				updateRect();
			});  
		});

		function updateRect() {  
			$("logger").html(JSON.stringify({mouse})+JSON.stringify(intersectRect(mouse)));

			$("#snapper").attr({
				cx: self.rr.x1 ,
				cy: self.rr.y1 
			});

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
		});

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
		var points=[];
		points.push([geom.rr.x0, geom.rr.y0], [geom.rr.x1, geom.rr.y0], [geom.rr.x1, geom.rr.y1], [geom.rr.x0, geom.rr.y1]);
		db.insert({"name": geom.name, "points": points });
		var x=db().select("name", "points");
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
function site() { //{{{
	d3.select('body').append('legend');
	d3.select('body').append('logger').html("logger");
	svg = d3.select('body').append('svg').attr("width", canvas[0]).attr("height", canvas[1]);
	axes();
	g_aamks = svg.append("g").attr("id", "g_aamks");
	svg.append('circle').attr('id', 'snapper').attr('cx', 100).attr('cy', 100).attr('r',5).attr('fill-opacity',1).attr('fill', "#ff8800");
	legend();
	d3.select('body').append('br');
	d3.select('body').append('status');
}
//}}}

// intersection//{{{
function intersectRect(mouse) {
return 1;
// var r1={"x0": 200, "y0": 200, "x1": 400, "y1": 400};
//   return !(mouse[0] > r1.x1 || 
//            mouse[1] < r1.x0 || 
//            r2.y1 < r1.y0 ||
//            r2.y0 > r1.y1 );
}
//}}}

});
