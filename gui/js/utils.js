$(function()  {//{{{
	$.post('/aamks/ajax.php?ajaxMenuContent', { }, function (json) { 
		if($('left-menu-box').length==0) { 
			$("body").append("<left-menu-box>");
			$("left-menu-box").html(json.data);
		}

		$("body").on("click", "#menu-dropdown", function() {
			$("left-menu-box").remove();
			$("body").append("<left-menu-box>");
			$("left-menu-box").html(json.data);
		});

		$("body").on("click", "close-left-menu-box", function() {
			$('left-menu-box').css({"background-color": "transparent"}).animate({'width': $('left-menu-box').css("width"), "border-width": 0, 'height': 12, 'top':0, 'left':0 }).html("<input type=submit id='menu-dropdown' value=Menu>");
		});
	});
});
//}}}

function make_legend0(module) {//{{{
	$('legend0').html("");
	if (module=='apainter') {
		$('legend0').append("<button id=apainter-save>Save</button>");
		$('legend0').append("<button id=apainter-next-view>View</button>");
	} 
}
//}}}
function make_legend2(module) {//{{{
	$('legend2').html("");
	if (module=='apainter') {
		$('legend2').append("<button id=button-help>Help</button>");
		$('legend2').append("<button id=button-setup>Setup</button>");
	} 
}
//}}}
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
dd = function() { //{{{
	return console.log.apply(console, arguments); 
};
//}}}
$(function() { 
	scenario_changer();
	launch_simulation();
	if(navigator.userAgent.indexOf("Chrome")==-1) { alert("Aamks is designed for Google Chrome. Aamks may work, but is not supported on other browsers"); }
});


