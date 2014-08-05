/**
 * @author kumar.sunil.p@gmail.com (Sunil Kumar)
 */
goog.provide('xiv.vis.XtkPlane3D');


// xiv
goog.require('xiv.vis.XtkPlane');
goog.require('xiv.vis.XtkRenderer3D');

//-----------


/**
 * @constructor
 * @extends {xiv.vis.XtkPlane}
 */
xiv.vis.XtkPlane3D = function () {
    goog.base(this);
    this.orientation = 'V'; 
    this.XRenderer = xiv.vis.XtkRenderer3D;
}
goog.inherits(xiv.vis.XtkPlane3D, xiv.vis.XtkPlane);
goog.exportSymbol('xiv.vis.XtkPlane3D', xiv.vis.XtkPlane3D);



/**
 * @const
 * @type {Array.<number>}
 */
xiv.vis.XtkPlane3D.DEFAULT_CAMERA_POSITION = [-300, 300, 300];



goog.exportSymbol('xiv.vis.XtkPlane3D.DEFAULT_CAMERA_POSITION',
	xiv.vis.XtkPlane3D.DEFAULT_CAMERA_POSITION);
