/**
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 * @author amh1646@rih.edu (Amanda Hartung)
 */


/**
 * Google closure includes.
 */
goog.require('goog.string');
goog.require('goog.dom');
goog.require('goog.array');


/**
 * XTK includes.
 */
goog.require('X.sphere');


/**
 * utils includes.
 */
goog.require('utils.string');
goog.require('utils.slicer');
goog.require('utils.style');
goog.require('utils.xtk');
goog.require('utils.xtk.ControllerMenu');
goog.require('utils.convert');
goog.require('utils.dom');


/**
 * xiv includes.
 */
goog.require('xiv.ViewBox');
goog.require('xiv');
goog.require('xiv.Widget');
goog.require('xiv.XtkPlaneManager');
goog.require('xiv.Displayer');
goog.require('xiv.Thumbnail');





/**
 * xiv.XtkDisplayer is a subclass of the 'xiv.Displayer' class and calls on 
 * Xtk-specific methods to allow for the viewing of data (it leverages
 * xtk-utils to load in XObjects) in a given xiv.ViewBox.
 *
 * @constructor
 * @param {xiv.ViewBox, Object=}
 * @extends {xiv.Displayer}
 */
goog.provide('xiv.XtkDisplayer');
xiv.XtkDisplayer = function(viewBox) {
 
    var that = this;
    xiv.Displayer.call(this, 'xiv.XtkDisplayer');
    goog.dom.classes.set(this._element, xiv.XtkDisplayer.ELEMENT_CLASS);

    this.XtkPlaneManager_ = new xiv.XtkPlaneManager(this);
    this.onloadCallbacks_ = [];

}
goog.inherits(xiv.XtkDisplayer, xiv.Displayer);
goog.exportSymbol('xiv.XtkDisplayer', xiv.XtkDisplayer);




xiv.XtkDisplayer.CSS_CLASS_PREFIX = /**@type {string} @const*/ goog.getCssName('xiv-displayer');
xiv.XtkDisplayer.ELEMENT_CLASS = /**@type {string} @const*/ goog.getCssName(xiv.XtkDisplayer.CSS_CLASS_PREFIX, '');




/**
 * @type {?xiv.XtkPlaneManager}
 * @protected
 */
xiv.XtkDisplayer.prototype.XtkPlaneManager_ = null;


/**
 * @type {?xiv.ViewBox}
 * @private
 */    
xiv.XtkDisplayer.prototype.ViewBox_ = null;




/**
 * @param {xiv.ViewBox}
 */    
xiv.XtkDisplayer.prototype.setViewBox = function(viewBox) {
    this.ViewBox_ = viewBox;
}



/**
 * @param {xiv.ViewBox}
 */    
xiv.XtkDisplayer.prototype.getViewBox = function() {
    return this.ViewBox_;
}



/**
 * Returns the ViewPlane elements (not the classes) for
 * animations, and style changes. 
 *
 * @return {Array.Element}
 */    
xiv.XtkDisplayer.prototype.getViewPlaneElements = function() {
    return this.XtkPlaneManager_.getXtkPlaneElements();
}



/**
 * Returns the ViewPlane interactor elements (not the classes) for
 * animations, and style changes. In general, these are the sliders
 * but they could hypothetically be any interactor element.
 *
 * @type {Array.Element}
 */    
xiv.XtkDisplayer.prototype.getViewPlaneInteractors = function() {
    return this.XtkPlaneManager_.getXtkPlaneInteractors();
}



/**
 * @private
 * @type {Array.function}
 */ 
xiv.XtkDisplayer.prototype.preloadCallbacks_ = [];




/**
 * @param {function}
 */ 
xiv.XtkDisplayer.prototype.addPreloadCallback = function(callback){
    this.preloadCallbacks_.push(callback);
};




/**
 * @return {Array.function}
 */ 
xiv.XtkDisplayer.prototype.getPreloadCallbacks = function(){
    return this.preloadCallbacks_;
};



/**
 * @type {?Array.function}
 * @private
 */ 
xiv.XtkDisplayer.prototype.onloadCallbacks_ = null;




/**
* @type {function()}
* @expose
*/
xiv.XtkDisplayer.prototype.onOnload = function (callback) {
    this.onloadCallbacks_.push(callback)
}



/**
 * @type {Object}
 * @private
 */ 
xiv.XtkDisplayer.prototype.currentViewables_ = {};




/**
 * @expose
 */
xiv.XtkDisplayer.prototype.getCurrViewables = function () {
    return this.currentViewables_;
}



/**
 * @expose
 */
xiv.XtkDisplayer.prototype.resetCurrViewables = function () {
    this.currentViewables_ = {};
}



/**
 * @private
 * @type {Object}
 */ 
xiv.XtkDisplayer.prototype.controllerMenu_ = {};




