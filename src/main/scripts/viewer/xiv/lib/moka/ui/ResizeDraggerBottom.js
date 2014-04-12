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
    window.console.log("ON RESIZE!", this.handleDims);
    goog.base(this, 'onResize');
    moka.style.setStyle(this.resizeElt, {
	'height': this.Dragger_.limits.top - this.handleDims.Y 
    })
}



/**
 * @param {!moka.ui.ResizeDragger.UpdateDims} updateDims
 * @public
 */ 
moka.ui.ResizeDraggerBottom.prototype.update = function(updateDims) {
    goog.base(this, 'update', updateDims);

    //
    // Reset limits
    //
    this.Dragger_.setLimits(new goog.math.Rect(
	updateDims.BOUDARY.X, 
	updateDims.Y_MIN, 
	updateDims.BOUDARY.W - updateDims.BOUDARY.X, 
	updateDims.Y_MAX
    ))

    //
    // Set the left
    //
    moka.style.setStyle(this.getElement(), {
	'top': updateDims.ELEMENT.Y + updateDims.ELEMENT.W
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
