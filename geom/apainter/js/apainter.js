$(function()  { 
	var names=[];
	var colors={ ROOM:"#282828" , D:"#888800" , COR:"#002233" , HALL:"#00300a" , W:"#006aa4" , HOLE:"#008800" , STAI:"#280033" , VNT:"#aa00aa" , C:"#883d00"  , E:"#660000"    };
	var letters={ ROOM:"r"      , D:"d"       , COR:"q"       , HALL:"a"       , W:"w"       , HOLE:"x"       , STAI:"s"       , VNT:"v"       , C:"c"        , E:"e" };
	var anames={ ROOM:"Room"     , D:"Door"    , COR:"Corr"    , HALL:"Hall"    , W:"Win"     , HOLE:"Hole"    , STAI:"Stair"   , VNT:"Vent"    , E:"D.Electr" , C:"D.Closr" };

	var geom_counter=0;
	var collator = new Intl.Collator(undefined, {numeric: true, sensitivity: 'base'});
	d3.select('body').append('nav');
	d3.select('body').append('legend');
	make_legend();
	var svg = d3.select('body').append('svg').attr("width", 1200).attr("height", 600);
	var g = svg.append("g");

// zoomer//{{{
	svg.append("rect")
		.attr("id", 'zoomer')
		.attr("width", 1200)
		.attr("height", 600)
		.style("fill", "none")
		.style("pointer-events", "all")
		.call(d3.zoom()
			.scaleExtent([1 / 2, 4])
			.on("zoom", zoomed));
	function zoomed() {
		  g.attr("transform", d3.event.transform);
	}
//}}}
	function make_legend() { //{{{
		for(var key in colors) {
			$('legend').append("<div class=legend style='background-color: "+colors[key]+"'>"+letters[key]+" "+anames[key]+"</div>");
		}
	}

//}}}

	$(this).keypress((e) => { //{{{
		for(var key in letters) {
			if (e.key == letters[key]) { rectCreate(colors[key], letters[key]); }
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
		console.log("id", evt.target.id);
		// if (evt.target.id != 'zoomer') { 
		// 	$("#"+evt.target.id).css('opacity', 0.2);
		// }
	});
	
	svg.on('mouseup', function() {
		svg.on('mousedown', null);
		svg.on('mousemove', null);
		$("#zoomer").css("pointer-events", "all");
	});
	
	function rectCreate(color, geom) {//{{{
		var self = this;
		var mouse;
		$("#zoomer").css("pointer-events", "none");

		svg.on('mousedown', function() {
			mouse=d3.mouse(this);
			name=update_nav(geom);
			self.name = name
			self.rectData = [ { x: mouse[0], y: mouse[1] }, { x: mouse[0], y: mouse[1] } ];
			d3.selectAll('rect').style('opacity', 0.4);
			self.rect=g.append('rect').attr('id', name).attr('opacity', 0.4).attr('fill', color).attr('class', 'rectangle');

			svg.on('mousemove', function() {
				mouse = d3.mouse(this);
				self.rectData[1] = { x: mouse[0], y: mouse[1] };
				updateRect();
			});  
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

});
