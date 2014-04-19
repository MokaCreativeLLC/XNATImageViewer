goog.addDependency('../../../gxnat/vis/VisNode.js', 
['gxnat.vis.VisNode'], [
    'goog.Disposable'
]);


goog.addDependency('../../../gxnat/vis/Renderable.js', 
['gxnat.vis.Renderable'], [
    'gxnat.vis.VisNode'
]);



goog.addDependency('../../../gxnat/vis/ViewableTree.js', 
['gxnat.vis.ViewableTree'], [
    'gxnat.vis.VisNode'
]);


goog.addDependency('../../../gxnat/vis/ViewableGroup.js', 
['gxnat.vis.ViewableGroup'], [
    'goog.array',
    'gxnat.vis.Renderable'
]);



goog.addDependency('../../../gxnat/gxnat.js', ['gxnat'], [
'goog.net.XhrIo',
'goog.object',
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




goog.addDependency('../../../gxnat/vis/AjaxViewableTree.js', 
['gxnat.vis.AjaxViewableTree'], [
    'goog.string',
    'goog.array',
    'gxnat.Path',
    'gxnat.vis.ViewableTree'
]);


goog.addDependency('../../../gxnat/vis/vis.js', 
['gxnat.vis'], [
]);






goog.addDependency('../../../gxnat/vis/Viewable.js', 
['gxnat.vis.Viewable'], [
    'goog.array',
    'gxnat.vis.Renderable'
]);






goog.addDependency('../../../gxnat/vis/Scan.js',
['gxnat.vis.Scan'], [
'gxnat.vis.AjaxViewableTree',
]);


goog.addDependency('../../../gxnat/vis/Slicer.js',
['gxnat.vis.Slicer'], [
'gxnat.vis.AjaxViewableTree',
]);





goog.addDependency('../../../gxnat/slicer/slicer.js',
['gxnat.slicer'], [
]);


goog.addDependency('../../../gxnat/slicer/Node.js',
['gxnat.slicer.Node'], [
]);



goog.addDependency('../../../gxnat/vis/RenderProperties.js',
['gxnat.vis.RenderProperties'], [
]);




