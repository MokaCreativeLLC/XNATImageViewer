/**
 * @author kumar.sunil.p@gmail.com (Sunil Kumar))
 */
goog.provide('nrg.ui.ResizeDraggerTop');

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
nrg.ui.ResizeDraggerTop = function(resizee) {
    goog.base(this, 'right', resizee);
};
goog.inherits(nrg.ui.ResizeDraggerTop, nrg.ui.ResizeDragger);
goog.exportSymbol('nrg.ui.ResizeDraggerTop', nrg.ui.ResizeDraggerTop);



/**
 * @type {!string} 
 * @const
 */
nrg.ui.ResizeDraggerTop.ID_PREFIX =  'nrg.ui.ResizeDraggerTop';



/**
 * @enum {string} 
 * @expose
 */ 
nrg.ui.ResizeDraggerTop.CSS_SUFFIX = {}



/**
 * @public
 */
nrg.ui.ResizeDraggerTop.prototype.calculateDraggerLimits = function() {
    this.draggerLimitTop = this.boundaryPos.top - this.vertDraggerOffset;
    this.draggerLimitBottom = this.resizeePos.bottom - this.minSize.height + 
	this.vertDraggerOffset;
    this.draggerLimitHeight = this.draggerLimitBottom - this.draggerLimitTop;
}
goog.exportSymbol('nrg.ui.ResizeDraggerTop.calculateDraggerLimits', 
		  nrg.ui.ResizeDraggerTop.calculateDraggerLimits);



/**
 * @public
 */
nrg.ui.ResizeDraggerTop.prototype.resizeMethod = function() {
    //
    // Calculate height
    //
    var newEltTop = this.handlePos.y  - this.vertDraggerOffset;
    var deltaY = (this.isAnimating) ?
	// when animating (slightly more involved calculation)
	(this.resizeePos.y - newEltTop) : 
	// when animating (slightly less involved calculation)
	this.Dragger.startY - this.Dragger.clientY;
    var height = this.resizeeSize.height + deltaY;

    //
    // Update resizee
    //
    this.resizee.style.top = (newEltTop).toString() + 'px';
    goog.style.setHeight(this.resizee, Math.max(height, this.minSize.height));
}





/**
 * @inheritDoc
 */ 
nrg.ui.ResizeDraggerTop.prototype.update = function() {
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
	this.draggerLimitHeight
    ))

    //
    // Set the top
    //
    goog.style.setPosition(this.getElement(), 
			   this.resizeePos.x,
			   this.resizeePos.y + this.vertDraggerOffset);

    //window.console.log("\n%\n%\n%\n\n\n^^^^^^^^^^^^^^", 
    //this.draggerLimitHeight
    //, this.handleSize.height, this.minSize);
}




/**
 * inheritDoc
 */
nrg.ui.ResizeDraggerTop.prototype.getSlideTrajectory = function(limitType) {
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
	    new goog.math.Coordinate(this.handlePos.x, 
				     this.draggerLimitBottom) 
	    :
	    new goog.math.Coordinate(this.handlePos.x, 
				     this.draggerLimitTop) 
    }
}



goog.exportSymbol('nrg.ui.ResizeDraggerTop.ID_PREFIX',
	nrg.ui.ResizeDraggerTop.ID_PREFIX);
goog.exportSymbol('nrg.ui.ResizeDraggerTop.CSS_SUFFIX',
	nrg.ui.ResizeDraggerTop.CSS_SUFFIX);
goog.exportSymbol('nrg.ui.ResizeDraggerTop.prototype.calculateDraggerLimits',
	nrg.ui.ResizeDraggerTop.prototype.calculateDraggerLimits);
goog.exportSymbol('nrg.ui.ResizeDraggerTop.prototype.resizeMethod', 
		  nrg.ui.ResizeDraggerTop.prototype.resizeMethod);
goog.exportSymbol('nrg.ui.ResizeDraggerTop.resizeMethod',
	nrg.ui.ResizeDraggerTop.resizeMethod);
goog.exportSymbol('nrg.ui.ResizeDraggerTop.prototype.update',
	nrg.ui.ResizeDraggerTop.prototype.update);
goog.exportSymbol('nrg.ui.ResizeDraggerTop.prototype.getSlideTrajectory',
	nrg.ui.ResizeDraggerTop.prototype.getSlideTrajectory);
