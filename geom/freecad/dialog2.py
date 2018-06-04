# -*- coding: utf-8 -*-

from PySide import QtCore, QtGui

class Ui_Dialog(object):
    def setupUi(self, Dialog):
        Dialog.setObjectName("Dialog")
        Dialog.resize(207, 108)
        self.gridLayout = QtGui.QGridLayout(Dialog)
        self.gridLayout.setObjectName("gridLayout")
        self.label_2 = QtGui.QLabel(Dialog)
        self.label_2.setObjectName("label_2")
        self.gridLayout.addWidget(self.label_2, 1, 0, 1, 1)
        self.label = QtGui.QLabel(Dialog)
        self.label.setObjectName("label")
        self.gridLayout.addWidget(self.label, 0, 0, 1, 1)
        self.BoxLength = QtGui.QDoubleSpinBox(Dialog)
        self.BoxLength.setMaximum(9999999.99)
        self.BoxLength.setProperty("value", 90.0)
        self.BoxLength.setObjectName("BoxLength")
        self.gridLayout.addWidget(self.BoxLength, 0, 1, 1, 1)
        self.BoxWidth = QtGui.QDoubleSpinBox(Dialog)
        self.BoxWidth.setMaximum(9999999.99)
        self.BoxWidth.setProperty("value", 1.0)
        self.BoxWidth.setObjectName("BoxWidth")
        self.gridLayout.addWidget(self.BoxWidth, 1, 1, 1, 1)
        self.label_3 = QtGui.QLabel(Dialog)
        self.label_3.setObjectName("label_3")
        self.gridLayout.addWidget(self.label_3, 2, 0, 1, 1)
        self.BoxHeight = QtGui.QDoubleSpinBox(Dialog)
        self.BoxHeight.setMaximum(9999999.99)
        self.BoxHeight.setProperty("value", 200.0)
        self.BoxHeight.setObjectName("BoxHeight")
        self.gridLayout.addWidget(self.BoxHeight, 2, 1, 1, 1)

        self.retranslateUi(Dialog)
        QtCore.QMetaObject.connectSlotsByName(Dialog)

    def retranslateUi(self, Dialog):
        Dialog.setWindowTitle(QtGui.QApplication.translate("Dialog", "Dialog", None, QtGui.QApplication.UnicodeUTF8))
        self.label_2.setText(QtGui.QApplication.translate("Dialog", "Width:", None, QtGui.QApplication.UnicodeUTF8))
        self.label.setText(QtGui.QApplication.translate("Dialog", "Lenght:", None, QtGui.QApplication.UnicodeUTF8))
        self.BoxLength.setSuffix(QtGui.QApplication.translate("Dialog", "cm", None, QtGui.QApplication.UnicodeUTF8))
        self.BoxWidth.setSuffix(QtGui.QApplication.translate("Dialog", "cm", None, QtGui.QApplication.UnicodeUTF8))
        self.label_3.setText(QtGui.QApplication.translate("Dialog", "Height:", None, QtGui.QApplication.UnicodeUTF8))
        self.BoxHeight.setSuffix(QtGui.QApplication.translate("Dialog", "cm", None, QtGui.QApplication.UnicodeUTF8))


