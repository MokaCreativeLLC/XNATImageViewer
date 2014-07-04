/**
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 */

// goog
goog.require('goog.dom.classes')

// xiv
goog.require('xiv.ui.layouts.SingleFrameLayout')

//-----------



/**
 * xiv.ui.layouts.Coronal
 *
 * @constructor
 * @extends {xiv.ui.layouts.SingleFrameLayout}
 */
goog.provide('xiv.ui.layouts.Coronal');
xiv.ui.layouts.Coronal = function() { 
    goog.base(this, 'Y'); 
    goog.dom.classes.add(this.LayoutFrames['Y'].getElement(), 
	goog.getCssName(xiv.ui.layouts.LayoutFrame.ELEMENT_CLASS, 
			this.constructor.TITLE.toLowerCase()))
}
goog.inherits(xiv.ui.layouts.Coronal, xiv.ui.layouts.SingleFrameLayout);
goog.exportSymbol('xiv.ui.layouts.Coronal', xiv.ui.layouts.Coronal);



/**
 * @type {!string}
 * @public
 */
xiv.ui.layouts.Coronal.TITLE = 'Coronal';



/**
 * @type {!string} 
 * @const
 * @expose
 */
xiv.ui.layouts.Coronal.ID_PREFIX =  'xiv.ui.layouts.Coronal';









