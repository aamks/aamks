// Animation can be paused on mouse clicks - onFrame() always checks the animationIsRunning variable. {{{
// On mouse clicks we display evacBalls data and mouse position
//
// General workflow:
// 1. init/init.py creates master.html and attaches js/
// 2. First we read anims.json for a list of registered visualizations
// 3. We choose a registered animation and read first json, e.g. floor_1.json
// 4. anims.json has "anim" key which can be empty or point to a directory, e.g 83/
//		-- we will then get ../83/anim.zip
//
// Animations are frames for t0, t1, tN. Each frame contains all agents information in a vector:
// 
//     0      , 1      , 2        , 3        , 4            , 5
//     agentX , agentY , headingX , headingY , FED: N|L|M|H , opacity
//}}}

var scale=1;
var wWidth;
var wHeight;
var intervalId;
var incDB;
var colors;
var staticGeoms;
var fireXY;
var wallsSize;
var doorsSize;
var evacueeRadius;
var velocitiesSize;
var evacBalls;
var evacLabels;
var evacVelocities;
var evacueesData;
var roomsOpacity;
var numberOfEvacuees;
var rooms;
var doors;
var obstacles;
var dd_geoms;
var staticEvacuees;
var lerps;
var lastFrame=1;
var deltaTime=0; 
var timeShift=0; 
var labelsSize=50;
var sliderPos=0;
var lerpFrame=0;
var frame=0;
var	visContainsAnimation=0;
var	isDemoAnimation=0;
var	animationIsRunning=0;

