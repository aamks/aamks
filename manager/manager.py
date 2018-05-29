import os
import time
from collections import OrderedDict
from subprocess import Popen,PIPE
import sqlite3
import json
import sys
import argparse
from include import Sqlite
from include import Json
from include import Dump as dd

class Manager():
    def __init__(self): # {{{
        ''' This is the manager of aamks jobs via gearman. '''
        try:
            os.remove("/tmp/manage_aamks.sqlite")
        except OSError:
            pass
            
        self.json=Json()
        self.conf=self.json.read("{}/manager/conf.json".format(os.environ['AAMKS_PATH']))
        self._list_enabled_networks()
        self._argparse()
# }}}

    def _gearman_register_results_collector(self):# {{{
        ''' 
        The worker reports each complete work to aOut service.
        Gearman can then connect to worker machine and download the results.
        '''

        Popen("(echo workers ; sleep 0.1) | netcat {} 4730 | grep -q aOut || {{ gearman -w -h {} -f aOut xargs python3 {}/manager/results_collector.py; }}".format(os.environ['AAMKS_SERVER'], os.environ['AAMKS_SERVER'], os.environ['AAMKS_PATH']), shell=True)
# }}}
    def _list_enabled_networks(self):# {{{
        print("Networks enabled in conf.json")
        dd(self.conf['enabled_networks'])
        print("")
# }}}
    def _access_hosts(self):# {{{
        self.s=Sqlite("/tmp/manage_aamks.sqlite")
        self._sqlite_import_hosts()
# }}}
    def ping_workers(self):# {{{
        self._access_hosts()
        for i in self.s.query("SELECT distinct(host),network FROM workers WHERE conf_enabled=1 ORDER BY network,host"):
            Popen('''host={}; net={}; nc -w 2 -z $host 22 2>/dev/null && {{ echo "$host\t($net)\t●"; }} || {{ echo "$host ($net)\t-"; }}'''.format(i['host'],i['network']), shell=True)
        time.sleep(2)
# }}}
    def wake_on_lan(self):# {{{
        self._access_hosts()
        for i in self.s.query("SELECT distinct(host),mac,broadcast FROM workers WHERE conf_enabled=1 ORDER BY network,host"):
            Popen("wakeonlan -i {} {}".format(i['broadcast'], i['mac']), shell=True)
        time.sleep(2)

# }}}
    def add_workers(self):# {{{
        ''' Register each host enabled in conf.json to gearman $AAMKS_SERVER (.bashrc) '''

        self._access_hosts()
        for i in self.s.query("SELECT host FROM workers WHERE conf_enabled=1 ORDER BY network,host"):
                Popen("ssh -f -o ConnectTimeout=3 {} \" nohup gearman -w -h {} -f aRun xargs python3 {}/evac/worker.py > /dev/null 2>&1 &\"".format(i['host'], os.environ['AAMKS_SERVER'], os.environ['AAMKS_PATH']), shell=True)
                print("ssh -f -o ConnectTimeout=3 {} \" nohup gearman -w -h {} -f aRun xargs python3 {}/evac/worker.py > /dev/null 2>&1 &\"".format(i['host'], os.environ['AAMKS_SERVER'], os.environ['AAMKS_PATH']))

        self._gearman_register_results_collector()

# }}}
    def exec_command(self, cmd):# {{{
        ''' Exec cmd on each host enabled in conf.json '''

        self._access_hosts()
        for i in self.s.query("SELECT distinct(host),network FROM workers WHERE conf_enabled=1 ORDER BY network,host"):
            print('\n..........................................................')
            print(i['host'], "\t\t\t\t", i['network'])
            Popen("ssh -o ConnectTimeout=4 {} \"nohup sudo {} &\"".format(i['host'], cmd), shell=True)
            time.sleep(1)
# }}}
    def kill_by_pattern(self, pattern):# {{{
        ''' Kill process by pattern on each host registered at gearman $AAMKS_SERVER '''

        cmd="pkill -9 -f '^{}'".format(pattern)
        print(cmd)
        self._access_hosts()
        for i in self.s.query("SELECT distinct(host) FROM workers WHERE gearman_registered=1 ORDER BY network,host"):
            Popen("ssh -o ConnectTimeout=3 {} \"nohup sudo {} &\"".format(i['host'], cmd), shell=True)

