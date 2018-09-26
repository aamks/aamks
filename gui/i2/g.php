<?PHP
session_start();
require_once 'vendor/autoload.php';
$client = new Google_Client();
$client->setAuthConfig('g_api.json');
$redirect_uri = 'https://stanley.szach.in/i2/g.php';
$client->setRedirectUri($redirect_uri);
$client->addScope("https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email");
$loginURL=$client->createAuthUrl();

if (isset($_GET['code'])) {
	    $token = $client->fetchAccessTokenWithAuthCode($_GET['code']);
}
echo "<form>
	<input type=button onclick=\"window.location = '$loginURL' \">
	</form>
	";
?>
