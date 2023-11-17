import os
import sys
sys.path.append('/mnt/aamks_users')
try:
    from worker_env import *
except Exception as e:
    print("Have you properly configured your mnt/aamks_users/worker_env.py?")

redis_host = AAMKS_SERVER
redis_port = 6379
redis_db_number = 0
redis_password = AAMKS_REDIS_PASS
redis_queue_name = "aamks_queue"
