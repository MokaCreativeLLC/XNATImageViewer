goog.addDependency('../../../../sample-data/sampleData.js', 
['xiv.sampleData'], []);

goog.addDependency('../../../../sample-data/Sample.js', 
['xiv.sampleData.Sample'], []);

goog.addDependency('../../../../sample-data/SampleCollection.js', 
['xiv.sampleData.SampleCollection'], []);

goog.addDependency('../../../../sample-data/Scans.js', 
['xiv.sampleData.Scans'], [
    'xiv.sampleData.SampleCollection',
    'xiv.sampleData.Sample',
]);


goog.addDependency('../../../../sample-data/SlicerScenes.js', 
['xiv.sampleData.SlicerScenes'], [
    'xiv.sampleData.SampleCollection',
    'xiv.sampleData.Sample',
]);


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


goog.addDependency('../../../../compatibility/compatibility.js', 
['xiv.compatibility'], [
]);



goog.addDependency('../../../../ui/ui.js', 
['xiv.ui'], [
]);


goog.addDependency('../../../../ui/ctrl/ColorPaletteController.js', 
['xiv.ui.ctrl.ColorPaletteController'], [
    'xiv.ui.ctrl.XtkController'
]);


goog.addDependency('../../../../ui/ctrl/RadioButtonController.js', 
['xiv.ui.ctrl.RadioButtonController'], [
    'xiv.ui.ctrl.XtkController'
]);


goog.addDependency('../../../../ui/ctrl/CheckboxController.js', 
['xiv.ui.ctrl.CheckboxController'], [
    'xiv.ui.ctrl.XtkController'
]);



goog.addDependency('../../../../ui/ctrl/TwoThumbSliderController.js', 
['xiv.ui.ctrl.TwoThumbSliderController'], [
    'xiv.ui.ctrl.XtkController'
]);


goog.addDependency('../../../../ui/ctrl/SliderController.js', 
['xiv.ui.ctrl.SliderController'], [
    'xiv.ui.ctrl.XtkController'
]);



goog.addDependency('../../../../ui/ctrl/MasterController2D.js', 
['xiv.ui.ctrl.MasterController2D'], [
]);

goog.addDependency('../../../../ui/ctrl/VolumeController2D.js', 
['xiv.ui.ctrl.VolumeController2D'], [
    'xiv.ui.ctrl.MasterController2D'
]);

goog.addDependency('../../../../ui/ctrl/MasterController3D.js', 
['xiv.ui.ctrl.MasterController3D'], [
]);


goog.addDependency('../../../../ui/ctrl/AnnotationsController3D.js', 
['xiv.ui.ctrl.AnnotationsController3D'], [
]);



goog.addDependency('../../../../ui/ctrl/MeshController3D.js', 
['xiv.ui.ctrl.MeshController3D'], [
]);



goog.addDependency('../../../../ui/ctrl/VolumeController3D.js', 
['xiv.ui.ctrl.VolumeController3D'], [
    'xiv.ui.ctrl.MasterController3D'
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
    'nrg.string',
    'nrg.fx',
    'nrg.dom',
    'nrg.array',
    'nrg.style',
    'xiv.ui.layouts.Layout',
    'xiv.ui.layouts.Conventional'
]);


goog.addDependency('../../../../ui/layouts/interactors/Slider.js', 
['xiv.ui.layouts.interactors.Slider'], [
    'nrg.ui.Slider'
]);



goog.addDependency('../../../../ui/layouts/interactors/FrameDisplay.js', 
['xiv.ui.layouts.interactors.FrameDisplay'], [
    'nrg.ui.Component'
]);


goog.addDependency('../../../../ui/layouts/interactors/ZoomDisplay.js', 
['xiv.ui.layouts.interactors.ZoomDisplay'], [
    'nrg.ui.Component'
]);


goog.addDependency('../../../../ui/layouts/interactors/Crosshairs.js', 
['xiv.ui.layouts.interactors.Crosshairs'], [
    'nrg.ui.Component'
]);



