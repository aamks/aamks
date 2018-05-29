import FreeCAD,FreeCADGui,Part

class BoxTaskPanel:

    def __init__(self):
        self.form = FreeCADGui.PySideUic.loadUi("/home/mateusz/FreeCad/qt/doors/dialog.ui")

    def accept(self):
        length = self.form.BoxLength.value()
        width = self.form.BoxWidth.value()
        height = self.form.BoxHeight.value()
        if (length == 0) or (width == 0) or (height == 0):
            print("Error! None of the values can be 0!")
            return
        box = Part.makeBox(length,width,height)
        Part.show(box)
        FreeCADGui.Control.closeDialog()
	def reject(self):
		FreeCAD.Console.PrintMessage("Value  : "+"\n")
		print("Zamkniecie")

panel = BoxTaskPanel()
FreeCADGui.Control.showDialog(panel)
