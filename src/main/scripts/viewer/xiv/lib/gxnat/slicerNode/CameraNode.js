goog.require('gxnat.slicerNode.Node');


/**
 * @struct
 * @param {!Array.<number>} position
 * @param {!Array.<number>} up
 * @param {!Array.<number>} focus
 * @extends {gxnat.slicerNode.Node}
 */
gxnat.slicerNode.CameraNode = function(position, up, focus){
    goog.base(this);
    
    this.position = position;
    this.up = up;
    this.focus = focus
}
goog.inherits(gxnat.slicerNode.CameraNode, gxnat.slicerNode.Node);
goog.exportSymbol('gxnat.slicerNode.CameraNode', gxnat.slicerNode.CameraNode);
