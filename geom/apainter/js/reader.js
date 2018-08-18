// todo: learn to separate globals and funcs
var ApainterReader={};

function cad_json_reader(file) {//{{{
	ApainterReader.ggx=revert_gg();
	var reader = new FileReader();
	reader.onload = function(event) {
		json=JSON.parse(event.target.result);
		init_svg_groups(json);
		into_db(json);
	}
	reader.readAsText(file);
}
//}}}
function revert_gg() {//{{{
	var z={};
	for (var letter in gg) {
		z[gg[letter].xx]=letter;
	}
	return z;
}
//}}}
function init_svg_groups(json) {//{{{
	$(".g_floor").remove();
	$(".snap_v").remove();
	$(".snap_h").remove();

	floors_count=0;
	for (var floor in json) { 
		d3.select("#g_aamks").append("g").attr("id", "floor"+floor).attr("class", "g_floor").attr("fill-opacity", gg_opacity).attr('visibility',"hidden");
		floors_count++;
	}
	$("#floor0").attr('visibility',"visible");
	floor=0;
}
//}}}
function into_db(json) { //{{{
	db().remove();
	var ii=1;
	var arr;
	var geom;
	for (var floor in json) { 
		for (var type in json[floor]) {
			for (var geometry in json[floor][type]) {
				letter=ApainterReader.ggx[type];
				arr=json[floor][type][geometry];
				geom=read_record(parseInt(floor),letter,arr,ii);
				DbInsert(geom);
				CreateSvg(geom);
				ii++;
			}
		}
	}
	counter=ii;
	//console.log("reader", db().select( "cad_json", "dimx", "dimy", "dimz", "floor", "is_exit", "letter", "mvnt_offsetz", "mvnt_throughput", "name", "type", "x0", "y0"));
}
//}}}
function read_record(floor,letter,arr,ii) { //{{{
	if(gg[letter].t == 'evacuee') { 
		var x0=arr[0];
		var y0=arr[1];
		var z0=0;
		var x1=arr[0];
		var y1=arr[1];
		var z1=0;
	} else {
		var x0=arr[0][0];
		var y0=arr[0][1];
		var z0=arr[0][2];
		var x1=arr[1][0];
		var y1=arr[1][1];
		var z1=arr[1][2];
	}

	var record={
		name: gg[letter].x+ii,
		letter: letter,
		type: gg[letter].t,
		floor: floor,
		is_exit: '',
		dimz: z1-z0,
		mvnt_offsetz: 0,
		mvnt_throughput: 0,
		rr:{ x0: x0, y0: y0, x1: x1, y1: y1 }
	};

	if(gg[letter].t == 'door') { 
		record.is_exit=arr[2];
	}

	if(gg[letter].t == 'mvnt') { 
		record.mvnt_offsetz=arr[2]['offset'];
		record.mvnt_throughput=arr[2]['throughput'];
	}

	return record;
}
//}}}
