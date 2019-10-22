var scene, camera, renderer, controls;

function createScene() { //{{{
	d3.select('view3d').append('canvas').attr('id', 'canvas3d').attr('width', win[0]).attr('height', win[1]);
	canvas = document.querySelector('#canvas3d');
	renderer = new THREE.WebGLRenderer({canvas, antialias: true});
	renderer.setClearColor(0x444444);
	document.body.appendChild(renderer.domElement);

	centerX=-(db().min('minx') + (db().max('maxx') -  db().min('minx'))/2)/100
	centerY=-(db().min('miny') + (db().max('maxy') -  db().min('miny'))/2)/100
	camera = new THREE.OrthographicCamera(win[0]/-50, win[0]/50, win[1]/50, win[1]/-50, 1, 1000);
	camera.position.set(-db().max('maxx')/5, 100, -db().max('maxy')/5);
	
	controls = new THREE.OrbitControls( camera, renderer.domElement );
	controls.target = new THREE.Vector3(centerX, 0, centerY);
	gridXZ = new THREE.GridHelper(100, 10, 0x4f4f4f, 0x4f4f4f);
	axesHelper = new THREE.AxesHelper();

	scene = new THREE.Scene();
    scene.add(gridXZ);
	scene.add(axesHelper);

	animate();

}
//}}}
function removeMeshes() { //{{{
	// Database could have been updated so it is best to just clear the scene and reread meshes
	//for (var i in scene.meshes) { 
	//	scene.meshes[i].destroy();
	//}
	dd('remove meshes');
}
//}}}
function createDoor(geom) {//{{{
	random=Math.random()/40;
	shape = new THREE.Shape();
	o=geom.polypoints.shift();
	shape.moveTo(-o[0]/100+random, o[1]/100+random);
	_.each(geom.polypoints, function(p) {
		shape.lineTo(-p[0]/100+random, p[1]/100+random);
	});
	shape.lineTo(-o[0]/100+random, o[1]/100+random);
	geometry.rotateX(THREE.Math.degToRad(270));
	
	material = new THREE.MeshBasicMaterial({
		color: gg[geom.letter].c,
		transparent: false
	});
	mesh = new THREE.Mesh(geometry, material) ;
	//scene.add(mesh);

}
//}}}
function createRoom(geom) {//{{{
	random=Math.random()/100;
	extrudeSettings = { steps: 1, depth: (geom.z[1]-geom.z[0])/100+random, bevelEnabled: false };
	shape = new THREE.Shape();
	edgePolypoints=deepcopy(geom);
	o=geom.polypoints[0];
	shape.moveTo(-o[0]/100+random, o[1]/100+random);
	_.each(geom.polypoints, function(p) {
		shape.lineTo(-p[0]/100+random, p[1]/100+random);
	});
	shape.lineTo(-o[0]/100+random, o[1]/100+random);
	geometry = new THREE.ExtrudeGeometry( shape, extrudeSettings );
	geometry.rotateX(THREE.Math.degToRad(270));
	
	material = new THREE.MeshBasicMaterial({
		color: gg[geom.letter].c,
		opacity: 0.8,
		side: THREE.DoubleSide,
		transparent: true,
	});
	mesh = new THREE.Mesh(geometry, material) ;
	scene.add(mesh);
}
//}}}
function createRoomEdges(geom) {
	_.each(geom.z, function(z) {
		points3D = new THREE.Geometry();
		o=geom.polypoints[0];
		_.each(geom.polypoints, function(p) {
			points3D.vertices.push(new THREE.Vector3(-p[0]/100, z/100, -p[1]/100));
		});
		points3D.vertices.push( new THREE.Vector3(-o[0]/100, z/100, -o[1]/100));
		line = new THREE.Line(points3D, new THREE.LineBasicMaterial({color: gg[geom.letter].c}));
		line = new THREE.Line(points3D, new THREE.LineBasicMaterial({color: 0xff0000}));
		scene.add(line);
	});
}
function createMeshes() {//{{{
	// random prevents z-fighting
	
	var ee=deepcopy(db().get());
	_.each(ee, function(geom) {
		if (geom.letter=='f')                 { return; }
		if (geom.letter=='d')                 { createDoor(geom); }
		if(['r', 'c' ].includes(geom.letter)) { createRoom(geom); createRoomEdges(geom); }
	});
}
//}}}
function view3d() {//{{{
	if(scene === undefined) {
		$.getScript("js/three.r109.min.js", function(){
			$.getScript("js/OrbitControls.js", function(){
				createScene();
				createMeshes(); 
			});
		});
	} else {
		removeMeshes();
		createMeshes(); 
	}
}

//}}}
function animate() {//{{{
	requestAnimationFrame( animate );
	controls.update();
	renderer.render( scene, camera );
}
//}}}
