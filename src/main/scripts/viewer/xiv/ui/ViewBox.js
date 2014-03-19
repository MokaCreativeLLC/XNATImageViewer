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

// utils
goog.require('moka.ui.Component');
goog.require('moka.style');
goog.require('moka.ui.ZipTabs');
goog.require('moka.ui.SlideInMenu');


// xiv
goog.require('xiv.ui.layouts.LayoutHandler');
goog.require('xiv.renderer.XtkEngine');
//goog.require('xiv.ui.SlicerViewMenu');


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
     * @type {Array.<gxnat.Viewable>}
     * @private
     */
    this.currViewables_ = [];


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
    // menu
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



    /**
     * @type {!xiv.ui.layouts.LayoutHandler}
     * @protected
     */
    this.LayoutHandler_ = new xiv.ui.layouts.LayoutHandler();



    /**
     * @type {moka.ui.ZipTabs}
     * @private
     */	
    this.ZipTabs_ = new moka.ui.ZipTabs('BOTTOM'); 



    /**
     * @type {!moka.ui.SlideInMenu}
     * @private
     */
    this.LayoutMenu_ = new moka.ui.SlideInMenu();



    /**
     * @type {xiv.renderer.Engine}
     */
    this.Renderer_ = new xiv.renderer.XtkEngine();



    
    this.initSubComponents_();


    // events
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
 * @return {!xiv.ui.layouts.LayoutHandler} 
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
 * @return {?xiv.ui.Thumbnail} The current thumbnail associated with the ViewBox.
 * @public
 */	
xiv.ui.ViewBox.prototype.getThumbnail = function(){
    return this.Thumbnail_;
}



/**
 * Get the associated thumbnail load time for this object.
 * @return {number} The date (in millseconds) when the last thumbnail was 
 *     loaded into the ViewBox.
 * @public
 */
xiv.ui.ViewBox.prototype.highlight =  function() {
    //this.getElement().style.border = 'solid 1px rgb(25,255,255)';
    goog.dom.classes.add(this.LayoutHandler_.getElement(), 
			 xiv.ui.ViewBox.CSS.COMPONENT_HIGHLIGHT);
    goog.dom.classes.add(this.menus_.LEFT, 
			 xiv.ui.ViewBox.CSS.COMPONENT_HIGHLIGHT);
    goog.dom.classes.add(this.ZipTabs_, 
			 xiv.ui.ViewBox.CSS.COMPONENT_HIGHLIGHT);
}



/**
 * @public
 */
