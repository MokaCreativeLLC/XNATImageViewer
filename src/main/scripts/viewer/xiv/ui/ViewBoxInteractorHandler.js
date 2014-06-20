/**
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 */

// goog
goog.require('goog.events.EventTarget');
goog.require('goog.math.Vec2');

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
    //
    // Update controllers when we open a dialog
    //
    goog.events.listen(this.Dialogs_, 
	xiv.ui.ViewBoxDialogs.EventType.DIALOG_OPENED, function(e){
	    this.volumeCtrlTree_.mapSliderToContents();
	    this.levelCtrlTree_.mapSliderToContents();
	    this.updateVolumeCtrls_();
	    this.updateLevelCtrls_();
	    this.updateHistogram_();
	}.bind(this))


    //
    // Listen for key events
    //
    this.listenForKeyboardEvents_();


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
 * Event types.
 * @enum {string}
 * @public
 */
xiv.ui.ViewBoxInteractorHandler.EventType = {
    RIGHT_ARROW: goog.events.getUniqueId('right_arrow'),
    LEFT_ARROW: goog.events.getUniqueId('left_arrow'),
    UP_ARROW: goog.events.getUniqueId('up_arrow'),
    DOWN_ARROW: goog.events.getUniqueId('up_arrow'),
}





/**
 * @enum {string}
 */
xiv.ui.ViewBoxInteractorHandler.TOGGLE_KEYS = {
    CROSSHAIRS: 'Crosshairs_' + goog.string.createUniqueString(),
    SETTINGS: 'Settings_' + goog.string.createUniqueString(),
    LEVELS: 'BrightnessContrast_' + goog.string.createUniqueString(),
    TWODPAN: 'TwoDPan_' + goog.string.createUniqueString(),
    TWODZOOM: 'TwoDZoom_' + goog.string.createUniqueString(),
}



/**
 * @enum {string}
 * @public
 */
xiv.ui.ViewBoxInteractorHandler.CSS = {
    GENERIC_TOGGLE: 'xiv-ui-viewboxinteractorhandler-generic-toggle',
    VOLUMECONTROLLER_ZIPPYTREE: 
    'xiv-ui-viewboxinteractorhandler-volumecontroller-zippytree',
    MESHCONTROLLER_ZIPPYTREE: 
    'xiv-ui-viewboxinteractorhandler-meshcontroller-zippytree',
    LEVELCONTROLLER_ZIPPYTREE: 
    'xiv-ui-viewboxinteractorhandler-levelcontroller-zippytree'
}



/**
 * @enum {string}
 * @public
 */
xiv.ui.ViewBoxInteractorHandler.CURSOR_CSS = {
    GRAB: 'xiv-ui-viewboxinteractorhandler-viewframe-grab',
    GRAB_CUSTOM: 'xiv-ui-viewboxinteractorhandler-viewframe-grab-custom',
    GRABBING: 'xiv-ui-viewboxinteractorhandler-viewframe-grabbing',
    GRABBING_CUSTOM: 
    'xiv-ui-viewboxinteractorhandler-viewframe-grabbing-custom',
    ZOOM_IN: 'xiv-ui-viewboxinteractorhandler-viewframe-zoom-in',
    ZOOM_OUT: 'xiv-ui-viewboxinteractorhandler-viewframe-zoom-out'
}



/**
 * @const
 */
xiv.ui.ViewBoxInteractorHandler.ORIENTATION_KEY = 
    'Orientation_' + goog.string.createUniqueString();




/**
 * @public
 * @type {?nrg.ui.ScrollableZippyTree}
 */
xiv.ui.ViewBoxInteractorHandler.prototype.volumeCtrlTree_ = null;



/**
 * @public
 * @type {?nrg.ui.ScrollableZippyTree}
 */
xiv.ui.ViewBoxInteractorHandler.prototype.meshCtrlTree_ = null;



/**
 * @private
 * @type {?nrg.ui.ScrollableZippyTree}
 */
xiv.ui.ViewBoxInteractorHandler.prototype.levelCtrlTree_ = null;



/**
 * @type {?Array.<xiv.ui.ctrl.XtkController>}
 * @private
 */
xiv.ui.ViewBoxInteractorHandler.prototype.volumeCtrls_ = null;


/**
 * @type {?Array.<xiv.ui.ctrl.XtkController>}
 * @private
 */
xiv.ui.ViewBoxInteractorHandler.prototype.meshCtrls_ = null;



/**
 * @private
 * @type {?Array.<xiv.ui.ctrl.xiv.ui.ctrl.XtlController}
 */
xiv.ui.ViewBoxInteractorHandler.prototype.levelCtrls_ = null




/**
 * The previous mouse position.
 *
 * @type {?Object.<string, goog.events.KeyHandler>}
 * @private
 */
xiv.ui.ViewBoxInteractorHandler.prototype.keyHandler_ = null;



/**
 * The previous mouse position.
 *
 * @type {?Array.<number>}
 * @private
 */
xiv.ui.ViewBoxInteractorHandler.prototype.prevMousePos_ = null;



/**
 * The current mouse position.
 *
 * @type {?Array.<number>}
 * @private
 */
xiv.ui.ViewBoxInteractorHandler.prototype.currMousePos_ = null;



/**
 * @private
 * @type {boolean}
 */
xiv.ui.ViewBoxInteractorHandler.prototype.shiftDown_ = false;



/**
 * @private
 * @type {boolean}
 */
xiv.ui.ViewBoxInteractorHandler.prototype.ctrlDown_ = false;



/**
 * @private
 * @type {?goog.events.Key}
 */
xiv.ui.ViewBoxInteractorHandler.prototype.keyDownKey_ = null;



/**
 * @private
 * @type {?goog.events.Key}
 */
xiv.ui.ViewBoxInteractorHandler.prototype.keyUpKey_ = null;



/**
 * @private
 * @type {?Object.<string, goog.events.Key>}
 */
xiv.ui.ViewBoxInteractorHandler.prototype.mouseDownKeys_ = null;



/**
 * @private
 * @type {?Object.<string, goog.events.Key>}
 */
xiv.ui.ViewBoxInteractorHandler.prototype.mouseUpKeys_ = null;



/**
 * @private
 * @type {?Object.<string, goog.events.Key>}
 */
xiv.ui.ViewBoxInteractorHandler.prototype.mouseOutKeys_ = null;



/**
 * @private
 * @type {?Object.<string, goog.events.Key>}
 */
xiv.ui.ViewBoxInteractorHandler.prototype.mouseOverKeys_ = null;



/**
 * @private
 * @type {!boolean}
 */
xiv.ui.ViewBoxInteractorHandler.prototype.leftMouseDown_ = false;



/**
 * @private
 * @type {!boolean}
 */
xiv.ui.ViewBoxInteractorHandler.prototype.middleMouseDown_ = false;



/**
 * @private
 * @type {!boolean}
 */
xiv.ui.ViewBoxInteractorHandler.prototype.rightMouseDown_ = false;



