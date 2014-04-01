/**
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 */

// goog
goog.require('goog.object');

// xiv
goog.require('xiv.ui.ctrl.MasterController');



/**
 *
 * @constructor
 * @extends {xiv.ui.ctrl.MasterController}
 */
goog.provide('xiv.ui.ctrl.VolumeController2D');
xiv.ui.ctrl.VolumeController2D = function() {
    goog.base(this);
}
goog.inherits(xiv.ui.ctrl.VolumeController2D, xiv.ui.ctrl.MasterController);
goog.exportSymbol('xiv.ui.ctrl.VolumeController2D', xiv.ui.ctrl.VolumeController2D);


/**
 * @type {!string} 
 * @const
 * @expose
 */
xiv.ui.ctrl.VolumeController2D.ID_PREFIX =  'xiv.ui.ctrl.VolumeController2D';



/**
 * @enum {string}
 * @public
 */
xiv.ui.ctrl.VolumeController2D.CSS_SUFFIX = {};



/**
 * @param {!string} labelTitle;
 * @public
 */
xiv.ui.ctrl.VolumeController2D.prototype.disposeInternal = function() {
    goog.base(this, 'disposeInternal');
    
    window.console.log("need to implement dispose methods" + 
		       " for VolumeController2D");
}



