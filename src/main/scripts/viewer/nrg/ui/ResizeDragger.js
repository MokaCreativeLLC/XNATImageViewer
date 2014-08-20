/**
 * @author kumar.sunil.p@gmail.com (Sunil Kumar)
 */
goog.provide('nrg.ui.ResizeDragger');
goog.provide('nrg.ui.ResizeDragger.EventType');

// goog
goog.require('goog.fx.Dragger');
goog.require('goog.math.Coordinate');
goog.require('goog.math.Size');
goog.require('goog.math.Rect');
goog.require('goog.style');
goog.require('goog.object');
goog.require('goog.events');
goog.require('goog.events.Event');
goog.require('goog.fx.dom.Slide');
goog.require('goog.fx.easing');
goog.require('goog.dom');

// nrg
goog.require('nrg.ui.Component');




/**
 * @param {!string} direction The resize direction of the dragger.
 * @param {!Element} resizee The element to be be resized.
 * @extends {nrg.ui.Component}
 * @constructor
 */
nrg.ui.ResizeDragger = function(direction, resizee) {
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
    this.resizee = resizee;


    /**
     * @type {?Element}
     * @protected
     */
    this.boundaryElt = null;

    
    /**
     * @type {!goog.fx.Dragger}
     * @protected
     */
    this.Dragger =  new goog.fx.Dragger(this.getElement());



    //
    // Set events.
    //
    this.setEvents_();
};
goog.inherits(nrg.ui.ResizeDragger, nrg.ui.Component);
goog.exportSymbol('nrg.ui.ResizeDragger', nrg.ui.ResizeDragger);



/**
 * @enum {string}
 * @public
 */
nrg.ui.ResizeDragger.EventType = {
    RESIZE: 'resize',
    RESIZE_START: 'start_resize',
    RESIZE_END: 'end_resize'
};



/**
 * @type {!string} 
 * @const
 */
nrg.ui.ResizeDragger.ID_PREFIX =  'nrg.ui.ResizeDragger';



/**
 * @enum {string} 
 * @expose
 */ 
nrg.ui.ResizeDragger.CSS_SUFFIX = {}



/**
 * @type {!number} 
 * @const
 */
nrg.ui.ResizeDragger.ANIM_MED = 500;



/**
 * @type {?number}
 * @protected
 */
nrg.ui.ResizeDragger.prototype.vertDraggerOffset = null;



/**
 * @type {?number}
 * @protected
 */
nrg.ui.ResizeDragger.prototype.horizDraggerOffset = null;


/**
 * @type {?number}
 * @protected
 */
nrg.ui.ResizeDragger.prototype.draggerLimitLeft = null;


/**
 * @type {?number}
 * @protected
 */
nrg.ui.ResizeDragger.prototype.draggerLimitRight = null;


/**
 * @type {?number}
 * @protected
 */
nrg.ui.ResizeDragger.prototype.draggerLimitTop = null;


/**
 * @type {?number}
 * @protected
 */
nrg.ui.ResizeDragger.prototype.draggerLimitBottom = null;


/**
 * @type {?number}
 * @protected
 */
nrg.ui.ResizeDragger.prototype.draggerLimitWidth = null;


/**
 * @type {?number}
 * @protected
 */
nrg.ui.ResizeDragger.prototype.draggerLimitHeight = null;



/**
 * @type {!number}
 * @protected
 */
nrg.ui.ResizeDragger.prototype.offsetX = 0;



/**
 * @param {!number}
 * @public
 */
nrg.ui.ResizeDragger.prototype.setOffsetX = function(num) {
    this.offsetX = num;
};



/**
 * @type {!number}
 * @protected
 */
nrg.ui.ResizeDragger.prototype.offsetY = 0;



/**
 * @param {!number}
 * @public
 */
nrg.ui.ResizeDragger.prototype.setOffsetY = function(num) {
    this.offsetY = num;
};



/**
 * @type {?goog.math.Coordinate}
 * @public
 */
nrg.ui.ResizeDragger.prototype.handlePos = null;



/**
 * @type {?goog.math.Size}
 * @public
 */
nrg.ui.ResizeDragger.prototype.handleSize = null;



