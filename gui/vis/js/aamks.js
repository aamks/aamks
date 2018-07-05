// Invert Y everywhere.
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
var fireScale;
var intervalId;
var fireScaleCounter;
var colors;
var colorsDb;
var staticGeoms;
var burningFireLocation;
var wallsSize;
var doorsSize;
var ballsSize;
var velocitiesSize;
var evacBalls;
var evacLabels;
var evacVelocities;
var burningFire;
var evacueesData;
var numberOfEvacuees;
var rooms;
var doors;
var obstacles;
var dd_geoms;
var lerps;
var lastFrame=1;
var deltaTime=0; 
var timeShift=0; 
var labelsSize=40;
var sliderPos=0;
var lerpFrame=0;
var frame=0;
var	visContainsAnimation=0;
var	animationIsRunning=0;

$.getJSON("colors.json", function(cols) {
	colorsDb=cols;
	colors=colorsDb['darkColors'];
	$.getJSON("anims.json", function(data) {
		// Runs automatically on the start. By default runs the first visualization from anims.json, which should be most fresh.
		makeChooseVis(data);
		showStaticImage(data[0]);
	});
});

function makeChooseVis(data) {
	// Droplist of anims.json (all registered visualizations)
	var items = [];
	items.push("<select id=choose-vis>");
	items.push("<option value=''></option>");
	for (var i=0; i<data.length; i++) { 
		items.push( "<option value='" + i + "'>" + data[i]["title"] + "</option>" );
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

function showStaticImage(chosenAnim) {
	// After we read a record from anims.json we reset the current visualization and setup a new one.
	// We can only start animation after we are done with static rooms, doors etc.
	// Paperjs can only scale relative to current size, so we must always return to the previous scale in view.scale().
	$.getJSON("static.json", function(dstatic) {
		var floor=chosenAnim["floor"];
		var newScale=dstatic[floor]['meta']['scale'];
		view.scale(newScale/scale);  
		scale=newScale;
		view.center = new Point(dstatic[floor]['meta']['translate']); 

		$("vis-title").html(chosenAnim['title']);
		$("sim-time").html(animTimeFormat());
		burningFireLocation=chosenAnim['fire_origin']
		wallsSize=Math.round(2/scale);
		ballsSize=Math.round(5/scale);
		velocitiesSize=Math.round(1/scale);
		doorsSize=Math.round(0.2*wallsSize);

		rooms=dstatic[floor].rooms;
		doors=dstatic[floor].doors;
		obstacles=dstatic[floor].obstacles;
        dd_geoms=dstatic[floor].dd_geoms;
		
		makeAnimationControls();
		makeSetupBoxInputs();
		makeColors();
		makeHighlightGeoms(dstatic[floor]);

		listenEvents();
		resetCanvas();

		if(chosenAnim["highlight_geom"]!=null) { highlightGeom(chosenAnim["highlight_geom"]); }
		
		if(chosenAnim["anim"]!='') { 
			showAnimation(chosenAnim);
		}

	});
}

function showAnimation(chosenAnim) {
	// After static data is loaded to paperjs we can run animations.
	// 0.000001 & friends prevent divisions by 0.
	var promise = new JSZip.external.Promise(function (resolve, reject) {
		JSZipUtils.getBinaryContent("../"+chosenAnim["anim"], function(err, data) {
			if (err) {
				reject(err);
			} else {
				resolve(data);
			}
		});
	});

	promise.then(JSZip.loadAsync)                     
	.then(function(zip) {
		return zip.file("anim.json").async("string"); 
	})

	.then(function success(chosenAnim) {                    
		var animJson = JSON.parse(chosenAnim);
		timeShift=animJson.time_shift;
		deltaTime=animJson.simulation_time-timeShift;
		$("sim-time").html(animTimeFormat());
		evacueesData=animJson.data;
		lastFrame=animJson.data.length-1;
		numberOfEvacuees=animJson.data[0].length;
		var speedProposal=Math.round(lastFrame/5)
		$("animation-speed").html("<input type=text size=2 name=speed id=speed value="+speedProposal+">");
		lerps=Math.round(1/((speedProposal/100)+0.0000000000000000001))+1;

		$("#speed").on("keyup", function(){
			lerps=Math.round(1/(($('#speed').val()/100)+0.0000000000000000001))+1;
			lerpFrame=Math.floor(sliderPos*lastFrame*lerps/100);
			$('.canvas_slider_rect').css("fill" , "#000000");
		});

		visContainsAnimation=1;
		animationIsRunning=1;
		paperjsDisplayAnimation();

	}, function error(e) {
		console.log(e);
	});
}

function resetCanvas() {
	// Reset on new visualization, on scaling walls, etc.
	paperjsDisplayImage();
    append_dd_geoms();
	paperjsLetItBurn();
	paperjsDisplayAnimation();
}

function makeAnimationControls() {
	var items = [];
	items.push("<svg width='1602px' height='20px'>");
	items.push("<rect x='0px' y='0px' width='1602px' height='20px' style='stroke:#444444; stroke-width:2px'></rect>");
	for (var i=0; i<100; i++) {
		items.push("<rect class=canvas_slider_rect data-id='"+i+"' id='slider_"+i+"' x='"+(i*16+1)+"' y='1' width='16px' height='18px'></rect>");
	}
	items.push("</svg>");
	$("svg-slider").html(items.join( "" ));
}

function makeSetupBoxInputs() {
	$("size-labels").html("<input type=text size=2 name=labels-size id=labels-size value=20>");
	$("size-walls").html("<input type=text size=2 name=walls-size id=walls-size value="+wallsSize+">");
	$("size-doors").html("<input type=text size=2 name=doors-size id=doors-size value="+doorsSize+">");
	$("size-balls").html("<input type=text size=2 name=balls-size id=balls-size value="+ballsSize+">");
	$("size-velocities").html("<input type=text size=2 name=velocities-size id=velocities-size value="+velocitiesSize+">");
	$("animation-speed").html('');
}

function makeColors() {
	var items = [];
	items.push("<select id=style-change>");
	items.push("<option value=Dark>Dark</option>");
	items.push("<option value=Light>Light</option>");
	items.push("</select>");
	$("change-style").html(items.join());
}

function makeHighlightGeoms(data) {
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


function paperjsLetItBurn() {
	// The animated fire is displayed in a separate setInterval loop. Perhaps onFrame() suits more.
	if (burningFire == undefined) {
		burningFire=new Group();
	} else {
		burningFire.removeChildren();
	}

	if (burningFireLocation.length < 2) { 
		clearInterval(intervalId);
		return; 
	}
	burningFire.addChild(new Path.Circle({center: new Point(burningFireLocation[0], -burningFireLocation[1]) , radius:ballsSize*4 , fillColor:colors["firefill"] , strokeColor:colors["firestroke"] , strokeWidth:ballsSize }));

	clearInterval(intervalId);
	fireScale=0.9;
	fireScaleCounter=1;
	intervalId=setInterval(function(){ 
		fireScaleCounter++;
		if(fireScaleCounter%20 == 0) { 
			fireScale=1/fireScale;
		}
		burningFire.children[0].scale(fireScale); 
	},100);
}

function paperjsDisplayImage() {
	if (staticGeoms == undefined) {
		staticGeoms=new Group();
	} else {
		staticGeoms.removeChildren();
	}

	for (var key in rooms) {
		staticGeoms.addChild(new Path.Rectangle({point: new Point(rooms[key]["x0"],-rooms[key]["y0"]), size: new Size(rooms[key]["width"],-rooms[key]["depth"]), strokeColor:colors['stroke'], strokeWidth:0.2, fillColor:colors[rooms[key]["type_sec"]]}));
	}

	for (var i=0; i<obstacles.length; i++) {
		staticGeoms.addChild(new Path.Rectangle({point: new Point(obstacles[i]["x0"],-obstacles[i]["y0"]), size: new Size(obstacles[i]["width"],-obstacles[i]["depth"]), strokeColor: colors['obsts'], strokeWidth:wallsSize }));
	}

	if (labelsSize != 0) { 
		for (var key in rooms) {
			staticGeoms.addChild(new PointText({point: new Point(rooms[key]["x0"]+10,-rooms[key]["y0"]-30), fillColor:colors["fg"], content: rooms[key]["name"], fontFamily: 'Play', fontSize: labelsSize }));
		}
	}

	for (var key in doors) {
		if (doorsSize != 0) { 
			staticGeoms.addChild(new Path.Rectangle({point: new Point(doors[key]["x0"],-doors[key]["y0"]), size: new Size(doors[key]["width"],-doors[key]["depth"]), strokeColor: colors['door'], strokeWidth:doorsSize  }));
		}
		if (labelsSize != 0) { 
			staticGeoms.addChild(new PointText({point: new Point(doors[key]["center_x"]-10,-doors[key]["center_y"]+10), fillColor:colors["fg"], content: doors[key]["name"], opacity: 0.7, fontFamily: 'Play', fontSize: labelsSize*0.75 }));
		}
	}

} 

function append_dd_geoms() { 
	// We attach to the static geoms
	var g;

	for (var i=0; i<dd_geoms['rectangles'].length; i++) {
		g=dd_geoms['rectangles'][i];
		staticGeoms.addChild(new Path.Rectangle({point: new Point(g["xy"][0], -g["xy"][1]), size: new Size(g["width"],-g["depth"]), strokeColor:g['strokeColor'], strokeWidth:g['strokeWidth'], fillColor:g['fillColor'], opacity:g['opacity'] }));
	}

	for (var i=0; i<dd_geoms['lines'].length; i++) {
		g=dd_geoms['lines'][i];
		staticGeoms.addChild(new Path.Line({ from: new Point(g["xy"][0], -g["xy"][1]), to: new Point(g["x1"],-g["y1"]), strokeColor:g['strokeColor'], strokeWidth:g['strokeWidth'], opacity:g['opacity']  }));
	}

	for (var i=0; i<dd_geoms['circles'].length; i++) {
		g=dd_geoms['circles'][i];
		staticGeoms.addChild(new Path.Circle({ center: new Point(g["xy"][0], -g["xy"][1]), radius:g["radius"], fillColor:g['fillColor'], opacity:g['opacity'] }));
	}
	for (var i=0; i<dd_geoms['texts'].length; i++) {
		g=dd_geoms['texts'][i];
		staticGeoms.addChild(new PointText({ point: new Point(g["xy"][0], -g["xy"][1]), content: g["content"], fontFamily: 'Play', fontSize: g["fontSize"], fillColor:g['fillColor'], opacity:g['opacity'] }));
	}
}


function paperjsDisplayAnimation() { 
	// evacVelocities are the ---------> vectors attached to each ball
	// evacLabels are (e1 x,y) displayed on top of each ball
	// Old elements must be removed on various occassions, so we cannot return to early.
	
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
		evacVelocities.addChild( new Path.Line({ from: new Point(evacueesData[0][i][0],-evacueesData[0][i][1]), to: new Point(evacueesData[0][i][2],-evacueesData[0][i][3]), strokeColor:colors['fg'], strokeCap: 'round', dashArray: [2,10], strokeWidth: velocitiesSize }));
	}

	for (var i=0; i<numberOfEvacuees; i++) {
		evacBalls.addChild(new Path.Circle({center: new Point(evacueesData[0][i][0],-evacueesData[0][i][1]), radius: ballsSize, fillColor: colors['doseN'] }));
	}

}

function updateAnimatedElement(i) {
	// Lerps are Linear Interpolations. 
	// There is data for each frame. Within each frame there are evacBalls positions. We take first frame and loop thru each evacuee. But we are not done with this frame yet:
	// We can have say 1 or 1000 of lerps (invented positions) between each two frames. This is for both smoothening animations and for slow/fast playbacks. 
	// We remove an evacuee by making it transparent. When we rewind, then we initialize all opacities with 1 again.

	// todo performance? 
	// if(frame == 0 || evacueesData[frame][i][5] != evacueesData[frame-1][i][5] ) {  evacBalls.children[i].opacity=evacVelocities.children[i].opacity=evacueesData[frame][i][5]; }
	// if(frame == 0 || evacueesData[frame][i][4] != evacueesData[frame-1][i][4] ) {  evacBalls.children[i].fillColor=colors['dose'+evacueesData[frame][i][4]]; } 
	evacBalls.children[i].opacity=evacVelocities.children[i].opacity=evacueesData[frame+1][i][5]; 
	evacBalls.children[i].fillColor=colors['dose'+evacueesData[frame][i][4]]; 

	evacBalls.children[i].position.x =   evacueesData[frame][i][0] + (evacueesData[frame+1][i][0] - evacueesData[frame][i][0]) * (lerpFrame%lerps)/lerps; 
	evacBalls.children[i].position.y = - evacueesData[frame][i][1] - (evacueesData[frame+1][i][1] - evacueesData[frame][i][1]) * (lerpFrame%lerps)/lerps; 

	evacVelocities.children[i].segments[0].point.x = evacBalls.children[i].position.x;
	evacVelocities.children[i].segments[0].point.y = evacBalls.children[i].position.y;
	evacVelocities.children[i].segments[1].point.x = evacBalls.children[i].position.x + evacueesData[frame][i][2];
	evacVelocities.children[i].segments[1].point.y = evacBalls.children[i].position.y - evacueesData[frame][i][3];
}

function afterLerpFrame() {
	// The slider moves after each frame. The slider is a collection of 100 svg rectangles. We need to clear the previous rectangle and mark the current rectangle
	$('#slider_'+(sliderPos)).css("fill", "#000");
	$("sim-time").html(animTimeFormat());
	sliderPos=Math.round(lerpFrame/(lerps*lastFrame)*100);
	lerpFrame++;
	$('#slider_'+(sliderPos-0)).css("fill", "#555");

	if(lerpFrame%lerps==0) {
		frame++;
	}

	// We need to rewind animation to the beginning before someone calls [frame+1]
	if(frame >= lastFrame) { 
		frame=0; 
		lerpFrame=0; 
	} 

}

function onMouseDrag(event) {
	var offset = event.downPoint - event.point;
	view.center = view.center + offset;
};


function onMouseDown(event) {
	animationIsRunning=0;
	lerps=9999999999; // pause
	var x;
	var y;
	//$("canvas-mouse-coords").text(Math.floor(event.downPoint['x']/100)+","+Math.floor(event.downPoint['y']/100));
	$("canvas-mouse-coords").text(Math.floor(event.downPoint['x'])+ "," + -Math.floor(event.downPoint['y']));
	$("canvas-mouse-coords").css({'display':'block', 'left':event.event.pageX, 'top':event.event.pageY});
	for (var i = 0; i < numberOfEvacuees; i++) { 
		x=evacBalls.children[i].position.x;
		y=evacBalls.children[i].position.y;
		evacLabels.addChild(new Path.Circle({ center: new Point(x,y), radius:ballsSize*1.4, fillColor:"#f80" }));
		evacLabels.addChild(new PointText(  { point: new Point(x-ballsSize/1,y-ballsSize/3), fillColor:"#000", content: "e"+i, fontFamily: 'Play', fontSize: ballsSize*0.7 }));
		evacLabels.addChild(new PointText(  { point: new Point(x-ballsSize/1,y+ballsSize/2), fillColor:"#000", content: [Math.round(x/100),Math.round(y/100)], fontFamily: 'Play', fontSize: ballsSize*0.7}));
	}
};

$('show-animation-setup-box').click(function() {
	$('animation-setup-box').toggle(400);
});

function listenEvents() {
	$('#labels-size').on('keyup'     , function() { labelsSize=this.value     ; resetCanvas() ; })
	$('#walls-size').on('keyup'      , function() { wallsSize=this.value      ; resetCanvas() ; })
	$('#doors-size').on('keyup'      , function() { doorsSize=this.value      ; resetCanvas() ; })
	$('#balls-size').on('keyup'      , function() { ballsSize=this.value      ; resetCanvas() ; })
	$('#velocities-size').on('keyup' , function() { velocitiesSize=this.value ; resetCanvas() ; })

	$('canvas-mouse-coords').click(function() {
		lerps=Math.round(1/(($('#speed').val()/100)+0.00000000000000001))+1; 
		$("canvas-mouse-coords").delay(1500).fadeOut('slow'); 
		evacLabels.removeChildren();
		animationIsRunning=1;
	});


	$('#canvas').on( 'DOMMouseScroll mousewheel', function ( event ) {
	  if( event.originalEvent.detail > 0 || event.originalEvent.wheelDelta < 0 ) { //alternative options for wheelData: wheelDeltaX & wheelDeltaY
		view.scale(0.6);
	  } else {
		view.scale(1.4);
	  }
	  //prevent page fom scrolling
	  return false;
	});


	$('#style-change').on('change', function() {
		if (this.value == "Light") { 
			doorsSize=0;
			labelsSize=0;
			resetCanvas(); 
			colors=colorsDb['lightColors']
		} else {
			colors=colorsDb['darkColors']
		}
		resetCanvas();
		$("canvas").css("background", colors['bg']);
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
		$('.canvas_slider_rect').css("fill" , "#000");
	});
}

function animTimeFormat() {
	var date=new Date(null);
	var t=timeShift+deltaTime*sliderPos/100
	date.setSeconds(t);
	return date.toISOString().substr(14,5);
};


function highlightGeom(key) {
	try {
		new Path.Rectangle({point: new Point(Math.round(rooms[key]["x0"]),-Math.round(rooms[key]["y0"])), size: new Size(Math.round(rooms[key]["width"]),-Math.round(rooms[key]["depth"])), opacity:0.4, fillColor: "#0f0"});
	} catch(e) {
		new Path.Circle({center: new Point(Math.round(doors[key]["center_x"]),-Math.round(doors[key]["center_y"])), radius: 100,  opacity:0.4, fillColor: "#0f0"});
	}
}

function onFrame(event) {
	// Main animation loop
	if (animationIsRunning==1) {
		for (var i = 0; i < numberOfEvacuees; i++) { 
			updateAnimatedElement(i);
		}
		afterLerpFrame();
	}
}



