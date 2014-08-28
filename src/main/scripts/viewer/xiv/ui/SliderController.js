/**
 * @author kumar.sunil.p@gmail.com (Sunil Kumar)
 */
goog.provide('xiv.ui.SliderController');


// xiv
goog.require('xiv.ui.SliderBase');

//-----------



/**
 * @constructor
 * @extends {xiv.ui.SliderBase}
 */
xiv.ui.SliderController = function(){
    goog.base(this);
    this.setLabel('Master Opacity');
}
goog.inherits(xiv.ui.SliderController, xiv.ui.SliderBase);
goog.exportSymbol('xiv.ui.SliderController', xiv.ui.SliderController);


/**
 * @const
 * @public
 */
xiv.ui.SliderController.ID_PREFIX =  'xiv.ui.SliderController';


goog.exportSymbol('xiv.ui.SliderController.ID_PREFIX', 
		  xiv.ui.SliderController.ID_PREFIX);
