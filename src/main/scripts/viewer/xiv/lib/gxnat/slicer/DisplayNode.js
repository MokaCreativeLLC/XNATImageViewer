goog.require('gxnat.slicer.Node');


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
    this.origin =  
	gxnat.slicer.toFloatArray(sceneViewElt.getAttribute('origin'));
    this.colorMode =  parseInt(displayNodeElt.getAttribute('colorMode'), 10);
    this.ijkToRASDirections =  sceneViewElt.getAttribute('ijkToRASDirections'); 


}
goog.inherits(gxnat.slicer.DisplayNode, gxnat.slicer.Node);
goog.exportSymbol('gxnat.slicer.DisplayNode', gxnat.slicer.DisplayNode);
