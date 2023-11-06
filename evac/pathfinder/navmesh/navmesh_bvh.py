from typing import List, Tuple, Optional
from evac.pathfinder.navmesh.navmesh_node import NavmeshNode

import numpy as np
BVH_AABB_DELTA = 0.3



class NavmeshBVH:
    '''Class for the node int bvh-tree
    '''
    def __init__(self, nodes: List[NavmeshNode]):
        '''Create one node (and call recursive building all children nodes) from array of NavmeshNodes

        Input:
            nodes - array of NavmeshNode objects
        '''
        self._node: Optional[NavmeshNode] = None
        self._left: Optional[NavmeshBVH] = None
        self._right: Optional[NavmeshBVH] = None

        x_min: float = float("inf")
        x_max: float = -float("inf")
        y_min: float = float("inf")
        y_max: float = -float("inf")
        z_min: float = float("inf")
        z_max: float = -float("inf")
        self._aabb: Tuple[float, float, float, float, float, float]

        if len(nodes) == 1:
            self._node = nodes[0]
            # build aabb
            verts: List[Tuple[float, float, float]] = self._node.get_vertex_coordinates()
            for v in verts:
                if v[0] < x_min:
                    x_min = v[0]
                if v[0] > x_max:
                    x_max = v[0]
                if v[1] < y_min:
                    y_min = v[1]
                if v[1] > y_max:
                    y_max = v[1]
                if v[2] < z_min:
                    z_min = v[2]
                if v[2] > z_max:
                    z_max = v[2]
            self._aabb = (x_min - BVH_AABB_DELTA, y_min - BVH_AABB_DELTA, z_min - BVH_AABB_DELTA, x_max + BVH_AABB_DELTA, y_max + BVH_AABB_DELTA, z_max + BVH_AABB_DELTA)
        else:
            # find the axis (x or z) to split the space
            x_median: float = 0.0
            z_median: float = 0.0
            for node in nodes:
                c: Tuple[float, float, float] = node.get_center()
                x_median += c[0]
                z_median += c[2]
                if c[0] < x_min:
                    x_min = c[0]
                if c[0] > x_max:
                    x_max = c[0]
                if c[2] < z_min:
                    z_min = c[2]
                if c[2] > z_max:
                    z_max = c[2]
            split_axis: int = 0 if (x_max - x_min) > (z_max - z_min) else 2
            median: float = x_median / len(nodes) if (x_max - x_min) > (z_max - z_min) else z_median / len(nodes)
            left: List[NavmeshNode] = []
            right: List[NavmeshNode] = []
            for node in nodes:
                if node.get_center()[split_axis] < median:
                    left.append(node)
                else:
                    right.append(node)
            if len(left) == 0:
                # move last right node to the left array
                left.append(right.pop())
            else:
                # left array is not empty, but may be empty right array
                if len(right) == 0:
                    right.append(left.pop())
            self._left = NavmeshBVH(left)
            self._right = NavmeshBVH(right)
            l_aabb: Tuple[float, float, float, float, float, float] = self._left.get_aabb()
            r_aabb: Tuple[float, float, float, float, float, float] = self._right.get_aabb()
            self._aabb = self._union_aabbs(l_aabb, r_aabb)

    def _union_aabbs(self, b1: Tuple[float, float, float, float, float, float], b2: Tuple[float, float, float, float, float, float]) -> Tuple[float, float, float, float, float, float]:
        return (min(b1[0], b2[0]), min(b1[1], b2[1]), min(b1[2], b2[2]),
                max(b1[3], b2[3]), max(b1[4], b2[4]), max(b1[5], b2[5]))

    def get_aabb(self) -> Tuple[float, float, float, float, float, float]:
        '''Return 6-tuple of the aabb (axis align bounding box) of the current node

        this 6-tuple is (x_min, y_min, z_min, x_max, y_max, z_max)
        '''
        return self._aabb

    def is_inside_aabb(self, point: Tuple[float, float, float]) -> bool:
        '''Return True, if the point is inside the current aabb, and False otherwise

        Input:
            point - 3-triple (x, y, z)

        Output:
            True or False
        '''
        return self._aabb[0] < point[0] and self._aabb[1] < point[1] and self._aabb[2] < point[2] and\
               self._aabb[3] > point[0] and self._aabb[4] > point[1] and self._aabb[5] > point[2]

    def sample(self, point: Tuple[float, float, float]) -> Optional[NavmeshNode]:
        '''Return node, which contains the point
        If there are no nodes near the point, then return None

        Input:
            point - 3-triple (x, y, z)
        
        Output:
            NavmeshNode or None
        '''
        if self.is_inside_aabb(point):
            if self._node is None and self._left is not None and self._right is not None:
                # this bvh node contains left and right children, go deeper
                left_sample: Optional[NavmeshNode] = self._left.sample(point)
                right_sample: Optional[NavmeshNode] = self._right.sample(point)
                if left_sample is None:
                    return right_sample
                else:
                    if right_sample is None:
                        return left_sample
                    else:
                        # we should choose from left and right sample the closest to the point
                        l_c: Tuple[float, float, float] = left_sample.get_center()
                        l_n: Tuple[float, float, float] = left_sample.get_normal()
                        l_dist: float = abs((point[0] - l_c[0]) * l_n[0] + (point[1] - l_c[1]) * l_n[1] + (point[2] - l_c[2]) * l_n[2])

                        r_c: Tuple[float, float, float] = right_sample.get_center()
                        r_n: Tuple[float, float, float] = right_sample.get_normal()
                        r_dist: float = abs((point[0] - r_c[0]) * r_n[0] + (point[1] - r_c[1]) * r_n[1] + (point[2] - r_c[2]) * r_n[2])

                        if l_dist < r_dist:
                            return left_sample
                        else:
                            return right_sample
            else:
                # bvh node contains polygon
                if self._node is not None:
                    if self._node.is_point_inside(point):
                        return self._node
                    else:
                        return None
                else:
                    return None
        else:
            return None

    def __repr__(self) -> str:
        return "<object: " + str(self._node if self._node is None else self._node.get_index()) + ", left: " + str(self._left) + ", right: " + str(self._right) + ">"

