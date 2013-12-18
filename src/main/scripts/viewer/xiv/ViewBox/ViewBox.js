/**
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 * @author amh1646@rit.edu (Amanda Hartung)
 */

/**
 * Google closure includes
 */
goog.require('goog.fx');
goog.require('goog.fx.DragDrop');
goog.require('goog.string');
goog.require('goog.dom');
goog.require('goog.events');

/**
 * utils includes
 */
goog.require('utils.dom');
goog.require('utils.style');
goog.require('utils.array');
goog.require('utils.fx');

/**
 * viewer-widget includes
 */
goog.require('xiv');
goog.require('xiv.Widget');
goog.require('xiv.ViewLayoutManager');
goog.require('xiv.ViewLayoutMenu');
goog.require('xiv.ContentDivider');
goog.require('xiv.ViewBoxTabs');
goog.require('xiv.XtkDisplayer');
goog.require('xiv.SlicerViewMenu');




/**
 * Viewing box for viewable types (images, 3d volumes and meshes, Slicer scenes).
 * xiv.ViewBoxes accept thumbnails, either dropped or clicked in, and load them
 * as perscribed by the xiv.ViewBox child classes.  xiv.ViewBoxes are a communicator class
 * in the sense that they get various interaction and visualization classes
 * to talk to one another.  For instance, it links the xiv.ViewLayoutMenu to 
 * to the xiv.ViewLayoutManager to the xiv.Displayer. 
 * 
 * @constructor
 * 
 * @extends {xiv.Widget}
 * @extents {goog.fx.DragDrop}
 */
goog.provide('xiv.ViewBox');
xiv.ViewBox = function (opt_args) {
    
    var that = this;

    xiv.Widget.call(this, 'xiv.ViewBox');
    goog.fx.DragDrop.call(this, this._element, undefined);	
    goog.dom.classes.set(this._element, xiv.ViewBox.ELEMENT_CLASS);
  


    this.initDisplayer();



    //------------------
    // View scheme manager
    //------------------
    this.ViewLayoutManager_ = new xiv.ViewLayoutManager();
    


    //------------------
    // View scheme menu
    //------------------    
    this._ViewLayoutMenu = new xiv.ViewLayoutMenu(this.ViewLayoutManager_.getViewLayouts());
    this._ViewLayoutMenu.setElementParentNode(this._element);
    this.setViewLayoutMenuCallbacks();
    

    
    //------------------
    // Content divider.
    //------------------ 
    this.ContentDivider_ = new xiv.ContentDivider(this._element);
    this.ContentDivider_.setElementParentNode(this._element);
 

    //------------------
    // View Box Tabs.
    //------------------    	
    this.ViewBoxTabs_ = new xiv.ViewBoxTabs();
    this.ViewBoxTabs_.setElementParentNode(this._element);



    //------------------
    // View Box Tabs.
    //------------------    	
    this._SlicerViewMenu = new xiv.SlicerViewMenu(this);



    //------------------
    // Allows the content divider to update the 
    // xiv.ViewBox components when moved.
    //------------------
    this.linkContentDividerToViewBox();

    this.updateStyle();
    this.setChildrenVisible(false);


    this.displayableData_ = {};
    this.mouseoutFadeables_ = [];




}
goog.inherits(xiv.ViewBox, xiv.Widget);
goog.inherits(xiv.ViewBox, goog.fx.DragDrop);
goog.exportSymbol('xiv.ViewBox', xiv.ViewBox);



xiv.ViewBox.CSS_CLASS_PREFIX = /**@type {string} @const*/ goog.getCssName('xiv-viewbox');
xiv.ViewBox.ELEMENT_CLASS = /**@type {string} @const*/ goog.getCssName(xiv.ViewBox.CSS_CLASS_PREFIX, '');
xiv.ViewBox.HIDDEN_CLASS = /**@type {string} @const*/ goog.getCssName(xiv.ViewBox.CSS_CLASS_PREFIX, 'hidden');
xiv.ViewBox.DRAG_AND_DROP_HANDLE_CLASS = /**@type {string} @const*/ goog.getCssName(xiv.ViewBox.CSS_CLASS_PREFIX, 'draganddrophandle');
xiv.ViewBox.DRAGGING_CLASS = /**@type {string} @const*/ goog.getCssName(xiv.ViewBox.CSS_CLASS_PREFIX, 'dragging');



