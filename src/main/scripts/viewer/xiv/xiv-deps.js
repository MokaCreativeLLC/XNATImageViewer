

goog.addDependency('../../../xiv/Widget/Widget.js', ['xiv.Widget'], [ 'utils.style', 'utils.dom', 'goog.dom']); 

goog.addDependency('../../../xiv/xiv.js', ['xiv'], [ 
    'goog.dom',
    'goog.dom.fullscreen',
    'goog.fx',
    'goog.events',
    'X.loader',
    'X.parserIMA',
    'utils.fx',
    'utils.style',
    'utils.xnat',
    'xiv.Modal',
]); 


goog.addDependency('../../../xiv/Modal/Modal.js', ['xiv.Modal'], [
'utils.xnat',
'utils.dom',
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
		       'utils.ui.ThumbnailGallery',
		       'goog.fx', 
		       'goog.fx.DragDrop', 
		       'goog.fx.DragDropGroup', 
		       'utils.array', 
		       'xiv.Thumbnail'
		   ]);







goog.addDependency('../../../xiv/Thumbnail/Thumbnail.js', ['xiv.Thumbnail'], [
'goog.dom',
'goog.array',
'goog.events',
'utils.dom',
'utils.style',
'utils.ui.Thumbnail',
'xiv',
'xiv.Widget',
]);





goog.addDependency('../../../xiv/ViewBoxManager/ViewBoxManager.js', ['xiv.ViewBoxManager'], [
'goog.array',
'goog.dom',
'goog.events',
'goog.fx',
'goog.fx.dom',
'goog.fx.DragDrop',
'goog.fx.AnimationParallelQueue',
'goog.ui.Tooltip',
'utils.style',
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
'goog.fx',
'goog.fx.DragDrop',
'goog.string',
'goog.dom',
'goog.events',
'utils.dom',
'utils.style',
'utils.array',
'utils.fx',
'xiv',
'xiv.Widget',
'xiv.ViewLayoutManager',
'xiv.ViewLayoutMenu',
'xiv.ContentDivider',
'xiv.ViewBoxTabs',
'xiv.XtkDisplayer'
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
'xiv.ViewBoxTabs',
'xiv.Widget',
'xiv',
]);


goog.addDependency('../../../xiv/ViewBoxTabs/ViewBoxTabs.js', ['xiv.ViewBoxTabs'], [
'goog.events',
'goog.array',
'goog.string',
'goog.ui.TabPane',
'goog.dom',
'utils.convert',
'utils.ui.ScrollableContainer',
'utils.dom',
'utils.fx',
'utils.style',
'xiv.ViewBox',
'xiv.Widget',
'xiv',
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


goog.addDependency('../../../xiv/SlicerViewMenu/SlicerViewMenu.js', ['xiv.SlicerViewMenu'], [
'goog.array',
'utils.dom',
'utils.ui.Thumbnail',
'utils.ui.ScrollableContainer',
'xiv',
'xiv.Widget',
'xiv.ViewBox',
]);



