/**
 * @author amh1646@rit.edu (Amanda Hartung)
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 */

/**
 * Google closure includes
 */
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
goog.require('XnatViewerWidget');
goog.require('XnatViewerGlobals');
goog.require('ViewSchemeMenu');




/**
 * Viewing box for viewable types (images, 3d volumes and meshes, Slicer scenes).
 * ViewBoxes accept thumbnails, either dropped or clicked in, and load them
 * as perscribed by the ViewBox child classes.  ViewBoxes are a communicator class
 * in the sense that they get various interaction and visualization classes
 * to talk to one another.  For instance, it links the ViewSchemeMenu to 
 * to the ViewSchemeManager to the Displayer. 
 * 
 * @param {Object=}
 * @constructor
 * @extends {XnatViewerWidget}
 */
goog.provide('ViewBox');
ViewBox = function (opt_args) {
    
    var that = this;

    XnatViewerWidget.call(this, utils.dom.mergeArgs( opt_args, {'id' : 'ViewBox'}));
    goog.fx.DragDrop.call(this, this._element, undefined);	
    goog.dom.classes.set(this._element, ViewBox.ELEMENT_CLASS);
  


    //------------------
    // The user can specify the load framework (XTK) in the args
    // if needed.
    //------------------
    if (opt_args && opt_args['loadFramework'] && opt_args['loadFramework'].length > 0){
	this.loadFramework_ =  opt_args['loadFramework'];
    }
    this.initDisplayer();



    //------------------
    // View scheme manager
    //------------------
    this.ViewSchemeManager_ = new ViewSchemeManager();
    


    //------------------
    // View scheme menu
    //------------------    
    this.ViewSchemeMenu_ = new ViewSchemeMenu(this.ViewSchemeManager_.getViewSchemes(), { 'parent' : this._element });
    this.setViewSchemeMenuCallbacks();
    

    
    //------------------
    // Content divider.
    //------------------ 
    this.ContentDivider_ = new ContentDivider({'parent': this._element});
	
 

    //------------------
    // View Box Tabs.
    //------------------    	
    this.ViewBoxTabs_ = new ViewBoxTabs({'parent': this._element});



    //------------------
    // Allows the content divider to update the 
    // ViewBox components when moved.
    //------------------
    this.linkContentDividerToViewBox();

    this.updateStyle();
    this.setChildrenVisible(false);
}
goog.inherits(ViewBox, XnatViewerWidget);
goog.inherits(ViewBox, goog.fx.DragDrop);




ViewBox.CSS_CLASS_PREFIX = /**@type {string} @const*/ goog.getCssName('xiv-viewbox');
ViewBox.ELEMENT_CLASS = /**@type {string} @const*/ goog.getCssName(ViewBox.CSS_CLASS_PREFIX, '');
ViewBox.HIDDEN_CLASS = /**@type {string} @const*/ goog.getCssName(ViewBox.CSS_CLASS_PREFIX, 'hidden');
ViewBox.DRAG_AND_DROP_HANDLE_CLASS = /**@type {string} @const*/ goog.getCssName(ViewBox.CSS_CLASS_PREFIX, 'draganddrophandle');
ViewBox.DRAGGING_CLASS = /**@type {string} @const*/ goog.getCssName(ViewBox.CSS_CLASS_PREFIX, 'dragging');



/**
 * @type {?ViewSchemeManager}
 * @protected
 */
ViewBox.prototype.ViewSchemeManager_ = null;




/**
 * @type {?ViewSchemeMenu}
 * @private
 */
ViewBox.prototype.ViewSchemeMenu_ = null;




/**
 * @type {?ContentDivider}
 * @private
 */	
ViewBox.prototype.ContentDivider_ = null;




/**
 * @type {?ViewBoxTabs}
 * @private
 */	
ViewBox.prototype.ViewBoxTabs_ = null;




/**
 * @type {?ViewablesHolder}
 */
ViewBox.prototype.Displayer_ = null;




/**
 * @type {object}
 * @private
 */
ViewBox.prototype.displayableData_ = {};




/**
 * @type {String}
 * @private
 */
ViewBox.prototype.loadFramework_ = 'XTK';





/**
 * Tracks what can and can't be faded when the 
 * mouse moves out of the zone of the ViewBox.
 *
 * @type {Array.Object}
 * @private
 */
ViewBox.prototype.mouseoutFadeables_ = [];




/**
 * Adds an element or object to be faded when
 * the mouseout event occurs over the ViewBox.
 *
 * @type {function(Object)}
 */
ViewBox.prototype.addMouseoutFadeable = function(fadeable) {
    this.mouseoutFadeables_.push(fadeable)
}




/**
 * @type {Object}
 * @protected
 */
ViewBox.prototype._ViewSchemeMenu = undefined;




/**
 * @type {string}
 * @private
 */
