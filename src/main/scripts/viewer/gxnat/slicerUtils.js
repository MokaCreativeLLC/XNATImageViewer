/**
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 * @author amh1646@rih.edu (Amanda Hartung)
 */
goog.provide('gxnat.slicerUtils');


// goog
goog.require('goog.dom.DomHelper');
goog.require('goog.dom');
goog.require('goog.string');
goog.require('goog.dom.xml');
goog.require('goog.array');
goog.require('goog.string.path');

// gxnat
goog.require('gxnat');
goog.require('gxnat.slicerNode');
goog.require('gxnat.slicerNode.Node');
goog.require('gxnat.slicerNode.Display');
goog.require('gxnat.slicerNode.Displayable');
goog.require('gxnat.slicerNode.Mrml');
goog.require('gxnat.slicerNode.SceneView');
goog.require('gxnat.slicerNode.Camera');
goog.require('gxnat.slicerNode.BackgroundColor');
goog.require('gxnat.slicerNode.Layout');
goog.require('gxnat.slicerNode.Mesh');
goog.require('gxnat.slicerNode.Volume');
goog.require('gxnat.slicerNode.Annotations');
goog.require('gxnat.slicerNode.SceneView');



/**
 * @constructor
 */
gxnat.slicerUtils = {};
goog.exportSymbol('gxnat.slicerUtils', gxnat.slicerUtils);



/**
 * @public
 */
gxnat.slicerUtils.GENERIC_COLORTABLE_FILE = 
    '/scripts/viewer/xiv/vis/GenericColorTable.txt';



/**
 * @param {!Array.<string>} fileList
 * @return {!Array.<string>}
 */
