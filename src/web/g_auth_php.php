<?php
 //composer require google/apiclient:"^2.0"
session_name('test');
session_start();
echo "Sesja <br><pre>";
print_r($_SESSION);
echo"<br>";

function g_prep(){/*{{{*/
	global $client;

	require_once 'vendor/autoload.php';
	// init configuration
	#$clientID = '352726998172-lmrbrs6c2sgpug4nc861hfb04f3s0sr6.apps.googleusercontent.com';//test project
	$clientID = '97664158323-duk176qdm6aoqncbcinh7h84c0joj7pk.apps.googleusercontent.com';
	#$clientSecret = 'qyppBy9K6Jn3qHInpYdLuDz-'; //test project
	$clientSecret = '2tf7_pjm3ZBUt9-sUdKYeNiD';
	$redirectUri = 'https://student.szach.in/aamks/g_auth_php.php';
	// create Client Request to access Google API
	$client = new Google_Client();
	$client->setClientId($clientID);
	$client->setClientSecret($clientSecret);
	$client->setRedirectUri($redirectUri);
	$client->addScope("email");
	$client->addScope("profile");
	return $client;
}/*}}}*/
function g_login($client){/*{{{*/
	global $client;
  $token = $client->fetchAccessTokenWithAuthCode($_GET['code']);
  $client->setAccessToken($token['access_token']);
  // get profile info
  $google_oauth = new Google_Service_Oauth2($client);
  $google_account_info = $google_oauth->userinfo->get();
  $g['email'] =  $google_account_info->email;
  $g['name'] =  $google_account_info->name;
  $g['id'] =  $google_account_info->id;
  $g['photo'] =  $google_account_info->picture;
  $g['uri']=$_SERVER['REQUEST_URI'];
  $_SESSION['i']=$google_account_info;
  $_SESSION['g']=$g;
  header("Location: ?done=1");
}/*}}}*/
g_prep();//prepare for google login
if (isset($_GET['code'])) {
  g_login($client);// now you can use this profile info to create account in your website and make user logged in.
} else {
  echo "<a href='".$client->createAuthUrl()."'>Google Login</a>";
}
?>