/**
 * @private
 * @type {!boolean}
 */
xiv.ui.ViewBoxInteractorHandler.prototype.zooming_ = false;



/**
 * @private
 * @type {!boolean}
 */
xiv.ui.ViewBoxInteractorHandler.prototype.panning_ = false;



/**
 * @private
 * @type {?xiv.ui.Histogram}
 */
xiv.ui.ViewBoxInteractorHandler.prototype.Histogram_ = null;


/**
 * @public
 */
xiv.ui.ViewBoxInteractorHandler.prototype.createInteractors = function() {
    //
    // Create the render controllers
    //
    this.createVolumeCtrls();

    //
    // Set volume sliders halfway
    //
    this.setVolumeSlidersHalfway_();

    //
    // Create 3D rendering toggle
    //
    this.createSettingsToggle();

    //
    // Create the crosshair toggle rendering toggle
    //
    this.createCrosshairToggle(false);

    //
    // Create the crosshair toggle rendering toggle
    //
    this.createTwoDPanToggle();


    //
    // Create the crosshair toggle rendering toggle
    //
    this.createTwoDZoomToggle();




    //
    // Listen for mouseover
    //
    this.listenForMouseEvents_();
} 




/**
 * @private
 */
xiv.ui.ViewBoxInteractorHandler.prototype.listenForKeyboardEvents_ = 
function() {

    var listenElt = document.body;
    //var listenElt = this.ViewBox_.getElement().parentNode;

    //
    // Apply a general keyhandler (for keys where up/down events are not
    // needed).
    //
    this.keyHandler_ = new goog.events.KeyHandler();
    this.keyHandler_.attach(listenElt);
    goog.events.listen(this.keyHandler_, 
		       goog.events.KeyHandler.EventType.KEY, 
		       this.onKey_.bind(this));


    //
    // Apply the event to listenElt -- really the only safe way to 
    // get the listener to function properly
    //
    /*
    this.keyDownKey_ = goog.events.listen(listenElt, 
					  goog.events.EventType.KEYDOWN, 
					  this.onKeyDown_.bind(this));

    this.keyUpKey_ = goog.events.listen(listenElt, 
					goog.events.EventType.KEYUP, 
					this.onKeyUp_.bind(this));
    */
}




/**
 * @private
 * @param {goog.events.Event} e
 */
xiv.ui.ViewBoxInteractorHandler.prototype.clearCursorStyle_ = function(e) {
    var viewFrame = this.ViewBox_.getViewFrame();
    goog.object.forEach(this.constructor.CURSOR_CSS, function(css, key){
	goog.dom.classes.remove(viewFrame, css);
    })
}


/**
 * @private
 * @param {goog.events.Event} e
 */
xiv.ui.ViewBoxInteractorHandler.prototype.setCursorGrab_ = function(e) {
    goog.dom.classes.add(this.ViewBox_.getViewFrame(), 
			 this.constructor.CURSOR_CSS.GRAB);
    if( navigator.userAgent.match(/MSIE/i) || 
	navigator.userAgent.match(/Chrome/i) ) {  
	goog.dom.classes.add(this.ViewBox_.getViewFrame(), 
			     this.constructor.CURSOR_CSS.GRAB_CUSTOM);
    }


    goog.dom.classes.remove(this.ViewBox_.getViewFrame(), 
			 this.constructor.CURSOR_CSS.GRABBING);
    if( navigator.userAgent.match(/MSIE/i) || 
	navigator.userAgent.match(/Chrome/i) ) {  
	goog.dom.classes.remove(this.ViewBox_.getViewFrame(), 
			     this.constructor.CURSOR_CSS.GRABBING_CUSTOM);
    }
}



/**
 * @private
 * @param {goog.events.Event} e
 */
xiv.ui.ViewBoxInteractorHandler.prototype.setCursorGrabbing_ = function(e) {

    goog.dom.classes.remove(this.ViewBox_.getViewFrame(), 
			 this.constructor.CURSOR_CSS.GRAB);
    if( navigator.userAgent.match(/MSIE/i) || 
	navigator.userAgent.match(/Chrome/i) ) {  
	goog.dom.classes.remove(this.ViewBox_.getViewFrame(), 
			     this.constructor.CURSOR_CSS.GRAB_CUSTOM);
    }


    goog.dom.classes.add(this.ViewBox_.getViewFrame(), 
			 this.constructor.CURSOR_CSS.GRABBING);
    if( navigator.userAgent.match(/MSIE/i) || 
	navigator.userAgent.match(/Chrome/i) ) {  
	goog.dom.classes.add(this.ViewBox_.getViewFrame(), 
			     this.constructor.CURSOR_CSS.GRABBING_CUSTOM);
    }
}




/**
 * @private
 * @param {goog.events.Event} e
 */
xiv.ui.ViewBoxInteractorHandler.prototype.setCursorZoomIn_ = function(e) {
    goog.dom.classes.remove(this.ViewBox_.getViewFrame(), 
			 this.constructor.CURSOR_CSS.ZOOM_OUT);
    goog.dom.classes.add(this.ViewBox_.getViewFrame(), 
			 this.constructor.CURSOR_CSS.ZOOM_IN);
}



/**
 * @private
 * @param {goog.events.Event} e
 */
xiv.ui.ViewBoxInteractorHandler.prototype.setCursorZoomOut_ = function(e) {
    goog.dom.classes.remove(this.ViewBox_.getViewFrame(), 
			 this.constructor.CURSOR_CSS.ZOOM_IN);
    goog.dom.classes.add(this.ViewBox_.getViewFrame(), 
			 this.constructor.CURSOR_CSS.ZOOM_OUT);
}



/**
 * @private
 * @param {goog.events.Event} e
 */
xiv.ui.ViewBoxInteractorHandler.prototype.onMouseOver_ = function(e) {

    //
    // Store the plane being hovered over
    //
    this.currMouseRenderer_ = e.target;

    //
    // Store the mouse positions
    //
    this.prevMousePos_ = this.currMousePos_;
    this.currMousePos_ = e.mousePosition;

    //
    // Do nothing if no previous mouse position
    //
    if (this.prevMousePos_ == null) {return}

    //
    // Shift down means slice navigation --> hide interactors
    //
    if (e.shiftDown){
	if (!this.shiftDown_){
	    this.shiftDown_ = true;
	    this.onRenderPlaneShiftDown_();
	    return;
	}
    } 
    else {
	if (this.shiftDown_){
	    this.showInteractors();
	    this.syncSlidersToVolume_();
	    this.syncAllCrosshairs();
	    this.shiftDown_ = false;
	}
    }

    //
    // run calculations
    //
    var mouseVec = 
	(new goog.math.Vec2(this.currMousePos_[0], 
			    this.currMousePos_[1])).add(
				new goog.math.Vec2(this.prevMousePos_[0], 
						   this.prevMousePos_[1]));
    var mouseDist = Math.sqrt(
	Math.pow(this.currMousePos_[0] - this.prevMousePos_[0], 2) + 
	    Math.pow(this.currMousePos_[1] - this.prevMousePos_[1], 2)); 

    var xDist = this.currMousePos_[0] - this.prevMousePos_[0];
    var yDist = this.currMousePos_[1] - this.prevMousePos_[1];

    //window.console.log("MOUSEMOVE", this.ctrlDown_, this.rightMouseDown_);


    //
    // ZOOM
    //
    if (this.zooming_){
	this.setCursorZoomIn_();	
	if (this.leftMouseDown_){
	    this.onRenderPlaneZoom_(xDist, yDist);
	}
    }

    //
    // PAN
    //
    if (this.panning_) {
	this.setCursorGrab_();
	if (this.leftMouseDown_) {	
	    this.onRenderPlanePan_(xDist, yDist);
	}
    }
} 



