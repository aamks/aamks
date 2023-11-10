"""Main app

This app pushes messages into the redis queue
"""
import os
from datetime import datetime
from json import dumps
from uuid import uuid4
import redis
from . import config

class AARedis:
    def redis_db(self):
        db = redis.Redis(
            host=config.redis_host,
            port=config.redis_port,
            db=config.redis_db_number,
            password=config.redis_password,
            decode_responses=True,
        )
        db.ping()
        return db

    def redis_queue_push(self, db, message):
        # Push to tail of the queue (left of the list)
        db.lpush(config.redis_queue_name, message)

    def main(self, worker_pwd):
        # Connect to Redis
        db = self.redis_db()
        message = {
            "id": str(uuid4()),
            "ts": datetime.utcnow().isoformat(),
            "AA": { 
                "PROJECT": os.environ["AAMKS_PROJECT"],
                "PATH": os.environ["AAMKS_PATH"],
                "SERVER": os.environ['AAMKS_SERVER'],
                "PG_PASS": os.environ['AAMKS_PG_PASS']
                },
            "data": {
                "sim": worker_pwd,
            }
        }
        
        # Store the data as JSON in Redis
        message_json = dumps(message)
        # Push message to Redis queue
        # print(f"Sending message {message['data']['sim']}")
        self.redis_queue_push(db, message_json)
        return message

    if __name__ == '__main__':
        main()
