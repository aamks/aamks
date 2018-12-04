$(function()  { 
	$('.switch').click(function() {
		var key=$(this).attr("id");
		$("#"+key+"-switch").toggleClass("no-display");
		$("#"+key+"-table").toggleClass("no-display");
		$(this).toggleClass("off");
		$("#"+key+"-table").find("input").val("");
	});

	$('msg').delay(800).fadeOut(2000);

	$("body").on("click", "fatal", function() {
		$(this).slideUp(200);
	});

	$("body").on("click", "cannot", function() {
		$(this).slideUp(200);
	});

	$("body").on("click", "msg_confirm", function() {
		$(this).slideUp(200);
	});

});


