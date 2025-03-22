FROM python:3.9-slim

# Set default working directory 
WORKDIR /usr/local/aamks

# Copy requirements file only
#    all app will be mounted as a volume in composing process
COPY ./requirements.txt .

# Install dependencies required by AAMKS
RUN pip install --no-cache-dir -r requirements.txt

# Prepare aamks_users
RUN mkdir -p /home/aamks_users/demo@aamks & cp -r demo/ /home/aamks_users/demo@aamks/demo
# sudo chmod -R g+w /home/aamks_users/
# sudo chmod -R g+s /home/aamks_users/
# sudo chown -R $USER:www-data /home/aamks_users

# Run command when container starts
CMD ["bash"]

