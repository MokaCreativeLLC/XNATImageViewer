/**
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 * @author amh1646@rit.edu (Amanda Hartung)
 */

// goog
goog.require('goog.string');
goog.require('goog.dom');
goog.require('goog.events');
goog.require('goog.array');
goog.require('goog.object');
goog.require('goog.style');
goog.require('goog.ui.ToggleButton');
goog.require('goog.ui.ImagelessButtonRenderer');

// nrg
goog.require('nrg.ui.Component');
goog.require('nrg.style');
goog.require('nrg.ui.ZipTabs');
goog.require('nrg.ui.SlideInMenu');

// xiv
goog.require('xiv.vis.RenderEngine');
goog.require('xiv.vis.XtkEngine');
goog.require('xiv.ui.ProgressBarPanel');
goog.require('xiv.ui.layouts.LayoutHandler');
goog.require('xiv.ui.ViewableGroupMenu');


/**
 * Viewing box for viewable types (images, 3d volumes and meshes, 
 * Slicer scenes). xiv.ui.ViewBoxes accept xiv.thumbnails, either dropped or 
 * clicked in, and load them based on their characteristics.
 * xiv.ui.ViewBox is also a communicator class in the sense that it gets
 * various interaction and visualization classes to talk to one another.  F
 * or instance, it links the nrg.ui.SlideInMenu to the 
 * xiv.ui.layouts.LayoutHandler 
 * to the xiv.ui.Displayer. 
 * @constructor
 * @extends {nrg.ui.Component}
 */
goog.provide('xiv.ui.ViewBox');

xiv.ui.ViewBox = function () {
    goog.base(this);

    /**
     * @type {Array.<gxnat.vis.ViewableTree>}
     * @private
     */
    this.ViewableTrees_ = [];


    /**
     * @type {Object.<string, gxnat.vis.ViewableGroup>}
     * @private
     */
    this.ViewableGroups_ = {};


    /**
     * @struct
     * @private
     */
    this.menus_ = {
	TOP: null,
	TOP_LEFT: null,
	LEFT: null,
	BOTTOM_LEFT: null,
	BOTTOM: null,
	BOTTOM_RIGHT: null,
	RIGHT: null,
	TOP_RIGHT: null
    };
    this.addMenu_topLeft_();


    /**
     * @type {!Element}
     * @private
     */	
    this.viewFrameElt_ = goog.dom.createDom('div', {
	'id': xiv.ui.ViewBox.ID_PREFIX + '_ViewFrame_' + 
	    goog.string.createUniqueString(),
	'class': xiv.ui.ViewBox.CSS.VIEWFRAME
    });
    goog.dom.append(this.getElement(), this.viewFrameElt_);

    
    this.initProgressBarPanel_();
    this.updateStyle();
}
goog.inherits(xiv.ui.ViewBox, nrg.ui.Component);
goog.exportSymbol('xiv.ui.ViewBox', xiv.ui.ViewBox);



/**
 * Event types.
 * @enum {string}
 * @public
 */
xiv.ui.ViewBox.EventType = {
  THUMBNAIL_PRELOAD: goog.events.getUniqueId('thumbnail_preload'),
  THUMBNAIL_LOADED: goog.events.getUniqueId('thumbnail_load'),
  THUMBNAIL_LOADERROR: goog.events.getUniqueId('thumbnail_loaderror'),
}



/**
 * @type {!string} 
 * @const
 * @expose
 */
xiv.ui.ViewBox.ID_PREFIX =  'xiv.ui.ViewBox';



/**
 * @enum {string}
 * @public
 */
xiv.ui.ViewBox.CSS_SUFFIX = {
    HIDDEN: 'hidden',
    DRAGANDDROPHANDLE: 'draganddrophandle',
    TABDRAGGER: 'tabdragger',
    TABDRAGGER_HANDLE: 'tabdragger-handle',
    VIEWLAYOUTMENU: 'viewlayoutmenu',
    MENU_TOP_LEFT:  'menu-top-left',
    MENU_LEFT:  'menu-left',
    VIEWLAYOUTHANDLER: 'viewlayouthandler',
    TABS: 'ziptabs',
    TAB_BOUNDS: 'ziptab-bounds',
    VIEWFRAME: 'viewframe',
    COMPONENT_HIGHLIGHT: 'component-highlight',
    VIEWABLEGROUPMENU: 'viewablegroupmenu',
    BUTTON_THREEDTOGGLE: 'button-threedtoggle',
    BUTTON_INFOTOGGLE: 'button-infotoggle',
    BUTTON_HELPTOGGLE: 'button-helptoggle',
    BUTTON_CROSSHAIRTOGGLE: 'button-crosshairtoggle',
    INFOOVERLAY: 'infooverlay',
    INFOOVERLAY_TEXT: 'infooverlay-text',
    HELPOVERLAY: 'helpoverlay',
    HELPOVERLAY_TEXT: 'helpoverlay-text'
}



/**
 * @const
 */
xiv.ui.ViewBox.ORIENTATION_TAG = goog.string.createUniqueString();



/**
 * @dict
 * @const
 */
xiv.ui.ViewBox.defaultLayout = {
    'Scans' : 'Four-Up',
    'Slicer' : 'Conventional',
    'Slicer Scenes' : 'Conventional',
}



/**
 * @type {number} 
 * @const
 */
xiv.ui.ViewBox.MIN_HOLDER_HEIGHT = 200;



/**
 * @type {number} 
 * @const
 */
xiv.ui.ViewBox.SCAN_TAB_LABEL_HEIGHT =  15;


/**
 * @type {number} 
 * @const
 */
xiv.ui.ViewBox.SCAN_TAB_LABEL_WIDTH = 50;



/**
 * @type {number} 
 * @const
 */
xiv.ui.ViewBox.MIN_TAB_H_PCT = .2;



/**
 * @type {number}
 * @private
 */
xiv.ui.ViewBox.prototype.thumbLoadTime_;



/**
 * @type {Array.<Element>}
 * @private
 */
xiv.ui.ViewBox.prototype.doNotHide_;



/**
 * @type {!string}
 * @private
 */
xiv.ui.ViewBox.prototype.loadState_ = 'empty';




/**
 * @type {?xiv.ui.layouts.LayoutHandler}
 * @protected
 */
xiv.ui.ViewBox.prototype.LayoutHandler_ = null;


/**
 * @type {?Element}
 * @private
 */	
xiv.ui.ViewBox.prototype.ZipTabBounds_ = null; 


/**
 * @type {?nrg.ui.ZipTabs}
 * @private
 */	
xiv.ui.ViewBox.prototype.ZipTabs_ = null; 



/**
 * @type {?nrg.ui.SlideInMenu}
 * @private
 */
xiv.ui.ViewBox.prototype.LayoutMenu_ = null;



/**
 * @type {?xiv.vis.XtkEngine}
 * @private
 */
xiv.ui.ViewBox.prototype.Renderer_ = null;



/**
 * @type {?xiv.ui.ProgressBarPanel}
 * @private
 */
xiv.ui.ViewBox.prototype.ProgressBarPanel_ = null;



/**
 * @type {?xiv.ui.ViewableGroupMenu}
 * @private
 */
xiv.ui.ViewBox.prototype.ViewableGroupMenu_ = null;



/**
 * @type {?nrg.ui.ZippyTree}
 * @private
 */
xiv.ui.ViewBox.prototype.Controllers3D_ = null;


/**
 * @type {?nrg.ui.ZippyTree}
 * @private
 */
xiv.ui.ViewBox.prototype.Controllers2D_ = null;



/**
 * @type {?Array.<goog.ui.Button>}
 * @private
 */
xiv.ui.ViewBox.prototype.toggleButtons_ = null;




/**
 * @type {!boolean}
 * @private
 */
xiv.ui.ViewBox.prototype.hasLoadComponents_ = false;


/**
 * @return {!Object.<string, Element>}
 * @public
 */
xiv.ui.ViewBox.prototype.getMenus = function() {
    return this.menus_;
}



/**
 * @return {!string} The load state of the viewer.
 * @public
 */
