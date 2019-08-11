function registerListeners() {//{{{
	$("right-menu-box").on("click"     , "#btn_copy_to_floor"       , function() { floorCopy() });
	$("right-menu-box").on("click"     , "#btn_submit_cad_json"     , function() { txtEditCadJson() });
	$("right-menu-box").on("click"     , '#setup_underlay'          , function() { underlay_form(); });
	$("right-menu-box").on("mouseover" , ".bulkProps" , function() { cgSelectNew($(this).attr('id')); });
	$("right-menu-box").on("click"     , '.bulkProps' , function() { cgSelectNew($(this).attr('id'), 1);  });
	$("body").on("click"               , '#apainter-save'           , function() { if($("#cad-json-textarea").val()===undefined) { db2cadjson(); } else { saveTxtCadJson(); } });
	$("body").on("click"               , '#apainter-next-view'      , function() { nextView(); });
	$("body").on("click"               , '#button-help'             , function() { showHelpBox(); });
	$("body").on("click"               , '#button-setup'            , function() { showGeneralBox(); });
	$("body").on("click"               , '.legend'                  , function() { activeLetter=$(this).attr('letter'); bulkProps(); });
	$("body").on("mouseleave"          , 'right-menu-box'           , function() { saveRightBox(); });

	$("body").on("dblclick"        , "#apainter-svg"        , function(){
		if (['rect', 'circle'].includes(event.target.tagName)) { 
			cgSelectNew(event.target.id, 1);
		} else {
			cg={};
		}
	});

}
//}}}
function keyboardEvents() {//{{{

	$(this).keypress((e) => { if (e.key in gg)  { activeLetter=e.key; $('right-menu-box').fadeOut(0); cgCreate(); } });
	$(this).keydown((e) =>  { if (e.key == 'Escape') { escapePressed(); } });
	$(this).keydown((e) =>  { if (e.key == 'h') { nextView(); } });
	$(this).keydown((e) =>  { if (e.key == 'p') { $("#p1").remove() ; } });
	$(this).keydown((e) =>  { if (e.key == 'n') { changeFloor(calcNextFloor()); } });
	$(this).keydown((e) =>  { if (e.key == '=') { resetView(); } });
	$(this).keydown((e) =>  { if (e.key == 'r' && e.ctrlKey) { alert('Refreshing will clear unsaved Aamks data. Continue?') ; } }) ;
	$(this).keypress((e) => { if (e.key == 'x' && ! isEmpty(cg)) { cgRemove(); }});
	$(this).keypress((e) => { if (e.key == 'g') { bulkProps(); } });
	// debug
	//$(this).keypress((e) => { if (e.key == ']') { (snap_lines); } });
	$(this).keypress((e) => { if (e.key == ']') { 
		dd(db({'floor': floor}).get());
	}});


}
//}}}
function escapePressed() {//{{{
	svg.on('mousedown', null); svg.on('mousemove', null); svg.on('mouseup', null); 
	if("beforeMouseUp" in cg) { cgRemove(); }
}
//}}}
function dbUpdateCadJsonStr() { //{{{
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
			cad_json=`[[ ${i.x0}, ${i.y0}, ${i.z0} ], [ ${i.x1}, ${i.y1}, ${i.z1} ], { "idx": ${i.idx}, "mvent_throughput": ${i.mvent_throughput}} ]`; 
		} else {
			cad_json=`[[ ${i.x0}, ${i.y0}, ${i.z0} ], [ ${i.x1}, ${i.y1}, ${i.z1} ], { "idx": ${i.idx} } ]`; 
		}
		db({'name': i.name}).update({'cad_json': cad_json});
	}
}
//}}}
function closeTxtCadJson() {//{{{
	$("#div-cad-json-textarea").remove();
	if(fire_model=='FDS') { return; }
	$("view2d").css("display", "block");
	$("#apainter-svg").css("display", "block");
}
//}}}
function saveTxtCadJson() {//{{{
	var json_data=$("#cad-json-textarea").val();
	ajaxSaveCadJson(json_data, fire_model); 
	closeTxtCadJson();
}
//}}}
function txtEditCadJson(pretty_json="") {//{{{
	$("view2d").css("display", "none");
	$("#apainter-svg").css("display", "none");
	if(pretty_json=="") { var pretty_json=db2cadjson(); }
	$("body").append(
		"<div id=div-cad-json-textarea><br><br>"+
		"<textarea id=cad-json-textarea>"+pretty_json+"</textarea>"+
		"</div>"
	);
}
//}}}
function svgGroupsInit(json) {//{{{
	$(".floor").remove();
	$(".snap_v").remove();
	$(".snap_h").remove();

	floorsCount=0;
	for (var _floor in json) { 
		d3.select("#building").append("g").attr("id", "floor"+_floor).attr("class", "floor").attr("fill-opacity", 0.4).attr('visibility',"hidden");
		floorsCount++;
	}
	$("#floor"+floor).attr('visibility',"visible").css("opacity", 1);
}
//}}}
function json2db(json) { //{{{
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
				cgMake(Number(floor),letter,json[floor][elems[i]][geometry]);
				cgDb();
				cgSvg();
				cgCss();
			}
		}
	}
	updateSnapLines(); // This is a heavy call, which shouldn't be called for each cgDb()
}
//}}}
function cgMake(floor,letter,arr) { //{{{
	cg.x0=arr[0][0];
	cg.y0=arr[0][1];
	cg.z0=arr[0][2];
	cg.x1=arr[1][0];
	cg.y1=arr[1][1];
	cg.z1=arr[1][2];
	cg.idx= arr[2]['idx'];
	cg.name= letter+arr[2]['idx'];
	cg.letter= letter;
	cg.type= gg[letter].t;
	cg.floor= floor;
	cg.exit_type= '';
	cg.room_enter= '';
	cg.dimz= cg.z1-cg.z0;
	cg.mvent_throughput=0;

	if(gg[letter].t == 'door')  { cg.exit_type=arr[2]['exit_type']; }
	if(gg[letter].t == 'room')  { cg.room_enter=arr[2]['room_enter']; }
	if(gg[letter].t == 'mvent') { cg.mvent_throughput=arr[2]['mvent_throughput']; }
}
//}}}
function ajaxSaveCadJson(json_data, fire_model) { //{{{
	$.post('/aamks/ajax.php?ajaxApainterExport', { 'data': json_data, 'fire_model': fire_model }, function (json) { 
		ajax_msg(json); 
		importCadJson();
	});
}
//}}}
function importCadJson() { //{{{
	$.post('/aamks/ajax.php?ajaxApainterImport', { }, function (json) { 
		// We loop thru cgDb() here which updates the cg
		// At the end the last elem in the loop would be the cg
		// which may run into this-elem-doesnt-belong-to-this-floor problem.
		ajax_msg(json); 
		if(json.err=='FDS') {
			fire_model='FDS';
			txtEditCadJson(json.data);
		} else {
			fire_model='CFAST';
			svgGroupsInit(json.data);
			_.each(json.data, function(data,floor) { importUnderlay(data['UNDERLAY'],floor); });
			json2db(json.data);
			cg={};
			d3.select('#floor_text').text("floor "+floor+"/"+floorsCount);
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
function dbReorder() {//{{{
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
	dbUpdateCadJsonStr();
}
//}}}
function db2cadjson() {//{{{
	// Instead of JSON.stringify we prefer our own pretty formatting.
	// Since names appear in SVG and we are reordering we need to write and reread 
	dbReorder();
	var json=[];
	for(var f=0; f<floorsCount; f++) { 
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
		ff+=underlaySaveCad(f);
		ff+='\n\t}';
		json.push(ff);
	}
	var pretty_json="{\n"+json.join(",\n")+"\n}\n";
	ajaxSaveCadJson(pretty_json, fire_model);
	return pretty_json;
}
//}}}
function floorCopy() {	//{{{
	c2f=Number($("#copy_to_floor").val());
	var guess=db({"floor": floor, 'letter': 'r'}).select("dimz");
	if(guess[0] != undefined) {
		var z0=guess[0] * c2f;
	} else {
		var z0=defaults.floor_dimz * c2f;
	}
	floorsCount++;
	building.append("g").attr("id", "floor"+c2f).attr({"class": "floor", "opacity": 0, "visibility": "hidden"});
	var src=db({'floor': floor}).get();
	for (var i in src) {
		cgIdUpdate();
		if (src[i]['letter'] == 's') { continue; }
		cg= $.extend({}, src[i]);
		cg.floor=c2f;
		cg.name=gg[cg['letter']].x+cgID;
		cg.z1=z0 + cg['z1']-cg['z0'];
		cg.z0=z0;
		cgDb();
		cgSvg();
	}
	$("#floor"+c2f).attr({"class": "floor", "fill-opacity": 0.4, "visibility": "hidden"});

	cg={};
	updateSnapLines();
	showGeneralBox();
	ajax_msg({'err':0, 'msg': "floor"+floor+" copied onto floor"+c2f});
}//}}}

function bulkPlainProps() {//{{{
	var tbody='';
	tbody+="<tr><td>name<td>x0<td>y0<td>x-dim<td>y-dim<td>z-dim";
	var items=db({'letter': activeLetter, 'floor': floor}).get();
	for (var i in items) { 
		tbody+="<tr><td class=bulkProps id="+ items[i]['name']+ ">"+ items[i]['name']+"</td>"+
			"<td>"+items[i]['x0']+
			"<td>"+items[i]['y0']+
			"<td>"+items[i]['dimx']+
			"<td>"+items[i]['dimy']+
			"<td>"+items[i]['dimz'];
	}
	return tbody;
}
//}}}
function bulkMventProps() {//{{{
	var tbody='';
	tbody+="<tr><td>name<td>x0<td>y0<td>x-dim<td>y-dim<td>z-dim<td>throughput";
	var items=db({'letter': activeLetter, 'floor': floor}).get();
	for (var i in items) { 
		tbody+="<tr><td class=bulkProps id="+ items[i]['name']+ ">"+ items[i]['name']+"</td>"+
			"<td>"+items[i]['x0']+
			"<td>"+items[i]['y0']+
			"<td>"+items[i]['dimx']+
			"<td>"+items[i]['dimy']+
			"<td>"+items[i]['dimz']+
			"<td>"+items[i]['mvent_throughput'];
	}
	return tbody;
}
//}}}
function bulkWinProps() {//{{{
	var tbody='';
	tbody+="<tr><td>name<td>x0<td>y0<td>x-dim<td>y-dim<td>z-dim";
	var items=db({'letter': activeLetter, 'floor': floor}).get();
	for (var i in items) { 
		tbody+="<tr><td class=bulkProps id="+ items[i]['name']+ ">"+ items[i]['name']+"</td>"+
			"<td>"+items[i]['x0']+
			"<td>"+items[i]['y0']+
			"<td>"+items[i]['dimx']+
			"<td>"+items[i]['dimy']+
			"<td>"+items[i]['dimz']
	}
	return tbody;
}
//}}}
function bulkDoorProps() {//{{{
	var tbody='';
	tbody+="<tr><td>name<td>x0<td>y0<td>x-dim<td>y-dim<td>z-dim<td>exit_type";
	var items=db({'letter': activeLetter, 'floor': floor}).get();
	for (var i in items) { 
		tbody+="<tr><td class=bulkProps id="+ items[i]['name']+ ">"+ items[i]['name']+"</td>"+
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
function bulkRoomProps() {//{{{
	var tbody='';
	tbody+="<tr><td>name<td>x0<td>y0<td>x-dim<td>y-dim<td>z-dim<td>enter";
	var items=db({'letter': activeLetter, 'floor': floor}).get();
	for (var i in items) { 
		tbody+="<tr><td class=bulkProps id="+ items[i]['name']+ ">"+ items[i]['name']+"</td>"+
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
function bulkEvacueeProps() {//{{{
	var tbody='';
	tbody+="<tr><td>name<td>x0<td>y0";

	var items=db({'letter': activeLetter, 'floor': floor}).get();
	for (var i in items) { 
		tbody+="<tr><td class=bulkProps id="+ items[i]['name']+ ">"+ items[i]['name']+"</td>"+
			"<td>"+items[i]['x0']+
			"<td>"+items[i]['y0'];
	}
	return tbody;
}
//}}}
function bulkProps() {//{{{
	var html='';
	html+='<div style="overflow-y: scroll; height: '+(canvas[1]-100)+'px">';
	html+='<wheat>Hover name, then <letter>x</letter> to delete</wheat>';
	html+='<table id=gg_listing style="margin-right:20px">';
	if (gg[activeLetter].t=='mvent') { 
		html+=bulkMventProps();
	} else if (gg[activeLetter].t=='window') { 
		html+=bulkWinProps();
	} else if (gg[activeLetter].t=='door') { 
		html+=bulkDoorProps();
	} else if (gg[activeLetter].t=='evacuee') { 
		html+=bulkEvacueeProps();
	} else if (gg[activeLetter].t=='room') { 
		html+=bulkRoomProps();
	} else {
		html+=bulkPlainProps();
	}
	html+="</table>";
	html+="</div>";

	rightBoxShow(html, 0);
}
//}}}

function dimProps() {//{{{
	var prop='';
	if(gg[activeLetter].t!='evacuee') {
		//var selected=db({'name':cg}).select("exit_type")[0]; // TODO: some garbage line?
		prop+="<tr><td>x-dim<td><input id=alter_dimx type=text size=3 value="+db({'name':cg.name}).select("dimx")[0]+"> cm";
		prop+="<tr><td>y-dim<td><input id=alter_dimy type=text size=3 value="+db({'name':cg.name}).select("dimy")[0]+"> cm";
		prop+="<tr><td>z-dim<td><input id=alter_dimz type=text size=3 value="+db({'name':cg.name}).select("dimz")[0]+"> cm";
	} else {
		prop+="<input id=alter_dimx type=hidden value=0> cm";
		prop+="<input id=alter_dimy type=hidden value=0> cm";
		prop+="<input id=alter_dimz type=hidden value=0> cm";
	}
	return prop;
}
//}}}
function roomProps() {//{{{
	var prop='';
	if(gg[activeLetter].t=='room') {
		var selected=db({'name':cg.name}).select("room_enter")[0];
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
function mventProps() {//{{{
	var mvent='';
	if(gg[activeLetter].t=='mvent') {
		mvent+="<tr><td>throughput<td>  <input id=alter_mvent_throughput type=text size=3 value="+db({'name':cg.name}).select("mvent_throughput")[0]+">";
	} else {
		mvent+="<input id=alter_mvent_throughput type=hidden value=0>";
	}
	return mvent;
}
//}}}
function doorProps() {//{{{
	var prop='';
	if(gg[activeLetter].t=='door') {
		var selected=db({'name':cg.name}).select("exit_type")[0];
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

function rightBoxShow(html, close_button=1) {//{{{
	$('right-menu-box').html("");
	if(close_button==1) { $('right-menu-box').append("<close-right-menu-box><img src=/aamks/css/close.svg></close-right-menu-box><br>"); }
	$('right-menu-box').append(html);
	$('right-menu-box').fadeIn(); 
}
//}}}
function showGeneralBox() {//{{{
	rightBoxShow(
		"<table class=nobreak>"+
		"<input id=general_setup type=hidden value=1>"+
		"<tr><td colspan=2 style='text-align: center'>since now"+
		"<tr><td>floor<td><input id=floor type=text name=floor size=4 value="+floor+">"+ 
		"<tr><td>floor's z-origin <td><input id=floorZ0 type=text size=4   name=floorZ0 value="+floorZ0+">"+
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
function showHelpBox() {//{{{
	rightBoxShow(
		"<table class=nobreak>"+
		"<tr><td><letter>letter</letter> + <letter>leftMouse</letter><td> create element"+
		"<tr><td>double <letter>leftMouse</letter><td> element properties"+
		"<tr><td>hold <letter>ctrl</letter> <td> disable snapping"+ 
		"<tr><td><letter>h</letter>	<td> loop views"+ 
		"<tr><td><letter>n</letter>	<td> loop floors"+ 
		"<tr><td><letter>x</letter>	<td> delete active"+
		"<tr><td><letter>g</letter>	<td> list all of active type"+
		"<tr><td><letter>ctrl</letter> + <letter>alt</letter>	<td> underlays"+
		"<tr><td><letter>=</letter>	<td> original zoom"+
		"</table>"
	);
}
//}}}
function showCgPropsBox() {//{{{
	activeLetter=db({'name':cg.name}).select("letter")[0];
	//dd(cg);
	rightBoxShow(
	    "<input id=geom_properties type=hidden value=1>"+
		"<wheat><letter>x</letter> to delete, <letter>g</letter> for listing</wheat>"+
		"<table>"+
	    "<tr><td>name <td>"+db({'name':cg.name}).select("name")[0]+
		"<tr><td>x0	<td>	<input id=alter_x0 type=text size=3 value="+db({'name':cg.name}).select("x0")[0]+"> cm"+
		"<tr><td>y0	<td>	<input id=alter_y0 type=text size=3 value="+db({'name':cg.name}).select("y0")[0]+"> cm"+
		"<tr><td>z0	<td>	<input id=alter_z0 type=text size=3 value="+db({'name':cg.name}).select("z0")[0]+"> cma"+
		dimProps()+
		roomProps()+
		mventProps()+
		doorProps()+
		"</table>", 0
	);

}
//}}}

function saveRightBoxGeneral() {//{{{
	if (floor != $("#floor").val()) { changeFloor(Number($("#floor").val())); }
	floorZ0=Number($("#floorZ0").val());
	defaults.door_dimz=Number($("#default_door_dimz").val());
	defaults.door_width=Number($("#default_door_width").val());
	defaults.floor_dimz=Number($("#default_floor_dimz").val());
	defaults.window_dimz=Number($("#default_window_dimz").val());
	defaults.window_offsetz=Number($("#default_window_offsetz").val());
	legend();
}
//}}}
function saveRightBoxCgProps() {//{{{
	//if(isEmpty(cg)) { return; } // TODO: can we ever reach this condition?
	cg.room_enter=$("#alter_room_enter").val();
	cg.exit_type=$("#alter_exit_type").val();
	cg.dimz=Number($("#alter_dimz").val());
	cg.z0=Number($("#alter_z0").val());
	cg.mvent_throughput=Number($("#alter_mvent_throughput").val());
	cg.x0=Number($("#alter_x0").val());
	cg.y0=Number($("#alter_y0").val());
	cg.x1=Number($("#alter_x0").val())+Number($("#alter_dimx").val());
	cg.y1=Number($("#alter_y0").val())+Number($("#alter_dimy").val());

	if(cg.floor != floor) { return; } // Just to be sure, there were (hopefully fixed) issues
	cgUpdateSvg();
	cgCss();
	cgPolish();
	cgDb();
	showCgPropsBox(); 
	updateSnapLines();
} 
//}}}
function saveRightBox() {//{{{
	if ($("#general_setup").val() != null)   { saveRightBoxGeneral(); }
	if ($("#geom_properties").val() != null) { saveRightBoxCgProps(); }
}
//}}}

