/**
 * @author kumar.sunil.p@gmail.com (Sunil Kumar)
 */
goog.provide('xiv.ui.AnnotationsController3D');

// goog
goog.require('goog.object');

// xiv
goog.require('xiv.ui.MasterController3D');
goog.require('xiv.ui.ColorPaletteController');
goog.require('xiv.ui.CheckboxController');

//-----------



/**
 * @constructor
 * @extends {xiv.ui.MasterController3D}
 */
xiv.ui.AnnotationsController3D = function() {
    goog.base(this);
}
goog.inherits(xiv.ui.AnnotationsController3D, 
	      xiv.ui.MasterController3D);
goog.exportSymbol('xiv.ui.AnnotationsController3D', 
		  xiv.ui.AnnotationsController3D);


/**
 * @type {!string} 
 * @const
 * @expose
 */
xiv.ui.AnnotationsController3D.ID_PREFIX =  
    'xiv.ui.AnnotationsController3D';



/**
 * @enum {string}
 * @expose
 */
xiv.ui.AnnotationsController3D.CSS_SUFFIX = {};



/**
 * @inheritDoc
 */
xiv.ui.AnnotationsController3D.prototype.add = function(xObj) {
    // Call superclass add
    goog.base(this, 'add', xObj);

    // Add color palette
    this.add_visible(xObj, xiv.ui.CheckboxController);
    this.add_colorPalette(xObj, xiv.ui.ColorPaletteController);
}




goog.exportSymbol('xiv.ui.AnnotationsController3D.ID_PREFIX',
	xiv.ui.AnnotationsController3D.ID_PREFIX);
goog.exportSymbol('xiv.ui.AnnotationsController3D.CSS_SUFFIX',
	xiv.ui.AnnotationsController3D.CSS_SUFFIX);
goog.exportSymbol('xiv.ui.AnnotationsController3D.prototype.add',
	xiv.ui.AnnotationsController3D.prototype.add);