xiv.ui.ViewBox.prototype.getLoadState = function() {
    return this.loadState_;
}


/**
 * @return {!Array.<gxnat.vis.ViewableTree>} 
 * @public
 */
xiv.ui.ViewBox.prototype.getViewableTrees =  function() {
    return this.ViewableTrees_;
}



/**
 * @return {!xiv.ui.layouts.LayoutHandler} 
 * @public
 */
xiv.ui.ViewBox.prototype.getLayoutHandler =  function() {
    return this.LayoutHandler_;
}



/**
 * Get the associated ViewableGroupMenu for this object.
 * @return {!xiv.ui.ViewableGroupMenu} The ViewableGroupMenu object of the ViewBox.
 * @public
 */
xiv.ui.ViewBox.prototype.getViewableGroupMenu =  function() {
    return this.ViewableGroupMenu_;
}



/**
 * Get the associated thumbnail load time for this object.
 * @return {number} The date (in millseconds) when the last thumbnail was 
 *     loaded into the ViewBox.
 * @public
 */
xiv.ui.ViewBox.prototype.highlight =  function() {
    goog.dom.classes.add(this.viewFrameElt_, 
			 xiv.ui.ViewBox.CSS.COMPONENT_HIGHLIGHT);
}



/**
 * @public
 */
xiv.ui.ViewBox.prototype.unhighlight =  function() {
    goog.dom.classes.remove(this.viewFrameElt_, 
			 xiv.ui.ViewBox.CSS.COMPONENT_HIGHLIGHT);
}




/**
 * Get the associated thumbnail load time for this object.
 * @return {number} The date (in millseconds) when the last thumbnail was 
 *     loaded into the ViewBox.
 * @public
 */
xiv.ui.ViewBox.prototype.getThumbnailLoadTime =  function() {
    return this.thumbLoadTime_;
}





/**
 * @inheritDoc
 */
xiv.ui.ViewBox.prototype.updateIconSrcFolder = function() {
    if (this.ZipTabs_){
	this.ZipTabs_.setIconBaseUrl(this.iconBaseUrl);
    }
}



/**
 * Adds an element to the doNotHide list.
 * @param {!Element} element The element to prevent from hiding when no 
 *    Thumbnail is loaded.
 * @public
 */
xiv.ui.ViewBox.prototype.doNotHide = function(element){
    this.doNotHide_ = (this.doNotHide_) ? this.doNotHide_ : [];
    this.doNotHide_.push(element);
};



/**
 * Allows for external communication to set
 * the viewscheme within the xiv.ui.ViewBox by communicating
 * to its nrg.ui.SlideInMenu object.
 * @param {!string} layout Sets the view layout associated with the argument.
 * @public
 */
xiv.ui.ViewBox.prototype.setLayout = function(layout) {
    this.LayoutMenu_.setSelected(layout);
}



/**
 * As stated.
 * @private
 */
xiv.ui.ViewBox.prototype.onRenderStart_ = function(){
    this.ProgressBarPanel_.setValue(0);
}



/**
 * As stated.
 * @param {Event} e
 * @private
 */
xiv.ui.ViewBox.prototype.onRendering_ = function(e){
    //window.console.log("\n\nON RENDERING", e.value);
    this.showSubComponent_(this.ProgressBarPanel_, 0);
    this.ProgressBarPanel_.setValue(e.value * 100);
}




/**
 * @private
 */
xiv.ui.ViewBox.prototype.syncVolumeToSlider_ = 
function(slider, volume) {
    if (!goog.isDefAndNotNull(volume)) return;
    volume['index' + slider[xiv.ui.ViewBox.ORIENTATION_TAG]] = 
	slider.getValue();
    //volume.modified(true);
}



/**
 * @param {!string} planeOr
 * @param {!boolean} visible
 * @private
 */
xiv.ui.ViewBox.prototype.toggleCrosshairsVisible_ =  
function(planeOr, visible) {
    //window.console.log("TOGGLE CROSSHAIRS", planeOr, visible);
    this.LayoutHandler_.getCurrentLayout().getLayoutFrameByTitle(planeOr)
    [xiv.ui.layouts.Layout.INTERACTORS.CROSSHAIRS].toggleVisible(visible);
    
}




/**
 * @private
 */
xiv.ui.ViewBox.prototype.syncCrosshairsToSliderX_ =  
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
 * @private
 */
xiv.ui.ViewBox.prototype.syncCrosshairsToSliderY_ =  
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
	this.LayoutHandler_.getCurrentLayout().getLayoutFrameByTitle('X')
	[xiv.ui.layouts.Layout.INTERACTORS.CROSSHAIRS].
	    vertical.style.left =
	    this.Renderer_.getPlaneX().getRenderer().getVerticalSliceX(
		volume[ind], false).toString() + 'px';
    }

    // Z Horizontal crosshair
   if (goog.isDefAndNotNull(zFrame) &&
	goog.isDefAndNotNull(zFrame
			    [xiv.ui.layouts.Layout.INTERACTORS.CROSSHAIRS])) {
	this.LayoutHandler_.getCurrentLayout().getLayoutFrameByTitle('Z')
	[xiv.ui.layouts.Layout.INTERACTORS.CROSSHAIRS].
	    horizontal.style.top =
	    this.Renderer_.getPlaneZ().getRenderer().getHorizontalSliceY(
		volume[ind], false).toString() + 'px';
    }
}



/**
 * @private
 */
xiv.ui.ViewBox.prototype.syncCrosshairsToSliderZ_ =  
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
	this.LayoutHandler_.getCurrentLayout().getLayoutFrameByTitle('X')
	[xiv.ui.layouts.Layout.INTERACTORS.CROSSHAIRS].horizontal.style.top =
	    this.Renderer_.getPlaneX().getRenderer().getHorizontalSliceY(
		volume[ind], false).toString() + 'px';
	//window.console.log("SLIDER Z x");
    }

    // Y HORIZONTAL crosshair
    if (goog.isDefAndNotNull(yFrame) &&
	goog.isDefAndNotNull(yFrame
			    [xiv.ui.layouts.Layout.INTERACTORS.CROSSHAIRS])) {
	this.LayoutHandler_.getCurrentLayout().getLayoutFrameByTitle('Y')
	[xiv.ui.layouts.Layout.INTERACTORS.CROSSHAIRS].horizontal.style.top =
	    this.Renderer_.getPlaneY().getRenderer().getHorizontalSliceY(
		volume[ind], false).toString() + 'px';
	//window.console.log("SLIDER Z y");
    }

}



/**
 * @private
 */
xiv.ui.ViewBox.prototype.syncCrosshairsToSlider_ = 
function(slider, volume) {

    if (!goog.isDefAndNotNull(volume)){
	return;
    }
    switch (slider[xiv.ui.ViewBox.ORIENTATION_TAG]){
    case 'X': 
	this.syncCrosshairsToSliderX_(slider, volume);
	break;
    case 'Y': 
	this.syncCrosshairsToSliderY_(slider, volume);
	break;
    case 'Z': 
	this.syncCrosshairsToSliderZ_(slider, volume);
	break;
    }
}



/**
 * @private
 */
xiv.ui.ViewBox.prototype.toggleInteractorsVisible_ = function(opt_visible) {
    var interactors = this.LayoutHandler_.getMasterInteractors();
    var opacity = (opt_visible === false) ? 0 : 1;
    goog.object.forEach(this.Renderer_.getPlanes(), function(Plane, planeOr) {
	if (goog.isDefAndNotNull(interactors[planeOr]) &&
	    goog.isDefAndNotNull(interactors[planeOr].SLIDER)){

	    nrg.fx.fadeTo(interactors[planeOr].SLIDER.getElement(), 
			  200, opacity);
	    nrg.fx.fadeTo(interactors[planeOr].FRAME_DISPLAY.getElement(), 
			  200, opacity);
	    nrg.fx.fadeTo(interactors[planeOr].CROSSHAIRS.vertical, 
			  200, opacity);
	    nrg.fx.fadeTo(interactors[planeOr].CROSSHAIRS.horizontal, 
			  200, opacity);
	}
    }.bind(this))  
}



/**
 * @private
 */
