<?php
# menu/*{{{*/
$menu=" 
<ul>
<li class='lnav'><a href=?node=about>About</a>
<li class='lnav'><a href=?node=tests>Tests</a>
<li class='lnav'><a href=?node=demos>Demos</a>
<li class='lnav'><a href=?node=papers>Papers</a>
<li class='lnav'><a target=_blank href=https://github.com/aamks/aamks>Github</a>

</ul>
";
/*}}}*/

$nodes['about']=array("About Aamks", /*{{{*/
"
Aamks is an open-source linux platform for assesing fire safety of humans in
buildings. It runs hundreds or thousands of fire simulations (CFAST) and
evacuation simulations (a-evac) and then evaluates the results.



");
/*}}}*/
$nodes['tests']=array("Tests", /*{{{*/
'
<br> Verif 1_1 <br><br>
<iframe width="560" height="315" src="https://www.youtube.com/embed/8OOwM3hcTZw" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>
<br> Verif_2_1<br><br>
<iframe width="560" height="315" src="https://www.youtube.com/embed/nK5QWX4otP8" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>
<br> Verif_2_3<br><br>
<iframe width="560" height="315" src="https://www.youtube.com/embed/7OKO1P6Ju1A" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>
<br> Verif_2_4<br><br>
<iframe width="560" height="315" src="https://www.youtube.com/embed/c714B5FAZjo" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>
<br> Verif_2_5<br><br>
<iframe width="560" height="315" src="https://www.youtube.com/embed/ysjOF7TZg68" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>
<br> Verif_2_6<br><br>
<iframe width="560" height="315" src="https://www.youtube.com/embed/R7rar76V5rE" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>
<br> Verif_2_8<br><br>
<iframe width="560" height="315" src="https://www.youtube.com/embed/3NNIFSQXasQ?list=PLcR1x6fD9inVo59Gt3gHmy8QLRBonH-H1" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>
<br> Verif_3_1<br><br>
<iframe width="560" height="315" src="https://www.youtube.com/embed/6m-3JYUX3oY?list=PLcR1x6fD9inVo59Gt3gHmy8QLRBonH-H1" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>
<br> Real building evacuation test<br><br>
<iframe width="560" height="315" src="https://www.youtube.com/embed/X6JcT1bwU9Q?list=PLcR1x6fD9inVo59Gt3gHmy8QLRBonH-H1" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>

');
/*}}}*/
$nodes['demos']=array("Demos", /*{{{*/
'
Aamks is a work in progress, but you can see some of development progress here
<ul>
<li> An example of Aamks aplication hosted in SGSP <a target=blank_ href="https://aamks.inf.sgsp.edu.pl">demo</a>
<li> Geometry creation <a target=blank_ href=/blob/aamks/geom/apainter/>tool</a> (requires google chrome / chromium)
</ul>
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
