/**
 * @author kumar.sunil.p@gmail.com (Sunil Kumar)
 */
goog.provide('xiv.ui.MasterController2D');

// goog
goog.require('goog.object');
goog.require('goog.array');

// X
goog.require('X.object');

// xiv
goog.require('xiv.ui.XtkController');
goog.require('xiv.ui.CheckboxController');
goog.require('xiv.ui.RadioButtonController');

//-----------



/**
 *
 * @constructor
 * @extends {xiv.ui.XtkController}
 */
xiv.ui.MasterController2D = function() {
    goog.base(this);


    /**
     * @type {!Array.<X.object>}
     * @private
     */
    this.xObjs_ = [];
}
goog.inherits(xiv.ui.MasterController2D, xiv.ui.XtkController);
goog.exportSymbol('xiv.ui.MasterController2D', 
		  xiv.ui.MasterController2D);


/**
 * @type {!string} 
 * @const
 * @expose
 */
xiv.ui.MasterController2D.ID_PREFIX =  'xiv.ui.MasterController2D';



/**
 * @enum {string}
 * @expose
 */
xiv.ui.MasterController2D.CSS_SUFFIX = {};



/**
 * @param {!X.object} xObj
 * @public
 */
xiv.ui.MasterController2D.prototype.add = function(xObj) {}





/**
 * @param {!string} labelTitle;
 * @public
 */
xiv.ui.MasterController2D.prototype.disposeInternal = function() {
    goog.base(this, 'disposeInternal');

    // XObjs
    goog.array.clear(this.xObjs_);
    delete this.xObjs_;

}



goog.exportSymbol('xiv.ui.MasterController2D.ID_PREFIX',
	xiv.ui.MasterController2D.ID_PREFIX);
goog.exportSymbol('xiv.ui.MasterController2D.CSS_SUFFIX',
	xiv.ui.MasterController2D.CSS_SUFFIX);
goog.exportSymbol('xiv.ui.MasterController2D.prototype.add',
	xiv.ui.MasterController2D.prototype.add);
goog.exportSymbol('xiv.ui.MasterController2D.prototype.disposeInternal',
	xiv.ui.MasterController2D.prototype.disposeInternal);
