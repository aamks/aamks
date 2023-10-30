import paramiko
import os
import docker
from subprocess import Popen

class RedisManager:

    def __init__(self):
        self.redis_pwd = os.path.join(os.environ['AAMKS_PATH'], "redis_aamks")
        self.worker_path = os.path.join(self.redis_pwd, "worker", "worker.py")
        self.hosts =[
            {"hostname": "192.168.0.184", "username": "aamks"},
            # {"hostname": "192.168.0.183", "username": "aamks"}
        ]
        self.container_name = "aamks_redis"
        

    def run_redis_server(self):
        client = docker.from_env()
        try:
            # Pobranie informacji o kontenerze
            container = client.containers.get(selfcontainer_name)
            # Sprawdzenie, czy kontener jest uruchomiony
            if container.status == "running":
                print(f"Container '{self.container_name}' is running.")
            else: 
                os.chdir(self.redis_pwd)
                os.system("docker-compose up -d")
                print(f"Container '{self.container_name}' has been started in the background.")
        except docker.errors.NotFound:
            print(f"Container '{self.container_name}' does not exist.")

    def start_worker_on_node(self):
        for host in self.hosts:
            ssh = paramiko.SSHClient()
            ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())

            # Wczytaj klucz prywatny (nie będzie potrzebne hasło)
            ssh.load_system_host_keys()
            
            # Połącz się z komputerem za pomocą klucza SSH
            ssh.connect(host["hostname"], username=host["username"])
            # Uruchom plik worker.py na zdalnym komputerze
            stdin, stdout, stderr = ssh.exec_command(f"python {self.worker_path}")

            # Pobierz wynik i wyświetl go
            print(f"Wynik z komputera {computer['hostname']}:")
            print(stdout.read().decode("utf-8"))

            ssh.close()


    def run_sub(self, workers:int):
        for host in self.hosts:
            for _ in range(workers):
                cmd = f'ssh {host["hostname"]} {self.worker_path}'
                Popen(cmd, shell=True)


r  = RedisManager()
r.run_redis_server()
r.run_sub(2)