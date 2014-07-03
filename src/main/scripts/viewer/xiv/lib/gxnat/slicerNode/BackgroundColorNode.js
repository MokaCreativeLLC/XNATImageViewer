goog.require('gxnat.slicer');
goog.require('gxnat.slicerNode.Node');

/**
 * @struct
 * @param {!string | !Array.<number>} color1
 * @param {!string | !Array.<number>} color2
 * @extends {gxnat.slicerNode.Node}
 *
 */
gxnat.slicerNode.BackgroundColorNode = function(color1, color2){
    goog.base(this);

    this.backgroundColor = gxnat.slicer.mrmlColorToRgb(color1);
    this.backgroundColor2 = gxnat.slicer.mrmlColorToRgb(color2);
}
goog.inherits(gxnat.slicerNode.BackgroundColorNode, gxnat.slicerNode.Node);
goog.exportSymbol('gxnat.slicerNode.BackgroundColorNode', 
		  gxnat.slicerNode.BackgroundColorNode);
