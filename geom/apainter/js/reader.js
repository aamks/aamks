// todo: learn to separate globals and funcs
var ApainterReader={};

function renderUnderlayImage(file) {//{{{
	//renderUnderlayImage(this.files[0])
	pdf_handle();
	var reader = new FileReader();
	reader.onload = function(event) {
		$('#img'+floor).attr("href", event.target.result)
	}
	reader.readAsDataURL(file);
}
//}}}
function cad_json_reader(file) {//{{{
	// renderUnderlayImage(this.files[0])
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
				geom=Attr_cad_json(geom);
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
	var x0=arr[0][0];
	var y0=arr[0][1];
	var z0=arr[0][2];
	var x1=arr[1][0];
	var y1=arr[1][1];
	var z1=arr[1][2];

	var record={
		name: gg[letter].x+ii,
		letter: letter,
		type: gg[letter].t,
		floor: floor,
		is_exit: '',
		dimz: z1-z0,
		mvnt_offsetz: 0,
		mvnt_throughput: 0,
		x0: x0,
		y0: y0,
		z0: z0,
		x1: x1,
		y1: y1,
		z1: z1
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
function pdf_handle() { //{{{
	postFile('https://mimooh.szach.in/pdf2svg.php')
	  .then(data => console.log(data))
	  .catch(error => console.error(error))

	function postFile(url) {
	  const formData = new FormData()
	  const fileField = document.querySelector('#underlay_loader')
	  formData.append('file', fileField.files[0])

	  return fetch(url, {
		method: 'POST', 
		body: formData  
	  })
	  .then(response => response.json())
	}
}
//}}}
