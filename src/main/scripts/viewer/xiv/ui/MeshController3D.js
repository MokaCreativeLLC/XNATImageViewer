/**
 * @author kumar.sunil.p@gmail.com (Sunil Kumar)
 */
goog.provide('xiv.ui.MeshController3D');

// goog
goog.require('goog.object');

// xiv
goog.require('xiv.ui.MasterController3D');
goog.require('xiv.ui.ColorPaletteController');
goog.require('xiv.ui.CheckboxController');

//-----------


/**
 *
 * @constructor
 * @extends {xiv.ui.MasterController3D}
 */
xiv.ui.MeshController3D = function() {
    goog.base(this);
}
goog.inherits(xiv.ui.MeshController3D, xiv.ui.MasterController3D);
goog.exportSymbol('xiv.ui.MeshController3D', 
		  xiv.ui.MeshController3D);


/**
 * @type {!string} 
 * @const
 * @expose
 */
xiv.ui.MeshController3D.ID_PREFIX =  'xiv.ui.MeshController3D';



/**
 * @enum {string}
 * @expose
 */
xiv.ui.MeshController3D.CSS_SUFFIX = {};



/**
 * @inheritDoc
 */
xiv.ui.MeshController3D.prototype.add = function(xObj) {
    // Call superclass add
    goog.base(this, 'add', xObj);

    // Add color palette
    this.add_visible(xObj, xiv.ui.CheckboxController);
    this.add_colorPalette(xObj, xiv.ui.ColorPaletteController);
}



goog.exportSymbol('xiv.ui.MeshController3D.ID_PREFIX',
	xiv.ui.MeshController3D.ID_PREFIX);
goog.exportSymbol('xiv.ui.MeshController3D.CSS_SUFFIX',
	xiv.ui.MeshController3D.CSS_SUFFIX);
goog.exportSymbol('xiv.ui.MeshController3D.prototype.add',
	xiv.ui.MeshController3D.prototype.add);
goog.exportSymbol('xiv.ui.MeshController3D.prototype.disposeInternal',
	xiv.ui.MeshController3D.prototype.disposeInternal);
