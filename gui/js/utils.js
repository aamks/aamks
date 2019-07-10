function ajax_msg(r) {//{{{
	if(r['err']==1) { 
		$('#ajax_msg').clearQueue();
		$('#ajax_msg').css('display', 'none');
		$('#ajax_msg').html("Aamks is halting on error:<br>"+r['msg']);
		$('#ajax_msg').css('display', 'block');
		$('#ajax_msg').css('background-color', "#800");
		throw new Error("Aamks is halting on error");
	} 
	else if(r['err']==0 && r['msg'].length>0) { 
		$('#ajax_msg').css('display', 'none');
		$('#ajax_msg').html(r['msg']);
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
function scenario_changer() {//{{{
	$("body").on("change", "#choose_scenario", function() {
		$.post('/aamks/ajax.php?ajaxChangeActiveScenario', {'ch_scenario':$(this).val() }, function (json) { 
			location.reload();
		});
	});
}
//}}}
function launch_simulation() {//{{{
	$("body").on("click", "#launch_simulation", function() {
		ajax_msg({"msg": "Trying to launch...", "err":0, "duration": 20000 }); 
		$.post('/aamks/ajax.php?ajaxLaunchSimulation', { }, function (json) { 
			ajax_msg(json); 
			if(json.err==0) {
				setTimeout(function(){
					location.reload();
				}, 1500);
			}
		});
	});

}
//}}}
function left_menu_box() {//{{{
	$.post('/aamks/ajax.php?ajaxMenuContent', { }, function (json) { 
		$("left-menu-box").html(json.data);

		$('button-left-menu-box').click(function() {
			$('left-menu-box').toggle();
		});

		$('close-left-menu-box').click(function() {
			$('left-menu-box').fadeOut();
		});

	});
}
//}}}
function dd(x) {//{{{
	console.log("dd:", x);
}
//}}}

$(function() { 
	scenario_changer();
	launch_simulation();
	if(navigator.userAgent.indexOf("Chrome")==-1) { alert("Aamks is designed for Google Chrome. Aamks may work, but is not supported on other browsers"); }
	$(this).keydown(function(e) { if (e.key == 'r' && e.ctrlKey) { alert('Refreshing will clear unsaved Aamks data. Continue?'); } });
});


