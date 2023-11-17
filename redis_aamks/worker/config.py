import os
import sys
sys.path.append('/mnt/aamks_users')

try:
    from worker_env import AAMKS_SERVER, AAMKS_REDIS_PASS
except ImportError:
    print("Error importing from worker_env.")
else:
    redis_host = AAMKS_SERVER
    redis_password = AAMKS_REDIS_PASS


redis_port = 6379
redis_db_number = 0
redis_queue_name = "aamks_queue"
