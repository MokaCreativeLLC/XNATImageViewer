/**
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 */
goog.provide('xiv.ui.layouts.LayoutHandler');

// goog
goog.require('goog.fx.Animation');
goog.require('goog.fx.dom.Slide');
goog.require('goog.fx.dom.Resize');
goog.require('goog.events');
goog.require('goog.fx.AnimationParallelQueue');
goog.require('goog.fx.dom.FadeOut');
goog.require('goog.string');
goog.require('goog.fx.dom.BgColorTransform');
goog.require('goog.style');
goog.require('goog.object');
goog.require('goog.dom');
goog.require('goog.fx.dom.FadeInAndShow');
goog.require('goog.array');

// nrg
goog.require('nrg.ui.Component');
goog.require('nrg.dom');
goog.require('nrg.fx');
goog.require('nrg.string');
goog.require('nrg.array');
goog.require('nrg.style');

// xiv
goog.require('xiv.ui.layouts.TwoDWidescreen');
goog.require('xiv.ui.layouts.Layout');
goog.require('xiv.ui.layouts.ThreeD');
goog.require('xiv.ui.layouts.Sagittal');
goog.require('xiv.ui.layouts.Conventional');
goog.require('xiv.ui.layouts.Transverse');
goog.require('xiv.ui.layouts.FourUp');
goog.require('xiv.ui.layouts.LayoutFrame');
goog.require('xiv.ui.layouts.TwoDRow');
goog.require('xiv.ui.layouts.Coronal');
goog.require('xiv.ui.layouts.XyzvLayout');

//-----------




/**
 * xiv.ui.layouts.LayoutHandler is the class that handles the various 
 * xiv.ui.layouts.Layout when viewing a dataset in the xiv.ui.ViewBox.  
 *
 * @constructor
 * @extends {nrg.ui.Component}
 */
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
     * Stores the constructor classes of xiv.ui.layouts.Layout.  
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
 * @expose
 */
xiv.ui.layouts.LayoutHandler.CSS_SUFFIX = {}



/**
 * @private
 * @type {!number}
 * @const
 */
xiv.ui.layouts.LayoutHandler.ANIM_TIME = 500;



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
 * @type {!boolean}
 * @private
 */  
xiv.ui.layouts.LayoutHandler.prototype.animateLayoutChange_ = true;



/**
* @public
* @return {boolean}
*/ 
xiv.ui.layouts.LayoutHandler.prototype.layoutChanging = function(){
    return this.layoutChanging_;
};



/**
* @public
* @param {boolean} bool
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
    //window.console.log("UPDATE INTERACTORS");

    //
    // exit out if no master layout
    //
    if (!goog.isDefAndNotNull(this.masterLayout_)) { return }
    this.masterLayout_.updateInteractors();
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
 * @public
 * @param {!string} plane The plane to retrieve the interactors from.
 * @return {xiv.ui.layouts.XyzvLayout.InteractorSet}
 */
xiv.ui.layouts.LayoutHandler.prototype.getMasterInteractorsByPlane = 
function(plane) {
    return goog.isDefAndNotNull(this.masterLayout_) ? 
	this.masterLayout_.getInteractorsByPlane(plane) : null;
}


/**
 * @public
 * @param {!string} plane The plane to retrieve the interactors from.
 * @return {xiv.ui.layouts.LayoutFrame}
 */
xiv.ui.layouts.LayoutHandler.prototype.getMasterFrameByPlane = 
function(plane) {
    return goog.isDefAndNotNull(this.masterLayout_) ? 
	this.masterLayout_.getFrameByPlane(plane) : null;
}



/**
 * @param {!string} plane The plane of the layout frame.
 * @param {!string} interactorKey The key of the interactor.
 * @return {xiv.ui.layouts.XyzvLayout.InteractorSet}
 * @public
 */
xiv.ui.layouts.LayoutHandler.prototype.getMasterInteractorByPlane =  
function(plane, interactorKey) {
     return goog.isDefAndNotNull(this.masterLayout_) ? 
	this.masterLayout_.getInteractorByPlane(plane, interactorKey) : null;
};


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

    //
    // Switch the layout
    //
    this.switchLayout((opt_animateSwitch === false) ? 
		      0 : xiv.ui.layouts.LayoutHandler.ANIM_TIME);
}


/**
 * @private
 */ 
xiv.ui.layouts.LayoutHandler.prototype.bindLayoutToSliderMousewheels_ = 
function() {

    //window.console.log('\n\nBINDING LAYOUT');;
    //
    // Bind the slider mousewheel
    //
    var slider;
    var currFrames = this.Layouts_[this.currLayoutTitle_].getLayoutFrames();
    goog.object.forEach(currFrames, function(frame, key){
	//
	// Get the slider associated with the frame
	//
	slider = this.getMasterInteractorByPlane(key, 
		xiv.ui.layouts.Layout.INTERACTORS.SLIDER);

	
	//window.console.log(slider, 
	//frame[xiv.ui.layouts.LayoutHandler.SLIDER_BOUND]);
	if (goog.isDefAndNotNull(slider) && !goog.isDefAndNotNull(
	    frame[xiv.ui.layouts.LayoutHandler.SLIDER_BOUND])) {

	    //
	    // Make sure the slider changes on the mousewheel
	    // whenever it is moved over the frame
	    //
	    slider.bindToMouseWheel(frame.getElement());

	    //
	    // Register that the frame has the slider attached to it 
	    //
	    frame[xiv.ui.layouts.LayoutHandler.SLIDER_BOUND] = true;
	}
    }.bind(this))
}




