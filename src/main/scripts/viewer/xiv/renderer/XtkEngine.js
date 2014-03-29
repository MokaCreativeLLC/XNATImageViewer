/**
 * @author amh1646@rih.edu (Amanda Hartung)
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 */

// xtk
goog.require('X.mesh');
goog.require('X.volume');
goog.require('X.fibers');
goog.require('X.sphere');

// xiv
goog.require('xiv.renderer.XtkPlane');
goog.require('xiv.renderer.XtkPlane2D');
goog.require('xiv.renderer.XtkPlane3D');



/**
 * @constructor
 * @extends {xiv.renderer.Engine}
 */
goog.provide('xiv.renderer.XtkEngine');
xiv.renderer.XtkEngine = function () {
    goog.base(this);
    

    /**
     * @type {!xiv.renderer.XtkPlane2D}
     * @private
     */
    this.PlaneX_ = new xiv.renderer.XtkPlane2D('X');



    /**
     * @type {!xiv.renderer.XtkPlane2D}
     * @private
     */
    this.PlaneY_ = new xiv.renderer.XtkPlane2D('Y');



    /**
     * @type {!xiv.renderer.XtkPlane2D}
     * @private
     */
    this.PlaneZ_ = new xiv.renderer.XtkPlane2D('Z');



    /**
     * @type {!xiv.renderer.XtkPlane3D}
     * @private
     */
    this.PlaneV_ = new xiv.renderer.XtkPlane3D();



    /**
     * @type {!xiv.renderer.XtkPlane2D}
     * @private
     */
    this.primaryRenderPlane_ = this.PlaneX_;



    goog.events.listen(this.primaryRenderPlane_, 
		       xiv.renderer.XtkPlane.EventType.RENDERING, 
		       this.onRendering_.bind(this))

    goog.events.listen(this.primaryRenderPlane_, 
		       xiv.renderer.XtkPlane.EventType.RENDER_END, 
		       this.onRenderEnd_.bind(this))

}
goog.inherits(xiv.renderer.XtkEngine, xiv.renderer.Engine);
goog.exportSymbol('xiv.renderer.XtkEngine', xiv.renderer.XtkEngine);



/**
 * @type {!string} 
 * @const
 * @expose
 */
xiv.renderer.XtkEngine.ID_PREFIX =  'xiv.renderer.XtkEngine';



/**
 * Event types.
 * @enum {string}
 * @public
 */
xiv.renderer.XtkEngine.EventType = {
    RENDERING: goog.events.getUniqueId('rendering'),
    RENDER_END: goog.events.getUniqueId('render-end')
}



/**
 * @const 
 * @dict
 */
xiv.renderer.XtkEngine.ANATOMICAL_TO_CARTESIAN =  {
    'SAGITTAL': 'X',
    'CORONAL': 'Y',
    'AXIAL' : 'Z',
    'TRANSVERSE': 'Z'
};




/**
 * @param {!string || !Array.string} files
 * @return {Array.<xiv.renderer.XtkPlane>}
 */
xiv.renderer.XtkEngine.prototype.render = function (files) {

    window.console.log("RENDERING THIS!", files)
    var viewables = xiv.renderer.XtkEngine.getViewables(files);
    window.console.log("VIEWABLES!", viewables)
    var xObjects = [];
    var hasVolume = false;
    var currXObj;
    goog.object.forEach(viewables, function(fileColl){
	currXObj = xiv.renderer.XtkEngine.createXObject(fileColl);
	if (currXObj instanceof X.volume) {
	    window.console.log("HAS VOLUME!");
	    hasVolume = true;
	}
	xObjects.push(xiv.renderer.XtkEngine.createXObject(fileColl));
    })

    this.currXObjects_ = xObjects;



    //------------------------------------------ 
    //
    //  IMPORTANT!!!!!!!!!       DO NOT ERASE!!!
    //
    //  You have to add xObject to one plane at a time as opposed to 
    //  all at once.  If there are volumes, we start with planeX (e.g.
    //  this.primaryRenderPlane_).
    //
    //  IF THERE ARE NO VOLUMES, we feed everthing into the 3D renderer.
    //
    //------------------------------------------


    //
    // If there are volumes, we use all renderers.
    //
    if (hasVolume) {

	goog.array.forEach(xObjects, function(xObj){
	    this.primaryRenderPlane_.add(xObj);
	}.bind(this))

	this.primaryRenderPlane_.Renderer.onShowtime = function(){
	    this.renderNonPrimary_(xObjects)
	}.bind(this);

	this.primaryRenderPlane_.render();
    }

    //
    // Otherwise, we just use the 3D renderer
    //
    else {
	window.console.log("No volumes found! Only rendering in 3D!");
	this.PlaneV_.init();

	goog.array.forEach(xObjects, function(xObj){

	    window.console.log("RENDEIRNG THIS", xObj);
	    //xObj.file = xObj._file;
	    this.PlaneV_.add(xObj);
	}.bind(this))
	this.PlaneV_.render();

	goog.array.forEach(xObjects, function(xObj){
	    window.console.log("RENDEIRNG THIS", xObj);
	}.bind(this))
    }

}