xiv.ui.ViewBox.prototype.hideInteractors_ = function() {
    this.toggleInteractorsVisible_(false);
}


/**
 * @private
 */
 xiv.ui.ViewBox.prototype.showInteractors_ = function() {
    this.toggleInteractorsVisible_(true); 
}



/**
 * @param {!nrg.ui.Slider} slider
 * @param {X.volume} volume
 * @private
 */
xiv.ui.ViewBox.prototype.syncFrameDisplayToSlider_ = 
function(slider, volume) {

    var layoutFrame = this.LayoutHandler_.getCurrentLayout().
	getLayoutFrameByTitle(slider[xiv.ui.ViewBox.ORIENTATION_TAG]);

    if (!goog.isDefAndNotNull(volume) ||
	!goog.isDefAndNotNull(layoutFrame)) { 
	return;
    }

    var frameDisplay = layoutFrame
    [xiv.ui.layouts.Layout.INTERACTORS.FRAME_DISPLAY]

    if (goog.isDefAndNotNull(frameDisplay)){
	frameDisplay.setTotalFrames(slider.getMaximum());
	frameDisplay.setCurrentFrame(slider.getValue());   
    }
}



/**
 * @param {!nrg.ui.Slider} slider
 * @param {X.volume} volume
 * @private
 */
xiv.ui.ViewBox.prototype.syncSliderToFrameDisplay_ = 
function(frameDisplay, volume) {
    if (!goog.isDefAndNotNull(volume)) return;

    var slider = this.LayoutHandler_.getCurrentLayout().
	getLayoutFrameByTitle(frameDisplay[xiv.ui.ViewBox.ORIENTATION_TAG])
        [xiv.ui.layouts.Layout.INTERACTORS.SLIDER]

    slider.setValue(frameDisplay.getCurrentFrame());   
}



/**
 * @param {!nrg.ui.Slider} slider
 * @param {X.volume} volume
 * @private
 */
xiv.ui.ViewBox.prototype.syncSlidersToVolume_ = function(opt_resetMaximum) {
    var interactors = this.LayoutHandler_.getMasterInteractors();
    var orientation;
    var currVol;
    var slider;

    goog.object.forEach(this.Renderer_.getPlanes(), function(Plane, planeOr) {
	if (!goog.isDefAndNotNull(interactors[planeOr]) ||
	    !goog.isDefAndNotNull(interactors[planeOr].SLIDER)) { 
	    return; 
	};

	slider = interactors[planeOr].SLIDER;
	orientation = slider[xiv.ui.ViewBox.ORIENTATION_TAG];
	currVol = Plane.getVolume();

	//
	// Exit if no volume
	//
	if (!goog.isDefAndNotNull(currVol)) { return };

	//
	// XTK specific designations
	//
	switch (orientation){
	case 'X': 
	    arrPos = 2;
	    break;
	case 'Y': 
	    arrPos = 1;
	    break;
	case 'Z': 
	    arrPos = 0;
	    break;
	}

	if (opt_resetMaximum === true) {
	    slider.setMaximum(currVol.dimensions[arrPos])
	}
	slider.setValue(currVol['index' + orientation]);

    }.bind(this))
}




/**
 * @param {!nrg.ui.Slider} slider
 * @param {X.volume} volume
 * @private
 */
xiv.ui.ViewBox.prototype.syncLayoutInteractorsToRenderer_ = function() {  
    var interactors = this.LayoutHandler_.getMasterInteractors();
    var arrPos;

    if (!goog.isDefAndNotNull(this.Renderer_)) { return };

    goog.object.forEach(this.Renderer_.getPlanes(), function(Plane, planeOr) {

	//
	// Exit out there's no slider or plane interactors.
	//
	if (!goog.isDefAndNotNull(interactors[planeOr]) ||
	    !goog.isDefAndNotNull(interactors[planeOr].SLIDER)) { 
	    return 
	};


	//
	// NOTE: Keep these here.  We need to declare them within the 
	// loop.
	//
	var interactorSet = interactors[planeOr];
	var slider = interactorSet.SLIDER;
	var currVol = Plane.getVolume();
	var frameDisplay = interactorSet.FRAME_DISPLAY;
	var crosshairs = interactorSet.CROSSHAIRS;
	arrPos = 0;

	//
	// Set custom params
	//
	slider[xiv.ui.ViewBox.ORIENTATION_TAG] = planeOr;
	frameDisplay[xiv.ui.ViewBox.ORIENTATION_TAG] = planeOr;

	//
	// Preliminary syunc
	//
	this.syncSlidersToVolume_(true);
	this.syncVolumeToSlider_(slider, currVol);
	this.syncCrosshairsToSlider_(slider, currVol);
	this.syncFrameDisplayToSlider_(slider, currVol);

	var moveListen;
	//
	// Exit if no volume
	//
	if (!goog.isDefAndNotNull(Plane.getRenderer())) { return };

	//
	// SHIFT_DOWN interaction
	//
	goog.events.listen(Plane.getRenderer(), 
			   xiv.vis.XtkEngine.EventType.SHIFT_DOWN,
	function(e){

	    //window.console.log("SHIFT DOWN");
	    //this.toggleCrosshairsVisible_(e.orientation, false);
	    this.hideInteractors_();
	    this.syncSlidersToVolume_();
	   
	    //
	    // Listen to mousemove when shift is held
	    //
	    moveListen = goog.events.listen(document.body, 
				goog.events.EventType.MOUSEMOVE,
				this.syncSlidersToVolume_.bind(this));

	}.bind(this))

	//
	// Shift events
	//
	goog.events.listen(Plane.getRenderer(), 
			   xiv.vis.XtkEngine.EventType.SHIFT_UP,
	function(e){
	    //window.console.log("SHIFT UP");
	    this.showInteractors_();
	    this.syncSlidersToVolume_();

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
	    this.syncVolumeToSlider_(e.target, currVol);
	    this.syncCrosshairsToSlider_(e.target, currVol);
	    this.syncFrameDisplayToSlider_(e.target, currVol);
	}.bind(this))

	//
	// Change Slice on Frame Display input
	//
	goog.events.listen(frameDisplay, 
		xiv.ui.layouts.interactors.FrameDisplay.EventType.INPUT,
		function(e){
		    this.syncSliderToFrameDisplay_(e.target,currVol);
		}.bind(this))

    }.bind(this));
}



/**
 * @param {!nrg.ui.ZippyTree} ctrlProperty Either this.Controllers3D_ or 
 *     this.Controllers2D_ 
 * @param {Function=} ctrlGetter The function used to retrieve the controllers.
 * @private
 */
xiv.ui.ViewBox.prototype.generateControllers_ = 
function(ctrlProperty, ctrlGetter) {
    //
    // Check null
    //
    if (goog.isDefAndNotNull(ctrlProperty)){
	ctrlProperty.disposeInternal();
	ctrlProperty = null;
    }

    //
    // Get the controls
    //
    var controllers = ctrlGetter();
    if (goog.isDefAndNotNull(controllers) && (controllers.length > 0)) {
	
	// reset the tree
	ctrlProperty = new nrg.ui.ZippyTree();

	// add the contents
	goog.array.forEach(controllers, function(ctrl){
	    ctrlProperty.addContents(ctrl.getElement(), 
					    ctrl.getFolders());
	}.bind(this));

	// contract all
	ctrlProperty.contractAll();
    }

    //
    // Return the adjusted property
    //
    return ctrlProperty;
}



/**
 * @private
 */
xiv.ui.ViewBox.prototype.createControllerTabs_ = function() {
    //
    // 2D
    //
    this.Controllers2D_ = this.generateControllers_(this.Controllers2D_, 
	this.Renderer_.getControllers2D.bind(this.Renderer_));
    if (goog.isDefAndNotNull(this.Controllers2D_)){
	// Add to tab
	this.ZipTabs_.setTabPageContents('2D', 
					 this.Controllers2D_.getElement()); 
    }

    //
    // 3D
    //
    this.Controllers3D_ = this.generateControllers_(this.Controllers3D_, 
	this.Renderer_.getControllers3D.bind(this.Renderer_));

    //window.console.log(this.Renderer_.getControllers3D());
    if (goog.isDefAndNotNull(this.Controllers3D_)){
	// Add to tab
	this.ZipTabs_.setTabPageContents('3D', 
					 this.Controllers3D_.getElement());
    }
}



