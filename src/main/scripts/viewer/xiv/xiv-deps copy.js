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
    'xiv.ui.Modal' 
]); 


goog.addDependency('../../../../ui/ui.js', 
['xiv.ui'], [  
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
    'xiv.ui.ViewBoxManager',
    'xiv.ui.ThumbnailHandler',
]); 



goog.addDependency('../../../../ui/XtkControllerMenu.js', 
['xiv.ui.XtkControllerMenu'], [
    'goog.ui.TwoThumbSlider',
    'goog.events',
    'goog.array',
    'goog.string',
    'goog.dom',
    'moka.string',
    'moka.dom',
    'moka.array',
    'moka.style',
    'moka.ui.ZippyTree',
    'xiv.xtk.xtkHandler'
]);



goog.addDependency('../../../../xtk/xtkHandler.js', 
['xiv.xtk.xtkHandler'], [
    'X.mesh',
    'X.volume',
    'X.fibers',
    'X.sphere',
    'xiv.slicer',
    'goog.string'
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


goog.addDependency('../../../../ui/Thumbnail.js', 
['xiv.ui.Thumbnail'], [
    'goog.dom',
    'goog.string',
    'moka.ui.Thumbnail',
]);



goog.addDependency('../../../../ui/ViewBox.js', 
['xiv.ui.ViewBox'], [
    'goog.string',
    'goog.events',
    'goog.dom', 
    'goog.array',
    'goog.object',
    'moka.ui.Component',
    'moka.events.EventManager',
    'moka.style',
    'xiv.ui.ViewLayoutHandler',
    'xiv.ui.ViewLayoutMenu',
    'xiv.ui.ViewBoxTabs',
    'xiv.ui.Displayer.Xtk',
    'xiv.ui.SlicerViewMenu'
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




goog.addDependency('../../../../ui/XtkPlane.js', 
['xiv.ui.XtkPlane'], [
    'goog.dom',
    'goog.ui.Slider',
    'X.renderer2D',
    'X.renderer3D',
    'moka.dom',
    'moka.ui.Component',
    'moka.style'
]);


goog.addDependency('../../../../ui/ViewLayout.js', 
['xiv.ui.ViewLayout'], [
    'goog.string',
    'goog.array',
    'moka.string'
]);

goog.addDependency('../../../../ui/ViewLayoutHandler.js', 
['xiv.ui.ViewLayoutHandler'], [
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
    'xiv.ui.XtkPlane',
    'xiv.ui.ViewLayout'
]);





goog.addDependency('../../../../ui/ViewLayoutMenu.js', 
['xiv.ui.ViewLayoutMenu'], [
    'goog.ui.MenuButton',
    'goog.style',
    'goog.ui.MenuItem',
    'goog.array',
    'goog.ui.Menu',
    'goog.async.Delay',
    'goog.events',
    'goog.dom',
    'goog.fx',
    'moka.ui.Component',
    'moka.dom',
    'moka.style',
    'moka.fx',
    'xiv.ui.ViewLayout',
]);



goog.addDependency('../../../../ui/ViewBoxTabs.js', 
['xiv.ui.ViewBoxTabs'], [
    'goog.object',
    'goog.string',
    'goog.dom',
    'goog.array',
    'goog.ui.TabPane',
    'goog.ui.TabPane.TabPage',
    'goog.events',
    'moka.ui.Component',
    'moka.convert',
    'moka.ui.ScrollableContainer',
    'moka.style',
    'moka.events.EventManager'
]);



goog.addDependency('../../../../ui/Displayer/Xtk/Xtk.js', 
['xiv.ui.Displayer.Xtk'], [
    'goog.string',
    'goog.dom',
    'goog.array',
    'X.sphere',
    'moka.ui.Component',
    'moka.string',
    'moka.style',
    'xiv.xtk.xtkHandler',
    'xiv.ui.XtkControllerMenu',
    'moka.convert',
    'moka.dom',
    'xiv.slicer',
    'xiv.ui.XtkPlaneManager',
    'xiv.ui.Displayer',
    'xiv.ui.Thumbnail',
]);



goog.addDependency('../../../../ui/Displayer/Displayer.js', 
['xiv.ui.Displayer'], [
    'goog.string',
    'goog.dom',
    'goog.array',
    'moka.ui.Component',
      'moka.convert',
    'moka.style',
]);


goog.addDependency('../../../../ui/XtkPlaneManager.js', 
['xiv.ui.XtkPlaneManager'], [
    'goog.array',
    'moka.dom',
    'xiv.ui.Displayer',
    'xiv.ui.XtkPlane',
]);





goog.addDependency('../../../../ui/SlicerViewMenu.js', 
['xiv.ui.SlicerViewMenu'], [
    'goog.array',
    'moka.dom',
    'moka.ui.Component',
    'moka.ui.Thumbnail',
    'moka.ui.ScrollableContainer',
    'moka.events.EventManager',
    
]);




goog.addDependency('../../../../slicer/slicer.js', 
['xiv.slicer'], [
    'goog.dom.DomHelper'
]);


goog.addDependency('../../../xiv/slicer/mrbProperties/mrbProperties.js', 
['xiv.slicer.mrbProperties'], [
    'goog.array',
    'goog.string',
    'moka.string'
]);



goog.addDependency('../../../../xtk/xtkHandler.js', 
['xiv.xtk.xtkHandler'], [
    'X.mesh',
    'X.volume',
    'X.fibers',
    'X.sphere',
    'xiv.slicer',
    'goog.string'
]);





