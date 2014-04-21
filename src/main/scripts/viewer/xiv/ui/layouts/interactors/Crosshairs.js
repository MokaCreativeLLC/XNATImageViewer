/**
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 */

// goog
goog.require('goog.dom');

// utils
goog.require('moka.ui.Component');




/**
 * xiv.ui.layouts.interactors.Crosshairs
 *
 * @constructor
 * @extends {moka.ui.Component}
 */
goog.provide('xiv.ui.layouts.interactors.Crosshairs');
xiv.ui.layouts.interactors.Crosshairs = function() { 
    goog.base(this);

   /**
    * @type {!Element}
    * @public
    */
    this.vertical = this.createCrosshair_('vertical');


   /**
    * @type {!Element}
    * @public
    */
    this.horizontal = this.createCrosshair_('horizontal');

}
goog.inherits(xiv.ui.layouts.interactors.Crosshairs, moka.ui.Component);
goog.exportSymbol('xiv.ui.layouts.interactors.Crosshairs', 
		  xiv.ui.layouts.interactors.Crosshairs);



/**
 * Event types.
 * @enum {string}
 * @public
 */
xiv.ui.layouts.interactors.Crosshairs.EventType = {}



/**
 * @type {!string} 
 * @const
 * @expose
 */
xiv.ui.layouts.interactors.Crosshairs.ID_PREFIX =  
    'xiv.ui.layouts.interactors.Crosshairs';




/**
 * @enum {string}
 * @public
 */
xiv.ui.layouts.interactors.Crosshairs.CSS_SUFFIX = {
    HORIZONTAL: 'horizontal',
    VERTICAL: 'vertical',
}



/**
 * @private
 * @param {!string} orientation
 * @return {!Element}
 */
xiv.ui.layouts.interactors.Crosshairs.prototype.validateOrientation_ = 
function(orientation) {
    if (!goog.object.containsValue(
	xiv.ui.layouts.interactors.Crosshairs.CSS_SUFFIX, orientation)){
	throw new Error ('Invalid orientation: ' + orientation);
    }
}



/**
 * @private
 * @param {!string} orientation
 * @return {!Element}
 */
xiv.ui.layouts.interactors.Crosshairs.prototype.createCrosshair_ = 
function(orientation) {
    orientation = orientation.toLowerCase();
    this.validateOrientation_(orientation);
    return goog.dom.createDom('div', {
	'id': this.constructor.ID_PREFIX + '_' + orientation + '_' +
	    goog.string.createUniqueString(),
	'class': goog.getCssName(this.constructor.ELEMENT_CLASS, 
				 orientation)
    })
}


/**
* @inheritDoc
*/
xiv.ui.layouts.interactors.Crosshairs.prototype.disposeInternal = function(){
    goog.base(this, 'disposeInternal');
    
    // vertical
    goog.dom.removeNode(this.vertical);
    delete this.vertical;

    // horizontal
    goog.dom.removeNode(this.horizontal);
    delete this.horizontal;
}




