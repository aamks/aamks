import random
from json import loads
import sys
import redis
import config
import os

sys.path.insert(1, '/usr/local/aamks')
sys.path.insert(1, '/usr/local/aamks/evac')
from evac import worker as EvacWorker

class RedisWorker:
    def redis_db(self):
        db = redis.Redis(
            host=config.redis_host,
            port=config.redis_port,
            db=config.redis_db_number,
            password=config.redis_password,
            decode_responses=True,
        )
        # make sure redis is up and running
        db.ping()
        return db

    def redis_queue_push(self, db, message):
        # push to tail of the queue (left of the list)
        db.lpush(config.redis_queue_name, message)

    def redis_queue_pop(self, db):
        # pop from head of the queue (right of the list)
        # the `b` in `brpop` indicates this is a blocking call (waits until an item becomes available)
        _, message_json = db.brpop(config.redis_queue_name)
        return message_json

    def process_message(self, db, message_json: str):
        message = loads(message_json)
        print(f"Message received: id={message['data']['sim']}")
        sim_value = message["data"]["sim"]
        if os.environ['AAMKS_SERVER'] != "127.0.0.1":
            sim_value = sim_value.replace("home","mnt")
        # Try counter
        retry_count = 0
        max_retries = 3
        while retry_count < max_retries:
            try:
                ew = EvacWorker.Worker(redis_worker_pwd=sim_value, AA=message['AA'])
                ew.run_worker()
                break  
            except Exception as e:
                retry_count += 1
                print(f"Error during running worker ({retry_count}/{max_retries}): {e}")
                if retry_count < max_retries:
                    continue  # Try again
                else:
                    print("--- SKIPPING -  All attempts used in this simulation   ---")
                    break  

    def main(self):
        """Consumes items from the Redis queue"""
        db = self.redis_db()
        while True:
            message_json = self.redis_queue_pop(db) 
            self.process_message(db, message_json)

AAWorker = RedisWorker()
AAWorker.main()
