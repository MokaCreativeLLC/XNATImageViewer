/**
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 * @author unkown email (uchida)
 */

// goog
goog.require('goog.dom');
goog.require('goog.string');
goog.require('goog.object');
goog.require('goog.array');
goog.require('goog.style');
goog.require('goog.math.Size');
goog.require('goog.math.Coordinate'); 
goog.require('goog.fx.Dragger');
goog.require('goog.fx.Dragger.EventType');
goog.require('goog.fx.dom.Slide'); 

// moka
goog.require('moka.ui.Component');
goog.require('moka.ui.ResizeDragger');
goog.require('moka.ui.ResizeDraggerRight');
//goog.require('moka.ui.ResizeDraggerTop');
//goog.require('moka.ui.ResizeDraggerBottom');
//goog.require('moka.ui.ResizeDraggerLeft');
goog.require('moka.style');




/**
 * Allows an element to be resizable within a given bounds.
 * This is an adaptation from the following source:
 * http://dev.ariel-networks.com/Members/uchida/stuff/goog-ui-resizable.zip/
 * 
 * @constructor
 * @param {!Element} element The element that will be resizable.
 * @param {!Array.string | !string} opt_dirs The optional directions. See
 *    property keys of 'moka.ui.Resizable.Directions'. Defaults to 
 *    property 'moka.ui.Resizable.defaultDirections'. 'ALL' or 'DEFAULT' 
 *    are also valid.
 * @extends {moka.ui.Component}
 */
goog.provide('goog.ui.Resizable');
goog.provide('goog.ui.Resizable.EventType');
moka.ui.Resizable = function(element, opt_dirs) {
    goog.base(this);


    /**
     * @type {!Element}
     * @private
     */
    this.element_ = goog.dom.$(element);


    /**
     * @type {!Object.<string, goog.fx.Dragger>}
     * @private
     */
    this.ResizeDraggers_ = {};

    
    /**
     * @type {goog.math.Rect}
     * @private
     */
    this.limits_ = moka.ui.Resizable.DEFAULT_LIMITS;


    /**
     * @type {number}
     * @private
     */
    this.minWidth_ = moka.ui.Resizable.DEFAULT_MIN_WIDTH, 


    /**
     * @type {number}
     * @private
     */
    this.minHieght_ = moka.ui.Resizable.DEFAULT_MIN_HEIGHT;



    this.setResizeDirections(opt_dirs || moka.ui.Resizable.defaultDirections);
};
goog.inherits(moka.ui.Resizable, moka.ui.Component);
goog.exportSymbol('moka.ui.Resizable', moka.ui.Resizable);



/**
 * @enum {string}
 * @public
 */
moka.ui.Resizable.EventType = {
    RESIZE: 'resize',
    START_RESIZE: 'start_resize',
    END_RESIZE: 'end_resize'
};



/**
 * @type {!string} 
 * @const
 */
moka.ui.Resizable.ID_PREFIX =  'moka.ui.Resizable';



/**
 * @enum {string} 
 * @const
 */ 
moka.ui.Resizable.CSS_SUFFIX = {
    BOUNDARY: 'boundary', 
}


 
/**
 * @dict
 * @public
 */
moka.ui.Resizable.DIRECTIONS = [
    'TOP',
    'RIGHT',
    'BOTTOM',
    'LEFT',
    'TOP_LEFT',
    'TOP_RIGHT',
    'BOTTOM_RIGHT',
    'BOTTOM_LEFT'
];



/**
 * @const
 * @public
 */
moka.ui.Resizable.DEFAULT_DIRECTIONS = ['RIGHT', 'BOTTOM', 'BOTTOM_RIGHT'];



/**
 * @const
 * @type {!goog.math.rect}
 */
moka.ui.Resizable.DEFAULT_LIMITS = new goog.math.Rect(0, 0, 600, 600);


/**
 * @type {!number} 
 * @const
 */