/**
 * Introduces a delay mechanism so we're not presented 
 * with awkward progress bar issues.
 *
 * @param {number=} opt_delay The optional delay time.  Defaults to 1000.
 * @param {Function=} callback The optional callback function.
 * @private
 */
xiv.ui.ViewBox.prototype.hideProgressBarPanel_ = 
function(opt_delay, opt_callback){

    //window.console.log("HIDE PROG!");
    this.progTimer_ = goog.Timer.callOnce(function() {
	this.progTimer_ = null;
	//window.console.log("CALLBACK 1");
	this.hideSubComponent_(this.ProgressBarPanel_, 500, function(){
	    this.updateStyle();
	    if (goog.isDefAndNotNull(opt_callback)){
		//window.console.log("CALLBACK 2");
		opt_callback();
	    }
	}.bind(this));
    }.bind(this), goog.isNumber(opt_delay) ? opt_delay : 1000);
}




/**
 * As stated.
 * @private
 */
xiv.ui.ViewBox.prototype.onRenderEnd_ = function(e){    
    //window.console.log("ON RENDER END!");
    //
    // Untoggle wait for render errors
    //
    this.toggleWaitForRenderErrors_(false);

    //
    // Controllers
    //
    this.createControllerTabs_();


    //window.console.log("HIDE PROG!");

    
    goog.array.forEach(goog.dom.getElementsByClass('xtk-progress-bar'), 
		       function(bar){
			   bar.visibility = 'hidden';
		       });

    if (goog.isDefAndNotNull(this.ViewableTrees_[0].getOrientation())){
	this.setLayout(this.ViewableTrees_[0].getOrientation());
    }

    //
    // Hide progress bar
    //
    this.hideProgressBarPanel_(800, function(){
	this.ProgressBarPanel_.setValue(0);
	//
	// Fade in load components
	//
	this.fadeInLoadComponents_(500);
    }.bind(this));



    //
    // Sync interactors
    //
    this.syncLayoutInteractorsToRenderer_();
    
    //
    // Update styles
    //
    this.updateStyle();
    this.onLayoutResize_();
    this.Renderer_.updateControllers();
}



/**
 * @private
 */
xiv.ui.ViewBox.prototype.onLayoutResize_ = function(e){

    this.updateStyle_Renderer_();
    this.LayoutHandler_.updateInteractors();

    var interactors = this.LayoutHandler_.getMasterInteractors();
    var interactorSet, slider, currVol;

    if (!goog.isDefAndNotNull(this.Renderer_)) { return };

    goog.object.forEach(this.Renderer_.getPlanes(), function(Plane, planeOr) {

	//
	// Exit out there's no slider or plane interactors.
	//
	if (!goog.isDefAndNotNull(interactors[planeOr]) ||
	    !goog.isDefAndNotNull(interactors[planeOr].SLIDER)) { 
	    return 
	};


	//
	// NOTE: Keep these here.  We need to declare them within the 
	// loop.
	//
	interactorSet = interactors[planeOr];
	slider = interactorSet.SLIDER;
	currVol = Plane.getVolume();
	//window.console.log(slider, currVol);
	this.syncVolumeToSlider_(slider, currVol);
	this.syncCrosshairsToSlider_(slider, currVol);
	
    }.bind(this));


}





/**
 * @param {!gxnat.vis.ViewableTree} ViewableTree.
 * @private
 */
xiv.ui.ViewBox.prototype.loadViewableTree_ = function(ViewableTree){

    
    this.ViewableGroupMenu_.reset();
    goog.object.clear(this.ViewableGroups_);
    
    //
    // Store tree
    //
    if (!goog.array.contains(this.ViewableTrees_, ViewableTree)){
	//window.console.log('\n\n\n\nVIEWABLE TREE', ViewableTree);
	this.ViewableTrees_.push(ViewableTree);	
    }

    //
    // Get the default layout
    //
    if (this.ViewableTrees_.length == 1) {

	//
	// Set the layout if there's an orientation property
	// associated with the viewable tree.
	//
	if (goog.isDefAndNotNull(ViewableTree.getOrientation())){
	    //this.setLayout(ViewableTree.getOrientation());
	}
	//else  {
	    this.setLayout(
		xiv.ui.ViewBox.defaultLayout[ViewableTree.getCategory()]);
	//}
    }

    //
    // Load menu
    //
    //window.console.log(ViewableTree);
    var viewGroups = ViewableTree.getViewableGroups();

    var thumb = null;
    if (viewGroups.length > 1){
	//window.console.log("TOTAL VIEW GROUPS", viewGroups.length);
	goog.array.forEach(viewGroups, function(viewGroup, i){
	    thumb = this.ViewableGroupMenu_.createAndAddThumbnail(
		viewGroup.getThumbnailUrl(), viewGroup.getTitle() || i);

	    // Apply the UID to the thumb
	    this.ViewableGroups_[goog.getUid(thumb)] = viewGroup;
		
	}.bind(this))
	this.showSubComponent_(this.ViewableGroupMenu_, 400);
    }
    else {
	this.load(viewGroups[0], false);
    }
}




/**
 * Loads a gxnat.vis.ViewableTree object into the appropriate renderers.
 *
 * @param {!gxnat.vis.ViewableTree | !gxnat.vis.ViewableGroup} ViewableTree.
 * @param {!boolean} opt_initLoadComponents
 * @public
 */
xiv.ui.ViewBox.prototype.load = function (ViewableSet, opt_initLoadComponents) {
    opt_initLoadComponents = goog.isDefAndNotNull(opt_initLoadComponents) ?
	opt_initLoadComponents : true;
    
    //
    // Init the load components
    //
    if (opt_initLoadComponents) {
	this.disposeLoadComponents_();
	this.initLoadComponents_();
	this.setLoadComponentsEvents_();
    }

    //
    // ViewableTree handling
    //
    if (ViewableSet instanceof gxnat.vis.ViewableTree){
	
	if (ViewableSet.filesGotten()) {
	    this.loadViewableTree_(ViewableSet);
	} 
	else {
	    ViewableSet.getFiles(function(){
		this.loadViewableTree_(ViewableSet);
	    }.bind(this))
	}
	return;
    }

    //
    // We have to initialize certain toggle components here
    //
    this.createInfoToggle_();    

    //
    // Set plane containers
    //
    var layoutPlane;
    goog.object.forEach(this.Renderer_.getPlanes(), function(plane, key) { 
	layoutPlane = this.LayoutHandler_.getCurrentLayoutFrame(key);
	//window.console.log("LAYOUT PLANE", layoutPlane, key);
	if (layoutPlane) {
	    plane.init(layoutPlane.getElement());
	}
    }.bind(this))

    //
    // Events -listen once
    //
    goog.events.listenOnce(this.Renderer_, 
		       xiv.vis.RenderEngine.EventType.RENDER_START, 
		       this.onRenderStart_.bind(this));

    goog.events.listenOnce(this.Renderer_, 
		       xiv.vis.RenderEngine.EventType.RENDER_END, 
		       this.onRenderEnd_.bind(this));

    //
    // We want to keep listeing for the RENDERING
    //
    goog.events.listen(this.Renderer_, 
		       xiv.vis.RenderEngine.EventType.RENDERING, 
		       this.onRendering_.bind(this));




    this.hideSubComponent_(this.ViewableGroupMenu_, 400, function(){
	this.showSubComponent_(this.ProgressBarPanel_, 0);
    }.bind(this))

    //
    // toggle wait for render errors
    // 
    this.toggleWaitForRenderErrors_(true);

    //
    // Render
    //
 
    this.Renderer_.render(ViewableSet);


    //
    // Remember the time in which the thumbnail was loaded
    //
    this.thumbLoadTime_ = (new Date()).getTime();    
}
 



/**
 * @param {!boolean} toggle
 * @private
 */
