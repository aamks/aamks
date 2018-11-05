\c aamks
drop table nusers;
CREATE TABLE nusers (---{{{
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
CREATE TRIGGER update_modified BEFORE UPDATE ON nusers FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
ALTER TABLE nusers OWNER TO aamks;
GRANT ALL ON TABLE nusers TO aamks;
GRANT ALL ON SEQUENCE nusers_id_seq TO aamks;
