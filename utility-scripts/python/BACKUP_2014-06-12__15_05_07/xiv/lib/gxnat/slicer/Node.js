


/**
 * @constructor
 */
goog.provide('gxnat.slicer.Node');
gxnat.slicer.Node = function(){
    goog.getUid(this);
};
goog.exportSymbol('gxnat.slicer.Node', gxnat.slicer.Node);



/**
 * @struct
 * @param {!string} fileName
 * @param {!Document | !Element} mrmlDoc
 * @param {!string} mrbUrl
 * @param {!string | !Array.<string>} fileList The file list of the given mrb
 *    where the mrml is located.
 * @extends {gxnat.slicer.Node}
 */
gxnat.slicer.MrmlNode = function(fileName, mrmlDoc, mrbUrl, fileList) {
    goog.base(this);

    this.url = fileName;
    this.document = mrmlDoc;
    this.files = fileList;
    this.mrbUrl = mrbUrl
}
goog.inherits(gxnat.slicer.MrmlNode, gxnat.slicer.Node);
goog.exportSymbol('gxnat.slicer.MrmlNode', gxnat.slicer.MrmlNode);



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




/**
 * @struct
 * @param {!Array.<number>} position
 * @param {!Array.<number>} up
 * @param {!Array.<number>} focus
 * @extends {gxnat.slicer.Node}
 */
gxnat.slicer.CameraNode = function(position, up, focus){
    goog.base(this);
    
    this.position = position;
    this.up = up;
    this.focus = focus
}
goog.inherits(gxnat.slicer.CameraNode, gxnat.slicer.Node);
goog.exportSymbol('gxnat.slicer.CameraNode', gxnat.slicer.CameraNode);




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



/**
 * @struct
 * @param {!string | !Array.<number>} color1
 * @param {!string | !Array.<number>} color2
 * @extends {gxnat.slicer.Node}
 *
 */
gxnat.slicer.BackgroundColorNode = function(color1, color2){
    goog.base(this);

    this.backgroundColor = gxnat.slicer.mrmlColorToRgb(color1);
    this.backgroundColor2 = gxnat.slicer.mrmlColorToRgb(color2);
}
goog.inherits(gxnat.slicer.BackgroundColorNode, gxnat.slicer.Node);
goog.exportSymbol('gxnat.slicer.BackgroundColorNode', 
		  gxnat.slicer.BackgroundColorNode);



/**
 * @struct
 * @param {!Element} sceneViewElt
 * @param {!Element} sceneViewDisplayableElt
 * @extends {gxnat.slicer.Node}
 */
goog.provide('gxnat.slicer.DisplayNode');
gxnat.slicer.DisplayNode = function(sceneViewElt, sceneViewDisplayableElt){
    goog.base(this);

    var displayProperties = [];
    var displayNodeRefs = 
	sceneViewDisplayableElt.getAttribute('displayNodeRef').split(' ');
    var displayNodeElts = [];
    var displayNodeElt = null;
    var nodeList;
    

    //
    // Acquire the displayNode elements.
    //
    goog.array.forEach(gxnat.slicer.
		       getDisplayNodeTypes(sceneViewDisplayableElt), 
    function(displayNodeType){
	goog.array.forEach(sceneViewElt.getElementsByTagName(displayNodeType), 
        function(node){
	    displayNodeElts.push(node)
	})
    })
     

    //
    // Loop through the displayNode elements and acquire the one
    // referencec by the sceneViewDisplayableElt
    //
    var i = 0;
    var len = displayNodeElts.length;
    for (; i < len; i++) {
	if (displayNodeRefs.indexOf(displayNodeElts[i].getAttribute('id')) 
	    > -1) {
	    displayNodeElt = displayNodeElts[i];
	    break;
	    //displayProperties.push(
	//	new gxnat.slicer.GenericDisplayNode(displayNodeElts[i], 
	//				sceneViewDisplayableElt));
	}
    }
    
    //window.console.log("\n\nDISPLAY PROPERTIES", displayProperties);
    //return displayProperties;


    this.displayNodeElement =  displayNodeElt;
    this.opacity =  parseFloat(displayNodeElt.getAttribute('opacity'), 10);
    this.color =  gxnat.slicer.toFloatArray(
	displayNodeElt.getAttribute('color'));
    this.visible =  displayNodeElt.getAttribute('visibility') === 'true';
    this.origin =  gxnat.slicer.toFloatArray(sceneViewElt.getAttribute('origin'));
    this.colorMode =  parseInt(displayNodeElt.getAttribute('colorMode'), 10);
    this.ijkToRASDirections =  sceneViewElt.getAttribute('ijkToRASDirections'); 


}
goog.inherits(gxnat.slicer.DisplayNode, gxnat.slicer.Node);
goog.exportSymbol('gxnat.slicer.DisplayNode', gxnat.slicer.DisplayNode);




