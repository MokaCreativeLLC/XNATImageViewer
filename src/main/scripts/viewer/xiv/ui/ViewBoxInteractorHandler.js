/**
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 */

// goog
goog.require('goog.events.EventTarget');
goog.require('goog.math.Vec2');



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


    /**
     * @private
     * @type {Object.<string, ?Array.<number>>}
     */
    this.mouseXY_ = {
	prev: null,
	curr: null,
    } 


    /**
     * @private
     * @type {Object.<string, ?boolean>}
     */
    this.mouseDown_ = {
	left: false,
	middle: false,
	right: false
    } 


    /**
     * @private
     * @type {Object.<string, Object.<string, goog.events.Key>>}
     */
    this.mouseEvents_ = {
	up: {},
	down: {},
	out: {},
	over: {}
    } 	

    //
    // Set dialog events
    //
    this.setDialogEvents_();

    //
    // Listen for key events
    //
    this.listenForKeyboardEvents_();


    this.zoomFollower_ = goog.dom.createDom('div', {
	id: 'mousefollower'
    })
    goog.dom.classes.add(this.zoomFollower_, 
			 this.constructor.CURSOR_CSS.ZOOM_FOLLOWER);
    this.zoomFollower_.innerHTML  = 
	'Zoom In (drag up)<br>' + 
	'Zoom Out (drag down)<br>'
    goog.dom.append(this.ViewBox_.getViewFrame(), this.zoomFollower_);
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
    RIGHT_ARROW: goog.events.getUniqueId('right_arrow'),
    LEFT_ARROW: goog.events.getUniqueId('left_arrow'),
    UP_ARROW: goog.events.getUniqueId('up_arrow'),
    DOWN_ARROW: goog.events.getUniqueId('up_arrow'),
}



/**
 * @enum {string}
 */
xiv.ui.ViewBoxInteractorHandler.TOGGLEABLE = {
    CROSSHAIRS: 'Crosshairs_' + goog.string.createUniqueString(),
    SETTINGS: 'Settings_' + goog.string.createUniqueString(),
    TWODPAN: 'TwoDPan_' + goog.string.createUniqueString(),
    TWODZOOM: 'TwoDZoom_' + goog.string.createUniqueString(),
}



/**
 * @enum {string}
 * @public
 */
xiv.ui.ViewBoxInteractorHandler.CSS = {
    GENERIC_TOGGLE: 'xiv-ui-viewboxinteractorhandler-generic-toggle',
    GENERIC_DIALOG: 'xiv-ui-viewboxinteractorhandler-generic-dialog',
    GENERIC_ZIPPYTREE: 
    'xiv-ui-viewboxinteractorhandler-generic-zippytree',
}



/**
 * @enum {string}
 * @public
 */
