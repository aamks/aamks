drop database wizfds;
create database wizfds;
\c wizfds;

SET client_min_messages = warning;

--- generowanie uuid
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
 
-- updateTimestamp---{{{
CREATE OR REPLACE FUNCTION update_modified_column()	
RETURNS TRIGGER AS $$
BEGIN
    NEW.modified = now();
    RETURN NEW;	
END;
$$ language 'plpgsql';

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

-- echo password_hash("rasmuslerdorf", PASSWORD_DEFAULT)."\n";
insert into users (email, password , userName, editor, websocket_host, websocket_port) values('mateusz.fliszkiewicz@fkce.pl' , '$2y$10$E62yoStt6zJV/QVJI6OE6O0TL3QQ6l/JBVZN9mrUYHSVcO8AeOCFS' , 'Mateusz Fliszkiewicz', 'vim', 'localhost', '2012');
insert into users (email, password , userName, editor, websocket_host, websocket_port) values('maciej.albrechtowicz@fkce.pl' , '$2y$10$E62yoStt6zJV/QVJI6OE6O0TL3QQ6l/JBVZN9mrUYHSVcO8AeOCFS' , 'Maciej Albrechtowicz', 'normal', 'localhost', '2012');
--insert into users (email, password , userName, editor, theme) values('mimoohowy@gmail.com' , '$2y$10$E62yoStt6zJV/QVJI6OE6O0TL3QQ6l/JBVZN9mrUYHSVcO8AeOCFS' , 'Karol Kreński', 'vim','dark');
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

CREATE TRIGGER update_modified BEFORE UPDATE ON projects FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
insert into categories(user_id, label, uuid, active, visible) values (1, 'current', uuid_generate_v4(), true, true);
insert into categories(user_id, label, uuid, active, visible) values (1, 'archive', uuid_generate_v4(), true, true);
insert into categories(user_id, label, uuid, active, visible) values (1, 'finished', uuid_generate_v4(), true, true);

--insert into projects(user_id,name,description,category_id) values (1, 'Project 1 name', 'Description - project 1', 'current');
--insert into projects(user_id,name,description,category_id) values (1, 'Project 2 name', 'Description - project 2', 'current');
--insert into projects(user_id,name,description,category) values (2, 'Niepodleglosci', 'żenada na Niepodległości', 'current');
--insert into projects(user_id,name,description,category) values (2, 'Archiwalny', 'ten starty', 'archive');
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

CREATE TRIGGER update_modified BEFORE UPDATE ON scenarios FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

--insert into scenarios(project_id , fds_file , fds_object, name , ac_file, ac_hash) values (1 , 'couch.fds' , '', 'Scenario1' , '1.dwg', 'FFAAB01');
--insert into scenarios(project_id , fds_file , fds_object, name , ac_file, ac_hash) values (1 , '' , '', 'Scenario2' , '', '');
--
--insert into risk_scenarios(project_id , risk_object, name , ac_file, ac_hash) values (1 , '', 'Risk Scenario2' , '1.dwg', 'FFAAB01');
--insert into risk_scenarios(project_id , risk_object, name , ac_file, ac_hash) values (2 , '', 'Risk Scenario2' , '', 'FFAAB01');
--insert into scenarios(project_id , fds_file , name , description, ac_file, ac_hash) values (1 , 'ramp.fds'  , 'couch3' , 'this is couch3 description', '1.dwg', 'FFAAB01');
--insert into scenarios(project_id , fds_file , name , description, ac_file, ac_hash) values (2 , '1.fds'     , 'couch4' , 'this is couch4 description', '1.dwg', 'FFAAB01');
--insert into scenarios(project_id , fds_file , name , description, ac_file, ac_hash) values (2 , '2.fds'     , 'couch5' , 'this is couch5 description', '1.dwg', 'FFAAB01');
--insert into scenarios(project_id , fds_file , name , description, ac_file, ac_hash) values (2 , '3.fds'     , 'couch6' , 'this is couch6 description', '1.dwg', 'FFAAB01');
--insert into scenarios(project_id , fds_file , name , description, ac_file, ac_hash) values (2 , '1.fds'     , 'couch7' , 'this is couch7 description', '1.dwg', 'FFAAB01');
---}}}

CREATE TABLE library(---{{{
	id serial PRIMARY KEY, 
	json text,
	user_id smallint
);

---}}}

-- Stare
--CREATE TABLE matls_library(---{{{
--	id serial PRIMARY KEY, 
--	my_name varchar(100),
--	my_content text,
--	user_id smallint
--);

--insert into matls_library(my_name , my_content , user_id) values ('''FABRIC'''     , '&MATL ID=''FABRIC'' FYI=''Properties completely fabricated'' SPECIFIC_HEAT=1.0 CONDUCTIVITY=0.1 DENSITY=100.0 N_REACTIONS=1 NU_SPEC=1. SPEC_ID=''PROPANE'' REFERENCE_TEMPERATURE=320. HEAT_OF_REACTION=3000. HEAT_OF_COMBUSTION=15000.0/' , 1);
--insert into matls_library(my_name , my_content , user_id) values ('''FOAM'''       , '&MATL ID=''FOAM'' FYI=''Properties completely fabricated'' SPECIFIC_HEAT=1.0 CONDUCTIVITY=0.05 DENSITY=40.0 N_REACTIONS=1 NU_SPEC=1. SPEC_ID=''PROPANE'' REFERENCE_TEMPERATURE=320. HEAT_OF_REACTION=1500. HEAT_OF_COMBUSTION=30000.0/'   , 1);
--insert into matls_library(my_name , my_content , user_id) values ('''GYPSUM PLASTER''' , '&MATL ID=''GYPSUM PLASTER'' FYI=''Quintiere, Fire Behavior'' CONDUCTIVITY=0.48 SPECIFIC_HEAT=0.84 DENSITY=1440.0/', 1);

---}}}
--CREATE TABLE surfs_library(---{{{
--	id serial PRIMARY KEY, 
--	my_name varchar(100),
--	my_content text,
--	link text,
--	user_id smallint
--);

--insert into surfs_library(my_name , link, my_content , user_id) values ('''UPHOLSTERY''' , '''FABRIC'', ''FOAM''', '&SURF ID=''UPHOLSTERY'' FYI=''Properties completely fabricated'' COLOR=''PURPLE'' BURN_AWAY=.TRUE. MATL_ID(1:2,1)=''FABRIC'' , ''FOAM'' THICKNESS(1:2)=0.002 , 0.1 /' , 1);
--insert into surfs_library(my_name , link, my_content , user_id) values ('''WALL''' , '''GYPSUM PLASTER''', '&SURF ID=''WALL'' DEFAULT=.TRUE. RGB=200, 200, 200 MATL_ID=''GYPSUM PLASTER'' THICKNESS=0.012 /', 1);

---}}}
--CREATE TABLE test (---{{{
--	id serial PRIMARY KEY, 
--    bool boolean,
--	int integer
--);



---}}}
-- PERMISSIONS ---{{{
CREATE USER fliszoostrozny;
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM PUBLIC;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA PUBLIC FROM PUBLIC;

--GRANT ALL ON ALL TABLES IN SCHEMA public TO mimooh;
GRANT ALL ON ALL TABLES IN SCHEMA public TO fliszoostrozny;

--GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO mimooh;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO fliszoostrozny;

--GRANT ALL PRIVILEGES ON DATABASE wizfds to mimooh;
GRANT ALL PRIVILEGES ON DATABASE wizfds to fliszoostrozny;

ALTER ROLE fliszoostrozny WITH PASSWORD 'dupa2014';
---}}}