/**
 * @extends {gxnat.slicer.DisplayNode}
 */
goog.provide('gxnat.slicer.VolumeDisplayNode');
gxnat.slicer.VolumeDisplayNode = 
function(sceneViewElt, sceneViewDisplayableElt, selectedVolumeID) {

    goog.base(this, sceneViewElt, sceneViewDisplayableElt);

    var isSelectedVol = 
	(selectedVolumeID !== sceneViewDisplayableElt.getAttribute('id')) ? 
	    false : true;

    var isVisible = false;
    if (isSelectedVol) {
	var sliceElts = sceneViewElt.getElementsByTagName('Slice');
	var i = 0;
	var len = sliceElts.length;
	for (; i<len; i++){
	    isVisible = sliceElts[i].getAttribute('sliceVisibility') 
		=== 'true' || false;
	    if (isVisible){ break };
	}
    } 



    // Is selected volume.
    this.isSelectedVolume = isSelectedVol;
    
    // Upper threshold
    this.upperThreshold = this.displayNodeElement ? 
	parseInt(this.displayNodeElement.
		 getAttribute('upperThreshold')) : null;
    
    // Lower threshold
    this.lowerThreshold = this.displayNodeElement ? 
	parseInt(this.displayNodeElement.
		 getAttribute('lowerThreshold')) : null;

    // Visible
    this.visible = isVisible;
    
}
goog.inherits(gxnat.slicer.VolumeDisplayNode, gxnat.slicer.DisplayNode)
goog.exportSymbol('gxnat.slicer.VolumeDisplayNode', 
		  gxnat.slicer.VolumeDisplayNode);



/**
 * @extends {gxnat.slicer.DisplayNode}
 */
goog.provide('gxnat.slicer.MeshDisplayNode');
gxnat.slicer.MeshDisplayNode = 
function(sceneViewElt, sceneViewDisplayableElt) {
    goog.base(this, sceneViewElt, sceneViewDisplayableElt);
}
goog.inherits(gxnat.slicer.MeshDisplayNode, gxnat.slicer.DisplayNode)
goog.exportSymbol('gxnat.slicer.MeshDisplayNode', gxnat.slicer.MeshDisplayNode);



goog.exportSymbol('gxnat.slicer.Node', gxnat.slicer.Node);
goog.exportSymbol('gxnat.slicer.MrmlNode', gxnat.slicer.MrmlNode);
goog.exportSymbol('gxnat.slicer.DisplayableNode',
	gxnat.slicer.DisplayableNode);
goog.exportSymbol('gxnat.slicer.SceneViewNode', gxnat.slicer.SceneViewNode);
goog.exportSymbol('gxnat.slicer.CameraNode', gxnat.slicer.CameraNode);
goog.exportSymbol('gxnat.slicer.LayoutNode', gxnat.slicer.LayoutNode);
goog.exportSymbol('gxnat.slicer.AnnotationsNode',
	gxnat.slicer.AnnotationsNode);
goog.exportSymbol('gxnat.slicer.BackgroundColorNode',
	gxnat.slicer.BackgroundColorNode);
goog.exportSymbol('gxnat.slicer.DisplayNode', gxnat.slicer.DisplayNode);
goog.exportSymbol('gxnat.slicer.VolumeDisplayNode',
	gxnat.slicer.VolumeDisplayNode);
goog.exportSymbol('gxnat.slicer.MeshDisplayNode',
	gxnat.slicer.MeshDisplayNode);
 