/**
 * @private
 * @param {!number} xDist
 * @param {!number} yDist
 */
xiv.ui.ViewBoxInteractorHandler.prototype.onRenderPlaneLevelAdjust_ = 
function(xDist, yDist){

    var incrementLevel = function(title, amount){
	goog.array.forEach(
	    this.levelCtrls_, 
	    function(levelCtrl){
		if (levelCtrl.getLabel().innerHTML == title){
		    levelCtrl.getComponent().setValue(
			levelCtrl.getComponent().getValue() + amount);
		}
	    })
    }.bind(this)

	
    var largest = Math.max(Math.abs(xDist), Math.abs(yDist));
    var xInc = Math.round(Math.abs(xDist) / 5);
    var yInc = Math.round(Math.abs(yDist) / 5);
    

    if (xDist > 1){
	incrementLevel(
	    xiv.ui.ctrl.MasterController3D.CONTROLLERS.BRIGHTNESS, xInc);
    } else {
	incrementLevel(
	    xiv.ui.ctrl.MasterController3D.CONTROLLERS.BRIGHTNESS, 
	    xInc * -1);
    }
    

    if (yDist < 0){
	incrementLevel(
	    xiv.ui.ctrl.MasterController3D.CONTROLLERS.CONTRAST, yInc);
    } else {
	incrementLevel(
	    xiv.ui.ctrl.MasterController3D.CONTROLLERS.CONTRAST, 
	    yInc * -1);
    }
    
}




/**
 * @private
 * @param {!number} xDist
 * @param {!number} yDist
 */
xiv.ui.ViewBoxInteractorHandler.prototype.onRenderPlaneZoom_ = 
function(xDist, yDist){
    //
    // Clear the cusor style
    //
    //this.clearCursorStyle_();

    //
    // First, we determine which is bigger
    //
    var zoomIn = function(){
	this.setCursorZoomIn_();
	this.currMouseRenderer_.zoomIn();
	//this.syncAllCrosshairs();
    }.bind(this)
    var zoomOut = function(){
	this.setCursorZoomOut_();
	this.currMouseRenderer_.zoomOut();
	//this.syncAllCrosshairs();
    }.bind(this)

    //
    // If xDist is larger
    //
    if (Math.abs(xDist) > Math.abs(yDist)) {
	if (xDist > 1){
	    zoomIn();
	} else {
	    zoomOut();
	}
    } 

    //
    // If yDist is larger
    //
    else {
	if (yDist < 0){
	    zoomIn();
	} else {
	    zoomOut();
	}
    } 

    //
    // Sync zoom display
    //
    this.syncZoomDisplayToRenderer_();
    this.syncAllCrosshairs();
}



/**
 * @public
 */
xiv.ui.ViewBoxInteractorHandler.prototype.syncAllCrosshairs = function(){
    this.interactorsAndRenderers_(
	function(renderPlane, renderPlaneOr, planeInteractors, volume){
	    this.syncCrosshairsToVolume_(renderPlaneOr, volume);
	}.bind(this));
}



/**
 * @private
 * @param {!number} xDist
 * @param {!number} yDist
 */
xiv.ui.ViewBoxInteractorHandler.prototype.onRenderPlanePan_ = 
function(xDist, yDist){
    //
    // Grabbing cursor
    //
    this.setCursorGrabbing_();

    //
    // Pan
    //
    this.currMouseRenderer_.getCamera().pan([xDist * -1, yDist * -1]);

    //
    // Update crosshairs
    //
    this.syncAllCrosshairs();
}




/**
 * @private
 * @param {goog.events.Event} e
 */
xiv.ui.ViewBoxInteractorHandler.prototype.onMouseOut_ = function(e) {
    this.currMouseRenderer_ = null;
} 



/**
 * @private
 * @param {goog.events.Event} e
 */
xiv.ui.ViewBoxInteractorHandler.prototype.onMouseDown_ = function(e) {
    if (e.button == 0) {
	this.leftMouseDown_ = true;
    } 
    else if (e.button == 1){
	this.middleMouseDown_ = true;
    }
    else if (e.button == 2){
	this.rightMouseDown_ = true;
    }
    //window.console.log("DOWN", e, this.leftMouseDown_, this.rightMouseDown_);
}



/**
 * @private
 * @param {goog.events.Event} e
 */
xiv.ui.ViewBoxInteractorHandler.prototype.onMouseUp_ = function(e) {
    if (e.button == 0) {
	this.leftMouseDown_ = false;
    } 
    else if (e.button == 1){
	this.middleMouseDown_ = false;
    }
    else if (e.button == 2){
	this.rightMouseDown_ = false;
    }
}



/**
 * @private
 */
xiv.ui.ViewBoxInteractorHandler.prototype.listenForMouseEvents_ = 
function() {

    this.mouseDownKeys_ = {};
    this.mouseUpKeys_ = {};
    this.mouseOutKeys_ = {};
    this.mouseOverKeys_ = {};

    //
    // Mouseover for every render plane
    //
    this.interactorsAndRenderers_(
    function(renderPlane, renderPlaneOr, planeInteractors, volume){
	//
	// MOUSEOVER -- (this one is a little different: we attach it to the 
	//               renderer instead of the canvas)
	//
	this.mouseOverKeys_[renderPlaneOr] = 
	    goog.events.listen(
		renderPlane.getRenderer(), 
		goog.events.EventType.MOUSEOVER, 
		this.onMouseOver_.bind(this))


	//
	// Get the cavas
	//
	var renderCanv = renderPlane.getRenderer().getCanvas();


	//
	// MOUSEOUT
	//
	this.mouseOutKeys_[renderPlaneOr] = 
	    goog.events.listen(renderCanv,  
			       goog.events.EventType.MOUSEOUT, 
			       this.onMouseOut_.bind(this))


	//
	// MOUSEDOWN
	//
	this.mouseDownKeys_[renderPlaneOr] = 
	    goog.events.listen(
		renderCanv, 
		goog.events.EventType.MOUSEDOWN, 
		this.onMouseDown_.bind(this))

	//
	// MOUSEUP
	//
	this.mouseUpKeys_[renderPlaneOr] = 
	    goog.events.listen(
		renderCanv,  
		goog.events.EventType.MOUSEUP, 
		this.onMouseUp_.bind(this))

    }.bind(this))
}




