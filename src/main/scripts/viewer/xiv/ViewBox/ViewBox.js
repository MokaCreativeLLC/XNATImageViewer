/**
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 * @author amh1646@rit.edu (Amanda Hartung)
 */

// goog
goog.require('goog.fx');
goog.require('goog.fx.DragDrop');
goog.require('goog.string');
goog.require('goog.dom');
goog.require('goog.events');

// utils
goog.require('utils.dom');
goog.require('utils.style');
goog.require('utils.array');
goog.require('utils.fx');
goog.require('utils.events.EventManager');

// xiv
goog.require('xiv');
goog.require('xiv.Widget');
goog.require('xiv.ViewLayoutManager');
goog.require('xiv.ViewLayoutMenu');
goog.require('xiv.ContentDivider');
goog.require('xiv.ViewBoxTabs');
goog.require('xiv.XtkDisplayer');
goog.require('xiv.SlicerViewMenu');




/**
 * Viewing box for viewable types (images, 3d volumes and meshes, 
 * Slicer scenes).
 * xiv.ViewBoxes accept thumbnails, either dropped or clicked in, and load them
 * as perscribed by the xiv.ViewBox child classes.  xiv.ViewBoxes are a 
 * communicator class
 * in the sense that they get various interaction and visualization classes
 * to talk to one another.  For instance, it links the xiv.ViewLayoutMenu to 
 * to the xiv.ViewLayoutManager to the xiv.Displayer. 
 * @constructor
 * @extends {xiv.Widget}
 * @param {Object=} opt_args Optional arguments to define the ViewBox.
 */
goog.provide('xiv.ViewBox');
xiv.ViewBox = function (opt_args) {

    //------------------
    // Call parents, set class
    //------------------  
    goog.base(this, 'xiv.ViewBox');
    goog.dom.classes.set(this.getElement(), xiv.ViewBox.ELEMENT_CLASS);


    /**
     * @type {xiv.SlicerViewMenu}
     * @private
     */
    this.SlicerViewMenu_ = new xiv.SlicerViewMenu(this);



    /**
     * @type {number}
     * @private
     */
    this.thumbnailLoadTime_ = 0;




    /**
     * @type {xiv.ViewLayoutManager}
     * @protected
     */
    this.ViewLayoutManager_ = new xiv.ViewLayoutManager();



    /**
     * @type {?xiv.ViewLayoutMenu}
     * @private
     */
    this.ViewLayoutMenu_ = new xiv.ViewLayoutMenu(
	this.ViewLayoutManager_.getViewLayouts());



    /**
     * @type {xiv.ContentDivider}
     * @private
     */	
    this.ContentDivider_ = new xiv.ContentDivider();
    goog.dom.append(this.getElement(), this.ContentDivider_.getContainment());




    /**
     * @type {xiv.ViewBoxTabs}
     * @private
     */	
    this.ViewBoxTabs_ = new xiv.ViewBoxTabs();



    /**
     * @type {?Displayer}
     * @private
     */
    this.Displayer_ = null;



    /**
     * @type {?xiv.Thumbnail}
     * @private
     */
    this.Thumbnail_ = null;



    /**
     * @type {Array.<Element>}
     * @private
     */
    this.doNotHide_ = [];



    /**
     * @type {!String}
     * @private
     */
    this.loadFramework_ = 'XTK';



    /**
     * @type {!String}
     * @private
     */
    this.loadState_ = 'empty';

 


    //------------------
    // Allows the content divider to update the 
    // xiv.ViewBox components when moved.
    //------------------
    this.linkContentDividerToViewBox_();



    this.doNotHide(this.SlicerViewMenu_.getElement());


    this.keeperClasses_ = /** @private */ [xiv.XtkDisplayer.ELEMENT_CLASS];
    this.otherFadeClasses_ = /** @private */  [xiv.XtkPlane.SLIDER_CLASS];



    //------------------
    // Element hierarchy
    //------------------
    goog.dom.append(this.getElement(), this.SlicerViewMenu_.getElement());
    goog.dom.append(this.getElement(), this.ContentDivider_.getElement());
    goog.dom.append(this.getElement(), this.ViewLayoutMenu_.getElement());
    goog.dom.append(this.getElement(), this.ViewBoxTabs_.getElement());

    this.setViewLayoutMenuCallbacks_();



    //goog.fx.DragDrop.call(this, this.getElement(), undefined);	
    



    //------------------
    // Init displayer
    //------------------
    this.initDisplayer_();


    // events
    utils.events.EventManager.addEventManager(this, xiv.ViewBox.EventType);

    //------------------
    // Style updates
    //------------------ 
    this.hideChildElements_();
    this.updateStyle();
}
goog.inherits(xiv.ViewBox, xiv.Widget);
goog.exportSymbol('xiv.ViewBox', xiv.ViewBox);



