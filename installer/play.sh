# Not for production

psql -f sql.sql
psql aamks -c "
DELETE FROM users;
INSERT INTO users(active_scenario, active_editor, user_photo, user_name , email) values(1 , 1, '/aamks/logo.svg', 'Karol Kreński', 'mimoohowy@gmail.com');
INSERT INTO users(active_scenario, active_editor, user_name , email) values(2 , 1, 'Stanisław Łazowy' , 'stanislaw.lazowy@gmail.com');
DELETE FROM projects;
INSERT INTO projects(user_id,project_name) values(1,'demo');
INSERT INTO projects(user_id,project_name) values(1,'three');
INSERT INTO projects(user_id,project_name) values(2,'three');
INSERT INTO projects(user_id,project_name) values(1,'four');
INSERT INTO projects(user_id,project_name) values(1,'five');
DELETE FROM scenarios;
INSERT INTO scenarios(project_id,scenario_name) values(1,'demo_1');
INSERT INTO scenarios(project_id,scenario_name) values(2,'three_1');
INSERT INTO scenarios(project_id,scenario_name) values(3,'three_1');
INSERT INTO scenarios(project_id,scenario_name) values(3,'three_2');
INSERT INTO scenarios(project_id,scenario_name) values(4,'four_1');
INSERT INTO scenarios(project_id,scenario_name) values(4,'four_2');
INSERT INTO scenarios(project_id,scenario_name) values(4,'four_3');
INSERT INTO scenarios(project_id,scenario_name) values(4,'four_4');
INSERT INTO scenarios(project_id,scenario_name) values(5,'five_1');
";

sudo rm -rf /home/aamks_users/mimoohowy@gmail.com
mkdir -p /home/aamks_users/mimoohowy@gmail.com/three/three_1
mkdir -p /home/aamks_users/mimoohowy@gmail.com/three/three_2
mkdir -p /home/aamks_users/mimoohowy@gmail.com/four/four_1
mkdir -p /home/aamks_users/mimoohowy@gmail.com/four/four_2
mkdir -p /home/aamks_users/mimoohowy@gmail.com/four/four_3
mkdir -p /home/aamks_users/mimoohowy@gmail.com/four/four_4
mkdir -p /home/aamks_users/mimoohowy@gmail.com/five/five_1
cp -r examples/demo/ /home/aamks_users/mimoohowy@gmail.com/
sudo chmod -R g+w /home/aamks_users/
sudo chmod -R g+s /home/aamks_users/
sudo chown -R $USER:www-data /home/aamks_users
