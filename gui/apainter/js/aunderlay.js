function registerListenersUnderlay() {//{{{

	//$("body").on("blur"   , "#p1"           , function() { $("#p1").remove(); });
	$("body").on("click"  , "#uimg_remove"  , function() { uimgRemove(); });
	$("body").on("change" , "#uimg_add"     , function() { uimgAdd(this); });
	$("body").on("keyup"  , "#ufloor"       , function() { ufloorAdd(floor); });
	$("body").on("keyup"  , "#uimg_rotate"  , function() { uimgRotate(); }); 
	$("body").on("keyup"  , "#uimg_opacity" , function() { uChangeAttrib(floor  , 'opacity' , $("#uimg_opacity").val()) ; }) ;
	$("body").on("keyup"  , "#uimg_invert"  , function() { uChangeAttrib(floor  , 'invert'  , $("#uimg_invert").val())  ; }) ;
	$("body").on("click"  , "#submit_scale" , function() { uimgScale(floor, Number($(this).attr('data-underlay-width'))); });

	$("body").on("click", "#btn-underlay-form", function()       { underlayForm(); });
	$("right-menu-box").on("click", "#close-img-svg", function() { underlayPointerEvents(stopDragging=1); });
}
//}}}
function underlayPointerEvents(stopDragging=0) {//{{{
	// Normaly we auto-detect whether underlay dragging should be taking place, but user may request it.
	if($("#uimg_remove").length) { 
		$("#apainter-svg").css("pointer-events", "none"); $('#uimg'+floor).css("pointer-events", "auto"); 
	} else {
		$("#apainter-svg").css("pointer-events", "auto"); $('#uimg'+floor).css("pointer-events", "none");
	}

	if(stopDragging==1) { $("#apainter-svg").css("pointer-events", "auto"); $('#uimg'+floor).css("pointer-events", "none"); }
}
//}}}
function importImgUnderlay(data,f,reload_form=0) {//{{{
	// By convention for each floor there always exist: 
	// underlayX: the group
	// uimgX: the underlay image 
	// ufloorX: the underlay floor group

	$("#underlay"+f).remove();
	d3.select('#floor'+f).insert("g",":first-child").attr("id", "underlay"+f).attr("class", "underlay");
	d3.select('#underlay'+f).append("image").attr("id", "uimg"+f).attr("width", 8000);
	d3.select('#underlay'+f).append("g").attr("id", "ufloor"+f).style("pointer-events", "none");
	d3.select('#uimg'+f).style("pointer-events", "none");

	if(data != undefined) {
		data.floor=f;
		$.post('/aamks/ajax.php?ajaxGetUnderlay', data, function (json) { 
			ajax_msg(json);
			d3.select("#uimg"+f).attr("xlink:href", json.data);
			underlayImgAttribs(f, data);
			if(reload_form==1) { underlayForm(); }
		});
	} else {
		underlayImgAttribs(f);
	}
	underlay_zoomer(f);
}
//}}}
function importFloorUnderlay(data,f,reload_form=0) {//{{{
	if(data == undefined || isEmpty(data)) {
		underlayFloorAttribs(f);
	} else {
		underlayFloorAttribs(f, data);
		ufloorAdd(f, data.uses_floor);
		if(reload_form==1) { underlayForm(); }
	}
}
//}}}
function uimgRotate() {//{{{
	d3.select("#uimg"+floor).style("rotate", $("#uimg_rotate").val()+'deg');
}
//}}}
function uimgScale(floor, underlay_width) {//{{{
	ss=Number($("#uimg"+floor).css("scale").split(" ")[0]) * Number($("#uimg_scale").val()) / underlay_width;
	d3.select("#uimg"+floor).style("scale", ss);
	$("#p1").remove();
}
//}}}
function uChangeAttrib(floor,key,val) { // {{{
	if(key=='opacity')          { d3.select("#uimg"+floor).style(key, val)                                               ; }
	if(key=='invert' && val==1) { d3.select("#uimg"+floor).attr('invert' , 1).attr('filter', "url(#invertColorsFilter)") ; }
	if(key=='invert' && val==0) { d3.select("#uimg"+floor).attr('invert' , 0).attr('filter', null)                       ; }

	if(key=='opacity')          { d3.select("#ufloor"+floor).style(key, val)                                               ; }
	if(key=='invert' && val==1) { d3.select("#ufloor"+floor).attr('invert' , 1).attr('filter', "url(#invertColorsFilter)") ; }
	if(key=='invert' && val==0) { d3.select("#ufloor"+floor).attr('invert' , 0).attr('filter', null)                       ; }
}
//}}}
function underlayImgAttribs(floor,aa={}) {//{{{
	if (isEmpty(aa)) {
		d3.select("#uimg"+floor).style("opacity", 0.3).attr("invert",0).attr("type", 'none');
	} else {
		d3.select("#uimg"+floor).style("opacity", aa.opacity).attr('filter', null).attr("invert", 0).attr("type", aa.type).style("scale", aa.scale).style("rotate", aa.rotate).style("translate", aa.translate);
		if(aa.invert==1) { uChangeAttrib(floor , 'invert' , 1); }
	}
}
//}}}
function underlayFloorAttribs(floor,aa={}) {//{{{
	if (isEmpty(aa)) {
		d3.select("#ufloor"+floor).attr("uses_floor", "").style("opacity", 0.1).attr("invert",0);
	} else {
		d3.select("#ufloor"+floor).attr("uses_floor", aa.uses_floor).style("opacity", aa.opacity).attr("invert", aa.invert);
		if(aa.invert==1) { uChangeAttrib(floor , 'invert' , 1); }
	}
}
//}}}
function underlay_zoomer(floor) {//{{{
	// The images (uimg) cannot be just dragged in d3js and
	// they must be paired with svg groups (underlays).

	d3.select("#underlay"+floor)
		.call(d3.zoom()
			.on("zoom", function() {
				d3.select("#uimg"+floor).style("translate", Math.round(d3.event.transform.x)+'px '+Math.round(d3.event.transform.y)+'px'); 
			})
		)
}
//}}}
function underlayForm(width=0) {//{{{
	if(width>0) { submit="<input id=submit_scale data-underlay-width='"+width+"' class=blink type=button value=set>"; } else { submit='<letter>p</letter>+drag'; }
	if($("#ufloor"+floor).attr("uses_floor")!=undefined) { var uufloor=$("#ufloor"+floor).attr("uses_floor"); } else { var uufloor=''; } 
	
 	rightBoxShow(
		"<center>Underlay setup</center><br><br>"+
		"Supported files: png jpg svg pdf<br><br>"+
		"<input id=underlay"+floor+"_form type=hidden value=1>"+
		"<input type=file id=uimg_add    style='display:none'><label class=blink for='uimg_add'>add</label>"+
		"<div class=blink id=uimg_remove>remove</div>"+
		"<a href=underlay_example.svg target=_blank class=blink>scaling help</a><br><br>"+
		"<letter>leftMouse</letter> drags the underlay"+ 
		"<br><br><table>"+
		"<tr><td>scaler width <td><input autocomplete=off id=uimg_scale   type=text style='width:60px' >"+submit+
		"<tr><td>opacity      <td><input autocomplete=off id=uimg_opacity type=text value="+$("#uimg"+floor).css("opacity")+" style='width:30px' >"+
		"<tr><td>rotate		  <td><input autocomplete=off id=uimg_rotate  type=text style='width:30px' >"+
		"<tr><td>invert colors<td><input autocomplete=off id=uimg_invert  type=text value="+$("#uimg"+floor).attr("invert")+" style='width:30px' >"+
		"<tr><td>floor        <td><input autocomplete=off id=ufloor       type=text value='"+uufloor+"' style='width:30px'> as underlay"+
		"</table>"
	);

}
//}}}
function uimgRemove() {//{{{
	$.post('/aamks/ajax.php?ajaxRemoveUnderlay', {'floor': floor}, function (json) {});
	$("#uimg"+floor).remove(); 
	d3.select('#underlay'+floor).append("image").attr("id", "uimg"+floor);
	underlayImgAttribs(floor);
	db2cadjson();
}
//}}}
function uimgAdd(e) {//{{{
	var reader = new FileReader();
	reader.readAsDataURL(e.files[0]);
	reader.onload = function(event) {
		raw=event.target.result;
		arr=raw.split(";",2);
		type=arr[0].split(":",2)[1].split("/")[1];
		base64=arr[1].split(",",2)[1];
		if(type=="svg+xml") { type="svg"; }
		if(['jpeg', 'png', 'pdf', 'svg'].indexOf(type) > -1) {
			uSetup={ 'floor': floor, 'type': type, 'base64': base64, 'opacity': 0.5, "scale": 1, "rotate": "0deg", "translate": '0px 0px' };
			$.post('/aamks/ajax.php?ajaxAddUnderlay', uSetup, function (json) { 
				ajax_msg(json);
				importImgUnderlay(uSetup, floor,1);
			});
		} else {
			ajax_msg({'msg': "Aamks only supports png/jpg/svg/pdf underlays", 'err':1});
		}
	}
}
//}}}
function ufloorAdd(floor, ufloor=$("#ufloor").val()) {//{{{
	if(ufloor=="") { $("#ufloor"+floor).attr("uses_floor", ""); $("#ufloor"+floor).empty(); return; }
	ufloor=Number(ufloor);
	mm=d3.select('#ufloor'+floor);
	mm.attr("uses_floor", ufloor);
	_.each(db({'floor': ufloor}).get(), function(m) {
		cgSelect(m.name,0,0);
		cg.name=cg.name+"_underfloor";
		cgSvg('#ufloor'+floor);
	});
	escapeAll(0);
}
//}}}
function underlayImgSaveCad(floor) {//{{{
	if($("#uimg"+floor).attr('type') == 'none') { return {}; }

	json={}
	json.type=$("#uimg"+floor).attr('type');
	json.opacity=$("#uimg"+floor).css('opacity');
	json.invert=$("#uimg"+floor).attr('invert');
	json.scale=$("#uimg"+floor).css('scale');
	json.rotate=$("#uimg"+floor).css('rotate');
	json.translate=$("#uimg"+floor).css('translate');
	if(json.type=='pdf') { json.type='svg'; }
	return json;
}
//}}}
function underlayFloorSaveCad(floor) {//{{{
	if($('#ufloor'+floor).attr('uses_floor')=="" ) { return {}; }
	json={}
	json.uses_floor=$('#ufloor'+floor).attr('uses_floor');
	json.opacity=$("#uimg"+floor).css('opacity');
	json.invert=$("#uimg"+floor).attr('invert');
	return json;
}
//}}}