/**
 * @param {!xiv.vis.XtkRenderer2D} renderer
 * @param {!number} increment
 * @private
 */
xiv.ui.ViewBoxInteractorHandler.prototype.incrementFrameSlider_ = 
function(renderer, increment) {
    this.interactorsAndRenderers_(
	function(renderPlane, renderPlaneOr, planeInteractors, volume){
		planeInteractors.SLIDER.setValue(
		    planeInteractors.SLIDER.getValue() + increment)
	}.bind(this), renderer.getOrientation())
}



/**
 * @private
 */
xiv.ui.ViewBoxInteractorHandler.prototype.onKey_ = function(e) {
    window.console.log('On key:', e.keyCode);

    // Arrow keys
    if ((e.keyCode - 40 >= -3) && (e.keyCode - 40 <= 0)){
	this.onArrowKey_(e.keyCode);
    }


    // Z (Zoom)
    if (e.keyCode == 90){
	this.ViewBox_.fireToggleButton(
	    xiv.ui.ViewBoxInteractorHandler.TOGGLE_KEYS.TWODZOOM);
    }

    // P (Pan) or M (Move)
    else if (e.keyCode == 80 || e.keyCode == 77){
	this.ViewBox_.fireToggleButton(
	    xiv.ui.ViewBoxInteractorHandler.TOGGLE_KEYS.TWODPAN);
    }

    // L (Levels) or B(Brightness and Contrast)
    else if (e.keyCode == 66 || e.keyCode == 76){
	this.ViewBox_.fireToggleButton(
	    xiv.ui.ViewBoxDialogs.DIALOG_KEYS.LEVELS);
    }

    // C (Crosshairs)
    else if (e.keyCode == 67){
	this.ViewBox_.fireToggleButton(
	    xiv.ui.ViewBoxInteractorHandler.TOGGLE_KEYS.CROSSHAIRS);
    }

    // S (Settings)
    else if (e.keyCode == 83){
	this.ViewBox_.fireToggleButton(
	    xiv.ui.ViewBoxInteractorHandler.TOGGLE_KEYS.SETTINGS);
    }

    // I (Info)
    else if (e.keyCode == 73){
	this.ViewBox_.fireToggleButton(
	xiv.ui.ViewBoxDialogs.DIALOG_KEYS.INFO);
    }

    // H (Help)
    else if (e.keyCode == 72){
	this.ViewBox_.fireToggleButton(
	xiv.ui.ViewBoxDialogs.DIALOG_KEYS.HELP);
    }
}



/**
 * @private
 */
xiv.ui.ViewBoxInteractorHandler.prototype.onKeyDown_ = function(e) {
    //window.console.log('DOWN', e, e.keyCode);
    // CTRL
    if (e.keyCode == 17){
    }
}



/**
 * @private
 */
xiv.ui.ViewBoxInteractorHandler.prototype.onKeyUp_ = function(e) {

}



/**
 * @param {!number}
 * @private
 */
xiv.ui.ViewBoxInteractorHandler.prototype.onArrowKey_ = function(key) {
    /*
    switch (key){
    case 38: // UP ARROW
	this.incrementSlider_(this.currMouseRenderer_, 1);
	break;
    case 39: // RIGHT ARROW
	this.incrementSlider_(this.currMouseRenderer_, 1);
	break;

    case 40: // DOWN ARROW
	this.incrementSlider_(this.currMouseRenderer_, -1);
	break;
    case 37: // LEFT ARROW
	this.incrementSlider_(this.currMouseRenderer_, -1);
	break;
    }
    */
    this.incrementFrameSlider_(this.currMouseRenderer_, 
			  (key == 40 || key == 37) ? -1 : 1);
}




/**
 * @param {!Function} callback
 * @param {string=} opt_orientation If not provided, then we loop all of the 
 *    planes.
 * @private
 */
xiv.ui.ViewBoxInteractorHandler.prototype.interactorsAndRenderers_ = 
function(callback, opt_orientation){
    //
    // Do nothing if no renderer
    //
    if (!goog.isDefAndNotNull(this.Renderer_)) { return };

    //
    // Get the interactors
    //
    var interactors = this.LayoutHandler_.getMasterInteractors();
    
    //
    // Callback handler
    //
    var callbackHandler = function(renderPlane, orientation) {
	//
	// Send a null for interactors if there are none associated with
	// the render plane
	//
	if (!goog.isDefAndNotNull(interactors) || 
	    !goog.isDefAndNotNull(interactors[orientation])) { 
	    //callback(renderPlane, orientation, null, renderPlane.getVolume());
	    // Do nothing if no interactors
	} 
	//
	// Otherwise proceed
	//
	else {
	    callback(renderPlane, orientation, interactors[orientation], 
		     renderPlane.getVolume());
	}
    }

    //
    // If the orientation is provided, then run the callback on that plane
    // only.
    //
    if (goog.isString(opt_orientation)) {
	var plane = this.Renderer_.getPlaneByOrientation(opt_orientation);
	//
	// Throw an error if the plane doesn't exist
	//
	if (!goog.isDefAndNotNull(plane)){
	    throw new Error("Invalid plane: ", plane);
	}
	//
	// Run the callback handler
	//
	callbackHandler(this.Renderer_.getPlaneByOrientation(opt_orientation), 
		       opt_orientation);
    }

    //
    // Loop all planes if opt_orientation is not defined
    //
    else {
	goog.object.forEach(
	    this.Renderer_.getPlanes(), 
	    function(renderPlane, renderPlaneOr) {
		callbackHandler(renderPlane, renderPlaneOr);
	    }.bind(this))
    }
}






/**
 * @public
 */
xiv.ui.ViewBoxInteractorHandler.prototype.createTwoDZoomToggle = 
function(){    
    this.ViewBox_.createToggleButton(
	'LEFT', 
	xiv.ui.ViewBoxInteractorHandler.CSS.GENERIC_TOGGLE, 
	xiv.ui.ViewBoxInteractorHandler.TOGGLE_KEYS.TWODZOOM,
	'2D Zoom', 
	function(button, buttonChecked){
	    this.clearCursorStyle_();
	    var checked = button.getAttribute('checked').toString() == 'true';
	    this.zooming_ = checked;

	    //
	    // Untoggle PAN
	    //
	    if (checked){
		this.ViewBox_.untoggle(
		    xiv.ui.ViewBoxInteractorHandler.TOGGLE_KEYS.TWODPAN);
		this.setCursorZoomIn_();
	    }

	}.bind(this), 
	serverRoot + 
	    '/images/viewer/xiv/ui/ViewBox/Toggle-2DZoom.png');

    this.ViewBox_.fireToggleButton(
	xiv.ui.ViewBoxInteractorHandler.TOGGLE_KEYS.TWODZOOM);
}



/**
 * @public
 */
