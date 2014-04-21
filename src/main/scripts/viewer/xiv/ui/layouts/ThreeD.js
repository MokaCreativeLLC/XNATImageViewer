/**
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 */

// xiv
goog.require('xiv.ui.layouts.XyzvLayout');



/**
 * xiv.ui.layouts.ThreeD
 *
 * @constructor
 * @extends {xiv.ui.layouts.XyzvLayout}
 */
goog.provide('xiv.ui.layouts.ThreeD');
xiv.ui.layouts.ThreeD = function() { 
    goog.base(this, 'V'); 
    goog.dom.classes.add(this.LayoutFrames['V'].getElement(), 
	goog.getCssName(xiv.ui.layouts.LayoutFrame.ELEMENT_CLASS, 
			this.constructor.TITLE.toLowerCase()))
}
goog.inherits(xiv.ui.layouts.ThreeD, xiv.ui.layouts.XyzvLayout);
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









