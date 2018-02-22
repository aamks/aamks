#!/bin/bash

sudo apt-get install postgresql python3-pip python3-shapely python3-numpy python3-networkx python3-psycopg2 gearman sendxmpp
sudo -H pip3 install webcolors pyhull 

echo; echo; echo;
echo "Running psql commands with" 
echo "sudo -u postgres psql -c 'sql commands'"
echo 

. vars.sh
[ $AAMKS_PG_REMOVE_ALL_AAMKS_DATA == 1 ] && { 
	sudo -u postgres psql -c "DROP DATABASE aamks";
	sudo -u postgres psql -c "DROP USER aamks";
}
[ $AAMKS_PG_PASS == 'secret' ] && { echo "You need to change AAMKS_PG_PASS='secret' in vars.sh"; } || {

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
    project text,
    iteration smallint,
    fireorig text,
    fireorigname text,
    detector text,
    hrrpeak text,
    sootyield text,
    coyield text,
    alpha text,
    area text,
    heigh text,
    w text,
    outdoort text,
    d text,
    c text,
    sprinkler text,
    heatcom text,
    e text,
    radfrac text,
    fed text,
    wcbe smallint,
    host text,
    dcbe_time integer,
    dcbe_compa text,
    run_time smallint,
    vnt text,
    trace text,
    min_height decimal,
    max_temp decimal,
    q_star text,
    min_vis decimal,
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
}
