#!/bin/bash
mkdir -p /home/aamks_users/demo@aamks
cp -r /usr/local/aamks/installer/demo /home/aamks_users/demo@aamks/
chmod -R g+w /home/aamks_users
chmod -R g+s /home/aamks_users
chown -R 33:33 /home/aamks_users  # www-data user