/**
 * @type {?xiv.ViewLayoutManager}
 * @protected
 */
xiv.ViewBox.prototype.ViewLayoutManager_ = null;



/**
 * @type {?xiv.SlicerViewMenu}
 */
xiv.ViewBox.prototype._SlicerViewMenu = null;



/**
 * @type {?xiv.ViewLayoutMenu}
 */
xiv.ViewBox.prototype._ViewLayoutMenu = null;




/**
 * @type {?xiv.ContentDivider}
 * @private
 */	
xiv.ViewBox.prototype.ContentDivider_ = null;




/**
 * @type {?xiv.ViewBoxTabs}
 * @private
 */	
xiv.ViewBox.prototype.ViewBoxTabs_ = null;




/**
 * @type {?ViewablesHolder}
 */
xiv.ViewBox.prototype.Displayer_ = null;




/**
 * @type {object}
 * @private
 */
xiv.ViewBox.prototype.displayableData_ = null;




/**
 * @type {String}
 * @private
 */
xiv.ViewBox.prototype.loadFramework_ = 'XTK';





/**
 * Tracks what can and can't be faded when the 
 * mouse moves out of the zone of the xiv.ViewBox.
 *
 * @type {Array.Object}
 * @private
 */
xiv.ViewBox.prototype.mouseoutFadeables_ = null;




/**
 * Adds an element or object to be faded when
 * the mouseout event occurs over the xiv.ViewBox.
 *
 * @type {function(Object)}
 */
xiv.ViewBox.prototype.addMouseoutFadeable = function(fadeable) {
    this.mouseoutFadeables_.push(fadeable)
}




/**
 * @type {string}
 * @private
 */
xiv.ViewBox.prototype.currentThumbnail_ = undefined;




/**
 * @type {function(string)}
 * @param {string}
 * @private
 */	
xiv.ViewBox.prototype.setThumbnail = function(t) {		
    this.currentThumbnail_ = t;				
}




/**
 * @return {string}
 */	
xiv.ViewBox.prototype.getThumbnail = function() {
    return this.currentThumbnail_;
}




/**
 * Allows for external communication to set
 * the viewscheme within the xiv.ViewBox by communicating
 * to its xiv.ViewLayoutMenu object.
 *
 * @param {string}
 */
xiv.ViewBox.prototype.setViewLayout = function(viewPlane) {
    this._ViewLayoutMenu.setViewLayout(viewPlane);
}



/**
 * Allow all child elements of the xiv.ViewBox to be visible.
 *
 * @type {function(!boolean)}
 * @private
 */
xiv.ViewBox.prototype.setChildrenVisible = function(bool) {
    goog.array.forEach(this._element.childNodes, function(childElt){
	if (!bool) { goog.dom.classes.add(childElt, xiv.ViewBox.HIDDEN_CLASS);}
	else { goog.dom.classes.remove(childElt, xiv.ViewBox.HIDDEN_CLASS);}
    })
}




/**
 * Initializes the 'xiv.Displayer' object which allows
 * various viewable content to be displayed, based on 
 * the 'loadFramework' internal variable.
 *
 * @type {function()}
 */
xiv.ViewBox.prototype.initDisplayer = function(){
    var that = this;



    //------------------
    // Retrieve the loadFramework.
    //------------------
    switch (this.loadFramework_){
    case 'XTK': this.Displayer_ = new xiv.XtkDisplayer(this)
    }
    this.Displayer_.setElementParentNode(this._element);


    //------------------
    // Onload callbacks
    //------------------
    this.Displayer_.onOnload(function(){
	if (that._element.hasAttribute('originalbordercolor')){
	    that._element.style.borderColor = that._element.getAttribute('originalbordercolor');
	}
	//that._ViewLayoutMenu.setViewLayout('Four-up');
	that.setChildrenVisible(true);	
    })
}




