#!/bin/bash
. vars.sh
[ $AAMKS_PG_REMOVE_ALL_AAMKS_DATA == 1 ] && { 
	psql -c "DROP DATABASE aamks";
	psql -c "DROP USER $AAMKS_PG_USER";
}
[ $AAMKS_PG_PASS == 'secret' ] && { echo "You need to change AAMKS_PG_PASS='secret' in conf.txt"; } || {

psql << EOF
CREATE database aamks;
\c aamks;

CREATE USER $AAMKS_PG_USER WITH PASSWORD '$AAMKS_PG_PASS';

CREATE TABLE simulations (
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

ALTER TABLE simulations OWNER TO $AAMKS_PG_USER;
GRANT ALL ON TABLE simulations TO $AAMKS_PG_USER;
GRANT ALL ON SEQUENCE simulations_id_seq TO $AAMKS_PG_USER;

EOF
echo;
}
