/**
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 */

// xiv
goog.require('xiv.ui.layouts.SingleFrameLayout');



/**
 * xiv.ui.layouts.Transverse
 *
 * @constructor
 * @extends {xiv.ui.layouts.SingleFrameLayout}
 */
goog.provide('xiv.ui.layouts.Transverse');
xiv.ui.layouts.Transverse = function() { 
    goog.base(this, 'Z'); 
    goog.dom.classes.add(this.LayoutFrames['Z'].getElement(), 
	goog.getCssName(xiv.ui.layouts.LayoutFrame.ELEMENT_CLASS, 
			this.constructor.TITLE.toLowerCase()))
}
goog.inherits(xiv.ui.layouts.Transverse, xiv.ui.layouts.SingleFrameLayout);
goog.exportSymbol('xiv.ui.layouts.Transverse', xiv.ui.layouts.Transverse);



/**
 * @type {!string}
 * @public
 */
xiv.ui.layouts.Transverse.TITLE = 'Transverse';



/**
 * @type {!string} 
 * @const
 * @expose
 */
xiv.ui.layouts.Transverse.ID_PREFIX =  'xiv.ui.layouts.Transverse';









