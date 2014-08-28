/**
 * @author kumar.sunil.p@gmail.com (Sunil Kumar)
 */
goog.provide('xiv.ui.FrameSlider');

// goog
goog.require('goog.dom');

// nrg
goog.require('nrg.ui.Slider');

// xiv

//-----------




/**
 * xiv.ui.FrameSlider
 *
 * @constructor
 * @extends {nrg.ui.Slider}
 */
xiv.ui.FrameSlider = function() { 
    goog.base(this);
}
goog.inherits(xiv.ui.FrameSlider, nrg.ui.Slider);
goog.exportSymbol('xiv.ui.FrameSlider', 
		  xiv.ui.FrameSlider);



/**
 * Event types.
 * @enum {string}
 * @public
 */
xiv.ui.FrameSlider.EventType = {}



/**
 * @type {!string} 
 * @const
 * @expose
 */
xiv.ui.FrameSlider.ID_PREFIX =  
    'xiv.ui.FrameSlider';




/**
 * @enum {string}
 * @expose
 */
xiv.ui.FrameSlider.CSS_SUFFIX = {}




/**
 * @inheritDoc
 */
xiv.ui.FrameSlider.prototype.render = 
function(parentElement) {
    goog.base(this, 'render');
}




/**
* @inheritDoc
*/
xiv.ui.FrameSlider.prototype.disposeInternal = function(){
    goog.base(this, 'disposeInternal');
   
}




goog.exportSymbol('xiv.ui.FrameSlider.EventType',
	xiv.ui.FrameSlider.EventType);
goog.exportSymbol('xiv.ui.FrameSlider.ID_PREFIX',
	xiv.ui.FrameSlider.ID_PREFIX);
goog.exportSymbol('xiv.ui.FrameSlider.CSS_SUFFIX',
	xiv.ui.FrameSlider.CSS_SUFFIX);
goog.exportSymbol('xiv.ui.FrameSlider.prototype.render',
	xiv.ui.FrameSlider.prototype.render);
goog.exportSymbol('xiv.ui.FrameSlider.prototype.disposeInternal',
	xiv.ui.FrameSlider.prototype.disposeInternal);



