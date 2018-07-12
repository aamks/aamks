$(function()  { 
	var canvas=[1100,600];
	var names=[];
	var colors={ ROOM:"#006694" , COR:"#002244" , D:"#888800" , HALL:"#00300a" , W:"#55aaff" , HOLE:"#008800" , STAI:"#280033" , C:"#883d00"  , E:"#660000" , VNT:"#aa00aa"   };
	var letters={ ROOM:"r"      , COR:"q"       , D:"d"       , HALL:"a"       , W:"w"       , HOLE:"x"       , STAI:"s"       , C:"c"        , E:"e"       , VNT:"v" };
	var anames={ ROOM:"Room"    , COR:"Corr"    , D:"Door"    , HALL:"Hall"    , W:"Win"     , HOLE:"Hole"    , STAI:"Stair"   , E:"D.Electr" , C:"D.Closr" , VNT:"Vvent"   };

	var geom_counter=0;
	var collator = new Intl.Collator(undefined, {numeric: true, sensitivity: 'base'});
	d3.select('body').append('nav');
	d3.select('body').append('legend');
	var svg = d3.select('body').append('svg').attr("width", canvas[0]).attr("height", canvas[1]);
	var g = svg.append("g");
	make_legend();

// zoomer//{{{
	svg.append("rect")
		.attr("id", 'zoomer')
		.attr("width", canvas[0])
		.attr("height", canvas[1])
		.attr("fill", "#aa4400")
		.attr("opacity", 0)
		.attr("pointer-events", "visible")
		.attr("visibility", "hidden")
		.call(d3.zoom()
			.scaleExtent([1 / 2, 4])
			.filter(function(){
			return (event.button === 0 ||
					  event.button === 1);
			})
			.on("zoom", zoomed));
	function zoomed() {
		  g.attr("transform", d3.event.transform);
	}
//}}}
// image//{{{
	g.append("svg:image")
		.attr("id", 'img')
		.attr("x", 0)
		.attr("y", 0)
		.attr("opacity", 0.3)
		.attr("xlink:href", "/apainter/gfx.jpg");
//}}}
// keyboard//{{{
	$(this).keypress((e) => { 
		for(var key in letters) {
			if (e.key == letters[key]) { rectCreate(colors[key], letters[key]); }
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
	function update_nav(geom) { //{{{
		geom_counter++;
		name=geom+"_"+geom_counter;
		names.push(name);
		names.sort(collator.compare);
		$("nav").html('');
		for (var i in names) { 
			$("nav").append("<name data-id="+names[i]+">"+names[i]+"</name><br>");
		}
		return name;
	}
//}}}

	$('body').click(function(evt){
		if (evt.target.id != '' && evt.target.id != 'zoomer') { 
			d3.selectAll('rect').style('fill-opacity', 0.4);
			$("#"+evt.target.id).css('fill-opacity', 0.1);
		}
	});
	
	function rectCreate(color, geom) {//{{{
		var self = this;
		var mouse;

		svg.on('mousedown', function() {
			mouse=d3.mouse(this);
			name=update_nav(geom);
			self.name = name
			self.rectData = [ { x: mouse[0], y: mouse[1] }, { x: mouse[0], y: mouse[1] } ];
			self.rect=g.append('rect').attr('id', name).attr('fill-opacity',0.4).attr('fill', color).attr('stroke-width', 1).attr('stroke', color).attr('class', 'rectangle');

			svg.on('mousemove', function() {
				mouse = d3.mouse(this);
				self.rectData[1] = { x: mouse[0], y: mouse[1] };
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

	function make_legend() { //{{{
		for(var key in colors) {
			$('legend').append("<div class=legend style='background-color: "+colors[key]+"'>"+letters[key]+" "+anames[key]+"</div>");
		}
		$('legend').append(" ctrl+middlemouse: zoom/drag, letters to draw");
	}

//}}}
//}}}

});
