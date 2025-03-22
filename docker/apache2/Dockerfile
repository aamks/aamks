# Using custom build to install some additional plugins
# to default PHP-Apache image
FROM php:7.4-apache

# Update and install necessary dependencies
RUN apt-get update && apt-get install -y libpq-dev

# Configure and install PostgreSQL extensions
RUN docker-php-ext-configure pgsql -with-pgsql=/usr/local/pgsql \
    && docker-php-ext-install pdo pdo_pgsql pgsql

# All configuration files are mounted as volumes at this stage
# It may be worth to copy them to container for prod environments
