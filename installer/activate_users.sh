sudo -u postgres psql aamks -c "
UPDATE users SET activation_token='already activated'";