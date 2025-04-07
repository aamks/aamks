import matplotlib.pyplot as plt
import matplotlib.patches as patches
from decimal import Decimal

class RiskMatrix:
    def __init__(self, risk_values):
        self.risk_values = risk_values

    def create_boxes(self):

        for i in self.risk_values.keys():
            print(self.risk_values[i])