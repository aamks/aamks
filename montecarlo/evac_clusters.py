import sys
import re
import os
import numpy as np
from collections import OrderedDict
import json
from shapely.geometry import box, Polygon, LineString, Point, MultiPolygon
import zipfile
from include import Sqlite
from include import Json
from include import SimIterations
from include import Vis
from random import randint, randrange
from sklearn.cluster import MeanShift

class EvacClusters():

    def __init__(self,dispatched_evacuees):
        self.json=Json()
        self.conf=self.json.read("{}/conf.json".format(os.environ['AAMKS_PROJECT']))
        # si=SimIterations(self.conf['project_id'], self.conf['scenario_id'], self.conf['number_of_simulations'])
        self.dispatched_evacuees = dispatched_evacuees
        self.all_leaders_id = []
        self.all_followers_id = []
       
        self.main()
        

    def main(self):
        self.evacues_grouped_by_rooms = self.group_by_rooms() 
        # self.find_cluster_in_whole_building()
        self.find_clusters_in_one_floor()
        self.write_to_json_file()
        self.flatten_agents()
        self.sort_agents()
        self.get_all_leders()
        # self.update_json()

    def group_evacuees_by_rooms(self):
        grouped_by_rooms = {}
        for floor, evacuees in self.dispatched_evacuees.items():
            grouped_by_rooms[floor] = {}
            for coordinates in evacuees:
                room_type = coordinates[2]
                room_coordinates = tuple(coordinates[:2])
                if room_type not in grouped_by_rooms[floor]:
                    grouped_by_rooms[floor][room_type] = {
                    "positions": [room_coordinates],
                    "clusters": {}
                    }
                else:
                    grouped_by_rooms[floor][room_type]['positions'].append(room_coordinates)
        return grouped_by_rooms
    
    def group_by_rooms(self):
        grouped_by_rooms = {}
        for id, evacuee in enumerate(self.dispatched_evacuees):
            room = evacuee[2]
            evacuee_coordinates = tuple(evacuee[:2])
            if room not in grouped_by_rooms:
                grouped_by_rooms[room] = {
                "positions": [evacuee_coordinates],
                "clusters": {}
                }
            else:
                grouped_by_rooms[room]['positions'].append(evacuee_coordinates)
        return grouped_by_rooms

    def cluster_one_room(self, positions_in_room):
        ms = MeanShift()
        ms.fit(np.array(positions_in_room))
        cluster_centers = ms.cluster_centers_
        labels = ms.labels_
        clustered_dict = {}
        for label in labels:
            if label not in clustered_dict:
                clustered_dict[int(label)] = {
                    "agents": [],
                    "center": "",
                    "leader": ""
                }

        for position, label in zip(positions_in_room, labels):
            agent = {"position": position,
                     "leader": "",
                     "type": "",
                     }
            clustered_dict[label]['agents'].append(agent)
        for cl_num, cluster in enumerate(clustered_dict):
            clustered_dict[cluster]['center'] = tuple([int(x) for x in cluster_centers[cluster]])
            leader = tuple(self.find_position_nearest_center([agent['position'] for agent in clustered_dict[cluster]['agents']], clustered_dict[cluster]['center']))
            clustered_dict[cluster]['leader'] = leader
            for agent in clustered_dict[cluster]['agents']:
                agent['leader'] = leader
                agent['type'] = self.check_type(agent['position'], leader)
                # agent['color'] = "red"

        return clustered_dict

    def check_type(self, position, leader):
        if position == leader:
            return "leader"
        else:
            return "follower"
        
    def add_color(self, type, num):
        if type == "leader":
            return -1
        else:
            return num%9

    def find_position_nearest_center(self, positions, center):
        positions_array = np.array(positions)
        distances = np.linalg.norm(positions_array - center, axis=1)
        closest_index = np.argmin(distances)
        closest_position = positions[closest_index]
        return tuple(closest_position)

    # def find_cluster_in_whole_building(self):
    #     for floor in self.evacues_grouped_by_rooms:
    #         for room in self.evacues_grouped_by_rooms[floor]:
    #             clustered_room = self.cluster_one_room(self.evacues_grouped_by_rooms[floor][room]['positions'])
    #             self.evacues_grouped_by_rooms[floor][room]["clusters"] = clustered_room

    def find_clusters_in_one_floor(self):
        for room in self.evacues_grouped_by_rooms:
            clustered_room = self.cluster_one_room(self.evacues_grouped_by_rooms[room]['positions'])
            self.evacues_grouped_by_rooms[room]["clusters"] = clustered_room
            
    def write_to_json_file(self):
        pwd = os.path.join(os.environ['AAMKS_PROJECT'], "cluster.json")
        with open(pwd, "w") as file:
            json.dump(self.evacues_grouped_by_rooms, file)

    def new_Vis(self):
        anim=OrderedDict([("simulation_id",self.simulation_id), ("simulation_time",0), ("time_shift",0)])
        anim_evacuees=[OrderedDict(), OrderedDict()]
        anim_rooms_opacity=[OrderedDict(), OrderedDict()]
        frame=[]

        for floor in self.evacues_grouped_by_rooms:
            for room in self.evacues_grouped_by_rooms[floor]:
                for cluster in self.evacues_grouped_by_rooms[floor][room]["clusters"]:
                    # print(self.evacues_grouped_by_rooms[floor][room]["clusters"][cluster])
                    for pos_type_color in self.evacues_grouped_by_rooms[floor][room]["clusters"][cluster]['positions']:
                        frame.append([pos_type_color[0][0] ,pos_type_color[0][1], 0,"N", 3])
                        # print(frame)
                    anim_evacuees[0][floor]=frame
                    anim_evacuees[1][floor]=frame
                    anim_rooms_opacity[0][floor]={}
                    anim_rooms_opacity[1][floor]={}

        anim['animations']=OrderedDict([("evacuees", anim_evacuees), ("rooms_opacity", anim_rooms_opacity)])
        self._write_anim_zip(anim) 
        Vis({'highlight_geom': None, 'anim': None, 'title': 'Clustering', 'srv': 1, 'anim': "{self.simulation_id}/clustering.zip"})


    def flatten_agents(self):
        """ return list of agents [ {pos, lead, type},{pos, lead, type}, (...) ] in every floor"""
        self.agents_flat = []
        for room in self.evacues_grouped_by_rooms:
            for cluster in self.evacues_grouped_by_rooms[room]["clusters"]:
                pre_evac_time = float(randrange(20,120,20))
                print(pre_evac_time)
                for agent in self.evacues_grouped_by_rooms[room]["clusters"][cluster]["agents"]:
                    agent_data = {
                        "position": agent["position"],
                        "leader": agent["leader"],
                        "type": agent['type'],
                        "id": -1,
                        "leader_id": self.get_agent(*agent["leader"]),
                        "pre_evac": pre_evac_time
                    }
                    self.agents_flat.append(agent_data)

    def sort_agents(self):
        for agent in self.agents_flat:
            agent['id'] = self.get_agent(agent["position"][0],agent["position"][1])
        self.sorted_agents_flat = sorted(self.agents_flat, key = lambda agent:agent['id'])

    def get_agent(self, x, y):
        for id, evacuee in enumerate(self.dispatched_evacuees):
            if tuple(evacuee[:2]) == tuple((x,y)):
                return id

    def _write_anim_zip(self,anim):# {{{
        zf = zipfile.ZipFile("{}/workers/{}/clustering.zip".format(os.environ['AAMKS_PROJECT'], *self.simulation_id) , mode='w', compression=zipfile.ZIP_DEFLATED)
        try:
            zf.writestr("anim.json", json.dumps(anim))
        finally:
            zf.close()

    def update_json(self):
        data = self.json.read("{}/workers/{}/evac.json".format(os.environ['AAMKS_PROJECT'], *self.simulation_id))
        for floor in data['FLOORS_DATA']:
            for evacue in data['FLOORS_DATA'][floor]["EVACUEES"]:
                position = data['FLOORS_DATA'][floor]["EVACUEES"][evacue]['ORIGIN']
                # data['FLOORS_DATA'][floor]["EVACUEES"][evacue]["leader"], data['FLOORS_DATA'][floor]["EVACUEES"][evacue]["type"] = self.get_data_of_agent(floor, position)
        self.json.write(data,"{}/workers/{}/evac.json".format(os.environ['AAMKS_PROJECT'],*self.simulation_id))


    def get_data_of_agent(self, floor, agent_pos):
        for agent in self.agents_flat[floor]:
            if agent['position'] == tuple(agent_pos):
                return agent['leader'], agent['type']

    def get_all_leders(self):
        for agent in self.sorted_agents_flat:
            if agent['type'] == "leader":
                self.all_leaders_id.append(agent['id'])