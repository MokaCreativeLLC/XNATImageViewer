/**
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 * @author amh1646@rih.edu (Amanda Hartung)
 */

// xtk
goog.require('xiv.vis.XtkRenderer2D');


/**
 * @constructor
 * @param {!string} orientation The plane orientation.
 * @extends {xiv.vis.XtkPlane}
 */
goog.provide('xiv.vis.XtkPlane2D');
xiv.vis.XtkPlane2D = function (orientation) {
    goog.base(this);

    //
    // Set the orientation
    //
    this.orientation = orientation;

    //
    // Set the renderer
    //
    this.XRenderer = xiv.vis.XtkRenderer2D;

    /**
     * @private
     * @type {?Object}
     */
    this.currVolume_ = null;
}
goog.inherits(xiv.vis.XtkPlane2D, xiv.vis.XtkPlane);
goog.exportSymbol('xiv.vis.XtkPlane2D', xiv.vis.XtkPlane2D);



/**
 * @type {?goog.events.Key}
 * @private
 */
xiv.vis.XtkPlane2D.prototype.keyDown_ = null;


/**
 * @type {?goog.events.Key}
 * @private
 */
xiv.vis.XtkPlane2D.prototype.keyUp_ = null;




/**
 * @param {!number} sliceNum
 * @public
 */
xiv.vis.XtkPlane2D.prototype.getSliceRelativeToContainerX = 
function(sliceNum) {
    return this.Renderer.getSliceRelativeToContainerX(sliceNo);
}



/**
 * @param {!number} sliceNum
 * @public
 */
xiv.vis.XtkPlane2D.prototype.getSliceRelativeToContainerY = 
function(sliceNum) {
    return this.Renderer.getSliceRelativeToContainerY(sliceNo);
}



/**
 * @param {!number} sliceNum
 * @public
 */
xiv.vis.XtkPlane2D.prototype.getVolume = function() {
    return goog.isDefAndNotNull(this.Renderer) ? this.Renderer.getVolume() : 
	null;
}





/**
 * @inheritDoc
 */
xiv.vis.XtkPlane2D.prototype.dispose = function() {
    goog.base(this, 'dispose');
    delete this.currVolume_;
    delete this.keyDown_;
    delete this.keyUp_;
}




goog.exportSymbol('xiv.vis.XtkPlane2D.prototype.getSliceRelativeToContainerX',
	xiv.vis.XtkPlane2D.prototype.getSliceRelativeToContainerX);
goog.exportSymbol('xiv.vis.XtkPlane2D.prototype.getSliceRelativeToContainerY',
	xiv.vis.XtkPlane2D.prototype.getSliceRelativeToContainerY);
goog.exportSymbol('xiv.vis.XtkPlane2D.prototype.getVolume',
	xiv.vis.XtkPlane2D.prototype.getVolume);
goog.exportSymbol('xiv.vis.XtkPlane2D.prototype.dispose',
	xiv.vis.XtkPlane2D.prototype.dispose);
