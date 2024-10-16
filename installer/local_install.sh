#!/bin/bash
set -ueo pipefail
# u - not declared variable
# e - stop installing when exit != 0
# o - invalid | 

# Download config and set parameters
source config

USER=$(id -ru)
USERNAME=$(id -nu)
[ "X$USER" == "X0" ] && { echo "Don't run as root / sudo"; exit; }

if [[ ! -v PYTHONPATH ]] 
then
	PYTHONPATH="$AAMKS_PATH"
else
	PYTHONPATH="$PYTHONPATH:$AAMKS_PATH"
fi
echo "This is the default Aamks configuration that can be modified in local_config or later in /etc/apache2/envvars."
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
echo "AAMKS_MAIL_PASSWORD: $AAMKS_MAIL_PASSWORD"
echo "AAMKS_MAIL_SENDER: $AAMKS_MAIL_SENDER"
echo "AAMKS_DEMO: $AAMKS_DEMO"
echo "PYTHONPATH: $PYTHONPATH"
echo; echo;
echo "<Enter> accepts, <ctrl+c> cancels";
read
sudo locale-gen en_US.UTF-8
sudo apt-get update
sudo apt-get --yes install git unzip php-curl postgresql docker-compose software-properties-common php-redis
sudo add-apt-repository --yes ppa:deadsnakes/ppa
sudo apt-get --yes install subversion apache2 php-pgsql pdf2svg libapache2-mod-php python3.10 python3.10-venv
sudo apt-get --yes install latexmk texlive-latex-extra
echo "{ \"AAMKS_SERVER\": \"$AAMKS_SERVER\" }"  | sudo tee /etc/aamksconf.json
sudo chown -R "$USER":"$USER" /etc/aamksconf.json

# clear $AAMKS_PATH if there is already any content
if [ -d "$AAMKS_PATH" ]; then
	sudo rm -r "$AAMKS_PATH"
fi
	sudo git clone https://github.com/aamks/aamks "$AAMKS_PATH"

sudo chown -R "$USER":"$USER" "$AAMKS_PATH"
chmod a+x "$AAMKS_PATH/fire/cfast7_linux_64"
cd "$AAMKS_PATH" || exit
python3.10 -m venv env
env/bin/pip install -r requirements.txt
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
echo "umask 0000" >> "$temp"
echo "export AAMKS_SERVER='$AAMKS_SERVER'" >> "$temp"
echo "export AAMKS_PATH='$AAMKS_PATH'" >> "$temp"
echo "export AAMKS_WORKER='$AAMKS_WORKER'" >> "$temp"
echo "export AAMKS_PG_PASS='$AAMKS_PG_PASS'" >> "$temp"
echo "export AAMKS_REDIS_PASS='$AAMKS_REDIS_PASS'" >> "$temp"
echo "export AAMKS_SALT='$AAMKS_SALT'" >> "$temp"
echo "export AAMKS_USE_MAIL='$AAMKS_USE_MAIL'" >> "$temp"
echo "export AAMKS_MAIL_PASSWORD='$AAMKS_MAIL_PASSWORD'" >> "$temp"
echo "export AAMKS_MAIL_SENDER='$AAMKS_MAIL_SENDER'" >> "$temp"
echo "export AAMKS_DEMO='$AAMKS_DEMO'" >> "$temp"
echo "export PYTHONPATH='$PYTHONPATH'" >> "$temp"
sudo cp "$temp" /etc/apache2/envvars
rm "$temp"

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
echo "export AAMKS_MAIL_PASSWORD='$AAMKS_MAIL_PASSWORD'" >> "$temp"
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
echo "alias aamks='cd $AAMKS_PATH'" >> "$temp"
echo "alias aamks.manager='$AAMKS_PATH/env/bin/python3 $AAMKS_PATH/redis_aamks/manager.py'" >> "$temp"
echo "alias AA='cd $AAMKS_PATH; env/bin/python3 aamks.py; cd $AAMKS_PROJECT/workers;'" >> "$temp"
echo "alias AP='cd $AAMKS_PROJECT'" >> "$temp"

echo "Add some variables to your .bashrc"
sudo cp "$temp" ~/.bashrc
rm "$temp"

sudo groupadd docker
sudo usermod -a -G docker $USERNAME
cd "$AAMKS_PATH"/redis_aamks || exit
sudo docker-compose up -d

[ "X$AAMKS_USE_MAIL" == "X1" ] && { 
	sudo apt-get --yes install composer
	cd $AAMKS_PATH/gui
	composer require phpmailer/phpmailer
}
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

chmod -R o=rx $AAMKS_PATH
cd $AAMKS_PATH/installer || exit;
sudo -u postgres psql -tc "SELECT 1 FROM pg_database WHERE datname = 'aamks'" | grep -q 1 || sudo -u postgres psql -c "CREATE DATABASE aamks"
sudo -u postgres psql -tc "SELECT 1 FROM pg_user WHERE usename = 'aamks'" | grep -q 1 || sudo -u postgres psql -c "CREATE USER aamks WITH PASSWORD '$AAMKS_PG_PASS'";
sudo -u postgres psql -f sql.sql

# Generate database tables 
bash play.sh

# These commands are for quick setup of SSL on :your computer. You should really configure SSL for your site."
sudo a2enmod ssl
sudo a2ensite default-ssl.conf
sudo sed -i 's/DocumentRoot \/var\/www\/html/DocumentRoot \/var\/www\/ssl/' /etc/apache2/sites-available/000-default.conf
sudo systemctl restart apache2
echo; echo; echo;
echo "AAMKS installed successfully. You can start using it at http://127.0.0.1/aamks"
echo "Default user email: demo@aamks"
echo "Password: AAMKSisthe1!"
echo "In order to run simulations in redis mode configure workers in network or start worker via redis manager."
echo "You can start redis server and worker via command:"
echo "$AAMKS_PATH/env/bin/python3 $AAMKS_PATH/redis_aamks/manager.py --serverstart"
echo "$AAMKS_PATH/env/bin/python3 $AAMKS_PATH/redis_aamks/manager.py --runlocal -n 1"
echo "Log out and log in to reload USER group settings"