moka.ui.Resizable.DEFAULT_MIN_HEIGHT = 20;



/**
 * @type {!number} 
 * @const
 */
moka.ui.Resizable.DEFAULT_MIN_WIDTH = 20;



/**
 * @type {!number} 
 * @const
 */
moka.ui.Resizable.ANIM_MED = 500;




/**
 * @type {Object.<string, number>}
 */
this.boundThresholds_ = {
    'TOP': 4,
    'LEFT': 4,
    'RIGHT': 4,
    'BOTTOM': 4
}



/**
 * @param {!string} dir The direciton.
 * @param {!number} thresh The threshold number.  Must be positive.
 * @public
 */
moka.ui.Resizable.prototype.setBoundThreshold = function(dir, thresh){
    this.checkValidDirection(dir);
    if (thresh < 0){
	throw new Error('Threshold must be greater than zero!');
    }
    this.boundThresholds_[dir] = thresh;
}


/**
 * @type {goog.math.Coordinate}
 * @private
 */
moka.ui.Resizable.prototype.startPos_;



/**
 * @type {goog.math.Size}
 * @private
 */
moka.ui.Resizable.prototype.startSize_;



/**
 * @type {Element}
 * @private
 */
moka.ui.Resizable.prototype.boundaryElt_;



/**
 * @enum {number}
 * @private
 */
moka.ui.Resizable.prototype.atLimits_ = {
    TOP: 0,
    LEFT: 0,
    RIGHT: 0,
    BOTTOM: 0
};



/**
 * @enum {number}
 * @private
 */
moka.ui.Resizable.prototype.atMins_ = {
    WIDTH: 0,
    HEIGHT: 0,
};



/**
 * @type {goog.fx.dom.Slide}
 * @private
 */
moka.ui.Resizable.prototype.slideAnim_;



/**
 * @return {string} The dragger's direction.
 * @private
 */
moka.ui.Resizable.prototype.getResizeDraggerDirection_ = function(dragger) {
    var direciton = '';
    for (direction in this.ResizeDraggers_) {
	if (this.ResizeDraggers_[direction] === dragger) {
	    return direction;
	}
    }
};





/**
 * @return {!Array.<Element>}
 * @public
 */
moka.ui.Resizable.prototype.getHandles = function() {
    var handles = [];
    goog.array.forEach(goog.object.getValues(this.ResizeDraggers_), 
		       function(_Dragger){
			   handles.push(_Dragger.getHandle());
		       })
    return handles;
};




/**
 * Returns the specified dragger.
 *
 * @param {!string} dragDir
 * @return {!goog.fx.Dragger}
 * @public
 */
moka.ui.Resizable.prototype.getResizeDragger = function(dragDir) {
    this.checkDraggerDirValid_(dragDir);
    return this.ResizeDraggers_[dragDir];
};




/**
 * @return {!goog.math.Rect} 
 * @public
 */
moka.ui.Resizable.prototype.getLimits = function() {
    return this.limits_
};



/**
 * Returns the atLimits_ object.
 * 
 * TODO: this needs to be verified on init -- currently it isn't.
 *
 * @throws {Error} If invalid bound argument.
 * @return {!string} bound The bounds. 
 * @public
 */
moka.ui.Resizable.prototype.isAtLimits = function(bound) {
    switch(bound){
    case 'TOP':
	return this.atLimits_.TOP;
    case 'RIGHT':
	return this.atLimits_.RIGHT;
    case 'BOTTOM':
	return this.atLimits_.BOTTOM;
    case 'LEFT':
	return this.atLimits_.LEFT;
    }
    throw new Error('Invalid bounds: \'' + bound + '\'');
};





/**
 * Determines if the resizeable is near bounds within a given threshold.
 *
 * @param {!string} bound The bound to check.
 * @param {!number} opt_threshold The threshold to determine 'nearness' by.
 *     Defaults to moka.ui.Resizable.BOUND_THRESHOLD.
 * @return {!enum} The bounds. 
 * @public
 */
