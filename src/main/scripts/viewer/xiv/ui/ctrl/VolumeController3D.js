/**
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 */

// goog
goog.require('goog.object');

// xiv
goog.require('xiv.ui.ctrl.MasterController3D');



/**
 *
 * @constructor
 * @extends {xiv.ui.ctrl.MasterController3D}
 */
goog.provide('xiv.ui.ctrl.VolumeController3D');
xiv.ui.ctrl.VolumeController3D = function() {
    goog.base(this);
}
goog.inherits(xiv.ui.ctrl.VolumeController3D, xiv.ui.ctrl.MasterController3D);
goog.exportSymbol('xiv.ui.ctrl.VolumeController3D', 
		  xiv.ui.ctrl.VolumeController3D);


/**
 * @type {!string} 
 * @const
 * @expose
 */
xiv.ui.ctrl.VolumeController3D.ID_PREFIX =  'xiv.ui.ctrl.VolumeController3D';



/**
 * @enum {string}
 * @public
 */
xiv.ui.ctrl.VolumeController3D.CSS_SUFFIX = {};



/**
 * @param {!X.Object} xObj
 * @public
 */
xiv.ui.ctrl.VolumeController3D.prototype.addMasterControls_ = function() {

}



/**
 * @param {!string} labelTitle;
 * @public
 */
xiv.ui.ctrl.VolumeController3D.prototype.disposeInternal = function() {
    goog.base(this, 'disposeInternal');
    
    window.console.log("need to implement dispose methods" + 
		       " for VolumeController3D");
}



