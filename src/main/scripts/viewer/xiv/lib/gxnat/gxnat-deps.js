goog.addDependency('../../../gxnat/gxnat.js', ['gxnat'], [
'goog.net.XhrIo',
'goog.object',
'moka.dom',
'moka.array',
'gxnat.Viewable',
'gxnat.Scan',
'gxnat.Slicer'
]);


goog.addDependency('../../../gxnat/Path.js', 
['gxnat.Path'], 
[]);


goog.addDependency('../../../gxnat/ProjectTree.js', 
['gxnat.ProjectTree'], [
'goog.array',
'gxnat',
'gxnat.Path'
]);



goog.addDependency('../../../gxnat/Viewable.js', 
['gxnat.Viewable'], [
'goog.array',
'gxnat',
'gxnat.Path',
]);


goog.addDependency('../../../gxnat/Scan.js',
['gxnat.Scan'], [
'moka.array',
'gxnat',
'gxnat.Viewable',
'gxnat.Path',
]);


goog.addDependency('../../../gxnat/Slicer.js',
['gxnat.Slicer'], [
'goog.string',
'moka.string',
'gxnat',
'gxnat.Viewable',
]);
