function register_listeners() {//{{{
	$("right-menu-box").on("click"     , "#btn_copy_to_floor"       , function() { copy_to_floor() });
	$("right-menu-box").on("click"     , "#btn_submit_cad_json"     , function() { textarea_edit_cad_json() });
	$("right-menu-box").on("click"     , '#setup_underlay'          , function() { underlay_form(); });
	$("right-menu-box").on("mouseover" , ".properties_type_listing" , function() { selected_geom=$(this).attr('id'); blink_selected(); });
	$("right-menu-box").on("click"     , '.properties_type_listing' , function() { selected_geom=$(this).attr('id'); apainter_properties_box(); blink_selected(); });
	$("body").on("click"               , '#apainter-save'           , function() { if($("#cad-json-textarea").val()===undefined) { db2cadjson(); } else { cad_json_textarea_save(); } });
	$("body").on("click"               , '#apainter-next-view'      , function() { next_view(); });
	$("body").on("click"               , '#button-help'             , function() { apainter_help_box(); $('right-menu-box').fadeIn(); });
	$("body").on("click"               , '#button-setup'            , function() { apainter_setup_box(); $('right-menu-box').fadeIn(); });
	$("body").on("click"               , '.legend'                  , function() { active_letter=$(this).attr('letter'); properties_type_listing(); });
	$("body").on("mouseleave"          , 'right-menu-box'           , function() { save_setup_box(); });

	$("body").on("dblclick"        , "#apainter-svg"        , function(){
		if (['rect', 'circle'].includes(event.target.tagName)) { 
			selected_geom=event.target.id;
			apainter_properties_box();
			blink_selected();
		} else {
			selected_geom=''
		}
	});

}
//}}}
function keyboard_events() {//{{{
	$(this).keypress((e) => { 
		if (e.key == 'g')     { properties_type_listing(); }
		else if (e.key in gg) { active_letter=e.key; new_geom(); }
	});
	$(this).keydown((e) =>  { if (e.key == 'h') { next_view(); } });
	$(this).keydown((e) =>  { if (e.key == 'p') { $("#p1").remove() ; } });
	$(this).keydown((e) =>  { if (e.key == 'n') { change_floor(calc_next_floor()); } });
	$(this).keydown((e) =>  { if (e.key == '=') { resetView(); } });
	$(this).keydown((e) =>  { if (e.key == 'r' && e.ctrlKey) { alert('Refreshing will clear unsaved Aamks data. Continue?') ; } }) ;
	$(this).keypress((e) => { if (e.key == 'x' && selected_geom != "") { remove_geom(selected_geom); properties_type_listing(); } });

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
	$("#div-cad-json-textarea").remove();
	if(fire_model=='FDS') { return; }
	$("view2d").css("display", "block");
	$("#apainter-svg").css("display", "block");
}
//}}}
function cad_json_textarea_save() {//{{{
	var json_data=$("#cad-json-textarea").val();
	ajax_save_cadjson(json_data, fire_model); 
	cad_json_textarea_close();
}
//}}}
function textarea_edit_cad_json(pretty_json="") {//{{{
	$("view2d").css("display", "none");
	$("#apainter-svg").css("display", "none");
	if(fire_model=='CFAST') { cancel="<button id=apainter-next-view>View</button><br>"; } else { cancel='<br>'; }
	if(pretty_json=="") { var pretty_json=db2cadjson(); }
	$("body").append(
		"<div id=div-cad-json-textarea>"+
		"<button id=apainter-save>Save</button>"+
		cancel + 
		"<textarea id=cad-json-textarea>"+pretty_json+"</textarea>"+
		"</div>"
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
				dbInsert(geom, 1);
				createSvg(geom);
				updateVis(geom);
			}
		}
	}
	updateSnapLines(); // This is a heavy call, which shouldn't be called for each dbInsert()
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
function ajax_save_cadjson(json_data, fire_model) { //{{{
	$.post('/aamks/ajax.php?ajaxApainterExport', { 'data': json_data, 'fire_model': fire_model }, function (json) { 
		ajax_msg(json); 
		import_cadjson();
	});
}
//}}}
function import_cadjson() { //{{{
	$.post('/aamks/ajax.php?ajaxApainterImport', { }, function (json) { 
		// We loop thru dbInsert() here which updates the selected_geom
		// At the end the last elem in the loop would be the selected_geom
		// which may run into this-elem-doesnt-belong-to-this-floor problem.
		ajax_msg(json); 
		if(json.err=='FDS') {
			fire_model='FDS';
			textarea_edit_cad_json(json.data);
		} else {
			fire_model='CFAST';
			init_svg_groups(json.data);
			_.each(json.data, function(data,floor) { import_underlay(data['UNDERLAY'],floor); });
			into_db(json.data);
			selected_geom='';
			d3.select('#floor_text').text("floor "+floor+"/"+floors_count);
		}
	});
}
//}}}
function legend() { //{{{
	$('legend1').html('');

	for(var letter in gg) {
		if(gg[letter].legendary==1) { 
			var x=db({"letter": letter}).select("name");
			$('legend1').append("<div class=legend letter="+letter+" id=legend_"+letter+" style='color: "+gg[letter].font+"; background-color: "+gg[letter].c+"'>"+letter+" "+gg[letter].x+"</div>");
		}
	}

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
		ff+=underlay_save_cad(f);
		ff+='\n\t}';
		json.push(ff);
	}
	var pretty_json="{\n"+json.join(",\n")+"\n}\n";
	ajax_save_cadjson(pretty_json, fire_model);
	return pretty_json;
}
//}}}
function copy_to_floor() {	//{{{
	c2f=parseInt($("#copy_to_floor").val());
	var guess=db({"floor": floor, 'letter': 'r'}).select("dimz");
	if(guess[0] != undefined) {
		var z0=guess[0] * c2f;
	} else {
		var z0=defaults.floor_dimz * c2f;
	}
	floors_count++;
	building.append("g").attr("id", "floor"+c2f).attr({"class": "floor", "opacity": 0, "visibility": "hidden"});
	var src=db({'floor': floor}).get();
	var counter;
	for (var i in src) {
		counter=nextId();
		if (src[i]['letter'] == 's') { continue; }
		var geom = $.extend({}, src[i]);
		geom['floor']=c2f;
		geom['name']=gg[geom['letter']].x+counter;
		geom['z1']=z0 + geom['z1']-geom['z0'];
		geom['z0']=z0;
		var letter=geom['letter'];
		dbInsert(geom);
		createSvg(geom);
	}
	$("#floor"+c2f).attr({"class": "floor", "fill-opacity": 0.4, "visibility": "hidden"});

	var selected_geom='';
	apainter_setup_box();
	ajax_msg({'err':0, 'msg': "floor"+floor+" copied onto floor"+c2f});
}//}}}
function save_setup_box() {//{{{
	// There's a single box for multiple forms
	// so we need to find out which form is submitted

	if ($("#general_setup").val() != null) { 
        if (floor != $("#floor").val()) { change_floor(parseInt($("#floor").val())); }
		floor_zorig=parseInt($("#floor_zorig").val());
		defaults.door_dimz=parseInt($("#default_door_dimz").val());
		defaults.door_width=parseInt($("#default_door_width").val());
		defaults.floor_dimz=parseInt($("#default_floor_dimz").val());
		defaults.window_dimz=parseInt($("#default_window_dimz").val());
		defaults.window_offsetz=parseInt($("#default_window_offsetz").val());
		legend();
	} 

	if ($("#geom_properties").val() != null) { 
		var x=db({'name':selected_geom}).get();
		if (x.length==0) { return; }
		var geom={
			idx: x[0]['idx'],
			name: x[0]['name'],
			floor: x[0]['floor'],
			letter: x[0]['letter'],
			type: x[0]['type'],
			room_enter: $("#alter_room_enter").val(),
			exit_type: $("#alter_exit_type").val(),
			dimz: parseInt($("#alter_dimz").val()),
			window_offsetz: parseInt($("#alter_window_offsetz").val()),
			mvent_offsetz: parseInt($("#alter_mvent_offsetz").val()),
			mvent_throughput: parseInt($("#alter_mvent_throughput").val()),
			rr:{
				x0: parseInt($("#alter_x0").val()),
				y0: parseInt($("#alter_y0").val()),
				x1: parseInt($("#alter_x0").val())+parseInt($("#alter_dimx").val()),
				y1: parseInt($("#alter_y0").val())+parseInt($("#alter_dimy").val())
			}
		};

		if(geom.floor != floor) { return; } // Just to be sure, there were (fixed) issues

		db({"name": geom.name}).remove();
		updateSvgElem(geom);
		updateVis(geom);
		geom=rrRecalculate(geom);
		dbInsert(geom);
	} 

}
//}}}

