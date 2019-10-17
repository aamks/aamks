var scene, camera, renderer, controls;

function colorHexDecode(hex) {//{{{
	if(hex.length == 7) { 
		var RGB=[ parseInt(hex.substring(1,3),16)/255, parseInt(hex.substring(3,5),16)/255, parseInt(hex.substring(5,7),16)/255 ];
	} else {
		var RGB=[ parseInt(hex.substring(1,2)+"0",16)/255, parseInt(hex.substring(2,3)+"0",16)/255, parseInt(hex.substring(3,4)+"0",16)/255 ];
	}
	return RGB;
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
function createMeshes() {//{{{
	// random prevents z-fighting
	//bb.push(geoms[i][2]/100+random);
	
	var ee=deepcopy(db().get());
	_.each(ee, function(geom) {
		if (geom.letter=='f') { return; }
		random=Math.random()/40;
		var extrudeSettings = { steps: 1, depth: (geom.z[1]-geom.z[0])/100+random, bevelEnabled: false };
		var shape = new THREE.Shape();
		var o=geom.polypoints.shift();
		shape.moveTo(-o[0]/100+random, o[1]/100+random);
		shape.lineTo(-geom.polypoints[0][0]/100+random, geom.polypoints[0][1]/100+random);
		//_.each(geom.polypoints, function(p) {
		//	shape.lineTo(-p[0]/100+random, p[1]/100+random);
		//});
		//shape.lineTo(-o[0]/100+random, o[1]/100+random);
		var geometry = new THREE.ExtrudeGeometry( shape, extrudeSettings );
		geometry.rotateX(THREE.Math.degToRad(270));
		//const material = new THREE.MeshPhongMaterial({
		const material = new THREE.MeshBasicMaterial({
		//const material = new THREE.MeshLambertMaterial({
			wireframe: true,
			color: gg[geom.letter].c,
			opacity: 0.5,
			transparent: true,
			side: THREE.DoubleSide
		});
		var mesh = new THREE.Mesh(geometry, material) ;
		scene.add( mesh );
	});
}
//}}}
function createScene() { //{{{
	d3.select('view3d').append('canvas').attr('id', 'canvas3d').attr('width', win[0]).attr('height', win[1]);
	scene = new THREE.Scene();
	canvas = document.querySelector('#canvas3d');
	renderer = new THREE.WebGLRenderer({canvas, antialias: true});
	//camera = new THREE.PerspectiveCamera(perspective , aspect_ratio  , near_clip , far_clip);
	camera = new THREE.PerspectiveCamera(75            , win[0]/win[1] , 0.1       , 1000 );
	renderer.setClearColor(0x444444);
	document.body.appendChild(renderer.domElement);
	controls = new THREE.OrbitControls( camera, renderer.domElement );
	//controls.enableRotate=0;
	var gridXZ = new THREE.GridHelper(100, 10, 0x4f4f4f, 0x4f4f4f);
    scene.add(gridXZ);
	var axesHelper = new THREE.AxesHelper();
	scene.add( axesHelper );

	//var light = new THREE.HemisphereLight();
    //scene.add(light);
	camera.position.set(50, 30, -100);
	animate();

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
function animate() {
	requestAnimationFrame( animate );
	controls.update();
	renderer.render( scene, camera );
}

function createMeshesOld() {//{{{
	// random prevents z-fighting
	var geoms=db().get()
	var half_x, half_y, half_z;
	_.each(geoms, function(i) {
		dd(i);
		bb=[];
		random=Math.random()/40;
		bb.push(geoms[i][2]/100+random);
		bb.push(geoms[i][3]/100+random);
		bb.push(geoms[i][4]/100+random);
		bb.push(geoms[i][5]/100+random);
		bb.push(geoms[i][6]/100+random);
		bb.push(geoms[i][7]/100+random);
		half_x=(bb[1]-bb[0])/2;
		half_y=(bb[3]-bb[2])/2;
		half_z=(bb[5]-bb[4])/2;
		if(gg[geoms[i][0]].t == 'evacuee') { 
			mesh='sphere';
		}  else {
			mesh='box';
		}

		createMesh({
			mesh: mesh,
			center: [ bb[0]+half_x, bb[4]+half_z, bb[2]+half_y ], 
			size:   [ half_x, half_z, half_y], 
			color:  gg[geoms[i][0]].c
		});
	});
}
//}}}
