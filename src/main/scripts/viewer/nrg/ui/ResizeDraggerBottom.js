/**
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 * @author unkown email (uchida)
 */
goog.provide('nrg.ui.ResizeDraggerBottom');

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
 * @expose
 */ 
nrg.ui.ResizeDraggerBottom.CSS_SUFFIX = {}



/**
 * @public
 */
nrg.ui.ResizeDraggerBottom.prototype.calculateDraggerLimits = function() {
    this.draggerLimitTop = this.resizeePos.top + this.minSize.height +
	this.vertDraggerOffset;

    this.draggerLimitBottom = this.boundaryPos.bottom + this.vertDraggerOffset;
    this.draggerLimitHeight = this.draggerLimitBottom - this.draggerLimitTop;
}
goog.exportSymbol('nrg.ui.ResizeDraggerBottom.prototype.calculateDraggerLimits', 
		  nrg.ui.ResizeDraggerBottom.prototype.calculateDraggerLimits)




/**
 * @public
 */
nrg.ui.ResizeDraggerBottom.prototype.resizeMethod = function() {
    var deltaY = this.handlePos.y - this.resizeePos.bottom; 
    var height = this.resizeeSize.height + deltaY;
    //window.console.log("DELTA Y", deltaY);
    goog.style.setHeight(this.resizee, Math.max(height, 
	this.minSize.height));
}
goog.exportSymbol('nrg.ui.ResizeDraggerBottom.prototype.resizeMethod', 
		  nrg.ui.ResizeDraggerBottom.prototype.resizeMethod);




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




goog.exportSymbol('nrg.ui.ResizeDraggerBottom.ID_PREFIX',
	nrg.ui.ResizeDraggerBottom.ID_PREFIX);
goog.exportSymbol('nrg.ui.ResizeDraggerBottom.CSS_SUFFIX',
	nrg.ui.ResizeDraggerBottom.CSS_SUFFIX);
goog.exportSymbol('nrg.ui.ResizeDraggerBottom.prototype.update',
	nrg.ui.ResizeDraggerBottom.prototype.update);
goog.exportSymbol('nrg.ui.ResizeDraggerBottom.prototype.getSlideTrajectory',
	nrg.ui.ResizeDraggerBottom.prototype.getSlideTrajectory);