xiv.ui.ViewBox.prototype.toggleWaitForRenderErrors_ = function(toggle) {
    if (toggle === true) {
	window.onerror = function(message, url, lineNumber) {  
	    this.onRenderError_(message);
	}.bind(this);
    } else {
	window.onerror = undefined;
    }
}


/**
 * @param {string} opt_errorMsg
 * @private
 */
xiv.ui.ViewBox.prototype.onRenderError_ = function(opt_errorMsg){

    
    this.unhighlight();

    this.hideProgressBarPanel_();

    this.toggleWaitForRenderErrors_(false);

    this.disposeLoadComponents_();

    opt_errorMsg = opt_errorMsg.replace('Uncaught Error: ', '') 
	|| 'A render error occured :(<br>'; 
    opt_errorMsg += '. Canceling render.';

    this.dispatchEvent({
	type: xiv.ui.ViewBox.EventType.THUMBNAIL_LOADERROR,
	message: opt_errorMsg
    })


    var ErrorOverlay = new nrg.ui.ErrorOverlay();

    //
    // Add bg and closebutton
    //
    ErrorOverlay.addBackground();
    ErrorOverlay.addCloseButton();

    
    //
    // Add image
    //
    var errorImg = ErrorOverlay.addImage();
    goog.dom.classes.add(errorImg, nrg.ui.ErrorOverlay.CSS.NO_WEBGL_IMAGE); 

    //
    // Add above text and render
    //
    ErrorOverlay.addText(opt_errorMsg || '');
    ErrorOverlay.render(this.viewFrameElt_);

    //
    // Fade in the error overlay
    //
    ErrorOverlay.getElement().style.opacity = 0;
    ErrorOverlay.getElement().style.zIndex = 1000;
    nrg.fx.fadeInFromZero(ErrorOverlay.getElement(), xiv.ANIM_TIME);
}


/**
 * @private
 */
xiv.ui.ViewBox.prototype.onLayoutChangeStart_ = function(e){
    goog.object.forEach(this.Renderer_.getPlanes(), 
    function(renderPlane, planeOr) {
	if (goog.isDefAndNotNull( e.transitionElements[planeOr])){
	    //
	    // Attach the render plane to the transition element
	    //
	    renderPlane.setContainer( e.transitionElements[planeOr]);	
	    renderPlane.updateStyle();
	}
    })


    //this.hideInteractors_();
}



/**
 * @private
 */
xiv.ui.ViewBox.prototype.onLayoutChanging_ = function(e){
    goog.object.forEach(this.Renderer_.getPlanes(), 
    function(renderPlane, planeOr) {
	renderPlane.updateStyle();
    })

    //
    // Update the interactors
    //
    this.LayoutHandler_.updateInteractors();
}




/**
 * @private
 */
xiv.ui.ViewBox.prototype.onLayoutChangeEnd_ = function(e){
    var frames = e.frames;
    goog.object.forEach(this.Renderer_.getPlanes(), 
    function(renderPlane, planeOr) {
	//
	// Put the renderers in the new layout frames
	//
	if (goog.isDefAndNotNull(frames[planeOr])){
	    renderPlane.setContainer(frames[planeOr].getElement());
	    renderPlane.updateStyle();
	}
    })


    //
    // Update the interactors
    //
    this.LayoutHandler_.updateInteractors();
    //this.showInteractors_();
}



/**
 * As stated.
 * @private
 */
xiv.ui.ViewBox.prototype.adjustLayoutHandler_ = function(){
    this.LayoutHandler_.setViewPlanes(this.Displayer_.ViewPlanes, 
				      this.Displayer_.Interactors);
    this.LayoutHandler_.animateLayoutChange(false);
    this.LayoutHandler_.setLayout('none');
}



/**
 * @private
 */
xiv.ui.ViewBox.prototype.initLoadComponents_ = function() {

    this.initZipTabs_();
    this.initToggleMenu_();
    this.initLayoutHandler_();
    this.syncLayoutMenuToLayoutHandler_();
    this.initRenderer_();
    this.initViewableGroupMenu_();
    this.hasLoadComponents_ = true;
}



/**
 * @param {number=} opt_fadeTime
 * @private
 */
xiv.ui.ViewBox.prototype.fadeInLoadComponents_ = function(opt_fadeTime) {
    opt_fadeTime = goog.isNumber(opt_fadeTime) ? opt_fadeTime : 500;
    var anims = [];
    var fadeables = [this.ZipTabs_.getElement(), 
		     this.menus_.LEFT,
		     this.LayoutMenu_.getElement(), 
		     this.LayoutHandler_.getElement()];
    goog.array.forEach(fadeables, function(fadeable){
	anims.push(nrg.fx.generateAnim_Fade(fadeable, {'opacity':0}, 
					    {'opacity':1}, opt_fadeTime)); 
    })    
    nrg.fx.parallelAnimate(anims);
}



/**
 * @param {!nrg.ui.Component} subComponent The component to show.
 * @param {number=} opt_fadeTime The optional fade time.  Defaults to 0;
 * @param {Function=} opt_callback The optional callback.
 * @private
 */
xiv.ui.ViewBox.prototype.hideSubComponent_ = function(subComponent, 
						      opt_fadeTime,
						      opt_callback) {
    opt_fadeTime = (goog.isNumber(opt_fadeTime) && opt_fadeTime >=0) ? 
	opt_fadeTime : 0;

    var onOut = function(){
	subComponent.getElement().style.visibility = 'hidden';
	subComponent.getElement().style.zIndex = '-1';
	if (opt_callback) { opt_callback() };
    }

    if ((subComponent.getElement().style.visibility == 'hidden') ||
	(opt_fadeTime == 0)) { 
	onOut();
	return;
    } 

    nrg.fx.fadeOut(subComponent.getElement(), opt_fadeTime, onOut);
}




/**
 * @param {!nrg.ui.Component} subComponent The component to show.
 * @param {number=} opt_fadeTime The optional fade time.  Defaults to 0;
 * @param {Function=} opt_callback The optional callback function.
 * @private
 */
xiv.ui.ViewBox.prototype.showSubComponent_ = function(subComponent, 
						      opt_fadeTime,
						      opt_callback) {
    opt_fadeTime = (goog.isNumber(opt_fadeTime) && opt_fadeTime >=0) ? 
	opt_fadeTime : 0;

    subComponent.getElement().style.opacity = '0';
    subComponent.getElement().style.zIndex = '1000';	
    subComponent.getElement().style.visibility = 'visible';

    if (opt_fadeTime == 0) { 
	subComponent.getElement().style.opacity = '1';
	if (opt_callback) { opt_callback() };
	return;
    } 

    nrg.fx.fadeIn(subComponent.getElement(), opt_fadeTime, function(){
	if (opt_callback) { opt_callback() };
    });
}




/**
* As stated.
* @private
*/
xiv.ui.ViewBox.prototype.initProgressBarPanel_ = function(){
    this.ProgressBarPanel_ = new xiv.ui.ProgressBarPanel(); 
    goog.dom.append(this.viewFrameElt_, this.ProgressBarPanel_.getElement());
    this.ProgressBarPanel_.getElement().style.opacity = 0;
    this.ProgressBarPanel_.getElement().style.zIndex = 100000;
    this.hideSubComponent_(this.ProgressBarPanel_);

}




/**
* As stated.
* @private
*/
xiv.ui.ViewBox.prototype.initZipTabs_ = function(){
    //
    // TabBounds
    //
    this.ZipTabBounds_ = goog.dom.createDom('div');
    goog.dom.appendChild(this.viewFrameElt_, this.ZipTabBounds_);
    goog.dom.classes.add(this.ZipTabBounds_, 
			 xiv.ui.ViewBox.CSS.TAB_BOUNDS);

    //
    // Create the tabs
    //
    this.ZipTabs_ = new nrg.ui.ZipTabs('TOP'); 
    this.ZipTabs_.getElement().style.opacity = 0;
    this.ZipTabs_.render(this.viewFrameElt_);
    goog.dom.classes.add(this.ZipTabs_.getElement(), xiv.ui.ViewBox.CSS.TABS);

    //
    // Add dragger CSS and handle.
    //
    var resizeDragger = this.ZipTabs_.getResizable().getResizeDragger('TOP');
    var dragHandle = resizeDragger.getHandle();
    goog.dom.classes.add(dragHandle, xiv.ui.ViewBox.CSS.TABDRAGGER);
    goog.dom.append(dragHandle, goog.dom.createDom('div', {
	'id': xiv.ui.ViewBox.ID_PREFIX + '_DraggerHandle_' + 
	    goog.string.createUniqueString(),
	'class': xiv.ui.ViewBox.CSS.TABDRAGGER_HANDLE
    }));
    resizeDragger.setOffsetY(-5);


    //
    // Set the boundary of the tabs
    //
    this.ZipTabs_.setBoundaryElement(this.ZipTabBounds_);
}



