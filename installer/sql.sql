DROP DATABASE aamks;
CREATE DATABASE aamks;
\c aamks;
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
CREATE TABLE categories (---{{{
	id serial PRIMARY KEY, 
    user_id smallint,
    label varchar(200),
  	uuid varchar(100), 
	active boolean,
	visible boolean,
	modified timestamp without time zone not null default now()
);
---}}}
CREATE TABLE library(---{{{
	id serial PRIMARY KEY, 
	json text,
	user_id smallint,
	modified timestamp without time zone not null default now()
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
    soot_yield text,
    co_yield text,
    hcl_yield text,
    hcn_yield text,
    alpha text,
    trace text,
    max_area text,
    heigh text,
    heat_of_combustion text,
    rad_frac text,
    w text,
    outdoor_temp text,
    door text,
    dcloser text,
    delectr text,
    vnt text,
    vvent text,
    sprinklers text,
    wcbe text,
    dcbe_time integer,
    dcbe_compa text,
    fed text,
    min_hgt_compa decimal,
    min_hgt_cor decimal,
    min_vis_compa decimal,
    min_vis_cor decimal,
    max_temp decimal,
	status text,
	animation text,
	i_risk text,
	modified timestamp without time zone not null default now()
);
---}}}
CREATE TABLE users (---{{{
	id serial PRIMARY KEY, 
	active_scenario int,
    email text UNIQUE,
	google_id text,
    user_name text,
	user_photo text,
    password text,
	access_time timestamp,
	activation_token text,
	reset_token text,
	preferences text,
	modified timestamp without time zone not null default now()
);
---}}}
CREATE TABLE projects (---{{{
	id serial PRIMARY KEY, 
	user_id integer,
	project_name text,
	modified timestamp without time zone not null default now()
);
---}}}
CREATE TABLE scenarios (---{{{
	id serial PRIMARY KEY, 
	project_id integer,
	scenario_name text,
	modified timestamp without time zone not null default now()
);
---}}}
---{{{ TRIGGERS
CREATE TRIGGER update_modified BEFORE UPDATE ON categories FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
CREATE TRIGGER update_modified BEFORE UPDATE ON library FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
CREATE TRIGGER update_modified BEFORE UPDATE ON simulations FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
CREATE TRIGGER update_modified BEFORE UPDATE ON users FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
CREATE TRIGGER update_modified BEFORE UPDATE ON projects FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
CREATE TRIGGER update_modified BEFORE UPDATE ON scenarios FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
---}}}
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

ALTER TABLE categories OWNER TO aamks;
GRANT ALL ON TABLE categories TO aamks;
GRANT ALL ON SEQUENCE categories_id_seq TO aamks;

ALTER TABLE library OWNER TO aamks;
GRANT ALL ON TABLE library TO aamks;
GRANT ALL ON SEQUENCE library_id_seq TO aamks;

ALTER TABLE simulations OWNER TO aamks;
GRANT ALL ON TABLE simulations TO aamks;
GRANT ALL ON SEQUENCE simulations_id_seq TO aamks;

ALTER TABLE users OWNER TO aamks;
GRANT ALL ON TABLE users TO aamks;
GRANT ALL ON SEQUENCE users_id_seq TO aamks;

ALTER TABLE projects OWNER TO aamks;
ALTER TABLE projects ADD CONSTRAINT projects_user_id FOREIGN KEY (user_id) REFERENCES users (id) ON UPDATE CASCADE ON DELETE CASCADE;
GRANT ALL ON TABLE projects TO aamks;
GRANT ALL ON SEQUENCE projects_id_seq TO aamks;

ALTER TABLE scenarios OWNER TO aamks;
ALTER TABLE scenarios ADD CONSTRAINT scenarios_project_id FOREIGN KEY (project_id) REFERENCES projects(id) ON UPDATE CASCADE ON DELETE CASCADE;
GRANT ALL ON TABLE scenarios TO aamks;
GRANT ALL ON SEQUENCE scenarios_id_seq TO aamks;

---}}}