function properties_type_listing_plain() {//{{{
	var tbody='';
	tbody+="<tr><td>name<td>x0<td>y0<td>x-dim<td>y-dim<td>z-dim";
	var items=db({'letter': active_letter, 'floor': floor}).get();
	for (var i in items) { 
		tbody+="<tr><td class=properties_type_listing id="+ items[i]['name']+ ">"+ items[i]['name']+"</td>"+
			"<td>"+items[i]['x0']+
			"<td>"+items[i]['y0']+
			"<td>"+items[i]['dimx']+
			"<td>"+items[i]['dimy']+
			"<td>"+items[i]['dimz'];
	}
	return tbody;
}
//}}}
function properties_type_listing_mvent() {//{{{
	var tbody='';
	tbody+="<tr><td>name<td>x0<td>y0<td>x-dim<td>y-dim<td>z-dim<td>z-offset<td>throughput";
	var items=db({'letter': active_letter, 'floor': floor}).get();
	for (var i in items) { 
		tbody+="<tr><td class=properties_type_listing id="+ items[i]['name']+ ">"+ items[i]['name']+"</td>"+
			"<td>"+items[i]['x0']+
			"<td>"+items[i]['y0']+
			"<td>"+items[i]['dimx']+
			"<td>"+items[i]['dimy']+
			"<td>"+items[i]['dimz']+
			"<td>"+items[i]['mvent_offsetz']+
			"<td>"+items[i]['mvent_throughput'];
	}
	return tbody;
}
//}}}
function properties_type_listing_window() {//{{{
	var tbody='';
	tbody+="<tr><td>name<td>x0<td>y0<td>x-dim<td>y-dim<td>z-dim<td>z-offset";
	var items=db({'letter': active_letter, 'floor': floor}).get();
	for (var i in items) { 
		tbody+="<tr><td class=properties_type_listing id="+ items[i]['name']+ ">"+ items[i]['name']+"</td>"+
			"<td>"+items[i]['x0']+
			"<td>"+items[i]['y0']+
			"<td>"+items[i]['dimx']+
			"<td>"+items[i]['dimy']+
			"<td>"+items[i]['dimz']+
			"<td>"+items[i]['window_offsetz'];
	}
	return tbody;
}
//}}}
function properties_type_listing_door() {//{{{
	var tbody='';
	tbody+="<tr><td>name<td>x0<td>y0<td>x-dim<td>y-dim<td>z-dim<td>exit_type";
	var items=db({'letter': active_letter, 'floor': floor}).get();
	for (var i in items) { 
		tbody+="<tr><td class=properties_type_listing id="+ items[i]['name']+ ">"+ items[i]['name']+"</td>"+
			"<td>"+items[i]['x0']+
			"<td>"+items[i]['y0']+
			"<td>"+items[i]['dimx']+
			"<td>"+items[i]['dimy']+
			"<td>"+items[i]['dimz']+
			"<td>"+items[i]['exit_type'];
	}
	return tbody;
}
//}}}
function properties_type_listing_room() {//{{{
	var tbody='';
	tbody+="<tr><td>name<td>x0<td>y0<td>x-dim<td>y-dim<td>z-dim<td>enter";
	var items=db({'letter': active_letter, 'floor': floor}).get();
	for (var i in items) { 
		tbody+="<tr><td class=properties_type_listing id="+ items[i]['name']+ ">"+ items[i]['name']+"</td>"+
			"<td>"+items[i]['x0']+
			"<td>"+items[i]['y0']+
			"<td>"+items[i]['dimx']+
			"<td>"+items[i]['dimy']+
			"<td>"+items[i]['dimz']+
			"<td>"+items[i]['room_enter'];
	}
	return tbody;
}
//}}}
function properties_type_listing_evacuee() {//{{{
	var tbody='';
	tbody+="<tr><td>name<td>x0<td>y0";

	var items=db({'letter': active_letter, 'floor': floor}).get();
	for (var i in items) { 
		tbody+="<tr><td class=properties_type_listing id="+ items[i]['name']+ ">"+ items[i]['name']+"</td>"+
			"<td>"+items[i]['x0']+
			"<td>"+items[i]['y0'];
	}
	return tbody;
}
//}}}
function properties_type_listing() {//{{{
	var names='';
	names+='<div style="overflow-y: scroll; height: '+(canvas[1]-100)+'px">';
	names+='<wheat>Hover name, then <letter>x</letter> to delete</wheat>';
	names+='<table id=droplist_names_table style="margin-right:20px">';
	if (gg[active_letter].t=='mvent') { 
		names+=properties_type_listing_mvent();
	} else if (gg[active_letter].t=='window') { 
		names+=properties_type_listing_window();
	} else if (gg[active_letter].t=='door') { 
		names+=properties_type_listing_door();
	} else if (gg[active_letter].t=='evacuee') { 
		names+=properties_type_listing_evacuee();
	} else if (gg[active_letter].t=='room') { 
		names+=properties_type_listing_room();
	} else {
		names+=properties_type_listing_plain();
	}
	names+="</table>";
	names+="</div>";

	$('right-menu-box').html(names);
	$('right-menu-box').css('display','block');

}
//}}}

