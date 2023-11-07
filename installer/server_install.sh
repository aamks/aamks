#!/bin/bash

# Configure until the END OF CONFIGURATION. Then run bash server_install.sh.
# All the configuration may be later tweaked in:
# ~/.bashrc
# /etc/aamksconf.json
# /etc/apache2/envvars

# Aamks uses postgres (user:aamks, db:aamks) for collecting the simulations data.

# By convention users dirs are as follows:
# /home/aamks_users/user1@gmail.com
# /home/aamks_users/user2@hotmail.com
# ...

# By convention aamks GUI must reside under /var/www/ssl/aamks
# and will be accessed via https://your.host.abc/aamks

AAMKS_SERVER=10.8.47.50									# gearman + www for workers
AAMKS_PATH='/usr/local/aamks'								
AAMKS_PROJECT="/home/aamks_users/demo@aamks/demo/simple" 
AAMKS_PG_PASS='hulakula' 
AAMKS_REDIS_PASS = 'hulakula'
AAMKS_WORKER='gearman'										# 'none': no worker, don't run fire and evacuation simulations | 'local': worker and server on same machine | 'gearman': dispatch simulations over a network (grid/cluster environment)
AAMKS_SALT='aamksisthebest'
AAMKS_USE_MAIL=0											# needed if we allow users to register accounts
AAMKS_MAIL_API_KEY='none'									# needed if we allow users to register accounts
AAMKS_MAIL_SENDER='none'									# needed if we allow users to register accounts
PYTHONPATH="${PYTHONPATH}:$AAMKS_PATH"
# END OF CONFIGURATION

[ -d $AAMKS_PATH ] || { echo "$AAMKS_PATH does not exist. Run 'bash worker_install.sh' first. Exiting"; exit;  }
echo
echo "This is the default Aamks configuration that can be modified in server_install.sh or later in /etc/apache2/envvars."
echo "If you use PYTHONPATH in /etc/apache2/envvars make sure we haven't broken it."
echo; echo;
echo "AAMKS_SERVER: $AAMKS_SERVER"
echo "AAMKS_PATH: $AAMKS_PATH"
echo "AAMKS_PROJECT: $AAMKS_PROJECT"
echo "AAMKS_PG_PASS: $AAMKS_PG_PASS"
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




sudo mkdir -p /var/www/ssl/
sudo rm -rf /var/www/ssl/aamks 
sudo ln -sf $AAMKS_PATH/gui /var/www/ssl/aamks

USER=`id -ru`
[ "X$USER" == "X0" ] && { echo "Don't run as root / sudo"; exit; }

sudo locale-gen en_US.UTF-8
sudo apt-get update 
sudo apt-get --yes install postgresql subversion python3-pip python3-psycopg2 xdg-utils apache2 php-pgsql pdf2svg unzip libapache2-mod-php 
sudo -H pip3 install webcolors pyhull colour shapely scipy numpy sns seaborn statsmodels # TODO: do we need these in master? PyQt5 ete3 sklearn. pip fails at PyQt5.
#sudo -H pip3 install webcolors pyhull colour shapely scipy numpy sns seaborn statsmodels PyQt5 ete3 sklearn


# www-data user needs AAMKS_PG_PASS
temp=`mktemp`
sudo cat /etc/apache2/envvars | grep -v AAMKS_ | grep -v umask > $temp
echo "umask 0002" >> $temp
echo "export AAMKS_SERVER='$AAMKS_SERVER'" >> $temp
echo "export AAMKS_PATH='$AAMKS_PATH'" >> $temp
echo "export AAMKS_WORKER='$AAMKS_WORKER'" >> $temp
echo "export AAMKS_PG_PASS='$AAMKS_PG_PASS'" >> $temp
echo "export AAMKS_SALT='$AAMKS_SALT'" >> $temp
echo "export AAMKS_USE_MAIL='$AAMKS_USE_MAIL'" >> $temp
echo "export AAMKS_MAIL_API_KEY='$AAMKS_MAIL_API_KEY'" >> $temp
echo "export AAMKS_MAIL_SENDER='$AAMKS_MAIL_SENDER'" >> $temp
echo "export PYTHONPATH='$PYTHONPATH'" >> $temp
sudo cp $temp /etc/apache2/envvars

echo "umask 0002" >> $temp


echo; echo; echo  "sudo service apache2 restart..."
sudo service apache2 restart
rm $temp

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

echo
echo "You may use these commands for some quick setup of SSL on the localhost. But you should really configure SSL for your site."
echo "sudo a2enmod ssl"
echo "sudo a2ensite default-ssl.conf"
echo "sudo systemctl restart apache2"
echo "/var/www/ssl must be your Apache DocumentRoot or a link to your Apache DocumentRoot."
echo "That means /var/www/ssl/aamks must be served at http://127.0.0.1/aamks"
echo 
echo 
echo "Inspecting /etc/apache2/sites-available/000-default.conf for your DocumentRoot"
echo "Already DocumentRoot is set to: "
cat /etc/apache2/sites-available/000-default.conf  | grep -i DocumentRoot

