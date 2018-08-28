var scene, camera;

function init() {//{{{
	$("view2d").css("visibility", "hidden");
	$("view3d").append("<close3dview>[x]</close3dview><br>");
	d3.select('view3d').append('canvas').attr('id', 'canvas3d').attr('width', canvas[0]).attr('height', canvas[1]).style('background-color', '#888');
	$('close3dview').click(function() { close3dview(); });
}
//}}}
function colorHexDecode(hex) {//{{{
	if(hex.length == 7) { 
		var RGBA=[ parseInt(hex.substring(1,3),16)/255, parseInt(hex.substring(3,5),16)/255, parseInt(hex.substring(5,7),16)/255 ];
	} else {
		var RGBA=[ parseInt(hex.substring(1,2)+"0",16)/255, parseInt(hex.substring(2,3)+"0",16)/255, parseInt(hex.substring(3,4)+"0",16)/255 ];
	}
	return RGBA;
}
//}}}
function close3dview() {//{{{
	$("view3d").html("");
	$("view2d").css("visibility", "visible");
}
//}}}
function createMeshes() {//{{{
	// random prevents z-fighting
	var geoms=db().select("letter", "mvnt_offsetz", "x0", "x1", "y0", "y1", "z0", "z1");
	for (var i in geoms) {
		var bb=[];
		var random=Math.random()/500;
		bb.push(geoms[i][2]/100+random);
		bb.push(geoms[i][3]/100+random);
		bb.push(geoms[i][4]/100+random);
		bb.push(geoms[i][5]/100+random);
		bb.push(geoms[i][6]/100+random);
		bb.push(geoms[i][7]/100+random);
		var half_x=(bb[1]-bb[0])/2;
		var half_y=(bb[3]-bb[2])/2;
		var half_z=(bb[5]-bb[4])/2;

		createMesh({
			center: [ bb[0]+half_x, bb[4]+half_z, bb[2]+half_y ], 
			size:   [ half_x, half_z, half_y], 
			color:  gg[geoms[i][0]].c
		});
	}
}
//}}}
function createMesh(d) {//{{{
	console.log(d);
	var mesh = new xeogl.Mesh({
		geometry: new xeogl.BoxGeometry({
			center: d.center,
			xSize: d.size[0],
			ySize: d.size[1],
			zSize: d.size[2]
		}),

		material: new xeogl.LambertMaterial({
		   ambient: [1, 0.3, 0.3],
		   color: colorHexDecode(d.color),
		   alpha: 0.2,
		}),

		edgeMaterial: new xeogl.EdgeMaterial({
		   edgeColor: colorHexDecode(d.color),
		   edgeAlpha: 1,
		   edgeWidth: 10
		}),
		edges: true
	});

}
//}}}
function createScene() { //{{{
    xeogl.scene = new xeogl.Scene({
        canvas: "canvas3d",
        transparent: true,
    });
	scene=xeogl.scene;
    camera=scene.camera;
    scene.gammaInput = false;
    scene.gammaOutput = false;
    camera.eye =  [50, 50, 1];
    camera.look = [50, 0, 0];
	camera.projection = "perspective"; 
    //camera.gimbalLock = true;
    camera.up = [0, 0, -1]; 
    new xeogl.CameraControl();
}
//}}}
function view3d() {//{{{
	init();
	createScene();
	createMeshes(); 
}
