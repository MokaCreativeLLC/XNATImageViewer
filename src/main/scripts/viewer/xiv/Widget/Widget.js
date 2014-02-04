/**
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 */

/**
 * Google closure includes
 */

// goog
goog.require('goog.dom');

// utils
goog.require('utils.dom');
goog.require('utils.style');




/**
 * xiv.Widget is the parent class for all of the widgets
 * that feed into the modal.  In order for an 
 *
 * @constructor
 * @param {!string} id The id to associate with the object's element.
 * @param {string=} opt_args The optional args to set.
 */
goog.provide('xiv.Widget');
xiv.Widget = function (id, opt_args) {

    /**
     * @type {!Element}
     * @private
     */
    this.element_ = utils.dom.createUniqueDom('div', id, opt_args)

}
goog.exportSymbol('xiv.Widget', xiv.Widget);



/**
 * @return {Element}
 * @public
 */
xiv.Widget.prototype.getElement = function(){
    return this.element_;
}




/**
 * @type {function(Element)}
 * @protected
 */
xiv.Widget.prototype.setElementParentNode = function(parentNode) {
    return this.element_  &&  goog.dom.appendChild(parentNode, this.element_);
}




/**
 * For window resizing and any style changes.
 *
 * @param {Object=}
 */
xiv.Widget.prototype.updateStyle = function (opt_args) {
    if (opt_args && this.element_) {
	utils.style.setStyle(this.element_, opt_args);
    }
}
