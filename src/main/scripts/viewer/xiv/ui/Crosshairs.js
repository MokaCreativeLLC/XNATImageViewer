/**
 * @author kumar.sunil.p@gmail.com (Sunil Kumar)
 */
goog.provide('xiv.ui.Crosshairs');

// goog
goog.require('goog.object');
goog.require('goog.string');
goog.require('goog.dom');

// nrg
goog.require('nrg.ui.Component');

//-----------




/**
 * xiv.ui.Crosshairs
 *
 * @constructor
 * @extends {nrg.ui.Component}
 */
xiv.ui.Crosshairs = function() { 
    goog.base(this);
}
goog.inherits(xiv.ui.Crosshairs, nrg.ui.Component);
goog.exportSymbol('xiv.ui.Crosshairs', 
		  xiv.ui.Crosshairs);



/**
 * Event types.
 * @enum {string}
 * @public
 */
xiv.ui.Crosshairs.EventType = {}



/**
 * @type {!string} 
 * @const
 * @expose
 */
xiv.ui.Crosshairs.ID_PREFIX =  
    'xiv.ui.Crosshairs';




/**
 * @enum {string}
 * @expose
 */
xiv.ui.Crosshairs.CSS_SUFFIX = {
    HORIZONTAL: 'horizontal',
    VERTICAL: 'vertical',
}



/**
 * @type {!Element}
 * @public
 */
xiv.ui.Crosshairs.prototype.vertical = null;



/**
 * @type {!Element}
 * @public
 */
xiv.ui.Crosshairs.prototype.horizontal = null;



/**
 * @param {!number} num
 * @public
 */
xiv.ui.Crosshairs.prototype.setX = function(num){
    if (goog.isDefAndNotNull(num)){
	this.vertical.style.left = (num).toString() + 'px';
    }
} 


/**
 * @param {!number} num
 * @public
 */
xiv.ui.Crosshairs.prototype.setY = function(num){
    if (goog.isDefAndNotNull(num)){
	this.horizontal.style.top = (num).toString() + 'px';
    }
} 



/**
 * @inheritDoc
 */
xiv.ui.Crosshairs.prototype.render = 
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
xiv.ui.Crosshairs.prototype.validateOrientation_ = 
function(orientation) {
    if (!goog.object.containsValue(
	xiv.ui.Crosshairs.CSS_SUFFIX, orientation)){
	throw new Error ('Invalid orientation: ' + orientation);
    }
}



/**
 * @param {boolean} visible
 * @public
 */
xiv.ui.Crosshairs.prototype.toggleVisible = 
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
xiv.ui.Crosshairs.prototype.createCrosshair_ = 
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
xiv.ui.Crosshairs.prototype.disposeInternal = function(){
    goog.base(this, 'disposeInternal');
    
    // vertical
    goog.dom.removeNode(this.vertical);
    delete this.vertical;

    // horizontal
    goog.dom.removeNode(this.horizontal);
    delete this.horizontal;
}



goog.exportSymbol('xiv.ui.Crosshairs.EventType',
	xiv.ui.Crosshairs.EventType);
goog.exportSymbol('xiv.ui.Crosshairs.ID_PREFIX',
	xiv.ui.Crosshairs.ID_PREFIX);
goog.exportSymbol('xiv.ui.Crosshairs.CSS_SUFFIX',
	xiv.ui.Crosshairs.CSS_SUFFIX);
goog.exportSymbol('xiv.ui.Crosshairs.prototype.vertical',
	xiv.ui.Crosshairs.prototype.vertical);
goog.exportSymbol('xiv.ui.Crosshairs.prototype.horizontal',
	xiv.ui.Crosshairs.prototype.horizontal);
goog.exportSymbol('xiv.ui.Crosshairs.prototype.setX',
	xiv.ui.Crosshairs.prototype.setX);
goog.exportSymbol('xiv.ui.Crosshairs.prototype.setY',
	xiv.ui.Crosshairs.prototype.setY);
goog.exportSymbol('xiv.ui.Crosshairs.prototype.render',
	xiv.ui.Crosshairs.prototype.render);
goog.exportSymbol(
    'xiv.ui.Crosshairs.prototype.toggleVisible',
    xiv.ui.Crosshairs.prototype.toggleVisible);
goog.exportSymbol(
    'xiv.ui.Crosshairs.prototype.disposeInternal',
    xiv.ui.Crosshairs.prototype.disposeInternal);



