#!/bin/bash

# Configure until the END OF CONFIGURATION. Then run bash install.sh.
# All CONFIGURATION variables must be written here and in your ~/.bashrc.

# Aamks uses postgres (user:aamks, db:aamks) for collecting the simulations data.

# AAMKS_NOTIFY is for gearman and other notifications. Emails notifications are
# troublesome (local maileserver? / spam / google's authorizations) therefore we
# notify via jabber. Just install xabber or other client on your smartphone /
# your desktop, create your jabber account and make sure it works. Aamks may send
# you some messages while it works. 

# By convention users dirs are as follows:
# /home/aamks_users/user1@gmail.com
# /home/aamks_users/user2@hotmail.com
# ...

# CONFIGURATION, must copy to ~/.bashrc

AAMKS_SERVER=127.0.0.1
AAMKS_NOTIFY='mimooh@jabb.im, krasuski@jabb.im'
AAMKS_TESTING=0
AAMKS_PG_PASS='hulakula' 
AAMKS_USE_GEARMAN=1
AAMKS_PATH='/usr/local/aamks'
AAMKS_PROJECT="/home/aamks_users/mimoohowy@gmail.com/three/1" # TODO: need to invent some default project 
PYTHONPATH="${PYTHONPATH}:$AAMKS_PATH"

# END OF CONFIGURATION

USER=`id -ru`
[ "X$USER" == "X0" ] && { echo "Don't run as root / sudo"; exit; }

sudo apt-get update 
sudo apt-get install postgresql python3-pip python3-psycopg2 gearman sendxmpp xdg-utils apache2
sudo -H pip3 install webcolors pyhull colour shapely scipy numpy networkx

# [ $AAMKS_PG_PASS == 'secret' ] && { 
# 	echo "Password for aamks psql user needs to be changed from the default='secret'. It must match the AAMKS_PG_PASS in your ~/.bashrc."; 
# 	echo
# 	exit;
# } 

# www-data user needs AAMKS_PG_PASS
temp=`mktemp`
sudo cat /etc/apache2/envvars | grep -v AAMKS_ | grep -v umask > $temp
echo "umask 0002" >> $temp
echo "export AAMKS_SERVER='$AAMKS_SERVER'" >> $temp
echo "export AAMKS_PATH='$AAMKS_PATH'" >> $temp
echo "export AAMKS_NOTIFY='$AAMKS_NOTIFY'" >> $temp
echo "export AAMKS_TESTING='$AAMKS_TESTING'" >> $temp
echo "export AAMKS_PG_PASS='$AAMKS_PG_PASS'" >> $temp
sudo cp $temp /etc/apache2/envvars
rm $temp

sudo mkdir -p "$AAMKS_PROJECT"
sudo chown -R $USER $AAMKS_PATH

# From now on, each file written to /home/aamks_users will belong to www-data group.
# Solves the problem of shell users vs www-data user permissions of new files.
# But you need to take care of shell users yourself: add them to www-data in /etc/group.
sudo chown -R $USER:www-data /home/aamks_users
sudo chmod -R g+s /home/aamks_users
sudo find /home/aamks_users -type f -exec chmod 664 {} \;

# www gui installer

echo; echo; echo;
echo "Running psql commands with" 
echo "sudo -u postgres psql -c 'sql commands'"
echo 

sudo -u postgres psql -lqt | cut -d \| -f 1 | grep -qw 'aamks' && { 
	echo "Aamks already exists in psql. You may wish to clear psql from aamks by invoking:";
	echo
	echo 'sudo -u postgres psql -c "DROP DATABASE aamks"; sudo -u postgres psql -c "DROP USER aamks"' 
	echo
	exit;
}

sudo -u postgres psql << EOF

