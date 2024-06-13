import logging
import random
from json import loads, load, dump
import sys
import redis
import config
import os
sys.path.insert(1, '/usr/local/aamks')
sys.path.insert(1, '/usr/local/aamks/results')
from results.beck_new import postprocess, comparepostprocess
from results.beck_anim import Beck_Anim
from aamks import start_aamks
from gui.email_service import activate, reset

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
        _, message = db.brpop('server_queue')
        message_json = loads(message)
        logger.debug(f'pop from head of queue \n{message_json}')
        return message_json

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
        elif 'activate_email' in message_json['data']:
            logger.debug('starting activate_email function')
            self.run_activate_email(message_json)
        elif 'reset_email' in message_json['data']:
            logger.debug('starting reset_email function')
            self.run_reset_email(message_json)
        else:
            logger.error("Unknown function ")
            logger.debug(message_json)
    
    def run_aamks(self, message):
        path, user_id = message['data']['aamks']
        logger.debug('running aamks...')
        try:
            start_aamks(path, user_id)
            logger.debug('finished aamks')
        except Exception as e:
            logger.error(f'from aamks.py: {e}')

    
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

    def run_activate_email(self, message):
        link, email = message['data']['activate_email']
        logger.debug('running activate_email...')
        try:
            logger.debug(activate(link, email))
            logger.debug('finished activate_email')
        except Exception as e:
            logger.error(f'from email_service.py: {e}')

    def run_reset_email(self, message):
        link, email = message['data']['reset_email']
        logger.debug('running reset_email...')
        try:
            logger.debug(reset(link, email))
            logger.debug('finished reset_email')
        except Exception as e:
            logger.error(f'from email_service.py: {e}')


    def main(self):
        """Consumes items from the Redis queue"""
        logger.debug('started worker server')
        db = self.redis_db()
        while True:
            message_json = self.redis_queue_pop(db) 
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
