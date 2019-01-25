#!/bin/bash

# Configure until the END OF CONFIGURATION. Then run bash install.sh.
# All CONFIGURATION variables must be written here and in your ~/.bashrc.

# Aamks uses postgres (user:aamks, db:aamks) for collecting the simulations data.

# AAMKS_NOTIFY is for gearman and other notifications. Emails notifications are
# troublesome (local maileserver? / spam / google's authorizations) therefore we
# notify via jabber. Just install xabber or other client on your smartphone /
# your desktop, create your jabber account and make sure it works. Aamks may send
# you some messages while it works. 

# By convention users dirs are as follows:
# /home/aamks_users/user1@gmail.com
# /home/aamks_users/user2@hotmail.com
# ...

# By convention aamks GUI must reside under /var/www/ssl/aamks
# and will be accessed via https://your.host.abc/aamks

# CONFIGURATION, must be copied to ~/.bashrc

AAMKS_SERVER=127.0.0.1
AAMKS_NOTIFY='mimooh@jabb.im, krasuski@jabb.im'
AAMKS_TESTING=0
AAMKS_USE_GEARMAN=1
AAMKS_PATH='/usr/local/aamks'
AAMKS_PROJECT="/home/aamks_users/demo@aamks/demo/demo_1" 
AAMKS_PG_PASS='hulakula' 
AAMKS_SALT='aamksisthebest'
PYTHONPATH="${PYTHONPATH}:$AAMKS_PATH"

# END OF CONFIGURATION

sudo -u postgres psql -lqt | cut -d \| -f 1 | grep -qw 'aamks' && { 
	echo "Aamks already exists in psql. You may wish to clear psql from aamks by invoking:";
	echo
	echo 'sudo -u postgres psql -c "DROP DATABASE aamks"; sudo -u postgres psql -c "DROP USER aamks"' 
	echo
	exit;
	# [ $AAMKS_PG_PASS == 'secret' ] && { 
	# 	echo "Password for aamks psql user needs to be changed from the default='secret'. It must match the AAMKS_PG_PASS in your ~/.bashrc."; 
	# 	echo
	# 	exit;
	# } 
} 

[ -d $AAMKS_PATH ] || { echo "$AAMKS_PATH does not exist. Exiting"; exit;  }

sudo mkdir -p /var/www/ssl/
sudo rm -rf /var/www/ssl/aamks 
sudo ln -sf $AAMKS_PATH/gui /var/www/ssl/aamks

USER=`id -ru`
[ "X$USER" == "X0" ] && { echo "Don't run as root / sudo"; exit; }

sudo locale-gen en_US.UTF-8
sudo apt-get update 
sudo apt-get --yes install postgresql python3-pip python3-psycopg2 gearman sendxmpp xdg-utils apache2 php-pgsql pdf2svg unzip libapache2-mod-php
sudo -H pip3 install webcolors pyhull colour shapely scipy numpy networkx

# Some quick SSL for localhost. But you should really configure SSL for your site.
# sudo a2enmod ssl
# sudo a2ensite default-ssl.conf
# sudo service apache2 reload

# www-data user needs AAMKS_PG_PASS
temp=`mktemp`
sudo cat /etc/apache2/envvars | grep -v AAMKS_ | grep -v umask > $temp
echo "umask 0002" >> $temp
echo "export AAMKS_SERVER='$AAMKS_SERVER'" >> $temp
echo "export AAMKS_PATH='$AAMKS_PATH'" >> $temp
echo "export AAMKS_NOTIFY='$AAMKS_NOTIFY'" >> $temp
echo "export AAMKS_TESTING='$AAMKS_TESTING'" >> $temp
echo "export AAMKS_USE_GEARMAN=$AAMKS_USE_GEARMAN" >> $temp
echo "export AAMKS_PG_PASS='$AAMKS_PG_PASS'" >> $temp
echo "export AAMKS_SALT='$AAMKS_SALT'" >> $temp
sudo cp $temp /etc/apache2/envvars

echo; echo; echo  "sudo service apache2 restart..."
sudo service apache2 restart
rm $temp

sudo mkdir -p "$AAMKS_PROJECT"
sudo cp -r $AAMKS_PATH/installer/examples/demo /home/aamks_users/demo@aamks/

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

echo
echo "Some quick SSL for localhost. But you should really configure SSL for your site."
echo "sudo a2enmod ssl"
echo "sudo a2ensite default-ssl.conf"
echo "sudo service apache2 reload"
echo "We normally serve https://localhost/aamks from /var/www/ssl/aamks"
echo
