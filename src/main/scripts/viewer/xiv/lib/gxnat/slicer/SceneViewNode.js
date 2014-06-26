goog.require('gxnat.slicer.Node');


/**
 * @struct
 * @param {!Element} sceneViewElt
 * @param {!gxnat.slicer.CameraNode} cam
 * @param {!gxnat.slicer.BackgroundColorNode} bgCol
 * @param {!string} layout
 * @extends {gxnat.slicer.Node}
 */
gxnat.slicer.SceneViewNode = 
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
goog.inherits(gxnat.slicer.SceneViewNode, gxnat.slicer.Node);
goog.exportSymbol('gxnat.slicer.SceneViewNode', gxnat.slicer.SceneViewNode);
