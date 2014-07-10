/**
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 */
goog.provide('xiv.ui.layouts.ThreeD');


// goog
goog.require('goog.dom.classes');

// xiv
goog.require('xiv.ui.layouts.SingleFrameLayout');

// nrg
goog.require('nrg.string');

//-----------



/**
 * xiv.ui.layouts.ThreeD
 *
 * @constructor
 * @extends {xiv.ui.layouts.SingleFrameLayout}
 */
xiv.ui.layouts.ThreeD = function() { 
    goog.base(this, 'V'); 
    goog.dom.classes.add(this.LayoutFrames['V'].getElement(), 
	nrg.string.makeCssName(xiv.ui.layouts.LayoutFrame.ELEMENT_CLASS, 
			       this.constructor.TITLE))
}
goog.inherits(xiv.ui.layouts.ThreeD, xiv.ui.layouts.SingleFrameLayout);
goog.exportSymbol('xiv.ui.layouts.ThreeD', xiv.ui.layouts.ThreeD);



/**
 * @type {!string}
 * @public
 * @expose
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




