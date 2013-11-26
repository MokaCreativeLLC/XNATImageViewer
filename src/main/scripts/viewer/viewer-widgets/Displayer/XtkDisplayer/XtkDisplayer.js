/**
 * @author amh1646@rih.edu (Amanda Hartung)
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 */

/**
 * Google closure includes
 */
goog.require('goog.dom.DomHelper');

/**
 * utils includes
 */
goog.require('XnatViewerGlobals');
goog.require('XnatViewerWidget');

/**
 * viewer-widget includes
 */
goog.provide('XtkDisplayer');




/**
 * XtkDisplayer is a subclass of the 'Displayer' class and calls on 
 * Xtk-specific methods to allow for the viewing of data (it leverages
 * xtk-utils to load in XObjects) in a given ViewBox.
 *
 * @constructor
 * @param {ViewBox, Object=}
 * @extends {Displayer}
 */
XtkDisplayer = function(viewBox, opt_args) {
 
    var that = this;
    Displayer.call(this, utils.dom.mergeArgs( opt_args, {'id' : 'XtkDisplayer'}));
    goog.dom.classes.set(this._element, XtkDisplayer.ELEMENT_CLASS);

    this.XtkPlaneManager_ = new XtkPlaneManager(this);
    this.onloadCallbacks_ = [];

}
goog.inherits(XtkDisplayer, Displayer);
goog.exportSymbol('XtkDisplayer', XtkDisplayer);




XtkDisplayer.CSS_CLASS_PREFIX = /**@type {string} @const*/ goog.getCssName('xiv-displayer');
XtkDisplayer.ELEMENT_CLASS = /**@type {string} @const*/ goog.getCssName(XtkDisplayer.CSS_CLASS_PREFIX, '');




/**
 * @type {?XtkPlaneManager}
 * @protected
 */
XtkDisplayer.prototype.XtkPlaneManager_ = null;


/**
 * @type {?ViewBox}
 * @private
 */    
XtkDisplayer.prototype.ViewBox_ = null;




/**
 * @param {ViewBox}
 */    
XtkDisplayer.prototype.setViewBox = function(viewBox) {
    this.ViewBox_ = viewBox;
}



/**
 * @param {ViewBox}
 */    
XtkDisplayer.prototype.getViewBox = function() {
    return this.ViewBox_;
}



/**
 * Returns the ViewPlane elements (not the classes) for
 * animations, and style changes. 
 *
 * @return {Array.Element}
 */    
XtkDisplayer.prototype.getViewPlaneElements = function() {
    return this.XtkPlaneManager_.getXtkPlaneElements();
}



/**
 * Returns the ViewPlane interactor elements (not the classes) for
 * animations, and style changes. In general, these are the sliders
 * but they could hypothetically be any interactor element.
 *
 * @type {Array.Element}
 */    
XtkDisplayer.prototype.getViewPlaneInteractors = function() {
    return this.XtkPlaneManager_.getXtkPlaneInteractors();
}



/**
 * @private
 * @type {Array.function}
 */ 
XtkDisplayer.prototype.preloadCallbacks_ = [];




/**
 * @param {function}
 */ 
XtkDisplayer.prototype.addPreloadCallback = function(callback){
    this.preloadCallbacks_.push(callback);
};




/**
 * @return {Array.function}
 */ 
XtkDisplayer.prototype.getPreloadCallbacks = function(){
    return this.preloadCallbacks_;
};



/**
 * @type {Array.function}
 * @private
 */ 
XtkDisplayer.prototype.onloadCallbacks_ = [];




/**
* @type {function()}
* @expose
*/
XtkDisplayer.prototype.onOnload = function (callback) {
    this.onloadCallbacks_.push(callback)
}



/**
 * @type {Object}
 * @private
 */ 
XtkDisplayer.prototype.currentViewables_ = {};




/**
 * @expose
 */
XtkDisplayer.prototype.getCurrViewables = function () {
    return this.currentViewables_;
}



/**
 * @expose
 */
XtkDisplayer.prototype.resetCurrViewables = function () {
    this.currentViewables_ = {};
}



/**
 * @private
 * @type {Object}
 */ 
XtkDisplayer.prototype.controllerMenu_ = {};




/**
 * @return {Object}
 */ 
XtkDisplayer.prototype.getControllerMenu = function(){
    return this.controllerMenu_.getMenu();
};




/**
 * Determines if the files from file collection are already loaded
 * into the displayer.
 *
 * @param {string|Array.string}
 * @expose
 */
