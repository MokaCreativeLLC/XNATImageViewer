/**
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 */

// goog
goog.require('goog.events.EventTarget');

// xiv
goog.require('xiv.ui.Histogram');



/**
 * @constructor
 * @type {!xiv.ui.ViewBox}
 * @type {!xiv.vis.RenderEngine} Renderer
 * @type {!xiv.ui.layout.LayoutHandler} LayoutHandler
 * @type {!xiv.ui.ViewBoxDialogs} Dialogs
 * @extends {goog.events.EventTarget}
 */
goog.provide('xiv.ui.ViewBoxInteractorHandler');
xiv.ui.ViewBoxInteractorHandler = 
function (ViewBox, Renderer, LayoutHandler, Dialogs) {
    goog.base(this);


    /**
     * @type {!xiv.ui.ViewBox}
     * @private
     */
    this.ViewBox_ = ViewBox;


    /**
     * @type {!xiv.vis.RenderEngine}
     * @private
     */
    this.Renderer_ = Renderer;


    /**
     * @type {!xiv.ui.layout.LayoutHandler}
     * @private
     */
    this.LayoutHandler_ = LayoutHandler;


    /**
     * @type {!xiv.ui.ViewBoxDialogs}
     * @private
     */
    this.Dialogs_ = Dialogs;


    //window.console.log('layout handler', this.LayoutHandler_, LayoutHandler);
}
goog.inherits(xiv.ui.ViewBoxInteractorHandler, goog.events.EventTarget);
goog.exportSymbol('xiv.ui.ViewBoxInteractorHandler', 
		  xiv.ui.ViewBoxInteractorHandler);




/**
 * Event types.
 * @enum {string}
 * @public
 */
xiv.ui.ViewBoxInteractorHandler.EventType = {
  //THUMBNAIL_PRELOAD: goog.events.getUniqueId('thumbnail_preload'),
}



/**
 * @enum {string}
 */
xiv.ui.ViewBoxInteractorHandler.TOGGLE_KEYS = {
    CROSSHAIRS: 'Crosshairs_' + goog.string.createUniqueString(),
    THREEDRENDER: 'ThreeDRendering_' + goog.string.createUniqueString(),
    LEVELS: 'BrightnessContrast_' + goog.string.createUniqueString(),
    TWOD: 'TwoD_' + goog.string.createUniqueString(),
    THREED: 'ThreeD_' + goog.string.createUniqueString(),
}



/**
 * @enum {string}
 * @public
 */
xiv.ui.ViewBoxInteractorHandler.CSS = {
    CROSSHAIRS_TOGGLE: 'xiv-ui-viewboxinteractorhandler-crosshair',
    THREEDRENDER_TOGGLE: 'xiv-ui-viewboxinteractorhandler-threed',
    LEVELS_TOGGLE: 
    'xiv-ui-viewboxinteractorhandler-brightnesscontrast',
    TWOD_TOGGLE: 'xiv-ui-viewboxinteractorhandler-twodmenu',
    THREED_TOGGLE: 'xiv-ui-viewboxinteractorhandler-threedmenu',
}


/**
 * @param {!Function} callback
 * @public
 */
xiv.ui.ViewBoxInteractorHandler.prototype.loopInteractorsWithRenderer = 
function(callback){
    //
    // Do nothing if there's no renderer
    //
    if (!goog.isDefAndNotNull(this.Renderer_)) { return };

    //
    // Get the master interactors
    //
    var interactors = this.LayoutHandler_.getMasterInteractors();

    //
    // Loop the render planes
    //
    goog.object.forEach(
	this.Renderer_.getPlanes(), 
	function(renderPlane, renderPlaneOr) {

	    //
	    // Exit out there are no interactors associated with the plane.
	    //
	    if (!goog.isDefAndNotNull(interactors) || 
		!goog.isDefAndNotNull(interactors[renderPlaneOr])) { 
		return 
	    };
	    
	    //
	    // Otherwise run the callback
	    //
	    callback(renderPlane, renderPlaneOr, interactors[renderPlaneOr], 
		     renderPlane.getVolume());
    }.bind(this))
} 










/**
 * @param {boolean=} opt_isOn
 * @public
 */
