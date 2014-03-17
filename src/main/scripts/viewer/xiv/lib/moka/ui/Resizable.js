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
moka.ui.Resizable.defaultDirections = [ 'RIGHT', 'BOTTOM', 'BOTTOM_RIGHT'];



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
moka.ui.Resizable.prototype.minHeight_;



/**
 * @type {number}
 * @private
 */
moka.ui.Resizable.prototype.minWidth_;



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
 * Returns whether the resizeable is at a given bounds.
 *
 * @param {!string} bound The bound to check.
 * @throws {Error} If invalid bound argument.
 * @return {!bound} The bounds. 
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
moka.ui.Resizable.prototype.showBoundaryElt = function(opt_styleHelper) {
    this.createBoundaryElt_();
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
 * @param {!goog.math.Coordinate} newPoint The point to slide to.
 * @param {Function=} opt_callback The optional callback on completion.
 * @param {number=} opt_dur The optional duration.  Defaults to 
 *     moka.ui.Resizable.ANIM_MED.
 * @private
 */
moka.ui.Resizable.prototype.slideDragger = 
function(draggerDir, newPoint, opt_callback, opt_dur) {
    draggerDir = draggerDir.toUpperCase();
    this.checkDraggerDirValid_(draggerDir);
    if (!this.getElement().parentNode) { return };
    this.createSlideAnim_(newPoint, opt_dur);
    this.slideAnim_.play();
};



/**
 * @param {!goog.math.Coordinate} newPoint The point to slide to.
 * @param {Function=} opt_callback The optional callback on completion.
 * @param {number=} opt_dur The optional duration.  Defaults to 
 *     moka.ui.Resizable.ANIM_MED.
 * @private
 */
moka.ui.Resizable.prototype.createSlideAnim_ = 
function(newPoint, opt_callback, opt_dur) {
    var elt =  /**@type {!Element}*/ this.getElement();
    var pos =  /**@type {!goog.math.Coordinate}*/ goog.style.getPosition(elt);
    var size =  /**@type {!goog.math.Size}*/ goog.style.getSize(elt);
    var parentSize = /**@type {!goog.math.Size}*/
    goog.style.getSize(this.getElement().parentNode);

    // The anim
    this.slideAnim_ = new goog.fx.dom.Slide(elt, 
		[pos.x, pos.y], [newPoint.x, newPoint.y], 
		opt_dur || moka.ui.Resizable.ANIM_MED, goog.fx.easing.easeOut);

    // ANIMATE
    goog.events.listen(this.slideAnim_, goog.fx.Animation.EventType.ANIMATE, 
	function(e) {
	    this.resize_(this.getElement(), 
			 new goog.math.Size(size.width, 
			 parentSize.height - parseInt(elt.style.top)),
			 goog.style.getPosition(elt), 
			 true);
    }.bind(this));

    // ANIM END
    goog.events.listen(this.slideAnim_, goog.fx.Animation.EventType.END, 
	function(e) {
	    if (opt_callback) {opt_callback()};
	    this.slideAnim_.disposeInternal();
	    this.slideAnim_.destroy();
	    this.slideAnim_ = null;
    }.bind(this));
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

    // Add classes.
    goog.dom.classes.add(handle, moka.ui.Resizable.ELEMENT_CLASS, 
		goog.getCssName(moka.ui.Resizable.CSS_CLASS_PREFIX, 
				dir.toLowerCase()).replace(/\.|_/g,'-'));

    // Add handle to element
    this.element_.appendChild(handle);

    // Create and Add to properties.
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
moka.ui.Resizable.prototype.onDragStart_ = function(e) {
    if (!this.continuousResize_) {
	goog.style.setBorderBoxSize(this.ghostEl_, 
				    goog.style.getBorderBoxSize(this.element_));
	goog.style.showElement(this.ghostEl_, true);
    }

    var dragger = /**@type {!goog.fx.Dragger}*/ e.currentTarget;
    var direction = /**@type {!string}*/ 
	this.getDraggerDirection_(dragger);
    var targetPos = /**@type {!goog.math.Coordinate}*/
	goog.style.getPosition(dragger.target);
    var el = /**@type {!Element}*/ 
	this.continuousResize_ ? this.element_ : this.ghostEl_;
    var size = /**@type {!goog.math.Size}*/ goog.style.getSize(el);

    this.handlerOffsetSize_ = 
	new goog.math.Size(size.width - targetPos.x, size.height - targetPos.y);
    this.startPos_ = goog.style.getPosition(el);
    this.startSize_ = goog.style.getSize(el);

    this.dispatchEvent({
	type: moka.ui.Resizable.EventType.START_RESIZE
    });
};



/**
 * @param {Event} e
 * @private
 */
moka.ui.Resizable.prototype.onDrag_ = function(e) {
    var dragger = /**@type {!goog.fx.Dragger}*/ e.currentTarget;
    var direction = /**@type {!string}*/ 
	this.getDraggerDirection_(dragger);
    var draggerSize = /**@type {!goog.math.Size}*/
    goog.style.getSize(dragger.handle);
    var el = /**@type {!Element}*/
    this.continuousResize_ ? this.element_ : this.ghostEl_;
    var size = /**@type {!goog.math.Size}*/
    goog.style.getSize(el);
    var pos = /**@type {!goog.math.Coordinate}*/
    goog.style.getPosition(el);


    switch (parseInt(direction)) 
    {
    case 1: // TOP
	this.onDrag_top_(size, dragger, pos, draggerSize);
	this.cropTo_top_(size, pos);
	break;
    case 2: // RIGHT
	this.onDrag_right_(size, dragger);
	this.cropTo_right_(size, pos, draggerSize);
	break;
    case 4: // BOTTOM
	this.onDrag_bottom_(size, dragger);
	this.cropTo_bottom_(size, pos, draggerSize);
	break;
    case 8: // LEFT
	this.onDrag_left_(size, dragger, pos, draggerSize);
	this.cropTo_left_(size, pos);
	break;
    case 16: // TOP_LEFT
	this.onDrag_top_(size, dragger, pos, draggerSize);
	this.onDrag_left_(size, dragger, pos, draggerSize);
	this.cropTo_top_(size, pos);
	this.cropTo_left_(size, pos);
	break;
    case 32: // TOP_RIGHT
	this.onDrag_top_(size, dragger, pos, draggerSize);
	this.onDrag_right_(size, dragger);
	this.cropTo_top_(size, pos);
	this.cropTo_right_(size, pos, draggerSize);
	break;
    case 64: // BOTTOM_RIGHT
	this.onDrag_bottom_(size, dragger);
	this.onDrag_right_(size, dragger);
	this.cropTo_bottom_(size, pos, draggerSize);
	this.cropTo_right_(size, pos, draggerSize);
	break;
    case 128: // BOTTOM_LEFT
	this.onDrag_bottom_(size, dragger);
	this.onDrag_left_(size, dragger, pos, draggerSize);
	this.cropTo_bottom_(size, pos, draggerSize);
	this.cropTo_left_(size, pos);
	break;
    }

    // Now size the containers.
    this.resize_(el, size, pos, this.continuousResize_);

    if (goog.isFunction(el.resize)) {
	el.resize(size);
    }
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
 * @param {!Element} element
 * @param {!goog.math.Size} size
 * @param {!goog.math.Coordinate} pos
 * @param {!boolean} isDispatch Whether to call the resize event.
 * @private
 */
moka.ui.Resizable.prototype.resize_ = 
function(element, size, pos, isDispatch) {
    var newSize = /**@type {!goog.math.Size}*/
	new goog.math.Size(Math.max(size.width, 0), Math.max(size.height, 0));
    var newPos = /**@type {!goog.math.Coordinate}*/
	new goog.math.Coordinate(Math.max(pos.x, 0), Math.max(pos.y, 0));
    if (isDispatch) {
	this.dispatchEvent({
	    type: moka.ui.Resizable.EventType.RESIZE,
	    size: newSize.clone(),
	    pos: newPos.clone()
	});
    }
    goog.style.setBorderBoxSize(element, newSize);
    goog.style.setPosition(element, newPos);
};




/**
 * @param {!goog.math.Size} size
 * @param {!goog.fx.Dragger} dragger
 */
moka.ui.Resizable.prototype.onDrag_right_ = function(size, dragger) {
    size.width = dragger.deltaX + this.handlerOffsetSize_.width;
    size.width = (size.width <= this.minWidth_) ? this.minWidth_ :
	size.width;
};



/**
 * @param {!goog.math.Size} size
 * @param {!goog.math.Coordinate} pos
 * @param {!goog.math.Size} draggerSize
 * @private
 */
moka.ui.Resizable.prototype.cropTo_right_ = function(size, pos, draggerSize) {
   size.width = ((pos.x + size.width + draggerSize.width) > 
		 this.bottomRightLimit_.x) ?  
	(this.bottomRightLimit_.x - pos.x) : size.width;

   this.atBounds_.RIGHT = ((pos.x + size.width + draggerSize.width) 
			   >= this.bottomRightLimit_.x) ? 1 : 0;
}



/**
 * @param {!goog.math.Size} size
 * @param {!goog.fx.Dragger} dragger
 */
moka.ui.Resizable.prototype.onDrag_bottom_ = function(size, dragger) {
    size.height = dragger.deltaY + this.handlerOffsetSize_.height;
    size.height = (size.height <= this.minHeight_) ? this.minHeight_ :
	size.height;
};



/**
 * @param {!goog.math.Size} size
 * @param {!goog.math.Coordinate} pos
 * @param {!goog.math.Size} draggerSize
 * @private
 */
moka.ui.Resizable.prototype.cropTo_bottom_ = function(size, pos, draggerSize)
{  
   size.height = ((pos.y + size.height + draggerSize.height) > 
		 this.bottomRightLimit_.y) ?  
	(this.bottomRightLimit_.y - pos.y) : size.height;

   this.atBounds_.BOTTOM = ((pos.y + size.height + draggerSize.height) 
			   >= this.bottomRightLimit_.y) ? 1 : 0;
}



/**
 * @param {!goog.math.Size} size
 * @param {!goog.fx.Dragger} dragger
 * @param {!goog.math.Coordinate} pos
 * @param {!goog.math.Size} draggerSize
 */
moka.ui.Resizable.prototype.onDrag_top_ = 
function(size, dragger, pos, draggerSize) {

    // Don't move if at minSize and we're pushing downward
    if ((dragger.deltaY > 0) && this.atMins_.HEIGHT) {
	pos.y = pos.y
	size.height = size.height;
	return;

    // Otherwise, we're good.
    } else {
	pos.y = this.startPos_.y + dragger.deltaY;
    }	

    // Dont change height if we're at the top bounds.
    if ((this.atBounds_.TOP && (dragger.deltaY < 0))|| 
	(this.atBounds_.BOTTOM && (dragger.deltaY < 0))) {
	size.height = size.height;
	return
    }

    // Otherwise, we're good.
    else {
	size.height = this.startSize_.height + this.startPos_.y - pos.y - 
	    draggerSize.height;
    }

    // Check mins
    size.height = (size.height < this.minHeight_) ? this.minHeight_ : 
	size.height;

    this.atMins_.HEIGHT = (size.height == this.minHeight_) ? 1 : 0

    // This is a final shimmy -- it has to come at the end.
    pos.y = pos.y + draggerSize.height;
};



/**
 * @param {!goog.math.Size} size
 * @param {!goog.math.Coordinate} pos
 * @private
 */
moka.ui.Resizable.prototype.cropTo_top_ = function(size, pos) {
    pos.y = Math.max(pos.y, this.topLeftLimit_.y);
    pos.y = Math.min(pos.y, this.bottomRightLimit_.y - size.height);
    this.atBounds_.TOP = (pos.y <= this.topLeftLimit_.y) ? 1 : 0;
}



/**
 * @param {!goog.math.Size} size
 * @param {!goog.fx.Dragger} dragger
 * @param {!goog.math.Coordinate} pos
 * @param {!goog.math.Size} draggerSize
 */
moka.ui.Resizable.prototype.onDrag_left_ = 
function(size, dragger, pos, draggerSize) {

    // Don't move if at minSize and we're pushing rightward
    if ((dragger.deltaX > 0) && this.atMins_.WIDTH) {
	pos.x = pos.x
	size.width = size.width;
	return;

    // Otherwise we're okay.
    } else {
	pos.x = this.startPos_.x + dragger.deltaX;
    }	

    // Dont change height if we're at the top bounds.
    if (this.atBounds_.LEFT || this.atBounds_.RIGHT) {
	size.width = size.width;
	return;
    }

    // Otherwise we're okay
    else {
	size.width = this.startSize_.width + this.startPos_.x - pos.x;
    }
    
    // Crop to min
    size.width = (size.width < this.minWidth_) ? this.minWidth_ : 
	size.width;

    // Check if at min
    this.atMins_.WIDTH = (size.width == this.minWidth_) ? 1 : 0

};



/**
 * @param {!goog.math.Size} size
 * @param {!goog.math.Coordinate} pos
 * @private
 */
moka.ui.Resizable.prototype.cropTo_left_ = function(size, pos) {
    pos.x = Math.max(pos.x, this.topLeftLimit_.x);
    pos.x = Math.min(pos.x, this.bottomRightLimit_.x);
    this.atBounds_.LEFT = (pos.x == this.topLeftLimit_.x) ? 1 : 0;   
}



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
	d.dispose();
    })
    this.draggers_ = {};

    goog.object.forEach(this.dragElts_, function(h, pos){
	goog.dom.removeNode(h);
    })
    this.dragElts_ = {};

    if (this.ghostEl_) {
	goog.dom.removeNode(this.ghostEl_);
	this.ghostEl_ = null;
    }

    if (this.boundaryElt_) {
	goog.dom.removeNode(this.boundaryElt_.parentNode, this.containment);
	this.boundaryElt_ = null;
    }

    if (this.slideAnim_){
	this.slideAnim_.disposeInternal();
	this.slideAnim_.destroy();
	this.slideAnim_ = null;
    }

    this.topLeftLimit_ = null;
    this.bottomRightLimit_ = null;
    this.startPos_ = null;
    this.startSize_ = null;
};

