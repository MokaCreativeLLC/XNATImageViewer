/**
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 */

// goog
goog.require('goog.dom');

// utils
goog.require('nrg.ui.Slider');




/**
 * xiv.ui.layouts.interactors.Slider
 *
 * @constructor
 * @extends {nrg.ui.Slider}
 */
goog.provide('xiv.ui.layouts.interactors.Slider');
xiv.ui.layouts.interactors.Slider = function() { 
    goog.base(this);
}
goog.inherits(xiv.ui.layouts.interactors.Slider, nrg.ui.Slider);
goog.exportSymbol('xiv.ui.layouts.interactors.Slider', 
		  xiv.ui.layouts.interactors.Slider);



/**
 * Event types.
 * @enum {string}
 * @public
 */
xiv.ui.layouts.interactors.Slider.EventType = {}



/**
 * @type {!string} 
 * @const
 * @expose
 */
xiv.ui.layouts.interactors.Slider.ID_PREFIX =  
    'xiv.ui.layouts.interactors.Slider';




/**
 * @enum {string}
 * @public
 */
xiv.ui.layouts.interactors.Slider.CSS_SUFFIX = {}




/**
 * @inheritDoc
 */
xiv.ui.layouts.interactors.Slider.prototype.render = 
function(parentElement) {

}




/**
* @inheritDoc
*/
xiv.ui.layouts.interactors.Slider.prototype.disposeInternal = function(){
    goog.base(this, 'disposeInternal');
   
}




