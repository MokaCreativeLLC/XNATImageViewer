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
goog.provide('xiv.renderer.XtkRenderer3D');
xiv.renderer.XtkRenderer3D = function () {
    goog.base(this);
}
goog.inherits(xiv.renderer.XtkRenderer3D, X.renderer3D);
goog.exportSymbol('xiv.renderer.XtkRenderer3D', xiv.renderer.XtkRenderer3D);



/**
 * @public
 */
xiv.renderer.XtkRenderer3D.prototype.onResize = function() {
    this.onResize_();
}


