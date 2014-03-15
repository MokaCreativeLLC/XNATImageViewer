/**
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 */

// goog
goog.require('goog.ui.Component');
goog.require('goog.string');

// moka
goog.require('moka.dom');
goog.require('moka.style');



/**
 * moka.ui.Component is the parent class for many of the interactive 
 * ui elements.
 * 
 * @constructor
 * @extends {goog.ui.Component}
 * @param {string=} opt_domHelper Optional DOM helper.
 */
goog.provide('moka.ui.Component');
moka.ui.Component = function (opt_domHelper) {
    goog.base(this, opt_domHelper);

    moka.ui.Component.validateIdPrefix_(this);
    moka.ui.Component.createElementClass_(this, opt_domHelper);

    // Parent elt.
    this.setElementInternal(
	moka.dom.createUniqueDom('div', this['ID_PREFIX'], opt_domHelper))
};

goog.inherits(moka.ui.Component, goog.ui.Component);
goog.exportSymbol('moka.ui.Component', moka.ui.Component);



/**
 * Validates the ID_PREFIX property of the moka.ui.Component subclass.
 * @param {!Object} obj The object to validate. 
 * @private
 */
moka.ui.Component.validateIdPrefix_ = function(obj) {

    var idPrefixDefined = /**@type {string}*/ 
	obj.constructor.ID_PREFIX || obj.ID_PREFIX; 

    if (!idPrefixDefined){
	window.console.log("WARNING: moka.ui.Component subclass should " + 
			   "have the property 'ID_PREFIX' .");
	idPrefixDefined = 'moka.ui.Component_' + 
	    goog.string.createUniqueString();
    }

    obj['ID_PREFIX'] = idPrefixDefined;
}





/**
 * Sets and/or creates the class arguments of the constructor.
 * @param {!Object} obj The object to validate.
 * @param {!Object} args The args to modify and/or add properties to.   
 * @private
 */
moka.ui.Component.createElementClass_ = function(obj, args) {
    if (args && !args['class']){
	var classDefined = /**@type {string}*/ 
	obj.constructor.ELEMENT_CLASS || obj.ELEMENT_CLASS;

	args['class'] = classDefined ? 
	    classDefined : 
	    goog.string.toSelectorCase(
		obj['ID_PREFIX'].toLowerCase().replace(/\./g,'-'))
    }
}



/**
 * @type {!string}
 * @protected
 */  
moka.ui.Component.prototype.iconBaseUrl = '';



/**
 * @type {!string}
 * @protected
 */  
moka.ui.Component.prototype.iconUrl = '';



/**
 * Sets the icon url to derive any images from.
 * @param {!string} url The url to derive the icon images from.
 * @public
 */
moka.ui.Component.prototype.setIconBaseUrl = function(url) {
    this.iconBaseUrl = url;
    this.iconUrl = goog.string.path.join( this.iconBaseUrl, 
				this.constructor.ID_PREFIX.replace(/\./g,'/'));
    if (this.updateIconSrcFolder){
	this.updateIconSrcFolder();
    }
}


/**
 * As stated.
 * @return {!string} The URL.
 * @public
 */
moka.ui.Component.prototype.getIconBaseUrl = function() {
    return this.iconBaseUrl;
}



/**
 * As stated.
 * @return {!string} The URL.
 * @public
 */
moka.ui.Component.prototype.getIconUrl = function() {
    return this.iconUrl;
}




/**
 * Creates the sub-components of the UI component.
 * @protected
 */
moka.ui.Component.prototype.createSubComponents = function() {
    // do nothing
}
