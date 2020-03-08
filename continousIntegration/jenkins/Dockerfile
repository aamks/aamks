FROM jenkins/jenkins:latest

#Jenkins login
ENV JENKINS_USER admin
ENV JENKINS_PASS admin

#Disable jenkins setup on restart
ENV JAVA_OPTS -Djenkins.install.runSetupWizard=false

#Enable Code As Config Jenkins plugin
ENV CASC_JENKINS_CONFIG /var/jenkins_home/casc_configs
#Copy .yml config
COPY sonar/. /var/jenkins_home/casc_configs/.

#Copy defined jobs
COPY jobs/. /usr/share/jenkins/ref/jobs/.

#Install jenkins plugins from plugins.txt list
COPY plugins.txt /usr/share/jenkins/plugins.txt
RUN /usr/local/bin/install-plugins.sh < /usr/share/jenkins/plugins.txt

#Install python3 and pytest on container 
USER root
RUN \
apt-get update -y && \
apt-get install python3-pip -y && \
pip3 install pytest

USER jenkins
