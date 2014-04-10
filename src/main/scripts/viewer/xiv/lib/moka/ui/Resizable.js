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
    this.draggers_ = {};


    /**
     * @type {!Object.<string, Element>}
     * @private
     */
    this.dragElts_ = {};


    /**
     * @type {goog.fx.Dragger}
     * @private
     */
    this.currDragger_;


    /**
     * @type {number | string}
     * @private
     */
    this.currDragDirection_;
 

    /**
     * @type {goog.math.Size}
     * @private
     */
    this.currDragEltSize_;


    /**
     * @type {goog.math.Coordinate}
     * @private
     */
    this.currDragEltPos_;


    /**
     * @type {goog.math.Size}
     * @private
     */
    this.eltSize_;


    /**
     * @type {goog.math.Coordinate}
     * @private
     */
    this.eltPos_;



    this.manageGhostElement_();
    this.initBounds_();
    this.initSize_();
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
moka.ui.Resizable.Directions = {
    'TOP': 1,
    'RIGHT': 2,
    'BOTTOM': 4,
    'LEFT': 8,
    'TOP_LEFT': 16,
    'TOP_RIGHT': 32,
    'BOTTOM_RIGHT': 64,
    'BOTTOM_LEFT': 128,
};



/**
 * @const
 * @public
 */
moka.ui.Resizable.defaultDirections = ['RIGHT', 'BOTTOM', 'BOTTOM_RIGHT'];



/**
 * @type {!number} 
 * @const
 */
moka.ui.Resizable.DEFAULT_NW_X = 0;



/**
 * @type {!number} 
 * @const
 */
moka.ui.Resizable.DEFAULT_NW_Y = 0;



/**
 * @type {!number} 
 * @const
 */
moka.ui.Resizable.DEFAULT_SE_X = 200;



/**
 * @type {!number} 
 * @const
 */
moka.ui.Resizable.DEFAULT_SE_Y = 200;



/**
 * @type {!number} 
 * @const
 */
moka.ui.Resizable.DEFAULT_MIN_WIDTH = 20;



/**
 * @type {!number} 
 * @const
 */
moka.ui.Resizable.DEFAULT_MIN_HEIGHT = 20;



/**
 * @type {!number} 
 * @const
 */
moka.ui.Resizable.ANIM_MED = 500;



/**
 * @type {!number} 
 * @const
 */
moka.ui.Resizable.BOUND_THRESHOLD = 4;



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
 * @type {goog.math.Coordinate}
 * @private
 */
moka.ui.Resizable.prototype.topLeftLimit_;



/**
 * @type {goog.math.Coordinate}
 * @private
 */
moka.ui.Resizable.prototype.bottomRightLimit_;



/**
 * @type {number}
 * @private
 */
moka.ui.Resizable.prototype.minHeight_ = 500;



/**
 * @type {number}
 * @private
 */
moka.ui.Resizable.prototype.minWidth_ = 500;



/**
 * For running events continuously during the resize.
 *
 * @type {!boolean}
 * @private
 */
moka.ui.Resizable.prototype.continuousResize_ = true;



/**
 * For showing the boundary of the resizeable.
 *
 * @type {Element}
 * @private
 */
moka.ui.Resizable.prototype.boundaryElt_;



/**
 * @enum {number}
 * @private
 */
