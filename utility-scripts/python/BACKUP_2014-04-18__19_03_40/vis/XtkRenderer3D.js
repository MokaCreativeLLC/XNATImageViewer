/**
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 */

// xtk
goog.require('X.renderer3D');


/**
 * Exists for the purpose of making the protexted
 * X.renderer.onResize_ function public.
 *
 * @constructor
 * @extends {X.renderer3D}
 */
goog.provide('xiv.vis.XtkRenderer3D');
xiv.vis.XtkRenderer3D = function () {
    goog.base(this);
}
goog.inherits(xiv.vis.XtkRenderer3D, X.renderer3D);
goog.exportSymbol('xiv.vis.XtkRenderer3D', xiv.vis.XtkRenderer3D);



/**
 * @public
 */
xiv.vis.XtkRenderer3D.prototype.onResize = function() {
    this.onResize_();
}