/**
 * @param {Array.<X.object>} xObjects
 * @public
 */
xiv.renderer.XtkEngine.prototype.renderNonPrimary_ = function(xObjects){
    goog.object.forEach(this.getPlanes(), function(Plane, planeOr){
	// We already rendered the primary plane
	if (Plane == this.primaryRenderPlane_) { return };
	// Add objects to other planes.
	goog.array.forEach(xObjects, function(xObj){
	    Plane.add(xObj);
	})
	// The render them.
	Plane.render();
    })
}



/**
 * @public
 */
xiv.renderer.XtkEngine.prototype.updateStyle = function(){
    goog.object.forEach(this.getPlanes(), function(plane, key) { 
	plane.updateStyle();
    }.bind(this))
}




/**
 * @private
 */
xiv.renderer.XtkEngine.prototype.onRendering_ = function(e){
    this.dispatchEvent({
	type: xiv.renderer.XtkEngine.EventType.RENDERING,
	percentComplete: e.percentComplete
    })
}



/**
 * @param {Event}
 * @private
 */
xiv.renderer.XtkEngine.prototype.onRenderEnd_ = function(e){
    this.dispatchEvent({
	type: xiv.renderer.XtkEngine.EventType.RENDER_END,
	percentComplete: e.percentComplete
    })
}



/**
 * @return {Array.<xiv.renderer.XtkPlane>}
 */
xiv.renderer.XtkEngine.prototype.getPlanes = function () {
    var obj  = /**@dict*/ {};
    obj[this.PlaneX_.getOrientation()] = this.PlaneX_;
    obj[this.PlaneY_.getOrientation()] = this.PlaneY_;
    obj[this.PlaneZ_.getOrientation()] = this.PlaneZ_;
    obj[this.PlaneV_.getOrientation()] = this.PlaneV_;
    return obj;
}



/**
 * @inheritDoc
 */
xiv.renderer.XtkEngine.prototype.dispose = function () {
    goog.base(this, 'dispose');
    

    goog.events.unlisten(this.primaryRenderPlane_, 
		       xiv.renderer.XtkPlane.EventType.RENDERING, 
		       this.onRendering_.bind(this))

    goog.events.unlisten(this.primaryRenderPlane_, 
		       xiv.renderer.XtkPlane.EventType.RENDER_END, 
		       this.onRenderEnd_.bind(this))

    delete this.primaryRenderPlane_;

    this.PlaneX_.dispose();
    delete this.PlaneX_;

    this.PlaneY_.dispose();
    delete this.PlaneY_;

    this.PlaneZ_.dispose();
    delete this.PlaneZ_;

    this.PlaneV_.dispose();
    delete this.PlaneV_;


}



/**
 * @const
 * @type {Array.<string>}
 * 
 */