xiv.ui.ViewBoxInteractorHandler.prototype.createCrosshairToggle = 
function(opt_isOn){
    this.ViewBox_.createToggleButton(
	'LEFT', 
	xiv.ui.ViewBoxInteractorHandler.CSS.CROSSHAIRS_TOGGLE, 
	xiv.ui.ViewBoxInteractorHandler.TOGGLE_KEYS.CROSSHAIRS,
	'Toggle Crosshairs', 
	function(button){
	    this.toggleCrosshairsVisible(
		(button.getAttribute('checked') == 'true'))
	}.bind(this), 
	serverRoot + 
	    '/images/viewer/xiv/ui/ViewBox/Toggle-Crosshairs.png');

    if (opt_isOn === false){
	goog.testing.events.fireClickEvent(
	    this.ViewBox_.getToggleButtons()[
		xiv.ui.ViewBoxInteractorHandler.TOGGLE_KEYS.CROSSHAIRS]);
    }
}




/**
 * @public
 */
xiv.ui.ViewBoxInteractorHandler.prototype.createThreeDRenderToggle = 
function(){    
    this.ViewBox_.createToggleButton(
	'LEFT', 
	xiv.ui.ViewBoxInteractorHandler.CSS.THREEDRENDER_TOGGLE, 
	xiv.ui.ViewBoxInteractorHandler.TOGGLE_KEYS.THREEDRENDER,
	'3D Rendering', 
	function(button){
	    this.Renderer_.setVPlaneOn(
		(button.getAttribute('checked') == 'true'));
	}.bind(this), 
	serverRoot + 
	    '/images/viewer/xiv/ui/ViewBox/Toggle-3D.png');
}




/**
 * @public
 */
xiv.ui.ViewBoxInteractorHandler.prototype.initControllerSync = function() { 
    //
    // Do nothing if no renderer
    //
    if (!goog.isDefAndNotNull(this.Renderer_)) { return };



    this.loopInteractorsWithRenderer(
    function(renderPlane, renderPlaneOr, planeInteractors, volume){
	var slider = planeInteractors.SLIDER;
	var frameDisplay = planeInteractors.FRAME_DISPLAY;
	var crosshairs = planeInteractors.CROSSHAIRS;
	var arrPos = 0;

	//
	// Set custom params
	//
	slider[xiv.ui.ViewBox.ORIENTATION_TAG] = renderPlaneOr;
	frameDisplay[xiv.ui.ViewBox.ORIENTATION_TAG] = renderPlaneOr;

	//
	// Preliminary syunc
	//
	this.syncSlidersToVolume(true);
	this.syncVolumeToSlider(slider, volume);
	this.syncCrosshairsToSlider(slider, volume);
	this.syncFrameDisplayToSlider(slider, volume);
	
	var moveListen;
	//
	// Exit if no volume
	//
	if (!goog.isDefAndNotNull(renderPlane.getRenderer())) { return };

	//
	// SHIFT_DOWN interaction
	//
	goog.events.listen(renderPlane.getRenderer(), 
			   xiv.vis.XtkEngine.EventType.SHIFT_DOWN,
			   this.onRenderPlaneShiftDown.bind(this));

	//
	// ZOOM interaction
	//
	goog.events.listen(renderPlane.getRenderer(), 
			   xiv.vis.XtkEngine.EventType.ZOOM,
			   function(e){
			       this.syncZoomDisplayToRenderer();
			   }.bind(this))


	//
	// Shift events
	//
	goog.events.listen(renderPlane.getRenderer(), 
			   xiv.vis.XtkEngine.EventType.SHIFT_UP,
	function(e){
	    //window.console.log("SHIFT UP");
	    this.showInteractors();
	    this.syncSlidersToVolume();

	    //
	    // Listen to mousemove when shift is held
	    //
	    goog.events.unlistenByKey(moveListen);
	}.bind(this))


	//
	// Change Slice when slider moves
	//
	goog.events.listen(slider, nrg.ui.Slider.EventType.SLIDE, 
        function(e){
	    this.syncVolumeToSlider(e.target, volume);
	    this.syncCrosshairsToSlider(e.target, volume);
	    this.syncFrameDisplayToSlider(e.target, volume);
	}.bind(this))

	//
	// Change Slice on Frame Display input
	//
	goog.events.listen(frameDisplay, 
		xiv.ui.layouts.interactors.FrameDisplay.EventType.INPUT,
		function(e){
		    this.syncSliderToFrameDisplay(e.target,volume);
		}.bind(this))
    }.bind(this))
}