function make_dim_properties() {//{{{
	var prop='';
	if(gg[active_letter].t!='evacuee') {
		//var selected=db({'name':selected_geom}).select("exit_type")[0]; // TODO: some garbage line?
		prop+="<tr><td>x-dim<td><input id=alter_dimx type=text size=3 value="+db({'name':selected_geom}).select("dimx")[0]+"> cm";
		prop+="<tr><td>y-dim<td><input id=alter_dimy type=text size=3 value="+db({'name':selected_geom}).select("dimy")[0]+"> cm";
		prop+="<tr><td>z-dim<td><input id=alter_dimz type=text size=3 value="+db({'name':selected_geom}).select("dimz")[0]+"> cm";
	} else {
		prop+="<input id=alter_dimx type=hidden value=0> cm";
		prop+="<input id=alter_dimy type=hidden value=0> cm";
		prop+="<input id=alter_dimz type=hidden value=0> cm";
	}
	return prop;
}
//}}}
function make_room_properties() {//{{{
	var prop='';
	if(gg[active_letter].t=='room') {
		var selected=db({'name':selected_geom}).select("room_enter")[0];
		prop+="<tr><td>enter <withHelp>?<help><orange>yes</orange> agents can evacuate via this room<br><hr><orange>no</orange> agents can not evacuate via this room</help></withHelp>";
		prop+="<td><select id=alter_room_enter>";
		prop+="<option value="+selected+">"+selected+"</option>";
		prop+="<option value='yes'>yes</option>";
		prop+="<option value='no'>no</option>";
		prop+="</select>";
	} else {
		prop+="<input id=alter_room_enter type=hidden value=0>";
	}
	return prop;
}
//}}}
function make_mvent_properties() {//{{{
	var mvent='';
	if(gg[active_letter].t=='mvent') {
		mvent+="<tr><td>z-offset<td>  <input id=alter_mvent_offsetz type=text size=3 value="+db({'name':selected_geom}).select("mvent_offsetz")[0]+">";
		mvent+="<tr><td>throughput<td>  <input id=alter_mvent_throughput type=text size=3 value="+db({'name':selected_geom}).select("mvent_throughput")[0]+">";
	} else {
		mvent+="<input id=alter_mvent_offsetz type=hidden value=0>";
		mvent+="<input id=alter_mvent_throughput type=hidden value=0>";
	}
	return mvent;
}
//}}}
function make_window_properties() {//{{{
	var win='';
	if(gg[active_letter].t=='window') {
		win+="<tr><td>z-offset<td>  <input id=alter_window_offsetz type=text size=3 value="+db({'name':selected_geom}).select("window_offsetz")[0]+">";
	} else {
		win+="<input id=alter_window_offsetz type=hidden value=0>";
	}
	return win;
}
//}}}
function make_door_properties() {//{{{
	var prop='';
	if(gg[active_letter].t=='door') {
		var selected=db({'name':selected_geom}).select("exit_type")[0];
		prop+="<tr><td>exit <withHelp>?<help><orange>auto</orange> any evacuee can use this door<br><hr><orange>primary</orange> many evacuees have had used this door to get in and will use it to get out<br><hr><orange>secondary</orange> extra door known to the personel</help></withHelp>";
		prop+="<td><select id=alter_exit_type>";
		prop+="<option value="+selected+">"+selected+"</option>";
		prop+="<option value='auto'>auto</option>";
		prop+="<option value='primary'>primary</option>";
		prop+="<option value='secondary'>secondary</option>";
		prop+="</select>";
	} else {
		prop+="<input id=alter_exit_type type=hidden value=0>";
	}
	return prop;
}
//}}}

