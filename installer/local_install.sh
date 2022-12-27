#!/bin/bash
set -ueo pipefail
# u - not declared variable
# e - stop installing when exit != 0
# o - invalid | 

# Download local_config and set parameters
source local_config

USER=$(id -ru)
[ "X$USER" == "X0" ] && { echo "Don't run as root / sudo"; exit; }

if [[ ! -v PYTHONPATH ]] 
then
	PYTHONPATH="$AAMKS_PATH"
else
	PYTHONPATH="${PYTHONPATH}:$AAMKS_PATH"
fi
echo "This is the default Aamks configuration that can be modified in local_config or later in /etc/apache2/envvars."
echo "If you use PYTHONPATH in /etc/apache2/envvars make sure we haven't broken it."
echo; echo;
echo "AAMKS_SERVER: $AAMKS_SERVER"
echo "AAMKS_PATH: $AAMKS_PATH"
echo "AAMKS_PROJECT: $AAMKS_PROJECT"
echo "AAMKS_PG_PASS: $AAMKS_PG_PASS"
echo "AAMKS_WORKER: $AAMKS_WORKER"
echo "AAMKS_SALT: $AAMKS_SALT"
echo "AAMKS_USE_GMAIL: $AAMKS_USE_GMAIL"
echo "AAMKS_GMAIL_USERNAME: $AAMKS_GMAIL_USERNAME"
echo "AAMKS_GMAIL_PASSWORD: $AAMKS_GMAIL_PASSWORD"
echo "PYTHONPATH: $PYTHONPATH"
echo; echo;
echo "<Enter> accepts, <ctrl+c> cancels"
sudo locale-gen en_US.UTF-8
sudo apt-get update
sudo apt-get --yes install git python3-pip xdg-utils unzip cmake ipython3 python3-urllib3 libboost-python-dev libgfortran5
sudo apt-get --yes install postgresql subversion python3-psycopg2 apache2 php-pgsql pdf2svg libapache2-mod-php 
sudo -H pip3 install --upgrade pip
sudo -H pip3 install shapely scipy numpy Cython webcolors pyhull colour sns seaborn statsmodels
if [ ! -f /usr/lib/x86_64-linux-gnu/libboost_python3.so  ]; then
	sudo ln -s /usr/lib/x86_64-linux-gnu/libboost_python3*.so /usr/lib/x86_64-linux-gnu/libboost_python3.so
fi
echo "{ \"AAMKS_SERVER\": \"$AAMKS_SERVER\" }"  | sudo tee /etc/aamksconf.json
sudo chown -R "$USER":"$USER" /etc/aamksconf.json