xiv.ui.ViewBoxInteractorHandler.prototype.createTwoDPanToggle = 
function(){    
    this.ViewBox_.createToggleButton(
	'LEFT', 
	xiv.ui.ViewBoxInteractorHandler.CSS.GENERIC_TOGGLE, 
	xiv.ui.ViewBoxInteractorHandler.TOGGLE_KEYS.TWODPAN,
	'2D Pan', 
	function(button){
	    this.clearCursorStyle_();
	    var checked = button.getAttribute('checked').toString() == 'true';
	    this.panning_ = checked;
	    if (checked){
		this.setCursorGrab_();
		this.ViewBox_.untoggle(
		    xiv.ui.ViewBoxInteractorHandler.TOGGLE_KEYS.TWODZOOM);	
	    }
	}.bind(this), 
	serverRoot + '/images/viewer/xiv/ui/ViewBox/Toggle-2DPan.png');

    //this.panning_ = true;
    this.ViewBox_.fireToggleButton(
	xiv.ui.ViewBoxInteractorHandler.TOGGLE_KEYS.TWODPAN);
}



/**
 * @param {boolean=} opt_isOn
 * @public
 */
xiv.ui.ViewBoxInteractorHandler.prototype.createCrosshairToggle = 
function(opt_isOn){
    this.ViewBox_.createToggleButton(
	'LEFT', 
	xiv.ui.ViewBoxInteractorHandler.CSS.GENERIC_TOGGLE, 
	xiv.ui.ViewBoxInteractorHandler.TOGGLE_KEYS.CROSSHAIRS,
	'Toggle Crosshairs', 
	function(button){
	    this.toggleCrosshairsVisible(
		(button.getAttribute('checked') == 'true'))
	}.bind(this), 
	serverRoot + 
	    '/images/viewer/xiv/ui/ViewBox/Toggle-Crosshairs.png');

    if (opt_isOn === false){
	this.ViewBox_.fireToggleButton(
	    xiv.ui.ViewBoxInteractorHandler.TOGGLE_KEYS.CROSSHAIRS);
    }
}




/**
 * @public
 */
xiv.ui.ViewBoxInteractorHandler.prototype.createSettingsToggle = 
function(){    
    this.ViewBox_.createToggleButton(
	'LEFT', 
	xiv.ui.ViewBoxInteractorHandler.CSS.GENERIC_TOGGLE, 
	xiv.ui.ViewBoxInteractorHandler.TOGGLE_KEYS.SETTINGS,
	'Settings', 
	function(button){
	    window.console.log("Need to create dialog here");
	    //this.Renderer_.setVPlaneOn(
	    //(button.getAttribute('checked') == 'true'));
	}.bind(this), 
	serverRoot + 
	    '/images/viewer/xiv/ui/ViewBox/Toggle-Settings.png');

    this.ViewBox_.fireToggleButton(
	xiv.ui.ViewBoxInteractorHandler.TOGGLE_KEYS.SETTINGS);
}




/**
 * @private
 */
xiv.ui.ViewBoxInteractorHandler.prototype.syncVolumeCtrlsToRenderer_ = 
function() { 
    //
    // Do nothing if no renderer
    //
    if (!goog.isDefAndNotNull(this.Renderer_)) { return };



    //window.console.log("GET", ));
    this.interactorsAndRenderers_(
    function(renderPlane, renderPlaneOr, planeInteractors, volume){
	//window.console.log('\n\n', renderPlaneOr, volume);
	var slider = planeInteractors.SLIDER;
	var frameDisplay = planeInteractors.FRAME_DISPLAY;
	var zoomDisplay = planeInteractors.ZOOM_DISPLAY;
	var crosshairs = planeInteractors.CROSSHAIRS;
	var arrPos = 0;

	//
	// Set custom params
	//
	slider[this.constructor.ORIENTATION_KEY] = renderPlaneOr;
	frameDisplay[this.constructor.ORIENTATION_KEY] = renderPlaneOr;
	zoomDisplay[this.constructor.ORIENTATION_KEY] = renderPlaneOr;
	crosshairs[this.constructor.ORIENTATION_KEY] = renderPlaneOr;

	//
	// Preliminary sync
	//
	this.syncSlidersToVolume_(true);
	this.syncVolumeToSlider_(slider, volume);
	this.syncCrosshairsToVolume_(slider[this.constructor.ORIENTATION_KEY],
				     volume);
	this.syncFrameDisplayToSlider_(slider, volume);

	//
	// Exit if no volume
	//
	if (!goog.isDefAndNotNull(renderPlane.getRenderer())) { return };

	//
	// ZOOM interaction
	//
	goog.events.listen(renderPlane.getRenderer(), 
			   xiv.vis.XtkEngine.EventType.ZOOM,
			   function(e){
			       this.syncZoomDisplayToRenderer_();
			   }.bind(this))


	//
	// Change Slice when slider moves
	//
	goog.events.listen(slider, nrg.ui.Slider.EventType.SLIDE, 
        function(e){
	    //window.console.log(volume);
	    this.syncVolumeToSlider_(e.target, volume);
	    this.syncCrosshairsToVolume_(
		e.target[this.constructor.ORIENTATION_KEY],
		volume);
	    this.syncFrameDisplayToSlider_(e.target, volume);
	}.bind(this))

	//
	// Change Slice on Frame Display input
	//
	goog.events.listen(frameDisplay, 
		xiv.ui.layouts.interactors.InputController.EventType.INPUT,
		function(e){
		    this.syncSliderToFrameDisplay_(e.target,volume);
		    this.syncAllCrosshairs();
		}.bind(this))


	//
	// Change Slice on Frame Display input
	//
	goog.events.listen(zoomDisplay, 
		xiv.ui.layouts.interactors.InputController.EventType.INPUT,
		function(e){
		    this.syncRendererToZoomDisplay_(zoomDisplay, 
						   renderPlane);
		    this.syncAllCrosshairs();
		}.bind(this))
    }.bind(this))



    //
    // Update the controllers in the renderer
    //
    this.Renderer_.updateControllers();
}



/**
 * @public
 * @return {xiv.ui.Histogram}
 */
xiv.ui.ViewBoxInteractorHandler.prototype.createHistogram = function(){
    var histogram = new xiv.ui.Histogram();
    var count = 0;
    this.interactorsAndRenderers_(
    function(renderPlane, renderPlaneOr, planeInteractors, volume){
	if (count == 0) { histogram.setVolume(volume) }
	count++;
    })
    histogram.render(document.body);
    return histogram;
}



/**
 * @private
 */
xiv.ui.ViewBoxInteractorHandler.prototype.updateHistogram_ = function(){
    this.Histogram_.drawLine();
    this.Histogram_.updateMaxMin();
}




/**
 * @param {nrg.ui.Slider} slider
 * @param {X.volume} volume
 * @private
 */
xiv.ui.ViewBoxInteractorHandler.prototype.syncVolumeToSlider_ = 
function(slider, volume) {
    if (!goog.isDefAndNotNull(volume)) return;

    //
    // Invert the axial and coronal planes to match that of Slicer
    //
    var orientation = slider[this.constructor.ORIENTATION_KEY];
    var adder = (orientation == 'Y' || orientation == 'Z') ? 
	slider.getMaximum() - slider.getValue() - 1 : slider.getValue() - 1;

    //
    // Set the volume index
    // 
    volume['index' + slider[this.constructor.ORIENTATION_KEY]] = adder;
}




