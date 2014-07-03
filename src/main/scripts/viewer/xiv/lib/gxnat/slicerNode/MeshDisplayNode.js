goog.require('gxnat.slicerNode.DisplayNode');


/**
 * @struct
 * @extends {gxnat.slicerNode.DisplayNode}
 */
goog.provide('gxnat.slicerNode.MeshDisplayNode');
gxnat.slicerNode.MeshDisplayNode = 
function(sceneViewElt, sceneViewDisplayableElt) {
    goog.base(this, sceneViewElt, sceneViewDisplayableElt);
}
goog.inherits(gxnat.slicerNode.MeshDisplayNode, gxnat.slicerNode.DisplayNode)
goog.exportSymbol('gxnat.slicerNode.MeshDisplayNode', 
		  gxnat.slicerNode.MeshDisplayNode);
