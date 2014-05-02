/**
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 */

// goog
goog.require('goog.fx.AnimationParallelQueue');
goog.require('goog.dom');
goog.require('goog.string');
goog.require('goog.events');
goog.require('goog.fx.Animation');
goog.require('goog.fx.dom.FadeInAndShow');
goog.require('goog.fx.dom.FadeOut');
goog.require('goog.fx.dom.Resize');
goog.require('goog.fx.dom.Slide');
goog.require('goog.fx.dom.BgColorTransform');

// utils
goog.require('nrg.dom');
goog.require('nrg.array');
goog.require('nrg.string');
goog.require('nrg.style');
goog.require('nrg.fx');
goog.require('nrg.ui.Component');

// xiv
goog.require('xiv.ui.layouts.Layout');
goog.require('xiv.ui.layouts.Conventional');
goog.require('xiv.ui.layouts.FourUp');
goog.require('xiv.ui.layouts.Sagittal');
goog.require('xiv.ui.layouts.Coronal');
goog.require('xiv.ui.layouts.Transverse');
goog.require('xiv.ui.layouts.TwoDRow');
goog.require('xiv.ui.layouts.TwoDWidescreen');
goog.require('xiv.ui.layouts.ThreeD');




/**
 * xiv.ui.layouts.LayoutHandler is the class that handles the various 
 * xiv.ui.layout.Layout when viewing a dataset in the xiv.ui.ViewBox.  
 *
 * @constructor
 * @extends {nrg.ui.Component}
 */
goog.provide('xiv.ui.layouts.LayoutHandler');
xiv.ui.layouts.LayoutHandler = function() {
    goog.base(this);

    /**
     * Layouts.
     * @dict
     * @const
     */
    this.constructor.LayoutTypes = {};
    this.constructor.LayoutTypes[xiv.ui.layouts.FourUp.TITLE] = 
	xiv.ui.layouts.FourUp;
    this.constructor.LayoutTypes[xiv.ui.layouts.Conventional.TITLE] = 
	xiv.ui.layouts.Conventional;



    /**
     * Stores the constructor classes of xiv.uiLayout.  
     * We have this because we don't want to create an instance of a Layout 
     * unless absolutely necessary -- (i.e. when the menu selection chooses 
     * a given layout).  In short, we create the layouts as they are selected,
     * not beforehand.
     *
     * @private
     * @type {!Object.<string, Object>}
     */ 
    this.LayoutObjects_ = {};


    /**
     * @private
     * @type {string}
     */ 
    this.currLayoutTitle_;


    /**
     * @private
     * @type {string}
     */ 
    this.prevLayoutTitle_;


    /**
     * @private
     * @type {Object.<string, Array.Element>}
     */ 
    this.planeChildren_ = {};


    /**
     * @private
     * @type {Object.<string, Element>}
     */ 
    this.transitionElts_ = {};

}
goog.inherits(xiv.ui.layouts.LayoutHandler, nrg.ui.Component);
goog.exportSymbol('xiv.ui.layouts.LayoutHandler', xiv.ui.layouts.LayoutHandler);



/**
 * Event types.
 * @enum {string}
 * @public
 */
xiv.ui.layouts.LayoutHandler.EventType = {
    LAYOUT_CHANGE_START: goog.events.getUniqueId('layout_change_start'),
    LAYOUT_CHANGE_END: goog.events.getUniqueId('layout_change_end'),
    LAYOUT_CHANGING: goog.events.getUniqueId('layout_changed'),
    RESIZE: goog.events.getUniqueId('resize'),
}



/**
 * @type {!string} 
 * @const
 * @expose
 */
xiv.ui.layouts.LayoutHandler.ID_PREFIX =  'xiv.ui.layouts.LayoutHandler';



/**
 * @enum {string}
 * @public
 */
xiv.ui.layouts.LayoutHandler.CSS_SUFFIX = {}



/**
 * @private
 * @type {!number}
 * @const
 */
xiv.ui.layouts.LayoutHandler.ANIM_TIME = 800;



/**
 * @private
 * @type {?Object.<string, xiv.ui.layouts.Layout>}
 */ 
xiv.ui.layouts.LayoutHandler.prototype.Layouts_ = null;



/**
 * @private
 * @type {!string}
 */ 
xiv.ui.layouts.LayoutHandler.prototype.masterLayout_ = null;



