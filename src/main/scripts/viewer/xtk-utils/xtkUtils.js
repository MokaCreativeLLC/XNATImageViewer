/**
 * @author amh1646@rih.edu (Amanda Hartung)
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 */

/**
 * XTK includes
 */
goog.require('X.mesh');
goog.require('X.volume');
goog.require('X.fibers');
goog.require('X.sphere');



/**
 * @constructor
 */
goog.provide('xtkUtils');
var xtkUtils = {}
goog.exportSymbol('xtkUtils', xtkUtils);




/**
 * @const
 * @type {Array.<string>}
 * 
 */
xtkUtils.volumeExtensions_ = [
    'nrrd', 
    'nii', 
    'nii.gz', 
    'mgh', 
    'mgz', 
];




/**
 * @const
 * @type {Array.<string>}
 * 
 */
xtkUtils.dicomExtensions_ = [
    'dicom', 
    'dcm',
    'ima'
];




/**
 * @const
 * @type {Array.<string>}
 * 
 */
xtkUtils.meshExtensions_ = [
    'stl',
    'vtk',
    'obj',
    'fsm',
    'inflated',
    'smoothwm',
    'pial',
    'orig'
];




/**
 * @const
 * @type {Array.<string>}
 */
xtkUtils.fiberExtensions_ = [
    'trk'
];





/**
 * Returns XTK object (mesh, volume, ...) to be created, as determined by
 * file extension. https://github.com/xtk/X/wiki/X%3AFileformats
 *
 * @param {string} ext Extension of file, all lowercase
 * @return {Object} New X object
 */
xtkUtils.generateXtkObjectFromExtension = function(ext) {
    var obj = undefined;
    if (this.isMesh(ext)) { 
	obj = new X.mesh();
    } else if (this.isVolume(ext) || this.isDicom(ext)){
	obj = new X.volume();
    } else if (this.isFiber(ext)){
	obj = new X.fibers();
    } else {

    }
    return obj;
};




/**
 * Makes an annotation by creating a sphere
 * and applying the relevant parameters to that
 * sphere (center, name, color, radius, etc.).
 * 
 * @param {Array.<number>, string, Object=}
 * @return {X.sphere}
 */
xtkUtils.makeAnnotation = function(center, name, opt_args) {
    var point = new X.sphere();
    point.center = center;
    point.name = name;
    point.radius = (opt_args && opt_args['radius'] != undefined) ? parseInt(opt_args['radius'], 10) : 3;
    point.opacity = (opt_args && opt_args['opacity'] != undefined) ? parseFloat(opt_args['opacity'], 10) : 1;
    point.visible = (opt_args && opt_args['visiblity'] != undefined) ? opt_args['visiblity'] : true;
    point.color = (opt_args && opt_args['color'] != undefined) ? opt_args['color'] : [1,0,0];
    return point;
};





/**
 * Scans the 'ext' argument to determine if the extension
 * at hand is an XTK volume.
 *
 * @param {string}
 * @return {boolean}
 */
xtkUtils.isVolume = function(ext) {
    for (var j=0; j < this.volumeExtensions_.length; j++) {
        if (this.volumeExtensions_[j] == ext) { return true; }
    }
    return false;
}




/**
 * Scans the 'ext' argument to determine if the extension
 * at hand is a DICOM set.
 *
 * @param {string}
 * @return {boolean}
 */
xtkUtils.isDicom = function(ext) {
    for (var j=0; j < this.dicomExtensions_.length; j++) {
        if (this.dicomExtensions_[j] == ext) {return true;}
    }
    return false;
}




/**
 * Scans the 'ext' argument to determine if the extension
 * at hand is an XTK mesh.
 *
 * @param {string}
 * @return {boolean}
 */
xtkUtils.isMesh = function(ext) {
    for (var j=0; j < this.meshExtensions_.length; j++) {
        if (this.meshExtensions_[j] == ext) { return true;}
    }
    return false;
}




/**
 * Scans the 'ext' argument to determine if the extension
 * at hand is an XTK fiber bundle.
 *
 * @param {string}
 * @return {boolean}
 */
