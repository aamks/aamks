import matplotlib.pyplot as plt
import matplotlib.patches as patches
from decimal import Decimal


class EventTreeFED:

    def __init__(self, building, p_general, p_develop, p_dcbe, p_fed_n, p_fed_l, p_fed_m, p_fed_f):
        self.building = building
        self.p_general = '%.2E' % Decimal(p_general)
        self.p_develop = p_develop
        self.p_dcbe = p_dcbe
        self.p_fed_n = p_fed_n
        self.p_fed_l = p_fed_l
        self.p_fed_m = p_fed_m
        self.p_fed_f = p_fed_f


    def draw_tree(self):
        fig = plt.figure(figsize=(10, 5))
        ax = fig.add_axes([0, 0, 1.0, 1])

        head = ['Ingnition', 'Early \n suppresion', 'ASET > RSET', 'FED']

        p = patches.Rectangle((0.05, 0.1), 0.612, 0.693, fill=False, transform=ax.transAxes, clip_on=False)
        ax.add_patch(p)

        i = 0
        while i < len(head):
            left, width = .05+i/6.5, .15
            bottom, height = .8, .10
            right = left + width
            top = bottom + height

            p = patches.Rectangle((left, bottom), width, height, fill=False, transform=ax.transAxes, clip_on=False)
            ax.text(0.5 * (left + right), 0.5 * (bottom + top), head[i], horizontalalignment='center', verticalalignment='center',
                    fontsize=12, color='blue', transform=ax.transAxes)
            ax.add_patch(p)
            i += 1

        p = patches.Rectangle((0.665, 0.8), 0.21, 0.10, fill=False, transform=ax.transAxes, clip_on=False)
        ax.text(0.5 * 1.54, 0.5 * 1.7, 'Fire\n scenario', horizontalalignment='center', verticalalignment='center',
                    fontsize=12, color='black', transform=ax.transAxes)
        ax.add_patch(p)

        general = [[0.1, 1.1], [0.3, 0.3], 'P = {}'.format(self.p_general)]
        ax.plot(general[0], general[1], linewidth=2)
        ax.text(0.3, 0.32, 'YES')
        ax.text(0.3, 0.25, general[2])
        simple_div = [[1.1, 1.1], [0.1, 0.5]]
        ax.plot(simple_div[0], simple_div[1], color='b', linewidth=2)

        suppressed = [[1.1, 2.2], [0.5, 0.5], 'P = {}'.format(1 - self.p_develop)]
        ax.plot(suppressed[0], suppressed[1], linewidth=2, color='g')
        ax.text(1.5, 0.52, 'YES')
        ax.text(1.5, 0.45, suppressed[2])

        suppressed = [[1.1, 2.2], [0.1, 0.1], 'P = {}'.format(self.p_develop)]
        ax.plot(suppressed[0], suppressed[1], linewidth=2, color='b')
        ax.text(1.5, 0.12, 'NO')
        ax.text(1.5, 0.05, suppressed[2])

        simple_div = [[2.2, 2.2], [-0.1, 0.3]]
        ax.plot(simple_div[0], simple_div[1], color='b', linewidth=2)

        dcbe = [[2.2, 3.3], [0.3, 0.3], 'P = {}'.format('%.3f' % (1 - float(self.p_dcbe)))]
        ax.plot(dcbe[0], dcbe[1], linewidth=2, color='g')
        ax.text(2.5, 0.32, 'YES')
        ax.text(2.5, 0.25, dcbe[2])

        dcbe = [[2.2, 3.3], [-0.1, -0.1], 'P = {}'.format(self.p_dcbe)]
        ax.plot(dcbe[0], dcbe[1], linewidth=2, color='b')
        ax.text(2.5, -0.08, 'NO')
        ax.text(2.5, -0.15, dcbe[2])

        simple_div = [[3.3, 3.3], [-0.325, 0.115]]
        ax.plot(simple_div[0], simple_div[1], color='b', linewidth=2)

        fed_n = [[3.3, 4.4], [0.115, 0.115], 'P = {}'.format(self.p_fed_n)]
        ax.plot(fed_n[0], fed_n[1], linewidth=2, color='b')
        ax.text(3.5, 0.135, 'FED < 0.01')
        ax.text(3.5, 0.075, fed_n[2])

        fed_l = [[3.3, 4.4], [-0.035, -0.035], 'P = {}'.format(self.p_fed_l)]
        ax.plot(fed_l[0], fed_l[1], linewidth=2, color='b')
        ax.text(3.5, -0.015, 'FED = [0.01, 0.3)')
        ax.text(3.5, -0.085, fed_l[2])

        fed = [[3.3, 4.4], [-0.185, -0.185], 'P = {}'.format(self.p_fed_m)]
        ax.plot(fed[0], fed[1], linewidth=2, color='b')
        ax.text(3.5, -0.165, 'FED = [0.3, 1)')
        ax.text(3.5, -0.235, fed[2])

        fed = [[3.3, 4.4], [-0.325, -0.325], 'P = {}'.format(self.p_fed_f)]
        ax.plot(fed[0], fed[1], linewidth=2, color='b')
        ax.text(3.5, -0.305, 'FED >= 1')
        ax.text(3.5, -0.375, fed[2])

        ax.plot([3.3, 6.5], [-0.5, -0.5], linewidth=0.1, color='white')

        c = patches.Ellipse(xy=(0.643, 0.442), width=0.02, height=0.04, fill=True, transform=ax.transAxes, clip_on=False, color='b')
        ax.add_patch(c)
        p1 = float(self.p_general) * self.p_develop * self.p_dcbe * self.p_fed_f
        ax.text(4.65, -0.335, r'$P_4 =  %.2E; S_4 = H$' % Decimal(p1))

        c = patches.Ellipse(xy=(0.643, 0.347), width=0.02, height=0.04, fill=True, transform=ax.transAxes, clip_on=False, color='b')
        ax.add_patch(c)
        p2 = float(self.p_general) * self.p_develop * self.p_dcbe * self.p_fed_m
        ax.text(4.65, -0.2, r'$P_3 =  %.2E; S_3 = M$' % Decimal(p2))

        c = patches.Ellipse(xy=(0.643, 0.25), width=0.02, height=0.04, fill=True, transform=ax.transAxes, clip_on=False, color='b')
        ax.add_patch(c)
        p = float(self.p_general) * self.p_develop * self.p_dcbe * self.p_fed_l
        ax.text(4.65, -0.052, r'$P_2 =  %.2E; S_2 = L$' % Decimal(p))

        c = patches.Ellipse(xy=(0.643, 0.159), width=0.02, height=0.04, fill=True, transform=ax.transAxes, clip_on=False, color='b')
        ax.add_patch(c)
        p = float(self.p_general) * self.p_develop * self.p_dcbe * self.p_fed_n
        ax.text(4.65, 0.094, r'$P_1 =  %.2E; S_1 = N$' % Decimal(p))

        fig.savefig('{}/picts/tree.png'.format(self.building))

