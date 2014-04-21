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

// moka
goog.require('moka.ui.Component');
goog.require('moka.style');
goog.require('moka.ui.ZipTabs');
goog.require('moka.ui.SlideInMenu');

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
 * or instance, it links the moka.ui.SlideInMenu to the 
 * xiv.ui.layouts.LayoutHandler 
 * to the xiv.ui.Displayer. 
 * @constructor
 * @extends {moka.ui.Component}
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
	LEFT: null,
	BOTTOM: null,
	RIGHT: null
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


    /**
     * @type {?xiv.ui.layouts.LayoutHandler}
     * @protected
     */
    this.LayoutHandler_ = null;


    /**
     * @type {!Element}
     * @private
     */	
    this.ZipTabBounds_ = null; 


    /**
     * @type {?moka.ui.ZipTabs}
     * @private
     */	
    this.ZipTabs_ = null; 



    /**
     * @type {!moka.ui.SlideInMenu}
     * @private
     */
    this.LayoutMenu_ = null;



    /**
     * @type {xiv.vis.XtkEngine}
     * @private
     */
    this.Renderer_ = null;



    /**
     * @type {xiv.ui.ProgressBarPanel}
     * @private
     */
    this.ProgressBarPanel_ = null;



    /**
     * @type {!xiv.ui.ViewableGroupMenu}
     * @private
     */
    this.ViewableGroupMenu_ = null;


    
    /**
     * @type {!moka.ui.ZippyTree}
     * @private
     */
    this.Controllers3D_ = null;


    /**
     * @type {!moka.ui.ZippyTree}
     * @private
     */
    this.Controllers2D_ = null;



    /**
     * @type {!boolean}
     * @private
     */
    this.subComponentsInitialized_ = false;


    //window.console.log(resizable, resizable.getElement());
    // style
    //this.doNotHide(this.ViewableGroupMenu_.getElement());
    //this.hideChildElements_();
    
    this.updateStyle();
}
goog.inherits(xiv.ui.ViewBox, moka.ui.Component);
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
    VIEWLAYOUTHANDLER: 'viewlayouthandler',
    TABS: 'ziptabs',
    TAB_BOUNDS: 'ziptab-bounds',
    VIEWFRAME: 'viewframe',
    COMPONENT_HIGHLIGHT: 'component-highlight',
    VIEWABLEGROUPMENU: 'viewablegroupmenu',
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
 * @type {!String}
 * @private
 */
xiv.ui.ViewBox.prototype.loadState_ = 'empty';







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

    goog.dom.classes.add(this.menus_.LEFT, 
			 xiv.ui.ViewBox.CSS.COMPONENT_HIGHLIGHT);

    if (!this.subComponentsInitialized_) { return };
    //this.getElement().style.border = 'solid 1px rgb(25,255,255)';
    goog.dom.classes.add(this.LayoutHandler_.getElement(), 
			 xiv.ui.ViewBox.CSS.COMPONENT_HIGHLIGHT);
    goog.dom.classes.add(this.ZipTabs_, 
			 xiv.ui.ViewBox.CSS.COMPONENT_HIGHLIGHT);
}



/**
 * @public
 */
