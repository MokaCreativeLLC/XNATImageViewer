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
goog.require('moka.events.EventManager');
goog.require('moka.ui.ZipTabs');
goog.require('moka.ui.SlideInMenu');


// xiv
//goog.require('xiv.ui.ViewLayoutHandler');
//goog.require('xiv.ui.Displayer.Xtk');
//goog.require('xiv.ui.SlicerViewMenu');


/**
 * Viewing box for viewable types (images, 3d volumes and meshes, 
 * Slicer scenes). xiv.ui.ViewBoxes accept xiv.thumbnails, either dropped or 
 * clicked in, and load them based on their characteristics.
 * xiv.ui.ViewBox is also a communicator class in the sense that it gets
 * various interaction and visualization classes to talk to one another.  F
 * or instance, it links the moka.ui.SlideInMenu to the 
 * xiv.ui.ViewLayoutHandler 
 * to the xiv.ui.Displayer. 
 * @constructor
 * @extends {moka.ui.Component}
 */
goog.provide('xiv.ui.ViewBox');

xiv.ui.ViewBox = function () {
    goog.base(this);

    // menu
    this.addMenu_topLeft_();

    // inits
    this.createSubComponents();

    // events
    moka.events.EventManager.addEventManager(this, xiv.ui.ViewBox.EventType);
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
 * @type {!string} 
 * @const
 * @expose
 */
xiv.ui.ViewBox.ID_PREFIX =  'xiv.ui.ViewBox';



/**
 * @type {!string} 
 * @const
*/
xiv.ui.ViewBox.CSS_CLASS_PREFIX =
goog.string.toSelectorCase(xiv.ui.ViewBox.ID_PREFIX.toLowerCase().
			   replace(/\./g,'-'));



/**
 * @type {string} 
 * @const
 */
xiv.ui.ViewBox.ELEMENT_CLASS = 
goog.getCssName(xiv.ui.ViewBox.CSS_CLASS_PREFIX, '');



/**
 * @type {string} 
 * @const
 */
xiv.ui.ViewBox.HIDDEN_CLASS = 
goog.getCssName(xiv.ui.ViewBox.CSS_CLASS_PREFIX, 'hidden');



/**
 * @type {string} 
 * @const
 */
xiv.ui.ViewBox.DRAG_AND_DROP_HANDLE_CLASS = 
goog.getCssName(xiv.ui.ViewBox.CSS_CLASS_PREFIX, 'draganddrophandle');



/**
 * @type {string} 
 * @const
 */
xiv.ui.ViewBox.TAB_DRAGGER_CLASS = 
goog.getCssName(xiv.ui.ViewBox.CSS_CLASS_PREFIX, 'tabdragger');



/**
 * @type {string} 
 * @const
 */
xiv.ui.ViewBox.TAB_DRAGGER_HANDLE_CLASS = 
goog.getCssName(xiv.ui.ViewBox.DRAGGER_CLASS, 'tabhandle');



/**
 * @type {string} 
 * @const
 */
xiv.ui.ViewBox.VIEWLAYOUTMENU_CLASS = 
goog.getCssName(xiv.ui.ViewBox.CSS_CLASS_PREFIX, 'viewlayoutmenu');


/**
 * @type {!string}
 * @expose 
 * @const
 */
xiv.ui.ViewBox.MENU_TOP_LEFT_CLASS =  
    goog.getCssName(xiv.ui.ViewBox.CSS_CLASS_PREFIX, 'menu-top-left');



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
 * @type {number}
 * @private
 */
xiv.ui.ViewBox.prototype.thumbLoadTime_;



/**
 * @type {Displayer}
 * @private
 */
xiv.ui.ViewBox.prototype.Displayer_;



/**
 * @type {xiv.ui.Thumbnail}
 * @private
 */
xiv.ui.ViewBox.prototype.Thumbnail_;



/**
 * @type {Array.<Element>}
 * @private
 */
xiv.ui.ViewBox.prototype.doNotHide_;



/**
 * @type {!String}
 * @private
 */
xiv.ui.ViewBox.prototype.loadFramework_ = 'XTK';



/**
 * @type {!String}
 * @private
 */
xiv.ui.ViewBox.prototype.loadState_ = 'empty';



/**
 * @type {Object}
 * @private
 */
xiv.ui.ViewBox.prototype.menus_ = {
    TOP: null,
    LEFT: null,
    BOTTOM: null,
    RIGHT: null
};



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
xiv.ui.ViewBox.prototype.setViewLayout = function(viewPlane) {
    this.ViewLayoutMenu_.setViewLayout(viewPlane);
}



/**
 * Loads a thumbnail into the viewer by communicating
 * to the various internal components.
 * @param {!xiv.ui.Thumbnail} thumb The thumbnail to load into the viewer.
 * @public
 */
xiv.ui.ViewBox.prototype.loadThumbnail = function (Thumbnail) {

    var onloadPlane =  /**@type {!string}*/ '3D';
    var controllerMenu = /**@type {xiv.ui.XtkControllerMenu}*/ undefined;
    
    // Set load state.
    this.loadState_ = 'loading';

    // Track the thumbnail internally.
    this.Thumbnail_ = Thumbnail;

    // Run Thumbnail preLoaded callbacks 
    this['EVENTS'].runEvent('THUMBNAIL_PRELOAD', this)

    // Remember the time in which the thumbnail was loaded
    this.thumbLoadTime_ = (new Date()).getTime();

    //------------------
    // This is here because the moka.ui.ZipTabs may not fully adjust themselves
    // properly during the initiation process.  It's especially relevant
    // when multiple xiv.ui.ViewBoxes are open.
    //------------------
    this.updateStyle();

    // Adjust view layoyt manager
    this.adjustViewLayoutHandler_();

    // Hide children
    this.hideChildElements_();

    // Move content divider to bottom.
    //window.console.log("SLIDE 1", this.ViewBoxBorder_.getBottomLimit());
    //this.ViewBoxBorder_.slideTo(this.ViewBoxBorder_.getBottomLimit(), false);
   
    // Feed view planes into xiv.ui.ViewLayoutHandler and set 
    // the default xiv.ui.ViewLayout (most likely '3D')
    window.console.log("HERE", onloadPlane);
    this.ViewLayoutMenu_.setViewLayout(onloadPlane);

    // Turn back on animations.
    this.ViewLayoutHandler_.animateViewLayoutChange(true);
    
    // Show/hide the slicer view menu depending on the 
    // Thumbnail's getViewable()   
    this.SlicerViewMenu_.getElement().style.visibility = 
	(this.Thumbnail_.getViewable()['category'].toLowerCase() === 
	 'slicer') ? 'visible' : 'hidden';

    // Load into displayer
    this.Displayer_.load(this.Thumbnail_.getViewable());    
}
 





/**
 * As stated.
* @private
*/
xiv.ui.ViewBox.prototype.adjustViewLayoutHandler_ = function(){
    this.ViewLayoutHandler_.setViewPlanes(this.Displayer_.ViewPlanes, 
					  this.Displayer_.Interactors);
    this.ViewLayoutHandler_.animateViewLayoutChange(false);
    this.ViewLayoutHandler_.setViewLayout('none');
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
xiv.ui.ViewBox.prototype.createSubComponents = function() {
    this.createTabs_();
    this.createViewLayoutMenu_();
    //this.createSlicerViewMenu_();
    
    //this.createViewLayoutHandler_();
    //this.createDisplayer_();
}



/**
* As stated.
* @private
*/
xiv.ui.ViewBox.prototype.createTabs_ = function(){
    /**
     * @type {moka.ui.ZipTabs}
     * @private
     */	
    this.ZipTabs_ = new moka.ui.ZipTabs('BOTTOM'); 
    goog.dom.append(this.getElement(), this.ZipTabs_.getElement());

    // Add dragger CSS and handle.
    var dragger = /**@type {!Element}*/
    this.ZipTabs_.getResizable().getDragElt('TOP');
    goog.dom.classes.add(dragger, xiv.ui.ViewBox.DRAGGER_CLASS);
    goog.dom.append(dragger, goog.dom.createDom('div', {
	'id': 'DraggerHandle_' + goog.string.createUniqueString(),
	'class': xiv.ui.ViewBox.DRAGGER_HANDLE_CLASS
    }));
}



/**
* As stated.
* @private
*/
xiv.ui.ViewBox.prototype.createViewLayoutHandler_ = function(){
    /**
     * @type {!xiv.ui.ViewLayoutHandler}
     * @protected
     */
    this.ViewLayoutHandler_ = new xiv.ui.ViewLayoutHandler();
}



/**
 * @private
 */
xiv.ui.ViewBox.prototype.addMenu_topLeft_ = function() {

    this.menus_.LEFT = goog.dom.createDom("div",  {
	'id': xiv.ui.ViewBox.ID_PREFIX + 
	    '_menu_top_left_' + goog.string.createUniqueString(),
	'class' : xiv.ui.ViewBox.MENU_TOP_LEFT_CLASS,
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
xiv.ui.ViewBox.prototype.createViewLayoutMenu_ = function(){
    /**
     * @type {!moka.ui.SlideInMenu}
     * @private
     */
    this.ViewLayoutMenu_ = new moka.ui.SlideInMenu();
    this.addToMenu('LEFT', this.ViewLayoutMenu_.getElement());

    goog.dom.classes.add(this.ViewLayoutMenu_.getElement(), 
	xiv.ui.ViewBox.VIEWLAYOUTMENU_CLASS);

    this.ViewLayoutMenu_.setMenuIconSrc(
	'/xnat/images/viewer/xiv/ui/ViewLayoutMenu/menu.png')
    moka.ui.SlideInMenu.Layouts  = {
	'SAGITTAL' : 'Sagittal',
	'CORONAL': 'Coronal',
	'TRANSVERSE': 'Transverse',
	'THREE_D': '3D',
	'CONVENTIONAL': 'Conventional',
	'FOUR_UP': 'Four-Up',
    }
    this.ViewLayoutMenu_.addMenuItem(goog.object.getValues(
	moka.ui.SlideInMenu.Layouts), [
	    '/xnat/images/viewer/xiv/ui/ViewLayout/sagittal.png',
	    '/xnat/images/viewer/xiv/ui/ViewLayout/coronal.png',
	    '/xnat/images/viewer/xiv/ui/ViewLayout/transverse.png',
	    '/xnat/images/viewer/xiv/ui/ViewLayout/3d.png',
	    '/xnat/images/viewer/xiv/ui/ViewLayout/conventional.png',
	    '/xnat/images/viewer/xiv/ui/ViewLayout/four-up.png',
	]);


    this.ViewLayoutMenu_.setHidePosition(-40, 0);
    this.ViewLayoutMenu_.setShowPosition(24,0);
    this.ViewLayoutMenu_.matchMenuIconToSelected(true);
    this.ViewLayoutMenu_.matchMenuTitleToSelected(true);

    goog.dom.append(this.getElement(), this.ViewLayoutMenu_.getMenuHolder());
}



/**
* As stated.
* @private
*/
xiv.ui.ViewBox.prototype.createSlicerViewMenu_ = function(){
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
xiv.ui.ViewBox.prototype.createDisplayer_ = function(){
    // Retrieve the loadFramework.
    switch (this.loadFramework_){
    case 'XTK': 
	this.Displayer_ = new xiv.ui.Displayer.Xtk(this);
	break;
    }
    goog.dom.append(this.getElement(), this.Displayer_.getElement());

    // Onload callbacks
    this.Displayer_.onLoaded = this.onDisplayerLoaded_.bind(this)
}



/**
 * Show child elements of the xiv.ui.ViewBox. 
 * @private
 */
xiv.ui.ViewBox.prototype.showChildElements_ = function() {
    goog.array.forEach(this.getElement().childNodes, function(childElt){
	goog.dom.classes.remove(childElt, xiv.ui.ViewBox.HIDDEN_CLASS);
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
	    goog.dom.classes.add(childElt, xiv.ui.ViewBox.HIDDEN_CLASS);
	}
    }.bind(this))
}



/**
* As stated.
* @private
*/
xiv.ui.ViewBox.prototype.setComponentEvents_ = function() {
    this.setTabsEvents_();
    this.setViewLayoutMenuEvents_();
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
 * user interacts with the xiv.ui.ViewLayout menu.  Specifically,
 * the xiv.ui.ViewLayoutHandler.
 * @private
 */
xiv.ui.ViewBox.prototype.setViewLayoutMenuEvents_ = function () {


    goog.events.listen(this.ViewLayoutMenu_, 
		       moka.ui.SlideInMenu.EventType.ITEM_SELECTED,
        function(e) {
	    window.console.log("ITEM SELECTED!", e.title, e.index);
	    window.console.log('trigger ViewLayoutHandler_ here!');
	}.bind(this));

    return;

    //------------------
    // When a menu Item is clicked.
    //------------------
    this.ViewLayoutMenu_.onMenuItemClicked( function() {
	this.ViewLayoutHandler_.set3DBackgroundColor(
	    this.Displayer_.BackgroundColors);
	this.ViewLayoutHandler_.setViewLayout(
	    this.ViewLayoutMenu_.getSelectedViewLayout());
    }.bind(this));



    //------------------
    // Callback when all panels are visible
    //------------------
    this.ViewLayoutHandler_.onMultipleViewPlanesVisible(
	function(visiblePanels){ 
	this.Displayer_.XtkPlaneManager_.colorSliders();
    }.bind(this))



    //------------------
    // Callback when one panel is visible
    //------------------
    this.ViewLayoutHandler_.onOneViewPlaneVisible(function(visiblePanel){ 
	this.Displayer_.XtkPlaneManager_.uncolorSliders();
    }.bind(this))



    //------------------
    // Once the view scheme is set, 
    // update the displayer style.
    //------------------
    this.ViewLayoutHandler_.onViewLayoutChanged(function(){ 
	this.Displayer_.updateStyle()
    }.bind(this));



    //------------------
    // For when the view scheme animates, 
    // update the xiv.ui.Displayer style.
    //------------------
    this.ViewLayoutHandler_.onViewLayoutAnimate(function(){ 
	this.Displayer_.updateStyle()
    }.bind(this));



    //------------------
    // Callback when a plane is double clicked.
    //------------------
    this.ViewLayoutHandler_.onPlaneDoubleClicked(function(anatomicalPlane){ 
	window.console.log("HERE", anatomicalPlane);
	this.ViewLayoutMenu_.setViewLayout(anatomicalPlane);
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
    window.console.log("HERE", this.Displayer_.getViewLayout());
    this.ViewLayoutMenu_.setViewLayout(this.Displayer_.getViewLayout());
    this.showChildElements_();
    this.loadTabs_();

    // Thumbnail loaded callbacks
    this['EVENTS'].runEvent('THUMBNAIL_LOADED', this)
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

    var size = /**@type {!goog.math.Size}*/ 
    goog.style.getSize(this.getElement());
    var pos = /**@type {!goog.math.Coordinate}*/ 
    goog.style.getPosition(this.getElement());

    this.updateStyle_Tabs_(size, pos);
    //this.updateStyle_ViewLayoutHandler_(size, pos);
    //this.updateStyle_Displayer_(size, pos);
}



/**
 * As stated.
 * @param {!goog.math.Size} size
 * @param {!goog.math.Coordinate} pos
 * @private
 */
xiv.ui.ViewBox.prototype.updateStyle_Tabs_ = function (size, pos) {
    if (size.width <= 0) {
	this.ZipTabs_.getResizable().setBounds(0, 0, size.width, size.height);
    } else {
	this.ZipTabs_.getResizable().setBounds(0, 
		size.width * xiv.ui.ViewBox.MIN_TAB_H_PCT, 
					     size.width, size.height);
    }
    //this.ZipTabs_.getResizable().showBoundaryElt();
    //this.ZipTabs_.deactivateAll();
    this.ZipTabs_.updateStyle();
}



/**
 * As stated.
 * @param {!goog.math.Size} size
 * @param {!goog.math.Coordinate} pos
 * @private
 */
xiv.ui.ViewBox.prototype.updateStyle_ViewLayoutHandler_ = function (size, pos) {
    this.ViewLayoutHandler_.implementViewLayout();
}



/**
 * As stated.
 * @param {!goog.math.Size} size
 * @param {!goog.math.Coordinate} pos
 * @private
 */
xiv.ui.ViewBox.prototype.updateStyle_Displayer_ = function (size, pos) {
    goog.style.setSize(this.Displayer_.getElement(), size.width,  
		       parseInt(this.ZipTabs_.getElement().style.top, 10))
}
