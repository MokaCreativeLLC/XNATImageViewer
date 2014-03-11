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

// utils
goog.require('moka.ui.Component');
goog.require('moka.style');
goog.require('moka.events.EventManager');
goog.require('moka.ui.Resizeable');

// xiv
//goog.require('xiv.ui.ViewLayoutManager');
//goog.require('xiv.ui.ViewLayoutMenu');
goog.require('xiv.ui.ViewBoxTabs');
//goog.require('xiv.ui.Displayer.Xtk');
//goog.require('xiv.ui.SlicerViewMenu');




/**
 * Viewing box for viewable types (images, 3d volumes and meshes, 
 * Slicer scenes). xiv.ui.ViewBoxes accept xiv.thumbnails, either dropped or 
 * clicked in, and load them based on their characteristics.
 * xiv.ui.ViewBox is also a communicator class in the sense that it gets
 * various interaction and visualization classes to talk to one another.  F
 * or instance, it links the xiv.ui.ViewLayoutMenu to the 
 * xiv.ui.ViewLayoutManager 
 * to the xiv.ui.Displayer. 
 * @constructor
 * @extends {moka.ui.Component}
 */
goog.provide('xiv.ui.ViewBox');

xiv.ui.ViewBox = function () {
    goog.base(this);
    
    // inits
    this.createSubComponents();

    // events
    moka.events.EventManager.addEventManager(this, xiv.ui.ViewBox.EventType);
    this.setComponentCallbacks_();


    this.ViewBoxTabs_.setTabPageContents('TestTab1', 
	goog.dom.createDom('div', {
	    'color': 'rgb(255,255,255)',
	    'background': 'rgb(205,25,48)',
	}, 'Hello World.'))


    this.ViewBoxTabs_.setTabPageContents('TestTab2',
	goog.dom.createDom('div', {
	    'color': 'rgb(255,255,255)',
	    'background': 'rgb(205,25,48)',
	}, 'Hello World 2.'))


    /**
     * @type {1moka.ui.Resizeable}
     * @private
     */
    this.TabsResizeable_ = new moka.ui.Resizeable(
	this.ViewBoxTabs_.getElement(), 'ALL')
    this.TabsResizeable_.setContainment(20, 20, 300, 300, true);
    this.TabsResizeable_.setMinSize(50, 50);

    moka.style.setStyle(this.ViewBoxTabs_.getElement(), {
	'position': 'absolute',
	'left': 40,
	'top': 40,
	'height': 200,
	'width': 100,
    })




    /*
    var a = goog.dom.createDom('div', {
	'id': "ASDFASDF",
    })
    moka.style.setStyle(a, {	
	'position': 'absolute',
	'color': 'rgb(255,255,255)',
	'background-color': 'rgb(205,25,48)',
	'top': 40,
	'left': 40,
	'height': 100,
	'width': 100
    })
    goog.dom.append(this.getElement(), a);
    this.resizeable = new moka.ui.Resizeable(a , {
	maxWidth: 400,
	minWidth: 100,
	maxHeight: 400,
	minHeight: 100,
    })
    goog.dom.append(this.resizeable.getElement(), 
		    this.ViewBoxTabs_.getElement());
    */
    //window.console.log(resizeable, resizeable.getElement());
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
xiv.ui.ViewBox.DRAGGING_CLASS = 
goog.getCssName(xiv.ui.ViewBox.CSS_CLASS_PREFIX, 'dragging');


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
xiv.ui.ViewBox.MIN_TAB_HEIGHT =  15;



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

    if (this.ViewBoxTabs_){
	this.ViewBoxTabs_.setIconBaseUrl(this.iconBaseUrl);
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
 * to its xiv.ui.ViewLayoutMenu object.
 * @param {!string} viewPlane Sets the view layout associated with the argument.
 * @public
 */
xiv.ui.ViewBox.prototype.setViewLayout = function(viewPlane) {
    window.console.log("HERE", viewPlane);
    this.ViewLayoutMenu_.setViewLayout(viewPlane);
}



/**
 * Loads a thumbnail into the viewer by communicating
 * to the various internal components that handle viewing:
 * xiv.ui.ViewLayoutManager, xiv.ui.Displayer, xiv.ui.ViewLayoutMenu, xiv.ui.ViewBoxTabs, 
 * etc.
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
    // This is here because the xiv.ui.ViewBoxTabs may not fully adjust themselves
    // properly during the initiation process.  It's especially relevant
    // when multiple xiv.ui.ViewBoxes are open.
    //------------------
    this.updateStyle();

    // Adjust view layoyt manager
    this.adjustViewLayoutManager_();

    // Hide children
    this.hideChildElements_();

    // Move content divider to bottom.
    //window.console.log("SLIDE 1", this.ViewBoxBorder_.getBottomLimit());
    //this.ViewBoxBorder_.slideTo(this.ViewBoxBorder_.getBottomLimit(), false);
   
    // Feed view planes into xiv.ui.ViewLayoutManager and set 
    // the default xiv.ui.ViewLayout (most likely '3D')
    window.console.log("HERE", onloadPlane);
    this.ViewLayoutMenu_.setViewLayout(onloadPlane);

    // Turn back on animations.
    this.ViewLayoutManager_.animateViewLayoutChange(true);
    
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
xiv.ui.ViewBox.prototype.adjustViewLayoutManager_ = function(){
    this.ViewLayoutManager_.setViewPlanes(this.Displayer_.ViewPlanes, 
					  this.Displayer_.Interactors);
    this.ViewLayoutManager_.animateViewLayoutChange(false);
    this.ViewLayoutManager_.setViewLayout('none');
}




/**
 * Load the xiv.Tabs associated with the object's xiv.ui.Thumbnail.
 * @private
 */
xiv.ui.ViewBox.prototype.loadTabs_ = function() {  
    this.ViewBoxTabs_.reset();
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
    this.ViewBoxTabs_.setTabPageContents('Info', 
      this.Displayer_.createInfoTabContents(this.Thumbnail_.getViewable()));
}



/**
 * As stated.
 * @private
 */
xiv.ui.ViewBox.prototype.loadTab_SlicerViews_ = function() {
    this.ViewBoxTabs_.setTabPageContents('Slicer Views', 
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
	        this.ViewBoxTabs_.setTabPageContents(key, menuElt);
	    }
	}.bind(this))
}