gxnat.slicerUtils.extractMrmls = function(fileList){
    var mrmlUrls = [];
    var i = 0;
    var len =  fileList.length;
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
gxnat.slicerUtils.getMrmlAsXml = function(mrmlUrl, callback) {
    gxnat.get(mrmlUrl, function(mrmlText){
	//window.console.log(mrmlText);
	callback(new goog.dom.xml.loadXml(mrmlText));
    }, 'text');
}



/**
 * @param {!string | !Array.<string>} fileList The file list of urls to get the 
 *    Mrmls from.
 * @param {!string} mrbUrl
 * @param {!Function} callback
 * @return {Array.<gxnat.slicerUtils.MrmlNode>}
 */
gxnat.slicerUtils.getMrmlNodes = function(fileList, mrbUrl, callback) {

    fileList = goog.isArray(fileList) ? fileList : [fileList];
    var mrmlUrls =  gxnat.slicerUtils.extractMrmls(fileList);
    var mrmlNodes = [];
    var counter = 0;

    //window.console.log("MRML URLS", mrmlUrls);

    goog.array.forEach(mrmlUrls, function(mrmlUrl){
	gxnat.slicerUtils.getMrmlAsXml(mrmlUrl, function(mDoc) {
	    counter++;
	    mrmlNodes.push(new gxnat.slicerNode.Mrml
			   (mrmlUrl, mDoc, mrbUrl, fileList));
	    if (counter == mrmlUrls.length) {
		//window.console.log('MRM SCTRUCTS RETRIEVED', mrmlNodes);
		callback(mrmlNodes);
	    }
	})
    })				    
}







/**
 * @param {!Element} sceneViewElt The scene view element.
 * @param {!gxnat.slicerNode.Mrml} mrmlNode 
 * @return {gxnat.slicerNode.SceneView}
 * @public
 */
gxnat.slicerUtils.createSceneViewProperties = 
function(sceneViewElt, mrmlNode, callback){

    gxnat.slicerUtils.getAnnotations(sceneViewElt, mrmlNode, function(annotations){
	//window.console.log("\n\n3. CREATE SCENE VIEW NODE, ANNOT", 
	//mrmlNode.mrbUrl);
	callback(new gxnat.slicerNode.SceneView(
	    sceneViewElt,
	    gxnat.slicerUtils.getCameraFromSceneView(sceneViewElt),
	    gxnat.slicerUtils.getBackgroundColorFromSceneView(sceneViewElt),
	    gxnat.slicerUtils.getLayoutFromSceneView(sceneViewElt),
	    annotations,
	    gxnat.slicerUtils.getVolumes(sceneViewElt),
	    gxnat.slicerUtils.getMeshes(sceneViewElt),
	    gxnat.slicerUtils.getFibers(sceneViewElt)
	))
    })
}



/**
 * @param {!Array.<gxnat.slicerUtils.MrmlNode>} mrmlNodes
 * @param {!Array.<string>} fileUrls The list of files relative to the XNAT
 *     server for file queryying.
 * @param {!Function} callback
 * @return {Array.<xnat.slicer.properties.Mrml>}
 */
gxnat.slicerUtils.getSceneViewNodes = function(mrmlNodes, callback) {

    var sceneViewElts = [];
    var sceneViews = [];
    var counter = 0;

    goog.array.forEach(mrmlNodes, function(mrmlNode, i){

	sceneViewElts = 
	    gxnat.slicerUtils.getSceneViewsFromMrml(mrmlNode.document);

	goog.array.forEach(sceneViewElts, function(sceneViewElt, j){
	    /**
	    window.console.log('2. SCENE VIEW ELTS', sceneViewElt, 
	                       mrmlNode.mrbUrl,
			       j, sceneViewElts.length);
	    */
	    gxnat.slicerUtils.createSceneViewProperties(sceneViewElt, 
						   mrmlNode,
	    function(sceneViewNode){
		counter++;
		sceneViews.push(sceneViewNode);
		/**
		window.console.log('4. GOT SCENE VIEW NODE!', 
				   mrmlNode.mrbUrl, 
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
gxnat.slicerUtils.getElementsFromMrml = function(mrml, tagName) {
    mrml = goog.isString(mrml) ?  gxnat.slicerUtils.getMrmlAsXml(mrml) : mrml;
    var elts = [];
    goog.array.forEach(mrml.getElementsByTagName(tagName), function(node) {
	elts.push(node);
    });	
    return elts;
}



/**
 * @param {!Document} mrml The mrml to extract the scene views from.
 * @return {Array.<Element>} An Array of scene view elements.
 */
gxnat.slicerUtils.getSceneViewsFromMrml = function(mrml) {
    return gxnat.slicerUtils.getElementsFromMrml(mrml, 'SceneView');
}




/**
 * Parses the mrml to determine the camera's parameters.
 *
 * @param {!Element} scene The scene element.
 * @return {Array.<Array.<number>>} An 2-length array of 3-length arrays: 
 *    1) the position, 2) the up vector of the camera. 3) The focal point.
 */
gxnat.slicerUtils.getCameraFromSceneView = function(sceneViewElt) {

    //window.console.log("\n\nSCENE VIEW ELT", sceneViewElt);

    var cameras =  sceneViewElt.getElementsByTagName('Camera');
    var len = cameras.length - 1;

    var pos = sceneViewElt.getElementsByTagName('Camera')[len].
		getAttribute('position');

    var viewUp = sceneViewElt.getElementsByTagName('Camera')[len].
		getAttribute('viewUp');

    var focalPt = sceneViewElt.getElementsByTagName('Camera')[len].
		getAttribute('focalPoint');

    //window.console.log("CAMERAS", cameras);
    //window.console.log(pos, viewUp, focalPt);

    return new gxnat.slicerNode.Camera(
	gxnat.slicerNode.toFloatArray(pos),
	gxnat.slicerNode.toFloatArray(viewUp),
	gxnat.slicerNode.toFloatArray(focalPt)
    )
}



/**
 * Parses the mrml to determine the camera's parameters.
 *
 * @return {!string}
 */
gxnat.slicerUtils.getThumbnail = function(sceneViewElt, mrmlDoc) {

    var storageNodeId = sceneViewElt.getAttribute('storageNodeRef');
    var sceneViewStorageNodes = 
	mrmlDoc.getElementsByTagName('SceneViewStorage');

    //window.console.log("SCENE VIEW STORAGE", sceneViewStorageNodes);

    var i = 0;
    var len = sceneViewStorageNodes.length;
    for (; i<len; i++){
	if (sceneViewStorageNodes[i].getAttribute('id') === storageNodeId){
	    //window.console.log("FOUND IT!!!", storageNode);
	    return sceneViewStorageNodes[i].getAttribute('fileName');
	}
    }
}




/**
 * Parses the scene to determine the camera's parameters.
 *
 * @param {!Element} scene The scene element.
 * @return {Array.<Array.<number>>} An MD array containing rgb values of 
 *    the background.
 */
gxnat.slicerUtils.getBackgroundColorFromSceneView = function(scene) {
    return new gxnat.slicerNode.BackgroundColor(
	scene.getElementsByTagName('View')[0].getAttribute('backgroundColor'), 
	scene.getElementsByTagName('View')[0].getAttribute('backgroundColor2'));
}






/**
 * @param {!Element} sceneView The scene element.
 * @return {number} The layout string.
 */
gxnat.slicerUtils.getLayoutFromSceneView = function(sceneView) { 
    return new gxnat.slicerNode.Layout(sceneView.
	getElementsByTagName('Layout')[0].
	getAttribute('currentViewArrangement'));
}



/**
 * Takes into account url-encoding issues with the slicer files.
 * @param {!string} fileUrl
 * @param {!Array.<string>}
 */
gxnat.slicerUtils.matchFileToSet = function(fileUrl, fileSet) {

    if (!goog.isDefAndNotNull(fileUrl)) { return };
 
    var i =  0;
    var len =  fileSet.length;
    var setName =  '';
    var urlName =  '';

    //
    // IMPORTANT!!! DO NOT ERASE!!!
    //
    // It was decided to use regexp instead of decodeUrl because
    // it was impossible to determine the number of times a given string
    // was URL encoded in the MRB and relative to XNAT.
    //
    function regexpReplace(str){
	return str.toLowerCase()
	    .replace(/%20/g, '')
	    .replace(/%2520/g, '')
	    .replace(/%2520/g, '')
	    .replace(/%253a/g, ':')
	    .replace(/%3a/g, ':')
    }

    for (; i < len; i++){

	setName = decodeURIComponent(fileSet[i].toLowerCase());
	urlName = decodeURIComponent(fileUrl.toLowerCase());

	if (urlName.indexOf('%') > -1){
	    urlName = decodeURIComponent(urlName);
	}

	//window.console.log("\n\nSET NAME", setName, "URL NAME", urlName);
	if (setName.indexOf(urlName) == (setName.length - urlName.length)){
	    
	    //
	    // IMPORTANT!!! This is necessary!!!
	    //
	    var replacer = fileSet[i].replace(/%/g, '%25');

	    if (replacer != fileSet[i]){
		var replaceStr = "\nWARNING - Changing the encoding chars" + 
		    " in the following url:\n\n" + fileSet[i] + 
		    '\n\nis now\n\n' + replacer;
		
	    }

	    return replacer;
	}
    }
}




/**
 *
 */
gxnat.slicerUtils.getFileUrlRelativeToMrbUrl = function(fileUrl, mrbUrl) {
    return goog.string.buildString(mrbUrl, '!',
		goog.string.path.basename(goog.string.path.dirname(fileUrl)),
          
				   '/', goog.string.path.basename(fileUrl))

}


/**
 * Creates and returns annotations data.  
 *
 * @param {!Element} sceneView The sceneView element.
 * @param {!gxnat.slicerUtils.MrmlNode} mrmlNode 
 * @param {!Function} The require callback function that the annotations get
 *     set to.
 * @return {Array.<Object>} The annotations as objects.
 */
gxnat.slicerUtils.getAnnotations = 
function(sceneView, mrmlNode, callback) {

    //--------------------
    // Newer slicer verions store these in a separate file (e.g. 'F.fcsv').  
    // We have to find this file first.  It is pointed to in the mrml file.
    //--------------------  
    var displayFiducials = sceneView.getElementsByTagName('MarkupsDisplay');
    var markupFiducials = sceneView.getElementsByTagName('MarkupsFiducial');
    var storageFiducials = 
	sceneView.getElementsByTagName('MarkupsFiducialStorage');
    //window.console.log('STORED FID', storageFiducials, mrbUrl);
    var annots = [];
    var fcsvUrls = [];
    var getCounter =  0;
    var storeFile = '';
    var fcsvQuery = '';
    var splitLine;
    var position;
    var color = 'rgb(255,0,0)';
    var currId = '';
    var displayNodeId = '';
    var markupsFiducialId = '';
    var name = '';
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
	//window.console.log("STORED ELT", fidElt.getAttribute('fileName'))
	//fcsvUrls.push(gxnat.slicerUtils.getFileUrlRelativeToMrbUrl(
	//    fidElt.getAttribute('fileName'), mrmlNode.mrbUrl))

	fcsvUrls.push(gxnat.slicerUtils.matchFileToSet(
			    fidElt.getAttribute('fileName'), 
			    mrmlNode.files))
    })


    //window.console.log('\n\nANNOT 1', sceneView, getCounter, fcsvUrls);

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
		name = splitLine[11];
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
		//mFid;
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
		//dispFid;
		for (i=0; i<len; i++) {
		    dispFid = displayFiducials[i];
		    currId = dispFid.getAttribute('id'); 
		    if (currId === displayNodeId) {
			color = 
			    gxnat.slicerNode.toFloatArray(
				dispFid.getAttribute('color')
			    ).map(function(x){
				return parseFloat(x);
			    })

			//window.console.log("\n\nCOLOR", color, 
			//		   dispFid.getAttribute('color'));
			break;
			
		    }
		}

		//
		// Store the annotations in an array
		//
		annots.push(new gxnat.slicerNode.Annotations(
		    position, color, splitLine,
		    markupsFiducialId, displayNodeId, name));
		
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
gxnat.slicerUtils.getDisplayables = 
function(sceneViewElt, tagName, storageNodeTagName) {

    var objects =  [];
    var storageNodes = 
    sceneViewElt.getElementsByTagName(storageNodeTagName);
    var storageNode = null;
    var i = 0;
    var len = storageNodes.length;

    goog.array.forEach(sceneViewElt.getElementsByTagName(tagName), 
    function(sceneViewDisplayableElt) {
	for (i=0; i<len; i++){
	    storageNode = storageNodes[i];
            if (storageNode.getAttribute('id') === 
		sceneViewDisplayableElt.getAttribute('storageNodeRef')) {  
		objects.push(new gxnat.slicerNode.Displayable(
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
 * @param {!Element} scene
 */
gxnat.slicerUtils.getFibers = function(scene) {

    //window.console.log("TODO: SUSPENDING GET FIBERS -- remember to turn on");
    return null;
    /**
    var fancyId = '';
    var fancyColorTableStorage;
    var colorTableFile = '';
    var fiberProperties;
    var fiberNode = {}

    return gxnat.slicerUtils.getNodeFiles(
	scene, 'FiberBundle', 'FiberBundleStorage', 
	function(sceneViewDisplayableElt, node) {	
            displayNodeRefs = 
		sceneViewDisplayableElt.getAttribute('displayNodeRef').
		split(' ');
	    fiberProperties = 
		gxnat.slicerUtils.getGeneralDisplayProperties(scene, 
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
    */
}



/**
 *
 * WARNING: Super-long function, by necessity.
 *
 * @param {!Element} sceneView
 * @return {Array.<Object.<string, string>>}
 */
gxnat.slicerUtils.getVolumes = function(sceneView) {

    var sliceVisible = false;
    var selectedVolumeID = sceneView.getElementsByTagName('Selection')[0].
	getAttribute('activeVolumeID');
    var volumes = gxnat.slicerUtils.getDisplayables(sceneView, 
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
		    volumeNode.displayNodeElement = node;
		    if (node.getAttribute('colorNodeID').indexOf(
			"vtkMRMLColorTableNodeFileGeneric")
			!= -1) {
			volumeNode.colorTableFile = serverRoot +
			    gxnat.slicerUtils.GENERIC_COLORTABLE_FILE;
			//window.console.log('color table', volumeNode);
			//window.console.log(volumeNode);
			//window.console.log(serverRoot +
			  //  gxnat.slicerUtils.GENERIC_COLORTABLE_FILE);

		    } else {
			//
			// TODO: Need to implement method for
			// non-generic colortable file loading.
			//
			// Questions: 
			// 1) How is a custom colorTable referred to
			//    in Slicer scenes?
			// 2) How do we query for the colorTable in slicer 
			//    scenes.
			//
			//window.console.log(node);
			window.console.log('Custom color table: ', 
					   node.getAttribute('colorNodeID'));
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
    var attrs =  '';
    var revVol =  '';
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
			//
			// TODO: Make sure the colortable txt 
			// points to an existing file!
			//
		    }
		}.bind(this))
	    }
	}.bind(this))
    })
    


    //
    // Finally, we add the properties to the volume.
    //
    goog.array.forEach(culledVolumes, function(volume){
	//window.console.log(volume);
	volume.properties = new gxnat.slicerNode.Volume(
	    sceneView, volume.node, selectedVolumeID);
	//window.console.log(volume.properties);
	if (volume.labelMap) { 
	    volume.properties.labelMap = volume.labelMap;
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
gxnat.slicerUtils.getMeshes = function(sceneView) {
    var meshes = gxnat.slicerUtils.getDisplayables(sceneView, 
					      'Model', 'ModelStorage');

    goog.array.forEach(meshes, function(mesh){
	//window.console.log("MESH", mesh);
	mesh.properties = new gxnat.slicerNode.Mesh(
	    sceneView, mesh.node);
    })
    //window.console.log('TODO: Verify meshes that have color tables');
    /**
    node['properties']['colorTable'] = gxnat.slicerUtils.getColorTableFile(scene, 
				       node['properties']['displayNode']);
    */				       
    return meshes;
}



goog.exportSymbol('gxnat.slicerUtils.GENERIC_COLORTABLE_FILE',
	gxnat.slicerUtils.GENERIC_COLORTABLE_FILE);
goog.exportSymbol('gxnat.slicerUtils.extractMrmls', 
		  gxnat.slicerUtils.extractMrmls);
goog.exportSymbol('gxnat.slicerUtils.getMrmlAsXml', gxnat.slicerUtils.getMrmlAsXml);
goog.exportSymbol('gxnat.slicerUtils.getMrmlNodes', gxnat.slicerUtils.getMrmlNodes);
goog.exportSymbol('gxnat.slicerUtils.createSceneViewProperties',
	gxnat.slicerUtils.createSceneViewProperties);
goog.exportSymbol('gxnat.slicerUtils.getSceneViewNodes',
	gxnat.slicerUtils.getSceneViewNodes);
goog.exportSymbol('gxnat.slicerUtils.getElementsFromMrml',
	gxnat.slicerUtils.getElementsFromMrml);
goog.exportSymbol('gxnat.slicerUtils.getSceneViewsFromMrml',
	gxnat.slicerUtils.getSceneViewsFromMrml);
goog.exportSymbol('gxnat.slicerUtils.getCameraFromSceneView',
	gxnat.slicerUtils.getCameraFromSceneView);
goog.exportSymbol('gxnat.slicerUtils.getThumbnail', gxnat.slicerUtils.getThumbnail);
goog.exportSymbol('gxnat.slicerUtils.mrmlColorToRgb', gxnat.slicerUtils.mrmlColorToRgb);
goog.exportSymbol('gxnat.slicerUtils.getBackgroundColorFromSceneView',
	gxnat.slicerUtils.getBackgroundColorFromSceneView);
goog.exportSymbol('gxnat.slicerUtils.getLayoutFromSceneView',
	gxnat.slicerUtils.getLayoutFromSceneView);
goog.exportSymbol('gxnat.slicerUtils.matchFileToSet', gxnat.slicerUtils.matchFileToSet);
goog.exportSymbol('gxnat.slicerUtils.getFileUrlRelativeToMrbUrl',
	gxnat.slicerUtils.getFileUrlRelativeToMrbUrl);
goog.exportSymbol('gxnat.slicerUtils.getAnnotations', gxnat.slicerUtils.getAnnotations);
goog.exportSymbol('gxnat.slicerUtils.getDisplayables',
	gxnat.slicerUtils.getDisplayables);

goog.exportSymbol('gxnat.slicerUtils.getFibers', gxnat.slicerUtils.getFibers);
goog.exportSymbol('gxnat.slicerUtils.getVolumes', gxnat.slicerUtils.getVolumes);
goog.exportSymbol('gxnat.slicerUtils.getMeshes', gxnat.slicerUtils.getMeshes);






