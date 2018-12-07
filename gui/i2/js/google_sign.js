function onSignIn(googleUser) {
	// Useful data for your client-side scripts:
	var profile = googleUser.getBasicProfile();

	// The ID token you need to pass to your backend:
	var id_token = googleUser.getAuthResponse().id_token;
	var arr = { g_user_id: profile.getId(), g_name: profile.getName(), g_email: profile.getEmail(), g_picture: profile.getImageUrl() };
	$.post('https://stanley.szach.in/i2/i3.php', { 'jsarr': arr });

	for (var key in arr) {
		  console.log('key ' + key + ' has value ' + arr[key]);
	}
	//Send data to PHP
	var theForm, newInput1, newInput2, newInput3, newInput4, newInput5;
	  // Start by creating a <form>
	  theForm = document.createElement('form');
	  theForm.action = 'i2.php?ex=1';
	  theForm.method = 'post';
	  // Next create the <input>s in the form and give them names and values
		
	  newInput1 = document.createElement('input');
	  newInput1.type = 'hidden';
	  newInput1.name = 'g_user_id';
	  newInput1.value = profile.getId();

	  newInput2 = document.createElement('input');
	  newInput2.type = 'hidden';
	  newInput2.name = 'g_name';
	  newInput2.value = profile.getName();

	  newInput3 = document.createElement('input');
	  newInput3.type = 'hidden';
	  newInput3.name = 'g_picture';
	  newInput3.value = profile.getImageUrl();

	  newInput4 = document.createElement('input');
	  newInput4.type = 'hidden';
	  newInput4.name = 'g_email';
	  newInput4.value = profile.getEmail();


	  newInput5 = document.createElement('input');
	  newInput5.type = 'hidden';
	  newInput5.name = 'g_token_id';
	  newInput5.value = id_token;

	  // Now put everything together...
	  theForm.appendChild(newInput1);
	  theForm.appendChild(newInput2);
	  theForm.appendChild(newInput3);
	  theForm.appendChild(newInput4);
	  theForm.appendChild(newInput5);

	  // ...and it to the DOM...
	  document.getElementById('hidden_form_container').appendChild(theForm);
	  // ...and submit it
	  theForm.submit();	
};

