/**
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 */

// xiv
goog.require('xiv.ui.layouts.XyzvLayout');



/**
 * xiv.ui.layouts.Coronal
 *
 * @constructor
 * @extends {xiv.ui.layouts.XyzvLayout}
 */
goog.provide('xiv.ui.layouts.Coronal');
xiv.ui.layouts.Coronal = function() { 
    goog.base(this, 'Y'); 
    goog.dom.classes.add(this.LayoutFrames['Y'].getElement(), 
	goog.getCssName(xiv.ui.layouts.LayoutFrame.ELEMENT_CLASS, 
			this.constructor.TITLE.toLowerCase()))
}
goog.inherits(xiv.ui.layouts.Coronal, xiv.ui.layouts.XyzvLayout);
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









