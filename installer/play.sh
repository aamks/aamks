# Not for production

psql -f sql.sql
psql aamks -c "
DELETE FROM users;
INSERT INTO users(active_scenario , active_editor , user_photo , user_name , email) values(1 , 1 , '/aamks/logo.svg' , 'Karol Kreński'    , 'mimoohowy@gmail.com');
INSERT INTO users(active_scenario , active_editor , user_photo , user_name , email) values(2 , 1 , '/aamks/logo.svg' , 'Stanisław Łazowy' , 'stanislaw.lazowy@gmail.com');
DELETE FROM projects;
INSERT INTO projects(user_id,project_name) values(1,'demo');
DELETE FROM scenarios;
INSERT INTO scenarios(project_id,scenario_name) values(1,'simple');
INSERT INTO scenarios(project_id,scenario_name) values(1,'navmesh');
INSERT INTO scenarios(project_id,scenario_name) values(1,'three');
";

sudo rm -rf /home/aamks_users/mimoohowy@gmail.com/
mkdir -p /home/aamks_users/mimoohowy@gmail.com/
cp -r demo/ /home/aamks_users/mimoohowy@gmail.com/demo
sudo chmod -R g+w /home/aamks_users/
sudo chmod -R g+s /home/aamks_users/
sudo chown -R $USER:www-data /home/aamks_users
