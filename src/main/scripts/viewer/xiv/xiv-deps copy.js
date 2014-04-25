goog.addDependency('../../../../xiv.js', 
['xiv'], [ 
    'goog.dom',
    'goog.array',
    'goog.object',
    'goog.window',
    'X.loader',
    'X.parserIMA',
    'nrg.fx',
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
    'nrg.ui.Component',
    'nrg.dom',
    'nrg.string',
    'nrg.style',
    'nrg.convert',
    'nrg.fx',
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
    'nrg.string',
    'nrg.dom',
    'nrg.array',
    'nrg.style',
    'nrg.ui.ZippyTree',
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
    'nrg.string', 
    'nrg.fx', 
    'nrg.events.EventManager', 
    'nrg.ui.ThumbnailGallery',
    'nrg.ui.Thumbnail',
    'xiv.ui.Thumbnail'
]);


goog.addDependency('../../../../ui/Thumbnail.js', 
['xiv.ui.Thumbnail'], [
    'goog.dom',
    'goog.string',
    'nrg.ui.Thumbnail',
]);



goog.addDependency('../../../../ui/ViewBox.js', 
['xiv.ui.ViewBox'], [
    'goog.string',
    'goog.events',
    'goog.dom', 
    'goog.array',
    'goog.object',
    'nrg.ui.Component',
    'nrg.events.EventManager',
    'nrg.style',
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
    'nrg.ui.Component',
    'nrg.string',
    'nrg.style',
    'nrg.fx',
    'nrg.events.EventManager',
    'xiv.ui.ViewBox'
]);




goog.addDependency('../../../../ui/XtkPlane.js', 
['xiv.ui.XtkPlane'], [
    'goog.dom',
    'goog.ui.Slider',
    'X.renderer2D',
    'X.renderer3D',
    'nrg.dom',
    'nrg.ui.Component',
    'nrg.style'
]);


goog.addDependency('../../../../ui/ViewLayout.js', 
['xiv.ui.ViewLayout'], [
    'goog.string',
    'goog.array',
    'nrg.string'
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
    'nrg.string',
    'nrg.fx',
    'nrg.dom',
    'nrg.array',
    'nrg.style',
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
    'nrg.ui.Component',
    'nrg.dom',
    'nrg.style',
    'nrg.fx',
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
    'nrg.ui.Component',
    'nrg.convert',
    'nrg.ui.ScrollableContainer',
    'nrg.style',
    'nrg.events.EventManager'
]);



goog.addDependency('../../../../ui/Displayer/Xtk/Xtk.js', 
['xiv.ui.Displayer.Xtk'], [
    'goog.string',
    'goog.dom',
    'goog.array',
    'X.sphere',
    'nrg.ui.Component',
    'nrg.string',
    'nrg.style',
    'xiv.xtk.xtkHandler',
    'xiv.ui.XtkControllerMenu',
    'nrg.convert',
    'nrg.dom',
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
    'nrg.ui.Component',
      'nrg.convert',
    'nrg.style',
]);


goog.addDependency('../../../../ui/XtkPlaneManager.js', 
['xiv.ui.XtkPlaneManager'], [
    'goog.array',
    'nrg.dom',
    'xiv.ui.Displayer',
    'xiv.ui.XtkPlane',
]);





goog.addDependency('../../../../ui/SlicerViewMenu.js', 
['xiv.ui.SlicerViewMenu'], [
    'goog.array',
    'nrg.dom',
    'nrg.ui.Component',
    'nrg.ui.Thumbnail',
    'nrg.ui.ScrollableContainer',
    'nrg.events.EventManager',
    
]);




goog.addDependency('../../../../slicer/slicer.js', 
['xiv.slicer'], [
    'goog.dom.DomHelper'
]);


goog.addDependency('../../../xiv/slicer/mrbProperties/mrbProperties.js', 
['xiv.slicer.mrbProperties'], [
    'goog.array',
    'goog.string',
    'nrg.string'
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





