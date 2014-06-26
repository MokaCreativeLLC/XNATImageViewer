goog.require('gxnat.slicer.DisplayNode');


/**
 * @struct
 * @extends {gxnat.slicer.DisplayNode}
 */
goog.provide('gxnat.slicer.MeshDisplayNode');
gxnat.slicer.MeshDisplayNode = 
function(sceneViewElt, sceneViewDisplayableElt) {
    goog.base(this, sceneViewElt, sceneViewDisplayableElt);
}
goog.inherits(gxnat.slicer.MeshDisplayNode, gxnat.slicer.DisplayNode)
goog.exportSymbol('gxnat.slicer.MeshDisplayNode', gxnat.slicer.MeshDisplayNode);
