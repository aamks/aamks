import Draft
App.newDocument()
v=Gui.activeDocument().activeView()

class AddDoors:
    def __init__(self, view):
        self.view = view
        self.draw_rectangles()
        self.doors=0

    def draw_rectangles(self):
        pl = FreeCAD.Placement()
        pl.Rotation.Q = (0.0,-0.0,-0.0,1.0)
        pl.Base = FreeCAD.Vector(0,0,0)
        Draft.makeRectangle(length=0.5,height=0.5,placement=pl,face=True,support=None)

        pl.Base = FreeCAD.Vector(1,1,0)
        Draft.makeRectangle(length=0.5,height=0.5,placement=pl,face=True,support=None)

    def edge_orientation(self):
        ''' 
        Znajduje dwa punkty krewedzi (Edge) i zwraca orientacje v lub h
        v=vertical, h=horizontal
        '''

        try:
            z=FreeCADGui.Selection.getSelectionEx()[0].SubObjects[0].Vertexes
            if z[0].Point.x == z[1].Point.x:
                return 'v'
            elif z[0].Point.y == z[1].Point.y:
                return 'h'
        except:
            return None


    def make_doors(self, mouse):
        '''
        Dziala dla obiektow typu Draft > Recatangle.
        Przy kazdym kliknieciu myszy sprawdzamy czy kliknieto w Edge (info['Component']).
        W zaleznosci od orientacji Edge rysujemy drzwi od punktu w gore lub w prawo.
        Zmienna self.doors zawiera zawsze numer ostatnio utworzonych drzwi.
        '''

        down = (mouse["State"] == "DOWN")
        pos = mouse["Position"]

        if (down):
            info = self.view.getObjectInfo(pos)
            FreeCAD.Console.PrintMessage("info: {}\n".format(info))

            if info['Component'][:4] == 'Edge':

                if self.edge_orientation() == 'v':
                    points=[FreeCAD.Vector(info['x'],info['y'],0),FreeCAD.Vector(info['x'],info['y']+0.8)]
                    line = Draft.makeWire(points,closed=False,face=True,support=None)
                    self.doors+=1
                    line.Label='D{}'.format(self.doors)
                    FreeCAD.ActiveDocument.getObjectsByLabel(line.Label)[0].ViewObject.LineColor=(0.9,0.7,1.0)

                elif self.edge_orientation() == 'h':
                    points=[FreeCAD.Vector(info['x'],info['y'],0),FreeCAD.Vector(info['x']+0.8,info['y'])]
                    line = Draft.makeWire(points,closed=False,face=True,support=None)
                    self.doors+=1
                    line.Label='D{}'.format(self.doors)
                    FreeCAD.ActiveDocument.getObjectsByLabel(line.Label)[0].ViewObject.LineColor=(0.3,0.7,1.0)
       

# wywolanie klasy
o = AddDoors(v)
c = v.addEventCallback("SoMouseButtonEvent",o.make_doors) 