/**
 * @type {?goog.math.Coordinate}
 * @public
 */
nrg.ui.ResizeDragger.prototype.resizeePos = null;



/**
 * @type {?goog.math.Size}
 * @public
 */
nrg.ui.ResizeDragger.prototype.resizeeSize = null;



/**
 * @type {?goog.math.Coordinate}
 * @public
 */
nrg.ui.ResizeDragger.prototype.boundaryPos = null;


/**
 * @type {?goog.math.Size}
 * @public
 */
nrg.ui.ResizeDragger.prototype.boundarySize = null;



/**
 * @type {!boolean|
 * @protected
 */ 
nrg.ui.ResizeDragger.prototype.isAnimating = false;



/**
 * @type {?goog.math.Size}
 * @protected
 */
nrg.ui.ResizeDragger.prototype.minSize = new goog.math.Size(10,10);



/**
 * @return {!goog.math.Rect} 
 * @public
 */
nrg.ui.ResizeDragger.prototype.getBoundaryElement = function() {
    return this.boundaryElt;
};




/**
 * @param {!Element} elt The boundary Element.
 * @public
 */
nrg.ui.ResizeDragger.prototype.setBoundaryElement = function(elt) {
    this.boundaryElt = elt;
};



/**
 * @return {!goog.fx.Dragger}
 * @public
 */ 
nrg.ui.ResizeDragger.prototype.getDragger = function() {
    return this.Dragger;
};



/**
 * @return {!goog.fx.Dragger}
 * @public
 */ 
nrg.ui.ResizeDragger.prototype.getDirection = function() {
    return this.direction_;
};



/**
 * @return {!Element}
 * @public
 */ 
nrg.ui.ResizeDragger.prototype.getHandle = function() {
    return this.getElement();
}



/**
 * @public
 */
nrg.ui.ResizeDragger.prototype.updateTrackingValues = function() {
    //
    // Handle
    //
    this.handleSize = goog.style.getSize(this.getElement());
    this.handlePos = goog.style.getPosition(this.getElement());

    //
    // Offsets
    //
    this.vertDraggerOffset = -1 * this.handleSize.height/2 + this.offsetY;
    this.horizDraggerOffset = -1 * this.handleSize.width/2 + this.offsetX;

    //
    // We don't want to conduct resizee and boundary calculations
    // when dragging
    //
    if (this.Dragger.isDragging() || this.isAnimating) { return };

    //
    // Resizee Position
    //
    this.resizeePos = goog.object.clone(goog.style.getPosition(this.resizee));

    //
    // Resizee Size
    //
    this.resizeeSize = goog.object.clone(goog.style.getSize(this.resizee));

    //
    // Customizations
    //
    this.resizeePos.left = this.resizeePos.x;
    this.resizeePos.top = this.resizeePos.y;
    this.resizeePos.right = this.resizeePos.x + this.resizeeSize.width;
    this.resizeePos.bottom = this.resizeePos.y + this.resizeeSize.height;

    //
    // Boundary Position
    //
    this.boundaryPos = goog.object.clone(
	goog.style.getPosition(this.boundaryElt));

    //
    // Boundary Size
    //
    this.boundarySize = goog.object.clone(
	goog.style.getSize(this.boundaryElt)); 
    // Customizations
    this.boundaryPos.left = this.boundaryPos.x;
    this.boundaryPos.top = this.boundaryPos.y;
    this.boundaryPos.right = this.boundaryPos.x + this.boundarySize.width;
    this.boundaryPos.bottom = this.boundaryPos.y + this.boundarySize.height;


    //
    // Calculate dragger limits specific to the dragger
    //
    if (this.calculateDraggerLimits) {
	this.calculateDraggerLimits(this);
    }
}




/**
 * @param {!goog.math.Size} minSize
 * @public
 */ 
nrg.ui.ResizeDragger.prototype.setMinSize = function(minSize) {
    return this.minSize = minSize
}



/**
 * @param {!goog.fx.Dragger} dragger
 * @private
 */
