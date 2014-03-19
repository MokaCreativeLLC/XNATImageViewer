goog.addDependency('../../../../renderer/renderer.js', 
['xiv.renderer'], []);


goog.addDependency('../../../../renderer/Engine.js', 
['xiv.renderer.Engine'], [
    'goog.events.EventTarget'
]);


goog.addDependency('../../../../renderer/XtkEngine.js', 
['xiv.renderer.XtkEngine'], [
    'xiv.renderer.Engine'
]);


goog.addDependency('../../../../renderer/XtkPlane.js', 
['xiv.renderer.XtkPlane'], [
    'goog.events.EventTarget'
]);


goog.addDependency('../../../../renderer/XtkPlane2D.js', 
['xiv.renderer.XtkPlane2D'], [
    'xiv.renderer.XtkPlane'
]);


goog.addDependency('../../../../renderer/XtkPlane3D.js', 
['xiv.renderer.XtkPlane3D'], [
    'xiv.renderer.XtkPlane'
]);



goog.addDependency('../../../../renderer/XtkRenderer2D.js', 
['xiv.renderer.XtkRenderer2D'], [
    'X.renderer2D'
]);


goog.addDependency('../../../../renderer/XtkRenderer3D.js', 
['xiv.renderer.XtkRenderer3D'], [
    'X.renderer3D'
]);


goog.addDependency('../../../../ui/ui.js', 
['xiv.ui'], [
]);







goog.addDependency('../../../../ui/LayoutHandler.js', 
['xiv.ui.LayoutHandler'], [
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
    'xiv.ui.Layout',
    'xiv.ui.Conventional'
]);



goog.addDependency('../../../../ui/Plane.js', 
['xiv.ui.Plane'], [
]);


goog.addDependency('../../../../ui/Layout.js', 
['xiv.ui.Layout'], [
    'moka.ui.Component',
    'xiv.ui.Plane'
]);


goog.addDependency('../../../../ui/XyzvLayout.js', 
['xiv.ui.XyzvLayout'], [
    'xiv.ui.Layout'
]);

goog.addDependency('../../../../ui/Conventional.js', 
['xiv.ui.Conventional'], [
    'xiv.ui.XyzvLayout'
]);


goog.addDependency('../../../../ui/FourUp.js', 
['xiv.ui.FourUp'], [
    'xiv.ui.XyzvLayout'
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
    'xiv.ui.LayoutHandler',
    'xiv.renderer.XtkEngine',
    'xiv.ui.ProgressBarPanel',
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

goog.addDependency('../../../../ui/ProgressBarPanel.js', 
['xiv.ui.ProgressBarPanel'], [
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