xiv.ui.ViewBox.prototype.unhighlight =  function() {
    goog.dom.classes.remove(this.menus_.LEFT, 
			 xiv.ui.ViewBox.CSS.COMPONENT_HIGHLIGHT);

    if (!this.subComponentsInitialized_) { return };
    goog.dom.classes.remove(this.LayoutHandler_.getElement(), 
			 xiv.ui.ViewBox.CSS.COMPONENT_HIGHLIGHT);
    goog.dom.classes.remove(this.ZipTabs_, 
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
 * to its moka.ui.SlideInMenu object.
 * @param {!string} layout Sets the view layout associated with the argument.
 * @public
 */
xiv.ui.ViewBox.prototype.setLayout = function(layout) {
    this.LayoutMenu_.setLayout(layout);
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
	slider.getMaximum() - slider.getValue();
    //volume.modified(true);
}


/**
 * @private
 */
xiv.ui.ViewBox.prototype.syncFrameDisplayToSlider_ = 
function(slider) {

}



/**
 * @private
 */
xiv.ui.ViewBox.prototype.syncCrosshairsToSliderX_ =  
function(slider, volume) {
    var ind = 'indexX'

    // Y Vertical crosshair
    this.LayoutHandler_.getCurrentLayout().getLayoutFrameByTitle('Y')
    [xiv.ui.layouts.Layout.INTERACTORS.CROSSHAIRS].
	vertical.style.left =
	this.Renderer_.PlaneY_.getRenderer().getVerticalSliceX(
	    volume[ind], true).toString() + 'px';

    // Z Vertical crosshair
    this.LayoutHandler_.getCurrentLayout().getLayoutFrameByTitle('Z')
    [xiv.ui.layouts.Layout.INTERACTORS.CROSSHAIRS].
	vertical.style.left =
	this.Renderer_.PlaneZ_.getRenderer().getVerticalSliceX(
	    volume[ind], true).toString() + 'px';
}



/**
 * @private
 */
xiv.ui.ViewBox.prototype.syncCrosshairsToSliderY_ =  
function(slider, volume) {
    var ind = 'indexY'

    // X Vertical crosshair
    this.LayoutHandler_.getCurrentLayout().getLayoutFrameByTitle('X')
    [xiv.ui.layouts.Layout.INTERACTORS.CROSSHAIRS].
	vertical.style.left =
	this.Renderer_.PlaneX_.getRenderer().getVerticalSliceX(
	    volume[ind]).toString() + 'px';

    // Z Horizontall crosshair
    this.LayoutHandler_.getCurrentLayout().getLayoutFrameByTitle('Z')
    [xiv.ui.layouts.Layout.INTERACTORS.CROSSHAIRS].
	horizontal.style.top =
	this.Renderer_.PlaneZ_.getRenderer().getHorizontalSliceY(
	    volume[ind], true).toString() + 'px';
}



/**
 * @private
 */
xiv.ui.ViewBox.prototype.syncCrosshairsToSliderZ_ =  
function(slider, volume) {
    var ind = 'indexZ'

    // X Horizontal crosshair
    this.LayoutHandler_.getCurrentLayout().getLayoutFrameByTitle('X')
    [xiv.ui.layouts.Layout.INTERACTORS.CROSSHAIRS].horizontal.style.top =
	this.Renderer_.PlaneX_.getRenderer().getHorizontalSliceY(
	    volume[ind]).toString() + 'px';

    // Y Vertical crosshair
    this.LayoutHandler_.getCurrentLayout().getLayoutFrameByTitle('Y')
    [xiv.ui.layouts.Layout.INTERACTORS.CROSSHAIRS].horizontal.style.top =
	this.Renderer_.PlaneY_.getRenderer().getHorizontalSliceY(
	    volume[ind]).toString() + 'px';

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
xiv.ui.ViewBox.prototype.syncLayoutInteractorsToRenderer_ = function() {  
    var interactors = this.LayoutHandler_.getMasterInteractors();
    var interactorSet;
    var slider;
    var frameDisplay;
    var crosshairs;
    var currVol;
    var arrPos;

    goog.object.forEach(this.Renderer_.getPlanes(), function(plane, planeOr) {
	//
	// We can't do anything if there's no slider or plane interactors.
	//
	if (!goog.isDefAndNotNull(interactors[planeOr]) ||
	    !goog.isDefAndNotNull(interactors[planeOr].SLIDER)) { 
	    return 
	};

	interactorSet = interactors[planeOr];
	slider = interactorSet.SLIDER;
	frameDisplay = interactorSet.DISPLAY;
	crosshairs = interactorSet.CROSSHAIRS;
	currVol = plane.getVolume();
	arrPos = 0;

	//
	// XTK specific designations
	//
	switch (planeOr){
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
	
	slider.setMaximum(currVol.dimensions[arrPos])
	slider.setValue(currVol['index' + planeOr]);
	slider[xiv.ui.ViewBox.ORIENTATION_TAG] = planeOr

	// Change Slice when slider moves
	goog.events.listen(slider, moka.ui.GenericSlider.EventType.SLIDE, 
        function(e){
	    this.syncVolumeToSlider_(e.target, currVol);
	    this.syncCrosshairsToSlider_(e.target, currVol);

	    //
	    // Change crosshairs
	    //
	  
	}.bind(this))


    }.bind(this));
}



/**
 * @param {!moka.ui.ZippyTree} ctrlProperty Either this.Controllers3D_ or 
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
	ctrlProperty = new moka.ui.ZippyTree();

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

    this.ViewableGroupMenu_.init();
    goog.object.clear(this.ViewableGroups_);
    
    //
    // Store tree
    //
    if (!goog.array.contains(this.ViewableTrees_, ViewableTree)){
	this.ViewableTrees_.push(ViewableTree);	
    }

    //
    // Get the default layout
    //
    if (this.ViewableTrees_.length == 1) {
	this.LayoutHandler_.setLayout(
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
	this.load(viewGroups[0])
    }
}




/**
 * Loads a gxnat.vis.ViewableTree object into the appropriate renderers.
 *
 * @param {!gxnat.vis.ViewableTree | !gxnat.vis.ViewableGroup} ViewableTree.
 * @public
 */
xiv.ui.ViewBox.prototype.load = function (ViewableSet) {

    //window.console.log("LOAD", ViewableSet);

    if (!this.subComponentsInitialized_){
	this.initSubComponents_();
	this.setComponentEvents_();
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
    
    this.Renderer_.render(ViewableSet);
    

    // Remember the time in which the thumbnail was loaded
    this.thumbLoadTime_ = (new Date()).getTime();    
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
xiv.ui.ViewBox.prototype.initSubComponents_ = function() {

    this.initZipTabs_();
    this.initLayoutMenu_();
    this.initLayoutHandler_();
    this.syncLayoutMenuToLayoutHandler_();
    
    this.initRenderer_();
    this.initProgressBarPanel_();
    this.initViewableGroupMenu_();

    this.subComponentsInitialized_ = true;
}



/**
 * @param {!moka.ui.Component} subComponent The component to show.
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

    moka.fx.fadeOut(subComponent.getElement(), opt_fadeTime, onOut);
}




/**
 * @param {!moka.ui.Component} subComponent The component to show.
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

    moka.fx.fadeIn(subComponent.getElement(), opt_fadeTime, function(){
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
    this.ZipTabs_ = new moka.ui.ZipTabs('TOP'); 
    goog.dom.append(this.viewFrameElt_, this.ZipTabs_.getElement());
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

    this.menus_.LEFT = goog.dom.createDom("div",  {
	'id': xiv.ui.ViewBox.ID_PREFIX + 
	    '_menu_top_left_' + goog.string.createUniqueString(),
	'class' : xiv.ui.ViewBox.CSS.MENU_TOP_LEFT,
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

    var insertBeforeElt = /**@type {!Element} */ null;

    switch(menuLoc){
    case 'LEFT':
	if (goog.isNumber(opt_insertInd)){
	    this.menus_.LEFT.insertBefore(element, 
				this.menus_.LEFT.childNodes[opt_insertInd])
	} else {
	    goog.dom.append(this.menus_.LEFT, element);
	}
	
	break;
    case 'TOP':
	goog.dom.append(this.menus_.TOP, element);
	break;
    case 'RIGHT':
	goog.dom.append(this.menus_.RIGHT, element);
	break;
    case 'BOTTOM':
	goog.dom.append(this.menus_.BOTTOM, element);
	break;
    }
}



/**
* As stated.
* @private
*/
xiv.ui.ViewBox.prototype.initLayoutMenu_ = function(){
    this.LayoutMenu_ = new moka.ui.SlideInMenu();
    this.addToMenu('LEFT', this.LayoutMenu_.getElement());

    goog.dom.classes.add(this.LayoutMenu_.getElement(), 
	xiv.ui.ViewBox.CSS.VIEWLAYOUTMENU);

    this.LayoutMenu_.setHidePosition(-40, 0);
    this.LayoutMenu_.setShowPosition(24,0);
    this.LayoutMenu_.matchMenuIconToSelected(true);
    this.LayoutMenu_.matchMenuTitleToSelected(true);
    goog.dom.append(this.getElement(), this.LayoutMenu_.getMenuHolder());
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
	moka.ui.SlideInMenu.EventType.ITEM_SELECTED, 
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
			       goog.getUid(e.thumbnail)])
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
xiv.ui.ViewBox.prototype.setComponentEvents_ = function() {
    this.setTabsEvents_();
    //this.setLayoutMenuEvents_();
}



/**
 * As stated.
 * @private
 */
xiv.ui.ViewBox.prototype.setTabsEvents_ = function () {
    goog.events.listen(this.ZipTabs_, moka.ui.Resizable.EventType.RESIZE,
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
	moka.style.setStyle(this.getElement(), opt_args);
    }    

    //
    // Parent update style
    //
    goog.base(this, 'updateStyle');

    window.console.log("\n%\n%\n%\n\n\n^^^^^^^^^^^^^^");


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
 * As stated.
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
xiv.ui.ViewBox.prototype.disposeInternal = function () {
    goog.base(this, 'disposeInternal');


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
	goog.dom.remove(this.ZipTabBounds_);
	delete this.ZipTabBounds_;
    }    

    // ZipTabs
    if (goog.isDefAndNotNull(this.ZipTabs_)){
	// Unlisten - Tabs
	goog.events.unlisten(this.ZipTabs_.getResizable(), 
			     moka.ui.Resizable.EventType.RESIZE,
			     this.onTabsResize_.bind(this));
	
	goog.dispose(this.ZipTabs_.disposeInternal());
	delete this.ZipTabs_;
    }


    // Progress Bar Panel
    if (goog.isDefAndNotNull(this.ProgressBarPanel_)){
	this.ProgressBarPanel_.disposeInternal();
	delete this.ProgressBarPanel_;
    }


    // Renderer
    if (goog.isDefAndNotNull(this.Renderer_)){
	
	this.Renderer_.dispose();
	delete this.Renderer_();
    }
  


    // ViewableGroupMenu
    if (goog.isDefAndNotNull(this.ViewableGroupMenu_)){
	this.ViewableGroupMenu_.disposeInternal();
	delete this.ViewableGroupMenu_;
    }
  
    

    // Elements - viewFrame
    goog.dom.removeNode(this.viewFrameElt_);
    delete this.viewFrameElt_;


    // Elements - menus
    goog.object.forEach(this.menus_, function(menu, key){
	goog.dom.removeNode(menu);
	delete this.menus_[key];
    }.bind(this))
    delete this.menus_;



    // Primitive types
    delete this.Viewables_;
    delete this.subComponentsInitialized_;
}
