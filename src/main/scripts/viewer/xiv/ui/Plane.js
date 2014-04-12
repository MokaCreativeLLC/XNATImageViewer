/**
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 */

// goog
goog.require('goog.string');
goog.require('goog.array');

// moka
goog.require('moka.string');
goog.require('moka.ui.Component');
goog.require('moka.ui.Resizable');




/**
 * xiv.ui.Plane
 *
 * @constructor
 * @param {!string} title The title of the plane.
 * @param {!Array.string} opt_resizeDirs The optional resize directions.  None
 * if otherwise.
 * @extends {moka.ui.Component}
 */
goog.provide('xiv.ui.Plane');
xiv.ui.Plane = function(title, opt_resizeDirs) {
    goog.base(this);
    
    /**
     * @type {!string}
     * @private
     */
    this.title_ = title;
}
goog.inherits(xiv.ui.Plane, moka.ui.Component);
goog.exportSymbol('xiv.ui.Plane', xiv.ui.Plane);



/**
 * Event types.
 * @enum {string}
 * @public
 */
xiv.ui.Plane.EventType = {
}



/**
 * @type {!string} 
 * @const
 * @expose
 */
xiv.ui.Plane.ID_PREFIX =  'xiv.ui.Plane';



/**
 * @enum {string}
 * @public
 */
xiv.ui.Plane.CSS_SUFFIX = {}



/**
 * @return {!string}
 */
xiv.ui.Plane.prototype.getTitle = function(){
    return this.title_
}



/**
 * @type {moka.ui.Resizable}
 * @private
 */
xiv.ui.Plane.prototype.Resizable_ = null;


/**
 * @type {!Element}
 * @private
 */
xiv.ui.Plane.prototype.resizeBoundary_ = null;



/**
 * @type {!boolean}
 * @private
 */
xiv.ui.Plane.prototype.isResizable_ = false;



/**
 * @return {moka.ui.Resizable)
 * @public
 */
xiv.ui.Plane.prototype.getResizable = function(opt_resizeDirs){
    return this.Resizeable_;
}



/**
 * @type {moka.ui.Resizable}
 * @param {Array.string=} opt_resizeDirs The optional resize directions.  
 *    Defaults to the resizeable defaults.
 * @public
 */
xiv.ui.Plane.prototype.setResizeDirections = 
function(opt_resizeDirs){
    this.Resizeable_ = this.Resizeable_ ? this.Resizeable_ : 
	new moka.ui.Resizable(this.getElement());
    this.Resizeable_.setResizeDirections(opt_resizeDirs);
}



/**
* @inheritDoc
*/
xiv.ui.Plane.prototype.disposeInternal = function(){
    goog.base(this, 'disposeInternal');
    delete this.title_;
}
