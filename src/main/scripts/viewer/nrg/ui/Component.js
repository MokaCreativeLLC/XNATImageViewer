/**
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 */

// goog
goog.require('goog.ui.Component');
goog.require('goog.string');
goog.require('goog.object');
goog.require('goog.array');
goog.require('goog.dom.classes');
goog.require('goog.math.Size');
goog.require('goog.style');
goog.require('goog.dom');
goog.require('goog.events');

// nrg
goog.require('nrg.dom');
goog.require('nrg.style');
goog.require('nrg.string');



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
    this.validateIdPrefix();

    // Parent elt.
    this.setElementInternal(
	nrg.dom.createUniqueDom('div', this.constructor.ID_PREFIX, 
				 opt_domHelper));


    // Create CSS map
    this.createCssMap();

    // apply CSS hierarchy
    this.applyCssHierarchy_();
};
goog.inherits(nrg.ui.Component, goog.ui.Component);
goog.exportSymbol('nrg.ui.Component', nrg.ui.Component);



/**
 * Validates the ID_PREFIX property of the nrg.ui.Component subclass.
 * @throws {Error} If the constructor property 'ID_PREFIX' is not defined.
 * @protected
 */
nrg.ui.Component.prototype.validateIdPrefix = function() {

    if (!(this instanceof nrg.ui.Component)){
	return;
    }

    if (this.constructor.superClass_ &&
       ((this.constructor.superClass_ instanceof nrg.ui.Component))) {
	nrg.ui.Component.prototype.validateIdPrefix.
	    bind(this.constructor.superClass_)();
    }

    if (!this.constructor.ID_PREFIX){
	throw new Error("nrg.ui.Component subclass should " + 
			   "have the property 'ID_PREFIX' .", this);
    }

    // We can assume the other properties are defined if CSS_CLASS_PREFIX is.
    if (goog.isDef(this.constructor.CSS_CLASS_PREFIX)) {
	return;
    }

    /**
     * @public
     */
    this.constructor.CSS_CLASS_PREFIX = 
	nrg.ui.Component.idPrefixToCssClass(this.constructor.ID_PREFIX);

    /**
     * @public
     */
    this.constructor.ELEMENT_CLASS = this.constructor.CSS_CLASS_PREFIX;
}



/**
 * @param {!string} idPrefix
 * @public
 */
nrg.ui.Component.idPrefixToCssClass = function(idPrefix) {
    return idPrefix.toLowerCase().replace(/\./g,'-');
}



/**
 * Creates the classMap property of the nrg.ui.Component subclass from the 
 * constructor object CLASSES.
 * @protected
 */
nrg.ui.Component.prototype.createCssMap = function() {
    //window.console.log('\n\ncreateCSSMap', this.constructor.ID_PREFIX);
    // Propagate upwards in the class chain to see if those
    // properties have yet to be set.
    if (goog.isDefAndNotNull(this.constructor.superClass_)) {

	var obj = this.constructor.superClass_;
	//window.console.log('Begin', obj, obj.constructor.ID_PREFIX);

	while(obj.constructor.ID_PREFIX != null){
	    //window.console.log(this,
	    //obj.constructor.ID_PREFIX);
	    nrg.ui.Component.prototype.createCssMap.bind(obj)();
	    obj = obj.constructor.superClass_;
	}
    }
    //window.console.log('\n\ncreateCSSMap1', this.constructor.ID_PREFIX);
    //window.console.log('\n\ncreateCSSMap1', this.constructor.CSS_SUFFIX);
    // Return if no property defined.
    if (!goog.isDef(this.constructor.CSS_SUFFIX) || 
	goog.isDef(this.constructor.CSS)){
	return;
    }    
    //window.console.log('\n\ncreateCSSMap2', this.constructor.ID_PREFIX);


    /**
     * @public 
     */
    this.constructor.CSS = goog.object.clone(this.constructor.CSS_SUFFIX);
    goog.object.forEach(this.constructor.CSS, function(val, key){
	this.constructor.CSS[key] = nrg.string.makeCssName(
	    this.constructor.ID_PREFIX, val)
    }.bind(this))
}



/**
 * @private
 */
nrg.ui.Component.prototype.applyCssHierarchy_ = function() {
    var baseClasses = [];
    var obj = this;
    var cssName;

    while (goog.isDefAndNotNull(obj.constructor.ID_PREFIX)) {
	cssName = 
	    nrg.ui.Component.idPrefixToCssClass(obj.constructor.ID_PREFIX);
	goog.array.insert(baseClasses, cssName);
	obj = obj.constructor.superClass_;
    }

    //window.console.log(this.constructor.ID_PREFIX, baseClasses);

    goog.array.forEach(baseClasses, function(baseClass) {
	if (goog.isDefAndNotNull(this.getElement())){
	    goog.dom.classes.add(this.getElement(), baseClass);
	} 
    }.bind(this))
}



/**
 * Animation lengths.
 *
 * @enum {string}
 * @public
 */
nrg.ui.Component.animationLengths = {
    FAST : 150,
    MEDIUM: 300,
    SLOW: 600,
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
 * @type {!boolean}
 */
nrg.ui.Component.prototype.disposeInternalCalled_ = false;



/**
 * @public
 * @return {!boolean}
 */
nrg.ui.Component.prototype.disposeInternalCalled = function(){
    return this.disposeInternalCalled_;
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
	    subC.dispose();
	    subC = null;
	})
	goog.array.clear(this.subComponents);
    }

    // Events
    goog.events.removeAll(this);

    // Element
    goog.events.removeAll(this.getElement());
    goog.dom.removeNode(this.getElement());

    // Other
    this.iconBaseUrl = null;  
    this.iconUrl = null; 
    this.imagePrefix = null;

    // Size and pos
    this.currSize = null;
    this.currPos = null;
    this.prevSize = null;
    this.prevPos = null;

    this.disposeInternalCalled_ = true;
}



goog.exportSymbol('nrg.ui.Component.animationLengths',
	nrg.ui.Component.animationLengths);
goog.exportSymbol('nrg.ui.Component.idPrefixToCssClass',
	nrg.ui.Component.idPrefixToCssClass);
goog.exportSymbol('nrg.ui.Component.prototype.validateIdPrefix',
	nrg.ui.Component.prototype.validateIdPrefix);
goog.exportSymbol('nrg.ui.Component.prototype.imagePrefix',
	nrg.ui.Component.prototype.imagePrefix);
goog.exportSymbol('nrg.ui.Component.prototype.createCssMap',
	nrg.ui.Component.prototype.createCssMap);
goog.exportSymbol('nrg.ui.Component.prototype.setImagePrefix',
	nrg.ui.Component.prototype.setImagePrefix);
goog.exportSymbol('nrg.ui.Component.prototype.getImagePrefix',
	nrg.ui.Component.prototype.getImagePrefix);
goog.exportSymbol('nrg.ui.Component.prototype.addSubComponent',
	nrg.ui.Component.prototype.addSubComponent);
goog.exportSymbol('nrg.ui.Component.prototype.calcDims',
	nrg.ui.Component.prototype.calcDims);
goog.exportSymbol('nrg.ui.Component.prototype.updateStyle',
	nrg.ui.Component.prototype.updateStyle);
goog.exportSymbol('nrg.ui.Component.prototype.render',
	nrg.ui.Component.prototype.render);
goog.exportSymbol('nrg.ui.Component.prototype.disposeInternalCalled',
	nrg.ui.Component.prototype.disposeInternalCalled);
goog.exportSymbol('nrg.ui.Component.prototype.disposeInternal',
	nrg.ui.Component.prototype.disposeInternal);
