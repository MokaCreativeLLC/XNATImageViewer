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
goog.require('utils.style');
goog.require('utils.events.EventManager');

// xiv
goog.require('xiv.Widget');
goog.require('xiv.ViewLayoutManager');
goog.require('xiv.ViewLayoutMenu');
goog.require('xiv.ContentDivider');
goog.require('xiv.ViewBoxTabs');
goog.require('xiv.Displayer.Xtk');
goog.require('xiv.SlicerViewMenu');




/**
 * Viewing box for viewable types (images, 3d volumes and meshes, 
 * Slicer scenes). xiv.ViewBoxes accept xiv.thumbnails, either dropped or 
 * clicked in, and load them based on their characteristics.
 * xiv.ViewBox is also a communicator class in the sense that it gets
 * various interaction and visualization classes to talk to one another.  F
 * or instance, it links the xiv.ViewLayoutMenu to the xiv.ViewLayoutManager 
 * to the xiv.Displayer. 
 * @constructor
 * @extends {xiv.Widget}
 */
goog.provide('xiv.ViewBox');
xiv.ViewBox = function () {
    goog.base(this);
    
    // inits
    this.initComponents_();

    // events
    utils.events.EventManager.addEventManager(this, xiv.ViewBox.EventType);
    this.setComponentCallbacks_();

    // style
    this.doNotHide(this.SlicerViewMenu_.getElement());
    this.hideChildElements_();
    this.updateStyle();
}
goog.inherits(xiv.ViewBox, xiv.Widget);
goog.exportSymbol('xiv.ViewBox', xiv.ViewBox);



/**
 * @type {!string} 
 * @const
 * @expose
 */
xiv.ViewBox.ID_PREFIX =  'xiv.ViewBox';



/**
 * @type {!string} 
 * @const
*/
xiv.ViewBox.CSS_CLASS_PREFIX =
goog.string.toSelectorCase(
xiv.ViewBox.ID_PREFIX.toLowerCase().replace('.', '-'))



/**
 * @type {string} 
 * @const
 */
xiv.ViewBox.ELEMENT_CLASS = 
goog.getCssName(xiv.ViewBox.CSS_CLASS_PREFIX, '');



/**
 * @type {string} 
 * @const
 */
xiv.ViewBox.HIDDEN_CLASS = 
goog.getCssName(xiv.ViewBox.CSS_CLASS_PREFIX, 'hidden');



/**
 * @type {string} 
 * @const
 */
xiv.ViewBox.DRAG_AND_DROP_HANDLE_CLASS = 
goog.getCssName(xiv.ViewBox.CSS_CLASS_PREFIX, 'draganddrophandle');



/**
 * @type {string} 
 * @const
 */
xiv.ViewBox.DRAGGING_CLASS = 
goog.getCssName(xiv.ViewBox.CSS_CLASS_PREFIX, 'dragging');


/**
 * @type {number} 
 * @const
 */
xiv.ViewBox.MIN_HOLDER_HEIGHT = 200;



/**
 * @type {number} 
 * @const
 */
xiv.ViewBox.SCAN_TAB_LABEL_HEIGHT =  15;


/**
 * @type {number} 
 * @const
 */
xiv.ViewBox.SCAN_TAB_LABEL_WIDTH = 50;



/**
 * @type {number} 
 * @const
 */
xiv.ViewBox.MIN_TAB_HEIGHT =  15;



/**
 * Event types.
 * @enum {string}
 * @public
 */
xiv.ViewBox.EventType = {
  THUMBNAIL_PRELOAD: goog.events.getUniqueId('thumbnail_preload'),
  THUMBNAIL_LOADED: goog.events.getUniqueId('thumbnail_load'),
  THUMBNAIL_LOADERROR: goog.events.getUniqueId('thumbnail_loaderror'),
}



/**
 * @type {number}
 * @private
 */
xiv.ViewBox.prototype.thumbLoadTime_;



/**
 * @type {Displayer}
 * @private
 */
xiv.ViewBox.prototype.Displayer_;



/**
 * @type {xiv.Thumbnail}
 * @private
 */
xiv.ViewBox.prototype.Thumbnail_;



/**
 * @type {Array.<Element>}
 * @private
 */
xiv.ViewBox.prototype.doNotHide_;



/**
 * @type {!String}
 * @private
 */
xiv.ViewBox.prototype.loadFramework_ = 'XTK';



/**
 * @type {!String}
 * @private
 */
xiv.ViewBox.prototype.loadState_ = 'empty';



/**
 * @return {!string} The load state of the viewer.
 * @public
 */
xiv.ViewBox.prototype.getLoadState = function() {
    return this.loadState_;
}



