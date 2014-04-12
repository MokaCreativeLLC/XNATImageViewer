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
goog.provide('goog.ui.ResizeDraggerTop');
moka.ui.ResizeDraggerTop = function(resizeElt) {
    goog.base(this, 'right', resizeElt);
};
goog.inherits(moka.ui.ResizeDraggerTop, moka.ui.ResizeDragger);
goog.exportSymbol('moka.ui.ResizeDraggerTop', moka.ui.ResizeDraggerTop);



/**
 * @type {!string} 
 * @const
 */
moka.ui.ResizeDraggerTop.ID_PREFIX =  'moka.ui.ResizeDraggerTop';



/**
 * @enum {string} 
 * @const
 */ 
moka.ui.ResizeDraggerTop.CSS_SUFFIX = {}




/**
 * @inheritDoc
 */
moka.ui.ResizeDraggerTop.prototype.onResize = function(e) {
    goog.base(this, 'onResize');

    var deltaY = (this.UpdateDims.ELEMENT.Y - 
		  this.UpdateDims.BOUNDARY.Y) - this.handleDims.Y;

    moka.style.setStyle(this.resizeElt, {
	'top' : this.UpdateDims.BOUNDARY.Y + 
	    this.handleDims.Y + this.handleDims.H,

	'height': Math.max(
	    this.UpdateDims.ELEMENT.H + deltaY  - this.handleDims.H,
	    this.minSize.height
	)
    })

    window.console.log(this.UpdateDims.ELEMENT.H + deltaY,
		       this.UpdateDims.ELEMENT.H , deltaY)
}



/**
 * @inheritDoc
 */ 
moka.ui.ResizeDraggerTop.prototype.update = function(updateDims) {
    //
    // Do nothing if dragging.
    //
   if (this.Dragger.isDragging() || this.isAnimating) { return };


    //
    // Parent updateDims
    //
    goog.base(this, 'update', updateDims);


    // NOTE: MIN MAX are relative to the direction of the dragger.
    // i.e. The max of a top dragger is to the top of the boundary.
    var Y_MIN = this.UpdateDims.BOUNDARY.H - this.minSize.height;
    var Y_MAX = 0 - this.handleDims.H;


    //
    // Reset limits
    //
    this.Dragger.setLimits(new goog.math.Rect(
	this.UpdateDims.ELEMENT.X - this.UpdateDims.BOUNDARY.X, 
	Y_MAX, 0, Y_MIN
    ))

    //
    // Set the top
    //
    moka.style.setStyle(this.getElement(), {
	'top': this.UpdateDims.ELEMENT.Y - this.UpdateDims.BOUNDARY.Y - 
	    this.handleDims.H
    })

    window.console.log("RESIZE TOP", goog.style.getSize(this.resizeElt));
}




/**
 * @return {!Object.<string, goog.math.Coordinate>}
 * @private
 */
moka.ui.ResizeDraggerTop.prototype.getSlideTrajectory_ = function(limitType) {

    // startCoordinate
    var start = new goog.math.Coordinate(this.handleDims.X, this.handleDims.Y);

    // endCoordinate
    var end;
    if (limitType == 'MIN') {
	end = new goog.math.Coordinate(
	    this.handleDims.X,
	    this.Dragger.limits.top + this.Dragger.limits.height
	);
    } else {
	end = new goog.math.Coordinate(
	    this.handleDims.X,
	    this.Dragger.limits.top - this.handleDims.H
	);
    }

    return {
	start: start,
	end: end
    }
}
