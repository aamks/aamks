<?php
# for now we skip login.php
session_name('aamks');
require_once("inc.php"); 

if(empty($_SESSION['nn'])) { $_SESSION['nn']=new Aamks("Aamks") ; } 
#psql aamks -c 'select * from users'
$r=$_SESSION['nn']->query("SELECT u.id AS user_id, u.email, p.project_name, u.preferences, u.user_photo, u.user_name, p.id AS project_id, s.scenario_name, s.id AS scenario_id  FROM users u LEFT JOIN scenarios s ON (u.active_scenario=s.id) LEFT JOIN projects p ON(p.id=s.project_id) WHERE u.id=$1 AND u.active_scenario=s.id",array(1));
$_SESSION['nn']->ch_main_vars($r[0]);
$_SESSION['main']['scenario_name']=$_GET['s'];
$_SESSION['main']['project_name']=$_GET['p'];
$_SESSION['main']['working_home']="/home/aamks_users/mimoohowy@gmail.com/demo/$_GET[s]";

if(isset($_GET['apainter'])) { 
	header("Location: /aamks/apainter/index.php"); 
} else {
	header("Location: /aamks/animator/index.php"); 
}

?>