/**
 * Loads a thumbnail into the viewer by communicating
 * to the various internal components that handle viewing:
 * xiv.ViewLayoutManager, xiv.Displayer, xiv.ViewLayoutMenu, xiv.ViewBoxTabs, 
 * etc.
 *
 * @param {!xiv.Thumbnail, string=}
 */
xiv.ViewBox.prototype.loadThumbnail = function (thumb, loadFramework) {

    //utils.dom.debug("loadThumbnail");
    var that = this;
    var onloadPlane =  '3D';
    var controllerMenu = undefined;
    


    //------------------
    // Remember the time in which 
    // the thumbnail was loaded
    //------------------
    var d = new Date();
    this._thumbnailLoadTime = d.getTime();



    //------------------
    // This is here because the xiv.ViewBoxTabs may not fully adjust themselves
    // properly during the initiation process.  It's especially relevant
    // when multiple xiv.ViewBoxes are open.
    //------------------
    this.updateStyle();



    //------------------
    // Hide children
    //------------------
    this.ViewLayoutManager_.setViewPlanes(this.Displayer_.getViewPlaneElements(), this.Displayer_.getViewPlaneInteractors());
    this.ViewLayoutManager_.animateViewLayoutChange(false);
    this.ViewLayoutManager_.setViewLayout('none');
    this.setChildrenVisible(false);



    //------------------
    // Move content divider to bottom.
    //------------------
    this.ContentDivider_.slideTo(this.ContentDivider_.getLowerLimit(), false);



    //------------------
    // Track the thumbnail internally.
    //------------------
    this.setThumbnail(thumb);



    //------------------    
    // Feed view planes into xiv.ViewLayoutManager and set 
    // the default xiv.ViewLayout (most likely '3D')
    //------------------
    this._ViewLayoutMenu.setViewLayout(onloadPlane);



    //------------------
    // Turn back on animations.
    //------------------
    this.ViewLayoutManager_.animateViewLayoutChange(true);
    
    

    //------------------
    // Load collection in Xtk.Displayer, prioritizing the 3D viewer
    // as that is where the progress bar lies.
    //------------------
    //console.log(thumb._properties);
    var thumbCategory = thumb._properties['category'].toLowerCase();

    switch(thumbCategory) {

    case 'slicer':
	this.Displayer_.loadSlicer(thumb._properties.files);
	return;
	//break;
    default:
	this.Displayer_.loadFileCollection(thumb._properties.files);
    }

   

    //console.log("LAYOUT", slicerSettings['layout']);
    //this.onOnload(function(){
    // 	that.ViewBox_._ViewLayoutMenu.setViewLayout(slicerSettings['layout']);			  
    //})
    


    //------------------
    // Clear existing tabs.
    //------------------
    this.ViewBoxTabs_.reset();

    

    //------------------
    // Info Tab.
    //------------------
    this.ViewBoxTabs_.setTabContents('Info', this.Displayer_.makeInfoTabContents(this.currentThumbnail_._properties));
    


    //------------------
    // Controller Menu into Tabs
    //------------------
    var controllerMenu = this.Displayer_.getControllerMenu();    
    for (var key in controllerMenu){
	//
	// Only input object that have contents in them.
	//
	if (Object.keys(controllerMenu[key]).length !== 0){
	    this.ViewBoxTabs_.setTabContents(key, controllerMenu[key]);
	}   
    }



    //------------------
    // Sync style.
    //------------------
    this.updateStyle();

    

    //------------------
    // Highlight in use thumbnails
    //------------------    
    xiv._Modal.highlightInUseThumbnails();
}




/**
 * Updates the various compoents of the xiv.ViewBox when the
 * user interacts with the xiv.ViewLayout menu.  Specifically,
 * the xiv.ViewLayoutManager.
 *
 * @type {function()}
 * @private
 */
