var animsList;
var currentAnimMeta;
var currentAnimData;
var incDB;
var colors;
var wallsSize;
var doorsSize;
var evacueeRadius;
var velocitiesSize;
var eData;
var roomsOpacity;
var dstatic;
var lerps;
var lastFrame=1;
var labelsSize=50;
var sliderPos=0;
var lerpFrame=0;
var frame=0;
var	visContainsAnimation=0;
var	animationIsRunning=0;
var velocitiesGroup={};
var evacueesGroup={};
var evacueesLabelsGroup={};

paper.install(window);
window.onload = function() {
	var nn;
	paper.setup('animator-canvas');
	var tool=new Tool;
	makeAnimationControls();
	nn=new Layer; nn.name='rooms';
	nn=new Layer; nn.name='roomSmoke';
	nn=new Layer; nn.name='roomFire';
	nn=new Layer; nn.name='highlight';
	nn=new Layer; nn.name='animated';
	resizeAndRedrawCanvas();
	left_menu_box();
	right_menu_box();

function listenEvents() {//{{{
	$(window).resize(resizeAndRedrawCanvas);
	$('#labels-size').on('keyup'     , function() { labelsSize=this.value     ; resetCanvas() ; })
	$('#doors-size').on('keyup'      , function() { doorsSize=this.value      ; resetCanvas() ; })
	$('#walls-size').on('keyup'      , function() { wallsSize=this.value      ; resetCanvas() ; })
	$('#evacuee-radius').on('keyup'  , function() { evacueeRadius=this.value  ; resetCanvas() ; })
	$('#velocities-size').on('keyup' , function() { velocitiesSize=this.value ; resetCanvas() ; })

	$('canvas-mouse-coords').click(function() {
		lerps=Math.round(1/(($('#speed').val()/100)+0.00000000000000001))+1; 
		$("canvas-mouse-coords").delay(1500).fadeOut('slow'); 

		_.each(evacueesLabelsGroup, function(e) {
			e.removeChildren();
		});
		animationIsRunning=1;
	});


	$('#animator-canvas').on( 'DOMMouseScroll mousewheel', function ( event ) {
	  if( event.originalEvent.detail > 0 || event.originalEvent.wheelDelta < 0 ) { //alternative options for wheelData: wheelDeltaX & wheelDeltaY
		view.scale(0.95);
	  } else {
		view.scale(1.05);
	  }
	  //prevent page fom scrolling
	  return false;
	});


	$('#style-change').on('change', function() {
		if (this.value == "Light") { 
			doorsSize=0;
			labelsSize=0;
			setColors('light');
		} else {
			labelsSize=$('#labels-size').val();
			doorsSize=$('#doors-size').val();
			setColors('dark');
		}
		resetCanvas();
	});

	$('#highlight-geoms').on('change', function() {
		if(this.value.length>0) { highlightGeom(this.value); }
	});
	$('.canvas_slider_rect').click(function() {
		//evacueesLabelsGroup.removeChildren();
		animationIsRunning=1;
		sliderPos=$(this).data('id');
		lerpFrame=Math.floor(sliderPos*lastFrame*lerps/100);
		frame=Math.floor(lerpFrame/lerps);
		$('.canvas_slider_rect').attr("fill", "#333");
	});
}
//}}}
function right_menu_box() {//{{{
	$('close-right-menu-box').click(function() {
		$('right-menu-box').fadeOut();
		project.layers['highlight'].removeChildren();
	});

	$('button-right-menu-box').click(function() {
		$('right-menu-box').fadeIn();
	});
}
//}}}
function setColors(mode) {//{{{
	colors={};
	for (var i in incDB['aamksGeoms']) {
		if(mode=='dark') { 
			colors[incDB['aamksGeoms'][i]['x']]=incDB['aamksGeoms'][i];
		} else {
			colors[incDB['aamksGeoms'][i]['x']]=incDB['aamksGeoms'][i];
		}
	}
	$("#animator-canvas").css("background-color", colors['canvas']['c']);
}
//}}}
$.getJSON("inc.json", function(x) {//{{{
	incDB=x;
    evacueeRadius=incDB['evacueeRadius'];
	setColors("dark");
	$.post('/aamks/ajax.php?ajaxAnimsList', function (response) { 
		ajax_msg(response);
		animsList=response['data'];
		makeChooseVis();
		currentAnimMeta=animsList[0];
		showStaticImage();
	});
});
//}}}
function makeChooseVis() {//{{{
	// Droplist of anims.json (all registered visualizations)
	var items = [];
	items.push("<select id=choose-vis>");
	for (var i=0; i < animsList.length; i++) { 
		items.push( "<option value='" + i + "'>" + animsList[i]["title"] + " " + animsList[i]["time"] +"</option>" );
	}
	items.push("</select>");
	$("choose-vis").html(items.join());
	$('#choose-vis').on('change', function() {
		lerpFrame=0;
		frame=0;
		visContainsAnimation=0;
		animationIsRunning=0;
		currentAnimMeta=animsList[this.value];
		showStaticImage(); 
	});
};
//}}}
function initialScaleCenter() {//{{{
	if(view.scaling.x!=1) { return; }
	var scale=Math.min(($(window).width() - 20) / dstatic.world_meta.xdim, ($(window).height() - 70) / dstatic.world_meta.ydim)*0.9;
	view.scale(scale);
	view.center = new Point(dstatic.world_meta.center); 

}
//}}}
function showStaticImage() {//{{{
	// After we read a record from anims.json we reset the current visualization and setup a new one.
	// We can only start animation after we are done with static rooms, doors etc.
	// Paperjs can only scale relative to current size, so we must always return to the previous scale in view.scale().
	$.post('/aamks/ajax.php?ajaxAnimsStatic', function(response) { 
		ajax_msg(response);
		dstatic=response['data'];
		initialScaleCenter();

		$("animator-title").html(currentAnimMeta['title']);
		$("animator-time").html(currentAnimMeta['time']);
		wallsSize=Math.round(0.5/view.scaling.x);
		velocitiesSize=Math.round(1/view.scaling.x);
		doorsSize=wallsSize;

		makeSetupBoxInputs();
		makeColors();
		makeHighlightGeoms(dstatic.floors[currentAnimMeta['floor']]);
		listenEvents();
		resetCanvas();

		if(currentAnimMeta["highlight_geom"]!=null) { highlightGeom(currentAnimMeta["highlight_geom"]); }
		if(currentAnimMeta["anim"] != undefined)    { showAnimation(currentAnimMeta); }

	});
}
//}}}
function showAnimation() {//{{{
	// After static data is loaded to paperjs we can run animations.
	// 0.000001 & friends prevent divisions by 0.
	
	$.post('/aamks/ajax.php?ajaxSingleAnim', { 'unzip': currentAnimMeta['anim'] }, function(response) { 
		ajax_msg(response);
		currentAnimData=JSON.parse(response['data']);
		eData=currentAnimData.animations.evacuees;
		roomsOpacity=currentAnimData.animations.rooms_opacity;
		lastFrame=eData.length-1;
		var speedProposal=Math.round(lastFrame/5)
		$("animator-time").html(animFormatTime());
		$("animation-speed").html("<input type=text size=2 name=speed id=speed value="+speedProposal+">");
		lerps=Math.round(1/((speedProposal/100)+0.0000000000000000001))+1;

		$("#speed").on("keyup", function(){
			lerps=Math.round(1/(($('#speed').val()/100)+0.0000000000000000001))+1;
			lerpFrame=Math.floor(sliderPos*lastFrame*lerps/100);
			$('.canvas_slider_rect').attr("fill", "#333"); 
		});

		visContainsAnimation=1;
		animationIsRunning=1;
		initAnimAgents();
		initRoomSmoke();
	});
}
//}}}
function resetCanvas() {//{{{
	// Reset on new visualization, on scaling walls, etc.
	
	clearSmoke();
	initStaticGeoms();
	initAnimAgents();
	letItBurn();
	project.layers.animated.activate();
	
}
//}}}
function makeAnimationControls() {//{{{
	var items = [];
	items.push("<svg id=animator-time-svg height='20px'>");
	items.push("<rect id=animator-time-scroller x='0px' y='0px' height='20px'></rect>");
	for (var i=0; i<100; i++) {
		items.push("<rect class=canvas_slider_rect data-id='"+i+"' id='slider_"+i+"' x='"+(i*16+1)+"' y='1' width='16px' height='18px'></rect>");
	}
	items.push("</svg>");
	$("svg-slider").html(items.join( "" ));
}
//}}}
function makeSetupBoxInputs() {//{{{
	$("size-labels").html("<input type=text size=2 name=labels-size id=labels-size value=50>");
	$("size-walls").html("<input type=text size=2 name=walls-size id=walls-size value="+wallsSize+">");
	$("size-doors").html("<input type=text size=2 name=doors-size id=doors-size value="+doorsSize+">");
	$("radius-evacuee").html("<input type=text size=2 name=evacuee-radius id=evacuee-radius value="+evacueeRadius+">");
	$("size-velocities").html("<input type=text size=2 name=velocities-size id=velocities-size value="+velocitiesSize+">");
	$("animation-speed").html('');
}
//}}}
function makeColors() {//{{{
	var items = [];
	items.push("<select id=style-change>");
	items.push("<option value=Dark>Dark</option>");
	items.push("<option value=Light>Light</option>");
	items.push("</select>");
	$("change-style").html(items.join());
}
//}}}
function makeHighlightGeoms(data) {//{{{
	var items = [];
	items.push("<select id=highlight-geoms>");
	items.push("<option value=''></option>");
	items.push("<option value=''>ROOMS</option>");
	for (var key in data.rooms) {
		items.push("<option value="+key+">"+key+"</option>");
	}

	items.push("<option value=''>DOORS</option>");
	for (var key in data.doors) {
		items.push("<option value="+key+">"+key+"</option>");
	}
		
	items.push("</select>");
	$("highlight-geoms").html(items.join());
};

//}}}
function letItBurn() {//{{{
	// The animated fire is displayed in a separate setInterval loop. Perhaps onFrame() suits more.
	//if (currentAnimMeta['fire_origin'].length < 2) { 
	//	clearInterval(intervalId);
	//	return; 
	//}
	var smoke;
	var smokeOrig;
	var fire;
	var tx=dstatic.floors[currentAnimMeta['floor']].floor_meta.world2d_tx;
	var ty=dstatic.floors[currentAnimMeta['floor']].floor_meta.world2d_ty;

	// TODO: ORDER: project.activeLayer.insertChild(0, greenPath);
	if ('roomFire' in project.layers) { project.layers['roomFire'].removeChildren(); } 
	if ('roomSmoke' in project.layers) { project.layers['roomSmoke'].removeChildren(); } 

	project.layers['roomFire'].importSVG("smoke.svg", function (item) {
		item.position.x = currentAnimMeta['fire_origin'][0]+tx;
		item.position.y = currentAnimMeta['fire_origin'][1]+ty-40;
		smoke=item;
		smoke.opacity=0.5;
		smokeOrig=item.bounds;
	});
	
	project.layers['roomFire'].importSVG("fire.svg", function (item) {
		item.position.x = currentAnimMeta['fire_origin'][0]+tx;
		item.position.y = currentAnimMeta['fire_origin'][1]+ty;
		fire=item;
	});


	var intervalId;
	clearInterval(intervalId);
	intervalId=setInterval(function(){ 
		smoke.opacity-=0.008;
		if (smoke.opacity<=0.15) { 
			smoke.opacity=0.5; 
			smoke.setBounds(smokeOrig);
		}
		smoke.setPosition(smoke.getPosition().x, smoke.getPosition().y-2);
		smoke.scale(1.02);
		
	},100);
}
//}}}
function drawPath(type,data,tx,ty) {//{{{
	if(type=='ROOM') {
		strokeColor = colors.ROOM.stroke;
		strokeWidth = 0.2;
		opacity = 0.4;
		fillColor = data.room_enter == 'yes' ? colors[data.type_sec].c : "#333";
		var path=new Path({strokeColor:strokeColor, strokeWidth:strokeWidth, fillColor:fillColor, opacity:opacity });
	}
	if(type=='OBST') {
		strokeColor = colors.OBST.c;
		strokeWidth = wallsSize;
		opacity = 0.6;
		fillColor = colors.OBST.c;
		var path=new Path({strokeColor:strokeColor, strokeWidth:strokeWidth, fillColor:fillColor, opacity:opacity });
	}
	if(type=='DOOR') {
		strokeColor = colors.DOOR.c;
		strokeWidth = doorsSize;
		opacity = colors.DOOR.animOpacity / 3;
		var path=new Path({strokeColor:strokeColor, strokeWidth:strokeWidth, opacity:opacity });
	}

	path.closed = true;
	_.forEach(data.points, function(point) { path.add(new Point(point.x+tx, point.y+ty)); });
}
//}}}
function drawLabel(type,data,tx,ty) {//{{{
	fontFamily = 'Roboto';
	content = data.name;
	if(type=='ROOM') {
		fillColor = colors.fg.c;
		fontSize = labelsSize;
		pos=[data.points[0].x + tx + 20, data.points[0].y + ty + 50];
	}
	if(type=='DOOR') {
		fillColor = colors.fg.c;
		opacity = colors.DOOR.animOpacity;
		fontSize = labelsSize * 0.75;
		pos=[data.points[0].x + tx + 30, data.points[0].y + ty + 30];
	}
	new PointText({ point: new Point(pos[0], pos[1]), content: content, fontFamily: fontFamily, fontSize: fontSize, fillColor: fillColor });
}
//}}}
function drawStaticEvacuees(data,tx,ty) {//{{{
	if(currentAnimMeta["anim"] == undefined) { 
		radius=evacueeRadius;
		strokeWidth=0; 
		fillColor: colors['doseN']['c'];

		_.forEach(data.points, function(point) { 
			new Path.Circle({ center: new Point(point.x+tx, point.y+ty), radius: radius, strokeWidth:strokeWidth , fillColor: fillColor });
		});
	}
}
//}}}
function drawDDGeoms(data,tx,ty) { //{{{
	_.forEach(data.rectangles, function(pp) {
		new Path.Rectangle({point: new Point(pp.xy[0]+tx, pp.xy[1]+ty), size: new Size(pp.width,pp.depth), strokeColor:pp.strokeColor, strokeWidth:pp.strokeWidth, fillColor:pp.fillColor, opacity:pp.opacity });
	});

	_.forEach(data.lines, function(pp) {
		new Path.Line({from: new Point(pp.xy[0]+tx, pp.xy[1]+ty), to: new Point(pp.x1+tx,pp.y1+ty), strokeColor:pp.strokeColor, strokeWidth:pp.strokeWidth, opacity:pp.opacity });
	});

	_.forEach(data.circles, function(pp) {
		new Path.Circle({ center: new Point(pp.xy[0]+tx, pp.xy[1]+ty), radius:pp.radius, fillColor:pp.fillColor, opacity:pp.opacity });
	});

	_.forEach(data.texts, function(pp) {
		new PointText({ point: new Point(pp.xy[0]+tx, pp.xy[1]+ty), content: pp.content, fontFamily: 'Roboto', fontSize: pp.fontSize, fillColor:pp.fillColor, opacity:pp.opacity });
	});
}

//}}}
function initStaticGeoms() {//{{{
	project.layers.animated.removeChildren();
	project.layers.rooms.removeChildren();
	project.layers.rooms.activate();
	var tx, ty;
	
	_.forEach(dstatic.floors, function(ffloor) {
        tx=ffloor.floor_meta.world2d_tx;
        ty=ffloor.floor_meta.world2d_ty;
        _.forEach(ffloor.rooms     , function(d) { drawPath('ROOM'  , d , tx, ty); });
        _.forEach(ffloor.obstacles , function(d) { drawPath('OBST'  , d , tx, ty); });

		if (doorsSize!= 0) { _.forEach(ffloor.doors , function(d) { drawPath('DOOR' , d , tx, ty); } ); }

		if (labelsSize!= 0) { 
			_.forEach(ffloor.rooms , function(d) { drawLabel('ROOM' , d , tx, ty); });
			_.forEach(ffloor.doors , function(d) { drawLabel('DOOR' , d , tx, ty); });
		}

		drawStaticEvacuees(ffloor.evacuees, tx, ty);
        drawDDGeoms(ffloor.dd_geoms, tx, ty); 
    });

} 
//}}}
function initAnimAgents() { //{{{
	// velocitiesGroup are the ---------> vectors attached to each ball
	// evacueesLabelsGroup are (e1 x,y) displayed on top of each ball

	if (visContainsAnimation==0) { return; } 
	project.layers.animated.activate();
	dd(eData); //[i][4]]['c']; 

	_.each(eData[0], function(frame0_data,ffloor) {
		velocitiesGroup[ffloor]=new Group();
		evacueesGroup[ffloor]=new Group();
		evacueesLabelsGroup[ffloor]=new Group();
		_.each(frame0_data, function(data) {
			velocitiesGroup[ffloor].addChild(new Path.Line({strokeColor:colors['fg']['c'], strokeCap: 'round', dashArray: [2,10], strokeWidth: velocitiesSize }));
			evacueesGroup[ffloor].addChild(new Path.Circle({radius: evacueeRadius}));
		});
	});

}
//}}}
function evacueesInFrame() {//{{{
	// Lerps are Linear Interpolations. 
	// There is eData for each frame. Within each frame there are evacueesGroup positions. We take first frame and loop thru each evacuee. But we are not done with this frame yet:
	// We can have say 1 or 1000 of lerps (invented positions) between each two frames. This is for both smoothening animations and for slow/fast playbacks. 
	// We remove an evacuee by making it transparent. When we rewind, then we initialize all opacities with 1 again.
	
	_.each(evacueesGroup, function(data,ffloor) {
		_.each(data.children, function(e,i) {
			e.fillColor=colors['dose'+eData[frame][ffloor][i][4]]['c']; 
			e.position.x = eData[frame][ffloor][i][0] + (eData[frame+1][ffloor][i][0] - eData[frame][ffloor][i][0]) * (lerpFrame%lerps)/lerps; 
			e.position.y = eData[frame][ffloor][i][1] + dstatic.floors[ffloor].floor_meta.world2d_ty + (eData[frame+1][ffloor][i][1] - eData[frame][ffloor][i][1] ) * (lerpFrame%lerps)/lerps; 
		})
	})

	_.each(velocitiesGroup, function(data,ffloor) {
		_.each(data.children, function(e,i) {
			e.segments[0].point.x = evacueesGroup[ffloor].children[i].position.x;
			e.segments[0].point.y = evacueesGroup[ffloor].children[i].position.y;
			e.segments[1].point.x = evacueesGroup[ffloor].children[i].position.x + eData[frame][ffloor][i][2];
			e.segments[1].point.y = evacueesGroup[ffloor].children[i].position.y + eData[frame][ffloor][i][3];
		})
	})
}
//}}}
function afterLerpFrame() {//{{{
	// The slider moves after each frame. The slider is a collection of 100 svg rectangles. We need to clear the previous rectangle and mark the current rectangle
	$('#slider_'+(sliderPos)).attr("fill", "#333");
	$("animator-time").html(animFormatTime());
	sliderPos=Math.round(lerpFrame/(lerps*lastFrame)*100);
	lerpFrame++;
	$('#slider_'+(sliderPos-0)).attr("fill", "#f80");

	if(lerpFrame%lerps==0) {
		frame++;
	}

	// We need to rewind animation to the beginning before someone calls [frame+1]
	if(frame >= lastFrame) { 
		frame=0; 
		lerpFrame=0; 
	} 

}
//}}}
tool.onMouseDrag=function(event) {//{{{
	view.setCenter(view.center.x + event.downPoint.x - event.point.x, view.center.y + event.downPoint.y - event.point.y);
};

//}}}
tool.onMouseDown=function(event) {//{{{
	animationIsRunning=0;
	lerps=9999999999; // pause
	var x;
	var y;
	$("canvas-mouse-coords").text(Math.floor(event.downPoint['x'])+ "," + Math.floor(event.downPoint['y']));
	$("canvas-mouse-coords").css({'display':'block', 'left':event.event.pageX, 'top':event.event.pageY});
	//for (var i = 0; i < numberOfEvacuees; i++) { 
	_.each(eData[0], function(frame0_data,ffloor) {
		_.each(frame0_data, function(e,i) {
			x=evacueesGroup[ffloor].children[i].position.x;
			y=evacueesGroup[ffloor].children[i].position.y;
			evacueesLabelsGroup[ffloor].addChild(new Path.Circle({ center: new Point(x,y), radius:evacueeRadius*0.01, fillColor:"#f80" }));
			evacueesLabelsGroup[ffloor].addChild(new PointText(  { point: new Point(10+x-evacueeRadius/1,y-evacueeRadius/3), fillColor:"#000", content: i+1, fontFamily: 'Roboto', fontSize: evacueeRadius*0.7 }));
			evacueesLabelsGroup[ffloor].addChild(new PointText(  { point: new Point(x-evacueeRadius/1,y+evacueeRadius/2), fillColor:"#000", content: [Math.round(x/100),Math.round(y/100)], fontFamily: 'Roboto', fontSize: evacueeRadius*0.7}));
		})
	})
};
//}}}
function animFormatTime() {//{{{
	var date=new Date(null);
	var t=currentAnimData.time_shift + (currentAnimData.simulation_time - currentAnimData.time_shift) * sliderPos / 100
	date.setSeconds(t);
	return date.toISOString().substr(14,5);
};

//}}}
function highlightGeom(key) {//{{{
	project.layers['highlight'].activate();
	try {
		rw=Math.round(rooms[key].points[1]['x'] - rooms[key].points[0]['x']);
		rh=Math.round(rooms[key].points[2]['y'] - rooms[key].points[1]['y']);
		new Path.Rectangle({point: new Point(Math.round(rooms[key].points[0]['x']),Math.round(rooms[key].points[0]['y'])), size: new Size(rw,rh), opacity:0.4, fillColor: "#0f0"});
	} catch(e) {
		cx=Math.round( doors[key].points[0]['x'] + 0.5 * (doors[key].points[1]['x'] - doors[key].points[0]['x']));
		cy=Math.round( doors[key].points[1]['y'] + 0.5 * (doors[key].points[2]['y'] - doors[key].points[1]['y']));
		new Path.Circle({center: new Point(cx,cy), radius: 100,  opacity:0.4, fillColor: "#0f0"});
	}
}
//}}}
function randBetween(min, max) {//{{{
    return Math.random() * (max - min) + min;
}
//}}}
function clearSmoke() {//{{{
	// TODO: JUN.2019, disable ok?
	//if ('roomSmoke' in project.layers) {
	//	project.layers['roomSmoke'].removeChildren();
	//} 
}
//}}}
function bubbles_ranges(side) { //{{{
	// Room divided into segments results in smoke more even than purely random
	var bubbles_segment=300;
	var count=side/bubbles_segment;

	var ranges=[];
	for (var i=0; i < count; i++) { 
		ranges.push([ i * bubbles_segment, i * bubbles_segment + bubbles_segment]);
	}
	return ranges;
}
//}}}
function initRoomSmoke() {//{{{
	project.layers.roomSmoke.activate();
	var radius=350;
	var roomMargin=25;
	var center;
	var rw, rh;
	var x_ranges, y_ranges;

	for (var ffloor in roomsOpacity[0]) {
        var ty=dstatic.floors[ffloor].floor_meta.world2d_ty;
		for (var room in roomsOpacity[0][ffloor]) {
			points=dstatic.floors[ffloor]['rooms'][room]['points'];
			_.each(points, function(i) { i['y']+=ty; });
			rw=points[1]['x'] - points[0]['x'];
			rh=points[2]['y'] - points[1]['y'];

			group=new Group();
			group.name=room;
			group.floor=ffloor;
			
			group.addChild(new Path.Rectangle({ point: new Point(points[0]['x']+roomMargin, points[0]['y']+roomMargin), size: new Size(rw-2*roomMargin,rh-2*roomMargin)}));
			group.clipped=true;
			group.opacity=0.3;
			x_ranges=bubbles_ranges(points[1]['x'] - points[0]['x']);
			y_ranges=bubbles_ranges(points[2]['y'] - points[1]['y']);
			for (var xx in x_ranges) {
				for (var yy in y_ranges) {
					center=[
						points[0]['x'] + randBetween (x_ranges[xx][0], x_ranges[xx][1] ), 
						points[0]['y'] + randBetween (y_ranges[yy][0], y_ranges[yy][1] ),
					];
					group.addChild(new Path.Circle({ opacity: 0.5, center: new Point(center[0], center[1]), radius: radius*randBetween(0.7,1),  fillColor: "#023" }));

				}
			}
		}
	}
}
//}}}
function roomsSmokeInFrame() {//{{{
	if (roomsOpacity.length==0) { return; }
	_.each(project.layers.roomSmoke.getItems(), function(i,key) { 
		project.layers.roomSmoke.children[key].opacity=roomsOpacity[frame][i.floor][i.name];
	});
}
//}}}
function resizeAndRedrawCanvas() {//{{{
	wWidth = $(window).width()-20;
	wHeight = $(window).height()-70;
	$("#animator-canvas").width(wWidth);
	$("#animator-canvas").height(wHeight);
	$("#animator-time-svg").width(wWidth);
	$("#animator-time-scroller").width(wWidth);
	view.viewSize = new Size(wWidth, wHeight);
	view.draw();
}

//}}}
view.onFrame=function(event) {//{{{
	if (animationIsRunning==1) {
		evacueesInFrame();
		roomsSmokeInFrame();
		afterLerpFrame();
	}
}
//}}}
};
