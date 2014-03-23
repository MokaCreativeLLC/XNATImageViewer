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
goog.require('xiv.ui.ProgressBarPanel');
goog.require('xiv.ui.LayoutHandler');
goog.require('xiv.renderer.XtkEngine');
//goog.require('xiv.ui.SlicerViewMenu');


/**
 * Viewing box for viewable types (images, 3d volumes and meshes, 
 * Slicer scenes). xiv.ui.ViewBoxes accept xiv.thumbnails, either dropped or 
 * clicked in, and load them based on their characteristics.
 * xiv.ui.ViewBox is also a communicator class in the sense that it gets
 * various interaction and visualization classes to talk to one another.  F
 * or instance, it links the moka.ui.SlideInMenu to the 
 * xiv.ui.LayoutHandler 
 * to the xiv.ui.Displayer. 
 * @constructor
 * @extends {moka.ui.Component}
 */
goog.provide('xiv.ui.ViewBox');

xiv.ui.ViewBox = function () {
    goog.base(this);


    /**
     * @type {Array.<gxnat.Viewable>}
     * @private
     */
    this.Viewables_ = [];


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
     * @type {?xiv.ui.LayoutHandler}
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
     * @type {xiv.renderer.XtkEngine}
     * @private
     */
    this.Renderer_ = null;



    /**
     * @type {xiv.ui.ProgressBarPanel}
     * @private
     */
    this.ProgressBarPanel_ = null;



    /**
     * @type {!xiv.ui.SlicerViewMenu}
     * @private
     */
    this.SlicerViewMenu_ = null;




    /**
     * @type {!boolean}
     * @private
     */
    this.subComponentsInitialized_ = false;


    //window.console.log(resizable, resizable.getElement());
    // style
    //this.doNotHide(this.SlicerViewMenu_.getElement());
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
    COMPONENT_HIGHLIGHT: 'component-highlight'
}



/**
 * @dict
 * @const
 */
