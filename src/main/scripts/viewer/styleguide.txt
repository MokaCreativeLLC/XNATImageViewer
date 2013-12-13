/**
 * @author john.smith@foo.com (John Smith)
 */


goog.require('closure.lib.1');
goog.require('closure.lib.2');
goog.require('closure.lib.3');


goog.require('Xiv.lib.1');
goog.require('Xiv.lib.2');
goog.require('Xiv.lib.3');


goog.provide('ChildClass');






/**
 * Style descriptor
 *
 * @param {Object=}
 * @constructor
 * @extends {ParentClass}
 */
ChildClass = function (opt_args) {
  	
    ParentClass.call(this, opt_args);



    //-------------------------
    // Non-closure descriptor
    //-------------------------	
   
    //	Comment		
    var code = codecodel
    function code(){};



    /**
     * Closure descriptor, if needed
     *
     * @type {Element}
     * @private
     */
    this._element_ = utils.dom.makeElement();

}
goog.inherits(ParentClass, ChildClass);




/**
 * @type {Object}
 * @protected
 */
ChildClass.prototype._protectedVar = undefined;




/**
 * @type {string}
 * @private
 */
ChildClass.prototype.privateVar_ = undefined;




/**
 * @type {string}
 */
ChildClass.prototype._publicVar = undefined;




/**
 * @type {function(string):string}
 * @private
 */
ChildClass.prototype.someFuncA = function(string) {
    return string + "1";
}