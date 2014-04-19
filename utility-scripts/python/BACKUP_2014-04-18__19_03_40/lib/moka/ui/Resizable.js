/**
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
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
goog.require('moka.ui.ResizeDraggerTop');
goog.require('moka.ui.ResizeDraggerBottom');
goog.require('moka.ui.ResizeDraggerLeft');
goog.require('moka.ui.ResizeDraggerTopRight');
//goog.require('moka.ui.ResizeDraggerBottomRight');
//goog.require('moka.ui.ResizeDraggerTopLeft');
//goog.require('moka.ui.ResizeDraggerBottomLeft');
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
    RESIZE_START: 'resize_start',
    RESIZE_END: 'resize_end'
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
moka.ui.Resizable.DEFAULT_DIRECTIONS = ['RIGHT', 'BOTTOM'];



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
 * @type {goog.math.Rect}
 * @private
 */
moka.ui.Resizable.prototype.limits_ = moka.ui.Resizable.DEFAULT_LIMITS;


/**
 * @type {number}
 * @private
 */
moka.ui.Resizable.prototype.minWidth_ = moka.ui.Resizable.DEFAULT_MIN_WIDTH, 


/**
 * @type {number}
 * @private
 */
moka.ui.Resizable.prototype.minHeight_ = moka.ui.Resizable.DEFAULT_MIN_HEIGHT;




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
 * @param {!string} dir
 * @return {!Element}
 * @public
 */
moka.ui.Resizable.prototype.getHandle = function(dir) {
    return this.ResizeDraggers_[dir].getHandle();
};



/**
 * @param {!string} dir
 * @return {!moka.ui.ResizeDragger}
 * @public
 */
moka.ui.Resizable.prototype.getResizeDragger = function(dir) {
    return this.ResizeDraggers_[dir];
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
 * @return {!goog.math.Rect} 
 * @public
 */
moka.ui.Resizable.prototype.getBoundaryElement = function() {
    return this.boundaryElt_;
};




/**
 * @param {!Element} elt The boundary Element.
 * @public
 */
moka.ui.Resizable.prototype.setBoundaryElement = function(elt) {
    this.boundaryElt_ = elt;
    if (this.boundaryElt_.parentNode !== this.element_.parentNode){
	throw new Error('Boundary element parentNode must be same as ' + 
			'resizable  element\'s parentNode.');
    }
    this.update();
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
    // Clear
    //
    this.disposeDraggers_();

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
 * @param {!string} limitType The limit type ('MAX' or 'MIN').
 * @param {Function=} opt_callback The optional callback on completion.
 * @param {number=} opt_dur The optional duration.  Defaults to 
 *     moka.ui.Resizable.ANIM_MED.
 * @private
 */
moka.ui.Resizable.prototype.slideToLimits = 
function(draggerDir, limitType, opt_callback, opt_dur) {
    draggerDir = draggerDir.toUpperCase();
    this.checkDirectionValid(draggerDir);
   
    // Update
    this.update();

    // Slide dragger
    this.ResizeDraggers_[draggerDir].slideToLimits(limitType, opt_callback, 
						   opt_dur);
};

  


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
    case 'TOP_RIGHT':
	return new moka.ui.ResizeDraggerTopRight(element);
	break;
    case 'TOP_LEFT':
	window.console.log('ToDo: need to implement resize ' + 
			   'dragger for top left.')
	break;
    case 'BOTTOM_LEFT':
	window.console.log('ToDo: need to implement resize ' + 
			   'dragger for bottom left.')
	break;
    case 'BOTTOM_RIGHT':
	window.console.log('ToDo: need to implement resize ' + 
			   'dragger for bottom right.')
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
    
    if (!goog.isDefAndNotNull(this.boundaryElt_)) { return };

    //
    // Define the update dims
    //
    var minSize = new goog.math.Size(this.minWidth_, this.minHeight_);
    //window.console.log('UPDATE', this.boundaryElt_);
    //
    // Loop draggers
    //
    goog.object.forEach(this.ResizeDraggers_, function(Dragger, dir){
	//
	// Ensure that draggerHandles are attached to the boundaryElt's parent.
	//
	if (this.boundaryElt_ && this.boundaryElt_.parentNode) {
	    goog.dom.append(this.boundaryElt_.parentNode, Dragger.getHandle());
	}

	//
	// Store the reference to the boundary element in the dragger
	//
	if (Dragger.getBoundaryElement() !== this.boundaryElt_){
	    Dragger.setBoundaryElement(this.boundaryElt_);
	}
	
	//
	// Set the minimum sizes
	//
	Dragger.setMinSize(minSize);

	//
	// Call dragger update
	//
	Dragger.updateTrackingValues();
	Dragger.update();
    }.bind(this))
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
	type: moka.ui.Resizable.EventType.RESIZE_START
    });
};



/**
 * @param {Event} e
 * @private
 */
moka.ui.Resizable.prototype.onResize_ = function(e) {
    this.dispatchEvent({
	type: moka.ui.Resizable.EventType.RESIZE,
	resizeePosition: e.resizeePos,
	resizeeSize: e.resizeeSize,
	boundaryPosition: e.boundaryPos,
	boundarySize: e.boundarySize,
    });
};



/**
 * @param {Event} e
 * @private
 */
moka.ui.Resizable.prototype.onResizeEnd_ = function(e) {
    //window.console.log("ON RESIZE END!");
    //
    // IMPORTANT: Update only on resize end!!!!!
    //
    this.update();

    // Dispatch event
    this.dispatchEvent({
	type: moka.ui.Resizable.EventType.RESIZE_END
    });
};




/** 
 * @private
 */
moka.ui.Resizable.prototype.disposeDraggers_ = function() {
    // draggers
    goog.object.forEach(this.ResizeDraggers_, function(d, pos){
	if (d) {
	    goog.events.removeAll(d);
	    d.disposeInternal();
	}
    })
    goog.object.clear(this.ResizeDraggers_);
}


/** 
 * @inheritDoc 
 */
moka.ui.Resizable.prototype.disposeInternal = function() {
    moka.ui.Resizable.superClass_.disposeInternal.call(this);

    // draggers
    this.disposeDraggers_();
    delete this.ResizeDraggers_;


    // Boundary element
    if (this.boundaryElt_) {
	goog.dom.removeNode(this.boundaryElt_.parentNode, this.containment);
	delete this.boundaryElt_;
    }
};