ViewBox.prototype.currentThumbnail_ = undefined;




/**
 * @type {function(string)}
 * @param {string}
 * @private
 */	
ViewBox.prototype.setThumbnail = function(t) {		
    this.currentThumbnail_ = t;				
}




/**
 * @return {string}
 */	
ViewBox.prototype.getThumbnail = function() {
    return this.currentThumbnail_;
}




/**
 * Allows for external communication to set
 * the viewscheme within the ViewBox by communicating
 * to its ViewSchemeMenu object.
 *
 * @param {string}
 */
ViewBox.prototype.setViewScheme = function(viewPlane) {
    this.ViewSchemeMenu_.setViewScheme(viewPlane);
}



/**
 * Allow all child elements of the ViewBox to be visible.
 *
 * @type {function(!boolean)}
 * @private
 */
ViewBox.prototype.setChildrenVisible = function(bool) {
    goog.array.forEach(this._element.childNodes, function(childElt){
	if (!bool) { goog.dom.classes.add(childElt, ViewBox.HIDDEN_CLASS);}
	else { goog.dom.classes.remove(childElt, ViewBox.HIDDEN_CLASS);}
    })
}




/**
 * Initializes the 'Displayer' object which allows
 * various viewable content to be displayed, based on 
 * the 'loadFramework' internal variable.
 *
 * @type {function()}
 */
ViewBox.prototype.initDisplayer = function(){
    var that = this;



    //------------------
    // Retrieve the loadFramework.
    //------------------
    switch (this.loadFramework_){
    case 'XTK': this.Displayer_ = new XtkDisplayer(this, {'parent': this._element})
    }



    //------------------
    // Onload callbacks
    //------------------
    this.Displayer_.onOnload(function(){
	if (that._element.hasAttribute('originalbordercolor')){
	    that._element.style.borderColor = that._element.getAttribute('originalbordercolor');
	}
	that.ViewSchemeMenu_.setViewScheme('Four-up');
	that.setChildrenVisible(true);	
    })
}




/**
 * Loads a thumbnail into the viewer by communicating
 * to the various internal components that handle viewing:
 * ViewSchemeManager, Displayer, ViewSchemeMenu, ViewBoxTabs, 
 * etc.
 *
 * @param {!Thumbnail, string=}
 */
ViewBox.prototype.loadThumbnail = function (thumb, loadFramework) {

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
    // This is here because the ViewBoxTabs may not fully adjust themselves
    // properly during the initiation process.  It's especially relevant
    // when multiple ViewBoxes are open.
    //------------------
    this.updateStyle();



    //------------------
    // Hide children
    //------------------
    this.ViewSchemeManager_.setViewPlanes(this.Displayer_.getViewPlaneElements(), this.Displayer_.getViewPlaneInteractors());
    this.ViewSchemeManager_.animateViewSchemeChange(false);
    this.ViewSchemeManager_.setViewScheme('none');
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
    // Feed view planes into ViewSchemeManager and set 
    // the default ViewScheme (most likely '3D')
    //------------------
    this.ViewSchemeMenu_.setViewScheme(onloadPlane);



    //------------------
    // Turn back on animations.
    //------------------
    this.ViewSchemeManager_.animateViewSchemeChange(true);
    
    

    //------------------
    // Load collection in XtkDisplayer, prioritizing the 3D viewer
    // as that is where the progress bar lies.
    //------------------
    this.Displayer_.loadFileCollection(thumb._properties.files, onloadPlane);
    


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
    XV.highlightInUseThumbnails();
}




/**
 * Updates the various compoents of the ViewBox when the
 * user interacts with the ViewScheme menu.  Specifically,
 * the ViewSchemeManager.
 *
 * @type {function()}
 * @private
 */
ViewBox.prototype.setViewSchemeMenuCallbacks = function () {
    var that = this;



    //------------------
    // When a menu Item is clicked.
    //------------------
    this.ViewSchemeMenu_.onMenuItemClicked( function() {
	that.ViewSchemeManager_.setViewScheme(that.ViewSchemeMenu_.getSelectedViewScheme());
	//that.updateStyle();
	
    });



    //------------------
    // Callback when all panels are visible
    //------------------
    this.ViewSchemeManager_.onMultipleViewPlanesVisible(function(visiblePanels){ that.Displayer_.XtkPlaneManager_.colorSliders();})



    //------------------
    // Callback when one panel is visible
    //------------------
    this.ViewSchemeManager_.onOneViewPlaneVisible(function(visiblePanel){ that.Displayer_.XtkPlaneManager_.uncolorSliders();})



    //------------------
    // Once the view scheme is set, 
    // update the displayer style.
    //------------------
    this.ViewSchemeManager_.onViewSchemeChanged(function(){ that.Displayer_.updateStyle()});



    //------------------
    // For when the view scheme animates, 
    // update the Displayer style.
    //------------------
    this.ViewSchemeManager_.onViewSchemeAnimate(function(){ that.Displayer_.updateStyle()});



    //------------------
    // Callback when a plane is double clicked.
    //------------------
    this.ViewSchemeManager_.onPlaneDoubleClicked(function(anatomicalPlane){ 
	that.ViewSchemeMenu_.setViewScheme(anatomicalPlane);
	that.Displayer_.updateStyle()

    });
}




