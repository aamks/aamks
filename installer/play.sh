# Not for production

psql -f sql.sql

# alamakota
psql aamks -c "
DELETE FROM users;
INSERT INTO users(active_scenario , active_editor , user_photo , user_name , password, email) values(3 , 1 , '/aamks/logo.svg' , 'Karol Kreński',  'cf87b610767de89e73f6', 'mimoohowy@gmail.com');
INSERT INTO users(active_scenario , active_editor , user_photo , user_name , password, email) values(5 , 1 , '/aamks/logo.svg' , 'Stanisław Łazowy' , 'cf87b610767de89e73f6', 'stanislaw.lazowy@gmail.com');

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
