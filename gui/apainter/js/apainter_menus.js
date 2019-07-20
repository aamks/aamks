function register_listeners() {//{{{
	$("right-menu-box").on("click" , "#btn_copy_to_floor"   , function() { copy_to_floor() });
	$("right-menu-box").on("click" , "#btn_edit_cad_json"   , function() { textarea_edit_cad_json() });
	$("right-menu-box").on("click" , "#btn_submit_cad_json" , function() { textarea_edit_cad_json() });
	$("right-menu-box").on("click" , '#setup_underlay'      , function() { setup_underlay_into_setup_box(); });
	$("right-menu-box").on("click" , '#utils_setup_button'  , function() { utils_into_setup_box(); });
	$("body").on("click"           , '#btn-cad-json-save'   , function() { cad_json_textarea_save(); });
	$("body").on("click"           , '#btn-cad-json-cancel' , function() { cad_json_textarea_close(); });
}
//}}}
function cad_jsons_db() { //{{{
	// Create cad_json attribute for the DB
	var cad_json;
	var r=db().get();
	for (var rr in r) {	
		i=r[rr];
		if(i.type=='door') {
			cad_json=`[[ ${i.x0}, ${i.y0}, ${i.z0} ], [ ${i.x1}, ${i.y1}, ${i.z1} ], { "idx": ${i.idx}, "exit_type": "${i.exit_type}"} ]`; 
		} else if(i.type=='room') {
			cad_json=`[[ ${i.x0}, ${i.y0}, ${i.z0} ], [ ${i.x1}, ${i.y1}, ${i.z1} ], { "idx": ${i.idx}, "room_enter": "${i.room_enter}"} ]`; 
		} else if(i.type=='fire') {
			cad_json=`[[ ${i.x0}, ${i.y0}, ${i.z0} ], [ ${i.x1}, ${i.y1}, ${i.z1} ], { "idx": ${i.idx}, "room_enter": "no"} ]`; 
		} else if(i.type=='mvent') {
			cad_json=`[[ ${i.x0}, ${i.y0}, ${i.z0} ], [ ${i.x1}, ${i.y1}, ${i.z1} ], { "idx": ${i.idx}, "mvent_throughput": ${i.mvent_throughput}, "offset": ${i.mvent_offsetz}} ]`; 
		} else if(i.type=='window') {
			cad_json=`[[ ${i.x0}, ${i.y0}, ${i.z0} ], [ ${i.x1}, ${i.y1}, ${i.z1} ], { "idx": ${i.idx}, "offset": ${i.window_offsetz}} ]`; 
		} else {
			cad_json=`[[ ${i.x0}, ${i.y0}, ${i.z0} ], [ ${i.x1}, ${i.y1}, ${i.z1} ], { "idx": ${i.idx} } ]`; 
		}
		db({'name': i.name}).update({'cad_json': cad_json});
	}
}
//}}}
function cad_json_textarea_close() {//{{{
	$("view2d").css("visibility", "visible");
	$("button-left-menu-box").css("visibility", "visible");
	$("#apainter-svg").css("display", "block");
	$("#floating-div").remove();
}
//}}}
function cad_json_textarea_save() {//{{{
	var json_data=$("#cad-json-textarea").val();
	ajax_save_cadjson(json_data); 
	cad_json_textarea_close();
}
//}}}
function textarea_edit_cad_json() {//{{{
	$("view2d").css("visibility", "hidden");
	$("button-left-menu-box").css("visibility", "hidden");
	$("#apainter-svg").css("display", "none");

	var pretty_json=db2cadjson(); 
	$("body").append(
		"<div id=floating-div>"+
		"<div style='float:right; margin-right:20px'>"+
		"<button class=blink id=btn-cad-json-save>Save</button>"+
		"<button class=blink id=btn-cad-json-cancel>Cancel</button><br>"+
		"</div>"+
		"<textarea id=cad-json-textarea>"+pretty_json+"</textarea>"+
		"</div>"
	);
}
//}}}
function utils_into_setup_box() {//{{{
	d3.select('right-menu-box').html(
		"<input id=utils_setup type=hidden value=1>"+
		"<table>"+
		"<tr><td><button id=setup_underlay class=blink>underlay</button><td> for floor"+floor+
		"<tr><td><button id=btn_edit_cad_json class=blink>edit</button><td>geometry as text"+
		"<tr><td><button id=btn_copy_to_floor class=blink>copy</button><td>floor"+floor+" to floor <input id=copy_to_floor type=number min=0 style='width:3em' value=''>"+ 
		"</table>"
	);
}
//}}}
function help_utils_into_setup_box() {//{{{
	d3.select('right-menu-box').html(
		"<input id=general_setup type=hidden value=1>"+
		"<span style='float: right' class=blink id=utils_setup_button>utils</span><br><br>"+
		"<table class=nobreak>"+
		"<tr><td><letter>letter</letter> + mouse1     <td> create"+
		"<tr><td><letter>shift</letter> + mouse2	    <td> zoom/drag"+
		"<tr><td>double mouse1		<td> elem properties"+
		"<tr><td>hold <letter>ctrl</letter>		<td> disable snapping"+ 
		"<tr><td><letter>h</letter>	<td> 2D/3D views"+ 
		"<tr><td><letter>n</letter>	<td> loop floors"+ 
		"<tr><td><letter>x</letter>	<td> delete active"+
		"<tr><td><letter>g</letter>	<td> list all of active type"+

		"<tr><td colspan=2 style='text-align: center'><br>since now"+
		"<tr><td>floor<td><input id=floor type=number min=0 name=floor style='width:3em' value="+floor+">"+ 
		"<tr><td>floor's z-origin <td><input id=floor_zorig type=text size=4   name=floor_zorig value="+floor_zorig+">"+
		"<tr><td>door's width <td><input id=default_door_width type=text size=4   name=default_door_width  value="+default_door_width+">"+
		"<tr><td>door's z-dim <td><input id=default_door_dimz type=text size=4	name=default_door_dimz value="+default_door_dimz+">"+
		"<tr><td>room's z-dim <td><input id=default_floor_dimz type=text size=4 name=default_floor_dimz value="+default_floor_dimz+">"+
		"<tr><td>window's z-dim <td><input id=default_window_dimz type=text size=4 name=default_window_dimz value="+default_window_dimz+">"+
		"<tr><td>window's z-offset <td><input id=default_window_offsetz type=text size=4 name=default_window_offsetz value="+default_window_offsetz+">"+
		"</table>"
		);

}
//}}}
function init_svg_groups(json) {//{{{
	$(".floor").remove();
	$(".snap_v").remove();
	$(".snap_h").remove();

	floors_count=0;
	for (var _floor in json) { 
		d3.select("#building").append("g").attr("id", "floor"+_floor).attr("class", "floor").attr("fill-opacity", 0.4).attr('visibility',"hidden");
		floors_count++;
	}
	$("#floor"+floor).attr('visibility',"visible").css("opacity", 1);
}
//}}}
function into_db(json) { //{{{
	// Geoms must come in order, otherwise we could see DOOR under ROOM if geoms were created in that order.
	db().remove();
	var letter;
	var arr;
	var geom;
	var elems=["ROOM","COR","STAI","HALL","OBST","VVENT","MVENT","HOLE","WIN","DOOR","DCLOSER","DELECTR","EVACUEE","FIRE","UNDERLAY_SCALER"];

	for (var floor in json) { 
		for (var i in elems) {
			for (var geometry in json[floor][elems[i]]) {
				letter=ggx[elems[i]];
				arr=json[floor][elems[i]][geometry];
				geom=read_record(parseInt(floor),letter,arr);
				DbInsert(geom, 0);
				CreateSvg(geom);
				UpdateVis(geom);
			}
		}
	}
	updateSnapLines(); // This is a heavy call, which shouldn't be called for each DbInsert()
}
//}}}
function read_record(floor,letter,arr) { //{{{
	var x0=arr[0][0];
	var y0=arr[0][1];
	var z0=arr[0][2];
	var x1=arr[1][0];
	var y1=arr[1][1];
	var z1=arr[1][2];

	var record={
		idx: arr[2]['idx'],
		name: letter+arr[2]['idx'],
		letter: letter,
		type: gg[letter].t,
		floor: floor,
		exit_type: '',
		room_enter: '',
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
		record.exit_type=arr[2]['exit_type'];
	}
	if(gg[letter].t == 'room') { 
		record.room_enter=arr[2]['room_enter'];
	}

	if(gg[letter].t == 'mvent') { 
		record.mvent_offsetz=arr[2]['offset'];
		record.mvent_throughput=arr[2]['mvent_throughput'];
	}

	return record;
}
//}}}
function ajax_save_cadjson(json_data) { //{{{
	$.post('/aamks/ajax.php?ajaxApainterExport', { 'cadfile': json_data }, function (json) { 
		ajax_msg(json); 
		import_cadjson();
	});
}
//}}}
function import_cadjson() { //{{{
	$.post('/aamks/ajax.php?ajaxApainterImport', { }, function (json) { 
		// We loop thru DbInsert() here which updates the selected_geom
		// At the end the last elem in the loop would be the selected_geom
		// which may run into this-elem-doesnt-belong-to-this-floor problem.
		ajax_msg(json); 
		init_svg_groups(json.data);
		import_underlays(json.data);
		into_db(json.data);
		selected_geom='';
		d3.select('#floor_text').text("floor "+floor+"/"+floors_count);
	});
}
//}}}
function legend_static() {//{{{
	$('body').prepend("<button-left-menu-box>A</button-left-menu-box>");
	$('apainter-legend-static').prepend("<open3dview>3D</open3dview> &nbsp;");
	$('apainter-legend-static').prepend("<write>SAVE</write> &nbsp;");

	$('write').click(function() { db2cadjson();  });
	$('open3dview').click(function() { view3d(); });
}
//}}}
function legend() { //{{{
	$('legend').html('');

	for(var letter in gg) {
		if(gg[letter].legendary==1) { 
			var x=db({"letter": letter}).select("name");
			$('legend').append("<div class=legend letter="+letter+" id=legend_"+letter+" style='color: "+gg[letter].font+"; background-color: "+gg[letter].c+"'>"+letter+" "+gg[letter].x+"</div>");
		}
	}

	$('.legend').click(function() {
		active_letter=$(this).attr('letter');
		properties_type_listing();
	});
}
//}}}
function reorder_db() {//{{{
	// Re-enumerate all elems in this fashion: r1, r2, r3, ..., d1, d2, d3, ...
	// CFAST expects elems to be numbered as above
	// Evacuees will be in original order for navmesh testing pairing: e1 > e2, e3 > e4, ...
	if(db({"type": 'fire'}).get().length > 1) { ajax_msg({'err':1, 'msg':"Aamks allows for max one fire"}); }

	db.sort("idx");
	var ee=db({"type": 'evacuee'}).get();
	db({"type": 'evacuee'}).remove();

	var types=[ ['room'], ['door', 'hole', 'window'], ['vvent'], ['mvent'], ['obst'] ];
	db.sort("floor,x0,y0");
	for (var i in types) {
		var idx=1;
		var r=db({"type": types[i]}).get();
		db({"type": types[i]}).remove();
		for (var ii in r) {
			r[ii]['idx']=idx;
			r[ii]['name']=r[ii]['letter']+idx;
			db.insert(r[ii]);
			idx++;
		}
	}
	for (var i in ee) {
		ee[i]['idx']=idx;
		ee[i]['name']="e"+idx;
		db.insert(ee[i]);
		idx++;
	}
	cad_jsons_db();
}
//}}}
function db2cadjson() {//{{{
	// Instead of JSON.stringify we prefer our own pretty formatting.
	// Since names appear in SVG and we are reordering we need to write and reread 
	reorder_db();
	var json=[];
	for(var f=0; f<floors_count; f++) { 
		var geoms=[];
		for(var letter in gg) {
			if (gg[letter]['legendary'] == 0) { continue; }
			var x=db({"floor": f, "letter": letter}).select("cad_json");
			var num_data=[];
			for (var r in x) { 
				num_data.push("\t\t\t"+x[r]);
			}
			var geom='';
			geom+='\t\t"'+gg[letter].x+'": [';
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
	ajax_save_cadjson(pretty_json);
	return pretty_json;
}
//}}}
function copy_to_floor() {	//{{{
	c2f=parseInt($("#copy_to_floor").val());
	var guess=db({"floor": floor, 'letter': 'r'}).select("dimz");
	if(guess[0] != undefined) {
		var z0=guess[0] * c2f;
	} else {
		var z0=default_floor_dimz * c2f;
	}
	floors_count++;
	building.append("g").attr("id", "floor"+c2f).attr({"class": "floor", "opacity": 0, "visibility": "hidden"});
	var src=db({'floor': floor}).get();
	var counter;
	for (var i in src) {
		counter=NextIdx();
		if (src[i]['letter'] == 's') { continue; }
		var geom = $.extend({}, src[i]);
		geom['floor']=c2f;
		geom['name']=gg[geom['letter']].x+counter;
		geom['z1']=z0 + geom['z1']-geom['z0'];
		geom['z0']=z0;
		var letter=geom['letter'];
		DbInsert(geom);
		CreateSvg(geom);
	}
	$("#floor"+c2f).attr({"class": "floor", "fill-opacity": 0.4, "visibility": "hidden"});

	var selected_geom='';
	utils_into_setup_box();
	ajax_msg({'err':0, 'msg': "floor"+floor+" copied onto floor"+c2f});
}//}}}
