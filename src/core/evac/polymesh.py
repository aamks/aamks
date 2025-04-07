class Polymesh:
    def __init__(self):
        self.vertices = []
        self.faces_vertex_count = []
        self.faces_definition = []

    def import_obj(self, filename):
        # Creating an empty polymesh data structure
        polymesh = Polymesh()
        # Creating a vertex variable
        vertex = [0.0, 0.0, 0.0]
        # Open the file
        f = open(filename, 'r')
        lines = f.readlines()
        current_line_index = 0
        for line in lines:
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
            current_line_index += 1
     
        f.close()
         
        return polymesh