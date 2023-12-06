import sys
import re
import os
import shutil
import math
import numpy as np
from collections import OrderedDict
import json
import getopt
from pprint import pprint
import codecs
from subprocess import Popen,call
from shapely.geometry import box, Polygon, LineString, Point, MultiPolygon
import zipfile
from include import Sqlite
from include import Json
from include import SimIterations
from include import Vis

from sklearn.cluster import MeanShift

class EvacClusters():

    def __init__(self):
        self.json=Json()
        self.conf=self.json.read("{}/conf.json".format(os.environ['AAMKS_PROJECT']))
        self.conf['evac_clusters']=1
        if self.conf['evac_clusters']==0:
            return
        self.s=Sqlite("{}/aamks.sqlite".format(os.environ['AAMKS_PROJECT']))

        self.conf=self.json.read("{}/conf.json".format(os.environ['AAMKS_PROJECT']))
        self.evacuee_radius=self.json.read('{}/inc.json'.format(os.environ['AAMKS_PATH']))['evacueeRadius']
        self.dispatched_evacuees=self.json.readdb("dispatched_evacuees")

        si=SimIterations(self.conf['project_id'], self.conf['scenario_id'], self.conf['number_of_simulations'])
        # print("SIM ITERATIONS: ", si)
        self.simulation_id = list(range(*si.get()))
        # print(self.simulation_id)   
        self.main()
        

    def main(self):
        self.get_all_compas() # czy dict wszystkich compas bedzie potrzebny?
        self.group_evacuees_by_rooms() 
        room = self.group_evacuees_by_rooms() 
        self.cluster_one_room(room['0']['r1']) 
        # self._clustering()
        # self._vis_clusters()
        # self._update_json()

    def get_all_compas(self):
        all_compas = {}
        for floor, evacuees in self.dispatched_evacuees.items():
            all_compas[floor] = set()
            for evacuue in evacuees:
                comp = evacuue[2]
                all_compas[floor].add(comp)
        return all_compas
    
    def group_evacuees_by_rooms(self):
        grouped_by_rooms = {}
        for floor, evacuees in self.dispatched_evacuees.items():
            grouped_by_rooms[floor] = {}
            for coordinates in evacuees:
                room_type = coordinates[2]
                room_coordinates = tuple(coordinates[:2])
                if room_type not in grouped_by_rooms[floor]:
                    grouped_by_rooms[floor][room_type] = [room_coordinates]
                else:
                    grouped_by_rooms[floor][room_type].append(room_coordinates)
        return grouped_by_rooms

    def cluster_one_room(self, positions_in_room):
        ms = MeanShift()
        ms.fit(np.array(positions_in_room))
        cluster_centers = ms.cluster_centers_
        labels = ms.labels_
        print(labels)
        clustered_dict = {}
        
        for label in labels:
            if label not in clustered_dict:
                clustered_dict[label] = {
                    "positions": [],
                    "center": ""
                }

        for position, label in zip(positions_in_room, labels):
            clustered_dict[label]['positions'].append(position)
        for cluster in clustered_dict:
            clustered_dict[cluster]['center'] = cluster_centers[cluster]

        print(clustered_dict)


    def cluster_leader(self, center, points):
        points = tuple(map(tuple, points))
        dist_2 = np.sum((points - center) ** 2, axis=1)
        return points[np.argmin(dist_2)]

    def _clustering(self):
        try:
            self.s.query("CREATE TABLE clustering_info(room varchar, cluster int, number int, pos_x float,pos_y float,lead_x float,lead_y float, agent_type varchar)")
        except Exception as e:
            print(e)
        ms = MeanShift()
        self.clusters = {}
        evacues = []
        leaders = []
        types= ['follower', 'active']
        for floor, rooms in self.dispatched_rooms.items():
            self.clusters[floor]={}
            for room, positions in rooms.items():
                self.clusters[floor][room]=OrderedDict()
                z = np.array(positions)
                ms.fit(z)
                cluster_centers = ms.cluster_centers_
                labels = ms.labels_


                for i in sorted(labels):
                    self.clusters[floor][room][i]=OrderedDict([('agents', [])])
                for idx,i in enumerate(labels):
                    self.clusters[floor][room][i]['agents'].append(self.dispatched_rooms[floor][room][idx])
                    pos_x,pos_y = self.dispatched_rooms[floor][room][idx]
                    self.clusters[floor][room][i]['leader']=self._cluster_leader(cluster_centers[i], self.clusters[floor][room][i]['agents'])
                    evacues.append([room , int(i), idx, pos_x, pos_y])
                for idx, i in enumerate(labels):
                    self.clusters[floor][room][i]['center']=cluster_centers[i]
                    self.clusters[floor][room][i]['leader']=self._cluster_leader(cluster_centers[i], self.clusters[floor][room][i]['agents'])
                    leaders.append([self.clusters[floor][room][i]['leader'][0],self.clusters[floor][room][i]['leader'][1]] )

        "fetching tablesY needed for database"
        to_database = []
        for i,j in zip(evacues, leaders):
            i.extend(j)
            to_database.append(i)


        """ adding evacue type, compare x,y position"""
        x1 = 3
        y1 = 4
        x2 = 5
        y2 = 6
        for i in to_database:
            if i[x1]==i[x2] and i[y1]==i[y2]:
                i.append('active')
            else:
                i.append('follower')


        self.s.executemany("INSERT INTO clustering_info VALUES (?,?,?,?,?,?,?,?)", to_database)

    def _vis_clusters(self):# {{{
        '''
        We have 9 colors for clusters and 1 color for the leader of the cluster
        Colors are defined in aamks/inc.json as color_0, color_1, ...
        '''

        anim=OrderedDict([("simulation_id",1), ("simulation_time",0), ("time_shift",0)])

        anim_evacuees=[OrderedDict(), OrderedDict()]
        anim_rooms_opacity=[OrderedDict(), OrderedDict()]
        color_iterator=0
        for floor,floors in self.clusters.items():
            frame=[]
            for room,rooms in floors.items():
                for cid,clusters in rooms.items():
                    color_iterator+=1
                    for agent in clusters['agents']:
                        frame.append([agent[0],agent[1],0,0,str(color_iterator%9),1])
                    frame.append([clusters['leader'][0], clusters['leader'][1], 0, 0, str(9),1])
                    
                    anim_evacuees[0][floor]=frame
                    anim_evacuees[1][floor]=frame
                    anim_rooms_opacity[0][floor]={}
                    anim_rooms_opacity[1][floor]={}
        anim['animations']=OrderedDict([("evacuees", anim_evacuees), ("rooms_opacity", anim_rooms_opacity)]) 
        self._write_anim_zip(anim)
        Vis({'highlight_geom': None, 'anim': None, 'title': 'Clustering', 'srv': 1, 'anim': "1/clustering.zip"})

