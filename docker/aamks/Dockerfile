FROM python:3.9-slim

# Copy AAMKS files into the image
COPY --from=resources / /usr/local/aamks

# Set default working directory 
WORKDIR /usr/local/aamks

# Install dependencies required by AAMKS
# UNCOMMENT FOR RELEASE !!!RUN pip install --no-cache-dir -r requirements.txt

# Add user
#RUN groupadd -g 33 www-data && useradd -u 33 -g 33 www-data 

# Set up demo user and any additional settings from entrypoint.sh
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]

