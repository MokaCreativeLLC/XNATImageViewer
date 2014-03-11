goog.addDependency('../../../gxnat/gxnat.js', ['gxnat'], [
'goog.net.XhrIo',
'goog.object',
'moka.dom',
'moka.array',
'gxnat.Viewable',
'gxnat.Viewable.Scan',
'gxnat.Viewable.Slicer'
]);


goog.addDependency('../../../gxnat/Path/Path.js', 
['gxnat.Path'], 
[]);


goog.addDependency('../../../gxnat/ProjectTree/ProjectTree.js', 
['gxnat.ProjectTree'], [
'goog.array',
'gxnat',
'gxnat.Path'
]);



goog.addDependency('../../../gxnat/Viewable/Viewable.js', 
['gxnat.Viewable'], [
'goog.array',
'gxnat',
'gxnat.Path',
]);


goog.addDependency('../../../gxnat/Viewable/Scan/Scan.js',
['gxnat.Viewable.Scan'], [
'moka.array',
'gxnat',
'gxnat.Viewable',
'gxnat.Path',
]);


goog.addDependency('../../../gxnat/Viewable/Slicer/Slicer.js',
['gxnat.Viewable.Slicer'], [
'goog.string',
'moka.string',
'gxnat',
'gxnat.Viewable',
]);
