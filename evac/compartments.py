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

    def get_all_floor_doors_initial_open(self):
        seen_names = set()
        all_floor_doors_unique = []
        for comp in self.compartments:
            for comp_exit in comp.compartmentExits:
                # we dont take holes, only doors, holes are always open
                if comp_exit.name not in seen_names and not comp_exit.name.startswith("z"):
                    seen_names.add(comp_exit.name)
                    all_floor_doors_unique.append({'name':comp_exit.name, 'how_much_open':comp_exit.how_much_open_beginning, 'center_x':comp_exit.x, 'center_y':comp_exit.y, 'x_min':comp_exit.x_min, 'x_max':comp_exit.x_max, 'y_min':comp_exit.y_min, 'y_max':comp_exit.y_max})
        return all_floor_doors_unique

    def get_comp_exits(self, comp_name):
        for comp in self.compartments:
            if comp.name == comp_name:
                return comp.compartmentExits
        return []
    
