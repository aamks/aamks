<?PHP
session_start();

echo"
<html lang='en'>
  <body>";
  if(!isset($_SESSION['user_id'])){
  echo "
    <meta name='google-signin-scope' content='profile email'>
	<meta name='google-signin-client_id' content='352726998172-lmrbrs6c2sgpug4nc861hfb04f3s0sr6.apps.googleusercontent.com'>
    <script src='https://apis.google.com/js/platform.js' async defer></script>
   <div class='g-signin2' data-onsuccess='onSignIn' data-theme='dark'  data-longtitle='true' ></div> ";
 echo " <div id='hidden_form_container' style='display:none;'></div> ";
  }

if (!isset($_POST['g_id'])){
	from_JS_to_POST();
}else{
	$_SESSION['name']=$_POST['g_name'];
	$_SESSION['user_id']=$_POST['g_name'];
}
if(isset($_GET['logout'])){
	session_destroy();
}

	function from_JS_to_POST(){/*{{{*/
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
		  newInput1.name = 'g_id';
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
    </script>";
}/*}}}*/
echo " 
<a href='?logout#' onclick='signOut();'>Sign out</a>
<script>
  function signOut() {
	      var auth2 = gapi.auth2.getAuthInstance();
		      auth2.signOut().then(function () {
				        console.log('User signed out.');
						    });
			    }
				</script>
";
echo"<pre>";
print_r($_POST);
print_r($_SESSION);
echo "</pre>";
?>

  </body>
</html>
