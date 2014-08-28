/**
 * @author kumar.sunil.p@gmail.com (Sunil Kumar)
 */
goog.provide('xiv.ui.XtkControllerTree');
goog.provide('xiv.ui.XtkControllerTree.ControlSet');


// goog
goog.require('goog.object');
goog.require('goog.array');

// X
goog.require('X.object');
goog.require('X.volume');
goog.require('X.mesh');
goog.require('X.sphere');
goog.require('X.fibers');

// nrg
goog.require('nrg.ui.Component');

// gxnat
goog.require('gxnat.vis.RenderProperties');

// xiv
goog.require('xiv.ui.LevelsController');
goog.require('xiv.ui.VolumeController');
goog.require('xiv.ui.VolumeController3D');
goog.require('xiv.ui.MeshController3D');
goog.require('xiv.ui.AnnotationsController3D');
goog.require('xiv.ui.XtkController');
goog.require('xiv.ui.MasterController3D');
goog.require('xiv.ui.MasterController2D');
goog.require('xiv.ui.VolumeController');

//-----------



/**
 * @constructor
 * @extends {nrg.ui.Component}
 */
xiv.ui.XtkControllerTree = function() {
    goog.base(this);

    var propObj = xiv.ui.XtkControllerTree.getEmptyPropertiesObject();
    goog.object.forEach(propObj, function(property, key){
	this[key] = null;
    })
}
goog.inherits(xiv.ui.XtkControllerTree, nrg.ui.Component);
goog.exportSymbol('xiv.ui.XtkControllerTree', 
		  xiv.ui.XtkControllerTree);


/**
 * @param {?Array.<xiv.ui.XtkController>} c2d
 * @param {?Array.<xiv.ui.XtkController>} c3d
 * @param {?Array.<xiv.ui.XtkController>} opt_all
 * @constructor
 * @dict
 */
xiv.ui.XtkControllerTree.ControlSet = function(c2d, c3d, opt_all){
    this['2D']  =  c2d;
    this['3D']  =  c3d;
    this['all'] =  goog.isDefAndNotNull(opt_all) ? opt_all : null;
}
goog.exportSymbol('xiv.ui.XtkControllerTree.ControlSet', 
		  xiv.ui.XtkControllerTree.ControlSet);



/**
 * @type {!string} 
 * @const
 * @expose
 */
xiv.ui.XtkControllerTree.ID_PREFIX =  'xiv.ui.XtkControllerTree';



/**
 * @enum {string}
 * @expose
 */
xiv.ui.XtkControllerTree.CSS_SUFFIX = {};



/**
 * @public
 * @return {Object}
 */
xiv.ui.XtkControllerTree.getEmptyPropertiesObject = 
function(){
    return {
	'volumes': null,
	'annotations': null,
	'meshes': null,
	'levels': null
    }
}



/**
 * @type {xiv.ui.LevelsController}
 * @private
 */
xiv.ui.XtkControllerTree.prototype.LevelsController_;



/**
 * @type {xiv.ui.VolumeController}
 * @private
 */
xiv.ui.XtkControllerTree.prototype.VolumeController_;



/**
 * @type {xiv.ui.VolumeController3D}
 * @private
 */
xiv.ui.XtkControllerTree.prototype.VolumeController3D_;



/**
 * @type {xiv.ui.MeshController3D}
 * @private
 */
xiv.ui.XtkControllerTree.prototype.MeshController3D_;



/**
 * @type {xiv.ui.AnnotationsController3D}
 * @private
 */
xiv.ui.XtkControllerTree.prototype.AnnotationsController3D_;




/**
 * @return {Array.<xiv.ui.XtkController>}
 * @public
 */
xiv.ui.XtkControllerTree.prototype.Levels = 
function(){

}



/**
 * @return {Array.<xiv.ui.XtkController>}
 * @public
 */
xiv.ui.XtkControllerTree.prototype.Annotations = 
function(){
    return this.getControllers([this.AnnotationsController3D_])
}



/**
 * @return {Array.<xiv.ui.XtkController>}
 * @public
 */
xiv.ui.XtkControllerTree.prototype.Levels = 
function(){
    return this.getControllers([this.LevelsController_])
}




/**
 * @return {Array.<xiv.ui.XtkController>}
 * @public
 */
xiv.ui.XtkControllerTree.prototype.Volumes3D = 
function(){
    return this.getControllers([this.VolumeController3D_])
}



/**
 * @private
 */
xiv.ui.XtkControllerTree.prototype.setControllersAsProperties_ = 
function(){

    this['volumes'] =
	new xiv.ui.XtkControllerTree.ControlSet(
	    null, 
	    this.getControllers([this.VolumeController3D_]),
	    this.getControllers([this.VolumeController_]));


    this['annotations'] =
	new xiv.ui.XtkControllerTree.ControlSet(
	    null, 
	    this.getControllers([this.AnnotationsController3D_]));

    this['meshes'] =
	new xiv.ui.XtkControllerTree.ControlSet(
	    null,
	    this.getControllers([this.MeshController3D_]));

    this['levels'] =
	new xiv.ui.XtkControllerTree.ControlSet(
	    null, null, 
	    this.getControllers([this.LevelsController_]));

    //this['histogram'] =
	    //new xiv.ui.XtkControllerTree.ControlSet(
    //null, null, this.Histogram());

}




/**
 * @param {Array.<xiv.ui.MasterController3D> |
 *         xiv.ui.MasterController3D |
 *         Array.<xiv.ui.MasterController2D> |
 *         xiv.ui.MasterController2D} mainControls
 * @return {Array.<xiv.ui.XtkController>}
 * @public
 */
