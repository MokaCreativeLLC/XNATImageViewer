/**
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 * @author amh1646@rih.edu (Amanda Hartung)
 */


// goog
goog.require('goog.string');
goog.require('goog.dom');
goog.require('goog.array');

// xtk
goog.require('X.sphere');

// utils
goog.require('utils.string');
goog.require('utils.slicer');
goog.require('utils.style');
goog.require('utils.xtk');
goog.require('utils.xtk.ControllerMenu');
goog.require('utils.convert');
goog.require('utils.dom');

// xiv
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
 * @param {xiv.ViewBox}
 * @extends {xiv.Displayer}
 */
goog.provide('xiv.XtkDisplayer');
xiv.XtkDisplayer = function(ViewBox) {

    goog.base(this, 'xiv.XtkDisplayer', {
	'class': xiv.XtkDisplayer.ELEMENT_CLASS
    });



    /**
     * @type {!xiv.ViewBox}
     * @private
     */   
    this.ViewBox_ = ViewBox;



    /**
     * @type {!xiv.XtkPlaneManager}
     * @private
     */
    this.XtkPlaneManager_ = new xiv.XtkPlaneManager(this);



    /**
     * @private
     * @type {!utils.xtk.ControllerMenu}
     */ 
    this.ControllerMenu_ = new utils.xtk.ControllerMenu();




    /**
     * @private
     * @type {!Array.function}
     */ 
    this.onPreload_ = [];



    /**
     * @type {!Array.function}
     * @private
     */ 
    this.onLoaded_ = [];




    //------------------
    // Set the initial onload callbacks.
    //------------------  
    this.onLoaded_.push(function(){
	this.ControllerMenu_ = new utils.xtk.ControllerMenu();
	this.ControllerMenu_.makeControllerMenu(this.currentViewables_);
	this.ControllerMenu_.onVolumeToggled2D = this.set2DRenderObject_.bind(this);
	this.syncControllerMenu_();
    }.bind(this))
	

}
goog.inherits(xiv.XtkDisplayer, xiv.Displayer);
goog.exportSymbol('xiv.XtkDisplayer', xiv.XtkDisplayer);


/** 
 * @const 
 * @type {!string} 
 */
xiv.XtkDisplayer.DEFAULT_LAYOUT = "Four-Up";


/**
 * @type {?utils.slicer.settings}
 * @private
 */
xiv.XtkDisplayer.prototype.slicerSettings_ = null;




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
xiv.XtkDisplayer.prototype.currentSlicerSetting_ = null;




/**
 * Gets the ViewPlane elements (not the classes) for
 * animations, and style changes. 
 *
 * @return {!Array.Element}
 * @public
 */    
xiv.XtkDisplayer.prototype.__defineGetter__('ViewPlanes', function() {
    return this.XtkPlaneManager_.getXtkPlaneElements();
})



/**
 * Gets the ViewPlane interactor elements (not the classes) for
 * animations, and style changes. In general, these are the sliders
 * but they could hypothetically be any interactor element.
 *
 * @type {!Array.Element}
 * @public
 */    
xiv.XtkDisplayer.prototype.__defineGetter__('Interactors', function() {
    return this.XtkPlaneManager_.getXtkPlaneInteractors();
})




/**
 * @param {function} callback The callback to be applied after loading.
 * @public
 */ 
xiv.XtkDisplayer.prototype.__defineSetter__('onPreload', function(callback){
    this.onPreload_.push(callback);
})




/**
* @param {function} callback The callback to be applied once loaded.
* @public
*/
xiv.XtkDisplayer.prototype.__defineSetter__('onLoaded', function (callback) {
    this.onLoaded_.push(callback);
})




/**
 * @return {Object} The controller menu to control the properties of the loaded X.Objects.
 * @public
 */ 
xiv.XtkDisplayer.prototype.__defineGetter__('ControllerMenu',  function(){
    return this.ControllerMenu_.Menu;
})



/**
 * @return {!string}  Returns the layout provided by the viewables settings.  
 *     If none, defaults to 'xiv.XtkDisplayer.DEFAULT_LAYOUT'.
 * @public
 */
xiv.XtkDisplayer.prototype.getViewLayout =  function(){
    if (this.currentSlicerSetting_ && this.currentSlicerSetting_['layout']) {
	window.console.log("LAYOUT", this.currentViewablesSettings_['layout']);
	return this.currentSlicerSetting_['layout'];
    } else {
	return xiv.XtkDisplayer.DEFAULT_LAYOUT;
    }
}




