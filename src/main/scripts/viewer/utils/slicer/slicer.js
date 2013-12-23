/**
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 * @author amh1646@rih.edu (Amanda Hartung)
 */

/**
 * Google closure includes
 */
goog.require('goog.dom.DomHelper');




/**
 * @constructor
 */
goog.provide('utils.slicer');
utils.slicer = {};
goog.inherits(utils.slicer, utils);
goog.exportSymbol('utils.slicer', utils.slicer);




/**
 * Gets the scene element that corresponds to
 * the 'sceneName' argument.  It should be noted that
 * element is just a markup language object, and not an
 * element for HTML display.
 * 
 * @param {!ActiveXObject | !Document} mrml The scene view to get.
 * @param {!string}
 * @return {Element}
 */
utils.slicer.getScene = function(mrml, sceneName) {
    var scene;
    goog.array.forEach(mrml.getElementsByTagName('SceneView'), function(s) {
	if (s.getAttribute('name') === sceneName) {
	     scene = s;
	}
    });
    return scene;
}




/**
 * Uses the browsers native methods to load in an 
 * xml document for geting various tag-attribute
 * information. 
 *
 * @param {!string}
 * @return {ActiveXObject | Document}
 */
utils.slicer.loadXMLDoc = function(documentName) {
    var xhttp;
    var xmlDoc;

    

    //--------------------
    // Get XML file.
    //--------------------
    if (window.XMLHttpRequest) {
        xhttp = new XMLHttpRequest();
    } else {
        xhttp = new ActiveXObject("Microsoft.XMLHTTP");
    }
    xhttp.open("GET", documentName, false);
    xhttp.send();



    //--------------------
    // Parse the XML file.
    //--------------------    
    if (window.DOMParser) {
	parser = new DOMParser();
	xmlDoc = parser.parseFromString(xhttp.responseText, "application/xml");
    


    //--------------------
    // IE
    //--------------------
    } else {
	xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
	xmlDoc.async = false;
	xmlDoc.loadXML(text); 
    } 

    return xmlDoc;
}







/**
 * Parses the mrml to determine the camera's parameters.
 *
 * @param {!ActiveXObject | !Document} mrml The mrml document.
 * @return {Array.<Array.<number>>} An 2-length array of 3-length arrays: 1) the position, 2) the up vector of the camera.
 */
utils.slicer.getCamera = function(mrml) {
    var pos = mrml.getElementsByTagName('Camera')[0].getAttribute('position').split(' ');
    var up = mrml.getElementsByTagName('Camera')[0].getAttribute('viewUp').split(' ');
    for (var i = 0, len = pos.length; i < len; ++i) {
        pos[i] = parseFloat(pos[i], 10);
        up[i] = parseFloat(up[i], 10);
    }
    return {'position': pos, 'up': up};
}




/**
 * Parses the mrml to determine the camera's parameters.
 *
 * @param {!ActiveXObject | !Document} mrml The mrml document.
 * @return {Array.<Array.<number>>} An MD array containing rgb values of the background.
 */
utils.slicer.getBackgroundColor = function(mrml) {

    var bgColor = mrml.getElementsByTagName('View')[0].getAttribute('backgroundColor').split(' ');
    var bgColor2 = mrml.getElementsByTagName('View')[0].getAttribute('backgroundColor2').split(' ');
    
    for (var i = 0, len = bgColor.length; i < len; i++) {
        bgColor[i] = parseFloat(bgColor[i], 10);
        bgColor2[i] = parseFloat(bgColor2[i], 10);
    }
    return [bgColor, bgColor2];
}




/**
 * @type {Object.<number, string>}
 */
utils.slicer.layoutStringMap = {
    '2': 'Conventional',
    '3': 'Four-Up'
}




/**
 * Parses the mrml to determine the camera's parameters.
 *
 * @param {!ActiveXObject | !Document} mrml The mrml document.
 * @return {number} The layout string.
 */
utils.slicer.getLayout = function(mrml) { 
    var layout = mrml.getElementsByTagName('Layout')[0].getAttribute('currentViewArrangement');
    return utils.slicer.layoutStringMap[layout];
}




/**
 * Creates and returns annotations, which are X.spheres.
 *
 * @param {!Element} mrml The mrml document.
 * @return {Array.<Object>} The annotations as objects.
 */
