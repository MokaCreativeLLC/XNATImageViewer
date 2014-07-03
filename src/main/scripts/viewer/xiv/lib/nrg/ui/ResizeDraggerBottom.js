/**
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 * @author unkown email (uchida)
 */

// goog
goog.require('goog.style');
goog.require('goog.math.Rect');
goog.require('goog.math.Coordinate');

// nrg
goog.require('nrg.ui.ResizeDragger');




/**
 * @constructor
 * @extends {nrg.ui.ResizeDragger}
 * @param {!Element} resizee The element that will be resized.
 */
goog.provide('nrg.ui.ResizeDraggerBottom');
nrg.ui.ResizeDraggerBottom = function(resizee) {
    goog.base(this, 'right', resizee);
};
goog.inherits(nrg.ui.ResizeDraggerBottom, nrg.ui.ResizeDragger);
goog.exportSymbol('nrg.ui.ResizeDraggerBottom', nrg.ui.ResizeDraggerBottom);



/**
 * @type {!string} 
 * @const
 */
nrg.ui.ResizeDraggerBottom.ID_PREFIX =  'nrg.ui.ResizeDraggerBottom';



/**
 * @enum {string} 
 * @const
 */ 
nrg.ui.ResizeDraggerBottom.CSS_SUFFIX = {}



/**
 * @public
 */
nrg.ui.ResizeDraggerBottom.calculateDraggerLimits = function() {
    this.draggerLimitTop = this.resizeePos.top + this.minSize.height +
	this.vertDraggerOffset;

    this.draggerLimitBottom = this.boundaryPos.bottom + this.vertDraggerOffset;
    this.draggerLimitHeight = this.draggerLimitBottom - this.draggerLimitTop;
}
goog.exportSymbol('nrg.ui.ResizeDraggerBottom.calculateDraggerLimits', 
		  nrg.ui.ResizeDraggerBottom.calculateDraggerLimits)




/**
 * @public
 */
nrg.ui.ResizeDraggerBottom.resizeMethod = function() {
    var deltaY = this.handlePos.y - this.resizeePos.bottom; 
    var height = this.resizeeSize.height + deltaY;
    //window.console.log("DELTA Y", deltaY);
    goog.style.setHeight(this.resizee, Math.max(height, 
	this.minSize.height));
}
goog.exportSymbol('nrg.ui.ResizeDraggerBottom.resizeMethod', 
		  nrg.ui.ResizeDraggerBottom.resizeMethod);




/**
 * @public
 */ 
nrg.ui.ResizeDraggerBottom.prototype.update = function() {
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
nrg.ui.ResizeDraggerBottom.prototype.getSlideTrajectory = function(limitType) {
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