XtkDisplayer.prototype.isLoaded = function(fileCollection) {

    //----------------
    // Convert non-array collections into an array.
    //----------------
    if (!goog.typeOf(fileCollection) == 'array') {
	fileCollection = [fileCollection];
    }



    //----------------
    // Loop through the file collection and compare
    // against the currentViewables_ property.
    //----------------    
    for (var i=0, len = fileCollection.length; i < len; i++) {

	var fileName = fileCollection[i];
	var ext = xtkUtils.getFileExt(fileName);
	var currentViewablesLen = this.currentViewables_.length;

	for (var j = 0; j < currentViewablesLen; j++) {


	    //
	    // Check for non-DICOM filetypes
	    //
	    // NOTE: The collection array may be the same as the xtkObject.file
	    // collection (xtkObject.file is either an array or a string)
	    //
	    if (this.currentViewables_[j].file == fileCollection) {
		return true;


	    //
	    // Check for DICOM filetypes
	    //
            // NOTE: DICOM are a special case...you have to do some
            // string comparisons that aren't straightforward
            //
	    } else if (ext === 'dcm' || ext === 'dicom') {
		if (this.currentViewables_[j].file[0].indexOf(fileName.slice(0,-9)) > -1){
                    return true;		
		}
	    }
        }
    }
    return false;
}




/**
 * A ViewBox will call on this function to load up
 * an viewable object (String) into the displayer.
 *
 * @param {Array.<string>, string=}
 */
XtkDisplayer.prototype.loadFileCollection = function (fileCollection, opt_onloadPlane) {
    
    var that = this;
    var viewables = xtkUtils.getViewables(fileCollection);
    var renderablePlanes = (viewables['volumes'].length > 0 || viewables['dicoms'].length > 0) ? ['Sagittal', 'Coronal', 'Transverse', '3D'] : ['3D']; 
    var newObj = {};
    var slicerSettings = {}
    var renderables = [];
    var culledViewables = {};
    var hasSameFile = /**@type{boolean}*/false;
    var isMatchingAnnotation =  /**@type{boolean}*/false;



    //----------------
    // Reset currentViewables_
    //----------------
    this.currentViewables_ = xtkUtils.getEmptyViewablesObject();

    

    //----------------
    // Run pre-load callbacks.
    //----------------
    goog.array.forEach(this.preloadCallbacks_, function(callback){ callback() })



    //----------------
    // Convert viewables into xObjects, then save into this.currentViewables_
    //
    // NOTE: Need to differentiate DICOM sets, and viewables that fall under
    // the category of 'slicer', from single viewable 
    // files.  DICOM sets will get loaded as a list of file, and 'slicer' 
    // viewables are .mrmls, which are not XtkLoadable (see xtkUtils.getViewables 
    // for further categorization information).
    //----------------
    for (var key in viewables){


	//
	// Cycle through the individual 'viewable' files and
	// convert them to XObjects
	//
	if ((key !== 'slicer' && key !== 'dicoms') && viewables[key].length > 0){
	    goog.array.forEach(viewables[key], function(viewableFile){
		viewableFile = (viewableFile.indexOf(' ') > -1) ? goog.string.urlEncode(viewableFile) : viewableFile;
		newObj = xtkUtils.createXObject(decodeURIComponent(viewableFile));	 
		that.currentViewables_[key].push(newObj);
	    })



	//
	// For dicom sets, apply the whole file set to load
	// as an XObject.
	//
	} else if (key === 'dicoms' && viewables[key].length > 0){
	    newObj = xtkUtils.createXObject(viewables[key]);
	    newObj.isSelectedVolume = true; // Critical for 2D Rendering.
	    that.currentViewables_[key].push(newObj);
	}
    }
 

    
    //----------------
    // Apply Slicer settings, if a Slicer file.
    //----------------
    if (viewables['slicer'].length) { 


	//
	// Get the slicer settings.
	//
	slicerSettings = this.getSlicerSettings(viewables['slicer'][0]);

	
	//
	// Apply the slicer settings.
	//
	this.currentViewables_ = this.applySlicerSettingsToViewables(this.currentViewables_, slicerSettings);


	//
	// Cull the viewables based on what's not in the slicer file.
	//
	culledViewables = xtkUtils.getEmptyViewablesObject();
	for (var key in this.currentViewables_) { 
	    goog.array.forEach(this.currentViewables_[key], function(renderable){
		renderable.isInSlicerScene ? culledViewables[key].push(renderable) : utils.dom.debug("Renderable not found in slicer file: ", renderable, "filename: ", renderable.file);
	    })
	}
	this.currentViewables_ = culledViewables;
    };



    //----------------
    // Load renderables as single array of currentViewables_
    //----------------
    renderables = utils.convert.objectToArray(this.currentViewables_);
    this.XtkPlaneManager_.onAllRendered(this.onloadCallbacks_);
    this.XtkPlaneManager_.loadInRenderers(renderables)
 


    //----------------
    // Generate controller menu.
    //----------------
    this.controllerMenu_ = new xtkUtils.ControllerMenu(this);
    this.controllerMenu_.makeControllerMenu(this.currentViewables_);
}




