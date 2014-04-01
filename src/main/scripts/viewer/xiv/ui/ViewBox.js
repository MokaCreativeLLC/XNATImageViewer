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
    VIEWFRAME: 'viewframe',
    COMPONENT_HIGHLIGHT: 'component-highlight',
    VIEWABLEGROUPMENU: 'viewablegroupmenu',
}



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
 * @param {!string} viewPlane Sets the view layout associated with the argument.
 * @public
 */
xiv.ui.ViewBox.prototype.setLayout = function(viewPlane) {
    this.LayoutMenu_.setLayout(viewPlane);
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

    if (e.value > .99 && !this.progFadeOut_){
	
	window.console.log("\n\n2DONE!!");
	this.progFadeOut_ = true;
	this.ProgressBarPanel_.setValue(100);

	this.progTimer_ = goog.Timer.callOnce(function() {

	    window.console.log("DONE!!");
	    
	    this.progTimer_ = null;
	    

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
xiv.ui.ViewBox.prototype.syncLayoutInteractorsToRenderer_ = function() {
    
    goog.object.forEach(this.Renderer_.getPlanes(), function(plane, planeOr) {


	if (planeOr !== 'V') {
	    var layoutPlane = 
		this.LayoutHandler_.getCurrentLayout().getPlaneByTitle(planeOr);

	    var ch1 = goog.dom.createDom('div');
	    ch1.style.position = 'absolute';
	    ch1.style.height = '1px';
	    ch1.style.width = '100%';
	    ch1.style.top = '50%';
	    ch1.style.left = '0%';
	    ch1.style.backgroundColor = 'rgb(185,185,185)';


	    var ch2 = goog.dom.createDom('div');
	    ch2.style.position = 'absolute';
	    ch2.style.height = '100%';
	    ch2.style.width = '1px';
	    ch2.style.top = '0%';
	    ch2.style.left = '50%';
	    ch2.style.backgroundColor = 'rgb(185,185,185)';

	    goog.dom.append(layoutPlane.getElement(), ch1);
	    goog.dom.append(layoutPlane.getElement(), ch2);
	}

	var interactors = this.LayoutHandler_.getCurrentLayout().
		getPlaneInteractors(planeOr);

	if (interactors[xiv.ui.layouts.Layout.INTERACTORS.SLIDER]){

	    var slider = /**@type {!moka.ui.GenericSlider}*/
	    interactors[xiv.ui.layouts.Layout.INTERACTORS.SLIDER];
	    var currVol = plane.getVolume();
	    
	    var arrPos = 0;
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
	    
	    window.console.log("RETURNING OUT OF SLIDERS -- combe back later");
	    return

	    slider.setMaximum(currVol.dimensions[arrPos])
	    slider.setValue(currVol['index' + planeOr]);

	    window.console.log(currVol['index' + planeOr], 
			       currVol.indexX, currVol.indexY, currVol.indexZ);

	    // Change Slice when slider moves
	    goog.events.listen(
		slider, 
		moka.ui.GenericSlider.EventType.SLIDE, function(e){

		    if (!currVol) return;
		    /**
		    currVol['index' + plane.getOrientation()] = 
		    interactors[xiv.ui.layouts.Layout.INTERACTORS.SLIDER].getMaximum()
		    - interactors[xiv.ui.layouts.Layout.INTERACTORS.SLIDER].getValue();

		    window.console.log('\n\n', planeOr);
		    window.console.log(currVol._upperThreshold);
		    window.console.log(planeOr, plane.getRenderer()._height);
		    window.console.log(planeOr, plane.getRenderer()._width);
		    window.console.log(planeOr, 
				       plane.getRenderer()._sliceHeight);
		    window.console.log(planeOr, plane.getRenderer()._sliceWidth);

		    currVol.dimensions[arrPos];
		    */
		    switch (planeOr){
		    case 'X': 
			/**
			planeYInteractors[
			    xiv.ui.layouts.Layout.INTERACTORS.CROSSHAIR_VERTICAL].
			    style.left = (
				renderPlaneY.volume.WHRatio (
				    Ratio 160 x 256) translated to 
				planeY.max

			    )
			    */
			break;
		    case 'Y': 
			break;
		    case 'Z': 
			break;
		    }
		})

	    // 
	}

    }.bind(this));
}



/**
 * As stated.
 * @private
 */
xiv.ui.ViewBox.prototype.onRenderEnd_ = function(e){

    window.console.log("ON RENDER END");
    this.hideSubComponent_(this.ProgressBarPanel_, 500);

    this.syncLayoutInteractorsToRenderer_();
    
    goog.events.unlisten(this.Renderer_, 
			 xiv.vis.RenderEngine.EventType.RENDER_START, 
			 this.onRenderStart_.bind(this));

    goog.events.unlisten(this.Renderer_, 
			 xiv.vis.RenderEngine.EventType.RENDERING, 
			 this.onRendering_.bind(this));

    goog.events.unlisten(this.Renderer_, 
			 xiv.vis.RenderEngine.EventType.RENDER_END, 
			 this.onRenderEnd_.bind(this));


    this.updateStyle();
    
}



/**
 * As stated.
 * @private
 */
xiv.ui.ViewBox.prototype.onLayoutResize_ = function(e){
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
    window.console.log(ViewableTree);
    var viewGroups = /**@type {!Array.<gxnat.vis.ViewableGroup>}*/
	ViewableTree.getViewableGroups();

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

    window.console.log("LOAD", ViewableSet);

    if (!this.subComponentsInitialized_){
	this.initSubComponents_();
	this.setComponentEvents_();

	this.ZipTabs_.setTabPageContents('TestTab1', 
					 goog.dom.createDom('div', {
					     'color': 'rgb(255,255,255)',
					     'background': 'rgb(205,25,48)',
					 }, 'Hello World.'));

	this.ZipTabs_.setTabPageContents('TestTab2',
					 goog.dom.createDom('div', {
					     'color': 'rgb(255,255,255)',
					     'background': 'rgb(205,25,48)',
					 }, 'Hello World 2.'));

	window.console.log('temporarily suspending progress bar panel');
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
	layoutPlane = this.LayoutHandler_.getCurrentLayoutPlane(key);
	//window.console.log("LAYOUT PLANE", layoutPlane, key);
	if (layoutPlane) {
	    plane.init(layoutPlane.getElement());
	}
    }.bind(this))



 
    goog.events.listen(this.Renderer_, 
		       xiv.vis.RenderEngine.EventType.RENDER_START, 
		       this.onRenderStart_.bind(this));

    goog.events.listen(this.Renderer_, 
		       xiv.vis.RenderEngine.EventType.RENDERING, 
		       this.onRendering_.bind(this));

    goog.events.listen(this.Renderer_, 
		       xiv.vis.RenderEngine.EventType.RENDER_END, 
		       this.onRenderEnd_.bind(this));

    goog.events.listen(this.LayoutHandler_, 
		       xiv.ui.layouts.LayoutHandler.EventType.RESIZE, 
		       this.onLayoutResize_.bind(this));


    this.hideSubComponent_(this.ViewableGroupMenu_, 400, function(){
	this.showSubComponent_(this.ProgressBarPanel_, 0);
    }.bind(this))


    window.console.log("RENDERING", ViewableSet, ViewableSet.getTitle);
    
    this.Renderer_.render(ViewableSet);

    
    // Remember the time in which the thumbnail was loaded
    this.thumbLoadTime_ = (new Date()).getTime();    
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
    this.ZipTabs_ = new moka.ui.ZipTabs('TOP'); 
    goog.dom.append(this.viewFrameElt_, this.ZipTabs_.getElement());
    goog.dom.classes.add(this.ZipTabs_.getElement(), 
			 xiv.ui.ViewBox.CSS.TABS);
    // Add dragger CSS and handle.
    var dragger = /**@type {!Element}*/
    this.ZipTabs_.getResizable().getDragElt('TOP');
    goog.dom.classes.add(dragger, xiv.ui.ViewBox.CSS.TABDRAGGER);
    goog.dom.append(dragger, goog.dom.createDom('div', {
	'id': xiv.ui.ViewBox.ID_PREFIX + '_DraggerHandle_' + 
	    goog.string.createUniqueString(),
	'class': xiv.ui.ViewBox.CSS.TABDRAGGER_HANDLE
    }));
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
	'Sagittal': {
	    OBJ: xiv.ui.Sagittal,
	    ICON: '/xnat/images/viewer/xiv/ui/Layouts/sagittal.png'
	},
	'Coronal': {
	    OBJ: xiv.ui.Coronal,
	    ICON: '/xnat/images/viewer/xiv/ui/Layouts/coronal.png'
	},
	'Transverse': {
	    OBJ: xiv.ui.Transverse,
	    ICON: '/xnat/images/viewer/xiv/ui/Layouts/transverse.png'
	},
	'3d': {
	    OBJ: xiv.ui.ThreeD,
	    ICON: '/xnat/images/viewer/xiv/ui/Layouts/3d.png'
	},
	'Four-Up': {
	    OBJ: xiv.ui.layouts.FourUp,
	    ICON: '/xnat/images/viewer/xiv/ui/Layouts/four-up.png'
	},
	'Conventional': {
	    OBJ: xiv.ui.layouts.Conventional,
	    ICON: '/xnat/images/viewer/xiv/ui/Layouts/conventional.png'
	},
    }, function(val, key){
	this.LayoutMenu_.addMenuItem(key, val.ICON);
	this.LayoutHandler_.addLayout(key, val.OBJ);
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
    goog.events.listen(this.ZipTabs_.getResizable(), 
		       moka.ui.Resizable.EventType.RESIZE,
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
    // Merge any new arguments and update.
    if (opt_args) {
	moka.style.setStyle(this.getElement(), opt_args);
    }    
    goog.base(this, 'updateStyle');
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

    var menuWidth = /**@type {number}*/
    goog.style.getSize(this.menus_.LEFT).width;
    var tabWidth = /**@type {number}*/ this.currSize.width;

    window.console.log(this.currSize.width, 'MENU WIDTH',
		       goog.style.getSize(this.menus_.LEFT).width)

    if (this.currSize.width <= 0) {
	this.ZipTabs_.getResizable().setBounds(
	    0,  // topLeft X
	    0,   // topLeft Y
	    tabWidth,  // botRight X
	    this.currSize.height);  //botRight Y
    } else {
	this.ZipTabs_.getResizable().setBounds(
	    0,  // topLeft X
	    this.currSize.height * xiv.ui.ViewBox.MIN_TAB_H_PCT, // topLeft Y
	    tabWidth, // botRight X
	    this.currSize.height);  // botRightY
    }
    //this.ZipTabs_.getResizable().showBoundaryElt();
    //this.ZipTabs_.deactivateAll();
    this.ZipTabs_.updateStyle();
    this.updateStyle_LayoutHandler_();
    this.updateStyle_Renderer_();
}




/**
 * As stated.
 * @private
 */
xiv.ui.ViewBox.prototype.updateStyle_LayoutHandler_ = function () {
    if (!this.LayoutHandler_) { return };
    this.LayoutHandler_.getElement().style.height = 
       (// The size of the ViewBox
        this.currSize.height -
	 // The top of the zip tabs
	parseInt(this.ZipTabs_.getElement().style.height, 10) - 
	 // The tab drag handle
	goog.style.getSize(
	    this.ZipTabs_.getResizable().getDragElt('TOP')).height
	).toString() + 'px';
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


    // Clear the reference to the groups
    goog.object.clear(this.ViewableGroups_);


    // Layout Handler
    if (goog.isDefAndNotNull(this.LayoutHandler_)){
    // Unlisten - Layout Handler
	goog.events.unlisten(this.LayoutHandler_, 
			     xiv.ui.layouts.LayoutHandler.EventType.RESIZE, 
			     this.onLayoutResize_.bind(this));
	
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
