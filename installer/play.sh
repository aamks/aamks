# Not for production

# should match /usr/local/aamks/gui/inc.php: private function mk_default_preferences()
PREFS='{"apainter_editor": "text", "navmesh_debug": 1, "apainter_labels": 1, "partitioning_debug": 0 }';

psql -f sql.sql
psql aamks -c "
DELETE FROM users;
INSERT INTO users(active_scenario, user_photo , user_name , password, email, preferences) values(3 , '/aamks/logo.svg' , 'Karol Kreński'    , 'cf87b610767de89e73f6', 'mimoohowy@gmail.com', '$PREFS');
INSERT INTO users(active_scenario, user_photo , user_name , password, email, preferences) values(1 , '/aamks/logo.svg' , 'Stanisław Łazowy' , 'cf87b610767de89e73f6', 'stanislaw.lazowy@gmail.com', '$PREFS');
DELETE FROM projects;
INSERT INTO projects(user_id,project_name) values(1,'demo');
INSERT INTO projects(user_id,project_name) values(2,'demo');
DELETE FROM scenarios;

INSERT INTO scenarios(project_id,scenario_name) values(1,'simple');
INSERT INTO scenarios(project_id,scenario_name) values(1,'navmesh');
INSERT INTO scenarios(project_id,scenario_name) values(1,'three');
INSERT INTO scenarios(project_id,scenario_name) values(1,'fds');

INSERT INTO scenarios(project_id,scenario_name) values(2,'simple');
INSERT INTO scenarios(project_id,scenario_name) values(2,'navmesh');
INSERT INTO scenarios(project_id,scenario_name) values(2,'three');
INSERT INTO scenarios(project_id,scenario_name) values(2,'fds');
";

# psql aamks -c "SELECT * FROM projects"
# psql aamks -c "SELECT * FROM scenarios"
# psql aamks -c "SELECT * FROM users"
# psql aamks -c "\d "
sudo rm -rf /home/aamks_users/mimoohowy@gmail.com/
mkdir -p /home/aamks_users/mimoohowy@gmail.com/
cp -r demo/ /home/aamks_users/mimoohowy@gmail.com/demo
sudo chmod -R g+w /home/aamks_users/
sudo chmod -R g+s /home/aamks_users/
sudo chown -R $USER:www-data /home/aamks_users
