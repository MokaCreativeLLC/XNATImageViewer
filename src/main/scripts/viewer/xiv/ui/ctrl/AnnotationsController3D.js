/**
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 */

// goog
goog.require('goog.object');

// xiv
goog.require('xiv.ui.ctrl.MasterController3D');

//-----------



/**
 *
 * @constructor
 * @extends {xiv.ui.ctrl.MasterController3D}
 */
goog.provide('xiv.ui.ctrl.AnnotationsController3D');
xiv.ui.ctrl.AnnotationsController3D = function() {
    goog.base(this);
}
goog.inherits(xiv.ui.ctrl.AnnotationsController3D, 
	      xiv.ui.ctrl.MasterController3D);
goog.exportSymbol('xiv.ui.ctrl.AnnotationsController3D', 
		  xiv.ui.ctrl.AnnotationsController3D);


/**
 * @type {!string} 
 * @const
 * @expose
 */
xiv.ui.ctrl.AnnotationsController3D.ID_PREFIX =  
    'xiv.ui.ctrl.AnnotationsController3D';



/**
 * @enum {string}
 * @public
 */
xiv.ui.ctrl.AnnotationsController3D.CSS_SUFFIX = {};



/**
 * @inheritDoc
 */
xiv.ui.ctrl.AnnotationsController3D.prototype.add = function(xObj) {
    // Call superclass add
    goog.base(this, 'add', xObj);

    // Add color palette
    this.add_visible(xObj);
    this.add_colorPalette(xObj);
}