/**
 * @type {string} 
 * @const
 */
xiv.ViewBox.CSS_CLASS_PREFIX = goog.getCssName('xiv-viewbox');



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




xiv.ViewBox.MIN_HOLDER_HEIGHT = /**@const*/ 200;
xiv.ViewBox.SCAN_TAB_LABEL_HEIGHT =  /**@const*/ 15;
xiv.ViewBox.SCAN_TAB_LABEL_WIDTH = /** @const */ 50;
xiv.ViewBox.MIN_TAB_HEIGHT =  /** @const */ xiv.ViewBox.SCAN_TAB_LABEL_HEIGHT;



/**
 * Event types.
 * @enum {string}
 */
xiv.ViewBox.EventType = {
  THUMBNAIL_PRELOAD: goog.events.getUniqueId('thumbnail_preload'),
  THUMBNAIL_LOADED: goog.events.getUniqueId('thumbnail_load'),
  THUMBNAIL_LOADERROR: goog.events.getUniqueId('thumbnail_loaderror'),
}



/**
 * @return {!string} The load state of the viewer.
 * @public
 */
xiv.ViewBox.prototype.getLoadState = function() {
    return this.loadState_;
}




/**
 * Get the associated SlicerViewMenu for this object.
 *
 * @return {xiv.SlicerViewMenu} The SlicerViewMenu object of the ViewBox.
 * @public
 */
xiv.ViewBox.prototype.__defineGetter__('SlicerViewMenu', function() {
    return this.SlicerViewMenu_;
})




/**
 * @return {?xiv.Thumbnail} The current thumbnail associated with the ViewBox.
 * @public
 */	
xiv.ViewBox.prototype.getThumbnail = function(){
    return this.Thumbnail_;
}







/**
 * Get the associated thumbnail load time for this object.
 *
 * @return {!number} The date (in millseconds) when the last thumbnail was loaded into the ViewBox.
 * @public
 */
xiv.ViewBox.prototype.__defineGetter__('thumbnailLoadTime', function() {
    return this.thumbnailLoadTime_;
})



/**
 * @param {!Element} element The element to prevent from hiding when no Thumbnail is loaded.
 * @public
 */
xiv.ViewBox.prototype.doNotHide = function(element){
    this.doNotHide_.push(element);
};




/**
 * Allows for external communication to set
 * the viewscheme within the xiv.ViewBox by communicating
 * to its xiv.ViewLayoutMenu object.
 *
 * @param {!string} viewPlane Sets the view layout associated with the argument.
 * @public
 */
xiv.ViewBox.prototype.setViewLayout = function(viewPlane) {
    this.ViewLayoutMenu_.setViewLayout(viewPlane);
}



/**
 * Show child elements of the xiv.ViewBox. 
 *
 * @private
 */
xiv.ViewBox.prototype.showChildElements_ = function() {
    goog.array.forEach(this.getElement().childNodes, function(childElt){
	goog.dom.classes.remove(childElt, xiv.ViewBox.HIDDEN_CLASS);
    }.bind(this))
}




/**
 * Hide child elements of the xiv.ViewBox.  
 *
 * @private
 */
xiv.ViewBox.prototype.hideChildElements_ = function() {
    goog.array.forEach(this.getElement().childNodes, function(childElt){
	if (this.doNotHide_ && (this.doNotHide_.length > 0) && (this.doNotHide_.indexOf(childElt) === -1)) {
	    goog.dom.classes.add(childElt, xiv.ViewBox.HIDDEN_CLASS);
	}
    }.bind(this))
}




/**
 * Initializes the 'xiv.Displayer' object which allows
 * various viewable content to be displayed, based on 
 * the 'loadFramework' internal variable.
 *
 * @private
 */
