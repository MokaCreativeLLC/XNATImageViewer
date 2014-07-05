/**
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 */

// goog
goog.require('goog.dom.classes')

// xiv
goog.require('xiv.ui.layouts.SingleFrameLayout')

//-----------



/**
 * xiv.ui.layouts.ThreeD
 *
 * @constructor
 * @extends {xiv.ui.layouts.SingleFrameLayout}
 */
goog.provide('xiv.ui.layouts.ThreeD');
xiv.ui.layouts.ThreeD = function() { 
    goog.base(this, 'V'); 
    goog.dom.classes.add(this.LayoutFrames['V'].getElement(), 
	goog.getCssName(xiv.ui.layouts.LayoutFrame.ELEMENT_CLASS, 
			this.constructor.TITLE.toLowerCase()))
}
goog.inherits(xiv.ui.layouts.ThreeD, xiv.ui.layouts.SingleFrameLayout);
goog.exportSymbol('xiv.ui.layouts.ThreeD', xiv.ui.layouts.ThreeD);



/**
 * @type {!string}
 * @public
 */
xiv.ui.layouts.ThreeD.TITLE = 'ThreeD';



/**
 * @type {!string} 
 * @const
 * @expose
 */
xiv.ui.layouts.ThreeD.ID_PREFIX =  'xiv.ui.layouts.ThreeD';




goog.exportSymbol('xiv.ui.layouts.ThreeD.TITLE', xiv.ui.layouts.ThreeD.TITLE);
goog.exportSymbol('xiv.ui.layouts.ThreeD.ID_PREFIX',
	xiv.ui.layouts.ThreeD.ID_PREFIX);




