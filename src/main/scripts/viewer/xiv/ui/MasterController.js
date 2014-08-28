/**
 * @author kumar.sunil.p@gmail.com (Sunil Kumar)
 */
goog.provide('xiv.ui.MasterController');

// goog
goog.require('goog.object');
goog.require('goog.array');

// X
goog.require('X.object');

// xiv
goog.require('xiv.ui.XtkController');
goog.require('xiv.ui.CheckboxController');
goog.require('xiv.ui.SliderController');
goog.require('xiv.ui.TwoThumbSliderController');

//-----------



/**
 *
 * @constructor
 * @extends {xiv.ui.XtkController}
 */
xiv.ui.MasterController = function() {
    goog.base(this);


    /**
     * @type {!Array.<X.object>}
     * @protected
     */
    this.xObjs = [];
}
goog.inherits(xiv.ui.MasterController, xiv.ui.XtkController);
goog.exportSymbol('xiv.ui.MasterController', 
		  xiv.ui.MasterController);


/**
 * @type {!string} 
 * @const
 * @expose
 */
xiv.ui.MasterController.ID_PREFIX =  'xiv.ui.MasterController';



/**
 * @enum {string}
 * @expose
 */
xiv.ui.MasterController.CSS_SUFFIX = {};


/**
 * @enum {string}
 * @dict
 */
xiv.ui.MasterController.CONTROLLERS = {};



/**
 * @param {!X.object} xObj
 * @public
 */
xiv.ui.MasterController.prototype.add = function(xObj) {
    this.xObjs.push(xObj);
}


/**
 * @param {!string} labelTitle;
 * @public
 */
xiv.ui.MasterController.prototype.disposeInternal = function() {
    goog.base(this, 'disposeInternal');

    // XObjs
    goog.array.clear(this.xObjs);
    delete this.xObjs;
}



goog.exportSymbol('xiv.ui.MasterController.ID_PREFIX',
	xiv.ui.MasterController.ID_PREFIX);
goog.exportSymbol('xiv.ui.MasterController.CSS_SUFFIX',
	xiv.ui.MasterController.CSS_SUFFIX);
goog.exportSymbol('xiv.ui.MasterController.CONTROLLERS',
	xiv.ui.MasterController.CONTROLLERS);
goog.exportSymbol('xiv.ui.MasterController.prototype.add',
	xiv.ui.MasterController.prototype.add);
goog.exportSymbol('xiv.ui.MasterController.prototype.disposeInternal',
	xiv.ui.MasterController.prototype.disposeInternal);