/**
 * Allows for the ViewBox widgets to be re-dimensioned / activated
 * when the ContentDivider is dragged.
 *
 * @type {function}
 * @private
 */
ViewBox.prototype.linkContentDividerToViewBox = function () {
	
    var that = this;
    var isAnimated = true;



    //------------------
    // Recompute the ViewBox style when the 
    // content divider is dragged.  This will readjust the dimensions
    // of the ViewBoxTabs and the XtkDisplayer.
    //------------------
    this.ContentDivider_.addDragCallback(function() {	

	//
	// Deactivate tabs if the content divider slides to
	// to the bottom of the ViewBox.
	//
	if (utils.style.dims(that.ContentDivider_._element, 'top') < that.ContentDivider_.getLowerLimit()) {
	    that.ViewBoxTabs_.setActive(that.ViewBoxTabs_.getLastActiveTab());
	} else {
	    that.ViewBoxTabs_.setActive(-1);
	}

	//
	// Update the position of the tabs and the style
	// of the ViewBox.
	//
	var contentDividerDims = utils.style.dims(that.ContentDivider_._element);
	var tabTop = contentDividerDims['top'] + contentDividerDims['height'];
	that.ViewBoxTabs_.updateStyle({ 'top': tabTop});
	that.updateStyle();
    })



    //------------------
    // Sometimes the ViewBoxTabs do not catch up with the content divider position.
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
 * Hides and shows the various child elements of the ViewBox
 * when the MOUSEOVER event occurs over the ViewBox element.
 *
 * @private
 */
ViewBox.prototype.setHoverEvents = function () {	
    var that = this;     



    //------------------
    // Set the classes that will NOT be faded.
    //------------------
    var keeperClasses = [XtkDisplayer.ELEMENT_CLASS];



    //------------------
    // Set the classes that are subclasses of the keepers
    // that are to be faded.
    //------------------
    var otherFadeClasses = [XtkPlane.SLIDER_CLASS];


    
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
 * DEPRECATED: When the ViewBox could be dragged and swapped
 * with others.
 *
 * @param {Element}
 * @protected
 */
ViewBox.prototype.createDragElement = function(srcElt) {

    if (!this._element.isCloneable) {
	
	//
	//  Return an empty div, basically
	//
	var dummy = document.createElement("div");
	dummy.id = "DUMMY";
	return dummy;	
    }
    
    var returner = srcElt.cloneNode(false);
    if (returner.id !== 'DUMMY') {
	
	var parent, srcCanv, clonedCanv, context;
	var keepElts = [];
	
	parent = goog.dom.getAncestorByClass(srcElt, XnatViewerGlobals.classNames.ViewBox);

	//
	// Create draggable ghost by cloning the parent
	//	
	returner = parent.cloneNode(true);
	returner.style.FONT_FAMILY = XnatViewerGlobals.FONT_FAMILY;
	
	//
	// Draw text on draggable ghost
	//  
	returner.style.opacity = .7;	
	returner.className = "VIEWERCLONE";
	returner.id = "CLONE";
	
	
	utils.style.setStyle(returner, {
	    'cursor': 'move',
	    '-moz-user-select': 'none'
	})
	
	
	goog.events.removeAll(returner);		
    }

    
    
    return returner;		

}




/**
* Widely used general style update for a variety of purpsoes: 
* modal and window resizing, and any change to the dimensions of the
* ViewBox components.
*
* @param {Object=}
*/
ViewBox.prototype.updateStyle = function (opt_args) {
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
    // ONLOAD ONLY: The ContentDivider dictates the position of all of the
    // other widgets in the ViewBox.
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
	    var t = XnatViewerGlobals.MIN_HOLDER_HEIGHT;	
	    var h = widgetDims['height'] - t - utils.style.dims(this.ContentDivider_._element, 'height') - XnatViewerGlobals.MIN_TAB_HEIGHT + 3;
	
	    utils.style.setStyle(this.ContentDivider_._element, {
		'top': XnatViewerGlobals.minContentDividerTop(widgetDims['height']) - 1
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
    // ViewScheme
    //----------------------------------
    //utils.dom.debug("view box");
    this.ViewSchemeManager_.implementViewScheme();



    
    //----------------------------------
    // Holder
    //----------------------------------
    this.Displayer_.updateStyle({
        'top': xtkHolderDims['top'],
 	'width': widgetDims['width'],
 	'height': xtkHolderDims['height']
    });
        
}
