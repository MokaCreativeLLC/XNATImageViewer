/**
 * @author kumar.sunil.p@gmail.com (Sunil Kumar)
 */
goog.provide('xiv.ui.ViewBoxInteractorHandler');

// goog
goog.require('goog.events.EventTarget');
goog.require('goog.math.Vec2');
goog.require('goog.events.Key');
goog.require('goog.dom');
goog.require('goog.dom.classes');
goog.require('goog.events');
goog.require('goog.string');
goog.require('goog.events.KeyHandler');
goog.require('goog.events.Event');
goog.require('goog.events.EventType');
goog.require('goog.object');
goog.require('goog.array');

// X
goog.require('X.volume');

// nrg
goog.require('nrg.fx');
goog.require('nrg.ui.ScrollableZippyTree');
goog.require('nrg.ui.Slider');
goog.require('nrg.ui.SlideInMenu');
goog.require('nrg.ui.ZippyNode');
goog.require('nrg.ui.Dialog');

// xiv
goog.require('xiv.vis.RenderEngine');
goog.require('xiv.vis.XtkRenderer2D');
goog.require('xiv.vis.XtkEngine');
goog.require('xiv.ui.ViewBoxDialogs');
goog.require('xiv.ui.XtkController');
goog.require('xiv.ui.CheckboxController');
goog.require('xiv.ui.Histogram');
goog.require('xiv.ui.RadioButtonController');
goog.require('xiv.ui.layouts.Layout');
goog.require('xiv.ui.layouts.LayoutHandler');
goog.require('nrg.ui.HoverInput');
goog.require('xiv.ui.ZoomDisplay');
goog.require('xiv.ui.FrameDisplay');
goog.require('xiv.ui.layouts.Sagittal');
goog.require('xiv.ui.layouts.Coronal');
goog.require('xiv.ui.layouts.Transverse');
goog.require('xiv.ui.layouts.ThreeD');
goog.require('xiv.ui.layouts.Conventional');
goog.require('xiv.ui.layouts.FourUp');
goog.require('xiv.ui.layouts.TwoDRow');
goog.require('xiv.ui.layouts.TwoDWidescreen');
goog.require('xiv.ui.XtkControllerTree');
goog.require('xiv.ui.LevelsController');
//-----------



/**
 * @constructor
 * @type {!xiv.ui.ViewBox}
 * @type {!xiv.vis.RenderEngine} Renderer
 * @type {!xiv.ui.layout.LayoutHandler} LayoutHandler
 * @type {!xiv.ui.ViewBoxDialogs} Dialogs
 * @extends {goog.events.EventTarget}
 */
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
	'p': null,
	'c': null,
    } 


    /**
     * @private
     * @type {Object.<string, number>}
     */
    this.currMouse_ = {
	x: null,
	y: null,
    } 


    /**
     * @private
     * @type {Object.<string, ?boolean>}
     */
    this.mouseDown_ = {
	'l': false,
	'm': false,
	'r': false
    } 


    /**
     * @private
     * @type {Object.<string, Object.<string, goog.events.Key>>}
     */
    this.mouseEvents_ = {
	'up': {},
	'dn': {},
	'ot': {},
	'ov': {}
    } 	

    //
    // Set dialog events
    //
    this.setDialogEvents_();

    //
    // Listen for key events
    //
    this.listenForKeyboardEvents_();


    /**
     * @private
     * @type {!boolean}
     */
    this.useZoomFollower_ = false;

    //
    // Create the zoom follower
    //
    if (this.useZoomFollower_){
	this.createZoomFollower_();
    }


    //
    // Sadly, we have to globaly listen for this.
    //
    document.addEventListener('mousemove', 
			      this.storeCurrentMouse_.bind(this), false);
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
 * @expose
 */
xiv.ui.ViewBoxInteractorHandler.CSS = {
    GENERIC_TOGGLE: 'xiv-ui-viewboxinteractorhandler-generic-toggle',
    GENERIC_DIALOG: 'xiv-ui-viewboxinteractorhandler-generic-dialog',
    GENERIC_ZIPPYTREE: 
    'xiv-ui-viewboxinteractorhandler-generic-zippytree',

    LEVELS_DIALOG: 
    'xiv-ui-viewboxinteractorhandler-levelsdialog',
    LEVELS_DIALOG_HOVERED: 
    'xiv-ui-viewboxinteractorhandler-levelsdialog-hovered',
    LEVELS_SLIDER: 'xiv-ui-viewboxinteractorhandler-levels-slider',
    LEVELS_SLIDERCONTROLLER: 
    'xiv-ui-viewboxinteractorhandler-levels-slidercontroller',
    LEVELS_SLIDERLABEL: 'xiv-ui-viewboxinteractorhandler-levels-sliderlabel',
    LEVELS_CHECKBOXHOLDER: 
    'xiv-ui-viewboxinteractorhandler-levels-checkboxholder',
    LEVELS_CHECKBOXCONTROLLER: 
    'xiv-ui-viewboxinteractorhandler-levels-checkboxcontroller',
}



/**
 * @enum {string}
 * @expose
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
 * @type {?xiv.ui.LevelsController.ControllerSet}
 * @private
 */
xiv.ui.ViewBoxInteractorHandler.prototype.levels_ = null;



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
 * @private
 * @type {Array.<xiv.ui.XtkController>}
 */
xiv.ui.ViewBoxInteractorHandler.prototype.volumeToggles_;




/**
 * @param {!string} key
 * @return {string}
 * @public
 */