# }}}
    def _write_anim_zip(self,anim):# {{{
        zf = zipfile.ZipFile("{}/workers/{}/clustering.zip".format(os.environ['AAMKS_PROJECT'], 1) , mode='w', compression=zipfile.ZIP_DEFLATED)
        try:
            zf.writestr("anim.json", json.dumps(anim))
        finally:
            zf.close()


    def _update_json(self):
        """adding leader posistions for agents"""
        data = self.json.read("{}/workers/{}/evac.json".format(os.environ['AAMKS_PROJECT'], *self.simulation_id))

        for floor in data['FLOORS_DATA']:
            for num, evacue in enumerate(data['FLOORS_DATA'][floor]["EVACUEES"]):
                data['FLOORS_DATA'][floor]["EVACUEES"][evacue]["LEADER_POSITION"] = self.s.query("SELECT lead_x,lead_y FROM clustering_info WHERE rowid = ?", (str(num+1),))
                data['FLOORS_DATA'][floor]["EVACUEES"][evacue]["EVACUE_TYPE"] = self.s.query( "SELECT agent_type FROM clustering_info WHERE rowid = ?", (str(num + 1),))
        self.json.write(data,"{}/workers/{}/evac.json".format(os.environ['AAMKS_PROJECT'],*self.simulation_id))


