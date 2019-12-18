#!/usr/bin/env bash
# This is the installer of the worker. 

update() { #{{{
	[ -z $_AAMKS_PATH ] || [ -z $_AAMKS_SERVER ] && { print_help; }
	[ -d $_AAMKS_PATH ] || { install; }
	echo
	git -C $_AAMKS_PATH pull -q
	sudo rm -rf /etc/aamksconf.json
	hostname
	echo "{ \"AAMKS_SERVER\": \"$_AAMKS_SERVER\" }"  | sudo tee /etc/aamksconf.json
	echo 
}
#}}}
install() { #{{{
	cd
	[ -z $_AAMKS_PATH ] || [ -z $_AAMKS_SERVER ] && { print_help; }
	rm -rf $_AAMKS_PATH 
	sudo locale-gen en_US.UTF-8
	sudo apt-get update
	sudo apt-get --yes install git python3-pip xdg-utils unzip cmake gearman ipython3 python3-urllib3 golang libboost-python-dev
	sudo -H pip3 install --upgrade pip
	sudo -H pip3 install shapely scipy numpy Cython
	sudo rm -rf /etc/aamksconf.json
	echo "{ \"AAMKS_SERVER\": \"$_AAMKS_SERVER\" }"  | sudo tee /etc/aamksconf.json
	git clone https://github.com/aamks/aamks
	sudo mv aamks $_AAMKS_PATH
	sudo chown -R $USER:$USER $_AAMKS_PATH

	echo; echo; echo "Installing RVO2 (agents collisions library) ..."; echo; echo;
	cd
	[ -d Python-RVO2 ] && { git -C Python-RVO2 pull; } || { git clone https://github.com/sybrenstuvel/Python-RVO2; }
	cd Python-RVO2
	python3 setup.py build
	sudo python3 setup.py install
	cd

	# recast
	echo; echo; echo "Installing recast (path finding library)..."; echo; echo;
	cd
	go get -u github.com/arl/go-detour/cmd/recast
	sudo mv ~/go/bin/recast /usr/local/bin
	echo "Recast should be now installed"

	# detour
	echo; echo; echo "Installing detour (path finding library) ..."; echo; echo;
	cd
	[ -d recastlib ] && { git -C recastlib pull; } || { git clone https://github.com/layzerar/recastlib.git; }
	cd recastlib
	cp -rf ./Recast\(Patched\)/Detour/ ./Recast/
	sudo python3 setup.py install
}
#}}}
print_help() { #{{{
	cat << EOF

	Worker installer options:
	-p   AAMKS_PATH (e.g. /usr/local/aamks, Aamks will be installed there on the worker)
	-s   AAMKS_SERVER (e.g. 127.0.0.1, the worker will expect the Aamks server there)
	-i   install worker from github
	-u   update/inspect worker
	-h   this help;

EOF
	exit
} #}}}
while getopts "p:s:iuh" opt #{{{
do
case $opt in
	p) _AAMKS_PATH=$OPTARG;;
	s) _AAMKS_SERVER=$OPTARG;;
	i) install;;
	u) update;;
	h) print_help;;
esac
done
#}}}

[ -z $_AAMKS_PATH ] || [ -z $_AAMKS_SERVER ] && { print_help; }
