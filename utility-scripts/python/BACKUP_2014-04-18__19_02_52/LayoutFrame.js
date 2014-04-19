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
 * xiv.ui.layouts.LayoutFrame
 *
 * @constructor
 * @param {!string} title The title of the plane.
 * @param {!Array.string} opt_resizeDirs The optional resize directions.  None
 * if otherwise.
 * @extends {moka.ui.Component}
 */
goog.provide('xiv.ui.layouts.LayoutFrame');
xiv.ui.layouts.LayoutFrame = function(title, opt_resizeDirs) {
    goog.base(this);
    
    /**
     * @type {!string}
     * @private
     */
    this.title_ = title;
}
goog.inherits(xiv.ui.layouts.LayoutFrame, moka.ui.Component);
goog.exportSymbol('xiv.ui.layouts.LayoutFrame', xiv.ui.layouts.LayoutFrame);



/**
 * Event types.
 * @enum {string}
 * @public
 */
xiv.ui.layouts.LayoutFrame.EventType = {
}



/**
 * @type {!string} 
 * @const
 * @expose
 */
xiv.ui.layouts.LayoutFrame.ID_PREFIX =  'xiv.ui.layouts.LayoutFrame';



/**
 * @enum {string}
 * @public
 */
xiv.ui.layouts.LayoutFrame.CSS_SUFFIX = {}



/**
 * @return {!string}
 */
xiv.ui.layouts.LayoutFrame.prototype.getTitle = function(){
    return this.title_
}



/**
 * @type {moka.ui.Resizable}
 * @private
 */
xiv.ui.layouts.LayoutFrame.prototype.Resizable_ = null;


/**
 * @type {!Element}
 * @private
 */
xiv.ui.layouts.LayoutFrame.prototype.resizeBoundary_ = null;



/**
 * @type {!boolean}
 * @private
 */
xiv.ui.layouts.LayoutFrame.prototype.isResizable_ = false;



/**
 * @return {moka.ui.Resizable)
 * @public
 */
xiv.ui.layouts.LayoutFrame.prototype.getResizable = function(opt_resizeDirs){
    return this.Resizeable_;
}



/**
 * @type {moka.ui.Resizable}
 * @param {Array.string=} opt_resizeDirs The optional resize directions.  
 *    Defaults to the resizeable defaults.
 * @public
 */
xiv.ui.layouts.LayoutFrame.prototype.setResizeDirections = 
function(opt_resizeDirs){
    this.Resizeable_ = this.Resizeable_ ? this.Resizeable_ : 
	new moka.ui.Resizable(this.getElement());
    this.Resizeable_.setResizeDirections(opt_resizeDirs);
}



/**
* @inheritDoc
*/
xiv.ui.layouts.LayoutFrame.prototype.disposeInternal = function(){
    goog.base(this, 'disposeInternal');
    delete this.title_;
}
