/**
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 * @author amh1646@rih.edu (Amanda Hartung)
 */

// goog
goog.require('gxnat');
goog.require('goog.dom.DomHelper');
goog.require('goog.dom.xml');




/**
 * @constructor
 */
goog.provide('gxnat.slicer');
gxnat.slicer = {};
goog.exportSymbol('gxnat.slicer', gxnat.slicer);


/**
 * @struct
 */
gxnat.slicer.MrmlNode = function(fileName, mrmlDoc){
    this.url = fileName;
    this.document = mrmlDoc;
}



/**
 * @struct
 */
gxnat.slicer.SceneViewNode = 
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
 * @struct
 * @param {!Array.<number>} position
 * @param {!Array.<number>} up
 * @param {!Array.<number>} focus
 *
 */
gxnat.slicer.CameraNode = function(position, up, focus){
    this.position = position;
    this.up = up;
    this.focus = focus
}



/**
 * @struct
 *
 */
gxnat.slicer.AnnotationsNode = 
function(position, color, fcsvText, markupsFiducialId, displayNodeId) {
    this.color = color;
    this.position = position;
    this.fcsvText = fcsvText;
    this.markupsFiducialId = markupsFiducialId;
    this.displayNodeId = displayNodeId;
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
 *    MrmlNodes from.
 * @return {Array.<xnat.slicer.MrmlNode>}
 */
gxnat.slicer.createMrmlNodes = function(fileList, callback) {
    fileList = goog.isArray(fileList) ? fileList : [fileList];
    var mrmlUrls = /**@type {!Array.<string>}*/
    gxnat.slicer.extractMrmls(fileList);
    var mrmlNodes = /**@type {Array.<gxnat.slicer.MrmlNode>}*/ [];
    var counter = /**@type {!Array.<number>}*/ 0;

    goog.array.forEach(mrmlUrls, function(mrmlUrl){
	gxnat.slicer.getMrmlAsXml(mrmlUrl, function(mDoc) {
	    counter++;
	    mrmlNodes.push(new gxnat.slicer.MrmlNode(mrmlUrl, mDoc));
	    if (counter == mrmlUrls.length) {
		//window.console.log('MRM SCTRUCTS RETRIEVED', mrmlNodes);
		callback(mrmlNodes);
	    }
	})
    })				    
}



/**
 * @param {!Element} sceneView The scene view element.
 * @return {gxnat.slicer.SceneViewNode}
 * @public
 */
gxnat.slicer.createSceneViewNode = function(sceneView, mrbUrl, ind, callback){
    
    gxnat.slicer.getAnnotationsFromSceneView(sceneView, mrbUrl, 
    function(annotations){

	window.console.log("\n\n3. CREATE SCENE VIEW NODE, ANNOT", ind, mrbUrl);
	callback(new gxnat.slicer.SceneViewNode(
		sceneView,
		gxnat.slicer.getCameraFromSceneView(sceneView),
		gxnat.slicer.getBackgroundColorFromSceneView(sceneView),
		gxnat.slicer.getLayoutFromSceneView(sceneView),
		annotations,
		gxnat.slicer.getVolumes(sceneView),
		gxnat.slicer.getMeshes(sceneView),
		gxnat.slicer.getFibers(sceneView)
	))
    })
}



/**
 * @param {!Array.<gxnat.slicer.MrmlNode>} mrmlNodes
 * @param {!string} mrbUrl
 * @return {Array.<xnat.slicer.MrmlNode>}
 */
gxnat.slicer.createSceneViewNodes = function(mrmlNodes, mrbUrl, callback) {

    var sceneViewElts = /**@type {Array.<Element>}*/ [];
    var sceneViews = /**@type {Array.<gxnat.slicer.SceneViewNode>}*/ [];
    var counter = /**@type {!Array.<number>}*/ 0;

    goog.array.forEach(mrmlNodes, function(mrmlNode, i){

	sceneViewElts = 
	    gxnat.slicer.getSceneViewsFromMrml(mrmlNode.document);

	goog.array.forEach(sceneViewElts, function(sceneViewElt, j){
	    /**
	    window.console.log('2. SCENE VIEW ELTS', sceneViewElt, mrbUrl,
			       j, sceneViewElts.length);
	    */
	    gxnat.slicer.createSceneViewNode(sceneViewElt, mrbUrl, j,
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
    return str.split(" ").map(function(x){return parseFloat(x)})
}


/**
 * Parses the mrml to determine the camera's parameters.
 *
 * @param {!Element} scene The scene element.
 * @return {Array.<Array.<number>>} An 2-length array of 3-length arrays: 1) the position, 2) the up vector of the camera. 3) The focal point.
 */
gxnat.slicer.getCameraFromSceneView = function(scene) {
    return new gxnat.slicer.CameraNode(
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
 * @struct
 * @param {!string | !Array.<number>} color1
 * @param {!string | !Array.<number>} color2
 *
 */
gxnat.slicer.BackgroundColorNode = function(color1, color2){
    this.backgroundColor = gxnat.slicer.mrmlColorToRgb(color1);
    this.backgroundColor2 = gxnat.slicer.mrmlColorToRgb(color2);
}



/**
 * Parses the scene to determine the camera's parameters.
 *
 * @param {!Element} scene The scene element.
 * @return {Array.<Array.<number>>} An MD array containing rgb values of 
 *    the background.
 */
gxnat.slicer.getBackgroundColorFromSceneView = function(scene) {
    return new gxnat.slicer.BackgroundColorNode(
	scene.getElementsByTagName('View')[0].getAttribute('backgroundColor'), 
	scene.getElementsByTagName('View')[0].getAttribute('backgroundColor2'));
}



/**
 * @dict
 */
gxnat.slicer.getLayoutFromNumerical = function(layoutNum){
    switch(layoutNum){
    case '0': 
	return 'Four-Up';
    case '2': 
	return 'Conventional';
    default:
	return 'Conventional';
    }
}


/**
 * @param {!Element} sceneView The scene element.
 * @return {number} The layout string.
 */
gxnat.slicer.getLayoutFromSceneView = function(sceneView) { 
    return gxnat.slicer.getLayoutFromNumerical(sceneView.
	getElementsByTagName('Layout')[0].
	getAttribute('currentViewArrangement'));
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
    var annots = /**@type {Array.<gxnat.slicer.AnnotationsNode>}*/ [];
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
	fcsvUrls.push(goog.string.buildString(mrbUrl, '!',
			goog.string.remove(goog.string.path.basename(mrbUrl), 
			'.' + goog.string.path.extension(mrbUrl)), '/', 
			fidElt.getAttribute('fileName')))
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
		annots.push(new gxnat.slicer.AnnotationsNode(
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
gxnat.slicer.getSceneViewNodes = function(fileUrls, queryUrl, callback) {
    // We first have to query for the mrml nodes
    gxnat.slicer.createMrmlNodes(fileUrls, function(mrmlNodes){
	// Then we get the scene views within the mrml.

	window.console.log("\n\n*********1. MRML NODES", mrmlNodes);

	gxnat.slicer.createSceneViewNodes(
	    mrmlNodes, queryUrl, function(sceneViewNodes){
		window.console.log("\n\n*********GET ALL NODES", 
				   sceneViewNodes);
		//callback(sceneViewNodes, mrmlNodes);
	    })
    });
}




/**
*
*
*/
gxnat.slicer.getVolumeProperties = 
function(sceneViewElt, sceneViewChildElt, node, sliceVisible, selectedVolumeID) {

    var obj = 
	gxnat.slicer.getBasicDisplayProperties(sceneViewElt, sceneViewChildElt);
    


    obj['colorTable'] = 
	gxnat.slicer.getColorTableFile(sceneViewElt, 
				       obj.displayNode);

    //window.console.log('GET VOL PROPERTIES', obj);
    return;
    node['properties']['isSelectedVolume'] = 
	(selectedVolumeID !== sceneViewChildElt.getAttribute('id')) 
	? false : true;

    if (node['properties']['displayNode']) {

	node['properties']['upperThreshold'] =  
	    parseInt(node['properties']['displayNode'].
		     getAttribute('upperThreshold'), 10);

	node['properties']['lowerThreshold'] =  
	    parseInt(node['properties']['displayNode'].
		     getAttribute('lowerThreshold'), 10);
    } 

    // Volume visible is a bit unique:
    // Slicer sets the visible by slice.
    // Here, we determine the visible in reference to 
    // the the slices in a given scene.
    if (node['properties']['isSelectedVolume']) {

	sliceVisible = false;
	goog.array.forEach(sceneViewElt.getElementsByTagName('Slice'), 
	function(sliceElement){
	    sliceVisible = sliceElement.getAttribute('sliceVisibility') 
		=== 'true' || sliceVisible
	})
	node['properties']['visible'] = sliceVisible;
    } else {
	node['properties']['visible'] = false;
    }

}



/**
 *
 * @param {!Element} sceneView
 * @return {Array.<Object.<string, string>>}
 */
gxnat.slicer.getVolumes = function(sceneView) {

    var sliceVisible = false;
    var selectedVolumeID = sceneView.getElementsByTagName('Selection')[0].
	getAttribute('activeVolumeID');

    var volumes = gxnat.slicer.getSceneViewChildNodes(sceneView, 
	'Volume', 'VolumeArchetypeStorage');

    goog.array.forEach(volumes, function(volume){
	var properties = gxnat.slicer.getVolumeProperties(
	    sceneView, volume.node, null, null, null);

	window.console.log("consider restructuring properties");
	volume.properties = properties;
    })

    return volumes;
}




/**
 *
 * @struct
 * @param {!string} file
 * @param {!Element} node
 * @param {!Element} storageNode
 */
gxnat.slicer.SceneViewNode = function(file, node, storageNode){
    this.file = file;
    this.node = node; 
    this.storageNode = storageNode;
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
gxnat.slicer.getSceneViewChildNodes = 
function(sceneViewElt, tagName, storageNodeTagName) {

    var objects = /**@type {!Array.<gxnat.slicer.SceneViewNode>}*/ [];
    var storageNodes = /**@types {Array.<Element>}*/
    sceneViewElt.getElementsByTagName(storageNodeTagName);
    var storageNode = /**@types {?Element}*/ null;

    goog.array.forEach(sceneViewElt.getElementsByTagName(tagName), 
    function(sceneViewChildElt) {

	var i = /**@types {!number}*/ 0;
	var len = /**@types {!number}*/ storageNodes.length;
	for (; i<len; i++){

	    storageNode = storageNodes[i];
            if (storageNode.getAttribute('id') === 
		sceneViewChildElt.getAttribute('storageNodeRef')) {  
		objects.push(new gxnat.slicer.SceneViewNode(
		    storageNode.getAttribute('fileName'),
		    sceneViewChildElt,
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
 * @param {Object} sceneViewChildElt
 * @return {?string}
 */
gxnat.slicer.getDisplayNodeTypes = function(sceneViewChildElt) {

    var displayNodeRefs = 
	sceneViewChildElt.getAttribute('displayNodeRef').split(' ');
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
 * @struct
 * @param {!Element} displayNode
 * @param {!Element} sceneNode
 * @return {Object}
 */
gxnat.slicer.BasicDisplayProperties = function(displayNode, sceneNode) {
    this.displayNode =  displayNode;
    this.opacity =  parseFloat(displayNode.getAttribute('opacity'), 10);
    this.color =  gxnat.slicer.toFloatArray(displayNode.getAttribute('color'));
    this.visible =  displayNode.getAttribute('visibility') === 'true';
    this.origin =  gxnat.slicer.toFloatArray(sceneNode.getAttribute('origin'));
    this.colorMode =  parseInt(displayNode.getAttribute('colorMode'), 10);
    this.ijkToRASDirections =  sceneNode.getAttribute('ijkToRASDirections');   	
}



/**
 *
 * @param {!Element} sceneViewElt
 * @param {!Element} sceneViewChildElt
 * @return {Array.<Object.<string, string>>}
 */
gxnat.slicer.getBasicDisplayProperties = 
function(sceneViewElt, sceneViewChildElt) {

    var displayProperties = [];
    var displayNodeRefs = 
	sceneViewChildElt.getAttribute('displayNodeRef').split(' ');

    var displayNodeElts = [];
    var nodeList;
    
    goog.array.forEach(gxnat.slicer.getDisplayNodeTypes(sceneViewChildElt), 
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
		new gxnat.slicer.BasicDisplayProperties(displayNodeElts[i], 
							sceneViewChildElt));
	}
    }
    
    //window.console.log("\n\nDISPLAY PROPERTIES", displayProperties);
    return displayProperties;

}




/**
 * @param {!Element} scene
 * @param {!Element} displayNode
 * @return {?string}
 */
gxnat.slicer.getColorTableFile = function(scene, displayNode) {
    
    var colorTableFile = '';
    var colorTables = scene.getElementsByTagName('ColorTable');
    var colorTableNode;
    var colorTableStorageNodes = [];
    var colorTableStorageNode;

    var i=0,j=0, len = colorTables.length, len2 = 0;

    for (i = 0; i < len; i++) {
	colorTableNode = colorTables[i];

        if (colorTableNode.getAttribute('id') === displayNode.getAttribute('colorNodeID')) {
	    colorTableStorageNodes = scene.getElementsByTagName('ColorTableStorage');

	    for (j = 0, len2 = colorTableStorageNodes.length; j < len2; j++) {
		colorTableStorageNode = colorTableStorageNodes[j];

                if (colorTableStorageNode.getAttribute('id') === colorTableNode.getAttribute('storageNodeRef')) {
		    colorTableFile = colorTableStorageNode.getAttribute('fileName');
                    colorTableFile = (colorTableFile.split('/Data/')[1]) ? 
			'Data/' + colorTableFile.split('/Data/')[1] : colorTableFile;
		    return colorTableFile;
                }
	    }
        } 
    }
}






/**
 * @param {!Element} scene
 */
gxnat.slicer.getFibers = function(scene) {

    window.console.log("SUSPENDING GET FIBERS -- remember to turn off");
    return null;
    
    var fancyId = '';
    var fancyColorTableStorage;
    var colorTableFile = '';
    var fiberProperties;
    var fiberNode = {}

    return gxnat.slicer.getNodeFiles(
	scene, 'FiberBundle', 'FiberBundleStorage', 
	function(sceneViewChildElt, node) {	
            displayNodeRefs = 
		sceneViewChildElt.getAttribute('displayNodeRef').split(' ');
	    fiberProperties = 
		gxnat.slicer.getBasicDisplayProperties(scene, sceneViewChildElt);
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
 * @param {!ActiveXObject | !Document} sceneView
 * @return {Array.<Object.<string, string>>}
 */
gxnat.slicer.getMeshes = function(sceneView) {

    window.console.log("SUSPENDING GET MESHES -- remember to turn off");
    return null;
    return gxnat.slicer.getNodeFiles(scene, 'Model', 'ModelStorage', 
        function(sceneViewChildElt, node) {
	    node['properties'] = 
		gxnat.slicer.getBasicDisplayProperties(scene, sceneViewChildElt);
	    node['properties']['colorTable'] = 
		gxnat.slicer.getColorTableFile(scene, 
					   node['properties']['displayNode']);
    })
}