/**
 * Get the associated SlicerViewMenu for this object.
 * @return {!xiv.SlicerViewMenu} The SlicerViewMenu object of the ViewBox.
 * @public
 */
xiv.ViewBox.prototype.getSlicerViewMenu =  function() {
    return this.SlicerViewMenu_;
}



/**
 * @return {?xiv.Thumbnail} The current thumbnail associated with the ViewBox.
 * @public
 */	
xiv.ViewBox.prototype.getThumbnail = function(){
    return this.Thumbnail_;
}



/**
 * Get the associated thumbnail load time for this object.
 * @return {number} The date (in millseconds) when the last thumbnail was 
 *     loaded into the ViewBox.
 * @public
 */
xiv.ViewBox.prototype.getThumbnailLoadTime =  function() {
    return this.thumbLoadTime_;
}





/**
 * @inheritDoc
 */
xiv.ViewBox.prototype.updateIconSrcFolder = function() {
    this.ViewBoxTabs_.setIconBaseUrl(this.iconBaseUrl);
    this.ContentDivider_.setIconBaseUrl(this.iconBaseUrl);
}



/**
 * Adds an element to the doNotHide list.
 * @param {!Element} element The element to prevent from hiding when no 
 *    Thumbnail is loaded.
 * @public
 */
xiv.ViewBox.prototype.doNotHide = function(element){
    this.doNotHide_ = (this.doNotHide_) ? this.doNotHide_ : [];
    this.doNotHide_.push(element);
};



/**
 * Allows for external communication to set
 * the viewscheme within the xiv.ViewBox by communicating
 * to its xiv.ViewLayoutMenu object.
 * @param {!string} viewPlane Sets the view layout associated with the argument.
 * @public
 */
xiv.ViewBox.prototype.setViewLayout = function(viewPlane) {
    window.console.log("HERE", viewPlane);
    this.ViewLayoutMenu_.setViewLayout(viewPlane);
}



/**
 * Loads a thumbnail into the viewer by communicating
 * to the various internal components that handle viewing:
 * xiv.ViewLayoutManager, xiv.Displayer, xiv.ViewLayoutMenu, xiv.ViewBoxTabs, 
 * etc.
 * @param {!xiv.Thumbnail} thumb The thumbnail to load into the viewer.
 * @public
 */