/**
 * @return {xiv.ui.Histogram}
 */
xiv.ui.ViewBoxInteractorHandler.prototype.createHistogram = function(){
    var histogram = new xiv.ui.Histogram();
    var count = 0;
    this.loopInteractorsWithRenderer(
    function(renderPlane, renderPlaneOr, planeInteractors, volume){
	if (count == 0) { histogram.setVolume(volume) }
	count++;
    })
    histogram.render(document.body);
    return histogram;
}



/**
 * @param {nrg.ui.Slider} slider
 * @param {X.volume} volume
 * @public
 */
xiv.ui.ViewBoxInteractorHandler.prototype.syncVolumeToSlider = 
function(slider, volume) {
    if (!goog.isDefAndNotNull(volume)) return;
    volume['index' + slider[xiv.ui.ViewBox.ORIENTATION_TAG]] = 
	slider.getValue() - 1;
    //volume.modified(true);
}




/**
 * @private
 */
xiv.ui.ViewBoxInteractorHandler.prototype.syncCrosshairsToSliderX =  
function(slider, volume) {
    var ind = 'indexX'
    var yFrame = this.LayoutHandler_.getCurrentLayout().
	getLayoutFrameByTitle('Y');
    var zFrame = this.LayoutHandler_.getCurrentLayout().
	getLayoutFrameByTitle('Z');

    // Y Vertical crosshair
    if (goog.isDefAndNotNull(yFrame) &&
	goog.isDefAndNotNull(yFrame
			    [xiv.ui.layouts.Layout.INTERACTORS.CROSSHAIRS])) {
	this.LayoutHandler_.getCurrentLayout().getLayoutFrameByTitle('Y')
	[xiv.ui.layouts.Layout.INTERACTORS.CROSSHAIRS].vertical.style.left =
	    this.Renderer_.getPlaneY().getRenderer().getVerticalSliceX(
		volume[ind], true).toString() + 'px';
    }
    

    // Z Vertical crosshair
   if (goog.isDefAndNotNull(zFrame) &&
	goog.isDefAndNotNull(zFrame
			    [xiv.ui.layouts.Layout.INTERACTORS.CROSSHAIRS])) {
	this.LayoutHandler_.getCurrentLayout().getLayoutFrameByTitle('Z')
	[xiv.ui.layouts.Layout.INTERACTORS.CROSSHAIRS].vertical.style.left =
	    this.Renderer_.getPlaneZ().getRenderer().getVerticalSliceX(
		volume[ind], false).toString() + 'px';
    }
    
}



/**
 * @param {nrg.ui.Slider} slider
 * @param {X.volume} volume
 * @public
 */
xiv.ui.ViewBoxInteractorHandler.prototype.syncCrosshairsToSliderY =  
function(slider, volume) {
    var ind = 'indexY';
    var xFrame = this.LayoutHandler_.getCurrentLayout().
	getLayoutFrameByTitle('X');
    var zFrame = this.LayoutHandler_.getCurrentLayout().
	getLayoutFrameByTitle('Z');


    // X Vertical crosshair
    if (goog.isDefAndNotNull(xFrame) &&
	goog.isDefAndNotNull(xFrame
			    [xiv.ui.layouts.Layout.INTERACTORS.CROSSHAIRS])) {
	this.LayoutHandler_.getCurrentLayout().
	    getLayoutFrameByTitle('X')
	[xiv.ui.layouts.Layout.INTERACTORS.CROSSHAIRS].
	    vertical.style.left =
	    this.Renderer_.getPlaneX().getRenderer().
	    getVerticalSliceX(
		volume[ind], false).toString() + 'px';
    }

    // Z Horizontal crosshair
   if (goog.isDefAndNotNull(zFrame) &&
	goog.isDefAndNotNull(zFrame
			    [xiv.ui.layouts.Layout.INTERACTORS.CROSSHAIRS])) {
	this.LayoutHandler_.getCurrentLayout().
	   getLayoutFrameByTitle('Z')
	[xiv.ui.layouts.Layout.INTERACTORS.CROSSHAIRS].
	    horizontal.style.top =
	    this.Renderer_.getPlaneZ().getRenderer().
	   getHorizontalSliceY(
		volume[ind], false).toString() + 'px';
    }
}