xiv.ui.ViewBox.defaultLayout = {
    'Scans' : 'Four-Up',
    'Slicer' : 'Conventional'
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
 * @return {!Array.<gxnat.Viewable>} 
 * @public
 */
xiv.ui.ViewBox.prototype.getViewables =  function() {
    return this.Viewables_;
}



/**
 * @return {!xiv.ui.LayoutHandler} 
 * @public
 */
xiv.ui.ViewBox.prototype.getLayoutHandler =  function() {
    return this.LayoutHandler_;
}



/**
 * Get the associated SlicerViewMenu for this object.
 * @return {!xiv.ui.SlicerViewMenu} The SlicerViewMenu object of the ViewBox.
 * @public
 */
xiv.ui.ViewBox.prototype.getSlicerViewMenu =  function() {
    return this.SlicerViewMenu_;
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
    //this.LayoutHandler_.showProgBarLayout(true);
}



/**
 * As stated.
 * @private
 */
xiv.ui.ViewBox.prototype.onRendering_ = function(e){
    this.ProgressBarPanel_.setValue(e.percentComplete);
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

	if (interactors[xiv.ui.Layout.INTERACTORS.SLIDER]){

	    var slider = /**@type {!moka.ui.GenericSlider}*/
	    interactors[xiv.ui.Layout.INTERACTORS.SLIDER];
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
		    interactors[xiv.ui.Layout.INTERACTORS.SLIDER].getMaximum()
		    - interactors[xiv.ui.Layout.INTERACTORS.SLIDER].getValue();

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
			    xiv.ui.Layout.INTERACTORS.CROSSHAIR_VERTICAL].
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
    this.hideProgressBarPanel_(500);

    this.syncLayoutInteractorsToRenderer_();
    
    goog.events.unlisten(this.Renderer_, 
			 xiv.renderer.XtkEngine.EventType.RENDER_START, 
			 this.onRenderStart_.bind(this));

    goog.events.unlisten(this.Renderer_, 
			 xiv.renderer.XtkEngine.EventType.RENDERING, 
			 this.onRendering_.bind(this));

    goog.events.unlisten(this.Renderer_, 
			 xiv.renderer.XtkEngine.EventType.RENDER_END, 
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
 * @param {gxnat.Viewable} Viewable
 * @return {!boolean} Whether or not the viewable needs a preload workflow.
 * @private
 */
xiv.ui.ViewBox.prototype.needsPreload_ = function(Viewable){
    if (Viewable['category'] == 'Slicer Scenes'){
	return true;
    }
    return false;
}



/**
 * Loads a gxnat.Viewable object into the appropriate renderers.
 *
 * @param {!gxnat.Viewable} viewable.
 * @public
 */
xiv.ui.ViewBox.prototype.load = function (viewable) {

    if (!this.subComponentsInitialized_){
	this.initSubComponents_();
	this.setComponentEvents_();

	this.ZipTabs_.setTabPageContents('TestTab1', 
					 goog.dom.createDom('div', {
					     'color': 'rgb(255,255,255)',
					     'background': 'rgb(205,25,48)',
					 }, 'Hello World.'))


	this.ZipTabs_.setTabPageContents('TestTab2',
					 goog.dom.createDom('div', {
					     'color': 'rgb(255,255,255)',
					     'background': 'rgb(205,25,48)',
					 }, 'Hello World 2.'))
	this.showProgressBarPanel_(400);
    }
    if (!goog.array.contains(this.Viewables_, viewable)){
	this.Viewables_.push(viewable);	
    }

    
    window.console.log('VIEWABLE DROPPED', viewable);

    
    if (this.needsPreload_(viewable)){
	window.console.log('NEEDS PRELOAD', viewable);
	this.runPreloadWorklow_(viewable);
	return;
    }
    

    if (this.Viewables_.length == 1) {
	this.LayoutHandler_.setLayout(
	    xiv.ui.ViewBox.defaultLayout[viewable['category']]);
    }

    
    // Set plane containers
    goog.object.forEach(this.Renderer_.getPlanes(), function(plane, key) { 
	var layoutPlane = this.LayoutHandler_.getCurrentLayoutPlane(key);
	//window.console.log("LAYOUT PLANE", layoutPlane, key);
	if (layoutPlane) {
	    plane.init(layoutPlane.getElement());
	}
    }.bind(this))


    window.console.log(xiv.renderer.XtkEngine.getViewables(viewable['files']));

    //
    goog.events.listen(this.Renderer_, 
		       xiv.renderer.XtkEngine.EventType.RENDER_START, 
		       this.onRenderStart_.bind(this));

    goog.events.listen(this.Renderer_, 
		       xiv.renderer.XtkEngine.EventType.RENDERING, 
		       this.onRendering_.bind(this));

    goog.events.listen(this.Renderer_, 
		       xiv.renderer.XtkEngine.EventType.RENDER_END, 
		       this.onRenderEnd_.bind(this));


    goog.events.listen(this.LayoutHandler_, 
		       xiv.ui.LayoutHandler.EventType.RESIZE, 
		       this.onLayoutResize_.bind(this));


    // Add to renderer
    this.Renderer_.render(viewable['files']);

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
    if (this.Thumbnail_.getViewable()['category'] == 'Slicer') {
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
		this.SlicerViewMenu_.getThumbnailGallery());
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
    
    //this.initSlicerViewMenu_();
    this.initRenderer_();
    this.initProgressBarPanel_();


    this.subComponentsInitialized_ = true;
}



/**
* As stated.
 * @param {number=} opt_fadeTime The optional fade time.  Defaults to 0;
* @private
*/
xiv.ui.ViewBox.prototype.showProgressBarPanel_ = function(opt_fadeTime){
    opt_fadeTime = (goog.isNumber(opt_fadeTime) && opt_fadeTime >=0) ? 
	opt_fadeTime : 0;
    this.ProgressBarPanel_.getElement().style.opacity = '0';
    this.ProgressBarPanel_.getElement().style.visibility = 'visible';
    if (opt_fadeTime == 0) { 
	this.ProgressBarPanel_.getElement().style.opacity = '1';
	return;
    } 
    moka.fx.fadeIn(this.ProgressBarPanel_.getElement(), opt_fadeTime);
}



/**
* As stated.
 * @param {number=} opt_fadeTime The optional fade time.  Defaults to 0;
* @private
*/
xiv.ui.ViewBox.prototype.hideProgressBarPanel_ = function(opt_fadeTime){
    opt_fadeTime = (goog.isNumber(opt_fadeTime) && opt_fadeTime >=0) ? 
	opt_fadeTime : 0;
    this.ProgressBarPanel_.getElement().style.opacity = '1';
    this.ProgressBarPanel_.getElement().style.visibility = 'visible';
    if (opt_fadeTime == 0) { 
	this.ProgressBarPanel_.getElement().style.visibility = 'hidden';
	return;
    } 
    moka.fx.fadeOut(this.ProgressBarPanel_.getElement(), opt_fadeTime, 
	function(){
	    this.ProgressBarPanel_.getElement().style.visibility = 'hidden';
	}.bind(this));
}




/**
* As stated.
* @private
*/
xiv.ui.ViewBox.prototype.initProgressBarPanel_ = function(){
    this.ProgressBarPanel_ = new xiv.ui.ProgressBarPanel(); 
    goog.dom.append(this.viewFrameElt_, this.ProgressBarPanel_.getElement());
    this.ProgressBarPanel_.getElement().style.zIndex = 100000;
    this.ProgressBarPanel_.setLabel('Loading:', true);
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
    this.LayoutHandler_ = new xiv.ui.LayoutHandler();
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
	    OBJ: xiv.ui.FourUp,
	    ICON: '/xnat/images/viewer/xiv/ui/Layouts/four-up.png'
	},
	'Conventional': {
	    OBJ: xiv.ui.Conventional,
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
* @private
*/
xiv.ui.ViewBox.prototype.initSlicerViewMenu_ = function(){
    this.SlicerViewMenu_ = new xiv.ui.SlicerViewMenu(this);
    goog.dom.append(this.getElement(), this.SlicerViewMenu_.getElement());
}



/**
 * Initializes the 'xiv.ui.Displayer' object which allows
 * various viewable content to be displayed, based on 
 * the 'loadFramework' internal variable.
 * @private
 */
xiv.ui.ViewBox.prototype.initRenderer_ = function(){
    this.Renderer_ = new xiv.renderer.XtkEngine();
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


    // Layout Handler
    if (goog.isDefAndNotNull(this.LayoutHandler_)){
    // Unlisten - Layout Handler
	goog.events.unlisten(this.LayoutHandler_, 
			     xiv.ui.LayoutHandler.EventType.RESIZE, 
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
