goog.require('gxnat.slicerNode.Node');

/**
 * @struct
 * @param {!string | !Array.<number>} color1
 * @param {!string | !Array.<number>} color2
 * @extends {gxnat.slicerNode.Node}
 *
 */
goog.provide('gxnat.slicerNode.BackgroundColor');
gxnat.slicerNode.BackgroundColor = function(color1, color2){
    goog.base(this);
    this.backgroundColor = this.constructor.mrmlColorToRgb(color1);
    this.backgroundColor2 = this.constructor.mrmlColorToRgb(color2);
}
goog.inherits(gxnat.slicerNode.BackgroundColor, gxnat.slicerNode.Node);
goog.exportSymbol('gxnat.slicerNode.BackgroundColor', 
		  gxnat.slicerNode.BackgroundColor);



/**
* @param {!string} mrmlColor
*/
gxnat.slicerNode.BackgroundColor.mrmlColorToRgb = function(mrmlColor) {
    return 'rgb(' + mrmlColor.
	split(" ").map(function(x){return Math.round(parseFloat(x) * 255)})
	.toString() + ')'
}



goog.exportSymbol('gxnat.slicerNode.BackgroundColor.mrmlColorToRgb', 
		  gxnat.slicerNode.BackgroundColor.mrmlColorToRgb);
