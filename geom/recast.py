wajig install libboost-python-dev
git clone https://github.com/layzerar/recastlib.git
cd recastlib
cp -rf ./Recast\(Patched\)/Detour/ ./Recast/
sed -i "s/libraries += .'boost_python3'./libraries += ['boost_python-py35']/" setup.py
python3 setup.py install
cd examples && python simpletest.py
