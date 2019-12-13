#!/usr/bin/env bash
# This is the installer of the worker. 

update() { #{{{
	[ -z $_AAMKS_PATH ] || [ -z $_AAMKS_SERVER ] && { print_help; }
	echo
	hostname
	git -C $_AAMKS_PATH pull
	echo "{ \"AAMKS_SERVER\": \"$_AAMKS_SERVER\" }"  | sudo tee /etc/aamks.conf
	echo 
}
#}}}
install() { #{{{
	[ -z $_AAMKS_PATH ] || [ -z $_AAMKS_SERVER ] && { print_help; }
	sudo locale-gen en_US.UTF-8
	sudo apt-get update
	sudo apt-get --yes install python3-pip xdg-utils unzip cmake gearman ipython3 python3-urllib3 
	sudo -H pip3 install --upgrade pip
	sudo -H pip3 install shapely scipy numpy Cython
	echo "{ \"AAMKS_SERVER\": \"$_AAMKS_SERVER\" }"  | sudo tee /etc/aamks.conf
	echo "git clone"
	git clone https://github.com/aamks/aamks
	sudo mv aamks $_AAMKS_PATH
	sudo chown -R $USER:$USER $_AAMKS_PATH

	echo "Installing RVO2..."
	echo; echo;

	git clone https://github.com/sybrenstuvel/Python-RVO2
	cd Python-RVO2
	python3 setup.py build
	sudo python3 setup.py install
	cd


	# We use two separate tools for navmesh:
	# * navmesh creation (recast): https://github.com/arl/go-detour/cmd/recast
	# * navmesh queries (detour):  https://github.com/layzerar/recastlib.git
	
	# Here we try to automatically install both. 
	# If anything fails, you need to figure it out yourself
	# Aamks expects /usr/local/bin/recast and the detour under /usr/local/lib/pythonXX
	echo "Installing recast..."

	# recast
	export GOPATH="$HOME/go"
	which go || sudo apt-get --yes install golang git
	echo "Enter or ctrl+c"
	read

	echo; echo "Running go get -u github.com/arl/go-detour/cmd/recast..."
	go get -u github.com/arl/go-detour/cmd/recast
	sudo mv ~/go/bin/recast /usr/local/bin

	# detour
	sudo apt-get --yes install libboost-python-dev

	[ -f /usr/lib/x86_64-linux-gnu/libboost_python3.so ] || { 
		candidate=`ls /usr/lib/x86_64-linux-gnu/libboost_python-py3*so | head -n 1`
		echo 
		echo "This may be serious or not, but there's no /usr/lib/x86_64-linux-gnu/libboost_python3.so";
		echo "You probably should run:"
		echo 
		echo "sudo ln -sf $candidate /usr/lib/x86_64-linux-gnu/libboost_python3.so"
		echo
		echo "exiting"
		exit
	}

	git clone https://github.com/layzerar/recastlib.git
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
