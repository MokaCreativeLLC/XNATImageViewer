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
xiv.XtkDisplayer = function(ViewBox) {

    //------------------
    // Call parents, set class
    //------------------  
    xiv.Displayer.call(this, 'xiv.XtkDisplayer');
    goog.dom.classes.set(this.element, xiv.XtkDisplayer.ELEMENT_CLASS);



    //------------------
    // Reset property arrays and objects
    //------------------  
    this.currentViewables_ = {};
    this.currentViewablesSettings_ = {};
    this.currentSlicerSettings_ = {};
    this.onloadCallbacks_ = [];
    this.preloadCallbacks_ = [];



    //------------------
    // ViewBox
    //------------------  
    this.ViewBox_ = ViewBox;



    //------------------
    // XtkPlaneManager
    //------------------  
    this.XtkPlaneManager_ = new xiv.XtkPlaneManager(this);



    //------------------
    // Set the initial onload callbacks.
    //------------------  
    this.onloadCallbacks_.push(function(){
	this.ControllerMenu_ = new utils.xtk.ControllerMenu(this);
	this.ControllerMenu_.makeControllerMenu(this.currentViewables_);
	this.syncControllerMenuToViewables_();
    }.bind(this))
	

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
 * @return {xiv.ViewBox}
 */    
xiv.XtkDisplayer.prototype.getViewBox = function() {
    return this.ViewBox_;
}



/**
 * @type {?Object}
 * @protected
 */
xiv.XtkDisplayer.prototype._slicerSettings = null;




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
 * @type {!Array.function}
 */ 
xiv.XtkDisplayer.prototype.preloadCallbacks_ = null;




/**
 * @param {function} callback The callback to track.
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
 * @type {?Object}
 * @private
 */ 
xiv.XtkDisplayer.prototype.currentViewables_ = null;


/**
 * @type {?Object}
 * @private
 */ 
xiv.XtkDisplayer.prototype.currentViewablesSettings_ = null;


/**
 * @type {?Object}
 * @private
 */ 
xiv.XtkDisplayer.prototype.currentSlicerSettings_ = null;



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
 * @type {!Object}
 */ 
xiv.XtkDisplayer.prototype.ControllerMenu_ = null;




/**
 * @return {Object}
 */ 
xiv.XtkDisplayer.prototype.getControllerMenu = function(){
    return this.ControllerMenu_.getMenu();
};




/**
 * Sync all of the relevant controllerMenu
 * properties to the X.Object properties.
 *
 * @private
 */ 
xiv.XtkDisplayer.prototype.syncControllerMenuToViewables_ = function(){

    var viewablesArr = utils.convert.objectToArray(this.currentViewables_);
    var settingsArr = utils.convert.objectToArray(this.currentViewablesSettings_);
    var menuMap = this.ControllerMenu_.getMenuMap();
    for (var key in menuMap) {
	switch(key){

	// Skip the "Master" level controls.
	case 'Annotations':
	case 'Fibers':
	case 'Volumes':
	case 'Meshes':
        case 'DICOM':
	    break;
	default:

	    //window.console.log(viewablesArr, settingsArr);
	    var xObj = menuMap[key]['xtkObj'];

	    //
	    // Sync opacity
	    //
	    if (menuMap[key]['opacity']){
		if (menuMap[key]['opacity'].setValue){
		    menuMap[key]['opacity'].setValue(parseFloat(xObj.opacity));
		} else if (menuMap[key]['opacity']['slider'] && menuMap[key]['opacity']['slider'].setValue) {
		    menuMap[key]['opacity']['slider'].setValue(parseFloat(xObj.opacity));
		}
	    }

	    // Get matching array index for the settings.
	    var i = 0; 
	    for (i = 0, len = viewablesArr.length; i < len; i++) { if (viewablesArr[i] === xObj){ break;}}


	    if ((!settingsArr[i]) || (!settingsArr[i]['properties'])){break}


	    //
	    // Sync threshold range
	    //
	    if (menuMap[key]['threshold']){

		var thresholdSlider = menuMap[key]['threshold'];
		if ((settingsArr[i]['properties']['lowerThreshold'] !== undefined) 
		    && settingsArr[i]['properties']['lowerThreshold'].toString() !== 'NaN') {
		    thresholdSlider.setMinimum(settingsArr[i]['properties']['lowerThreshold']);
		    thresholdSlider.setValue(settingsArr[i]['properties']['lowerThreshold']);
		    thresholdSlider.setMinExtent(settingsArr[i]['properties']['lowerThreshold']-1);
		} else {
		    thresholdSlider.setMinimum(0);
		    thresholdSlider.setValue(0);
		    thresholdSlider.setMinExtent(0);
		}
		if ((settingsArr[i]['properties']['upperThreshold'] !== undefined) 
		    && settingsArr[i]['properties']['upperThreshold'].toString() !== 'NaN') {
		    thresholdSlider.setMaximum(settingsArr[i]['properties']['upperThreshold']);
		} else {
		    thresholdSlider.setMaximum(10);
		}
	    }


	    //
	    // Sync visible
	    //
	    if (settingsArr[i] !== undefined){
		xObj.visible = settingsArr[i]['properties']['visible'];
		//menuMap[key]['visible'].checked = xObj.visible;
	    } //else {
		xObj.visible = true;
		menuMap[key]['visible'].checked = xObj.visible
	    //}
	}
	
    }
}


/**
 * Determines if the files from file collection are already loaded
 * into the displayer.
 *
 * @param {string|Array.string} fileCollection
 * @return {boolean}
 * @expose
 */
xiv.XtkDisplayer.prototype.isLoaded = function(fileCollection) {

    var viewablesArr = utils.convert.objectToArray(this.currentViewables_);
    var fileName = '';
    var i=0, j=0;


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
    for (i=0, len = fileCollection.length; i < len; i++) {
	fileName = fileCollection[i];
	for (j = 0, len2 = viewablesArr.length; j < len2; j++) {

	    // Check for non-DICOM filetypes
	    if (viewablesArr[j].file === fileCollection) {
		return true;

	    // Check for DICOM filetypes
	    } else if (viewablesArr.file[0].indexOf(fileName.slice(0,-9)) > -1){
                return true;		
	    }
        }
    }
    return false;
}




/**
 * @param {!string | !Array.<string>} viewable
 * @param {Object=} opt_settings
 * @return {?X.Object}
 */
xiv.XtkDisplayer.prototype.createXtkObject = function(viewable, opt_properties){
    if (!goog.isArray(viewable)){
	var viewable =  (viewable.indexOf(' ') > -1) ? goog.string.urlEncode(viewable) : viewable;
	viewable = decodeURIComponent(viewable);	 
    }
    var v = utils.xtk.createXObject(viewable);
    if (opt_properties){
	utils.xtk.setProperties(v, opt_properties); 
    }
    return v
}



/**
 * @return {!string}
 */
xiv.XtkDisplayer.prototype.getViewLayout = function(){

    if (this.currentSlicerSettings_ && this.currentSlicerSettings_['layout']) {
	window.console.log("LAYOUT", this.currentViewablesSettings_['layout']);
	return this.currentSlicerSettings_['layout'];
    } else {
	return xiv.DEFAULT_LAYOUT
    }
}



/**
 * @return {!string}
 */
xiv.XtkDisplayer.prototype.getBackgroundColors = function(){
    if (this.currentSlicerSettings_ && this.currentSlicerSettings_['background-color']) {
	//window.console.log("LAYOUT", this.currentViewablesSettings_['background-colors']);
	return [utils.convert.arrayToRgb(this.currentSlicerSettings_['background-color'][0], 255), 
		utils.convert.arrayToRgb(this.currentSlicerSettings_['background-color'][1], 255)]
    } else {
	return ['rgba(0,0,0,1)', 'rgba(0,0,0,1)']
    }
}





/**
 * A xiv.ViewBox will call on this function to load up
 * an viewable object (String) into the displayer.
 *
 * @param {!Array.<string> | !Object} viewables The relevant Slicer files to be loaded.
 */
xiv.XtkDisplayer.prototype.loadViewables = function (viewables) {

    var viewables = goog.isArray(viewables) ? utils.xtk.getViewables(viewables) : viewables;
    var renderablePlanes = (viewables['volumes'].length > 0 || viewables['dicoms'].length > 0) ? 
	['Sagittal', 'Coronal', 'Transverse', '3D'] : ['3D']; 



    //----------------
    // init vars.
    //----------------
    this.currentViewables_ = utils.xtk.getEmptyViewablesObject();
    this.currentViewablesSettings_ = utils.xtk.getEmptyViewablesObject(); 

    

    //----------------
    // Run pre-load callbacks.
    //----------------
    goog.array.forEach(this.preloadCallbacks_, function(callback){ callback() })



    //----------------
    // Create renderables
    //----------------
    this.createXtkObjects_(viewables);



    //----------------
    // Determine selected volume
    //----------------
    this.determineSelectedVolume_();



    //----------------
    // Load renderables as single array of currentViewables_
    //----------------
    this.XtkPlaneManager_.onAllRendered(this.onloadCallbacks_);
    this.XtkPlaneManager_.loadInRenderers(utils.convert.objectToArray(this.currentViewables_))
}



/**
 * @param {!Object}
 * @private
 */
xiv.XtkDisplayer.prototype.createXtkObjects_ = function(viewables){
    for (var key in viewables){
	switch (key){
	case 'volumes':
	case 'fibers':
	case 'meshes':
            if (!viewables[key]) break;
            goog.array.forEach(viewables[key], function(volOrFiberOrMesh){
		this.storeViewables_(key, 
				     this.createXtkObject(volOrFiberOrMesh['file'], volOrFiberOrMesh['properties']), 
				     volOrFiberOrMesh);
            }.bind(this))
            break;
	case 'dicoms':
	    this.storeViewables_(key, 
				 this.createXtkObject(viewables[key]), viewables[key]);
	    break;
	case 'annotations':
	    goog.array.forEach(viewables[key], function(annotationObj){
		this.storeViewables_(key, utils.xtk.makeAnnotation(annotationObj), 
				     {'properties': annotationObj});
	    }.bind(this))

	    break;
	}
    }
}



/**
 * @param {!string} viewableType
 * @param {!X.Object} xtkObj
 * @param {!Object} viewableSettings
 * @private
 */
xiv.XtkDisplayer.prototype.storeViewables_ = function(viewableType, xtkObj, viewableSettings) {
    this.currentViewables_[viewableType].push(xtkObj);
    this.currentViewablesSettings_[viewableType].push(viewableSettings);
}



/**
 * Check for 'isSelectedVolumes' in volumes. 
 * If none, select the first.
 */
xiv.XtkDisplayer.prototype.determineSelectedVolume_ = function(){
    var selectedFound = false;
    for (var i=0, len=this.currentViewables_['volumes'].length; i<len; i++) {
	if (this.currentViewables_['volumes'][i]['isSelectedVolume'] === true){
	    selectedFound = true;
	    break;
	}
    }
    if (!selectedFound){
	// First, try setting the first avail. volume.
	if (this.currentViewables_['volumes'].length) {
	    this.currentViewables_['volumes'][0]['isSelectedVolume'] = true;
	} 
	// Then, try setting the first available dicom
	else if (this.currentViewables_['dicoms'].length) {
	    this.currentViewables_['dicoms'][0]['isSelectedVolume'] = true;
	}	
    }
}



/**
 * @param {!Array.<string>} fileCollection The relevant Slicer files to be loaded.
 * @param {!Object} settings The slicer settings.
 * @private
 */
xiv.XtkDisplayer.prototype.getSlicerSettingsPerMrml_ = function(fileCollection, settings){
    var basename = '';
    var ext = '';
    goog.array.forEach(fileCollection, function(fileName){
	basename = utils.string.basename(fileName);
	ext = utils.string.getFileExtension(basename).toLowerCase();
	if ((ext === 'mrml') && (goog.string.startsWith(basename, '.') !== true)) {
	    // Get the Slicer settings for each file
	    console.log("MRML", ext, basename, fileName);
	    settings[fileName] = utils.slicer.getSlicerSettings(fileName);
	    
	}
    }.bind(this));
}




/**
 * @param {!Array.<string>} fileCollection The relevant Slicer files to be loaded.
 * @param {!Object} settings The slicer settings.
 * @private
 */
xiv.XtkDisplayer.prototype.getSlicerSceneThumbnails_ = function(fileCollection, settings){
    var basename = '';
    var ext = '';
    var screenshotName = '';
    var cleanedSceneName = '';
    var mrmlFilename = '';
    goog.array.forEach(fileCollection, function(fileName){
	basename = utils.string.basename(fileName);
	ext = utils.string.getFileExtension(basename).toLowerCase();
	screenshotName = basename.split('.')[0].toLowerCase().replace(' ', '');

	//
	// Get pngs and skip and files this start with '.'
	//
	if ((ext === 'png') && !(goog.string.startsWith(basename, '.'))) {
	    for (mrmlFilename in settings){
		goog.array.forEach(settings[mrmlFilename]['__scenes__'], function(sceneName){
		    cleanedSceneName = sceneName.split('.')[0].toLowerCase().replace(' ', '');
		    //window.console.log(screenshotName, cleanedSceneName, cleanedSceneName.indexOf(screenshotName))
		    if (cleanedSceneName.indexOf(screenshotName) > -1){
			settings[mrmlFilename][sceneName]['thumbnail'] = fileName;
		    }
		}.bind(this))
	    }
	}
    }.bind(this));
}




/**
 * Update the urls of the files to be
 * to the accurate relative path.  (Since the
 * urls were read from the mrml, they start relative to 
 * the slicer file path).
 *
 * @param {!Object} settings
*/
xiv.XtkDisplayer.prototype.updateUrls_ = function(settings){
    var viewableArr = [];

    var updateUrl = function(mrml, url) { 
	// If there's a '!' in the mrml url, then
	// we're likely extracting a file from the .mrb.
	var folderPrefix = (mrml.indexOf('!') === -1) ? utils.string.dirname(mrml) + '/' : mrml.split('!')[0] + '!';
	var firstUrl = folderPrefix + goog.string.remove(url, './');
	window.console.log("UPDATE URL", mrml, url, firstUrl);
	return firstUrl
    };

    this.loopSettingsViewables(settings, function(mrmlFilename, scene, prop, viewable){
	if (viewable['file']) {
	    viewable['file'] =  updateUrl(mrmlFilename, viewable['file']);
	} 
	if (viewable['properties'] && viewable['properties']['fiberDisplay']) {
	    goog.array.forEach(viewable['properties']['fiberDisplay'], function(fiberDisplay){
		if (fiberDisplay['colorTable']) {
		    fiberDisplay['colorTable'] =  updateUrl(mrmlFilename, fiberDisplay['colorTable']);
		}
	    })   
	}
    }.bind(this))
    
}



/**
 *
 * @param {!Object} settings
 * @param {!callback} callback
 * @public
*/
xiv.XtkDisplayer.prototype.loopSettingsViewables = function(settings, callback){
    var settings = (settings) ? settings : this._slicerSettings;
    for (var mrmlFilename in settings){
	for (var scene in settings[mrmlFilename]){
	    for (var prop in settings[mrmlFilename][scene]){
		viewableArr = settings[mrmlFilename][scene][prop];
		if (goog.isArray(viewableArr)){
		    goog.array.forEach(viewableArr, function(viewable){
			callback(mrmlFilename, scene, prop, viewable);
		    })
		}
	    }
	}	
    }
}




/**
 *
 * @param {Array.<string>} fileCollection The relevant Slicer files to be loaded.
 */
xiv.XtkDisplayer.prototype.loadSlicer = function (fileCollection) {

    console.log("load slicer", fileCollection);

    this._slicerSettings = {};

    this.getSlicerSettingsPerMrml_(fileCollection, this._slicerSettings);
    this.getSlicerSceneThumbnails_(fileCollection, this._slicerSettings);
    this.updateUrls_(this._slicerSettings);
    
    window.console.log("SLICER SETTINGS", this._slicerSettings);
    this.showSlicerViewMenu_();
}



/**
 *
 */
xiv.XtkDisplayer.prototype.showSlicerViewMenu_ = function(){
    this.ViewBox_.SlicerViewMenu.reset(this._slicerSettings);
    this.ViewBox_.SlicerViewMenu.onViewSelected(function(slicerSetting){
	window.console.log("LOADING THIS GUY", slicerSetting);
	this.currentSlicerSettings_ = slicerSetting;
	this.ViewBox_.SlicerViewMenu.hideViewSelectDialog();
	this.XtkPlaneManager_.setCamera('3D', slicerSetting['camera']);
	this.loadViewables(slicerSetting);
    }.bind(this));
    this.ViewBox_.SlicerViewMenu.showViewSelectDialog();

}





/**
* @param {Object=}
*/
xiv.XtkDisplayer.prototype.updateStyle = function (opt_args) {
    if (opt_args){
	var widgetDims = utils.dom.mergeArgs(utils.style.dims(this.element), opt_args);
	utils.style.setStyle(this.element, widgetDims);
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
    this.XtkPlaneManager_.loadInRenderers(xObj, '2D');
}