/**
 * @param {!string} orientation
 * @param {!Function} callback
 * @private
 */
xiv.ui.ViewBoxInteractorHandler.prototype.adjustCrosshairs_ = 
function(orientation, crosshairOrientation, value, reverse){
    //
    // Renderer
    //
    var renderer = this.Renderer_.getPlaneByOrientation(orientation).
	getRenderer();

    //
    // Frame
    //
    var frame = this.LayoutHandler_.getCurrentLayout().
	getLayoutFrameByTitle(orientation);

    //
    // Crosshairs
    //
    var crosshairs = null;
    if (goog.isDefAndNotNull(frame)){
	crosshairs = frame[xiv.ui.layouts.Layout.INTERACTORS.CROSSHAIRS];
    }

    //
    // Adjust only if there are crosshairs
    //
    if (goog.isDefAndNotNull(crosshairs)) {
	if (crosshairOrientation == 'vertical'){
	    crosshairs.setX(renderer.getVerticalSliceX(value, reverse))
	}
	else if (crosshairOrientation == 'horizontal'){
	    crosshairs.setY(renderer.getHorizontalSliceY(value, reverse))
	}
    }
}


/**
 * @private
 */
xiv.ui.ViewBoxInteractorHandler.prototype.syncCrosshairsToVolumeX_ =  
function(volume) {
    var vInd = volume['indexX'];
    this.adjustCrosshairs_('Y', 'vertical', vInd, true);
    this.adjustCrosshairs_('Z', 'vertical', vInd, true);
}



/**
 * @param {X.volume} volume
 * @public
 */
xiv.ui.ViewBoxInteractorHandler.prototype.syncCrosshairsToVolumeY_ =  
function(volume) {
    var vInd = volume['indexY'];
    this.adjustCrosshairs_('X', 'vertical', vInd, false);
    this.adjustCrosshairs_('Z', 'horizontal', vInd, false);
}



/**
 * @param {X.volume} volume
 * @public
 */
xiv.ui.ViewBoxInteractorHandler.prototype.syncCrosshairsToVolumeZ_ =  
function(volume) {
    var vInd = volume['indexZ'];
    this.adjustCrosshairs_('X', 'horizontal', vInd, false);
    this.adjustCrosshairs_('Y', 'horizontal', vInd, false);
}



/**
 * @param {!string} orientation
 * @param {?X.volume} volume
 * @private
 */
xiv.ui.ViewBoxInteractorHandler.prototype.syncCrosshairsToVolume_ = 
function(orientation, volume) {
    if (!goog.isDefAndNotNull(volume)){
	return;
    }
    switch (orientation){
    case 'X': 
	this.syncCrosshairsToVolumeX_(volume);
	break;
    case 'Y': 
	this.syncCrosshairsToVolumeY_(volume);
	break;
    case 'Z': 
	this.syncCrosshairsToVolumeZ_(volume);
	break;
    }
}



/**
 * @param {!nrg.ui.Slider} slider
 * @param {X.volume} volume
 * @private
 */
xiv.ui.ViewBoxInteractorHandler.prototype.syncFrameDisplayToSlider_ = 
function(slider, volume) {
    this.interactorsAndRenderers_(
    function(renderPlane, renderPlaneOr, planeInteractors, volume){
	var frameDisplay = planeInteractors.FRAME_DISPLAY;
	var slider = planeInteractors.SLIDER;
	frameDisplay.setMaximum(slider.getMaximum());
	frameDisplay.setValue(slider.getValue());  
    }.bind(this), slider[this.constructor.ORIENTATION_KEY])
}



/**
 * @param {!xiv.ui.layouts.interactors.ZoomDisplay} zoomDisplay
 * @param {X.volume} volume
 * @private
 */
xiv.ui.ViewBoxInteractorHandler.prototype.syncRendererToZoomDisplay_ = 
function(zoomDisplay, renderPlane) {
    renderPlane.getRenderer().setZoom(zoomDisplay.getValue() / 100);
}


/**
 * @private
 */
xiv.ui.ViewBoxInteractorHandler.prototype.syncZoomDisplayToRenderer_ = 
function() {
    this.interactorsAndRenderers_(
    function(renderPlane, renderPlaneOr, planeInteractors){
	if (!planeInteractors.ZOOM_DISPLAY || !renderPlane.getRenderer()) { 
	    return 
	};

	var renderZoom = renderPlane.getRenderer().getZoom();
	var displayZoom = planeInteractors.ZOOM_DISPLAY.getValue() / 100;

	if (renderZoom < displayZoom && !this.rightMouseDown_) {
	    //renderPlane.getRenderer().setZoom(displayZoom);  
	} 
	//else {
	    planeInteractors.ZOOM_DISPLAY.setValue(
		Math.round(renderZoom * 100));
	//}
	
    }.bind(this))
}



/**
 * @param {!xiv.ui.layouts.interactors.FrameDisplay} frameDisplay
 * @param {X.volume} volume
 * @private
 */
xiv.ui.ViewBoxInteractorHandler.prototype.syncSliderToFrameDisplay_ = 
function(frameDisplay, volume) {
    if (!goog.isDefAndNotNull(volume)) return;
    this.interactorsAndRenderers_(
    function(renderPlane, renderPlaneOr, planeInteractors, volume){
	planeInteractors.SLIDER.setValue(frameDisplay.getValue()); 
    }.bind(this), frameDisplay[this.constructor.ORIENTATION_KEY]) 
}



/**
 * @private
 */
