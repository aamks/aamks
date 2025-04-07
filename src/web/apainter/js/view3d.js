var scene, camera, renderer, controls, fireMesh;

function removeMeshes() { //{{{
	while (scene.children.length > 0){ 
		scene.remove(scene.children[0]); 
	}
}
//}}}
function createScene() { //{{{
	renderer = new THREE.WebGLRenderer({antialias: true});
	renderer.setClearColor(0x444444);
	renderer.setSize(win[0], win[1]);
	$('view3d').append(renderer.domElement);

	centerX=-(db().min('minx') + (db().max('maxx') -  db().min('minx'))/2)/100
	centerY=-(db().min('miny') + (db().max('maxy') -  db().min('miny'))/2)/100
	camera = new THREE.OrthographicCamera(win[0]/-50, win[0]/50, win[1]/50, win[1]/-50, 1, 1000);
	camera.position.set(200, 100, -200);
	
	controls = new THREE.OrbitControls( camera, renderer.domElement );
	controls.target = new THREE.Vector3(centerX, 0, centerY);

	scene = new THREE.Scene();
	scene.add(new THREE.AxesHelper());
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
	geometry.translate(0, random, geom.z[0]/100+random);
	geometry.rotateX(THREE.Math.degToRad(270));
	if(geom.type!='fire') { scene.add(new THREE.LineSegments(new THREE.EdgesGeometry( geometry ), new THREE.LineBasicMaterial( { color: gg[geom.letter].c }))); }
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
	if(geom.letter=='c') { geom.z[1]+=1; }
	var material = new THREE.MeshBasicMaterial({
		color: gg[geom.letter].c,
		opacity: 0.4,
		//side: THREE.DoubleSide,
		transparent: transparent
	});
	var geometry=polyGeometry(geom);
	var mesh = new THREE.Mesh( geometry, material );
	if(geom.type=='fire') { fireMesh=mesh; }
	scene.add(mesh) ;
}
//}}}

function animFire() {//{{{
	//fireMesh.position.y += 0.01;
}
//}}}
function createMeshes() {//{{{
	var ee=deepcopy(db().get());
	_.each(ee, function(geom)     {
		if (geom.type=='evacuee') { createSphere(geom); }
		if (geom.type=='window')  { createWireFrame(geom); }
		if (geom.type=='door')    { createWireFrame(geom); }
		if (geom.type=='hole')    { createWireFrame(geom); }
		if (geom.type=='vvent')   { createBlock(geom,1); }
		if (geom.type=='fire')    { createBlock(geom,1); }
		if (geom.type=='mvent')   { createBlock(geom,1); }
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
				animate();
			});
		});
	} else {
		removeMeshes();
		createMeshes(); 
		animate();
	}
}

//}}}
function animate() {//{{{
	if(threejsPlay==0) { return; }
	requestAnimationFrame(animate);
	//if(fireMesh!=undefined) { animFire(); }
	controls.update();
	renderer.render( scene, camera );
}
//}}}
