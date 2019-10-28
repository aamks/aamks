var scene, camera, renderer, controls;

function removeMeshes() { //{{{
	while (scene.children.length > 0){ 
		scene.remove(scene.children[0]); 
	}
}
//}}}
function createScene() { //{{{
	d3.select('view3d').append('canvas').attr('id', 'canvas3d').attr('width', win[0]).attr('height', win[1]);
	canvas = document.querySelector('#canvas3d');
	renderer = new THREE.WebGLRenderer({canvas, antialias: true});
	renderer.setClearColor(0x444444);
	document.body.appendChild(renderer.domElement);

	centerX=-(db().min('minx') + (db().max('maxx') -  db().min('minx'))/2)/100
	centerY=-(db().min('miny') + (db().max('maxy') -  db().min('miny'))/2)/100
	camera = new THREE.OrthographicCamera(win[0]/-50, win[0]/50, win[1]/50, win[1]/-50, 1, 1000);
	camera.position.set(200, 100, -200);
	
	controls = new THREE.OrbitControls( camera, renderer.domElement );
	controls.target = new THREE.Vector3(centerX, 0, centerY);

	scene = new THREE.Scene();
	scene.add(new THREE.AxesHelper());
	animate();
}
//}}}
function polyGeometry(geom) {//{{{
	// random prevents z-fighting
	var random=Math.random()/100;
	var extrudeSettings = { steps: 1, depth: (geom.z[1]-geom.z[0])/100+random, bevelEnabled: false };
	var shape = new THREE.Shape();
	var o=geom.polypoints[0];
	shape.moveTo(-o[0]/100+random, o[1]/100+random);
	_.each(geom.polypoints, function(p) {
		shape.lineTo(-p[0]/100+random, p[1]/100+random);
	});
	shape.lineTo(-o[0]/100+random, o[1]/100+random);
	var geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings );
	geometry.translate(0, random, random);
	geometry.rotateX(THREE.Math.degToRad(270));
	scene.add(new THREE.LineSegments(new THREE.EdgesGeometry( geometry ), new THREE.LineBasicMaterial( { color: gg[geom.letter].c })));
	return geometry;
}
//}}}
function createSphere(geom) {//{{{
	var geometry = new THREE.SphereGeometry( 0.25, 10, 10 );
	geometry.translate(-geom.minx/100, geom.z[1]/100, -geom.miny/100);
	var material = new THREE.MeshBasicMaterial( {color: gg[geom.letter].c } );
	var sphere = new THREE.Mesh( geometry, material );
	scene.add( sphere );
}
//}}}
function createWireFrame(geom) {//{{{
	polyGeometry(geom);
}
//}}}
function createBlock(geom, alpha=0) {//{{{
	if (alpha==0) { var transparent=true; } else { var transparent=false; }
	if(geom.letter=='c') { dd(geom); geom.z[1]+=1; }
	var material = new THREE.MeshBasicMaterial({
		color: gg[geom.letter].c,
		opacity: 0.4,
		//side: THREE.DoubleSide,
		transparent: transparent
	});
	var geometry=polyGeometry(geom);
	scene.add(new THREE.Mesh(geometry, material)) ;
}
//}}}
function createMeshes() {//{{{
	var ee=deepcopy(db().get());
	_.each(ee, function(geom)     {
		if (geom.type=='evacuee') { createSphere(geom); }
		if (geom.type=='door')    { createWireFrame(geom); }
		if (geom.type=='obst')    { createBlock(geom, 1); }
		if (geom.type=='room')    { createBlock(geom); }
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
