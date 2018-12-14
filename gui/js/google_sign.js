function onSignIn(googleUser) {
	// Useful data for your client-side scripts:
	var profile = googleUser.getBasicProfile();

	// The ID token you need to pass to your backend:
	var id_token = googleUser.getAuthResponse().id_token;
	var arr = { g_user_id: profile.getId(), g_name: profile.getName(), g_email: profile.getEmail(), g_picture: profile.getImageUrl() };
	$.post('/aamks/ajax.php?googleLogin', { 'google_data': arr }, function(response) { 
		console.log(response.data.dnr);
		
	});

	var logged=$("#mimooh").attr("data-mimooh");
	if(logged==null){ //div after logged in not displayed => not logged - need to refresh page to read session varibles. If logged then do not reload
		console.log('UNCL - '+logged);
		location.reload(); //force php to reload and read SESSION variables
	}else{
		console.log('logged');
	}
};

function signOut() {
	var auth2 = gapi.auth2.getAuthInstance();
	auth2.signOut().then(function () {
		console.log('User signed out.');
	});
}
