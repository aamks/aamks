$(function()  { 
	$.post('/aamks/ajax.php?ajaxBeckShowImages', function (response) { 
		console.log(response);
		amsg(response);
		$("#beck_images").append(response['data']);
	});
});
