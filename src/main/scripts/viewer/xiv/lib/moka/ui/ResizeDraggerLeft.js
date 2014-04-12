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
goog.provide('goog.ui.ResizeDraggerLeft');
moka.ui.ResizeDraggerLeft = function(resizeElt) {
    goog.base(this, 'right', resizeElt);
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
 * @inheritDoc
 */
moka.ui.ResizeDraggerLeft.prototype.onResize = function(e) {
    window.console.log("ON RESIZE!", this.handleDims);
    goog.base(this, 'onResize');
    moka.style.setStyle(this.resizeElt, {
	'left': this.handleDims.X + this.handeDims.W,
	'width': '200px',
    })
}



/**
 * @param {!moka.ui.ResizeDragger.UpdateDims} updateDims
 * @public
 */ 
moka.ui.ResizeDraggerLeft.prototype.update = function(updateDims) {
    goog.base(this, 'update', updateDims);

    //
    // Reset limits
    //
    this.Dragger_.setLimits(new goog.math.Rect(
	this.UpdateDims.X_MIN, 
	this.UpdateDims.BOUNDARY.Y - this.UpdateDims.ELEMENT.Y, 
	this.UpdateDims.X_MAX, 0
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
moka.ui.ResizeDraggerLeft.prototype.getSlideTrajectory_ = function(limitType) {

    // startCoordinate
    var start = new goog.math.Coordinate(this.handleDims.X, this.handleDims.Y);

    // endCoordinate
    var end;
    if (limitType == 'MIN') {
	end = new goog.math.Coordinate(
	    this.Dragger_.limits.left,
	    this.handleDims.Y
	);
    } else {
	end = new goog.math.Coordinate(
	    this.Dragger_.limits.left + this.Dragger_.limits.width,
	    this.handleDims.Y
	);
    }

    return {
	start: start,
	end: end
    }
}
