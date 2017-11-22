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
            os.remove("{}/manage_aamks.sqlite".format(os.environ['AAMKS_PROJECT']))
        except OSError:
            pass
            
        self.s=Sqlite("{}/manage_aamks.sqlite".format(os.environ['AAMKS_PROJECT']))
        self.json=Json()
        self.conf=self.json.read("{}/a-manager/conf.json".format(os.environ['AAMKS_PATH']))
        self._sqlite_import_hosts()
        self._argparse()

# }}}

    def ping_workers(self):# {{{
        for i in self.s.query("SELECT distinct(host),network FROM workers WHERE conf_enabled=1 ORDER BY network,host"):
            Popen('''host={}; net={}; nc -w 2 -z $host 22 2>/dev/null && {{ echo "$host\t($net)\t●"; }} || {{ echo "$host ($net)\t-"; }}'''.format(i['host'],i['network']), shell=True)
        time.sleep(2)
# }}}
    def wake_on_lan(self):# {{{
        for i in self.s.query("SELECT distinct(host),mac,broadcast FROM workers WHERE conf_enabled=1 ORDER BY network,host"):
            Popen("wakeonlan -i {} {}".format(i['broadcast'], i['mac']), shell=True)
        time.sleep(2)

# }}}
    def add_workers(self):# {{{
        ''' Register each host enabled in conf.json to gearman $AAMKS_SERVER (.bashrc) '''

        for i in self.s.query("SELECT host FROM workers WHERE conf_enabled=1 ORDER BY network,host"):
            Popen("ssh -f -o ConnectTimeout=3 {} \" nohup gearman -w -h {} -f gEGG xargs python3 {}/evac/run.py > /dev/null 2>&1 &\"".format(i['host'], os.environ['AAMKS_SERVER'], os.environ['AAMKS_PATH']), shell=True)

# }}}
    def exec_command(self, cmd):# {{{
        ''' Exec cmd on each host enabled in conf.json '''

        for i in self.s.query("SELECT distinct(host),network FROM workers WHERE conf_enabled=1 ORDER BY network,host"):
            print('\n..........................................................')
            print(i['host'], "\t\t\t\t", i['network'])
            Popen("ssh -o ConnectTimeout=4 {} \"nohup sudo {} &\"".format(i['host'], cmd), shell=True)
            time.sleep(self.sleep)
# }}}
    def kill_by_pattern(self, pattern):# {{{
        ''' Kill process by pattern on each host registered at gearman $AAMKS_SERVER '''

        cmd="pkill -9 -f '^{}'".format(pattern)
        print(cmd)
        for i in self.s.query("SELECT distinct(host) FROM workers WHERE gearman_registered=1 ORDER BY network,host"):
            Popen("ssh -o ConnectTimeout=3 {} \"nohup sudo {} &\"".format(i['host'], cmd), shell=True)

# }}}
    def revert_svn_mimooh(self):# {{{
        for i in self.s.query("SELECT distinct(host) FROM workers WHERE conf_enabled=1 ORDER BY network,host"):
            Popen("ssh -o ConnectTimeout=3 {} \"nohup sudo svn revert /home/svn/svn_mimooh --depth infinity  &\"".format(i['host']), shell=True)

# }}}
    def update_workers(self):# {{{
        ''' Update svn on each host enabled in conf.json. Check if all packages are installed. Etc. '''

        for i in self.s.query("SELECT distinct(host) FROM workers WHERE conf_enabled=1 ORDER BY network,host"):
            cmds=[]
            cmds.append("ssh -o ConnectTimeout=3 {} ".format(i['host']))
            cmds.append("\"")
            cmds.append("printf \`cat /etc/hostname\` > /tmp/aamks_validate.log; ")
            cmds.append("printf ': ' >> /tmp/aamks_validate.log; ")
            cmds.append("sudo chown -R mimooh /home/mimooh;")
            cmds.append("svn up /home/svn/svn_mimooh; ")
            cmds.append("svn log /home/svn/svn_mimooh -l 1 | head -n 2 | tail -n 1 >> /tmp/aamks_validate.log; ")
            cmds.append("sudo apt-get install --yes python3-pip python3-psycopg2 python3-numpy ipython3 python3-urllib3 gearman >> aamks_validate.log; ")
            cmds.append("rm -rf /home/mimooh/.cache/; ")
            cmds.append("sudo -H pip3 install networkX >> aamks_validate.log; ")
            cmds.append("\"")
            Popen("".join(cmds), shell=True)

        time.sleep(5)
        Popen("rm -rf /tmp/aamks_validate; mkdir /tmp/aamks_validate;", shell=True)
        for i in self.s.query("SELECT distinct(host) FROM workers WHERE conf_enabled=1 ORDER BY network,host"):
            Popen("scp {}:/tmp/aamks_validate.log /tmp/aamks_validate/{};".format(i['host'],i['host']), shell=True)

        time.sleep(2)
        Popen("cat /tmp/aamks_validate/* | sed 's%\s%\t%' | sort", shell=True)
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
    def run_aamks(self):# {{{
        ''' Run aamks: cd $AAMKS_PATH; python3 aamks.py $AAMKS_PROJECT '''

        try:
            Popen("cd {}; python3 aamks.py {}".format(os.environ['AAMKS_PATH'], os.environ['AAMKS_PROJECT']), shell=True)
        except:
            print("You need to define AAMKS_PROJECT=/some/path in ~/.bashrc")

# }}}

    def _sqlite_import_hosts(self):# {{{
        ''' Create table with all potential hosts in it. 
        If host has has 4 cores enabled, then we will have 4 records in this table
        If host has 0 cores enabled, then we will still have 1 record for it, because host may be disabled just now, but has been gearman_registered previously
        '''

        self.s.query("create TABLE workers('mac','host','broadcast','network','conf_enabled','gearman_registered')")
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
        parser.add_argument('-s' , help='sleep seconds between commands, default 0'                 , required=False   , type=int, default=0)
        parser.add_argument('-U' , help='update and validate workers'                               , required=False   , action='store_true')
        parser.add_argument('-Q' , help='svn_mimooh revert on workers'                              , required=False   , action='store_true')
        parser.add_argument('-w' , help='wakeOnLan'                                                 , required=False   , action='store_true')
        parser.add_argument('-X' , help='python3 aamks.py $AAMKS_PROJECT'                         , required=False   , action='store_true')
        args = parser.parse_args()

        self.sleep=args.s
        if args.a:
            self.add_workers()
        if args.c:
            self.exec_command(args.c)
        if args.k:
            self.kill_by_pattern("pkill -9 -f 'gearman|^cfast|^python3'")
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
        if args.Q:
            self.revert_svn_mimooh()
        if args.w:
            self.wake_on_lan()
        if args.X:
            self.run_aamks()
# }}}

        
 # }}}
manager=Manager()
print()
