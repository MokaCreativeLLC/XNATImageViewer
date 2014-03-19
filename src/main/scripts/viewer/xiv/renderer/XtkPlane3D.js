/**
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 */

// xiv
goog.require('xiv.renderer.XtkRenderer3D');


/**
 * @constructor
 * @extends {xiv.renderer.XtkPlane}
 */
goog.provide('xiv.renderer.XtkPlane3D');
xiv.renderer.XtkPlane3D = function () {
    goog.base(this);
    this.orientation = 'V'; 
    this.XRenderer = xiv.renderer.XtkRenderer3D;
}
goog.inherits(xiv.renderer.XtkPlane3D, xiv.renderer.XtkPlane);
goog.exportSymbol('xiv.renderer.XtkPlane3D', xiv.renderer.XtkPlane3D);

