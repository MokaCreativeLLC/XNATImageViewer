

goog.addDependency('../../../xiv/Widget/Widget.js', ['xiv.Widget'], [ 
    'utils.style', 
    'utils.dom'
]); 

goog.addDependency('../../../xiv/xiv.js', ['xiv'], [ 
    'goog.dom',
    'goog.array',
    'goog.object',
    'goog.window',
    'X.loader',
    'X.parserIMA',
    'utils.fx',,
    'utils.xnat',
    'utils.xnat.Path',
    'xiv.Modal',
]); 


goog.addDependency('../../../xiv/Modal/Modal.js', ['xiv.Modal'], [
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


    'utils.dom',
    'utils.string',
    'utils.style',
    'utils.convert',
    'utils.fx',


    'xiv',
    'xiv.Widget',
    'xiv.ViewBoxManager',
    'xiv.ThumbnailManager',
]); 


goog.addDependency('../../../xiv/ThumbnailManager/ThumbnailManager.js', 
		   ['xiv.ThumbnailManager'], [
		       'goog.string',
		       'goog.dom',
		       'goog.dom.classes',
		       'goog.events',
		       'goog.array',
		       'goog.fx.DragDrop', 
		       'goog.fx.DragDropGroup', 
		       'utils.string', 
		       'utils.fx', 
		       'utils.events.EventManager', 
		       'utils.ui.ThumbnailGallery',
		       'utils.ui.Thumbnail',
		       'xiv.Thumbnail'
		   ]);




goog.addDependency('../../../xiv/Thumbnail/Thumbnail.js', ['xiv.Thumbnail'], [
    'goog.dom',
    'utils.ui.Thumbnail',
]);




goog.addDependency('../../../xiv/ViewBoxManager/ViewBoxManager.js', 
['xiv.ViewBoxManager'], [
'goog.array',
'goog.string',
'goog.dom',
'goog.events',
'goog.fx.easing',
'goog.fx.dom.Slide',
'goog.fx.DragDrop',
'goog.fx.DragDropGroup',
'goog.fx.AnimationParallelQueue',
'utils.string',
'utils.style',
'utils.fx',
'utils.events.EventManager',
'xiv.ViewBox'
]);



goog.addDependency('../../../xiv/ViewLayoutManager/ViewLayoutManager.js', ['xiv.ViewLayoutManager'], [
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
'utils.string',
'utils.fx',
'utils.dom',
'utils.array',
'utils.style',
'xiv.XtkPlane',
'xiv.ViewBox',
'xiv',
'xiv.ViewLayout',
]);



goog.addDependency('../../../xiv/ViewBox/ViewBox.js', ['xiv.ViewBox'], [
'goog.string',
'goog.events',
'goog.dom', 
'goog.array',
'goog.object',
'utils.events.EventManager',
'utils.style',
'xiv.Widget',
'xiv.ViewLayoutManager',
'xiv.ViewLayoutMenu',
'xiv.ContentDivider',
'xiv.ViewBoxTabs',
'xiv.XtkDisplayer',
'xiv.SlicerViewMenu'
]);





goog.addDependency('../../../xiv/XtkPlane/XtkPlane.js', ['xiv.XtkPlane'], [
'goog.dom',
'goog.ui.Slider',
'X.renderer2D',
'X.renderer3D',
'utils.dom',
'utils.style',
'xiv.Widget',
]);



goog.addDependency('../../../xiv/ViewLayout/ViewLayout.js', ['xiv.ViewLayout'], [
'goog.string',
'goog.array',
'utils.string',
'xiv',
]);


goog.addDependency('../../../xiv/ViewLayoutMenu/ViewLayoutMenu.js', ['xiv.ViewLayoutMenu'], [
'goog.ui.MenuButton',
'goog.style',
'goog.ui.MenuItem',
'goog.array',
'goog.ui.Menu',
'goog.async.Delay',
'goog.events',
'goog.dom',
'goog.fx',
'utils.dom',
'utils.style',
'utils.fx',
'xiv.Widget',
'xiv.ViewLayout',
'xiv',
]);



goog.addDependency('../../../xiv/ContentDivider/ContentDivider.js', ['xiv.ContentDivider'], [
'goog.events',
'goog.array',
'goog.dom',
'goog.fx',
'utils.dom',
'utils.style',
'utils.events.EventManager',
'xiv.ViewBoxTabs',
'xiv.Widget',
'xiv',
]);


goog.addDependency('../../../xiv/ViewBoxTabs/ViewBoxTabs.js', 
['xiv.ViewBoxTabs'], [
'goog.object',
'goog.string',
'goog.dom',
'goog.array',
'goog.ui.TabPane',
'goog.ui.TabPane.TabPage',
'goog.events',
'utils.convert',
'utils.ui.ScrollableContainer',
'utils.style',
'utils.events.EventManager',
'xiv.Widget',
]);



goog.addDependency('../../../xiv/XtkDisplayer/XtkDisplayer.js', ['xiv.XtkDisplayer'], [
'goog.string',
'goog.dom',
'goog.array',
'X.sphere',
'utils.string',
'utils.slicer',
'utils.style',
'utils.xtk',
'utils.xtk.ControllerMenu',
'utils.convert',
'utils.dom',
'xiv.ViewBox',
'xiv',
'xiv.Widget',
'xiv.XtkPlaneManager',
'xiv.Displayer',
'xiv.Thumbnail',
]);



goog.addDependency('../../../xiv/Displayer/Displayer.js', ['xiv.Displayer'], [
'goog.string',
'goog.dom',
'goog.array',
'utils.convert',
'utils.style',
'xiv.Widget',
]);


goog.addDependency('../../../xiv/XtkPlaneManager/XtkPlaneManager.js', ['xiv.XtkPlaneManager'], [
'goog.array',
'utils.dom',
'xiv.Displayer',
'xiv.XtkPlane',
]);


goog.addDependency('../../../xiv/SlicerViewMenu/SlicerViewMenu.js', 
['xiv.SlicerViewMenu'], [
'goog.array',
'utils.dom',
'utils.ui.Thumbnail',
'utils.ui.ScrollableContainer',
'utils.events.EventManager',
'xiv',
'xiv.Widget',
'xiv.ViewBox',
]);



