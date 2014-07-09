goog.require('gxnat.slicerNode.Node');


/**
 * @struct
 * @param {!Array.<number>} position
 * @param {!Array.<number>} up
 * @param {!Array.<number>} focus
 * @extends {gxnat.slicerNode.Node}
 */
goog.provide('gxnat.slicerNode.Camera');
gxnat.slicerNode.Camera = function(position, up, focus){
    goog.base(this);
    
    this.position = position;
    this.up = up;
    this.focus = focus
}
goog.inherits(gxnat.slicerNode.Camera, gxnat.slicerNode.Node);
goog.exportSymbol('gxnat.slicerNode.Camera', gxnat.slicerNode.Camera);
