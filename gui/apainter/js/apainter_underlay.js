function register_underlay_listeners() {//{{{
	$("body").on("blur"   , "#p1"				  , function() { $("#p1").remove(); });
	$("body").on("click"  , "#remove_underlay"    , function() { $("#underlay"+floor).remove(); });
	$("body").on("change" , "#add_underlay"       , function() { add_underlay(this); });
	$("body").on("keyup"  , "#underlay_opacity"   , function() { underlay_single_attrib(floor, 'opacity' , $("#underlay_opacity").val()) ; }) ;
	$("body").on("keyup"  , "#underlay_invert"    , function() { underlay_single_attrib(floor, 'invert'  , $("#underlay_invert").val())  ; }) ;
	$("body").on("click"  , "#set_underlay_width" , function() { set_underlay_width(floor)   ; }) ;
	$(this).keyup((e) =>    { if (e.key == 'Shift') { $("#apainter-svg").css("pointer-events", "auto"); $('image').css("pointer-events", "none");$('.underlay').css("pointer-events", "none"); underlay_form(); } });
	$(this).keydown((e) =>  { if (e.key == 'Shift') { $("#apainter-svg").css("pointer-events", "none"); $('image').css("pointer-events", "auto");$('.underlay').css("pointer-events", "auto"); underlay_form(); } });
}
//}}}
function set_underlay_width(floor) {//{{{
	underlay_scale=Math.round(Number($("#uimg"+floor).attr("width")) * Number($("#underlay_width").val()) / Number($("#p1").attr('width')));
	d3.select("#uimg"+floor).attr('width', underlay_scale); 
	$("#p1").remove();
}
//}}}
function underlay_single_attrib(floor,key,val) { // {{{
	if(key=='opacity')          { d3.select("#uimg"+floor).style(key, val)                                               ; }
	if(key=='transform')        { d3.select("#uimg"+floor).attr(key, val)                                                ; }
	if(key=='invert' && val==1) { d3.select("#uimg"+floor).attr('invert' , 1).attr('filter', "url(#invertColorsFilter)") ; }
	if(key=='invert' && val==0) { d3.select("#uimg"+floor).attr('invert' , 0).attr('filter', null)                       ; }
}
//}}}
function underlay_attribs(floor,aa=0) {//{{{
	if (aa==0) {
		d3.select('#underlay'+floor).attr("visibility", "hidden").append("image").attr("id", "uimg"+floor).attr("width", 0).style("opacity", 0).attr("transform","translate(0,0)").attr("invert",0).attr("type", 'none');
	} else {
		d3.select("#uimg"+floor).attr("id", "uimg"+floor).attr("width", aa.width).style("opacity", aa.opacity).attr('filter', null).attr("invert", 0).attr("type", aa.type);
		if(aa.invert==1) { underlay_single_attrib(floor , 'invert' , 1); }
		if("transform" in aa) { underlay_single_attrib(floor , 'transform', aa.transform); }
	}
}
//}}}
function underlay_zoomer(floor) {//{{{
	d3.select("#underlay"+floor)
		.call(d3.zoom()
			.on("zoom", function() {
				d3.select("#uimg"+floor).attr("transform","translate("+Math.round(d3.event.transform.x)+","+Math.round(d3.event.transform.y)+")"); 
			})
		)
}
//}}}
function import_underlay(data,f,display_updated_form=0) {//{{{
	$("#underlay"+f).remove();
	d3.select('#building').insert("g", "g").attr("id", "underlay"+f).attr("class", "underlay");
	if(data != undefined) {
		data['floor']=f;
		$.post('/aamks/ajax.php?ajaxUnderlayOnInit', data, function (json) { 
			ajax_msg(json);
			if(f==floor) { visibility='visible'; } else { visibility='hidden'; }
			d3.select('#underlay'+f).attr("visibility", visibility).append("image").attr("id", "uimg"+f).attr("xlink:href", json.data.img).attr("pointer-events", "none");
			underlay_attribs(f, data);
				underlay_save_cad("0");
			if(display_updated_form==1) { underlay_form(); }
		});
	} else {
		underlay_attribs(f);
	}
	underlay_zoomer(f);
}
//}}}
function underlay_form() {//{{{
	$('right-menu-box').fadeIn(); 
	if($("#p1").length>0) { submit="<input id=set_underlay_width class=blink type=button value=set>"; } else { submit='<letter>p</letter>+drag'; }
 	d3.select('right-menu-box').html(
		"You can load an underlay<br>png/jpg/svg/pdf.<br><br>"+
		"<letter>shift</letter> invokes the underlay setup <br>"+
		"<letter>shift</letter> + mouse drags the underlay<br><br>"+ 
		"You can only alter the width of the<br>"+ 
		"underlay and the height will<br>"+
		"change accordingly.<br><br><br>"+
		"<input id=underlay"+floor+"_form type=hidden value=1>"+
		"<input type=file id=add_underlay    style='display:none'><label class=blink for='add_underlay'>add</label>"+
		"<div class=blink id=remove_underlay>remove</div>"+
		"<a href=underlay_example.svg target=_blank class=blink>scaling help</a>"+
		"<br><br><table>"+
		"<tr><td>scaler width <td><input id=underlay_width   type=text value="+$("#uimg"+floor).attr("width")+"  style='width:60px' >"+submit+
		"<tr><td>opacity      <td><input id=underlay_opacity type=text value="+$("#uimg"+floor).css("opacity")+" style='width:30px' >"+
		"<tr><td>invert colors<td><input id=underlay_invert  type=text value="+$("#uimg"+floor).attr("invert")+" style='width:30px' >"+
		"</table>"
	);

}
//}}}
function underlay_save_cad(floor) {//{{{
	if($("#uimg"+floor).attr('width') == 0) {
		return "";
	}
	json={}
	json.type=$("#uimg"+floor).attr('type');
	json.width=$("#uimg"+floor).attr('width');
	json.opacity=$("#uimg"+floor).css('opacity');
	json.invert=$("#uimg"+floor).attr('invert');
	json.transform=$("#uimg"+floor).attr('transform');
	return ',\n\t\t"UNDERLAY": '+JSON.stringify(json)+"\n";
}
//}}}
function pdf_svg_dom(json) { //{{{
	ajax_msg(json);
	$('#underlay'+floor).attr("href", 'data:image/svg+xml;utf8,'+json.data);
	$('#underlay'+floor).attr("width", 8000);
}
//}}}
function add_underlay(e) {//{{{
	var reader = new FileReader();
	reader.readAsDataURL(e.files[0]);
	reader.onload = function(event) {
		raw=event.target.result;
		arr=raw.split(";",2);
		type=arr[0].split(":",2)[1].split("/")[1];
		base64=arr[1].split(",",2)[1];
		if(['jpeg', 'png'].indexOf(type) > -1) {
			uSetup={ 'floor': floor, 'type': type, 'base64': base64, 'width':4000, 'opacity': 0.5, 'transform': "translate(0,0)" };
			$.post('/aamks/ajax.php?ajaxPostUnderlay', uSetup, function (json) { 
				ajax_msg(json);
				import_underlay(uSetup, floor,1);
			});
		} else {
			ajax_msg({'msg': "Aamks only supports png/jpg/svg/pdf underlays", 'err':1});
		}
	}
}
//}}}
