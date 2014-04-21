/**
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 */

// xiv
goog.require('xiv.ui.layouts.XyzvLayout');



/**
 * xiv.ui.layouts.Sagittal
 *
 * @constructor
 * @extends {xiv.ui.layouts.XyzvLayout}
 */
goog.provide('xiv.ui.layouts.Sagittal');
xiv.ui.layouts.Sagittal = function() { 
    goog.base(this, 'X');
    goog.dom.classes.add(this.LayoutFrames['X'].getElement(), 
	goog.getCssName(xiv.ui.layouts.LayoutFrame.ELEMENT_CLASS, 
			this.constructor.TITLE.toLowerCase()))
}
goog.inherits(xiv.ui.layouts.Sagittal, xiv.ui.layouts.XyzvLayout);
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








