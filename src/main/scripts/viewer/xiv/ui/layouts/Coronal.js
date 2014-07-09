/**
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 */
goog.provide('xiv.ui.layouts.Coronal');


// goog
goog.require('goog.dom.classes')

// xiv
goog.require('xiv.ui.layouts.SingleFrameLayout')

// nrg
goog.require('nrg.string');

//-----------



/**
 * xiv.ui.layouts.Coronal
 *
 * @constructor
 * @extends {xiv.ui.layouts.SingleFrameLayout}
 */
xiv.ui.layouts.Coronal = function() { 
    goog.base(this, 'Y'); 
    goog.dom.classes.add(this.LayoutFrames['Y'].getElement(), 
	nrg.string.makeCssName(xiv.ui.layouts.LayoutFrame.ELEMENT_CLASS, 
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



goog.exportSymbol('xiv.ui.layouts.Coronal.TITLE',
	xiv.ui.layouts.Coronal.TITLE);
goog.exportSymbol('xiv.ui.layouts.Coronal.ID_PREFIX',
	xiv.ui.layouts.Coronal.ID_PREFIX);
