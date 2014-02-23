/**
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 */

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
xiv.Widget = function (id, opt_args) {

    /**
     * @type {!Element}
     * @private
     */
    this.element_ = utils.dom.createUniqueDom('div', id, opt_args)

}
goog.exportSymbol('xiv.Widget', xiv.Widget);



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