/**
 * @return {!string} Returns the two background colors as strings.  Two are returned for the purpose of gradients.
 * @public 
 */
xiv.XtkDisplayer.prototype.__defineGetter__('BackgroundColors', function(){
    if (this.currentSlicerSetting_ && this.currentSlicerSetting_['background-color']) {
	//window.console.log("LAYOUT", this.currentViewablesSettings_['background-colors']);
	return [utils.convert.arrayToRgb(this.currentSlicerSetting_['background-color'][0], 255), 
		utils.convert.arrayToRgb(this.currentSlicerSetting_['background-color'][1], 255)]
    } else {
	return ['rgba(0,0,0,1)', 'rgba(0,0,0,1)']
    }
})





/**
 * Syncs the relevant ControllerMenu
 * properties to the X.Objects loaded into the displayer.
 *
 * @private
 */ 
xiv.XtkDisplayer.prototype.syncControllerMenu_ = function(){

    var viewablesArr = utils.convert.objectToArray(this.currentViewables_);
    var settingsArr = utils.convert.objectToArray(this.currentViewablesSettings_);
    var menuMap = this.ControllerMenu_.MenuMap;
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
	    //console.log(sett
	    if (settingsArr[i] !== undefined){
		xObj.visible = settingsArr[i]['properties']['visible'];
		menuMap[key]['visible'].checked = xObj.visible;
	    } else {
		xObj.visible = true;
		menuMap[key]['visible'].checked = xObj.visible
	    }
	}
	
    }
}


/**
 * Determines if the files from file collection are already loaded
 * into the displayer.
 *
 * @param {string|Array.string} fileCollection
 * @return {boolean}
 * @public
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
 * Creates an X.Object based on the corresponding fileOrFiles argument,
 * by analyzing its filetype.  Also conducts the necessary urlEndoding
 * to communicate with the server.
 * 
 * @private
 * @param {!string | !Array.<string>} fileOrFiles The fileName(s) to derive the X.Objects from.
 * @param {Object=} opt_settings The settings to apply to the X.Objects.
 * @return {?X.Object} The corresponding X.Object.
 */
xiv.XtkDisplayer.prototype.makeXtkObject_ = function(fileOrFiles, opt_properties){

    //----------------
    // Dicom X.Objects require an array of files...
    //----------------    
    if (!goog.isArray(fileOrFiles)){
	var fileOrFiles =  (fileOrFiles.indexOf(' ') > -1) ? goog.string.urlEncode(fileOrFiles) : fileOrFiles;
	fileOrFiles = decodeURIComponent(fileOrFiles);	 
    }
    var xObj = utils.xtk.createXObject(fileOrFiles);
    if (opt_properties){
	utils.xtk.setProperties(xObj, opt_properties); 
    }
    return xObj;
}




/**
 * @inheritDoc
 */
xiv.XtkDisplayer.prototype.load = function (xnatProperties) {


    xiv.XtkDisplayer.superClass_.load.call(this, xnatProperties);


    switch(this.xnatProperties_['category'].toLowerCase()) {
    case 'slicer':
	this.loadSlicer_(this.xnatProperties_['files']);
	break;
    default:
	this.loadFiles_(this.xnatProperties_['files']);
    }


}




/**
 * A xiv.ViewBox will call on this function to load up
 * a set of fileUris.
 *
 * @param {!Array.<string>} viewables The relevant viewables to be loaded.
 * @private
 */
xiv.XtkDisplayer.prototype.loadFiles_ = function (fileUris) {
    this.loadViewables_(utils.xtk.getViewables(fileUris));
}




/**
 * A xiv.ViewBox will call on this function to load up
 * an viewable object (String) into the displayer.
 *
 * @param {!utils.xtk.viewables} viewables The relevant viewables to be loaded.
 * @public
 */
xiv.XtkDisplayer.prototype.loadViewables_ = function (viewables) {


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
    goog.array.forEach(this.onPreload_, function(callback){ callback() })



    //----------------
    // Create renderables
    //----------------
    this.makeXtkObjects_(viewables);



    //----------------
    // Determine selected volume
    //----------------
    this.determineSelectedVolume_();



    //----------------
    // Load renderables as single array of currentViewables_
    //----------------
    this.XtkPlaneManager_.onAllRendered(this.onLoaded_);
    this.XtkPlaneManager_.loadInRenderers(utils.convert.objectToArray(this.currentViewables_))
}



