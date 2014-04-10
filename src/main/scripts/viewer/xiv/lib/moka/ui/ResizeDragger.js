/**
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 * @author unkown email (uchida)
 */

// goog


// moka
goog.require('moka.ui.Component');




/**
 * @param {!string} direction The resize direction of the dragger.
 * @param {!Element} resizeElt The element to be be resized.
 * @extends {moka.ui.Component}
 */
goog.provide('goog.ui.ResizeDragger');
goog.provide('goog.ui.ResizeDragger.EventType');
moka.ui.ResizeDragger = function(direction, resizeElt) {
    if (!goog.isDefAndNotNull(direction)){
	throw new Error ('Invalid direction for ResizeDragger: ' + direction);
    }
    goog.base(this);


    /**
     * @type {!string}
     * @private
     */
    this.direction_ = direction;


    /**
     * @type {!Element}
     * @protected
     */
    this.resizeElt = resizeElt

    
    /**
     * @type {!goog.fx.Dragger}
     * @private
     */
    this.Dragger_ =  new goog.fx.Dragger(this.getElement());


    /**
     * @type {Object}
     * @protected
     */
    this.handleDims = {
	W: null,
	H: null,
	X: null,
	Y: null
    }


    //
    // Set events.
    //
    this.setEvents_();
};
goog.inherits(moka.ui.ResizeDragger, moka.ui.Component);
goog.exportSymbol('moka.ui.ResizeDragger', moka.ui.ResizeDragger);



/**
 * @struct
 */
moka.ui.ResizeDragger.UpdateDims = 
function(resizeElt, resizeBoundaryElt, minWidth, minHeight, limits) {
    var eltPos = goog.style.getPosition(resizeElt);
    var eltSize = goog.style.getSize(resizeElt);
    var boundaryPos = goog.style.getPosition(resizeBoundaryElt);
    var boundarySize = goog.style.getSize(resizeBoundaryElt);

    this.X_MIN = eltPos.x + minWidth;
    this.X_MAX = boundarySize.width - this.X_MIN;

    this.Y_MIN = eltPos.y + minHeight;
    this.Y_MAX = boundarySize.height - this.Y_MIN;
    
    this.ELEMENT = {
	W: eltSize.width,
	H: eltSize.height,
	X: eltPos.x,
	Y: eltPos.y
    }

    this.BOUNDARY = {
	W: boundarySize.width,
	H: boundarySize.height,
	X: boundaryPos.x,
	Y: boundaryPos.y
    }   
}




/**
 * @enum {string}
 * @public
 */
moka.ui.ResizeDragger.EventType = {
    RESIZE: 'resize',
    RESIZE_START: 'start_resize',
    RESIZE_END: 'end_resize'
};



/**
 * @type {!string} 
 * @const
 */
moka.ui.ResizeDragger.ID_PREFIX =  'moka.ui.ResizeDragger';



/**
 * @enum {string} 
 * @const
 */ 
moka.ui.ResizeDragger.CSS_SUFFIX = {
   
}


/**
 * @return {!goog.fx.Dragger}
 * @public
 */ 
moka.ui.ResizeDragger.prototype.getDragger = function() {
    return this.Dragger_;
}


/**
 * @return {!goog.fx.Dragger}
 * @public
 */ 
moka.ui.ResizeDragger.prototype.getDirection = function() {
    return this.direction_;
}



/**
 * @return {!Element}
 * @public
 */ 
moka.ui.ResizeDragger.prototype.getHandle = function() {
    return this.getElement();
}




/**
 * @param {!goog.math.Rect} limits
 * @public
 */ 
moka.ui.ResizeDragger.prototype.setLimits = function(limits) {
    return this.Dragger_.setLimits(limits)
}



/**
 * @param {!goog.fx.Dragger} dragger
 * @private
 */
moka.ui.ResizeDragger.prototype.setEvents_ = function(dragger) {
    // START
    goog.events.listen(this.Dragger_, goog.fx.Dragger.EventType.START, 
		       this.onResizeStart.bind(this));
    // DRAG
    goog.events.listen(this.Dragger_, goog.fx.Dragger.EventType.DRAG, 
		       this.onResize.bind(this));
    // END
    goog.events.listen(this.Dragger_, goog.fx.Dragger.EventType.END, 
		       this.onResizeEnd.bind(this));
};



/**
 * @param {Event} e
 * @protected
 */
moka.ui.ResizeDragger.prototype.onResizeStart = function(e) {
    this.dispatchEvent({
	type: moka.ui.ResizeDragger.EventType.RESIZE_START
    })
}


/**
 * @param {Event} e
 * @protected
 */
moka.ui.ResizeDragger.prototype.onResize = function(e) {
    window.console.log("RESIZING!!!!!");
    this.updateHandleDims();
    this.dispatchEvent({
	type: moka.ui.ResizeDragger.EventType.RESIZE
    })
}


/**
 * @param {Event} e
 * @protected
 */
moka.ui.ResizeDragger.prototype.onResizeEnd = function(e) {
    this.dispatchEvent({
	type: moka.ui.ResizeDragger.EventType.RESIZE_END
    })

}



/**
 * @protected
 */ 
moka.ui.ResizeDragger.prototype.updateHandleDims = function() {
    var handle = this.getElement();
    var handlePos = goog.style.getComputedPosition(handle);

    if (!goog.isDefAndNotNull(handlePos.X)){
	handlePos = goog.style.getPosition(handle);
    }
    this.handleDims.W = parseInt(moka.style.getComputedStyle(handle, 'width'));
    this.handleDims.H = parseInt(moka.style.getComputedStyle(handle, 'height'));
    this.handleDims.X = handlePos.x;
    this.handleDims.Y = handlePos.y; 
}



/**
 * @param {moka.ui.ResizeDrager.UpdateDims=} opt_updateDims
 * @public
 */ 
moka.ui.ResizeDragger.prototype.update = function(opt_updateDims) {
    this.updateHandleDims();
}





/**
 * @private
 */ 
moka.ui.ResizeDragger.prototype.disposeInternal = function() {

    // The resize elt
    delete this.resizeElt;

    // handle dims
    goog.object.clear(this.handleDims);
    delete this.handleDims;

    // The dragger handle
    goog.dom.remove(this.Dragger_.handle);
    this.Dragger_.handle = null;
    
    // The dragger
    goog.events.removeAll(this.Dragger_);
    this.Dragger_.dispose();
    delete this.Dragger_;

    // direction
    delete this.direction_;
}
