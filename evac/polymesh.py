import math
from shapely.geometry import Point, Polygon

class Polymesh:
    def __init__(self):
        self.vertices = []
        self.faces_vertex_count = []
        self.faces_definition = []

    def import_obj(self, obj):
        # Creating an empty polymesh data structure
        polymesh = Polymesh()
        # Creating a vertex variable
        vertex = [0.0, 0.0, 0.0]
        # Open the file
        for line in obj.splitlines():
            if len(line) == 0 or line[0] == '#': pass
            elif line[0:2] == 'v ':
                # Found a vertex
                values = line[2:].split()
                # Setting new vertex coordinates
                vertex[0] = float(values[0])
                vertex[1] = float(values[1])
                vertex[2] = float(values[2])
                # Adding the new vertex
                polymesh.vertices.append(tuple(vertex))
            elif line[0:2] == 'f ':
                # Found a face
                values = line[2:].split()
                # values length is our number of vertices defining this face
                polymesh.faces_vertex_count.append(len(values))
                for vindex in values:
                    # OBJ vertex indices starts at 1 instead of 0
                    polymesh.faces_definition.append(int(vindex.split('/')[0]) - 1)
         
        return polymesh

    def import_close_to_fire(self, obj, x, y,margin):
        # Creating an empty polymesh data structure
        polymesh = Polymesh()
        # Creating a vertex variable
        vertex_array = [[0.0, 0.0, 0.0],[0.0, 0.0, 0.0],[0.0, 0.0, 0.0],[0.0, 0.0, 0.0]]

        v_index = 0
        skip_f = True
        # Open the file
        for line in obj.splitlines():
            if len(line) == 0 or line[0] == '#': pass
            elif line[0:2] == 'v ':
                # Found a vertex
                values = line[2:].split()
                # Setting new vertex coordinates
                vertex_array[v_index][0] = float(values[0])
                vertex_array[v_index][1] = float(values[1])
                vertex_array[v_index][2] = float(values[2])
                v_index +=1
                # Adding the new vertex
                if v_index == 4:
                    # +0.5 means margin (obst can be 1.4 but obst margin may be closer (1.15 for example))
                    if self.obst_is_close(x,y,margin+0.5,vertex_array):
                        skip_f = False
                    for vertex in vertex_array:
                        polymesh.vertices.append(tuple(vertex))
                    v_index = 0
                    
            elif line[0:2] == 'f ':
                if skip_f:
                    continue
                # Found a face
                values = line[2:].split()
                # values length is our number of vertices defining this face
                polymesh.faces_vertex_count.append(len(values))
                for vindex in values:
                    # OBJ vertex indices starts at 1 instead of 0
                    polymesh.faces_definition.append(int(vindex.split('/')[0]) - 1)
                skip_f = True


        # add fire

        xx=0.5
        yy=0.5

        cord1 = [x+xx, y+yy]
        cord2 = [x+xx, y-yy]
        cord3 = [x-xx, y-yy]
        cord4 = [x-xx, y+yy]

        polymesh.vertices.append(tuple([cord1[0],0.99,cord1[1]]))
        polymesh.vertices.append(tuple([cord2[0],0.99,cord2[1]]))
        polymesh.vertices.append(tuple([cord3[0],0.99,cord3[1]]))
        polymesh.vertices.append(tuple([cord4[0],0.99,cord4[1]]))

        polymesh.faces_vertex_count.append(4)

        polymesh.faces_definition.append(len(polymesh.vertices)-4)
        polymesh.faces_definition.append(len(polymesh.vertices)-3)
        polymesh.faces_definition.append(len(polymesh.vertices)-2)
        polymesh.faces_definition.append(len(polymesh.vertices)-1)

        # add cut plane - square borders

        xx=4.75
        yy=4.75

        cord1 = [x+xx, y+yy]
        cord2 = [x+xx, y-yy]
        cord3 = [x-xx, y-yy]
        cord4 = [x-xx, y+yy]
        
        polymesh.vertices.append(tuple([cord1[0],0.0,cord1[1]]))
        polymesh.vertices.append(tuple([cord2[0],0.0,cord2[1]]))
        polymesh.vertices.append(tuple([cord3[0],0.0,cord3[1]]))
        polymesh.vertices.append(tuple([cord4[0],0.0,cord4[1]]))

        polymesh.faces_vertex_count.append(4)

        polymesh.faces_definition.append(len(polymesh.vertices)-4)
        polymesh.faces_definition.append(len(polymesh.vertices)-3)
        polymesh.faces_definition.append(len(polymesh.vertices)-2)
        polymesh.faces_definition.append(len(polymesh.vertices)-1)

        return polymesh


    def obst_is_close(self,x,y,margin,vertex_array):
        _vertex_array = [[x[0], x[2]] for x in vertex_array]
        rect = Polygon(_vertex_array)
        point = Point(x, y)
        distance = rect.exterior.distance(point)
        if rect.contains(point) or distance <= margin:
            return True
        return False

    def import_obj_from_dict(self, dict):
        # Creating an empty polymesh data structure
        polymesh = Polymesh()
        # Creating a vertex variable
        vertex = [0.0, 0.0, 0.0]
        for value in dict.values():
            if line[0] == '#': pass
            elif line[0:2] == 'v ':
                # Found a vertex
                values = line[2:].split()
                # Setting new vertex coordinates
                vertex[0] = float(values[0])
                vertex[1] = float(values[1])
                vertex[2] = float(values[2])
                # Adding the new vertex
                polymesh.vertices.append(tuple(vertex))
            elif line[0:2] == 'f ':
                # Found a face
                values = line[2:].split()
                # values length is our number of vertices defining this face
                polymesh.faces_vertex_count.append(len(values))
                for vindex in values:
                    # OBJ vertex indices starts at 1 instead of 0
                    polymesh.faces_definition.append(int(vindex.split('/')[0]) - 1)

         
        return polymesh