/**
 * Reads in an array containing information
 * about annotations (via xtkUtils) and volume selection and the
 * modifies the 'viewables' argument, returning the new array
 *
 * @param {!Object.<string, Array.<X.object>>, !Object.<string, Object>}
 * @return {Object.<string, Array.<X.object>>}
 */
XtkDisplayer.prototype.applySlicerSettingsToViewables = function(viewables, slicerSettings) {
    
    //----------------
    // Cycle through viewables
    //----------------
    for (var key in viewables){
	goog.array.forEach(viewables[key], function(xObject){
	    
	    //
	    // Cycle through slicerSettings
	    //
	    goog.array.forEach(slicerSettings[key], function(slicerSetting){


		//
		// Find object match by .file property or .name property.  
		// Remember, we are searching through a list of objects, not strings
		// so we have to compare their properties to determine if we have 
		// matching value against the viewables that need settings adjustments.
		//
		hasSameFile = ((xObject.file) !== undefined) && (utils.string.basename(goog.string.urlDecode(xObject.file)) === utils.string.basename(goog.string.urlDecode(slicerSetting.file)));
		isMatchingAnnotation =  slicerSetting['isAnnotation'] && slicerSetting['name'] === xObject.name;


		//
		// Apply settings to object be referring to 
		// the 'slicerSettings' argument.
		//
		if (hasSameFile || isMatchingAnnotation) {


		    //
		    // Apply the color table to the viewable (if exists).
		    //
		    if (slicerSetting['attributes']['colorTable']) {
			xObject.labelmap.file = goog.string.urlDecode(xObject.file);
			utils.dom.debug(slicerSetting);
			xObject.labelmap.colortable.file = slicerSetting['colorTable'];
		    }


		    //
		    // Apply the generic attributes (color, opacity, visibility).
		    // This generally applies to meshes and annotations or anything
		    // with these three qualitiees.
		    //
		    xtkUtils.addAttributesToXObject(xObject, {
			'color' : utils.convert.toFloatArray(slicerSetting['attributes']['color']),
			'opacity' : parseFloat(slicerSetting['attributes']['opacity'], 10),
			'visiblity' : slicerSetting['attributes']['visibility'] === 'true',
		    }); 

	
		    //
		    // For volumes, determine if the viewable is the 'selected'
		    // one.
		    //
		    xObject.isSelectedVolume = slicerSetting['isSelectedVolume'];
		    xObject.isInSlicerScene = true;
		}
	    })
	})
    }
    return viewables;

}





/**
* Reads in an array containing information
* about annotations (via XtkUtils). Then adds this to
* currentViewables.
*
* @type {function(Array)}
*/
XtkDisplayer.prototype.getAnnotations = function(annotations) {

    var that = /**@type{XtkDisplayer}*/ this;
    var center = /**@type{Array.{number}}*/ [];
    var annotationPt = /**@type{X.sphere | undefined}*/ undefined;
    var attributes = /**@type{Object}*/ {};
    var annotationCollection = /**@type{Array.{X.sphere}}*/ [];
    
    

    //----------------
    // Cycle through every pair to generate an annotation.
    //----------------
    goog.array.forEach(annotations, function(annotation) {


	//
	// Get coordinates.  Input is a string (e.g. '0.5 0.5 0.5')
	//
        center = utils.convert.toFloatArray(annotation[0].getAttribute('ctrlPtsCoord'));


	//
	// Create sphere w/ caption.
	//
	annotationPt = xtkUtils.makeAnnotation(center, annotation[0].getAttribute('name'));
	attributes = {
	    'opacity' : annotation[1].getAttribute('opacity'), 
	    'visibility' : annotation[1].getAttribute('visibility') == 'true', 
	    'color' : annotation[1].getAttribute('color')
	}
	annotationCollection.push({'xObject':annotationPt, 'attributes':attributes});
    });

    return annotationCollection;
}




/**
 * Takes a MRML file and the dropped Thumbnail as argunents. Creates an XML Doc from the file.
 * Extracts wanted scene from MRML file (gets scene name from dropped Thumbnail).
 * Extracts object information from scene, and creates all objects. Sets the
 * 2D renderers to display the correct volume (or the first loaded, if selected
 * is inaccessible). Adds annotations and sets camera position.
 *
 * @param {String, Thumbnail}
 */
