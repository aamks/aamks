import logging
import random
from json import loads
import sys
import redis
import config
import os
from aamks import start_aamks_with_worker

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
        db.lpush(config.redis_worker_queue_name, message)

    def redis_queue_pop(self, db):
        # pop from head of the queue (right of the list)
        # the `b` in `brpop` indicates this is a blocking call (waits until an item becomes available)
        _, message = db.brpop(config.redis_worker_queue_name)
        message_json = loads(message)
        logger.debug(f'pop from head of queue \n{message_json["data"]}')
        return message_json

    def process_message(self, message_json: str):
        pwd = message_json["data"]["sim"]
        sim_id = message_json["data"]["sim_id"]
        user_id = message_json["AA"]["USER_ID"]
        project = message_json["AA"]["PROJECT"]
        if self.host != "127.0.0.1":
            pwd = pwd.replace("home","mnt")
        logger.debug(f'starting aamks iter {sim_id} with worker {pwd}')
        try:
            start_aamks_with_worker(project, user_id, sim_id)
        except Exception as e:
            logger.error(f'during sim {sim_id} AAMKS halting error \n ERROR: {e}')
        logger.debug(f"finished {sim_id} - {pwd}")

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
    ch = logging.StreamHandler()
    ch.setLevel(logging.DEBUG)
    ch.setFormatter(formatter)
    logger.addHandler(ch)
    return logger

host_name = os.uname()[1]
logger = prepare_logger(host_name) if not logging.getLogger(f'{host_name} - AAMKS_WORKER').hasHandlers() else logging.getLogger(f'{host_name} - AAMKS_WORKER')
AAWorker = RedisWorker()
AAWorker.main()
