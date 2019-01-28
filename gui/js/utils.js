function ajax_msg(r) {//{{{
	if(r['err']==1) { 
		$('#ajax_msg').text(r['msg']);
		$('#ajax_msg').css('display', 'block');
		$('#ajax_msg').css('background-color', "#800");
		throw new Error("Aamks is halting on error");
	} 
	else if(r['err']==0 && r['msg'].length>0) { 
		$('#ajax_msg').text(r['msg']);
		$('#ajax_msg').css('display', 'block');
		$('#ajax_msg').css('background-color', "#285");
		$('#ajax_msg').delay(1500).fadeOut(400);
	}
}
//}}}
function choose_scenario_listener() { //{{{
	$("body").on("change", "#choose_scenario", function() {
		$.post('/aamks/ajax.php?ajaxChangeActiveScenario', {'ch_scenario':$(this).val() }, function (json) { 
			$("#menu-active-scenario-label").html(json.data);
			ajax_msg(json);
		});
	});
}
//}}}

$(function() { 
	choose_scenario_listener();
});


