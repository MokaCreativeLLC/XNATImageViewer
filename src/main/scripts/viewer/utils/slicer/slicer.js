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
        scene = (s.getAttribute('name') === sceneName) ? s : undefined;
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
            'file':             fileName,
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
 * Parses the mrml to determine the camera's parameters.
 *
 * @param {!ActiveXObject | !Document} mrml The mrml document.
 * @return {number} The layout string.
 */
utils.slicer.getLayout = function(mrml) {
    var layout = mrml.getElementsByTagName('Layout')[0].getAttribute('currentViewArrangement');
    layout = parseInt(layout[i], 10);
    return layout;
}


