goog.addDependency('../../../../xiv.js', 
['xiv'], [ 
    'goog.dom',
    'goog.array',
    'goog.object',
    'goog.window',
    'X.loader',
    'X.parserIMA',
    'moka.fx',
    'gxnat',
    'gxnat.Path',
    'gxnat.ProjectTree',
    //'xiv.ui.Modal' 
]); 


goog.addDependency('../../../../ui/Modal.js', 
['xiv.ui.Modal'], [
    'goog.object',
    'goog.dom',
    'goog.dom.fullscreen',
    'goog.array',
    'goog.string',
    'goog.string.path',
    'goog.fx',
    'goog.fx.easing',
    'goog.fx.AnimationParallelQueue',
    'goog.fx.dom.Slide',
    'goog.fx.dom.Resize',
    'goog.events',
    'moka.ui.Component',
    'moka.dom',
    'moka.string',
    'moka.style',
    'moka.convert',
    'moka.fx',
    //'xiv.ui.ViewBoxManager',
    'xiv.ui.ThumbnailManager',
]);


goog.addDependency('../../../../ui/ThumbnailManager.js', 
['xiv.ui.ThumbnailManager'], [
    'goog.string',
    'goog.dom',
    'goog.dom.classes',
    'goog.events',
    'goog.array',
    'goog.fx.DragDrop', 
    'goog.fx.DragDropGroup', 
    'moka.string', 
    'moka.fx', 
    'moka.events.EventManager', 
    'moka.ui.ThumbnailGallery',
    'moka.ui.Thumbnail',
    'xiv.ui.Thumbnail'
]);


goog.addDependency('../../../../ui/Thumbnail.js', 
['xiv.ui.Thumbnail'], [
    'goog.dom',
    'goog.string',
    'moka.ui.Thumbnail',
]);



goog.addDependency('../../../../ui/ViewBoxManager.js', 
['xiv.ui.ViewBoxManager'], [
    'goog.array',
    'goog.string',
    'goog.dom',
    'goog.events',
    'goog.fx.easing',
    'goog.fx.dom.Slide',
    'goog.fx.DragDrop',
    'goog.fx.DragDropGroup',
    'goog.fx.AnimationParallelQueue',
    'moka.ui.Component',
    'moka.string',
    'moka.style',
    'moka.fx',
    'moka.events.EventManager',
    'xiv.ui.ViewBox'
]);




goog.addDependency('../../../../ui/ViewBox.js', 
['xiv.ui.ViewBox'], [
    'goog.string',
    'goog.events',
    'goog.dom', 
    'goog.array',
    'goog.object',
    'goog.style',
    'moka.ui.Component',
    'moka.events.EventManager',
    'moka.style',
    //'xiv.ui.ViewLayoutManager',
    //'xiv.ui.ViewLayoutMenu',
    'moka.ui.ZipTabs',
    //'xiv.ui.Displayer.Xtk',
    //'xiv.ui.SlicerViewMenu'
]);