utils.slicer.getAnnotations = function(mrml) {
    var annotations = [];
    var displayNodeRefs;
    var displayNodeTypes = [];
    var pointDisplay;
    var i=0;
    var location = [0,0,0];
    var color = [1,1,1];
    var name = '';
    var visible  = '';
    var opacity = '';


    goog.array.forEach(mrml.getElementsByTagName('AnnotationFiducials'), function(a) {

	// Get basic values
	location = a.getAttribute('ctrlPtsCoord');
	name = a.getAttribute('name');
	
	
	// Get the display notes from the AnnotationFiducial element
        displayNodeRefs = a.getAttribute('displayNodeRef').split(' ');
        displayNodeTypes = [];
        for (i = 0, len = displayNodeRefs.length; i<len; ++i) {
            displayNodeTypes.push(displayNodeRefs[i].split('vtkMRML')[1].split('Node')[0]);
        }   
	

        // Get the point, color, and text values from the nodes.
	goog.array.forEach(displayNodeTypes, function(displayNodeType, i){
            goog.array.forEach(mrml.getElementsByTagName(displayNodeType), function(itemDisplay) {
		if ((itemDisplay.getAttribute('id') === displayNodeRefs[i]) && (displayNodeRefs[i].indexOf('Text') > -1)) {
		    color = itemDisplay.getAttribute('color');   
		    visible = itemDisplay.getAttribute('visibility');
		    opacity = itemDisplay.getAttribute('opacity');
		}
            })
	})

 
        annotations.push({
	    'location': utils.convert.toFloatArray(location),
	    'visible': visible === 'true',
	    'opacity': parseFloat(opacity, 10),
	    'name': name,
	    'color': utils.convert.toFloatArray(color), 
	});
    })
    return annotations;
    
}




/**
 *
 *
 * @param {!ActiveXObject | !Document} mrml The mrml document.
 * @return {Array.<String>} The scene views as strings.
 */
utils.slicer.getSceneViews = function(mrml) {
    var sceneViews = [];
    goog.array.forEach(mrml.getElementsByTagName('SceneView'), function(sceneView) { 
	sceneViews.push(sceneView.getAttribute('name'));
    });
    return sceneViews;
}





/**
 * Takes a MRML file and the dropped xiv.Thumbnail as argunents. Creates an XML Doc from the file.
 * Extracts wanted scene from MRML file (gets scene name from dropped xiv.Thumbnail).
 * Extracts object information from scene, and creates all objects. Sets the
 * 2D renderers to display the correct volume (or the first loaded, if selected
 * is inaccessible). Adds annotations and sets camera position.
 *
 * @param {String} mrmlFile The mrml file uri.
 */
