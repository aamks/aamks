import random
from json import loads
import sys
import redis
import config
import os
sys.path.insert(1, '/usr/local/aamks')
sys.path.insert(1, '/usr/local/aamks/evac')
from evac import worker as EvacWorker
from results.beck_new import postprocess, comparepostprocess

class RedisWorker:
    
    def redis_db(self):
        self.host = config.redis_host
        db = redis.Redis(
            host=self.host,
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
        print(f"Message received: id={message['data']}")
        if 'sim' in message['data']:
            if self.host != "127.0.0.1":
                message["data"]["sim"] = message["data"]["sim"].replace("home","mnt")
            self.run_worker(message)
        elif 'anim' in message['data']:
            self.run_beck_anim(message)
        elif 'aamks' in message['data']:
            self.run_aamks(message)
        elif 'results' in message['data']:
            self.run_beck_new(message)
    
    def run_beck_new(self, message):
        path, scenarios = message['data']['results']
        print(f"Running beck_new: {path} - {scenarios}")
        if scenarios:
            comparepostprocess(scenarios.split(' '), path)
        else:
            postprocess(path)
    
        

    def run_worker(self, message):
        # Try counter
        retry_count = 0
        max_retries = 3
        while retry_count < max_retries:
            try:
                ew = EvacWorker.Worker(redis_worker_pwd=message["data"]["sim"], AA=message['AA'])
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
