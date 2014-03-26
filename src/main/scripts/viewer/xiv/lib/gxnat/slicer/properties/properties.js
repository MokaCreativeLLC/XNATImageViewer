


/**
 * @constructor
 */
goog.provide('gxnat.slicer.properties');
gxnat.slicer.properties = {};
goog.exportSymbol('gxnat.slicer.properties', gxnat.slicer.properties);





/**
 * @struct
 */
gxnat.slicer.properties.Mrml = function(fileName, mrmlDoc){
    this.url = fileName;
    this.document = mrmlDoc;
}



/**
 * @struct
 * @param {!Array.<number>} position
 * @param {!Array.<number>} up
 * @param {!Array.<number>} focus
 *
 */
gxnat.slicer.properties.Camera = function(position, up, focus){
    this.position = position;
    this.up = up;
    this.focus = focus
}


/**
 * @struct
 */
gxnat.slicer.properties.Layout = function(layoutNum){
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




/**
 * @struct
 * @param {!Array.<number>} position
 * @param {!Array.<number>} color
 * @param {!string} fcsvText
 * @param {!string} markupsFiducialId
 * @param {!string} displayNodeId
 */
gxnat.slicer.properties.Annotations = 
function(position, color, fcsvText, markupsFiducialId, displayNodeId) {
    this.position = position;
    this.color = color;
    this.fcsvText = fcsvText;
    this.markupsFiducialId = markupsFiducialId;
    this.displayNodeId = displayNodeId;
}



/**
 * @struct
 * @param {!string | !Array.<number>} color1
 * @param {!string | !Array.<number>} color2
 *
 */
gxnat.slicer.properties.BackgroundColor = function(color1, color2){
    this.backgroundColor = gxnat.slicer.mrmlColorToRgb(color1);
    this.backgroundColor2 = gxnat.slicer.mrmlColorToRgb(color2);
}



/**
 * @struct
 * @param {!Element} displayNode
 * @param {!Element} sceneNode
 * @return {Object}
 */
gxnat.slicer.properties.GeneralDisplay = function(displayNode, sceneNode) {
    this.displayNode =  displayNode;
    this.opacity =  parseFloat(displayNode.getAttribute('opacity'), 10);
    this.color =  gxnat.slicer.toFloatArray(displayNode.getAttribute('color'));
    this.visible =  displayNode.getAttribute('visibility') === 'true';
    this.origin =  gxnat.slicer.toFloatArray(sceneNode.getAttribute('origin'));
    this.colorMode =  parseInt(displayNode.getAttribute('colorMode'), 10);
    this.ijkToRASDirections =  sceneNode.getAttribute('ijkToRASDirections');   	
}



/**
* @struct
*/
goog.provide('gxnat.slicer.properties.Display');
gxnat.slicer.properties.Display = 
function(sceneViewElt, sceneViewDisplayableElt){
    this.general = gxnat.slicer.properties.getGeneralDisplayProperties(
	sceneViewElt, sceneViewDisplayableElt);
    this.specific = null;
}
goog.exportSymbol('gxnat.slicer.properties.Display', 
		  gxnat.slicer.properties.Display);


/**
 *
 * @extends {gxnat.slicer.properties.Display}
 */
goog.provide('gxnat.slicer.properties.VolumeDisplay');
gxnat.slicer.properties.VolumeDisplay = 
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

    this.specific  = {

	// Is selected volume.
	isSelectedVolume: isSelectedVol,
	
	// Upper threshold
	upperThreshold: this.general[0].displayNode ? 
	    parseInt(this.general[0].displayNode.
		     getAttribute('upperThreshold')) : null,
	
	// Lower threshold
	lowerThreshold: this.general[0].displayNode ? 
	    parseInt(this.general[0].displayNode.
		     getAttribute('lowerThreshold')) : null,

	// Visible
	visible: isVisible
    }
}
goog.inherits(gxnat.slicer.properties.VolumeDisplay, 
	      gxnat.slicer.properties.Display)
goog.exportSymbol('gxnat.slicer.properties.VolumeDisplay', 
		  gxnat.slicer.properties.VolumeDisplay);



/**
 * @extends {gxnat.slicer.properties.Display}
 */
goog.provide('gxnat.slicer.properties.MeshDisplay');
gxnat.slicer.properties.MeshDisplay = 
function(sceneViewElt, sceneViewDisplayableElt) {
    goog.base(this, sceneViewElt, sceneViewDisplayableElt);
}
goog.inherits(gxnat.slicer.properties.MeshDisplay, 
	      gxnat.slicer.properties.Display)
goog.exportSymbol('gxnat.slicer.properties.MeshDisplay', 
		  gxnat.slicer.properties.MeshDisplay);




/**
 *
 * @param {!Element} sceneViewElt
 * @param {!Element} sceneViewDisplayableElt
 * @return {Array.<Object.<string, string>>}
 */
gxnat.slicer.properties.getGeneralDisplayProperties = 
function(sceneViewElt, sceneViewDisplayableElt) {

    var displayProperties = [];
    var displayNodeRefs = 
	sceneViewDisplayableElt.getAttribute('displayNodeRef').split(' ');

    var displayNodeElts = [];
    var nodeList;
    
    goog.array.forEach(gxnat.slicer.
		       getDisplayNodeTypes(sceneViewDisplayableElt), 
    function(displayNodeType){
	goog.array.forEach(sceneViewElt.getElementsByTagName(displayNodeType), 
        function(node){
	    displayNodeElts.push(node)
	})
    })
     
    var i =0;
    var len = displayNodeElts.length;
    for (; i < len; i++) {
	if (displayNodeRefs.indexOf(displayNodeElts[i].getAttribute('id')) 
	    > -1) {
	    displayProperties.push(
		new gxnat.slicer.properties.GeneralDisplay(displayNodeElts[i], 
					sceneViewDisplayableElt));
	}
    }
    
    //window.console.log("\n\nDISPLAY PROPERTIES", displayProperties);
    return displayProperties;
}