/**
 * @param {nrg.ui.Slider} slider
 * @param {X.volume} volume
 * @public
 */
xiv.ui.ViewBoxInteractorHandler.prototype.syncCrosshairsToSliderZ =  
function(slider, volume) {


    var ind = 'indexZ';
    var xFrame = this.LayoutHandler_.getCurrentLayout().
	getLayoutFrameByTitle('X');
    var yFrame = this.LayoutHandler_.getCurrentLayout().
	getLayoutFrameByTitle('Y');
    //window.console.log("SLIDER Z");


    // X Horizontal crosshair
    if (goog.isDefAndNotNull(xFrame) &&
	goog.isDefAndNotNull(xFrame
			    [xiv.ui.layouts.Layout.INTERACTORS.CROSSHAIRS])) {
	this.LayoutHandler_.getCurrentLayout().
	    getLayoutFrameByTitle('X')
	[xiv.ui.layouts.Layout.INTERACTORS.CROSSHAIRS].horizontal.style.top =
	    this.Renderer_.getPlaneX().getRenderer().
	    getHorizontalSliceY(
		volume[ind], false).toString() + 'px';
	//window.console.log("SLIDER Z x");
    }

    // Y HORIZONTAL crosshair
    if (goog.isDefAndNotNull(yFrame) &&
	goog.isDefAndNotNull(yFrame
			    [xiv.ui.layouts.Layout.INTERACTORS.CROSSHAIRS])) {
	this.LayoutHandler_.getCurrentLayout().
	    getLayoutFrameByTitle('Y')
	[xiv.ui.layouts.Layout.INTERACTORS.CROSSHAIRS].horizontal.style.top =
	    this.Renderer_.getPlaneY().getRenderer().
	    getHorizontalSliceY(
		volume[ind], false).toString() + 'px';
	//window.console.log("SLIDER Z y");
    }

}



/**
 * @param {nrg.ui.Slider} slider
 * @param {X.volume} volume
 * @public
 */
xiv.ui.ViewBoxInteractorHandler.prototype.syncCrosshairsToSlider = 
function(slider, volume) {
    if (!goog.isDefAndNotNull(volume)){
	return;
    }
    switch (slider[xiv.ui.ViewBox.ORIENTATION_TAG]){
    case 'X': 
	this.syncCrosshairsToSliderX(slider, volume);
	break;
    case 'Y': 
	this.syncCrosshairsToSliderY(slider, volume);
	break;
    case 'Z': 
	this.syncCrosshairsToSliderZ(slider, volume);
	break;
    }
}



/**
 * @param {!nrg.ui.Slider} slider
 * @param {X.volume} volume
 * @public
 */
xiv.ui.ViewBoxInteractorHandler.prototype.syncFrameDisplayToSlider = 
function(slider, volume) {
    //window.console.log('syncFrameDisplay');
    var layoutFrame = this.LayoutHandler_.getCurrentLayout().
	getLayoutFrameByTitle(slider[xiv.ui.ViewBox.ORIENTATION_TAG]);

    if (!goog.isDefAndNotNull(volume) ||
	!goog.isDefAndNotNull(layoutFrame)) { 
	return;
    }

    var frameDisplay = layoutFrame
    [xiv.ui.layouts.Layout.INTERACTORS.FRAME_DISPLAY]

    if (goog.isDefAndNotNull(frameDisplay)){
	//window.console.log("SLIDER", slider.getMaximum(), volume);
	frameDisplay.setTotalFrames(slider.getMaximum());
	frameDisplay.setCurrentFrame(slider.getValue());   
    }
}


/**
 * @public
 */
xiv.ui.ViewBoxInteractorHandler.prototype.syncZoomDisplayToRenderer = 
function() {
    this.loopInteractorsWithRenderer(
    function(renderPlane, renderPlaneOr, planeInteractors){
	if (!planeInteractors.ZOOM_DISPLAY || !renderPlane.getRenderer()) { 
	    return 
	};
	planeInteractors.ZOOM_DISPLAY.setValue(
	    renderPlane.getRenderer().getZoom());
	
    })
}



