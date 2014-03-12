/**
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 * @author unkown email (uchida)
 * 
 * NOTE: This is an adaptaion from the following source:
 * http://dev.ariel-networks.com/Members/uchida/stuff/goog-ui-resizable.zip/
 */

// goog
goog.require('goog.object');
goog.require('goog.fx.Dragger');
goog.require('goog.fx.Dragger.EventType');
goog.require('goog.math.Size');
goog.require('goog.style');

// moka
goog.require('moka.ui.Component');




/**
 * Allows an element to be resizeable within its parent.
 * Originally sourced from here:
 * NOTE: This is modified from the following source:
 * http://dev.ariel-networks.com/Members/uchida/stuff/goog-ui-resizable.zip/
 * 
 * @constructor
 * @param {!Element} element 
 * @param {!Array.string | !string} opt_dirs The optional directions. See
 *    property keys of 'moka.ui.Resizeable.Directions'. Defaults to 
 *    property 'moka.ui.Resizeable.defaultDirections'. 'ALL' or 'DEFAULT' 
 *    are also valid.
 * @extends {moka.ui.Component}
 */
goog.provide('goog.ui.Resizable');
goog.provide('goog.ui.Resizable.EventType');
moka.ui.Resizeable = function(element, opt_dirs) {
    goog.base(this);


    /**
     * @type {!Element}
     * @private
     */
    this.element_ = goog.dom.$(element);


    /**
     * @type {!Object}
     * @private
     */
    this.handleDraggers_ = {};


    /**
     * @type {!Object}
     * @private
     */
    this.handlers_ = {};


    this.manageGhostElement_();
    this.initBounds_();
    this.initSize_();
    this.setResizeDirections(opt_dirs || moka.ui.Resizeable.defaultDirections);

};
goog.inherits(moka.ui.Resizeable, moka.ui.Component);
goog.exportSymbol('moka.ui.Resizeable', moka.ui.Resizeable);



/**
 * @enum {string}
 */
moka.ui.Resizeable.EventType = {
    RESIZE: 'resize',
    START_RESIZE: 'start_resize',
    END_RESIZE: 'end_resize'
};



/**
 * @dict
 */
