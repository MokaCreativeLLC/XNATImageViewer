goog.provide('gxnat.slicerNode.Annotations');

// goog
goog.require('gxnat.slicerNode.Node');


/**
 * @struct
 * @param {!Array.<number>} position
 * @param {!Array.<number>} color
 * @param {!string} fcsvText
 * @param {!string} markupsFiducialId
 * @param {!string} displayNodeId
 * @extends {gxnat.slicerNode.Node}
 * @constructor
 */
gxnat.slicerNode.Annotations = 
function(position, color, fcsvText, markupsFiducialId, displayNodeId, name) {
    goog.base(this);

    this.position = position;
    this.color = color;
    this.fcsvText = fcsvText;
    this.markupsFiducialId = markupsFiducialId;
    this.displayNodeId = displayNodeId;
    this.name = name;
}
goog.inherits(gxnat.slicerNode.Annotations, gxnat.slicerNode.Node);
goog.exportSymbol('gxnat.slicerNode.Annotations', 
		  gxnat.slicerNode.Annotations);