xiv.ui.ViewBoxInteractorHandler.prototype.getDialogKey = function(key){
    return this.dialogKeys_[key];
};




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
    // Set volume sliders halfway
    //
    this.adjustToPredefinedSliceIndices_();


    //
    // Create 3D rendering toggle
    //
    this.createSettingsDialog();

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
    goog.object.forEach(xiv.ui.ViewBoxInteractorHandler.CURSOR_CSS, 
			function(css, key){
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
    this.setCursorCss_(
	true, xiv.ui.ViewBoxInteractorHandler.CURSOR_CSS.GRAB,
	xiv.ui.ViewBoxInteractorHandler.CURSOR_CSS.GRAB_CUSTOM);
    this.setCursorCss_(
	false, xiv.ui.ViewBoxInteractorHandler.CURSOR_CSS.GRABBING,
	xiv.ui.ViewBoxInteractorHandler.CURSOR_CSS.GRABBING_CUSTOM);
}



/**
 * @private
 * @param {goog.events.Event} e
 */
xiv.ui.ViewBoxInteractorHandler.prototype.setCursorGrabbing_ = function(e) {
    this.setCursorCss_(false, xiv.ui.ViewBoxInteractorHandler.CURSOR_CSS.GRAB,
		       xiv.ui.ViewBoxInteractorHandler.CURSOR_CSS.GRAB_CUSTOM);
    this.setCursorCss_(
	true, 
	xiv.ui.ViewBoxInteractorHandler.CURSOR_CSS.GRABBING,
	xiv.ui.ViewBoxInteractorHandler.CURSOR_CSS.GRABBING_CUSTOM);
}




/**
 * @private
 * @param {goog.events.Event} e
 */
xiv.ui.ViewBoxInteractorHandler.prototype.setCursorZoomIn_ = function(e) {
    this.setCursorCss_(false, 
		       xiv.ui.ViewBoxInteractorHandler.CURSOR_CSS.ZOOM_OUT);
    this.setCursorCss_(true, 
		       xiv.ui.ViewBoxInteractorHandler.CURSOR_CSS.ZOOM_IN);
}



/**
 * @private
 * @param {goog.events.Event} e
 */
xiv.ui.ViewBoxInteractorHandler.prototype.setCursorZoomOut_ = function(e) {
    this.setCursorCss_(true, 
		       xiv.ui.ViewBoxInteractorHandler.CURSOR_CSS.ZOOM_OUT);
    this.setCursorCss_(false, 
		       xiv.ui.ViewBoxInteractorHandler.CURSOR_CSS.ZOOM_IN);
}



/**
 * @private
 * @param {goog.events.Event} e
 */
xiv.ui.ViewBoxInteractorHandler.prototype.storeCurrentMouse_ = function(e){
    this.currMouse_.x = e.clientX || e.pageX; 
    this.currMouse_.y = e.clientY || e.pageY 
    //window.console.log('curr mouse', this.currMouse_);
};



/**
 * @private
 * @param {goog.events.Event} e
 */
xiv.ui.ViewBoxInteractorHandler.prototype.onMouseOver_ = function(e) {

    //
    // Store the plane being hovered over
    //
    this.currMouseRenderer_ = e.target;
    /*
    window.console.log('onMouseEnter_', 
		       this.currMouseRenderer_.getOrientation(), 
		       e);
		       */
    //
    // Store the mouse positions
    //
    this.mouseXY_['p'] = this.mouseXY_['c'];
    this.mouseXY_['c'] = [this.currMouse_.x, this.currMouse_.y];


    //
    // Do nothing if no previous mouse position
    //
    if (this.mouseXY_['p'] == null) {return}

    //
    // run calculations
    //
    var mouseVec = 
	(new goog.math.Vec2(this.mouseXY_['c'][0], 
			    this.mouseXY_['c'][1])).add(
				new goog.math.Vec2(this.mouseXY_['p'][0], 
						   this.mouseXY_['p'][1]));
    var mouseDist = Math.sqrt(
	Math.pow(this.mouseXY_['c'][0] - this.mouseXY_['p'][0], 2) + 
	    Math.pow(this.mouseXY_['c'][1] - this.mouseXY_['p'][1], 2)); 

    var xDist = this.mouseXY_['c'][0] - this.mouseXY_['p'][0];
    var yDist = this.mouseXY_['c'][1] - this.mouseXY_['p'][1];

    //window.console.log("vbih zooming?", this.zooming_);
    //window.console.log("vbih mousedown-right", this.mouseDown_['r']);
    //window.console.log("vbih mousedown-left", this.mouseDown_['l']);

    if (this.useZoomFollower_){
	this.zoomFollower_.style.visibility = 'hidden';
    }

    //window.console.log('vbih: Zooming?', this.zooming_);
    //
    // ZOOM
    //
    if (this.zooming_){
	if (this.useZoomFollower_){
	    this.updateZoomFollower_();
	}
	this.setCursorZoomIn_();	
	if (this.mouseDown_['l']){
	    this.onRenderPlaneZoom_(xDist, yDist);
	}
    }

    //
    // PAN
    //
    else if (this.panning_) {
	this.setCursorGrab_();

	//window.console.log(this.mouseDown_);
	if (this.mouseDown_['l']) {	
	    this.onRenderPlanePan_(xDist, yDist);
	}
    }
} 



/**
 * @private
 * @param {goog.events.Event} e
 */
xiv.ui.ViewBoxInteractorHandler.prototype.onMouseLeave_ = function(e) {
    this.clearCursorStyle_();
    this.currMouseRenderer_ = null;
    if (this.useZoomFollower_){
	this.zoomFollower_.style.visibility = 'hidden';
    }
} 



/**
 * @private
 * @param {goog.events.Event} e
 */
xiv.ui.ViewBoxInteractorHandler.prototype.onMouseDown_ = function(e) {
    if (e.button == 0) {
	this.mouseDown_['l'] = true;
    } 
    else if (e.button == 1){
	this.this.mouseDown_['m'] = true;
    }
    else if (e.button == 2){
	this.mouseDown_['r'] = true;
    }
    //window.console.log("DOWN", e, this.mouseDown_['l'], this.mouseDown_['r']);
}



/**
 * @private
 * @param {goog.events.Event} e
 */
xiv.ui.ViewBoxInteractorHandler.prototype.onMouseUp_ = function(e) {
    if (e.button == 0) {
	this.mouseDown_['l'] = false;
    } 
    else if (e.button == 1){
	this.this.mouseDown_['m'] = false;
    }
    else if (e.button == 2){
	this.mouseDown_['r'] = false;
    }
}




/**
 * @param {Event} event
 * @private
 */
xiv.ui.ViewBoxInteractorHandler.prototype.onKey_ = function(e) {
    window.console.log('On key:', e.keyCode, this.dialogKeys_);
    //window.console.log("IS MOUSE OVER", this.isMouseOverViewBox_);
    if (!this.ViewBox_.isMouseOver()) { return }

    // Arrow keys
    if ((e.keyCode - 40 >= -3) && (e.keyCode - 40 <= 0)){
	this.onArrowKey_(e.keyCode);
	return;
    }

    switch(e.keyCode){

    case 27:  // Esc

	//
	// Toggle off hand
	//
	var pan = 
	    this.ViewBox_.getToggleButton(
		xiv.ui.ViewBoxInteractorHandler.TOGGLEABLE.TWODPAN);

	window.console.log('escape', 
			   'pan', 
			   pan,
			   pan.getAttribute('checked'));

	
	if (pan.getAttribute('checked').toString() == 'true'){
	    this.ViewBox_.fireToggleButton(
		xiv.ui.ViewBoxInteractorHandler.TOGGLEABLE.TWODPAN);
	}

	//
	// Toggle off zoom
	//
	var twoDZoom = 
	    this.ViewBox_.getToggleButton(
		xiv.ui.ViewBoxInteractorHandler.TOGGLEABLE.TWODZOOM);
	if (twoDZoom.getAttribute('checked').toString() == 'true'){
	    this.ViewBox_.fireToggleButton(
		xiv.ui.ViewBoxInteractorHandler.TOGGLEABLE.TWODZOOM);
	}
	//window.console.log(pan.getAttribute('checked'), 
	//		   twoDZoom.getAttribute('checked'), 
	//		   pan.checked == 'true',
	//		   twoDZoom.checked == 'true');


	break;


    case 90:  // Z (Zoom)
	this.ViewBox_.fireToggleButton(
	    xiv.ui.ViewBoxInteractorHandler.TOGGLEABLE.TWODZOOM);	
	break;

    case 72: // H (hand)
    case 80: // P (pan)
	//window.console.log('\n\nfire pan');
	this.ViewBox_.fireToggleButton(
	    xiv.ui.ViewBoxInteractorHandler.TOGGLEABLE.TWODPAN);
	break;

    case 66: // L (levels)
    case 76: // B (brightness)
	this.ViewBox_.fireToggleButton(this.dialogKeys_['levels']);
	break;


    case 86: // V (Volumes)
	//window.console.log("VOLUME FIRE", e.keyCode);
	this.ViewBox_.fireToggleButton(this.dialogKeys_['volumes']);
	break;

    case 77: // M (Meshes)
	this.ViewBox_.fireToggleButton(this.dialogKeys_['meshes']);
	break;


    case 65: // A (Annotations)
	this.ViewBox_.fireToggleButton(this.dialogKeys_['annotations']);
	break;

    case 67: // C (Crosshairs)
	this.ViewBox_.fireToggleButton(
	    xiv.ui.ViewBoxInteractorHandler.TOGGLEABLE.CROSSHAIRS);
	break;

    case 83: // S (Settings)
	this.ViewBox_.fireToggleButton(
	    this.dialogKeys_[
		xiv.ui.ViewBoxInteractorHandler.TOGGLEABLE.SETTINGS]);
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
 * @type {!number}
 * @private
 */
xiv.ui.ViewBoxInteractorHandler.prototype.MouseX_ = 0;



/**
 * @type {!number}
 * @private
 */
xiv.ui.ViewBoxInteractorHandler.prototype.MouseY_ = 0;



/**
 * @private
 */
xiv.ui.ViewBoxInteractorHandler.prototype.storeMouseCoords_ = function(e){
    this.MouseX_ = e.clientX;
    this.MouseY_ = e.clientY;
    window.console.log("store mouse coords", this.MouseX_, this.MouseY_);
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

	//window.console.log("MOUSEOVER LISTEN", 
	//goog.events.EventType.MOUSEOVER);
	//
	// MOUSEOVER -- (this one is a little different: we attach it to the 
	//               renderer instead of the canvas)
	//
	this.mouseEvents_['ov'][renderPlaneOr] = 
	    goog.events.listen(
		renderPlane.getRenderer(), 
		goog.events.EventType.MOUSEOVER, 
		this.onMouseOver_.bind(this))

	//
	// MOUSEOVER2 -- (this one is a little different: we attach it to the 
	//               renderer instead of the canvas)
	//
	/**
	goog.events.listen(document.body, 
			   goog.events.EventType.MOUSEOVER,
			   this.storeMouseCoords_.bind(this));
			   */


	//
	// Get the cavas
	//
	var renderCanv = renderPlane.getRenderer().getCanvas();


	//
	// MOUSELEAVE
	//
	this.mouseEvents_['ot'][renderPlaneOr] = 
	    goog.events.listen(renderCanv,  
			       goog.events.EventType.MOUSELEAVE, 
			       this.onMouseLeave_.bind(this))


	//
	// MOUSEDOWN
	//
	this.mouseEvents_['dn'][renderPlaneOr] = 
	    goog.events.listen(
		renderCanv, 
		goog.events.EventType.MOUSEDOWN, 
		this.onMouseDown_.bind(this))

	//
	// MOUSEUP
	//
	this.mouseEvents_['up'][renderPlaneOr] = 
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
	xiv.ui.ViewBoxInteractorHandler.CSS.GENERIC_TOGGLE, 
	xiv.ui.ViewBoxInteractorHandler.TOGGLEABLE.TWODZOOM,
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
		    xiv.ui.ViewBoxInteractorHandler.TOGGLEABLE.TWODPAN);
		this.setCursorZoomIn_();
	    }

	}.bind(this), 
	serverRoot + 
	    '/images/viewer/xiv/ui/ViewBox/Toggle-2DZoom.png');

    this.ViewBox_.fireToggleButton(
	xiv.ui.ViewBoxInteractorHandler.TOGGLEABLE.TWODZOOM);
}



