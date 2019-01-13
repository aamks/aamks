<?php
session_name('aamks');
require_once("inc.php"); 

function projects_list(){/*{{{*/
	# psql aamks -c 'SELECT * from projects'

	$r=$_SESSION['nn']->query("SELECT id, project_name FROM projects WHERE user_id=$1 ORDER BY modified DESC", array($_SESSION['main']['user_id'] ));
	echo '<table>';
	echo '<tr><th>projects<th>add scenario<th>scenarios<th>delete';
	foreach($r as $projects){
		echo "<tr><td>$projects[project_name]<td>";
		echo "<form method=post><input size=12 type=text placeholder='new scenario' name=new_scenario required pattern='\w{1,15}' title='max 15 of alphanumeric characters'><input type=submit value='+'></form><td>";
		$rr=$_SESSION['nn']->query("SELECT * FROM scenarios WHERE project_id=$1 ORDER BY id", array($projects['id']));
		foreach($rr as $scenarios) { 
			if($scenarios['id']==$_SESSION['main']['scenario_id']) { 
				echo "<a class=bblink href=?ch_scenario=$scenarios[id] title='Your current project / scenario is marked in red'>$scenarios[scenario_name]</a>";
			} else {
				echo "<a class=blink href=?ch_scenario=$scenarios[id]>$scenarios[scenario_name]</a>"; 
			}
		}
		if($projects['id']!=$_SESSION['main']['project_id']) { 
			echo "<td><a class=rlink href=?delete_project=$projects[id]>x</a>";
		}

	}
	echo "</table>";

	echo "<br><br><br>
	<form method=POST style='float:right'>
		<input type=text placeholder='new project name' name=project_name required pattern='\w{1,15}' title='max 15 of alphanumeric characters'> 
		<input type=submit name=submit value='create project'>
	</form>
	";
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
	#psql aamks -c 'select * from users'
	if(!isset($_GET['ch_scenario'])) { return; }
	$r=$_SESSION['nn']->query("SELECT u.email,s.project_id,s.id AS scenario_id,s.scenario_name, u.active_editor, u.user_photo, u.user_name, p.project_name FROM scenarios s JOIN projects p ON s.project_id=p.id JOIN users u ON p.user_id=u.id WHERE s.id=$1 AND p.user_id=$2 LIMIT 1",array($_GET['ch_scenario'], $_SESSION['main']['user_id']));
	if(empty($r[0])) { die("scenario_id=$_GET[ch_scenario]?"); }
	ch_main_vars($r[0]);
}/*}}}*/
function ch_main_vars($r) { #{{{
	$_SESSION['main']['project_id']=$r['project_id'];
	$_SESSION['main']['user_name']=$r['user_name'];
	$_SESSION['main']['user_photo']=$r['user_photo'];
	$_SESSION['main']['active_editor']=$r['active_editor'];
	$_SESSION['main']['project_name']=$r['project_name'];
	$_SESSION['main']['scenario_id']=$r['scenario_id'];
	$_SESSION['main']['scenario_name']=$r['scenario_name'];
	$_SESSION['main']['user_home']="/home/aamks_users/$r[email]";
	$_SESSION['main']['working_home']="/home/aamks_users/$r[email]/$r[project_name]/$r[scenario_name]";
	$_SESSION['nn']->query("UPDATE users SET active_scenario=$1 WHERE id=$2", array($r['scenario_id'], $_SESSION['main']['user_id']));
	$_SESSION['nn']->query("UPDATE users SET active_editor=$1 WHERE id=$2", array($r['active_editor'], $_SESSION['main']['user_id']));
	header("Location: form.php?edit");
}
/*}}}*/
function init_main_vars() { #{{{
	#psql aamks -c 'select * from users'
	#psql aamks -c 'select * from projects'
	if(isset($_SESSION['main']['project_id'])) { return; }
	$_SESSION['main']['user_id']=25;
	$r=$_SESSION['nn']->query("SELECT u.email, p.project_name, u.active_editor, u.user_photo, u.user_name, p.id AS project_id, s.scenario_name, s.id AS scenario_id  FROM users u LEFT JOIN scenarios s ON (u.active_scenario=s.id) LEFT JOIN projects p ON(p.id=s.project_id) WHERE u.id=$1 AND u.active_scenario=s.id",array($_SESSION['main']['user_id']));
	ch_main_vars($r[0]);
}
/*}}}*/
function main() { #{{{
	$_SESSION['nn']->htmlHead("Projects");
	init_main_vars();
	ch_scenario();
	$_SESSION['nn']->menu('manage projects');
	delete_project();
	if(isset($_GET['projects_list'])) { projects_list(); }
}
/*}}}*/

#psql aamks -c 'select  *  from users'
#psql aamks -c 'update users set active_scenario=2 where id=25'
main();
#dd($_SESSION['main']);

?>
