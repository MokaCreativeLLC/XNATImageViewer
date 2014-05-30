/**
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 */

// goog
goog.require('goog.dom');
goog.require('goog.cssom');

// utils
goog.require('nrg.ui.Component');




/**
 * xiv.ui.layouts.interactors.ZoomDisplay
 *
 * @constructor
 * @extends {nrg.ui.Component}
 */
goog.provide('xiv.ui.layouts.interactors.ZoomDisplay');
xiv.ui.layouts.interactors.ZoomDisplay = function() { 
    goog.base(this);
}
goog.inherits(xiv.ui.layouts.interactors.ZoomDisplay, nrg.ui.Component);
goog.exportSymbol('xiv.ui.layouts.interactors.ZoomDisplay', 
		  xiv.ui.layouts.interactors.ZoomDisplay);



/**
 * Event types.
 * @enum {string}
 * @public
 */
xiv.ui.layouts.interactors.ZoomDisplay.EventType = {}



/**
 * @type {!string} 
 * @const
 * @expose
 */
xiv.ui.layouts.interactors.ZoomDisplay.ID_PREFIX =  
    'xiv.ui.layouts.interactors.ZoomDisplay';



/**
 * @enum {string}
 * @public
 */
xiv.ui.layouts.interactors.ZoomDisplay.CSS_SUFFIX = {}



/**
 * @param {!number} num
 * @public
 */
xiv.ui.layouts.interactors.ZoomDisplay.prototype.setValue = function(num){
    this.getElement().innerHTML = 'Zoom Level: ' +
	Math.round(num * 100).toString() + '%';
}





/**
 * @inheritDoc
 */
xiv.ui.layouts.interactors.ZoomDisplay.prototype.render = 
function(parentElement) {

    //
    // superclass
    //
    goog.base(this, 'render', parentElement);
}



/**
* @inheritDoc
*/
xiv.ui.layouts.interactors.ZoomDisplay.prototype.disposeInternal = function(){
    goog.base(this, 'disposeInternal');
}