nrg.ui.ResizeDragger.prototype.setEvents_ = function(dragger) {
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
nrg.ui.ResizeDragger.prototype.onResizeStart = function(e) {
    //goog.events.Event.stopPropagation(e);
    this.dispatchEvent({
	type: nrg.ui.ResizeDragger.EventType.RESIZE_START
    })
}


/**
 * @param {Event} e
 * @protected
 */
nrg.ui.ResizeDragger.prototype.onResize = function(e) {
    this.updateTrackingValues();
    //goog.events.Event.stopPropagation(e);
    this.dispatchEvent({
	type: nrg.ui.ResizeDragger.EventType.RESIZE,
	resizeePosition: this.resizeePos,
	resizeeSize: this.resizeeSize,
	boundaryPosition: this.boundaryPos,
	boundarySize: this.boundarySize,
    })

    //
    // Call resize method
    //
    if (goog.isDefAndNotNull(this.resizeMethod)) {
	this.resizeMethod();
    }
}



/**
 * @param {Event} e
 * @public
 */
nrg.ui.ResizeDragger.prototype.onResizeEnd = function(e) {
    //goog.events.Event.stopPropagation(e);
    this.dispatchEvent({
	type: nrg.ui.ResizeDragger.EventType.RESIZE_END
    })
}



/**
 * @public
 */ 
nrg.ui.ResizeDragger.prototype.update = function() {
    //
    // Don't update if we're dragging.
    //
    if (this.Dragger.isDragging() ||  this.isAnimating) {return};

    //
    // Otherwise update.
    //
    this.updateTrackingValues();
}



/**
 * Generates a trajectory for the dragger to slide to.
 * 
 * @param {!string} limitType Eiether 'MAX' or 'MIN' strings.  NOTE: 
 *    MAX and MIN do not refer to cartesian coordinates, but are relative
 *    to the dragger.  For instance, for ResizeDraggerLeft, MAX would entail
 *    the farthest left coordinate of the boundary.
 * @return {!Object.<string, goog.math.Coordinate>}
 * @protected
 */
nrg.ui.ResizeDragger.prototype.getSlideTrajectory = function(limitType) {
    // do nothing for now...should be inherited by the sub-classes.
}




/**
 * @param {!string} limitType The limit type ('MAX' or 'MIN').
 * @param {Function=} opt_callback The optional callback on completion.
 * @param {number=} opt_dur The optional duration.  Defaults to 
 *     nrg.ui.ResizeDragger.ANIM_MED.
 * @public
 */
nrg.ui.ResizeDragger.prototype.slideToLimits = 
function(limitType, opt_callback, opt_dur) {
    this.updateTrackingValues();
    var traj = this.getSlideTrajectory(limitType); 

    if (goog.isNumber(opt_dur) && opt_dur === 0) {
	//goog.style.setStyle(this.getElement(), traj.end);
	goog.style.setPosition(this.getElement(), traj.end);
	this.onResize();
	this.onResizeEnd();
	return;
    }
    this.createSlideAnim_(traj.start, traj.end, opt_callback, opt_dur);
    //window.console.log("\n\n\n\nSET EXPANDED!!!!", traj, opt_dur);
}


/**
 * @public
 */ 
nrg.ui.ResizeDragger.prototype.stopSlideAnimation = function(){
    if (goog.isDefAndNotNull(this.slideAnim_)){
	this.slideAnim_.stop();
	this.onResize();
	this.onResizeEnd();
    }
}




/**
 * @param {!goog.math.Coordinate} startPos The start position.
 * @param {!goog.math.Coordinate} endPos The end position.
 * @param {Function=} opt_callback The optional callback on completion.
 * @param {number=} opt_dur The optional duration.  Defaults to 
 *     nrg.ui.ResizeDragger.ANIM_MED.
 * @private
 */ 
nrg.ui.ResizeDragger.prototype.createSlideAnim_ = 
function(startPos, endPos, opt_callback, opt_dur) {
    //
    // The anim
    // 
    this.slideAnim_ = new goog.fx.dom.Slide(this.getElement(), 
	    [startPos.x, startPos.y], [endPos.x, endPos.y], 
	    goog.isNumber(opt_dur) ? opt_dur : 
	        nrg.ui.ResizeDragger.ANIM_MED, goog.fx.easing.easeOut);    

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

	this.slideAnim_.dispose();
	goog.events.removeAll(this.slideAnim_);
	this.slideAnim_.destroy();
	this.slideAnim_ = null;

	//
	// Set the end position, just to be on the save side.
	//
	goog.style.setPosition(this.getElement(), endPos);

	//window.console.log("RESIZEE END", 
	//		   this.resizeePos, 
	//		   this.resizeeSize,
	//		   this.boundarySize,
	//		   this.getElement().style.left);

	this.onResizeEnd();
	if (opt_callback) {opt_callback()};
    }.bind(this));


    //
    // PLAY
    //
    this.slideAnim_.play();    
}



