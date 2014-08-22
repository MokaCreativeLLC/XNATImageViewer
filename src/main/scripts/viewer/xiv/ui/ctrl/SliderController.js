/**
 * @author kumar.sunil.p@gmail.com (Sunil Kumar)
 */
goog.provide('xiv.ui.ctrl.SliderController');


// xiv
goog.require('xiv.ui.ctrl.SliderBase');

//-----------



/**
 * @constructor
 * @extends {xiv.ui.ctrl.SliderBase}
 */
xiv.ui.ctrl.SliderController = function(){
    goog.base(this);
    this.setLabel('Master Opacity');
}
goog.inherits(xiv.ui.ctrl.SliderController, xiv.ui.ctrl.SliderBase);
goog.exportSymbol('xiv.ui.ctrl.SliderController', xiv.ui.ctrl.SliderController);


/**
 * @const
 * @public
 */
xiv.ui.ctrl.SliderController.ID_PREFIX =  'xiv.ui.ctrl.SliderController';


goog.exportSymbol('xiv.ui.ctrl.SliderController.ID_PREFIX', 
		  xiv.ui.ctrl.SliderController.ID_PREFIX);
