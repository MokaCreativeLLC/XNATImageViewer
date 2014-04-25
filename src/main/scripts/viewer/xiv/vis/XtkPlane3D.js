/**
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 */

// xiv
goog.require('xiv.vis.XtkRenderer3D');


/**
 * @constructor
 * @extends {xiv.vis.XtkPlane}
 */
goog.provide('xiv.vis.XtkPlane3D');
xiv.vis.XtkPlane3D = function () {
    goog.base(this);
    this.orientation = 'V'; 
    this.XRenderer = xiv.vis.XtkRenderer3D;
}
goog.inherits(xiv.vis.XtkPlane3D, xiv.vis.XtkPlane);
goog.exportSymbol('xiv.vis.XtkPlane3D', xiv.vis.XtkPlane3D);




/**
 * @param {gxnat.slicer.BackgroundColorNode} opt_bgColorNode
 * @public
 */
xiv.vis.XtkPlane3D.prototype.setBackgroundColors = function(opt_bgColorNode) { 
    if (!goog.isDefAndNotNull(this.Renderer)) { return };

    //
    // Default
    //
    if (!goog.isDefAndNotNull(opt_bgColorNode)){
	this.container.style.background = 'black';
	return;
    }

    
    //
    // Custom
    //
    if (goog.isDefAndNotNull(opt_bgColorNode.backgroundColor2)){
	this.container.style.background = 
	    "-webkit-linear-gradient(top, " + 
	    opt_bgColorNode.backgroundColor2 + ", " + 
	    opt_bgColorNode.backgroundColor +")";

    } else {
	this.container.style.background = 
	    opt_bgColorNode.backgroundColor;	
    }
    
}



/**
 * @param {gxnat.slicer.cameraNode} opt_cameraNode
 * @public
 */
xiv.vis.XtkPlane3D.prototype.setCamera = function(opt_cameraNode){
    if (!goog.isDefAndNotNull(this.Renderer)) { return };

    if (goog.isDefAndNotNull(opt_cameraNode)){
	this.Renderer.camera.focus = opt_cameraNode.focus;
	this.Renderer.camera.position = opt_cameraNode.position;
	this.Renderer.camera.up = opt_cameraNode.up;
    } else {
	this.Renderer.camera.position = [-300, 300, 300];
    }
}



