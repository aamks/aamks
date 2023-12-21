#!/usr/bin/env bash
# This is the installer of the worker. 

[ -z $_AAMKS_PATH ] &&  { _AAMKS_PATH="/usr/local/aamks"; }
[ -z $_AAMKS_SERVER] && { _AAMKS_SERVER="192.168.0.10"; }
[ -z $_AAMKS_WORKER] && { _AAMKS_WORKER="redis"; }

update() { #{{{
	[ -d $_AAMKS_PATH ] || { install; }
	cd $_AAMKS_PATH || exit
	git switch dev
	git pull
	sudo rm -rf /etc/aamksconf.json
	hostname
	echo "{ \"AAMKS_SERVER\": \"$_AAMKS_SERVER\" }"  | sudo tee /etc/aamksconf.json
	echo 
}
#}}}
install() { #{{{
	cd
	rm -rf $_AAMKS_PATH 
	sudo locale-gen en_US.UTF-8
	sudo apt-get update
	sudo apt-get --yes install git unzip software-properties-common
	sudo add-apt-repository ppa:deadsnakes/ppa
	sudo apt-get --yes install python3.10 python3.10-venv 
	sudo rm -rf /etc/aamksconf.json
	echo "{ \"AAMKS_SERVER\": \"$_AAMKS_SERVER\" }"  | sudo tee /etc/aamksconf.json
	sudo git clone https://github.com/aamks/aamks $_AAMKS_PATH
	sudo chown -R $USER:$USER $_AAMKS_PATH
	cd $_AAMKS_PATH || exit
	git switch dev
	python3.10 -m venv env
	env/bin/pip install -r requirements.txt
	[ "X$AAMKS_WORKER" == "Xgearman" ] && { 
		sudo mkdir /home/aamks_users
		sudo chmod 777 /home/aamks_users
	}
	
}
#}}}
print_help() { #{{{
	cat << EOF

Worker installer options:
    -i   fresh worker install from github
    -p   AAMKS_PATH (Aamks will be installed there on the worker)
    -s   AAMKS_SERVER (the worker will expect the Aamks server there)
    -u   update/inspect worker
    -h   this help;

EOF
info
	exit
} #}}}
info() { #{{{
	echo
	echo "AAMKS_PATH: $_AAMKS_PATH"
	echo "AAMKS_SERVER: $_AAMKS_SERVER"
	echo "AAMKS_WORKER: $_AAMKS_WORKER"
	echo
}
#}}}
while getopts "p:s:w:iuh" opt #{{{
do
case $opt in
	p) _AAMKS_PATH=$OPTARG;;
	s) _AAMKS_SERVER=$OPTARG;;
	w) _AAMKS_WORKER=$OPTARG;;
	i) info; echo "Clear and install fresh Aamks worker from github. OK? Ctrl+c to cancel."; read; install; exit;;
	u) info; update; exit;;
esac
done
#}}}
print_help

