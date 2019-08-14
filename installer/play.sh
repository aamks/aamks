# Not for production

psql -f sql.sql
preferences='{"apainter_editor": "text", "navmesh_debug": 1, "apainter_labels": 1}';
psql aamks -c "
DELETE FROM users;
INSERT INTO users(active_scenario, preferences, user_photo , user_name , email) values(3 , '$preferences', '/aamks/logo.svg' , 'Karol Kreński'    , 'mimoohowy@gmail.com');
INSERT INTO users(active_scenario, preferences, user_photo , user_name , email) values(1 , '$preferences', '/aamks/logo.svg' , 'Stanisław Łazowy' , 'stanislaw.lazowy@gmail.com');
DELETE FROM projects;
INSERT INTO projects(user_id,project_name) values(1,'demo');
DELETE FROM scenarios;
INSERT INTO scenarios(project_id,scenario_name) values(1,'simple');
INSERT INTO scenarios(project_id,scenario_name) values(1,'navmesh');
INSERT INTO scenarios(project_id,scenario_name) values(1,'three');
INSERT INTO scenarios(project_id,scenario_name) values(1,'fds');
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