CREATE DATABASE aamks;
\c aamks;
CREATE USER aamks WITH PASSWORD '$AAMKS_PG_PASS';
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- updateTimestamp---{{{
CREATE OR REPLACE FUNCTION update_modified_column()	
RETURNS TRIGGER AS \$\$
BEGIN
    NEW.modified = now();
    RETURN NEW;	
END;
\$\$ language 'plpgsql';

---}}}
CREATE TABLE users (---{{{
	id serial PRIMARY KEY, 
    email character varying(50),
    password character varying(70),
    userName character varying(80),
	editor varchar(10),
	current_project_id varchar(100),
	current_scenario_id varchar(100),
	websocket_host varchar(100),
	websocket_port varchar(20),
	session_id varchar(100),
	access_time timestamp,
	access_ip varchar(100),
	created timestamp default current_timestamp
);
---}}}
CREATE TABLE projects (---{{{
	id serial PRIMARY KEY, 
    user_id smallint,
    name varchar(200),
    description text,
    category_id varchar(40),
	modified timestamp default current_timestamp
);
---}}}
CREATE TABLE categories (---{{{
	id serial PRIMARY KEY, 
    user_id smallint,
    label varchar(200),
  	uuid varchar(100), 
	active boolean,
	visible boolean,
	modified timestamp default current_timestamp
);
---}}}
CREATE TABLE scenarios (---{{{
	id serial PRIMARY KEY, 
    project_id smallint,
	name varchar(200),
    fds_file text,
	fds_object text,
	ui_state text,
    ac_file text,
    ac_hash varchar(50),
	modified timestamp default current_timestamp
);
---}}}
CREATE TABLE risk_scenarios (---{{{
	id serial PRIMARY KEY, 
    project_id smallint,
	name varchar(200),
	risk_object text,
	ui_state text,
    ac_file text,
    ac_hash varchar(50),
	modified timestamp default current_timestamp
);
---}}}
CREATE TABLE library(---{{{
	id serial PRIMARY KEY, 
	json text,
	user_id smallint
);

---}}}
CREATE TABLE simulations ( ---{{{
    id serial PRIMARY KEY,
    project int,
    scenario_id int,
    iteration smallint,
    host text,
    run_time smallint,
    fireorig text,
    fireorigname text,
    heat_detectors text,
    smoke_detectors text,
    hrrpeak text,
    sootyield text,
    coyield text,
    alpha text,
    area text,
    heigh text,
    heatcom text,
    radfrac text,
    q_star text,
    trace text,
    w text,
    outdoort text,
    d text,
    c text,
    e text,
    vnt text,
    sprinklers text,
    wcbe text,
    dcbe_time integer,
    dcbe_compa text,
    fed text,
    min_hgt decimal,
    min_vis_compa decimal,
    min_vis_cor decimal,
    max_temp decimal,
	status text,
	animation text,
	inserted timestamp without time zone not null default now()
);
---}}}

CREATE TRIGGER update_modified BEFORE UPDATE ON projects FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
CREATE TRIGGER update_modified BEFORE UPDATE ON scenarios FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
---{{{ ALTERS
ALTER TABLE users OWNER TO aamks;
GRANT ALL ON TABLE users TO aamks;
GRANT ALL ON SEQUENCE users_id_seq TO aamks;

ALTER TABLE projects OWNER TO aamks;
GRANT ALL ON TABLE projects TO aamks;
GRANT ALL ON SEQUENCE projects_id_seq TO aamks;

ALTER TABLE scenarios OWNER TO aamks;
GRANT ALL ON TABLE scenarios TO aamks;
GRANT ALL ON SEQUENCE scenarios_id_seq TO aamks;

ALTER TABLE risk_scenarios OWNER TO aamks;
GRANT ALL ON TABLE risk_scenarios TO aamks;
GRANT ALL ON SEQUENCE risk_scenarios_id_seq TO aamks;

ALTER TABLE categories OWNER TO aamks;
GRANT ALL ON TABLE categories TO aamks;
GRANT ALL ON SEQUENCE categories_id_seq TO aamks;

ALTER TABLE library OWNER TO aamks;
GRANT ALL ON TABLE library TO aamks;
GRANT ALL ON SEQUENCE library_id_seq TO aamks;

ALTER TABLE simulations OWNER TO aamks;
GRANT ALL ON TABLE simulations TO aamks;
GRANT ALL ON SEQUENCE simulations_id_seq TO aamks;
---}}}

EOF
echo;
