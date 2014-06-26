goog.require('gxnat.slicer.Node');

/**
 * @struct
 * @param {!number} layoutNum
 * @extends {gxnat.slicer.Node}
 */
gxnat.slicer.LayoutNode = function(layoutNum){
    goog.base(this);

    var layoutName = 'Conventional';
    switch(layoutNum){
    case '0': 
	layoutName = 'Four-Up';
	break;
    case '2': 
	layoutName = 'Conventional';
	break;
    }
    this.layoutName = layoutName
}
goog.inherits(gxnat.slicer.LayoutNode, gxnat.slicer.Node);
goog.exportSymbol('gxnat.slicer.LayoutNode', gxnat.slicer.LayoutNode);
