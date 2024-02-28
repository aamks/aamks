import random
from json import loads
import sys
import redis
import config
import os
sys.path.insert(1, '/usr/local/aamks')
sys.path.insert(1, '/usr/local/aamks/results')
from results.beck_new import postprocess, comparepostprocess
from results.beck_anim import Beck_Anim
from aamks import start_aamks

class RedisWorkerServer:
    
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
        db.lpush('server_queue', message)

    def redis_queue_pop(self, db):
        # pop from head of the queue (right of the list)
        # the `b` in `brpop` indicates this is a blocking call (waits until an item becomes available)
        _, message_json = db.brpop('server_queue')
        return message_json

    def process_message(self, db, message_json: str):
        message = loads(message_json)
        print(f"Message received: id={message['data']}")
        if 'anim' in message['data']:
            self.run_beck_anim(message)
        elif 'aamks' in message['data']:
            self.run_aamks(message)
        elif 'results' in message['data']:
            self.run_beck_new(message)
    
    def run_aamks(self, message):
        path, user_id = message['data']['aamks']
        start_aamks(path, user_id)
    
    def run_beck_anim(self, message):
        path, project, scenario, iter = message['data']['anim']
        Beck_Anim(path, project, scenario, iter)

    def run_beck_new(self, message):
        path, scenarios = message['data']['results']
        if scenarios:
            comparepostprocess(scenarios.split(' '), path)
        else:
            postprocess(path)

    def main(self):
        """Consumes items from the Redis queue"""
        print('starting')
        db = self.redis_db()
        while True:
            message_json = self.redis_queue_pop(db) 
            self.process_message(db, message_json)

AAWorker = RedisWorkerServer()
AAWorker.main()
