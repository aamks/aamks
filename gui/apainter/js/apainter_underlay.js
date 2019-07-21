function register_underlay_listeners() {//{{{
	$("body").on("click"  , "#remove_underlay"    , function() { $("#underlay"+floor).remove(); });
	$("body").on("change" , "#add_underlay"       , function() { add_underlay(this); });
	$("body").on("keyup"  , "#underlay_opacity"   , function() { underlay_single_attrib(floor, 'opacity' , $("#underlay_opacity").val()) ; }) ;
	$("body").on("keyup"  , "#underlay_invert"    , function() { underlay_single_attrib(floor, 'invert'  , $("#underlay_invert").val())  ; }) ;
	$("body").on("click"  , "#set_underlay_width" , function() { set_underlay_width(floor)   ; }) ;
	$(this).keyup((e) =>    { if (e.key == 'Shift') { $("#apainter-svg").css("pointer-events", "auto"); $('image').css("pointer-events", "none");$('.underlay').css("pointer-events", "none");} });
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
		if("translate" in aa) { underlay_single_attrib(floor , 'transform', "translate("+aa.translate[0]+","+aa.translate[1]+")"); }
	}
}
//}}}
function underlay_zoomer(floor) {//{{{
	d3.select("#underlay"+floor)
		.call(d3.zoom()
			.on("zoom", function() {
				dd("underlay"+floor);
				d3.select("#uimg"+floor).attr("transform","translate("+Math.round(d3.event.transform.x)+","+Math.round(d3.event.transform.y)+")"); 
			})
		)
}
//}}}
function import_underlays(cad) {//{{{
	global_floor=floor;
	_.each(cad, function(data,floor) {
		d3.select('#building').insert("g", "g").attr("id", "underlay"+floor).attr("class", "underlay");
		if('UNDERLAY' in data && 'type' in data['UNDERLAY']) {
			data['UNDERLAY']['floor']=floor;
			$.post('/aamks/ajax.php?ajaxUnderlayOnInit', data['UNDERLAY'], function (json) { 
				ajax_msg(json);
				if(global_floor==floor) { visibility='visible'; } else { visibility='hidden'; }
				d3.select('#underlay'+floor).attr("visibility", visibility).append("image").attr("id", "uimg"+floor).attr("xlink:href", json.data.img).attr("pointer-events", "none");
				underlay_attribs(floor, data['UNDERLAY']);
				underlay_save_cad('0');
			});
		} else {
			underlay_attribs(floor);
		}
		underlay_zoomer(floor);
	});
}
//}}}
function underlay_form() {//{{{
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
		"<tr><td>scaler width <td><input id=underlay_width   type=text value="+$("#uimg"+floor).attr("width")+"  style='width:60px'><input id=set_underlay_width class=blink type=button value=set>"+ 
		"<tr><td>opacity      <td><input id=underlay_opacity type=text value="+$("#uimg"+floor).css("opacity")+" style='width:30px' >"+
		"<tr><td>invert colors<td><input id=underlay_invert  type=text value="+$("#uimg"+floor).attr("invert")+" style='width:30px' >"+
		"</table>"
	);

}
//}}}
function underlay_save_cad(floor) {//{{{
	opacity=$("#uimg"+floor).css('opacity');
	//"UNDERLAY": { "type": "png", "width": 5000, "opacity": 0.2, "invert": 0, "translate": [2840,1000] }
}
//}}}
function pdf_svg_dom(json) { //{{{
	ajax_msg(json);
	$('#underlay'+floor).attr("href", 'data:image/svg+xml;utf8,'+json.data);
	$('#underlay'+floor).attr("width", 8000);
}
//}}}
function ajaxPdf2svg() { //{{{
	postFile('/aamks/ajax.php?ajaxPdf2svg')
	  .then(data => pdf_svg_dom(data))
	  .catch(error => ajax_msg(error))

	function postFile(url) {
	  const formData = new FormData()
	  const fileField = document.querySelector('#add_underlay')
	  formData.append('file', fileField.files[0]);

	  return fetch(url, {
		method: 'POST', 
		body: formData  
	  })
	  .then(response => response.json())
	}
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
			$.post('/aamks/ajax.php?ajaxPostUnderlay', { 'floor': floor, 'type': type, 'base64': base64 }, function (json) { 
				dd("OK", json);
			});
		} else {
			ajax_msg({'msg': "Aamks only supports png/jpg/svg/pdf underlays", 'err':1});
		}
	}

	//var reader = new FileReader();
	//if(file.type=='application/pdf') {
	//	ajaxPdf2svg();
	//} 
}
//}}}
