<?php
session_name('aamks');
require_once("inc.php"); 

function projects_list(){/*{{{*/
	# psql aamks -c 'SELECT * from projects'

	$r=$_SESSION['nn']->query("SELECT id, project_name FROM projects WHERE user_id=$1 ORDER BY modified DESC", array($_SESSION['main']['user_id'] ));
	echo '<table>';
	echo '<tr><th>projects<th>date<th>add scenario<th>scenarios<th>delete';
	foreach($r as $projects){
		$rr=$_SESSION['nn']->query("SELECT *, modified::date AS date FROM scenarios WHERE project_id=$1 ORDER BY id", array($projects['id']));
		if(empty($rr[0]['date'])) { $date=''; } else { $date=$rr[0]['date']; }
		echo "<tr><td>$projects[project_name]<td style='opacity:0.2'>$date<td>";
		echo "<form method=post><input autocomplete=off type=hidden name=project_name value='$projects[project_name]'><input autocomplete=off type=hidden name=project_id value='$projects[id]'><input autocomplete=off size=12 type=text placeholder='new scenario' name=new_scenario required pattern='\w{1,15}' title='max 15 of alphanumeric characters'><input autocomplete=off type=submit class=sblink value='add'></form><td>";
		foreach($rr as $scenarios) { 
			if(isset($_SESSION['main']['scenario_id']) && $scenarios['id']==$_SESSION['main']['scenario_id']) { 
				echo "<a class=bblink href=?ch_scenario=$scenarios[id]>$scenarios[scenario_name]</a>";
			} else {
				echo "<a class=blink href=?ch_scenario=$scenarios[id]>$scenarios[scenario_name]</a>"; 
			}
		}
		if($projects['project_name']!='demo') { 
			echo "<td><a class=srlink href=?delete_project=$projects[id]>delete</a>";
		}

	}
	echo "</table>";

	echo "<br><br><br>
	<form method=POST>
		<input autocomplete=off type=text placeholder='new project name' name=new_project required pattern='\w{1,15}' title='max 15 of alphanumeric characters'> 
		<input autocomplete=off type=submit name=submit class=sblink value='add'>
	</form>
	";
	exit();
}/*}}}*/
function delete_project() {/*{{{*/
	#psql aamks -c 'select * from projects'
	if(!isset($_GET['delete_project'])) { return; }
	$r=$_SESSION['nn']->query("DELETE FROM projects WHERE id=$1 and user_id=$2 RETURNING project_name", array($_GET['delete_project'], $_SESSION['main']['user_id']));
	$project_name=$r[0]['project_name'];
	if(!empty($project_name)) { 
		$delete=$_SESSION['main']['user_home']."/$project_name";
		system("rm -rf $delete");
	}
	header("Location: projects.php?projects_list");
	exit();

}/*}}}*/
function ch_scenario(){/*{{{*/
	#psql aamks -c 'select * from scenarios'
	#psql aamks -c 'select * from users'
	if(!isset($_GET['ch_scenario'])) { return; }
	$r=$_SESSION['nn']->query("SELECT u.email,s.project_id,s.id AS scenario_id,s.scenario_name, u.active_editor, u.user_photo, u.user_name, p.project_name FROM scenarios s JOIN projects p ON s.project_id=p.id JOIN users u ON p.user_id=u.id WHERE s.id=$1 AND p.user_id=$2 LIMIT 1",array($_GET['ch_scenario'], $_SESSION['main']['user_id']));
	if(empty($r[0])) { die("scenario_id=$_GET[ch_scenario]?"); }
	$_SESSION['nn']->ch_main_vars($r[0]);
	header("Location: form.php?edit");
}/*}}}*/
function init_main_vars() { #{{{
	#psql aamks -c 'select * from users'
	#psql aamks -c 'select * from projects'
	if(isset($_SESSION['main']['project_id'])) { return; }
	$_SESSION['main']['user_id']=1;
	$r=$_SESSION['nn']->query("SELECT u.email, p.project_name, u.active_editor, u.user_photo, u.user_name, p.id AS project_id, s.scenario_name, s.id AS scenario_id  FROM users u LEFT JOIN scenarios s ON (u.active_scenario=s.id) LEFT JOIN projects p ON(p.id=s.project_id) WHERE u.id=$1 AND u.active_scenario=s.id",array($_SESSION['main']['user_id']));
	$_SESSION['nn']->ch_main_vars($r[0]);
}
/*}}}*/
function new_scenario() { # {{{
	#psql aamks -c 'select  * from scenarios'
	if(empty($_POST['new_scenario'])) { return; }
	$_SESSION['nn']->query("INSERT INTO scenarios(project_id,scenario_name) VALUES($1, $2)", array($_POST['project_id'], $_POST['new_scenario'])); 
	if (!mkdir(implode("/", array($_SESSION['main']['user_home'],$_POST['project_name'],$_POST['new_scenario'])), 0770, true)) {
		$_SESSION['header_err'][]="Cannot create $_POST[project_name]/$_POST[new_scenario]";
	} 
	header("Location: projects.php?projects_list");
}
/*}}}*/
function new_project() { # {{{
	#psql aamks -c 'select  * from projects'
	if(empty($_POST['new_project'])) { return; }
	$_SESSION['nn']->query("INSERT INTO projects(project_name,user_id) VALUES($1, $2)", array($_POST['new_project'], $_SESSION['main']['user_id'])); 
	if (!mkdir(implode("/", array($_SESSION['main']['user_home'],$_POST['new_project'])), 0770, true)) {
		$_SESSION['header_err'][]="Cannot create $_POST[new_project]";
	} 
	header("Location: projects.php?projects_list");
}
/*}}}*/
function session_dump() { # {{{
	if(!isset($_GET['session_dump'])) { return; }
	dd($_SESSION['main']);
	exit();
}
/*}}}*/
function assert_session_complete() { #{{{
}
/*}}}*/
function main() { #{{{
	if(empty($_SESSION['nn'])) { $_SESSION['nn']=new Aamks("Aamks") ; } # TODO: index.php should handle this
	$_SESSION['nn']->htmlHead("Manage projects");
	init_main_vars();
	new_scenario();
	new_project();
	ch_scenario();
	delete_project();
	$_SESSION['nn']->menu('Manage projects');
	session_dump();
	if(isset($_GET['projects_list'])) { projects_list(); }
}
/*}}}*/

#psql aamks -c 'select  *  from users'
#psql aamks -c 'update users set active_scenario=2 where id=25'
main();
#dd($_SESSION['main']);

?>
