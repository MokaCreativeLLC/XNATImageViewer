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

}



/**
 * As stated.
 * @param {Event} e
 * @private
 */
xiv.ui.ViewBox.prototype.onRendering_ = function(e){

    //window.console.log("ON RENDERING");
    if (e.value > .99 && !this.progFadeOut_){
	
	window.console.log("\n\n2DONE!!");
	this.progFadeOut_ = true;
	this.ProgressBarPanel_.setValue(100);

	this.progTimer_ = goog.Timer.callOnce(function() {

	    window.console.log("DONE!!");
	    
	    this.progTimer_ = null;
	    this.onRenderEnd_();

	    this.hideSubComponent_(this.ProgressBarPanel_, 400, function(){
		window.console.log("HIDE ONCE!");
		this.progFadeOut_ = null;
	    }.bind(this));

	}.bind(this), 1700); // check again in 500 ms


	
    } else {
	this.showSubComponent_(this.ProgressBarPanel_, 0);
	this.ProgressBarPanel_.setValue(e.value * 100);
    }
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

    window.console.log("TOGGLE CROSSHAIRS", planeOr, visible);
    this.LayoutHandler_.getCurrentLayout().getLayoutFrameByTitle(planeOr)
    [xiv.ui.layouts.Layout.INTERACTORS.CROSSHAIRS].toggleVisible(visible);
    
}




/**
 * @private
 */
