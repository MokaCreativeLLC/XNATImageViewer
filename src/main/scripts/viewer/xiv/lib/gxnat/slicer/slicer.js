/**
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 * @author amh1646@rih.edu (Amanda Hartung)
 */

// goog
goog.require('goog.dom.DomHelper');
goog.require('goog.dom.xml');

// gxnat
goog.require('gxnat');
goog.require('gxnat.slicer.properties');


/**
 * @constructor
 */
goog.provide('gxnat.slicer');
gxnat.slicer = {};
goog.exportSymbol('gxnat.slicer', gxnat.slicer);



/**
 * @struct
 * @param {!string} file
 * @param {!Element} node
 * @param {!Element} storageNode
 */
gxnat.slicer.Displayable = function(file, node, storageNode){
    this.file = file;
    this.node = node; 
    this.storageNode = storageNode;
}



/**
 * @struct
 * @param {!Element} sceneViewElt
 * @param {!gxnat.slicer.properties.Camera} cam
 * @param {!gxnat.slicer.properties.BackgroundColor} bgCol
 * @param {!string} layout
 */
gxnat.slicer.SceneView = 
function(sceneViewElt, cam, bgCol, layout, annots, vols, meshes, fibers) {
    this.sceneViewElement = sceneViewElt;
    this.camera = cam;
    this.backgroundColor = bgCol;
    this.layout = layout;
    this.annotations = annots;
    this.volumes = vols;
    this.meshes = meshes;
    this.fibers = fibers;
}


/**
 * @param {!Array.<string>} fileList
 * @return {!Array.<string>}
 */
gxnat.slicer.extractMrmls = function(fileList){
    var mrmlUrls = /**@type{Array.string}*/ [];
    var i = /**@type{!number}*/ 0;
    var len = /**@type{!number}*/ fileList.length;
    for (; i<len; i++){
	if (goog.string.caseInsensitiveEndsWith(fileList[i], '.mrml')) {
	   mrmlUrls.push(fileList[i]);
	}
    }
    return mrmlUrls;
}



/**
 *
 *
 * @param {!string} mrmlUrl The url of the mrml file to get.
 * @param {!Function} callback The callback once the mrml has been gotten
 *    and converted.
 * @return {Document} The mrml parsed as an XML file.
 * @public
 */
gxnat.slicer.getMrmlAsXml = function(mrmlUrl, callback) {
    gxnat.get(mrmlUrl, function(mrmlText){
	//window.console.log(mrmlText);
	callback(new goog.dom.xml.loadXml(mrmlText));
    }, 'text');
}



/**
 * @param {!string | !Array.<string>} fileList The file list of urls to get the 
 *    Mrmls from.
 * @return {Array.<gxnat.slicer.properties.Mrml>}
 */
gxnat.slicer.createMrmlProperties = function(fileList, callback) {
    fileList = goog.isArray(fileList) ? fileList : [fileList];
    var mrmlUrls = /**@type {!Array.<string>}*/
    gxnat.slicer.extractMrmls(fileList);
    var mrmlNodes = /**@type {Array.<gxnat.slicer.properties.Mrml>}*/ [];
    var counter = /**@type {!Array.<number>}*/ 0;

    window.console.log("MRML URLS", mrmlUrls);
    goog.array.forEach(mrmlUrls, function(mrmlUrl){
	gxnat.slicer.getMrmlAsXml(mrmlUrl, function(mDoc) {
	    counter++;
	    mrmlNodes.push(new gxnat.slicer.properties.Mrml(mrmlUrl, mDoc));
	    if (counter == mrmlUrls.length) {
		//window.console.log('MRM SCTRUCTS RETRIEVED', mrmlNodes);
		callback(mrmlNodes);
	    }
	})
    })				    
}



/**
 * @param {!Element} sceneView The scene view element.
 * @return {gxnat.slicer.SceneView}
 * @public
 */
gxnat.slicer.createSceneViewProperties = 
function(sceneViewElt, mrbUrl, callback){
    gxnat.slicer.getAnnotationsFromSceneView(sceneViewElt, mrbUrl, 
    function(annotations){
	window.console.log("\n\n3. CREATE SCENE VIEW NODE, ANNOT", mrbUrl);
	callback(new gxnat.slicer.SceneView(
		sceneViewElt,
		gxnat.slicer.getCameraFromSceneView(sceneViewElt),
		gxnat.slicer.getBackgroundColorFromSceneView(sceneViewElt),
		gxnat.slicer.getLayoutFromSceneView(sceneViewElt),
		annotations,
		gxnat.slicer.getVolumes(sceneViewElt),
		gxnat.slicer.getMeshes(sceneViewElt),
		gxnat.slicer.getFibers(sceneViewElt)
	))
    })
}



