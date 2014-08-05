/**
 * @author kumar.sunil.p@gmail.com (Sunil Kumar)
 */
goog.provide('nrg.ui.Resizable');

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
goog.require('goog.math');
goog.require('goog.math.Rect');
goog.require('goog.events');

// nrg
goog.require('nrg.ui.Component');
goog.require('nrg.ui.ResizeDragger');
goog.require('nrg.ui.ResizeDraggerRight');
goog.require('nrg.ui.ResizeDraggerTop');
goog.require('nrg.ui.ResizeDraggerBottom');
goog.require('nrg.ui.ResizeDraggerLeft');
goog.require('nrg.ui.ResizeDraggerTopRight');
goog.require('nrg.style');
//goog.require('nrg.ui.ResizeDraggerBottomRight');
//goog.require('nrg.ui.ResizeDraggerTopLeft');
//goog.require('nrg.ui.ResizeDraggerBottomLeft');





/**
 * Allows an element to be resizable within a given bounds.
 * This is an adaptation from the following source:
 * http://dev.ariel-networks.com/Members/uchida/stuff/goog-ui-resizable.zip/
 * 
 * @param {!Element} element The element that will be resizable.
 * @param {!Array.string | !string} opt_dirs The optional directions. See
 *    property keys of 'nrg.ui.Resizable.Directions'. Defaults to 
 *    property 'nrg.ui.Resizable.defaultDirections'. 'ALL' or 'DEFAULT' 
 *    are also valid.
 * @extends {nrg.ui.Component}
 * @constructor
 */
nrg.ui.Resizable = function(element, opt_dirs) {
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
     * @type {!goog.math.Rect}
     * @private
     */
    this.limits_ = nrg.ui.Resizable.DEFAULT_LIMITS;


    /**
     * @type {!number}
     * @private
     */
    this.minWidth_ = nrg.ui.Resizable.DEFAULT_MIN_WIDTH; 


    /**
     * @type {!number}
     * @private
     */
    this.minHeight_ = nrg.ui.Resizable.DEFAULT_MIN_HEIGHT;



    this.setResizeDirections(opt_dirs || nrg.ui.Resizable.defaultDirections);
};
goog.inherits(nrg.ui.Resizable, nrg.ui.Component);
goog.exportSymbol('nrg.ui.Resizable', nrg.ui.Resizable);



/**
 * @enum {string}
 * @public
 */
nrg.ui.Resizable.EventType = {
    RESIZE: 'resize',
    RESIZE_START: 'resize_start',
    RESIZE_END: 'resize_end'
};



/**
 * @type {!string} 
 * @const
 */
nrg.ui.Resizable.ID_PREFIX =  'nrg.ui.Resizable';



/**
 * @enum {string} 
 * @expose
 * @const
 */ 
nrg.ui.Resizable.CSS_SUFFIX = {
    BOUNDARY: 'boundary', 
}


 
/**
 * @dict
 * @public
 */
