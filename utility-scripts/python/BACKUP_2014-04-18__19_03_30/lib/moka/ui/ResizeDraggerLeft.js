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
 * @param {!Element} resizee The element that will be resized.
 */
goog.provide('goog.ui.ResizeDraggerLeft');
moka.ui.ResizeDraggerLeft = function(resizee) {
    goog.base(this, 'right', resizee);
};
goog.inherits(moka.ui.ResizeDraggerLeft, moka.ui.ResizeDragger);
goog.exportSymbol('moka.ui.ResizeDraggerLeft', moka.ui.ResizeDraggerLeft);



/**
 * @type {!string} 
 * @const
 */
moka.ui.ResizeDraggerLeft.ID_PREFIX =  'moka.ui.ResizeDraggerLeft';



/**
 * @enum {string} 
 * @const
 */ 
moka.ui.ResizeDraggerLeft.CSS_SUFFIX = {}


/**
 * @public
 */
moka.ui.ResizeDraggerLeft.resizeMethod = function() {

    //
    // Resize
    //
    goog.style.setWidth(this.resizee, Math.min(
	// At least minwidth
	Math.max(this.resizeeSize.width + 
		 // deltaX
		 (this.resizeePos.x - this.handlePos.x), 
		 this.minSize.width),
	// At max the boundary width
	this.boundarySize.width))
    

    //
    // For safety, make sure handle is the same top as the element
    //
    goog.style.setPosition(this.getElement(), this.handlePos.x,
			   this.resizeePos.y)
}
goog.exportSymbol('moka.ui.ResizeDraggerLeft.resizeMethod', 
		  moka.ui.ResizeDraggerLeft.resizeMethod);




/**
 * @inheritDoc
 */ 
moka.ui.ResizeDraggerLeft.prototype.update = function(updateDims) {
    //
    // Do nothing if dragging.
    //
    if (this.Dragger.isDragging() ||  this.isAnimating) {return};

    //
    // Call superclass
    //
    goog.base(this, 'update', updateDims);


    //
    // Reset limits
    //
    this.Dragger.setLimits(new goog.math.Rect(
	// X
	this.boundaryPos.x - this.handleSize.width, 
	// Y
	this.boundaryPos.y, 
	// W
	this.boundarySize.width - this.minSize.width - this.handleSize.width,
	// H
	0
    ))

    //
    // Set the left
    //
    goog.style.setPosition(this.getElement(), this.resizeePos.x - 
			   this.handleSize.width, this.resizeePos.y)
}




/**
 * inheritDoc
 */
moka.ui.ResizeDraggerLeft.prototype.getSlideTrajectory = function(limitType) {
    goog.base(this, 'getSlideTrajectory');
    return {
	start: new goog.math.Coordinate(this.handlePos.x, this.handlePos.y),
	end: (limitType == 'MIN') ? 
	    // MIN
	    new goog.math.Coordinate(
		this.boundaryPos.x + this.minSize.width,
		this.handlePos.y) :

	    // MAX
	    new goog.math.Coordinate(
		this.boundaryPos.x + this.boundarySize.width -
		    this.minSize.width, this.handlePos.y)
    }
}