xiv.ui.ViewBox.prototype.syncCrosshairsToSliderX_ =  
function(slider, volume) {
    var ind = 'indexX'

    // Y Vertical crosshair
    if (goog.isDefAndNotNull(this.LayoutHandler_.getCurrentLayout().
			     getLayoutFrameByTitle('Y'))) {
	this.LayoutHandler_.getCurrentLayout().getLayoutFrameByTitle('Y')
	[xiv.ui.layouts.Layout.INTERACTORS.CROSSHAIRS].vertical.style.left =
	    this.Renderer_.getPlaneY().getRenderer().getVerticalSliceX(
		volume[ind], true).toString() + 'px';
    }
    

    // Z Vertical crosshair
    if (goog.isDefAndNotNull(this.LayoutHandler_.getCurrentLayout().
			     getLayoutFrameByTitle('Z'))) {
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
    var ind = 'indexY'

    // X Vertical crosshair
    if (goog.isDefAndNotNull(this.LayoutHandler_.getCurrentLayout().
			     getLayoutFrameByTitle('X'))) {
	this.LayoutHandler_.getCurrentLayout().getLayoutFrameByTitle('X')
	[xiv.ui.layouts.Layout.INTERACTORS.CROSSHAIRS].
	    vertical.style.left =
	    this.Renderer_.getPlaneX().getRenderer().getVerticalSliceX(
		volume[ind], false).toString() + 'px';
    }

    // Z Horizontal crosshair
    if (goog.isDefAndNotNull(this.LayoutHandler_.getCurrentLayout().
			     getLayoutFrameByTitle('Z'))) {
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
    var ind = 'indexZ'

    // X Horizontal crosshair
    if (goog.isDefAndNotNull(this.LayoutHandler_.getCurrentLayout().
			     getLayoutFrameByTitle('X'))) {
	this.LayoutHandler_.getCurrentLayout().getLayoutFrameByTitle('X')
	[xiv.ui.layouts.Layout.INTERACTORS.CROSSHAIRS].horizontal.style.top =
	    this.Renderer_.getPlaneX().getRenderer().getHorizontalSliceY(
		volume[ind], false).toString() + 'px';
    }

    // Y HORIZONTAL crosshair
    if (goog.isDefAndNotNull(this.LayoutHandler_.getCurrentLayout().
			     getLayoutFrameByTitle('Y'))) {
	this.LayoutHandler_.getCurrentLayout().getLayoutFrameByTitle('Y')
	[xiv.ui.layouts.Layout.INTERACTORS.CROSSHAIRS].horizontal.style.top =
	    this.Renderer_.getPlaneY().getRenderer().getHorizontalSliceY(
		volume[ind], false).toString() + 'px';
    }

}



/**
 * @private
 */
xiv.ui.ViewBox.prototype.syncCrosshairsToSlider_ = 
function(slider, volume) {
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
xiv.ui.ViewBox.prototype.toggleAllInteractorsVisible_ = function(opt_visible) {
    var interactors = this.LayoutHandler_.getMasterInteractors();
    var opacity = (opt_visible === false) ? 0 : 1;
    goog.object.forEach(this.Renderer_.getPlanes(), function(Plane, planeOr) {
	if (goog.isDefAndNotNull(interactors[planeOr]) &&
	    goog.isDefAndNotNull(interactors[planeOr].SLIDER)){
	    interactors[planeOr].SLIDER.getElement().style.opacity = 
		opacity;
	    interactors[planeOr].FRAME_DISPLAY.getElement().style.opacity = 
		opacity;
	    interactors[planeOr].CROSSHAIRS.vertical.style.opacity = 
		opacity;
	    interactors[planeOr].CROSSHAIRS.horizontal.style.opacity = 
		opacity;
	}
    }.bind(this))  
}



/**
 * @private
 */
xiv.ui.ViewBox.prototype.hideAllInteractors_ = function() {
    this.toggleAllInteractorsVisible_(false);
}


/**
 * @private
 */
 xiv.ui.ViewBox.prototype.showAllInteractors_ = function() {
    this.toggleAllInteractorsVisible_(true); 
}




/**
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

    frameDisplay.setTotalFrames(slider.getMaximum());
    frameDisplay.setCurrentFrame(slider.getValue());   
}



/**
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
 * @private
 */
xiv.ui.ViewBox.prototype.syncLayoutInteractorsToRenderer_ = function() {  
    var interactors = this.LayoutHandler_.getMasterInteractors();
    var arrPos;


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

	goog.events.listen(Plane.getRenderer(), 
			   xiv.vis.XtkEngine.EventType.SHIFT_DOWN,
	function(e){

	    window.console.log("SHIFT DOWN");
	    //this.toggleCrosshairsVisible_(e.orientation, false);
	    this.toggleAllInteractorsVisible_(false);
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
	    window.console.log("SHIFT UP");
	    this.toggleAllInteractorsVisible_(true);
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
	    //
	    // Don't move the sliders if the layout is transitioning
	    //
	    if (!this.LayoutHandler_.layoutChanging()){
		this.syncVolumeToSlider_(e.target, currVol);
		this.syncCrosshairsToSlider_(e.target, currVol);
		this.syncFrameDisplayToSlider_(e.target, currVol);
	    }
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

    window.console.log(this.Renderer_.getControllers3D());
    if (goog.isDefAndNotNull(this.Controllers3D_)){
	// Add to tab
	this.ZipTabs_.setTabPageContents('3D', 
					 this.Controllers3D_.getElement()); 
    }
}




/**
 * As stated.
 * @private
 */
xiv.ui.ViewBox.prototype.onRenderEnd_ = function(e){

    window.console.log("ON RENDER END!");
    //
    // Controllers
    //
    this.createControllerTabs_();

    //
    // Hide progress bar
    //
    this.hideSubComponent_(this.ProgressBarPanel_, 500, function(){
	this.updateStyle();
    }.bind(this));

    //
    // Sync interactors
    //
    this.syncLayoutInteractorsToRenderer_();
    
    //
    // Update styles
    //
    window.console.log("UPDATE STYLE");
    this.updateStyle();
    
}



/**
 * As stated.
 * @private
 */
xiv.ui.ViewBox.prototype.onLayoutResize_ = function(e){
    window.console.log("LAYOUT RESIZE!");
    this.updateStyle_Renderer_();
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
	window.console.log('\n\n\n\nVIEWABLE TREE', ViewableTree);
	this.ViewableTrees_.push(ViewableTree);	
    }

    //
    // Get the default layout
    //
    if (this.ViewableTrees_.length == 1) {
	this.setLayout(
	    xiv.ui.ViewBox.defaultLayout[ViewableTree.getCategory()]);
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
	this.load(viewGroups[0], false)
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

    if (opt_initLoadComponents) {
	//alert('CLEAR LOAD');
	this.disposeLoadComponents_();
	this.initLoadComponents_();
	this.setLoadComponentsEvents_();
    }

    
    if (ViewableSet instanceof gxnat.vis.ViewableTree){
	this.loadViewableTree_(ViewableSet);
	return;
    }

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
    // Events
    //
    goog.events.listenOnce(this.Renderer_, 
		       xiv.vis.RenderEngine.EventType.RENDER_START, 
		       this.onRenderStart_.bind(this));

    goog.events.listenOnce(this.Renderer_, 
		       xiv.vis.RenderEngine.EventType.RENDERING, 
		       this.onRendering_.bind(this));

    goog.events.listenOnce(this.Renderer_, 
		       xiv.vis.RenderEngine.EventType.RENDER_END, 
		       this.onRenderEnd_.bind(this));


    this.hideSubComponent_(this.ViewableGroupMenu_, 400, function(){
	this.showSubComponent_(this.ProgressBarPanel_, 0);
    }.bind(this))


    //window.console.log("RENDERING", ViewableSet, ViewableSet.getTitle);
    try {
	this.Renderer_.render(ViewableSet);
    } catch(error) {
	this.onRenderError_(error);
    }

    // Remember the time in which the thumbnail was loaded
    this.thumbLoadTime_ = (new Date()).getTime();    
}
 


/**
 * @private
 */
xiv.ui.ViewBox.prototype.onRenderError_ = function(error){
    //alert('Render error: ' + error.message);
    //window.console.log(error.message);
    this.disposeLoadComponents_();

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
    ErrorOverlay.addText(error.message);
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
 * Load the xiv.Tabs associated with the object's xiv.ui.Thumbnail.
 * @private
 */
xiv.ui.ViewBox.prototype.loadTabs_ = function() {  
    this.ZipTabs_.reset();
    this.loadTab_Info_();
    if (this.Thumbnail_.getViewable().getCategory() == 'Slicer') {
	this.loadTab_SlicerViews();
    }
    this.loadTabs_Controllers_();

    this.updateStyle();
}



/**
 * As stated.
 * @private
 */
xiv.ui.ViewBox.prototype.loadTab_Info_ = function() {
    this.ZipTabs_.setTabPageContents('Info', 
      this.Displayer_.createInfoTabContents(this.Thumbnail_.getViewable()));
}



/**
 * As stated.
 * @private
 */
xiv.ui.ViewBox.prototype.loadTab_SlicerViews_ = function() {
    this.ZipTabs_.setTabPageContents('Slicer Views', 
		this.ViewableGroupMenu_.getThumbnailGallery());
}



/**
 * As stated.
 * @private
 */
xiv.ui.ViewBox.prototype.loadTabs_Controllers_ = function() {
    goog.object.forEach(this.Displayer_.getControllerMenu(), 
	function(menuElt, key){
	    if (menuElt){
	        this.ZipTabs_.setTabPageContents(key, menuElt);
	    }
	}.bind(this))
}



/**
 * @inheritDoc
 */
xiv.ui.ViewBox.prototype.initLoadComponents_ = function() {

    this.initZipTabs_();
    this.initLayoutMenu_();
    this.initToggleMenu_();
    this.initLayoutHandler_();
    this.syncLayoutMenuToLayoutHandler_();
    window.console.log("\n\n\nINIT SUB!", this.LayoutMenu_);
    this.initRenderer_();
    this.initViewableGroupMenu_();

    this.hasLoadComponents_ = true;
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
    goog.dom.append(this.viewFrameElt_, this.ZipTabBounds_);
    goog.dom.classes.add(this.ZipTabBounds_, 
			 xiv.ui.ViewBox.CSS.TAB_BOUNDS);

    //
    // Create the tabs
    //
    this.ZipTabs_ = new nrg.ui.ZipTabs('TOP'); 
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
* As stated.
* @private
*/
xiv.ui.ViewBox.prototype.initLayoutMenu_ = function(){
    this.LayoutMenu_ = new nrg.ui.SlideInMenu();
    this.addToMenu('TOP_LEFT', this.LayoutMenu_.getElement());

    goog.dom.classes.add(this.LayoutMenu_.getElement(), 
	xiv.ui.ViewBox.CSS.VIEWLAYOUTMENU);

    this.LayoutMenu_.setHidePosition(-40, 0);
    this.LayoutMenu_.setShowPosition(24,0);
    this.LayoutMenu_.matchMenuIconToSelected(true);
    this.LayoutMenu_.matchMenuTitleToSelected(true);
    goog.dom.append(this.getElement(), this.LayoutMenu_.getMenuHolder());
}


/**
 
 * @param {!boolean} defaultState
 * @param {!string} defaultClass
 * @param {string=} opt_tooltip
 * @param {Function=} opt_toolCheck
 * @private
 */
xiv.ui.ViewBox.prototype.createToggleButton_ = 
    function(defaultState, defaultClass, opt_tooltip, opt_onCheck) {
	//
	// Create the toggle button
	//
	var onClass = goog.getCssName(defaultClass, 'on')
	var iconbutton = new goog.ui.ToggleButton([
	    goog.dom.createDom('div', defaultClass),
	]);
	iconbutton.setTooltip(opt_tooltip);
	//
	// Go ahead and render it first (weird, because we reattach it again)
	//
	iconbutton.render(this.menus_.LEFT);

	//
	// Set the default check stated
	//
	iconbutton.setChecked(defaultState);
	
	//
	// Add the 'on' class if it's default class is on
	//
	if (defaultState){
	    goog.dom.classes.add(iconbutton.getContentElement().
				 childNodes[0], onClass);
	}

	//
	// Clean up the CSS
	//
	nrg.style.setStyle(iconbutton.getElement(), {
	    'background': 'none',
	    'background-color': 'rgba(0,255,0,1)',
	    'border': 'none',
	    'cursor': 'pointer'
	})

	//
	// Clears the child node classes (they aren't very good)
	//
	goog.dom.classes.set(iconbutton.getElement().childNodes[0], '');

	//
	// Toggle event
	//
	goog.events.listen(iconbutton, goog.ui.Component.EventType.ACTION, 
	function(e){
	    if (goog.isDefAndNotNull(opt_onCheck)){
		opt_onCheck(e);
	    }
	    if (e.target.isChecked()) {
		goog.dom.classes.add(iconbutton.getContentElement().
				     childNodes[0], onClass);
	    } else {
		goog.dom.classes.remove(iconbutton.getContentElement().
					childNodes[0], onClass);
	    }
	}.bind(this));

	//
	// Adds to menu
	//
	this.addToMenu('LEFT', iconbutton.getElement());

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
	    this.Renderer_.setVPlaneOn(e.target.isChecked());
	}.bind(this));
}


/**
 * @private
 */
xiv.ui.ViewBox.prototype.createInfoToggle_ = function(){
    this.createToggleButton_(true, xiv.ui.ViewBox.CSS.BUTTON_INFOTOGGLE,
			    'Info. Display', function(e){}.bind(this));
}


/**
 * @private
 */
xiv.ui.ViewBox.prototype.createHelpToggle_ = function(){
    this.createToggleButton_(true, xiv.ui.ViewBox.CSS.BUTTON_HELPTOGGLE,
			    'Help Overlay', function(e){}.bind(this));
}


/**
 * @private
 */
xiv.ui.ViewBox.prototype.createCrosshairToggle_ = function(){
    this.createToggleButton_(true, xiv.ui.ViewBox.CSS.BUTTON_CROSSHAIRTOGGLE,
	'Crosshairs', function(e){
	    var interactors = this.LayoutHandler_.getMasterInteractors();
	    var visibility = e.target.isChecked() ? 'visible': 'hidden';
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
	}.bind(this));
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
    this.create3DRenderToggle_();
    this.createInfoToggle_();
    this.createCrosshairToggle_();
    this.createHelpToggle_();
}


/**
* As stated.
* @private
*/
xiv.ui.ViewBox.prototype.initLayoutHandler_ = function(){
    this.LayoutHandler_ = new xiv.ui.layouts.LayoutHandler();
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
	'/xnat/images/viewer/xiv/ui/LayoutMenu/menu.png');

    // Add icons and title to LayoutMenu
    // Add object and title to LayoutHandler
    goog.object.forEach({
	'Four-Up': {
	    OBJ: xiv.ui.layouts.FourUp,
	    ICON: '/xnat/images/viewer/xiv/ui/Layouts/four-up.png'
	},
	'Sagittal': {
	    OBJ: xiv.ui.layouts.Sagittal,
	    ICON: '/xnat/images/viewer/xiv/ui/Layouts/sagittal.png'
	},
	'Coronal': {
	    OBJ: xiv.ui.layouts.Coronal,
	    ICON: '/xnat/images/viewer/xiv/ui/Layouts/coronal.png'
	},
	'Transverse': {
	    OBJ: xiv.ui.layouts.Transverse,
	    ICON: '/xnat/images/viewer/xiv/ui/Layouts/transverse.png'
	},
	'3D': {
	    OBJ: xiv.ui.layouts.ThreeD,
	    ICON: '/xnat/images/viewer/xiv/ui/Layouts/3d.png'
	},
	'2D': {
	    OBJ: xiv.ui.layouts.TwoD,
	    ICON: '/xnat/images/viewer/xiv/ui/Layouts/2d.png'
	},
	'Conventional': {
	    OBJ: xiv.ui.layouts.Conventional,
	    ICON: '/xnat/images/viewer/xiv/ui/Layouts/conventional.png'
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
    goog.events.listen(this.LayoutMenu_, 
	nrg.ui.SlideInMenu.EventType.ITEM_SELECTED, 
		       this.onMenuItemSelected_.bind(this));
}



/**
* As stated.
* @private
*/
xiv.ui.ViewBox.prototype.onMenuItemSelected_ = function(e) {
    window.console.log("ITEM SELECTED!", e.title, e.index);
    window.console.log('trigger LayoutHandler_ here!');
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
			   window.console.log("VIEW SELECT", e);

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
    this.updateStyle();
}




/**
 * @inheritDoc
 */
xiv.ui.ViewBox.prototype.updateStyle = function (opt_args) {
    //
    // Merge any new arguments and update.
    //
    if (opt_args) {
	nrg.style.setStyle(this.getElement(), opt_args);
    }    

    //
    // Parent update style
    //
    goog.base(this, 'updateStyle');

    //window.console.log("\n%\n%\n%\n\n\n^^^^^^^^^^^^^^");


    this.updateStyle_ZipTabs_();
    this.updateStyle_LayoutHandler_();
    this.updateStyle_Renderer_();
}



/**
 * As stated.
 * @private
 */
xiv.ui.ViewBox.prototype.updateStyle_ZipTabs_ = function () {
    if (!this.ZipTabs_) { return };
    //window.console.log("\n%\n%\n%\n\n\n&&&&ZIP TABS");
    this.ZipTabs_.updateStyle();
}




/**
 * As stated.
 * @private
 */
xiv.ui.ViewBox.prototype.updateStyle_LayoutHandler_ = function () {
    if (!this.LayoutHandler_) { return };

    //window.console.log("\n@\n@\n@\n@\n@UPDATE STYLE LAYOUT HANDLER", 
    //this.ZipTabs_.getResizable().getHandle('TOP'));
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
	    button.disposeInternal();
	    goog.dom.removeNode(button.getElement());
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