/**
 * @type {Event}
 * @private
 */ 
xiv.ui.layouts.LayoutHandler.prototype.onLayoutResize_ = function(e) {
    //window.console.log("RESIZE", e, typeof e)
    this.dispatchEvent({
	type: xiv.ui.layouts.LayoutHandler.EventType.RESIZE
    })
}




/**
 * @param {number=} opt_time The optional time to animate.  Defaults to
 *     xiv.ui.layouts.LayoutHandler.ANIM_TIME set value.
 * @private
 */ 
xiv.ui.layouts.LayoutHandler.prototype.switchLayout = function(opt_time) {
    //window.console.log("SWITCH LAYOUT", opt_time, this.prevLayoutTitle_);
    //
    // Set opt_time
    //
    opt_time = (goog.isNumber(opt_time) && (opt_time >= 0)) ? opt_time : 
	xiv.ui.layouts.LayoutHandler.ANIM_TIME;

    //
    // Do nothing if we're the previous layout is the same as the current one.
    //
    if (this.prevLayoutTitle_ == this.currLayoutTitle_){
	this.bindLayoutToSliderMousewheels_();
	return;
    }

    //
    // If no previous layout or opt_time is zero, simply cut to the chase.
    //
    if (!this.prevLayoutTitle_){ 
	this.setLayoutVisible_(this.currLayoutTitle_);
	this.setLayoutOpacity_(this.currLayoutTitle_, 1);
	return;
    }


    if (!this.animateLayoutChange_){
	this.runLayoutChangeAnim_(0);
	return
    }

    //
    // Otherwise run the animation
    //
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

    //
    // We need to render the current layout to get an accurate idea
    // of the dimensions to generate accurate transition animations.
    //
    this.setLayoutVisible_(this.currLayoutTitle_);
    this.setLayoutOpacity_(this.currLayoutTitle_, 1);
    
    //
    // Clear stored dims
    //
    if (goog.isDefAndNotNull(this.asIsDims_)){
	goog.object.clear(this.asIsDims_);
    }
    if (goog.isDefAndNotNull(this.toBeDims_)){
	goog.object.clear(this.toBeDims_);
    }
    this.asIsDims_ = {};
    this.toBeDims_ = {};

    
    //window.console.log((newLayoutFrames['X'].getElement()))
    //window.console.log(goog.style.getSize(newLayoutFrames['X'].getElement()))

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
		//window.console.log("TRANS", key, this.toBeDims_[key]);


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

    //window.console.log('TO BE DIMS:', this.toBeDims_);
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
 * @const
 */
xiv.ui.layouts.LayoutHandler.SLIDER_BOUND = goog.string.createUniqueString();


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
	    goog.dom.appendChild(newLayoutFrame.getElement(), child);
	})
    }.bind(this));


    //window.console.log("\n\nTO BE", this.toBeDims_['X']);


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
    if (this.Layouts_[this.currLayoutTitle_] !==
	this.masterLayout_) {
	this.Layouts_[this.currLayoutTitle_].setInteractors(
	    this.getMasterInteractors());
    }


    //
    // Dispose of the transition elements
    //
    this.disposeTransitionElts_();

    //
    // Track changing
    //
    this.layoutChanging_ = false;

    //
    // Show the new (current) layout
    //
    this.setLayoutVisible_(this.currLayoutTitle_);
    this.setLayoutOpacity_(this.currLayoutTitle_, 1);
    
    //
    // Dispose the transition dims
    //
    this.disposeTransitionDims_();

    //
    // Dispatch event
    //
    this.dispatchEvent({
	type: xiv.ui.layouts.LayoutHandler.EventType.LAYOUT_CHANGE_END,
	frames: newLayoutFrames
    })


    //
    // IMPORTANT!!
    //
    this.bindLayoutToSliderMousewheels_();


    //
    // For safety
    // 
    this.updateStyle();
}



/**
 * @param {!string} layoutKey The layout key to apply the changes to.
 * @param {!number} op
 * @private
 */ 
xiv.ui.layouts.LayoutHandler.prototype.setLayoutOpacity_ = 
function(layoutKey, op) {
    this.Layouts_[layoutKey].getElement().style.opacity = op;
    this.Layouts_[layoutKey].updateStyle();
}



/**
 * @param {!string} layoutKey The layout key to apply the changes to.
 * @private
 */ 
xiv.ui.layouts.LayoutHandler.prototype.setLayoutVisible_ = 
function(layoutKey) {
    this.Layouts_[layoutKey].getElement().style.visibility = 'visible';
    this.Layouts_[layoutKey].updateStyle();
}