/**
 * @param {!Array.<gxnat.slicer.properties.Mrml>} mrmlNodes
 * @param {!string} mrbUrl
 * @return {Array.<xnat.slicer.properties.Mrml>}
 */
gxnat.slicer.getSceneViewPropertiesFromMrmlProperties
= function(mrmlNodes, mrbUrl, callback) {

    var sceneViewElts = /**@type {Array.<Element>}*/ [];
    var sceneViews = /**@type {Array.<gxnat.slicer.SceneView>}*/ [];
    var counter = /**@type {!Array.<number>}*/ 0;

    goog.array.forEach(mrmlNodes, function(mrmlNode, i){

	sceneViewElts = 
	    gxnat.slicer.getSceneViewsFromMrml(mrmlNode.document);

	goog.array.forEach(sceneViewElts, function(sceneViewElt, j){
	    /**
	    window.console.log('2. SCENE VIEW ELTS', sceneViewElt, mrbUrl,
			       j, sceneViewElts.length);
	    */
	    gxnat.slicer.createSceneViewProperties(sceneViewElt, mrbUrl,
	    function(sceneViewNode){
		counter++;
		sceneViews.push(sceneViewNode);
		/**
		window.console.log('4. GOT SCENE VIEW NODE!', 
				   mrbUrl, 
				   counter, 
				   sceneViewElts.length,
				   sceneViewNode,
				   sceneViewElts.indexOf(sceneViewElt));
		*/
		if (counter == sceneViewElts.length) {
		    callback(sceneViews);
		}	
	    })
	})
    })				    
}



/**
 * 
 * @param {!string | !Document} mrml The mrml.
 * @param {!string} tagName To get retrieve the elements from.
 * @param {Array.Document}
 */
gxnat.slicer.getElementsFromMrml = function(mrml, tagName) {
    mrml = goog.isString(mrml) ?  gxnat.slicer.getMrmlAsXml(mrml) : mrml;
    var elts = /**@type {Array.Document}*/ [];
    goog.array.forEach(mrml.getElementsByTagName(tagName), function(node) {
	elts.push(node);
    });	
    return elts;
}



/**
 * @param {!Document} mrml The mrml to extract the scene views from.
 * @return {Array.<Element>} An Array of scene view elements.
 */
gxnat.slicer.getSceneViewsFromMrml = function(mrml) {
    return gxnat.slicer.getElementsFromMrml(mrml, 'SceneView');
}




/**
 * @param {!string}
 * @return {Array.<number>}
 */
gxnat.slicer.toFloatArray = function(str){
    if (!goog.isDefAndNotNull(str)){return};
    return str.split(" ").map(function(x){return parseFloat(x)})
}


/**
 * Parses the mrml to determine the camera's parameters.
 *
 * @param {!Element} scene The scene element.
 * @return {Array.<Array.<number>>} An 2-length array of 3-length arrays: 
 *    1) the position, 2) the up vector of the camera. 3) The focal point.
 */
gxnat.slicer.getCameraFromSceneView = function(scene) {
    return new gxnat.slicer.properties.Camera(
	gxnat.slicer.toFloatArray(
	    scene.getElementsByTagName('Camera')[0].getAttribute('position')
	),
	gxnat.slicer.toFloatArray(
	    scene.getElementsByTagName('Camera')[0].getAttribute('viewUp')
	),
	gxnat.slicer.toFloatArray(
	    scene.getElementsByTagName('Camera')[0].getAttribute('focalPoint')
	)
    )
}



/**
* @param {!string} mrmlColor
*/
gxnat.slicer.mrmlColorToRgb = function(mrmlColor) {
    return 'rgb(' + mrmlColor.
	split(" ").map(function(x){return Math.round(parseFloat(x) * 255)})
	.toString() + ')'
}







/**
 * Parses the scene to determine the camera's parameters.
 *
 * @param {!Element} scene The scene element.
 * @return {Array.<Array.<number>>} An MD array containing rgb values of 
 *    the background.
 */
gxnat.slicer.getBackgroundColorFromSceneView = function(scene) {
    return new gxnat.slicer.properties.BackgroundColor(
	scene.getElementsByTagName('View')[0].getAttribute('backgroundColor'), 
	scene.getElementsByTagName('View')[0].getAttribute('backgroundColor2'));
}






