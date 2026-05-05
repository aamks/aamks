function registerListenersUnderlay() {//{{{

	//$("body").on("blur"   , "#p1"           , function() { $("#p1").remove(); });
	$("body").on("click"  , "#uimg_remove"  , function() { uimgRemove(); });
	$("body").on("change" , "#uimg_add"     , function() { uimgAdd(this);});
	// $("body").on("keyup"  , "#ufloor"       , function() { ufloorAdd(); });
	$("body").on("keyup"  , "#uimg_rotate"  , function() { uimgRotate(); }); 
	$("body").on("keyup"  , "#uimg_opacity" , function() { uChangeOpacity(); }) ;
	$("body").on("change" , "#uimg_invert"  , function() { uChangeInvert(); }) ;
	$("body").on("click"  , "#submit_scale" , function() { uimgScale(Number($(this).attr("data-underlay-width"))); });
	$("body").on("click"  , "#udrag"		, function () { setUnderlayDragMode(!state.isUnderlayDragMode);});

	$("body").on("click", "#btn-underlay-form", function()       { underlayForm(); });
	$("right-menu-box").on("click", "#close-img-svg", function() { setUnderlayDragMode(false), escapeAll(); $("#p1").remove(); });
}
//}}}
function setUnderlayDragMode(enabled) {
    state.isUnderlayDragMode = enabled;

    $("#udrag")
        .text(enabled ? "ON" : "OFF");

    $("#apainter-svg").css("pointer-events", enabled ? "none" : "auto");
    $("#uimg" + state.currentFloor).css("pointer-events", enabled ? "auto" : "none");
}
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
			amsg(json);
			d3.select("#uimg"+f).attr("xlink:href", json.data);
			underlayImgAttribs(f, data);
			if(reload_form==1) { setUnderlayDragMode(true); underlayForm(); }
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
	d3.select("#uimg"+state.currentFloor).style("rotate", $("#uimg_rotate").val()+'deg');
}
//}}}
function uimgScale(underlayWidth) {//{{{
	if (Number.isNaN(underlayWidth) || Number($("#uimg_scale").val()) <= 0) {
	 amsg({ 'err': 2, 'msg': "Set proper scaler width value and rectangle width! " });
	 return
	}
	ss=Number($("#uimg"+state.currentFloor).css("scale").split(" ")[0]) * Number($("#uimg_scale").val()) / underlayWidth;
	d3.select("#uimg"+state.currentFloor).style("scale", ss);
	amsg({ 'msg': "Underlay scaled. You can now drag it to the right place.", 'err': 0, 'duration': 5000 });
	$("#p1").remove();
	setUnderlayDragMode(true)
	underlayForm();
}
//}}}
function uChangeOpacity() {
	const val = $("#uimg_opacity").val();
	if (!isNaN(val) && val >= 0 && val <= 1) {
		d3.select("#uimg"+state.currentFloor).style("opacity", val);
	}
}
function uChangeInvert() {
	const val = $("#uimg_invert").is(":checked") ? 1 : 0;
	if (val == 1) {
		d3.select("#uimg"+state.currentFloor).attr('invert', 1).attr('filter', "url(#invertColorsFilter)");
	} else {
		d3.select("#uimg"+state.currentFloor).attr('invert', 0).attr('filter', null);
	}
}
function underlayImgAttribs(floor,aa={}) {//{{{
	if (isEmpty(aa)) {
		d3.select("#uimg"+floor).style("opacity", 0.3).attr("invert",0).attr("type", 'none');
	} else {
		d3.select("#uimg"+floor).style("opacity", aa.opacity).attr("filter", aa.invert == 1 ? "url(#invertColorsFilter)" : null)
		.attr("invert", aa.invert).attr("type", aa.type).style("scale", aa.scale).style("rotate", aa.rotate)
		.style("translate", aa.translate).style("transform", aa.transform);
	}
}
//}}}
function underlayFloorAttribs(floor,aa={}) {//{{{
	if (isEmpty(aa)) {
		d3.select("#ufloor"+floor).attr("uses_floor", "").style("opacity", 0.1).attr("invert",0);
	} else {
		d3.select("#ufloor"+floor).attr("uses_floor", aa.uses_floor).style("opacity", aa.opacity).attr("invert", aa.invert);
	}
}
//}}}
function underlay_zoomer(floor) {//{{{
	// The images (uimg) cannot be just dragged in d3js and
	// they must be paired with svg groups (underlays).

	d3.select("#underlay"+floor)
		.call(d3.zoom()
			.on("zoom", function(event) {
				d3.select("#uimg"+floor).style("transform", `translate(${Math.round(event.transform.x)}px, ${Math.round(event.transform.y)}px)`); 
			})
		)
}
//}}}
function getScaleSubmitHtml(width) {
	if (width > 0) {
		const properWidth = currentGeom.maxx - currentGeom.minx;
		return `<input id="submit_scale" data-underlay-width="${properWidth}" class="blink" type="button" value="set">`;
    }
    return "<letter>p</letter>+drag";
}
function underlayForm(width=0) {//{{{
	// escapeAll();
	// const usesFloorRaw = $("#ufloor" + state.currentFloor).attr("uses_floor");
	// const usesFloor = usesFloorRaw == null || Number.isNaN(Number(usesFloorRaw)) ? "" : Number(usesFloorRaw);
 	rightBoxShow(
		"<div id='underlay_form'>"+
		"<center>Underlay setup</center><br><br>"+
		"Supported files: png jpg svg pdf<br><br>"+
		"<input id=underlay"+state.currentFloor+"_form type=hidden value=1>"+
		"<input type=file id=uimg_add    style='display:none'><label class=blink for='uimg_add'>add</label>"+
		"<div class=blink id=uimg_remove>remove</div>"+
		"<a href=underlay_example.svg target=_blank class=blink>scaling help</a><br><br>"+
		"Drag underlay with <letter>leftMouse</letter>: "+
		"<center style='padding:10px'><button id=udrag type=button'>"+(state.isUnderlayDragMode ? 'ON' : 'OFF')+"</button></center>"+
		(width > 0 ? propsXYZ()  : "")+
		"<table>"+
		"<tr><td>scaler width <td><input autocomplete=off id=uimg_scale   type=text style='width:60px;"+(width > 0 ? "background-color:#808;'" : "'")+">"+getScaleSubmitHtml(width)+
		"<tr><td>opacity      <td><input autocomplete=off id=uimg_opacity type=text value="+$("#uimg"+state.currentFloor).css("opacity")+" style='width:30px' >"+
		"<tr><td>rotate		  <td><input autocomplete=off id=uimg_rotate  type=text style='width:30px' >"+
		"<tr><td>invert colors<td><input id=uimg_invert  type=checkbox "+( $("#uimg"+state.currentFloor).attr("invert")==1 ? "checked" : "" )+" style='width:30px' >"+
		"</table></div>"
		// "<tr><td>floor        <td><input autocomplete=off id=ufloor       type=text value='"+usesFloor+"' style='width:30px'> as underlay"+
	);
}
//}}}
function uimgRemove() {//{{{
	$.post('/aamks/ajax.php?ajaxRemoveUnderlay', {'floor': state.currentFloor}, function (json) {});
	$("#uimg"+state.currentFloor).remove(); 
	d3.select('#underlay'+state.currentFloor).append("image").attr("id", "uimg"+state.currentFloor);
	underlayImgAttribs(state.currentFloor);
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
			uSetup={ 'floor': state.currentFloor, 'type': type, 'base64': base64, 'opacity': 0.5, "scale": 1, "rotate": "0deg", "translate": '0px 0px' };
			$.post('/aamks/ajax.php?ajaxAddUnderlay', uSetup, function (json) { 
				amsg(json);
				importImgUnderlay(uSetup, state.currentFloor,1);
			});
		} else {
			amsg({'msg': "Aamks only supports png/jpg/svg/pdf underlays", 'err':1});
		}
	}
}
//}}}
function ufloorAdd() {//{{{
	ufloor = $("#ufloor").val()
	if(ufloor=="") { $("#ufloor"+state.currentFloor).attr("uses_floor", "").empty(); return; }
	ufloor=Number(ufloor);
	mm=d3.select('#ufloor'+state.currentFloor);
	mm.attr("uses_floor", ufloor);
	_.each(dbWhere({'floor': ufloor}), function(obj) {
		obj.name+="_underfloor";
		obj.floor=ufloor;
		drawGeom(obj, '#ufloor');
	});
	escapeAll(0);
}
//}}}
function underlayImgSaveCad(floor) {//{{{
	const $img=$("#uimg"+floor)
	const jsImage = document.getElementById("uimg" + floor);
	const transform = jsImage?.style?.transform || 'none';

	if($img.attr('type') == 'none') { return {}; }

	json={}
	json.type=$img.attr('type');
	json.invert=$img.attr('invert');
	json.opacity=$img.css('opacity');
	json.scale=$img.css('scale');
	json.rotate=$img.css('rotate');
	json.translate=$img.css('translate');
	json.transform = transform;
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
