var animsList;
var currentAnimMeta;
var currentAnimData;
var incDB;
var colors;
var wallsSize=0;
var doorsSize;
var evacueeRadius;
var velocitiesSize;
var eData=[];
var roomsOpacity=[];
var doorsOpening=[];
var dstatic;
var dstaticAllFloors;
var paused=0;
var lerps;
var lastFrame=1;
var labelsSize=50;
var sliderPos=0;
var lerpFrame=0;
var frame=0;
var frame_to_skip = 9999999;
var velocitiesGroup={};
var evacueesGroup={};
var evacueesLabelsGroup={};

paper.install(window);
window.onload = function() {
	paper.setup('animator-canvas');
	var tool=new Tool;
	makeAnimationControls();
	resizeAndRedrawCanvas();
	right_menu_box();
	listenEvents();
	createSelect();

function createSelect(){
	var anim_params = document.getElementById("anim_params").textContent;
	anim_params = JSON.parse(anim_params)[0]['anim_params'];
	if (anim_params != 'NULL'){
		anim_params = JSON.parse(anim_params)
		var rooms = ['Select room'];
		for(var r in anim_params){
			rooms.push(r);
		}
		rooms.sort()
		var selectRooms = document.getElementById('selRooms');
		for (var i = 0; i < rooms.length; i++) {
			var option = document.createElement("option");
			option.value = rooms[i];
			option.text = rooms[i];
			selectRooms.appendChild(option);
		}
		var selectParams = document.getElementById('selParams');
		var room = "";
		selectRooms.addEventListener("change", (event) => {
			room = event.target.value;
			selectParams.innerHTML = '';
			var params = [];
			params.push(anim_params[room]);
			var option = document.createElement("option");
				option.value = "";
				option.text = "Select param";
				selectParams.appendChild(option);
			for (var i = 0; i < params[0].length; i++) {
				var option = document.createElement("option");
				option.value = params[0][i];
				option.text = params[0][i];
				selectParams.appendChild(option);
			}
		});
		selectParams.addEventListener("change", (event) => {
			loadImage(event.target.value+"_"+room+".png");
		});
	}
}
function loadImage(file){
	const urlParams = new URLSearchParams(window.location.search);
	const iter = urlParams.get('iter');
	$.get('/aamks/ajax.php?ajaxShowImage&img='+iter+'_'+file, function (response) {
		var _img = document.getElementById('image');
		var newImg = new Image;
		newImg.onload = function() {
			_img.src = this.src;
		}
		newImg.src = response
	})
}
function initLayers() {//{{{
	new Layer({'name': 'rooms'});
	new Layer({'name': 'roomSmoke'});
	new Layer({'name': 'roomFire'});
	new Layer({'name': 'highlight'});
	new Layer({'name': 'animated'});
	new Layer({'name': 'info'});
}
//}}}
function listenForSpeedChange() {//{{{
	$("svg-slider").on("click", function(){
		clearEvacueesLabels();
		paused=0;
	})

	$("body").on("keyup", '#speed', function() {
		clearEvacueesLabels();
		paused=0;
		changeSpeed(parseInt($('#speed').val()));
	});

	$(this).keydown((e) => {
		if (e.keyCode == 32) {
			$("input").blur();
			$("select").blur();
			if(paused==1) {
				clearEvacueesLabels();
				paused=0;
			} else {
				showEvacueesLabels();
				paused=1;
			}
			$("canvas-mouse-coords").delay(1500).fadeOut('slow');
		}
	});
}
//}}}
function listenEvents() {//{{{
	$(window).resize(resizeAndRedrawCanvas);

	$('body').on('keyup' , '#labels-size'     , function() { labelsSize=this.value     ; resetCanvas() ; })
	$('body').on('keyup' , '#doors-size'      , function() { doorsSize=this.value      ; resetCanvas() ; })
	$('body').on('keyup' , '#walls-size'      , function() { wallsSize=this.value      ; resetCanvas() ; })
	$('body').on('keyup' , '#evacuee-radius'  , function() { evacueeRadius=this.value  ; resetCanvas() ; })
	$('body').on('keyup' , '#velocities-size' , function() { velocitiesSize=this.value ; resetCanvas() ; })
	$('body').on('click' , '.switch-floor'    , function() { switchFloor($(this).attr('data-floor')); })

	$('#animator-canvas').on( 'DOMMouseScroll mousewheel', function ( event ) {
	  if( event.originalEvent.detail > 0 || event.originalEvent.wheelDelta < 0 ) { //alternative options for wheelData: wheelDeltaX & wheelDeltaY
		view.scale(0.95);
	  } else {
		view.scale(1.05);
	  }
	  //prevent page fom scrolling
	  return false;
	});


	$('body').on('change', '#style-change', function() {
		if (this.value == "Light") {
			setColors('light');
		} else {
			setColors('dark');
		}
		resetCanvas();
	});

	$('body').on('change', '#highlight-geoms', function() {
		if(this.value.length>0) { highlightGeom(this.value); }
	});
	$('body').on('click', '.canvas_slider_rect', function() {
		sliderPos=$(this).data('id');
		lerpFrame=Math.floor(sliderPos*lastFrame*lerps/100);
		frame=Math.floor(lerpFrame/lerps);
		$('.canvas_slider_rect').attr("fill", "#333");
	});

	listenForSpeedChange();
}
//}}}
function right_menu_box() {//{{{
	$("body").on("click", "close-right-menu-box", function() {
		project.layers.highlight.removeChildren();
	});
    $("body").on("click", '#button-info', function() {
		if ($("#animator-canvas").width() >= $(window).width()-20){
			$("#animator-canvas").width('73%');
		} else {
			$("#animator-canvas").width('100%');
		}
	});
	$("body").on("click", '#button-setup', function() { $('right-menu-box').fadeIn(); });
}
//}}}
function setColors(mode) {//{{{
	colors={};
	for (var i in incDB['aamksGeoms']) {
		colors[incDB['aamksGeoms'][i]['x']]=_.cloneDeep(incDB['aamksGeoms'][i]);
		if(mode=='light') {
			colors[incDB['aamksGeoms'][i]['x']]['c']=colors[incDB['aamksGeoms'][i]['x']]['lightc'];
			colors[incDB['aamksGeoms'][i]['x']]['stroke']="#000";
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
		amsg(response);
		animsList=response['data'];
		currentAnimMeta=animsList[0];
		showStaticImage();
	});
});
//}}}
function makeChooseVis() {//{{{
	// Droplist of anims.json (all registered visualizations)
	var items = [];
	items.push("<select id=choose-vis>");
	items.push( "<option value=''>" + currentAnimMeta['title'].substr(0,24) + " " + currentAnimMeta['time'] +"</option>" );
	for (var i=0; i < animsList.length; i++) {
		items.push( "<option value='" + i + "'>" + animsList[i]["title"].substr(0,24) + " " + animsList[i]["time"] +"</option>" );
	}
	items.push("</select>");
	$("choose-vis").html(items.join());
	$('#choose-vis').on('change', function() {
		lerpFrame=0;
		frame=0;
		currentAnimMeta=animsList[this.value];
		showStaticImage();
	});
};
//}}}
function rescaleCanvas(meta) {//{{{
	if(meta=='world2d') {
		var center=dstatic.world_meta.center;
		var xdim=dstatic.world_meta.xdim;
		var ydim=dstatic.world_meta.ydim;
	} else {
		var center=[dstatic.floors[meta].floor_meta.center[0] + dstatic.floors[meta].floor_meta.tx, dstatic.floors[meta].floor_meta.center[1] + dstatic.floors[meta].floor_meta.ty, 0];
		var xdim=  dstatic.floors[meta].floor_meta.xdim;
		var ydim=  dstatic.floors[meta].floor_meta.ydim;
	}
	var scale=Math.min(($(window).width() - 20) / xdim, ($(window).height() - 70) / ydim)*0.9;
	view.setScaling(scale);
	view.center = new Point(center);
	scaleAnims();
}
//}}}
function switchFloor(chosen_floor) {//{{{
	dstatic=_.cloneDeep(dstaticAllFloors);
	if(chosen_floor!='all') {
		_.each(dstatic.floors, function(ffloor,floor_name) {
			if(floor_name!=chosen_floor) {
				delete dstatic.floors[floor_name];
			}
		});
		rescaleCanvas(chosen_floor);
	} else {
		rescaleCanvas('world2d');
	}
	resetCanvas();
}
//}}}
function floorLinks() {//{{{
	var links='floor: ';
	links+="<a class='blink switch-floor' data-floor=all>all</a>";
	_.each(dstatic.floors, function(ffloor,floor_name) {
		links+="<a class='blink switch-floor' data-floor="+floor_name+">"+floor_name+"</a>";
	});
	$("animator-floor-links").html(links);
}
//}}}
function floors_ranges() {//{{{
	dstatic.floor_ranges=[];
	_.each(dstatic.floors, function(ffloor) {
		var f=ffloor['floor_meta'];
		dstatic.floor_ranges.push({ 'floor': f.name, 'tx': f.tx, 'ty': f.ty, 'minx':f.minx+f.tx, 'maxx':f.maxx+f.tx, 'miny': f.miny+f.ty, 'maxy': f.maxy+f.ty});
	});
}
//}}}
function showStaticImage() {//{{{
	// After we read a record from anims.json we reset the current visualization and setup a new one.
	// We can only start animation after we are done with static rooms, doors etc.

	$.post('/aamks/ajax.php?ajaxAnimsStatic', function(response) {
		amsg(response);
		dstatic=response['data'];
		floors_ranges();
		dstaticAllFloors=response['data'];
		rescaleCanvas('world2d');
		$("animator-title").html("<choose-vis></choose-vis>");
		$("animator-time").html(currentAnimMeta['time']);

		floorLinks();
		resetCanvas();
		makeSetupBoxInputs();
		makeColors();
		highlightDroplist();
		makeChooseVis();
	});
}
//}}}
function showEvacueesLabels() {//{{{
	if(eData.length<1) { return; }
	evacueesInFrame(); // requrired to sync evacuees with labels positions
	_.each(eData[0], function(frame0_data,ffloor) {
		_.each(frame0_data, function(e,i) {
			x=evacueesGroup[ffloor].children[i].position.x;
			y=evacueesGroup[ffloor].children[i].position.y;
			addEvacueeLabel(ffloor, i, x, y)

		})
	})
}

