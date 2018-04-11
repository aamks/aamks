===================== INSTALLATION ========================

See install.sh


===================== GUI - WEB APPLICATION ========================

1. Install nodejs package and than using cmd type:
npm install @angular/cli

2. Go into gui/interface folder and type:
npm install
It will initialize/install required node_modules packages included in package.json

3. Copy required codemirror additional files to codemirror module:
cp -r node_modules/codemirror_addons/* node_modules/codemirror/
