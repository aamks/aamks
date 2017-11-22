import json
from collections import OrderedDict
import networkx as nx
import itertools
from math import sqrt


class GEOM_DTO:
    def __init__(self, sql_connection, aamks_vars):
        self._network_xpaths = {}
        self.graph_coords_seq = OrderedDict()
        self.geometry = []
        self.door_intersections = []
        self._doors_centers = {}

        self.general = aamks_vars['conf']['GENERAL']
        self.project_name = self.general['PROJECT_NAME']
        self.geometry = aamks_vars['geom']['geom']['1']
        self.sql_connection = sql_connection

    def __getattr__(self, item):
        return self.__dict__[item]

    def __setattr__(self, key, value):
        self.__dict__[key] = value

    def sql_query(self, query, params=tuple()):
        cursor = self.sql_connection.cursor()
        cursor.execute(query, params)
        return cursor.fetchall()

    def create_dbs(self):
        records = []
        for record in self.geometry:
            records.append([v for v in record.values()])
        cursor = self.sql_connection.cursor()
        cursor.execute('CREATE TABLE aamks_geom (name, floor, type_pri, type_sec, type_tri, x0, y0, z0, x1, y1, z1, '
                       'dim_x, dim_y, dim_z, center_x, center_y, center_z, vent_from_name, vent_to_name, how_much_open)')
        cursor.executemany('INSERT INTO aamks_geom VALUES (?,1,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)', records)

    def calculate_roadmaps(self, origins):
        self.find_door_pairs_graph()
        self.find_coordinates_sequence()

        rooms = [self.get_room(i) for i in origins]
        exits = [self.get_best_exit_from_room(i) for i in rooms]
        sequences = [self.graph_coords_seq[exits[i]] for i in range(len(exits))]

        goals = list()
        for i in sequences:
            goal = list()
            for k, v in i.items():
                goal.append(v)
            goals.append(goal)
        return goals

    def get_room(self, position: tuple):

        cursor = self.sql_connection.cursor()
        query = "SELECT name FROM aamks_geom WHERE x0 < {} AND x1 > {} AND y0 < {} AND y1 > {} AND type_pri='COMPA';" \
            .format(position[0], position[0], position[1], position[1])
        cursor.execute(query)
        results = cursor.fetchall()
        try:
            room = results[0]['name']
        except ValueError:
            print('There is no room with such positons', position)
        return room

    def get_floor_dim(self):
        query = "select min(x0) as xmin FROM aamks_geom"
        xmin = self.sql_query(query=query)
        query = "select min(y0) as ymin FROM aamks_geom"
        ymin = self.sql_query(query=query)
        query = "select max(x1) as xmax FROM aamks_geom"
        xmax = self.sql_query(query=query)
        query = "select max(y1) as ymax FROM aamks_geom"
        ymax = self.sql_query(query=query)
        results = [xmin[0], ymin[0], xmax[0], ymax[0]]
        return results

    def _setup_doors_centers(self):
        cursor = self.sql_connection.cursor()
        results = cursor.execute("SELECT * FROM aamks_geom WHERE type_tri='DOOR'")
        for i in results:
            self._doors_centers[i['name']] = (round(i['x0'] + (i['x1'] - i['x0']) / 2.0, 2),
                                              round(i['y0'] + (i['y1'] - i['y0']) / 2.0, 2))

    def find_door_pairs_graph(self):
        self._setup_doors_centers()
        doorPairs = []
        for k, v in self.door_intersections.items():
            if k != 'outside':
                for z in list(itertools.combinations(v, 2)):
                    doorPairs.append(z)

        triplets = []
        for doorPair in doorPairs:
            d0Center = self._doors_centers[doorPair[0]]
            d1Center = self._doors_centers[doorPair[1]]
            triplets.append((doorPair[0], doorPair[1],
                             round(sqrt((d0Center[0] - d1Center[0]) ** 2 + (d0Center[1] - d1Center[1]) ** 2), 2)))

        for doorOut in self.door_intersections['outside']:
            triplets.append(('outside', doorOut, 0))

        G = nx.Graph()
        G.add_weighted_edges_from(triplets)

        for k, v in nx.shortest_path(G, target='outside', weight='weight').items():
            v.remove('outside')
            if k != 'outside':
                self._network_xpaths[k] = v

    def find_coordinates_sequence(self):

        for k, v in self._network_xpaths.items():
            self.graph_coords_seq[k] = OrderedDict()
            for d in v:
                self.graph_coords_seq[k][d] = (self._doors_centers[d][0], self._doors_centers[d][1])

    def get_best_exit_from_room(self, name: str):
        least_hops = 9999999
        chosen = None
        cursor = self.sql_connection.cursor()
        results = cursor.execute("select * from aamks_geom where (vent_from_name=? or vent_to_name=?) "
                                 "and type_tri='DOOR'", (name, name))
        for candidate in results:
            assert candidate['name'] in self.graph_coords_seq, 'No escape via door: {}'.format(candidate['name'])
            if len(self.graph_coords_seq[candidate['name']]) < least_hops:
                least_hops = len(self.graph_coords_seq[candidate['name']])
                chosen = candidate['name']
        assert chosen is not None, 'Room without door: {}'.format(candidate['name'])
        return chosen

    def get_origins(self):
        rooms = self.sql_query("SELECT x0, x1, y0, y1, (x1-x0)*(y1-y0) as area FROM aamks_geom WHERE type_sec='ROOM'")
        positions = list()
        for r in rooms:
            x = self.mc_dto.uniform(r['x0'] + self.config['wall_margin'], r['x1'] - self.config['wall_margin'],
                                    int(r['area'] / self.density['room']))
            y = self.mc_dto.uniform(r['y0'] + self.config['wall_margin'], r['y1'] - self.config['wall_margin'],
                                    int(r['area'] / self.density['room']))
            positions += list(zip(x, y))
        positions = [tuple([round(float(i), 2) for i in l]) for l in positions]
        return positions