/**
 * @private
 * @type {!boolean}
 */ 
xiv.ui.layouts.LayoutHandler.prototype.layoutChanging_ = false;



/**
 * @type {!Object.<string, Object>}
 * @private
 */ 
xiv.ui.layouts.LayoutHandler.prototype.asIsDims_ = null;



/**
 * @type {!Object.<string, Object>}
 * @private
 */  
xiv.ui.layouts.LayoutHandler.prototype.toBeDims_ = null;



/**
* @public
* @return {boolean}
*/ 
xiv.ui.layouts.LayoutHandler.prototype.layoutChanging = function(){
    return this.layoutChanging_;
};



/**
* @public
* @param {boolean}
*/ 
xiv.ui.layouts.LayoutHandler.prototype.animateLayoutChange = function(bool){
    this.animateLayoutChange_ = bool;
};



/**
* @return {xiv.ui.layouts.Layout}
*/ 
xiv.ui.layouts.LayoutHandler.prototype.getCurrentLayout = function(){
    return this.Layouts_[this.currLayoutTitle_];
};



/**
 * @param {!string} planeTitle
 * @return {xiv.ui.layouts.LayoutFrame}
 */ 
xiv.ui.layouts.LayoutHandler.prototype.getCurrentLayoutFrame = 
function(planeTitle){
    return this.Layouts_[this.currLayoutTitle_].
	getLayoutFrameByTitle(planeTitle);
};



/**
 * @public
 */
xiv.ui.layouts.LayoutHandler.prototype.updateInteractors = function() {
    window.console.log("UPDATE INTERACTORS");
    if (goog.isDefAndNotNull(this.masterLayout_)){
	this.masterLayout_.updateInteractors();
    }
}



/**
 * @public
 * @return {?Object.<xiv.ui.layouts.XyzvLayout.InteractorSet>}
 */
xiv.ui.layouts.LayoutHandler.prototype.getMasterInteractors = function() {
    return goog.isDefAndNotNull(this.masterLayout_) ? 
	this.masterLayout_.getInteractors() : null;
}



/**
 * @param {!string} title The title to associate with the layout.
 * @public
 */ 
xiv.ui.layouts.LayoutHandler.prototype.setMasterLayout = 
function(title) {
    this.setLayout(title);
    if (goog.isDefAndNotNull(this.masterLayout_)){
	this.masterLayout_.removeAllInteractors();
    }
    this.Layouts_[title].addInteractors();
    this.masterLayout_ = this.Layouts_[title]; 
}




/**
 * @param {!string} title The title to associate with the layout.
 * @param {!xiv.ui.layouts.Layout} layout
 * @public
 */ 
xiv.ui.layouts.LayoutHandler.prototype.addLayout = function(title, layout) {
    if (goog.object.containsKey(this.LayoutObjects_)){
	throw new Error(title + ' is an already used layout title!');
    }
    if (!layout) { return };

    this.LayoutObjects_[title] = layout; 
}



/**
 * @param {!string} title
 * @param {boolean=} opt_animateSwich Whehter to animate the layout switch. 
 *     Defaults to true.
 * @public
 */ 
xiv.ui.layouts.LayoutHandler.prototype.setLayout = 
function(title, opt_animateSwitch) {
    // Asserts
    if (!goog.object.containsKey(this.LayoutObjects_, title)){
	throw new Error('Invalid layout: ' + title + '!');
    }

    //
    // Create layouts object
    //
    if (!goog.isDefAndNotNull(this.Layouts_)) { 
	this.Layouts_ = {}; 
    }

    //
    // Create instance of layout object in Layouts_, if not stored.
    //
    if (!goog.object.containsKey(this.Layouts_, title)) {
	this.Layouts_[title] = new this.LayoutObjects_[title];

	//
	// LISTEN to resize
	//
	goog.events.listen(this.Layouts_[title], 
			   xiv.ui.layouts.Layout.EventType.RESIZE, 
			   this.onLayoutResize_.bind(this))
	//
	// Events
	//
	this.setLayoutEvents_(this.Layouts_[title]);
	//
	// Add to the main element.
	//
	goog.dom.append(this.getElement(), 
			this.Layouts_[title].getElement());
    }
    
    this.prevLayoutTitle_ = this.currLayoutTitle_;
    this.currLayoutTitle_ = title;
    this.switchLayout((opt_animateSwitch === false) ? 
			   0 : xiv.ui.layouts.LayoutHandler.ANIM_TIME);
}



