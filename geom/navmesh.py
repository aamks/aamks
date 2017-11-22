import json
import math
from itertools import combinations

import matplotlib.pyplot as plt
import networkx as nx
import numpy as np
from pyhull.delaunay import DelaunayTri
from pyhull.simplex import Simplex
from shapely.geometry import Polygon
from shapely.geometry import box


class NavMesh:
    def __init__(self):
        self.portals_with_centres = dict()
        self.portals = []
        self.G = nx.Graph()
        self.points = []
        self.mid_points = []
        self.evacuee_size = 40

    def import_data(self):
        """
        The function transforms data from goem.json file creating the set of points and set of cuboids obstacles.
        :return: Set of points and obstacles.
        """
        with open('geom.json', 'r') as f:
            data = json.loads(f.read())

        obstacles = data['obstacles']['1']

        points = []
        for i in obstacles:
            for n in i:
                points.append(n)
        points = np.array(self.remove_duplicate_points(points))

        obst = []
        for i in obstacles:
            x, y = zip(*i)
            obst.append(box(min(x), min(y), max(x), max(y)))
        return points, obst

    @staticmethod
    def remove_duplicate_points(point_set):
        """
        Removes duplicates from points set
        :param point_set: set of points from obstacles
        :return: set of points without duplicates
        """
        list_tmp = []
        for i in point_set:
            list_tmp.append(tuple(i))
        list_tmp = set(list_tmp)
        return [list(n) for n in list_tmp]

    @staticmethod
    def midpoint(segment):
        """
        Finds the middle points of the edges
        :param segment: edge
        :return: center of the edge
        """
        return (segment[0][0] + segment[1][0]) / 2, (segment[0][1] + segment[1][1]) / 2

    @staticmethod
    def triangle():
        """
        Does a triangulation. From a set of points creates a triangulation
        :return: Vertices of the triangles
        """
        tri = DelaunayTri(points)
        print(list(tri))
        return tri.vertices

    def remove_obstacles_tri(self, triangles, obstacles):
        """
        Removes triangles incorporated in obstacles
        :param triangles: set of vertices from triangulation
        :param obstacles: set of obstacles representing building walls
        :return: New set of vertices in a form o triangles
        """
        ver_remove = []
        for i in triangles:
            for n in obstacles:
                if n.contains(Polygon(self.points[i])):
                    ver_remove.append(i)

        ver_n = []
        for i in triangles:
            if ver_remove.count(i) == 0:
                ver_n.append(i)
        return ver_n

    def calculate_portals(self, vertices):
        """
        Creates edges from set of triangles
        :param vertices: triplet of vertices
        :return: set of edges
        """

        # Builds edges as a combination of vertices of the triangle
        edges = []
        for i in vertices:
            as_tuple = [tuple(n) for n in self.points[i]]
            edges.append(list(combinations(as_tuple, r=2)))

        # Calculates a central point of the edge and creates dict of portals where key is the central point of edge and
        # values are its vertices
        for i in edges:
            tri = []
            for k in i:
                tri.append(self.midpoint(k))
                self.portals_with_centres.update({self.midpoint(k): k})
            self.portals.append(tri)

    def add_portals_to_graph(self):
        """
        Creates a graph of path based on the adjacency of edges. For vertices of triangle it creates pair of points
        representing edges and then for each of the edges combination it creates pair of nodes in graphs. We assume that
        we can travel from one edge to another because they belong to the same triangle.
        :return: None
        """
        for i in self.portals:
            self.G.add_edges_from(list(combinations(i, r=2)))

    def order_portals(self, path):
        """
        Function aligns orientation of the edges across the path. Left vertices of the edges should stay on the lef hand
        side. It uses cross product and the vectors started from midpoint of the previous edge and the vertices of the
        edge.
        :param path: Path with edges and midpoints
        :return: arranged path of the edges.
        """
        portals = []
        sign = None
        for i in range(len(path)):
            if i == 0:
                sign = self.vector_calculi(origin, self.portals_with_centres[path[i]][0], self.portals_with_centres[path[i]][1])
                if sign['cross_prod'] >= 0:
                    portals.append(self.portals_with_centres[path[i]])
                else:
                    portals.append([self.portals_with_centres[path[i]][1], self.portals_with_centres[path[i]][0]])
                    sign['cross_prod'] = 1
            else:
                sign_t = self.vector_calculi(path[i - 1], self.portals_with_centres[path[i]][0],
                                             self.portals_with_centres[path[i]][1])
                change = sign['cross_prod'] * sign_t['cross_prod']
                if change < 0:
                    portals.append([self.portals_with_centres[path[i]][1], self.portals_with_centres[path[i]][0]])
                else:
                    portals.append(self.portals_with_centres[path[i]])
        return portals

    def find_closest_edge(self, point, vertices):
        """
        Finds the closest edge of the triangle containing the origin of a evacuee.
        :param point: Point defining the origin of the evacuee.
        :param vertices: List of vertices defining triangles
        :return: Starting portal, edge for the evacuee.
        """
        start_vertex = []
        for i in vertices:
            s = Simplex(points[i])
            if s.in_simplex(point):
                x = list(combinations(s.coords, r=2))
        for i in x:
            start_vertex.append(self.midpoint(i))
        return start_vertex

    def find_shortest_path(self, origin, target, midpoinds):
        """
        Returns the set of vertices defining the path from origin to the target using midpoints of eges.
        :param origin: Starting point of evacuee.
        :param target: Exit from the floor.
        :param midpoinds: Set of midpoinst of the edges defining the vertices to travel.
        :return: Path containing set of vertices to travel.
        """
        dist = []
        for i in midpoinds:
            l = float(nx.shortest_path_length(self.G, source=i, target=target))
            d = math.sqrt((i[0] - origin[0]) ** 2 + (i[1] - origin[1]) ** 2)
            dist.append(l + d)
        ind = dist.index(min(dist))
        shx = nx.shortest_path(self.G, source=midpoinds[ind], target=target)
        return shx

    def find_next_node(self, current_ind, orientation):
        """
        Finds the vertex for the leg crossed by another leg after apex update.
        It finds the next vertex in the portal list which is not the same as current one (different
        edges my have common vertex).
        :param current_ind: Current index of the vertex in the portal list.
        :param orientation: Which leg left or right.
        :return: New position for the leg.
        """
        i = current_ind

        if orientation == 'L':
            node = 0
        else:
            node = 1

        edge_node = portals[current_ind][node]

        while i < len(self.portals):
            if portals[i][node] != portals[current_ind][node]:
                edge_node = portals[i][node]
                break
            i += 1
        return edge_node

    @staticmethod
    def normalize(apex, point):
        """
        Normalises vector defined by two points. Mosty vector is defined from apex to left or right leg.
        :param apex: First point of apex.
        :param point: Second point of leg vertex.
        :return: Unit vector
        """
        v = (point[0] - apex[0], point[1] - apex[1])
        vmag = math.sqrt(sum(v[i] * v[i] for i in range(len(v))))
        norm = [v[i] / vmag for i in range(len(v))]
        return norm

    def vector_calculi(self, apex, l_point, r_point):
        """
        Calculates cross and dot product of two vectors. The vectors are defined as legs of funnel, between
        apex and left and right nodes vertex.
        :param apex: Apex of the funnel.
        :param l_point: Vertex of the left leg.
        :param r_point: Vertex of the right leg.
        :return: Dictionary of cross and dot products.
        """

        l_vec = self.normalize(apex, l_point)
        r_vec = self.normalize(apex, r_point)
        dot_prod = np.dot(l_vec, r_vec)
        cross_prod = np.cross(l_vec, r_vec)
        vectors = {"cross_prod": cross_prod, "dot_prod": dot_prod}
        return vectors

    def calculate_offset(self, index, orientation):
        """
        Points obtained from the funnel are placed in the border of a obstacle. Evacuees should have defined
        an offset in order not to be led to the obstacle. The function calculates this offset from the corner.
        :param index: Index of the vertex in the portal set crossed by other leg.
        :param orientation: Which leg left or right.
        :return: Point with proper offset from the corner.
        """
        i = index

        if orientation == 'L':
            node = 0
        else:
            node = 1

        next_node = portals[index][node]
        prev_node = portals[index][node]
        apex_point = portals[index][node]

        while i < len(self.portals):
            if portals[i][node] != apex_point:
                next_node = portals[i][node]
                break
            i += 1

        i = index
        while i > -1:
            if portals[i][node] != apex_point:
                prev_node = portals[i][node]
                break
            i -= 1

        next_angle = math.atan2(next_node[1] - apex_point[1], next_node[0] - apex_point[0])
        prev_angle = math.atan2(apex_point[1] - prev_node[1], apex_point[0] - prev_node[0])

        distance = next_angle - prev_angle
        if distance >= 0:
            distance += math.pi * 2

        d_angle = prev_angle + (distance / 2) + math.pi / 2
        normal = (math.cos(d_angle), math.sin(d_angle))
        return apex_point[0] + normal[0] * self.evacuee_size, apex_point[1] + normal[1] * self.evacuee_size

    def funnel(self, portals, pos):
        """
        Smoothies path from starting point to exit with using funnel algorithm.
        :param portals: Set of portals.
        :param pos: Starting point of the evacuee.
        :return: Set of point smoothed path.
        """
        apex = pos
        road_map = [apex]
        l_index = 0
        r_index = 0
        l_portal = portals[0][0]
        r_portal = portals[0][1]
        s_relation = self.vector_calculi(apex, l_portal, r_portal)
        angle = s_relation['dot_prod']

        for i in range(len(portals)):

            # Checks whether edges is defined by other point for left leg.
            if l_portal != portals[i][0]:
                t_relation = self.vector_calculi(apex, portals[i][0], r_portal)

                # Checking whether the leg crosses other leg. When cross product changes sign and dot product
                # is greater than 0 (in order to omit sign changes of cross product in Pi)
                if (t_relation['cross_prod'] * s_relation['cross_prod'] < 0) and (t_relation['dot_prod'] >= 0):
                    apex = r_portal
                    road_map.append(self.calculate_offset(r_index, 'R'))
                    r_portal = self.find_next_node(r_index, 'R')
                    angle = self.vector_calculi(apex, l_portal, r_portal)['dot_prod']
                else:
                    if t_relation['dot_prod'] >= angle:
                        l_portal = portals[i][0]
                        l_index = i
                        angle = self.vector_calculi(apex, l_portal, r_portal)['dot_prod']

            # Checks whether edges is defined by other point for left leg.
            if r_portal != portals[i][1]:
                t_relation = self.vector_calculi(apex, l_portal, portals[i][1])
                # Checking whether the leg crosses other leg. When cross product changes sign and dot product
                # is greater than 0 (in order to omit sign changes of cross product in Pi)
                if (t_relation['cross_prod'] * s_relation['cross_prod'] < 0) and (t_relation['dot_prod'] >= 0):
                    apex = l_portal
                    road_map.append(self.calculate_offset(l_index, 'L'))
                    l_portal = self.find_next_node(l_index, 'L')
                    angle = self.vector_calculi(apex, l_portal, r_portal)['dot_prod']
                else:
                    if t_relation['dot_prod'] >= angle:
                        r_portal = portals[i][1]
                        r_index = i
                        angle = self.vector_calculi(apex, l_portal, r_portal)['dot_prod']
        road_map.append(self.mid_points[i])
        return road_map


