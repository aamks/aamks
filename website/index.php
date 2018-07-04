<?php
# menu/*{{{*/
$menu=" 
<ul>
<li class='lnav'><a href=?node=about>About</a>
<li class='lnav'><a href=?node=tests>Tests</a>
<li class='lnav'><a target=_blank href=https://github.com/aamks/aamks>Github</a>

</ul>
";
/*}}}*/

$nodes['about']=array("About Aamks", /*{{{*/
"
Aamks is a linux platform for assesing fire safety of humans in buildings. It
runs hundreds or thousands of fire simulations (CFAST) and evacuation
simulations (a-evac) and then evaluates the results.

");
/*}}}*/
$nodes['tests']=array("Tests", /*{{{*/
'
<br> Test1<br><br>
<iframe width="560" height="315" src="https://www.youtube.com/embed/ZbQIStNx9uE" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>
<br> Test2<br><br>
<iframe width="560" height="315" src="https://www.youtube.com/embed/ZbQIStNx9uE" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>
<br> Test3<br><br>
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
<page> <h1>$title<br><br></h1>$content</page>
<a href=/aamks_website>
<header><img src=logo.svg>  </header></a>


";
/*}}}*/

?>
