/**
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 * @author amh1646@rih.edu (Amanda Hartung)
 */

// xtk
goog.require('xiv.renderer.XtkRenderer2D');


/**
 * @constructor
 * @param {!string} orientation The plane orientation.
 * @extends {xiv.renderer.XtkPlane}
 */
goog.provide('xiv.renderer.XtkPlane2D');
xiv.renderer.XtkPlane2D = function (orientation) {
    goog.base(this);

    this.orientation = orientation;
    this.XRenderer = xiv.renderer.XtkRenderer2D;

    /**
     * @private
     * @type {?Object}
     */
    this.currVolume_ = null;
}
goog.inherits(xiv.renderer.XtkPlane2D, xiv.renderer.XtkPlane);
goog.exportSymbol('xiv.renderer.XtkPlane2D', xiv.renderer.XtkPlane2D);



/**
 * @public
 */
xiv.renderer.XtkPlane2D.prototype.getVolume = function() {
    return this.Renderer.getVolume();
}



/**
 * @inheritDoc
 */
xiv.renderer.XtkPlane2D.prototype.dispose = function() {
    goog.base(this, 'dispose');
    delete this.currVolume_;
}