/**
 * @type {Event}
 * @private
 */ 
xiv.ui.layouts.LayoutHandler.prototype.onLayoutResize_ = function(e) {
    //window.console.log("RESIZE", e, typeof e)
    //window.console.log('grabbing resize event from layout in handler');
    this.dispatchEvent({
	type: xiv.ui.layouts.LayoutHandler.EventType.RESIZE
    })
    
}



/**
 * @param {number=}
 * @return {Object}
 * @private
 */ 
xiv.ui.layouts.LayoutHandler.getTransitionStyles_ = function(elt) {
    var size = goog.style.getSize(elt);
    var pos = goog.style.getPosition(elt);
    return {	
	'left': pos.x,
	'top': pos.y,
	'width': size.width,
	'height': size.height,
	'opacity': parseInt(elt.style.opacity, 10),
	'background-color': elt.style.backgroundColor,
	'background': elt.style.background,
	'color': elt.style.color,
	'z-index': parseInt(elt.style.zIndex, 10)
    }
}



/**
 * @param {number=} opt_time The optional time to animate.  Defaults to
 *     xiv.ui.layouts.LayoutHandler.ANIM_TIME set value.
 * @private
 */ 
xiv.ui.layouts.LayoutHandler.prototype.switchLayout = function(opt_time) {
    //window.console.log("SWITCH LAYOUT", opt_time, this.prevLayoutTitle_);

    // Set opt_time
    opt_time = (goog.isNumber(opt_time) && (opt_time >= 0)) ? opt_time : 
	xiv.ui.layouts.LayoutHandler.ANIM_TIME;

    // Do nothing if we're the previous layout is the same as the current one.
    if (this.prevLayoutTitle_ == this.currLayoutTitle_){
	return;
    }

    // If no previous layout or opt_time is zero, simply cut to the chase.
    if (opt_time == 0 || !this.prevLayoutTitle_) { 
	this.showCurrentLayout();
	return;
    }

    this.runLayoutChangeAnim_(opt_time);
}



/**
 * @param {!xiv.ui.layouts.LayoutFrame} plane
 * @param {!string} key
 * @param {!Element} transitionElt
 * @private
 */ 
xiv.ui.layouts.LayoutHandler.prototype.storeAndAppendLayoutFrameChildren_ = 
function(plane, key, transitionElt) {
//
// Loop through the layouFrame's children
//
goog.array.forEach(goog.dom.getChildren(plane.getElement()),
    function(planeChild) {
	//
	// Store the frame's children
	//
	if (!goog.isDefAndNotNull(this.planeChildren_[key])){
	    this.planeChildren_[key] = [];
	}
	this.planeChildren_[key].push(planeChild); 
    }.bind(this))
}



/**
 * @private
 */
xiv.ui.layouts.LayoutHandler.prototype.setTransitionElementChildren_ = 
function() {
    goog.object.forEach(this.transitionElts_, function(elt){
	goog.dom.append(this.getElement().parentNode, elt);
    }.bind(this))
}


/**
 * @param {number=} opt_duration The animation opt_duration. 
 * @return {Array.<goog.fx.Animation>}
 * @private
 */
xiv.ui.layouts.LayoutHandler.prototype.generateTransitionAnims_ = 
function(opt_duration){
    var anims =  [];
    goog.object.forEach(this.transitionElts_, function(elt, key){
	anims = goog.array.concat(anims, 
		nrg.fx.generateAnimations(elt, 
					  this.asIsDims_[key], 
					  this.toBeDims_[key], 
					  opt_duration));
    }.bind(this))
    return anims;
}



/**
 * @param {number=} opt_duration The animation opt_duration. 
 * @private
 */ 
