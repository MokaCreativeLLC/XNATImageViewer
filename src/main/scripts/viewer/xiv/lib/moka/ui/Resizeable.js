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
 * @param {!number} x1 Top left x.
 * @param {!number} y1 Top left y.
 * @param {!number} x2 Bottom right x.
 * @param {!number} y2 Bottm right y.
 * @param {boolean=} opt_createContainDiv
 * @public
 */
moka.ui.Resizeable.prototype.setContainment = 
function(x1, y1, x2, y2, opt_createContainDiv) {
    if (x2 < x1) {
	throw new Error('Invalid limit. x2 must be >= x1');
    }
    if (y2 < y1) {
	throw new Error('Invalid limit. y2 must be >= y1');
    }
    this.topLeftLimit_ = new goog.math.Coordinate(x1, y1);
    this.bottomRightLimit_ = new goog.math.Coordinate(x2, y2);

    if (opt_createContainDiv){
	var d = goog.dom.createDom('div'); 
	moka.style.setStyle(d, {
	    'position': 'absolute',
	    'left': 20,
	    'top': 20,
	    'height': 300,
	    'width': 300,
	    'background-color': 'rgba(255,0,0,.5)'
	})
	goog.dom.append(this.getElement().parentNode, d);
    }
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
    this.maxSize_ = new goog.math.Coordinate(20, 20);
    this.minSize_ = new goog.math.Coordinate(300, 300);
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
    var position = this.getDraggerPosition_(dragger);
    var targetPos = goog.style.getPosition(dragger.target);

    var el = this.continuousResize_ ? this.element_ : this.ghostEl_;
    var size = goog.style.getSize(el);
    this.handlerOffsetSize_ = 
	new goog.math.Size(size.width - targetPos.x, size.height - targetPos.y);

    // declare this!
    this.startPos_ = goog.style.getPosition(el);
    this.startSize_ = goog.style.getSize(el);
    window.console.log("START POS", this.startPos_);

    this.dispatchEvent({
	type: moka.ui.Resizeable.EventType.START_RESIZE
    });
};



/**
 * @private
 */
moka.ui.Resizeable.prototype.handleDrag_ = function(e) {
    var dragger = e.currentTarget;
    var position = this.getDraggerPosition_(dragger);
    var draggerSize = goog.style.getSize(dragger.handle);
    var el = this.continuousResize_ ? this.element_ : this.ghostEl_;
    var size = goog.style.getSize(el);
    var pos = goog.style.getPosition(el);


    switch (parseInt(position)) 
    {
    case 1: // TOP
	this.onDrag_top_(size, dragger, pos, draggerSize);
	break;
    case 2: // RIGHT
	this.onDrag_right_(size, dragger);
	break;
    case 4: // BOTTOM
	this.onDrag_bottom_(size, dragger);
	break;
    case 8: // LEFT
	this.onDrag_left_(size, dragger, pos, draggerSize);
	break;
    case 16: // TOP_LEFT
	this.onDrag_top_(size, dragger, pos, draggerSize);
	this.onDrag_left_(size, dragger, pos, draggerSize);
	break;
    case 32: // TOP_RIGHT
	this.onDrag_top_(size, dragger, pos, draggerSize);
	this.onDrag_right_(size, dragger);
	break;
    case 64: // BOTTOM_RIGHT
	this.onDrag_bottom_(size, dragger);
	this.onDrag_right_(size, dragger);
	break;
    case 128: // BOTTOM_LEFT
	this.onDrag_bottom_(size, dragger);
	this.onDrag_left_(size, dragger, pos, draggerSize);
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
 * As stated.
 * @param {!goog.math.Size} size
 * @param {!goog.fx.Dragger} dragger
 */
moka.ui.Resizeable.prototype.onDrag_right_ = function(size, dragger) {
    size.width = dragger.deltaX + this.handlerOffsetSize_.width;
};



/**
 * As stated.
 * @param {!goog.math.Size} size
 * @param {!goog.fx.Dragger} dragger
 */
moka.ui.Resizeable.prototype.onDrag_bottom_ = function(size, dragger) {
    size.height = dragger.deltaY + this.handlerOffsetSize_.height;
};



/**
 * As stated.
 * @param {!goog.math.Size} size
 * @param {!goog.fx.Dragger} dragger
 * @param {!goog.math.Coordinate} pos
 * @param {!goog.math.Size} draggerSize
 */
moka.ui.Resizeable.prototype.onDrag_top_ = 
function(size, dragger, pos, draggerSize) {
    pos.y = this.startPos_.y + dragger.deltaY;
    size.height = this.startSize_.height + 
	this.startPos_.y - pos.y - draggerSize.height;
    pos.y = pos.y + draggerSize.height;
};



/**
 * As stated.
 * @param {!goog.math.Size} size
 * @param {!goog.fx.Dragger} dragger
 * @param {!goog.math.Coordinate} pos
 * @param {!goog.math.Size} draggerSize
 */
moka.ui.Resizeable.prototype.onDrag_left_ = 
function(size, dragger, pos, draggerSize) {
    pos.x = this.startPos_.x + dragger.deltaX;
    size.width = this.startSize_.width + (this.startPos_.x - pos.x);
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
    
    this.cropToBounds_(newPos, newSize);

    if (isDispatch) {
	this.dispatchEvent({
	    type: moka.ui.Resizeable.EventType.RESIZE,
	    size: newSize.clone()
	});
    }

    goog.style.setBorderBoxSize(element, newSize);
    goog.style.setPosition(element, newPos);
};



/**
 * @param {!goog.math.Coordinate} newPos
 * @param {!goog.math.Size} newSize
 * @private
 */
moka.ui.Resizeable.prototype.cropToBounds_ = function(newPos, newSize) {

    if (this.topLeftLimit_.x > 0) {
	newPos.x = Math.max(newPos.x, this.topLeftLimit_.x);
    }

    if (this.bottomRightLimit_.x > 0) {
	// don't add any more width if we're at the left boundary.
	if (newPos.x == this.topLeftLimit_.x){
	    newSize.width = parseInt(this.getElement().style.width);
	// otherwise we're good.
	} else {
	    newSize.width = Math.min(newSize.width, 
			this.bottomRightLimit_.x - this.topLeftLimit_.x);
	}
    }

    if (this.topLeftLimit_.y > 0) {
	newPos.y = Math.max(newPos.y, this.topLeftLimit_.y);
    }

    if (this.bottomRightLimit_.y > 0) {
	// don't add any more height if we're at the right boundary.
	if (newPos.y == this.topLeftLimit_.y){
	    newSize.height = parseInt(this.getElement().style.height);
	// otherwise we're good
	} else {
	    newSize.height = Math.min(newSize.height, 
			this.bottomRightLimit_.y - this.topLeftLimit_.y);
	}	
    }

}





/**
 * @private
 */
moka.ui.Resizeable.prototype.getDraggerPosition_ = function(dragger) {
    for (var position in this.handleDraggers_) {
	if (this.handleDraggers_[position] === dragger) {
	    return position;
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

    this.topLeftLimit_ = null;
    this.bottomRightLimit_ = null;
    this.startPos_ = {};
    this.startSize_ = {};
};