paper.install(window);
window.onload = function() {
	var nn;
	paper.setup('animator-canvas');
	var tool=new Tool;
	makeAnimationControls();
	nn=new Layer; nn.name='rooms';
	nn=new Layer; nn.name='roomSmoke';
	nn=new Layer; nn.name='roomFire';
	resizeAndRedrawCanvas();
	left_menu_box();
	right_menu_box();

function ddd() {//{{{
	dd(db().get());
}
//}}}
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
		evacLabels.removeChildren();
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
		evacLabels.removeChildren();
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
    evacueeRadius=x['evacueeRadius'];
	setColors("dark");
	$.post('/aamks/ajax.php?ajaxAnimsList', function (response) { 
		ajax_msg(response);
		var data=response['data'];
		makeChooseVis(data);
		showStaticImage(data[0]);
	});
});
//}}}
function makeChooseVis(data) {//{{{
	// Droplist of anims.json (all registered visualizations)
	var items = [];
	items.push("<select id=choose-vis>");
	for (var i=0; i<data.length; i++) { 
		items.push( "<option value='" + i + "'>" + data[i]["title"] + " " + data[i]["time"] +"</option>" );
	}
	items.push("</select>");
	$("choose-vis").html(items.join());
	$('#choose-vis').on('change', function() {
		lerpFrame=0;
		frame=0;
		visContainsAnimation=0;
		animationIsRunning=0;
		showStaticImage(data[this.value]); 
	});
};
//}}}
function initialScaleTranslate(floor_meta) {//{{{
	var geomsScale=Math.min(wWidth/floor_meta['xdim'], wHeight/floor_meta['ydim'])*0.9;
	var geomsTrans=[ floor_meta['maxx']-0.5*floor_meta['xdim'], floor_meta['maxy']-0.5*floor_meta['ydim'] ];
	var newScale=geomsScale;
	view.scale(newScale/scale);  
	scale=newScale;
	view.center = new Point(geomsTrans); 
}
//}}}
function showStaticImage(chosenAnim) {//{{{
	// After we read a record from anims.json we reset the current visualization and setup a new one.
	// We can only start animation after we are done with static rooms, doors etc.
	// Paperjs can only scale relative to current size, so we must always return to the previous scale in view.scale().
	$.post('/aamks/ajax.php?ajaxAnimsStatic', function(response) { 
		ajax_msg(response);
		var dstatic=response['data'];
		var floor=chosenAnim["floor"];
		initialScaleTranslate(response['data'][floor]['floor_meta']);

		$("animator-title").html(chosenAnim['title']);
		$("animator-time").html(animTimeFormat());
		fireXY=chosenAnim['fire_origin']
		wallsSize=Math.round(2/scale);
		//evacueeRadius=Math.round(5/scale);
		velocitiesSize=Math.round(1/scale);
		doorsSize=Math.round(0.2*wallsSize);

		rooms=dstatic[floor].rooms;
		doors=dstatic[floor].doors;
		obstacles=dstatic[floor].obstacles;
        dd_geoms=dstatic[floor].dd_geoms;
		if(chosenAnim["anim"] == undefined) { staticEvacuees=dstatic[floor].evacuees; } else { staticEvacuees=[]; }
		if(chosenAnim["demo"] == undefined) { isDemoAnimation=0; } else { isDemoAnimation=1; }
		
		makeSetupBoxInputs();
		makeColors();
		makeHighlightGeoms(dstatic[floor]);

		listenEvents();
		resetCanvas();

		if(chosenAnim["highlight_geom"]!=null) { highlightGeom(chosenAnim["highlight_geom"]); }
		if(chosenAnim["anim"] != undefined) { showAnimation(chosenAnim); } 

	});
}
//}}}
function showAnimation(chosenAnim) {//{{{
	// After static data is loaded to paperjs we can run animations.
	// 0.000001 & friends prevent divisions by 0.
	
	$.post('/aamks/ajax.php?ajaxSingleAnim', { 'unzip': chosenAnim['anim'] }, function(response) { 
		ajax_msg(response);
		animJson=JSON.parse(response['data']);
		timeShift=animJson.time_shift;
		deltaTime=animJson.simulation_time-timeShift;
		$("animator-time").html(animTimeFormat());
		evacueesData=animJson.animations.evacuees;
		roomsOpacity=animJson.animations.rooms_opacity;
		lastFrame=animJson.animations.evacuees.length-1;
		numberOfEvacuees=animJson.animations.evacuees[0].length;
		var speedProposal=Math.round(lastFrame/5)
		$("animation-speed").html("<input type=text size=2 name=speed id=speed value="+speedProposal+">");
		lerps=Math.round(1/((speedProposal/100)+0.0000000000000000001))+1;

		$("#speed").on("keyup", function(){
			lerps=Math.round(1/(($('#speed').val()/100)+0.0000000000000000001))+1;
			lerpFrame=Math.floor(sliderPos*lastFrame*lerps/100);
			$('.canvas_slider_rect').attr("fill", "#333"); 
		});

		visContainsAnimation=1;
		animationIsRunning=1;
		paperjsDisplayAnimation();
		initRoomSmoke();
	});
}
//}}}
function resetCanvas() {//{{{
	// Reset on new visualization, on scaling walls, etc.
	
	clearSmoke();
	paperjsDisplayImage();
    append_dd_geoms();
	paperjsDisplayAnimation();
	paperjsLetItBurn();
	
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
function paperjsLetItBurn() {//{{{
	// The animated fire is displayed in a separate setInterval loop. Perhaps onFrame() suits more.
	//if (fireXY.length < 2) { 
	//	clearInterval(intervalId);
	//	return; 
	//}
	var smoke;
	var smokeOrig;
	var fire;

	if ('roomFire' in project.layers) {
		project.layers['roomFire'].removeChildren();
	} 

	project.layers['roomFire'].importSVG("smoke.svg", function (item) {
		item.position.x=fireXY[0];
		item.position.y=fireXY[1]-40;
		item.position.y=fireXY[1]-40;
		smoke=item;
		smoke.opacity=0.5;
		smokeOrig=item.bounds;
	});
	
	project.layers['roomFire'].importSVG("fire.svg", function (item) {
		item.position.x=fireXY[0];
		item.position.y=fireXY[1];
		fire=item;
	});

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
function paperjsDisplayImage() {//{{{

	project.layers['rooms'].activate();
	
	if (staticGeoms == undefined) {
		staticGeoms=new Group();
	} else {
		staticGeoms.removeChildren();
	}

	// Creating rooms
	_.forEach(rooms, function(room) {
		var roomPath = new Path();
		roomPath.strokeColor = colors.ROOM.stroke;
		roomPath.strokeWidth = 0.2;
		roomPath.opacity = 0.4;
		// Change color depending on room_enter posibility
		roomPath.fillColor = room.room_enter == 'yes' ? colors[room.type_sec].c : "#333";
		// Draw polygon
		_.forEach(room.points, function(point) {
			roomPath.add(new Point(point.x, point.y));
		});
		// Close polygon
		roomPath.closed = true;
		// Add path to staticGeoms
		staticGeoms.addChild(roomPath);
	});

	// Creating obstacles
	_.forEach(obstacles, function(obst) {
		if(obst.type && obst.type == 'fire_obstacle') {
			if(isDemoAnimation == 0 && obst.points.lenght >= 3) { 
				// TODO refactor center & radius if polygon
				var center = new Point(obst.points[0].x + (obst.points[2].x - obst.points[0].x)/2, obst.points[0].y + (obst.points[2].y - obst.points[0].y)/2);
				var radius = (obst.points[2].x - obst.points[0].x)/2;
				var obstPath = new Path.Circle(center, radius);
				obstPath.strokeColor = "#ffffff";
				obstPath.dashArray = [20,10];
				obstPath.strokeWidth = wallsSize;
			}
		} else {
			var obstPath = new Path();
			obstPath.strokeColor = colors.fg.c;
			obstPath.strokeWidth = wallsSize;
			obstPath.opacity = 0.6;
			obstPath.fillColor = colors.OBST.c;
			// Draw polygon
			_.forEach(obst.points, function(point) {
				obstPath.add(new Point(point.x, point.y));
			});
			// Close polygon
			obstPath.closed = true;
			// Add path to staticGeoms
			staticGeoms.addChild(obstPath);
		}
	});

	// Add labels to rooms
	if (labelsSize != 0) { 
		console.log(rooms);
		_.forEach(rooms, function(room) {
			var roomLabel = new PointText(new Point(room.points[0].x + 20, room.points[0].y + 50));
			roomLabel.fillColor = colors.fg.c;
			roomLabel.content = room.name;
			roomLabel.fontFamily = 'Roboto';
			roomLabel.fontSize = labelsSize;
			// Add label to staticGeoms
			staticGeoms.addChild(roomLabel);
		});
	}

	// Create doors
	_.forEach(doors, function(door) {
		if (doorsSize != 0) { 
			var doorPath = new Path();
			doorPath.strokeColor = colors.DOOR.c;
			doorPath.strokeWidth = doorsSize;
			doorPath.opacity = colors.DOOR.animOpacity / 3;
			// Draw polygon
			_.forEach(door.points, function(point) {
				doorPath.add(new Point(point.x, point.y));
			});
			// Close polygon
			doorPath.closed = true;
			// Add path to staticGeoms
			staticGeoms.addChild(doorPath);
		}
		if (labelsSize != 0) { 
			// TODO distinguish vertical and horizontal doors
			var doorLabel = new PointText(new Point(door.points[0].x + 30, door.points[0].y + 30));
			doorLabel.fillColor = colors.fg.c;
			doorLabel.content = door.name;
			doorLabel.opacity = colors.DOOR.animOpacity;
			doorLabel.fontFamily = 'Roboto';
			doorLabel.fontSize = labelsSize * 0.75;
			// Add label to staticGeoms
			staticGeoms.addChild(doorLabel);
		}
	});

	// Draw static evacuees
	for (var key in staticEvacuees) {
		staticGeoms.addChild(new Path.Circle({ center: new Point(staticEvacuees[key]), radius: evacueeRadius,  fillColor: colors['doseN']['c'] }));
	}

} 
//}}}
function append_dd_geoms() { //{{{
	// We attach to the static geoms
	var g;

	for (var i=0; i<dd_geoms['rectangles'].length; i++) {
		g=dd_geoms['rectangles'][i];
		staticGeoms.addChild(new Path.Rectangle({point: new Point(g["xy"][0], g["xy"][1]), size: new Size(g["width"],g["depth"]), strokeColor:g['strokeColor'], strokeWidth:g['strokeWidth'], fillColor:g['fillColor'], opacity:g['opacity'] }));
	}

	for (var i=0; i<dd_geoms['lines'].length; i++) {
		g=dd_geoms['lines'][i];
		staticGeoms.addChild(new Path.Line({ from: new Point(g["xy"][0], g["xy"][1]), to: new Point(g["x1"],g["y1"]), strokeColor:g['strokeColor'], strokeWidth:g['strokeWidth'], opacity:g['opacity']  }));
	}

	for (var i=0; i<dd_geoms['circles'].length; i++) {
		g=dd_geoms['circles'][i];
		staticGeoms.addChild(new Path.Circle({ center: new Point(g["xy"][0], g["xy"][1]), radius:g["radius"], fillColor:g['fillColor'], opacity:g['opacity'] }));
	}
	for (var i=0; i<dd_geoms['texts'].length; i++) {
		g=dd_geoms['texts'][i];
		staticGeoms.addChild(new PointText({ point: new Point(g["xy"][0], g["xy"][1]), content: g["content"], fontFamily: 'Roboto', fontSize: g["fontSize"], fillColor:g['fillColor'], opacity:g['opacity'] }));
	}
}

//}}}
function paperjsDisplayAnimation() { //{{{
	// evacVelocities are the ---------> vectors attached to each ball
	// evacLabels are (e1 x,y) displayed on top of each ball
	// Old elements must be removed on various occassions, so we cannot return to early.
	
	project.layers['rooms'].activate();
	if (evacVelocities == undefined) {
		evacVelocities=new Group();
		evacBalls=new Group();
		evacLabels=new Group();
	} else {
		evacVelocities.removeChildren();
		evacBalls.removeChildren();
		evacLabels.removeChildren();
	}

	if (visContainsAnimation==0) { return; } 

	for (var i=0; i<numberOfEvacuees; i++) {
		evacVelocities.addChild( new Path.Line({ from: new Point(evacueesData[0][i][0],evacueesData[0][i][1]), to: new Point(evacueesData[0][i][2],evacueesData[0][i][3]), strokeColor:colors['fg']['c'], strokeCap: 'round', dashArray: [2,10], strokeWidth: velocitiesSize }));
	}

	for (var i=0; i<numberOfEvacuees; i++) {
		evacBalls.addChild(new Path.Circle({center: new Point(evacueesData[0][i][0],evacueesData[0][i][1]), radius: evacueeRadius, fillColor: colors['doseN']['c'] }));
	}

}
//}}}
function updateAnimatedElement(i) {//{{{
	// Lerps are Linear Interpolations. 
	// There is data for each frame. Within each frame there are evacBalls positions. We take first frame and loop thru each evacuee. But we are not done with this frame yet:
	// We can have say 1 or 1000 of lerps (invented positions) between each two frames. This is for both smoothening animations and for slow/fast playbacks. 
	// We remove an evacuee by making it transparent. When we rewind, then we initialize all opacities with 1 again.

	// todo performance? 
	// if(frame == 0 || evacueesData[frame][i][5] != evacueesData[frame-1][i][5] ) {  evacBalls.children[i].opacity=evacVelocities.children[i].opacity=evacueesData[frame][i][5]; }
	// if(frame == 0 || evacueesData[frame][i][4] != evacueesData[frame-1][i][4] ) {  evacBalls.children[i].fillColor=colors['dose'+evacueesData[frame][i][4]]; } 
	// evacBalls.children[i].opacity=evacVelocities.children[i].opacity=evacueesData[frame+1][i][5]; 
	evacBalls.children[i].fillColor=colors['dose'+evacueesData[frame][i][4]]['c']; 

	evacBalls.children[i].position.x =  evacueesData[frame][i][0] + (evacueesData[frame+1][i][0] - evacueesData[frame][i][0]) * (lerpFrame%lerps)/lerps; 
	evacBalls.children[i].position.y =  evacueesData[frame][i][1] + (evacueesData[frame+1][i][1] - evacueesData[frame][i][1]) * (lerpFrame%lerps)/lerps; 

	evacVelocities.children[i].segments[0].point.x = evacBalls.children[i].position.x;
	evacVelocities.children[i].segments[0].point.y = evacBalls.children[i].position.y;
	evacVelocities.children[i].segments[1].point.x = evacBalls.children[i].position.x + evacueesData[frame][i][2];
	evacVelocities.children[i].segments[1].point.y = evacBalls.children[i].position.y + evacueesData[frame][i][3];
}
//}}}
function afterLerpFrame() {//{{{
	// The slider moves after each frame. The slider is a collection of 100 svg rectangles. We need to clear the previous rectangle and mark the current rectangle
	$('#slider_'+(sliderPos)).attr("fill", "#333");
	$("animator-time").html(animTimeFormat());
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
	var offset = event.downPoint - event.point;
	view.center = view.center + offset;
};

//}}}
tool.onMouseDown=function(event) {//{{{
	animationIsRunning=0;
	lerps=9999999999; // pause
	var x;
	var y;
	//$("canvas-mouse-coords").text(Math.floor(event.downPoint['x']/100)+","+Math.floor(event.downPoint['y']/100));
	$("canvas-mouse-coords").text(Math.floor(event.downPoint['x'])+ "," + Math.floor(event.downPoint['y']));
	$("canvas-mouse-coords").css({'display':'block', 'left':event.event.pageX, 'top':event.event.pageY});
	for (var i = 0; i < numberOfEvacuees; i++) { 
		x=evacBalls.children[i].position.x;
		y=evacBalls.children[i].position.y;
		evacLabels.addChild(new Path.Circle({ center: new Point(x,y), radius:evacueeRadius*0.01, fillColor:"#f80" }));
		evacLabels.addChild(new PointText(  { point: new Point(10+x-evacueeRadius/1,y-evacueeRadius/3), fillColor:"#fff", content: i+1, fontFamily: 'Roboto', fontSize: evacueeRadius*0.7 }));
		evacLabels.addChild(new PointText(  { point: new Point(x-evacueeRadius/1,y+evacueeRadius/2), fillColor:"#fff", content: [Math.round(x/100),Math.round(y/100)], fontFamily: 'Roboto', fontSize: evacueeRadius*0.7}));
	}
};
//}}}
function animTimeFormat() {//{{{
	var date=new Date(null);
	var t=timeShift+deltaTime*sliderPos/100
	date.setSeconds(t);
	return date.toISOString().substr(14,5);
};

//}}}
function highlightGeom(key) {//{{{
	try {
		new Path.Rectangle({point: new Point(Math.round(rooms[key]["x0"]),Math.round(rooms[key]["y0"])), size: new Size(Math.round(rooms[key]["width"]),Math.round(rooms[key]["depth"])), opacity:0.4, fillColor: "#0f0"});
	} catch(e) {
		new Path.Circle({center: new Point(Math.round(doors[key]["center_x"]),Math.round(doors[key]["center_y"])), radius: 100,  opacity:0.4, fillColor: "#0f0"});
	}
}
//}}}
function randBetween(min, max) {//{{{
    return Math.random() * (max - min) + min;
}
//}}}
function clearSmoke() {//{{{
	if ('roomSmoke' in project.layers) {
		project.layers['roomSmoke'].removeChildren();
	} 
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
	// TODO: Smoke animations: we have lost keys and have indices now. Some db to fix it?

 	// r1: {name: "r1", type_sec: "ROOM", room_enter: "yes", points: Array(4)}
 	// r2: {name: "r2", type_sec: "ROOM", room_enter: "yes", points: Array(4)}
 	// r3: {name: "r3", type_sec: "ROOM", room_enter: "yes", points: Array(4)}

 	// 0: {name: "r1", type_sec: "ROOM", room_enter: "yes", points: Array(4)}
 	// 1: {name: "r2", type_sec: "ROOM", room_enter: "yes", points: Array(4)}
 	// 2: {name: "r3", type_sec: "ROOM", room_enter: "yes", points: Array(4)}

	project.layers['roomSmoke'].activate();
	var radius=350;
	var roomMargin=25;
	var center;
	var x_ranges, y_ranges;
	for (var room in roomsOpacity[0]) {
		group=new Group;
		group.name=room;
		group.addChild(new Path.Rectangle({ point: new Point(rooms[room].x0+roomMargin, rooms[room].y0+roomMargin), size: new Size(rooms[room]["width"]-2*roomMargin,rooms[room]["depth"]-2*roomMargin)}));
		group.clipped=true;
		group.opacity=0.3;
		x_ranges=bubbles_ranges(rooms[room].width);
		y_ranges=bubbles_ranges(rooms[room].depth);
		for (var xx in x_ranges) {
			for (var yy in y_ranges) {
				center=[
					rooms[room].x0 + randBetween (x_ranges[xx][0], x_ranges[xx][1] ), 
					rooms[room].y0 + randBetween (y_ranges[yy][0], y_ranges[yy][1] )
				]
				group.addChild(new Path.Circle({ opacity: 0.5, center: new Point(center), radius: radius*randBetween(0.7,1),  fillColor: "#000000" }));
			}
		}
	}
}
//}}}
function updateRoomSmoke() {//{{{
	if (roomsOpacity.length==0) { return; }
	for (var i in project.layers['roomSmoke'].children) {
		if(roomsOpacity[frame][i] != undefined) { 
			project.layers['roomSmoke'].children[i].opacity=roomsOpacity[frame][i];
		}
	}
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
		for (var i = 0; i < numberOfEvacuees; i++) { 
			updateAnimatedElement(i);
		}
		updateRoomSmoke();
		afterLerpFrame();
	}
}
//}}}
};
