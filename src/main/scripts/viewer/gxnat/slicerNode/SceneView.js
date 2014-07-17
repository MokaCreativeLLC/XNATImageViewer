goog.provide('gxnat.slicerNode.SceneView');



goog.require('gxnat.slicerNode.Node');
//goog.require('gxnat.slicerNode.Camera');
goog.require('gxnat.slicerNode.BackgroundColor');


/**
 * @struct
 * @param {!Element} sceneViewElt
 * @param {!gxnat.slicerNode.Camera} cam
 * @param {!gxnat.slicerNode.BackgroundColor} bgCol
 * @param {!string} layout
 * @extends {gxnat.slicerNode.Node}
 * @constructor
 */
gxnat.slicerNode.SceneView = 
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
goog.inherits(gxnat.slicerNode.SceneView, gxnat.slicerNode.Node);
goog.exportSymbol('gxnat.slicerNode.SceneView', 
		  gxnat.slicerNode.SceneView);