xiv.ui.ViewBox.prototype.unhighlight =  function() {
    goog.dom.classes.remove(this.LayoutHandler_.getElement(), 
			 xiv.ui.ViewBox.CSS.COMPONENT_HIGHLIGHT);
    goog.dom.classes.remove(this.menus_.LEFT, 
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
 * @dict
 * @const
 */
xiv.ui.ViewBox.defaultLayout = {
    'Scan' : 'Four-Up',
    'Scans' : 'Four-Up',
    'Slicer' : 'Conventional'
}



xiv.ui.ViewBox.prototype.onRenderStart_ = function(){
    this.LayoutHandler_.showProgBarLayout(true);
}



xiv.ui.ViewBox.prototype.onRenderStart_ = function(e){
    this.LayoutHandler_.updateProgBarLayout(e.pctComplete);
}




xiv.ui.ViewBox.prototype.onRenderEnd_ = function(e){
    this.LayoutHandler_.hideProgBarLayout(true);
    this.syncLayoutComponentsToRenderer_();

    goog.events.unlisten(this.Renderer_, 
			 xiv.renderer.EventType.RENDER_START, 
			 this.onRenderStart_.bind(this));

    goog.events.unlisten(this.Renderer_, 
			 xiv.renderer.EventType.RENDERING, 
			 this.onRendering_.bind(this));

    goog.events.unlisten(this.Renderer_, 
			 xiv.renderer.EventType.RENDER_END, 
			 this.onRenderEnd_.bind(this));
    
}



/**
 * Loads a gxnat.Viewable object into the appropriate renderers.
 *
 * @param {!gxnat.Viewable} viewable.
 * @public
 */
xiv.ui.ViewBox.prototype.load = function (viewable) {


    if (!goog.array.contains(this.currViewables_, viewable)){
	this.currViewables_.push(viewable);	
    }

    
    /**
    if (this.needsPreloadWorkflow_(viewable)){
	this.runPreloadWorklow_(viewable);
	return;
    }
    */
    window.console.log(viewable);

    if (this.currViewables_.length == 1) {
	this.LayoutHandler_.setLayout(
	    xiv.ui.ViewBox.defaultLayout[viewable['category']]);
    }

    
    // Set plane containers
    goog.object.forEach(this.Renderer_.getPlanes(), 
	function(plane, key) { 
	    var layoutPlane = this.LayoutHandler_.getCurrentLayoutPlane(key);
	    //window.console.log("LAYOUT PLANE", layoutPlane, key);
	    if (layoutPlane) {
		plane.init(layoutPlane.getElement());
	    }
	}.bind(this))


    window.console.log(xiv.renderer.XtkEngine.getViewables(viewable['files']));


    // Add to renderer
    this.Renderer_.render(viewable['files']);

    return;

    //
    goog.events.listen(this.Renderer_, 
		       xiv.renderer.EventType.RENDER_START, 
		       this.onRenderStart_.bind(this));

    goog.events.listen(this.Renderer_, 
		       xiv.renderer.EventType.RENDERING, 
		       this.onRendering_.bind(this));

    goog.events.listen(this.Renderer_, 
		       xiv.renderer.EventType.RENDER_END, 
		       this.onRenderEnd_.bind(this));



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
    this.initViewFrameElt_();
    this.initTabs_();
    this.initLayoutMenu_();
    this.initLayoutHandler_();
    this.syncLayoutMenuToLayoutHandler_();
    
    //this.initSlicerViewMenu_();
    this.initRenderer_();
}



/**
* As stated.
* @private
*/
xiv.ui.ViewBox.prototype.initViewFrameElt_ = function(){ 
    goog.dom.append(this.getElement(), this.viewFrameElt_);
}



/**
* As stated.
* @private
*/
xiv.ui.ViewBox.prototype.initTabs_ = function(){

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
	'3d': {
	    OBJ: xiv.ui.layouts.ThreeD,
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
	moka.ui.SlideInMenu.EventType.ITEM_SELECTED,function(e) {
	    window.console.log("ITEM SELECTED!", e.title, e.index);
	    //window.console.log('trigger LayoutHandler_ here!');
	    this.LayoutHandler_.setLayout(e.title);
	}.bind(this));
}




/**
* As stated.
* @private
*/
xiv.ui.ViewBox.prototype.initSlicerViewMenu_ = function(){
    /**
     * @type {!xiv.ui.SlicerViewMenu}
     * @private
     */
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
        function(e) {
	    this.onTabsResize_();    
	}.bind(this));
}



/**
 * Updates the various compoents of the xiv.ui.ViewBox when the
 * user interacts with the xiv.ui.Layout menu.  Specifically,
 * the xiv.ui.layouts.LayoutHandler.
 * @private
 */
xiv.ui.ViewBox.prototype.setLayoutMenuEvents_ = function () {


    return;

    //------------------
    // When a menu Item is clicked.
    //------------------
    this.LayoutMenu_.onMenuItemClicked( function() {
	this.LayoutHandler_.set3DBackgroundColor(
	    this.Displayer_.BackgroundColors);
	this.LayoutHandler_.setLayout(
	    this.LayoutMenu_.getSelectedLayout());
    }.bind(this));



    //------------------
    // Callback when all panels are visible
    //------------------
    this.LayoutHandler_.onMultipleViewPlanesVisible(
	function(visiblePanels){ 
	this.Displayer_.XtkPlaneManager_.colorSliders();
    }.bind(this))



    //------------------
    // Callback when one panel is visible
    //------------------
    this.LayoutHandler_.onOneViewPlaneVisible(function(visiblePanel){ 
	this.Displayer_.XtkPlaneManager_.uncolorSliders();
    }.bind(this))



    //------------------
    // Once the view scheme is set, 
    // update the displayer style.
    //------------------
    this.LayoutHandler_.onLayoutChanged(function(){ 
	this.Displayer_.updateStyle()
    }.bind(this));



    //------------------
    // For when the view scheme animates, 
    // update the xiv.ui.Displayer style.
    //------------------
    this.LayoutHandler_.onLayoutAnimate(function(){ 
	this.Displayer_.updateStyle()
    }.bind(this));

}



/**
 * Callback for when the displayer is loaded.
 * @private
 */
xiv.ui.ViewBox.prototype.onDisplayerLoaded_ = function(){
    this.loadState_ = 'loaded';

    if (this.getElement().hasAttribute('originalbordercolor')){
	this.getElement().style.borderColor = 
	    this.getElement().getAttribute('originalbordercolor');
    }
    window.console.log("HERE", this.Displayer_.getLayout());
    this.LayoutMenu_.setLayout(this.Displayer_.getLayout());
    this.showChildElements_();
    this.loadTabs_();

    // Thumbnail loaded callbacks
    this.dispatchEvent({
	type: xiv.ui.ViewBox.EventType.THUMBNAIL_LOADED
    })
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
    this.updateStyle_Tabs_();
    this.updateStyle_LayoutHandler_();
    //this.updateStyle_Displayer_(size, pos);
}



/**
 * As stated.
 * @private
 */
xiv.ui.ViewBox.prototype.updateStyle_Tabs_ = function () {


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
}



/**
 * As stated.
 * @private
 */
xiv.ui.ViewBox.prototype.updateStyle_LayoutHandler_ = function () {
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
xiv.ui.ViewBox.prototype.disposeInternal = function () {
    goog.base(this, 'disposeInternal');


    goog.dom.remove(this.viewFrameElt_);

    goog.dispose(this.LayoutHandler_.disposeInternal());
    delete this.LayoutHandler_;

    goog.dispose(this.LayoutMenu_.disposeInternal());
    delete this.LayoutMenu_;

    goog.dispose(this.ZipTabs_.disposeInternal());
    delete this.ZipTabs_;

    this.Renderer_.dispose();
    delete this.Renderer_();
  
    delete this.currViewables_;
    delete this.menus_;

    window.console.log("TODO: " + 
		       "NEED TO DELETE ALL EVENT LISTENERS IN THE VIEW BOX!");

}