xiv.ViewBox.prototype.initDisplayer_ = function(){
  

    //------------------
    // Retrieve the loadFramework.
    //------------------
    switch (this.loadFramework_){
    case 'XTK': 
	this.Displayer_ = new xiv.XtkDisplayer(this);
	break;
    }
    goog.dom.append(this.getElement(), this.Displayer_.getElement());


    //------------------
    // Onload callbacks
    //------------------
    this.Displayer_.onLoaded = function(){
	this.loadState_ = 'loaded';

	if (this.getElement().hasAttribute('originalbordercolor')){
	    this.getElement().style.borderColor = 
		this.getElement().getAttribute('originalbordercolor');
	}
	this.ViewLayoutMenu_.setViewLayout(this.Displayer_.ViewLayout);
	this.showChildElements_();
	this.loadTabs_();


	//
	// Thumbnail loaded callbacks
	//
	this['EVENTS'].runEvent('THUMBNAIL_LOADED', this)
    }.bind(this)
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

    var onloadPlane =  '3D';
    var controllerMenu = undefined;
    
    this.loadState_ = 'loading';

    //------------------
    // Track the thumbnail internally.
    //------------------
    this.Thumbnail_ = Thumbnail;
    // Thumbnail preLoaded callbacks 
    this['EVENTS'].runEvent('THUMBNAIL_PRELOAD', this)




    //------------------
    // Remember the time in which 
    // the thumbnail was loaded
    //------------------
    var d = new Date();
    this.thumbnailLoadTime_ = d.getTime();



    //------------------
    // This is here because the xiv.ViewBoxTabs may not fully adjust themselves
    // properly during the initiation process.  It's especially relevant
    // when multiple xiv.ViewBoxes are open.
    //------------------
    this.updateStyle();



    //------------------
    // Hide children
    //------------------
    this.ViewLayoutManager_.setViewPlanes(this.Displayer_.ViewPlanes, this.Displayer_.Interactors);
    this.ViewLayoutManager_.animateViewLayoutChange(false);
    this.ViewLayoutManager_.setViewLayout('none');
    this.hideChildElements_();



    //------------------
    // Move content divider to bottom.
    //------------------
    this.ContentDivider_.slideTo(this.ContentDivider_.getLowerLimit(), false);



    //------------------    
    // Feed view planes into xiv.ViewLayoutManager and set 
    // the default xiv.ViewLayout (most likely '3D')
    //------------------
    this.ViewLayoutMenu_.setViewLayout(onloadPlane);



    //------------------
    // Turn back on animations.
    //------------------
    this.ViewLayoutManager_.animateViewLayoutChange(true);
    
    

    //------------------
    // Show/hide the slicer view menu depending on the 
    // Thumbnail's getViewable()
    //------------------    
    this.SlicerViewMenu_.getElement().style.visibility = (thumb.getViewable()['category'].toLowerCase() === 'slicer') ? 'visible' : 'hidden';


    this.Displayer_.load(thumb.getViewable());    
}
 


/**
 * Load the xiv.Tabs associated with the object's xiv.Thumbnail.
 * 
 * @private
 */
xiv.ViewBox.prototype.loadTabs_ = function () {  

    
    //------------------
    // Clear existing tabs.
    //------------------
    this.ViewBoxTabs_.reset();
    
    

    //------------------
    // Info Tab.
    //------------------
    this.ViewBoxTabs_.setTabContents('Info', this.Displayer_.createInfoTabContents(this.Thumbnail_.getViewable()));
    


    //------------------
    // Slicer View Tab.
    //------------------
    if (this.Thumbnail_.getViewable()['category'] == 'Slicer') {
	this.ViewBoxTabs_.setTabContents('Slicer Views', this.SlicerViewMenu_.getThumbnailGallery());
    }



    //------------------
    // Controller Menu into Tabs
    //------------------
    var controllerMenu = this.Displayer_.ControllerMenu;    
    for (var key in controllerMenu){
	// Only input object that have contents in them.
	if (Object.keys(controllerMenu[key]).length !== 0){
	    this.ViewBoxTabs_.setTabContents(key, controllerMenu[key]);
	}   
    }



    //------------------
    // Sync style.
    //------------------
    this.updateStyle();

   
}




/**
 * Updates the various compoents of the xiv.ViewBox when the
 * user interacts with the xiv.ViewLayout menu.  Specifically,
 * the xiv.ViewLayoutManager.
 *
 * @private
 */
xiv.ViewBox.prototype.setViewLayoutMenuCallbacks_ = function () {


    //------------------
    // When a menu Item is clicked.
    //------------------
    this.ViewLayoutMenu_.onMenuItemClicked( function() {
	this.ViewLayoutManager_.set3DBackgroundColor(this.Displayer_.BackgroundColors);
	this.ViewLayoutManager_.setViewLayout(this.ViewLayoutMenu_.getSelectedViewLayout());
    }.bind(this));



    //------------------
    // Callback when all panels are visible
    //------------------
    this.ViewLayoutManager_.onMultipleViewPlanesVisible(function(visiblePanels){ 
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
	this.ViewLayoutMenu_.setViewLayout(anatomicalPlane);
	this.Displayer_.updateStyle()

    }.bind(this));
}



/**
 * Callback for when the xiv.ContentDivider is dragged.
 *
 * @private
 */
xiv.ViewBox.prototype.onContentDividerDragged_ = function() {	

    //
    // Deactivate tabs if the content divider slides to
    // to the bottom of the xiv.ViewBox.
    //
    if (utils.style.dims(this.ContentDivider_.getElement(), 'top') < this.ContentDivider_.getLowerLimit()) {
	this.ViewBoxTabs_.setActive(this.ViewBoxTabs_.getLastActiveTab());
    } else {
	window.console.log("CONTENT DIVIDER DRAGGED");
	this.ViewBoxTabs_.setActive(-1);
    }

    //
    // Update the position of the tabs and the style
    // of the xiv.ViewBox.
    //
    var contentDividerDims = utils.style.dims(this.ContentDivider_.getElement());
    var tabTop = contentDividerDims['top'] + contentDividerDims['height'];
    this.ViewBoxTabs_.updateStyle({ 'top': tabTop});
    this.updateStyle();
}