/**
 * @private
 */ 
nrg.ui.ResizeDragger.prototype.disposeInternal = function() {
    // offset
    delete this.offsetX_;
    delete this.offsetY_;

    delete this.horizDraggerOffset;
    delete this.draggerLimitLeft;
    delete this.draggerLimitRight;
    delete this.draggerLimitTop;
    delete this.draggerLimitBottom;
    delete this.draggerLimitWidth;
    delete this.draggerLimitHeight;


    // isAnimating
    delete this.isAnimating;

    // Minimum size
    goog.object.clear(this.minSize);
    delete this.minSize;
    
    // The resize elt
    delete this.resizee;

    // The boundary elt
    delete this.boundaryElt;

    // update dims
    goog.object.clear(this.handlePos);
    delete this.handlePos;
    goog.object.clear(this.handleSize);
    delete this.handleSize;
    goog.object.clear(this.resizeePos);
    delete this.resizeePos;
    goog.object.clear(this.resizeeSize);
    delete this.resizeeSize;
    goog.object.clear(this.boundaryPos);
    delete this.boundaryPos;
    goog.object.clear(this.boundarySize);
    delete this.boundarySize;
    

    // The dragger handle
    goog.dom.removeNode(this.Dragger.handle);
    this.Dragger.handle = null;
    
    // The dragger
    goog.events.removeAll(this.Dragger);
    this.Dragger.dispose();
    delete this.Dragger;

    // direction
    delete this.direction_;
}




goog.exportSymbol('nrg.ui.ResizeDragger.EventType',
	nrg.ui.ResizeDragger.EventType);
goog.exportSymbol('nrg.ui.ResizeDragger.ID_PREFIX',
	nrg.ui.ResizeDragger.ID_PREFIX);
goog.exportSymbol('nrg.ui.ResizeDragger.CSS_SUFFIX',
	nrg.ui.ResizeDragger.CSS_SUFFIX);
goog.exportSymbol('nrg.ui.ResizeDragger.ANIM_MED',
	nrg.ui.ResizeDragger.ANIM_MED);
goog.exportSymbol('nrg.ui.ResizeDragger.prototype.vertDraggerOffset',
	nrg.ui.ResizeDragger.prototype.vertDraggerOffset);
goog.exportSymbol('nrg.ui.ResizeDragger.prototype.horizDraggerOffset',
	nrg.ui.ResizeDragger.prototype.horizDraggerOffset);
goog.exportSymbol('nrg.ui.ResizeDragger.prototype.draggerLimitLeft',
	nrg.ui.ResizeDragger.prototype.draggerLimitLeft);
goog.exportSymbol('nrg.ui.ResizeDragger.prototype.draggerLimitRight',
	nrg.ui.ResizeDragger.prototype.draggerLimitRight);
goog.exportSymbol('nrg.ui.ResizeDragger.prototype.draggerLimitTop',
	nrg.ui.ResizeDragger.prototype.draggerLimitTop);
goog.exportSymbol('nrg.ui.ResizeDragger.prototype.draggerLimitBottom',
	nrg.ui.ResizeDragger.prototype.draggerLimitBottom);
goog.exportSymbol('nrg.ui.ResizeDragger.prototype.draggerLimitWidth',
	nrg.ui.ResizeDragger.prototype.draggerLimitWidth);
goog.exportSymbol('nrg.ui.ResizeDragger.prototype.draggerLimitHeight',
	nrg.ui.ResizeDragger.prototype.draggerLimitHeight);
goog.exportSymbol('nrg.ui.ResizeDragger.prototype.offsetX',
	nrg.ui.ResizeDragger.prototype.offsetX);
