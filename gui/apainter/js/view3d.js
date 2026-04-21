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
	renderer.setSize(state.win.width, state.win.height);
	$('view3d').append(renderer.domElement);
	const { minx, maxx, miny, maxy } = dbMaxMinXY();
	centerX=-(minx + (maxx - minx)/2)/100
	centerY=-(miny + (maxy - miny)/2)/100
	camera = new THREE.OrthographicCamera(state.win.width/-50, state.win.width/50, state.win.height/50, state.win.height/-50, 1, 1000);
	camera.position.set(200, 100, -200);
	
	controls = new THREE.OrbitControls( camera, renderer.domElement );
	controls.target = new THREE.Vector3(centerX, 0, centerY);
	controls.enableZoom = false; 
	controls.saveState();

	scene = new THREE.Scene();
	scene.add(new THREE.AxesHelper());
	renderer.domElement.addEventListener("wheel", onWheelZoom, { passive: false });
}
//}}}
function polyGeometry(geom) {//{{{
	// random prevents z-fighting
	var random=Math.random()/100;
	var extrudeSettings = { steps: 1, depth: (geom.z.z1-geom.z.z0)/100+random, bevelEnabled: false };
	var shape = new THREE.Shape();
	var o=geom.polypoints[0];
	shape.moveTo(-o[0]/100+random, o[1]/100+random);
	_.each(geom.polypoints, function(p) {
		shape.lineTo(-p[0]/100+random, p[1]/100+random);
	});
	shape.lineTo(-o[0]/100+random, o[1]/100+random);
	var geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings );
	geometry.translate(0, random, geom.z.z0/100+random);
	geometry.rotateX(THREE.Math.degToRad(270));
	if(geom.type!='fire') { scene.add(new THREE.LineSegments(new THREE.EdgesGeometry( geometry ), new THREE.LineBasicMaterial( { color: state.gg[geom.letter].c }))); }
	return geometry;
}
//}}}
function createSphere(geom) {//{{{
	var geometry = new THREE.SphereGeometry( 0.25, 10, 10 );
	geometry.translate(-geom.minx/100, geom.z.z1/100, -geom.miny/100);
	var material = new THREE.MeshBasicMaterial( {color: state.gg[geom.letter].c } );
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
	if(geom.letter=='c') { geom.z.z1+=1; }
	var material = new THREE.MeshBasicMaterial({
		color: state.gg[geom.letter].c,
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
	var ee=deepcopy(dbAll());
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
				fitCameraToSceneOrtho();
				animate();
			});
		});
	} else {
		removeMeshes();
		createMeshes(); 
		fitCameraToSceneOrtho();
		animate();
	}
}

//}}}
function animate() {//{{{
	if(state.threejsPlay==0) { return; }
	requestAnimationFrame(animate);
	//if(fireMesh!=undefined) { animFire(); }
	controls.update();
	renderer.render( scene, camera );
}
//}}}
function set3DView(view) {
    state.current3DView = view;

    const box = new THREE.Box3().setFromObject(scene);
    if (box.isEmpty()) return;

    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const dist = Math.max(size.x, size.y, size.z) * 2 || 300;

    controls.target.copy(center);

    switch (view) {
        case "front":
            camera.position.set(center.x, center.y, center.z + dist);
            camera.up.set(0, 1, 0);
            break;

        case "back":
            camera.position.set(center.x, center.y, center.z - dist);
            camera.up.set(0, 1, 0);
            break;

        case "left":
            camera.position.set(center.x - dist, center.y, center.z);
            camera.up.set(0, 1, 0);
            break;

        case "right":
            camera.position.set(center.x + dist, center.y, center.z);
            camera.up.set(0, 1, 0);
            break;

        case "top":
            camera.position.set(center.x, center.y + dist, center.z);
            camera.up.set(0, 0, -1);
            break;

        case "iso":
            camera.position.set(center.x + dist, center.y + dist, center.z + dist);
            camera.up.set(0, 1, 0);
            break;
    }

    camera.lookAt(center);
    fitCameraToSceneOrtho(view);
}

function bind3DHandlers() {
    $("legend2").on("click", "#vFront", function () { set3DView("front"); });
    $("legend2").on("click", "#vBack", function () { set3DView("back"); });
    $("legend2").on("click", "#vLeft", function () { set3DView("left"); });
    $("legend2").on("click", "#vRight", function () { set3DView("right"); });
    $("legend2").on("click", "#vTop", function () { set3DView("top"); });
    $("legend2").on("click", "#vIso", function () { set3DView("iso"); });
    $("legend2").on("click", "#vDefault", function () { controls.reset(); });
}

function onWheelZoom(event) {
    event.preventDefault();
    const rect = renderer.domElement.getBoundingClientRect();
    const mouse = new THREE.Vector3(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        -((event.clientY - rect.top) / rect.height) * 2 + 1,
        0
    );
    const before = mouse.clone().unproject(camera);
    const zoomFactor = event.deltaY < 0 ? 1.1 : 0.9;
    camera.zoom = Math.max(1/30, Math.min(4, camera.zoom * zoomFactor));
    camera.updateProjectionMatrix();
    const after = mouse.clone().unproject(camera);
    const delta = before.sub(after);
    camera.position.add(delta);
    controls.target.add(delta);
    controls.update();
    renderer.render(scene, camera);
}
function fitCameraToSceneOrtho(view, object = scene, offset = 1.1) {
    if (!object || !camera || !controls) return;

    const box = new THREE.Box3().setFromObject(object);
    if (box.isEmpty()) return;

    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());

    let fitWidth = size.x;
    let fitHeight = size.y;
    let depth = size.z;

    switch (view) {
        case "front":
        case "back":
            fitWidth = size.x;
            fitHeight = size.y;
            depth = size.z;
            break;

        case "left":
        case "right":
            fitWidth = size.z;
            fitHeight = size.y;
            depth = size.x;
            break;

        case "top":
            fitWidth = size.x;
            fitHeight = size.z;
            depth = size.y;
            break;

        case "iso":
            // approximate iso fit using all dimensions
            fitWidth = size.x + size.z;
            fitHeight = size.y + size.z;
            depth = Math.max(size.x, size.y, size.z);
            break;
    }

    fitWidth = Math.max(fitWidth, 0.001);
    fitHeight = Math.max(fitHeight, 0.001);

    const frustumWidth = camera.right - camera.left;
    const frustumHeight = camera.top - camera.bottom;

    const zoomX = frustumWidth / fitWidth;
    const zoomY = frustumHeight / fitHeight;

    controls.target.copy(center);

    camera.zoom = Math.min(zoomX, zoomY) / offset;

    const dir = camera.position.clone().sub(center).normalize();
    const dist = Math.max(depth * 2, 100);

    camera.position.copy(center.clone().add(dir.multiplyScalar(dist)));

    camera.near = 0.1;
    camera.far = Math.max(1000, dist + depth * 4);

    camera.updateProjectionMatrix();
    controls.update();
    renderer.render(scene, camera);
}