goog.require('gxnat.slicerNode.Node');
goog.require('gxnat.slicerNode.CameraNode');
goog.require('gxnat.slicerNode.BackgroundColorNode');


/**
 * @struct
 * @param {!Element} sceneViewElt
 * @param {!gxnat.slicerNode.CameraNode} cam
 * @param {!gxnat.slicerNode.BackgroundColorNode} bgCol
 * @param {!string} layout
 * @extends {gxnat.slicerNode.Node}
 */
gxnat.slicerNode.SceneViewNode = 
function(sceneViewElt, cam, bgCol, layout, annots, vols, 
	 meshes, fibers) {

    goog.base(this);

    this.element = sceneViewElt;
    this.camera = cam;
    this.backgroundColor = bgCol;
    this.layout = layout;
    this.annotations = annots;
    this.volumes = vols;
    this.meshes = meshes;
    this.fibers = fibers;
}
goog.inherits(gxnat.slicerNode.SceneViewNode, gxnat.slicerNode.Node);
goog.exportSymbol('gxnat.slicerNode.SceneViewNode', 
		  gxnat.slicerNode.SceneViewNode);