utils.slicer.getSlicerSettings = function(mrmlFile) {
    
    var that = /**@type{xiv.XtkDisplayer}*/ this;
    var mrml;
    var slicerSettings = {};
    var selectedVolumeFile = /**@type{String}*/ '';
    var viewableObjectFile = /**@type{String}*/ '';
    var cameraInfo = /**@type{Array}*/ [];
    var annotations =  /**@type{Array.Object}*/ [];
    var currScene;
    var volumes;
    

    //----------------
    // Load mrml and extract scene names.
    //----------------
    mrml = utils.slicer.loadXMLDoc(mrmlFile);
   

    

    //----------------
    // Get SceneViews
    //----------------
    slicerSettings['__scenes__'] = this.getSceneViews(mrml);
    //console.log(slicerSettings['SceneView']);
 

    //----------------
    // Get all of the releveant scene aspects
    //----------------
    goog.array.forEach(slicerSettings['__scenes__'], function(sceneView) { 

	currScene = utils.slicer.getScene(mrml, sceneView);

	// Check reserved property, rename accordingly.
	sceneView = (sceneView === '__scenes__') ? sceneView.replace('__', '___') : sceneView;
	
	
	slicerSettings[sceneView] = {};
	slicerSettings[sceneView]['scene'] = {};
	slicerSettings[sceneView]['scene'] = currScene;

	slicerSettings[sceneView]['volumes'] = {};
	slicerSettings[sceneView]['volumes'] = that.getVolumes(currScene);
	//slicerSettings[scene]['volumes'] = utils.slicer.getFileInfo(currScene, 'Volume', 'VolumeArchetypeStorage');

	slicerSettings[sceneView]['meshes'] = {};
	slicerSettings[sceneView]['meshes'] = that.getMeshes(currScene);
	//slicerSettings[scene]['meshes'] = utils.slicer.getFileInfo(currScene, 'Model', 'ModelStorage');

	slicerSettings[sceneView]['fibers'] = {};
	slicerSettings[sceneView]['fibers'] = that.getFibers(currScene);
	//slicerSettings[scene]['fibers'] = utils.slicer.getFileInfo(currScene, 'FiberBundle', 'FiberBundleStorage');


	
	//
	// Make sure there's a selected volume for every scene.
	//
	volumes = slicerSettings[sceneView]['volumes'];

	var selectedFound = false;
	var selecteds = [];
	goog.array.forEach(volumes, function(volume){
	    selectedFound =(volume['isSelectedVolume']) ? true : false;
	    if (volume['isSelectedVolume']){
		selecteds.push(volume)
	    }
	})

	console.log("SELECTEDS", selecteds);
	if (!selectedFound){
	    //if (selectedVolumeFile.length === 0 && slicerSetting['properties']['colorTable']) {
	    //	utils.dom.debug('picking the color table');
	    //	selectedVolumeFile = utils.string.basename(slicerSettingFile);
	    //}
	}



	//----------------
	// Add annotations.
	//----------------
	//slicerSettings[sceneView]['annotations'] = utils.slicer.getAnnotations(mrml);
	slicerSettings[sceneView]['annotations'] = utils.slicer.getAnnotations(currScene);


	// FROM XTK DISPLAYER
/*
	annotations = this.getAnnotations();
	goog.array.forEach(annotations, function(annotation){
	    this.currentViewables_['annotations'].push(annotation['xObject']);
	    slicerSettings['annotations'].push({'isAnnotation': true, 'name': annotation['xObject'].name , 'properties' : annotation['properties']})
	}.bind(this))
*/



	//----------------
	// Set up camera.
	//----------------
	slicerSettings[sceneView]['camera'] = utils.slicer.getCamera(currScene);


	//----------------
	// Background color
	//----------------
	slicerSettings[sceneView]['background-color'] = utils.slicer.getBackgroundColor(currScene);
	//this.XtkPlaneManager_.setBackgroundColor('3D', slicerSettings['background-color']);

	
	//----------------
	// Layout
	//----------------
	slicerSettings[sceneView]['layout'] = utils.slicer.getLayout(currScene);
	slicerSettings[sceneView]['layout'] = slicerSettings['layout'] ? slicerSettings['layout'] : 'Four-Up';


    })


    console.log("SLICER SETTINGS - ALL", slicerSettings);
    //----------------
    // Cleanup viewable objects
    //----------------

    /*
    for (var scene in slicerSettings) {
	if (slicerSettings.hasOwnProperty(scene)) {
 	    console.log(scene);
	    console.log(slicerSettings[scene]);           
	}
    }
    */

    //goog.array.forEach(sceneViews, function(scene){

	//for (var setting in slicerSettings[scene]){
	    
	    //goog.array.forEach(slicerSettings[scene][setting], function(slicerSetting) {

		//
		// Determine the selectedVolume (i.e. the volume to display in 2D planes)
		//

		/*
		slicerSettingFile = slicerSetting['file'];
		if (slicerSetting['isSelectedVolume']) { 
		    selectedVolumeFile = slicerSettingFile;
		}
		if (selectedVolumeFile.length === 0 && slicerSetting['properties']['colorTable']) {
		    utils.dom.debug('picking the color table');
		    selectedVolumeFile = utils.string.basename(slicerSettingFile);
		}
		*/
	    //});
	//}
    //})



    //----------------
    // Set isSelectedVolume to matching file
    //----------------
    /*
    for (var key in slicerSettings){
	goog.array.forEach(slicerSettings[key], function(slicerSetting) {
	    if ((slicerSetting.file === selectedVolumeFile) && (selectedVolumeFile.length > 0)) { 
		slicerSetting['isSelectedVolume'] = true; 
	    }
	});
    }
    */






    //----------------
    // Return slicerSettings
    //----------------
    return slicerSettings
}





/**
 * Generic file getion method for using the scene xml to
 * get data, by the 'tagName' argument and that convert data 
 * to an object with relevant information.
 *
 * @param {!ActiveXObject | !Document} scene
 * @param {!string} tagName
 * @param {!string} storageNodeType
 * @param {function} 
 * @return {Array.<Object.<string, string>>}
 */
