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
goog.provide('goog.ui.ResizeDraggerRight');
moka.ui.ResizeDraggerRight = function(resizeElt) {
    goog.base(this, 'right', resizeElt);
};
goog.inherits(moka.ui.ResizeDraggerRight, moka.ui.ResizeDragger);
goog.exportSymbol('moka.ui.ResizeDraggerRight', moka.ui.ResizeDraggerRight);



/**
 * @type {!string} 
 * @const
 */
moka.ui.ResizeDraggerRight.ID_PREFIX =  'moka.ui.ResizeDraggerRight';



/**
 * @enum {string} 
 * @const
 */ 
moka.ui.ResizeDraggerRight.CSS_SUFFIX = {}




/**
 * @inheritDoc
 */
moka.ui.ResizeDraggerRight.prototype.onResize = function(e) {
    goog.base(this, 'onResize');

    var deltaX = this.handleDims.X - 
	((this.UpdateDims.ELEMENT.X - this.UpdateDims.BOUNDARY.X) + 
	this.UpdateDims.ELEMENT.W);

    moka.style.setStyle(this.resizeElt, {
	'width': Math.max(
	    this.UpdateDims.ELEMENT.W + deltaX,
	    this.minSize.width)
    })
}



/**
 * @inheritDoc
 */ 
moka.ui.ResizeDraggerRight.prototype.update = function(updateDims) {
    //
    // Do nothing if dragging.
    //
    if (this.Dragger.isDragging() ||  this.isAnimating) {return};


    goog.base(this, 'update', updateDims);

    //
    // NOTE: MIN MAX are relative to the direction of the dragger.
    // i.e. The max of a right dragger is to the right of the boundary.
    //
    var X_MIN = this.UpdateDims.ELEMENT.X + this.minSize.width;
    var X_MAX = this.UpdateDims.BOUNDARY.W;

    //
    // Reset limits
    //
    this.Dragger.setLimits(new goog.math.Rect(
	X_MIN, 
	this.UpdateDims.BOUNDARY.Y - this.UpdateDims.ELEMENT.Y, 
	X_MAX, 0
    ))

    //
    // Set the left
    //
    moka.style.setStyle(this.getElement(), {
	'left': this.UpdateDims.ELEMENT.X + this.UpdateDims.ELEMENT.W
    })
}




/**
 * @return {!Object.<string, goog.math.Coordinate>}
 * @private
 */
moka.ui.ResizeDraggerRight.prototype.getSlideTrajectory_ = function(limitType) {

    // startCoordinate
    var start = new goog.math.Coordinate(this.handleDims.X, this.handleDims.Y);

    // endCoordinate
    var end;
    if (limitType == 'MIN') {
	end = new goog.math.Coordinate(
	    this.Dragger.limits.left,
	    this.handleDims.Y
	);
    } else {
	end = new goog.math.Coordinate(
	    this.Dragger.limits.left + this.Dragger.limits.width,
	    this.handleDims.Y
	);
    }

    return {
	start: start,
	end: end
    }
}
