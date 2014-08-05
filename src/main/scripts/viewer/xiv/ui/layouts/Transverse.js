/**
 * @author kumar.sunil.p@gmail.com (Sunil Kumar)
 */
goog.provide('xiv.ui.layouts.Transverse');


// goog
goog.require('goog.dom.classes')

// nrg
goog.require('nrg.string');

// xiv
goog.require('xiv.ui.layouts.SingleFrameLayout')

//-----------



/**
 * xiv.ui.layouts.Transverse
 *
 * @constructor
 * @extends {xiv.ui.layouts.SingleFrameLayout}
 */
xiv.ui.layouts.Transverse = function() { 
    goog.base(this, 'Z'); 
    goog.dom.classes.add(this.LayoutFrames['Z'].getElement(), 
	nrg.string.makeCssName(xiv.ui.layouts.LayoutFrame.ELEMENT_CLASS, 
			       this.constructor.TITLE))
}
goog.inherits(xiv.ui.layouts.Transverse, xiv.ui.layouts.SingleFrameLayout);
goog.exportSymbol('xiv.ui.layouts.Transverse', xiv.ui.layouts.Transverse);



/**
 * @type {!string}
 * @public
 * @expose
 */
xiv.ui.layouts.Transverse.TITLE = 'Transverse';



/**
 * @type {!string} 
 * @const
 * @expose
 */
xiv.ui.layouts.Transverse.ID_PREFIX =  'xiv.ui.layouts.Transverse';



goog.exportSymbol('xiv.ui.layouts.Transverse.TITLE',
	xiv.ui.layouts.Transverse.TITLE);
goog.exportSymbol('xiv.ui.layouts.Transverse.ID_PREFIX',
	xiv.ui.layouts.Transverse.ID_PREFIX);