class AABB:
    def __init__(self):
        self.x_min = 0.0
        self.y_min = 0.0
        self.z_min = 0.0

        self.x_max = 0.0
        self.y_max = 0.0
        self.z_max = 0.0

class TrianglesBVH():
    def __init__(self, triangles_vertices=None, BVH_AABB_DELTA=0.5):
        self.m_return_buffer = [0.0, 0.0, 0.0, 0.0]
        self.m_triangle_data = []
        self.m_is_object = False
        self.m_children_exists = False
        self.m_aabb = AABB()

        self.m_left_child = None
        self.m_right_child = None

        if triangles_vertices is not None and len(triangles_vertices) > 0:
            if len(triangles_vertices) == 9:
                self.m_triangle_data = [0.0] * 13
            else:
                self.m_triangle_data = []

            if len(triangles_vertices) == 9:
                triangle_data = self.m_triangle_data
                triangle_data[0] = triangles_vertices[0]
                triangle_data[1] = triangles_vertices[1]
                triangle_data[2] = triangles_vertices[2]

                triangle_data[3] = triangles_vertices[3] - triangles_vertices[0]
                triangle_data[4] = triangles_vertices[4] - triangles_vertices[1]
                triangle_data[5] = triangles_vertices[5] - triangles_vertices[2]

                triangle_data[6] = triangles_vertices[6] - triangles_vertices[0]
                triangle_data[7] = triangles_vertices[7] - triangles_vertices[1]
                triangle_data[8] = triangles_vertices[8] - triangles_vertices[2]

                triangle_data[9] = self.squared_len(triangle_data[3], triangle_data[4], triangle_data[5])
                triangle_data[10] = (triangle_data[3] * triangle_data[6] +
                                     triangle_data[4] * triangle_data[7] +
                                     triangle_data[5] * triangle_data[8])
                triangle_data[11] = self.squared_len(triangle_data[6], triangle_data[7], triangle_data[8])
                triangle_data[12] = (triangle_data[9] * triangle_data[11] - triangle_data[10] * triangle_data[10])

                self.m_is_object = True

                aabb = self.m_aabb
                aabb.x_min = self._min3(triangles_vertices[0], triangles_vertices[3], triangles_vertices[6])
                aabb.y_min = self._min3(triangles_vertices[1], triangles_vertices[4], triangles_vertices[7])
                aabb.z_min = self._min3(triangles_vertices[2], triangles_vertices[5], triangles_vertices[8])
                aabb.x_max = self._max3(triangles_vertices[0], triangles_vertices[3], triangles_vertices[6])
                aabb.y_max = self._max3(triangles_vertices[1], triangles_vertices[4], triangles_vertices[7])
                aabb.z_max = self._max3(triangles_vertices[2], triangles_vertices[5], triangles_vertices[8])

                self._extend_aabb_by_delta(BVH_AABB_DELTA)
            else:
                median_x = 0.0
                median_z = 0.0
                min_x = float("inf")
                min_y = float("inf")
                min_z = float("inf")
                max_x = float("-inf")
                max_y = float("-inf")
                max_z = float("-inf")

                objects_count = len(triangles_vertices) // 9

                for i in range(objects_count):
                    min_x = self._min4(min_x, triangles_vertices[9 * i], triangles_vertices[9 * i + 3], triangles_vertices[9 * i + 6])
                    min_y = self._min4(min_y, triangles_vertices[9 * i + 1], triangles_vertices[9 * i + 4], triangles_vertices[9 * i + 7])
                    min_z = self._min4(min_z, triangles_vertices[9 * i + 2], triangles_vertices[9 * i + 5], triangles_vertices[9 * i + 8])

                    max_x = self._max4(max_x, triangles_vertices[9 * i], triangles_vertices[9 * i + 3], triangles_vertices[9 * i + 6])
                    max_y = self._max4(max_y, triangles_vertices[9 * i + 1], triangles_vertices[9 * i + 4], triangles_vertices[9 * i + 7])
                    max_z = self._max4(max_z, triangles_vertices[9 * i + 2], triangles_vertices[9 * i + 5], triangles_vertices[9 * i + 8])

                    median_x += triangles_vertices[9 * i] + triangles_vertices[9 * i + 3] + triangles_vertices[9 * i + 6]
                    median_z += triangles_vertices[9 * i + 2] + triangles_vertices[9 * i + 5] + triangles_vertices[9 * i + 8]

                aabb = self.m_aabb
                aabb.x_min = min_x
                aabb.y_min = min_y
                aabb.z_min = min_z
                aabb.x_max = max_x
                aabb.y_max = max_y
                aabb.z_max = max_z

                self._extend_aabb_by_delta(BVH_AABB_DELTA)

                objects_count_int = objects_count * 3
                total = 1.0 / float(objects_count_int)
                median_x *= total
                median_z *= total

                axis = 0 if self._get_aabb_x_size() > self._get_aabb_z_size() else 2

                left_objects = [0.0] * (9 * objects_count)
                right_objects = [0.0] * (9 * objects_count)
                left_count = 0
                right_count = 0

                for i in range(objects_count):
                    c_x = (triangles_vertices[9 * i] + triangles_vertices[9 * i + 3] + triangles_vertices[9 * i + 6]) / 3.0
                    c_z = (triangles_vertices[9 * i + 2] + triangles_vertices[9 * i + 5] + triangles_vertices[9 * i + 8]) / 3.0

                    if (axis == 0 and c_x < median_x) or (axis == 2 and c_z < median_z):
                        left_objects[9 * left_count + 0] = triangles_vertices[9 * i]
                        left_objects[9 * left_count + 1] = triangles_vertices[9 * i + 1]
                        left_objects[9 * left_count + 2] = triangles_vertices[9 * i + 2]

                        left_objects[9 * left_count + 3] = triangles_vertices[9 * i + 3]
                        left_objects[9 * left_count + 4] = triangles_vertices[9 * i + 4]
                        left_objects[9 * left_count + 5] = triangles_vertices[9 * i + 5]

                        left_objects[9 * left_count + 6] = triangles_vertices[9 * i + 6]
                        left_objects[9 * left_count + 7] = triangles_vertices[9 * i + 7]
                        left_objects[9 * left_count + 8] = triangles_vertices[9 * i + 8]

                        left_count += 1
                    else:
                        right_objects[9 * right_count + 0] = triangles_vertices[9 * i]
                        right_objects[9 * right_count + 1] = triangles_vertices[9 * i + 1]
                        right_objects[9 * right_count + 2] = triangles_vertices[9 * i + 2]

                        right_objects[9 * right_count + 3] = triangles_vertices[9 * i + 3]
                        right_objects[9 * right_count + 4] = triangles_vertices[9 * i + 4]
                        right_objects[9 * right_count + 5] = triangles_vertices[9 * i + 5]

                        right_objects[9 * right_count + 6] = triangles_vertices[9 * i + 6]
                        right_objects[9 * right_count + 7] = triangles_vertices[9 * i + 7]
                        right_objects[9 * right_count + 8] = triangles_vertices[9 * i + 8]

                        right_count += 1

                if left_count > 0 and right_count == 0:  # move last left object to the right
                    for i in range(9):
                        right_objects[i] = left_objects[(left_count - 1) * 9 + i]
                    right_count += 1
                    left_count -= 1
                elif left_count == 0 and right_count > 0:  # move last right object to the left
                    for i in range(9):
                        left_objects[i] = right_objects[(right_count - 1) * 9 + i]
                    left_count += 1
                    right_count -= 1


                left_array = np.array(left_objects[:left_count * 9], dtype=np.float32)
                right_array = np.array(right_objects[:right_count * 9], dtype=np.float32)


                self.m_left_child = TrianglesBVH(left_array, BVH_AABB_DELTA)
                self.m_right_child = TrianglesBVH(right_array, BVH_AABB_DELTA)

                self.m_children_exists = True

    def _min3(self, a, b, c):
        return min(min(a, b), c)

    def _max3(self, a, b, c):
        return max(max(a, b), c)

    def _min4(self, a, b, c, d):
        return min(min(min(a, b), c), d)

    def _max4(self, a, b, c, d):
        return max(max(max(a, b), c), d)

    def _get_aabb_x_size(self):
        return self.m_aabb.x_max - self.m_aabb.x_min

    def _get_aabb_z_size(self):
        return self.m_aabb.z_max - self.m_aabb.z_min

    def _extend_aabb_by_delta(self, delta):
        self.m_aabb.x_min -= delta
        self.m_aabb.y_min -= delta
        self.m_aabb.z_min -= delta
        self.m_aabb.x_max += delta
        self.m_aabb.y_max += delta
        self.m_aabb.z_max += delta

    def squared_len(self, x, y, z):
        return x * x + y * y + z * z

    def is_inside_aabb(self, x, y, z):
        return (
            x > self.m_aabb.x_min and x < self.m_aabb.x_max and
            y > self.m_aabb.y_min and y < self.m_aabb.y_max and
            z > self.m_aabb.z_min and z < self.m_aabb.z_max
        )
    def clamp(self, x, minimum=0.0, maximum=1.0):
        if x < minimum:
            return minimum
        elif x > maximum:
            return maximum
        else:
            return x

    def sample(self, x, y, z):
        triangle_data = self.m_triangle_data
        return_buffer = []

        # Return the 4-th [x, y, z, w], where w = 1.0 - correct answer, 0.0 - empty answer
        if self.is_inside_aabb(x, y, z):
            if self.m_is_object:  # This node contains an object, so return the actual closest position in the triangle
                # Here we should find the actual closest point
                v0_x = triangle_data[0] - x
                v0_y = triangle_data[1] - y
                v0_z = triangle_data[2] - z

                # d = (e1, v0)
                d = (
                    triangle_data[3] * v0_x +
                    triangle_data[4] * v0_y +
                    triangle_data[5] * v0_z
                )
                # e = (e2, v0)
                e = (
                    triangle_data[6] * v0_x +
                    triangle_data[7] * v0_y +
                    triangle_data[8] * v0_z
                )

                # s = b*e - c*d
                s = (
                    triangle_data[10] * e -
                    triangle_data[11] * d
                )
                # t = b*d - a*e
                t = (
                    triangle_data[10] * d -
                    triangle_data[9]  * e
                )

                det = triangle_data[12]
                a = triangle_data[9]
                b = triangle_data[10]
                c = triangle_data[11]

                if s + t < det:
                    if s < 0:
                        if t < 0:
                            if d < 0:
                                s = self.clamp(-d / a)
                                t = 0
                            else:
                                s = 0
                                t = self.clamp(-e / c)
                        else:
                            s = 0
                            t = self.clamp(-e / c)
                    else:
                        if t < 0:
                            s = self.clamp(-d / a)
                            t = 0
                        else:
                            invDet = 1.0 / det
                            s *= invDet
                            t *= invDet
                else:
                    if s < 0:
                        tmp0 = b + d
                        tmp1 = c + e
                        if tmp1 > tmp0:
                            numer = tmp1 - tmp0
                            denom = a - 2 * b + c
                            s = self.clamp(numer / denom)
                            t = 1.0 - s
                        else:
                            t = self.clamp(-e / c)
                            s = 0
                    else:
                        if t < 0:
                            if a + d > b + e:
                                numer = c + e - b - d
                                denom = a - 2 * b + c
                                s = self.clamp(numer / denom)
                                t = 1.0 - s
                            else:
                                s = self.clamp(-d / a)
                                t = 0
                        else:
                            numer = c + e - b - d
                            denom = a - 2 * b + c
                            s = self.clamp(numer / denom)
                            t = 1.0 - s

                return_buffer.append(triangle_data[0] + s * triangle_data[3] + t * triangle_data[6])
                return_buffer.append(triangle_data[1] + s * triangle_data[4] + t * triangle_data[7])
                return_buffer.append(triangle_data[2] + s * triangle_data[5] + t * triangle_data[8])
                return_buffer.append(1.0)

                return return_buffer
            else:  # Node contains children, check it
                left_sample = self.m_left_child.sample(x, y, z)
                right_sample = self.m_right_child.sample(x, y, z)

                if left_sample[3] < 0.5:
                    return right_sample
                else:
                    if right_sample[3] < 0.5:
                        return left_sample
                    else:
                        # Both left and right sample is correct, so return the closest to the initial point
                        d_l = self.squared_len(x - left_sample[0], y - left_sample[1], z - left_sample[2])
                        d_r = self.squared_len(x - right_sample[0], y - right_sample[1], z - right_sample[2])
                        return left_sample if d_l < d_r else right_sample
        else:  # Point outside the AABB, so skip next traversing, return a false answer
            self.m_return_buffer.append(0.0)
            self.m_return_buffer.append(0.0)
            self.m_return_buffer.append(0.0)
            self.m_return_buffer.append(0.0)
            return self.m_return_buffer