xiv.ui.layouts.LayoutHandler.prototype.runLayoutChangeAnim_ = 
function(opt_duration) {

    var newLayoutFrames = this.Layouts_[this.currLayoutTitle_].
	getLayoutFrames();
    var transitionElt;

    this.asIsDims_ = {};
    this.toBeDims_ = {};

    //
    // Loop the previous layout frames
    //
    goog.object.forEach(this.Layouts_[this.prevLayoutTitle_].getLayoutFrames(), 
	function(plane, key){
	    //
	    // Create transition elements, which are clones of the previous
	    // layout panels.
	    //
	    transitionElt = plane.getElement().cloneNode(false);
	    this.transitionElts_[key] = transitionElt;

	    //
	    // Store references to the plane's children
	    //
	    this.storeAndAppendLayoutFrameChildren_(plane, key, transitionElt);

	    //
	    // Append the plane children to transition
	    //
	    goog.object.forEach(this.planeChildren_, 
	    function(planeArr, planeOr){

		//-------------------------------
		// IMPORTANT!!!!!!!!!!!!!!
		// 
		// Attatch the plane's children to the transition element
		//-------------------------------
		goog.array.forEach(planeArr, function(planeChildElt){
		    goog.dom.removeNode(planeChildElt);
		    if (goog.isDefAndNotNull(this.transitionElts_[planeOr])){
			goog.dom.appendChild(this.transitionElts_[planeOr], 
					     planeChildElt)	
		    }
		}.bind(this))
	    }.bind(this))



	    //
	    // If the new layout has the same panels (idenfified by key)
	    // then we construct some animations.
	    //
	    if (goog.object.containsKey(newLayoutFrames, key)) {
		var transitionDims = 
		    nrg.fx.generateTransitionDims(
			plane.getElement(), newLayoutFrames[key].getElement());
		this.asIsDims_[key] = transitionDims.asIs;
		this.toBeDims_[key] = transitionDims.toBe;



	    //
	    // Otherwise we just fade the panels out...
	    //
	    } else {
		this.asIsDims_[key] = {'z-index' :  0};
		this.toBeDims_[key] = {'opacity' :  0};
	    }

	}.bind(this))

    //
    // attach transition elements to parent
    //
    this.setTransitionElementChildren_();

    //
    // run animation
    //
    nrg.fx.parallelAnimate(
	// Generate the sub-animations
	this.generateTransitionAnims_(opt_duration), 
	// BEGIN - hide all
	this.onLayoutChangeStart_.bind(this),
	// ANIMATE - do nothing
	this.onLayoutChanging_.bind(this),
	// END
	this.onLayoutChangeEnd_.bind(this))
}


/**
 * @private
 */ 
xiv.ui.layouts.LayoutHandler.prototype.onLayoutChangeStart_ = function() {
    //
    // Hide all layouts
    //
    this.hideAllLayouts();

    //
    // Track changing
    //
    this.layoutChanging_ = true;


    //
    // Dispatch event
    //
    this.dispatchEvent({
	type: xiv.ui.layouts.LayoutHandler.EventType.LAYOUT_CHANGE_START,
	transitionElements: this.transitionElts_
    })
}



/**
 * @private
 */ 
xiv.ui.layouts.LayoutHandler.prototype.onLayoutChanging_ = function() {
    this.dispatchEvent({
	type: xiv.ui.layouts.LayoutHandler.EventType.LAYOUT_CHANGING,
	transitionElements: this.transitionElts_
    })
}


/**
 * @private
 */ 
xiv.ui.layouts.LayoutHandler.prototype.onLayoutChangeEnd_ = function() {
    var newLayoutFrames = this.Layouts_[this.currLayoutTitle_].
	getLayoutFrames();

    //-------------------------------
    // IMPORTANT!!!!!!!!!!!!!!
    // 
    // Add all plane's children to new planes
    //-------------------------------
    goog.object.forEach(newLayoutFrames, function(newLayoutFrame, key){
	if (!goog.isDefAndNotNull(this.planeChildren_[key])){ return };
	goog.array.forEach(this.planeChildren_[key], function(child){
	    goog.dom.append(newLayoutFrame.getElement(), child);
	})
    }.bind(this));


    //-------------------------------
    // IMPORTANT!!!!!!!!!!!!!!
    // 
    // Style finalize
    //-------------------------------
    goog.object.forEach(newLayoutFrames, function(newLayoutFrame, key){
	if (goog.isDefAndNotNull(this.toBeDims_[key])){ 
	    nrg.style.setStyle(newLayoutFrame.getElement(), 
			       this.toBeDims_[key]);
	}
    }.bind(this));


    //
    // Transfer the interactors over
    //
    this.Layouts_[this.prevLayoutTitle_].transferInteractors(
	this.Layouts_[this.currLayoutTitle_])


    //
    // Dispose of the transition elements
    //
    this.disposeTransitionElts_();

    //
    // Track changing
    //
    this.layoutChanging_ = false;

    //
    // Dispatch event
    //
    this.dispatchEvent({
	type: xiv.ui.layouts.LayoutHandler.EventType.LAYOUT_CHANGE_END,
	frames: newLayoutFrames
    })

    //
    // Show the new (current) layout
    //
    this.showCurrentLayout()

    
    //
    // Dispose the transition dims
    //
    this.disposeTransitionDims_();
}