echo "Check if aamks is download in /home/USER directory..."
cd || exit
[ -d aamks ] || { git clone https://github.com/aamks/aamks; }

# clear $AAMKS_PATH if there is already any content
if [ -d "$AAMKS_PATH" ]; then
	sudo rm -r "$AAMKS_PATH"
	sudo mv aamks "$AAMKS_PATH"
else
	sudo mv aamks "$AAMKS_PATH"
fi

sudo chown -R "$USER":"$USER" "$AAMKS_PATH"

# RVO2
pip list | grep pyrvo2
if [ $? -ne 0 ];then 
	echo "pyrvo2 installed"
else
	echo; echo; echo "Installing RVO2 (agents collisions library) ..."; echo; echo;
	[ -d Python-RVO2 ] && { git -C Python-RVO2 pull; } || { git clone https://github.com/sybrenstuvel/Python-RVO2; }
	cd Python-RVO2 || exit
	echo "Build RVO2..."
	python3 setup.py build
	echo
	echo "Build RVO2 exit code - " $? 
	echo "Installing RVO2..."
	sudo python3 setup.py install
	echo
	echo "Installing RVO2 exit code - " $?
fi
cd || exit

# recast
if [ -f /usr/local/bin/recast ]; then
	echo "recast installed"
else 
	wget https://golang.org/dl/go1.15.1.linux-amd64.tar.gz
	if [ $? -ne 0 ]; then
		echo "Golang download failure - check your network connection"
		exit
	fi
	sudo tar -C /usr/local -xzf go1.15.1.linux-amd64.tar.gz
	echo
	echo "Extracting go exit code - " $? 
	sudo rm go1.15.1.linux-amd64.tar.gz
	echo "PATH=\"/usr/local/go/bin:\$PATH\"" >> ~/.profile
	export PATH=$PATH:/usr/local/go/bin
	echo; echo; echo "Installing recast (path finding library, navmesh producer)..."; echo; echo;
	cd || exit
	go get -u github.com/arl/go-detour/cmd/recast
	if [ $? -ne 0 ]; then
		echo "go get -u...  failure"
		exit
	fi
	[ -f ~/go/bin/recast ] || {
			echo " ~/go/bin/recast is missing. It is likely that your golang version is obsolete.";
	echo "Perhaps the below commands can fix golang. Once you have fixed golang, you can rerun the installer.
	sudo add-apt-repository ppa:longsleep/golang-backports
	sudo apt update
	sudo apt install golang-go";exit; }

	sudo mv ~/go/bin/recast /usr/local/bin
	echo "Recast should be now installed"

	# detour
	echo; echo; echo "Installing detour (path finding library, navmesh navigator) ..."; echo; echo;
	cd || exit
	[ -d recastlib ] && { git -C recastlib pull; } || { git clone https://github.com/layzerar/recastlib.git; }
	cd recastlib || exit
	cp -rf ./Recast\(Patched\)/Detour/ ./Recast/
	sudo python3 setup.py install
	if [ $? -ne 0 ]; then
		echo "python3 setup.py install... Detour install failure"
		exit
	fi
fi
# mkdir if there is not any
if [ ! -d  /home/aamks_users ]; then
	sudo mkdir /home/aamks_users
fi

sudo chmod 777 /home/aamks_users
sudo mkdir -p /var/www/ssl/
sudo ln -sf "$AAMKS_PATH"/gui /var/www/ssl/aamks

# www-data user needs AAMKS_PG_PASS"
temp=$(mktemp)
sudo cat /etc/apache2/envvars | grep -v AAMKS_ | grep -v umask | grep -v PYTHONPATH > "$temp"
echo "umask 0002" >> "$temp"
echo "export AAMKS_SERVER='$AAMKS_SERVER'" >> "$temp"
echo "export AAMKS_PATH='$AAMKS_PATH'" >> "$temp"
echo "export AAMKS_WORKER='$AAMKS_WORKER'" >> "$temp"
echo "export AAMKS_PG_PASS='$AAMKS_PG_PASS'" >> "$temp"
echo "export AAMKS_SALT='$AAMKS_SALT'" >> "$temp"
echo "export AAMKS_USE_GMAIL='$AAMKS_USE_GMAIL'" >> "$temp"
echo "export AAMKS_GMAIL_USERNAME='$AAMKS_GMAIL_USERNAME'" >> "$temp"
echo "export AAMKS_GMAIL_PASSWORD='$AAMKS_GMAIL_PASSWORD'" >> "$temp"
echo "export PYTHONPATH='$PYTHONPATH'" >> "$temp"
sudo cp "$temp" /etc/apache2/envvars
rm "$temp"

temp=$(mktemp)
sudo cat ~/.bashrc | grep -v AAMKS_ | grep -v umask  | grep -v USER | grep -v LOGNAME | grep -v HOSTNAME > "$temp"
echo "umask 0002" >> "$temp"
echo "export AAMKS_SERVER='$AAMKS_SERVER'" >> "$temp"
echo "export AAMKS_PATH='$AAMKS_PATH'" >> "$temp"
echo "export AAMKS_WORKER='$AAMKS_WORKER'" >> "$temp"
echo "export AAMKS_PG_PASS='$AAMKS_PG_PASS'" >> "$temp"
echo "export AAMKS_SALT='$AAMKS_SALT'" >> "$temp"
echo "export AAMKS_USE_GMAIL='$AAMKS_USE_GMAIL'" >> "$temp"
echo "export AAMKS_GMAIL_USERNAME='$AAMKS_GMAIL_USERNAME'" >> "$temp"
echo "export AAMKS_GMAIL_PASSWORD='$AAMKS_GMAIL_PASSWORD'" >> "$temp"
echo "export PYTHONPATH='$PYTHONPATH'" >> "$temp"
echo "export PYTHONIOENCODING='UTF-8'" >> "$temp"
echo "export AAMKS_PROJECT='$AAMKS_PROJECT'" >> "$temp"
echo "export AAMKS_USER_ID=1" >> "$temp"
echo "export AAMKS_USE_GEARMAN=0" >> "$temp"
echo "export USER='$(id -un)'" >> "$temp"
echo "export USERNAME='$(id -un)'" >> "$temp"
echo "export LOGNAME='$(id -un)'" >> "$temp"
echo "export HOSTNAME='$HOSTNAME'" >> "$temp"
echo "alias aamks='cd /usr/local/aamks/'" >> "$temp"
echo "alias aamks.manager='cd /usr/local/aamks/manager; python3 manager.py'" >> "$temp"
echo "alias AA='cd /usr/local/aamks/; python3 aamks.py; cd $AAMKS_PROJECT/workers;'" >> "$temp"
echo "alias AP='cd $AAMKS_PROJECT'" >> "$temp"

echo "Add some variables to your .bashrc"
sudo cp "$temp" ~/.bashrc
rm "$temp"

echo; echo; echo  "sudo service apache2 restart..."
sudo service apache2 restart

if [ ! -d  "$AAMKS_PROJECT" ]; then
	sudo mkdir -p "$AAMKS_PROJECT"
fi
sudo cp -r "$AAMKS_PATH"/installer/demo /home/aamks_users/demo@aamks/

# From now on, each file written to /home/aamks_users will belong to www-data group.
sudo usermod -a -G www-data $USERNAME
sudo chown -R $USERNAME:www-data /home/aamks_users
sudo chmod -R g+w /home/aamks_users
sudo chmod -R g+s /home/aamks_users
sudo ln -sf /home/aamks_users /var/www/ssl/
sudo find /home/aamks_users -type f -exec chmod 664 {} \;

cd "/usr/local/aamks/installer" || exit;
sudo -u postgres psql -tc "SELECT 1 FROM pg_database WHERE datname = 'aamks'" | grep -q 1 || sudo -u postgres psql -c "CREATE DATABASE aamks"
sudo -u postgres psql -tc "SELECT 1 FROM pg_user WHERE usename = 'aamks'" | grep -q 1 || psql -U postgres -c "CREATE USER aamks WITH PASSWORD '$AAMKS_PG_PASS'";
sudo -u postgres psql -f sql.sql

# Generate database tables 
bash play.sh

# These commands are for quick setup of SSL on :your computer. You should really configure SSL for your site."
sudo a2enmod ssl
sudo a2ensite default-ssl.conf
sudo sed -i 's/DocumentRoot \/var\/www\/html/DocumentRoot \/var\/www\/ssl/' /etc/apache2/sites-available/000-default.conf
sudo systemctl restart apache2
echo "AAMKS installed successfully. You can start using it at http://127.0.0.1/aamks"
echo "Logout and Login to reload USER group settings"
