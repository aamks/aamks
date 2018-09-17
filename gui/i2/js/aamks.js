$(function()  { 
	//$('input').attr('autocomplete','off');
	$('msg').delay(800).fadeOut(2000);

	 $("body").on("click", ".div-yes",function() {
		 $(this).attr("class", "div-no");
		 $(this).find('span').text('');
		 $(this).children('input').val('0');
	 });

	 $("body").on("click", ".div-no",function() {
		 $(this).attr("class", "div-yes");
		 $(this).find('span').text('');
		 $(this).children('input').val('1');
	 });


	$("body").on("click", "fatal", function() {
		$(this).slideUp(200);
	});

	$("body").on("click", "cannot", function() {
		$(this).slideUp(200);
	});

});


