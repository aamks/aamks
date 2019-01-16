function ajax_msg(r) {//{{{
	$('#ajax_msg').text(r['msg']);
	$('#ajax_msg').css('display', 'block');
	if(r['err']==1) { 
		$('#ajax_msg').css('background-color', "#800");
		$('#ajax_msg').delay(3000).fadeOut(400);
	} 
	else if(r['err']==0 && r['msg'].length>0) { 
		$('#ajax_msg').css('background-color', "#285");
		$('#ajax_msg').delay(1500).fadeOut(400);
	}
}
//}}}
