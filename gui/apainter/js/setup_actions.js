var ApainterReader={};

function renderUnderlayImage(file) {//{{{
	var reader = new FileReader();
	if(file.type=='application/pdf') {
		pdf2svg();
	} else {
		reader.onload = function(event) {
			$('#img'+floor).attr("href", event.target.result);
			$('#img'+floor).attr("width", 8000);
		}
		reader.readAsDataURL(file);
	}
}
//}}}
function save_setup_box_underlay() {//{{{
	if ($("#alter_underlay_opacity").val() != null) { 
		underlay_imgs[floor]['opacity']=parseFloat($("#alter_underlay_opacity").val());
		$("#img"+floor).attr("opacity",underlay_imgs[floor]['opacity']);

		if(document.querySelector('#alter_underlay_invert_colors').checked) {
			$("#img"+floor).attr('filter', "url(#invertColorsFilter)");
			underlay_imgs[floor]['invert_colors']='checked';
		} else {
			$("#img"+floor).removeAttr("filter");
			underlay_imgs[floor]['invert_colors']='';
		}

		if($("#alter_underlay_width").val() != "" && document.getElementById(selected_geom)) {
			underlay_imgs[floor]['width']=parseInt($("#alter_underlay_width").val());
			var uReq=parseInt($("#alter_underlay_width").val());
			var uRect=parseInt($("#"+selected_geom).attr('width'));
			var uImg=parseInt($("#img"+floor).attr('width'));
			$("#img"+floor).attr("width", uImg * uReq/uRect);
			$(".underlay_scaler").remove();
		}  else {
			underlay_imgs[floor]['width']="";
		}
	}
}
//}}}
function underlay_changed() {//{{{
	$("#g_img"+floor).remove();
	g_img = g_aamks.insert("g", "g").attr("id", "g_img"+floor).attr("class", "g_img");
	var _img=g_img.append("svg:image").attr("id", "img"+floor);
	g_img.call(d3.zoom()
		.scaleExtent([1 / 10, 40])
		.filter(function(){
			return (event.button === 1);
		})
		.translateExtent([[-10000, -10000], [10000 , 10000]])
		.on("zoom", function() {
			if (underlay_draggable==0) {  return; }
			_img.attr("transform","translate("+Math.round(d3.event.transform.x)+","+Math.round(d3.event.transform.y)+")");
			underlay_imgs[floor]['transform']=_img.attr("transform");
			$("#underlay_translate").html(underlay_imgs[floor]['transform']);
		})
	)
}
//}}}
function setup_underlay_into_setup_box() {//{{{
	underlay_draggable=1;
	if(underlay_imgs[floor]==null) { 
		underlay_imgs[floor]={};
		var width='value=""';
		var opacity='value=0.3';
		var invert_colors='';
		var fname='';
	} else {
		var width="value="+underlay_imgs[floor]['width'];
		var opacity="value="+underlay_imgs[floor]['opacity'];
		var invert_colors=underlay_imgs[floor]['invert_colors'];
		var fname=underlay_imgs[floor]['fname'];
	}
	d3.select('setup-box').html(
		"You can load an underlay png/jpg/svg.<br><br>"+
		"You can drag the underlay img with <br>"+
		"mouse2 only while this window is open.<br><br>"+
		"You can only alter the width of the<br>"+ 
		"underlay img, and the height will<br>"+
		"change accordingly.<br><br><br>"+
		"<input type=file label='choose' id=underlay_loader>"+
		"<br><br><table>"+
		"<tr><td>image<td id=underlay_img_fname>"+
		"<tr><td>origin<td id=underlay_translate>"+
		"<tr><td>scaler width<td><input id=alter_underlay_width type=text size=15 "+width+"> <a href=underlay_example.svg target=_blank> <help>&nbsp;[help]</help></a>"+
		"<tr><td>opacity<td><input id=alter_underlay_opacity type=text size=15 "+opacity+">"+
		"<tr><td>invert colors<td><input type=checkbox id=alter_underlay_invert_colors "+invert_colors+">"+
		"</table>"+
		"<br><button id=remove_img>remove image</button>"
	);

	$("#remove_img").click(function() {
		$("#img"+floor).remove();
	});

	$("#underlay_translate").html(underlay_imgs[floor]['transform']);
	$("#underlay_img_fname").html(underlay_imgs[floor]['fname']);

	$("#underlay_loader").change(function() {
		underlay_changed();
		renderUnderlayImage(this.files[0])
		underlay_imgs[floor]['fname']=this.files[0].name;
		$("#underlay_img_fname").html(underlay_imgs[floor]['fname']);
		$("#underlay_translate").html("translate(0,0)");
	});


}
//}}}
function help_into_setup_box() {//{{{
	d3.select('setup-box').html(
		"<input id=general_setup type=hidden value=1>"+
		"<table>"+
		"<tr><td>letter + mouse1     <td> create"+
		"<tr><td>shift + mouse2	    <td> zoom/drag"+
		"<tr><td>double mouse1		<td> elem properties"+
		"<tr><td>hold ctrl			<td> disable snapping"+ 
		"<tr><td>h	<td> alternative view"+ 
		"<tr><td>x	<td> delete active"+
		"<tr><td>g	<td> list all of active type"+
		"<tr><td>load cad.json<td><input type=file id=open_existing>"+
		"<tr><td colspan=2 style='text-align: center'><br>since now"+
		"<tr><td>floor		  <td><input id=floor type=number min=0 name=floor value="+floor+">"+ 
		"<span id=setup_underlay>image...</span>"+
		"<tr><td>floor's z-origin <td><input id=floor_zorig type=text size=4   name=floor_zorig value="+floor_zorig+">"+
		"<tr><td>door's width <td><input id=default_door_width type=text size=4   name=default_door_width  value="+default_door_width+">"+
		"<tr><td>door's z-dim <td><input id=default_door_dimz type=text size=4	name=default_door_dimz value="+default_door_dimz+">"+
		"<tr><td>room's z-dim <td><input id=default_floor_dimz type=text size=4 name=default_floor_dimz value="+default_floor_dimz+">"+
		"<tr><td>window's z-dim <td><input id=default_window_dimz type=text size=4 name=default_window_dimz value="+default_window_dimz+">"+
		"<tr><td>window's z-offset <td><input id=default_window_offsetz type=text size=4 name=default_window_offsetz value="+default_window_offsetz+">"+
		"</table><br><br>"
		);

	$('#setup_underlay').click(function() {
		setup_underlay_into_setup_box();
	});

	$("#open_existing").change(function() {
		cad_json_reader(this.files[0])
	});


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
	//console.log("reader", db().select( "cad_json", "dimx", "dimy", "dimz", "floor", "is_exit", "letter", "mvent_offsetz", "mvent_throughput", "name", "type", "x0", "y0"));
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
		mvent_offsetz: 0,
		mvent_throughput: 0,
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

	if(gg[letter].t == 'mvent') { 
		record.mvent_offsetz=arr[2]['offset'];
		record.mvent_throughput=arr[2]['throughput'];
	}

	return record;
}
//}}}
function pdf_svg_dom(json) { //{{{
	ajax_msg(json);
	$('#img'+floor).attr("href", 'data:image/svg+xml;utf8,'+json.data);
	$('#img'+floor).attr("width", 8000);
}
//}}}
function pdf2svg() { //{{{
	postFile('https://localhost/aamks/apainter/server.php?pdf2svg')
	  .then(data => pdf_svg_dom(data))
	  .catch(error => ajax_msg(error))

	function postFile(url) {
	  const formData = new FormData()
	  const fileField = document.querySelector('#underlay_loader')
	  formData.append('file', fileField.files[0]);

	  return fetch(url, {
		method: 'POST', 
		body: formData  
	  })
	  .then(response => response.json())
	}
}
//}}}
function apainter2server(cadfile) { //{{{
	$.post(
		'https://localhost/aamks/apainter/server.php?apainter', { 'cadfile': cadfile },
		function (json) { ajax_msg(json); }
	);
	
}
//}}}
