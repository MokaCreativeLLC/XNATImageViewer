/**
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 */

// goog
goog.require('goog.object');
goog.require('goog.array');

// X
goog.require('X.object');

// xiv
goog.require('xiv.ui.ctrl.XtkController');
goog.require('xiv.ui.ctrl.CheckboxController');
goog.require('xiv.ui.ctrl.SliderController');
goog.require('xiv.ui.ctrl.TwoThumbSliderController');

//-----------



/**
 *
 * @constructor
 * @extends {xiv.ui.ctrl.XtkController}
 */
goog.provide('xiv.ui.ctrl.MasterController');
xiv.ui.ctrl.MasterController = function() {
    goog.base(this);


    /**
     * @type {!Array.<X.object>}
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
 * @expose
 */
xiv.ui.ctrl.MasterController.CSS_SUFFIX = {};


/**
 * @enum {string}
 * @dict
 */
xiv.ui.ctrl.MasterController.CONTROLLERS = {};



/**
 * @param {!X.object} xObj
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



goog.exportSymbol('xiv.ui.ctrl.MasterController.ID_PREFIX',
	xiv.ui.ctrl.MasterController.ID_PREFIX);
goog.exportSymbol('xiv.ui.ctrl.MasterController.CSS_SUFFIX',
	xiv.ui.ctrl.MasterController.CSS_SUFFIX);
goog.exportSymbol('xiv.ui.ctrl.MasterController.CONTROLLERS',
	xiv.ui.ctrl.MasterController.CONTROLLERS);
goog.exportSymbol('xiv.ui.ctrl.MasterController.prototype.add',
	xiv.ui.ctrl.MasterController.prototype.add);
goog.exportSymbol('xiv.ui.ctrl.MasterController.prototype.disposeInternal',
	xiv.ui.ctrl.MasterController.prototype.disposeInternal);