# }}}
    def update_workers(self):# {{{
        ''' 
        * update git
        * install packages

        * SGSP specific -- you need to replace it on your own:
            * In SGSP we tag hosts as workers via this check in ~/.bashrc:
              [ -f "/etc/aamks_worker" ] && { export AAMKS_SERVER=192.168.100.131 }
            * In SGSP we use /home/svn/svn_mimooh/config/ for storing .bashrc
        '''

        self._access_hosts()
        for i in self.s.query("SELECT distinct(host) FROM workers WHERE conf_enabled=1 ORDER BY network,host"):
            cmds=[]
            cmds.append("ssh -o ConnectTimeout=3 {} ".format(i['host']))
            cmds.append("\"")
            cmds.append("echo ; echo ;")
            cmds.append("echo \`cat /etc/hostname\` ; ")
            cmds.append("svn co https://github.com/aamks/aamks.git/branches/0.2 $AAMKS_PATH; ")
            cmds.append("svn up /home/svn/svn_mimooh/configs; ")
            cmds.append("sudo apt-get install --yes python3-pip ipython3 python3-urllib3 gearman ; ")
            cmds.append("sudo -H pip3 install --upgrade pip ; ")
            cmds.append("sudo -H pip3 install networkX numpy ; ")
            cmds.append("rm -rf ~/.cache/; ")
            cmds.append("sudo touch /etc/aamks_worker; ")
            cmds.append("\"")
            Popen("".join(cmds), shell=True)
            time.sleep(5)

        for i in self.s.query("SELECT distinct(host) FROM workers WHERE conf_enabled=1 ORDER BY network,host"):
            cmds=[]
            cmds.append("ssh -o ConnectTimeout=3 {} ".format(i['host']))
            cmds.append("\"")
            cmds.append("echo ; echo ;")
            cmds.append("echo \`cat /etc/hostname\` ; ")
            cmds.append("unset LANG ; ")
            cmds.append("svn info {} | grep 'URL: https' ; ".format(os.environ['AAMKS_PATH']))
            cmds.append("svn info {} | grep 'Revision' ; ".format(os.environ['AAMKS_PATH']))
            cmds.append("svn info /home/svn/svn_mimooh/configs/ | grep 'Revision' ; ")
            cmds.append("echo AAMKS_SERVER: {} ; ".format(os.environ['AAMKS_SERVER']))
            cmds.append("\"")
            Popen("".join(cmds), shell=True)
            time.sleep(1)

# }}}
    def reset_gearmand(self):# {{{
        cmds="sudo killall -9 gearman 2>/dev/null; sudo /etc/init.d/gearman-job-server restart"
        Popen(cmds, shell=True)

# }}}
    def list_tasks(self):# {{{
        ''' Check gearmand status on localhost '''
        Popen('''gearadmin --workers; echo; echo "func\ttasks\tworking\tworkers"; gearadmin --status''', shell=True)
        time.sleep(2)

# }}}

    def _sqlite_import_hosts(self):# {{{
        ''' Create table with all potential hosts in it. 
        If host has has 4 cores enabled, then we will have 4 records in this table
        If host has 0 cores enabled, then we will still have 1 record for it, because host may be disabled just now, but has been gearman_registered previously
        '''

        self.s.query("CREATE TABLE workers('mac','host','broadcast','network','conf_enabled','gearman_registered')")
        for network,cores in self.conf['enabled_networks'].items():
            for record in self.conf['networks'][network]:
                record.append(network)
                if cores == 0:
                    record.append(0) # conf_enabled=0
                else:
                    record.append(1) # conf_enabled=1
                record.append(0) # gearman_registered=0 for now
                self.s.query('INSERT INTO workers VALUES (?,?,?,?,?,?)', record)
                for core in range(1,cores):
                    self.s.query('INSERT INTO workers VALUES (?,?,?,?,?,?)', record)

        proc = Popen(["gearadmin", "--workers"], stdout=PIPE)
        registered_hosts=[]
        for line in proc.stdout:
            x=str(line,'utf-8').split()
            try:
                self.s.query('UPDATE workers SET gearman_registered=1 WHERE host=?', (x[1],))
            except:
                pass
# }}}
    def _argparse(self):# {{{
        parser = argparse.ArgumentParser(description='options on localhost')

        parser.add_argument('-a' , help='add workers from conf.json'                                , required=False   , action='store_true')
        parser.add_argument('-c' , help='exec shell commands on each registered worker'             , required=False )
        parser.add_argument('-k' , help='kill all workers'                                          , required=False   , action='store_true')
        parser.add_argument('-K' , help='kill processes matching pattern e.g. "gearman.*127.0.0.1"' , required=False )
        parser.add_argument('-l' , help='list tasks'                                                , required=False   , action='store_true')
        parser.add_argument('-p' , help='ping all workers'                                          , required=False   , action='store_true')
        parser.add_argument('-r' , help='reset all gearmand '                                       , required=False   , action='store_true')
        parser.add_argument('-U' , help='update workers'                                            , required=False   , action='store_true')
        parser.add_argument('-w' , help='wakeOnLan'                                                 , required=False   , action='store_true')
        args = parser.parse_args()

        if args.a:
            self.add_workers()
        if args.c:
            self.exec_command(args.c)
        if args.k:
            self.kill_by_pattern("gearman|^cfast|^python3")
        if args.K:
            self.kill_by_pattern(args.K)
        if args.l:
            self.list_tasks()
        if args.p:
            self.ping_workers()
        if args.r:
            self.reset_gearmand()
        if args.U:
            self.update_workers()
        if args.w:
            self.wake_on_lan()
# }}}

manager=Manager()
print()
