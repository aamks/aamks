#!/usr/bin/env bash
# This is the installer of the worker. 

sudo locale-gen en_US.UTF-8
sudo apt-get update
sudo apt-get --yes install python3-pip xdg-utils unzip cmake gearman
sudo -H pip3 install --upgrade pip
sudo -H pip3 install webcolors colour shapely scipy numpy Cython


[ -d /usr/local/aamks ] && { 
    cd /usr/local/aamks; 
    git pull; 
} || { 
    git clone https://github.com/aamks/aamks;
    sudo rm -rf /usr/local/aamks/; 
    sudo mv aamks /usr/local/aamks/; 
    sudo chown -R $USER:$USER /usr/local/aamks; 
}

cd /usr/local/aamks/installer
cd

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
echo; echo;
go version
echo "If the above go version < 1.10 then you need to upgrade it yourself"
echo "This might work for you"
echo "sudo add-apt-repository ppa:gophers/archive"
echo "sudo apt-get update"
echo "sudo apt-get install golang-1.10-go"
echo ""
echo 'Then add to ~/.bashrc:' 
echo 'export PATH="$PATH:/usr/lib/go-1.10/bin"'

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