/**
 * @param {!Element} sceneView The scene element.
 * @return {number} The layout string.
 */
gxnat.slicer.getLayoutFromSceneView = function(sceneView) { 
    return new gxnat.slicer.properties.Layout(sceneView.
	getElementsByTagName('Layout')[0].
	getAttribute('currentViewArrangement'));
}




/**
 *
 */
gxnat.slicer.getFileUrlRelativeToMrbUrl = function(fileUrl, mrbUrl) {
    return goog.string.buildString(mrbUrl, '!',
		goog.string.remove(goog.string.path.basename(mrbUrl), 
		'.' + goog.string.path.extension(mrbUrl)), '/', fileUrl)

}


/**
 * Creates and returns annotations data.  
 *
 * @param {!Element} sceneView The sceneView element.
 * @param {!string} mrbUrl The url of the mrb.
 * @param {!Function} The require callback function that the annotations get
 *     set to.
 * @return {Array.<Object>} The annotations as objects.
 */
gxnat.slicer.getAnnotationsFromSceneView = 
function(sceneView, mrbUrl, callback) {

    //--------------------
    // Newer slicer verions store these in a separate file (e.g. 'F.fcsv').  
    // We have to find this file first.  It is pointed to in the mrml file.
    //--------------------  
    var displayFiducials = sceneView.getElementsByTagName('MarkupsDisplay');
    var markupFiducials = sceneView.getElementsByTagName('MarkupsFiducial');
    var storageFiducials = 
	sceneView.getElementsByTagName('MarkupsFiducialStorage');
    //window.console.log('STORED FID', storageFiducials, mrbUrl);
    var annots = /**@type {Array.<gxnat.slicer.properties.Annotations>}*/ [];
    var fcsvUrls = /**@type {Array.<string>}*/ [];
    var getCounter = /**@type {Array.<number>}*/ 0;
    var storeFile = '';
    var fcsvQuery = '';
    var splitLine;
    var position;
    var color = 'rgb(255,0,0)';
    var currId = '';
    var displayNodeId = '';
    var markupsFiducialId = '';
    var i = 0;
    var mFid;
    var dispFid;


    //
    // Exit out if there are no storage fiducials
    //
    if (storageFiducials.length == 0) {
	callback(null);
	return;
    };


    //
    // Get all of the .fcsv files at hand -- O(N).
    //
    goog.array.forEach(storageFiducials, function(fidElt){
	fcsvUrls.push(gxnat.slicer.getFileUrlRelativeToMrbUrl(
	    fidElt.getAttribute('fileName'), mrbUrl))
    })


    //window.console.log('\n\nHERE', sceneView, getCounter, fcsvUrls);

    if (fcsvUrls.length == 0) {
	callback(null);
	return;
    };

    //
    // Query each of the storage files.
    //
    goog.array.forEach(fcsvUrls, function(fcsvUrl){

	//
	// Get the file from server.
	//
	gxnat.get(fcsvUrl, function(fcsvText){
	    
	    getCounter++;

	    //
	    // Go through file line-by-line.
	    //
	    goog.array.forEach(fcsvText.split(/\n/), function(fcsvLine){

		//
		// Skip the commented lines.
		//
		if (fcsvLine.indexOf('#') != -1) { return };

		//
		// Split line by commas
		//
		splitLine = fcsvLine.split(/,/);
		if (splitLine.length == 1) { return };

		//
		// Get the position
		//
		position = [parseFloat(splitLine[1]), 
			    parseFloat(splitLine[2]),
			    parseFloat(splitLine[3])]
		
		color = [1,0,0];
		currId = '';
		displayNodeId = '';
		markupsFiducialId = '';
		
		//
		// Get the displayNode Id to retrieve the color, which
		// is in the sceneView node.
		//
		i = 0;
		len = markupFiducials.length;
		mFid;
		for (; i<len; i++) {
		    mFid = markupFiducials[i];
		    currId = mFid.getAttribute('id'); 
		    if (currId === splitLine[0].replace('_', '')) {
			markupsFiducialId = currId;
			displayNodeId = 
			    mFid.getAttribute('displayNodeRef');
			break;
		    }
		}

		//
		// Get the color from the displayNode fiducial
		//
		len = displayFiducials.length;
		dispFid;
		for (i=0; i<len; i++) {
		    dispFid = displayFiducials[i];
		    currId = dispFid.getAttribute('id'); 
		    if (currId === displayNodeId) {
			color = 
			    gxnat.slicer.toFloatArray(
				dispFid.getAttribute('color')
			    )
			break;
			
		    }
		}

		//
		// Store the annotations in an array
		//
		annots.push(new gxnat.slicer.properties.Annotations(
		    position, color, splitLine,
		    markupsFiducialId, displayNodeId));
		
	    })


	    //
	    // Run the callbacks once all annotations in the scene view
	    // have been gotten.
	    //
	    //window.console.log('\n\nSTEP HERE', sceneView, getCounter);

	    if (getCounter == fcsvUrls.length){

	//	window.console.log("\n\n3b. ANNOTATIONS GOTTEN", sceneView,
	//			   annots);
		callback(annots);
	    }

	}, 'text');				   
    })
        
}



