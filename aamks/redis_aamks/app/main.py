import os
import datetime
from json import dumps
import random
import string
from uuid import uuid4
import redis
from . import config
import json 


class AARedis:
    def redis_db(self):
        try:
            db = redis.Redis(
                host=config.redis_host,
                port=config.redis_port,
                db=config.redis_db_number,
                password=config.redis_password,
                decode_responses=True,
            )
            db.ping()
            return db
        except:
            raise Exception('Cannot open redis database!')

    def redis_queue_push(self, db, message):
        # Push to tail of the queue (left of the list)
        db.lpush(config.redis_queue_name, message)

    def main(self, worker_pwd):
        # Connect to Redis
        db = self.redis_db()
        id = self.generate_id()
        message = {
            "id": id, #20231113-aBeD1G44
            "ts": datetime.datetime.utcnow().isoformat(),
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
        self.redis_queue_push(db, message_json)
        return message


    def generate_id(self):
        current_date = datetime.datetime.now().strftime("%Y%m%d") #2023113
        random_chars = ''.join(random.choices(string.ascii_letters + string.digits, k=8)) #abDe56d5
        generated_id = f"{current_date}-{random_chars}"
        return generated_id

    #pythonic way of deleting element - actually not used
    def remove_job(self, element_id):
        queue = config.redis_queue_name
        r = redis.StrictRedis(
            host=config.redis_host,
            port=config.redis_port,
            db=config.redis_db_number,
            password=config.redis_password
        )
        elements = r.lrange(config.redis_queue_name, 0, -1)
        element_found = False  # Flag to track whether the element is found
        for element in elements:
            decoded_element = json.loads(element)
            if decoded_element.get("id") == element_id:
                r.lrem(queue, 0, element)
                print(f"Deleted ID: {element_id}")
                element_found = True
                break
        if not element_found:
            print(f"Element not found, ID: {element_id}")

