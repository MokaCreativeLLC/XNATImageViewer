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
 * Generic file getion method for using the scene xml to
 * get data, by the 'tagName' argument and that convert data 
 * to an object with relevant information.
 *
 * @param {!ActiveXObject | !Document, !string, !string}
 * @return {Array.<Object.<string, string>>}
 */
utils.slicer.getFileInfo = function(scene, tagName, storageNodeType) {
    var objects = [];
    


    //----------------------------------
    // Get the volume that will be displayed
    // in the 2D renderers.
    //----------------------------------
    var selectedVolumeID = scene.getElementsByTagName('Selection')[0].getAttribute('activeVolumeID');
 
    

    //----------------------------------
    // Loop through the scene, geting the elements by
    // the 'tagName'...
    //----------------------------------
    goog.array.forEach(scene.getElementsByTagName(tagName), function(i) {
        
        //
        // Find the storage node reference: this will be an attribute
	// within the element (i).  However, the reference is NOT the node
	// itself.  To find the node we have to parse through the mrml again.
        //
        var storageNodeRef = i.getAttribute('storageNodeRef');


	//
        // Parse the mrml, using the storage node reference to find the actual
	// storage node that is being referred to.
	//
        var storageNode;
        goog.array.forEach(scene.getElementsByTagName(storageNodeType), function(itemStorage) {
            if (itemStorage.getAttribute('id') === storageNodeRef) { 
		storageNode = itemStorage; 
	    }
        });
        

        
        //**********************************************
        // Get display info. (color, visibility, etc.)
        //**********************************************



	//
        // Fiber bundles are special... they have multiple display nodes (3)
        // one or more of them may have the visibility set to true.
        // if any are set to true, we want to display the fibers.
	//
        var displayNode;
        if (tagName == 'FiberBundle') {
            var displayNodeRefs = i.getAttribute('displayNodeRef').split(' ');
            var displayNodeTypes = [];
            visibility = 'false';


            for (var j = 0; j < displayNodeRefs.length; ++j) {

		//
                // Strip away the vtkMRML and the Node##, but then we still need 'Node'
		//
                displayNodeTypes[j] = displayNodeRefs[j].split('vtkMRML')[1].split('Node')[0] + 'Node';
                
                goog.array.forEach(scene.getElementsByTagName(displayNodeTypes[j]), function(itemDisplay) {
                    if (itemDisplay.getAttribute('id') == displayNodeRefs[j]) {


			//
                        // Set the color to be the line display node's color.
			//
                        if (!color) color = itemDisplay.getAttribute('color');
                        

			//
                        // If there is no displayNode yet, set one just so we have one.
			//
                        if (!displayNode) displayNode = itemDisplay;
                        

			//
                        // Then set visibility.
			//
                        if (itemDisplay.getAttribute('visibility') == 'true') {
                            visibility = 'true';
                            var colorMode = itemDisplay.getAttribute('colorMode');


			    //
                            // if colorMode = 0, regular color
                            // if colorMode = 1, fancy multicolors
			    //
                            if (colorMode == '1') {
                                var fancyColors = itemDisplay.getAttribute('DiffusionTensorDisplayPropertiesNodeRef');
                                //console.log(fancyColors);
                            }
                        }
                    }
                });
            }
        }
        

	//
        // Volumes, meshes (models).
	//
        else {
            var displayNodeRef = i.getAttribute('displayNodeRef').split(' ')[0];
            var displayNodeType = displayNodeRef.split('vtkMRML')[1].split('Node')[0];
            
            if (displayNodeType == 'ScalarVolumeDisplay')
                displayNodeType = 'VolumeDisplay';
            if (displayNodeType == 'NCIRayCastVolumeRenderingDisplay')
                displayNodeType = 'NCIRayCastVolumeRendering';
            if (displayNodeType == 'GPURayCastVolumeRenderingDisplay')
                displayNodeType = 'GPURayCastVolumeRendering';
            
	    //console.log(scene);
	    //console.log(displayNodeType);
	    //
            // Find corresponding tagName display component.
	    //
            goog.array.forEach(scene.getElementsByTagName(displayNodeType), function(itemDisplay) {
                
		//console.log(itemDisplay.getAttribute('id') , displayNodeRef)
                if (itemDisplay.getAttribute('id') == displayNodeRef) {
                    displayNode = itemDisplay;
                    color = itemDisplay.getAttribute('color');
                    visibility = itemDisplay.getAttribute('visibility');
                }
            });
        }
              

        //**********************************************
        // Get colortable info.
        //**********************************************

	
	//
        // Find corresponding tagName color table (if it exists).
	//
        var colorTableFile;
        if (displayNode.getAttribute('colorNodeID')) {
            goog.array.forEach(scene.getElementsByTagName('ColorTable'), function(ct) {
                if (ct.getAttribute('id') == displayNode.getAttribute('colorNodeID')) {
                    goog.array.forEach(scene.getElementsByTagName('ColorTableStorage'), function(cts) {
                        if (cts.getAttribute('id') == ct.getAttribute('storageNodeRef')) {
                            colorTableFile = cts.getAttribute('fileName');
                            if (colorTableFile.split('/Data/')[1])
                                colorTableFile = 'Data/' + colorTableFile.split('/Data/')[1];
                        }
                    });
                } 
            });
        }
        


	//
        // String clean. Construct a relative path (full paths create errors)
	// for the fileName.
	//
        var fileName = storageNode.getAttribute('fileName');
        if (fileName.split('/Data/')[1]) {
            fileName = 'Data/' + fileName.split('/Data/')[1];
        }



	//
        // Only the selected volume should be visible (or none).
	//
        var isSelectedVolume;
        if (tagName == 'Volume') {
            visibility = displayNode.getAttribute('visibility');
            if (selectedVolumeID != i.getAttribute('id')) {
                visibility = 'false';
                isSelectedVolume = false;
            } else {
                isSelectedVolume = true;
            }
        } else {
            isSelectedVolume = false;
        }
        
        
        
        //
        // Construct object with keys and attributes
	// to return related to the visibility of the node.
        //
        objects.push({
            'file':             goog.string.urlDecode(fileName),
            'isSelectedVolume': isSelectedVolume,
            
            'attributes':   {
                'color':        color,
		
                'colorTable':   colorTableFile,
                'opacity':      displayNode.getAttribute('opacity'),
                'visibility':   visibility
            }
        });
    });
    
    return objects;
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
    return [pos, up];
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
 * @param {!ActiveXObject | !Document} mrml The mrml document.
 * @return {Object} sphere The annotations as objects.
 */
utils.slicer.getAnnotations = function(mrml) {
    var annotations = [];
    


    //-------------------------	
    // Loop through the mrml to determine 
    // the annotation objects.
    //-------------------------	
    goog.array.forEach(mrml.getElementsByTagName('AnnotationFiducials'), function(a) {
        var displayNodeRefs = a.getAttribute('displayNodeRef').split(' ');
        var displayNodeTypes = [];
        var pointDisplay;
        

	//
	// Extraction stage 1.
	//
        for (var i = 0; i < displayNodeRefs.length; ++i) {
            displayNodeTypes[i] = displayNodeRefs[i].split('vtkMRML')[1].split('Node')[0];
        }
        

	//
        // Extraction stage 2.
	//
        goog.array.forEach(mrml.getElementsByTagName(displayNodeTypes[1]), function(itemDisplay) {
            if (itemDisplay.getAttribute('id') == displayNodeRefs[1]) {
                pointDisplay = itemDisplay;
            }
        });
        
        annotations.push([a, pointDisplay]);
        
    });
    
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
	    //if (selectedVolumeFile.length === 0 && slicerSetting['attributes']['colorTable']) {
	    //	utils.dom.debug('picking the color table');
	    //	selectedVolumeFile = utils.string.basename(slicerSettingFile);
	    //}
	}



	//----------------
	// Add annotations.
	//----------------
	slicerSettings[sceneView]['annotations'] = utils.slicer.getAnnotations(currScene);


	// FROM XTK DISPLAYER
	//annotations = this.getAnnotations();
	//goog.array.forEach(annotations, function(annotation){
	//that.currentViewables_['annotations'].push(annotation['xObject']);
	//slicerSettings['annotations'].push({'isAnnotation': true, 'name': annotation['xObject'].name , 'attributes' : annotation['attributes']})
	//})



	//----------------
	// Set up camera.
	//----------------
	slicerSettings[sceneView]['camera'] = utils.slicer.getCamera(currScene);
	//this.XtkPlaneManager_.setCameraSettings('3D', {'position':  slicerSettings['camera'][0], 'up':  slicerSettings['camera'][1]});
	



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
		if (selectedVolumeFile.length === 0 && slicerSetting['attributes']['colorTable']) {
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

    var emptyFileObject = function(){
	return { 'file': fileName}
    }
    var currObject = {};



    goog.array.forEach(scene.getElementsByTagName(tagName), function(sceneElement) {
        
        //
	// GET STORAGE NODE REFERENCE
	//
        // Find the storage node reference: this will be an attribute
	// within the element (i).  However, the reference is NOT the node
	// itself.  To find the node we have to parse through the mrml again.
        //
        storageNodeRef = sceneElement.getAttribute('storageNodeRef');
	


	//
	// GET STORAGE NODE (from REFERENCE)
	//
        // Parse the mrml, using the storage node reference to find the actual
	// storage node that is being referred to.
	//
        goog.array.forEach(scene.getElementsByTagName(storageNodeType), function(itemStorage) {
            if (itemStorage.getAttribute('id') === storageNodeRef) { 
		storageNode = itemStorage; 
	    }
        });
        //console.log(sceneElement, storageNode);



	//
        // CLEAN FILENAME
	//
        fileName = goog.string.urlDecode(storageNode.getAttribute('fileName'));
        if (fileName.split('/Data/')[1]) {
            fileName = 'Data/' + fileName.split('/Data/')[1];
        }
	

	//
	// ADD FILENAME
	//
	currObject = emptyFileObject(); 
        currObject['file'] = fileName;

	console.log("\n\nFILENAME", tagName, fileName);
	//
	// RUN CALLBACK
	//
        if (opt_loopCallback !== undefined) {
	    opt_loopCallback(sceneElement, currObject);
	}


        //
        // CONSTRUCT OBJECT
        //
        objects.push(currObject);


    });

    
    return objects;
}




/**
 *
 */
utils.slicer.getFibers = function(scene) {

    
    var displayNodeRefs = [];
    var displayNodeTypes = [];
    var displayNode;
    var visibility = false;
    var color = [0.5,0.5,0.5];
    var colorMode;
    var fancyColors;
    var fiberNodes = [];

    var fancyId = '';
    var fancyColorTableStorage;
    var colorTableFile = '';
    


    //----------------------------------
    // Loop through the scene, geting the elements by
    // the 'tagName'...
    //----------------------------------
    var objects = this.getNodeFiles(scene, 'FiberBundle', 'FiberBundleStorage', function(sceneElement, object) {
  
        // Fiber bundles are special... they have multiple display nodes (3)
        // one or more of them may have the visibility set to true.
        // if any are set to true, we want to display the fibers.	
        displayNodeRefs = sceneElement.getAttribute('displayNodeRef').split(' ');
        displayNodeTypes = [];
        goog.array.forEach(displayNodeRefs, function(displayNodeRef, i) {
            // Strip away the vtkMRML and the Node##, but then we still need 'Node'
            displayNodeTypes[i] = displayNodeRef.split('vtkMRML')[1].split('Node')[0] + 'Node';
	    // Fiber bundles come in threes
            goog.array.forEach(scene.getElementsByTagName(displayNodeTypes[i]), function(displayNode) {
                if (displayNode.getAttribute('id') === displayNodeRef) {
		    //console.log("BUNDLE", displayNode);
                    // Set the color to be the line display node's color.
		    opacity = parseInt(displayNode.getAttribute('opacity'), 10);
		    color = displayNode.getAttribute('color');         
                    visibility = (displayNode.getAttribute('visibility') === 'true') ? true : false;
                    colorMode = displayNode.getAttribute('colorMode');
		    //console.log("COLOR MODE", colorMode);
                    // if colorMode = 0, regular color, colorMode = 1, fancy multicolors

		    // GET OPACITY
		    opacity = parseInt(displayNode.getAttribute('opacity'), 10);
		    
		    if (colorMode === '1') {
			//fancyColors = 
			fancyId = displayNode.getAttribute('DiffusionTensorDisplayPropertiesNodeRef');
			goog.array.forEach(scene.getElementsByTagName('DiffusionTensorDisplayProperties'), function(displayProperty) {
			    if (displayProperty.getAttribute('id') === fancyId) {
				console.log('\n\nFOUND FANCY, fancyId');
				//fancyColorTableStorage = displayProperty.getAttribute('storageNodeRef');
				goog.array.forEach(scene.getElementsByTagName('ColorTableStorage'), function(colorTableStorageNode) {
				    if (colorTableStorageNode.getAttribute('id') === fancyColorTableStorage) {
					
					colorTableFile = colorTableStorageNode.getAttribute('fileName');
					//console.log("*************", colorTableFile);
				    }
				})
			    }
			})
		    }
		    //colorTableFile = utils.slicer.getColorTableFile(scene, displayNode);
		    fiberNodes.push({
			'color':        color,
			'colorMode' : colorMode,
			'fancyColors': fancyColors,
			'visibility':   visibility,
			'colorTableFile': colorTableFile

		    })
                }
            })
	})
        
	object['fiberNodes'] = fiberNodes;
    })
    
    return objects;
}




/**
 *
 * @param {!ActiveXObject | !Document} scene
 * @return {Array.<Object.<string, string>>}
 */
utils.slicer.getMeshes = function(scene) {

    var displayNode;
    var displayNodeRef;
    var displayNodeType;
    var colorTableID  = '';
    var colorTableFile;
    var opacity = 1;
    var color = [0.5, 0.5, 0.5];


    var objects = this.getNodeFiles(scene, 'Model', 'ModelStorage', function(sceneElement, object) {


	//
	// GET DISPLAY NODE TYPE
	//  
        displayNodeRef = sceneElement.getAttribute('displayNodeRef').split(' ')[0];
        displayNodeType = displayNodeRef.split('vtkMRML')[1].split('Node')[0];
	//console.log(sceneElement.getAttribute('displayNodeRef').split(' '))
	//console.log("MESH", displayNodeRef.split('vtkMRML')[1].split('Node'))


	//
        // GET DISPLAY NODE, COLOR AND VISIBILITY (from TYPE, REFERENCE)
	//
        goog.array.forEach(scene.getElementsByTagName(displayNodeType), function(_displayNode) {
            if (_displayNode.getAttribute('id') === displayNodeRef) {
                displayNode = _displayNode;
		opacity = parseInt(displayNode.getAttribute('opacity'), 10);
                color = _displayNode.getAttribute('color');
                visibility = _displayNode.getAttribute('visibility');
            }
        });

        
        //
        // CONSTRUCT OBJECT
        //
        object['attributes'] = {   
                'color':        color,
                'colorTable':   colorTableFile,
                'opacity':      opacity,
                'visibility':   visibility
	}
    });

    
    return objects;
}





/**
 *
 * @param {!ActiveXObject | !Document} scene
 * @return {Array.<Object.<string, string>>}
 */
utils.slicer.getVolumes = function(scene) {

    var displayNode;
    var displayNodeRef;
    var displayNodeType;
    var colorTableID  = '';
    var colorTableFile;
    var opacity = 1;
    var color = [0.5, 0.5, 0.5];


    //var tagName = 'Volume';
    //var storageNodeType = 'VolumeArchetypeStorage';

    var selectedVolumeID = scene.getElementsByTagName('Selection')[0].getAttribute('activeVolumeID');
    console.log("SELECTED VOLUME ID", selectedVolumeID);
    var isSelectedVolume = false; 




    var innerFunc = function(sceneElement, object){
	//
	// GET DISPLAY NODE TYPE
	//  
        displayNodeRef = sceneElement.getAttribute('displayNodeRef').split(' ')[0];
        displayNodeType = displayNodeRef.split('vtkMRML')[1].split('Node')[0];
	//console.log("****");
	//console.log(sceneElement.getAttribute('displayNodeRef').split(' '))
	//console.log("VOLUME", displayNodeRef.split('vtkMRML')[1].split('Node'))
	//console.log("****");
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
	default:
	    break;
	}

  

	//
        // GET DISPLAY NODE, COLOR AND VISIBILITY (from TYPE, REFERENCE)
	//
        goog.array.forEach(scene.getElementsByTagName(displayNodeType), function(_displayNode) {
            if (_displayNode.getAttribute('id') === displayNodeRef) {
                displayNode = _displayNode;
		opacity = parseInt(displayNode.getAttribute('opacity'), 10);
                color = _displayNode.getAttribute('color');
                visibility = _displayNode.getAttribute('visibility');
            }
        });
        
        

        //
	// GET COLORTABLE FILE (from DISPLAY NODE)
	//
	goog.array.forEach(scene.getElementsByTagName('ColorTable'), function(colorTableNode) {
            if (colorTableNode.getAttribute('id') === displayNode.getAttribute('colorNodeID')) {
		goog.array.forEach(scene.getElementsByTagName('ColorTableStorage'), function(colorTableStorageNode) {
                    if (colorTableStorageNode.getAttribute('id') === colorTableNode.getAttribute('storageNodeRef')) {
			colorTableFile = colorTableStorageNode.getAttribute('fileName');
			if (colorTableFile.split('/Data/')[1]) {
                            colorTableFile = 'Data/' + colorTableFile.split('/Data/')[1];
			}
                    }
		});
            } 
	});
	 


	//
        // GET IS_SELECTED_VOLUME
	//
	console.log("SCENE ELEMENT ID", sceneElement.getAttribute('id'));
        if (selectedVolumeID !== sceneElement.getAttribute('id')) {
            visibility = 'false';
            isSelectedVolume = false;
        } else {
            isSelectedVolume = true;
        }


        
        //
        // CONSTRUCT OBJECT
        //
        object['isSelectedVolume'] =  isSelectedVolume,
        object['attributes'] = {   
                'color':        color,
                'colorTable':   colorTableFile,
                'opacity':      opacity,
                'visibility':   visibility
	}

    }

    var objects = this.getNodeFiles(scene, 'Volume', 'VolumeArchetypeStorage', function(sceneElement, object) {
	innerFunc(sceneElement, object);
    });

    var objects2 = this.getNodeFiles(scene, 'DiffusionTensorVolume', 'VolumeArchetypeStorage', function(sceneElement, object) {
	innerFunc(sceneElement, object);
    });

    return objects.concat(objects2);
}
