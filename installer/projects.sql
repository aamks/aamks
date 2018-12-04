\c aamks
drop table projects;
drop table scenarios;
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
