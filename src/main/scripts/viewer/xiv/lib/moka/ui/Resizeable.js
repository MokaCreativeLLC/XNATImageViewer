/**
 * NOTE: This is modified from the following source:
 * http://dev.ariel-networks.com/Members/uchida/stuff/goog-ui-resizable.zip/
 * 
 * @author unkown email (uchida)
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 */

// goog
goog.require('goog.object');
goog.require('goog.fx.Dragger');
goog.require('goog.fx.Dragger.EventType');
goog.require('goog.math.Size');
goog.require('goog.style');
goog.require('goog.ui.Component');




/**
 * Allows an element to be resizeable.
 * @constructor
 * @param {!Element} element 
 * @param {!Object} opt_data 
 * @param {!Object} opt_domHelper 
 * @extends {goog.ui.Component}
 */
goog.provide('goog.ui.Resizable');
goog.provide('goog.ui.Resizable.EventType');
moka.ui.Resizeable = function(element, opt_data, opt_domHelper) {
    goog.base(this, opt_domHelper);


    /**
     * @type {!Element}
     * @private
     */
    this.element_ = goog.dom.$(element);


    opt_data = opt_data || {};



    /**
     * @type {!number}
     * @private
     */
    this.minWidth_ = goog.isNumber(opt_data.minWidth) ? opt_data.minWidth : 0;

    /**
     * @type {!number}
     * @private
     */
    this.maxWidth_ = goog.isNumber(opt_data.maxWidth) ? opt_data.maxWidth : 0;

    /**
     * @type {!number}
     * @private
     */
    this.minHeight_ = goog.isNumber(opt_data.minHeight) ? opt_data.minHeight : 0;

    /**
     * @type {!number}
     * @private
     */
    this.maxHeight_ = goog.isNumber(opt_data.maxHeight) ? opt_data.maxHeight : 0;


    /**
     * @type {!boolean}
     * @private
     */
    this.continuousResize_ = goog.isBoolean(opt_data.continuousResize) ? opt_data.continuousResize : false;


    this.manageGhostElement_();


    /**
     * @type {!number}
     * @private
     */
    this.handles_ = opt_data.handles || moka.ui.Resizeable.Position.DEFAULT;


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

    if (this.handles_ & moka.ui.Resizeable.Position.RIGHT) {
	this.addResizableHandler_(moka.ui.Resizeable.Position.RIGHT,
				  'moka-ui-resizable-right');
    }
    if (this.handles_ & moka.ui.Resizeable.Position.BOTTOM_RIGHT) {
	this.addResizableHandler_(moka.ui.Resizeable.Position.BOTTOM_RIGHT,
				  'moka-ui-resizable-bottom-right');
    }
    if (this.handles_ & moka.ui.Resizeable.Position.BOTTOM) {
	this.addResizableHandler_(moka.ui.Resizeable.Position.BOTTOM,
				  'moka-ui-resizable-bottom');
    }

    if (this.handles_ & moka.ui.Resizeable.Position.BOTTOM_LEFT) {
	this.addResizableHandler_(moka.ui.Resizeable.Position.BOTTOM_LEFT,
				  'moka-ui-resizable-bottom-left');
    }


    if (this.handles_ & moka.ui.Resizeable.Position.LEFT) {
	this.addResizableHandler_(moka.ui.Resizeable.Position.LEFT,
				  'moka-ui-resizable-left');
    }


    if (this.handles_ & moka.ui.Resizeable.Position.TOP_LEFT) {
	this.addResizableHandler_(moka.ui.Resizeable.Position.TOP_LEFT,
				  'moka-ui-resizable-top-left');
    }

    if (this.handles_ & moka.ui.Resizeable.Position.TOP) {
	this.addResizableHandler_(moka.ui.Resizeable.Position.TOP,
				  'moka-ui-resizable-top');
    }

    if (this.handles_ & moka.ui.Resizeable.Position.TOP_RIGHT) {
	this.addResizableHandler_(moka.ui.Resizeable.Position.TOP_RIGHT,
				  'moka-ui-resizable-top-right');
    }
};
goog.inherits(moka.ui.Resizeable, goog.ui.Component);
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
 * @enum {number}
 */
moka.ui.Resizeable.Position = {
    TOP: 1,
    RIGHT: 2,
    BOTTOM: 4,
    LEFT: 8,
    TOP_LEFT: 16,
    TOP_RIGHT: 32,
    BOTTOM_RIGHT: 64,
    BOTTOM_LEFT: 128,
    DEFAULT: 255
};




/**
 * @private
 */
