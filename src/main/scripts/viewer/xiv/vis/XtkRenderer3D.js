/**
 * @author kumar.sunil.p@gmail.com (Sunil Kumar)
 */
goog.provide('xiv.vis.XtkRenderer3D');


// X
goog.require('X.renderer3D');
goog.require('X');

// xiv
goog.require('xiv.vis.RenderEngine');

//-----------



/**
 * Exists for the purpose of making the protected
 * X.renderer.onResize_ function public.
 *
 * @constructor
 * @extends {X.renderer3D}
 */
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
xiv.vis.XtkRenderer3D.prototype.onProgress = function(e) {
    //window.console.log('3D', e._value);
    goog.base(this, 'onProgress', e);
    this.dispatchEvent({
	type: xiv.vis.RenderEngine.EventType.RENDERING,
	value: e._value
    })
};


/**
 * @inheritDoc
 */
xiv.vis.XtkRenderer3D.prototype.render = function() {
    if (!this._canvas || !this._context) {
	//
	// This turns off the any stray progress bars
	//
	this._config['PROGRESSBAR_ENABLED'] =  false;
	this.init();
	return;
    } else {
	//window.console.log("RENDER");
	goog.base(this, 'render');
	this.dispatchEvent({
	    type: xiv.vis.RenderEngine.EventType.RENDER_END,
	})
    }
}



/**
 * @inheritDoc
 */
xiv.vis.XtkRenderer3D.prototype.destroy = function() {
    goog.base(this, 'destroy');
    //window.console.log("Destroying renderer 3D");
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



goog.exportSymbol('xiv.vis.XtkRenderer3D.prototype.onResize',
	xiv.vis.XtkRenderer3D.prototype.onResize);
goog.exportSymbol('xiv.vis.XtkRenderer3D.prototype.onProgress',
	xiv.vis.XtkRenderer3D.prototype.onProgress);
goog.exportSymbol('xiv.vis.XtkRenderer3D.prototype.render',
	xiv.vis.XtkRenderer3D.prototype.render);
goog.exportSymbol('xiv.vis.XtkRenderer3D.prototype.remove',
	xiv.vis.XtkRenderer3D.prototype.remove);
