/**
 * @author kumar.sunil.p@gmail.com (Sunil Kumar)
 */
goog.provide('xiv.ui.layouts.interactors.Slider');

// goog
goog.require('goog.dom');

// nrg
goog.require('nrg.ui.Slider');

// xiv

//-----------




/**
 * xiv.ui.layouts.interactors.Slider
 *
 * @constructor
 * @extends {nrg.ui.Slider}
 */
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
 * @expose
 */
xiv.ui.layouts.interactors.Slider.CSS_SUFFIX = {}




/**
 * @inheritDoc
 */
xiv.ui.layouts.interactors.Slider.prototype.render = 
function(parentElement) {
    goog.base(this, 'render');
}




/**
* @inheritDoc
*/
xiv.ui.layouts.interactors.Slider.prototype.disposeInternal = function(){
    goog.base(this, 'disposeInternal');
   
}




goog.exportSymbol('xiv.ui.layouts.interactors.Slider.EventType',
	xiv.ui.layouts.interactors.Slider.EventType);
goog.exportSymbol('xiv.ui.layouts.interactors.Slider.ID_PREFIX',
	xiv.ui.layouts.interactors.Slider.ID_PREFIX);
goog.exportSymbol('xiv.ui.layouts.interactors.Slider.CSS_SUFFIX',
	xiv.ui.layouts.interactors.Slider.CSS_SUFFIX);
goog.exportSymbol('xiv.ui.layouts.interactors.Slider.prototype.render',
	xiv.ui.layouts.interactors.Slider.prototype.render);
goog.exportSymbol('xiv.ui.layouts.interactors.Slider.prototype.disposeInternal',
	xiv.ui.layouts.interactors.Slider.prototype.disposeInternal);