class EventTreeSteel:

    def __init__(self, building, p_general, p_develop, p_Tk, p_time_less):
        self.building = building
        self.p_general = '%.2E' % Decimal(p_general)
        self.p_develop = p_develop
        self.p_Tk = p_Tk
        self.p_time_less = p_time_less


    def draw_tree(self):
        fig = plt.figure(figsize=(10, 5))
        ax = fig.add_axes([0, 0, 1.0, 1])

        head = ['Ignition', 'Early \n suppresion', r'$T_c < 450$', r'$t_c < t_{RSET}$']

        p = patches.Rectangle((0.05, 0.1), 0.612, 0.693, fill=False, transform=ax.transAxes, clip_on=False)
        ax.add_patch(p)

        i = 0
        while i < len(head):
            left, width = .05+i/6.5, .15
            bottom, height = .8, .10
            right = left + width
            top = bottom + height

            p = patches.Rectangle((left, bottom), width, height, fill=False, transform=ax.transAxes, clip_on=False)
            ax.text(0.5 * (left + right), 0.5 * (bottom + top), head[i], horizontalalignment='center', verticalalignment='center',
                    fontsize=12, color='blue', transform=ax.transAxes)
            ax.add_patch(p)
            i += 1

        p = patches.Rectangle((0.665, 0.8), 0.21, 0.10, fill=False, transform=ax.transAxes, clip_on=False)
        ax.text(0.5 * 1.54, 0.5 * 1.7, 'Fire\n scenario', horizontalalignment='center', verticalalignment='center',
                    fontsize=12, color='black', transform=ax.transAxes)
        ax.add_patch(p)

        general = [[0.1, 1.1], [0.3, 0.3], 'P = {}'.format(self.p_general)]
        ax.plot(general[0], general[1], linewidth=2)
        ax.text(0.3, 0.32, 'YES')
        ax.text(0.3, 0.25, general[2])
        simple_div = [[1.1, 1.1], [0.1, 0.5]]
        ax.plot(simple_div[0], simple_div[1], color = 'b', linewidth=2)

        suppressed = [[1.1, 2.2], [0.5, 0.5], 'P = {}'.format(1 - self.p_develop)]
        ax.plot(suppressed[0], suppressed[1], linewidth=2, color = 'g')
        ax.text(1.5, 0.52, 'YES')
        ax.text(1.5, 0.45, suppressed[2])

        suppressed = [[1.1, 2.2], [0.1, 0.1], 'P = {}'.format(self.p_develop)]
        ax.plot(suppressed[0], suppressed[1], linewidth=2, color = 'b')
        ax.text(1.5, 0.12, 'NO')
        ax.text(1.5, 0.05, suppressed[2])

        simple_div = [[2.2, 2.2], [-0.1, 0.3]]
        ax.plot(simple_div[0], simple_div[1], color = 'b', linewidth=2)

        dcbe = [[2.2, 4.4], [0.3, 0.3], 'P = {}'.format('%.3f' % (1 - float(self.p_Tk)))]
        ax.plot(dcbe[0], dcbe[1], linewidth=2, color = 'b')
        ax.text(2.5, 0.32, 'YES')
        ax.text(2.5, 0.25, dcbe[2])

        dcbe = [[2.2, 3.3], [-0.1, -0.1], 'P = {}'.format(self.p_Tk)]
        ax.plot(dcbe[0], dcbe[1], linewidth=2, color = 'b')
        ax.text(2.5, -0.08, 'NO')
        ax.text(2.5, -0.15, dcbe[2])

        simple_div = [[3.3, 3.3], [-0.325, 0.115]]
        ax.plot(simple_div[0], simple_div[1], color = 'b', linewidth=2)

        p_time = [[3.3, 4.4], [0.115, 0.115], 'P = {}'.format('%.3f' % (1 - float(self.p_time_less)))]
        ax.plot(p_time[0], p_time[1], linewidth=2, color = 'b')
        ax.text(3.5, 0.135, 'NO')
        ax.text(3.5, 0.065, p_time[2])

        fed_l = [[3.3, 4.4], [-0.325, -0.325], 'P = {}'.format(self.p_time_less)]
        ax.plot(fed_l[0], fed_l[1], linewidth=2, color = 'b')
        ax.text(3.5, -0.305, 'YES')
        ax.text(3.5, -0.375, fed_l[2])

        ax.plot([3.3, 6.5], [-0.5, -0.5], linewidth=0.1, color='white')

        c = patches.Ellipse(xy=(0.643, 0.565), width=0.02, height=0.04, fill=True, transform=ax.transAxes, clip_on=False, color='b')
        ax.add_patch(c)
        p1 = float(self.p_general) * self.p_develop * (1 - self.p_Tk)
        ax.text(4.65, 0.285, r'$P_5 =  %.2E; S_5 = N$' % Decimal(p1))

        c = patches.Ellipse(xy=(0.643, 0.442), width=0.02, height=0.04, fill=True, transform=ax.transAxes, clip_on=False, color='b')
        ax.add_patch(c)
        p1 = float(self.p_general) * self.p_develop * self.p_Tk * self.p_time_less
        ax.text(4.65, -0.335, r'$P_7 =  %.2E; S_7 = H$' % Decimal(p1))


        c = patches.Ellipse(xy=(0.643, 0.159), width=0.02, height=0.04, fill=True, transform=ax.transAxes, clip_on=False, color='b')
        ax.add_patch(c)
        p = float(self.p_general) * self.p_develop * self.p_Tk * (1 - self.p_time_less)
        ax.text(4.65, 0.094, r'$P_6 =  %.2E; S_6 = L$' % Decimal(p))

        fig.savefig('{}/picts/tree_steel.png'.format(self.building))
