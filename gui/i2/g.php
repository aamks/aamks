<?PHP
session_start();
echo "<pre>";
print_r($_SESSION);
require_once 'vendor/autoload.php';
$client = new Google_Client();
$client->setAuthConfig('g_api.json');
$redirect_uri = 'https://stanley.szach.in/i2/g.php';
$client->setRedirectUri($redirect_uri);
$client->addScope("https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email");
#$client-revokeToken(); //logout
$loginURL=$client->createAuthUrl();

if (isset($_GET['code'])) {
	    $token = $client->fetchAccessTokenWithAuthCode($_GET['code']);
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
}
echo "<form>
	<input type=button onclick=\"window.location = '$loginURL' \">
	</form>
	";
?>
