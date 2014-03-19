/**
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 * @author amh1646@rih.edu (Amanda Hartung)
 */

// xtk
goog.require('X.renderer2D');


/**
 * @constructor
 * @param {!string} orientation The plane orientation.
 * @extends {xiv.renderer.Plane}
 */
goog.provide('xiv.renderer.XtkPlane2D');
xiv.renderer.XtkPlane2D = function (orientation) {
    goog.base(this);

    this.orientation = orientation;
    this.XRenderer = X.renderer2D;

    /**
     * @private
     * @type {?Object}
     */
    this.currVolume_ = null;
}
goog.inherits(xiv.renderer.XtkPlane2D, xiv.renderer.XtkPlane);
goog.exportSymbol('xiv.renderer.XtkPlane2D', xiv.renderer.XtkPlane2D);



/**
 * @inheritDoc
 */
xiv.renderer.XtkPlane2D.prototype.dispose = function() {
    goog.base(this, 'dispose');
    delete this.currVolume_;
}


