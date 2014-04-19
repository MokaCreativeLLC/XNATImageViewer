/**
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 */

// xiv
goog.require('xiv.vis.XtkRenderer3D');


/**
 * @constructor
 * @extends {xiv.vis.XtkPlane}
 */
goog.provide('xiv.vis.XtkPlane3D');
xiv.vis.XtkPlane3D = function () {
    goog.base(this);
    this.orientation = 'V'; 
    this.XRenderer = xiv.vis.XtkRenderer3D;
}
goog.inherits(xiv.vis.XtkPlane3D, xiv.vis.XtkPlane);
goog.exportSymbol('xiv.vis.XtkPlane3D', xiv.vis.XtkPlane3D);