moka.ui.Resizable.prototype.isNearLimits = function(bound, opt_threshold) {

    opt_threshold = opt_threshold || moka.ui.Resizable.BOUND_THRESHOLD;
    var size = /**@type {!goog.math.Size}*/ 
    goog.style.getSize(this.getElement());
    var pos = /**@type {!goog.math.Coordinate}*/ 
    goog.style.getPosition(this.getElement());

    switch(bound){
    case 'TOP':
	return (Math.abs(pos.x - this.getTopLimit()) <= opt_threshold)
    case 'RIGHT':
	return (Math.abs(pos.x + size.width - 
			 this.getRightLimit()) <= opt_threshold)
    case 'BOTTOM':
	return (Math.abs(pos.y + size.height - 
			 this.getBottomLimit()) <= opt_threshold)
    case 'LEFT':
	return (Math.abs(pos.x - this.getLeftLimit()) <= opt_threshold)
    }
    throw new Error('Invalid bounds: \'' + bound + '\'');
};




/**
 * As stated.
 * @return {!number}
 * @public
 */
moka.ui.Resizable.prototype.getLeftLimit = function() {
    return this.limits_.x;
};



/**
 * As stated.
 * @return {!number}
 * @public
 */
moka.ui.Resizable.prototype.getTopLimit = function() {
    return this.limits.y
};



/**
 * As stated.
 * @return {!number}
 * @public
 */
moka.ui.Resizable.prototype.getRightLimit = function() {
    return this.limits_.x + this.limits_.width;
};



/**
 * As stated.
 * @return {!number}
 * @public
 */
moka.ui.Resizable.prototype.getBottomLimit = function() {
    return this.limits_.y + this.limits_.height;
};






/**
 * Set's the boundary of the resizeable based on the arguments.
 * 
 * @param {!number} x1 Top left x.
 * @param {!number} y1 Top left y.
 * @param {!number} with The width.
 * @param {!number} height The height.
 * @throws {Error} If x2 < x1.
 * @throws {Error} If y2 < y1.
 * @private
 */
moka.ui.Resizable.prototype.setLimits_ = function(x1, y1, width, height) {  
    this.limits_ = new goog.math.Rect(x1, y1, width, height)
}



/**
 * @param {!Element} elt The boundary Element.
 * @public
 */
moka.ui.Resizable.prototype.setBoundaryElement = function(elt) {
    this.boundaryElt_ = elt;
    this.updateLimits_();
};




/**
 * Sets the minimum height of the Resizable element.
 *
 * @param {!number} minH
 * @public
 */
moka.ui.Resizable.prototype.setMinHeight = function(minH) {
    this.minHeight_ = minH
};



/**
 * Sets the minimum width of the Resizable element.
 *
 * @param {!number} minW
 * @public
 */
moka.ui.Resizable.prototype.setMinWidth = function(minW) {
    this.minWidth_ = minW
};



/**
 * @return {!number}
 * @public
 */
moka.ui.Resizable.prototype.getMinHeight = function() {
    return this.minHeight_;
};



/**
 * @return {!number}
 * @public
 */
moka.ui.Resizable.prototype.getMinWidth = function() {
    return this.minWidth_;
};



/**
 * Allows the user to set the resize directions specified in 
 * moka.ui.Resizable.Directions.
 * 
 * @param {!Array.<string> | !string} opt_dirs The directions.  Defaults to 
 *    'DEFAULT', which is Bottom, 
 * @public
 */