xiv.ViewBox.prototype.setViewLayoutMenuCallbacks = function () {
    var that = this;



    //------------------
    // When a menu Item is clicked.
    //------------------
    this._ViewLayoutMenu.onMenuItemClicked( function() {
	that.ViewLayoutManager_.setViewLayout(that._ViewLayoutMenu.getSelectedViewLayout());
	//that.updateStyle();
	
    });



    //------------------
    // Callback when all panels are visible
    //------------------
    this.ViewLayoutManager_.onMultipleViewPlanesVisible(function(visiblePanels){ that.Displayer_.XtkPlaneManager_.colorSliders();})



    //------------------
    // Callback when one panel is visible
    //------------------
    this.ViewLayoutManager_.onOneViewPlaneVisible(function(visiblePanel){ that.Displayer_.XtkPlaneManager_.uncolorSliders();})



    //------------------
    // Once the view scheme is set, 
    // update the displayer style.
    //------------------
    this.ViewLayoutManager_.onViewLayoutChanged(function(){ 

	that.Displayer_.updateStyle()
	
    });



    //------------------
    // For when the view scheme animates, 
    // update the xiv.Displayer style.
    //------------------
    this.ViewLayoutManager_.onViewLayoutAnimate(function(){ that.Displayer_.updateStyle()});



    //------------------
    // Callback when a plane is double clicked.
    //------------------
    this.ViewLayoutManager_.onPlaneDoubleClicked(function(anatomicalPlane){ 
	that._ViewLayoutMenu.setViewLayout(anatomicalPlane);
	that.Displayer_.updateStyle()

    });
}




/**
 * Allows for the xiv.ViewBox widgets to be re-dimensioned / activated
 * when the xiv.ContentDivider is dragged.
 *
 * @type {function}
 * @private
 */
xiv.ViewBox.prototype.linkContentDividerToViewBox = function () {
	
    var that = this;
    var isAnimated = true;



    //------------------
    // Recompute the xiv.ViewBox style when the 
    // content divider is dragged.  This will readjust the dimensions
    // of the xiv.ViewBoxTabs and the Xtkxiv.Displayer.
    //------------------
    this.ContentDivider_.addDragCallback(function() {	

	//
	// Deactivate tabs if the content divider slides to
	// to the bottom of the xiv.ViewBox.
	//
	if (utils.style.dims(that.ContentDivider_._element, 'top') < that.ContentDivider_.getLowerLimit()) {
	    that.ViewBoxTabs_.setActive(that.ViewBoxTabs_.getLastActiveTab());
	} else {
	    that.ViewBoxTabs_.setActive(-1);
	}

	//
	// Update the position of the tabs and the style
	// of the xiv.ViewBox.
	//
	var contentDividerDims = utils.style.dims(that.ContentDivider_._element);
	var tabTop = contentDividerDims['top'] + contentDividerDims['height'];
	that.ViewBoxTabs_.updateStyle({ 'top': tabTop});
	that.updateStyle();
    })



    //------------------
    // Sometimes the xiv.ViewBoxTabs do not catch up with the content divider position.
    // This is to make sure of that.
    //------------------
    this.ContentDivider_.addDragEndCallback(function() {
	that.updateStyle();
    })


    //this.ContentDivider_.addDragStartCallback(function() {})



    //------------------
    // Animate the content divider slide to its upper limit (based on its _containment
    // dimensions) when a tab is "activated" (clicked and not visible).
    //------------------
    this.ViewBoxTabs_.setActivateCallbacks(function() {

	//
	// Only raise the tabs up if they're completely lowered.
	//
	if (that.ContentDivider_.getPosition() >= that.ContentDivider_.getLowerLimit()){
	    that.ContentDivider_.slideTo(that.ContentDivider_.getUpperLimit(), isAnimated);
	}
    });



    //------------------
    // Animate the content divider slide to its lower limit (based on the _containment
    // dimensions) when a tab is "deactivated" (clicked and visible).
    //------------------
    this.ViewBoxTabs_.setDeactivateCallbacks(function(){
	that.ContentDivider_.slideTo(that.ContentDivider_.getLowerLimit(), isAnimated);
    });		
}






/**
 * Hides and shows the various child elements of the xiv.ViewBox
 * when the MOUSEOVER event occurs over the xiv.ViewBox element.
 *
 * @private
 */
