<?php
session_name('aamks');
require_once("inc.php"); 

function projects_list(){/*{{{*/
	# psql aamks -c 'SELECT * from projects'

	echo "
	<form method=POST style='float:right'>
		<input type=text placeholder='new project name' name=project_name required pattern='\w{1,15}' title='max 15 of alphanumeric characters'> 
		<input type=submit name=submit value='create project'>
	</form><br><br><br>
	";
	$r=$_SESSION['nn']->query("SELECT id, project_name FROM projects WHERE user_id=$1 ORDER BY modified DESC", array($_SESSION['main']['user_id'] ));
	echo '<table>';
	echo '<tr><th>projects<th>add scenario<th>scenarios<th>delete';
	foreach($r as $projects){
		echo "<tr><td>$projects[project_name]<td>";
		echo "<form method=post><input size=12 type=text placeholder='new scenario' name=new_scenario required pattern='\w{1,15}' title='max 15 of alphanumeric characters'><input type=submit value='+'></form><td>";
		$rr=$_SESSION['nn']->query("SELECT * FROM scenarios WHERE project_id=$1 ORDER BY id", array($projects['id']));
		foreach($rr as $scenarios) { 
			if($scenarios['id']==$_SESSION['main']['scenario_id']) { 
				echo "<a class=rlink href=?ch_scenario=$scenarios[id] title='Your current project / scenario is marked in red'>$scenarios[scenario_name]</a>";
			} else {
				echo "<a class=blink href=?ch_scenario=$scenarios[id]>$scenarios[scenario_name]</a>"; 
			}
		}
		if($projects['id']!=$_SESSION['main']['project_id']) { 
			echo "<td><a class=rlink href=?delete_project=$projects[id]>x</a>";
		}

	}
	echo "</table>";
	exit();
}/*}}}*/
function delete_project() {/*{{{*/
		#psql aamks -c 'select * from projects'
		if(!isset($_GET['delete_project'])) { return; }
		if($_GET['delete_project']==$_SESSION['main']['project_id']) { 
			$_SESSION['header_err'][]="The active project cannot be removed.";
			header("Location: projects.php?projects_list");
			exit();
		}
		$r=$_SESSION['nn']->query("DELETE FROM projects WHERE id=$1 and user_id=$2 RETURNING project_name", array($_GET['delete_project'], $_SESSION['main']['user_id']));
		$project_name=$r[0]['project_name'];
		$_SESSION['header_ok'][]="Project $project_name deleted.";
		header("Location: projects.php");
		exit();

}/*}}}*/
function ch_scenario(){/*{{{*/
	#psql aamks -c 'select * from scenarios'
	if(!isset($_GET['ch_scenario'])) { return; }
	$r=$_SESSION['nn']->query("SELECT u.email,s.project_id,s.id AS scenario_id,s.scenario_name, p.project_name FROM scenarios s JOIN projects p ON s.project_id=p.id JOIN users u ON p.user_id=u.id WHERE s.id=$1 AND p.user_id=$2 LIMIT 1",array($_GET['ch_scenario'], $_SESSION['main']['user_id']));
	if(empty($r[0])) { die("scenario_id=$_GET[ch_scenario]?"); }
	ch_main_vars($r[0]);
}/*}}}*/
function menu() { /*{{{*/
	echo "<div>
		<div style='position:fixed; top: 5px; left: 5px'>
		<img width=160 src=logo.svg><br><br><br>
		<orange>".$_SESSION['main']['scenario_name']."</orange><br>
		<a href=?projects_list class=blink>projects</a><br>
		<a href=apainter class=blink>apainter</a><br>
		<a href=form.php?form1 class=blink>form1</a><br>
		<a href=workers/vis/master.html class=blink>visualization</a><br>
		</div>
		<div style='position:fixed; top: 50px; left: 200px'>";
}
/*}}}*/
function ch_main_vars($r) { #{{{
	$_SESSION['main']['project_id']=$r['project_id'];
	$_SESSION['main']['project_name']=$r['project_name'];
	$_SESSION['main']['scenario_id']=$r['scenario_id'];
	$_SESSION['main']['scenario_name']=$r['scenario_name'];
	$_SESSION['main']['user_home']="/home/aamks_users/$r[email]";
	$_SESSION['main']['working_home']="/home/aamks_users/$r[email]/$r[project_name]/$r[scenario_name]";
	header("Location: projects.php?projects_list");
}
/*}}}*/
function init_main_vars() { #{{{
	#psql aamks -c 'select * from users'
	#psql aamks -c 'select * from projects'
	if(isset($_SESSION['main']['project_id'])) { return; }
	$r=$_SESSION['nn']->query("SELECT u.email, p.project_name, p.id AS project_id, s.scenario_name, s.id AS scenario_id  FROM users u LEFT JOIN projects p ON(u.active_project=p.id) LEFT JOIN scenarios s ON(p.id=s.project_id) WHERE u.id=$1 AND u.active_project=p.id AND u.active_scenario=s.id",array($_SESSION['main']['user_id']));
	ch_main_vars($r[0]);
}
/*}}}*/
function main() { #{{{
	$_SESSION['nn']->htmlHead("Projects");
	init_main_vars();
	ch_scenario();
	menu();
	delete_project();
	if(isset($_GET['projects_list'])) { projects_list(); }
}
/*}}}*/

#psql aamks -c 'select  *  from users'
#psql aamks -c 'update users set active_scenario=2 where id=25'
main();
dd($_SESSION['main']);

?>