moka.ui.Resizable.prototype.setResizeDirections = function(opt_dirs){

    opt_dirs = opt_dirs || 'DEFAULT';

    if (goog.isString(opt_dirs)){
	if (opt_dirs.toUpperCase() == 'ALL'){
	    opt_dirs = moka.ui.Resizable.DIRECTIONS;
	} else if (opt_dirs.toUpperCase() == 'DEFAULT') {
	    opt_dirs = moka.ui.Resizable.DEFAULT_DIRECTIONS;
	} else {
	    opt_dirs =  [opt_dirs];
	}
    }

    //
    // Loop
    //
    goog.array.forEach(opt_dirs, function(dir, i){
	// Make sure each value is a string.
	if (!goog.isString(dir)) { throw new Error('String required!') };
	// Make sure value is a valid direction.
	if (!goog.array.contains(moka.ui.Resizable.DIRECTIONS, dir)) {
	    throw new Error('Invalid direction: ', dir);
	}

	//
	// Add dragger.
	//
	this.addResizeDirection(dir);
    }.bind(this))
}



/**
 * @param {!string} draggerDir The dragger direction.
 * @throws {Error} If dragger direction is invalid.
 * @public
 */
moka.ui.Resizable.prototype.checkDirectionValid = function(draggerDir){
    if (!goog.array.contains(moka.ui.Resizable.DIRECTIONS, draggerDir)){
	throw new Error ('Invalid draggerDir \'' + draggerDir);
    }
}


/**
 * @param {!string} draggerDir The dragger direction.
 * @throws {Error} If dragger exists for the given direction.
 * @public
 */
moka.ui.Resizable.prototype.hasDragger = function(draggerDir){
    this.checkDirectionValid(draggerDir);
    if (!this.ResizeDraggers_[draggerDir]){
	throw new Error ('No ResizeDragger for ' + draggerDir);
    }
}



/**
 * Allows the user to slide a dragger to a specific position.
 *
 * @param {!string} draggerDir The dragger to slide. See 
 *      moka.ui.Resizable.Directions for values.
 * @param {!string} bounds The boundary to slide to.
 * @param {Function=} opt_callback The optional callback on completion.
 * @param {number=} opt_dur The optional duration.  Defaults to 
 *     moka.ui.Resizable.ANIM_MED.
 * @private
 */
moka.ui.Resizable.prototype.slideDraggerToLimits = 
function(draggerDir, bounds, opt_callback, opt_dur) {
    //
    // We can't do anything if the element is not in the DOM
    //
    if (!this.getElement().parentNode) { return };

    //
    // Make sure drag bounds are updated.
    //
    this.updateLimits_();

    //
    // Check dragger direction and bounds
    //
    draggerDir = draggerDir.toUpperCase();
    bounds = bounds.toUpperCase();
    this.checkDraggerDirValid_(draggerDir);
    if (!goog.isDefAndNotNull(moka.ui.Resizable.Directions[bounds])) { 
	throw new Error('Invalid bounds: ' + bounds);
    } 

    //
    // Get the params
    //
    var endCoordinate = this.getBoundCoords_(draggerDir, bounds);

    //
    // Exit out of no valid end coordinate defined
    //
    if (!goog.isDefAndNotNull(endCoordinate)) { return };

    //
    // Create anim
    //
    this.createSlideAnim_(draggerDir, endCoordinate, opt_callback, opt_dur);
    this.slideAnim_.play();
};




/**
 * @param {!string} draggerDir The dragger to slide. See 
 *      moka.ui.Resizable.Directions for values.
 * @param {!goog.math.Coordinate} newPoint The point to slide to.
 * @param {Function=} opt_callback The optional callback on completion.
 * @param {number=} opt_dur The optional duration.  Defaults to 
 *     moka.ui.Resizable.ANIM_MED.
 * @private
 */