/**
 * @return {Object}
 */ 
xiv.XtkDisplayer.prototype.getControllerMenu = function(){
    return this.controllerMenu_.getMenu();
};




/**
 * Determines if the files from file collection are already loaded
 * into the displayer.
 *
 * @param {string|Array.string}
 * @expose
 */
xiv.XtkDisplayer.prototype.isLoaded = function(fileCollection) {

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
	var ext = utils.xtk.getFileExt(fileName);
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
 * A xiv.ViewBox will call on this function to load up
 * an viewable object (String) into the displayer.
 *
 * @param {Array.<string>, string=}
 */
xiv.XtkDisplayer.prototype.loadFileCollection = function (fileCollection, opt_onloadPlane) {
    
    var that = this;
    var viewables = utils.xtk.getViewables(fileCollection);
    var renderablePlanes = (viewables['volumes'].length > 0 || viewables['dicoms'].length > 0) ? ['Sagittal', 'Coronal', 'Transverse', '3D'] : ['3D']; 
    var newObj = {};
    var slicerSettings = {}
    var culledViewables = {};
    var hasSameFile = /**@type{boolean}*/false;
    var isMatchingAnnotation =  /**@type{boolean}*/false;



    //----------------
    // Reset currentViewables_
    //----------------
    this.currentViewables_ = utils.xtk.getEmptyViewablesObject();

    

    //----------------
    // Run pre-load callbacks.
    //----------------
    goog.array.forEach(this.preloadCallbacks_, function(callback){ callback() })



    //----------------
    // Convert viewables into xObjects, then save into this.currentViewables_
    //
    // NOTE: Need to differentiate DICOM sets, and viewables that fall under
    // the category of 'slicer', from single viewable 
    // files.  DICOM sets will get loaded as a list of files, and 'slicer' 
    // viewables are .mrmls, which are not XtkLoadable (see utils.xtk.getViewables 
    // for further categorization information).
    //----------------
    for (var key in viewables){


	//
	// Cycle through the individual 'viewable' files and
	// convert them to XObjects
	//
	if ((key !== 'slicer' && key !== 'dicoms' && key !== 'images') && viewables[key].length > 0){
	    goog.array.forEach(viewables[key], function(viewableFile){
		viewableFile = (viewableFile.indexOf(' ') > -1) ? goog.string.urlEncode(viewableFile) : viewableFile;
		newObj = utils.xtk.createXObject(decodeURIComponent(viewableFile));	 
		that.currentViewables_[key].push(newObj);
	    })



	//
	// For dicom sets, apply the whole file set to load
	// as an XObject.
	//
	} else if ((key === 'dicoms' || key === 'images') && viewables[key].length > 0){
	    console.log("DICOMS KEY");
	    newObj = utils.xtk.createXObject(viewables[key]);
	    newObj.isSelectedVolume = true; // Critical for 2D Rendering.
	    that.currentViewables_[key].push(newObj);
	    //console.log(newObj);

	}
    }


    
    //----------------
    // Apply Slicer settings, if a Slicer file.
    //----------------
    if (viewables['slicer'].length) { 


	slicerSettingsDict = {}
	//
	// Get the slicer settings.
	//
	
	goog.array.forEach(viewables['slicer'], function(mrml){
	    console.log(mrml);
	    slicerSettingsDict[mrml] = that.getSlicerSettings(mrml);
	}) 
	console.log(slicerSettingsDict);
	//console.log("returning");
	//return
	slicerSettings = this.getSlicerSettings(viewables['slicer'][0]);

	
	//
	// Apply the slicer settings.
	//
	this.currentViewables_ = this.applySlicerSettingsToViewables(this.currentViewables_, slicerSettings);


	//
	// Cull the viewables based on what's not in the slicer file.
	//
	culledViewables = utils.xtk.getEmptyViewablesObject();
	for (var key in this.currentViewables_) { 
	    goog.array.forEach(this.currentViewables_[key], function(renderable){
		renderable.isInSlicerScene ? culledViewables[key].push(renderable) : utils.dom.debug("Renderable not found in slicer file: ", renderable, "filename: ", renderable.file);
	    })
	}
	this.currentViewables_ = culledViewables;
    };



    //----------------
    // Cycle through any volumes 
    // If none of them have the proeprty 'isSelectedVolume',
    // then we set the first one to be selected.
    //---------------
    if (that.currentViewables_['volumes'].length) { 
	var selectedVolumeFound = false;
	goog.array.forEach(that.currentViewables_['volumes'], function(vol){
	    if (vol.isSelectedVolume){
		selectedVolumeFound = true;
	    }
	})

	if (!selectedVolumeFound){
	    that.currentViewables_['volumes'][0].isSelectedVolume = true;
	}
    };



    //----------------
    // Load renderables as single array of currentViewables_
    //----------------
    var renderables = utils.convert.objectToArray(this.currentViewables_);
    this.XtkPlaneManager_.onAllRendered(this.onloadCallbacks_);
    this.XtkPlaneManager_.loadInRenderers(renderables)
 


    //----------------
    // Generate controller menu.
    //----------------
    this.controllerMenu_ = new utils.xtk.ControllerMenu(this);
    this.controllerMenu_.makeControllerMenu(this.currentViewables_);
}




/**
 * Reads in an array containing information
 * about annotations (via utils.xtk) and volume selection and the
 * modifies the 'viewables' argument, returning the new array
 *
 * @param {!Object.<string, Array.<X.object>>, !Object.<string, Object>}
 * @return {Object.<string, Array.<X.object>>}
 */
xiv.XtkDisplayer.prototype.applySlicerSettingsToViewables = function(viewables, slicerSettings) {
    
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
		    utils.xtk.addAttributesToXObject(xObject, {
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
xiv.XtkDisplayer.prototype.getAnnotations = function(annotations) {

    var that = /**@type{xiv.XtkDisplayer}*/ this;
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
	annotationPt = utils.xtk.makeAnnotation(center, annotation[0].getAttribute('name'));
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
 * Takes a MRML file and the dropped xiv.Thumbnail as argunents. Creates an XML Doc from the file.
 * Extracts wanted scene from MRML file (gets scene name from dropped xiv.Thumbnail).
 * Extracts object information from scene, and creates all objects. Sets the
 * 2D renderers to display the correct volume (or the first loaded, if selected
 * is inaccessible). Adds annotations and sets camera position.
 *
 * @param {String, xiv.Thumbnail}
 */
xiv.XtkDisplayer.prototype.getSlicerSettings = function(mrmlFile, droppable) {
    
    var that = /**@type{xiv.XtkDisplayer}*/ this;
    var mrml;
    var sceneNames = /**@type{Array.String}*/[];
    var currScene;
    var slicerSettings = utils.xtk.getEmptyViewablesObject();;
    var selectedVolumeFile = /**@type{String}*/ '';
    var viewableObjectFile = /**@type{String}*/ '';
    var cameraInfo = /**@type{Array}*/ [];
    var annotations =  /**@type{Array.Object}*/ [];

    

    //----------------
    // Load mrml and extract scene names.
    //----------------
    mrml = utils.slicer.loadXMLDoc(mrmlFile);
    goog.array.forEach(mrml.getElementsByTagName('SceneView'), function(sceneView) { sceneNames.push(sceneView.getAttribute('name'));});
    currScene = utils.slicer.getScene(mrml, sceneNames[0]);



    //----------------
    // Construct viewable objects.
    //----------------
    slicerSettings['volumes'] = (utils.slicer.getFileInfo(currScene, 'Volume', 'VolumeArchetypeStorage'));
    slicerSettings['meshes'] = (utils.slicer.getFileInfo(currScene, 'Model', 'ModelStorage'));
    slicerSettings['fibers'] = (utils.slicer.getFileInfo(currScene, 'FiberBundle', 'FiberBundleStorage'));



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
    annotations = this.getAnnotations(utils.slicer.getAnnotations(currScene));
    goog.array.forEach(annotations, function(annotation){
	that.currentViewables_['annotations'].push(annotation['xObject']);
	slicerSettings['annotations'].push({'isAnnotation': true, 'name': annotation['xObject'].name , 'attributes' : annotation['attributes']})
    })



    //----------------
    // Set up camera.
    //----------------
    slicerSettings['camera'] = utils.slicer.getCamera(currScene);
    //console.log("CAMERA", currScene, slicerSettings['camera']);
    this.XtkPlaneManager_.setCameraSettings('3D', {'position':  slicerSettings['camera'][0], 'up':  slicerSettings['camera'][1]});
 



    //----------------
    // Background color
    //----------------
    slicerSettings['background-color'] = utils.slicer.getBackgroundColor(currScene);
    //console.log("BG COLOR", slicerSettings['background-color']);
    this.XtkPlaneManager_.setBackgroundColor('3D', slicerSettings['background-color']);

 
    //----------------
    // Layout
    //----------------
    slicerSettings['layout'] = utils.slicer.getLayout(currScene);
    //console.log("BG COLOR", slicerSettings['background-color']);
    //this.XtkPlaneManager_.setBackgroundColor('3D', slicerSettings['background-color');  


    //----------------
    // Return slicerSettings
    //----------------
    return slicerSettings
}




/**
* @param {Object=}
*/
xiv.XtkDisplayer.prototype.updateStyle = function (opt_args) {
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
xiv.XtkDisplayer.prototype.set2DRenderObject = function(fileName) {

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

