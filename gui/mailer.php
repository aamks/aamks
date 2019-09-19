<?php
# composer require phpmailer/phpmailer
require_once 'vendor/phpmailer/phpmailer/src/Exception.php';
require_once 'vendor/phpmailer/phpmailer/src/PHPMailer.php';
require_once 'vendor/phpmailer/phpmailer/src/SMTP.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

function gmail($to, $subject, $msg) { #{{{
	$mail = new PHPMailer;
	$mail->CharSet = 'UTF-8';
	$mail->Encoding = 'base64';
	$mail->isSMTP();
	#$mail->SMTPDebug = 2;
	$mail->Host = 'smtp.gmail.com';
	$mail->Port = 587;
	$mail->SMTPSecure = 'tls';
	$mail->SMTPAuth = true;
	$mail->Username = getenv("AAMKS_GMAIL_USERNAME");				// in aamks/installer/install.sh
	$mail->Password = getenv("AAMKS_GMAIL_PASSWORD");
	$mail->setFrom('aamksproject@gmail.com', 'Aamks Project');		// change for your username
	$mail->addReplyTo('aamksproject@gmail.com', 'Aamks Project');	// change for your username
	$mail->addAddress($to);
	$mail->Subject = $subject;
	$mail->isHTML(true);                                  
    $mail->Body    = "$msg";
    $mail->AltBody = "$msg";

	if (!$mail->send()) {
		echo "Some Error!:" . $mail->ErrorInfo;
	} else {
		echo "Mail Sent";
	}
}
/*}}}*/
gmail("stanislaw.lazowy@gmail.com", "Aamks Registration", "Aamks message body");
?>