/**
*
*/
gxnat.slicer.getSceneProperties = function(fileUrls, queryUrl, callback) {
    // We first have to query for the mrml nodes

    //window.console.log("FILE URL", fileUrls);
    gxnat.slicer.createMrmlProperties(fileUrls, function(mrmlProperties){
	// Then we get the scene views within the mrml.

	//window.console.log("\n\n*********1. MRML NODES", mrmlProperties);

	gxnat.slicer.getSceneViewPropertiesFromMrmlProperties(
	    mrmlProperties, queryUrl, function(sceneViewProperties){
		window.console.log("\n\n*******GET ALL NODES",
				   sceneViewProperties);
		callback(sceneViewProperties, mrmlProperties);
	    })
    });
}


/**
 * Generic file getion method for using the scene xml to
 * get data, by the 'tagName' argument and that convert data 
 * to an object with relevant information.
 *
 * @param {!Element} sceneViewElt The sceneViewElt element.
 * @param {!string} tagName
 * @param {!string} storageNodeTagName
 * @param {function} 
 * @return {Array.<Object.<string, string>>}
 */
gxnat.slicer.getDisplayables = 
function(sceneViewElt, tagName, storageNodeTagName) {

    var objects = /**@type {!Array.<gxnat.slicer.SceneViewNode>}*/ [];
    var storageNodes = /**@types {Array.<Element>}*/
    sceneViewElt.getElementsByTagName(storageNodeTagName);
    var storageNode = /**@types {?Element}*/ null;
    var i = /**@types {!number}*/ 0;
    var len = /**@types {!number}*/ storageNodes.length;

    goog.array.forEach(sceneViewElt.getElementsByTagName(tagName), 
    function(sceneViewDisplayableElt) {
	for (i=0; i<len; i++){
	    storageNode = storageNodes[i];
            if (storageNode.getAttribute('id') === 
		sceneViewDisplayableElt.getAttribute('storageNodeRef')) {  
		objects.push(new gxnat.slicer.Displayable(
		    storageNode.getAttribute('fileName'),
		    sceneViewDisplayableElt,
		    storageNode
		))
		break;
	    }
	}
    });
    return objects;
}




/**
 *
 * @param {Object} sceneViewDisplayableElt
 * @return {?string}
 */