/**
 * @private
 */
xiv.ui.ViewBox.prototype.addMenu_topLeft_ = function() {

    this.menus_.TOP_LEFT = goog.dom.createDom("div",  {
	'id': xiv.ui.ViewBox.ID_PREFIX + 
	    '_menu_top_left_' + goog.string.createUniqueString(),
	'class' : xiv.ui.ViewBox.CSS.MENU_TOP_LEFT,
	'viewbox': this.getElement().id
    });
    goog.dom.append(this.getElement(), this.menus_.TOP_LEFT);
}



/**
 * @private
 */
xiv.ui.ViewBox.prototype.addMenu_left_ = function() {
    this.menus_.LEFT = goog.dom.createDom("div",  {
	'id': xiv.ui.ViewBox.ID_PREFIX + 
	    '_menu_left_' + goog.string.createUniqueString(),
	'class' : xiv.ui.ViewBox.CSS.MENU_LEFT,
	'viewbox': this.getElement().id
    });
    this.menus_.LEFT.style.opacity = 0;
    goog.dom.append(this.getElement(), this.menus_.LEFT);
}




/**
 * @param {!string} menuLoc
 * @param {!Element} element
 * @param {number=} opt_insertInd 
 * @private
 */
xiv.ui.ViewBox.prototype.addToMenu = function(menuLoc, element, opt_insertInd){
    element.style.position = 'relative';
    element.style.display = 'block';
    element.style.marginLeft = 'auto';
    element.style.marginRight = 'auto';
    element.style.marginTop = '6px';
    element.style.marginBottom = '6px';

    var insertBeforeElt = null;
    var currMenu;

    switch(menuLoc){
    case 'TOP_LEFT':
	currMenu = this.menus_.TOP_LEFT;
	break;
    case 'LEFT':
	currMenu = this.menus_.LEFT;
	break;
    case 'BOTTOM_LEFT':
	currMenu = this.menus_.BOTTOM_LEFT;
	break;
    case 'TOP_RIGHT':
	currMenu = this.menus_.TOP_RIGHT;
	break;
    case 'RIGHT':
	currMenu = this.menus_.RIGHT;
	break;
    case 'BOTTOM_RIGHT':
	currMenu = this.menus_.BOTTOM_RIGHT;
	break;
    }

    if (goog.isNumber(opt_insertInd)){
	currMenu.insertBefore(element, 
		currMenu.childNodes[opt_insertInd])
    } else {
	goog.dom.append(currMenu, element);
    }
}



/**
 * @private
 */
xiv.ui.ViewBox.prototype.createLayoutMenu_ = function(){
    this.LayoutMenu_ = new nrg.ui.SlideInMenu();
    
    //
    // Add to left menu.
    //
    this.addToMenu('LEFT', this.LayoutMenu_.getElement());

    //
    // Class.
    //
    goog.dom.classes.add(this.LayoutMenu_.getElement(), 
	xiv.ui.ViewBox.CSS.VIEWLAYOUTMENU);

    //
    // Match settings
    //
    this.LayoutMenu_.matchMenuIconToSelected(true);
    this.LayoutMenu_.matchMenuTitleToSelected(true);

    //
    // Set opacities.
    //
    this.LayoutMenu_.getElement().style.opacity = 0;
    this.LayoutMenu_.getMenuHolder().style.opacity = 0;
    
    //
    // Append the holder to the view frame elt.
    //
    goog.dom.appendChild(this.viewFrameElt_, this.LayoutMenu_.getMenuHolder());
}



/**
 * @param {!boolean} defaultState
 * @param {!string} defaultClass
 * @param {string=} opt_tooltip
 * @param {Function=} opt_toolCheck
 * @param {src=} opt_src
 * @private
 */
xiv.ui.ViewBox.prototype.createToggleButton_ = 
    function(defaultState, defaultClass, opt_tooltip, opt_onCheck, opt_src) {
	//
	// Create the toggle button
	//
	var onClass = goog.getCssName(defaultClass, 'on')
	var iconbutton = goog.dom.createDom('img', defaultClass);
	iconbutton.title = opt_tooltip;


	if (goog.isDefAndNotNull(opt_src)){
	    iconbutton.src = opt_src;
	}

	//
	// Set the default check stated
	//
	iconbutton.setAttribute('checked', defaultState.toString());
	
	
	//
	// Add the 'on' class if it's default class is on
	//
	if (defaultState){
	    goog.dom.classes.add(iconbutton, onClass);
	}

	//
	// Clean up the CSS
	//
	nrg.style.setStyle(iconbutton, {'cursor': 'pointer'})


	//
	// Toggle event
	//
	goog.events.listen(iconbutton, goog.events.EventType.CLICK, 
	function(e){

	    e.target.setAttribute('checked', 
		(e.target.getAttribute('checked') == 'true') ? 'false': 'true');

	    if (goog.isDefAndNotNull(opt_onCheck)){
		opt_onCheck(e);
	    }
	    if (e.target.getAttribute('checked') == 'true') {
		goog.dom.classes.add(iconbutton, onClass);
	    } else {
		goog.dom.classes.remove(iconbutton, onClass);
	    }


	}.bind(this));

	//
	// Adds to menu
	//
	this.addToMenu('LEFT', iconbutton);

	if (!goog.isDefAndNotNull(this.toggleButtons_)){
	    this.toggleButtons_= [];
	}
	this.toggleButtons_.push(iconbutton);
    }



/**
 * @private
 */
xiv.ui.ViewBox.prototype.create3DRenderToggle_ = function(){    
    this.createToggleButton_(true, xiv.ui.ViewBox.CSS.BUTTON_THREEDTOGGLE,
	'3D Rendering', function(e){
	    this.Renderer_.setVPlaneOn((e.target.getAttribute('checked') == 
					'true'));
	}.bind(this), serverRoot + '/images/viewer/xiv/ui/ViewBox/Toggle-3D.png');
}


/**
 * @private
 */
xiv.ui.ViewBox.prototype.createInfoToggle_ = function(){
    
    //
    // Clear existing
    //
    if (goog.isDefAndNotNull(this.infoOverlay_)){
	this.infoOverlay_.disposeInternal();
    }
    this.infoOverlay_ = new nrg.ui.Overlay();


    //
    // Generate widget text
    //
    var infoText = '';

    //
    // For viewables with a 'sessionInfo' property (i.e. Scans)
    //
    if (this.ViewableTrees_.length > 0) {
	//window.console.log(this.ViewableTrees_[0].sessionInfo)
	//window.console.log(this.ViewableTrees_[0].getSessionInfo())
	goog.object.forEach(this.ViewableTrees_[0].getSessionInfo(), 
	    function(value, key){

		if (value.length > 0){
		//window.console.log(key, value);
		    infoText += key + ': ' + value + '<br>';
		}
	    })
    }

    //
    // Slicer thumbnails -- the filename is sufficient for now.
    //
    else {
	infoText = goog.string.path.basename(
	    this.ViewableTrees_[0].getQueryUrl());
    }
    
    //
    // Add text and render
    //
    this.infoOverlay_.addText(infoText);
    this.infoOverlay_.render(this.viewFrameElt_);

    //
    // Classes
    //
    goog.dom.classes.add(this.infoOverlay_.getElement(), 
			 this.constructor.CSS.INFOOVERLAY);

    goog.dom.classes.add(this.infoOverlay_.getTextElements()[0], 
			 this.constructor.CSS.INFOOVERLAY_TEXT);
    
    //
    // Toggle fades
    // 
    this.createToggleButton_(true, xiv.ui.ViewBox.CSS.BUTTON_INFOTOGGLE,
			    'Info. Display', 
       function(e){
	   nrg.fx.fadeTo(this.infoOverlay_.getElement(), 
			 200,  (e.target.getAttribute('checked') == 'true') ? 
			 1: 0);
       }.bind(this), serverRoot + '/images/viewer/xiv/ui/ViewBox/Toggle-Info.png');
}