xiv.ui.ViewBoxInteractorHandler.CURSOR_CSS = {
    ZOOM_FOLLOWER: 'xiv-ui-viewboxinteractorhandler-zoom-follower',
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
 * @enum {string}
 */
xiv.ui.ViewBoxInteractorHandler.DIALOG_SPLIT = '_';



/**
 * The previous mouse position.
 *
 * @type {?Object.<string, goog.events.KeyHandler>}
 * @private
 */
xiv.ui.ViewBoxInteractorHandler.prototype.keyHandler_ = null;



/**
 * @type {?Object}
 * @private
 */
xiv.ui.ViewBoxInteractorHandler.prototype.viewableCtrls_ = null;



/**
 * @type {?Array.<nrg.ui.ScrollableZippyTree>}
 * @private
 */
xiv.ui.ViewBoxInteractorHandler.prototype.zippyTrees_ = null;



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
 * @type {Object.<string, string>}
 */
xiv.ui.ViewBoxInteractorHandler.prototype.dialogKeys_ = {};



/**
 * @public
 */
xiv.ui.ViewBoxInteractorHandler.prototype.createInteractors = function() {

    //
    // Create the render controllers
    //
    this.createViewableCtrls();

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

    //
    // Apply a general keyhandler (for keys where up/down events are not
    // needed).
    //
    this.keyHandler_ = new goog.events.KeyHandler();
    this.keyHandler_.attach(listenElt);
    goog.events.listen(this.keyHandler_, 
		       goog.events.KeyHandler.EventType.KEY, 
		       this.onKey_.bind(this));
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
 * @param {!boolean} add If false, then it's we use goog.dom.classes.remove
 * @param {!string} css The css class to apply.
 * @param {string=} opt_customCss The optional custom css class to apply.
 * 
 */
xiv.ui.ViewBoxInteractorHandler.prototype.setCursorCss_ = 
function(add, css, opt_customCss) {
    var cssMethod = add ? goog.dom.classes.add : goog.dom.classes.remove;
    cssMethod(this.ViewBox_.getViewFrame(), css);

    if (goog.isDefAndNotNull(opt_customCss) && 
	(navigator.userAgent.match(/MSIE/i) ||
	 navigator.userAgent.match(/Chrome/i))){
	cssMethod(this.ViewBox_.getViewFrame(), opt_customCss);
    }
}




/**
 * @private
 * @param {goog.events.Event} e
 */
xiv.ui.ViewBoxInteractorHandler.prototype.setCursorGrab_ = function(e) {
    this.setCursorCss_(true, this.constructor.CURSOR_CSS.GRAB,
		       this.constructor.CURSOR_CSS.GRAB_CUSTOM);
    this.setCursorCss_(false, this.constructor.CURSOR_CSS.GRABBING,
		       this.constructor.CURSOR_CSS.GRABBING_CUSTOM);
}



/**
 * @private
 * @param {goog.events.Event} e
 */
xiv.ui.ViewBoxInteractorHandler.prototype.setCursorGrabbing_ = function(e) {
    this.setCursorCss_(false, this.constructor.CURSOR_CSS.GRAB,
		       this.constructor.CURSOR_CSS.GRAB_CUSTOM);
    this.setCursorCss_(true, this.constructor.CURSOR_CSS.GRABBING,
		       this.constructor.CURSOR_CSS.GRABBING_CUSTOM);
}




/**
 * @private
 * @param {goog.events.Event} e
 */
xiv.ui.ViewBoxInteractorHandler.prototype.setCursorZoomIn_ = function(e) {
    this.setCursorCss_(false, this.constructor.CURSOR_CSS.ZOOM_OUT);
    this.setCursorCss_(true, this.constructor.CURSOR_CSS.ZOOM_IN);
}



/**
 * @private
 * @param {goog.events.Event} e
 */
xiv.ui.ViewBoxInteractorHandler.prototype.setCursorZoomOut_ = function(e) {
    this.setCursorCss_(true, this.constructor.CURSOR_CSS.ZOOM_OUT);
    this.setCursorCss_(false, this.constructor.CURSOR_CSS.ZOOM_IN);
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
    this.mouseXY_.prev = this.mouseXY_.curr;
    this.mouseXY_.curr = e.mousePosition;





    //
    // Do nothing if no previous mouse position
    //
    if (this.mouseXY_.prev == null) {return}

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
	(new goog.math.Vec2(this.mouseXY_.curr[0], 
			    this.mouseXY_.curr[1])).add(
				new goog.math.Vec2(this.mouseXY_.prev[0], 
						   this.mouseXY_.prev[1]));
    var mouseDist = Math.sqrt(
	Math.pow(this.mouseXY_.curr[0] - this.mouseXY_.prev[0], 2) + 
	    Math.pow(this.mouseXY_.curr[1] - this.mouseXY_.prev[1], 2)); 

    var xDist = this.mouseXY_.curr[0] - this.mouseXY_.prev[0];
    var yDist = this.mouseXY_.curr[1] - this.mouseXY_.prev[1];

    //window.console.log("MOUSEMOVE", this.ctrlDown_, this.mouseDown_.right);

    this.zoomFollower_.style.visibility = 'hidden';

    //
    // ZOOM
    //
    if (this.zooming_){
	this.zoomFollower_.style.visibility = 'visible';
	this.zoomFollower_.style.left = this.mouseXY_.curr[0] + 20 + 'px';
	this.zoomFollower_.style.top = this.mouseXY_.curr[1] + 20 + 'px';
	this.setCursorZoomIn_();	
	if (this.mouseDown_.left){
	    this.onRenderPlaneZoom_(xDist, yDist);
	}
    }

    //
    // PAN
    //
    else if (this.panning_) {
	this.setCursorGrab_();
	if (this.mouseDown_.left) {	
	    this.onRenderPlanePan_(xDist, yDist);
	}
    }
} 



/**
 * @private
 * @param {goog.events.Event} e
 */
xiv.ui.ViewBoxInteractorHandler.prototype.onMouseOut_ = function(e) {
    this.currMouseRenderer_ = null;
    this.zoomFollower_.style.visibility = 'hidden';
} 



/**
 * @private
 * @param {goog.events.Event} e
 */
xiv.ui.ViewBoxInteractorHandler.prototype.onMouseDown_ = function(e) {
    if (e.button == 0) {
	this.mouseDown_.left = true;
    } 
    else if (e.button == 1){
	this.this.mouseDown_.middle = true;
    }
    else if (e.button == 2){
	this.mouseDown_.right = true;
    }
    //window.console.log("DOWN", e, this.mouseDown_.left, this.mouseDown_.right);
}



/**
 * @private
 * @param {goog.events.Event} e
 */
xiv.ui.ViewBoxInteractorHandler.prototype.onMouseUp_ = function(e) {
    if (e.button == 0) {
	this.mouseDown_.left = false;
    } 
    else if (e.button == 1){
	this.this.mouseDown_.middle = false;
    }
    else if (e.button == 2){
	this.mouseDown_.right = false;
    }
}




/**
 * @private
 */
xiv.ui.ViewBoxInteractorHandler.prototype.onKey_ = function(e) {
    window.console.log('On key:', e.keyCode, this.dialogKeys_);

    // Arrow keys
    if ((e.keyCode - 40 >= -3) && (e.keyCode - 40 <= 0)){
	this.onArrowKey_(e.keyCode);
	return;
    }

    switch(e.keyCode){
    case 90:  // Z (Zoom)
	this.ViewBox_.fireToggleButton(this.constructor.TOGGLEABLE.TWODZOOM);	
	break;

    case 72: // H (hand)
    case 77: // P (pan)
	this.ViewBox_.fireToggleButton(this.constructor.TOGGLEABLE.TWODPAN);
	break;

    case 66: // L (levels)
    case 76: // B (brightness)
	this.ViewBox_.fireToggleButton(this.dialogKeys_['levels']);
	break;


    case 86: // V (Volumes)
	this.ViewBox_.fireToggleButton(this.dialogKeys_['volumes']);
	break;

    case 67: // C (Crosshairs)
	this.ViewBox_.fireToggleButton(this.constructor.TOGGLEABLE.CROSSHAIRS);
	break;

    case 83: // S (Settings)
	this.ViewBox_.fireToggleButton(this.constructor.TOGGLEABLE.SETTINGS);
	break;

    case 191: // ? (help)
	if (e.shiftKey){
	    this.ViewBox_.fireToggleButton(
		xiv.ui.ViewBoxDialogs.DIALOG_KEYS.HELP);
	}
	break;


    case 73: // I (info)
	this.ViewBox_.fireToggleButton(xiv.ui.ViewBoxDialogs.DIALOG_KEYS.INFO);
	break;
	
    }
}






/**
 * @param {!number}
 * @private
 */
xiv.ui.ViewBoxInteractorHandler.prototype.onArrowKey_ = function(key) {
    /**
      For reference:
      38 // UP ARROW
      39 // RIGHT ARROW
      40 // DOWN ARROW
      37 // LEFT ARROW
    */
    this.incrementFrameSlider_(this.currMouseRenderer_, 
			  (key == 40 || key == 37) ? -1 : 1);
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
    this.clearCursorStyle_();

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
 * @private
 * @param {!number} xDist
 * @param {!number} yDist
 */
xiv.ui.ViewBoxInteractorHandler.prototype.onRenderPlanePan_ = 
function(xDist, yDist){
    this.setCursorGrabbing_();
    this.currMouseRenderer_.getCamera().pan([xDist * -1, yDist * -1]);
    this.syncAllCrosshairs();
}



/**
 * @private
 */
xiv.ui.ViewBoxInteractorHandler.prototype.listenForMouseEvents_ = 
function() {

    //
    // Mouseover for every render plane
    //
    this.loopIR_(
    function(renderPlane, renderPlaneOr, planeInteractors, volume){
	//
	// MOUSEOVER -- (this one is a little different: we attach it to the 
	//               renderer instead of the canvas)
	//
	this.mouseEvents_.over[renderPlaneOr] = 
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
	this.mouseEvents_.out[renderPlaneOr] = 
	    goog.events.listen(renderCanv,  
			       goog.events.EventType.MOUSEOUT, 
			       this.onMouseOut_.bind(this))


	//
	// MOUSEDOWN
	//
	this.mouseEvents_.down[renderPlaneOr] = 
	    goog.events.listen(
		renderCanv, 
		goog.events.EventType.MOUSEDOWN, 
		this.onMouseDown_.bind(this))

	//
	// MOUSEUP
	//
	this.mouseEvents_.up[renderPlaneOr] = 
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
    this.loopIR_(
	function(renderPlane, renderPlaneOr, planeInteractors, volume){
		planeInteractors.SLIDER.setValue(
		    planeInteractors.SLIDER.getValue() + increment)
	}.bind(this), renderer.getOrientation())
}



/**
 * @param {!Function} callback
 * @param {string=} opt_orientation If not provided, then we loop all of the 
 *    planes.
 * @private
 */
xiv.ui.ViewBoxInteractorHandler.prototype.loopIR_ = 
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
	this.constructor.CSS.GENERIC_TOGGLE, 
	this.constructor.TOGGLEABLE.TWODZOOM,
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
		    this.constructor.TOGGLEABLE.TWODPAN);
		this.setCursorZoomIn_();
	    }

	}.bind(this), 
	serverRoot + 
	    '/images/viewer/xiv/ui/ViewBox/Toggle-2DZoom.png');

    this.ViewBox_.fireToggleButton(
	this.constructor.TOGGLEABLE.TWODZOOM);
}



