// gxnat
goog.require('gxnat.slicerNode.Node');


/**
 * @struct
 * @param {!string} file
 * @param {!Element} node
 * @param {!Element} storageNode
 * @extends {gxnat.slicerNode.Node}
 */
goog.provide('gxnat.slicerNode.DisplayableNode');
gxnat.slicerNode.DisplayableNode = function(file, node, storageNode) {
    goog.base(this);

    this.file = file;
    this.node = node; 
    this.storageNode = storageNode;
}
goog.inherits(gxnat.slicerNode.DisplayableNode, gxnat.slicerNode.Node);
goog.exportSymbol('gxnat.slicerNode.DisplayableNode', 
		  gxnat.slicerNode.DisplayableNode);
