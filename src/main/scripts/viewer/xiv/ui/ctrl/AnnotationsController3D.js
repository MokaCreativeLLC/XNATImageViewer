/**
 * @author kumar.sunil.p@gmail.com (Sunil Kumar)
 */
goog.provide('xiv.ui.ctrl.AnnotationsController3D');

// goog
goog.require('goog.object');

// xiv
goog.require('xiv.ui.ctrl.MasterController3D');
goog.require('xiv.ui.ctrl.ColorPaletteController');
goog.require('xiv.ui.ctrl.CheckboxController');

//-----------



/**
 * @constructor
 * @extends {xiv.ui.ctrl.MasterController3D}
 */
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
 * @expose
 */
xiv.ui.ctrl.AnnotationsController3D.CSS_SUFFIX = {};



/**
 * @inheritDoc
 */
xiv.ui.ctrl.AnnotationsController3D.prototype.add = function(xObj) {
    // Call superclass add
    goog.base(this, 'add', xObj);

    // Add color palette
    this.add_visible(xObj, xiv.ui.ctrl.CheckboxController);
    this.add_colorPalette(xObj, xiv.ui.ctrl.ColorPaletteController);
}




goog.exportSymbol('xiv.ui.ctrl.AnnotationsController3D.ID_PREFIX',
	xiv.ui.ctrl.AnnotationsController3D.ID_PREFIX);
goog.exportSymbol('xiv.ui.ctrl.AnnotationsController3D.CSS_SUFFIX',
	xiv.ui.ctrl.AnnotationsController3D.CSS_SUFFIX);
goog.exportSymbol('xiv.ui.ctrl.AnnotationsController3D.prototype.add',
	xiv.ui.ctrl.AnnotationsController3D.prototype.add);