xiv.ViewBox.prototype.setHoverEvents = function () {	
    var that = this;     



    //------------------
    // Set the classes that will NOT be faded.
    //------------------
    var keeperClasses = [xiv.XtkDisplayer.ELEMENT_CLASS];



    //------------------
    // Set the classes that are subclasses of the keepers
    // that are to be faded.
    //------------------
    var otherFadeClasses = [xiv.XtkPlane.SLIDER_CLASS];


    
    //------------------
    // Define the MOUSEOUT function
    //------------------
    var mouseOut = function() {

	//
	// Fade out all but keepers.
	//
	goog.array.forEach(that._element.childNodes, function (node) {
	    var isKeeper = false;
	    goog.array.forEach(keeperClasses, function (keeperClass){
		if (node.className.indexOf(keeperClass) > -1){ isKeeper = true; }
	    })
	    if (!isKeeper) { utils.fx.fadeOut(node, 0);}
	});
	
	//
	// Other fadeadble classes
	//
	goog.array.forEach(otherFadeClasses, function(otherFadeClass){
	    goog.array.forEach(that._element.getElementsByClassName(otherFadeClass), function (node) {
		utils.fx.fadeOut(node, 0);
	    })
	})
    }


    
    //------------------
    // Define the MOUSEOVER function
    //------------------
    var mouseOver = function() {

	//
	// Fade in all direct childNodes.
	//
	goog.array.forEach(that._element.childNodes, function (node) { 
	    utils.fx.fadeIn(node, 0);
	})

	//
	// Fade in all 'otherFadeClasses'
	//
	goog.array.forEach(otherFadeClasses, function(otherFadeClass){
	    goog.array.forEach(that._element.getElementsByClassName(otherFadeClass), function (node) {
		utils.fx.fadeIn(node, 0);
	    })
	})
    }
    


    //------------------
    // Set google event listening.
    //------------------
    goog.events.listen(this._element, goog.events.EventType.MOUSEOVER, function() { mouseOver() });
    goog.events.listen(this._element, goog.events.EventType.MOUSEOUT,  function() { mouseOut() });



    //------------------
    // Default to mouseOut.
    //------------------
    mouseOut();
}



/**
* Widely used general style update for a variety of purpsoes: 
* modal and window resizing, and any change to the dimensions of the
* xiv.ViewBox components.
*
* @param {Object=}
*/
xiv.ViewBox.prototype.updateStyle = function (opt_args) {
    var that = this;



    //------------------
    // Get the dimensions of the view box.
    //------------------
    widgetDims = utils.style.dims(this._element);



    //------------------
    // Merge any new arguments and update.
    //------------------
    opt_args = (opt_args) ? utils.dom.mergeArgs(widgetDims, opt_args) : widgetDims;
    utils.style.setStyle(this._element, opt_args);



    //------------------
    // ONLOAD ONLY: The xiv.ContentDivider dictates the position of all of the
    // other widgets in the xiv.ViewBox.
    //
    // The first thing that needs to happen is to detect a change in the 
    // contiainment zone of the content divider (i.e. this.ContentDivider_._containment).
    // If there is a change (arbitrarily determined by width) and if the divider 
    // is not dragging, then we determine the containment and top part of the divider.
    //------------------
    if (!this.ContentDivider_.isDragging()) {
	
	//
	//  If there's a change in the width of the widget, proceed.
	//
	var dimChangeWidth = !(utils.style.dims(this.ContentDivider_._containment, 'width') === widgetDims['width']);

	if (dimChangeWidth) {
	    
	    //
	    //  Determine the top of the content divider and its containment.
	    //
	    var t = xiv.MIN_HOLDER_HEIGHT;	
	    var h = widgetDims['height'] - t - utils.style.dims(this.ContentDivider_._element, 'height') - xiv.MIN_TAB_HEIGHT + 3;
	
	    utils.style.setStyle(this.ContentDivider_._element, {
		'top': xiv.prototype.minContentDividerTop(widgetDims['height']) - 1
	    });
	    
	    //utils.dom.debug("CONTAINMENT: ", this._element, this.ContentDivider_._containment, {
	    //	'top': t, 
	    //	'height': h, 
	    //	'width': widgetDims['width']
	    //})

	    utils.style.setStyle(this.ContentDivider_._containment, {
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
    var contentDividerDims = utils.style.dims(this.ContentDivider_._element);
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
