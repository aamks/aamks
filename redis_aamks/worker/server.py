import json
import logging
from json import loads, load, dump, dumps
import redis
import config
import os
from results.beck_new import postprocess, comparepostprocess
from results.beck_anim import Beck_Anim

class RedisWorkerServer:
    
    def connect_redis_db(self):
        self.host = config.redis_host
        self.db = redis.Redis(
            host=self.host,
            port=config.redis_port,
            db=config.redis_db_number,
            password=config.redis_password,
            decode_responses=True,
        )
        # make sure redis is up and running
        self.db.ping()

    def redis_queue_push(self, message):
        # push to tail of the queue (left of the list)
        self.db.lpush(config.redis_server_queue_name, message)

    def redis_queue_pop(self):
        # pop from head of the queue (right of the list)
        # the `b` in `brpop` indicates this is a blocking call (waits until an item becomes available)
        _, message = self.db.brpop(config.redis_server_queue_name)
        message_json = loads(message)
        logger.debug(f'pop from head of queue \n{message_json}')
        return message_json

    def worker_redis_queue_push(self, message):
        # push to tail of the queue (left of the list)
        self.db.lpush(config.redis_worker_queue_name, dumps(message))

    def process_message(self, message_json: str):
        if 'anim' in message_json['data']:
            logger.debug('starting anim function')
            self.run_beck_anim(message_json)
        elif 'aamks' in message_json['data']:
            logger.debug('starting aamks function')
            self.run_aamks(message_json)
        elif 'results' in message_json['data']:
            logger.debug('starting results function')
            self.run_beck_new(message_json)
        elif 'conf_dir' in message_json['data']:
            logger.debug('starting conf_subst function')
            self.run_conf_dir(message_json)
    
    def run_aamks(self, message):
        logger.debug('running aamks...')
        path, user_id, irange = message['data']['aamks']
        message["AA"] = { 
                "PROJECT": path,
                "USER_ID": user_id,
                "PATH": os.environ["AAMKS_PATH"],
                "SERVER": os.environ['AAMKS_SERVER'],
                "PG_PASS": os.environ['AAMKS_PG_PASS']
                }
        try:
            for i in range(*irange):
                message["data"] = {
                    "sim_id": i,
                    "sim": "{}/workers/{}".format(path,i)
                }
                self.worker_redis_queue_push(message)
                logger.debug(f'send sim {i} {path}')
        except Exception as e:
            logger.error(f'Failure to send redis worker message - {e}')
    
    def run_beck_anim(self, message):
        path, project, scenario, iter = message['data']['anim']
        logger.debug('running anim...')
        try:
            Beck_Anim(path, project, scenario, iter)
            logger.debug('finished anim')
        except Exception as e:
            logger.error(f'from beck_anim.py: {e}')

    def run_beck_new(self, message):
        path, scenarios = message['data']['results']
        logger.debug('running results...')
        try:
            if scenarios:
                comparepostprocess(scenarios.split(' '), path)
            else:
                postprocess(path)
            logger.debug('finished results')
        except Exception as e:
            logger.error(f'from beck_new.py: {e}')

    def run_conf_dir(self, message):
        logger.debug('substitution conf...')
        try:
            path, pid, sid, nid, tid = message['data']['conf_dir']
            for scenario in [('simple', sid), ('navmesh', nid), ('three', tid)]:
                with open(f"{path}/demo/{scenario[0]}/conf.json", 'r') as f:
                    conf = load(f)
                    conf['project_id'] = pid
                    conf['scenario_id'] = scenario[1]
                with open(f"{path}/demo/{scenario[0]}/conf.json", 'w') as f:
                    dump(conf, f,  indent=4)
            logger.debug('finished with conf')
        except Exception as e:
            logger.error(f'from subst conf: {e}')


    def main(self):
        """Consumes items from the Redis queue"""
        logger.debug('started worker server')
        self.connect_redis_db()
        logger.debug('connected to redis database')
        while True:
            message_json = self.redis_queue_pop() 
            self.process_message(message_json)


def prepare_logger(name):
    log_file = config.main_path + '/aamks.log'
    logger = logging.getLogger(f'{name} - AAMKS_SERVER')
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
logger = prepare_logger(host_name) if not logging.getLogger(f'{host_name} - AAMKS_SERVER').hasHandlers() else logging.getLogger(f'{host_name} - AAMKS_SERVER')
AAWorker = RedisWorkerServer()
AAWorker.main()
