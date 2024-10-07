import logging
import random
from json import loads
import sys
import redis
import config
import os
from evac import worker as EvacWorker

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
        _, message = db.brpop(config.redis_queue_name)
        message_json = loads(message)
        logger.debug(f'pop from head of queue \n{message_json["data"]}')
        return message_json

    def process_message(self, message_json: str):
        sim_value = message_json["data"]["sim"]
        if self.host != "127.0.0.1":
            sim_value = sim_value.replace("home","mnt")
        logger.debug(f'starting worker.py {sim_value}')
        # Try counter
        retry_count = 0
        max_retries = 3
        while retry_count < max_retries:
            try:
                ew = EvacWorker.Worker(redis_worker_pwd=sim_value, AA=message_json['AA'])
                ew.run_worker()
                break  
            except Exception as e:
                retry_count += 1
                logger.warning(f"Error during running worker.py ({retry_count}/{max_retries} {sim_value}):\n {e}")
                if retry_count >= max_retries:
                    logger.error(f"--- SKIPPING -  All attempts used in {sim_value}   ---")
                    break  

    def main(self):
        """Consumes items from the Redis queue"""
        logger.debug('started worker')
        db = self.redis_db()
        while True:
            message_json = self.redis_queue_pop(db) 
            self.process_message(message_json)

def prepare_logger(name):
    if config.redis_host != "127.0.0.1":
        path = config.main_path.replace("home","mnt")
    else:
        path = config.main_path
    log_file = path + '/aamks.log'
    logger = logging.getLogger(f'{name} - AAMKS_WORKER')
    logger.setLevel(logging.DEBUG)
    fh = logging.FileHandler(log_file)
    fh.setLevel(logging.DEBUG)
    formatter = logging.Formatter('%(asctime)s - %(name)-14s - %(levelname)s - %(message)s')
    fh.setFormatter(formatter)
    logger.addHandler(fh)
    # ch = logging.StreamHandler()
    # ch.setLevel(logging.DEBUG)
    # ch.setFormatter(formatter)
    # logger.addHandler(ch)
    return logger

host_name = os.uname()[1]
logger = prepare_logger(host_name) if not logging.getLogger(f'{host_name} - AAMKS_WORKER').hasHandlers() else logging.getLogger(f'{host_name} - AAMKS_WORKER')
AAWorker = RedisWorker()
AAWorker.main()