/**
 * @public
 */
xiv.ui.ViewBoxInteractorHandler.prototype.createTwoDPanToggle = 
function(){    
    this.ViewBox_.createToggleButton(
	'LEFT', 
	this.constructor.CSS.GENERIC_TOGGLE, 
	this.constructor.TOGGLEABLE.TWODPAN,
	'2D Pan', 
	function(button){
	    this.clearCursorStyle_();
	    var checked = button.getAttribute('checked').toString() == 'true';
	    this.panning_ = checked;
	    if (checked){
		this.setCursorGrab_();
		this.ViewBox_.untoggle(
		    this.constructor.TOGGLEABLE.TWODZOOM);	
	    }
	}.bind(this), 
	serverRoot + '/images/viewer/xiv/ui/ViewBox/Toggle-2DPan.png');

    //this.panning_ = true;
    this.ViewBox_.fireToggleButton(this.constructor.TOGGLEABLE.TWODPAN);
}



/**
 * @param {boolean=} opt_isOn
 * @public
 */
xiv.ui.ViewBoxInteractorHandler.prototype.createCrosshairToggle = 
function(opt_isOn){
    this.ViewBox_.createToggleButton(
	'LEFT', 
	this.constructor.CSS.GENERIC_TOGGLE, 
	this.constructor.TOGGLEABLE.CROSSHAIRS,
	'Toggle Crosshairs', 
	function(button){
	    this.toggleCrosshairsVisible(
		(button.getAttribute('checked') == 'true'))
	}.bind(this), 
	serverRoot + 
	    '/images/viewer/xiv/ui/ViewBox/Toggle-Crosshairs.png');

    if (opt_isOn === false){
	this.ViewBox_.fireToggleButton(
	    this.constructor.TOGGLEABLE.CROSSHAIRS);
    }
}




