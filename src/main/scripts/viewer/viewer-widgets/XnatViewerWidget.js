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

/**
 * viewer-widget includes
 */




/**
 * XnatViewerWidget is the parent class for all of the widgets
 * that feed into the modal.  Generally speaking, there's an 
 * element associated with each widget (this._element)
 * as well as a set of defining arguments, primarily comprised
 * parent, id, classnames, etc.
 *
 * @constructor
 * @param{Object=}
 */
goog.provide('XnatViewerWidget');
XnatViewerWidget = function (args, defaultArgs) {

    //------------------
    // Define the .args public variable.
    //------------------
    var defArgs = this.defaultArgs ? this.defaultArgs : this._defaultArgs;
    this.args = (args) ? utils.dom.mergeArgs(defArgs, args) : defArgs;



    //------------------
    // Define the .CSS public variable.
    //------------------	
    this.CSS = (this.args.CSS) ? this.args.CSS : this.args._elementCSS;



    //------------------
    // Define _element.
    //------------------
    var id = this.args.className ? this.args.className : this.args.id;
    this._element = utils.dom.makeElement("div", this.args.parent, id, this.CSS);

}
goog.exportSymbol('XnatViewerWidget', XnatViewerWidget);




/**
 * @type {?Object}
 * @public
 */
XnatViewerWidget.args = null;




/**
 * @type {?Object}
 * @public
 */	
XnatViewerWidget.CSS = null;




/**
 * @type {?Element}
 * @public
 */	
XnatViewerWidget._element = null;




/**
 * @type {Array}
 */	
XnatViewerWidget._onloadCallbacks = [];




/**
 * The default args of the class.
 * @type {Object}
 * @protected
 */
XnatViewerWidget.prototype._defaultArgs = {
    'parent' : document.body,
    'class' : 'xiv-default'
}




/**
 * Returns the _element of the class.
 *
 * @return {Element}
 */
XnatViewerWidget.prototype.getElement = function() {
    return this._element;
}




/**
 * @type {function(Element)}
 * @protected
 */
XnatViewerWidget.prototype.setElementParentNode = function(parentNode) {
    if (this._element) {
	goog.dom.appendChild(parentNode, this._element)
    }
}




/**
 * For window resizing and any style changes.
 *
 * @param {Object=}
 */
XnatViewerWidget.prototype.updateStyle = function (opt_args) {
    if (opt_args && this._element) {
	utils.style.setStyle(this._element, opt_args);
    }
}




/**
 * Adds a function to the _onloadCallbacks array.
 *
 * @param {function}
 */
XnatViewerWidget.prototype.addOnloadCallback = function (callback) {
    this._onloadCallbacks.push(callback);
}