gxnat.slicer.getDisplayNodeTypes = function(sceneViewDisplayableElt) {

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
 * @param {!Element} scene
 */
gxnat.slicer.getFibers = function(scene) {

    window.console.log("TODO: SUSPENDING GET FIBERS -- remember to turn on");
    return null;
    
    var fancyId = '';
    var fancyColorTableStorage;
    var colorTableFile = '';
    var fiberProperties;
    var fiberNode = {}

    return gxnat.slicer.getNodeFiles(
	scene, 'FiberBundle', 'FiberBundleStorage', 
	function(sceneViewDisplayableElt, node) {	
            displayNodeRefs = 
		sceneViewDisplayableElt.getAttribute('displayNodeRef').
		split(' ');
	    fiberProperties = 
		gxnat.slicer.getGeneralDisplayProperties(scene, 
					sceneViewDisplayableElt);
	//console.log("FIBER PROPERTIES", fiberProperties);


	    goog.array.forEach(fiberProperties, function(fiberProperty){

		if (fiberProperty['colorMode'] === 1) {
		    fancyId = 
			fiberProperty['displayNode'].
			getAttribute('DiffusionTensorDisplayPropertiesNodeRef');
		    goog.array.forEach(
			scene.getElementsByTagName(
			    'DiffusionTensorDisplayProperties'), 
			function(displayProperty) {
			    
			    if (displayProperty.getAttribute('id') === fancyId)
			    {
				//console.log('\n\nFOUND FANCY, fancyId');
				
				
				fancyColorTableStorage = 
				    displayProperty.
				    getAttribute('storageNodeRef');
				goog.array.forEach(scene.getElementsByTagName(
				    'ColorTableStorage'), function(
					colorTableStorageNode) {
				    if (colorTableStorageNode.
					getAttribute('id') === 
					fancyColorTableStorage) {
					
					colorTableFile = 
					    colorTableStorageNode.
					    getAttribute('fileName');
					fiberProperty['colorTable'] = 
					    colorTableFile
			    }
			})
		    }
		})
	    }
	})
	node['properties'] = {};
	node['properties']['fiberDisplay'] = fiberProperties;
    })

}



/**
 *
 * WARNING: Super-long function, by necessity.
 *
 * @param {!Element} sceneView
 * @return {Array.<Object.<string, string>>}
 */
gxnat.slicer.getVolumes = function(sceneView) {

    var sliceVisible = false;
    var selectedVolumeID = sceneView.getElementsByTagName('Selection')[0].
	getAttribute('activeVolumeID');
    var volumes = gxnat.slicer.getDisplayables(sceneView, 
	'Volume', 'VolumeArchetypeStorage');


    //
    // Check if any of the volumes are label maps -- change as needed.
    //
    var labelMapDisplayNodes = 
	sceneView.getElementsByTagName('LabelMapVolumeDisplay');
    var labelMapVolumes = [];
    var culledVolumes = [];
    var displayRef = '';
    goog.array.forEach(volumes, function(volumeNode, i){
	displayRef = volumeNode.node.getAttribute('displayNodeRef');

	//
	// If we have a label map...
	//
	if (displayRef.indexOf('LabelMap') > 1){

	    //
	    // Gets the file associated with the color table of the label map.
	    //
	    goog.array.forEach(labelMapDisplayNodes, function(node){
		if (node.getAttribute('id') == displayRef){
		    volumeNode.displayNode = node;
		    if (node.getAttribute('colorNodeID').indexOf(
			"vtkMRMLColorTableNodeFileGeneric")
			!= -1) {
			
			volumeNode.colorTableFile = 'genericColorTableFile.txt'
			

		    } else {
			window.console.log("Need to implement method for " + 
					   "non-generic colortable file " + 
					   "loading");
			//window.console.log(node);
			//window.console.log(node.getAttribute('colorNodeID'));
		    }
		}
	    })
	    labelMapVolumes.push(volumeNode);	    
	} else {
	    culledVolumes.push(volumeNode);
	}
    })


    //
    // We then need to associate the label map volumes with the 
    // appropriate display volume.
    //
    var attrs = /**@type {!string}*/ '';
    var revVol = /**@type {!string}*/ '';
    goog.array.forEach(labelMapVolumes, function(labelVol){
	// we now need to get the volume it belongs to.
	attrs = labelVol.node.getAttribute('attributes').split(';');
	//window.console.log(attrs);
	goog.array.forEach(attrs, function(attr){
	    if (attr.indexOf('AssociatedNodeID') != -1) {
		refVol = attr.split(':')[1];
		//window.console.log("REF VOL", refVol);
		goog.array.forEach(culledVolumes, function(cVol){
		    if(cVol.node.getAttribute('id') == refVol){
			cVol.labelMap = labelVol;
			window.console.log('make sure the colortable txt' + 
					   ' points to an existing file!');
		    }
		}.bind(this))
	    }
	}.bind(this))
    })
    


    //
    // Finally, we add the properties to the volume.
    //
    goog.array.forEach(culledVolumes, function(volume){
	volume.properties = new gxnat.slicer.properties.VolumeDisplay(
	    sceneView, volume.node, selectedVolumeID);
	if (volume.labelMap) { 
	    volume.properties.specific.labelMap = volume.labelMap;
	    delete volume.labelMap;
	}
    })

    return culledVolumes;
}



/**
 *
 * @param {!ActiveXObject | !Document} sceneView
 * @return {Array.<Object.<string, string>>}
 */
gxnat.slicer.getMeshes = function(sceneView) {
    var meshes = gxnat.slicer.getDisplayables(sceneView, 
					      'Model', 'ModelStorage');

    goog.array.forEach(meshes, function(mesh){
	window.console.log("MESH", mesh);
	mesh.properties = new gxnat.slicer.properties.MeshDisplay(
	    sceneView, mesh.node);
    })
    window.console.log('TODO: Verify meshes that have color tables');
    /**
    node['properties']['colorTable'] = gxnat.slicer.getColorTableFile(scene, 
				       node['properties']['displayNode']);
    */				       
    return meshes;
}







