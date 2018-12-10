# We use two separate tools for navmesh:
# * navmesh creation (recast): https://github.com/arl/go-detour/cmd/recast
# * navmesh queries (detour):  https://github.com/layzerar/recastlib.git

# Here we try to automatically install both. 
# If anything fails, you need to figure it out yourself
# Aamks expects /usr/local/bin/recast and the detour under /usr/local/lib/pythonXX

# recast
sudo apt-get install golang
go get -u github.com/arl/go-detour/cmd/recast
sudo mv ~/go/bin/recast /usr/local/bin

# detour
sudo apt-get install libboost-python-dev
git clone https://github.com/layzerar/recastlib.git
cd recastlib
cp -rf ./Recast\(Patched\)/Detour/ ./Recast/
python3 setup.py install
