/**
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 */

// goog
goog.require('goog.string');

// utils
goog.require('utils.dom');
goog.require('utils.style');


/**
 * xiv.Widget is the parent class for many of the interactive elements within
 * the Xnat Image Viewer.
 * @constructor
 * @param {!string} id The id to associate with the object's element.
 * @param {string=} opt_args The optional args to set.
 */
goog.provide('xiv.Widget');
xiv.Widget = function (opt_args) {

    xiv.Widget.validateIdPrefix_(this);
    xiv.Widget.validateConstructorArgs_(opt_args);
    xiv.Widget.createElementClass_(this, opt_args);

    /**
     * @type {!Element}
     * @private
     */
    this.element_ = utils.dom.createUniqueDom('div', this['ID_PREFIX'], 
					      opt_args)

    //window.console.log(this.element_);

}
goog.exportSymbol('xiv.Widget', xiv.Widget);



/**
 * Validates the ID_PREFIX property of the xiv.Widget subclass.
 * @param {!Object} obj The object to validate. 
 * @private
 */
xiv.Widget.validateIdPrefix_ = function(obj) {

    var idPrefixDefined = /**@type {string}*/ 
	obj.constructor.ID_PREFIX || obj.ID_PREFIX; 

    if (!idPrefixDefined){
	window.console.log("WARNING: xiv.Widget subclass should " + 
			   "have the property 'ID_PREFIX' .");
	idPrefixDefined = 'xiv.Widget_' + 
	    goog.string.createUniqueString();
    }

    obj['ID_PREFIX'] = idPrefixDefined;
}



/**
 * Validates the arguments.
 * @param {Object=} opt_args The args to modify and/or create. Sets the args to
 *    an empty object if not provided.
 * @private
 */
xiv.Widget.validateConstructorArgs_ = function(opt_args) {
    opt_args = goog.isObject(opt_args) ? opt_args : {};
}



/**
 * Sets and/or creates the class arguments of the constructor.
 * @param {!Object} obj The object to validate.
 * @param {!Object} args The args to modify and/or add properties to.   
 * @private
 */
xiv.Widget.createElementClass_ = function(obj, args) {
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
xiv.Widget.prototype.iconBaseUrl = '';



/**
 * @type {!string}
 * @protected
 */  
xiv.Widget.prototype.iconUrl = '';



/**
 * Sets the icon url to derive any images from.
 * @param {!string} url The url to derive the icon images from.
 * @public
 */
xiv.Widget.prototype.setIconBaseUrl = function(url) {
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
xiv.Widget.prototype.getIconBaseUrl = function() {
    return this.iconBaseUrl;
}



/**
 * As stated.
 * @return {!string} The URL.
 * @public
 */
xiv.Widget.prototype.getIconUrl = function() {
    return this.iconUrl;
}



/**
 * @return {Element} The element associated with the widget.
 * @public
 */
xiv.Widget.prototype.getElement = function(){
    return this.element_;
}



/**
 * For window resizing and any style changes.
 * @param {Object=}
 * @public
 */
xiv.Widget.prototype.updateStyle = function (opt_args) {
    if (opt_args && this.element_) {
	utils.style.setStyle(this.element_, opt_args);
    }
}
