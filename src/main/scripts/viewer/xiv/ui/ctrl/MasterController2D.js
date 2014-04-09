/**
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 */

// goog
goog.require('goog.object');

// xiv
goog.require('xiv.ui.ctrl.XtkController');
goog.require('xiv.ui.ctrl.CheckboxController');
goog.require('xiv.ui.ctrl.RadioButtonController');




/**
 *
 * @constructor
 * @extends {xiv.ui.ctrl.XtkController}
 */
goog.provide('xiv.ui.ctrl.MasterController2D');
xiv.ui.ctrl.MasterController2D = function() {
    goog.base(this);


    /**
     * @type {!Array.<X.Object>}
     * @private
     */
    this.xObjs_ = [];
}
goog.inherits(xiv.ui.ctrl.MasterController2D, xiv.ui.ctrl.XtkController);
goog.exportSymbol('xiv.ui.ctrl.MasterController2D', 
		  xiv.ui.ctrl.MasterController2D);


/**
 * @type {!string} 
 * @const
 * @expose
 */
xiv.ui.ctrl.MasterController2D.ID_PREFIX =  'xiv.ui.ctrl.MasterController2D';



/**
 * @enum {string}
 * @public
 */
xiv.ui.ctrl.MasterController2D.CSS_SUFFIX = {};



/**
 * @param {!X.Object} xObj
 * @public
 */
xiv.ui.ctrl.MasterController2D.prototype.add = function(xObj) {}





/**
 * @param {!string} labelTitle;
 * @public
 */
xiv.ui.ctrl.MasterController2D.prototype.disposeInternal = function() {
    goog.base(this, 'disposeInternal');

    // XObjs
    goog.array.clear(this.xObjs_);
    delete this.xObjs_;

}


