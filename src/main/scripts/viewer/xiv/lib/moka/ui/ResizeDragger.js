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
     * @protected
     */
    this.Dragger =  new goog.fx.Dragger(this.getElement());


    /**
     * @type {?goog.math.Size}
     * @protected
     */
    this.minSize = null;


    /**
     * @type {?moka.ui.ResizeDragger.UpdateDims}
     * @protected
     */
    this.UpdateDims = null;


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
moka.ui.ResizeDragger.UpdateDims = function(resizeElt, resizeBoundaryElt) {
    var eltPos = goog.style.getPosition(resizeElt);
    var eltSize = goog.style.getSize(resizeElt);
    var boundaryPos = goog.style.getPosition(resizeBoundaryElt);
    var boundarySize = goog.style.getSize(resizeBoundaryElt);
    
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
 * @type {!number} 
 * @const
 */
moka.ui.ResizeDragger.ANIM_MED = 500;



/**
 * @type {!boolean|
 * @protected
 */ 
moka.ui.ResizeDragger.prototype.isAnimating = false;



/**
 * @return {!goog.fx.Dragger}
 * @public
 */ 
moka.ui.ResizeDragger.prototype.getDragger = function() {
    return this.Dragger;
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
 * @param {!goog.math.Size} minSize
 * @public
 */ 
moka.ui.ResizeDragger.prototype.setMinSize = function(minSize) {
    return this.minSize = minSize
}




/**
 * @param {!goog.math.Rect} limits
 * @public
 */ 
moka.ui.ResizeDragger.prototype.setLimits = function(limits) {
    return this.Dragger.setLimits(limits)
}



/**
 * @param {!goog.fx.Dragger} dragger
 * @private
 */
moka.ui.ResizeDragger.prototype.setEvents_ = function(dragger) {
    // START
    goog.events.listen(this.Dragger, goog.fx.Dragger.EventType.START, 
		       this.onResizeStart.bind(this));
    // DRAG
    goog.events.listen(this.Dragger, goog.fx.Dragger.EventType.DRAG, 
		       this.onResize.bind(this));
    // END
    goog.events.listen(this.Dragger, goog.fx.Dragger.EventType.END, 
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
    //window.console.log(this.getElement());
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

    window.console.log("UPDATE RESZE DRAGGER", 
		       this.Dragger.isDragging() ,  this.isAnimating);
    //
    // Don't update if we're dragging.
    //
    if (this.Dragger.isDragging() ||  this.isAnimating) {return};

    //
    // Otherwise update.
    //
    this.updateHandleDims();
    this.UpdateDims = goog.isDefAndNotNull(opt_updateDims) ?
	opt_updateDims : this.UpdateDims;
}




/**
 * @param {!string} limitType The limit type ('MAX' or 'MIN').
 * @param {Function=} opt_callback The optional callback on completion.
 * @param {number=} opt_dur The optional duration.  Defaults to 
 *     moka.ui.Resizable.ANIM_MED.
 * @public
 */
moka.ui.ResizeDragger.prototype.slideToLimits = 
function(limitType, opt_callback, opt_dur) {
    this.updateHandleDims();
    var traj = this.getSlideTrajectory_(limitType); 
    this.createSlideAnim_(traj.start, traj.end, opt_callback, opt_dur);
}


/**
 * @param {!goog.math.Coordinate} startPos The start position.
 * @param {!goog.math.Coordinate} endPos The end position.
 * @param {Function=} opt_callback The optional callback on completion.
 * @param {number=} opt_dur The optional duration.  Defaults to 
 *     moka.ui.Resizable.ANIM_MED.
 * @private
 */ 
moka.ui.ResizeDragger.prototype.createSlideAnim_ = 
function(startPos, endPos, opt_callback, opt_dur) {
    //
    // The anim
    // 
    this.slideAnim_ = 
	new goog.fx.dom.Slide(this.getElement(), 
	    [startPos.x, startPos.y], [endPos.x, endPos.y], 
             opt_dur || moka.ui.ResizeDragger.ANIM_MED, 
			      goog.fx.easing.easeOut);    

    //
    // onAnimate START
    //
    goog.events.listen(this.slideAnim_, goog.fx.Animation.EventType.BEGIN, 
        function() {
	    this.isAnimating = true;
	    this.onResizeStart();
	}.bind(this));

    //
    // onAnimate
    //
    goog.events.listen(this.slideAnim_, goog.fx.Animation.EventType.ANIMATE, 
	this.onResize.bind(this));

    //
    // onAnimate END
    //
    goog.events.listen(this.slideAnim_, goog.fx.Animation.EventType.END, 
    function(e){
	this.isAnimating = false;
	this.onResizeEnd();
	if (opt_callback) {opt_callback()};
	this.slideAnim_.disposeInternal();
	goog.events.removeAll(this.slideAnim_);
	this.slideAnim_.destroy();
	this.slideAnim_ = null;
    }.bind(this));


    //
    // PLAY
    //
    this.slideAnim_.play();    
}



/**
 * @private
 */ 
moka.ui.ResizeDragger.prototype.disposeInternal = function() {

    // isAnimating
    delete this.isAnimating;

    // Minimum size
    goog.object.clear(this.minSize);
    delete this.minSize;
    
    // The resize elt
    delete this.resizeElt;

    // handle dims
    goog.object.clear(this.handleDims);
    delete this.handleDims;
    
    // update dims
    goog.object.clear(this.UpdateDims);
    window.console.log("UPDATE DIMS DISPOSE", this.UpdateDims);
    delete this.UpdateDims;
    

    // The dragger handle
    goog.dom.remove(this.Dragger.handle);
    this.Dragger.handle = null;
    
    // The dragger
    goog.events.removeAll(this.Dragger);
    this.Dragger.dispose();
    delete this.Dragger;

    // direction
    delete this.direction_;
}
