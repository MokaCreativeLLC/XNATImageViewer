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

    this.orientation = orientation;
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
    return this.Renderer.getVolume();
}



/**
 * @inheritDoc
 */
xiv.vis.XtkPlane2D.prototype.dispose = function() {
    goog.base(this, 'dispose');
    delete this.currVolume_;
}


