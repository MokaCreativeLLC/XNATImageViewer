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
    'ima'
];




/**
 * @const
 * @type {Array.<string>}
 * 
 */
utils.xtk.imageExtensions_ = [
    'jpeg',
    'jpg',
    'png'
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
 * @param {Array.<number>, string, Object=}
 * @return {X.sphere}
 */
utils.xtk.makeAnnotation = function(center, name, opt_args) {
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
 *
 * @param {string} ext The extension to check.
 * @return {boolean} Whether the extension matches the category.
 */
utils.xtk.isDicom = function(ext) {
     return (this.dicomExtensions_.indexOf(ext) > -1 ) ?  true: false;
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
	'meshes':[],
	'annotations': [],
	'images':[]
    };
}



/**
 * Returns the type of the object associated with the given file type. 
 * The object type will be either 'volume', 'mesh', or 'fiber'.
 *
 * @param {!string | !Array.<string>} fileCollection The files to categorize based on X.Objects.
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
    var ext = (goog.isArray(fileCollection)) ? utils.string.getFileExtension(fileCollection[0]) : utils.string.getFileExtension(fileCollection);
    var obj = this.generateXtkObjectFromExtension(ext);  
    //console.log("FIRST", obj);  
    obj.file = fileCollection;
    //console.log(obj);
    //return
    return obj;
}









/**
 * Adds various display/visibility attributes to 
 * a given XTK object.
 *
 * @param {!X.Object, !Object}
 */
utils.xtk.addAttributesToXObject = function(xObj, attributes) {

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