moka.ui.Resizeable.Directions = {
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
 */
moka.ui.Resizeable.defaultDirections = [ 'RIGHT', 'BOTTOM', 'BOTTOM_RIGHT'];



/**
 * @type {!number} 
 * @const
 */
moka.ui.Resizeable.DEFAULT_NW_X = 0;



/**
 * @type {!number} 
 * @const
 */
moka.ui.Resizeable.DEFAULT_NW_Y = 0;



/**
 * @type {!number} 
 * @const
 */
moka.ui.Resizeable.DEFAULT_SE_X = 200;



/**
 * @type {!number} 
 * @const
 */
moka.ui.Resizeable.DEFAULT_SE_Y = 200;


/**
 * @type {!number} 
 * @const
 */
moka.ui.Resizeable.DEFAULT_MIN_WIDTH = 20;


/**
 * @type {!number} 
 * @const
 */
moka.ui.Resizeable.DEFAULT_MIN_HEIGHT = 20;




/**
 * @type {!string} 
 * @const
 */
moka.ui.Resizeable.ID_PREFIX =  'moka.ui.Resizeable';



/**
 * @type {!string} 
 * @const
 */
moka.ui.Resizeable.CSS_CLASS_PREFIX =
goog.string.toSelectorCase(
    moka.ui.Resizeable.ID_PREFIX.toLowerCase().replace(/\./g,'-'));



/**
 * @type {string} 
 * @const
 */
moka.ui.Resizeable.ELEMENT_CLASS =
    goog.getCssName(moka.ui.Resizeable.CSS_CLASS_PREFIX, '');



/**
 * @type {string} 
 * @const
 */
moka.ui.Resizeable.BOUNDARY_CLASS =
    goog.getCssName(moka.ui.Resizeable.CSS_CLASS_PREFIX, 'boundary');



/**
 * @type {goog.math.Coordinate}
 * @private
 */
moka.ui.Resizeable.prototype.startPos_;



/**
 * @type {goog.math.Size}
 * @private
 */
moka.ui.Resizeable.prototype.startSize_;



/**
 * @type {goog.math.Coordinate}
 * @private
 */
moka.ui.Resizeable.prototype.topLeftLimit_;



/**
 * @type {goog.math.Coordinate}
 * @private
 */
moka.ui.Resizeable.prototype.bottomRightLimit_;


/**
 * @type {goog.math.Size}
 * @private
 */
moka.ui.Resizeable.prototype.minSize_;



/**
 * @type {!boolean}
 * @private
 */
moka.ui.Resizeable.prototype.continuousResize_ = true;



/**
 * @type {Element}
 * @private
 */
moka.ui.Resizeable.prototype.boundaryElt_;



/**
 * @enum {number}
 * @private
 */
moka.ui.Resizeable.prototype.atBounds_ = {
    TOP: 0,
    LEFT: 0,
    RIGHT: 0,
    BOTTOM: 0
};



/**
 * @enum {number}
 * @private
 */
moka.ui.Resizeable.prototype.atMins_ = {
    WIDTH: 0,
    HEIGHT: 0,
};




/**
 * @public
 */
moka.ui.Resizeable.prototype.getContinuousResize = function() {
    return this.continuousResize_;
};



/**
 * @public
 */
moka.ui.Resizeable.prototype.setContinuousResize = function(continuous) {
    this.continuousResize_ = continuous;
    this.manageGhostElement_();
};



/**
 * @public
 */
moka.ui.Resizeable.prototype.getGhostElement = function() {
    return this.ghostEl_;
};



/**
 * @return {!Object} The limits object.
 * @public
 */
moka.ui.Resizeable.prototype.getBounds = function() {
    return [this.topLeftLimit_, this.bottomRightLimit_];
};



/**
 * @return {!Object} The limits object.
 * @public
 */
moka.ui.Resizeable.prototype.showBoundaryElt = function() {
    return this.boundaryElt_.style.visibility = 'visible';
};



/**
 * @return {!Object} The limits object.
 * @public
 */
moka.ui.Resizeable.prototype.hideBoundaryElt = function() {
    return this.boundaryElt_.style.visibility = 'hidden';
};



/**
 * @param {!number} x1 Top left x.
 * @param {!number} y1 Top left y.
 * @param {!number} x2 Bottom right x.
 * @param {!number} y2 Bottm right y.
 * @param {boolean=} opt_createContainDiv
 * @public
 */
moka.ui.Resizeable.prototype.setBounds = function(x1, y1, x2, y2) {
    if (x2 < x1) {
	throw new Error('Invalid limit. x2 must be >= x1');
    }
    if (y2 < y1) {
	throw new Error('Invalid limit. y2 must be >= y1');
    }
    this.topLeftLimit_ = new goog.math.Coordinate(x1, y1);
    this.bottomRightLimit_ = new goog.math.Coordinate(x2, y2);
    this.createBoundaryElt_();
}




/**
 * @private
 */
moka.ui.Resizeable.prototype.createBoundaryElt_ = function(){
   
    if (!this.boundaryElt_){
	this.boundaryElt_ = goog.dom.createDom('div');
	goog.dom.classes.add(this.boundaryElt_, 
			     moka.ui.Resizeable.BOUNDARY_CLASS);
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
 * @param {!number} minW
 * @param {!number} minH
 * @public
 */
moka.ui.Resizeable.prototype.setMinSize = function(minW, minH) {
    this.minSize_ = new goog.math.Size(minW, minH);
};




/**
 * Allows the user to set the resize directions specified by 
 * moka.ui.Resizeable.Directions.
 * 
 * @param {!Array | !string} dirs The directions.
 * @public
 */
moka.ui.Resizeable.prototype.setResizeDirections = function(dirs){
    // Type Asserts
    if (!goog.isArray(dirs) && !goog.isString(dirs)){
	throw new TypeError('Array or string needed!' + typeof dirs);
    }

    if (goog.isString(dirs)){
	if (dirs.toUpperCase() == 'ALL'){
	    dirs = goog.object.getKeys(moka.ui.Resizeable.Directions)
	} else if (dirs.toUpperCase() == 'DEFAULT') {
	    dirs = moka.ui.Resizeable.defaultDirections;
	} else {
	    dirs =  [dirs];
	}
    }

    // Loop
    goog.array.forEach(dirs, function(dir, i){
	// Make sure each value is a string.
	if (!goog.isString(dir)) { throw new Error('String required!') };
	// Make sure value is a valid direction.
	if (!goog.object.containsKey(moka.ui.Resizeable.Directions, dir)) {
	    throw new Error('Invalid direction: ', dir);
	}
	// Add handler.
	this.addResizableHandler_(dir);
    }.bind(this))
}



/**
 * Initializes the limit properties.
 * @private
 */
moka.ui.Resizeable.prototype.initBounds_ = function(){
    var x1, x2, y1, y2;
    if (this.getElement().parentNode) {
	var size = goog.style.getSize(this.getElement().parentNode);
	var pos = goog.style.getPosition(this.getElement().parentNode);
	x1 = pos.x;
	y1 = pos.y;
	x2 = x1 + size.width;
	y2 = y2 + size.height;

    } else {
	x1 = moka.ui.Resizeable.DEFAULT_NW_X;
	y1 = moka.ui.Resizeable.DEFAULT_NW_Y;
	x2 = moka.ui.Resizeable.DEFAULT_SE_X;
	y2 = moka.ui.Resizeable.DEFAULT_SE_Y;	
    }

    this.topLeftLimit_ = new goog.math.Coordinate(x1, y1);
    this.bottomRightLimit_ = new goog.math.Coordinate(x2, y2);
}



/**
 * Initializes the limit properties.
 * @private
 */
moka.ui.Resizeable.prototype.initSize_ = function(){
    this.minSize_ = new goog.math.Coordinate(
	moka.ui.Resizeable.DEFAULT_MIN_WIDTH, 
	moka.ui.Resizeable.DEFAULT_MIN_HEIGHT);
}


/**
 * @param {!string}
 * @private
 */
moka.ui.Resizeable.prototype.addResizableHandler_ = function(dir) {
    var dom = /**@type {!goog.dom.DomHelper}*/ this.getDomHelper();
    var handle = /**@type {!Element}*/ dom.createDom('div');
    var dirNum = /**@type {!number}*/ moka.ui.Resizeable.Directions[dir];

    // Add classes.
    goog.dom.classes.add(handle, moka.ui.Resizeable.ELEMENT_CLASS, 
		goog.getCssName(moka.ui.Resizeable.CSS_CLASS_PREFIX, 
				dir.toLowerCase()).replace(/\.|_/g,'-'));

    // Add handle to element
    this.element_.appendChild(handle);

    // Create and Add to properties.
    this.handleDraggers_[dirNum] = this.createDragger_(handle);
    this.handlers_[dirNum] = handle;
};



/**
 * @param {!Element} handle
 * @return {!goog.fx.Dragger} The created dragger.
 * @private
 */
moka.ui.Resizeable.prototype.createDragger_ = function(handle) {
    var dragger = /**@type {!goog.fx.Dragger}*/ new goog.fx.Dragger(handle);
    dragger.defaultAction = function() {};
    this.setDraggerEvents_(dragger);
    return dragger;
};



/**
 * @param {!goog.fx.Dragger} dragger
 * @private
 */
moka.ui.Resizeable.prototype.setDraggerEvents_ = function(dragger) {
    // Event listeners.
    this.getHandler().
	listen(dragger, goog.fx.Dragger.EventType.START,
               this.handleDragStart_).
	listen(dragger, goog.fx.Dragger.EventType.DRAG,
               this.handleDrag_).
	listen(dragger, goog.fx.Dragger.EventType.END,
               this.handleDragEnd_);

};



/**
 * @private
 */
moka.ui.Resizeable.prototype.handleDragStart_ = function(e) {
    if (!this.continuousResize_) {
	goog.style.setBorderBoxSize(this.ghostEl_, 
				    goog.style.getBorderBoxSize(this.element_));
	goog.style.showElement(this.ghostEl_, true);
    }

    var dragger = e.currentTarget;
    var direction = this.getDraggerDirection_(dragger);
    var targetPos = goog.style.getPosition(dragger.target);

    var el = this.continuousResize_ ? this.element_ : this.ghostEl_;
    var size = goog.style.getSize(el);
    this.handlerOffsetSize_ = 
	new goog.math.Size(size.width - targetPos.x, size.height - targetPos.y);

    // declare this!
    this.startPos_ = goog.style.getPosition(el);
    this.startSize_ = goog.style.getSize(el);

    this.dispatchEvent({
	type: moka.ui.Resizeable.EventType.START_RESIZE
    });
};



/**
 * @private
 */
moka.ui.Resizeable.prototype.handleDrag_ = function(e) {
    var dragger = e.currentTarget;
    var direction = this.getDraggerDirection_(dragger);
    var draggerSize = goog.style.getSize(dragger.handle);
    var el = this.continuousResize_ ? this.element_ : this.ghostEl_;
    var size = goog.style.getSize(el);
    var pos = goog.style.getPosition(el);


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
 * @private
 */
moka.ui.Resizeable.prototype.handleDragEnd_ = function(e) {
    if (!this.continuousResize_) {
	this.resize_(this.element_, 
		     goog.style.getBorderBoxSize(this.ghostEl_), true);
	goog.style.showElement(this.ghostEl_, false);
    }
    this.dispatchEvent({
	type: moka.ui.Resizeable.EventType.END_RESIZE
    });
};



/**
 * @private
 */
moka.ui.Resizeable.prototype.resize_ = 
function(element, size, pos, isDispatch) {
    var newSize = /**@type {!goog.math.Size}*/
	new goog.math.Size(Math.max(size.width, 0), Math.max(size.height, 0));
    var newPos = /**@type {!goog.math.Coordinate}*/
	new goog.math.Coordinate(Math.max(pos.x, 0), Math.max(pos.y, 0));

    if (isDispatch) {
	this.dispatchEvent({
	    type: moka.ui.Resizeable.EventType.RESIZE,
	    size: newSize.clone(),
	    direction: newPos.clone()
	});
    }

    goog.style.setBorderBoxSize(element, newSize);
    goog.style.setPosition(element, newPos);
};




/**
 * As stated.
 * @param {!goog.math.Size} size
 * @param {!goog.fx.Dragger} dragger
 */
moka.ui.Resizeable.prototype.onDrag_right_ = function(size, dragger) {
    size.width = dragger.deltaX + this.handlerOffsetSize_.width;
    size.width = (size.width <= this.minSize_.width) ? this.minSize_.width :
	size.width;
};



/**
 * Crops the element position and size to the right boundary.
 * @param {!goog.math.Size} size
 * @param {!goog.math.Coordinate} pos
 * @private
 */
moka.ui.Resizeable.prototype.cropTo_right_ = function(size, pos, draggerSize) {
   size.width = ((pos.x + size.width + draggerSize.width) > 
		 this.bottomRightLimit_.x) ?  
	(this.bottomRightLimit_.x - pos.x) : size.width;

   this.atBounds_.RIGHT = ((pos.x + size.width + draggerSize.width) 
			   >= this.bottomRightLimit_.x) ? 1 : 0;
}



/**
 * As stated.
 * @param {!goog.math.Size} size
 * @param {!goog.fx.Dragger} dragger
 */
moka.ui.Resizeable.prototype.onDrag_bottom_ = function(size, dragger) {
    size.height = dragger.deltaY + this.handlerOffsetSize_.height;
    size.height = (size.height <= this.minSize_.height) ? this.minSize_.height :
	size.height;
};



/**
 * Crops the element position and size to the bottom boundary.
 * @param {!goog.math.Size} size
 * @param {!goog.math.Coordinate} pos
 * @private
 */
moka.ui.Resizeable.prototype.cropTo_bottom_ = function(size, pos, draggerSize)
{  
   size.height = ((pos.y + size.height + draggerSize.height) > 
		 this.bottomRightLimit_.y) ?  
	(this.bottomRightLimit_.y - pos.y) : size.height;

   this.atBounds_.BOTTOM = ((pos.y + size.height + draggerSize.height) 
			   >= this.bottomRightLimit_.y) ? 1 : 0;
}



/**
 * As stated.
 * @param {!goog.math.Size} size
 * @param {!goog.fx.Dragger} dragger
 * @param {!goog.math.Coordinate} pos
 * @param {!goog.math.Size} draggerSize
 */
moka.ui.Resizeable.prototype.onDrag_top_ = 
function(size, dragger, pos, draggerSize) {

    // Don't move if at minSize and we're pushing downward
    if ((dragger.deltaY > 0) && this.atMins_.HEIGHT) {
	pos.y = pos.y
	size.height = size.height;
	return;
    } else {
	pos.y = this.startPos_.y + dragger.deltaY;
    }	

    // Dont change height if we're at the top bounds.
    if (this.atBounds_.TOP || this.atBounds_.BOTTOM) {
	size.height = size.height;
	return
    }
    else {
	size.height = this.startSize_.height + this.startPos_.y - pos.y - 
	    draggerSize.height;
    }
    
    // Check mins
    size.height = (size.height < this.minSize_.height) ? this.minSize_.height : 
	size.height;

    this.atMins_.HEIGHT = (size.height == this.minSize_.height) ? 1 : 0

    // This is a final shimmy -- it has to come at the end.
    pos.y = pos.y + draggerSize.height;
};



/**
 * Crops the element position and size to the top boundary.
 * @param {!goog.math.Size} size
 * @param {!goog.math.Coordinate} pos
 * @private
 */
moka.ui.Resizeable.prototype.cropTo_top_ = function(size, pos) {
    pos.y = Math.max(pos.y, this.topLeftLimit_.y);
    pos.y = Math.min(pos.y, 
			    this.bottomRightLimit_.y - size.height);
    this.atBounds_.TOP = (pos.y == this.topLeftLimit_.y) ? 1 : 0;
}



/**
 * As stated.
 * @param {!goog.math.Size} size
 * @param {!goog.fx.Dragger} dragger
 * @param {!goog.math.Coordinate} pos
 * @param {!goog.math.Size} draggerSize
 */
moka.ui.Resizeable.prototype.onDrag_left_ = 
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
    size.width = (size.width < this.minSize_.width) ? this.minSize_.width : 
	size.width;

    // Check if at min
    this.atMins_.WIDTH = (size.width == this.minSize_.width) ? 1 : 0

};



/**
 * Crops the element position and size to the left boundary.
 * @param {!goog.math.Size} size
 * @param {!goog.math.Coordinate} pos
 * @private
 */
moka.ui.Resizeable.prototype.cropTo_left_ = function(size, pos) {
    pos.x = Math.max(pos.x, this.topLeftLimit_.x);
    pos.x = Math.min(pos.x, this.bottomRightLimit_.x - size.width);
    this.atBounds_.LEFT = (pos.x == this.topLeftLimit_.x) ? 1 : 0;   
}



/**
 * @private
 */
moka.ui.Resizeable.prototype.getDraggerDirection_ = function(dragger) {
    for (var direction in this.handleDraggers_) {
	if (this.handleDraggers_[direction] === dragger) {
	    return direction;
	}
    }
    return null;
};



/**
 * @private
 */
moka.ui.Resizeable.prototype.manageGhostElement_ = function() {
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
moka.ui.Resizeable.prototype.disposeInternal = function() {
    moka.ui.Resizeable.superClass_.disposeInternal.call(this);

    goog.object.forEach(this.handleDraggers_, function(d, pos){
	d.dispose();
    })
    this.handleDraggers_ = {};

    goog.object.forEach(this.handlers_, function(h, pos){
	goog.dom.removeNode(h);
    })
    this.handlers_ = {};

    if (this.ghostEl_) {
	goog.dom.removeNode(this.ghostEl_);
	this.ghostEl_ = null;
    }


    if (this.boundaryElt_) {
	goog.dom.removeNode(this.boundaryElt_.parentNode, this.containment);
	this.boundaryElt_ = null;
    }

    this.topLeftLimit_ = null;
    this.bottomRightLimit_ = null;
    this.startPos_ = {};
    this.startSize_ = {};
};

