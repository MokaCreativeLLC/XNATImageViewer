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

    moka.ui.Component.validateIdPrefix(this);
    // Parent elt.
    this.setElementInternal(
	moka.dom.createUniqueDom('div', this.constructor.ID_PREFIX, 
				 opt_domHelper));

    // Create CSS map
    moka.ui.Component.createCssMap(this);

    // apply CSS hierarchy
    moka.ui.Component.applyCssHierarchy(this);
};

goog.inherits(moka.ui.Component, goog.ui.Component);
goog.exportSymbol('moka.ui.Component', moka.ui.Component);



/**
 * Validates the ID_PREFIX property of the moka.ui.Component subclass.
 * @param {!Object} obj The object to validate. 
 * @throws {Error} If the constructor property 'ID_PREFIX' is not defined.
 * @public
 */
moka.ui.Component.validateIdPrefix = function(obj) {

    if (!(obj instanceof moka.ui.Component)){
	return;
    }

    if (obj.constructor.superClass_ &&
       ((obj.constructor.superClass_ instanceof moka.ui.Component))) {
	moka.ui.Component.validateIdPrefix(obj.constructor.superClass_);
    }

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
 * @public
 */
moka.ui.Component.createCssMap = function(obj) {

    // Propagate upwards in the class chain to see if those
    // properties have yet to be set.
    if (obj.constructor.superClass_) {
	moka.ui.Component.createCssMap(obj.constructor.superClass_);
    }

    // Return if no property defined.
    if (!goog.isDef(obj.constructor.CSS_SUFFIX) || 
	goog.isDef(obj.constructor.CSS)){
	return;
    }    

    obj.constructor.CSS = goog.object.clone(obj.constructor.CSS_SUFFIX);
    //window.console.log(obj.constructor.CSS);
    goog.object.forEach(obj.constructor.CSS, function(val, key){
	obj.constructor.CSS[key] = goog.getCssName(
	    obj.constructor.ID_PREFIX.toLowerCase().replace(/\.|_/g,'-'),
	    val.toLowerCase().replace(/\.|_/g,'-')
	);
    })
    obj.constructor.CSS.ELEMENT = goog.getCssName(
	    obj.constructor.ID_PREFIX.toLowerCase().replace(/\.|_/g,'-'), '');
    //window.console.log(obj.constructor.ID_PREFIX, obj.constructor.CSS);
}



/**
 * @param {!Object} obj The object to construct the CSS hierarchy for. 
 * @public
 */
moka.ui.Component.applyCssHierarchy = function(obj) {

    var pObj = /**@type {!goog.ui.Component}*/ obj;
    var baseClasses = /**@type {!Array.string}*/ [];

    while (pObj instanceof moka.ui.Component) {
	goog.array.insert(baseClasses, pObj.constructor.ELEMENT_CLASS);
	pObj = pObj.constructor.superClass_;
    }

    goog.array.forEach(baseClasses, function(baseClass) {
	goog.dom.classes.add(obj.getElement(), baseClass);
    })
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
 * @type {goog.math.Size}
 * @protected
 */ 
moka.ui.Component.prototype.currSize;



/**
 * @type {goog.math.Size}
 * @protected
 */ 
moka.ui.Component.prototype.currPos;



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



/**
 * @type {Array.<moka.ui.Component>}
 * @public
 */
moka.ui.Component.prototype.subComponents_;



/**
 * @return {Array.<moka.ui.Component>)
 * @public
 */
moka.ui.Component.prototype.getSubComponents = function(){
    return this.subComponents_;
}

 

/**
 * @param {Object} An objects constructor.
 * @return {Array.<moka.ui.Component>)
 * @public
 */
moka.ui.Component.prototype.getSubComponentsByType = function(obj){
    var arrObj = [];
    goog.array.forEach( this.subComponents_, function(subC){
	if (subC instanceof obj){
	    arrObj.push(subC);
	}
    })
    return arrObj;
}




/**
 * @param {!moka.ui.Component) subComponent
 * @public
 */
moka.ui.Component.prototype.addSubComponent = function(subComponent){
    this.subComponents_ = this.subComponents_ ? this.subComponents_ : [];
    this.subComponents_.push(subComponent);
    goog.dom.append(this.getElement(), subComponent.getElement());
}




/**
 * Generic function for style updates and resizing.
 * @protected
 */
moka.ui.Component.prototype.updateStyle = function() {
    this.currSize = goog.style.getSize(this.getElement());
    this.currPos = goog.style.getPosition(this.getElement());
}