function apainter_setup_box() {//{{{
	d3.select('right-menu-box').html(
		"<table class=nobreak>"+
		"<input id=general_setup type=hidden value=1>"+
		"<tr><td colspan=2 style='text-align: center'>since now"+
		"<tr><td>floor<td><input id=floor type=text name=floor size=4 value="+floor+">"+ 
		"<tr><td>floor's z-origin <td><input id=floor_zorig type=text size=4   name=floor_zorig value="+floor_zorig+">"+
		"<tr><td>door's width <td><input id=default_door_width type=text size=4   name=default_door_width  value="+defaults.door_width+">"+
		"<tr><td>door's z-dim <td><input id=default_door_dimz type=text size=4	name=default_door_dimz value="+defaults.door_dimz+">"+
		"<tr><td>room's z-dim <td><input id=default_floor_dimz type=text size=4 name=default_floor_dimz value="+defaults.floor_dimz+">"+
		"<tr><td>window's z-dim <td><input id=default_window_dimz type=text size=4 name=default_window_dimz value="+defaults.window_dimz+">"+
		"<tr><td>window's z-offset <td><input id=default_window_offsetz type=text size=4 name=default_window_offsetz value="+defaults.window_offsetz+">"+
		"<tr><td colspan=2><button id=btn_copy_to_floor class=blink>copy</button> floor"+floor+" to floor <input id=copy_to_floor type=text style='width:20px' value=''>"+ 
		"</table>"
		);

}
//}}}
function apainter_help_box() {//{{{
	d3.select('right-menu-box').html(
		"<table class=nobreak>"+
		"<tr><td><letter>letter</letter> + <letter>leftMouse</letter><td> create element"+
		"<tr><td>double <letter>leftMouse</letter><td> element properties"+
		"<tr><td>hold <letter>ctrl</letter>		<td> disable snapping"+ 
		"<tr><td><letter>h</letter>	<td> loop views"+ 
		"<tr><td><letter>n</letter>	<td> loop floors"+ 
		"<tr><td><letter>x</letter>	<td> delete active"+
		"<tr><td><letter>g</letter>	<td> list all of active type"+
		"<tr><td><letter>shift</letter>	<td> underlays"+
		"<tr><td><letter>=</letter>	<td> original zoom"+
		"</table>"
		);

}
//}}}
function apainter_properties_box() {//{{{
	active_letter=db({'name':selected_geom}).select("letter")[0];
	var room_properties=make_room_properties();
	var mvent_properties=make_mvent_properties();
	var window_properties=make_window_properties();
	var door_properties=make_door_properties();
	var dim_properties=make_dim_properties();
	d3.select('right-menu-box').html(
	    "<input id=geom_properties type=hidden value=1>"+
		"<wheat><letter>x</letter> to delete, <letter>g</letter> for listing</wheat>"+
		"<table>"+
	    "<tr><td>name <td>"+db({'name':selected_geom}).select("name")[0]+
		"<tr><td>x0	<td>	<input id=alter_x0 type=text size=3 value="+db({'name':selected_geom}).select("x0")[0]+"> cm"+
		"<tr><td>y0	<td>	<input id=alter_y0 type=text size=3 value="+db({'name':selected_geom}).select("y0")[0]+"> cm"+
		dim_properties+
		room_properties+
		mvent_properties+
		window_properties+
		door_properties+
		"</table>"
		);
	$('right-menu-box').fadeIn();

}
//}}}