xiv.renderer.XtkEngine.volumeExtensions_ = [
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
xiv.renderer.XtkEngine.dicomExtensions_ = [
    'dicom', 
    'dcm',
    'ima',
];



/**
 * @const
 * @type {Array.<string>}
 * 
 */
xiv.renderer.XtkEngine.analyzeExtensions_ = [
    'hdr',
    'img'
];



/**
 * @const
 * @type {Array.<string>}
 * 
 */
xiv.renderer.XtkEngine.niftiExtensions_ = [
    'nii',
    'nii.gz'
];



/**
 * @const
 * @type {Array.<string>}
 * 
 */
xiv.renderer.XtkEngine.imageExtensions_ = [
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
xiv.renderer.XtkEngine.meshExtensions_ = [
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
xiv.renderer.XtkEngine.fiberExtensions_ = [
    'trk'
];





/**
 * Returns XTK object (mesh, volume, ...) to be created, as determined by
 * file extension. https://github.com/xtk/X/wiki/X%3AFileformats
 *
 * @param {string} ext Extension of file, all lowercase
 * @return {Object} New X object
 */
xiv.renderer.XtkEngine.generateXtkObjectFromExtension = function(ext) {
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
xiv.renderer.XtkEngine.makeAnnotation = function(annotationObj, opt_radius) {

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
xiv.renderer.XtkEngine.isVolume = function(ext) {
     return (this.volumeExtensions_.indexOf(ext) > -1 ) ?  true: false;
}




/**
 * Scans the 'ext' argument to determine if the extension
 * at hand is paret of an image set.
 *
 * @param {string} ext The extension to check.
 * @return {boolean} Whether the extension matches the category.
 */
xiv.renderer.XtkEngine.isImage = function(ext) {
     return (this.imageExtensions_.indexOf(ext) > -1 ) ?  true: false;
}




/**
 * Scans the 'ext' argument to determine if the extension
 * at hand is a DICOM set.
 * @param {string} ext The extension to check.
 * @return {boolean} Whether the extension matches the category.
 */
xiv.renderer.XtkEngine.isDicom = function(ext) {
     return (this.dicomExtensions_.indexOf(ext) > -1 ) ?  true: false;
}



/**
 * Scans the 'ext' argument to determine if the extension
 * at hand is an Analyze set.
 * @param {string} ext The extension to check.
 * @return {boolean} Whether the extension matches the category.
 */
xiv.renderer.XtkEngine.isAnalyze = function(ext) {
     return (this.analyzeExtensions_.indexOf(ext) > -1 ) ?  true: false;
}



/**
 * Scans the 'ext' argument to determine if the extension
 * at hand is a NIFTI set.
 * @param {string} ext The extension to check.
 * @return {boolean} Whether the extension matches the category.
 */
xiv.renderer.XtkEngine.isNifti = function(ext) {
     return (this.niftiExtensions_.indexOf(ext) > -1 ) ?  true: false;
}



/**
 * Scans the 'ext' argument to determine if the extension
 * at hand is an XTK mesh.
 *
 * @param {string} ext The extension to check.
 * @return {boolean} Whether the extension matches the category.
 */
xiv.renderer.XtkEngine.isMesh = function(ext) {
    return (this.meshExtensions_.indexOf(ext) > -1 ) ?  true: false;
}




/**
 * Scans the 'ext' argument to determine if the extension
 * at hand is an XTK fiber bundle.
 *
 * @param {string} ext The extension to check.
 * @return {boolean} Whether the extension matches the category.
 */
xiv.renderer.XtkEngine.isFiber = function(ext) {
   return (this.fiberExtensions_.indexOf(ext) > -1 ) ?  true: false;
}




/**
 * @return {Object.<string, Array>}
 */
xiv.renderer.XtkEngine.ViewablesObject = {
    'fibers': [],
    'volumes': [],
    'dicoms': [],
    'analyze': [],
    'nifti': [],
    'meshes':[],
    'annotations': [],
    'images':[]
}



/**
 * Returns the type of the object associated with the given file type. 
 * The object type will be either 'volume', 'mesh', or 'fiber'.
 *
 * @param {!string | !Array.<string>} fileCollection The files to 
 *    categorize based on X.Objects.
 * @return {!string | !Array.<string>}
 */

xiv.renderer.XtkEngine.getViewables = function(fileCollection) {

    //-------------------------	
    // Get an empty viewables object for storage.
    //-------------------------	    
    var viewableTypes = 
	goog.object.clone(xiv.renderer.XtkEngine.ViewablesObject);
    
    

    //-------------------------	
    // Make 'fileCollection' an array if it's not.
    //-------------------------	
    if (!goog.isArray(fileCollection)) { fileCollection = [fileCollection] }



    //-------------------------	
    // Loop through fileCollection the first time
    // for Slicer files and fiber bundles.  The mrmls, for instance
    // take priority over the other node files.
    //-------------------------	
    var basename = '';
    var ext = '';
    for (var i = 0, len = fileCollection.length; i < len; i++) {
	basename = goog.string.path.basename(fileCollection[i]).toLowerCase();
	ext = goog.string.path.extension(basename);

	window.console.log("IS DICOM", ext, this.isDicom(ext));
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
xiv.renderer.XtkEngine.createXObject = function(fileCollection) {

    //window.console.log("FILE COLLECT", fileCollection);

    var ext = (goog.isArray(fileCollection)) ? 
	moka.string.getFileExtension(fileCollection[0]) : 
	moka.string.getFileExtension(fileCollection);
    var obj = this.generateXtkObjectFromExtension(ext);  
    
	
    var urlEncode = function(url){
	var dirname = moka.string.dirname(url);
	var basename = moka.string.basename(url);

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
xiv.renderer.XtkEngine.setProperties = function(xObj, properties) {

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
            xObj.transform.matrix = new Float32Array(
		moka.convert.toFloatArray(properties['transform']));
	}
    }
}