/**
 * @public
 */
xiv.ui.ViewBoxInteractorHandler.prototype.createTwoDPanToggle = 
function(){    
    this.ViewBox_.createToggleButton(
	'LEFT', 
	xiv.ui.ViewBoxInteractorHandler.CSS.GENERIC_TOGGLE, 
	xiv.ui.ViewBoxInteractorHandler.TOGGLEABLE.TWODPAN,
	'2D Pan', 
	function(button){
	    this.clearCursorStyle_();
	    var checked = button.getAttribute('checked').toString() == 'true';
	    this.panning_ = checked;
	    if (checked){
		this.setCursorGrab_();
		this.ViewBox_.untoggle(
		    xiv.ui.ViewBoxInteractorHandler.TOGGLEABLE.TWODZOOM);	
	    }
	}.bind(this), 
	serverRoot + '/images/viewer/xiv/ui/ViewBox/Toggle-2DPan.png');

    //this.panning_ = true;
    this.ViewBox_.fireToggleButton(xiv.ui.ViewBoxInteractorHandler.TOGGLEABLE.TWODPAN);
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
	xiv.ui.ViewBoxInteractorHandler.TOGGLEABLE.CROSSHAIRS,
	'Toggle Crosshairs', 
	function(button){
	    this.toggleCrosshairsVisible(
		(button.getAttribute('checked') == 'true'))
	}.bind(this), 
	serverRoot + 
	    '/images/viewer/xiv/ui/ViewBox/Toggle-Crosshairs.png');

    if (opt_isOn === false){
	this.ViewBox_.fireToggleButton(
	    xiv.ui.ViewBoxInteractorHandler.TOGGLEABLE.CROSSHAIRS);
    }
}




