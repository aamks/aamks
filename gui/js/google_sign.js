function onSignIn(googleUser) {
	// Useful data for your client-side scripts:
	var profile = googleUser.getBasicProfile();

	// The ID token you need to pass to your backend:
	var id_token = googleUser.getAuthResponse().id_token;
	var arr = { g_user_id: profile.getId(), g_name: profile.getName(), g_email: profile.getEmail(), g_picture: profile.getImageUrl() };
	$.post('/aamks/ajax.php?googleLogin', { 'google_data': arr }, function(response) { 
		var refresh=response.data.dnr;
		console.log('Refresh?='+refresh);
		if (refresh==1){
			//location.reload(); //force php to reload and read SESSION variables
		}
			location.reload(); //force php to reload and read SESSION variables
	});

};

function signOut() {
	var auth2 = gapi.auth2.getAuthInstance();
	auth2.signOut().then(function () {
		console.log('User signed out.');
//		window.location.replace('https://stanley.szach.in/aamks/')
	});
}
