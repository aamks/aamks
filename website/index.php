<?php
# menu/*{{{*/
$menu=" 
<center>
</center>
<ul>
<li class='lnav'><a href=?node=about>About</a>
<li class='lnav'><a href=?node=test1>Test 1</a>
<li class='lnav'><a href=?node=test2>Test 2</a>
</ul>
";
/*}}}*/

$nodes['about']=array("About", /*{{{*/
"
Aamks is a linux platform for assesing fire safety of humans in buildings. It
runs hundreds or thousands of fire simulations (CFAST) and evacuation
simulations (a-evac) and then evaluates the results.

");
/*}}}*/
$nodes['test1']=array("Test 1", /*{{{*/
'
This is test1<br><br>
<iframe width="560" height="315" src="https://www.youtube.com/embed/ZbQIStNx9uE" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>
');
/*}}}*/
$nodes['test2']=array("Test 2", /*{{{*/
'
This is test2<br><br>
<iframe width="560" height="315" src="https://www.youtube.com/embed/ZbQIStNx9uE" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>
');
/*}}}*/

#Engine/*{{{*/
if(!isset($_GET['node'])){
	$_GET['node']='about';
}
$title=$nodes[$_GET['node']][0];
$content=$nodes[$_GET['node']][1];

echo " 

<HTML>
<HEAD>
<TITLE>Aamks</TITLE>
<META http-equiv=Content-Type content='text/html; charset=utf-8' />
<LINK rel='stylesheet' type='text/css' href='css.css'>
</HEAD>

<menu>$menu</menu>
<page> <h1>$title</h1><br><br>$content 
</page>
<a href=/><header> Aamks</header></a>

";
/*}}}*/

?>