xiv.ViewBox.prototype.loadThumbnail = function (Thumbnail) {

    var onloadPlane =  /**@type {!string}*/ '3D';
    var controllerMenu = /**@type {utils.xtk.ControllerMenu}*/ undefined;
    
    // Set load state.
    this.loadState_ = 'loading';

    // Track the thumbnail internally.
    this.Thumbnail_ = Thumbnail;

    // Run Thumbnail preLoaded callbacks 
    this['EVENTS'].runEvent('THUMBNAIL_PRELOAD', this)

    // Remember the time in which the thumbnail was loaded
    this.thumbLoadTime_ = (new Date()).getTime();

    //------------------
    // This is here because the xiv.ViewBoxTabs may not fully adjust themselves
    // properly during the initiation process.  It's especially relevant
    // when multiple xiv.ViewBoxes are open.
    //------------------
    this.updateStyle();

    // Adjust view layoyt manager
    this.adjustViewLayoutManager_();

    // Hide children
    this.hideChildElements_();

    // Move content divider to bottom.
    window.console.log("SLIDE 1", this.ContentDivider_.getLowerLimit());
    this.ContentDivider_.slideTo(this.ContentDivider_.getLowerLimit(), false);
   
    // Feed view planes into xiv.ViewLayoutManager and set 
    // the default xiv.ViewLayout (most likely '3D')
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
xiv.ViewBox.prototype.adjustViewLayoutManager_ = function(){
    this.ViewLayoutManager_.setViewPlanes(this.Displayer_.ViewPlanes, 
					  this.Displayer_.Interactors);
    this.ViewLayoutManager_.animateViewLayoutChange(false);
    this.ViewLayoutManager_.setViewLayout('none');
}




/**
 * Load the xiv.Tabs associated with the object's xiv.Thumbnail.
 * @private
 */
xiv.ViewBox.prototype.loadTabs_ = function() {  
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
xiv.ViewBox.prototype.loadTab_Info_ = function() {
    this.ViewBoxTabs_.setTabPageContents('Info', 
      this.Displayer_.createInfoTabContents(this.Thumbnail_.getViewable()));
}



/**
 * As stated.
 * @private
 */
xiv.ViewBox.prototype.loadTab_SlicerViews_ = function() {
    this.ViewBoxTabs_.setTabPageContents('Slicer Views', 
		this.SlicerViewMenu_.getThumbnailGallery());
}



/**
 * As stated.
 * @private
 */
xiv.ViewBox.prototype.loadTabs_Controllers_ = function() {
    goog.object.forEach(this.Displayer_.getControllerMenu(), 
	function(menuElt, key){
	    if (menuElt){
	        this.ViewBoxTabs_.setTabPageContents(key, menuElt);
	    }
	}.bind(this))
}




/**
 * As stated.
 * @private
 */
xiv.ViewBox.prototype.initComponents_ = function() {
    /**
     * @type {!xiv.ViewLayoutManager}
     * @protected
     */
    this.ViewLayoutManager_ = new xiv.ViewLayoutManager();


    /**
     * @type {!xiv.SlicerViewMenu}
     * @private
     */
    this.SlicerViewMenu_ = new xiv.SlicerViewMenu(this);
    goog.dom.append(this.getElement(), this.SlicerViewMenu_.getElement());


    /**
     * @type {!xiv.ViewLayoutMenu}
     * @private
     */
    this.ViewLayoutMenu_ = new xiv.ViewLayoutMenu(
	this.ViewLayoutManager_.getViewLayouts());
    goog.dom.append(this.getElement(), this.ViewLayoutMenu_.getElement());


    /**
     * @type {!xiv.ContentDivider}
     * @private
     */	
    this.ContentDivider_ = new xiv.ContentDivider();
    goog.dom.append(this.getElement(), this.ContentDivider_.getContainment());
    goog.dom.append(this.getElement(), this.ContentDivider_.getElement());


    /**
     * @type {xiv.ViewBoxTabs}
     * @private
     */	
    this.ViewBoxTabs_ = new xiv.ViewBoxTabs(); 
    goog.dom.append(this.getElement(), this.ViewBoxTabs_.getElement());

    this.initDisplayer_();
}



/**
 * Initializes the 'xiv.Displayer' object which allows
 * various viewable content to be displayed, based on 
 * the 'loadFramework' internal variable.
 * @private
 */
xiv.ViewBox.prototype.initDisplayer_ = function(){
    // Retrieve the loadFramework.
    switch (this.loadFramework_){
    case 'XTK': 
	this.Displayer_ = new xiv.Displayer.Xtk(this);
	break;
    }
    goog.dom.append(this.getElement(), this.Displayer_.getElement());

    // Onload callbacks
    this.Displayer_.onLoaded = this.onDisplayerLoaded_.bind(this)
}



/**
 * Show child elements of the xiv.ViewBox. 
 * @private
 */
xiv.ViewBox.prototype.showChildElements_ = function() {
    goog.array.forEach(this.getElement().childNodes, function(childElt){
	goog.dom.classes.remove(childElt, xiv.ViewBox.HIDDEN_CLASS);
    })
}



/**
 * Hide child elements of the xiv.ViewBox.  
 * @private
 */
xiv.ViewBox.prototype.hideChildElements_ = function() {
    goog.array.forEach(this.getElement().childNodes, function(childElt){
	if (this.doNotHide_ && (this.doNotHide_.length > 0) && 
	    (this.doNotHide_.indexOf(childElt) === -1)) {
	    goog.dom.classes.add(childElt, xiv.ViewBox.HIDDEN_CLASS);
	}
    }.bind(this))
}



/**
* As stated.
* @private
*/
xiv.ViewBox.prototype.setComponentCallbacks_ = function() {
    this.setContentDividerCallbacks_();
    this.setViewBoxTabsCallbacks_();
    this.setViewLayoutMenuCallbacks_();
}



/**
 * As stated.
 * @private
 */
xiv.ViewBox.prototype.setContentDividerCallbacks_ = function () {
    this.ContentDivider_['EVENTS'].onEvent('DRAG', 
	this.onContentDividerDragging_.bind(this));
    this.ContentDivider_['EVENTS'].onEvent('DRAGEND',
	this.onContentDividerDragEnd_.bind(this));
}



/**
 * As stated.
 * @private
 */
xiv.ViewBox.prototype.setViewBoxTabsCallbacks_ = function () {
    this.ViewBoxTabs_['EVENTS'].onEvent('CLICKED', 
	this.onViewBoxTabClicked_.bind(this));
}



/**
 * Updates the various compoents of the xiv.ViewBox when the
 * user interacts with the xiv.ViewLayout menu.  Specifically,
 * the xiv.ViewLayoutManager.
 * @private
 */
xiv.ViewBox.prototype.setViewLayoutMenuCallbacks_ = function () {

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
    // update the xiv.Displayer style.
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
xiv.ViewBox.prototype.onDisplayerLoaded_ = function(){
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
 * Callback for when the xiv.ContentDivider is dragged.
 * @private
 */
xiv.ViewBox.prototype.onContentDividerDragging_ = function() {	

    // Maintain active tab if dragging up
    var dragDir = /**@type {!string}*/ this.ContentDivider_.getDragDirection();

    //window.console.log("DRAG DIR!", dragDir);
    if (dragDir == 'up') {
	var lastTab = /**@type {!number}*/
	this.ViewBoxTabs_.getLastActiveTab();
	this.ViewBoxTabs_.activate(this.ViewBoxTabs_.getLastActiveTab());
    }

    // Deactivate if drag down to lowest position.
    else if ((dragDir === 'down') && this.ContentDivider_.isNearLowerLimit()) {
	this.ViewBoxTabs_.deactivateAll();
    }

    // Update the position of the tabs and the style
    // of the xiv.ViewBox.
    var contentDividerDims = /**@type {!Object.<string, number>}*/
    utils.style.dims(this.ContentDivider_.getElement());
    var tabTop = /**@type {!number}*/
    contentDividerDims['top'] + contentDividerDims['height'];
    this.ViewBoxTabs_.updateStyle({ 'top': tabTop});
    this.updateStyle();
}



/**
 * Callback for when the xiv.ContentDivider is finished dragging.
 * @private
 */
xiv.ViewBox.prototype.onContentDividerDragEnd_ = function() {
    this.updateStyle();
}



/**
 * Callback for when a ViewBoxTab is activated.
 * @private
 */
xiv.ViewBox.prototype.onViewBoxTabClicked_ = function() {
    window.console.log("SLIDE 2", this.ContentDivider_.getUpperLimit());
    this.ContentDivider_.slideTo(this.ContentDivider_.getUpperLimit(), true);
    window.console.log("SLIDE 3", this.ContentDivider_.getLowerLimit());
    this.ContentDivider_.slideTo(this.ContentDivider_.getLowerLimit(), true);
}



/**
 * @inheritDoc
 */
xiv.ViewBox.prototype.updateStyle = function (opt_args) {
 
    // Merge any new arguments and update.
    if (opt_args) {
	utils.style.setStyle(this.getElement(), opt_args);
    }

    // Get the dimensions of the view box.
    var widgetDims = /**@type {!Object.<string, number>}*/
    utils.style.dims(this.getElement());
    
    this.updateStyle_ContentDivider_(widgetDims);
    this.updateStyle_components_(widgetDims);
}



/**
 * As stated.
 * @param {!Object.<string, number>} widgetDims The widget dimensions.
 * @private
 */
xiv.ViewBox.prototype.updateStyle_ContentDivider_ = function(widgetDims){
    if (this.ContentDivider_.isDragging()) {
	return;
    }

    var ViewBoxWidthChanged = /*@type {!boolean}*/ 
    !(utils.style.dims(this.ContentDivider_.getContainment(), 'width') === 
						     widgetDims['width']);
    if (ViewBoxWidthChanged) {
	var contentDiv_min_Top = /*@type {number}*/
	widgetDims['height'] - 
	    utils.style.dims(this.ContentDivider_.getElement(), 'height') - 
	    xiv.ViewBox.MIN_TAB_HEIGHT;
	
	utils.style.setStyle(this.ContentDivider_.getElement(), {
	    'top': contentDiv_min_Top - 1
	});
	utils.style.setStyle(this.ContentDivider_.getContainment(), {
	    'top': xiv.ViewBox.MIN_HOLDER_HEIGHT, 
	    'height': contentDiv_min_Top - xiv.ViewBox.MIN_HOLDER_HEIGHT + 3, 
	    'width': widgetDims['width']
	})

	window.console.log(this.ContentDivider_.getElement(),  
			   contentDiv_min_Top - 1);
    }
}



/**
 * As stated.
 * @param {!Object.<string, number>} widgetDims The widget dimensions.
 * @private
 */
xiv.ViewBox.prototype.updateStyle_components_ = function (widgetDims) {

    var contDiv_Dims = /** @type {!Object.<string, number>}*/
	utils.style.dims(this.ContentDivider_.getElement());

    // Tabs
    this.ViewBoxTabs_.updateStyle({ 
	'position': 'absolute', 
	'top': contDiv_Dims['top'] + contDiv_Dims['height']
    });
 
    // xiv.ViewLayout
    this.ViewLayoutManager_.implementViewLayout();

    // Displayer
    utils.style.setStyle(this.Displayer_.getElement(), {
 	'width': widgetDims['width'],
 	'height': contDiv_Dims['top']
    });
}