/**
 * @param {!nrg.ui.Slider} slider
 * @param {X.volume} volume
 * @public
 */
xiv.ui.ViewBoxInteractorHandler.prototype.syncSliderToFrameDisplay = 
function(frameDisplay, volume) {
    if (!goog.isDefAndNotNull(volume)) return;
    var layoutFrame = this.LayoutHandler_.getCurrentLayout().
	getLayoutFrameByTitle(frameDisplay[xiv.ui.ViewBox.ORIENTATION_TAG])
    if (!goog.isDefAndNotNull(layoutFrame)){
	return;
    }
    var slider = layoutFrame[xiv.ui.layouts.Layout.INTERACTORS.SLIDER]
    slider.setValue(frameDisplay.getCurrentFrame());   
}



/**
 * @public
 */
xiv.ui.ViewBoxInteractorHandler.prototype.setSlidersHalfway = function() {
    this.loopInteractorsWithRenderer(
    function(renderPlane, renderPlaneOr, planeInteractors, volume){
	if (!goog.isDefAndNotNull(planeInteractors.SLIDER)) { 
	    return; 
	}
	planeInteractors.SLIDER.setValue(
		planeInteractors.SLIDER.getMaximum()/2);
    }.bind(this))
}




/**
 * @param {!boolean} opt_resetMaximum
 * @public
 */
xiv.ui.ViewBoxInteractorHandler.prototype.syncSlidersToVolume = 
function(opt_resetMaximum) {

    var orientation;
    var currVol;
    var slider;

    this.loopInteractorsWithRenderer(
    function(renderPlane, renderPlaneOr, planeInteractors, volume){
	if (!goog.isDefAndNotNull(planeInteractors.SLIDER)) { 
	    return; 
	};

	slider = planeInteractors.SLIDER;
	orientation = slider[xiv.ui.ViewBox.ORIENTATION_TAG];

	//
	// Exit if no volume
	//
	if (!goog.isDefAndNotNull(volume)) { return };

	//window.console.log('VOLUME', volume.dimensions, volume.dimensionsRAS);
	//window.console.log(renderPlane.getRenderer()._slices.length); + 

	if (opt_resetMaximum === true) {
	    //window.console.log(renderPlane.getRenderer().getNumberSlices());
	    //window.console.log(renderPlane.getRenderer().getVolume());
	    //window.console.log(renderPlane.getRenderer());
	    slider.setMaximum(renderPlane.getRenderer().getNumberSlices());
	    slider.setMinimum(1);
	}
	slider.setValue(volume['index' + orientation] + 1);
    })
}




/**
 * @param {!Event}
 * @public
 */
xiv.ui.ViewBoxInteractorHandler.prototype.onRenderPlaneShiftDown = function(e){

    //window.console.log("SHIFT DOWN");
    this.hideInteractors();
    this.syncSlidersToVolume();
    
    //
    // Listen to mousemove when shift is held
    //
    moveListen = goog.events.listen(document.body, 
				    goog.events.EventType.MOUSEMOVE,
				    this.syncSlidersToVolume.bind(this));

}



/**
 * @public
 */
xiv.ui.ViewBoxInteractorHandler.prototype.onLayoutResize = function(){
    this.loopInteractorsWithRenderer(
    function(renderPlane, renderPlaneOr, planeInteractors, volume){
	if (!goog.isDefAndNotNull(planeInteractors.SLIDER)) { 
	    return 
	};

	slider = planeInteractors.SLIDER;

	this.syncVolumeToSlider(slider, volume);
	this.syncCrosshairsToSlider(slider, volume);
	this.syncZoomDisplayToRenderer();

    }.bind(this));
}



/**
 * @param {boolean=} opt_visible
 * @public
 */
xiv.ui.ViewBoxInteractorHandler.prototype.toggleInteractorsVisible = 
function(opt_visible) {
    var opacity = (opt_visible === false) ? 0 : 1;
    this.loopInteractorsWithRenderer(
    function(renderPlane, renderPlaneOr, planeInteractors){

	nrg.fx.fadeTo(planeInteractors.SLIDER.getElement(), 
		      200, opacity);
	nrg.fx.fadeTo(planeInteractors.FRAME_DISPLAY.getElement(), 
		      200, opacity);
	nrg.fx.fadeTo(planeInteractors.CROSSHAIRS.vertical, 
		      200, opacity);
	nrg.fx.fadeTo(planeInteractors.CROSSHAIRS.horizontal, 
		      200, opacity);
	nrg.fx.fadeTo(planeInteractors.ZOOM_DISPLAY.getElement(), 200, opacity);

    }.bind(this)) 
}



