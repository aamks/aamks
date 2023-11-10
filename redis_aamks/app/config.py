import os

redis_host = os.environ['AAMKS_SERVER']
print(os.environ)
print(os.environ['AAMKS_REDIS_PASS'])

redis_port = 6379
redis_db_number = 0
redis_password = os.environ['AAMKS_REDIS_PASS']
redis_queue_name = "aamks_queue"