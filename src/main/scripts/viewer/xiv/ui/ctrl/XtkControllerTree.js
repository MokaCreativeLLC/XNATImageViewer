/**
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 */

// goog
goog.require('goog.object');

// moka
goog.require('moka.ui.Component');

// xiv
goog.require('xiv.ui.ctrl.VolumeController2D');
goog.require('xiv.ui.ctrl.VolumeController3D');



/**
 *
 * @constructor
 * @extends {moka.ui.Component}
 */
goog.provide('xiv.ui.ctrl.XtkControllerTree');
xiv.ui.ctrl.XtkControllerTree = function() {
    goog.base(this);
}
goog.inherits(xiv.ui.ctrl.XtkControllerTree, moka.ui.Component);
goog.exportSymbol('xiv.ui.ctrl.XtkControllerTree', xiv.ui.ctrl.XtkControllerTree);


/**
 * @type {!string} 
 * @const
 * @expose
 */
xiv.ui.ctrl.XtkControllerTree.ID_PREFIX =  'xiv.ui.ctrl.XtkControllerTree';



/**
 * @enum {string}
 * @public
 */
xiv.ui.ctrl.XtkControllerTree.CSS_SUFFIX = {};



/**
 * @param {!X.Object} xObj
 * @param {!gxnat.vis.RenderProperties} renderProps
 * @public
 */
xiv.ui.ctrl.XtkControllerTree.prototype.createControllers = 
function(xObj, renderProps) {

    if (xObj instanceof X.volume) {

	if (!goog.isDefAndNotNull(this.VolumeController2D_)){
	    //this.VolumeController2D_ = new xiv.ui.ctrl.VolumeController2D();
	    this.VolumeController3D_ = new xiv.ui.ctrl.VolumeController3D();
	}
	//this.VolumeController2D_.add(xObj, renderProps);
	this.VolumeController3D_.add(xObj, renderProps);

    }


    window.console.log("RETURNING OUT");
    return;

    if (xObj instanceof X.mesh) {

	if (!goog.isDefAndNotNull(this.MeshController3D_)){
	    this.MeshController3D_ = new xiv.ui.ctrl.MeshController3D();
	}
	this.MeshController3D_.add(xObj, renderProps);

    }

    else if (xObj instanceof X.fiber) {
	if (!goog.isDefAndNotNull(this.FiberController3D_)){
	    this.FiberController3D_ = new xiv.ui.ctrl.FiberController3D();
	}
	this.FiberController3D_.add(xObj, renderProps);
    }

    else if (xObj instanceof X.sphere) {
	if (!goog.isDefAndNotNull(this.AnnotationsController3D_)){
	    this.AnnotationsController3D_ = 
		new xiv.ui.ctrl.AnnotationsController3D();
	}
	this.AnnotationsController3D_.add(xObj);
    }
}




/**
 * @param {!string} labelTitle;
 * @public
 */
xiv.ui.ctrl.XtkControllerTree.prototype.disposeInternal = function() {
    goog.base(this, 'disposeInternal');
    
    window.console.log("need to implement dispose methods" + 
		       " for XtkControllerTree");
}