utils.slicer.getNodeFiles = function(scene, tagName, storageNodeType, opt_loopCallback) {

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

	console.log("\n\nFILENAME", tagName, fileName);
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
utils.slicer.getDisplayNodeTypes = function(sceneElement) {

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
utils.slicer.makeDisplayProperties = function(displayNode, sceneNode) {

   //window.console.log("\n\nNOPACITY", displayNode, displayNode.getAttribute('opacity'), parseFloat(displayNode.getAttribute('opacity'), 10));
    return {
	'displayNode' : displayNode,
	'opacity' : parseFloat(displayNode.getAttribute('opacity'), 10),
	'color' : utils.convert.toFloatArray(displayNode.getAttribute('color')),
	'visibility' : displayNode.getAttribute('visibility') === 'true',
	'origin' : utils.convert.toFloatArray(sceneNode.getAttribute('origin')),
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
utils.slicer.getBasicDisplayProperties = function(scene, sceneElement) {

    var displayProperties = [];
    var displayNodeRefs = sceneElement.getAttribute('displayNodeRef').split(' ');
    var displayNodeElements = [];
    var nodeList;
    
    goog.array.forEach(utils.slicer.getDisplayNodeTypes(sceneElement), function(displayNodeType){
	//nodeList = scene.getElementsByTagName(displayNodeType);	
	//console.log("NODE LIST", displayNodeType, nodeList);
	goog.array.forEach(scene.getElementsByTagName(displayNodeType), function(node){
	    displayNodeElements.push(node)
	})
    })
     
 
    //window.console.log("DIS", sceneElement, displayNodeRefs, displayNodeElements);

    for (var i = 0, len = displayNodeElements.length; i < len; i++) {
	if (displayNodeRefs.indexOf(displayNodeElements[i].getAttribute('id')) > -1 ) {
	    displayProperties.push(utils.slicer.makeDisplayProperties(displayNodeElements[i], sceneElement));
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
utils.slicer.getColorTableFile = function(scene, displayNode) {
    
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
 *
 */
utils.slicer.getFibers = function(scene) {


    var fancyId = '';
    var fancyColorTableStorage;
    var colorTableFile = '';
    


    var fiberProperties;
    var fiberNode = {}

    return this.getNodeFiles(scene, 'FiberBundle', 'FiberBundleStorage', function(sceneElement, node) {
  
	
        displayNodeRefs = sceneElement.getAttribute('displayNodeRef').split(' ');
	fiberProperties = utils.slicer.getBasicDisplayProperties(scene, sceneElement);
	console.log("FIBER PROPERTIES", fiberProperties);


	goog.array.forEach(fiberProperties, function(fiberProperty){
	    //fiberProperty['colorTable'] = [];
	    //fiberProperty['colorTable'].push(utils.slicer.getColorTableFile(scene, fiberProperty['displayNode']));
	    if (fiberProperty['colorMode'] === 1) {
		fancyId = fiberProperty['displayNode'].getAttribute('DiffusionTensorDisplayPropertiesNodeRef');
		goog.array.forEach(scene.getElementsByTagName('DiffusionTensorDisplayProperties'), function(displayProperty) {
		    if (displayProperty.getAttribute('id') === fancyId) {
			console.log('\n\nFOUND FANCY, fancyId');


			fancyColorTableStorage = displayProperty.getAttribute('storageNodeRef');
			goog.array.forEach(scene.getElementsByTagName('ColorTableStorage'), function(colorTableStorageNode) {
			    if (colorTableStorageNode.getAttribute('id') === fancyColorTableStorage) {
				
				colorTableFile = colorTableStorageNode.getAttribute('fileName');
				console.log("*************", colorTableFile);
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
utils.slicer.getMeshes = function(scene) {
    return this.getNodeFiles(scene, 'Model', 'ModelStorage', function(sceneElement, node) {
        node['properties'] = utils.slicer.getBasicDisplayProperties(scene, sceneElement);
	node['properties']['colorTable'] = utils.slicer.getColorTableFile(scene, node['properties']['displayNode']);
    })
}




/**
 *
 * @param {!ActiveXObject | !Document} scene
 * @return {Array.<Object.<string, string>>}
 */
utils.slicer.getVolumes = function(scene) {

    var selectedVolumeID = scene.getElementsByTagName('Selection')[0].getAttribute('activeVolumeID');

    var getVolumeProperties = function(sceneElement, node){
        node['properties'] = utils.slicer.getBasicDisplayProperties(scene, sceneElement);
	node['properties']['colorTable'] = utils.slicer.getColorTableFile(scene, node['properties']['displayNode']);
	node['properties']['isSelectedVolume'] =  (selectedVolumeID !== sceneElement.getAttribute('id')) ? false : true;
    }

    var volumes = this.getNodeFiles(scene, 'Volume', 'VolumeArchetypeStorage', function(sceneElement, object) {
	getVolumeProperties(sceneElement, object);
    });

    var volumes2 = this.getNodeFiles(scene, 'DiffusionTensorVolume', 'VolumeArchetypeStorage', function(sceneElement, object) {
	getVolumeProperties(sceneElement, object);
    });

    return volumes.concat(volumes2);
}
