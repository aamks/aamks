===================== POSTGRES ========================

One Aamks project typically consists of hundreds of montecarlo simulations. 
Postgres is used for collecting the input and output of each simulation.
The script create.sh will create the complete database.

1. vim vars.sh
2. bash create.sh

===================== NOTIFICATIONS ========================

! aamks manager needs to be restarted in order to reread ~/.bashrc !

AAMKS_NOTIFY is for gearman and other notifications. Emails notifications are
troublesome (local maileserver? / spam / google's authorizations) therefore we
notify via jabber. Just install xabber or other client on your smarphone / your
desktop. AAMKS_NOTIFY is a json object:

AAMKS_NOTIFY='[[ "you@xabber.com", "password1" ], [ "someone@jabber.at", "password2" ]]'


===================== BASHRC ========================

You should setup these variables in ~/.bashrc: 

AAMKS_NOTIFY='[[ "you@xabber.com", "password1" ], [ "someone@jabber.at", "password2" ]]'
AAMKS_TESTING=0
AAMKS_PATH=/usr/local/aamks
AAMKS_SERVER=127.0.0.1
AAMKS_USE_GEARMAN=1
AAMKS_PG_PASS=secret
