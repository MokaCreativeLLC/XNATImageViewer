/**
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 * @author unkown email (uchida)
 */

// goog


// moka
goog.require('moka.ui.ResizeDragger');




/**
 * @constructor
 * @extends {moka.ui.ResizeDragger}
 * @param {!Element} resizeElt The element that will be resized.
 */
goog.provide('goog.ui.ResizeDraggerBottom');
moka.ui.ResizeDraggerBottom = function(resizeElt) {
    goog.base(this, 'right', resizeElt);
};
goog.inherits(moka.ui.ResizeDraggerBottom, moka.ui.ResizeDragger);
goog.exportSymbol('moka.ui.ResizeDraggerBottom', moka.ui.ResizeDraggerBottom);



/**
 * @type {!string} 
 * @const
 */
moka.ui.ResizeDraggerBottom.ID_PREFIX =  'moka.ui.ResizeDraggerBottom';



/**
 * @enum {string} 
 * @const
 */ 
moka.ui.ResizeDraggerBottom.CSS_SUFFIX = {}



/**
 * @public
 */
moka.ui.ResizeDraggerBottom.calculateDraggerLimits = function() {
    this.draggerLimitTop = this.resizeePos.top + this.minSize.height +
	this.vertDraggerOffset;

    this.draggerLimitBottom = this.boundaryPos.bottom + this.vertDraggerOffset;
    this.draggerLimitHeight = this.draggerLimitBottom - this.draggerLimitTop;
}
goog.exportSymbol('moka.ui.ResizeDraggerBottom.calculateDraggerLimits', 
		  moka.ui.ResizeDraggerBottom.calculateDraggerLimits)




/**
 * @public
 */
moka.ui.ResizeDraggerBottom.resizeMethod = function() {
    var deltaY = this.handlePos.y - this.resizeePos.bottom; 
    var height = this.resizeeSize.height + deltaY;
    window.console.log("DELTA Y", deltaY);

    goog.style.setHeight(this.resizeElt, Math.max(height, 
	this.minSize.height));
}
goog.exportSymbol('moka.ui.ResizeDraggerBottom.resizeMethod', 
		  moka.ui.ResizeDraggerBottom.resizeMethod);




/**
 * @public
 */ 
moka.ui.ResizeDraggerBottom.prototype.update = function() {
    //
    // Do nothing if dragging.
    //
    if (this.Dragger.isDragging() || this.isAnimating) { return };


    //
    // Parent updateDims
    //
    goog.base(this, 'update');


    //
    // Reset limits
    //
    this.Dragger.setLimits(new goog.math.Rect(
	this.boundaryPos.x, 
	this.draggerLimitTop, 
	0, 
	this.draggerLimitBottom 
    ))

    //
    // Set the top
    //
    goog.style.setPosition(this.getElement(), this.resizeePos.x,
	this.resizeePos.bottom + this.vertDraggerOffset);
}




/**
 * inheritDoc
 */
moka.ui.ResizeDraggerBottom.prototype.getSlideTrajectory = function(limitType) {
    goog.base(this, 'getSlideTrajectory');

    return {
	//
	// Start coordinate is the same
	//
	start: new goog.math.Coordinate(this.handlePos.x, this.handlePos.y),

	//
	// End coordinate
	//
	end: (limitType == 'MIN') ? 
	    new goog.math.Coordinate(
		this.handlePos.x,
		this.draggerLimitTop) :
	    new goog.math.Coordinate(
		this.handlePos.x,
		this.draggerLimitBottom)
    }
}
