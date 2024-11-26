# Not for production

# should match $AAMKS_PATH/gui/inc.php: private function mk_default_preferences()
PREFS='{"apainter_editor": "advanced", "navmesh_debug": 1, "apainter_labels": 1, "partitioning_debug": 0 }'; 
sudo -u postgres psql -f sql.sql
sudo -u postgres psql aamks -c "
DELETE FROM users;
INSERT INTO users(active_scenario, user_photo , user_name , password, email, preferences, activation_token) values(3 , '/aamks/logo.svg' , 'AAMKS Project', '49fa09e3f6ef9defa7f8', 'demo@aamks', '$PREFS', 'already activated');
DELETE FROM projects;
INSERT INTO projects(user_id,project_name) values(1,'demo');
DELETE FROM scenarios;

INSERT INTO scenarios(project_id,scenario_name) values(1,'simple');
INSERT INTO scenarios(project_id,scenario_name) values(1,'navmesh');
INSERT INTO scenarios(project_id,scenario_name) values(1,'three');

COPY simulations FROM '$PWD/simulations.csv' DELIMITER ',' CSV HEADER;

SELECT SETVAL((SELECT PG_GET_SERIAL_SEQUENCE('"simulations"', 'id')), (SELECT (MAX("id") + 1) FROM "simulations"), FALSE);
";

# psql aamks -c "SELECT * FROM projects"
# psql aamks -c "SELECT * FROM scenarios"
# psql aamks -c "SELECT * FROM users"
# psql aamks -c "\d "
sudo rm -rf /home/aamks_users/*
mkdir -p /home/aamks_users/demo@aamks
cp -r demo/ /home/aamks_users/demo@aamks/demo
sudo chmod -R g+w /home/aamks_users/
sudo chmod -R g+s /home/aamks_users/
sudo chown -R $USER:www-data /home/aamks_users
../env/bin/python3 ../redis_aamks/manager.py -d
../env/bin/python3 ../redis_aamks/manager.py -sd
