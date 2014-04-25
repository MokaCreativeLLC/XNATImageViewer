/**
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 * @author unkown email (uchida)
 */

// goog


// nrg
goog.require('nrg.ui.ResizeDragger');




/**
 * @constructor
 * @extends {nrg.ui.ResizeDragger}
 * @param {!Element} resizee The element that will be resized.
 */
goog.provide('goog.ui.ResizeDraggerLeft');
nrg.ui.ResizeDraggerLeft = function(resizee) {
    goog.base(this, 'right', resizee);
};
goog.inherits(nrg.ui.ResizeDraggerLeft, nrg.ui.ResizeDragger);
goog.exportSymbol('nrg.ui.ResizeDraggerLeft', nrg.ui.ResizeDraggerLeft);



/**
 * @type {!string} 
 * @const
 */
nrg.ui.ResizeDraggerLeft.ID_PREFIX =  'nrg.ui.ResizeDraggerLeft';



/**
 * @enum {string} 
 * @const
 */ 
nrg.ui.ResizeDraggerLeft.CSS_SUFFIX = {}


/**
 * @public
 */
nrg.ui.ResizeDraggerLeft.resizeMethod = function() {

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
goog.exportSymbol('nrg.ui.ResizeDraggerLeft.resizeMethod', 
		  nrg.ui.ResizeDraggerLeft.resizeMethod);




/**
 * @inheritDoc
 */ 
nrg.ui.ResizeDraggerLeft.prototype.update = function(updateDims) {
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
nrg.ui.ResizeDraggerLeft.prototype.getSlideTrajectory = function(limitType) {
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
