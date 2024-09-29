

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
        self.rooms = []

    # Funkcja obliczająca odległość euklidesową między dwoma punktami
    def distance(self, p1, p2):
        return math.sqrt((p1['center_x'] - p2['center_x'])**2 + (p1['center_y'] - p2['center_y'])**2 + (p1['center_z'] - p2['center_z'])**2)

    def get_100_closest_rooms(self, room_in_fire_id):
        # Pobieramy dane o pomieszczeniu, w którym wybuchł pożar
        room_in_fire = self.s.query(f"SELECT center_x, center_y, center_z FROM aamks_geom WHERE type_pri='COMPA' AND global_type_id={room_in_fire_id}")[0]

        # Lista wszystkich pomieszczeń
        for room in self.s.query("SELECT global_type_id, floor, center_x, center_y, center_z, x0, y0, z0, width, depth, height FROM aamks_geom WHERE type_pri='COMPA' and fire_model_ignore=0"):
            self.rooms.append({
                'id': room['global_type_id'],
                'floor': room['floor'],
                'center_x': room['center_x'],
                'center_y': room['center_y'],
                'center_z': room['center_z'],
                'x': room['x0'],
                'y': room['y0'],
                'z': room['z0'],
                'length': room['width'],
                'width': room['depth'],
                'height': room['height'],
                'distance': self.distance(room_in_fire, room),  
            })

        # self.print_rooms()

        return sorted([(room['id'], room['distance']) for room in self.rooms], key=lambda x: x[1])[:100]

    def print_rooms(self):
        self.rooms.sort(key=lambda x: x['distance'])

        # Ustalamy liczbę pięter
        floors = sorted(set([room['floor'] for room in self.rooms]))

        # Znajdujemy minimalną i maksymalną skończoną wartość "distance"
        min_distance = self.rooms[0]['distance']
        max_distance = self.rooms[-1]['distance'] if len(self.rooms) <= 100 else self.rooms[100]['distance']

        # Funkcja skalująca wartość distance do koloru, obsługująca 'inf'
        def get_color(distance):
            if distance > max_distance:
                return 'dimgray'  # Ciemnoszary kolor dla wartości > max_distance
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

        # Wyciąganie 100 pomieszczeń z najmniejszymi wartościami distance
        smallest_100_rooms = self.rooms[:100]

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
