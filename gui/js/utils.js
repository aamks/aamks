function ajax_msg(r) {//{{{
	$('#ajax_msg').clearQueue();
	if(r['err']==1) { 
		$('#ajax_msg').css('display', 'none');
		$('#ajax_msg').text(r['msg']);
		$('#ajax_msg').css('display', 'block');
		$('#ajax_msg').css('background-color', "#800");
		throw new Error("Aamks is halting on error");
	} 
	else if(r['err']==0 && r['msg'].length>0) { 
		$('#ajax_msg').css('display', 'none');
		$('#ajax_msg').text(r['msg']);
		$('#ajax_msg').css('display', 'block');
		$('#ajax_msg').css('background-color', "#285");
		if ("duration" in r) {
			var duration=r['duration'];
		} else {
			var duration=1500;
		}
		$('#ajax_msg').delay(duration).fadeOut(400);
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
function simulation_launcher() {//{{{
	$("body").on("click", "#launch_simulation", function() {
		ajax_msg({"msg": "Trying to launch...", "err":0, "duration": 20000 }); 
		$.post('/aamks/ajax.php?ajaxLaunchSimulation', { }, function (json) { 
			ajax_msg(json); 
		});
	});

}
//}}}
function left_menu_box() {//{{{
	$.post('/aamks/ajax.php?ajaxMenuContent', { }, function (json) { 
		$("left-menu-box").html(json.data);

		$('button-left-menu-box').click(function() {
			$('left-menu-box').fadeIn();
		});

		$('close-left-menu-box').click(function() {
			$('left-menu-box').fadeOut();
		});

	});
}
//}}}

$(function() { 
	choose_scenario_listener();
	simulation_launcher();
});


