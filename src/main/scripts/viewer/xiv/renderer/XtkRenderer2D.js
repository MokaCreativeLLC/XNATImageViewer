/**
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 */

// xtk
goog.require('X.renderer2D');


/**
 * Exists for the purpose of making the protected members of 
 * X.renderer public.
 *
 * @constructor
 * @extends {X.renderer2D}
 */
goog.provide('xiv.renderer.XtkRenderer2D');
xiv.renderer.XtkRenderer2D = function () {
    goog.base(this);
}
goog.inherits(xiv.renderer.XtkRenderer2D, X.renderer2D);
goog.exportSymbol('xiv.renderer.XtkRenderer2D', xiv.renderer.XtkRenderer2D);



/**
 * @param {!number} sliceNum
 * @public
 */
xiv.renderer.XtkRenderer2D.prototype.getDimsForCalc_ = function() {

    this.originalWidth_ = this._sliceWidthSpacing * this._sliceWidth;
    this.originalHeight_ = this._sliceHeightSpacing * this._sliceHeight;
    this.originalWHRatio_ = originalWidth / originalHeight;
    this.canvasWHRatio_ = this._sliceWidth / this._sliceHeight;
}



/**
 * @param {!number} sliceNum
 * @public
 */
xiv.renderer.XtkRenderer2D.prototype.getSliceRelativeToContainerX = 
function(sliceNum) {

    this.getDimsForCalc_();

    // First cull sliceNum
    sliceNum = goog.math.min(this._sliceWidth, sliceNum);
    sliceNum = goog.math.max(0, sliceNum);


    // If the canvas w-h ratio is greater than original,
    // we use height ratio
    if (this.canvasWHRatio_ > this.originalWHRatio_) {

	// The actual width of the image centered in the canvas
	var actualWidth = this.originalWidth_ * 
	    (this._height / this.originalHeight_);

	return (this._width - actualWidth)/2 + 
	    (sliceNum / this._sliceWidth) * actualWidth;


    // Otherwise we ise the width...
    } else {
	return (sliceNum / this._sliceWidth) * this._width;
    }
}



/**
 * @param {!number} sliceNum
 * @public
 */
xiv.renderer.XtkRenderer2D.prototype.getSliceRelativeToContainerY = 
function(sliceNum) {

    this.getDimsForCalc_();

    // First cull sliceNum
    sliceNum = goog.math.min(this._sliceHeight, sliceNum);
    sliceNum = goog.math.max(0, sliceNum);

    // If the canvas w-h ratio is greater than original,
    // we use height ratio
    if (this.canvasWHRatio_ > this.originalWHRatio_) {

	return (sliceNum / this._sliceHeight) * this._height;

    // Otherwise we use the width...
    } else {

	// The actual width of the image centered in the canvas
	var actualHeight = this.originalHeight_ * 
	    (this._width / this.originalWidth_);

	return (this._height - actualHeight)/2 + 
	    (sliceNum / this._sliceHeight) * actualHeight;
	
    }
}




/**
 * @public
 */
xiv.renderer.XtkRenderer2D.prototype.onResize = function() {
    this.onResize_();
}



/**
 * @public
 */
xiv.renderer.XtkRenderer2D.prototype.getVolume = function() {
    return this._topLevelObjects[0];
}
