goog.require('gxnat.slicer.Node');

/**
 * @struct
 * @param {!string} file
 * @param {!Element} node
 * @param {!Element} storageNode
 * @extends {gxnat.slicer.Node}
 */
gxnat.slicer.DisplayableNode = function(file, node, storageNode) {
    goog.base(this);

    this.file = file;
    this.node = node; 
    this.storageNode = storageNode;
}
goog.inherits(gxnat.slicer.DisplayableNode, gxnat.slicer.Node);
goog.exportSymbol('gxnat.slicer.DisplayableNode', 
		  gxnat.slicer.DisplayableNode);
