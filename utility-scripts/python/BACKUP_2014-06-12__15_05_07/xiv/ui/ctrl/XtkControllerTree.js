/**
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 */

// goog
goog.require('goog.object');

// nrg
goog.require('nrg.ui.Component');

// xtk
goog.require('X.volume');
goog.require('X.mesh');
goog.require('X.sphere');


// xiv
goog.require('xiv.ui.ctrl.VolumeController2D');
goog.require('xiv.ui.ctrl.VolumeController3D');
goog.require('xiv.ui.ctrl.MeshController3D');
goog.require('xiv.ui.ctrl.AnnotationsController3D');



/**
 *
 * @constructor
 * @extends {nrg.ui.Component}
 */
goog.provide('xiv.ui.ctrl.XtkControllerTree');
xiv.ui.ctrl.XtkControllerTree = function() {
    goog.base(this);
}
goog.inherits(xiv.ui.ctrl.XtkControllerTree, nrg.ui.Component);
goog.exportSymbol('xiv.ui.ctrl.XtkControllerTree', 
		  xiv.ui.ctrl.XtkControllerTree);


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
 * @type {xiv.ui.ctrl.VolumeController3D}
 * @private
 */
xiv.ui.ctrl.XtkControllerTree.prototype.VolumeController3D_;



/**
 * @type {xiv.ui.ctrl.MeshController3D}
 * @private
 */
xiv.ui.ctrl.XtkControllerTree.prototype.MeshController3D_;



/**
 * @type {xiv.ui.ctrl.AnnotationsController3D}
 * @private
 */
xiv.ui.ctrl.XtkControllerTree.prototype.AnnotationsController3D_;



/**
 * @type {xiv.ui.ctrl.FiberController3D}
 * @private
 */
xiv.ui.ctrl.XtkControllerTree.prototype.FiberController3D_;



/**
 * @param {Array.<xiv.ui.ctrl.MasterController3D> |
 *         xiv.ui.ctrl.MasterController3D |
 *         Array.<xiv.ui.ctrl.MasterController2D> |
 *         xiv.ui.ctrl.MasterController2D} mainControls
 * @return {Array.<xiv.ui.ctrl.XtkController>}
 * @public
 */
xiv.ui.ctrl.XtkControllerTree.prototype.getControllers = 
function(mainControls) {
    var controllers = [];
    goog.array.forEach(
	goog.isArray(mainControls) ? mainControls : [mainControls], 
     function(ctrl){
	if (goog.isDefAndNotNull(ctrl)) {
	    controllers = goog.array.concat(controllers, 
					    ctrl.getAllControllers());
	}
    })
    return controllers;
}



/**
 * @return {Array.<xiv.ui.ctrl.XtkController>}
 * @public
 */
xiv.ui.ctrl.XtkControllerTree.prototype.updateControllers = function() {

    //window.console.log(this.AnnotationsController3D_);
    return this.getControllers([
	this.VolumeController3D_,
	this.MeshController3D_,
	this.AnnotationsController3D_,
	this.FiberController3D_
    ])
}




/**
 * @return {Array.<xiv.ui.ctrl.XtkController>}
 * @public
 */
xiv.ui.ctrl.XtkControllerTree.prototype.getControllers3D = function() {

    //window.console.log(this.AnnotationsController3D_);
    return this.getControllers([
	this.VolumeController3D_,
	this.MeshController3D_,
	this.AnnotationsController3D_,
	this.FiberController3D_
    ])
}



/**
 * @return {Array.<xiv.ui.ctrl.XtkController>}
 * @public
 */
xiv.ui.ctrl.XtkControllerTree.prototype.getControllers2D = function() {
    return this.getControllers([
	this.VolumeController2D_
    ]);
}




/**
 * @param {!X.Object} xObj
 * @param {!gxnat.vis.RenderProperties} renderProps
 * @public
 */
xiv.ui.ctrl.XtkControllerTree.prototype.createControllers = 
function(xObj, renderProps) {

    //window.console.log(xObj);
    if (xObj instanceof X.volume) {
	if (!goog.isDefAndNotNull(this.VolumeController2D_)){
	    this.VolumeController2D_ = new xiv.ui.ctrl.VolumeController2D();
	    this.VolumeController3D_ = new xiv.ui.ctrl.VolumeController3D();
	}
	this.VolumeController2D_.add(xObj, renderProps);
	this.VolumeController3D_.add(xObj, renderProps);
    }

    else if (xObj instanceof X.mesh) {
	if (!goog.isDefAndNotNull(this.MeshController3D_)){
	    this.MeshController3D_ = new xiv.ui.ctrl.MeshController3D();
	}
	this.MeshController3D_.add(xObj, renderProps);
    }

    else if (xObj instanceof X.sphere) {
	//window.console.log('\n\n\nANNOT!!!!!');
	if (!goog.isDefAndNotNull(this.AnnotationsController3D_)){
	    this.AnnotationsController3D_ = 
		new xiv.ui.ctrl.AnnotationsController3D();
	}
	this.AnnotationsController3D_.add(xObj);
    }


    //
    // Possible TODO, though not necessarily within the domain of
    // XNATSlicer.
    //
    /**
     *
    else if (xObj instanceof X.fibers) {
	if (!goog.isDefAndNotNull(this.FiberController3D_)){
	    this.FiberController3D_ = new xiv.ui.ctrl.FiberController3D();
	}
	this.FiberController3D_.add(xObj, renderProps);
    }
    */

}




/**
 * @param {!string} labelTitle;
 * @public
 */
xiv.ui.ctrl.XtkControllerTree.prototype.disposeInternal = function() {
    goog.base(this, 'disposeInternal');

    if (goog.isDefAndNotNull(this.VolumeController3D_)){
	this.VolumeController3D_.dispose();
	delete this.VolumeController3D_;
    }


    if (goog.isDefAndNotNull(this.MeshController3D_)){
	this.MeshController3D_.dispose();
	delete this.MeshController3D_;
    }

    if (goog.isDefAndNotNull(this.AnnotationsController3D_)){
	this.AnnotationsController3D_.dispose();
	delete this.AnnotationsController3D_;
    }

    if (goog.isDefAndNotNull(this.FiberController3D_)){
	this.FiberController3D_.dispose();
	delete this.FiberController3D_;
    }
}



