/**
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 */

// goog
goog.require('goog.object');
goog.require('goog.string');
goog.require('goog.dom');

// nrg
goog.require('nrg.ui.Component');

//-----------




/**
 * xiv.ui.layouts.interactors.Crosshairs
 *
 * @constructor
 * @extends {nrg.ui.Component}
 */
goog.provide('xiv.ui.layouts.interactors.Crosshairs');
xiv.ui.layouts.interactors.Crosshairs = function() { 
    goog.base(this);
}
goog.inherits(xiv.ui.layouts.interactors.Crosshairs, nrg.ui.Component);
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
 * @expose
 */
xiv.ui.layouts.interactors.Crosshairs.CSS_SUFFIX = {
    HORIZONTAL: 'horizontal',
    VERTICAL: 'vertical',
}



/**
 * @type {!Element}
 * @public
 */
xiv.ui.layouts.interactors.Crosshairs.prototype.vertical = null;



/**
 * @type {!Element}
 * @public
 */
xiv.ui.layouts.interactors.Crosshairs.prototype.horizontal = null;



/**
 * @param {!number} num
 * @public
 */
xiv.ui.layouts.interactors.Crosshairs.prototype.setX = function(num){
    if (goog.isDefAndNotNull(num)){
	this.vertical.style.left = (num).toString() + 'px';
    }
} 


/**
 * @param {!number} num
 * @public
 */
xiv.ui.layouts.interactors.Crosshairs.prototype.setY = function(num){
    if (goog.isDefAndNotNull(num)){
	this.horizontal.style.top = (num).toString() + 'px';
    }
} 



/**
 * @inheritDoc
 */
xiv.ui.layouts.interactors.Crosshairs.prototype.render = 
function(parentElement) {

    this.vertical = this.createCrosshair_('vertical');
    this.horizontal = this.createCrosshair_('horizontal');

    // No need to call the parent class
    goog.dom.appendChild(parentElement, this.horizontal);
    goog.dom.appendChild(parentElement, this.vertical);
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
 * @param {boolean} visible
 * @public
 */
xiv.ui.layouts.interactors.Crosshairs.prototype.toggleVisible = 
function(visible) {
    var visibility  = (visible === false) ? 'hidden' : 'visible';
    //window.console.log('\n\nVISIBLE!', visibility);
    this.vertical.style.visibility = visibility;
    this.horizontal.style.visibility = visibility; 
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
	'class': this.constructor.ELEMENT_CLASS + '-' + 
	    orientation.toLowerCase()
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



goog.exportSymbol('xiv.ui.layouts.interactors.Crosshairs.EventType',
	xiv.ui.layouts.interactors.Crosshairs.EventType);
goog.exportSymbol('xiv.ui.layouts.interactors.Crosshairs.ID_PREFIX',
	xiv.ui.layouts.interactors.Crosshairs.ID_PREFIX);
goog.exportSymbol('xiv.ui.layouts.interactors.Crosshairs.CSS_SUFFIX',
	xiv.ui.layouts.interactors.Crosshairs.CSS_SUFFIX);
goog.exportSymbol('xiv.ui.layouts.interactors.Crosshairs.prototype.vertical',
	xiv.ui.layouts.interactors.Crosshairs.prototype.vertical);
goog.exportSymbol('xiv.ui.layouts.interactors.Crosshairs.prototype.horizontal',
	xiv.ui.layouts.interactors.Crosshairs.prototype.horizontal);
goog.exportSymbol('xiv.ui.layouts.interactors.Crosshairs.prototype.setX',
	xiv.ui.layouts.interactors.Crosshairs.prototype.setX);
goog.exportSymbol('xiv.ui.layouts.interactors.Crosshairs.prototype.setY',
	xiv.ui.layouts.interactors.Crosshairs.prototype.setY);
goog.exportSymbol('xiv.ui.layouts.interactors.Crosshairs.prototype.render',
	xiv.ui.layouts.interactors.Crosshairs.prototype.render);
goog.exportSymbol(
    'xiv.ui.layouts.interactors.Crosshairs.prototype.toggleVisible',
    xiv.ui.layouts.interactors.Crosshairs.prototype.toggleVisible);
goog.exportSymbol(
    'xiv.ui.layouts.interactors.Crosshairs.prototype.disposeInternal',
    xiv.ui.layouts.interactors.Crosshairs.prototype.disposeInternal);



