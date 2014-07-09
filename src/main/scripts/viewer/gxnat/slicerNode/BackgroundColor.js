goog.provide('gxnat.slicerNode.BackgroundColor');

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
    this.backgroundColor = this.mrmlColorToRgb_(color1);
    this.backgroundColor2 = this.mrmlColorToRgb_(color2);
}
goog.inherits(gxnat.slicerNode.BackgroundColor, gxnat.slicerNode.Node);
goog.exportSymbol('gxnat.slicerNode.BackgroundColor', 
		  gxnat.slicerNode.BackgroundColor);



/**
* @param {!string} mrmlColor
*/
gxnat.slicerNode.BackgroundColor.prototype.mrmlColorToRgb_ = 
function(mrmlColor) {
    return 'rgb(' + mrmlColor.
	split(" ").map(function(x){return Math.round(parseFloat(x) * 255)})
	.toString() + ')'
}

