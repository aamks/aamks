===================== POSTGRES ========================

One Aamks project typically consists of hundreds of montecarlo simulations. 
Postgres is used for collecting the input and output of each simulation.
The script create.sh will create the complete database.

1. vim vars.sh
2. bash create.sh

===================== NOTIFICATIONS ========================

The AAMKS_MESSENGER is for gearman and other notifications. These localhost
mailservers are troublesome, therefore the user must provide something himself.
The include.py tries to deliver messages based on this schema:

AAMKS_MESSENGER="mutt -s 'aamks' you@gmail.com" # in bashrc
Popen("printf '{}' | {}".format(msg, os.environ['AAMKS_MESSENGER']), shell=True)
    
    which results in:

prinf 'some message' | mutt -s 'aamks' you@gmail.com

===================== BASHRC ========================

You should setup (modify) these in ~/.bashrc: 

AAMKS_MESSENGER="mutt -s 'aamks' you@gmail.com"
AAMKS_TESTING=0
AAMKS_PATH=/usr/local/aamks
AAMKS_SERVER=127.0.0.1
AAMKS_USE_GEARMAN=1
AAMKS_PG_PASS=secret
