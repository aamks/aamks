// f//{{{
// [425  , 400 , 350 , 0 , ""          , "r" , 0 , 0 , "ROOM1" , "room" , 2185 , 990]
// [485  , 395 , 350 , 0 , ""          , "r" , 0 , 0 , "ROOM2" , "room" , 2610 , 1240]
// [90   , 32  , 200 , 0 , "exit_auto" , "d" , 0 , 0 , "DOOR3" , "door" , 2840 , 1224]
// [1035 , 840 , 350 , 2 , ""          , "r" , 0 , 0 , "ROOM4" , "room" , 3915 , 1025]
// [32   , 90  , 200 , 2 , "exit_yes"  , "d" , 0 , 0 , "DOOR5" , "door" , 4934 , 1615]
//}}}

function cad_json_reader(file) {//{{{
	var reader = new FileReader();
	reader.onload = function(event) {
		json=JSON.parse(event.target.result);
		into_db(json);
	}
	reader.readAsText(file);
}
//}}}
function into_db(json) { //{{{
	db().remove();

	console.log("pre", db().select( "dimx" , "dimy" , "dimz" , "floor" , "is_exit" , "letter" , "mvnt_offsetz" , "mvnt_throughput" , "name" , "type" , "x0" , "y0" ));
	var ii=1;
	for (var floor in json) { 
		for (var type in json[floor]) {
			console.log(type, json[floor][type]);
			db.insert({ 
				"name": type+ii,
				"name": type+ii
				// "cad_json": cad_json,
				// "letter": geom.letter,
				// "type": geom.type,
				// "lines": lines,
				// "x0": x0,
				// "y0": y0,
				// "dimx": x1-x0,
				// "dimy": y1-y0,
				// "dimz": geom.dimz,
				// "floor": floor,
				// "mvnt_offsetz": geom.mvnt_offsetz,
				// "mvnt_throughput": geom.mvnt_throughput,
				// "is_exit": geom.is_exit 
			});
			ii++;
		}
	//console.log("after", db().select("name"));
	}
}
//}}}
