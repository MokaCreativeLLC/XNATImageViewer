/**
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 */

// goog
goog.require('goog.array')
goog.require('goog.string')

// nrg
goog.require('nrg.ui.Component')
goog.require('nrg.ui.Resizable')
goog.require('nrg.string')

//-----------




/**
 * xiv.ui.layouts.LayoutFrame
 *
 * @constructor
 * @param {!string} title The title of the plane.
 * @param {!Array.string} opt_resizeDirs The optional resize directions.  None
 * if otherwise.
 * @extends {nrg.ui.Component}
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
goog.inherits(xiv.ui.layouts.LayoutFrame, nrg.ui.Component);
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
 * @expose
 */
xiv.ui.layouts.LayoutFrame.CSS_SUFFIX = {}



/**
 * @return {!string}
 */
xiv.ui.layouts.LayoutFrame.prototype.getTitle = function(){
    return this.title_
}



/**
 * @type {nrg.ui.Resizable}
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
 * @return {nrg.ui.Resizable)
 * @public
 */
xiv.ui.layouts.LayoutFrame.prototype.getResizable = function(){
    return this.Resizeable_;
}



/**
 * @param {Array.string=} opt_resizeDirs The optional resize directions.  
 *    Defaults to the resizeable defaults.
 * @public
 */
xiv.ui.layouts.LayoutFrame.prototype.setResizeDirections = 
function(opt_resizeDirs){
    this.Resizeable_ = this.Resizeable_ ? this.Resizeable_ : 
	new nrg.ui.Resizable(this.getElement());
    this.Resizeable_.setResizeDirections(opt_resizeDirs);
}



/**
* @inheritDoc
*/
xiv.ui.layouts.LayoutFrame.prototype.disposeInternal = function(){
    goog.base(this, 'disposeInternal');
    delete this.title_;
}



goog.exportSymbol('xiv.ui.layouts.LayoutFrame.EventType',
	xiv.ui.layouts.LayoutFrame.EventType);
goog.exportSymbol('xiv.ui.layouts.LayoutFrame.ID_PREFIX',
	xiv.ui.layouts.LayoutFrame.ID_PREFIX);
goog.exportSymbol('xiv.ui.layouts.LayoutFrame.CSS_SUFFIX',
	xiv.ui.layouts.LayoutFrame.CSS_SUFFIX);
goog.exportSymbol('xiv.ui.layouts.LayoutFrame.prototype.getTitle',
	xiv.ui.layouts.LayoutFrame.prototype.getTitle);
goog.exportSymbol('xiv.ui.layouts.LayoutFrame.prototype.getResizable',
	xiv.ui.layouts.LayoutFrame.prototype.getResizable);
goog.exportSymbol('xiv.ui.layouts.LayoutFrame.prototype.setResizeDirections',
	xiv.ui.layouts.LayoutFrame.prototype.setResizeDirections);
goog.exportSymbol('xiv.ui.layouts.LayoutFrame.prototype.disposeInternal',
	xiv.ui.layouts.LayoutFrame.prototype.disposeInternal);
