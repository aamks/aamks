<?php
// ini_set('display_errors', 1);
// ini_set('display_startup_errors', 1);
// error_reporting(E_ALL);

session_name('aamks');
require_once("inc.php"); 
$_SESSION['nn']->htmlHead("Admin panel");
$_SESSION['nn']->menu();

function form(){

    $ACCESS_ID = 1;

    if($_SESSION['main']['user_id'] != $ACCESS_ID){ return; }
    echo '
    <form method="post">

    <label for="user_id">User ID:</label><br>
    <input type="number" id="user_id" name="user_id" required><br><br>

    <label for="valid_to">Valid To:</label><br>
    <input type="datetime-local" id="valid_to" name="valid_to" required><br><br>

    <input type="submit" value="Submit" name=save_form>
    </form>
    ';
}
function saveForm(){
    if(empty($_POST['save_form'])) { return; }
	$r=$_SESSION['nn']->query("SELECT * FROM access WHERE user_id = $1;", array($_POST['user_id']));
    if(empty($r)){
        $_SESSION['nn']->query("INSERT INTO access (user_id, valid_to) values ($1,$2);", array($_POST['user_id'], $_POST['valid_to']));
    } else {
        $_SESSION['nn']->query("UPDATE access SET valid_to = $1 WHERE user_id=$2;", array($_POST['valid_to'], $_POST['user_id']));
    }
}
function showTable(){
	$r=$_SESSION['nn']->query("SELECT u.id, a.valid_to, u.email, u.user_name FROM access a RIGHT JOIN users u ON a.user_id = u.id;");
    echo '<table cellpadding="15">';
    echo '<tr><th>User ID</th><th>Email</th><th>User Name</th><th>Valid to</th></tr>';
    foreach ($r as $row) {
        echo '<tr>';
        echo '<td>' . $row['id'] . '</td>';
        echo '<td>' . $row['email'] . '</td>';
        echo '<td>' . $row['user_name'] . '</td>';
        echo '<td>' . $row['valid_to'] . '</td>';
        echo '</tr>';
    }
    echo '</table>';
}
function main(){
    form();
    saveForm();
    showTable();
}

main();
?>