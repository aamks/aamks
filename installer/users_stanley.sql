\c aamks
drop table users;
drop table nusers;
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
