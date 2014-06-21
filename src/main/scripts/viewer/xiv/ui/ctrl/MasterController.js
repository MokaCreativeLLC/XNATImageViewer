/**
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 */

// goog
goog.require('goog.object');

// xiv
goog.require('xiv.ui.ctrl.XtkController');
goog.require('xiv.ui.ctrl.CheckboxController');
goog.require('xiv.ui.ctrl.SliderController');
goog.require('xiv.ui.ctrl.TwoThumbSliderController');



/**
 *
 * @constructor
 * @extends {xiv.ui.ctrl.XtkController}
 */
goog.provide('xiv.ui.ctrl.MasterController');
xiv.ui.ctrl.MasterController = function() {
    goog.base(this);


    /**
     * @type {!Array.<X.Object>}
     * @protected
     */
    this.xObjs = [];
}
goog.inherits(xiv.ui.ctrl.MasterController, xiv.ui.ctrl.XtkController);
goog.exportSymbol('xiv.ui.ctrl.MasterController', 
		  xiv.ui.ctrl.MasterController);


/**
 * @type {!string} 
 * @const
 * @expose
 */
xiv.ui.ctrl.MasterController.ID_PREFIX =  'xiv.ui.ctrl.MasterController';



/**
 * @enum {string}
 * @public
 */
xiv.ui.ctrl.MasterController.CSS_SUFFIX = {};


/**
 * @enum {string}
 * @dict
 */
xiv.ui.ctrl.MasterController.CONTROLLERS = {};



/**
 * @param {!X.Object} xObj
 * @public
 */
xiv.ui.ctrl.MasterController.prototype.add = function(xObj) {
    this.xObjs.push(xObj);
}



/**
 * @param {!string} labelTitle;
 * @public
 */
xiv.ui.ctrl.MasterController.prototype.disposeInternal = function() {
    goog.base(this, 'disposeInternal');

    // XObjs
    goog.array.clear(this.xObjs);
    delete this.xObjs;
}



