/**
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 */
goog.provide('nrg.ui.ResizeDraggerTopRight');

// goog
goog.require('goog.math.Rect');
goog.require('goog.style');
goog.require('goog.math.Coordinate');

// nrg
goog.require('nrg.ui.ResizeDragger');
goog.require('nrg.ui.ResizeDraggerTop');
goog.require('nrg.ui.ResizeDraggerRight');




/**
 * @constructor
 * @extends {nrg.ui.ResizeDragger}
 * @param {!Element} resizee The element that will be resized.
 */
nrg.ui.ResizeDraggerTopRight = function(resizee) {
    goog.base(this, 'right', resizee);
};
goog.inherits(nrg.ui.ResizeDraggerTopRight, nrg.ui.ResizeDragger);
goog.exportSymbol('nrg.ui.ResizeDraggerTopRight', 
		  nrg.ui.ResizeDraggerTopRight);



/**
 * @type {!string} 
 * @const
 */
nrg.ui.ResizeDraggerTopRight.ID_PREFIX =  'nrg.ui.ResizeDraggerTopRight';



/**
 * @enum {string} 
 * @expose
 */ 
nrg.ui.ResizeDraggerTopRight.CSS_SUFFIX = {}



/**
 * @inheritDoc
 */
nrg.ui.ResizeDraggerTopRight.prototype.updateTrackingValues = function() {
    //
    // Call superclass method
    //
    goog.base(this, 'updateTrackingValues');

    //
    // We don't want to conduct resizee and boundary calculations
    // when dragging
    //
    if (this.Dragger.isDragging() || this.isAnimating) { return };

    nrg.ui.ResizeDraggerRight.calculateDraggerLimits.bind(this)();
    nrg.ui.ResizeDraggerTop.calculateDraggerLimits.bind(this)();
}



/**
 * @inheritDoc
 */
nrg.ui.ResizeDraggerTopRight.prototype.onResize = function(e) {
    goog.base(this, 'onResize');
    nrg.ui.ResizeDraggerRight.resizeMethod.bind(this)();
    nrg.ui.ResizeDraggerTop.resizeMethod.bind(this)();
}



/**
 * @inheritDoc
 */ 
nrg.ui.ResizeDraggerTopRight.prototype.update = function(updateDims) {
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
nrg.ui.ResizeDraggerTopRight.prototype.getSlideTrajectory = 
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




goog.exportSymbol('nrg.ui.ResizeDraggerTopRight.ID_PREFIX',
	nrg.ui.ResizeDraggerTopRight.ID_PREFIX);
goog.exportSymbol('nrg.ui.ResizeDraggerTopRight.CSS_SUFFIX',
	nrg.ui.ResizeDraggerTopRight.CSS_SUFFIX);
goog.exportSymbol('nrg.ui.ResizeDraggerTopRight.prototype.updateTrackingValues',
	nrg.ui.ResizeDraggerTopRight.prototype.updateTrackingValues);
goog.exportSymbol('nrg.ui.ResizeDraggerTopRight.prototype.onResize',
	nrg.ui.ResizeDraggerTopRight.prototype.onResize);
goog.exportSymbol('nrg.ui.ResizeDraggerTopRight.prototype.update',
	nrg.ui.ResizeDraggerTopRight.prototype.update);
goog.exportSymbol('nrg.ui.ResizeDraggerTopRight.prototype.getSlideTrajectory',
	nrg.ui.ResizeDraggerTopRight.prototype.getSlideTrajectory);
