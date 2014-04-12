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
 * @inheritDoc
 */
moka.ui.ResizeDraggerBottom.prototype.onResize = function(e) {
    goog.base(this, 'onResize');
    
    moka.style.setStyle(this.resizeElt, {
	'height': Math.max(this.handleDims.Y, this.minSize.height)
    })

    window.console.log(this.handleDims.Y, this.resizeElt);
}



/**
 * @param {!moka.ui.ResizeDragger.UpdateDims} updateDims
 * @public
 */ 
moka.ui.ResizeDraggerBottom.prototype.update = function(updateDims) {
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
    var Y_MIN = this.UpdateDims.BOUNDARY.Y;
    var Y_MAX = this.UpdateDims.BOUNDARY.Y + this.UpdateDims.BOUNDARY.H;


    //
    // Reset limits
    //
    this.Dragger.setLimits(new goog.math.Rect(
	this.UpdateDims.BOUNDARY.X, 
	Y_MIN, 
	this.UpdateDims.BOUNDARY.X, 
	Y_MAX
    ))

    //
    // Set the top
    //
    moka.style.setStyle(this.getElement(), {
	'top': this.UpdateDims.ELEMENT.H
    })
}




/**
 * @return {!Object.<string, goog.math.Coordinate>}
 * @private
 */
moka.ui.ResizeDraggerBottom.prototype.getSlideTrajectory_ = 
function(limitType) {

    // startCoordinate
    var start = new goog.math.Coordinate(this.handleDims.X, this.handleDims.Y);

    // endCoordinate
    var end;
    if (limitType == 'MIN') {
	end = new goog.math.Coordinate(
	    this.handleDims.X,
	    this.Dragger_.limits.top - this.handleDims.H
	);
    } else {
	end = new goog.math.Coordinate(
	    this.handleDims.X,
	    this.Dragger_.limits.top + this.Dragger_.limits.height
	);
    }

    return {
	start: start,
	end: end
    }
}