/**
 * @public
 */
xiv.ui.ViewBoxInteractorHandler.prototype.hideInteractors = function() {
    this.toggleInteractorsVisible(false);
    this.Dialogs_.toggleVisible(xiv.ui.ViewBoxDialogs.INFO, false); 
}


/**
 * @public
 */
 xiv.ui.ViewBoxInteractorHandler.prototype.showInteractors = function() {
    this.toggleInteractorsVisible(true); 
    this.Dialogs_.toggleVisible(xiv.ui.ViewBoxDialogs.INFO, true); 
}



/**
 * @public
 */
xiv.ui.ViewBoxInteractorHandler.prototype.update = function() {
     this.LayoutHandler_.updateInteractors();
}



/**
 * @param {!boolean} visible
 * @public
 */
xiv.ui.ViewBoxInteractorHandler.prototype.toggleCrosshairsVisible = 
function(visible) {
    var visibility = (visible == true) ? 'visible': 'hidden';
    this.loopInteractorsWithRenderer(
    function(renderPlane, renderPlaneOr, planeInteractors, volume){
	if (goog.isDefAndNotNull(planeInteractors.CROSSHAIRS)){
	    planeInteractors.CROSSHAIRS.vertical.style.visibility = 
		visibility;
	    planeInteractors.CROSSHAIRS.horizontal.style.visibility = 
		visibility;
	}
    }.bind(this))
}




/**
 * @public
 */
xiv.ui.ViewBoxInteractorHandler.prototype.updateInteractorStyles = function() {

    if (!goog.isDefAndNotNull(this.LayoutHandler_)) { return };
    if (!goog.isDefAndNotNull(this.Renderer_)) { return };


    this.loopInteractorsWithRenderer(
    function(renderPlane, renderPlaneOr, planeInteractors, volume){
	if (!goog.isDefAndNotNull(planeInteractors)) { 
	    return 
	};

	//
	// NOTE: Keep these here.  We need to declare them within the 
	// loop.
	//
	var slider = planeInteractors.SLIDER;
	var frameDisplay = planeInteractors.FRAME_DISPLAY;

	//
	// Set custom params
	//
	slider[xiv.ui.ViewBox.ORIENTATION_TAG] = renderPlaneOr;
	frameDisplay[xiv.ui.ViewBox.ORIENTATION_TAG] = renderPlaneOr;

	//
	// Exit if no volume
	//
	if (!goog.isDefAndNotNull(renderPlane.getRenderer())) { return };

	//
	// The slider's thumb shifts during size changes, so we sync it up.
	//
	this.syncSliderToFrameDisplay(frameDisplay, volume);
	slider.updateStyle();
    }.bind(this))
}



/**
 * @param {nrg.ui.SlideInMenu} LayoutMenu
 * @public
 */
