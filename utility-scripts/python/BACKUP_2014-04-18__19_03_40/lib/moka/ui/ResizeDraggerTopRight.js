/**
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 */

// goog


// moka
goog.require('moka.ui.ResizeDragger');
goog.require('moka.ui.ResizeDraggerTop');
goog.require('moka.ui.ResizeDraggerRight');




/**
 * @constructor
 * @extends {moka.ui.ResizeDragger}
 * @param {!Element} resizee The element that will be resized.
 */
goog.provide('goog.ui.ResizeDraggerTopRight');
moka.ui.ResizeDraggerTopRight = function(resizee) {
    goog.base(this, 'right', resizee);
};
goog.inherits(moka.ui.ResizeDraggerTopRight, moka.ui.ResizeDragger);
goog.exportSymbol('moka.ui.ResizeDraggerTopRight', 
		  moka.ui.ResizeDraggerTopRight);



/**
 * @type {!string} 
 * @const
 */
moka.ui.ResizeDraggerTopRight.ID_PREFIX =  'moka.ui.ResizeDraggerTopRight';



/**
 * @enum {string} 
 * @const
 */ 
moka.ui.ResizeDraggerTopRight.CSS_SUFFIX = {}



/**
 * @inheritDoc
 */
moka.ui.ResizeDraggerTopRight.prototype.updateTrackingValues = function() {
    //
    // Call superclass method
    //
    goog.base(this, 'updateTrackingValues');

    //
    // We don't want to conduct resizee and boundary calculations
    // when dragging
    //
    if (this.Dragger.isDragging() || this.isAnimating) { return };

    moka.ui.ResizeDraggerRight.calculateDraggerLimits.bind(this)();
    moka.ui.ResizeDraggerTop.calculateDraggerLimits.bind(this)();
}



/**
 * @inheritDoc
 */
moka.ui.ResizeDraggerTopRight.prototype.onResize = function(e) {
    goog.base(this, 'onResize');
    moka.ui.ResizeDraggerRight.resizeMethod.bind(this)();
    moka.ui.ResizeDraggerTop.resizeMethod.bind(this)();
}



/**
 * @inheritDoc
 */ 
moka.ui.ResizeDraggerTopRight.prototype.update = function(updateDims) {
    //
    // Do nothing if dragging or animating
    //
   if (this.Dragger.isDragging() || this.isAnimating) { return };


    //
    // Parent updateDims
    //
    goog.base(this, 'update', updateDims);

    //
    // Reset limits
    //
    this.Dragger.setLimits(new goog.math.Rect(
	this.boundaryPos.x + this.horizDraggerOffset, 
	this.boundaryPos.y + this.vertDraggerOffset, 
	this.boundarySize.width, 
	this.boundarySize.height
    ))

    //
    // Set the top
    //
    goog.style.setPosition(this.getElement(), 
			   this.resizeePos.right + this.horizDraggerOffset,
			   this.resizeePos.y + this.vertDraggerOffset)
}




/**
 * @inheritDoc
 */
moka.ui.ResizeDraggerTopRight.prototype.getSlideTrajectory = 
function(limitType) {

    // startCoordinate
    var start = new goog.math.Coordinate(this.handlePos.x, this.handlePos.y);

    // endCoordinate
    var end;

    if (limitType == 'TOP_LEFT') {
	end = new goog.math.Coordinate(
	    this.boundaryPos.x,
	    this.boundaryPos.y
	)
    } else if (limitType == 'TOP_RIGHT') {
	end = new goog.math.Coordinate(
	    this.boundaryPos.x + this.boundarySize.width,
	    this.boundaryPos.y
	)
    } else if (limitType == 'BOTTOM_RIGHT') {
	end = new goog.math.Coordinate(
	    this.boundaryPos.x + this.boundarySize.width,
	    this.boundaryPos.y + this.boundarySize.height
	)
    } else if (limitType == 'BOTTOM_LEFT') {
	end = new goog.math.Coordinate(
	    this.boundaryPos.x,
	    this.boundaryPos.y + this.boundarySize.height
	)
    }

    return {
	start: start,
	end: end
    }
}