moka.ui.Resizable.prototype.atBounds_ = {
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
 * Returns the draggers.
 *
 * @return {!Object.<string, goog.fx.Draggers>}
 * @public
 */
moka.ui.Resizable.prototype.getDraggers = function() {
    return this.draggers_;
};



/**
 * Returns the specified dragger.
 *
 * @param {!string} dragDir
 * @return {!goog.fx.Dragger}
 * @public
 */
moka.ui.Resizable.prototype.getDragger = function(dragDir) {
    return this.draggers_[moka.ui.Resizable.Directions[dragDir]];
};



/**
 * Returns the drag elements.
 *
 * @return {!Object.<string, Element>}
 * @public
 */
moka.ui.Resizable.prototype.getDragElts = function() {
    return this.dragElts_;
};



/**
 * Returns the drag element.
 *
 * @param {!string} dragDir The dragger direction.
 * @return {!Element}
 * @public
 */
moka.ui.Resizable.prototype.getDragElt = function(dragDir) {
    this.checkDraggerDirValid_(dragDir);
    return this.dragElts_[moka.ui.Resizable.Directions[dragDir]];
};



/**
 * Returns whether the option to call the RESIZE event continuously is enabled.
 *
 * @return {!boolean}
 * @public
 */
moka.ui.Resizable.prototype.getContinuousResize = function() {
    return this.continuousResize_;
};



/**
 * Option to call the RESIZE event continuously -- default is true.
 *
 * @param {!boolean} continuous 
 * @public
 */
moka.ui.Resizable.prototype.setContinuousResize = function(continuous) {
    this.continuousResize_ = continuous;
    this.manageGhostElement_();
};



/**
 * @deprecated
 * @return {!Element} The ghost element.
 * @public
 */
moka.ui.Resizable.prototype.getGhostElement = function() {
    return this.ghostEl_;
};



/**
 * Returns the limts as {x,y} points starting at the top left and rotating 
 * clockwise.
 *
 * @return {!Array.<gooog.math.Coordinate>} The limits. 
 * @public
 */
moka.ui.Resizable.prototype.getBounds = function() {
    return [this.topLeftLimit_, 
	    new goog.math.Coordinate(this.bottomRightLimit_.x, 
				     this.topLeftLimit_.x),
	    this.bottomRightLimit_, 
	    new goog.math.Coordinate(this.topLeftLimit_.x, 
				     this.bottomRightLimit_.y),

	   ];
};



/**
 * Returns the atBounds_ object.
 * 
 * TODO: this needs to be verified on init -- currently it isn't.
 *
 * @throws {Error} If invalid bound argument.
 * @return {!string} bound The bounds. 
 * @public
 */
moka.ui.Resizable.prototype.isAtBounds = function(bound) {
    switch(bound){
    case 'TOP':
	return this.atBounds_.TOP;
    case 'RIGHT':
	return this.atBounds_.RIGHT;
    case 'BOTTOM':
	return this.atBounds_.BOTTOM;
    case 'LEFT':
	return this.atBounds_.LEFT;
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
moka.ui.Resizable.prototype.isNearBounds = function(bound, opt_threshold) {

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
    return this.topLeftLimit_.x
};



/**
 * As stated.
 * @return {!number}
 * @public
 */
moka.ui.Resizable.prototype.getTopLimit = function() {
    return this.topLeftLimit_.y
};



/**
 * As stated.
 * @return {!number}
 * @public
 */
moka.ui.Resizable.prototype.getRightLimit = function() {
    return this.bottomRightLimit_.x
};



/**
 * As stated.
 * @return {!number}
 * @public
 */
moka.ui.Resizable.prototype.getBottomLimit = function() {
    return this.bottomRightLimit_.y
};



/**
 * As stated.
 * @param {!Object} opt_styleObj Additional style attributes to apply.
 * @return {!Object} The limits object.
 * @public
 */
moka.ui.Resizable.prototype.showBoundaryElement = function(opt_styleHelper) {
    if (!this.boundaryElt_){
	this.createBoundaryElt_();
    }
    this.boundaryElt_.style.visibility = 'visible';
    moka.style.setStyle(this.boundaryElt_, opt_styleHelper);
};



/**
 * As stated.
 * @return {!Object} The limits object.
 * @public
 */
moka.ui.Resizable.prototype.hideBoundaryElt = function() {
    this.boundaryElt_.style.visibility = 'hidden';
};



/**
 * Set's the boundary of the resizeable based on the arguments.
 * 
 * @param {!number} x1 Top left x.
 * @param {!number} y1 Top left y.
 * @param {!number} x2 Bottom right x.
 * @param {!number} y2 Bottm right y.
 * @param {boolean=} opt_createContainDiv
 * @throws {Error} If x2 < x1.
 * @throws {Error} If y2 < y1.
 * @public
 */
moka.ui.Resizable.prototype.setBounds = function(x1, y1, x2, y2) {
    if (x2 < x1) {
	throw new Error('Invalid limit. x2 must be >= x1');
    }
    if (y2 < y1) {
	throw new Error('Invalid limit. y2 must be >= y1');
    }
    this.topLeftLimit_ = new goog.math.Coordinate(x1, y1);
    this.bottomRightLimit_ = new goog.math.Coordinate(x2, y2);
}



/**
 * @param {!Element} elt The boundary Element.
 * @public
 */
moka.ui.Resizable.prototype.setBoundaryElement = function(elt) {
    this.boundaryElt_ = elt;
};



/**
 * Creates a boundary element for visual help.  This element is not part of the
 * bounary defintion, but rather based on it.
 *
 * @private
 */
moka.ui.Resizable.prototype.createBoundaryElt_ = function(){
   
    if (!this.getElement().parentNode){ 
	window.console.log("Warning: moka.ui.Resizable - Need a parent" + 
			   "before defining boundaryElt!");
    }
    if (!this.boundaryElt_){
	this.boundaryElt_ = goog.dom.createDom('div');
	goog.dom.classes.add(this.boundaryElt_, 
			     moka.ui.Resizable.CSS.BOUNDARY);
	goog.dom.append(this.getElement().parentNode, this.boundaryElt_);
    }
    moka.style.setStyle(this.boundaryElt_, {
	'left': this.topLeftLimit_.x,
	'top': this.topLeftLimit_.y,
	'height': this.bottomRightLimit_.y - this.topLeftLimit_.y,
	'width': this.bottomRightLimit_.x - this.topLeftLimit_.x,
	'visibility': 'hidden'
    })

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
	    opt_dirs = goog.object.getKeys(moka.ui.Resizable.Directions)
	} else if (opt_dirs.toUpperCase() == 'DEFAULT') {
	    opt_dirs = moka.ui.Resizable.defaultDirections;
	} else {
	    opt_dirs =  [opt_dirs];
	}
    }

    // Loop
    goog.array.forEach(opt_dirs, function(dir, i){
	// Make sure each value is a string.
	if (!goog.isString(dir)) { throw new Error('String required!') };
	// Make sure value is a valid direction.
	if (!goog.object.containsKey(moka.ui.Resizable.Directions, dir)) {
	    throw new Error('Invalid direction: ', dir);
	}
	// Add handler.
	this.addResizableHandler_(dir);
    }.bind(this))
}



/**
 * @param {!string} draggerDir The dragger direction.
 * @throws {Error} If dragger is invalid.
 * @throws {Error} If dragger is valid, but there's no object associated with
 *    it.
 * @private
 */
moka.ui.Resizable.prototype.checkDraggerDirValid_ = function(draggerDir){
    if (!moka.ui.Resizable.Directions[draggerDir]){
	throw new Error ('Invalid draggerDir!');
    }
    if (!this.dragElts_[moka.ui.Resizable.Directions[draggerDir]]){
	throw new Error ('No hander for ' + draggerDir + ' .');
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
moka.ui.Resizable.prototype.slideDraggerToBounds = 
function(draggerDir, bounds, opt_callback, opt_dur) {
    //
    // We can't do anything if the element is not in the DOM
    //
    if (!this.getElement().parentNode) { return };

    //
    // Make sure drag bounds are updated.
    //
    this.updateToDragBounds_();

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
	    window.console.log('DRAG START', this.element_.style.width);
	    this.onDragStart_({
		currentTarget: dragger
	    })
    }.bind(this));

    //
    // onAnimate
    //
    goog.events.listen(this.slideAnim_, goog.fx.Animation.EventType.ANIMATE, 
	function(e) {
	    window.console.log('DRAGGING', this.element_.style.width);
	    this.onDrag_({
		currentTarget: dragger
	    })
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
 * @param {!string} draggerDir The dragger to slide. See 
 *      moka.ui.Resizable.Directions for values.
 * @param {!string} bounds The boundary to slide to.
 * @return {goog.math.Coordinate} The bound coordinates.
 * @private
 */
moka.ui.Resizable.prototype.getBoundCoords_ = function(draggerDir, bounds) {
    //
    // Params
    //
    var dragElt = this.getDragElt(draggerDir);
    var draggerSize = goog.style.getSize(dragElt);
    var draggerPos = goog.style.getPosition(dragElt);

    //
    // Construct the end coordinates
    //
    switch(draggerDir){
    case 'RIGHT':
	if (bounds == 'RIGHT'){

	    window.console.log("COORD", this.getRightLimit() ,
			       draggerSize.width);

	    return new goog.math.Coordinate(
		this.getRightLimit() - draggerSize.width, draggerPos.y);

	} else if (bounds == 'LEFT'){
	    return new goog.math.Coordinate(this.minWidth_, draggerPos.y);	
	}
	break;

    case 'LEFT':
	break;

    case 'TOP':
	if (bounds == 'TOP'){
	    return new goog.math.Coordinate(draggerPos.x, this.getTopLimit());
	} else if (bounds == 'BOTTOM'){
	    return new goog.math.Coordinate(
		draggerPos.x, this.getBottomLimit() - draggerSize.height);	
	}
	break;

    case 'BOTTOM':
	break;
    }
}



/**
 * Initializes the limits.
 * @private
 */
moka.ui.Resizable.prototype.initBounds_ = function(){
    var x1 = /**@type {!number}*/ 0;
    var x2 = /**@type {!number}*/ 0; 
    var y1 = /**@type {!number}*/ 0;
    var y2 = /**@type {!number}*/ 0;

    if (this.getElement().parentNode) {
	var size = /**@type {!goog.math.Size}*/ 
	goog.style.getSize(this.getElement().parentNode);
	var pos = /**@type {!goog.math.Coordinate}*/ 
	goog.style.getPosition(this.getElement().parentNode);
	x1 = pos.x;
	y1 = pos.y;
	x2 = x1 + size.width;
	y2 = y2 + size.height;

    } else {
	x1 = moka.ui.Resizable.DEFAULT_NW_X;
	y1 = moka.ui.Resizable.DEFAULT_NW_Y;
	x2 = moka.ui.Resizable.DEFAULT_SE_X;
	y2 = moka.ui.Resizable.DEFAULT_SE_Y;	
    }

    this.topLeftLimit_ = new goog.math.Coordinate(x1, y1);
    this.bottomRightLimit_ = new goog.math.Coordinate(x2, y2);
}



/**
 * Initializes the min size properties.
 * @private
 */
moka.ui.Resizable.prototype.initSize_ = function(){
    this.minWidth_ = moka.ui.Resizable.DEFAULT_MIN_WIDTH, 
    this.minHieght_ = moka.ui.Resizable.DEFAULT_MIN_HEIGHT;
}


/**
 * @param {!string} dir The resize handler direction.
 * @private
 */
moka.ui.Resizable.prototype.addResizableHandler_ = function(dir) {
    var dom = /**@type {!goog.dom.DomHelper}*/ this.getDomHelper();
    var handle = /**@type {!Element}*/ dom.createDom('div');
    var dirNum = /**@type {!number}*/ moka.ui.Resizable.Directions[dir];

    //
    // Add classes.
    //
    goog.dom.classes.add(handle, moka.ui.Resizable.ELEMENT_CLASS, 
		goog.getCssName(moka.ui.Resizable.CSS_CLASS_PREFIX, 
				dir.toLowerCase()).replace(/\.|_/g,'-'));

    //
    // Add handle to element
    //
    this.element_.appendChild(handle);

    //
    // Create and Add to properties.
    //
    this.draggers_[dirNum] = this.createDragger_(handle);
    this.dragElts_[dirNum] = handle;
};



/**
 * @param {!Element} handle
 * @return {!goog.fx.Dragger} The created dragger.
 * @private
 */
moka.ui.Resizable.prototype.createDragger_ = function(handle) {
    var dragger = /**@type {!goog.fx.Dragger}*/ new goog.fx.Dragger(handle);
    dragger.defaultAction = function() {};
    this.setDraggerEvents_(dragger);
    return dragger;
};



/**
 * @param {!goog.fx.Dragger} dragger
 * @private
 */
moka.ui.Resizable.prototype.setDraggerEvents_ = function(dragger) {
    // Event listeners.
    this.getHandler().
	listen(dragger, goog.fx.Dragger.EventType.START, 
	       this.onDragStart_).
	listen(dragger, goog.fx.Dragger.EventType.DRAG,
               this.onDrag_).
	listen(dragger, goog.fx.Dragger.EventType.END,
               this.onDragEnd_);

};



/**
 * @param {Event} e
 * @private
 */
moka.ui.Resizable.prototype.updateToDragBounds_  = function() {

    var left = (this.boundaryElt_.style.left.length != 0) ? 
	this.boundaryElt_.style.left : 
	parseInt(goog.style.getComputedStyle(this.boundaryElt_, 'left'));

    var top = (this.boundaryElt_.style.top.length != 0) ? 
	this.boundaryElt_.style.top : 
	parseInt(goog.style.getComputedStyle(this.boundaryElt_, 'top'));

    var width = (this.boundaryElt_.style.width.length != 0) ? 
	this.boundaryElt_.style.width : 
	parseInt(goog.style.getComputedStyle(this.boundaryElt_, 'width'));

    var height = (this.boundaryElt_.style.height.length != 0) ? 
	this.boundaryElt_.style.height : 
	parseInt(goog.style.getComputedStyle(this.boundaryElt_, 'height'));

    this.setBounds(left, top, left + width, top + height);
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
moka.ui.Resizable.prototype.onDragStart_ = function(e) {
    //
    // Show the ghost element if not continuously resizing
    //
    if (!this.continuousResize_) {
	goog.style.setBorderBoxSize(this.ghostEl_, 
				    goog.style.getBorderBoxSize(this.element_));
	goog.style.showElement(this.ghostEl_, true);
    }

    //
    // Update to bounds
    //
    this.updateToDragBounds_();

    //
    // Get drag parameters
    //
    this.getDragParams_(e);
    var targetPos = goog.style.getPosition(e.currentTarget.target);

    //
    // Get sizes
    //
    this.handlerOffsetSize_ = 
	new goog.math.Size(this.eltSize_.width - targetPos.x, 
			   this.eltSize_.height - targetPos.y);

    //
    // Dispatch event
    //
    this.dispatchEvent({
	type: moka.ui.Resizable.EventType.START_RESIZE
    });
};



/**
 * @param {Event} e
 * @private
 */
moka.ui.Resizable.prototype.onDrag_ = function(e) {
    //
    // Get drag parameters
    //
    this.getDragParams_(e);

    //
    // Directional-specific methods
    //
    switch (parseInt(this.currDragDirection_)) 
    {
    case 1: // TOP
	this.onDrag_top_();
	break;
    case 2: // RIGHT
	this.onDrag_right_();
	break;
    case 4: // BOTTOM
	this.onDrag_bottom_();
	break;
    case 8: // LEFT
	this.onDrag_left_();
	break;
    case 16: // TOP_LEFT
	this.onDrag_top_();
	this.onDrag_left_();
	break;
    case 32: // TOP_RIGHT
	this.onDrag_top_();
	this.onDrag_right_();
	break;
    case 64: // BOTTOM_RIGHT
	this.onDrag_bottom_();
	this.onDrag_right_();
	break;
    case 128: // BOTTOM_LEFT
	this.onDrag_bottom_();
	this.onDrag_left_();
	break;
    }

    //
    // Now size the containers.
    //
    this.resize_();

    return false;
};



/**
 * @param {Event} e
 * @private
 */
moka.ui.Resizable.prototype.onDragEnd_ = function(e) {
    if (!this.continuousResize_) {
	this.resize_(this.element_, 
		     goog.style.getBorderBoxSize(this.ghostEl_), true);
	goog.style.showElement(this.ghostEl_, false);
    }
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
 * @private
 */
moka.ui.Resizable.prototype.getDraggerDirection_ = function(dragger) {
    for (var direction in this.draggers_) {
	if (this.draggers_[direction] === dragger) {
	    return direction;
	}
    }
    return null;
};



/**
 * @private
 */
moka.ui.Resizable.prototype.manageGhostElement_ = function() {
    if (!this.continuousResize_ && !this.ghostEl_) {
	this.ghostEl_ = this.getDomHelper().createDom('div', 
						  'moka-ui-resizable-ghost');
	this.element_.appendChild(this.ghostEl_);
	goog.style.showElement(this.ghostEl_, false);
    } else if (this.continuousResize_ && this.ghostEl_) {
	goog.dom.removeNode(this.ghostEl_);
	this.ghostEl_ = null;
    }
};



/** 
 * @inheritDoc 
 */
moka.ui.Resizable.prototype.disposeInternal = function() {
    moka.ui.Resizable.superClass_.disposeInternal.call(this);

    goog.object.forEach(this.draggers_, function(d, pos){
	goog.events.removeAll(d);
	d.dispose();
    })
    delete this.draggers_;

    goog.object.forEach(this.dragElts_, function(h, pos){
	goog.dom.removeNode(h);
    })
    delete this.dragElts_;

    if (this.ghostEl_) {
	goog.dom.removeNode(this.ghostEl_);
	delete this.ghostEl_;
    }

    if (this.boundaryElt_) {
	goog.dom.removeNode(this.boundaryElt_.parentNode, this.containment);
	delete this.boundaryElt_;
    }


    // NOTE: Events for slideAnim_ destroyed in 'createSlideAnim_'
    if (this.slideAnim_){
	this.slideAnim_.dispose();
	delete this.slideAnim_;
    }


    
    // When Dragging properties...
    delete this.currDragger_;
    delete this.currDragDirection_;
    delete this.currDraggerSize_ ;
    delete this.currDraggerPos_;
    delete this.eltSize_;
    delete this.eltPos_;
    delete this.startPos_;
    delete this.startSize_;


    delete this.topLeftLimit_;
    delete this.bottomRightLimit_;
    delete this.minHeight_;
    delete this.minWidth_;
    delete this.continuousResize_;
    delete this.atBounds_;
    delete this.atMins_;
};






/**
 * @private
 */
moka.ui.Resizable.prototype.onDrag_right_ = function() {
    //
    // For when the user drags
    //
    if (this.currDragger_.deltaX > 0) {
	this.eltSize_.width = this.currDragger_.deltaX + 
	    this.handlerOffsetSize_.width;

    // 
    // For when it's animated
    //
    } else {
	this.eltSize_.width = this.currDragEltPos_.x;
    }
    
    //
    // Clamp
    // 
    var rightBound = this.bottomRightLimit_.x - 
	this.currDragEltSize_.width - this.topLeftLimit_.x;
    this.eltSize_.width = goog.math.clamp(this.eltSize_.width, 
					  this.minWidth_, rightBound);
    this.atBounds_.RIGHT = (this.eltSize_.width == rightBound) ? 1 : 0;
};




/**
 * @private
 */
moka.ui.Resizable.prototype.onDrag_bottom_ = function() {
    this.eltSize_.height = this.currDragger_.deltaY + 
	this.handlerOffsetSize_.height;
    this.eltSize_.height = (this.eltSize_.height <= this.minHeight_) ? 
	this.minHeight_ : this.eltSize_.height;


    //
    // Clamp
    //
    this.eltSize_.height = ((pos.y + 
			     this.eltSize_.height + draggerSize.height) > 
			    this.bottomRightLimit_.y) ?  
	(this.bottomRightLimit_.y - pos.y) : this.eltSize_.height;
    
    this.atBounds_.BOTTOM = ((pos.y + this.eltSize_.height + 
			      draggerSize.height) 
			   >= this.bottomRightLimit_.y) ? 1 : 0;
};






/**
 * @private
 */
moka.ui.Resizable.prototype.onDrag_top_ = function() {

    // Don't move if at minSize and we're pushing downward
    if ((this.currDragger_.deltaY > 0) && this.atMins_.HEIGHT) {
	pos.y = pos.y
	this.eltSize_.height = this.eltSize_.height;
	return;

    // Otherwise, we're good.
    } else {
	pos.y = this.startPos_.y + this.currDragger_.deltaY;
    }	

    // Dont change height if we're at the top bounds.
    if ((this.atBounds_.TOP && (this.currDragger_.deltaY < 0))|| 
	(this.atBounds_.BOTTOM && (this.currDragger_.deltaY < 0))) {
	this.eltSize_.height = this.eltSize_.height;
	return
    }

    // Otherwise, we're good.
    else {
	this.eltSize_.height = 
	    this.startSize_.height + this.startPos_.y - pos.y - 
	    draggerSize.height;
    }

    // Check mins
    this.eltSize_.height = (this.eltSize_.height < this.minHeight_) ? 
	this.minHeight_ : this.eltSize_.height;
    this.atMins_.HEIGHT = (this.eltSize_.height == this.minHeight_) ? 1 : 0

    // This is a final shimmy -- it has to come at the end.
    pos.y = pos.y + draggerSize.height;

    //
    // Clamp
    //
    pos.y = Math.max(pos.y, this.topLeftLimit_.y);
    pos.y = Math.min(pos.y, this.bottomRightLimit_.y - this.eltSize_.height);
    this.atBounds_.TOP = (pos.y <= this.topLeftLimit_.y) ? 1 : 0;
};




/**
 * @private
 */
moka.ui.Resizable.prototype.onDrag_left_ = function() {
    //
    // Don't move if at minSize and we're pushing rightward
    //
    if ((this.currDragger_.deltaX > 0) && this.atMins_.WIDTH) {
	this.eltPos_.x = this.eltPos_.x
	this.eltSize_.width = this.eltSize_.width;
	return;

    //
    // Otherwise we're okay.
    //
    } else {
	this.eltPos_.x = this.startPos_.x + this.currDragger_.deltaX;
    }	


    //
    // Dont change height if we're at the top bounds.
    //
    if (this.atBounds_.LEFT || this.atBounds_.RIGHT) {
	this.eltSize_.width = this.eltSize_.width;
	return;
    }

    //
    // Otherwise we're okay
    //
    else {
	this.eltSize_.width = this.startSize_.width + this.startPos_.x - 
	    this.eltPos_.x;
    }

    //
    // Crop to min
    //
    this.eltSize_.width = (this.eltSize_.width < this.minWidth_) ? 
	this.minWidth_ : this.eltSize_.width;

    //
    // Check if at min
    //
    this.atMins_.WIDTH = (this.eltSize_.width == this.minWidth_) ? 1 : 0

    //
    // Clamp
    //
    this.eltPos_.x = Math.max(this.eltPos_.x, this.topLeftLimit_.x);
    this.eltPos_.x = Math.min(this.eltPos_.x, this.bottomRightLimit_.x);
    this.atBounds_.LEFT = (this.eltPos_.x == this.topLeftLimit_.x) ? 1 : 0;  
};