xiv.ui.ViewBoxInteractorHandler.prototype.setVolumeSlidersHalfway_ = 
function() {
    this.interactorsAndRenderers_(
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
 * @private
 */
xiv.ui.ViewBoxInteractorHandler.prototype.syncSlidersToVolume_ = 
function(opt_resetMaximum) {

    var orientation;
    var currVol;
    var slider;

    this.interactorsAndRenderers_(
    function(renderPlane, renderPlaneOr, planeInteractors, volume){
	if (!goog.isDefAndNotNull(planeInteractors.SLIDER)) { 
	    return; 
	};
	slider = planeInteractors.SLIDER;
	orientation = slider[this.constructor.ORIENTATION_KEY];

	//
	// Exit if no volume
	//
	if (!goog.isDefAndNotNull(volume)) { return };
	if (opt_resetMaximum === true) {
	    slider.setMaximum(renderPlane.getRenderer().getNumberSlices());
	    slider.setMinimum(1);
	}
	slider.setValue(volume['index' + orientation] + 1);
    })
}




/**
 * @param {!Event}
 * @private
 */
xiv.ui.ViewBoxInteractorHandler.prototype.onRenderPlaneShiftDown_ = function(e){
    this.hideInteractors();
    this.syncSlidersToVolume_();
}



/**
 * @public
 */
xiv.ui.ViewBoxInteractorHandler.prototype.onLayoutResize = function(){
    var slider;
    var frameDisplay;
    this.interactorsAndRenderers_(
    function(renderPlane, renderPlaneOr, planeInteractors, volume){
	this.syncSliderToFrameDisplay_(planeInteractors.FRAME_DISPLAY, volume);
	//this.syncCrosshairsToVolume_(planeInteractors.SLIDER, volume);
	this.syncZoomDisplayToRenderer_();
    }.bind(this));

    this.syncAllCrosshairs();
}



/**
 * @param {boolean=} opt_visible
 * @public
 */
xiv.ui.ViewBoxInteractorHandler.prototype.toggleInteractorsVisible = 
function(opt_visible) {
    var opacity = (opt_visible === false) ? 0 : 1;
    this.interactorsAndRenderers_(
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
    this.Dialogs_.toggleVisible(xiv.ui.ViewBoxDialogs.DIALOG_KEYS.INFO, false); 
}


/**
 * @public
 */
 xiv.ui.ViewBoxInteractorHandler.prototype.showInteractors = function() {
    this.toggleInteractorsVisible(true); 
    this.Dialogs_.toggleVisible(xiv.ui.ViewBoxDialogs.DIALOG_KEYS.INFO, true); 
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
    this.interactorsAndRenderers_(
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


    this.interactorsAndRenderers_(
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
	slider[this.constructor.ORIENTATION_KEY] = renderPlaneOr;
	frameDisplay[this.constructor.ORIENTATION_KEY] = renderPlaneOr;

	//
	// Exit if no volume
	//
	if (!goog.isDefAndNotNull(renderPlane.getRenderer())) { return };

	//
	// The slider's thumb shifts during size changes, so we sync it up.
	//
	this.syncSliderToFrameDisplay_(frameDisplay, volume);
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
    if (goog.isDefAndNotNull(this.Dialogs_) &&
	goog.isDefAndNotNull(this.Dialogs_.getHelpDialog())){
	this.Dialogs_.getHelpDialog().setLayoutButton(e.target.
						      getMenuIcon().src);
    }
}



/**
 * @private
 */
xiv.ui.ViewBoxInteractorHandler.prototype.updateVolumeCtrls_ = function(){
    if (!goog.isDefAndNotNull(this.volumeCtrls_)) { return };
    goog.array.forEach(this.volumeCtrls_, function(controller){
	//window.console.log('\nLabel', controller.getLabel().innerHTML);
	controller.update();
    })
}


/**
 * @private
 */
xiv.ui.ViewBoxInteractorHandler.prototype.updateMeshCtrls_ = function(){
    if (!goog.isDefAndNotNull(this.meshCtrls_)) { return };
    goog.array.forEach(this.meshCtrls_, function(controller){
	//window.console.log('\nLabel', controller.getLabel().innerHTML);
	controller.update();
    })
}



/**
 * @private
 */
xiv.ui.ViewBoxInteractorHandler.prototype.updateLevelCtrls_ = function(){
    if (!goog.isDefAndNotNull(this.levelCtrls_)) { return };
    goog.array.forEach(this.levelCtrls_, function(controller){
	//window.console.log(controller.getLabel().innerHTML,
	//controller.getComponent().getValue());
	   
	//
	// IMPORTANT!! PLEASE READ!!
	//
	// We only need to update the style of the level sliders because
	// LEVEL_MIN and LEVEL_MAX are often set to values that go beyond
	// the slider values.
	//
	controller.getComponent().updateStyle();
    })
}



/**
 * @public
 */
xiv.ui.ViewBoxInteractorHandler.prototype.createVolumeCtrls = 
function() {
    //
    // Track the controllers
    //
    this.volumeCtrls_ = [];
    this.meshCtrls_ = [];
    this.levelCtrls_ = [];

    //
    // Create the dialogs
    //
    this.Dialogs_.createLevelsDialog();
    this.Dialogs_.createVolumesDialog();

   
	
    //-------------------------
    // NOTE: We now need to separate level controllers (brightness,
    // contrast, etc.) from the other controllers
    //-------------------------

    
    //
    // Create a new ZippyTree for volume controllers
    //
    if (goog.isDefAndNotNull(this.volumeCtrlTree_)){
	this.volumeCtrlTree_.disposeInternal();
    }
    this.volumeCtrlTree_ = new nrg.ui.ScrollableZippyTree();
    this.volumeCtrlTree_.render();


    //
    // Create a new ZippyTree for mesh controllers
    //
    if (goog.isDefAndNotNull(this.meshCtrlTree_)){
	this.meshCtrlTree_.disposeInternal();
    }
    this.meshCtrlTree_ = new nrg.ui.ScrollableZippyTree();
    this.meshCtrlTree_.render();

    //
    // Create a new ZippyTree for level controllers
    //
    if (goog.isDefAndNotNull(this.levelCtrlTree_)){
	this.levelCtrlTree_.disposeInternal();
    }
    this.levelCtrlTree_ = new nrg.ui.ScrollableZippyTree();
    this.levelCtrlTree_.render();

    //
    // Identify the controllers we need to separate from the rest.
    //
    var levelCtrlLabels = [
	xiv.ui.ctrl.MasterController3D.CONTROLLERS.LEVEL_MIN, 
	xiv.ui.ctrl.MasterController3D.CONTROLLERS.LEVEL_MAX, 
	xiv.ui.ctrl.MasterController3D.CONTROLLERS.CONTRAST, 
	xiv.ui.ctrl.MasterController3D.CONTROLLERS.BRIGHTNESS
    ]
    var updatableLevelCtrlLabels = [
	xiv.ui.ctrl.MasterController3D.CONTROLLERS.LEVEL_MIN, 
	xiv.ui.ctrl.MasterController3D.CONTROLLERS.LEVEL_MAX 
    ]

    var updatableLevelCtrls = [];


    //
    // Add the 2D controllers (no need to separate any of these).
    //
    var controllers2D = this.Renderer_.getControllers2D();
    if (goog.isDefAndNotNull(controllers2D) && (controllers2D.length > 0)) {
	goog.array.forEach(controllers2D, function(ctrl){
	    //
	    // Add the '2D' descriptor to any sub-folders.
	    //
	    var folders = ctrl.getFolders();
	    folders.push('2D');

	    
	    var currTree;
	    var currCtrls;
	    if (folders[0] == 'Volumes'){
		currTree = this.volumeCtrlTree_;
		currCtrls = this.volumeCtrls_;
	    } 
	    else if (folders[0] == 'Meshes'){
		currTree = this.meshCtrlTree_;
		currCtrls = this.meshCtrls_;		
	    }

	    //
	    // store controller
	    //
	    currCtrls.push(ctrl);

	    //
	    // Add other controllers to render Controller zippy
	    //
	    currTree.addContents(ctrl.getElement(), folders);
	}.bind(this));
    }

    //
    // Add the 3D controllers, separating the level controlers from the others.
    //
    var controllers3D = this.Renderer_.getControllers3D();
    if (goog.isDefAndNotNull(controllers3D) && (controllers3D.length > 0)) {
	goog.array.forEach(controllers3D, function(ctrl){


	    //
	    // Separate the level controllers, add to that zippy
	    //
	    if (goog.array.contains(levelCtrlLabels,
		ctrl.getLabel().innerHTML)){
		this.levelCtrlTree_.addContents(ctrl.getElement());
		//
		// Min , max
		//
		if (goog.array.contains(updatableLevelCtrlLabels,
					ctrl.getLabel().innerHTML)){
		    updatableLevelCtrls.push(ctrl);
		} 
		
		this.levelCtrls_.push(ctrl);
		
		return;
	    } 

	    //
	    // Otherwise add the '3D' descriptor to any sub-folders.
	    //
	    var folders = ctrl.getFolders();
	    if (folders.length > 1){
		folders.push('3D');
	    }


	    var currTree;
	    var currCtrls;
	    if (folders[0] == 'Volumes'){
		currTree = this.volumeCtrlTree_;
		currCtrls = this.volumeCtrls_;
	    } 
	    else if (folders[0] == 'Meshes'){
		currTree = this.meshCtrlTree_;
		currCtrls = this.meshCtrls_;		
	    }

	    //
	    // store controller
	    //
	    currCtrls.push(ctrl);

	    //
	    // Add other controllers to render Controller zippy
	    //
	    currTree.addContents(ctrl.getElement(), folders);

	}.bind(this));
    }

    //
    // Set the tree style and add to dialog
    //
    var volumeCtrlTreeElt = this.volumeCtrlTree_.getElement();
    goog.dom.classes.add(volumeCtrlTreeElt, 
			 this.constructor.CSS.VOLUMECONTROLLER_ZIPPYTREE);
    this.Dialogs_.getDialogs()
    [xiv.ui.ViewBoxDialogs.DIALOG_KEYS.VOLUMES].
	getElement().appendChild(volumeCtrlTreeElt);
    this.volumeCtrlTree_.expandAll();


    //
    // Set the tree style and add to dialog
    //
    if (this.meshCtrls_.length > 0){
	this.Dialogs_.createMeshesDialog();
	var meshCtrlTreeElt = this.meshCtrlTree_.getElement();
	goog.dom.classes.add(meshCtrlTreeElt, 
			     this.constructor.CSS.MESHCONTROLLER_ZIPPYTREE);
	this.Dialogs_.getDialogs()
	[xiv.ui.ViewBoxDialogs.DIALOG_KEYS.MESHES].
	    getElement().appendChild(meshCtrlTreeElt);
	this.meshCtrlTree_.expandAll();
    }



    //
    // Set the tree style and add to dialog
    //
    var levelCtrlTreeElt = this.levelCtrlTree_.getElement();
    goog.dom.classes.add(levelCtrlTreeElt, 
			 this.constructor.CSS.LEVELCONTROLLER_ZIPPYTREE);
    this.Dialogs_.getDialogs()[xiv.ui.ViewBoxDialogs.DIALOG_KEYS.LEVELS].
	getElement().appendChild(levelCtrlTreeElt);


    //
    // We have to re-sync the level controllers to the volume properties, 
    // since the volume is now rendered....
    //
    goog.array.forEach(updatableLevelCtrls, function(levelCtrl){
	levelCtrl.getComponent().setMaximum(
	    levelCtrl.getXObj().windowHigh);
	levelCtrl.getComponent().setMinimum(
	    levelCtrl.getXObj().windowLow);
	levelCtrl.update();
    })


    //
    // Create histogram
    //
    this.Histogram_ = this.createHistogram();
   
    //
    // Update the histogram when the sliders move
    //
    goog.array.forEach(updatableLevelCtrls, 
		       function(levelCtrl){
	goog.events.listen(levelCtrl.getComponent(), 
			   nrg.ui.Slider.EventType.SLIDE,
			       this.updateHistogram_.bind(this))
    }.bind(this))

    //
    // add the histogram to the LEVELS dialog
    //
    this.Dialogs_.getDialogs()[xiv.ui.ViewBoxDialogs.DIALOG_KEYS.LEVELS].
	getElement().appendChild(this.Histogram_.getElement());


    //
    // Sync the render controllers with the renderer
    //
    this.syncVolumeCtrlsToRenderer_();
}





/**
 * @inheritDoc
 */
xiv.ui.ViewBoxInteractorHandler.prototype.dispose = function () {
    goog.base(this, 'dispose');

    if (goog.isDefAndNotNull(this.Histogram_)){
	this.Histogram_.disposeInternal();
    }


    if (goog.isDefAndNotNull(this.volumeCtrls_)){
	goog.array.clear(this.volumeCtrls_);
    }

    if (goog.isDefAndNotNull(this.keyHandler_)){
	this.keyHandler_.dispose();
	delete this.keyHandler_;
    }
 
    this.volumeCtrlTree_.disposeInternal();
    this.levelCtrlTree_.disposeInternal();


    if (goog.isDefAndNotNull(this.prevMousePos_)){
	goog.array.clear(this.prevMousePos_);
	delete this.prevMousePos_;
    }

    
    if (goog.isDefAndNotNull(this.levelCtrls_)){
	goog.array.clear(this.levelCtrls_);
	delete this.levelCtrls_;
    }

    //
    // Keyboard listener    
    //
    if (goog.isDefAndNotNull(this.keyDownKey_)){
	goog.events.unlisten(this.keyDownKey_);
	goog.events.unlisten(this.keyUpKey_);
	delete this.keyDownKey_;
	delete this.keyUpKey_;
    }

    //
    // Mouse listener   
    //    
    if (goog.isDefAndNotNull(this.mouseDownKeys_)){

	var mouseKeys = [this.mouseDownKeys_, 
			 this.mouseUpKeys_, 
			 this.mouseOutKeys_,
			 this.mouseOverKeys_];

	goog.array.forEach(mouseKeys, function(mouseKeyObj){
	    goog.objectForEach(mouseKeyObj, function(mouseKey){
		goog.events.unlisten(mouseKey);
		delete mouseKey;
	    })
	    goog.object.clear(mouseKeyObj);
	})
	delete this.mouseDownKeys_;
	delete this.mouseUpKeys_;
	delete this.mouseOutKeys_;
	delete this.mouseOverKeys_;
    }

    delete this.zooming_;
    delete this.panning_;
    delete this.ctrlDown_;
    delete this.shiftDown_;
    delete this.rightMouseDown_;
    delete this.leftMouseDown_;
    delete this.middleMouseDown_;
    delete this.ViewBox_;
    delete this.Renderer_;
    delete this.LayoutHandler_;
    delete this.Dialogs_;
}



goog.exportSymbol('xiv.ui.ViewBoxInteractorHandler.ORIENTATION_KEY', 
		  xiv.ui.ViewBoxInteractorHandler.ORIENTATION_KEY);
