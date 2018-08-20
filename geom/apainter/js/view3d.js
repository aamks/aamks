var camera, scene, renderer, controls;
var geometry, material, mesh;

function init() {//{{{
	camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 0.01, 10 );
	camera.position.z = 1;
	controls = new THREE.TrackballControls( camera );

	controls.rotateSpeed = 5.0;
	controls.zoomSpeed = 5;
	controls.panSpeed = 2;
	controls.noZoom = false;
	controls.noPan = false;
	controls.staticMoving = false;
	controls.dynamicDampingFactor = 0.3;
	controls.keys = [ 65, 83, 68 ];

	scene = new THREE.Scene();
	renderer = new THREE.WebGLRenderer( { antialias: true } );
	renderer.setSize( window.innerWidth*0.98, window.innerHeight*0.95);
	//MOVE mouse &amp; press LEFT/A: rotate, MIDDLE/S: zoom, RIGHT/D: pan
	$("view2d").css("visibility", "hidden");
	$("view3d").append("<close3dview>[close]</close3dview><br>");
	$("view3d").append( renderer.domElement );
	$('close3dview').click(function() { close3dview(); });

}
//}}}
function animate() {//{{{
	requestAnimationFrame( animate );
	controls.update();
	renderer.render( scene, camera );
}
//}}}
function add_cube(bb, letter) { //{{{
	geometry = new THREE.BoxGeometry(bb[1]-bb[0], bb[5]-bb[4], bb[3]-bb[2]);
	material = new THREE.MeshBasicMaterial( {color: gg[letter].c, opacity: 0.4} );
	material.transparent=true;
	mesh = new THREE.Mesh( geometry, material );
	mesh.position.set(bb[0], bb[4], bb[2]);
	scene.add(mesh);
}
//}}}
function add_cubes() {//{{{
	// random prevents z-fighting
	var geoms=db().select("letter", "mvnt_offsetz", "x0", "x1", "y0", "y1", "z0", "z1");
	for (var i in geoms) {
		var bb=[];
		var random=Math.random()/500;
		bb.push(geoms[i][2]/5000+random);
		bb.push(geoms[i][3]/5000+random);
		bb.push(geoms[i][4]/5000+random);
		bb.push(geoms[i][5]/5000+random);
		bb.push(geoms[i][6]/5000+random);
		bb.push(geoms[i][7]/5000+random);
		add_cube(bb, geoms[i][0]);
	}
	//renderer.render( scene, camera );
}
//}}}
function close3dview() {//{{{
	$("view3d").html("");
	$("view2d").css("visibility", "visible");
}
//}}}
function view3d() {//{{{
	init();
	add_cubes();
	animate();
}
//}}}
