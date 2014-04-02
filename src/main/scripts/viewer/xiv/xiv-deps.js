goog.addDependency('../../../../vis/vis.js', 
['xiv.vis'], []);



goog.addDependency('../../../../vis/RenderEngine.js', 
['xiv.vis.RenderEngine'], [
    'goog.events.EventTarget'
]);


goog.addDependency('../../../../vis/XtkEngine.js', 
['xiv.vis.XtkEngine'], [
    'xiv.vis.RenderEngine'
]);


goog.addDependency('../../../../vis/XtkPlane.js', 
['xiv.vis.XtkPlane'], [
    'goog.events.EventTarget'
]);


goog.addDependency('../../../../vis/XtkPlane2D.js', 
['xiv.vis.XtkPlane2D'], [
    'xiv.vis.XtkPlane'
]);


goog.addDependency('../../../../vis/XtkPlane3D.js', 
['xiv.vis.XtkPlane3D'], [
    'xiv.vis.XtkPlane'
]);



goog.addDependency('../../../../vis/XtkRenderer2D.js', 
['xiv.vis.XtkRenderer2D'], [
    'X.renderer2D'
]);


goog.addDependency('../../../../vis/XtkRenderer3D.js', 
['xiv.vis.XtkRenderer3D'], [
    'X.renderer3D'
]);


goog.addDependency('../../../../ui/ui.js', 
['xiv.ui'], [
]);


goog.addDependency('../../../../ui/ctrl/CheckboxController.js', 
['xiv.ui.ctrl.CheckboxController'], [
]);


goog.addDependency('../../../../ui/ctrl/DisplayAll.js', 
['xiv.ui.ctrl.DisplayAll'], [
    'xiv.ui.ctrl.CheckboxController'
]);


goog.addDependency('../../../../ui/ctrl/TwoThumbSliderController.js', 
['xiv.ui.ctrl.TwoThumbSliderController'], [
    'xiv.ui.ctrl.XtkController'
]);


goog.addDependency('../../../../ui/ctrl/SliderController.js', 
['xiv.ui.ctrl.SliderController'], [
    'xiv.ui.ctrl.XtkController'
]);



goog.addDependency('../../../../ui/ctrl/MasterOpacity.js', 
['xiv.ui.ctrl.MasterOpacity'], [
    'xiv.ui.ctrl.SliderController'
]);


goog.addDependency('../../../../ui/ctrl/MasterController.js', 
['xiv.ui.ctrl.MasterController'], [
]);


goog.addDependency('../../../../ui/ctrl/VolumeController2D.js', 
['xiv.ui.ctrl.VolumeController2D'], [
    'xiv.ui.ctrl.MasterController'
]);



goog.addDependency('../../../../ui/ctrl/VolumeController3D.js', 
['xiv.ui.ctrl.VolumeController3D'], [
    'xiv.ui.ctrl.MasterController'
]);



goog.addDependency('../../../../ui/ctrl/XtkController.js', 
['xiv.ui.ctrl.XtkController'], [
]);


goog.addDependency('../../../../ui/ctrl/XtkControllerTree.js', 
['xiv.ui.ctrl.XtkControllerTree'], [
    'xiv.ui.ctrl.XtkController'
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



goog.addDependency('../../../../ui/Plane.js', 
['xiv.ui.Plane'], [
]);


goog.addDependency('../../../../ui/layouts/Layout.js', 
['xiv.ui.layouts.Layout'], [
    'moka.ui.Component',
    'xiv.ui.Plane'
]);


goog.addDependency('../../../../ui/layouts/XyzvLayout.js', 
['xiv.ui.layouts.XyzvLayout'], [
    'xiv.ui.layouts.Layout'
]);

goog.addDependency('../../../../ui/layouts/Conventional.js', 
['xiv.ui.layouts.Conventional'], [
    'xiv.ui.layouts.XyzvLayout'
]);


goog.addDependency('../../../../ui/layouts/FourUp.js', 
['xiv.ui.layouts.FourUp'], [
    'xiv.ui.layouts.XyzvLayout'
]);

goog.addDependency('../../../../ui/ViewableGroupMenu.js', 
['xiv.ui.ViewableGroupMenu'], [
    'moka.ui.ThumbnailGallery'
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
    'moka.style',
    'moka.ui.SlideInMenu',
    'moka.ui.ZipTabs',
    'xiv.ui.layouts.LayoutHandler',
    'xiv.vis.XtkEngine',
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
    'xiv.ui.ThumbnailGallery',
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



goog.addDependency('../../../../ui/ThumbnailGallery.js', 
['xiv.ui.ThumbnailGallery'], [
    'goog.string',
    'goog.dom',
    'goog.dom.classes',
    'goog.events',
    'goog.array',
    'goog.fx.DragDrop', 
    'goog.fx.DragDropGroup', 
    'moka.string', 
    'moka.fx', 
    'moka.ui.ThumbnailGallery',
    'moka.ui.Thumbnail',
    'xiv.ui.Thumbnail'
]);





