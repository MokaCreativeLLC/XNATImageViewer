/**
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 */

// goog
goog.require('goog.ui.Component');
goog.require('goog.string');
goog.require('goog.object');

// nrg
goog.require('nrg.dom');
goog.require('nrg.style');



/**
 * nrg.ui.Component is the parent class for many of the interactive 
 * ui elements.
 * 
 * @param {string=} opt_domHelper Optional DOM helper.
 * @constructor
 * @extends {goog.ui.Component}
 */
goog.provide('nrg.ui.Component');
nrg.ui.Component = function (opt_domHelper) {
    goog.base(this, opt_domHelper);
    
    // Validate ID_PREFIX
    nrg.ui.Component.validateIdPrefix(this);

    // Parent elt.
    this.setElementInternal(
	nrg.dom.createUniqueDom('div', this.constructor.ID_PREFIX, 
				 opt_domHelper));


    // Create CSS map
    nrg.ui.Component.createCssMap(this);

    // apply CSS hierarchy
    nrg.ui.Component.applyCssHierarchy(this);
};
goog.inherits(nrg.ui.Component, goog.ui.Component);
goog.exportSymbol('nrg.ui.Component', nrg.ui.Component);



/**
 * Validates the ID_PREFIX property of the nrg.ui.Component subclass.
 * @param {!Object} obj The object to validate. 
 * @throws {Error} If the constructor property 'ID_PREFIX' is not defined.
 * @public
 */
nrg.ui.Component.validateIdPrefix = function(obj) {

    if (!(obj instanceof nrg.ui.Component)){
	return;
    }

    if (obj.constructor.superClass_ &&
       ((obj.constructor.superClass_ instanceof nrg.ui.Component))) {
	nrg.ui.Component.validateIdPrefix(obj.constructor.superClass_);
    }

    if (!obj.constructor.ID_PREFIX){
	throw new Error("nrg.ui.Component subclass should " + 
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
 * Creates the classMap property of the nrg.ui.Component subclass from the 
 * constructor object CLASSES.
 * @param {!Object} obj The object to construct the classMap for. 
 * @public
 */
nrg.ui.Component.createCssMap = function(obj) {

    // Propagate upwards in the class chain to see if those
    // properties have yet to be set.
    if (obj.constructor.superClass_) {
	nrg.ui.Component.createCssMap(obj.constructor.superClass_);
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
nrg.ui.Component.applyCssHierarchy = function(obj) {

    var pObj = obj;
    var baseClasses = [];

    while (pObj instanceof nrg.ui.Component) {
	goog.array.insert(baseClasses, pObj.constructor.ELEMENT_CLASS);
	pObj = pObj.constructor.superClass_;
    }

    goog.array.forEach(baseClasses, function(baseClass) {
	if (goog.isDefAndNotNull(obj.getElement())){
	    goog.dom.classes.add(obj.getElement(), baseClass);
	}
    })
}



/**
 * @type {string}
 * @protected
 */  
nrg.ui.Component.prototype.iconBaseUrl;




/**
 * @type {string}
 * @protected
 */  
nrg.ui.Component.prototype.iconUrl ;




/**
 * @type {goog.math.Size}
 * @protected
 */ 
nrg.ui.Component.prototype.currSize;




/**
 * @type {goog.math.Size}
 * @protected
 */ 
nrg.ui.Component.prototype.currPos;



/**
 * @type {goog.math.Size}
 * @protected
 */ 
nrg.ui.Component.prototype.prevSize;




/**
 * @type {goog.math.Size}
 * @protected
 */ 
nrg.ui.Component.prototype.prevPos;




/**
 * @type {Array.<nrg.ui.Component>}
 * @protected
 */
nrg.ui.Component.prototype.subComponents;



/**
 * @type {string}
 * @protectec
 */
nrg.ui.Component.prototype.imagePrefix = '';



/**
 * @param {!string} prefix
 * @public
 */
nrg.ui.Component.prototype.setImagePrefix = function(prefix) {
    this.imagePrefix = prefix;
}



/**
 * @return {string}
 * @public
 */
nrg.ui.Component.prototype.getImagePrefix = function(imagePrefix) {
    return this.imagePrefix;
}



/**
 * @param {!goog.ui.Component} subComponent
 * @protected
 */
nrg.ui.Component.prototype.addSubComponent = function(subComponent) {
    if (!goog.isDefAndNotNull(this.subComponents)){
	this.subComponents = [];
    }
    this.subComponents.push(subComponent);
}



/**
 * For size calculations.
 * @protected
 */
nrg.ui.Component.prototype.calcDims = function() {
    
    //
    // Track the previous size
    //
    if (!goog.isDefAndNotNull(this.prevSize)){
	this.prevSize = goog.style.getSize(this.getElement());
    } else {
	if ((this.prevSize.height !== this.currSize.height) ||
	    (this.prevSize.width !== this.currSize.width)) {
	    this.prevSize = this.currSize;
	}
    }


    if (!goog.isDefAndNotNull(this.prevPos)){
	this.prevPos = goog.style.getPosition(this.getElement());
    } else {
	if ((this.prevPos.x !== this.currPos.x) ||
	    (this.prevPos.y !== this.currPos.y)) {
	    this.prevPos = this.currPos;
	}
    }


    this.currSize = goog.style.getSize(this.getElement());
    this.currPos = goog.style.getPosition(this.getElement());  
}




/**
 * Generic function for style updates and resizing.
 * @protected
 */
nrg.ui.Component.prototype.updateStyle = function() {
    this.calcDims();
}



/**
 * @inheritDoc
 */
nrg.ui.Component.prototype.render = function(opt_parentElement) {
    //
    // Transfer the parent element if it's already rendered.
    //
    if (this.isInDocument() && 
	this.getElement().parentNode !== opt_parentElement &&
	goog.isDefAndNotNull(opt_parentElement)) {
	goog.dom.appendChild(opt_parentElement, this.getElement());
	return;
    }

    //
    // Otherwise just render
    //
    goog.base(this, 'render', opt_parentElement);
}



/**
 * @inheritDoc
 */
nrg.ui.Component.prototype.disposeInternal = function() {
    goog.base(this, 'disposeInternal');

    // SubComponents
    if (goog.isDefAndNotNull(this.subComponents)){
	goog.array.forEach(this.subComponents, function(subC){
	    goog.events.removeAll(subC);
	    subC.disposeInternal();
	    subC = null;
	})
	goog.array.clear(this.subComponents);
    }

    // Events
    goog.events.removeAll(this);

    // Element
    goog.events.removeAll(this.getElement());
    goog.dom.removeNode(this.getElement());
    delete this.getElement();

    // Other
    this.iconBaseUrl = null;  
    this.iconUrl = null; 
    this.imagePrefix = null;

    // Size and pos
    this.currSize = null;
    this.currPos = null;
    this.prevSize = null;
    this.prevPos = null;

}