xtkUtils.isFiber = function(ext) {
    for (var j=0; j < this.fiberExtensions_.length; j++) {
        if (this.fiberExtensions_[j] == ext) { return true; }
    }
    return false;
}




/**
 * @return {Object.<string, Array>}
 */
xtkUtils.getEmptyViewablesObject = function(){
    return {
	'slicer': [],
	'fibers': [],
	'volumes': [],
	'dicoms': [],
	'meshes':[],
	'annotations': []
    };
}



/**
 * Returns the type of the object associated with the given file type. 
 * The object type will be either 'volume', 'mesh', or 'fiber'.
 *
 * @param {!string | !Array.<string>}
 * @return {!string | !Array.<string>}
 */

xtkUtils.getViewables = function(fileCollection) {

    //-------------------------	
    // Get an empty viewables object for storage.
    //-------------------------	    
    var viewableTypes = this.getEmptyViewablesObject();
    
    

    //-------------------------	
    // Make 'fileCollection' an array if it's not.
    //-------------------------	
    if (!typeof file == 'array') { fileCollection = [fileCollection] }



    //-------------------------	
    // Loop through fileCollection the first time
    // for Slicer files and fiber bundles.  The mrmls, for instance
    // take priority over the other node files.
    //-------------------------	
    for (var i = 0, len = fileCollection.length; i < len; i++) {
	var basename = utils.string.basename(fileCollection[i]);


	//
	// Skip if the filename starts with a period
	//
	if (goog.string.startsWith(basename, '.')) continue;


	var ext = utils.string.getFileExtension(basename);
	if (ext === 'mrml') { 
	    viewableTypes['slicer'].push(fileCollection[i]);
	
	} else if (this.isVolume(ext)) {
	    viewableTypes['volumes'].push(fileCollection[i]);

	} else if (this.isDicom(ext)) {
	    viewableTypes['dicoms'].push(fileCollection[i]);
	
	} else if (this.isMesh(ext)){
	    viewableTypes['meshes'].push(fileCollection[i]);

	} else if (this.isFiber(ext)){
	    viewableTypes['fibers'].push(fileCollection[i]);

	}
    }
    


    //-------------------------	
    // Rerturn the constructed 'viewableTypes' object.
    //-------------------------	
    return viewableTypes
}




/**
 * Creates and returns a new X object, generating
 * the type of X object by the extension provided in
 * the fileCollection.
 *
 * @param {!string | !Array.<string>}
 * @return {X.Object}
 */
xtkUtils.createXObject = function(fileCollection) {
    var ext = (goog.isArray(fileCollection)) ? utils.string.getFileExtension(fileCollection[0]) : utils.string.getFileExtension(fileCollection);
    var obj = this.generateXtkObjectFromExtension(ext);        
    obj.file = fileCollection;
    return obj;
}




/**
 * Creates and returns annotations, which are X.spheres.
 *
 * @param {!ActiveXObject | !Document}
 * @return {Array.<X.sphere>}
 */
xtkUtils.extractAnnotations = function(scene) {
    var annotations = [];
    


    //-------------------------	
    // Loop through the scene mrml to determine 
    // the annotation objects.
    //-------------------------	
    goog.array.forEach(scene.getElementsByTagName('AnnotationFiducials'), function(a) {
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
        goog.array.forEach(scene.getElementsByTagName(displayNodeTypes[1]), function(itemDisplay) {
            if (itemDisplay.getAttribute('id') == displayNodeRefs[1]) {
                pointDisplay = itemDisplay;
            }
        });
        
        annotations.push([a, pointDisplay]);
        
    });
    
    return annotations;
    
}




/**
 * Parses the mrml to determine the camera's parameters.
 *
 * @param {!ActiveXObject | !Document}
 * @return {Array.<Array.<number>, Array.<number>>}
 */
xtkUtils.extractCamera = function(scene) {
    var pos = scene.getElementsByTagName('Camera')[0].getAttribute('position').split(' ');
    var up = scene.getElementsByTagName('Camera')[0].getAttribute('viewUp').split(' ');
    for (var i = 0, len = pos.length; i < len; ++i) {
        pos[i] = parseFloat(pos[i], 10);
        up[i] = parseFloat(up[i], 10);
    }
    return [pos, up];
}




