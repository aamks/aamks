 #-*- coding: utf-8 -*-

import FreeCAD
import Part
print "Select two objects where the hole will be created"
select = Gui.Selection.getSelection()
HOLE = App.activeDocument().addObject("Part::Section","HOLE")
HOLE.Base = select[0]
HOLE.Tool = select[1]
FreeCADGui.ActiveDocument.getObject(select[0].Name).Visibility = True
FreeCADGui.ActiveDocument.getObject(select[1].Name).Visibility = True
#print App.ActiveDocument.HOLE.Placement
App.ActiveDocument.recompute()