goog.addDependency('../../../../ui/layouts/LayoutFrame.js', 
['xiv.ui.layouts.LayoutFrame'], [
]);


goog.addDependency('../../../../ui/layouts/Layout.js', 
['xiv.ui.layouts.Layout'], [
    'nrg.ui.Component',
    'xiv.ui.layouts.LayoutFrame'
]);


goog.addDependency('../../../../ui/layouts/XyzvLayout.js', 
['xiv.ui.layouts.XyzvLayout'], [
    'xiv.ui.layouts.Layout'
]);


goog.addDependency('../../../../ui/layouts/SingleFrameLayout.js', 
['xiv.ui.layouts.SingleFrameLayout'], [
    'xiv.ui.layouts.XyzvLayout'
]);

goog.addDependency('../../../../ui/layouts/Conventional.js', 
['xiv.ui.layouts.Conventional'], [
    'xiv.ui.layouts.XyzvLayout'
]);


goog.addDependency('../../../../ui/layouts/Sagittal.js', 
['xiv.ui.layouts.Sagittal'], [
    'xiv.ui.layouts.SingleFrameLayout'
]);


goog.addDependency('../../../../ui/layouts/Coronal.js', 
['xiv.ui.layouts.Coronal'], [
    'xiv.ui.layouts.SingleFrameLayout'
]);


goog.addDependency('../../../../ui/layouts/Transverse.js', 
['xiv.ui.layouts.Transverse'], [
    'xiv.ui.layouts.SingleFrameLayout'
]);


goog.addDependency('../../../../ui/layouts/ThreeD.js', 
['xiv.ui.layouts.ThreeD'], [
    'xiv.ui.layouts.SingleFrameLayout'
]);


goog.addDependency('../../../../ui/layouts/TwoDRow.js', 
['xiv.ui.layouts.TwoDRow'], [
    'xiv.ui.layouts.XyzvLayout'
]);


goog.addDependency('../../../../ui/layouts/TwoDWidescreen.js', 
['xiv.ui.layouts.TwoDWidescreen'], [
    'xiv.ui.layouts.XyzvLayout'
]);


goog.addDependency('../../../../ui/layouts/FourUp.js', 
['xiv.ui.layouts.FourUp'], [
    'xiv.ui.layouts.XyzvLayout'
]);

goog.addDependency('../../../../ui/ViewableGroupMenu.js', 
['xiv.ui.ViewableGroupMenu'], [
    'nrg.ui.ThumbnailGallery'
]);


goog.addDependency('../../../../ui/HelpOverlay.js', 
['xiv.ui.HelpOverlay'], [
    'nrg.ui.Overlay',
    'nrg.ui.ScrollableZippyTree'
]);


goog.addDependency('../../../../ui/ViewBox.js', 
['xiv.ui.ViewBox'], [
    'goog.string',
    'goog.events',
    'goog.dom', 
    'goog.array',
    'goog.object',
    'goog.style',
    'nrg.ui.Component',
    'nrg.style',
    'nrg.ui.SlideInMenu',
    'nrg.ui.ZipTabs',
    'xiv.ui.layouts.LayoutHandler',
    'xiv.vis.XtkEngine',
    'xiv.ui.ProgressBarPanel',
    'nrg.ui.Overlay'
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
    'nrg.ui.Component',
    'nrg.string',
    'nrg.style',
    'nrg.fx',
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
    'nrg.ui.Component',
    'nrg.dom',
    'nrg.string',
    'nrg.style',
    'nrg.convert',
    'nrg.fx',
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
    'nrg.fx',
    'gxnat',
    'gxnat.Path',
    'gxnat.ProjectTree',
]); 



goog.addDependency('../../../../ui/Thumbnail.js', 
['xiv.ui.Thumbnail'], [
    'goog.dom',
    'goog.string',
    'nrg.ui.Thumbnail',
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
    'nrg.string', 
    'nrg.fx', 
    'nrg.ui.ThumbnailGallery',
    'nrg.ui.Thumbnail',
    'xiv.ui.Thumbnail'
]);





