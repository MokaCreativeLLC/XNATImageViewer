goog.addDependency('../../../../ui/ui.js', 
['xiv.ui'], [
]);





goog.addDependency('../../../../ui/layouts/layouts.js', 
['xiv.ui.layouts'], [
]);

goog.addDependency('../../../../ui/layouts/LayoutHandler.js', 
['xiv.ui.layouts.LayoutHandler'], [
    'goog.fx.dom.BgColorTransform',
    'goog.fx.dom.FadeInAndShow',
    'goog.events',
    'goog.fx.AnimationParallelQueue',
    'goog.fx.dom.FadeOut',
    'goog.array',
    'goog.fx.Animation',
    'goog.fx.dom.Slide',
    'goog.fx.dom.Resize',
    'goog.dom',
    'moka.string',
    'moka.fx',
    'moka.dom',
    'moka.array',
    'moka.style',
    'xiv.ui.layouts.Layout',
    'xiv.ui.layouts.Conventional'
]);



goog.addDependency('../../../../ui/layouts/Plane.js', 
['xiv.ui.layouts.Plane'], [
]);


goog.addDependency('../../../../ui/layouts/Layout.js', 
['xiv.ui.layouts.Layout'], [
    'moka.ui.Component',
    'xiv.ui.layouts.Plane'
]);


goog.addDependency('../../../../ui/layouts/Conventional.js', 
['xiv.ui.layouts.Conventional'], [
    'xiv.ui.layouts.Layout'
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
    'moka.ui.SlideInMenu',
    'moka.ui.ZipTabs',
    'xiv.ui.layouts.LayoutHandler'
    //'xiv.ui.Displayer.Xtk',
    //'xiv.ui.SlicerViewMenu'
]);


goog.addDependency('../../../../ui/ViewBoxHandler.js', 
['xiv.ui.ViewBoxHandler'], [
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
    'xiv.ui.ViewBoxHandler',
    'xiv.ui.ThumbnailHandler',
]);



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
]); 



goog.addDependency('../../../../ui/Thumbnail.js', 
['xiv.ui.Thumbnail'], [
    'goog.dom',
    'goog.string',
    'moka.ui.Thumbnail',
]);



goog.addDependency('../../../../ui/ThumbnailHandler.js', 
['xiv.ui.ThumbnailHandler'], [
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