xiv.ui.XtkControllerTree.prototype.getHistograms = 
function(mainControls) {

}





/**
 * @param {Array.<xiv.ui.MasterController3D> |
 *         xiv.ui.MasterController3D |
 *         Array.<xiv.ui.MasterController2D> |
 *         xiv.ui.MasterController2D} mainControls
 * @return {Array.<xiv.ui.XtkController>}
 * @public
 */
xiv.ui.XtkControllerTree.prototype.getControllers = 
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
 * @return {xiv.ui.LevelsController}
 * @public
 */
xiv.ui.XtkControllerTree.prototype.getLevelsController = function(){
    return this.LevelsController_;
};



/**
 * @public
 */
xiv.ui.XtkControllerTree.prototype.refresh = function() {
    var ctrls =  this.getControllers([
	this.LevelsController_,
	this.VolumeController_,
	this.VolumeController3D_,
	this.MeshController3D_,
	this.AnnotationsController3D_,
	this.FiberController3D_
    ])
    goog.array.forEach(ctrls, function(ctrl){
	ctrl.refresh();
    }.bind(this))
}




/**
 * @param {!X.object} xObj
 * @param {!gxnat.vis.RenderProperties} renderProps
 * @public
 */
xiv.ui.XtkControllerTree.prototype.createControllers = 
function(xObj, renderProps) {

    //window.console.log(xObj);
    if (xObj instanceof X.volume) {
	if (!goog.isDefAndNotNull(this.VolumeController_)){
	    this.LevelsController_ = new xiv.ui.LevelsController();
	    this.VolumeController_ = new xiv.ui.VolumeController();
	    //this.VolumeController2D_ = new xiv.ui.VolumeController2D();
	    this.VolumeController3D_ = new xiv.ui.VolumeController3D();
	}

	this.LevelsController_.add(xObj, renderProps);

	this.VolumeController_.add(xObj, renderProps);

	//this.VolumeController2D_.add(xObj, renderProps);
	this.VolumeController3D_.add(xObj, renderProps);
	
    }

    else if (xObj instanceof X.mesh) {
	if (!goog.isDefAndNotNull(this.MeshController3D_)){
	    this.MeshController3D_ = new xiv.ui.MeshController3D();
	}
	this.MeshController3D_.add(xObj, renderProps);
    }

    else if (xObj instanceof X.sphere) {
	if (!goog.isDefAndNotNull(this.AnnotationsController3D_)){
	    this.AnnotationsController3D_ = 
		new xiv.ui.AnnotationsController3D();
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
	    this.FiberController3D_ = new xiv.ui.FiberController3D();
	}
	this.FiberController3D_.add(xObj, renderProps);
    }
    */

    this.setControllersAsProperties_();
}




/**
 * @param {!string} labelTitle;
 * @public
 */
xiv.ui.XtkControllerTree.prototype.disposeInternal = function() {
    goog.base(this, 'disposeInternal');

    if (goog.isDefAndNotNull(this.LevelsController_)){
	this.LevelsController_.dispose();
	delete this.LevelsController_;
    }


    if (goog.isDefAndNotNull(this.VolumeController_)){
	this.VolumeController_.dispose();
	delete this.VolumeController_;
    }


    if (goog.isDefAndNotNull(this.VolumeController2D_)){
	this.VolumeController2D_.dispose();
	delete this.VolumeController2D_;
    }


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



goog.exportSymbol('xiv.ui.XtkControllerTree.ControlSet',
	xiv.ui.XtkControllerTree.ControlSet);
goog.exportSymbol('xiv.ui.XtkControllerTree.ID_PREFIX',
	xiv.ui.XtkControllerTree.ID_PREFIX);
goog.exportSymbol('xiv.ui.XtkControllerTree.CSS_SUFFIX',
	xiv.ui.XtkControllerTree.CSS_SUFFIX);
goog.exportSymbol('xiv.ui.XtkControllerTree.getEmptyPropertiesObject',
	xiv.ui.XtkControllerTree.getEmptyPropertiesObject);
goog.exportSymbol('xiv.ui.XtkControllerTree.prototype.Levels',
	xiv.ui.XtkControllerTree.prototype.Levels);
goog.exportSymbol('xiv.ui.XtkControllerTree.prototype.Annotations',
	xiv.ui.XtkControllerTree.prototype.Annotations);
goog.exportSymbol('xiv.ui.XtkControllerTree.prototype.Volumes3D',
	xiv.ui.XtkControllerTree.prototype.Volumes3D);
goog.exportSymbol('xiv.ui.XtkControllerTree.prototype.getHistograms',
	xiv.ui.XtkControllerTree.prototype.getHistograms);
goog.exportSymbol('xiv.ui.XtkControllerTree.prototype.getControllers',
	xiv.ui.XtkControllerTree.prototype.getControllers);
goog.exportSymbol('xiv.ui.XtkControllerTree.prototype.getLevelsController',
	xiv.ui.XtkControllerTree.prototype.getLevelsController);
goog.exportSymbol('xiv.ui.XtkControllerTree.prototype.refresh',
	xiv.ui.XtkControllerTree.prototype.refresh);
goog.exportSymbol('xiv.ui.XtkControllerTree.prototype.createControllers',
	xiv.ui.XtkControllerTree.prototype.createControllers);
goog.exportSymbol('xiv.ui.XtkControllerTree.prototype.disposeInternal',
	xiv.ui.XtkControllerTree.prototype.disposeInternal);


