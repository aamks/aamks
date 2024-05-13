#!/bin/bash
# Download config and set parameters
source config

if [[ ! -v PYTHONPATH ]] 
then
	PYTHONPATH="$AAMKS_PATH"
else
	PYTHONPATH="$PYTHONPATH:$AAMKS_PATH"
fi

[ -d $AAMKS_PATH ] || { echo "$AAMKS_PATH does not exist. Run 'bash worker_install.sh' first. Exiting"; exit;  }
echo
echo "This is the default Aamks configuration that can be modified in /config or later in /etc/apache2/envvars."
echo "If you use PYTHONPATH in /etc/apache2/envvars make sure we haven't broken it."
echo; echo;
echo "AAMKS_SERVER: $AAMKS_SERVER"
echo "AAMKS_PATH: $AAMKS_PATH"
echo "AAMKS_PROJECT: $AAMKS_PROJECT"
echo "AAMKS_PG_PASS: $AAMKS_PG_PASS"
echo "AAMKS_REDIS_PASS: $AAMKS_REDIS_PASS"
echo "AAMKS_WORKER: $AAMKS_WORKER"
echo "AAMKS_SALT: $AAMKS_SALT"
echo "AAMKS_USE_MAIL: $AAMKS_USE_MAIL"
echo "AAMKS_MAIL_API_KEY: $AAMKS_MAIL_API_KEY"
echo "AAMKS_MAIL_SENDER: $AAMKS_MAIL_SENDER"
echo "PYTHONPATH: $PYTHONPATH"
echo; echo;
echo "<Enter> accepts, <ctrl+c> cancels"
read


sudo -u postgres psql -lqt | cut -d \| -f 1 | grep -qw 'aamks' && { 
	echo "Aamks already exists in psql. Do you wish to remove Aamks database?";
	echo; echo;
	echo 'sudo -u postgres psql -c "DROP DATABASE aamks"'
	echo 'sudo -u postgres psql -c "DROP USER aamks"' 
	echo; echo;
	echo "<Enter> accepts, <ctrl+c> cancels"
	read
	sudo -u postgres psql -c "DROP DATABASE aamks"
	sudo -u postgres psql -c "DROP USER aamks" 

	# [ $AAMKS_PG_PASS == 'secret' ] && { 
	# 	echo "Password for aamks psql user needs to be changed from the default='secret'. It must match the AAMKS_PG_PASS in your ~/.bashrc."; 
	# 	echo
	# 	exit;
	# } 
} 

[ "X$AAMKS_WORKER" == "Xgearman" ] && { 
	# Buggy gearman hasn't been respecting /etc/ for ages now. Therefore we act directly on the /lib
	# Normally we would go with:
	# echo "PARAMS=\"--listen=$AAMKS_SERVER\"" | sudo tee /etc/default/gearman-job-server
	sudo apt-get --yes install gearman
	echo; echo;
	echo "Gearmand (job server) will be configured to --listen on all interfaces (0.0.0.0) or whatever else you wish."
	echo "Gearmand has no authorization mechanisms and its the responsibility of the users to secure the environment."
	echo "One idea is a firewall rule, that only workers are allowed to connect to 0.0.0.0:4730."
	echo "Another idea is to have the whole Aamks environment (srv + workers) inside a secured LAN."
	echo "Yet another idea is to listen on the secure 127.0.0.1:4730."
	echo "You may want to edit /lib/systemd/system/gearman-job-server.service youself after this setup completes."
	echo; echo;
	cat /lib/systemd/system/gearman-job-server.service
	echo; echo;
	echo "<Enter> accepts to change to --listen=0.0.0.0, <ctrl+c> cancels"
	read
	echo; echo;
	
	cat << EOF | sudo tee /lib/systemd/system/gearman-job-server.service
[Unit]
Description=gearman job control server

[Service]
ExecStartPre=/usr/bin/install -d -o gearman /run/gearman
PermissionsStartOnly=true
User=gearman
Restart=always
PIDFile=/run/gearman/server.pid
ExecStart=/usr/sbin/gearmand --listen=0.0.0.0 --pid-file=/run/gearman/server.pid --log-file=/var/log/gearman-job-server/gearman.log

[Install]
WantedBy=multi-user.target
EOF
	echo; echo;
	sudo systemctl daemon-reload
	sudo systemctl restart gearman-job-server.service
	echo; echo;
	echo "The line below should be showing gearmand --listen=0.0.0.0"
	echo; echo;
	sudo ps auxw | grep gearman | grep listen
	echo; echo;
	echo "<Enter>"
	read

}

