/**
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 */

/**
 * Google closure includes
 */

// utils
goog.require('utils.dom');
goog.require('utils.style');




/**
 * xiv.Widget is the parent class for all of the widgets
 * that feed into the modal.  In order for an 
 *
 * @constructor
 * @param {id} id The id to associate with the object's element.
 * @param {opt_parent} opt_parent The optional parent node to apply to the element.
 */
goog.provide('xiv.Widget');
xiv.Widget = function (id, opt_parent) {
    var opt_parent = opt_parent ? opt_parent : document.body;

    /**
     * @type {!Element}
     * @protected
     */
    this.element = utils.dom.makeElement("div", opt_parent, id);
}

goog.exportSymbol('xiv.Widget', xiv.Widget);



/**
 * @return {Element}
 * @public
 */
xiv.Widget.prototype.getElement = function(){
    return this.element;
}




/**
 * @type {function(Element)}
 * @protected
 */
xiv.Widget.prototype.setElementParentNode = function(parentNode) {
    return this.element  &&  goog.dom.appendChild(parentNode, this.element);
}




/**
 * For window resizing and any style changes.
 *
 * @param {Object=}
 */
xiv.Widget.prototype.updateStyle = function (opt_args) {
    if (opt_args && this.element) {
	utils.style.setStyle(this.element, opt_args);
    }
}
