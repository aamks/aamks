
from typing import List

class CompartmentExit:
    name: str
    x: int
    y: int
    x_direction: int
    y_direction: int
    room_exit_weight: int
    leads_outside: bool
    x_min: int
    x_max: int 
    y_min: int
    y_max: int

    def __init__(self, name: str, x: int, y: int, x_direction: int, y_direction: int, leads_outside: bool, x_min: int, x_max:int, y_min:int, y_max:int, comp_from: str, comp_to: str):
        self.name = name
        self.x = x
        self.y = y
        # x_direction and y_direction is 25 cm behind exit for
        # room_interior_doors_and_holes and 100 cm behind 
        # when door leads outside
        self.x_direction = x_direction
        self.y_direction = y_direction
        self.leads_outside = leads_outside
        # door rectangle coordinates:
        self.x_min = x_min
        self.x_max = x_max
        self.y_min = y_min
        self.y_max = y_max
        self.comp_from = comp_from
        self.comp_to = comp_to

    def is_terminal(self):
        if self.leads_outside == True:
            return True
        return False

    def get_next_comp(self, comp_from_name):
        if self.comp_from == comp_from_name:
            return self.comp_to
        else:
            return self.comp_from


class RoomGoalExit:
    name: str
    x: int
    y: int
    x_direction: int
    y_direction: int
    room_exit_weight: int
    leads_outside: bool
    x_min: int
    x_max: int 
    y_min: int
    y_max: int

    def __init__(self, name: str, x: int, y: int, x_direction: int, y_direction: int, room_exit_weight: int, leads_outside: bool, x_min: int, x_max:int, y_min:int, y_max:int):
        self.name = name
        self.x = x
        self.y = y
        # x_direction and y_direction is 25 cm behind exit
        # for interior door, 100 for terminal door
        self.x_direction = x_direction
        self.y_direction = y_direction
        self.leads_outside = leads_outside
        self.room_exit_weight = room_exit_weight
        # door rectangle coordinates:
        self.x_min = x_min
        self.x_max = x_max
        self.y_min = y_min
        self.y_max = y_max


    def is_terminal(self):
        if self.leads_outside == True:
            return True
        return False




class Teleport:
    name: str
    floor: int
    x: int
    y: int
    x_direction: int
    y_direction: int
    stair_direction: str
    general_exit_weight: int

    def __init__(self, name: str, floor: int, x: int, y: int, x_direction: int, y_direction: int, stair_direction: str,
                    general_exit_weight: int):
        self.name = name
        self.floor = floor
        self.x = x
        self.y = y
        self.x_direction = x_direction
        self.y_direction = y_direction
        # up or down \/
        self.stair_direction = stair_direction
        self.general_exit_weight = general_exit_weight




class TermianlDoorExit:
    name: str
    floor: int
    x: int
    y: int
    x_direction: int
    y_direction: int
    general_exit_weight: int



    def __init__(self, name: str, floor: int, x: int, y: int, x_direction: int, y_direction: int,
                 general_exit_weight: int):
        self.name = name
        self.floor = floor
        self.x = x
        self.y = y
        # x_direction and y_direction is 100 cm behind exit
        self.x_direction = x_direction
        self.y_direction = y_direction
        self.general_exit_weight = general_exit_weight


    def is_terminal(self):
        return True