/**
 * @private
 */
xiv.ui.ViewBox.prototype.createHelpToggle_ = function(){
    //
    // Clear existing
    //
    if (goog.isDefAndNotNull(this.helpOverlay_)){
	this.helpOverlay_.disposeInternal();
    }
    this.helpOverlay_ = new nrg.ui.Overlay();


    //
    // Generate widget text
    //
    var helpText =
	"HELP (this will be much nicer soon!)<br><br>" +
	"Hold 'SHIFT' over 2D frames for point-based slice scrolling.<br><br>" +
	"Drag the left mouse button HORIZONTALLY over a 2D box to" +
	" adjust contrast.<br><br>" +
	"Drag the left mouse button VERTICALLY over a 2D box to" +
	" adjust brightness.<br><br>" +
	"Resize frames by dragging borders.<br><br>" +
	"Change layouts by clicking the second button from the top.<br><br>" +
	"Swap ViewBoxes by dragging the first button from the top.<br><br>" +
	"Add and remove ViewBox columns and rows by clicking on triangle " + 
	"buttons on the right and bottom modal borders.<br><br>";
	"Click [IMAGE] for full screen viewing.<br><br>";
	"Click [IMAGE] for popup viewing.<br><br>";

    
    //
    // Add text and render
    //
    this.helpOverlay_.addText(helpText);

    //
    // Classes
    //

    goog.dom.classes.add(this.helpOverlay_.getElement(), 
			 this.constructor.CSS.HELPOVERLAY);

    goog.dom.classes.add(this.helpOverlay_.getTextElements()[0], 
			 this.constructor.CSS.HELPOVERLAY_TEXT);
    

 
    this.helpOverlay_.render(this.viewFrameElt_);


    //
    // Toggle fades
    // 


    this.createToggleButton_(false, xiv.ui.ViewBox.CSS.BUTTON_HELPTOGGLE,
	'Help Overlay', function(e){
	    if ((e.target.getAttribute('checked') == 'true')) {
		this.helpOverlay_.getElement().
		    style.visibility = 'visible';
		nrg.fx.fadeIn(this.helpOverlay_.getElement(), 
			       200,  function(){
				      this.helpOverlay_.getElement().
					  style.visibility = 'visible';
			       }.bind(this));
	    } else {
		nrg.fx.fadeOut(this.helpOverlay_.getElement(), 
			       200,  function(){
				      this.helpOverlay_.getElement().
					  style.visibility = 'hidden';
			      }.bind(this));

	    }
	}.bind(this), serverRoot + 
			     '/images/viewer/xiv/ui/ViewBox/Toggle-Help.png');

    
}


/**
 * @private
 */
xiv.ui.ViewBox.prototype.createCrosshairToggle_ = function(){
    this.createToggleButton_(true, xiv.ui.ViewBox.CSS.BUTTON_CROSSHAIRTOGGLE,
	'Crosshairs', function(e){
	    var interactors = this.LayoutHandler_.getMasterInteractors();
	    var visibility = (e.target.getAttribute('checked') == 'true') ? 
		'visible': 'hidden';
	    goog.object.forEach(this.Renderer_.getPlanes(), 
            function(Plane, planeOr) {
		if (goog.isDefAndNotNull(interactors[planeOr]) &&
		    goog.isDefAndNotNull(interactors[planeOr].CROSSHAIRS)){
		    interactors[planeOr].CROSSHAIRS.vertical.style.visibility = 
			visibility;
		    interactors[planeOr].CROSSHAIRS.horizontal.
			style.visibility = visibility;
		}
	    }.bind(this))  
	}.bind(this), 
		serverRoot + 
		'/images/viewer/xiv/ui/ViewBox/Toggle-Crosshairs.png');
}




/**
 * @private
 */
xiv.ui.ViewBox.prototype.clearToggleMenu_ = function(){

}



/**
 * @private
 */
xiv.ui.ViewBox.prototype.initToggleMenu_ = function(){
    this.addMenu_left_();
    this.createLayoutMenu_();
    this.create3DRenderToggle_();
    this.createCrosshairToggle_();
    this.createHelpToggle_();
}


/**
* As stated.
* @private
*/
xiv.ui.ViewBox.prototype.initLayoutHandler_ = function(){
    this.LayoutHandler_ = new xiv.ui.layouts.LayoutHandler();
    this.LayoutHandler_.getElement().style.opacity = 0;
    goog.dom.append(this.viewFrameElt_, this.LayoutHandler_.getElement());
    goog.dom.classes.add(this.LayoutHandler_.getElement(), 
			 xiv.ui.ViewBox.CSS.VIEWLAYOUTHANDLER);

    //
    // EVENTS
    //
    goog.events.listen(this.LayoutHandler_, 
	xiv.ui.layouts.LayoutHandler.EventType.RESIZE, 
	this.onLayoutResize_.bind(this));

    goog.events.listen(this.LayoutHandler_, 
	xiv.ui.layouts.LayoutHandler.EventType.LAYOUT_CHANGE_START, 
	this.onLayoutChangeStart_.bind(this));

    goog.events.listen(this.LayoutHandler_, 
	xiv.ui.layouts.LayoutHandler.EventType.LAYOUT_CHANGING, 
	this.onLayoutChanging_.bind(this));

    goog.events.listen(this.LayoutHandler_, 
	xiv.ui.layouts.LayoutHandler.EventType.LAYOUT_CHANGE_END, 
	this.onLayoutChangeEnd_.bind(this));
}



/**
 * @private
 */
