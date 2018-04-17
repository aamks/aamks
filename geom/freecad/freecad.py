import FreeCAD
import Part
from PySide import QtGui
import time

print "Start             ", time.strftime("%H:%M:%S", time.localtime())

height =  QtGui.QInputDialog.getInteger(None, "Wysokosc obiektu", "Wprowadz wysokosc:")

for select in FreeCADGui.Selection.getSelection():
	object = FreeCAD.ActiveDocument.addObject("Part::Extrusion", "Extrude")
	object.Base = select
	object.Dir = (0, 0, height[0])
	FreeCADGui.ActiveDocument.getObject(select.Name).Visibility = False

print "End successfully ", time.strftime("%H:%M:%S", time.localtime())

