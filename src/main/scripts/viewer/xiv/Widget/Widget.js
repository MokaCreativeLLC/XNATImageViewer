/**
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 */

/**
 * Google closure includes
 */

/**
 * utils includes
 */
goog.require('utils.dom');
goog.require('utils.style');

/**
 * viewer-widget includes
 */




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
    this._element = utils.dom.makeElement("div", opt_parent, id);
}

goog.exportSymbol('xiv.Widget', xiv.Widget);




/**
 * @type {?Element}
 * @public
 */	
xiv.Widget._element = null;




/**
 * @type {function(Element)}
 * @protected
 */
xiv.Widget.prototype.setElementParentNode = function(parentNode) {
    return this._element  &&  goog.dom.appendChild(parentNode, this._element);
}




/**
 * For window resizing and any style changes.
 *
 * @param {Object=}
 */
xiv.Widget.prototype.updateStyle = function (opt_args) {
    if (opt_args && this._element) {
	utils.style.setStyle(this._element, opt_args);
    }
}
