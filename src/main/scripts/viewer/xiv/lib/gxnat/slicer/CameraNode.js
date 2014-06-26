goog.require('gxnat.slicer.Node');


/**
 * @struct
 * @param {!Array.<number>} position
 * @param {!Array.<number>} up
 * @param {!Array.<number>} focus
 * @extends {gxnat.slicer.Node}
 */
gxnat.slicer.CameraNode = function(position, up, focus){
    goog.base(this);
    
    this.position = position;
    this.up = up;
    this.focus = focus
}
goog.inherits(gxnat.slicer.CameraNode, gxnat.slicer.Node);
goog.exportSymbol('gxnat.slicer.CameraNode', gxnat.slicer.CameraNode);
