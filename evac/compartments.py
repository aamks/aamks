from typing import List
from evac.compartment import Compartment



class Compartments:
    compartments: List[Compartment]
    
    def __init__(self, compartments: List[Compartment] = None):
        if compartments is None:
            compartments = []
        elif not all(isinstance(e, Compartment) for e in compartments):
            raise TypeError("compartments must be a list of Compartments")

        self.compartments = compartments



    def get_adjecent_room(self, door_name, first_compartment_name):
        for comp in self.compartments:
            for exit in comp.compartmentExits:
                if exit.name == door_name and comp.name != first_compartment_name:
                    second_compartment = comp.name
                    return second_compartment

    def get_compartment(self, comp_name):
        for comp in self.compartments:
            if comp.name == comp_name:
                return comp

    def get_current_comp_teleport_exits(self, comp_name, teleports):
        current_floor_teleports = []
        compartment = self.get_compartment(comp_name)
        for teleport in teleports:
            if compartment.x_max < teleport.x < compartment.x_min and compartment.y_max < teleport.y < compartment.y_min:
                current_floor_teleports.append(teleport)
        return current_floor_teleports

    def get_all_floor_doors(self):
        seen_names = set()
        all_floor_doors_unique = []
        for comp in self.compartments:
            for comp_exit in comp.compartmentExits:
                if comp_exit.name not in seen_names:
                    seen_names.add(comp_exit.name)
                    all_floor_doors_unique.append(comp_exit)
        return all_floor_doors_unique

    def get_room_name_for_point(self, point):
        for comp in self.compartments:
            if comp.x_min <= point[0] <= comp.x_max and comp.y_min <= point[1] <= comp.y_max:
                return comp.name
        return 'outside'

    def get_comp_exits(self, comp_name):
        for comp in self.compartments:
            if comp.name == comp_name:
                return comp.compartmentExits
        return []