#!/usr/bin/env bash
#This is the instalator of for worker. Currently it works only on Linux nodes.
USER='mimooh'
AAMKS_LOCAL_WORKER=0

sudo locale-gen en_US.UTF-8
sudo apt-get update
sudo apt-get --yes install subversion python3-pip sendxmpp xdg-utils unzip cmake libgfortran3
sudo -H pip3 install --upgrade pip
sudo -H pip3 install webcolors colour shapely scipy numpy

cd /usr/local/
sudo svn co https://github.com/aamks/aamks.git
sudo ln -sf /usr/local/aamks.git/trunk /usr/local/aamks
sudo chown -R $USER:$USER /usr/local/aamks.git

cd /usr/local/aamks/installer

echo "Installing RVO2..."
echo; echo;

sudo -H pip3 install Cython
svn co https://github.com/sybrenstuvel/Python-RVO2.git
cd Python-RVO2.git/trunk
python3 setup.py build
sudo python3 setup.py install


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
python3 setup.py install

