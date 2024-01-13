var aamksUserPrefs;
function myConfirm(message){
	let element = document.createElement("div");
	element.classList.add("box-background");
	element.innerHTML = `<div class="box">
						${message}
	<div>
		<button id="falseButton" class="btn red">No</button>
		<button id="trueButton" class="btn green">Yes</button>
	</div>
</div>`;
	document.body.appendChild(element);
	return new Promise(function (resolve, reject) {
		document.getElementById("trueButton").addEventListener("click", function () {
			resolve(true);
			document.body.removeChild(element);
	});
	document.getElementById("falseButton").addEventListener("click", function () {
		resolve(false);
		document.body.removeChild(element);
	});
})
}
function delProject(id) {
	myConfirm("Are you sure to delete this project?").then(response=>{
		if (response) {
			window.location.href = '?delete_project='+id;
		};
	})
};
function delScenario() {
	myConfirm("Are you sure to delete scenario?").then(response=>{
		if (response) {
			$.post('form.php', 'delete_scenario');
			setTimeout(() => {  window.location.href = 'projects.php?projects_list';  }, 500);
		}}
)};

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
		$("body").on("click", "close-right-menu-box", function() {
			$('right-menu-box').fadeOut();
		});

		$("body").on("click", "close-left-menu-box", function() {
			$('left-menu-box').css({"background-color": "transparent"}).animate({'width': $('left-menu-box').css("width"), "border-width": 0, 'height': 12, 'top':0, 'left':0 }).html("<input type=submit id='menu-dropdown' value=Menu>");
		});
	});
	ajaxUserPreferences();
});
//}}}

function make_legend0(module) {//{{{
	$('legend0').html("");
	if (module=='apainter') {
		$('legend0').append("<button id=apainter-save>Save</button>");
		$('legend0').append("<button id=apainter-next-view>Views</button>");
	} 
}
//}}}
function make_legend2(module) {//{{{
	$('legend2').html("");
	if (module=='apainter') {
		$('legend2').append("<button id=btn-underlay-form title='Underlay setup'>U</button>");
		$('legend2').append("<button id=button-help>Help</button>");
		$('legend2').append("<button id=button-setup>Setup</button>");
	} 
	if (module=='animator') {
		$('legend2').append("<animator-floor-links style='padding-right: 10px'></animator-floor-links> ");
		$('legend2').append("<button id=button-info>View sim information</button>");
		$('legend2').append("<button id=button-setup>Setup</button>");
	}

}
//}}}
function amsg(r) {//{{{
	if(r['err']==1) { 
		$('#amsg').clearQueue();
		$('#amsg').css('display', 'none');
		$('#amsg').html("Aamks is halting on error:<br>"+r['msg']);
		$('#amsg').css('display', 'block');
		$('#amsg').css('background-color', "#800");
		throw new Error("Aamks is halting on error");
	} 
	else if(r['err']==0 && r['msg'].length>0) { 
		$('#amsg').css('display', 'none');
		$('#amsg').html(r['msg']);
		$('#amsg').css('display', 'block');
		$('#amsg').css('background-color', "#285");
		if ("duration" in r) {
			var duration=r['duration'];
		} else {
			var duration=1500;
		}
		$('#amsg').delay(duration).fadeOut(400);
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
function ajaxUserPreferences() {//{{{
	$.post('/aamks/ajax.php?ajaxUserPreferences', function (json) { 
		aamksUserPrefs=json.data;
	});
}

function check_progress(){
	$("#check-sim").click(function(){
		amsg({"msg": "Checking progress", "err":0, "duration": 2000 }); 
		$("#progress").css("color","white");
		
		$.post('/aamks/ajax.php?ajaxCheckProgress',{}, function (json){
			let newContent = "<tr><td id='left_column'>Done:</td><td>" +json.good+ "</td></tr><br>"+"<tr><td id='left_column'>All:</td><td>"+ json.all + "</td></tr>";
			$("#active-sims").html(newContent+json.active);
			$("#active-sims").css({
				"color": "white",
				"height": "150px",
				"transition-duration": "1s",
				"background-color": "#616"
			});
			setTimeout(()=> {
				$("#active-sims").css("background-color", "");
			}, 2000)

			
		})
	})
}	

//}}}
function launch_simulation() {//{{{
	$("body").on("click", "#launch_simulation", function() {
		myConfirm("Are you sure to launch simulations?").then(result=>{
			if (result == true) {
				amsg({"msg": "Trying to launch...", "err":0, "duration": 20000 }); 
				$.post('/aamks/ajax.php?ajaxLaunchSimulation', { }, function (json) { 
					amsg(json); 
					if(json.err==0) {
						setTimeout(function(){
							location.assign("/aamks/halt.php");
						}, 1500);
					}
				});
			} 
		});
	});
}
function launch_draft() {//{{{
	$("body").on("click", "#launch_draft", function() {
		amsg({"msg": "Trying to launch draft...", "err":0, "duration": 20000 }); 
		$.post('/aamks/projects.php', {'copy_scenario':'draft' });
		$.post('/aamks/ajax.php?ajaxLaunchSimulation', { }, function () { 
			setTimeout(function(){
				location.assign("/aamks/animator/index.php");
			}, 1500);
		});
	});
}
//}}}
function isEmpty(obj) {//{{{
	// Check if dict empty
	return Object.keys(obj).length === 0;
}
//}}}
dd = function() { //{{{
	return console.log.apply(console, arguments); 
};
//}}}
deepcopy=function(x) {//{{{
	// https://medium.com/@gamshan001/javascript-deep-copy-for-array-and-object-97e3d4bc401a:
	// Finally I find JSON.parse and JSON.stringify is the best and simple way
	// to Deep copy. The JSON.stringify() method converts a JavaScript value to
	// a JSON string.The JSON.parse() method parses a JSON string, constructing
	// the JavaScript value or object described by the string.
	
	return JSON.parse(JSON.stringify(x));
}
//}}}

$(function() { 
	check_progress();
	scenario_changer();
	launch_draft();
	launch_simulation();
	if(navigator.userAgent.indexOf("Chrome")==-1) { alert("Aamks is designed for Google Chrome. Aamks may work, but is not supported on other browsers"); }
});