goog.exportSymbol('nrg.ui.ResizeDragger.prototype.setOffsetX',
	nrg.ui.ResizeDragger.prototype.setOffsetX);
goog.exportSymbol('nrg.ui.ResizeDragger.prototype.offsetY',
	nrg.ui.ResizeDragger.prototype.offsetY);
goog.exportSymbol('nrg.ui.ResizeDragger.prototype.setOffsetY',
	nrg.ui.ResizeDragger.prototype.setOffsetY);
goog.exportSymbol('nrg.ui.ResizeDragger.prototype.handlePos',
	nrg.ui.ResizeDragger.prototype.handlePos);
goog.exportSymbol('nrg.ui.ResizeDragger.prototype.handleSize',
	nrg.ui.ResizeDragger.prototype.handleSize);
goog.exportSymbol('nrg.ui.ResizeDragger.prototype.resizeePos',
	nrg.ui.ResizeDragger.prototype.resizeePos);
goog.exportSymbol('nrg.ui.ResizeDragger.prototype.resizeeSize',
	nrg.ui.ResizeDragger.prototype.resizeeSize);
goog.exportSymbol('nrg.ui.ResizeDragger.prototype.boundaryPos',
	nrg.ui.ResizeDragger.prototype.boundaryPos);
goog.exportSymbol('nrg.ui.ResizeDragger.prototype.boundarySize',
	nrg.ui.ResizeDragger.prototype.boundarySize);
goog.exportSymbol('nrg.ui.ResizeDragger.prototype.isAnimating',
	nrg.ui.ResizeDragger.prototype.isAnimating);
goog.exportSymbol('nrg.ui.ResizeDragger.prototype.minSize',
	nrg.ui.ResizeDragger.prototype.minSize);
goog.exportSymbol('nrg.ui.ResizeDragger.prototype.getBoundaryElement',
	nrg.ui.ResizeDragger.prototype.getBoundaryElement);
goog.exportSymbol('nrg.ui.ResizeDragger.prototype.setBoundaryElement',
	nrg.ui.ResizeDragger.prototype.setBoundaryElement);
goog.exportSymbol('nrg.ui.ResizeDragger.prototype.getDragger',
	nrg.ui.ResizeDragger.prototype.getDragger);
goog.exportSymbol('nrg.ui.ResizeDragger.prototype.getDirection',
	nrg.ui.ResizeDragger.prototype.getDirection);
goog.exportSymbol('nrg.ui.ResizeDragger.prototype.getHandle',
	nrg.ui.ResizeDragger.prototype.getHandle);
goog.exportSymbol('nrg.ui.ResizeDragger.prototype.updateTrackingValues',
	nrg.ui.ResizeDragger.prototype.updateTrackingValues);
goog.exportSymbol('nrg.ui.ResizeDragger.prototype.setMinSize',
	nrg.ui.ResizeDragger.prototype.setMinSize);
goog.exportSymbol('nrg.ui.ResizeDragger.prototype.onResizeStart',
	nrg.ui.ResizeDragger.prototype.onResizeStart);
goog.exportSymbol('nrg.ui.ResizeDragger.prototype.onResize',
	nrg.ui.ResizeDragger.prototype.onResize);
goog.exportSymbol('nrg.ui.ResizeDragger.prototype.onResizeEnd',
	nrg.ui.ResizeDragger.prototype.onResizeEnd);
goog.exportSymbol('nrg.ui.ResizeDragger.prototype.update',
	nrg.ui.ResizeDragger.prototype.update);
goog.exportSymbol('nrg.ui.ResizeDragger.prototype.getSlideTrajectory',
	nrg.ui.ResizeDragger.prototype.getSlideTrajectory);
goog.exportSymbol('nrg.ui.ResizeDragger.prototype.stopSlideAnimation',
	nrg.ui.ResizeDragger.prototype.stopSlideAnimation);
goog.exportSymbol('nrg.ui.ResizeDragger.prototype.slideToLimits',
	nrg.ui.ResizeDragger.prototype.slideToLimits);
goog.exportSymbol('nrg.ui.ResizeDragger.prototype.disposeInternal',
	nrg.ui.ResizeDragger.prototype.disposeInternal);