moka.ui.Resizable.prototype.createSlideAnim_ = 
function(draggerDir, newPoint, opt_callback, opt_dur) {
    //
    // Params
    //
    var dragElt = this.getDragElt(draggerDir);
    var dragger = this.getDragger(draggerDir);
    var pos = goog.style.getPosition(dragElt);
    var size = goog.style.getSize(dragElt);

    //
    // The anim
    // 
    this.slideAnim_ = new goog.fx.dom.Slide(dragElt, 
		[pos.x, pos.y], [newPoint.x, newPoint.y], 
		opt_dur || moka.ui.Resizable.ANIM_MED, goog.fx.easing.easeOut);

    //
    // onAnimate START
    //
    goog.events.listen(this.slideAnim_, goog.fx.Animation.EventType.BEGIN, 
	function(e) {

	    /**
	    this.onResizeStart_({
		currentTarget: dragger
	    })
	    */
    }.bind(this));

    //
    // onAnimate
    //
    goog.events.listen(this.slideAnim_, goog.fx.Animation.EventType.ANIMATE, 
	function(e) {
	    window.console.log(dragger.handle);
	    /**
	    this.onResize_({
		currentTarget: dragger
	    })
	    */
    }.bind(this));

    //
    // onAnimate END
    //
    goog.events.listen(this.slideAnim_, goog.fx.Animation.EventType.END, 
	function(e) {
	    window.console.log('DRAG END', this.element_.style.width);
	    if (opt_callback) {opt_callback()};
	    this.slideAnim_.disposeInternal();
	    goog.events.removeAll(this.slideAnim_);
	    this.slideAnim_.destroy();
	    this.slideAnim_ = null;
    }.bind(this));
}
  


/**
 * @param {!string} dir
 * @param {!Element} element
 * @public
 */
moka.ui.Resizable.createResizeDragger = function(dir, element) {
    switch(dir){
    case 'TOP':
	return new moka.ui.ResizeDraggerTop(element);
	break;
    case 'BOTTOM':
	return new moka.ui.ResizeDraggerBottom(element);
	break;
    case 'LEFT':
	return new moka.ui.ResizeDraggerLeft(element);
	break;
    case 'RIGHT':
	return new moka.ui.ResizeDraggerRight(element);
	break;
    }
}




/**
 * @param {!string} dir The resize handler direction.
 * @public
 */
moka.ui.Resizable.prototype.addResizeDirection = function(dir) {
    // Check if direction is in use.
    if (goog.object.containsKey(this.ResizeDraggers_, dir)){
	throw new Error ('Resize direction ' + dir + ' already in use.')
    }
    
    // Create and store the appropriate dragger
    this.ResizeDraggers_[dir] = 
	moka.ui.Resizable.createResizeDragger(dir, this.element_);

    // Events
    goog.events.listen(this.ResizeDraggers_[dir], 
		       moka.ui.ResizeDragger.EventType.RESIZE_START, 
		       this.onResizeStart_.bind(this))
    goog.events.listen(this.ResizeDraggers_[dir], 
		       moka.ui.ResizeDragger.EventType.RESIZE, 
		       this.onResize_.bind(this))
    goog.events.listen(this.ResizeDraggers_[dir], 
		       moka.ui.ResizeDragger.EventType.RESIZE_END, 
		       this.onResizeEnd_.bind(this))

    // Update
    this.update();
};




/**
 * @public
 */
moka.ui.Resizable.prototype.update  = function() {
    this.updateLimits_();
    this.updateResizeDraggers_();
}



/**
 * @private
 */
moka.ui.Resizable.prototype.updateResizeDraggers_  = function() {
    if (!goog.isDefAndNotNull(this.boundaryElt_)) { return };

    //
    // Define the update dims
    //
    var updateDims = new moka.ui.ResizeDragger.UpdateDims(
	this.element_, this.boundaryElt_, this.minWidth_, this.minHeight_);

    //
    // Loop draggers
    //
    goog.object.forEach(this.ResizeDraggers_, function(Dragger, dir){
	//
	// Ensure that draggerHandles are attached to the boundaryElt.
	//
	if (this.boundaryElt_ && (Dragger.getHandle().parentNode !== 
	    this.boundaryElt_)) {
	    goog.dom.append(this.boundaryElt_, Dragger.getHandle());
	}

	//
	// Call dragger update
	//
	Dragger.update(updateDims);
    }.bind(this))
}



