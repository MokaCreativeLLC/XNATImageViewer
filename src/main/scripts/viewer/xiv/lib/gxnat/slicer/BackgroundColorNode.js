goog.require('gxnat.slicer.Node');

/**
 * @struct
 * @param {!string | !Array.<number>} color1
 * @param {!string | !Array.<number>} color2
 * @extends {gxnat.slicer.Node}
 *
 */
gxnat.slicer.BackgroundColorNode = function(color1, color2){
    goog.base(this);

    this.backgroundColor = gxnat.slicer.mrmlColorToRgb(color1);
    this.backgroundColor2 = gxnat.slicer.mrmlColorToRgb(color2);
}
goog.inherits(gxnat.slicer.BackgroundColorNode, gxnat.slicer.Node);
goog.exportSymbol('gxnat.slicer.BackgroundColorNode', 
		  gxnat.slicer.BackgroundColorNode);
