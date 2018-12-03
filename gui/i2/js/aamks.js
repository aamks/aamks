$(function()  { 
	$('.switch').click(function() {
		var key=$(this).attr("id");
		$("#"+key+"-switch").toggleClass("no-display");
		$("#"+key+"-table").toggleClass("no-display");
		$(this).toggleClass("off");
		$("#"+key+"-table").find("input").val("");
	});
});