[ "X$AAMKS_WORKER" == "Xredis" ] && { 
	sudo apt-get --yes php-redis
}



sudo mkdir -p /var/www/ssl/
sudo rm -rf /var/www/ssl/aamks 
sudo ln -sf $AAMKS_PATH/gui /var/www/ssl/aamks

USER=$(id -ru)
USERNAME=$(id -nu)
[ "X$USER" == "X0" ] && { echo "Don't run as root / sudo"; exit; }

sudo locale-gen en_US.UTF-8
sudo apt-get update 
sudo apt-get --yes install postgresql subversion python3-psycopg2 xdg-utils apache2 software-properties-common php-redis
sudo add-apt-repository --yes ppa:deadsnakes/ppa
sudo apt-get --yes install python3.10 python3.10-venv php-pgsql pdf2svg unzip libapache2-mod-php docker-compose
sudo apt-get --yes install latexmk texlive-latex-extra

# www-data user needs AAMKS_PG_PASS
temp=`mktemp`
sudo cat /etc/apache2/envvars | grep -v AAMKS_ | grep -v umask | grep -v PYTHONPATH > "$temp"
echo "umask 0000" >> $temp
echo "export AAMKS_SERVER='$AAMKS_SERVER'" >> $temp
echo "export AAMKS_PATH='$AAMKS_PATH'" >> $temp
echo "export AAMKS_WORKER='$AAMKS_WORKER'" >> $temp
echo "export AAMKS_PG_PASS='$AAMKS_PG_PASS'" >> $temp
echo "export AAMKS_REDIS_PASS='$AAMKS_REDIS_PASS'" >> $temp
echo "export AAMKS_SALT='$AAMKS_SALT'" >> $temp
echo "export AAMKS_USE_MAIL='$AAMKS_USE_MAIL'" >> $temp
echo "export AAMKS_MAIL_API_KEY='$AAMKS_MAIL_API_KEY'" >> $temp
echo "export AAMKS_MAIL_SENDER='$AAMKS_MAIL_SENDER'" >> $temp
echo "export PYTHONPATH='$PYTHONPATH'" >> $temp
sudo cp $temp /etc/apache2/envvars

echo; echo; echo  "sudo service apache2 restart..."
sudo service apache2 restart
rm $temp