xiv.ui.ViewBox.prototype.syncLayoutMenuToLayoutHandler_ = function() {

    this.LayoutMenu_.setMenuIconSrc(
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
	    ICON: '/xnat/' +
		'images/viewer/xiv/ui/Layouts/transverse.png'
	},
	'3D': {
	    OBJ: xiv.ui.layouts.ThreeD,
	    ICON: '/xnat/' +
		'images/viewer/xiv/ui/Layouts/3d.png'
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
	this.LayoutMenu_.addMenuItem(key, val.ICON);
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
    goog.events.listen(this.LayoutMenu_, 
	nrg.ui.SlideInMenu.EventType.ITEM_SELECTED, 
		       this.onMenuItemSelected_.bind(this));
}



/**
* As stated.
* @private
*/
xiv.ui.ViewBox.prototype.onMenuItemSelected_ = function(e) {
    //window.console.log("ITEM SELECTED!", e.title, e.index);
    //window.console.log('trigger LayoutHandler_ here!');
    //window.console.log("SET LAYOUT HERE?");
    this.LayoutHandler_.setLayout(e.title);
}



/**
 * As stated.
 *
 * @private
 */
xiv.ui.ViewBox.prototype.initViewableGroupMenu_ = function(){
    this.ViewableGroupMenu_ = new xiv.ui.ViewableGroupMenu();
    this.ViewableGroupMenu_.render(this.viewFrameElt_);

    goog.dom.append(this.viewFrameElt_, this.ViewableGroupMenu_.getElement());
    goog.dom.append(this.viewFrameElt_, 
		    this.ViewableGroupMenu_.getBackground());

    goog.dom.classes.add(this.ViewableGroupMenu_.getElement(), 
			 xiv.ui.ViewBox.CSS.VIEWABLEGROUPMENU)

    goog.events.listen(this.ViewableGroupMenu_, 
		       xiv.ui.ViewableGroupMenu.EventType.VIEWSELECTED, 
		       function(e){
			   //window.console.log("VIEW SELECT", e);

			   this.load(this.ViewableGroups_[
			       goog.getUid(e.thumbnail)], false)
		       }.bind(this))

    this.hideSubComponent_(this.ViewableGroupMenu_);
}



/**
 * Initializes the 'xiv.ui.Displayer' object which allows
 * various viewable content to be displayed, based on 
 * the 'loadFramework' internal variable.
 * @private
 */
xiv.ui.ViewBox.prototype.initRenderer_ = function(){
    this.Renderer_ = new xiv.vis.XtkEngine();

    //
    // Errors!
    //
    goog.events.listen(this.Renderer_, xiv.vis.XtkEngine.EventType.ERROR,
	function(e){
	    this.onRenderError_(e.message);
	}.bind(this))
}



/**
 * Show child elements of the xiv.ui.ViewBox. 
 * @private
 */
xiv.ui.ViewBox.prototype.showChildElements_ = function() {
    goog.array.forEach(this.getElement().childNodes, function(childElt){
	goog.dom.classes.remove(childElt, xiv.ui.ViewBox.CSS.HIDDEN);
    })
}



/**
 * Hide child elements of the xiv.ui.ViewBox.  
 * @private
 */
xiv.ui.ViewBox.prototype.hideChildElements_ = function() {
    goog.array.forEach(this.getElement().childNodes, function(childElt){
	if (this.doNotHide_ && (this.doNotHide_.length > 0) && 
	    (this.doNotHide_.indexOf(childElt) === -1)) {
	    goog.dom.classes.add(childElt, xiv.ui.ViewBox.CSS.HIDDEN);
	}
    }.bind(this))
}



/**
* As stated.
* @private
*/
xiv.ui.ViewBox.prototype.setLoadComponentsEvents_ = function() {
    this.setTabsEvents_();
}



/**
 * As stated.
 * @private
 */
xiv.ui.ViewBox.prototype.setTabsEvents_ = function () {
    goog.events.listen(this.ZipTabs_, nrg.ui.Resizable.EventType.RESIZE,
		       this.onTabsResize_.bind(this));
}




/**
 * Callback for when the xiv.ui.ViewBoxBorder is dragged.
 * @private
 */
xiv.ui.ViewBox.prototype.onTabsResize_ = function() {
    //window.console.log('\n\non tabs resize!');
    this.updateStyle();
}




/**
 * @inheritDoc
 */
xiv.ui.ViewBox.prototype.updateStyle = function (opt_args) {
    goog.base(this, 'updateStyle', opt_args);

    this.updateStyle_ZipTabs_();
    this.updateStyle_LayoutHandler_();
    this.updateStyle_Renderer_();
    this.updateStyle_LayoutMenu_();
}



/**
 * @private
 */
xiv.ui.ViewBox.prototype.updateStyle_LayoutMenu_ = function () {
    if (!goog.isDefAndNotNull(this.LayoutMenu_)) { return };
    var frameSize = goog.style.getSize(this.viewFrameElt_);
    this.LayoutMenu_.setHidePosition(-100, frameSize.height/2 - 130);
    this.LayoutMenu_.setShowPosition(0, frameSize.height/2 - 130);
}



/**
 * @private
 */
xiv.ui.ViewBox.prototype.updateStyle_ZipTabs_ = function () {
    if (!goog.isDefAndNotNull(this.ZipTabs_)) { return };
    //window.console.log("\n%\n%\n%\n\n\n&&&&ZIP TABS");
    this.ZipTabs_.updateStyle();
}




/**
 * As stated.
 * @private
 */
xiv.ui.ViewBox.prototype.updateStyle_LayoutHandler_ = function () {
    if (!goog.isDefAndNotNull(this.LayoutHandler_)) { return };
     //window.console.log("\n%\n%\n%\n\n\n&&&&LAYOUT HANDLER");
    //this.LayoutHandler_.getElement().style.height = 'calc(100% - 30px)';
    this.LayoutHandler_.getElement().style.height = 
	this.ZipTabs_.getResizable().getHandle('TOP').style.top;
    this.LayoutHandler_.updateStyle();
}



/**
 * @private
 */
xiv.ui.ViewBox.prototype.updateStyle_Renderer_ = function () {
    if (!this.Renderer_) { return };
    this.Renderer_.updateStyle();
}



/**
 * As stated.
 * @private
 */
xiv.ui.ViewBox.prototype.disposeLoadComponents_ = function () {
    
    //
    // Help Overlay
    //
    if (goog.isDefAndNotNull(this.helpOverlay_)){
	this.helpOverlay_.disposeInternal();
    }

    //
    // Info Overlay
    //
    if (goog.isDefAndNotNull(this.infoOverlay_)){
	this.infoOverlay_.disposeInternal();
    }

    // 2D Controllers
    if (goog.isDefAndNotNull(this.Controllers2D_)){
	this.Controllers2D_.disposeInternal();
	this.Controllers2D_ = null;
    }


    // 3D Controllers
    if (goog.isDefAndNotNull(this.Controllers3D_)){
	this.Controllers3D_.disposeInternal();
	this.Controllers3D_ = null;
    }
    
    
    // Clear the reference to the groups
    goog.object.clear(this.ViewableGroups_);
    goog.array.clear(this.ViewableTrees_);


    // Layout Handler
    if (goog.isDefAndNotNull(this.LayoutHandler_)){
    // Unlisten - Layout Handler
	goog.events.removeAll(this.LayoutHandler_);
	goog.dispose(this.LayoutHandler_.disposeInternal());
	delete this.LayoutHandler_;
    }


    // LayoutMenu
    if (goog.isDefAndNotNull(this.LayoutMenu_)){
	// Unlisten - LayoutMenu 
	goog.events.removeAll(this.LayoutMenu_);	
	this.LayoutMenu_.disposeInternal();
	delete this.LayoutMenu_;
    }
	
    // ZipTab Bounds
    if (goog.isDefAndNotNull(this.ZipTabBounds_)){
	goog.dom.removeNode(this.ZipTabBounds_);
	delete this.ZipTabBounds_;
    }    

    // ZipTabs
    if (goog.isDefAndNotNull(this.ZipTabs_)){
	// Unlisten - Tabs
	goog.events.unlisten(this.ZipTabs_.getResizable(), 
			     nrg.ui.Resizable.EventType.RESIZE,
			     this.onTabsResize_.bind(this));
	
	goog.dispose(this.ZipTabs_.disposeInternal());
	delete this.ZipTabs_;
    }

    // Renderer
    if (goog.isDefAndNotNull(this.Renderer_)){
	this.Renderer_.dispose();
	delete this.Renderer_;
    }


    // ViewableGroupMenu
    if (goog.isDefAndNotNull(this.ViewableGroupMenu_)){
	this.ViewableGroupMenu_.disposeInternal();
	delete this.ViewableGroupMenu_;
    }

    
    
    // toggle buttons MenuLeft
    if (goog.isDefAndNotNull(this.toggleButtons_)){
	goog.dom.removeNode(this.menus_.LEFT);
	delete this.menus_.LEFT;
	
	goog.array.forEach(this.toggleButtons_, function(button){
	    goog.events.removeAll(button);
	    goog.dom.removeNode(button);
	    button = null;
	})
	goog.array.clear(this.toggleButtons_);
	delete this.toggleButtons_;
    }
}




/**
 * @private
 */
xiv.ui.ViewBox.prototype.disposeInternal = function () {
    goog.base(this, 'disposeInternal');
    
    //
    // Dispose the load Components_
    //
    this.disposeLoadComponents_();

    //
    // Progress Bar Panel
    //
    if (goog.isDefAndNotNull(this.ProgressBarPanel_)){
	this.ProgressBarPanel_.disposeInternal();
	delete this.ProgressBarPanel_;
    }    

    //
    // Elements - viewFrame
    //
    goog.dom.removeNode(this.viewFrameElt_);
    delete this.viewFrameElt_;

    //
    // Elements - menus
    //
    goog.object.forEach(this.menus_, function(menu, key){
	goog.dom.removeNode(menu);
	delete this.menus_[key];
    }.bind(this))
    delete this.menus_;


    // Primitive types
    delete this.Viewables_;
    delete this.hasLoadComponents_;
}
