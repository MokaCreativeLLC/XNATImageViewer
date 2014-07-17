>>> import vtk
>>> r = vtkDataSetReader()
Traceback (most recent call last):
File "<console>", line 1, in <module>
NameError: name 'vtkDataSetReader' is not defined
>>> r = vtk.vtkDataSetReader()
>>> r.SetFileName('/Users/sunilkumar/Downloads/Skin.vtk')
>>> w = vtk.vtkDataSetWriter()
>>> w.SetInput(r.GetOGetOutput())
Traceback (most recent call last):
File "<console>", line 1, in <module>
AttributeError: GetOGetOutput
>>> w.SetInput(r.GetOutput())
>>> w.SetFileName('/Users/sunilkumar/Downloads/Skin2.vtk')
>>> w.Write()
