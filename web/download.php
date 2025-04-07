<?php
session_name('aamks');
require_once("inc.php"); 
if (isset($_POST['file_path'])) {
    $file_path = $_POST['file_path'];
    if (file_exists($file_path)) {
        ob_start();
        $file_name = basename($file_path);
        $file_mime_type = mime_content_type($file_path);
        // $file_size = readfile($file_path);
        $content = file_get_contents($file_path);
        header('Content-Description: File Transfer');
        switch ($file_mime_type) {
            case 'text/plain':
                header('Content-Type: text/plain');
                break;
            default:
                header('Content-Type: application/octet-stream');
        }        
        header('Content-Disposition: attachment; filename="' . $file_name . '"');
        header('Expires: 0');
        header('Cache-Control: must-revalidate');
        header('Pragma: public');
        header('Content-Length: ' . strlen($content));
        ob_clean();
        flush();
        echo $content;
        exit;
    } else {
        // If the file doesn't exist
        $_SESSION['nn']->htmlHead("Aamks setup");
        $_SESSION['nn']->menu('Aamks setup');
        $_SESSION['nn']->cannot("The file does not exist!");
    }
} else {
    // If no file path is sent
    $_SESSION['nn']->htmlHead("Aamks setup");
    $_SESSION['nn']->menu('Aamks setup');
    $_SESSION['nn']->cannot("No file specified!"); 
}
?>