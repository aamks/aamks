

import matplotlib.pyplot as plt
import matplotlib.patches as patches
import numpy as np
from include import Sqlite

import math
import heapq
import os


class CFAST100Choice: 
    def __init__(self):# {{{
    
        self.project = os.environ['AAMKS_PROJECT']
        self.s=Sqlite("{}/aamks.sqlite".format(self.project))
        self.doors = []
        self.rooms = []

    # Funkcja obliczająca odległość euklidesową między dwoma punktami
    def distance(self, p1, p2):
        return math.sqrt((p1['x'] - p2['x'])**2 + (p1['y'] - p2['y'])**2 + (p1['z'] - p2['z'])**2)

    # Funkcja obliczająca środek drzwi
    def door_center(self, door):
        return {
            'x': door['x'] + door['width'] / 2,
            'y': door['y'],
            'z': door['z'] + door['height'] / 2
        }
    # Implementacja algorytmu Dijkstry
    def dijkstra(self, graph, start_door_name):
        queue = [(0, start_door_name)]  # Kolejka priorytetowa (odległość, nazwa drzwi)
        distances = {door['name']: float('inf') for door in self.doors}
        distances[start_door_name] = 0

        while queue:
            current_dist, current_door = heapq.heappop(queue)

            if current_dist > distances[current_door]:
                continue

            for neighbor_door, neighbor_dist in graph[current_door]:
                distance_through_current = current_dist + neighbor_dist

                if distance_through_current < distances[neighbor_door]:
                    distances[neighbor_door] = distance_through_current
                    heapq.heappush(queue, (distance_through_current, neighbor_door))

        return distances
    def get_100_closest_rooms(self, room_in_fire_id):

        # Pobieramy dane o pomieszczeniu, w którym wybuchł pożar
        # room_in_fire_name = 'c66'
        # room_in_fire_id = 66
        # room_in_fire = self.s.query(f"SELECT x0 as x, y0 as y, z0 as z, width as length, depth as width, height FROM aamks_geom WHERE name='{room_in_fire_name}'")[0]

        # Lista wszystkich pomieszczeń
        for room in self.s.query("SELECT global_type_id,floor, x0, y0, z0, width, depth, height FROM aamks_geom WHERE type_pri='COMPA' and fire_model_ignore=0"):
            self.rooms.append({
                'floor':room['floor'],
                'id': room['global_type_id'],
                'x': room['x0'],
                'y': room['y0'],
                'z': room['z0'],
                'length': room['width'],
                'width': room['depth'],
                'height': room['height'],
                'distance': float('inf'),  # To będziemy aktualizować
                'doors': []  # Lista drzwi w tym pokoju
            })

        # Lista drzwi
        for door in self.s.query("SELECT name, vent_from, vent_to, x0, y0, z0, width, height FROM aamks_geom WHERE type_tri='DOOR'"):
            self.doors.append({
                'name': door['name'],
                'room1_id': door['vent_from'],
                'room2_id': door['vent_to'],
                'x': door['x0'],
                'y': door['y0'],
                'z': door['z0'],
                'width': door['width'],
                'height': door['height']
            })

        # Przypisujemy drzwi do odpowiednich pomieszczeń
        for door in self.doors:
            for room in self.rooms:
                if room['id'] == door['room1_id'] or room['id'] == door['room2_id']:
                    room['doors'].append(door)

        # Tworzenie grafu połączeń między drzwiami
        graph = {door['name']: [] for door in self.doors}

        # Dodajemy krawędzie pomiędzy wszystkimi parami drzwi tego samego pomieszczenia
        for room in self.rooms:
            if len(room['doors']) > 1:
                for i in range(len(room['doors'])):
                    for j in range(i + 1, len(room['doors'])):
                        door1 = room['doors'][i]
                        door2 = room['doors'][j]

                        door1_center = self.door_center(door1)
                        door2_center = self.door_center(door2)

                        # Obliczamy odległość między drzwiami tego samego pomieszczenia
                        door_dist = self.distance(door1_center, door2_center)

                        # Dodajemy krawędź do grafu (pomiędzy dwoma drzwiami w tym samym pomieszczeniu)
                        graph[door1['name']].append((door2['name'], door_dist))
                        graph[door2['name']].append((door1['name'], door_dist))

        # Dodajemy połączenia pomiędzy drzwiami w sąsiadujących pomieszczeniach
        for door in self.doors:
            room1 = next((r for r in self.rooms if r['id'] == door['room1_id']), None)
            room2 = next((r for r in self.rooms if r['id'] == door['room2_id']), None)

            if room1 and room2:
                # Obliczamy środek drzwi po obu stronach
                room1_center = self.door_center(door)
                room2_center = self.door_center(door)

                # Odległość między drzwiami pomiędzy pomieszczeniami
                door_dist = self.distance(room1_center, room2_center)

                if door_dist > 0:
                    # Dodajemy krawędzie dla połączeń między drzwiami
                    graph[door['name']].append((door['name'], door_dist))


        # Uruchomienie Dijkstry od drzwi w pomieszczeniu room_in_fire
        start_door_name = next((d['name'] for d in self.doors if d['room1_id'] == room_in_fire_id or d['room2_id'] == room_in_fire_id), None)

        if start_door_name:
            distances_from_fire = self.dijkstra(graph, start_door_name)

            # Aktualizacja odległości w liście rooms
            for room in self.rooms:
                room_doors = room['doors']
                if room_doors:
                    # Szukamy minimalnej odległości od dowolnych drzwi w tym pomieszczeniu
                    room['distance'] = min(distances_from_fire[door['name']] for door in room_doors)


        # self.print_rooms()

        return sorted([(room['id'], room['distance']) for room in self.rooms], key=lambda x: x[1])[:100]

    def print_rooms(self):

        # Ustalamy liczbę pięter
        floors = sorted(set([room['floor'] for room in self.rooms]))

        # Filtrujemy pomieszczenia, aby wykluczyć te z distance = inf
        finite_rooms = [room for room in self.rooms if room['distance'] != np.inf]

        # Znajdujemy minimalną i maksymalną skończoną wartość "distance"
        min_distance = min(room['distance'] for room in finite_rooms)
        max_distance = max(room['distance'] for room in finite_rooms)

        # Funkcja skalująca wartość distance do koloru, obsługująca 'inf'
        def get_color(distance):
            if distance == np.inf:
                return 'dimgray'  # Ciemnoszary kolor dla wartości 'inf'
            norm = (distance - min_distance) / (max_distance - min_distance)
            return plt.cm.Blues(norm)  # Normalna skala: najmniejsza wartość = najjaśniejsza, największa = najciemniejsza

        # Funkcja do obliczenia granic dla rzutów na danym piętrze z marginesem 200 jednostek
        def get_floor_bounds(rooms, floor, margin=200):
            # Filtrujemy pomieszczenia na danym piętrze
            floor_rooms = [room for room in rooms if room['floor'] == floor]
            
            # Znajdujemy minimalne i maksymalne wartości x i y
            min_x = min(room['x'] for room in floor_rooms)
            max_x = max(room['x'] + room['length'] for room in floor_rooms)
            min_y = min(room['y'] for room in floor_rooms)
            max_y = max(room['y'] + room['width'] for room in floor_rooms)
            
            # Dodajemy margines
            min_x -= margin
            max_x += margin
            min_y -= margin
            max_y += margin
            
            return min_x, max_x, min_y, max_y

        # Sortowanie pomieszczeń wg wartości distance
        sorted_finite_rooms = sorted(finite_rooms, key=lambda x: x['distance'])

        # Wyciąganie 100 pomieszczeń z najmniejszymi wartościami distance
        smallest_100_rooms = sorted_finite_rooms[:100]

        # Pętla po każdym piętrze
        for floor in floors:
            # Tworzymy nową figurę dla każdego piętra
            fig, ax = plt.subplots(figsize=(8, 5))
            ax.set_title(f'Rzut piętra {floor}')
            ax.set_aspect('equal')

            # Rysowanie prostokątów reprezentujących pomieszczenia
            for room in self.rooms:
                if room['floor'] == floor:
                    # Sprawdzamy, czy pomieszczenie należy do 100 najmniejszych wartości distance
                    is_smallest = room in smallest_100_rooms

                    # Prostokąt bazujący na współrzędnych (x, y) i wymiarach (length, width)
                    rect = patches.Rectangle((room['x'], room['y']), room['length'], room['width'], 
                                            linewidth=1, edgecolor='black', facecolor=get_color(room['distance']),
                                            hatch='/' if is_smallest else None)  # Dodajemy zakreskowanie
                    ax.add_patch(rect)

            # Ustawienie granic osi z marginesem 200 jednostek
            min_x, max_x, min_y, max_y = get_floor_bounds(self.rooms, floor, margin=200)
            ax.set_xlim([min_x, max_x])
            ax.set_ylim([min_y, max_y])

            # Dodanie paska kolorów do każdej figury
            sm = plt.cm.ScalarMappable(cmap="Blues", norm=plt.Normalize(vmin=min_distance, vmax=max_distance))
            sm.set_array([])
            fig.colorbar(sm, ax=ax, orientation='vertical', label='Distance')

            # Pokaż wykres dla bieżącego piętra
            plt.tight_layout()
            plt.show()