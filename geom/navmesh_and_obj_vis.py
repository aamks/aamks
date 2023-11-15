

import matplotlib
from matplotlib.collections import PatchCollection
import matplotlib.pyplot as plt
from matplotlib.patches import Rectangle
import random
from matplotlib.patches import Polygon
import numpy as np
fig, ax = plt.subplots()


number_of_colors = 2000

colors = ["#"+''.join([random.choice('123456789ABCDEF') for j in range(6)])
             for i in range(number_of_colors)]












# ##################################### .NAV.OBJ FILE GEOMETRY VISUALISATION

# file1 = open('/home/aamks_users/majster1281@wp.pl/444/15/0.nav.obj', 'r')
# Lines = file1.readlines()

# count = 1

# rectanlearray = []
# rectangle_points = []
# polygons = []
# for line in Lines:

#     print("Line{}: {}".format(count, line.strip()))

#     if count % 7 == 2:
#         rectangle_points.append((float(line.split()[1]), float(line.split()[3])))
#         #dodaj jeden punkt prostokatu
#     if count % 7 == 3:
#         rectangle_points.append((float(line.split()[1]), float(line.split()[3])))
#         # dodaj drugi punkt prostokatu
#     if count % 7 == 4:
#         # sdfsdf
#         rectangle_points.append((float(line.split()[1]), float(line.split()[3])))
#     if count % 7 == 5:
#         # sdfsdfsdf
#         rectangle_points.append((float(line.split()[1]), float(line.split()[3])))
#     if count % 7 == 0:
#         min_x = min(x[0] for x in rectangle_points)
#         max_x = max(x[0] for x in rectangle_points)
#         min_y = min(x[1] for x in rectangle_points)
#         max_y = max(x[1] for x in rectangle_points)
#         polygons.append(Rectangle((min_x, min_y), max_x-min_x, max_y- min_y, color = colors[count]))
#         rectangle_points = []


#     count += 1
#         # rysuj prostokat losowym kolorem

# for item in polygons[::-1]:
#     ax.add_patch(item)



# ax.set_xlim(0, 58)
# ax.set_ylim(0, 25)
# #display plot
# plt.show()




















# ##################################### .PYNAVMESH.NAV NAVMESH FILE VISUALISATION



polygons_navmesh = []
figure_points = []
#file2 = open('/home/aamks_users/majster1281@wp.pl/444/13/pynavmesh1.nav', 'r')
# file2 = open('/home/alek/Downloads/pynavmesh0 (1).nav', 'r')
file2 = open('/mnt/aamks_users/majster1281@wp.pl/7/pynav/pynavmesh0.nav', 'r')

# file2 = open('/home/aamks_users/majster1281@wp.pl/444/21/pynavmesh0.nav','r')
Lines = file2.readlines()
points = Lines[0].split()
x_list = points[::3]
y_list = points[1::3]
z_list = points[2::3]
figures_points = Lines[1].split()
polygons = Lines[2].split()

count = 0
for poly in polygons:
    poly_sides_count = int(poly)
    for i in range (poly_sides_count):
        figure_points.append((float(x_list[int(figures_points[count])]), float(z_list[int(figures_points[count])])))
        count+=1
    x = []
    for co in figure_points:
        x.append([co[0], co[1]])
    fff = np.random.randint(500)
    ggg = np.random.randint(500)
    hhh = np.random.randint(500)
    polygons_navmesh.append(Polygon(x, edgecolor = colors[ggg], facecolor = colors[hhh], alpha =0.4))
    x = []
    figure_points = []

for poly in polygons_navmesh:
    ax.add_patch(poly)
    ax.set_xlim(-25, 58)
    ax.set_ylim(-25, 25)
plt.show()