n = NavMesh()
# Transform geom.json file into set of points and obstacles.
points, obst = n.import_data()
n.points = points

# Triangulation of the set of points
ver = n.triangle()
plt.triplot(points[:, 0], points[:, 1], ver, linewidth=3.0)
plt.plot(points[:, 0], points[:, 1], 'o')

# Removing triangles incorporated in obstacles
ver1 = n.remove_obstacles_tri(ver, obst)
#plt.triplot(points[:, 0], points[:, 1], ver1)
#plt.plot(points[:, 0], points[:, 1], 'o')

# Calculates portals from triplet vertices
n.calculate_portals(ver1)

n.add_portals_to_graph()

origin = (1300, 900)
target=(2890, 244)
starts = n.find_closest_edge(origin, ver)
shx = n.find_shortest_path(origin=origin, target=target, midpoinds=starts)

n.mid_points = shx

portals = n.order_portals(shx)
# portals.append(tuple([tuple(n.mid_points[-1]), tuple(n.mid_points[-1])]))
left = []
right = []
for i in portals:
    left.append(i[0])
    right.append(i[1])


funnel = n.funnel(portals, origin)

x, y = zip(*funnel)
plt.plot(x, y, linewidth=3.0, color='m')
x, y = zip(*shx)
#plt.plot(x, y, linewidth=3.0, color='r')
x, y = zip(*left)
#plt.plot(x, y, linewidth=3.0, color = 'y')
x, y = zip(*right)
#plt.plot(x, y, linewidth=3.0, color = 'black')

plt.show()