/**
 * @public
 */ 
xiv.ui.layouts.LayoutHandler.prototype.showCurrentLayout = function() {
    goog.object.forEach(this.Layouts_, function(layout, title){
	layout.getElement().style.visibility = 
	    (title == this.currLayoutTitle_) ? 'visible' : 'hidden';
	layout.updateStyle();
    }.bind(this))
}



/**
 * @public
 */ 
xiv.ui.layouts.LayoutHandler.prototype.hideAllLayouts = function() {
    goog.object.forEach(this.Layouts_, function(layout, title){
	layout.getElement().style.visibility = 'hidden';
	layout.updateStyle();
    }.bind(this))
}



/**
 * @private
 */
xiv.ui.layouts.LayoutHandler.prototype.disposeTransitionElts_ = function() {
    goog.object.forEach(this.transitionElts_, function(elt){
	window.console.log(goog.dom.getChildren(elt));
	goog.dom.removeNode(elt);
	delete elt;
    })
}


/**
 * @private
 */ 
xiv.ui.layouts.LayoutHandler.prototype.setLayoutEvents_ = 
function(layout){

    //
    // Double-click
    //
    goog.object.forEach(layout.getLayoutFrames(), function(plane){
	goog.events.listen(plane.getElement(), goog.events.EventType.DBLCLICK, 
			   function(e){
			   window.console.log("NEED TO IMPLEMENT PLANE CLICK!",
					      e.currentTarget);
			   })

    })
};



/**
 * Callback for when a plane is double-clicked.
 *
 * @param {function}
 */ 
xiv.ui.layouts.LayoutHandler.prototype.onLayoutFrameDoubleClicked = 
function(callback){
    this.planeDoubleClickedCallback_.push(callback)
};




/**
 * Sets the double-click EVENT for the ViewLayoutFrames
 * @private
 */
xiv.ui.layouts.LayoutHandler.prototype.setLayoutFramesDoubleClicked_ = 
function(callback){
 
}


/**
* @inheritDoc
*/
xiv.ui.layouts.LayoutHandler.prototype.updateStyle = function(){
    goog.base(this, 'updateStyle');
    
    var currLayout = this.Layouts_[this.currLayoutTitle_];

    window.console.log("lH update", 
		       goog.object.getCount(currLayout.getLayoutFrames()))
    if (goog.object.getCount(currLayout.getLayoutFrames()) > 1){
	this.Layouts_[this.currLayoutTitle_].updateStyle();
    }
}



/**
 * @private
 */
xiv.ui.layouts.LayoutHandler.prototype.disposeTransitionDims_ = function(){
    // Dims
    if (goog.isDefAndNotNull(this.asIsDims_)){
	goog.object.forEach(this.asIsDims_, function(dims){
	    goog.object.clear(dims);
	    dims = null;
	})
	goog.object.clear(this.toBeDims_);
	delete this.toBeDims_;
    }
    if (goog.isDefAndNotNull(this.toBeDims_)){
	goog.object.forEach(this.toBeDims_, function(dims){
	    goog.object.clear(dims);
	    dims = null;
	})
	goog.object.clear(this.toBeDims_);
	delete this.toBeDims_;
    }

}



/**
* @inheritDoc
*/
xiv.ui.layouts.LayoutHandler.prototype.disposeInternal = function(){
    goog.base(this, 'disposeInternal');

    this.disposeTransitionDims_();

    //
    // Transition elements.  
    // 
    // NOTE: This object should be leared at the end of each transition
    // animation
    //
    delete this.transitionElts_;


    //
    // LayoutFrame children
    //
    goog.object.clear(this.planeChildren_);
    delete this.planeChildren_;

    // Master layout
    delete this.masterLayout_;

    nrg.ui.disposeComponentMap(this.Layouts_);
    delete this.Layouts_;

    goog.object.clear(this.LayoutObjects_);
    delete this.LayoutObjects_;

    delete this.currLayoutTitle_;
    delete this.prevLayoutTitle_;
}