/**
 * @public
 */
xiv.ui.ViewBoxInteractorHandler.prototype.createSettingsDialog = 
function(){    

    var key = xiv.ui.ViewBoxInteractorHandler.TOGGLEABLE.SETTINGS;

    this.dialogKeys_[key]  = key + 
	    xiv.ui.ViewBoxInteractorHandler.DIALOG_SPLIT + 
	goog.string.createUniqueString();


    //
    // Create the dialog
    //
    this.Dialogs_.createGenericToggleableDialog(
	this.dialogKeys_[key],
	xiv.ui.ViewBoxInteractorHandler.CSS.GENERIC_DIALOG,
	xiv.ui.ViewBoxInteractorHandler.CSS.GENERIC_TOGGLE,
	serverRoot + '/images/viewer/xiv/ui/ViewBox/Toggle-' + 
	    'Settings' + '.png',
	'Settings',
	false,
	false
    );


    this.zippyTrees_[key] = new nrg.ui.ScrollableZippyTree();
    this.zippyTrees_[key].render();
    //window.console.log(this.zippyTrees_[key].getElement());

    //
    // Zippy Trees
    //
    var ctrlTreeElt = this.zippyTrees_[key].getElement();
    goog.dom.classes.add(ctrlTreeElt, 
			 xiv.ui.ViewBoxInteractorHandler.CSS.GENERIC_ZIPPYTREE);
    this.Dialogs_.getDialogs()[this.dialogKeys_[key]].
	getElement().appendChild(ctrlTreeElt);

    this.zippyTrees_[key].expandAll();
    



    // create
    var controller = new xiv.ui.CheckboxController();
    controller.render();

    // set label
    controller.setLabel('Enable 3D Rendering');
    controller.getComponent().setChecked(true);

    this.zippyTrees_[key].addContents(controller.getElement(), '3D Rendering');

    // set events

    goog.events.listen(controller, 
		       xiv.ui.XtkController.EventType.CHANGE, 
		       function(e){
			   this.Renderer_.setPlaneEnabled('V', e.checked);
		       }.bind(this))
    


    return controller;
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
	slider[xiv.ui.ViewBoxInteractorHandler.ORIENTATION_KEY] = renderPlaneOr;
	frameDisplay[xiv.ui.ViewBoxInteractorHandler.ORIENTATION_KEY] = 
	    renderPlaneOr;
	zoomDisplay[xiv.ui.ViewBoxInteractorHandler.ORIENTATION_KEY] = 
	    renderPlaneOr;
	crosshairs[xiv.ui.ViewBoxInteractorHandler.ORIENTATION_KEY] = 
	    renderPlaneOr;

	//
	// Preliminary sync
	//
	this.syncSlidersToVolume_(true);
	this.syncPlayButtonsToSlider_(true);
	this.syncVolumeToSlider_(slider, volume);
	this.syncCrosshairsToVolume_(
	    slider[xiv.ui.ViewBoxInteractorHandler.ORIENTATION_KEY],
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
	goog.events.listen(slider, nrg.ui.Slider.EventType.CHANGE, 
        function(e){
	    //window.console.log(volume);
	    this.syncVolumeToSlider_(e.target, volume);
	    this.syncCrosshairsToVolume_(
		e.target[xiv.ui.ViewBoxInteractorHandler.ORIENTATION_KEY],
		volume);
	    this.syncFrameDisplayToSlider_(e.target, volume);
	}.bind(this))

	//
	// Change Slice on Frame Display input
	//
	goog.events.listen(frameDisplay, 
		nrg.ui.HoverInput.EventType.INPUT,
		function(e){
		    this.syncSliderToFrameDisplay_(e.target,volume);
		    this.syncAllCrosshairs();
		}.bind(this))


	//
	// Change Slice on Frame Display input
	//
	goog.events.listen(zoomDisplay, 
		nrg.ui.HoverInput.EventType.INPUT,
		function(e){
		    this.syncRendererToZoomDisplay_(zoomDisplay, 
						   renderPlane);
		    this.syncAllCrosshairs();
		}.bind(this))
    }.bind(this))



    //
    // Update the controllers in the renderer
    //
    this.Renderer_.refreshControllers();
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
 * @param {xiv.ui.XtkController} ctrl
 * @private
 */
xiv.ui.ViewBoxInteractorHandler.prototype.updateLevelControllers_ = 
function(ctrl){
    //----------------------------------------
    // IMPORTANT EXCEPTION!! 
    //
    // We only need to update the style of the level sliders 
    // because LEVEL_MIN and LEVEL_MAX are often set to values 
    // that go beyond the slider values.
    //----------------------------------------

    this.viewableCtrls_.getLevelsController().updateAll();
}




/**
 * @param {!xiv.ui.XtkController} ctrl
 * @param {!string} typeKey
 * @private
 */
xiv.ui.ViewBoxInteractorHandler.prototype.updateVolumeToggle_ = 
function(ctrl, typeKey){

    ctrl.getComponent().checked = 
	ctrl.getXObj()[xiv.vis.RenderEngine.SELECTED_VOL_KEY] 
	|| false;

    if (!goog.isDefAndNotNull(this.volumeToggles_)){
	this.volumeToggles_ = [];
    }

    if (this.volumeToggles_.indexOf(ctrl) == -1){
	this.volumeToggles_.push(ctrl);
    }
}





/**
 * @param {!xiv.ui.XtkController} ctrl
 * @param {!string} typeKey
 * @private
 */
xiv.ui.ViewBoxInteractorHandler.prototype.updateLabelMapToggle_ = 
function(ctrl, typeKey){
    //window.console.log('labelmap', ctrl.getElement(),
    //		  xiv.vis.XtkEngine.HAS_LABEL_MAP_KEY);

    if (!ctrl.getXObj()[xiv.vis.XtkEngine.HAS_LABEL_MAP_KEY]){
	goog.dom.removeNode(ctrl.getElement());
	
	ctrl.getElement().style.visibility = 'hidden';
	ctrl.getElement().style.height = '0px';
    } 
    else if (ctrl.getXObj()['labelmap']['visible'] &&
	     !ctrl.getComponent().isChecked()){
	ctrl.getComponent().setChecked(true);
    }

    this.zippyTrees_[typeKey].mapSliderToContents();
}




/**
 * @param {!xiv.ui.XtkController} ctrl
 * @param {!string} key
 * @private
 */
