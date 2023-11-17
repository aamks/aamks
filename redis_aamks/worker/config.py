import os
import sys
sys.path.append('/mnt/aamks_users')

try:
    from worker_env import AAMKS_SERVER, AAMKS_REDIS_PASS
except ImportError:
    print("Error importing from worker_env. Using os.environ instead.")
    try:
        if os.environ['AAMKS_SERVER']:
            redis_host = os.environ['AAMKS_SERVER']
            redis_password = os.environ('AAMKS_REDIS_PASS')
        else:
            print("AAMKS_SERVER not properly configured or doesn't start with '127'")
    except Exception as e:
        print("Bad configuration in worker/config")
        redis_host = ''
        redis_password = ''
else:
    redis_host = AAMKS_SERVER
    redis_password = AAMKS_REDIS_PASS


redis_port = 6379
redis_db_number = 0
redis_queue_name = "aamks_queue"
