<?php
session_name('aamks');
require_once("inc.php"); 

function projects_list(){/*{{{*/
	$current_project = $_SESSION['main']['project_name'];
	$current_scenario = $_SESSION['main']['scenario_name'];
	$current_scenario_id = $_SESSION['main']['scenario_id'];
	$r=$_SESSION['nn']->query("SELECT id, project_name FROM projects WHERE user_id=$1 ORDER BY modified DESC", array($_SESSION['main']['user_id'] ));
	echo '<table>';
	echo '<tr><th>projects<th>date<th>add scenario<th>scenarios<th>delete';
	foreach($r as $projects){
		$rr=$_SESSION['nn']->query("SELECT *, modified::date AS date FROM scenarios WHERE project_id=$1 ORDER BY id", array($projects['id']));
		if(empty($rr[0]['date'])) { $date=''; } else { $date=$rr[0]['date']; }
		echo "<tr";
		if($projects['project_name']==$current_project) {
			echo " bgcolor='#616'";
		}
		echo "><td>$projects[project_name]<td style='opacity:0.2'>$date<td>";
		echo "<form method=post><input autocomplete=off type=hidden name=project_name value='$projects[project_name]'><input autocomplete=off type=hidden name=project_id value='$projects[id]'><input autocomplete=off size=12 type=text placeholder='new scenario' name=new_scenario required pattern='\w{1,9}' title='max 9 of alphanumeric characters'><input autocomplete=off type=submit value='add'></form><td>";
		foreach($rr as $scenarios) { 
			echo "<a class=blink href=?ch_scenario=$scenarios[id]>$scenarios[scenario_name]</a>"; 
		}
		if($projects['project_name']!='demo') { 
			echo '<td><button type="submit" onclick="' . "delProject($projects[id])" . '">delete</button></td>';
		}

	}
	echo "</table>";

	echo "<div class='top_padding'>Remove all results from scenario: $current_scenario
	<button type=submit onclick=resetScenario()>reset scenario</button></div>";

	//new project
	echo "
	<div class='top_padding'>Add new project:
	<form method=POST>
		<input autocomplete=off type=text placeholder='new project name' name=new_project required pattern='\w{1,15}' title='max 15 of alphanumeric characters'> 
		<input autocomplete=off type=submit name=submit value='add'>
	</form></div>
	";

	//rename project
	echo "
	<div class='top_padding'>Rename current project (<i>$current_project</i>) as:
	<form method=POST>
		<input autocomplete=off type=text placeholder='new project name' name=rename_project required pattern='\w{1,15}' title='max 15 of alphanumeric characters'> 
		<input autocomplete=off type=submit name=submit value='rename'>
	</form></div>
	";

	//rename scenario
	echo "
	<div class='top_padding'>Rename current scenario (<i>$current_project/$current_scenario</i>) as:
	<form method=POST>
		<input autocomplete=off type=text placeholder='new scenario name' name=rename_scenario required pattern='\w{1,9}' title='max 9 of alphanumeric characters'> 
		<input autocomplete=off type=submit name=submit value='rename'>
	</form></div>
	";

	//copy scenario
	echo "
	<div class='top_padding'>Copy current scenario (<i>$current_project/$current_scenario</i>) as:
	<form method=POST>
		<input autocomplete=off type=text placeholder='new scenario name' name=copy_scenario required pattern='\w{1,15}' title='max 15 of alphanumeric characters'> 
		<input autocomplete=off type=submit name=submit value='copy'>
	</form></div>
	";

	exit();
}/*}}}*/
function delete_project() {/*{{{*/
	if(!isset($_GET['delete_project'])) { return; }
	$r=$_SESSION['nn']->query("DELETE FROM projects WHERE id=$1 and user_id=$2 RETURNING project_name", array($_GET['delete_project'], $_SESSION['main']['user_id']));
	$project_name=$r[0]['project_name'];
	if(!empty($project_name)) { 
		$delete=$_SESSION['main']['user_home']."/$project_name";
		system("rm -rf $delete");
	}
	$r=$_SESSION['nn']->query("SELECT u.id AS user_id, u.email, p.project_name, u.preferences, u.user_photo, u.user_name, p.id AS project_id, s.scenario_name, s.id AS scenario_id  FROM projects p LEFT JOIN scenarios s ON (p.id=s.project_id) LEFT JOIN users u ON(p.user_id=u.id) WHERE u.id=$1 AND s.id IS NOT NULL ORDER BY s.modified DESC LIMIT 1",array($_SESSION['main']['user_id']));
	$_SESSION['nn']->ch_main_vars($r[0]);
	header("Location: projects.php?projects_list");
	exit();
}/*}}}*/
function ch_scenario($scenario, $header=NULL){/*{{{*/
	$r=$_SESSION['nn']->query("SELECT u.id AS user_id,u.email,s.project_id,s.id AS scenario_id,s.scenario_name, u.preferences, u.user_photo, u.user_name, p.project_name FROM scenarios s JOIN projects p ON s.project_id=p.id JOIN users u ON p.user_id=u.id WHERE s.id=$1 AND p.user_id=$2",array($scenario, $_SESSION['main']['user_id']));
	if(empty($r[0])) { die("scenario_id=$scenario?"); }
	$_SESSION['nn']->ch_main_vars($r[0]);
	if(!empty($header)) { header("Location: $header"); }
}/*}}}*/
function new_scenario() { # {{{
	if(empty($_POST['new_scenario'])) { return; }
	$scenarios=array_column($_SESSION['nn']->query("SELECT scenario_name FROM scenarios WHERE project_id=$1", array($_POST['project_id'])), 'scenario_name');
	if($_POST['new_scenario'] == 'draft'){
		$_SESSION['header_err'][]="Scenario name 'draft' can not be used!";
		return;
	}
	if(in_array($_POST['new_scenario'], $scenarios, true)){
		$_SESSION['header_err'][]="Scenario '$_POST[new_scenario]' already exists";
	} else {
		if (!mkdir(implode("/", array($_SESSION['main']['user_home'],$_POST['project_name'],$_POST['new_scenario'])), 0777, true)) {
			$_SESSION['header_err'][]="Cannot create $_POST[project_name]/$_POST[new_scenario]";
			header("Location: projects.php?projects_list");
		} else {
			$sid=$_SESSION['nn']->query("INSERT INTO scenarios(project_id,scenario_name) VALUES($1, $2) RETURNING id", array($_POST['project_id'], $_POST['new_scenario'])); 
			ch_scenario($sid[0]['id']);
			$_SESSION['nn']->scenario_from_template("apainter/index.php");
		}
	}
}
function copy_scenario() { # {{{
	if(empty($_POST['copy_scenario'])) { return; }
	$scenarios=array_column($_SESSION['nn']->query("SELECT scenario_name FROM scenarios WHERE project_id=$1", array($_SESSION['main']['project_id'])), 'scenario_name');
	if(in_array($_POST['copy_scenario'], $scenarios, true) && $_POST['copy_scenario'] != 'draft'){
		$_SESSION['header_err'][]="Scenario '$_POST[copy_scenario]' already exists";
	} else {
		if($_POST['copy_scenario'] == 'draft'){
			$_SESSION['nn']->query("DELETE FROM scenarios WHERE scenario_name='draft'");
			$disk_delete=implode("/", array($_SESSION['main']['user_home'], $_SESSION['main']['project_name'], 'draft'));
			system("rm -rf $disk_delete");
		}
		$new_scenario_directory = implode("/", array($_SESSION['main']['user_home'],$_SESSION['main']['project_name'],$_POST['copy_scenario']));
		if (!mkdir($new_scenario_directory, 0777, true)) {
			$_SESSION['header_err'][]="Cannot create $_POST[project_name]/$_POST[copy_scenario]";
			header("Location: projects.php?projects_list");
		} else {
			$sid=$_SESSION['nn']->query("INSERT INTO scenarios(project_id,scenario_name) VALUES($1, $2) RETURNING id", array($_SESSION['main']['project_id'], $_POST['copy_scenario']));
			$existing_scenario_directory = implode("/", array($_SESSION['main']['user_home'],$_SESSION['main']['project_name'],$_SESSION['main']['scenario_name']));
			$files_to_copy = array("cad.json", "conf.json");
			foreach($files_to_copy as $filename) {
				$from = implode("/", array($existing_scenario_directory, $filename));
				$to = implode("/", array($new_scenario_directory, $filename));
				if (file_exists($from))
					copy($from, $to);
			}
			ch_scenario($sid[0]['id']);
			// save conf.json again to update scenario number in the file
			$conf_file = file_get_contents(implode("/", array($new_scenario_directory, "conf.json")));
			$_SESSION['nn']->write_scenario($conf_file, "projects.php?projects_list");
		}
	}
}
function rename_scenario() { # {{{
	if(empty($_POST['rename_scenario'])) { return; }
	if($_POST['rename_scenario'] == 'draft'){
		$_SESSION['header_err'][]="Scenario name 'draft' can not be used!";
		return;
	}
	$scenarios=array_column($_SESSION['nn']->query("SELECT scenario_name FROM scenarios WHERE project_id=$1", array($_SESSION['main']['project_id'])), 'scenario_name');
	if(in_array($_POST['rename_scenario'], $scenarios, true)){
		$_SESSION['header_err'][]="Scenario '$_POST[rename_scenario]' already exists";
		header("Location: projects.php?projects_list");
	} else {
		$old_scenario_directory = implode("/", array($_SESSION['main']['user_home'],$_SESSION['main']['project_name'],$_SESSION['main']['scenario_name']));
		$new_scenario_directory = implode("/", array($_SESSION['main']['user_home'],$_SESSION['main']['project_name'],$_POST['rename_scenario']));
		if (!rename($old_scenario_directory, $new_scenario_directory)) {
			$_SESSION['header_err'][]="Cannot rename senario folder to $_POST[rename_scenario]";
			header("Location: projects.php?projects_list");
		} else {
			$_SESSION['nn']->query("UPDATE scenarios SET scenario_name=$1 WHERE id=$2", array($_POST['rename_scenario'], $_SESSION['main']['scenario_id']));
			ch_scenario($_SESSION['main']['scenario_id']);
		}
	}
}
/*}}}*/
function new_project() { # {{{
	if(empty($_POST['new_project'])) { return; }
	$projects=array_column($_SESSION['nn']->query("SELECT project_name FROM projects WHERE user_id=$1", array($_SESSION['main']['user_id'] )), 'project_name');
	if(in_array($_POST['new_project'], $projects, true)){
		$_SESSION['header_err'][]="Project '$_POST[new_project]' already exists";
	} else {
		if (!mkdir(implode("/", array($_SESSION['main']['user_home'],$_POST['new_project'])), 0777, true)) {
			$_SESSION['header_err'][]="Cannot create $_POST[new_project]";
		} else {
			$_SESSION['nn']->query("INSERT INTO projects(project_name,user_id) VALUES($1, $2)", array($_POST['new_project'], $_SESSION['main']['user_id'])); 
		}
		header("Location: projects.php?projects_list");
	}
}
function rename_project() { # {{{
	if(empty($_POST['rename_project'])) { return; }
	$projects=array_column($_SESSION['nn']->query("SELECT project_name FROM projects WHERE user_id=$1", array($_SESSION['main']['user_id'] )), 'project_name');
	if(in_array($_POST['rename_project'], $projects, true)){
		$_SESSION['header_err'][]="Project '$_POST[rename_project]' already exists";
	} else {
		$old_directory = implode("/", array($_SESSION['main']['user_home'],$_SESSION['main']['project_name']));
		$new_directory = implode("/", array($_SESSION['main']['user_home'],$_POST['rename_project']));
		if (!rename($old_directory, $new_directory)) {
			$_SESSION['header_err'][]="Cannot rename folder to $_POST[rename_project]";
		} else {
			$_SESSION['nn']->query("UPDATE projects SET project_name=$1 WHERE id=$2", array($_POST['rename_project'], $_SESSION['main']['project_id']));
			ch_scenario($_SESSION['main']['scenario_id']);
		}
		header("Location: projects.php?projects_list");
	}
}
/*}}}*/
function reset_scenario() { #{{{
	if(empty($_POST['reset_scenario'])) { return; }
	$r=$_SESSION['nn']->query("DELETE FROM simulations WHERE scenario_id=$1", array($_SESSION['main']['scenario_id']));	
	$delete=$_SESSION['main']['working_home']."/*";
	system("find $delete ! -name '*.json' -type f,d -exec rm -rf {} +");
}
/*}}}*/
function main() { #{{{
	if(!array_key_exists('nn', $_SESSION))
    {
        header("Location: login.php?session_finished_information=1");
    }
	if(empty($_SESSION['nn'])) { $_SESSION['nn']=new Aamks("Aamks") ; } # TODO: index.php should handle this
	$_SESSION['nn']->htmlHead("Manage projects");
	new_scenario();
	reset_scenario();
	new_project();
	rename_project();
	rename_scenario();
	copy_scenario();
	delete_project();
	if(isset($_GET['ch_scenario'])) { ch_scenario($_GET['ch_scenario'], "form.php?edit"); }
	$_SESSION['nn']->menu('Manage projects');
	if(isset($_GET['projects_list'])) { projects_list(); }
}
/*}}}*/
#psql aamks -c 'select * from scenarios'
#psql aamks -c 'select * from users'
#psql aamks -c 'select * from projects'
#psql aamks -c 'select * from users'
#psql aamks -c 'update users set active_scenario=2 where id=25'
main();
#dd($_SESSION['main']);

?>