/**
 * @private
 */
moka.ui.Resizable.prototype.updateLimits_  = function() {
    // Do nothing if there's no parent to the boundaryElt or
    // it's not defined
    if (!this.boundaryElt_ || !this.boundaryElt_.parentNode){
	return;
    } 

    var width = (this.boundaryElt_.style.width.length != 0) ? 
	this.boundaryElt_.style.width : 
	parseInt(goog.style.getComputedStyle(this.boundaryElt_, 'width'));

    var height = (this.boundaryElt_.style.height.length != 0) ? 
	this.boundaryElt_.style.height : 
	parseInt(goog.style.getComputedStyle(this.boundaryElt_, 'height'));

    //
    // Exit out if there are NaNs
    //
    if (isNaN(width) || isNaN(height)) {
	window.console.log("WARNING: NaN values found.");
	return;
    }

    this.setLimits_(0, 0, width, height);
}



/**
 * @param {Event} e
 * @private
 */
moka.ui.Resizable.prototype.getDragParams_ = function(e){
    //
    // Dragger related
    //
    this.currDragger_ = e.currentTarget;
    this.currDragDirection_ = this.getDraggerDirection_(this.currDragger_);

    //
    // Drag element related
    //
    this.currDragEltSize_ = goog.style.getSize(this.currDragger_.handle);
    this.currDragEltPos_ = goog.style.getPosition(this.currDragger_.handle);

    //
    // element related
    //
    var el = this.continuousResize_ ? this.element_ : this.ghostEl_;
    this.eltSize_ = goog.style.getSize(el);
    this.eltPos_ = goog.style.getPosition(el);
    this.startPos_ = goog.style.getPosition(el);
    this.startSize_ = goog.style.getSize(el);
}



/**
 * @param {Event} e
 * @private
 */
moka.ui.Resizable.prototype.onResizeStart_ = function(e) {
    this.dispatchEvent({
	type: moka.ui.Resizable.EventType.START_RESIZE
    });
};



/**
 * @param {Event} e
 * @private
 */
moka.ui.Resizable.prototype.onResize_ = function(e) {
    this.dispatchEvent({
	type: moka.ui.Resizable.EventType.RESIZE
    });
};



/**
 * @param {Event} e
 * @private
 */
moka.ui.Resizable.prototype.onResizeEnd_ = function(e) {
    //
    // IMPORTANT: Update only on resize end!!!!!
    //
    this.update();

    // Dispatch event
    this.dispatchEvent({
	type: moka.ui.Resizable.EventType.END_RESIZE
    });
};



/**
 * @private
 */
moka.ui.Resizable.prototype.resize_ = function() {
    var newSize = 
	new goog.math.Size(Math.max(this.eltSize_.width, 0), 
			   Math.max(this.eltSize_.height, 0));
    var newPos = 
	new goog.math.Coordinate(Math.max(this.eltPos_.x, 0), 
				 Math.max(this.eltPos_.y, 0));

    if (this.continuousResize_) {
	this.dispatchEvent({
	    type: moka.ui.Resizable.EventType.RESIZE,
	    size: newSize.clone(),
	    pos: newPos.clone()
	});
    }

    window.console.log(newSize);
    goog.style.setBorderBoxSize(this.element_, newSize);
    goog.style.setPosition(this.element_, newPos);
};




/** 
 * @inheritDoc 
 */
moka.ui.Resizable.prototype.disposeInternal = function() {
    moka.ui.Resizable.superClass_.disposeInternal.call(this);

    // draggers
    goog.object.forEach(this.ResizeDraggers_, function(d, pos){
	goog.events.removeAll(d);
	d.dispose();
    })
    delete this.ResizeDraggers_;


    // Boundary element
    if (this.boundaryElt_) {
	goog.dom.removeNode(this.boundaryElt_.parentNode, this.containment);
	delete this.boundaryElt_;
    }
};




