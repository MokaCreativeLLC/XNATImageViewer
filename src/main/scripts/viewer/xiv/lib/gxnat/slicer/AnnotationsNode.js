goog.require('gxnat.slicer.Node');


/**
 * @struct
 * @param {!Array.<number>} position
 * @param {!Array.<number>} color
 * @param {!string} fcsvText
 * @param {!string} markupsFiducialId
 * @param {!string} displayNodeId
 * @extends {gxnat.slicer.Node}
 */
gxnat.slicer.AnnotationsNode = 
function(position, color, fcsvText, markupsFiducialId, displayNodeId, name) {
    goog.base(this);

    this.position = position;
    this.color = color;
    this.fcsvText = fcsvText;
    this.markupsFiducialId = markupsFiducialId;
    this.displayNodeId = displayNodeId;
    this.name = name;
}
goog.inherits(gxnat.slicer.AnnotationsNode, gxnat.slicer.Node);
goog.exportSymbol('gxnat.slicer.AnnotationsNode', 
		  gxnat.slicer.AnnotationsNode);
