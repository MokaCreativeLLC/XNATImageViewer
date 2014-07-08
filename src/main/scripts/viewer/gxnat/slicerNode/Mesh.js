goog.require('gxnat.slicerNode.Display');


/**
 * @struct
 * @extends {gxnat.slicerNode.Display}
 */
goog.provide('gxnat.slicerNode.Mesh');
gxnat.slicerNode.Mesh = 
function(sceneViewElt, sceneViewDisplayableElt) {
    goog.base(this, sceneViewElt, sceneViewDisplayableElt);
}
goog.inherits(gxnat.slicerNode.Mesh, gxnat.slicerNode.Display)
goog.exportSymbol('gxnat.slicerNode.Mesh', 
		  gxnat.slicerNode.Mesh);
