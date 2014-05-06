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
xiv.vis.XtkRenderer2D.prototype.destroy = function() {
    //window.console.log('\n\n\nDESTROY 3D ', this._orienation);
    goog.base(this, 'destroy');
}




/**
 * @inheritDoc
 */
xiv.vis.XtkRenderer3D.prototype.render = function() {

    if (!this._canvas || !this._context) {
	this.init();
	return;
    } else {
	goog.base(this, 'render');
    }
}


/**
 * @inheritDoc
 */
xiv.vis.XtkRenderer3D.prototype.remove = function(xObj) {
    //
    // Catching some bizarre error...
    //
    if (goog.isDefAndNotNull(xObj)){
	goog.base(this, 'remove', xObj);
    }
}





