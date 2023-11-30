import os
import docker
from subprocess import Popen, DEVNULL
import json 
import argparse
import subprocess

class RedisManager:
    def __init__(self):
        self.redis_pwd = os.path.join(os.environ['AAMKS_PATH'], "redis_aamks")
        self.worker_path = os.path.join(self.redis_pwd, "worker", "worker.py")
        self.container_name = "aamks_redis"
        self.net_conf = "/etc/aamksconf.json" 
        self.host_array = []
        self.ip_array = []
        self._argparse()

    #SERVER
    def run_redis_server(self):
        client = docker.from_env()
        try:
            container = client.containers.get(self.container_name)
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
            print(f"Container '{self.container_name}' started in the background.")
            os.chdir(self.redis_pwd)
            try:
                os.system("docker-compose up -d")
            except:
                print("Error during starting docker redis container")

    def stop_redis_server(self):
        try:
            print(f"Stopping {self.container_name}")
            os.system(f"docker stop {self.container_name}")
        except docker.errors.NotFound as e:
            print(f"Error during stopping {self.container_name} ({e})")

    def delete_all_redis_servers(self):
        client = docker.from_env()
        try:
            client.containers.get(self.container_name)
            print(f"Stopping {self.container_name}")
            cmd = f"docker stop $(docker ps -a --filter 'name={self.container_name}' -q)"
            os.system(cmd)
            print(f"Deleting {self.container_name}")
            cmd = f"docker ps -a | grep {self.container_name} | awk '{{print $1}}' | xargs docker rm -f"
            os.system(cmd)
        except Exception as e:                                              
            print(f"Error during deleting ({e})")  

    def show_server_status(self):
        client = docker.from_env()
        try:
            container = client.containers.get(self.container_name)
            print(container.status)
        except:
            print("Redis container does not exist")

    def get_hosts(self):
        #Get all nodes from aamkconf.json
        with open(self.net_conf, "r") as file:
            data = json.load(file)
            if "AAMKS_NETCONF" in data and "enabled_networks" in data["AAMKS_NETCONF"]:
                enabled_networks = data["AAMKS_NETCONF"]["enabled_networks"]
                for network_name, count in enabled_networks.items():
                    if count > 0 and network_name in data["AAMKS_NETCONF"]["networks"]:
                        network_data = data["AAMKS_NETCONF"]["networks"][network_name]
                        ip_array = [item[1] for item in network_data if len(item) > 1]
                        self.host_array.append((network_name, count, ip_array))

        for data in self.host_array:
            for ip in data[2]:
                self.ip_array.append(ip)

    #START WORKERS
    def start_workers_ip(self, ip, n:int):
        print(f"Trying to start {n} workers on {ip}")
        for _ in range(int(n)):
            cmd = f"ssh {ip} \"AAMKS_SERVER={os.environ['AAMKS_SERVER']} AAMKS_REDIS_PASS={os.environ['AAMKS_REDIS_PASS']} nohup python3 {self.worker_path} &\""
            Popen(cmd, shell=True, stdout=DEVNULL, stderr=DEVNULL)

    def start_workers_on_all_nodes(self):
        print("Trying to start workers on nodes")
        self.get_hosts()
        for host in self.host_array:
            for ip in host[2]:
                for _ in range(host[1]):
                    cmd = f"ssh {ip} \"AAMKS_SERVER={os.environ['AAMKS_SERVER']} AAMKS_REDIS_PASS={os.environ['AAMKS_REDIS_PASS']} nohup python3 {self.worker_path} &\""
                    Popen(cmd, shell=True, stdout=DEVNULL, stderr=DEVNULL)

    def start_workers_locally(self, n: int):
        print(f"Trying to run workers locally,workers: {n}")
        for _ in range(int(n)):
            cmd = ["nohup", "python3", self.worker_path, "&"]
            Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)

    #SHOW WORKERS     
    def show_all_workers(self):
        self.get_hosts()
        enabled_workers = []
        print("aamksconf.json") 
        for host in self.host_array:
            print(host)
        print("END aamksconf.json")
        for host in self.host_array:
            for ip in host[2]:
                cmd = f'ssh {ip} ps aux | grep {self.worker_path} | wc -l'
                try:
                    output = subprocess.check_output(cmd, shell=True, stderr=subprocess.STDOUT, text=True)
                    num_processes = int(output.strip())
                    enabled_workers.append((ip, num_processes))  
                    print(f"Number of processes on {ip}: {num_processes}")
                except subprocess.CalledProcessError as e:
                    print(f"Error while retrieving worker information for node with IP {ip}: {e}")
        return enabled_workers  

    def show_worker_one(self, ip):
        cmd = f'ssh {ip} ps aux | grep "python3 {self.worker_path}" | wc -l'
        try:
            output = subprocess.check_output(cmd, shell=True, stderr=subprocess.STDOUT, text=True)
            print(f"Number of redis worker processes on {ip}: {output.strip()}")
        except subprocess.CalledProcessError as e:
            print(f"Error while retrieving worker information for node with IP {ip}: {e}")

    def show_local_workers(self):
        cmd = f"""ps aux | grep "python3 {self.worker_path}" | wc -l"""
        result = subprocess.run(cmd, shell=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
        if result.returncode == 0:
            x = int(result.stdout.strip())  
            print(f"Number of local workers: {x-2}")
        else:
            print(f"Error: {result.stderr}")
    
    #KILL WORKERS
    def kill_one(self, ip):
        print("Trying to kill workers on specific IP")
        kill_cmd = f"python3 {self.worker_path}"
        cmd = f"""ssh {ip} 'pkill -f "{kill_cmd}"'"""
        process = Popen(cmd, shell=True)
        process.communicate()
        print(f"All processes killed on {ip}.")

    def kill_all(self):
        if input(f"This command will kill all processes on all nodes defined in {self.net_conf}. Do you want to continue? (y/n) \n") in ["y", "Y"]:
            self.get_hosts()
            for ip in self.ip_array:
                self.kill_one(ip)

    def kill_local(self): 
        print("Trying to kill all local workers if any")
        kill_cmd = f"python3 {self.worker_path}"
        cmd = f"""pkill -f '{kill_cmd}'"""
        Popen(cmd, shell=True)

    #ARGS
    def _argparse(self):
        parser = argparse.ArgumentParser(description='redis manager')
        #server
        parser.add_argument('--serverstart', help='Run redis server', required=False, action='store_true')
        parser.add_argument('--serverstop', help='Stop redis server', required=False, action='store_true')
        parser.add_argument('--serverdelete', help='Delete all docker redis containers', required=False, action='store_true')
        parser.add_argument('--serverstatus', help='Check docker redis containers status', required=False, action='store_true')
        #run
        parser.add_argument('--runall', help='Run all workers according to etc/aamksconf.json', required=False, action='store_true')
        parser.add_argument('--runone', help='Run n workers on specific ip | --runone -ip 192.168.0.184 -n 2', required=False,  action='store_true')
        parser.add_argument('--runlocal', help='Run n workers on local machine | --runlocal -n 2', required=False,  action='store_true')
        #show
        parser.add_argument('--showall', help='Show information about all workers', required=False, action='store_true')
        parser.add_argument('--showone', help='Show information about a single worker | --showone -ip 192.168.0.184', required=False,  action='store_true')
        parser.add_argument('--showlocal', help='Show information about local workers', required=False,  action='store_true')
        #kill
        parser.add_argument('--killall', help='Kill all workers on all nodes', required=False, action='store_true')
        parser.add_argument('--killone', help='Kill all workers on specific node | --killone -ip 192.168.0.184', required=False, action='store_true')
        parser.add_argument('--killlocal', help='Kill all workers locally', required=False, action='store_true')
        #params for runone, showone, killone
        parser.add_argument('-ip', help='The IP address to work on', default=None, required=False)
        parser.add_argument('-n', help='How many times run redis worker.py', default=None, type=int, required=False)

        args = parser.parse_args()
        #server
        if args.serverstart:
            self.run_redis_server()
        if args.serverstop:
            self.stop_redis_server()
        if args.serverdelete:
            self.delete_all_redis_servers()
        if args.serverstatus:
            self.show_server_status()
        #run
        if args.runall:
            self.start_workers_on_all_nodes()
        if args.runone and args.ip and args.n:
            self.start_workers_ip(args.ip, args.n)
        if args.runlocal and args.n:
            self.start_workers_locally(args.n)
        #show
        if args.showall:
            self.show_all_workers()
        if args.showone and args.ip:
            self.show_worker_one(args.ip)
        if args.showlocal:
            self.show_local_workers()
        #kill
        if args.killall:
            self.kill_all() 
        if args.killone and args.ip:
            self.kill_one(args.ip)
        if args.killlocal:
            self.kill_local() 

if __name__=="__main__":
    manager=RedisManager()