/**
 * @inheritDoc
 */
xiv.ui.ViewBox.prototype.createSubComponents = function() {
    this.createTabs_();
    //this.createSlicerViewMenu_();
    //this.createViewLayoutMenu_();
    //this.createViewLayoutManager_();
    //this.createDisplayer_();
}



/**
* As stated.
* @private
*/
xiv.ui.ViewBox.prototype.createTabs_ = function(){
    /**
     * @type {xiv.ui.ViewBoxTabs}
     * @private
     */	
    this.ViewBoxTabs_ = new xiv.ui.ViewBoxTabs(); 
    goog.dom.append(this.getElement(), this.ViewBoxTabs_.getElement());
}



/**
* As stated.
* @private
*/
xiv.ui.ViewBox.prototype.createViewLayoutManager_ = function(){
    /**
     * @type {!xiv.ui.ViewLayoutManager}
     * @protected
     */
    this.ViewLayoutManager_ = new xiv.ui.ViewLayoutManager();
}



/**
* As stated.
* @private
*/
xiv.ui.ViewBox.prototype.createViewLayoutMenu_ = function(){
    /**
     * @type {!xiv.ui.ViewLayoutMenu}
     * @private
     */
    this.ViewLayoutMenu_ = new xiv.ui.ViewLayoutMenu(
	this.ViewLayoutManager_.getViewLayouts());
    goog.dom.append(this.getElement(), this.ViewLayoutMenu_.getElement());
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
xiv.ui.ViewBox.prototype.setComponentCallbacks_ = function() {
    this.setViewBoxTabsCallbacks_();
    //this.setViewLayoutMenuCallbacks_();
}



/**
 * As stated.
 * @private
 */
xiv.ui.ViewBox.prototype.setViewBoxBorderCallbacks_ = function () {
    this.ViewBoxBorder_['EVENTS'].onEvent('MOVE', 
	this.onViewBoxBorderDragging_.bind(this));
    this.ViewBoxBorder_['EVENTS'].onEvent('MOVEEND',
	this.onViewBoxBorderDragEnd_.bind(this));
}



/**
 * As stated.
 * @private
 */
xiv.ui.ViewBox.prototype.setViewBoxTabsCallbacks_ = function () {
    this.ViewBoxTabs_['EVENTS'].onEvent('CLICKED', 
	this.onViewBoxTabClicked_.bind(this));
}



/**
 * Updates the various compoents of the xiv.ui.ViewBox when the
 * user interacts with the xiv.ui.ViewLayout menu.  Specifically,
 * the xiv.ui.ViewLayoutManager.
 * @private
 */
xiv.ui.ViewBox.prototype.setViewLayoutMenuCallbacks_ = function () {

    //------------------
    // When a menu Item is clicked.
    //------------------
    this.ViewLayoutMenu_.onMenuItemClicked( function() {
	this.ViewLayoutManager_.set3DBackgroundColor(
	    this.Displayer_.BackgroundColors);
	this.ViewLayoutManager_.setViewLayout(
	    this.ViewLayoutMenu_.getSelectedViewLayout());
    }.bind(this));



    //------------------
    // Callback when all panels are visible
    //------------------
    this.ViewLayoutManager_.onMultipleViewPlanesVisible(
	function(visiblePanels){ 
	this.Displayer_.XtkPlaneManager_.colorSliders();
    }.bind(this))



    //------------------
    // Callback when one panel is visible
    //------------------
    this.ViewLayoutManager_.onOneViewPlaneVisible(function(visiblePanel){ 
	this.Displayer_.XtkPlaneManager_.uncolorSliders();
    }.bind(this))



    //------------------
    // Once the view scheme is set, 
    // update the displayer style.
    //------------------
    this.ViewLayoutManager_.onViewLayoutChanged(function(){ 
	this.Displayer_.updateStyle()
    }.bind(this));



    //------------------
    // For when the view scheme animates, 
    // update the xiv.ui.Displayer style.
    //------------------
    this.ViewLayoutManager_.onViewLayoutAnimate(function(){ 
	this.Displayer_.updateStyle()
    }.bind(this));



    //------------------
    // Callback when a plane is double clicked.
    //------------------
    this.ViewLayoutManager_.onPlaneDoubleClicked(function(anatomicalPlane){ 
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
xiv.ui.ViewBox.prototype.onViewBoxBorderDragging_ = function() {	

    var dragDir = /**@type {!number}*/ this.ViewBoxBorder_.getDragVelocity_Y();

    // Going up.
    if (dragDir < 0) {
	this.ViewBoxTabs_.activate(this.ViewBoxTabs_.getLastActiveTab());
    }

    // Going down.
    else if ((dragDir > 0) && this.ViewBoxBorder_.isNearBottomLimit()) {
	this.ViewBoxTabs_.deactivateAll();
    }

    // Update the position of the tabs and the style
    // of the xiv.ui.ViewBox.
    var contentDividerDims = /**@type {!Object.<string, number>}*/
    moka.style.dims(this.ViewBoxBorder_.getElement());
    var tabTop = /**@type {!number}*/
    contentDividerDims['top'] + contentDividerDims['height'];
    this.ViewBoxTabs_.updateStyle({ 'top': tabTop});
    this.updateStyle();
}



/**
 * Callback for when the xiv.ui.ViewBoxBorder is finished dragging.
 * @private
 */
xiv.ui.ViewBox.prototype.onViewBoxBorderDragEnd_ = function() {
    this.updateStyle();
}



/**
 * Callback for when a ViewBoxTab is activated.
 * @param {!number} clickInd The clicked tab index.
 * @private
 */
xiv.ui.ViewBox.prototype.onViewBoxTabClicked_ = function(clickInd) {
    return;
    if (this.ViewBoxBorder_.isNearBottomLimit()) {
	this.ViewBoxBorder_.slideTo(this.ViewBoxBorder_.getTopLimit(), 
				     true);
    }
    else {
	window.console.log("Not: ", clickInd);
	if (clickInd === this.ViewBoxTabs_.getLastActiveTab()){
	    this.ViewBoxBorder_.slideTo(this.ViewBoxBorder_.getBottomLimit(), 
	    true);
	}
    }    
}



/**
 * @inheritDoc
 */
xiv.ui.ViewBox.prototype.updateStyle = function (opt_args) {
 
    // Merge any new arguments and update.
    if (opt_args) {
	moka.style.setStyle(this.getElement(), opt_args);
    }

    // Get the dimensions of the view box.
    var widgetDims = /**@type {!Object.<string, number>}*/
    moka.style.dims(this.getElement());

    //this.updateStyle_self_(widgetDims);
    this.updateStyle_components_(widgetDims);
}



/**
 * As stated.
 * @param {!Object.<string, number>} widgetDims The widget dimensions.
 * @private
 */
xiv.ui.ViewBox.prototype.updateStyle_components_ = function (widgetDims) {

   


    // Tabs
    this.ViewBoxTabs_.updateStyle();
 
    return;
    // xiv.ui.ViewLayout
    this.ViewLayoutManager_.implementViewLayout();

    // Displayer
    moka.style.setStyle(this.Displayer_.getElement(), {
 	'width': widgetDims['width'],
 	'height': moka.style.dims(this.ViewBoxTabs_.getElement(), 'top')
    });
}
