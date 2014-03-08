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
 * other includes
 */
goog.require('utils.slicer');

/**
 * Closure includes
 */
goog.require('goog.string');


/**
 * @constructor
 */
goog.provide('utils.xtk');
utils.xtk = {}
goog.exportSymbol('utils.xtk', utils.xtk);




/**
 * @const
 * @type {Array.<string>}
 * 
 */
utils.xtk.volumeExtensions_ = [
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
utils.xtk.dicomExtensions_ = [
    'dicom', 
    'dcm',
    'ima',
];



/**
 * @const
 * @type {Array.<string>}
 * 
 */
utils.xtk.analyzeExtensions_ = [
    'hdr',
    'img'
];



/**
 * @const
 * @type {Array.<string>}
 * 
 */
utils.xtk.niftiExtensions_ = [
    'nii',
    'nii.gz'
];



/**
 * @const
 * @type {Array.<string>}
 * 
 */
utils.xtk.imageExtensions_ = [
    'jpeg',
    'jpg',
    'png',
    'img'
];





/**
 * @const
 * @type {Array.<string>}
 * 
 */
utils.xtk.meshExtensions_ = [
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
utils.xtk.fiberExtensions_ = [
    'trk'
];





/**
 * Returns XTK object (mesh, volume, ...) to be created, as determined by
 * file extension. https://github.com/xtk/X/wiki/X%3AFileformats
 *
 * @param {string} ext Extension of file, all lowercase
 * @return {Object} New X object
 */
utils.xtk.generateXtkObjectFromExtension = function(ext) {
    var obj = undefined;
    if (this.isMesh(ext)) { 
	obj = new X.mesh();
    } else if (this.isVolume(ext) || this.isDicom(ext) || this.isImage(ext)){
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
 * @param {Object} annotationObj The annotation object with the relevant properties.
 * @param {number=} opt_radius The optional radius of the annotation object (default is 3).
 * @return {X.sphere}
 */
utils.xtk.makeAnnotation = function(annotationObj, opt_radius) {

    var annotation = new X.sphere();
    annotation.center = annotationObj['location'];
    annotation.caption = annotationObj['name'];
    annotation.name = annotationObj['name'];
    annotation.radius = (opt_radius === undefined) ? 3 : opt_radius;
    window.console.log(annotationObj['opacity'], annotationObj['visible']);
    annotation.opacity = annotationObj['opacity'];
    annotation.visible = annotationObj['visible'];
    annotation.color = annotationObj['color'];
    window.console.log("\n\n\n\t\tANNOT", annotation);
    return annotation;
};





/**
 * Scans the 'ext' argument to determine if the extension
 * at hand is an XTK volume.
 *
 * @param {string} ext The extension to check.
 * @return {boolean} Whether the extension matches the category.
 */
utils.xtk.isVolume = function(ext) {
     return (this.volumeExtensions_.indexOf(ext) > -1 ) ?  true: false;
}




/**
 * Scans the 'ext' argument to determine if the extension
 * at hand is paret of an image set.
 *
 * @param {string} ext The extension to check.
 * @return {boolean} Whether the extension matches the category.
 */
utils.xtk.isImage = function(ext) {
     return (this.imageExtensions_.indexOf(ext) > -1 ) ?  true: false;
}




/**
 * Scans the 'ext' argument to determine if the extension
 * at hand is a DICOM set.
 * @param {string} ext The extension to check.
 * @return {boolean} Whether the extension matches the category.
 */
utils.xtk.isDicom = function(ext) {
     return (this.dicomExtensions_.indexOf(ext) > -1 ) ?  true: false;
}



/**
 * Scans the 'ext' argument to determine if the extension
 * at hand is an Analyze set.
 * @param {string} ext The extension to check.
 * @return {boolean} Whether the extension matches the category.
 */
utils.xtk.isAnalyze = function(ext) {
     return (this.analyzeExtensions_.indexOf(ext) > -1 ) ?  true: false;
}



/**
 * Scans the 'ext' argument to determine if the extension
 * at hand is a NIFTI set.
 * @param {string} ext The extension to check.
 * @return {boolean} Whether the extension matches the category.
 */
utils.xtk.isNifti = function(ext) {
     return (this.niftiExtensions_.indexOf(ext) > -1 ) ?  true: false;
}



/**
 * Scans the 'ext' argument to determine if the extension
 * at hand is an XTK mesh.
 *
 * @param {string} ext The extension to check.
 * @return {boolean} Whether the extension matches the category.
 */
utils.xtk.isMesh = function(ext) {
    return (this.meshExtensions_.indexOf(ext) > -1 ) ?  true: false;
}




/**
 * Scans the 'ext' argument to determine if the extension
 * at hand is an XTK fiber bundle.
 *
 * @param {string} ext The extension to check.
 * @return {boolean} Whether the extension matches the category.
 */
utils.xtk.isFiber = function(ext) {
   return (this.fiberExtensions_.indexOf(ext) > -1 ) ?  true: false;
}




/**
 * @return {Object.<string, Array>}
 */
utils.xtk.getEmptyViewablesObject = function(){
    return {
	'fibers': [],
	'volumes': [],
	'dicoms': [],
	'analyze': [],
	'nifti': [],
	'meshes':[],
	'annotations': [],
	'images':[]
    };
}



/**
 * Returns the type of the object associated with the given file type. 
 * The object type will be either 'volume', 'mesh', or 'fiber'.
 *
 * @param {!string | !Array.<string>} fileCollection The files to 
 *    categorize based on X.Objects.
 * @return {!string | !Array.<string>}
 */

utils.xtk.getViewables = function(fileCollection) {

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
	var ext = utils.string.getFileExtension(basename);

	//
	// Skip if the filename starts with a period
	//
	if (goog.string.startsWith(basename, '.')) continue;


	
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

	} else if (this.isImage(ext)){
	    viewableTypes['images'].push(fileCollection[i]);

	} 
    }
    


    //-------------------------	
    // Rerturn the constructed 'viewableTypes' object.
    //-------------------------	
    window.console.log("VIEWABLE TYPES", viewableTypes);


    //----------------
    // Cull Empty Viewables
    //----------------
    goog.object.forEach(viewableTypes, function(vbl, key){
	if (!vbl.length){
	    goog.object.remove(viewableTypes, key); 
	}
    })
    window.console.log("VIEWABLE TYPES - culled", viewableTypes);
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
utils.xtk.createXObject = function(fileCollection) {

    //window.console.log("FILE COLLECT", fileCollection);

    var ext = (goog.isArray(fileCollection)) ? 
	utils.string.getFileExtension(fileCollection[0]) : 
	utils.string.getFileExtension(fileCollection);
    var obj = this.generateXtkObjectFromExtension(ext);  
    
	
    var urlEncode = function(url){
	var dirname = utils.string.dirname(url);
	var basename = utils.string.basename(url);

	//
	// Four doubly encododed basenames
	//
	if ((basename.indexOf('%') > -1) || (basename.indexOf(' ') > -1)){
	    basename = goog.string.urlEncode(basename);
	}

	//console.log("\n\n*********RETN", dirname ,   basename);
	return dirname + '/' + basename
    }

    //
    // URL decode
    //
    if (goog.isArray(fileCollection)){
	var newFileCollection = [];
	goog.array.forEach(fileCollection, function(fileName){
	    newFileCollection.push(urlEncode(fileName));
	})
	fileCollection = newFileCollection;
	
    } else {
	fileCollection = urlEncode(fileCollection)
    }


    //console.log("FIRST", fileCollection, obj);  



    obj.file = fileCollection;



    //console.log(obj);
    //return
    return obj;
}









/**
 * Adds various display/visibility properties to 
 * a given XTK object.
 *
 * @param {!X.Object} xObj
 * @param {!Object} properties
 */
utils.xtk.setProperties = function(xObj, properties) {

    window.console.log("SET PROPERTIES", xObj, properties, xObj.file);

    if (!properties) {
	return;
    }


    //--------------------
    // Color -- volumes: .maxColor, meshes: .color
    //--------------------
    if (properties['color']) {
        xObj.color = properties['color'];
    }
    


    //--------------------
    // Color table (if it exists).
    //--------------------
    if (properties['colorTable']) {
        xObj.labelmap.file = xObj.file;
        xObj.labelmap.colortable.file = properties['colorTable'];
    }
    

    if (properties['fiberDisplay']){
	goog.array.forEach(properties['fiberDisplay'], function(fiberDisplay){
	    if (fiberDisplay['colorTable']) {
		//xObj.labelmap.file = xObj.file;
		//xObj.labelmap.colortable.file = fiberDisplay['colorTable'];

		console.log("COLOR TABLE SET", xObj.colortable, fiberDisplay['colorTable']);
		xObj.colortable.file = fiberDisplay['colorTable'];
	    }
	})
    }


    //--------------------
    // Opacity
    //--------------------
    if (properties['opacity']) {
	//window.console.log("\n\n********OPACITY\n\n", xObj, properties['opacity'])
        xObj.opacity = parseFloat(properties['opacity'], 10);
    }


    //--------------------
    // Visibility.
    //
    // We basically have to set 
    // all visibilities to true
    // and then afterwards reconcile them
    // with the settings (likely slicer settings)
    // and then set them to false.
    //--------------------
    xObj.visible = true;



    //--------------------
    // Selected Volume
    //--------------------
    if (properties['isSelectedVolume'] !== undefined) {
	xObj['isSelectedVolume'] = properties['isSelectedVolume'];
    }



    //--------------------
    // Threshold
    //--------------------
    if (properties['lowerThreshold'] !== NaN){
        xObj.lowerThreshold = properties['lowerThreshold'];
    }
    if (properties['upperThreshold'] !== NaN){
        xObj.upperThreshold = properties['upperThreshold'];
    }

    


    //--------------------
    // Center.
    //--------------------
    if (properties['origin']) {
        xObj.center =  properties['origin'];
        xObj.origin =  properties['origin'];
        

	console.log("ORIGIN", properties['origin'])
	//
	// Apply any transforms that come about from it.
	//
	if (properties['transform']){
            xObj.transform.matrix = new Float32Array(utils.convert.toFloatArray(properties['transform']));
	}
    }
}
