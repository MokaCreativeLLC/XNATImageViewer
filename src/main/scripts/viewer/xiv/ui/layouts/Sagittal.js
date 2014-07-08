/**
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 */
goog.provide('xiv.ui.layouts.Sagittal');


// goog
goog.require('goog.dom.classes')

// xiv
goog.require('xiv.ui.layouts.SingleFrameLayout')

// nrg
goog.require('nrg.string');

//-----------



/**
 * xiv.ui.layouts.Sagittal
 *
 * @constructor
 * @extends {xiv.ui.layouts.SingleFrameLayout}
 */
xiv.ui.layouts.Sagittal = function() { 
    goog.base(this, 'X');
    goog.dom.classes.add(this.LayoutFrames['X'].getElement(), 
	nrg.string.makeCssName(xiv.ui.layouts.LayoutFrame.ELEMENT_CLASS, 
			this.constructor.TITLE.toLowerCase()))
}
goog.inherits(xiv.ui.layouts.Sagittal, xiv.ui.layouts.SingleFrameLayout);
goog.exportSymbol('xiv.ui.layouts.Sagittal', xiv.ui.layouts.Sagittal);



/**
 * @type {!string}
 * @public
 */
xiv.ui.layouts.Sagittal.TITLE = 'Sagittal';



/**
 * @type {!string} 
 * @const
 * @expose
 */
xiv.ui.layouts.Sagittal.ID_PREFIX =  'xiv.ui.layouts.Sagittal';




goog.exportSymbol('xiv.ui.layouts.Sagittal.TITLE',
	xiv.ui.layouts.Sagittal.TITLE);
goog.exportSymbol('xiv.ui.layouts.Sagittal.ID_PREFIX',
	xiv.ui.layouts.Sagittal.ID_PREFIX);



