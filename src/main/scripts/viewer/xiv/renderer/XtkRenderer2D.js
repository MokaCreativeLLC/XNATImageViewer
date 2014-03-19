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