xiv.ui.ViewBoxInteractorHandler.prototype.syncLayoutMenuToLayoutHandler = 
function(LayoutMenu) {

    LayoutMenu.setMenuIconSrc(
	serverRoot + '/images/viewer/xiv/ui/LayoutMenu/menu.png');

    // Add icons and title to LayoutMenu
    // Add object and title to LayoutHandler
    goog.object.forEach({
	'Sagittal': {
	    OBJ: xiv.ui.layouts.Sagittal,
	    ICON: serverRoot + '/images/viewer/xiv/ui/Layouts/sagittal.png'
	},
	'Coronal': {
	    OBJ: xiv.ui.layouts.Coronal,
	    ICON: serverRoot + '/images/viewer/xiv/ui/Layouts/coronal.png'
	},
	'Transverse': {
	    OBJ: xiv.ui.layouts.Transverse,
	    ICON: serverRoot + '/images/viewer/xiv/ui/Layouts/transverse.png'
	},
	'3D': {
	    OBJ: xiv.ui.layouts.ThreeD,
	    ICON: serverRoot + '/images/viewer/xiv/ui/Layouts/3d.png'
	},
	'Conventional': {
	    OBJ: xiv.ui.layouts.Conventional,
	    ICON: serverRoot + '/images/viewer/xiv/ui/Layouts/conventional.png'
	},
	'Four-Up': {
	    OBJ: xiv.ui.layouts.FourUp,
	    ICON: serverRoot + '/images/viewer/xiv/ui/Layouts/four-up.png'
	},
	'2D Row': {
	    OBJ: xiv.ui.layouts.TwoDRow,
	    ICON: serverRoot + '/images/viewer/xiv/ui/Layouts/2drow.png'
	},
	'2D Widescreen': {
	    OBJ: xiv.ui.layouts.TwoDWidescreen,
	    ICON: serverRoot + '/images/viewer/xiv/ui/Layouts/2dwidescreen.png'
	},
    }, function(val, key){
	LayoutMenu.addMenuItem(key, val.ICON);
	this.LayoutHandler_.addLayout(key, val.OBJ);

	//
	// Set the master layout
	//
	if (key == 'Four-Up') {
	    this.LayoutHandler_.setMasterLayout(key);
	}

    }.bind(this))

    // Set the layout when a menu item is clicked.

    //window.console.log(nrg.ui.SlideInMenu.EventType.ITEM_SELECTED);
    goog.events.listen(LayoutMenu, nrg.ui.SlideInMenu.EventType.ITEM_SELECTED, 
		       this.onMenuItemSelected_.bind(this));
}




/**
* As stated.
* @private
*/
xiv.ui.ViewBoxInteractorHandler.prototype.onMenuItemSelected_ = function(e) {
    //window.console.log("ITEM SELECTED!", e.title, e.index);
    this.LayoutHandler_.setLayout(e.title);

    //
    // Change the button in the help dialog
    //
    this.Dialogs_.getHelpDialog().setLayoutButton(e.target.getMenuIcon().src);
}



/**
 * @type {?Array.<xiv.ui.ctrl.XtkController>}
 * @private
 */
xiv.ui.ViewBoxInteractorHandler.prototype.renderControllers_ = null;



/**
 * @public
 */
xiv.ui.ViewBoxInteractorHandler.prototype.updateRenderControllers = function(){
    if (!goog.isDefAndNotNull(this.renderControllers_)) { return };
    goog.array.forEach(this.renderControllers_, function(controller){
	controller.update();
    })
}



/**
 * @public
 */
