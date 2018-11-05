<?PHP
session_start();
echo"<pre>";
print_r($_REQUEST);
echo "</pre>";

echo"
<html lang='en'>
    <meta name='google-signin-scope' content='profile email'>
	<meta name='google-signin-client_id' content='352726998172-lmrbrs6c2sgpug4nc861hfb04f3s0sr6.apps.googleusercontent.com'>
    <script src='https://apis.google.com/js/platform.js' async defer></script>
  <body>
    <div class='g-signin2' data-onsuccess='onSignIn' data-theme='dark'  data-longtitle='true' ></div>
	<div id='hidden_form_container' style='display:none;'></div>
	";
if (!isset($_POST['id'])){
echo "
    <script>
      function onSignIn(googleUser) {
        // Useful data for your client-side scripts:
        var profile = googleUser.getBasicProfile();

        // The ID token you need to pass to your backend:
        var id_token = googleUser.getAuthResponse().id_token;

		//Send data to PHP
		var theForm, newInput1, newInput2, newInput3, newInput4, newInput5;
		  // Start by creating a <form>
		  theForm = document.createElement('form');
		  theForm.action = 'g.php?s=1';
		  theForm.method = 'post';
		  // Next create the <input>s in the form and give them names and values
			
		  newInput1 = document.createElement('input');
		  newInput1.type = 'hidden';
		  newInput1.name = 'id';
		  newInput1.value = profile.getId();

		  newInput2 = document.createElement('input');
		  newInput2.type = 'hidden';
		  newInput2.name = 'fullname';
		  newInput2.value = profile.getName();

		  newInput3 = document.createElement('input');
		  newInput3.type = 'hidden';
		  newInput3.name = 'img_url';
		  newInput3.value = profile.getImageUrl();

		  newInput4 = document.createElement('input');
		  newInput4.type = 'hidden';
		  newInput4.name = 'email';
		  newInput4.value = profile.getEmail();

		  newInput5 = document.createElement('input');
		  newInput5.type = 'hidden';
		  newInput5.name = 'token_id';
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
    </script>";
}
?>

  </body>
</html>
