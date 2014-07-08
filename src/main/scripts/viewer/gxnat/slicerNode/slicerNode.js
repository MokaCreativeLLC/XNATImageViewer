/**
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 * @author amh1646@rih.edu (Amanda Hartung)
 */


/**
 * @constructor
 */
goog.provide('gxnat.slicerNode');
gxnat.slicerNode = {};
goog.exportSymbol('gxnat.slicerNode', gxnat.slicerNode);


/**
 *
 * @param {Object} sceneViewDisplayableElt
 * @return {?string}
 */
gxnat.slicerNode.getDisplayNodeTypes = function(sceneViewDisplayableElt) {

    var displayNodeRefs = 
	sceneViewDisplayableElt.getAttribute('displayNodeRef').split(' ');
    var displayNodeTypes = [];
    var displayNodeType = ''

    for (var i = 0, len = displayNodeRefs.length; i < len; i++) {
	displayNodeType = 
	    displayNodeRefs[i].replace('vtkMRML', '').split('Node')[0];

	switch(displayNodeType){
	case 'ScalarVolumeDisplay':
	    displayNodeType = 'VolumeDisplay';
	    break;
	case 'DiffusionTensorVolumeDisplay':
	    displayNodeType = 'DiffusionTensorVolumeDisplay';
	    break;
	case 'NCIRayCastVolumeRenderingDisplay':
	    displayNodeType = 'NCIRayCastVolumeRendering';
	    break;
	case 'GPURayCastVolumeRenderingDisplay':
	    displayNodeType = 'GPURayCastVolumeRendering';
	    break;
	case 'FiberBundleTubeDisplay':
	    displayNodeType = 'FiberBundleTubeDisplayNode';
	    break;
	case 'FiberBundleLineDisplay':
	    displayNodeType = 'FiberBundleLineDisplayNode';
	    break;
	case 'FiberBundleGlyphDisplay':
	    displayNodeType = 'FiberBundleGlyphDisplayNode';
	    break;
	default:
	    break;
	}
	
	displayNodeTypes.push(displayNodeType); 
    }
	
    //console.log(displayNodeRef, displayNodeTypes[j]);
    return displayNodeTypes;
}




/**
 * @param {!string}
 * @return {Array.<number>}
 */
gxnat.slicerNode.toFloatArray = function(str){
    if (!goog.isDefAndNotNull(str)){return};
    return str.split(" ").map(function(x){return parseFloat(x)})
}




goog.exportSymbol(
    'gxnat.slicerNode.getDisplayNodeTypes',
    gxnat.slicerNode.getDisplayNodeTypes);


goog.exportSymbol(
    'gxnat.slicerNode.toFloatArray',
    gxnat.slicerNode.toFloatArray);
