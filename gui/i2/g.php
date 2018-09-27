<?PHP
session_start();
#session_destroy();
echo "<pre>";
require_once 'vendor/autoload.php';
$client = new Google_Client();
$client->setAuthConfig('g_api.json');
$redirect_uri = 'https://stanley.szach.in/i2/g.php';
$client->setRedirectUri($redirect_uri);
$client->addScope("https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email");
#$client-revokeToken(); //logout
$loginURL=$client->createAuthUrl();

if (isset($_GET['code']) and (isset($_GET['scope']))) {
	$token = $client->fetchAccessTokenWithAuthCode($_GET['code']);
	print_r($token);
	if(isset($token['error'])){
		echo "There is something wrong";
		login_form();
		exit();
	}
	if(isset($token['id_token'])){ //got the token
		get_data_from_google();
	}
}
function get_data_from_google(){/*{{{*/
		global $client;
		$oAuth = new Google_Service_Oauth2($client);
		$userData = $oAuth->userinfo_v2_me->get();
		$_SESSION['userName']=$userData['name'];
		$_SESSION['userFamilyName']=$userData['familyName'];
		$_SESSION['userGivenName']=$userData['givenName'];
		$_SESSION['userEmail']=$userData['email'];
		$_SESSION['userID']=$userData['id'];
		$_SESSION['userLink']=$userData['link'];
		$_SESSION['userPicture']=$userData['picture'];
		$_SESSION['userVerifiedEmail']=$userData['verifiedEmail'];
		$_SESSION['access_token']=$token;
		header("location:g.php");
}/*}}}*/
function login_form(){/*{{{*/
	global $loginURL;
	echo "<form>\	
		<input type=button onclick=\"window.location = '$loginURL' \" value='Login with Google'>
		</form>
		";
}/*}}}*/
if(!isset($_SESSION['userID'])){login_form();}
print_r($_SESSION);
?>
