/**
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 */

// goog
goog.require('goog.ui.Component');
goog.require('goog.string');
goog.require('goog.object');

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

    // Validate ID_PREFIX
    moka.ui.Component.validateIdPrefix_(this);

    // Parent elt.
    this.setElementInternal(
	moka.dom.createUniqueDom('div', this.constructor.ID_PREFIX, 
				 opt_domHelper));

    
    // Add element class
    goog.dom.classes.add(this.getElement(), this.constructor.ELEMENT_CLASS);

    // Create CSS map
    moka.ui.Component.createCssMap_(this);
};

goog.inherits(moka.ui.Component, goog.ui.Component);
goog.exportSymbol('moka.ui.Component', moka.ui.Component);



/**
 * Validates the ID_PREFIX property of the moka.ui.Component subclass.
 * @param {!Object} obj The object to validate. 
 * @throws {Error} If the constructor property 'ID_PREFIX' is not defined.
 * @private
 */
moka.ui.Component.validateIdPrefix_ = function(obj) {

    if (!obj.constructor.ID_PREFIX){
	throw new Error("moka.ui.Component subclass should " + 
			   "have the property 'ID_PREFIX' .", obj);
    }

    // We can assume the other properties are defined if CSS_CLASS_PREFIX is.
    if (goog.isDef(obj.constructor.CSS_CLASS_PREFIX)) {
	return;
    }

    obj.constructor.CSS_CLASS_PREFIX = 
	obj.constructor.ID_PREFIX.toLowerCase().replace(/\./g,'-');
    obj.constructor.ELEMENT_CLASS = 
	goog.getCssName(obj.constructor.CSS_CLASS_PREFIX, '');
}



/**
 * Creates the classMap property of the moka.ui.Component subclass from the 
 * constructor object CLASSES.
 * @param {!Object} obj The object to construct the classMap for. 
 * @private
 */
moka.ui.Component.createCssMap_ = function(obj, opt_superClass) {

    
    if (!goog.isDef(obj.constructor.CSS_SUFFIX) || 
	goog.isDef(obj.constructor.CSS)){
	return;
    }

    obj.constructor.CSS = goog.object.clone(obj.constructor.CSS_SUFFIX);
    window.console.log(obj.constructor.CSS);
    goog.object.forEach(obj.constructor.CSS, function(val, key){
	obj.constructor.CSS[key] = goog.getCssName(
	    obj.constructor.ID_PREFIX.toLowerCase().replace(/\.|_/g,'-'),
	    val.toLowerCase().replace(/\.|_/g,'-')
	);
    })


    // Propagate upwards in the class chain in case those
    // properties have yet to be set.
    if (obj.constructor.superClass_.constructor.CSS_SUFFIX && 
       !obj.constructor.superClass_.constructor.CSS) {
	moka.ui.Component.createCssMap_(obj.constructor.superClass_);
    }
    //window.console.log(obj, obj.getElement(), obj.CSS);
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
