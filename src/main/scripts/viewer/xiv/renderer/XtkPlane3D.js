/**
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 * @author amh1646@rih.edu (Amanda Hartung)
 */

// xtk
goog.require('X.renderer3D');


/**
 * @constructor
 * @extends {xiv.renderer.XtkPlane}
 */
goog.provide('xiv.renderer.XtkPlane3D');
xiv.renderer.XtkPlane3D = function () {
    goog.base(this);
    this.orientation = 'V'; 
    this.XRenderer = X.renderer3D;
}
goog.inherits(xiv.renderer.XtkPlane3D, xiv.renderer.XtkPlane);
goog.exportSymbol('xiv.renderer.XtkPlane3D', xiv.renderer.XtkPlane3D);

