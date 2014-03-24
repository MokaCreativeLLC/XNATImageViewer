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
gxnat.slicer.MrmlStruct = function(fileName, mrmlDoc){
    this.url = fileName;
    this.document = mrmlDoc;
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
 *    MrmlStructs from.
 * @return {Array.<xnat.slicer.MrmlStruct>}
 */
gxnat.slicer.createMrmlStructs = function(fileList, callback) {
    fileList = goog.isArray(fileList) ? fileList : [fileList];
    goog.array.forEach(gxnat.slicer.extractMrmls(fileList), function(url){
	gxnat.slicer.getMrmlAsXml(url, function(mDoc){
	    callback(new gxnat.slicer.MrmlStruct(url, mDoc));
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
 * @struct
 * @param {!Array.<number>} position
 * @param {!Array.<number>} up
 * @param {!Array.<number>} focus
 *
 */
gxnat.slicer.CameraStruct = function(position, up, focus){
    this.position = position;
    this.up = up;
    this.focus = focus
}




/**
 * Parses the mrml to determine the camera's parameters.
 *
 * @param {!Element} scene The scene element.
 * @return {Array.<Array.<number>>} An 2-length array of 3-length arrays: 1) the position, 2) the up vector of the camera. 3) The focal point.
 */
gxnat.slicer.getCameraFromSceneView = function(scene) {
    return new gxnat.slicer.CameraStruct(
	scene.getElementsByTagName('Camera')[0].getAttribute('position').
	    split(" ").map(function(x){return parseInt(x)}), 
	scene.getElementsByTagName('Camera')[0].getAttribute('viewUp').
	    split(" ").map(function(x){return parseInt(x)}), 
	scene.getElementsByTagName('Camera')[0].getAttribute('focalPoint').
	    split(" ").map(function(x){return parseInt(x)})
    );
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
gxnat.slicer.BackgroundColorStruct = function(color1, color2){
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
    return new gxnat.slicer.BackgroundColorStruct(
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
 * @struct
 *
 */
gxnat.slicer.AnnotationsStruct = function(position, color, fcsvText, markupsFiducialId, displayNodeId){
    this.color = color;
    this.position = position;
    this.fcsvText = fcsvText;
    this.markupsFiducialId = markupsFiducialId;
    this.displayNodeId = displayNodeId;
}



/**
 * Creates and returns annotations, which are X.spheres.
 *
 * @param {!Element} sceneView The sceneView element.
 * @return {Array.<Object>} The annotations as objects.
 */
gxnat.slicer.getAnnotationsFromSceneView = function(sceneView, mrbUrl) {

    //
    // Newer slicer verions store these in a separate file.  
    // We're using this approach for now...
    //  
    var displayFiducials = sceneView.getElementsByTagName('MarkupsDisplay');
    var markupFiducials = sceneView.getElementsByTagName('MarkupsFiducial');
    var storageFiducials = 
	sceneView.getElementsByTagName('MarkupsFiducialStorage');

    window.console.log('STORED FID', storageFiducials);

    var annots = [];
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

    if (storageFiducials.length > 0){
	goog.array.forEach(storageFiducials, function(fidElt){

	    storeFile = fidElt.getAttribute('fileName');
	    fcsvQuery = goog.string.buildString( mrbUrl, '!',
		 goog.string.remove(goog.string.path.basename(mrbUrl), 
			'.' + goog.string.path.extension(mrbUrl)), '/', 
						     storeFile)

	    gxnat.get(fcsvQuery, function(fcsvText){
		//window.console.log(fcsvText);

		// Remove the commented lines..
		goog.array.forEach(fcsvText.split(/\n/), function(fcsvLine){
		    if (fcsvLine.indexOf('#') === -1){

			splitLine = fcsvLine.split(/,/);
			if (splitLine.length == 1) { return };

			position = [parseFloat(splitLine[1]), 
					parseFloat(splitLine[2]),
					parseFloat(splitLine[3])]
			
			color = [1,0,0];
			currId = '';
			displayNodeId = '';
			markupsFiducialId = '';
			
			// Get the displayNode Id to retrieve the color.
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

			// Get the color from the displayNode fiducial
			len = displayFiducials.length;
			dispFid;
			for (i=0; i<len; i++) {
			    dispFid = displayFiducials[i];
			    currId = dispFid.getAttribute('id'); 
			    if (currId === displayNodeId) {
				color = dispFid.getAttribute('color').
				    split(" ").map(function(x){return 
							       parseFloat(x)});
				//window.console.log("\n\nCOLOR", color);
				break;
				    
			    }
			}
			annots.push(new gxnat.slicer.AnnotationsStruct(
			    position, color, splitLine,
			    markupsFiducialId, displayNodeId));
		    }
		    //window.console.log(annots)
		})
		// Positions are in array locations 1-3
		window.console.log("ANNOTATIONS", annots);
		//callback(new goog.dom.xml.loadXml(mrmlText));
	    }, 'text');				   
	})
    }    
}




/**
 * Takes a MRML file and the dropped xiv.ui.Thumbnail as argunents. Creates an XML Doc from the file.
 * Extracts wanted scene from MRML file (gets scene name from dropped xiv.ui.Thumbnail).
 * Extracts object information from scene, and creates all objects. Sets the
 * 2D renderers to display the correct volume (or the first loaded, if selected
 * is inaccessible). Adds annotations and sets camera position.
 *
 * @param {String} mrmlFile The mrml file uri.
 */
gxnat.slicer.getSlicerSettings = function(mrmlFile) {
    
    var mrml;
    var slicerSettings = {};
    var currScene;

    

    //----------------
    // Load mrml and extract scene names.
    //----------------
    mrml = gxnat.slicer.getMrmlAsXml(mrmlFile);
   

    //----------------
    // Get SceneViews
    //----------------
    slicerSettings['__scenes__'] = this.getSceneViews(mrml);
  

    //----------------
    // Get all of the relevant scene aspects
    //----------------
    goog.array.forEach(slicerSettings['__scenes__'], function(sceneView) { 

	currScene = gxnat.slicer.getScene(mrml, sceneView);

	// Check reserved property, rename accordingly.
	sceneView = (sceneView === '__scenes__') ? sceneView.replace('__', '___') : sceneView;
	
	slicerSettings[sceneView] = {};
	slicerSettings[sceneView]['scene'] = currScene;
	slicerSettings[sceneView]['volumes'] = gxnat.slicer.getVolumes(currScene);
	slicerSettings[sceneView]['meshes'] = gxnat.slicer.getMeshes(currScene);
	slicerSettings[sceneView]['fibers'] = gxnat.slicer.getFibers(currScene);

	// Add annotations.
	slicerSettings[sceneView]['annotations'] = gxnat.slicer.getAnnotations(currScene);

	// Set up camera.
	slicerSettings[sceneView]['camera'] = gxnat.slicer.getCamera(currScene);

	// Background color
	slicerSettings[sceneView]['background-color'] = gxnat.slicer.getBackgroundColor(currScene);

	// Layout
	slicerSettings[sceneView]['layout'] = gxnat.slicer.getLayout(currScene);
	slicerSettings[sceneView]['layout'] = slicerSettings[sceneView]['layout'] ? slicerSettings[sceneView]['layout'] : 'FourUp';


    }.bind(this))


    //console.log("SLICER SETTINGS - ALL", slicerSettings);
    return slicerSettings
}





/**
 * Generic file getion method for using the scene xml to
 * get data, by the 'tagName' argument and that convert data 
 * to an object with relevant information.
 *
 * @param {!Element} scene The scene element.
 * @param {!string} tagName
 * @param {!string} storageNodeType
 * @param {function} 
 * @return {Array.<Object.<string, string>>}
 */
gxnat.slicer.getNodeFiles = function(scene, tagName, storageNodeType, opt_loopCallback) {

    var objects = [];
    var storageNodeRef = '';
    var storageNode;
    var fileName = '';  
    var emptyFileObject = function(){ return { 'file': fileName}};
    var currObject = {};


    goog.array.forEach(scene.getElementsByTagName(tagName), function(sceneElement) {

	// GET STORAGE NODE REFERENCE
	//
        // Find the storage node reference: this will be an attribute
	// within the element (i).  However, the reference is NOT the node
	// itself.  To find the node we have to parse through the mrml again.
        storageNodeRef = sceneElement.getAttribute('storageNodeRef');
	
	// GET STORAGE NODE (from REFERENCE)
	//
        // Parse the mrml, using the storage node reference to find the actual
	// storage node that is being referred to.
        goog.array.forEach(scene.getElementsByTagName(storageNodeType), function(itemStorage) {
            if (itemStorage.getAttribute('id') === storageNodeRef) { 
		storageNode = itemStorage; 
	    }
        });
        //console.log(sceneElement, storageNode);

        // CLEAN FILENAME
        fileName = storageNode.getAttribute('fileName');
        fileName = (fileName.split('/Data/')[1]) ? 'Data/' + fileName.split('/Data/')[1] : fileName
        

	// ADD FILENAME
	currObject = emptyFileObject(); 
        currObject['file'] = fileName;
	currObject['storageNode'] = storageNode;

	//console.log("\n\nFILENAME", tagName, fileName);
	// RUN CALLBACK
        if (opt_loopCallback !== undefined) { opt_loopCallback(sceneElement, currObject);}

        // CONSTRUCT OBJECT
        objects.push(currObject);
    });
    return objects;
}




/**
 *
 * @param {Object} sceneElement
 * @return {?string}
 */
gxnat.slicer.getDisplayNodeTypes = function(sceneElement) {

    var displayNodeRefs = sceneElement.getAttribute('displayNodeRef').split(' ');
    var displayNodeTypes = [];
    var displayNodeType = ''

    for (var i = 0, len = displayNodeRefs.length; i < len; i++) {
	displayNodeType = displayNodeRefs[i].replace('vtkMRML', '').split('Node')[0];


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
 *
 * @param {!Element} displayNode
 * @return {Object}
 */
gxnat.slicer.makeDisplayProperties = function(displayNode, sceneNode) {

   //window.console.log("\n\nNOPACITY", displayNode, displayNode.getAttribute('opacity'), parseFloat(displayNode.getAttribute('opacity'), 10));
    return {
	'displayNode' : displayNode,
	'opacity' : parseFloat(displayNode.getAttribute('opacity'), 10),
	'color' : xiv.convert.toFloatArray(displayNode.getAttribute('color')),
	'visible' : displayNode.getAttribute('visibility') === 'true',
	'origin' : xiv.convert.toFloatArray(sceneNode.getAttribute('origin')),
	'colorMode': parseInt(displayNode.getAttribute('colorMode'), 10),
	'ijkToRASDirections': sceneNode.getAttribute('ijkToRASDirections'),
    }	
}



/**
 *
 * @param {!Element} scene
 * @param {!Element} sceneElement
 * @return {Array.<Object.<string, string>>}
 */
gxnat.slicer.getBasicDisplayProperties = function(scene, sceneElement) {

    var displayProperties = [];
    var displayNodeRefs = sceneElement.getAttribute('displayNodeRef').split(' ');
    var displayNodeElements = [];
    var nodeList;
    
    goog.array.forEach(gxnat.slicer.getDisplayNodeTypes(sceneElement), function(displayNodeType){
	goog.array.forEach(scene.getElementsByTagName(displayNodeType), function(node){
	    displayNodeElements.push(node)
	})
    })
     
 
    //window.console.log("DIS", sceneElement, displayNodeRefs, displayNodeElements);

    for (var i = 0, len = displayNodeElements.length; i < len; i++) {
	if (displayNodeRefs.indexOf(displayNodeElements[i].getAttribute('id')) > -1 ) {
	    displayProperties.push(gxnat.slicer.makeDisplayProperties(displayNodeElements[i], sceneElement));
	}
    }
    //console.log("DISPLAY PROPERTIES", displayProperties);
    return (displayProperties.length === 1) ? displayProperties[0] : displayProperties;

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

    var fancyId = '';
    var fancyColorTableStorage;
    var colorTableFile = '';
    var fiberProperties;
    var fiberNode = {}

    return this.getNodeFiles(scene, 'FiberBundle', 'FiberBundleStorage', function(sceneElement, node) {
  
	
        displayNodeRefs = sceneElement.getAttribute('displayNodeRef').split(' ');
	fiberProperties = gxnat.slicer.getBasicDisplayProperties(scene, sceneElement);
	//console.log("FIBER PROPERTIES", fiberProperties);


	goog.array.forEach(fiberProperties, function(fiberProperty){
	    //fiberProperty['colorTable'] = [];
	    //fiberProperty['colorTable'].push(gxnat.slicer.getColorTableFile(scene, fiberProperty['displayNode']));
	    if (fiberProperty['colorMode'] === 1) {
		fancyId = fiberProperty['displayNode'].getAttribute('DiffusionTensorDisplayPropertiesNodeRef');
		goog.array.forEach(scene.getElementsByTagName('DiffusionTensorDisplayProperties'), function(displayProperty) {
		    if (displayProperty.getAttribute('id') === fancyId) {
			//console.log('\n\nFOUND FANCY, fancyId');


			fancyColorTableStorage = displayProperty.getAttribute('storageNodeRef');
			goog.array.forEach(scene.getElementsByTagName('ColorTableStorage'), function(colorTableStorageNode) {
			    if (colorTableStorageNode.getAttribute('id') === fancyColorTableStorage) {
				
				colorTableFile = colorTableStorageNode.getAttribute('fileName');
				//console.log("*************", colorTableFile);
				fiberProperty['colorTable'] = colorTableFile
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
 * @param {!ActiveXObject | !Document} scene
 * @return {Array.<Object.<string, string>>}
 */
gxnat.slicer.getMeshes = function(scene) {
    return this.getNodeFiles(scene, 'Model', 'ModelStorage', 
        function(sceneElement, node) {
	    node['properties'] = 
		gxnat.slicer.getBasicDisplayProperties(scene, sceneElement);
	    node['properties']['colorTable'] = 
		gxnat.slicer.getColorTableFile(scene, 
					   node['properties']['displayNode']);
    })
}




/**
 *
 * @param {!Element} scene
 * @return {Array.<Object.<string, string>>}
 */
gxnat.slicer.getVolumes = function(scene) {

    var sliceVisible = false;

    var selectedVolumeID = scene.getElementsByTagName('Selection')[0].getAttribute('activeVolumeID');

    var getVolumeProperties = function(sceneElement, node){
        node['properties'] = gxnat.slicer.getBasicDisplayProperties(scene, sceneElement);
	node['properties']['colorTable'] = gxnat.slicer.getColorTableFile(scene, node['properties']['displayNode']);
	node['properties']['isSelectedVolume'] =  (selectedVolumeID !== sceneElement.getAttribute('id')) ? false : true;

	if (node['properties']['displayNode']){
	    node['properties']['upperThreshold'] =  parseInt(node['properties']['displayNode'].getAttribute('upperThreshold'), 10);
	    node['properties']['lowerThreshold'] =  parseInt(node['properties']['displayNode'].getAttribute('lowerThreshold'), 10);
	} 

	// Volume visible is a bit unique:
	// Slicer sets the visible by slice.
	// Here, we determine the visible in reference to 
	// the the slices in a given scene.
	if (node['properties']['isSelectedVolume']) {
	    sliceVisible = false;
	    goog.array.forEach(scene.getElementsByTagName('Slice'), function(sliceElement){
		sliceVisible = sliceElement.getAttribute('sliceVisibility') === 'true' || sliceVisible
	    })
	    node['properties']['visible'] = sliceVisible;
	} else {
	    node['properties']['visible'] = false;
	}

    }

    var volumes = this.getNodeFiles(scene, 'Volume', 'VolumeArchetypeStorage', function(sceneElement, object) {
	getVolumeProperties(sceneElement, object);
    });


    // NOTE: DiffusionTensorVolumes create rendering issues in XTK. Skipping for now.
    //
    //var volumes2 = this.getNodeFiles(scene, 'DiffusionTensorVolume', 'VolumeArchetypeStorage', function(sceneElement, object) {
    //	getVolumeProperties(sceneElement, object);
    //});
    //volumes = volumes.concat(volumes2); 

    return volumes;
}