moka.ui.Resizeable.prototype.addResizableHandler_ = 
function(position, className) {
    var dom = this.getDomHelper();
    var handle = dom.createDom('div',
			       className + ' moka-ui-resizable-handle');
    this.element_.appendChild(handle);

    var dragger = new goog.fx.Dragger(handle);
    dragger.defaultAction = function() {};

    this.getHandler().
	listen(dragger, goog.fx.Dragger.EventType.START,
               this.handleDragStart_).
	listen(dragger, goog.fx.Dragger.EventType.DRAG,
               this.handleDrag_).
	listen(dragger, goog.fx.Dragger.EventType.END,
               this.handleDragEnd_);

    this.handleDraggers_[position] = dragger;
    this.handlers_[position] = handle;




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

    var el = this.continuousResize_ ? this.element_ : this.ghostEl_;
    var size = goog.style.getSize(el);
    var pos = goog.style.getPosition(el);

    if (position == moka.ui.Resizeable.Position.RIGHT) {
	size.width = dragger.deltaX + this.handlerOffsetSize_.width;

    } else if (position == moka.ui.Resizeable.Position.BOTTOM) {
	window.console.log('BOTTOM', size.height, 
			   (dragger.deltaY + this.handlerOffsetSize_.height))
	size.height = dragger.deltaY + this.handlerOffsetSize_.height;

    } else if (position == moka.ui.Resizeable.Position.BOTTOM_RIGHT) {
	size.width = dragger.deltaX + this.handlerOffsetSize_.width;
	size.height = dragger.deltaY + this.handlerOffsetSize_.height;

    } 


    else if (position == moka.ui.Resizeable.Position.TOP) {

	window.console.log("\nOLD Y", pos.y, 'OLD H', size.height);
	window.console.log("dragger dy", dragger.deltaY, "hof", 
			   this.handlerOffsetSize_.height);
	var yDiff = dragger.deltaY;

	window.console.log('DRAG', this.startPos_.y, yDiff);
	pos.y = this.startPos_.y + yDiff;
	size.height = this.startSize_.height + (this.startPos_.y - pos.y);
	window.console.log("NEW Y", pos.y, 'NEW H', size.height);
	//goog.style.setPosition(el, pos);
	el.style.top = parseInt(pos.y).toString() + 'px';

    } 

    // Now size the containers.
    //this.reposition_(el, pos, this.continuousResize_);
    this.resize_(el, size, this.continuousResize_);

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
moka.ui.Resizeable.prototype.reposition_ = function(element, pos, isDispatch) {
    var newPos = 
	new goog.math.Coordinate(
	    Math.max(pos.x, 0), Math.max(pos.y, 0));

    if (this.minWidth_ > 0) {
	newSize.width = Math.max(newSize.width, this.minWidth_);
    }
    if (this.maxWidth_ > 0){
	newSize.width = Math.min(newSize.width, this.maxWidth_);
    }
    if (this.minHeight_ > 0) {
	newSize.height = Math.max(newSize.height, this.minHeight_);
    }
    if (this.maxHeight_ > 0) {
	newSize.height = Math.min(newSize.height, this.maxHeight_);
    }

    if (isDispatch) {
	this.dispatchEvent({
	    type: moka.ui.Resizeable.EventType.RESIZE,
	    size: newSize.clone()
	});
    }

    // TODO: Add a goog.math.Size.max call for below.
    goog.style.setPosition(element, newPos);
};




/**
 * @private
 */
moka.ui.Resizeable.prototype.resize_ = function(element, size, isDispatch) {
    var newSize = 
	new goog.math.Size(Math.max(size.width, 0), Math.max(size.height, 0));

    if (this.minWidth_ > 0) {
	newSize.width = Math.max(newSize.width, this.minWidth_);
    }
    if (this.maxWidth_ > 0){
	newSize.width = Math.min(newSize.width, this.maxWidth_);
    }
    if (this.minHeight_ > 0) {
	newSize.height = Math.max(newSize.height, this.minHeight_);
    }
    if (this.maxHeight_ > 0) {
	newSize.height = Math.min(newSize.height, this.maxHeight_);
    }

    if (isDispatch) {
	this.dispatchEvent({
	    type: moka.ui.Resizeable.EventType.RESIZE,
	    size: newSize.clone()
	});
    }

    // TODO: Add a goog.math.Size.max call for below.
    goog.style.setBorderBoxSize(element, newSize);
};



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
 * @public
 */
moka.ui.Resizeable.prototype.getMinWidth = function() {
    return this.minWidth_;
};



/**
 * @public
 */
moka.ui.Resizeable.prototype.setMinWidth = function(width) {
    this.minWidth_ = width;
};


/**
 * @public
 */
moka.ui.Resizeable.prototype.getMaxWidth = function() {
    return this.maxWidth_;
};



/**
 * @public
 */
moka.ui.Resizeable.prototype.setMaxWidth = function(width) {
    this.maxWidth_ = width;
};



/**
 * @public
 */
moka.ui.Resizeable.prototype.getMinHeight = function() {
    return this.minHeight_;
};



/**
 * @private
 */
moka.ui.Resizeable.prototype.setMinHeight = function(height) {
    this.minHeight_ = height;
};



/**
 * @private
 */
moka.ui.Resizeable.prototype.getMaxHeight = function() {
    return this.maxHeight_;
};



/**
 * @private
 */
moka.ui.Resizeable.prototype.setMaxHeight = function(height) {
    this.maxHeight_ = height;
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
 * @public
 */
moka.ui.Resizeable.prototype.getGhostElement = function() {
    return this.ghostEl_;
};


/** @inheritDoc */
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
};
