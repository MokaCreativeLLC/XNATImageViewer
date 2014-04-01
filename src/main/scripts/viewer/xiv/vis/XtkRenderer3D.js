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



/**
 * @inheritDoc
 */
xiv.vis.XtkRenderer3D.prototype.onProgress = function(event) {
    goog.base(this, 'onProgress', event);
    //window.console.log("DOSPATCHING 3D", event._value);
    this.dispatchEvent({
	type: xiv.vis.RenderEngine.EventType.RENDERING,
	value: event._value,
	obj: this
    })
};

