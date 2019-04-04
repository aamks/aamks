#!/usr/bin/env bash
#This is the instalator of for worker. Currently it works only on Linux nodes.
USER = 'krasus'

sudo locale-gen en_US.UTF-8
sudo apt-get update
sudo apt-get --yes install subversion python3-pip  sendxmpp xdg-utils unzip -mod-php
sudo -H pip3 install webcolors colour shapely scipy numpy

cd /usr/local/
sudo svn co https://github.com/aamks/aamks.git
sudo ln -sf /usr/local/aamks.git/trunk /usr/local/aamks
sudo chown -R $USER:$USER /usr/local/aamks