function addEvacueeLabel(ffloor,i, x, y) {
	evacueesLabelsGroup[ffloor].addChild(new PointText(  { point: new Point(15+x-evacueeRadius/1,y-evacueeRadius/7), fillColor:"#000", content: i+1, fontFamily: 'Roboto', fontSize: evacueeRadius*0.5 }));
	evacueesLabelsGroup[ffloor].addChild(new PointText(  { point: new Point(10+x-evacueeRadius/1,y+evacueeRadius/3), fillColor:"#000", content: [Math.round(x/100),Math.round(y/100)], fontFamily: 'Roboto', fontSize: evacueeRadius*0.5}));
}
//}}}
function initSpeed() {//{{{
	lastFrame=eData.length-1;
	var speed=Math.round(lastFrame/5)
	$("animator-time").html(animFormatTime());
	$("animation-speed").html("<input type=text size=2 name=speed id=speed value="+speed+">");
	changeSpeed(speed);
}
//}}}
function clearEvacueesLabels() {//{{{
	_.each(eData[0], function(frame0_data,ffloor) {
		evacueesLabelsGroup[ffloor].removeChildren();
	})
}
//}}}
function changeSpeed(speed) {//{{{
	lerps=Math.round(100/(speed+0.0000000000000000001))+1;
	lerpFrame=Math.floor(sliderPos*lastFrame*lerps/100);
	$('.canvas_slider_rect').attr("fill", "#333");
}
//}}}
function showAnimation() {//{{{
	// After static data is loaded to paperjs we can run animations.

	$.post('/aamks/ajax.php?ajaxSingleAnim', { 'unzip': currentAnimMeta['anim'] }, function(response) {
		amsg(response);
		paused=0;
		currentAnimData=JSON.parse(response['data']);
		eData=currentAnimData.animations.evacuees;
		roomsOpacity=currentAnimData.animations.rooms_opacity;
		initRoomSmoke();
		initAnimAgents();
		initSpeed();
	});
}
//}}}
function scaleAnims() {//{{{
	velocitiesSize=Math.round(1/view.scaling.x);
	doorsSize=wallsSize;
}
//}}}
function resetCanvas() {//{{{
	// Reset on new visualization, on scaling walls, etc.

	eData=[];
	project.clear();
	initLayers();
	initStaticGeoms();
	letItBurn();

	if(currentAnimMeta["highlight_geom"]!=null) { highlightGeom(currentAnimMeta["highlight_geom"]); }
	if(currentAnimMeta["anim"] != undefined)    { showAnimation(currentAnimMeta); }

}
//}}}
function makeAnimationControls() {//{{{
	$('body').append("<legend0/>").append("<legend1/>").append("<legend2/>");
	make_legend0("animator");
	make_legend2("animator");
	$('legend0').css({'width': '710px', 'top': '3px', 'display': 'flex', 'align-items': 'center'});
	var items = [];
	var ww=3;
	items.push(" &nbsp; <animator-time style='user-select: none'></animator-time> &nbsp; ");
	items.push("<svg id=animator-time-svg width='"+ww+"00px' height='20px' style='fill: #333; border: 1px solid #555'>");
	items.push("<rect id=animator-time-scroller x='0px' y='0px' height='20px'></rect>");
	for (var i=0; i<100; i++) {
		items.push("<rect class=canvas_slider_rect data-id='"+i+"' id='slider_"+i+"' x='"+(i*ww+1)+"' y='1' width='"+ww+"px' height='18px'></rect>");
	}
	items.push("</svg>");
	items.push("<animator-title />");
	$("legend0").append(items.join(""));
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
function highlightDroplist() {//{{{
	var items = [];
	items.push("<select id=highlight-geoms>");
	items.push("<option value=''></option>");
	items.push("<option value=''>ROOMS</option>");
	_.each(dstatic.floors, function(ffloor,floor_name) {
        _.each(ffloor.rooms, function(d) {
			items.push("<option value="+d['name']+">"+floor_name+": "+d['name']+"</option>");
		})
	})

	items.push("<option value=''>DOORS</option>");
	_.each(dstatic.floors, function(ffloor,floor_name) {
        _.each(ffloor.doors, function(d) {
			items.push("<option value="+d['name']+">"+floor_name+": "+d['name']+"</option>");
		})
	})

	items.push("</select>");
	$("highlight-geoms").html(items.join());
};

//}}}
function letItBurn() {//{{{
	// The animated fire is displayed in a separate setInterval loop. Perhaps onFrame() suits more.
	var smoke;
	var smokeOrig;
	var fire;
	if(!(currentAnimMeta['fire_origin']['floor'] in dstatic.floors)) { return; }
	var tx=dstatic.floors[currentAnimMeta['fire_origin']['floor']].floor_meta.tx;
	var ty=dstatic.floors[currentAnimMeta['fire_origin']['floor']].floor_meta.ty;

	project.layers.roomFire.importSVG("smoke.svg", function (item) {
		item.position.x = currentAnimMeta['fire_origin']['x']+tx;
		item.position.y = currentAnimMeta['fire_origin']['y']+ty-40;
		smoke=item;
		smoke.opacity=0.5;
		smokeOrig=item.bounds;
		// This way the z-order is preserved
		project.layers.roomFire.importSVG("fire.svg", function (item) {
			item.position.x = currentAnimMeta['fire_origin']['x']+tx;
			item.position.y = currentAnimMeta['fire_origin']['y']+ty;
			fire=item;

		});
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

	},500);
}
//}}}
function drawMeta(floor,tx,ty) {//{{{
	project.layers.info.activate();
	fillColor = "#fff";
	opacity = 0.1;
	fontSize = labelsSize * 5;
	pos=[ dstatic.world_meta['minx'] + tx - 500, dstatic.floors[floor]['floor_meta']['center'][1] + ty + 200 ] ;
	new PointText({ point: new Point(pos[0], pos[1]), content: floor, opacity: opacity, fontFamily: fontFamily, fontSize: fontSize, fillColor: fillColor });
}
//}}}
function drawPath(type,data,tx,ty) {//{{{
	if(type=='ROOM') {
        var points=JSON.parse(data.points)
		strokeColor = colors[type].stroke;
		opacity = colors[type].animOpacity;
		fillColor = data.room_enter == 'yes' ? colors[data.type_sec].c : "#333";
		var path=new Path({fillColor:fillColor, opacity:opacity });
	}
	if(type=='DOOR') {
        var points=JSON.parse(data.points)
		strokeWidth = doorsSize;
		strokeColor = colors[type].stroke;
		opacity = colors[type].animOpacity;
		fillColor = colors[type].c;
		var path=new Path({strokeColor:strokeColor, strokeWidth:strokeWidth, opacity:opacity });
	}
	if(type=='OBST') {
        var points=JSON.parse(data)
		strokeColor = colors[type].stroke;
		opacity = colors[type].animOpacity;
		fillColor = colors[type].c;
		strokeWidth = wallsSize;
		var path=new Path({strokeColor:strokeColor, strokeWidth:strokeWidth, fillColor:fillColor, opacity:opacity });
	}

	//path.closed = true;
	_.each(points, function(point) { path.add(new Point(point[0]+tx, point[1]+ty)); });
}
//}}}
function drawLabel(type,data,tx,ty) {//{{{
    var points=JSON.parse(data.points)
	fontFamily = 'Roboto';
	content = data.name;
	if(type=='ROOM') {
		fillColor = colors.fg.c;
		fontSize = labelsSize;
		opacity = colors.fg.animOpacity;
		pos=[points[0][0] + tx + 30, points[0][1] + ty + 70];
	}
	if(type=='DOOR') {
		if(points[1][0] - points[0][0] > 32) {
			// horizontal door
			ttx=20; tty=30;
		} else {
			ttx=0; tty=50;
		}
		fillColor = colors.fg.c;
		opacity = colors.fg.animOpacity;
		fontSize = labelsSize * 0.60;
		pos=[points[0][0] + tx + ttx, points[0][1] + ty + tty];
	}
	new PointText({ point: new Point(pos[0], pos[1]), content: content, opacity: opacity, fontFamily: fontFamily, fontSize: fontSize, fillColor: fillColor });
}
//}}}
function drawStaticEvacuees(data,tx,ty) {//{{{
    var points=[];
    _.each(data, function(pp) { points.push(JSON.parse(pp))});
	if(currentAnimMeta["anim"] == undefined) {
		radius=evacueeRadius;
		strokeWidth=0;
		fillColor: colors['color_N']['c'];

		_.each(points, function(point) {
			new Path.Circle({ center: new Point(point[0]+tx, point[1]+ty), radius: radius, strokeWidth:strokeWidth , fillColor: fillColor });
		});
	}
}
//}}}
function drawDDGeoms(data,tx,ty) { //{{{
    var d;
	_.each(data.rectangle, function(pp) {
		pp['g']=JSON.parse(pp['g']);
        d=pp['style'];
        d['point']=new Point(pp['g']['p0'][0]+tx, pp['g']['p0'][1]+ty);
        d['size']=new Size(pp['g']['size']);
		new Path.Rectangle(d);
	});

	_.each(data.path, function(pp) {
		pp['g']=JSON.parse(pp['g']);
		var path=new Path(pp['style']);
		_.each(pp['g']['points'], function(point) { path.add(new Point(point[0]+tx, point[1]+ty)); });
	});

	_.each(data.circle, function(pp) {
		pp['g']=JSON.parse(pp['g']);
        d=pp['style'];
        d['center']=new Point(pp['g']['p0'][0]+tx, pp['g']['p0'][1]+ty);
        d['radius']=pp['g']['radius'];
        new Path.Circle(d);
	});

	_.each(data.text, function(pp) {
		pp['g']=JSON.parse(pp['g']);
        d=pp['style'];
        d['point']=new Point(pp['g']['p0'][0]+tx, pp['g']['p0'][1]+ty);
        d['content']=pp['g']['content'];
		new PointText(d);
	});
}

//}}}
function initStaticGeoms() {//{{{
	var tx, ty;
	_.each(dstatic.floors, function(ffloor) {
		project.layers.rooms.activate();
        tx=ffloor.floor_meta.tx;
        ty=ffloor.floor_meta.ty;

        _.each(ffloor.rooms     , function(d) { drawPath('ROOM'  , d , tx , ty); });
        _.each(ffloor.obstacles , function(d) { drawPath('OBST'  , d , tx , ty); });
		_.each(ffloor.doors     , function(d) { drawPath('DOOR'  , d , tx , ty); });
		_.each(ffloor.rooms     , function(d) { drawLabel('ROOM' , d , tx , ty); });
		_.each(ffloor.doors     , function(d) { drawLabel('DOOR' , d , tx , ty); });

		drawStaticEvacuees(ffloor.evacuees, tx, ty);
        drawDDGeoms(ffloor.dd_geoms, tx, ty);
		project.layers.info.activate();
        drawMeta(ffloor['floor_meta']['name'],tx,ty);
    });


}
//}}}
function initAnimAgents() { //{{{
	// velocitiesGroup are the ---------> vectors attached to each ball
	// evacueesLabelsGroup are (e1 x,y) displayed on top of each ball

	project.layers.animated.activate();

	_.each(eData[0], function(frame0_data,ffloor) {
		velocitiesGroup[ffloor]=new Group();
		evacueesGroup[ffloor]=new Group();
		evacueesLabelsGroup[ffloor]=new Group();
		_.each(frame0_data, function(data) {
			velocitiesGroup[ffloor].addChild(new Path.Line({from: new Point(-10000, -10000), to: new Point(-10000,-10000), strokeColor:colors['fg']['c'], strokeCap: 'round', dashArray: [2,10], strokeWidth: velocitiesSize }));
			evacueesGroup[ffloor].addChild(new Path.Circle({center: new Point(-10000, -10000), radius: evacueeRadius}));

		});
	});

}
//}}}


// function addEvacueesAndVelocities(count,ffloor){
// 	for(let i=0; i<count; i++){
// 		evacueesGroup[ffloor].addChild(new Path.Circle({center: new Point(-10000, -10000), radius: evacueeRadius}));
// 		velocitiesGroup[ffloor].addChild(new Path.Line({from: new Point(-10000, -10000), to: new Point(-10000,-10000), strokeColor:colors['fg']['c'], strokeCap: 'round', dashArray: [2,10], strokeWidth: velocitiesSize }));
// 	}

// }
function updateAgentNumbersOnFloors(){
	if(frame_to_skip == frame){
	// 		sdfsdfsdsdf()
		return;
	}

	_.each(evacueesGroup, function(data,ffloor) {
		if(ffloor in dstatic.floors) {
			if(Object.keys(eData[frame][ffloor]).length != data.children.length){
				updateEvacueesOnEachFloor();
				frame_to_skip = frame;
				return;
			}
		}
	})
}



function updateEvacueesOnEachFloor(){
	// _.each(evacueesGroup, function(data,ffloor) {
	// 	if(ffloor in dstatic.floors) {
	// 		if(eData[frame][ffloor].length > data.children.length){
	// 			for (var i=0; i < eData[frame][ffloor].length-data.children.length; i++) {
	// 				addAgentToFloor(ffloor,)
	// 				removaAgentFromFloor(ffloor+1,)
	// 				data.AddChild(new Path.Circle({center:
	// 					new Point(
	// 						eData[frame][ffloor][eData[frame][ffloor].length-i-1][0],
	// 						eData[frame][ffloor][eData[frame][ffloor].length-i-1][1]),
	// 						radius: evacueeRadius}));
	// 				}
	// 		}
	// 	}
	// })
	_.each(eData[frame], function(frame0_data,ffloor) {
		evacueesLabelsGroup[ffloor].removeChildren();
		velocitiesGroup[ffloor].removeChildren();
		evacueesGroup[ffloor].removeChildren();
		// velocitiesGroup[ffloor]=new Group();
		// evacueesGroup[ffloor]=new Group();
		// evacueesLabelsGroup[ffloor]=new Group();
		_.each(frame0_data, function(data, i) {
			// x = data[0]
			// y = data[1]
			// x_to = x + data[2]
			// y_to = y + data[3]
			evacueesGroup[ffloor].addChild(new Path.Circle({center: new Point(-10000, -10000), radius: evacueeRadius}));
			velocitiesGroup[ffloor].addChild(new Path.Line({from: new Point(-10000, -10000), to: new Point(-10000,-10000), strokeColor:colors['fg']['c'], strokeCap: 'round', dashArray: [2,10], strokeWidth: velocitiesSize }));
			//velocitiesGroup[ffloor].addChild(new Path.Line({from: new Point(x, y), to: new Point(x_to,y_to), strokeColor:colors['fg']['c'], strokeCap: 'round', dashArray: [2,10], strokeWidth: velocitiesSize }));
			//evacueesGroup[ffloor].addChild(new Path.Circle({center: new Point(x, y), radius: evacueeRadius}));
		});

	// _.each(evacueesGroup, function(data,ffloor) {
	// 	if(ffloor in dstatic.floors) {
	// 		_.each(data.children, function(e,i) {
	// 			e.fillColor=colors['color_'+eData[frame][ffloor][i][4]]['c'];
	// 			e.position.x = eData[frame][ffloor][i][0];
	// 			e.position.y = eData[frame][ffloor][i][1];
	// 		})
	// 	}
	// })

	// _.each(velocitiesGroup, function(data,ffloor) {
	// 	if(ffloor in dstatic.floors) {
	// 		_.each(data.children, function(e,i) {
	// 			e.segments[0].point.x = evacueesGroup[ffloor].children[i].position.x;
	// 			e.segments[0].point.y = evacueesGroup[ffloor].children[i].position.y;
	// 			e.segments[1].point.x = evacueesGroup[ffloor].children[i].position.x + eData[frame][ffloor][i][2];
	// 			e.segments[1].point.y = evacueesGroup[ffloor].children[i].position.y + eData[frame][ffloor][i][3];
	// 		})
	// 	}
	// })


		// _.each(evacueesGroup, function(data,ffloor) {
		// 	if(ffloor in dstatic.floors) {
		// 		_.each(data.children, function(e,i) {
		// 			e.fillColor=colors['color_'+eData[frame][ffloor][i][4]]['c'];
		// 			e.position.x = eData[frame][ffloor][i][0] + (eData[frame+1][ffloor][i][0] - eData[frame][ffloor][i][0]) * (lerpFrame%lerps)/lerps;
		// 			e.position.y = eData[frame][ffloor][i][1] + dstatic.floors[ffloor].floor_meta.ty + (eData[frame+1][ffloor][i][1] - eData[frame][ffloor][i][1] ) * (lerpFrame%lerps)/lerps;
		// 		})
		// 	}
		// })
	});

}

// function sdfsdfsdsdf(){

// 	_.each(evacueesGroup, function(data,ffloor) {
// 		if(ffloor in dstatic.floors) {
// 			_.each(data.children, function(e,i) {
// 				e.fillColor=colors['color_'+eData[frame][ffloor][i][4]]['c'];
// 				e.position.x = eData[frame][ffloor][i][0] + (eData[frame+1][ffloor][i][0] - eData[frame][ffloor][i][0]) * (lerpFrame%lerps)/lerps;
// 				e.position.y = eData[frame][ffloor][i][1] + dstatic.floors[ffloor].floor_meta.ty + (eData[frame+1][ffloor][i][1] - eData[frame][ffloor][i][1] ) * (lerpFrame%lerps)/lerps;
// 			})
// 		}
// 	})

// 	_.each(velocitiesGroup, function(data,ffloor) {
// 		if(ffloor in dstatic.floors) {
// 			_.each(data.children, function(e,i) {
// 				e.segments[0].point.x = evacueesGroup[ffloor].children[i].position.x;
// 				e.segments[0].point.y = evacueesGroup[ffloor].children[i].position.y;
// 				e.segments[1].point.x = evacueesGroup[ffloor].children[i].position.x + eData[frame][ffloor][i][2];
// 				e.segments[1].point.y = evacueesGroup[ffloor].children[i].position.y + eData[frame][ffloor][i][3];
// 			})
// 		}
// 	})

// }
function evacueesInFrame() {//{{{
	// Lerps are Linear Interpolations.
	// There is eData for each frame. Within each frame there are evacueesGroup positions. We take first frame and loop thru each evacuee. But we are not done with this frame yet:
	// We can have say 1 or 1000 of lerps (invented positions) between each two frames. This is for both smoothening animations and for slow/fast playbacks.
	// We remove an evacuee by making it transparent. When we rewind, then we initialize all opacities with 1 again.



	// check whether current frame is related to the change in the number of agents
	// on any floor (going downstairs by agents) if so, update the evacueesGroup data
	// to make proper numer of agents on each floor




	// _.each(evacueesGroup, function(data,ffloor) {
	// 	if(ffloor in dstatic.floors) {
	// 		if(data.children.length < Object.keys(eData[frame][ffloor]).length)
	// 			addEvacueesAndVelocities(data.children.length, ffloor)
	// 		}
	// })

	_.each(evacueesGroup, function(data,ffloor) {
		if(ffloor in dstatic.floors) {
			agentsOnFloorKeys = Object.keys(eData[frame][ffloor])
			_.each(data.children, function(e,i) {
				if(agentsOnFloorKeys[i] in eData[frame+1][ffloor]){
					e.fillColor=colors['color_'+eData[frame][ffloor][agentsOnFloorKeys[i]][4]]['c'];
					e.position.x = eData[frame][ffloor][agentsOnFloorKeys[i]][0] + (eData[frame+1][ffloor][agentsOnFloorKeys[i]][0] - eData[frame][ffloor][agentsOnFloorKeys[i]][0]) * (lerpFrame%lerps)/lerps;
					e.position.y = eData[frame][ffloor][agentsOnFloorKeys[i]][1] + dstatic.floors[ffloor].floor_meta.ty + (eData[frame+1][ffloor][agentsOnFloorKeys[i]][1] - eData[frame][ffloor][agentsOnFloorKeys[i]][1] ) * (lerpFrame%lerps)/lerps;
				}
				else{
					e.fillColor=colors['color_'+eData[frame][ffloor][agentsOnFloorKeys[i]][4]]['c'];
					e.position.x = eData[frame][ffloor][agentsOnFloorKeys[i]][0];
					e.position.y = eData[frame][ffloor][agentsOnFloorKeys[i]][1] + dstatic.floors[ffloor].floor_meta.ty
				}

			})
		}
	})

	_.each(velocitiesGroup, function(data,ffloor) {
		if(ffloor in dstatic.floors) {
			agentsOnFloorKeys = Object.keys(eData[frame][ffloor])
			_.each(data.children, function(e,i) {
				e.segments[0].point.x = evacueesGroup[ffloor].children[i].position.x;
				e.segments[0].point.y = evacueesGroup[ffloor].children[i].position.y;
				e.segments[1].point.x = evacueesGroup[ffloor].children[i].position.x + eData[frame][ffloor][agentsOnFloorKeys[i]][2];
				e.segments[1].point.y = evacueesGroup[ffloor].children[i].position.y + eData[frame][ffloor][agentsOnFloorKeys[i]][3];
			})
		}
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
		frame_to_skip = 9999999;
	}

}
//}}}
tool.onMouseDrag=function(event) {//{{{
	view.setCenter(view.center.x + event.downPoint.x - event.point.x, view.center.y + event.downPoint.y - event.point.y);
};

//}}}
tool.onMouseDown=function(event) {//{{{
	var hit=false;
	var x=Math.floor(event.downPoint['x']);
	var y=Math.floor(event.downPoint['y']);
	_.each(dstatic.floor_ranges, function(f) {
		if(y >= f.miny && y <= f.maxy && x>= f.minx && x <= f.maxx) { hit=true; x=x-f.tx; y=y-f.ty; return false; }
	});
	if(hit === true) {
		$("canvas-mouse-coords").text(x+ "," +y);
		$("canvas-mouse-coords").css({'display':'block', 'left':event.event.pageX, 'top':event.event.pageY});
	}
};
//}}}
function animFormatTime() {//{{{
	var date=new Date(null);
	if (eData.length>0) {
		var t=currentAnimData.time_shift + (currentAnimData.simulation_time - currentAnimData.time_shift) * sliderPos / 100
	}
	if(isNaN(t))   { t=0; }
	date.setSeconds(t);
	return date.toISOString().substr(14,5);
};

//}}}
function highlightGeom(key) {//{{{
	project.layers.highlight.activate();
	_.each(dstatic.floors, function(ffloor) {
        tx=ffloor.floor_meta.tx;
        ty=ffloor.floor_meta.ty;
        _.each(ffloor.rooms, function(d) {
			if (d['name']==key) {
                var points=JSON.parse(d.points)
				rw=points[1][0] - points[0][0];
				rh=points[2][1] - points[1][1];
				new Path.Rectangle({point: new Point(points[0][0]+tx,points[0][1]+ty), size: new Size(rw,rh), opacity:0.4, fillColor: "#0f0"});
				return;
			}
		})
        _.each(ffloor.doors, function(d) {
			if (d['name']==key) {
                var points=JSON.parse(d.points)
				cx=points[0][0] + 0.5 * (points[1][0] - points[0][0]);
				cy=points[1][1] + 0.5 * (points[2][1] - points[1][1]);
				new Path.Circle({center: new Point(cx+tx,cy+ty), radius: 100,  opacity:0.4, fillColor: "#0f0"});
				return;
			}
		})
	})
}
//}}}
function randBetween(min, max) {//{{{
    return Math.random() * (max - min) + min;
}
//}}}
function initRoomSmoke() {//{{{
	project.layers.roomSmoke.activate();
	var radius=350;
	var roomMargin=25;
	var center;
	var rw, rh;

	for (var ffloor in roomsOpacity[0]) {
		if(dstatic.floors[ffloor]===undefined) { continue; }
        var ty=dstatic.floors[ffloor].floor_meta.ty;
        var tx=dstatic.floors[ffloor].floor_meta.tx;
		for (var room in roomsOpacity[0][ffloor]) {
            var pp=JSON.parse(dstatic.floors[ffloor]['rooms'][room]['points']);
			points=[];
			_.each(pp, function(i) { points.push([i[0]+tx, i[1]+ty]); });

			rw=points[1][0] - points[0][0];
			rh=points[2][1] - points[1][1];

			group=new Group();
			group.name=room;
			group.floor=ffloor;
			group.addChild(new Path.Rectangle({ opacity: roomsOpacity[0], point: new Point(points[0][0]+roomMargin, points[0][1]+roomMargin), fillColor:"#010", size: new Size(rw-2*roomMargin,rh-2*roomMargin)}));
		}
	}
}
//}}}
function roomsSmokeInFrame() {//{{{
	if (eData.length<1) { return; }
	_.each(project.layers.roomSmoke.getItems(), function(i,key) {
		project.layers.roomSmoke.children[key].opacity=roomsOpacity[frame][i.floor][i.name]*0.8;
	});
}

function initDoorsOpening() {//{{{
	project.layers.doorsOpening.activate();
	var rw, rh;

	for (var ffloor in doorsOpening[0]) {
		if(dstatic.floors[ffloor]===undefined) { continue; }
        var ty=dstatic.floors[ffloor].floor_meta.ty;
        var tx=dstatic.floors[ffloor].floor_meta.tx;
		for (var door in doorsOpening[0][ffloor]) {
            var pp=JSON.parse(dstatic.floors[ffloor]['doors'][door]['points']);
			points=[];
			_.each(pp, function(i) { points.push([i[0]+tx, i[1]+ty]); });

			rw=points[1][0] - points[0][0];
			rh=points[2][1] - points[1][1];

			group=new Group();
			group.name=door;
			group.floor=ffloor;
			group.addChild(new Path.Rectangle({point: new Point(points[0][0], points[0][1]), fillColor:"#010", size: new Size(rw,rh)}));
		}
	}
}
//}}}
function doorsOpeningInFrame() {//{{{
	if (eData.length<1) { return; }
	_.each(project.layers.doorsOpening.getItems(), function(i,key) {
		if(doorsOpening[frame][i.floor][i.name]==1) { project.layers.doorsOpening.children[key].opacity=0; }
		else if(doorsOpening[frame][i.floor][i.name]==0) { project.layers.doorsOpening.children[key].opacity=0.5; }
	});
}
//}}}
function resizeAndRedrawCanvas() {//{{{
	wWidth = $(window).width()-20;
	wHeight = $(window).height()-70;
	$("#animator-canvas").width(wWidth).height(wHeight);
	$("#animator-time-scroller").width(wWidth);
	view.viewSize = new Size(wWidth, wHeight);
	view.draw();
}

//}}}
view.onFrame=function(event) {//{{{
	if(paused==1) { return; }
	if (eData.length<3) {
		showEvacueesLabels();
		paused=1;
	} else {
		updateAgentNumbersOnFloors();
		evacueesInFrame();
		roomsSmokeInFrame();
		afterLerpFrame();
	}
}
//}}}

};
