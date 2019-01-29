var ApainterReader={};

$(function() { 
	left_menu_box();
	import_cadjson();
	scenario_changer();
});

function left_menu_box() {//{{{
	$.post('/aamks/ajax.php?ajaxMenuContent', { }, function (json) { 
		$("left-menu-box").html(json.data);

		$('button-left-menu-box').click(function() {
			$('left-menu-box').fadeIn();
		});

		$('close-left-menu-box').click(function() {
			$('left-menu-box').fadeOut();
		});

	});
}
//}}}
function scenario_changer() {//{{{
	$("body").on("change", "#choose_scenario", function() {
		$.post('/aamks/ajax.php?ajaxChangeActiveScenarioApainter', {'ch_scenario':$(this).val() }, function (json) { 
			ajax_msg(json); 
			$("view2d").remove();
			CanvasBuilder();
			left_menu_box();
			$('left-menu-box').fadeIn();
			import_cadjson();
			d3.select("#scenario_text").text(json.data);
			d3.select("#floor_text").text("floor "+floor);
		});
	});
}
//}}}
function renderUnderlayImage(file) {//{{{
	var reader = new FileReader();
	if(file.type=='application/pdf') {
		ajaxPdf2svg();
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
	d3.select('right-menu-box').html(
		"You can load an underlay png/jpg/svg.<br><br>"+
		"You can drag the underlay img with <br>"+
		"mouse2 only while this window is open.<br><br>"+
		"You can only alter the width of the<br>"+ 
		"underlay img, and the height will<br>"+
		"change accordingly.<br><br><br>"+
		"<input type=file id=underlay_loader style='display:none'><label class=blink for='underlay_loader'>attach underlay image</label>"+
		"<br><br><table>"+
		"<tr><td>image<td id=underlay_img_fname>"+
		"<tr><td>origin<td id=underlay_translate>"+
		"<tr><td>scaler width<td><input id=alter_underlay_width type=text size=4 "+width+"> <a href=underlay_example.svg target=_blank class=blink>help</a>"+
		"<tr><td>opacity<td><input id=alter_underlay_opacity type=text size=4 "+opacity+">"+
		"<tr><td>invert colors<td><input type=checkbox id=alter_underlay_invert_colors "+invert_colors+">"+
		"</table>"+
		"<br><div class=blink id=detach_underlay>detach underlay image</div>"
	);

	$("#detach_underlay").click(function() {
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
	d3.select('right-menu-box').html(
		"<input id=general_setup type=hidden value=1>"+
		"<table>"+
		"<tr><td>letter + mouse1     <td> create"+
		"<tr><td>shift + mouse2	    <td> zoom/drag"+
		"<tr><td>double mouse1		<td> elem properties"+
		"<tr><td>hold ctrl			<td> disable snapping"+ 
		"<tr><td>h	<td> alternative view"+ 
		"<tr><td>x	<td> delete active"+
		"<tr><td>g	<td> list all of active type"+
		"<tr><td colspan=2><input type=file id=open_existing style='display:none'><label class=blink for='open_existing'>import cad.json from disk</label>"+

		"<tr><td colspan=2 style='text-align: center'><br>since now"+
		"<tr><td>floor		  <td><input id=floor type=number min=0 name=floor style='width:3em'; value="+floor+">"+ 
		"<div id=setup_underlay class=blink>underlay</div>"+
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
function ajaxPdf2svg() { //{{{
	postFile('/aamks/ajax.php?ajaxPdf2svg')
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
function export_cadjson(cadfile) { //{{{
	$.post('/aamks/ajax.php?ajaxApainterExport', { 'cadfile': cadfile }, function (json) { ajax_msg(json); });
	
}
//}}}
function import_cadjson() { //{{{
	$.post('/aamks/ajax.php?ajaxApainterImport', { }, function (json) { 
		ajax_msg(json); 
		ApainterReader.ggx=revert_gg();
		init_svg_groups(json.data);
		into_db(json.data);
	});
}
//}}}
function legend_static() {//{{{
	$('body').prepend("<button-left-menu-box>A</button-left-menu-box>");
	$('apainter-legend-static').prepend("<open3dview>3D</open3dview> &nbsp;");
	$('apainter-legend-static').prepend("<write>SAVE</write> &nbsp;");

	$('write').click(function() { output_json(); });
	$('open3dview').click(function() { open3dview(); });
}
//}}}
function legend() { //{{{
	$('legend').html('');

	for(var letter in gg) {
		if(gg[letter].legendary==1) { 
			var x=db({"letter": letter}).select("name");
			$('legend').append("<div class=legend letter="+letter+" id=legend_"+letter+" style='color: "+gg[letter].font+"; background-color: "+gg[letter].c+"'>"+letter+" "+gg[letter].x+" ("+x.length+")</div>");
		}
	}

	$('.legend').click(function() {
		properties_type_listing($(this).attr('letter'));
	});
}
//}}}
function open3dview() {//{{{
	$.getScript("js/xeogl.min.js", function(){
		view3d();
	});
}
//}}}
function output_json() {//{{{
	// Instead of JSON.stringify we prefer our own pretty formatting.

	var json=[];
	for(var f=0; f<floors_count; f++) { 
		var geoms=[];
		for(var letter in gg) {
			var x=db({"floor": f, "letter": letter}).select("cad_json");
			var num_data=[];
			for (var r in x) { 
				num_data.push("\t\t\t"+x[r]);
			}
			var geom='';
			geom+='\t\t"'+gg[letter].xx+'": [';
			if(num_data.length>0) { 
				geom+="\n"+num_data.join(",\n");
				geom+='\n\t\t]';
			} else {
				geom+=' ]';
			}
			geoms.push(geom);
		}
		var ff='';
		ff+='\t"'+f+'": {\n';
		ff+=geoms.join(",\n");
		ff+='\n\t}';
		json.push(ff);
	}
	var pretty_json="{\n"+json.join(",\n")+"\n}\n";
	download("cad.json", pretty_json);
	export_cadjson(pretty_json);
}
function download(filename, text) {//{{{
	// download writes it directly to the browser to save
	return;
    var pom = document.createElement('a');
    pom.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    pom.setAttribute('download', filename);

    if (document.createEvent) {
        var event = document.createEvent('MouseEvents');
        event.initEvent('click', true, true);
        pom.dispatchEvent(event);
    }
    else {
        pom.click();
    }
}
//}}}
//}}}
