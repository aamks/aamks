function register_underlay_listeners() {//{{{

	$("body").on("blur"   , "#p1"           , function() { $("#p1").remove(); });
	$("body").on("click"  , "#uimg_remove"  , function() { uimg_remove(); });
	$("body").on("change" , "#uimg_add"     , function() { uimg_add(this); });
	$("body").on("keyup"  , "#uimg_rotate"  , function() { uimg_rotate(); }); 
	$("body").on("keyup"  , "#uimg_opacity" , function() { uimg_single_attrib(floor  , 'opacity' , $("#uimg_opacity").val()) ; }) ;
	$("body").on("keyup"  , "#uimg_invert"  , function() { uimg_single_attrib(floor  , 'invert'  , $("#uimg_invert").val())  ; }) ;
	$("body").on("click"  , "#submit_scale" , function() { uimg_scale(floor); });

	$(this).keydown((e) =>  { if (e.ctrlKey && e.altKey) {  $("#apainter-svg").css("pointer-events", "none"); $('#uimg'+floor).css("pointer-events", "auto"); underlay_form();  }});
	$(this).keyup((e) =>    { if (e.key == 'Alt') { $("#apainter-svg").css("pointer-events", "auto"); $('#uimg'+floor).css("pointer-events", "none"); underlay_form(); }});
}
//}}}
function import_underlay(data,f,reload_form=0) {//{{{
	// By convention underlayX and uimgX always exist but may contain zeroes

	$("#underlay"+f).remove();
	d3.select('#building').insert("g", "g").attr("id", "underlay"+f).attr("class", "underlay");
	if(data != undefined) {
		data['floor']=f;
		$.post('/aamks/ajax.php?ajaxGetUnderlay', data, function (json) { 
			ajax_msg(json);
			//dd(f,json);
			if(f==floor) { visibility='visible'; } else { visibility='hidden'; }
			d3.select('#underlay'+f).attr("visibility", visibility).append("image").attr("id", "uimg"+f).attr("pointer-events", "none").attr("width", 8000).attr("xlink:href", json.data);
			underlay_attribs(f, data);
			if(reload_form==1) { underlay_form(); }
		});
	} else {
		d3.select('#underlay'+f).attr("visibility", 'hidden').append("image").attr("id", "uimg"+f).attr("width", 8000);
		underlay_attribs(f);
	}
	underlay_zoomer(f);
}
//}}}
function uimg_rotate() {//{{{
	d3.select("#uimg"+floor).style("rotate", $("#uimg_rotate").val()+'deg');
}
//}}}
function uimg_scale(floor) {//{{{
	ss=Number($("#uimg"+floor).css("scale").split(" ")[0]) * Number($("#uimg_scale").val()) / Number($("#p1").attr('width'));
	d3.select("#uimg"+floor).style("scale", ss);
	$("#p1").remove();
}
//}}}
function uimg_single_attrib(floor,key,val) { // {{{
	if(key=='opacity')          { d3.select("#uimg"+floor).style(key, val)                                               ; }
	if(key=='invert' && val==1) { d3.select("#uimg"+floor).attr('invert' , 1).attr('filter', "url(#invertColorsFilter)") ; }
	if(key=='invert' && val==0) { d3.select("#uimg"+floor).attr('invert' , 0).attr('filter', null)                       ; }
}
//}}}
function underlay_attribs(floor,aa=0) {//{{{
	if (aa==0) {
		d3.select("#uimg"+floor).style("opacity", 0).attr("invert",0).attr("type", 'none');
	} else {
		d3.select("#uimg"+floor).style("opacity", aa.opacity).attr('filter', null).attr("invert", 0).attr("type", aa.type).style("scale", aa.scale).style("rotate", aa.rotate).style("translate", aa.translate)
		if(aa.invert==1) { uimg_single_attrib(floor , 'invert' , 1); }
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
function underlay_form() {//{{{
	if($("#p1").length>0) { submit="<input id=submit_scale class=blink type=button value=set>"; } else { submit='<letter>p</letter>+drag'; }
 	right_menu_box_show(
		"Supported: png jpg svg pdf<br><br>"+
		"<input id=underlay"+floor+"_form type=hidden value=1>"+
		"<input type=file id=uimg_add    style='display:none'><label class=blink for='uimg_add'>add</label>"+
		"<div class=blink id=uimg_remove>remove</div>"+
		"<a href=underlay_example.svg target=_blank class=blink>scaling help</a><br><br>"+
		"<letter>ctrl</letter> + <letter>alt</letter> + <letter>leftMouse</letter> drags"+ 
		"<br><br><table>"+
		"<tr><td>scaler width <td><input autocomplete=off id=uimg_scale   type=text style='width:60px' >"+submit+
		"<tr><td>opacity      <td><input autocomplete=off id=uimg_opacity type=text value="+$("#uimg"+floor).css("opacity")+" style='width:30px' >"+
		"<tr><td>rotate		  <td><input autocomplete=off id=uimg_rotate  type=text style='width:30px' >"+
		"<tr><td>invert colors<td><input autocomplete=off id=uimg_invert  type=text value="+$("#uimg"+floor).attr("invert")+" style='width:30px' >"+
		"</table>"
	);

}
//}}}
function uimg_remove() {//{{{
	$.post('/aamks/ajax.php?ajaxRemoveUnderlay', {'floor': floor}, function (json) {});
	$("#uimg"+floor).remove(); 
	d3.select('#underlay'+floor).append("image").attr("id", "uimg"+floor);
	underlay_attribs(floor);
	db2cadjson();
}
//}}}
function uimg_add(e) {//{{{
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
				import_underlay(uSetup, floor,1);
			});
		} else {
			ajax_msg({'msg': "Aamks only supports png/jpg/svg/pdf underlays", 'err':1});
		}
	}
}
//}}}
function underlay_save_cad(floor) {//{{{
	if($("#uimg"+floor).attr('type') == 'none') { 
		return "";
	}
	json={}
	json.type=$("#uimg"+floor).attr('type');
	json.opacity=$("#uimg"+floor).css('opacity');
	json.invert=$("#uimg"+floor).attr('invert');
	json.scale=$("#uimg"+floor).css('scale');
	json.rotate=$("#uimg"+floor).css('rotate');
	json.translate=$("#uimg"+floor).css('translate');
	if(json.type=='pdf') { json.type='svg'; }
	return ',\n\t\t"UNDERLAY": '+JSON.stringify(json)+"\n";
}
//}}}