/**
 * Makes a set of X.Objects based the viewables argument, storing them in the 
 * private variable 'this.currentViewables_' and their settings in 
 * 'this.currentViewablesSettings_'
 *
 * @param {!Object} viewables The viewables to derive the X.Objects from.
 * @private
 */
xiv.XtkDisplayer.prototype.makeXtkObjects_ = function(viewables){
    for (var key in viewables){
	switch (key){
	case 'volumes':
	case 'fibers':
	case 'meshes':
            if (!viewables[key]) break;
            goog.array.forEach(viewables[key], function(volOrFiberOrMesh){
		this.storeViewables_(key, 
				     this.makeXtkObject_(volOrFiberOrMesh['file'], volOrFiberOrMesh['properties']), 
				     volOrFiberOrMesh);
            }.bind(this))
            break;
	case 'dicoms':
	    this.storeViewables_(key, 
				 this.makeXtkObject_(viewables[key]), viewables[key]);
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
 * Stores the viewables, their corresponding X.Object, and
 * their corresponding settings into the relevant private 
 * variables. 
 *
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
 * 
 * @private
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
	    //console.log("MRML", ext, basename, fileName);
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
 * @private
 */
xiv.XtkDisplayer.prototype.updateUrls_ = function(settings){
    var viewableArr = [];

    var updateUrl = function(mrml, url) { 
	// If there's a '!' in the mrml url, then
	// we're likely extracting a file from the .mrb.
	var folderPrefix = (mrml.indexOf('!') === -1) ? utils.string.dirname(mrml) + '/' : mrml.split('!')[0] + '!';
	var firstUrl = folderPrefix + goog.string.remove(url, './');
	//window.console.log("UPDATE URL", mrml, url, firstUrl);
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
 * Loop the 'viewables' aspect of the settings object.
 * @param {!Object} settings
 * @param {!callback} callback
 * @public
*/
xiv.XtkDisplayer.prototype.loopSettingsViewables = function(settings, callback){
    var settings = (settings) ? settings : this.slicerSettings_;
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
 * @param {Array.<string>} fileCollection The relevant files in the slicer .mrb to be loaded.
 * @private
 */
xiv.XtkDisplayer.prototype.loadSlicer_ = function (fileCollection) {

    //console.log("load slicer", fileCollection);

    this.slicerSettings_ = {};

    this.getSlicerSettingsPerMrml_(fileCollection, this.slicerSettings_);
    this.getSlicerSceneThumbnails_(fileCollection, this.slicerSettings_);
    this.updateUrls_(this.slicerSettings_);
    
    window.console.log("SLICER SETTINGS", this.slicerSettings_);
    this.showSlicerViewMenu_();
}




/**
 * Displays the Scene view menu when loading a Slicer .mrb into the 
 * displayer.
 * 
 * @private
 */
xiv.XtkDisplayer.prototype.showSlicerViewMenu_ = function(){

    this.ViewBox_.getSlicerViewMenu().reset(this.slicerSettings_);

    this.ViewBox_.getSlicerViewMenu().onViewSelected(function(slicerSetting){
	window.console.log("LOADING THIS GUY", slicerSetting);
	this.currentSlicerSetting_ = slicerSetting;
	this.ViewBox_.getSlicerViewMenu().hideViewSelectDialog();
	this.XtkPlaneManager_.setCamera('3D', slicerSetting['camera']);
	this.loadViewables_(slicerSetting);
    }.bind(this));

    this.ViewBox_.getSlicerViewMenu().showDialog();


}




/**
 * @param {Object=} opt_args The style arguments to appply to the displayer.
 * @public
 */
xiv.XtkDisplayer.prototype.updateStyle = function (opt_args) {
    this.XtkPlaneManager_.updateStyle();
}




/**
* Usually this method is called from the menu.  Specifically
* in the 2D menu, where the user can toggle between
* the volume to be displayed in the 2D renderers.
*
* @param {!string} fileName The filename to set the 2D renderers to show.
* @private
*/
xiv.XtkDisplayer.prototype.set2DRenderObject_ = function(fileName) {

    var xObj;

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
    this.XtkPlaneManager_.loadInRenderers(xObj, '2D', true);
}




xiv.XtkDisplayer.CSS_CLASS_PREFIX = /**@type {string} @const*/ goog.getCssName('xiv-displayer');
xiv.XtkDisplayer.ELEMENT_CLASS = /**@type {string} @const*/ goog.getCssName(xiv.XtkDisplayer.CSS_CLASS_PREFIX, '');
