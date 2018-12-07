\c aamks
drop table scenarios;
drop table projects;
drop table users;
CREATE TABLE users (---{{{
	id serial PRIMARY KEY, 
	google_id text,
    userName text,
    email text UNIQUE,
    password text,
	picture text,
	access_time timestamp,
	activation_token text,
	reset_token text,
	modified timestamp,
	created timestamp default current_timestamp
);
---}}}
CREATE TRIGGER update_modified BEFORE UPDATE ON users FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
ALTER TABLE users OWNER TO aamks;
GRANT ALL ON TABLE users TO aamks;
GRANT ALL ON SEQUENCE users_id_seq TO aamks;

CREATE TABLE projects (
	id serial PRIMARY KEY, 
	user_id integer,
	name text,
	modified timestamp,
	created timestamp default current_timestamp
);

CREATE TABLE scenarios (
	id serial PRIMARY KEY, 
	project_id integer,
	name text,
	modified timestamp,
	created timestamp default current_timestamp
);
CREATE TRIGGER update_modified BEFORE UPDATE ON projects FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
ALTER TABLE projects ADD CONSTRAINT projects_user_id FOREIGN KEY (user_id) REFERENCES users (id) ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE projects OWNER TO aamks;
GRANT ALL ON TABLE projects TO aamks;
GRANT ALL ON SEQUENCE projects_id_seq TO aamks;


CREATE TRIGGER update_modified BEFORE UPDATE ON scenarios FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
ALTER TABLE scenarios ADD CONSTRAINT scenarios_project_id FOREIGN KEY (project_id) REFERENCES projects(id) ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE scenarios OWNER TO aamks;
GRANT ALL ON TABLE scenarios TO aamks;
GRANT ALL ON SEQUENCE scenarios_id_seq TO aamks;