XtkDisplayer.prototype.getSlicerSettings = function(mrmlFile, droppable) {
    
    var that = /**@type{XtkDisplayer}*/ this;
    var mrml;
    var sceneNames = /**@type{Array.String}*/[];
    var currScene;
    var slicerSettings = xtkUtils.getEmptyViewablesObject();;
    var selectedVolumeFile = /**@type{String}*/ '';
    var viewableObjectFile = /**@type{String}*/ '';
    var cameraInfo = /**@type{Array}*/ [];
    var annotations =  /**@type{Array.Object}*/ [];

    

    //----------------
    // Load mrml and extract scene names.
    //----------------
    mrml = xtkUtils.loadXMLDoc(mrmlFile);
    goog.array.forEach(mrml.getElementsByTagName('SceneView'), function(sceneView) { sceneNames.push(sceneView.getAttribute('name'));});
    currScene = xtkUtils.extractScene(mrml, sceneNames[0]);



    //----------------
    // Construct viewable objects.
    //----------------
    slicerSettings['volumes'] = (xtkUtils.extractFileInfo(currScene, 'Volume', 'VolumeArchetypeStorage'));
    slicerSettings['meshes'] = (xtkUtils.extractFileInfo(currScene, 'Model', 'ModelStorage'));
    slicerSettings['fibers'] = (xtkUtils.extractFileInfo(currScene, 'FiberBundle', 'FiberBundleStorage'));



    //----------------
    // Cleanup viewable objects
    //----------------
    for (var key in slicerSettings){
	goog.array.forEach(slicerSettings[key], function(slicerSetting) {


	    //
	    // Clean file: Url decoding necessary as file paths in the mrml are url encoded
	    //
	    slicerSetting['file'] = utils.string.basename(goog.string.urlDecode(slicerSetting['file']));	
	    slicerSettingFile = slicerSetting['file'];
	    

	    //
	    // Determine the selectedVolume (i.e. the volume to display in 2D planes)
	    //
            if (slicerSetting['isSelectedVolume']) { selectedVolumeFile = slicerSettingFile;}
            if (selectedVolumeFile.length === 0 && slicerSetting['attributes']['colorTable']) {
		utils.dom.debug('picking the color table');
		selectedVolumeFile = slicerSettingFile;
            }
	});
    }

 

    //----------------
    // Default to first volume file if there's no selected volume
    //----------------
    selectedVolumeFile = (selectedVolumeFile.length === 0) ? that.currentViewables_['volumes'][0].file : selectedVolumeFile;
    selectedVolumeFile = utils.string.basename(selectedVolumeFile);



    //----------------
    // Set isSelectedVolume to matching file
    //----------------
    for (var key in slicerSettings){
	goog.array.forEach(slicerSettings[key], function(slicerSetting) {
	    if (slicerSetting.file === selectedVolumeFile) { slicerSetting['isSelectedVolume'] = true }
	});
    }



    //----------------
    // Add annotations.
    //----------------
    slicerSettings['annotations'] = [];
    annotations = this.getAnnotations(xtkUtils.extractAnnotations(currScene));
    goog.array.forEach(annotations, function(annotation){
	that.currentViewables_['annotations'].push(annotation['xObject']);
	slicerSettings['annotations'].push({'isAnnotation': true, 'name': annotation['xObject'].name , 'attributes' : annotation['attributes']})
    })



    //----------------
    // Set up camera.
    //----------------
    cameraInfo = xtkUtils.extractCamera(currScene);
    this.XtkPlaneManager_.setCameraSettings('3D', {'position':  cameraInfo[0], 'up':  cameraInfo[1]});
    


    //----------------
    // Return slicerSettings
    //----------------
    return slicerSettings
}




/**
* @param {Object=}
*/
XtkDisplayer.prototype.updateStyle = function (opt_args) {
    var that = this;

    if (opt_args){
	var widgetDims = utils.dom.mergeArgs(utils.style.dims(this._element), opt_args);
	utils.style.setStyle(this._element, widgetDims);
    }
 
    this.XtkPlaneManager_.updateStyle();

}




/**
* Usually this method is called from the menu.  Specifically
* in the 2D menu, where the user can toggle between
* the volume to be displayed in the 2D renderers.
*
* @param {!string}
*/
XtkDisplayer.prototype.set2DRenderObject = function(fileName) {

    var that = this;
    var xObj = undefined;



    //----------------
    // Get the xObj from curr viewables.
    //----------------
    goog.array.forEach(this.currentViewables_['volumes'], function(vol){
	if (goog.string.endsWith(vol.file, fileName)) { 
	    xObj = vol; 
	}
    })



    //----------------
    // Load in renderers.
    //----------------
    that.XtkPlaneManager_.loadInRenderers(xObj, '2D');
}

