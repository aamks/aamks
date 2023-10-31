import paramiko
import os
import docker
from subprocess import Popen
import json 

class RedisManager:

    def __init__(self):
        self.redis_pwd = os.path.join(os.environ['AAMKS_PATH'], "redis_aamks")
        self.worker_path = os.path.join(self.redis_pwd, "worker", "worker.py")
        self.container_name = "aamks_redis"
        self.net_conf = "/etc/aamksconf.json" 
        self.data_array = []
        self.ip_array = []
        
        
    def get_hosts(self):
        with open(self.net_conf, "r") as file:
            data = json.load(file)
            if "AAMKS_NETCONF" in data and "enabled_networks" in data["AAMKS_NETCONF"]:
                enabled_networks = data["AAMKS_NETCONF"]["enabled_networks"]
                for network_name, count in enabled_networks.items():
                    if count > 0 and network_name in data["AAMKS_NETCONF"]["networks"]:
                        network_data = data["AAMKS_NETCONF"]["networks"][network_name]
                        ip_array = [item[1] for item in network_data if len(item) > 1]
                        self.data_array.append((network_name, count, ip_array))

        for data in self.data_array:
            for ip in data[2]:
                self.ip_array.append(ip)

    def run_redis_server(self):
        client = docker.from_env()
        try:
            # Pobranie informacji o kontenerze
            container = client.containers.get(self.container_name)
            # Sprawdzenie, czy kontener jest uruchomiony
            if container.status == "running":
                print(f"Container '{self.container_name}' is running.")
            if container.status == "exited":
                try:
                    os.system(f"docker start {self.container_name}")
                except:
                    print(f"Error during staring {self.container_name}")
            else: 
                os.chdir(self.redis_pwd)
                os.system("docker-compose up -d")
        except docker.errors.NotFound:
            print(f"Container '{self.container_name}' does not exist.")
            print(f"Container '{self.container_name}' has been started in the background.")
            os.chdir(self.redis_pwd)
            try:
                os.system("docker-compose up -d")
            except:
                print("Error during starting docker redis container")


    def start_workers_on_node(self, workers:int):
        for ip in self.ip_array:
            for _ in range(workers):
                cmd = f'ssh {ip} python3 {self.worker_path}'
                Popen(cmd, shell=True)

    def kill_workers(self):
        for ip in self.ip_array:
            cmd = f'pkill -f "{self.worker_path}"'
            Popen(cmd, shell=True)


    def main(self):
        self.get_hosts()
        self.run_redis_server()
        self.start_workers_on_node(2)
