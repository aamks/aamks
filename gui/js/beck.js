$(function()  { 
	$.post('/aamks/ajax.php?ajaxBeckShowImages', function (response) { 
		console.log(response);
		ajax_msg(response);
		$("#beck_images").append(response['data']);
	});
});