/**
 * @public
 */
xiv.ui.ViewBoxInteractorHandler.prototype.createSettingsToggle = 
function(){    
    this.ViewBox_.createToggleButton(
	'LEFT', 
	this.constructor.CSS.GENERIC_TOGGLE, 
	this.constructor.TOGGLEABLE.SETTINGS,
	'Settings', 
	function(button){
	    window.console.log("Need to create dialog here");
	    //this.Renderer_.setVPlaneOn(
	    //(button.getAttribute('checked') == 'true'));
	}.bind(this), 
	serverRoot + 
	    '/images/viewer/xiv/ui/ViewBox/Toggle-Settings.png');

    this.ViewBox_.fireToggleButton(
	this.constructor.TOGGLEABLE.SETTINGS);
}



/**
 * @public
 */
xiv.ui.ViewBoxInteractorHandler.prototype.syncAllCrosshairs = function(){
    this.loopIR_(
	function(renderPlane, renderPlaneOr, planeInteractors, volume){
	    this.syncCrosshairsToVolume_(renderPlaneOr, volume);
	}.bind(this));
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
    this.loopIR_(
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
 * @private
 */
xiv.ui.ViewBoxInteractorHandler.prototype.setDialogEvents_ = function() {
    goog.events.listen(
	this.Dialogs_,
	xiv.ui.ViewBoxDialogs.EventType.DIALOG_OPENED, 
	this.onControllerDialogOpened_.bind(this));
}


/**
 * @param {xiv.ui.Dialogs.Event} e
 * @private
 */
xiv.ui.ViewBoxInteractorHandler.prototype.onControllerDialogOpened_ = 
function(e){

    if (!goog.isDefAndNotNull(e.dialogKey)){ return }
    //
    // Derive the key for referencing the various widgets
    //
    var typeKey = e.dialogKey.split(this.constructor.DIALOG_SPLIT)[0];

    //
    // Access the controls associated with the key
    //
    goog.object.forEach(this.viewableCtrls_[typeKey], function(ctrls, setKey){
	//
	// exit out if no ctrls
	//
	if (!goog.isDefAndNotNull(ctrls)) { return }

	//
	// Make sure zippy tree's slider is matched to the contents size
	//
	this.zippyTrees_[typeKey].mapSliderToContents();

	//
	// loop through all of the controls
	//
	goog.array.forEach(ctrls, function(ctrl){


	    //----------------------------------------
	    // IMPORTANT EXCEPTION!! 
	    //
	    // We only need to update the style of the level sliders 
	    // because LEVEL_MIN and LEVEL_MAX are often set to values 
	    // that go beyond the slider values.
	    //----------------------------------------
	    if (typeKey == 'levels' && 
		!(ctrl instanceof xiv.ui.ctrl.Histogram)){
		ctrl.getComponent().updateStyle();
		return;
	    } 
	    

	    //
	    // Selected volme radio button
	    //
	    else if (typeKey == 'volumes' && 
		(ctrl instanceof xiv.ui.ctrl.RadioButtonController)){
		ctrl.getComponent().checked =  
		    ctrl.getXObj()[xiv.vis.XtkEngine.SELECTED_VOL_KEY] 
		    || false;
		return;
	    }


	    //
	    // Hide the label map button
	    //
	    else if (typeKey == 'volumes' && 
		(ctrl.getLabel().innerHTML == 'Show Label Map')){

		window.console.log(ctrl.getElement(),
				  xiv.vis.XtkEngine.HAS_LABEL_MAP_KEY);

		if (!ctrl.getXObj()[xiv.vis.XtkEngine.HAS_LABEL_MAP_KEY]){
		    ctrl.getComponent().setEnabled(false);
		    ctrl.getLabel().style.opacity = .5;
		}
		this.zippyTrees_[typeKey].mapSliderToContents();
	    }
	    
	    //
	    // Update
	    //
	    ctrl.update();
	}.bind(this))
    }.bind(this))
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
    this.loopIR_(
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
    this.loopIR_(
    function(renderPlane, renderPlaneOr, planeInteractors){
	if (!planeInteractors.ZOOM_DISPLAY || !renderPlane.getRenderer()) { 
	    return 
	};

	var renderZoom = renderPlane.getRenderer().getZoom();
	var displayZoom = planeInteractors.ZOOM_DISPLAY.getValue() / 100;

	if (renderZoom < displayZoom && !this.mouseDown_.right) {
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
    this.loopIR_(
    function(renderPlane, renderPlaneOr, planeInteractors, volume){
	planeInteractors.SLIDER.setValue(frameDisplay.getValue()); 
    }.bind(this), frameDisplay[this.constructor.ORIENTATION_KEY]) 
}



/**
 * @private
 */
xiv.ui.ViewBoxInteractorHandler.prototype.setVolumeSlidersHalfway_ = 
function() {
    this.loopIR_(
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

    this.loopIR_(
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
    this.loopIR_(
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
    this.loopIR_(
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
    this.loopIR_(
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

    this.loopIR_(
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
 * @public
 */
xiv.ui.ViewBoxInteractorHandler.prototype.createViewableCtrls = 
function() {
    //
    // Get the controls
    //
    this.viewableCtrls_ = this.Renderer_.getControllerTree();

    //
    // Create the zippy trees
    //
    this.zippyTrees_ = xiv.ui.ctrl.XtkControllerTree.getEmptyPropertiesObject();
    this.dialogKeys_ = xiv.ui.ctrl.XtkControllerTree.getEmptyPropertiesObject();

    goog.object.forEach(this.zippyTrees_, function(tree, key){
	
	//
	//
	//
	this.zippyTrees_[key] = new nrg.ui.ScrollableZippyTree();
	this.zippyTrees_[key].render();

	//
	//
	//
	this.dialogKeys_[key] = key + 
	    this.constructor.DIALOG_SPLIT + goog.string.createUniqueString();
	
	goog.object.forEach(this.viewableCtrls_[key], function(ctrls, sKey){
	    if (!goog.isArray(ctrls)) { return }
	    goog.array.forEach(ctrls, function(ctrl){
		
		//
		//
		//
		var folders = ctrl.getFolders() || [];

		//
		//
		//
		if (sKey !== 'all' && folders.length > 0) {
		    folders.push(sKey)
		};

		//
		//
		//
		window.console.log('\n\n');
		//window.console.log(ctrl, ctrl.getElement(), folders);
		window.console.log(folders)
		this.zippyTrees_[key].addContents(ctrl.getElement(), folders);

	    }.bind(this))
	}.bind(this))	    
    }.bind(this))



    //
    // Create the dialogs
    //
    goog.object.forEach(this.zippyTrees_, function(ctrlSet, key){
	//
	// Only proceed if there are controls
	//
	var hasControls = false;
	goog.object.forEach(this.viewableCtrls_[key], function(ctrls, sKey){
	    //window.console.log(key, sKey, ctrls);
	    if (goog.isDefAndNotNull(ctrls) &&
		goog.isArray(ctrls) &&
		ctrls.length > 0) { hasControls = true };
	}.bind(this))
	if (!hasControls) { return }


	//
	// Create the dialog
	//
	this.Dialogs_.createGenericDialog(
	    this.dialogKeys_[key],
	    this.constructor.CSS.GENERIC_DIALOG,
	    this.constructor.CSS.GENERIC_TOGGLE,
	    serverRoot + '/images/viewer/xiv/ui/ViewBox/Toggle-' + 
		goog.string.toTitleCase(key) + '.png',
	    goog.string.toTitleCase(key),
	    false,
	    false
	);


	//
	// Zippy Trees
	//
	var ctrlTreeElt = this.zippyTrees_[key].getElement();
	goog.dom.classes.add(ctrlTreeElt, 
			     this.constructor.CSS.GENERIC_ZIPPYTREE);
	this.Dialogs_.getDialogs()[this.dialogKeys_[key]].
	    getElement().appendChild(ctrlTreeElt);
	this.zippyTrees_[key].expandAll();
    }.bind(this))

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
    
    if (goog.isDefAndNotNull(this.keyHandler_)){
	this.keyHandler_.dispose();
	delete this.keyHandler_;
    }


    if (goog.isDefAndNotNull(this.dialogKeys_)){
	goog.object.clear(this.dialogKeys_);
    }
    delete this.dialogKeys_;



    if (goog.isDefAndNotNull(this.zippyTrees_)){
	goog.object.forEach(this.zippyTrees_, function(tree){
	    tree.dispose();
	})
	goog.object.clear(this.zippyTrees_);
    }
    delete this.zippyTrees_;



    //
    // Mouse XY
    //
    goog.object.clear(this.mouseXY_);
    delete this.mouseXY_;


    //
    // Mouse events  
    //    
    goog.object.forEach(this.mouseEvents_, function(mouseKeyObj){
	goog.objectForEach(mouseKeyObj, function(mouseKey){
	    goog.events.unlisten(mouseKey);
	    delete mouseKey;
	})
	goog.object.clear(mouseKeyObj);
    })
    goog.object.clear(this.mouseEvents_);
    delete this.mouseEvents_();


    goog.dom.removeNode(this.zoomFollower_);
    delete this.zoomFollower_;


    delete this.viewableCtrls_;
    delete this.zooming_;
    delete this.panning_;


    delete this.ViewBox_;
    delete this.Renderer_;
    delete this.LayoutHandler_;
    delete this.Dialogs_;
}



goog.exportSymbol('xiv.ui.ViewBoxInteractorHandler.ORIENTATION_KEY', 
		  xiv.ui.ViewBoxInteractorHandler.ORIENTATION_KEY);