/**
 * Allows for the xiv.ViewBox widgets to be re-dimensioned / activated
 * when the xiv.ContentDivider is dragged.
 *
 * @private
 */
xiv.ViewBox.prototype.linkContentDividerToViewBox_ = function () {
	
    var isAnimated = true;


    this.ContentDivider_['EVENTS'].onEvent('DRAG', 
	this.onContentDividerDragged_.bind(this))


    this.ContentDivider_['EVENTS'].onEvent('DRAGEND', function() {
	this.updateStyle();
    }.bind(this))


    this.ViewBoxTabs_.setActivateCallbacks(function() {
	//
	// Only raise the tabs up if they're completely lowered.
	//
	if (this.ContentDivider_.getPosition() >= this.ContentDivider_.getLowerLimit()){
	    this.ContentDivider_.slideTo(this.ContentDivider_.getUpperLimit(), isAnimated);
	}
    }.bind(this));


    this.ViewBoxTabs_.setDeactivateCallbacks(function(){
	this.ContentDivider_.slideTo(this.ContentDivider_.getLowerLimit(), isAnimated);
    }.bind(this));		
}




/**
* Widely used general style update for a variety of purpsoes: 
* modal and window resizing, and any change to the dimensions of the
* xiv.ViewBox components.
*
* @param {Object=} opt_args The optional style args to apply to the ViewBox.
* @public
*/
xiv.ViewBox.prototype.updateStyle = function (opt_args) {
 

    //------------------
    // Get the dimensions of the view box.
    //------------------
    widgetDims = utils.style.dims(this.getElement());



    //------------------
    // Merge any new arguments and update.
    //------------------
    opt_args = (opt_args) ? opt_args : widgetDims;
    utils.style.setStyle(this.getElement(), opt_args);



    //------------------
    // ONLOAD ONLY: The xiv.ContentDivider dictates the position of all of the
    // other widgets in the xiv.ViewBox.
    //
    // The first thing that needs to happen is to detect a change in the 
    // contiainment zone of the content divider (i.e. this.ContentDivider_.getContainment()).
    // If there is a change (arbitrarily determined by width) and if the divider 
    // is not dragging, then we determine the containment and top part of the divider.
    //------------------
    if (!this.ContentDivider_.isDragging()) {
	
	//
	//  If there's a change in the width of the widget, proceed.
	//
	var dimChangeWidth = !(utils.style.dims(this.ContentDivider_.getContainment(), 'width') === widgetDims['width']);

	if (dimChangeWidth) {
	    
	    //
	    //  Determine the top of the content divider and its containment.
	    //
	    var t = xiv.ViewBox.MIN_HOLDER_HEIGHT;	
	    var h = widgetDims['height'] - t - utils.style.dims(this.ContentDivider_.getElement(), 'height') - xiv.ViewBox.MIN_TAB_HEIGHT + 3;
	
	    utils.style.setStyle(this.ContentDivider_.getElement(), {
		'top': xiv.prototype.minContentDividerTop(widgetDims['height']) - 1
	    });


	    utils.style.setStyle(this.ContentDivider_.getContainment(), {
		'top': t, 
		'height': h, 
		'width': widgetDims['width']
	    })
	}
    }

    

    //------------------
    // Dimension calculations.
    //
    // NOTE: It's necessary that they be placed
    // in this part of the function.
    //------------------
    var contentDividerDims = utils.style.dims(this.ContentDivider_.getElement());
    var contentDividerHeight = contentDividerDims['height'];
    var tabTop = contentDividerDims['top'] + contentDividerHeight;
    var tabHeight = widgetDims['height'] - tabTop;
    var xtkHolderDims = {};



    //------------------
    // Calculate the holder dimensions.
    //------------------
    xtkHolderDims['height'] = contentDividerDims['top'];
    xtkHolderDims['top'] = 0;

    

    //----------------------------------
    // Tabs
    //----------------------------------
    this.ViewBoxTabs_.updateStyle({ 
	'position': 'absolute', 
	'top': tabTop
    });
    


    //----------------------------------
    // xiv.ViewLayout
    //----------------------------------
    //utils.dom.debug("view box");
    this.ViewLayoutManager_.implementViewLayout();



    
    //----------------------------------
    // Holder
    //----------------------------------
    this.Displayer_.updateStyle({
        'top': xtkHolderDims['top'],
 	'width': widgetDims['width'],
 	'height': xtkHolderDims['height']
    });
        
}




