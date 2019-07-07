<?php
# menu/*{{{*/
$menu=" 
<ul>
<li class='lnav'><a href=?node=about>About</a>
<li class='lnav'><a target=_blank href=https://www.youtube.com/channel/UCKhHI32-1TQL6AKQ4IdDRLg>Youtube</a>
<li class='lnav'><a href=?node=tests>Tests</a>
<li class='lnav'><a href=?node=demo>Demo</a>
<li class='lnav'><a href=?node=papers>Papers</a>
<li class='lnav'><a target=_blank href=https://github.com/aamks/aamks>Github</a>

</ul>
";
/*}}}*/

$nodes['about']=array("About Aamks", /*{{{*/
"
Aamks is a web-based platform for assessing the fire safety of humans in buildings.
Aamks runs hundreds of fire simulations (CFAST) and evacuation simulations
(Aamks.Evac) and then evaluates the results. In each simulation humans
are moving across the building and are affected by fire and smoke.
");
/*}}}*/
$nodes['papers']=array("Publications related Aamks", /*{{{*/
"
<ol>
<li> Krasuski, A. & Pecio, M. Application of an Integrated Risk Assessment Software to Quantify the Life Safety Risk in Building during a Fire. MATEC Web Conf. 247, 00011, 1–8 (2018). <a href=https://www.matec-conferences.org/articles/matecconf/pdf/2018/106/matecconf_fese2018_00011.pdf>pdf</a>
<li> Krasuski, A. & Kuziora, Ł. Comparison of Risk Categorization Methods in a Multisimulation Framework. MATEC Web Conf. 247, 00018, 1–8 (2018). <a href=https://www.matec-conferences.org/articles/matecconf/pdf/2018/106/matecconf_fese2018_00018.pdf>pdf</a>
<li> Kreńnski, K. & Fliszkiewicz, M. Aamks: the platform for assessing fire safety of humans in buildings. MATEC Web Conf. (2018). doi:10.1051/matecconf/201824700001 <a href=https://www.matec-conferences.org/articles/matecconf/pdf/2018/106/matecconf_fese2018_00001.pdf>pdf</a>
<li> Kubica, P. & Wdowiak, T. The use of multisimulation in determining fire hazards in buildings covered by expertise. MATEC Web Conf. (2018). doi:10.1051/matecconf/201824700061 <a href=https://www.matec-conferences.org/articles/matecconf/pdf/2018/106/matecconf_fese2018_00061.pdf>pdf</a>
<li> Krasuski, A. Multisimulation: Stochastic simulations for the assessment of building fire safety. (The Main School of Fire Service, 2019).
<li> Krasuski, A. & Hostikka, S: Aamks – Integreated Cloud-based Application for Probabilistc Fire Risk Assessment. Proceeding of Interflam 2019 conferece
</ol>

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
<br> Comparison of Aamks and Pathfinder evacuation modeling<br><br>
<iframe width="560" height="315" src="https://www.youtube.com/embed/S3Cwwdwgomc" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>

<br><br><br><br>
<br> A <a href=http://gamma.cs.unc.edu/Menge/>Menge</a> comparison of local movement models: RVO2 vs Helbing vs Karamouzas.<br>
Aamks uses RVO2 (ORCA).<br>
Karamouzas is Predictive Collision Pedestrian Model (2009). https://doi.org/10.1007/978-3-642-10347-6_4
<br><br>

<iframe width="800" height="500" src="https://www.youtube.com/embed/7dch-dgSuqU" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe><br><br><br>
<iframe width="800" height="500" src="https://www.youtube.com/embed/rlJzKSKhhg8" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>

');
/*}}}*/
$nodes['demo']=array("Demo", /*{{{*/
'
Aamks is a work in progress, but you can see some of the development progress <a href=https://student.szach.in/aamks/>here</a>
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
