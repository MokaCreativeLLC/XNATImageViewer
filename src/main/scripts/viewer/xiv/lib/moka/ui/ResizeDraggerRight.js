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
goog.provide('goog.ui.ResizeDraggerRight.EventType');
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
    window.console.log("ON RESIZE!", this.handleDims);
    goog.base(this, 'onResize');
    moka.style.setStyle(this.resizeElt, {
	'width': this.handleDims.X 
    })
}



/**
 * @param {!moka.ui.ResizeDragger.UpdateDims} updateDims
 * @public
 */ 
moka.ui.ResizeDraggerRight.prototype.update = function(updateDims) {
    goog.base(this, 'update', updateDims);

    //
    // Reset limits
    //
    this.Dragger_.setLimits(new goog.math.Rect(
	updateDims.X_MIN, 
	updateDims.BOUNDARY.Y - updateDims.ELEMENT.Y, 
	updateDims.X_MAX, 0
    ))

    //
    // Set the left
    //
    moka.style.setStyle(this.getElement(), {
	'left': updateDims.ELEMENT.X + updateDims.ELEMENT.W
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
