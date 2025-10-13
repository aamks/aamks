
from typing import List
from evac.exit import CompartmentExit, RoomGoalExit


class Compartment:
    name: str
    floor: int
    x_min: int
    x_max: int
    y_min: int
    y_max: int
    compartmentExits: List[CompartmentExit]
    roomGoalExits: List[RoomGoalExit]
    
    # roomsGoalExits may have more exits than compartmentExits
    # when 2 rooms are connectesd with hole 
    # then both rooms have exits from both rooms

    def __init__(self, name: str, floor: int =None, x_min: int =None, x_max: int =None, y_min: int =None, y_max: int =None, compartmentExits: List[CompartmentExit] = None, roomGoalExits: List[RoomGoalExit] = None):
        if compartmentExits is None:
            compartmentExits = []
        elif not all(isinstance(e, CompartmentExit) for e in compartmentExits):
            raise TypeError("compartmentExits must be a list of CompartmentExit")

        self.name = name
        self.floor = floor
        self.x_min = x_min
        self.x_max = x_max
        self.y_min = y_min
        self.y_max = y_max
        self.compartmentExits = compartmentExits
        self.roomGoalExits = roomGoalExits
    
    def check_if_exit_is_adjacent_to_the_room(self, exit_name):
        for exit in self.compartmentExits:
            if exit.name == exit_name:
                return True
        return False