temp=$(mktemp)
sudo cat ~/.bashrc | grep -v AAMKS_ | grep -v umask  | grep -v USER | grep -v LOGNAME | grep -v HOSTNAME | grep -v aamks | grep -vw AA | grep -vw AP > "$temp"
echo "umask 0000" >> "$temp"
echo "export AAMKS_SERVER='$AAMKS_SERVER'" >> "$temp"
echo "export AAMKS_PATH='$AAMKS_PATH'" >> "$temp"
echo "export AAMKS_WORKER='$AAMKS_WORKER'" >> "$temp"
echo "export AAMKS_PG_PASS='$AAMKS_PG_PASS'" >> "$temp"
echo "export AAMKS_REDIS_PASS='$AAMKS_REDIS_PASS'" >> "$temp"
echo "export AAMKS_SALT='$AAMKS_SALT'" >> "$temp"
echo "export AAMKS_USE_MAIL='$AAMKS_USE_MAIL'" >> "$temp"
echo "export AAMKS_MAIL_API_KEY='$AAMKS_MAIL_API_KEY'" >> "$temp"
echo "export AAMKS_MAIL_SENDER='$AAMKS_MAIL_SENDER'" >> "$temp" 
echo "export PYTHONPATH='$PYTHONPATH'" >> "$temp"
echo "export PYTHONIOENCODING='UTF-8'" >> "$temp"
echo "export AAMKS_PROJECT='$AAMKS_PROJECT'" >> "$temp"
echo "export AAMKS_USER_ID=1" >> "$temp"
echo "export AAMKS_USE_GEARMAN=0" >> "$temp"
echo "export USER='$USER'" >> "$temp"
echo "export USERNAME='$USERNAME'" >> "$temp"
echo "export LOGNAME='$(id -un)'" >> "$temp"
echo "export HOSTNAME='$HOSTNAME'" >> "$temp"
echo "alias aamks='cd /usr/local/aamks/'" >> "$temp"
echo "alias aamks.manager='/usr/local/aamks/env/bin/python3 /usr/local/aamks/redis_aamks/manager.py'" >> "$temp"
echo "alias AA='cd /usr/local/aamks/; env/bin/python3 aamks.py; cd $AAMKS_PROJECT/workers;'" >> "$temp"
echo "alias AP='cd $AAMKS_PROJECT'" >> "$temp"

echo "Add some variables to your .bashrc"
sudo cp "$temp" ~/.bashrc
rm "$temp"

sudo groupadd docker
sudo usermod -a -G docker $USERNAME
cd "$AAMKS_PATH"/redis_aamks || exit
sudo docker-compose up -d

sudo mkdir -p "$AAMKS_PROJECT"
sudo cp -r $AAMKS_PATH/installer/demo /home/aamks_users/demo@aamks/
sudo cp -r $AAMKS_PATH/installer/aamksconf.json /etc/
sudo chown -R $USER:$USER /etc/aamksconf.json


[ "X$AAMKS_USE_MAIL" == "X1" ] && { 
	# TODO - instructables for sending mail
	sudo apt-get --yes install composer
	cd $AAMKS_PATH/gui
	composer install
}

# From now on, each file written to /home/aamks_users will belong to www-data group.
# Solves the problem of shell users vs www-data user permissions of new files.
# But you need to take care of shell users yourself: add them to www-data group in /etc/group.
sudo chown -R $USER:www-data /home/aamks_users
sudo chmod -R g+w /home/aamks_users
sudo chmod -R g+s /home/aamks_users
sudo find /home/aamks_users -type f -exec chmod 664 {} \;

sudo -u postgres psql -c 'DROP USER aamks' 2>/dev/null
sudo -u postgres psql -c 'CREATE DATABASE aamks' 2>/dev/null
sudo -u postgres psql -c "CREATE USER aamks WITH PASSWORD '$AAMKS_PG_PASS'";
sudo -u postgres psql -f sql.sql
bash play.sh

echo; echo;
sudo a2enmod ssl
sudo a2ensite default-ssl.conf
sudo sed -i 's/DocumentRoot \/var\/www\/html/DocumentRoot \/var\/www\/ssl/' /etc/apache2/sites-available/000-default.conf
sudo systemctl restart apache2
echo; echo; echo;
echo "AAMKS installed successfully. You can start using it at $AAMKS_SERVER/aamks"
echo "Default user email: demo@aamks"
echo "Password: AAMKSisthe1!"
echo "In order to run simulations in redis mode configure workers in network or start worker via redis manager.";
echo "Add the following line to postgres pg_hba.conf to configure database"
echo "host	aamks	all 	0.0.0.0/0 	md5"
echo "You can find location of configuration file below:"
locate pg_hba.conf 
echo "You can start redis server and worker via command:"
echo "$AAMKS_PATH/env/bin/python3 $AAMKS_PATH/redis_aamks/manager.py --serverstart"
echo "$AAMKS_PATH/env/bin/python3 $AAMKS_PATH/redis_aamks/manager.py --runlocal -n 1"
echo "Log out and log in to reload USER group settings"