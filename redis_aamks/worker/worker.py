"""Main Worker app

This app listens messages into the redis queue
"""
import random
from json import loads

import redis
import config
import subprocess
import os


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
        try:
            sim_value = sim_value.replace("home","mnt")
            subprocess.run(["python", "/usr/local/aamks/evac/worker.py", sim_value], check=True)
        except subprocess.CalledProcessError as e:
            print(f"Błąd podczas uruchamiania worker.py: {e}")
            #self.redis_queue_push(db, message_json)


    def main(self):
        """
        Consumes items from the Redis queue
        """
        # connect to Redis
        db = self.redis_db()
        while True:
            message_json = self.redis_queue_pop(db)  # this blocks until an item is received
            self.process_message(db, message_json)

AAWorker = RedisWorker()
AAWorker.main()