xiv.ui.ViewBoxInteractorHandler.prototype.createRenderControllers = 
function() {
    //
    // Track the controllers
    //
    this.renderControllers_ = [];

    //
    // Create the dialogs
    //
    this.Dialogs_.createLevelsDialog();
    this.Dialogs_.createRenderControlDialog();
	
    //-------------------------
    // NOTE: We now need to separate level controllers (brightness,
    // contrast, etc.) from the other controllers
    //-------------------------

    
    //
    // Create a new ZippyTree for render controllers
    //
    var renderControllerTree = new nrg.ui.ScrollableZippyTree();
    renderControllerTree.render();

    //
    // Create a new ZippyTree for level controllers
    //
    var levelControllerTree = new nrg.ui.ScrollableZippyTree();
    levelControllerTree.render();

    //
    // Identify the controllers we need to separate from the rest.
    //
    var levelControllerLabels = [
	xiv.ui.ctrl.MasterController3D.CONTROLLERS.LEVEL_MIN, 
	xiv.ui.ctrl.MasterController3D.CONTROLLERS.LEVEL_MAX, 
	xiv.ui.ctrl.MasterController3D.CONTROLLERS.CONTRAST, 
	xiv.ui.ctrl.MasterController3D.CONTROLLERS.BRIGHTNESS
    ]
    var updatableLevelControllerLabels = [
	xiv.ui.ctrl.MasterController3D.CONTROLLERS.LEVEL_MIN, 
	xiv.ui.ctrl.MasterController3D.CONTROLLERS.LEVEL_MAX 
    ]
    var updatableLevelControllers = [];

    //
    // Add the 2D controllers (no need to separate any of these).
    //
    var controllers2D = this.Renderer_.getControllers2D();
    if (goog.isDefAndNotNull(controllers2D) && (controllers2D.length > 0)) {
	goog.array.forEach(controllers2D, function(ctrl){
	    //
	    // store controller
	    //
	    this.renderControllers_.push(ctrl);

	    //
	    // Add the '2D' descriptor to any sub-folders.
	    //
	    var folders = ctrl.getFolders();
	    folders.push('2D');

	    //
	    // Add other controllers to render Controller zippy
	    //
	    renderControllerTree.addContents(ctrl.getElement(), folders);
	}.bind(this));
    }

    //
    // Add the 3D controllers, separating the level controlers from the others.
    //
    var controllers3D = this.Renderer_.getControllers3D();
    if (goog.isDefAndNotNull(controllers3D) && (controllers3D.length > 0)) {
	goog.array.forEach(controllers3D, function(ctrl){
	    //
	    // store controller
	    //
	    this.renderControllers_.push(ctrl);

	    //
	    // Separate the level controllers, add to that zippy
	    //
	    if (goog.array.contains(levelControllerLabels,
		ctrl.getLabel().innerHTML)){
		levelControllerTree.addContents(ctrl.getElement());

		if (goog.array.contains(updatableLevelControllerLabels,
					ctrl.getLabel().innerHTML)){
		    updatableLevelControllers.push(ctrl);
		}
		return;
	    } 

	    //
	    // Otherwise add the '3D' descriptor to any sub-folders.
	    //
	    var folders = ctrl.getFolders();
	    if (folders.length > 1){
		folders.push('3D');
	    }

	    //
	    // Add other controllers to render Controller zippy
	    //
	    renderControllerTree.addContents(ctrl.getElement(), folders);
	}.bind(this));
    }

    //
    // Set the tree style and add to dialog
    //
    renderControllerTreeElt = renderControllerTree.getElement();
    renderControllerTreeElt.style.top = '30px';
    renderControllerTreeElt.style.width = 'calc(100% - 20px)';
    renderControllerTreeElt.style.height = 'calc(100% - 50px)';
    this.Dialogs_.getDialogs()
    [xiv.ui.ViewBoxDialogs.DIALOG_KEYS.RENDERCONTROLMENU].
	getElement().appendChild(renderControllerTreeElt);
    renderControllerTree.expandAll();

    //
    // Set the tree style and add to dialog
    //
    levelControllerTreeElt = levelControllerTree.getElement();
    levelControllerTreeElt.style.top = '255px';
    levelControllerTreeElt.style.width = 'calc(100% - 20px)';
    levelControllerTreeElt.style.height = 'calc(100% - 50px)';
    this.Dialogs_.getDialogs()[xiv.ui.ViewBoxDialogs.DIALOG_KEYS.LEVELS].
	getElement().appendChild(levelControllerTreeElt);



    //
    // We have to re-sync the level controllers to the volume properties, 
    // since the volume is now rendered....
    //
    goog.array.forEach(updatableLevelControllers, function(levelController){
	levelController.getComponent().setMaximum(
	    levelController.getXObj().windowHigh);
	levelController.getComponent().setMinimum(
	    levelController.getXObj().windowLow);
	levelController.update();
    })



    //
    // Create histogram
    //
    var hist = this.createHistogram();
   
    //
    // Update the histogram when the sliders move
    //
    goog.array.forEach(updatableLevelControllers, function(levelController){
	goog.events.listen(levelController.getComponent(), 
			   nrg.ui.Slider.EventType.SLIDE, function(e){
			       hist.drawLine();
			       hist.updateMaxMin();
			   })
    })

    //
    // add the histogram to the LEVELS dialog
    //
    this.Dialogs_.getDialogs()[xiv.ui.ViewBoxDialogs.DIALOG_KEYS.LEVELS].
	getElement().appendChild(hist.getElement());
}





/**
 * @inheritDoc
 */
xiv.ui.ViewBoxInteractorHandler.prototype.dispose = function () {
    goog.base(this, 'dispose');

    if (goog.isDefAndNotNull(this.renderControllers_)){
	goog.array.clear(this.renderControllers_);
    }
    delete this.ViewBox_;
    delete this.Renderer_;
    delete this.LayoutHandler_;
    delete this.Dialogs_;
}