xiv.ui.ViewBoxInteractorHandler.prototype.updateVolumeControllers_ = 
    function(ctrl, key){
	var typeKey = key.split(xiv.ui.ViewBoxInteractorHandler.DIALOG_SPLIT)[0];
	if (ctrl instanceof xiv.ui.RadioButtonController){
	    this.updateVolumeToggle_(ctrl, typeKey);
	}
	else if (ctrl.getLabel().innerHTML == 'Show Label Map'){
	    this.updateLabelMapToggle_(ctrl, typeKey);
	}
	ctrl.refresh();
    }



/**
 * @param {!xiv.ui.XtkController} ctrl
 * @param {!string} key
 * @private
 */
xiv.ui.ViewBoxInteractorHandler.prototype.updateAnnotationsControllers_ = 
    function(ctrl, key){
	//window.console.log("\n\nUPDATE ANNOT");
	if (ctrl instanceof xiv.ui.SliderController){
	    window.console.log("ANNOT", ctrl)
	    ctrl.updateStyle();
	}
    }



/**
 * @param {!xiv.ui.XtkController} ctrl
 * @param {!string} key
 * @private
 */
xiv.ui.ViewBoxInteractorHandler.prototype.updateMeshControllers_ = 
    function(ctrl, key){
	//window.console.log("\n\nUPDATE MESH");
	if (ctrl instanceof xiv.ui.SliderController){
	    //window.console.log("MESH", ctrl)
	    ctrl.updateStyle();
	}
    }


/**
 * @param {!string} key
 * @param {!string} typeKey
 * @private
 */
xiv.ui.ViewBoxInteractorHandler.prototype.refreshControllers_ = function(key){
    // Derive the type key
    var typeKey = key.split(xiv.ui.ViewBoxInteractorHandler.DIALOG_SPLIT)[0];

    // Exit out if we don't have a valid key
    //window.console.log(typeKey, key);
    if (!goog.isDefAndNotNull(this.zippyTrees_[typeKey])){ return }

    this.zippyTrees_[typeKey].mapSliderToContents();


    this.viewableCtrls_.getLevelsController().refresh();



    // Update the controls
    goog.object.forEach(this.viewableCtrls_[typeKey], function(ctrls, setKey){
	if (!goog.isDefAndNotNull(ctrls)) { return }

	goog.array.forEach(ctrls, function(ctrl){
	    //window.console.log("TYPE KEY", typeKey);
	    switch(typeKey.toLowerCase()){
	    case 'volumes':
		this.updateVolumeControllers_(ctrl, key);
		break;
	    case 'meshes':
		this.updateMeshControllers_(ctrl, key);
		break;
	    case 'annotations':
		this.updateAnnotationsControllers_(ctrl, key);
		break;
	    } 

	}.bind(this))
    }.bind(this))
}




/**
 * @param {?xiv.ui.Dialogs.Event} e
 * @param {string=} opt_dialogKey
 * @private
 */
xiv.ui.ViewBoxInteractorHandler.prototype.onControllerDialogOpened_ = 
function(e, opt_dialogKey){
    if (!goog.isDefAndNotNull(e.dialogKey) &&
	!goog.isDefAndNotNull(opt_dialogKey)){ return }
    var key = goog.isDefAndNotNull(opt_dialogKey) ? opt_dialogKey : e.dialogKey;

    //
    // Refresh controllers
    //
    this.refreshControllers_(key);
}



/**
 * @public
 */
xiv.ui.ViewBoxInteractorHandler.prototype.applyAutoLevel = function(){
    //
    // Performs the initial auto-level
    //
    var levelMaxVal = this.levels_.histogram.getLevelByPixelThreshold(
	xiv.ui.Histogram.LEVEL_CUTOFF);
    this.levels_.max.setDefaultValue(levelMaxVal);
    this.levels_.min.setDefaultValue(0);

    //window.console.log("\n\nLEVEL MAX", levelMaxVal);
    this.levels_.min.setValue(0);
    this.levels_.max.setValue(levelMaxVal);

    this.viewableCtrls_.getLevelsController().toggleVisiblePixelRange();
    this.levels_.histogram.refresh();

    this.Dialogs_.getDialogs()[this.dialogKeys_['levels']];
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
    var orientation = slider[xiv.ui.ViewBoxInteractorHandler.ORIENTATION_KEY];
    var adder = (orientation == 'Y' || orientation == 'Z') ? 
	slider.getMaximum() - slider.getValue() - 1 : slider.getValue() - 1;

    if (volume['reslicing'].toString() == 'false'){
	if (volume[X.volume.ORIENTATION_KEY] == 'transverse' &&
	    orientation == 'Z'){
	    adder += 2;
	}
	else if (volume[X.volume.ORIENTATION_KEY] == 'coronal' &&
	    orientation == 'Y'){
	    adder += 2;
	}
	else if (volume[X.volume.ORIENTATION_KEY] == 'sagittal' &&
	    orientation == 'X'){
	    adder += 1;
	}
	//window.console.log('adder', adder);
    }
    //
    // Set the volume index
    // 
    volume['index' + 
	   slider[xiv.ui.ViewBoxInteractorHandler.ORIENTATION_KEY]] = adder;
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
	frameDisplay.setMinimum(1);
	frameDisplay.setValue(slider.getValue());  
    }.bind(this), slider[xiv.ui.ViewBoxInteractorHandler.ORIENTATION_KEY])
}



/**
 * @param {!xiv.ui.ZoomDisplay} zoomDisplay
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

	planeInteractors.ZOOM_DISPLAY.setValue(
	    Math.round(renderZoom * 100));
	
	
    }.bind(this))
}



/**
 * @param {!xiv.ui.FrameDisplay} frameDisplay
 * @param {X.volume} volume
 * @private
 */