/**
 * Generic file extraction method for using the scene xml to
 * extract data, by the 'tagName' argument and that convert data 
 * to an object with relevant information.
 *
 * @param {!ActiveXObject | !Document, !string, !string}
 * @return {Array.<Object.<string, string>>}
 */
xtkUtils.extractFileInfo = function(scene, tagName, storageNodeType) {
    var objects = [];
    


    //----------------------------------
    // Get the volume that will be displayed
    // in the 2D renderers.
    //----------------------------------
    var selectedVolumeID = scene.getElementsByTagName('Selection')[0].getAttribute('activeVolumeID');
 
    

    //----------------------------------
    // Loop through the scene, extracting the elements by
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
        // Extract display info. (color, visibility, etc.)
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
                                console.log(fancyColors);
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
            
	    console.log(scene);
	    console.log(displayNodeType);
	    //
            // Find corresponding tagName display component.
	    //
            goog.array.forEach(scene.getElementsByTagName(displayNodeType), function(itemDisplay) {
                
		console.log(itemDisplay.getAttribute('id') , displayNodeRef)
                if (itemDisplay.getAttribute('id') == displayNodeRef) {
                    displayNode = itemDisplay;
                    color = itemDisplay.getAttribute('color');
                    visibility = itemDisplay.getAttribute('visibility');
                }
            });
        }
        
        

        //**********************************************
        // Extract colortable info.
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
 * Extracts the scene element that corresponds to
 * the 'sceneName' argument.  It should be noted that
 * element is just a markup language object, and not an
 * element for HTML display.
 * 
 * @param {!ActiveXObject | !Document, !string}
 * @return {Element}
 */
xtkUtils.extractScene = function(mrml, sceneName) {
    var scene;
    goog.array.forEach(mrml.getElementsByTagName('SceneView'), function(s) {
        if (s.getAttribute('name') == sceneName) scene = s;
    });
    return scene;
}




/**
 * Uses the browsers native methods to load in an 
 * xml document for extracting various tag-attribute
 * information. 
 *
 * @param {!string}
 * @return {ActiveXObject | Document}
 */
xtkUtils.loadXMLDoc = function(documentName) {
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
 * Parse an array of strings ('fileCollection') to find
 * the one with the '.mrml' extension. 
 *
 * @param {!Array.<string>}
 * @return {string}
 */
xtkUtils.getMrmlFileFromArray = function(fileCollection) {
    var mrmlFile = undefined;
    goog.array.forEach(fileCollection, function(fName) {
	if (fName.substring(fName.length - 4).toLowerCase() === 'mrml'){
	    mrmlFile = fName;
	}
    })
    if (mrmlFile === undefined){
	console.log("Slicer Scene load error: no .mrml file found!");
    }
    return mrmlFile
} 




/**
 * Adds various display/visibility attributes to 
 * a given XTK object.
 *
 * @param {!X.Object, !Object}
 */
xtkUtils.addAttributesToXObject = function(xObj, attributes) {

    //--------------------
    // Color -- volumes: .maxColor, meshes: .color
    //--------------------
    if (attributes['color']) {
        xObj.color = attributes['color'];
    }
    


    //--------------------
    // Color table (if it exists).
    //--------------------
    if (attributes['colorTable']) {
        xObj.labelmap.file = file;
        xObj.labelmap.colortable.file = attributes['colorTable'];
    }
    


    //--------------------
    // Opacity
    //--------------------
    if (attributes['opacity'])
        xObj.opacity = parseFloat(attributes['opacity'], 10);
    


    //--------------------
    // Visibility.
    //--------------------
    if (attributes['visibility'])
        xObj.visible = attributes['visibility'] === 'true';
    


    //--------------------
    // Center.
    //--------------------
    if (attributes['center']) {
        xObj.center =  attributes['center'];
        
	//
	// Apply any transforms that come about from it.
	//
	if (attributes['transform']){
            xObj.transform.matrix = new Float32Array(utils.convert.toFloatArray(attributes['transform']));
	}
    }
}