/**
 * @param {!string} layout The layout key to apply the changes to.
 * @private
 */ 
xiv.ui.layouts.LayoutHandler.prototype.setLayoutHidden_ = 
function(layoutKey) {
    this.Layouts_[layoutKey].getElement().style.visibility = 'hidden';
    this.Layouts_[layoutKey].updateStyle();
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
	//window.console.log(goog.dom.getChildren(elt));
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
			       //
			       // TODO: Consider implement layout change on 
			       // plane double click
			       //
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
    this.Layouts_[this.currLayoutTitle_].updateStyle();    
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

    this.disposeComponentMap(this.Layouts_);
    delete this.Layouts_;

    goog.object.clear(this.LayoutObjects_);
    delete this.LayoutObjects_;

    delete this.currLayoutTitle_;
    delete this.prevLayoutTitle_;
}




goog.exportSymbol('xiv.ui.layouts.LayoutHandler.EventType',
	xiv.ui.layouts.LayoutHandler.EventType);
goog.exportSymbol('xiv.ui.layouts.LayoutHandler.ID_PREFIX',
	xiv.ui.layouts.LayoutHandler.ID_PREFIX);
goog.exportSymbol('xiv.ui.layouts.LayoutHandler.CSS_SUFFIX',
	xiv.ui.layouts.LayoutHandler.CSS_SUFFIX);
goog.exportSymbol('xiv.ui.layouts.LayoutHandler.ANIM_TIME',
	xiv.ui.layouts.LayoutHandler.ANIM_TIME);
goog.exportSymbol('xiv.ui.layouts.LayoutHandler.SLIDER_BOUND',
	xiv.ui.layouts.LayoutHandler.SLIDER_BOUND);
goog.exportSymbol('xiv.ui.layouts.LayoutHandler.prototype.layoutChanging',
	xiv.ui.layouts.LayoutHandler.prototype.layoutChanging);
goog.exportSymbol('xiv.ui.layouts.LayoutHandler.prototype.animateLayoutChange',
	xiv.ui.layouts.LayoutHandler.prototype.animateLayoutChange);
goog.exportSymbol('xiv.ui.layouts.LayoutHandler.prototype.getCurrentLayout',
	xiv.ui.layouts.LayoutHandler.prototype.getCurrentLayout);
goog.exportSymbol(
    'xiv.ui.layouts.LayoutHandler.prototype.getCurrentLayoutFrame',
    xiv.ui.layouts.LayoutHandler.prototype.getCurrentLayoutFrame);
goog.exportSymbol(
    'xiv.ui.layouts.LayoutHandler.prototype.updateInteractors',
    xiv.ui.layouts.LayoutHandler.prototype.updateInteractors);
goog.exportSymbol(
    'xiv.ui.layouts.LayoutHandler.prototype.getMasterInteractors',
    xiv.ui.layouts.LayoutHandler.prototype.getMasterInteractors);
goog.exportSymbol(
    'xiv.ui.layouts.LayoutHandler.prototype.getMasterInteractorsByPlane',
    xiv.ui.layouts.LayoutHandler.prototype.getMasterInteractorsByPlane);
goog.exportSymbol(
    'xiv.ui.layouts.LayoutHandler.prototype.getMasterFrameByPlane',
    xiv.ui.layouts.LayoutHandler.prototype.getMasterFrameByPlane);
goog.exportSymbol(
    'xiv.ui.layouts.LayoutHandler.prototype.getMasterInteractorByPlane',
    xiv.ui.layouts.LayoutHandler.prototype.getMasterInteractorByPlane);
goog.exportSymbol('xiv.ui.layouts.LayoutHandler.prototype.setMasterLayout',
	xiv.ui.layouts.LayoutHandler.prototype.setMasterLayout);
goog.exportSymbol('xiv.ui.layouts.LayoutHandler.prototype.addLayout',
	xiv.ui.layouts.LayoutHandler.prototype.addLayout);
goog.exportSymbol('xiv.ui.layouts.LayoutHandler.prototype.setLayout',
	xiv.ui.layouts.LayoutHandler.prototype.setLayout);
goog.exportSymbol('xiv.ui.layouts.LayoutHandler.prototype.switchLayout',
	xiv.ui.layouts.LayoutHandler.prototype.switchLayout);
goog.exportSymbol('xiv.ui.layouts.LayoutHandler.prototype.hideAllLayouts',
	xiv.ui.layouts.LayoutHandler.prototype.hideAllLayouts);
goog.exportSymbol(
    'xiv.ui.layouts.LayoutHandler.prototype.onLayoutFrameDoubleClicked',
    xiv.ui.layouts.LayoutHandler.prototype.onLayoutFrameDoubleClicked);
goog.exportSymbol('xiv.ui.layouts.LayoutHandler.prototype.updateStyle',
	xiv.ui.layouts.LayoutHandler.prototype.updateStyle);
goog.exportSymbol('xiv.ui.layouts.LayoutHandler.prototype.disposeInternal',
	xiv.ui.layouts.LayoutHandler.prototype.disposeInternal);
