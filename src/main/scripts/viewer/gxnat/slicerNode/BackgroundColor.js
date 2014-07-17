goog.provide('gxnat.slicerNode.BackgroundColor');

goog.require('nrg.string');
goog.require('gxnat.slicerNode.Node');

/**
 * @struct
 * @param {!string | !Array.<number>} color1
 * @param {!string | !Array.<number>} color2
 * @extends {gxnat.slicerNode.Node}
 * @constructor
 */
gxnat.slicerNode.BackgroundColor = function(color1, color2){
    goog.base(this);
    this.backgroundColor = nrg.string.mrmlColorToRgb(color1);
    this.backgroundColor2 = nrg.string.mrmlColorToRgb(color2);
}
goog.inherits(gxnat.slicerNode.BackgroundColor, gxnat.slicerNode.Node);
goog.exportSymbol('gxnat.slicerNode.BackgroundColor', 
		  gxnat.slicerNode.BackgroundColor);