xiv.ui.ViewBoxInteractorHandler.prototype.syncSliderToFrameDisplay_ = 
function(frameDisplay, volume) {
    if (!goog.isDefAndNotNull(volume)) return;
    this.loopIR_(
    function(renderPlane, renderPlaneOr, planeInteractors, volume){
	planeInteractors.SLIDER.setValue(frameDisplay.getValue()); 
    }.bind(this), frameDisplay[xiv.ui.ViewBoxInteractorHandler.ORIENTATION_KEY]) 
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
 * @private
 */
xiv.ui.ViewBoxInteractorHandler.prototype.adjustToPredefinedSliceIndices_ =
function(){
    this.loopIR_(
    function(renderPlane, renderPlaneOr, planeInteractors, volume){
	if (goog.isDefAndNotNull(volume[xiv.vis.XtkEngine.SLICE_TO_RAS_KEY])) { 

	    if (!goog.isDefAndNotNull(planeInteractors.SLIDER)) { 
		return; 
	    };
	    slider = planeInteractors.SLIDER;
	    orientation = slider[xiv.ui.ViewBoxInteractorHandler.ORIENTATION_KEY];

	    //
	    // Params
	    //
	    var bbox = volume['bbox'];
	    //var range = volume['range'];
	    //window.console.log('\n\nRANGE', range);
	    var sliceToRAS = volume[xiv.vis.XtkEngine.SLICE_TO_RAS_KEY];
	    var range, slicePct;

	    //
	    // Adjust orientation by plane
	    //
	    if (orientation == 'X'){
		range = bbox[1] - bbox[0];
		slicePct = 
		    (sliceToRAS.sagittalSliceCenter[0] - bbox[0]) / range;
	    }
	    else if (orientation == 'Y'){
		range = bbox[3] - bbox[2];
		slicePct = 
		    (sliceToRAS.coronalSliceCenter[1] - bbox[2]) / range;
	    }
	    else if (orientation == 'Z'){
		range = bbox[5] - bbox[4];
		slicePct = 
		    (sliceToRAS.axialSliceCenter[2] - bbox[4]) / range;
	    }

	    //
	    // Set the slider value
	    //
	    slider.setValue(Math.round(slider.getMaximum() * slicePct) + 1);
	}
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
	orientation = slider[xiv.ui.ViewBoxInteractorHandler.ORIENTATION_KEY];

	//
	// Exit if no volume
	//
	if (!goog.isDefAndNotNull(volume)) { return };
	if (opt_resetMaximum === true) {
	    slider.setMaximum(renderPlane.getRenderer().getNumberSlices());
	    slider.setMinimum(1);
	}

	//window.console.log(volume, orientation);
	//window.console.log(orientation);
	//window.console.log(volume['index' + orientation]);
	if (goog.isDefAndNotNull(orientation)){
	    slider.setValue(volume['index' + orientation] + 1);
	}
    })
}




/**
 * @private
 */
xiv.ui.ViewBoxInteractorHandler.prototype.syncPlayButtonsToSlider_ = 
function() {

    var orientation;
    var currVol;
    var slider;

    this.loopIR_(
    function(renderPlane, renderPlaneOr, planeInteractors, volume){
	if (!goog.isDefAndNotNull(planeInteractors.SLIDER)) { 
	    return; 
	};

	
	slider = planeInteractors.SLIDER;
	playbutton = planeInteractors.PLAY_BUTTON;
	//window.console.log("PLAY BUTTON", playbutton);
	//
	// Exit if no volume
	//
	if (!goog.isDefAndNotNull(volume)) { return };

	playbutton.setSlider(slider);
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
	slider[xiv.ui.ViewBoxInteractorHandler.ORIENTATION_KEY] = renderPlaneOr;
	frameDisplay[xiv.ui.ViewBoxInteractorHandler.ORIENTATION_KEY] = renderPlaneOr;

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
 * @param {!string} key
 * @private
 */
xiv.ui.ViewBoxInteractorHandler.prototype.setZippyTreeEvents_ = function(key){
    // Update when a zippy header is clicked
    goog.events.listen(
	this.zippyTrees_[key].getZippyTree(),
	nrg.ui.ZippyNode.EventType.CLICKED,
	function(e){
	    this.onControllerDialogOpened_(e, this.dialogKeys_[key])
	}.bind(this));
}




/**
 * @param {!string} key
 * @private
 */
xiv.ui.ViewBoxInteractorHandler.prototype.createZippyTree_ = 
function(key) {
    this.zippyTrees_[key] = new nrg.ui.ScrollableZippyTree();
    this.zippyTrees_[key].render();
    //window.console.log(key, this.zippyTrees_[key].getElement());
}



/**
 * @param {!string} key
 * @private
 */
xiv.ui.ViewBoxInteractorHandler.prototype.createDialogKey_ =
function(key) {
    this.dialogKeys_[key] = key + 
	xiv.ui.ViewBoxInteractorHandler.DIALOG_SPLIT + goog.string.createUniqueString();
}



/**
 * @param {!string} ctrl
 * @private
 */
xiv.ui.ViewBoxInteractorHandler.prototype.setVolumeToggleEvents_ =
function(ctrl){
    goog.events.listen(
	ctrl, 
	xiv.ui.XtkController.EventType.CHANGE, 
	function(e){
	    goog.array.forEach(this.volumeToggles_, function(tog){
		var xObj = tog.getXObj();
		if (tog !== e.target){
		    tog.getComponent().checked = false;
		    xObj.visible = false;
		} else {
		    xObj.visible = true;
		    this.Renderer_.render2D(xObj);
		}
	    }.bind(this))
	}.bind(this))
}



/**
 * @param {!string} key
 * @private
 */
xiv.ui.ViewBoxInteractorHandler.prototype.addControlsToZippyTree_ =
    function(key) {
	// Loop through the viewable controls by category
	goog.object.forEach(this.viewableCtrls_[key], function(ctrls, sKey){
	    if (!goog.isArray(ctrls)) { return }
	    goog.array.forEach(ctrls, function(ctrl){
		// Get and add the folders.
		var folders = ctrl.getFolders() || [];
		if (sKey !== 'all' && folders.length > 0) {
		    folders.push(sKey)
		};
		// Add the contents
		this.zippyTrees_[key].addContents(ctrl.getElement(), folders);
		
		// Set the volume toggle events
		if (ctrl instanceof xiv.ui.RadioButtonController){
		    this.setVolumeToggleEvents_(ctrl, key);
		}
	    }.bind(this))
	}.bind(this))
    }




/**
 * @private
 */
xiv.ui.ViewBoxInteractorHandler.prototype.createControllerZippyTrees_ = 
function() {
    //
    // Create the zippy trees and corresponding dialogs as blank objects with
    // keys.
    //
    this.zippyTrees_ = 
	xiv.ui.XtkControllerTree.getEmptyPropertiesObject();
    this.dialogKeys_ = goog.object.clone(this.zippyTrees_);
    
    
    
    //
    // Create zippy trees
    //
    goog.object.forEach(this.zippyTrees_, function(tree, key){

	var zeroFound = false;

	//
	// Don't create trees if the relevant objects don't exist
	//
	switch (key){
	case 'volumes':
	    if (this.Renderer_.getCurrentVolumes().length == 0) {
		zeroFound = true;
	    }
	    break;
	case 'meshes':
	    if (this.Renderer_.getCurrentMeshes().length == 0) {
		zeroFound = true;
	    }	  
	    break;
	case 'annotations':
	    if (this.Renderer_.getCurrentAnnotations().length == 0) {
		zeroFound = true;
	    }
	    break;
	}

	if (zeroFound){
	    goog.object.remove(this.zippyTrees_, key);
	    return;
	}

	this.createZippyTree_(key);
	this.createDialogKey_(key);
	this.addControlsToZippyTree_(key);
	this.setZippyTreeEvents_(key);
    }.bind(this))
}



/**
 * @public
 */
xiv.ui.ViewBoxInteractorHandler.prototype.createViewableCtrls = function() {
    //
    // Get the controls
    //
    this.viewableCtrls_ = this.Renderer_.getControllerTree();

    //
    // We need to track the levels controllers independently
    //
    this.levels_ = this.viewableCtrls_.
	getLevelsController().getControllerSet();


    //
    // Create the zuppy Trees
    //
    this.createControllerZippyTrees_();

    //
    // Create the controller dialogs
    //
    this.createControllerDialogs_();

    //
    // Sync the render controllers with the renderer
    //
    this.syncVolumeCtrlsToRenderer_();
}



/**
 * @private
 */
xiv.ui.ViewBoxInteractorHandler.prototype.createControllerDialogs_ = 
function() {
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
	this.Dialogs_.createGenericToggleableDialog(
	    this.dialogKeys_[key],
	    xiv.ui.ViewBoxInteractorHandler.CSS.GENERIC_DIALOG,
	    xiv.ui.ViewBoxInteractorHandler.CSS.GENERIC_TOGGLE,
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
	    xiv.ui.ViewBoxInteractorHandler.CSS.GENERIC_ZIPPYTREE);
	this.Dialogs_.getDialogs()[this.dialogKeys_[key]].
	    getElement().appendChild(ctrlTreeElt);

	//
	// Expand collapse trees based on the node count
	//
	var nodeCount = 
	    this.zippyTrees_[key].getZippyTree().getTopLevelNodes().length;
	if (nodeCount > 1){
	    this.zippyTrees_[key].collapseAll();
	}
	else {
	    this.zippyTrees_[key].expandAll(); 
	    this.zippyTrees_[key].mapSliderToContents();
	}


	if (key == 'levels'){
	    this.customizeLevelsDialog_();

	}
	
    }.bind(this))
}



/**
* @private
*/
xiv.ui.ViewBoxInteractorHandler.prototype.customizeLevelsDialog_ = function(){

    var levelDia = this.Dialogs_.getDialogs()[this.dialogKeys_['levels']];
    var zTree = this.zippyTrees_['levels'].getZippyTree();
    var dialogElement = levelDia.getElement();


    goog.dom.classes.add(dialogElement, 
			 xiv.ui.ViewBoxInteractorHandler.CSS.LEVELS_DIALOG);
    goog.dom.classes.add(levelDia.getTitleElement(), 
			 xiv.ui.ViewBoxInteractorHandler.CSS.LEVELS_DIALOG + 
			 '-title');

    var zSlider = this.zippyTrees_['levels'].getSlider().getElement();
    zSlider.style.visibility = 'hidden';

    //
    // Open the dialog to do some style adjustments
    //
    //this.ViewBox_.fireToggleButton(this.dialogKeys_['levels']);
    
    //
    // Move to corner
    //
    levelDia.moveToCorner('right', 'top', 4, 50);

    //
    // Shorten the header labels to 10 characters
    //
    goog.array.forEach(
	zTree.getTopLevelNodes(), 
	function(node){
	    node.getHeaderLabel().style.fontSize = '10px';
	    node.truncateHeaderLabel(25);
	})
    

    var content = 
	this.zippyTrees_['levels'].getZippyTree().
	getNodesByLevel(1)[0];

    var histDetails = goog.dom.createDom('div', {
	'id': 'HistDetails_' + goog.string.createUniqueString(),
	'class': 'xiv-ui-viewboxinteractorhandler-histdetails'
    })

    var fadeBottom = goog.dom.createDom('div', {
	'id': 'HistDetailsFade_' + goog.string.createUniqueString(),
	'class': 'xiv-ui-viewboxinteractorhandler-histdetails-fadebottom'
    })
    goog.dom.appendChild(dialogElement, fadeBottom);

    var expandButton = goog.dom.createDom('div', {
	'id': 'HistDetauls_' + goog.string.createUniqueString(),
	'class': 'xiv-ui-viewboxinteractorhandler-histdetails-expandbutton'
    }, 'Histogram...')
    
    goog.dom.appendChild(histDetails, expandButton);
    goog.dom.appendChild(histDetails, 
			 this.levels_.histogramZoomRange.getElement());
    goog.dom.appendChild(histDetails, 
			 this.levels_.clipToCB.getElement());
    goog.dom.insertChildAt(content.getContentHolder(), histDetails, 1);

    goog.events.listen(
	histDetails,
	goog.events.EventType.MOUSEENTER,
	function(){
	    fadeBottom.style.opacity = 0;
	    fadeBottom.style.visibility = 'visible';
	    nrg.fx.fadeIn(fadeBottom, 220)
	})
    goog.events.listen(
	histDetails,
	goog.events.EventType.MOUSELEAVE,
	function(){
	    nrg.fx.fadeOut(fadeBottom, 220, function(){
		fadeBottom.style.visibility = 'hidden';
	    })
	})
    this.levels_.histogramZoomRange.getElement().style.width = '85%';
    this.levels_.histogramZoomRange.getElement().style.left = '1%';
    this.levels_.histogramZoomRange.getElement().style.top = '20px';
    this.levels_.clipToCB.getElement().style.width = '90%';
    this.levels_.clipToCB.getElement().style.left = '10px';
    this.levels_.clipToCB.getElement().style.top = '25px';

    //
    // Set the clipToCB to false
    //
    this.levels_.clipToCB.setChecked(false);
}




/**
 * @private
 */
xiv.ui.ViewBoxInteractorHandler.prototype.updateZoomFollower_ = function(){
    if (this.useZoomFollower_){
	goog.dom.removeNode(this.zoomFollower_);
	goog.dom.append(this.currMouseRenderer_.container,
			this.zoomFollower_);
	this.zoomFollower_.style.visibility = 'visible';
	this.zoomFollower_.style.left = this.mouseXY_['c'][0] + 20 + 'px';
	this.zoomFollower_.style.top = this.mouseXY_['c'][1]  + 'px';
    }
}




/**
 * @private
 */
xiv.ui.ViewBoxInteractorHandler.prototype.createZoomFollower_ = function(){
    //
    // Zoom follower
    //
    this.zoomFollower_ = goog.dom.createDom('div', {
	id: 'mousefollower'
    })
    goog.dom.classes.add(
	this.zoomFollower_, 
	xiv.ui.ViewBoxInteractorHandler.CURSOR_CSS.ZOOM_FOLLOWER);
    this.zoomFollower_.innerHTML  = 
	'Zoom In (drag up)<br>' + 
	'Zoom Out (drag down)<br>';
    goog.dom.append(this.ViewBox_.getViewFrame(), this.zoomFollower_);
}



/**
 * @inheritDoc
 */
xiv.ui.ViewBoxInteractorHandler.prototype.dispose = function () {
    goog.base(this, 'dispose');
    
    //
    // Sadly, we have to globaly listen for this.
    //
    document.removeEventListener('mousemove', 
				 this.storeCurrentMouse_.bind(this));
    document.removeEventListener('mousemove', 
				 this.storeCurrentMouse_);


    if (goog.isDefAndNotNull(this.keyHandler_)){
	//window.console.log('disposing key handler');
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
	goog.object.forEach(mouseKeyObj, function(mouseKey){
	    //window.console.log(mouseKey);
	    goog.events.unlistenByKey(mouseKey);
	    delete mouseKey;
	})
	goog.object.clear(mouseKeyObj);
    })
    goog.object.clear(this.mouseEvents_);
    delete this.mouseEvents_;


    if (this.useZoomFollower_){
	goog.dom.removeNode(this.zoomFollower_);
	delete this.zoomFollower_;
    }
    delete this.useZoomFollower_;


    delete this.viewableCtrls_;
    delete this.zooming_;
    delete this.panning_;

    delete this.ViewBox_;
    delete this.Renderer_;
    delete this.LayoutHandler_;
    delete this.Dialogs_;
    delete this.levelCtrl_;
}



goog.exportSymbol('xiv.ui.ViewBoxInteractorHandler.EventType',
	xiv.ui.ViewBoxInteractorHandler.EventType);
goog.exportSymbol('xiv.ui.ViewBoxInteractorHandler.TOGGLEABLE',
	xiv.ui.ViewBoxInteractorHandler.TOGGLEABLE);
goog.exportSymbol('xiv.ui.ViewBoxInteractorHandler.ORIENTATION_KEY',
	xiv.ui.ViewBoxInteractorHandler.ORIENTATION_KEY);
goog.exportSymbol('xiv.ui.ViewBoxInteractorHandler.DIALOG_SPLIT',
	xiv.ui.ViewBoxInteractorHandler.DIALOG_SPLIT);
goog.exportSymbol(
    'xiv.ui.ViewBoxInteractorHandler.prototype.createInteractors',
    xiv.ui.ViewBoxInteractorHandler.prototype.createInteractors);
goog.exportSymbol(
    'xiv.ui.ViewBoxInteractorHandler.prototype.getDialogKey',
    xiv.ui.ViewBoxInteractorHandler.prototype.getDialogKey);
goog.exportSymbol(
    'xiv.ui.ViewBoxInteractorHandler.prototype.createTwoDZoomToggle',
    xiv.ui.ViewBoxInteractorHandler.prototype.createTwoDZoomToggle);
goog.exportSymbol(
    'xiv.ui.ViewBoxInteractorHandler.prototype.createTwoDPanToggle',
    xiv.ui.ViewBoxInteractorHandler.prototype.createTwoDPanToggle);
goog.exportSymbol(
    'xiv.ui.ViewBoxInteractorHandler.prototype.createCrosshairToggle',
    xiv.ui.ViewBoxInteractorHandler.prototype.createCrosshairToggle);
goog.exportSymbol(
    'xiv.ui.ViewBoxInteractorHandler.prototype.createSettingsDialog',
    xiv.ui.ViewBoxInteractorHandler.prototype.createSettingsDialog);
goog.exportSymbol(
    'xiv.ui.ViewBoxInteractorHandler.prototype.syncAllCrosshairs',
    xiv.ui.ViewBoxInteractorHandler.prototype.syncAllCrosshairs);
goog.exportSymbol(
    'xiv.ui.ViewBoxInteractorHandler.prototype.applyAutoLevel',
    xiv.ui.ViewBoxInteractorHandler.prototype.applyAutoLevel);
goog.exportSymbol(
    'xiv.ui.ViewBoxInteractorHandler.prototype.onLayoutResize',
    xiv.ui.ViewBoxInteractorHandler.prototype.onLayoutResize);
goog.exportSymbol(
    'xiv.ui.ViewBoxInteractorHandler.prototype.toggleInteractorsVisible',
    xiv.ui.ViewBoxInteractorHandler.prototype.toggleInteractorsVisible);
goog.exportSymbol(
    'xiv.ui.ViewBoxInteractorHandler.prototype.hideInteractors',
    xiv.ui.ViewBoxInteractorHandler.prototype.hideInteractors);
goog.exportSymbol(
    'xiv.ui.ViewBoxInteractorHandler.prototype.showInteractors',
    xiv.ui.ViewBoxInteractorHandler.prototype.showInteractors);
goog.exportSymbol(
    'xiv.ui.ViewBoxInteractorHandler.prototype.update',
    xiv.ui.ViewBoxInteractorHandler.prototype.update);
goog.exportSymbol(
    'xiv.ui.ViewBoxInteractorHandler.prototype.toggleCrosshairsVisible',
    xiv.ui.ViewBoxInteractorHandler.prototype.toggleCrosshairsVisible);
goog.exportSymbol(
    'xiv.ui.ViewBoxInteractorHandler.prototype.updateInteractorStyles',
    xiv.ui.ViewBoxInteractorHandler.prototype.updateInteractorStyles);
goog.exportSymbol(
    'xiv.ui.ViewBoxInteractorHandler.prototype.syncLayoutMenuToLayoutHandler',
    xiv.ui.ViewBoxInteractorHandler.prototype.syncLayoutMenuToLayoutHandler);
goog.exportSymbol(
    'xiv.ui.ViewBoxInteractorHandler.prototype.createViewableCtrls',
    xiv.ui.ViewBoxInteractorHandler.prototype.createViewableCtrls);
goog.exportSymbol(
    'xiv.ui.ViewBoxInteractorHandler.prototype.dispose',
    xiv.ui.ViewBoxInteractorHandler.prototype.dispose);
