/**
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 */

// goog

// xiv
goog.require('xiv.ui.ctrl.SliderController');




/**
 * @constructor
 * @extends {xiv.ui.ctrl.SliderController}
 */
xiv.ui.ctrl.MasterOpacity = function(){
    goog.base(this);

    this.setLabel('Master Opacity');

}

goog.inherits(xiv.ui.ctrl.MasterOpacity, xiv.ui.ctrl.SliderController);
goog.exportSymbol('xiv.ui.ctrl.MasterOpacity', xiv.ui.ctrl.MasterOpacity);



/**
 * @const
 * @public
 */
xiv.ui.ctrl.MasterOpacity.ID_PREFIX =  'xiv.ui.ctrl.MasterOpacity';


/**
 * @enum {string}
 * @public
 */
xiv.ui.ctrl.MasterOpacity.CSS_SUFFIX = {};

