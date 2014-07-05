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
goog.provide('xiv.ui.ctrl.MeshController3D');
xiv.ui.ctrl.MeshController3D = function() {
    goog.base(this);
}
goog.inherits(xiv.ui.ctrl.MeshController3D, xiv.ui.ctrl.MasterController3D);
goog.exportSymbol('xiv.ui.ctrl.MeshController3D', 
		  xiv.ui.ctrl.MeshController3D);


/**
 * @type {!string} 
 * @const
 * @expose
 */
xiv.ui.ctrl.MeshController3D.ID_PREFIX =  'xiv.ui.ctrl.MeshController3D';



/**
 * @enum {string}
 * @public
 */
xiv.ui.ctrl.MeshController3D.CSS_SUFFIX = {};



/**
 * @inheritDoc
 */
xiv.ui.ctrl.MeshController3D.prototype.add = function(xObj) {
    // Call superclass add
    goog.base(this, 'add', xObj);

    // Add color palette
    this.add_visible(xObj);
    this.add_colorPalette(xObj);
}



goog.exportSymbol('xiv.ui.ctrl.MeshController3D.ID_PREFIX',
	xiv.ui.ctrl.MeshController3D.ID_PREFIX);
goog.exportSymbol('xiv.ui.ctrl.MeshController3D.CSS_SUFFIX',
	xiv.ui.ctrl.MeshController3D.CSS_SUFFIX);
goog.exportSymbol('xiv.ui.ctrl.MeshController3D.prototype.add',
	xiv.ui.ctrl.MeshController3D.prototype.add);
goog.exportSymbol('xiv.ui.ctrl.MeshController3D.prototype.disposeInternal',
	xiv.ui.ctrl.MeshController3D.prototype.disposeInternal);