nrg.ui.Resizable.DIRECTIONS = [
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
nrg.ui.Resizable.DEFAULT_DIRECTIONS = ['RIGHT', 'BOTTOM'];



/**
 * @const
 * @type {!goog.math.rect}
 */
nrg.ui.Resizable.DEFAULT_LIMITS = new goog.math.Rect(0, 0, 600, 600);


/**
 * @type {!number} 
 * @const
 */
nrg.ui.Resizable.DEFAULT_MIN_HEIGHT = 20;



/**
 * @type {!number} 
 * @const
 */
nrg.ui.Resizable.DEFAULT_MIN_WIDTH = 20;



/**
 * @type {Object.<string, number>}
 * @const
 */
nrg.ui.Resizable.boundThresholds_ = {
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
nrg.ui.Resizable.prototype.setBoundThreshold = function(dir, thresh){
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
nrg.ui.Resizable.prototype.startPos_;



/**
 * @type {goog.math.Size}
 * @private
 */
nrg.ui.Resizable.prototype.startSize_;



/**
 * @type {Element}
 * @private
 */
nrg.ui.Resizable.prototype.boundaryElt_;








/**
 * @enum {number}
 * @private
 */
nrg.ui.Resizable.prototype.atLimits_ = {
    TOP: 0,
    LEFT: 0,
    RIGHT: 0,
    BOTTOM: 0
};



/**
 * @enum {number}
 * @private
 */
nrg.ui.Resizable.prototype.atMins_ = {
    WIDTH: 0,
    HEIGHT: 0,
};



/**
 * @type {goog.fx.dom.Slide}
 * @private
 */
nrg.ui.Resizable.prototype.slideAnim_;



/**
 * @return {string} The dragger's direction.
 * @private
 */
nrg.ui.Resizable.prototype.getResizeDraggerDirection_ = function(dragger) {
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
nrg.ui.Resizable.prototype.getHandle = function(dir) {
    return this.ResizeDraggers_[dir].getHandle();
};



/**
 * @param {!string} dir
 * @return {!nrg.ui.ResizeDragger}
 * @public
 */
nrg.ui.Resizable.prototype.getResizeDragger = function(dir) {
    return this.ResizeDraggers_[dir];
};



/**
 * @return {!Array.<Element>}
 * @public
 */
nrg.ui.Resizable.prototype.getHandles = function() {
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
nrg.ui.Resizable.prototype.getBoundaryElement = function() {
    return this.boundaryElt_;
};




/**
 * @param {!Element} elt The boundary Element.
 * @public
 */
nrg.ui.Resizable.prototype.setBoundaryElement = function(elt) {
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
nrg.ui.Resizable.prototype.setMinHeight = function(minH) {
    this.minHeight_ = minH
};



/**
 * Sets the minimum width of the Resizable element.
 *
 * @param {!number} minW
 * @public
 */
nrg.ui.Resizable.prototype.setMinWidth = function(minW) {
    this.minWidth_ = minW
};



/**
 * @return {!number}
 * @public
 */
nrg.ui.Resizable.prototype.getMinHeight = function() {
    return this.minHeight_;
};



/**
 * @return {!number}
 * @public
 */
nrg.ui.Resizable.prototype.getMinWidth = function() {
    return this.minWidth_;
};



/**
 * Allows the user to set the resize directions specified in 
 * nrg.ui.Resizable.Directions.
 * 
 * @param {!Array.<string> | !string} opt_dirs The directions.  Defaults to 
 *    'DEFAULT', which is Bottom, 
 * @public
 */
nrg.ui.Resizable.prototype.setResizeDirections = function(opt_dirs){

    opt_dirs = opt_dirs || 'DEFAULT';

    if (goog.isString(opt_dirs)){
	if (opt_dirs.toUpperCase() == 'ALL'){
	    opt_dirs = nrg.ui.Resizable.DIRECTIONS;
	} else if (opt_dirs.toUpperCase() == 'DEFAULT') {
	    opt_dirs = nrg.ui.Resizable.DEFAULT_DIRECTIONS;
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
	if (!goog.array.contains(nrg.ui.Resizable.DIRECTIONS, dir)) {
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
nrg.ui.Resizable.prototype.checkDirectionValid = function(draggerDir){
    if (!goog.array.contains(nrg.ui.Resizable.DIRECTIONS, draggerDir)){
	throw new Error ('Invalid draggerDir \'' + draggerDir);
    }
}


/**
 * @param {!string} draggerDir The dragger direction.
 * @throws {Error} If dragger exists for the given direction.
 * @public
 */
nrg.ui.Resizable.prototype.hasDragger = function(draggerDir){
    this.checkDirectionValid(draggerDir);
    if (!this.ResizeDraggers_[draggerDir]){
	throw new Error ('No ResizeDragger for ' + draggerDir);
    }
}



/**
 * Allows the user to slide a dragger to a specific position.
 *
 * @param {!string} draggerDir The dragger to slide. See 
 *      nrg.ui.Resizable.Directions for values.
 * @param {!string} limitType The limit type ('MAX' or 'MIN').
 * @param {Function=} opt_callback The optional callback on completion.
 * @param {number=} opt_dur The optional duration.  Defaults to 
 *     nrg.ui.Resizable.ANIM_MED.
 * @private
 */
nrg.ui.Resizable.prototype.slideToLimits = 
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
nrg.ui.Resizable.createResizeDragger = function(dir, element) {
    switch(dir){
    case 'TOP':
	return new nrg.ui.ResizeDraggerTop(element);
	break;
    case 'BOTTOM':
	return new nrg.ui.ResizeDraggerBottom(element);
	break;
    case 'LEFT':
	return new nrg.ui.ResizeDraggerLeft(element);
	break;
    case 'RIGHT':
	return new nrg.ui.ResizeDraggerRight(element);
	break;
    case 'TOP_RIGHT':
	return new nrg.ui.ResizeDraggerTopRight(element);
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
nrg.ui.Resizable.prototype.addResizeDirection = function(dir) {
    // Check if direction is in use.
    if (goog.object.containsKey(this.ResizeDraggers_, dir)){
	throw new Error ('Resize direction ' + dir + ' already in use.')
    }
    
    // Create and store the appropriate dragger
    this.ResizeDraggers_[dir] = 
	nrg.ui.Resizable.createResizeDragger(dir, this.element_);

    goog.events.listen(this.ResizeDraggers_[dir], 
		       nrg.ui.ResizeDragger.EventType.RESIZE_START, 
		       this.onResizeStart_.bind(this))
    goog.events.listen(this.ResizeDraggers_[dir], 
		       nrg.ui.ResizeDragger.EventType.RESIZE, 
		       this.onResize_.bind(this))
    goog.events.listen(this.ResizeDraggers_[dir], 
		       nrg.ui.ResizeDragger.EventType.RESIZE_END, 
		       this.onResizeEnd_.bind(this))

    // Update
    this.update();
};




/**
 * @public
 */
nrg.ui.Resizable.prototype.update  = function() {
    
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
nrg.ui.Resizable.prototype.getDragParams_ = function(e){
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
nrg.ui.Resizable.prototype.onResizeStart_ = function(e) {
    this.dispatchEvent({
	type: nrg.ui.Resizable.EventType.RESIZE_START
    });
};



/**
 * @param {Event} e
 * @private
 */
nrg.ui.Resizable.prototype.onResize_ = function(e) {
    this.dispatchEvent({
	type: nrg.ui.Resizable.EventType.RESIZE,
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
nrg.ui.Resizable.prototype.onResizeEnd_ = function(e) {
    //window.console.log("ON RESIZE END!");
    //
    // IMPORTANT: Update only on resize end!!!!!
    //
    this.update();

    // Dispatch event
    this.dispatchEvent({
	type: nrg.ui.Resizable.EventType.RESIZE_END
    });
};




/** 
 * @private
 */
nrg.ui.Resizable.prototype.disposeDraggers_ = function() {
    // draggers
    goog.object.forEach(this.ResizeDraggers_, function(d, pos){
	if (d) {
	    goog.events.removeAll(d);
	    d.dispose();
	}
    })
    goog.object.clear(this.ResizeDraggers_);
}


/** 
 * @inheritDoc 
 */
nrg.ui.Resizable.prototype.disposeInternal = function() {
    nrg.ui.Resizable.superClass_.disposeInternal.call(this);

    // draggers
    this.disposeDraggers_();
    delete this.ResizeDraggers_;


    // Boundary element
    if (this.boundaryElt_) {
	goog.dom.removeNode(this.boundaryElt_.parentNode, this.containment);
	delete this.boundaryElt_;
    }
};



goog.exportSymbol('nrg.ui.Resizable.EventType', nrg.ui.Resizable.EventType);
goog.exportSymbol('nrg.ui.Resizable.ID_PREFIX', nrg.ui.Resizable.ID_PREFIX);
goog.exportSymbol('nrg.ui.Resizable.CSS_SUFFIX', nrg.ui.Resizable.CSS_SUFFIX);
goog.exportSymbol('nrg.ui.Resizable.DIRECTIONS', nrg.ui.Resizable.DIRECTIONS);
goog.exportSymbol('nrg.ui.Resizable.DEFAULT_DIRECTIONS',
	nrg.ui.Resizable.DEFAULT_DIRECTIONS);
goog.exportSymbol('nrg.ui.Resizable.DEFAULT_LIMITS',
	nrg.ui.Resizable.DEFAULT_LIMITS);
goog.exportSymbol('nrg.ui.Resizable.DEFAULT_MIN_HEIGHT',
	nrg.ui.Resizable.DEFAULT_MIN_HEIGHT);
goog.exportSymbol('nrg.ui.Resizable.DEFAULT_MIN_WIDTH',
	nrg.ui.Resizable.DEFAULT_MIN_WIDTH);
goog.exportSymbol('nrg.ui.Resizable.createResizeDragger',
	nrg.ui.Resizable.createResizeDragger);
goog.exportSymbol('nrg.ui.Resizable.prototype.setBoundThreshold',
	nrg.ui.Resizable.prototype.setBoundThreshold);
goog.exportSymbol('nrg.ui.Resizable.prototype.getHandle',
	nrg.ui.Resizable.prototype.getHandle);
goog.exportSymbol('nrg.ui.Resizable.prototype.getResizeDragger',
	nrg.ui.Resizable.prototype.getResizeDragger);
goog.exportSymbol('nrg.ui.Resizable.prototype.getHandles',
	nrg.ui.Resizable.prototype.getHandles);
goog.exportSymbol('nrg.ui.Resizable.prototype.getBoundaryElement',
	nrg.ui.Resizable.prototype.getBoundaryElement);
goog.exportSymbol('nrg.ui.Resizable.prototype.setBoundaryElement',
	nrg.ui.Resizable.prototype.setBoundaryElement);
goog.exportSymbol('nrg.ui.Resizable.prototype.setMinHeight',
	nrg.ui.Resizable.prototype.setMinHeight);
goog.exportSymbol('nrg.ui.Resizable.prototype.setMinWidth',
	nrg.ui.Resizable.prototype.setMinWidth);
goog.exportSymbol('nrg.ui.Resizable.prototype.getMinHeight',
	nrg.ui.Resizable.prototype.getMinHeight);
goog.exportSymbol('nrg.ui.Resizable.prototype.getMinWidth',
	nrg.ui.Resizable.prototype.getMinWidth);
goog.exportSymbol('nrg.ui.Resizable.prototype.setResizeDirections',
	nrg.ui.Resizable.prototype.setResizeDirections);
goog.exportSymbol('nrg.ui.Resizable.prototype.checkDirectionValid',
	nrg.ui.Resizable.prototype.checkDirectionValid);
goog.exportSymbol('nrg.ui.Resizable.prototype.hasDragger',
	nrg.ui.Resizable.prototype.hasDragger);
goog.exportSymbol('nrg.ui.Resizable.prototype.slideToLimits',
	nrg.ui.Resizable.prototype.slideToLimits);
goog.exportSymbol('nrg.ui.Resizable.prototype.addResizeDirection',
	nrg.ui.Resizable.prototype.addResizeDirection);
goog.exportSymbol('nrg.ui.Resizable.prototype.update',
	nrg.ui.Resizable.prototype.update);
goog.exportSymbol('nrg.ui.Resizable.prototype.disposeInternal',
	nrg.ui.Resizable.prototype.disposeInternal);
