# How to install and configure Jenkins and SonarQube 
##Requirements 
* Ubuntu 18.04
* Installed Java 11

## Install and run Jenkins
1 Install Jenkins via repository
```
wget -q -O - https://pkg.jenkins.io/debian/jenkins-ci.org.key | sudo apt-key add -
sudo sh -c 'echo deb http://pkg.jenkins.io/debian-stable binary/ > /etc/apt/sources.list.d/jenkins.list'
sudo apt-get update
sudo apt-get install jenkins
```
2 Copy unlock key
```
sudo cat /var/lib/jenkins/secrets/initialAdminPassword
```
3 Go to Jenkins server, create first user's account and install recommended plugins
```
0.0.0.0:8080
``` 

## Install and run PostgreSQL and Sonar
1 Install PosgreSQL via repository
```
wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | sudo apt-key add -
sudo sh -c 'echo deb http://apt.postgresql.org/pub/repos/apt/ bionic-pgdg main > /etc/apt/sources.list.d/pgdg.list'
sudo apt-get update
apt-get install postgresql-12
```
To verify installation:
```
sudo systemctl status postgresql
```
2. Create Sonar database in pSQL
Switch to postgresql user and create sonar database user
```
su - postgres
createuser sonar
``` 
Switch to postgresql 
```
psql
```
Create database
```
ALTER USER sonar WITH ENCRYPTED password 'password';
CREATE DATABASE sonar OWNER sonar;
```
Quit shell
```
\q
```
3 Install and configure SonarQube









## Jobs configuration

## Sources
```
https://pkg.jenkins.io/debian/
https://wiki.jenkins.io/display/JENKINS/Installing+Jenkins+on+Ubuntu

https://www.postgresql.org/download/linux/ubuntu/
https://www.howtoforge.com/how-to-install-sonarqube-on-ubuntu-1804/

https://unix.stackexchange.com/questions/366352/etc-security-limits-conf-not-applied
```
