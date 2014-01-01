/** 
* @author foo.person@foo.com (Foo Person)
*/


/**
 * Google closure includes
 */
goog.require('goog.dom');


/**
 * utils includes
 */
goog.require('utils.dom');


/**
 * viewer-widget includes
 */
goog.require('ParentClass');




/**
 * Descriptor
 * 
 * See here: https://developers.google.com/closure/compiler/docs/js-for-compiler
 * See here: http://google-styleguide.googlecode.com/svn/trunk/javascriptguide.xml#Visibility__private_and_protected_fields_
 *
 * @constructor
 * @param {args} args Args descriptor
 * @extends {ParentClass}
 */
ChildClass = function (opt_args) {
  	
    ParentClass.call(this, opt_args);

    /**
     * Private, non-nullable, variable.
     *
     * @type {!number}
     * @private
     */
    this.privateVar1_ = 0;


    /**
     * Private nullable variable.
     *
     * @type {?number}
     * @private
     */
    this.privateVar2_ = null;


    /**
     * Protected variable -> NO UNDERSCORE
     * Either a number or a string.
     *
     * @type {number | String}
     * @protected
     */
    this.privateVar2 = 1;

}
goog.inherits(ParentClass, ChildClass);



ChildClass.CSS_CLASS_PREFIX = /**@type {string} @const*/ goog.getCssName('ChildClass');
ChildClass.ELEMENT_CLASS = /**@type {string} @const*/ goog.getCssName(ChildClass.CSS_CLASS_PREFIX, 'element');


/**
* @return {!number} The var to return.
*/
ChildClass.prototype.__defineGetter__(‘var1’, function() {
    return this.privateVar1_;	
})


/**
* @param {!number} num The var to set.
*/
ChildClass.prototype.__defineSetter__(‘var1’, function(num) {
    this.privateVar1_ = num;	
})



/**
 * @param {!string} string The first argument.
 * @param {string=} opt_string (Optional) The second arguent
 * @private
 */
ChildClass.prototype.someFuncA_ = function(string, opt_string) {
    return string + "1";
}



/**
 * @param {!string} string The first argument.
 * @param {string=} opt_string (Optional) The second arguent
 * @public
 */
ChildClass.prototype.someFuncB = function(string, opt_string) {
    return string + "1";
}




goog.exportProperty('ChildClass', ChildClass);

goog.exportProperty('ChildClass.prototype.someFuncB', 
		    ChildClass.prototype.someFuncB);
