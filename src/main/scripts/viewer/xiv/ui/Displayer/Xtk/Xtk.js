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
goog.require('moka.string');
goog.require('moka.style');
goog.require('moka.convert');
goog.require('moka.dom');
goog.require('xiv.xtk.xtkHandler');
goog.require('xiv.ui.XtkControllerMenu');

// xiv
goog.require('xiv.slicer');
goog.require('moka.ui.Component');
goog.require('xiv.ui.XtkPlaneManager');
goog.require('xiv.ui.Displayer');
goog.require('xiv.ui.Thumbnail');





/**
 * xiv.ui.Displayer.Xtk is a subclass of the 'xiv.ui.Displayer' class and calls on 
 * Xtk-specific methods to allow for the viewing of data (it leverages
 * xtk-utils to load in XObjects) in a given xiv.ui.ViewBox.
 *
 * @constructor
 * @param {xiv.ui.ViewBox}
 * @extends {xiv.ui.Displayer}
 */
goog.provide('xiv.ui.Displayer.Xtk');
xiv.ui.Displayer.Xtk = function(ViewBox) {
    this.constructor.ID_PREFIX = xiv.ui.Displayer.ID_PREFIX;
    goog.base(this);


    /**
     * @type {!xiv.ui.ViewBox}
     * @private
     */   
    this.ViewBox_ = ViewBox;



    /**
     * @type {!xiv.ui.XtkPlaneManager}
     * @private
     */
    this.XtkPlaneManager_ = new xiv.ui.XtkPlaneManager(this);



    /**
     * @private
     * @type {!xiv.ui.XtkControllerMenu}
     */ 
    this.ControllerMenu_ = new xiv.ui.XtkControllerMenu();




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
	this.ControllerMenu_ = new xiv.ui.XtkControllerMenu();
	this.ControllerMenu_.makeControllerMenu(this.currentViewables_);
	this.ControllerMenu_.onVolumeToggled2D = 
	    this.set2DRenderObject_.bind(this);
	this.syncControllerMenu_();
    }.bind(this))
	

}
goog.inherits(xiv.ui.Displayer.Xtk, xiv.ui.Displayer);
goog.exportSymbol('xiv.ui.Displayer.Xtk', xiv.ui.Displayer.Xtk);



/** 
 * @const 
 * @type {!string} 
 */
xiv.ui.Displayer.Xtk.DEFAULT_LAYOUT = "Four-Up";



/**
 * @type {xiv.slicer.settings}
 * @private
 */
xiv.ui.Displayer.Xtk.prototype.slicerSettings_;



/**
 * @type {Object}
 * @private
 */ 
xiv.ui.Displayer.Xtk.prototype.currentViewables_;



/**
 * @type {Object}
 * @private
 */
xiv.ui.Displayer.Xtk.prototype.currentViewablesSettings_;




/**
 * @type {Object}
 * @private
 */
xiv.ui.Displayer.Xtk.prototype.currentSlicerSetting_;




/**
 * Gets the ViewPlane elements (not the classes) for
 * animations, and style changes. 
 *
 * @return {!Array.Element}
 * @public
 */    
xiv.ui.Displayer.Xtk.prototype.__defineGetter__('ViewPlanes', function() {
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
xiv.ui.Displayer.Xtk.prototype.__defineGetter__('Interactors', function() {
    return this.XtkPlaneManager_.getXtkPlaneInteractors();
})




/**
 * @param {function} callback The callback to be applied after loading.
 * @public
 */ 
xiv.ui.Displayer.Xtk.prototype.__defineSetter__('onPreload', function(callback){
    this.onPreload_.push(callback);
})




/**
* @param {function} callback The callback to be applied once loaded.
* @public
*/
xiv.ui.Displayer.Xtk.prototype.__defineSetter__('onLoaded', function (callback) {
    this.onLoaded_.push(callback);
})




/**
 * @return {Object} The controller menu to control the properties of the 
 *    loaded X.Objects.
 * @public
 */ 
xiv.ui.Displayer.Xtk.prototype.getControllerMenu =  function(){
    return this.ControllerMenu_.getMenuAsObject();
}



/**
 * @return {!string}  Returns the layout provided by the viewables settings.  
 *     If none, defaults to 'xiv.ui.Displayer.Xtk.DEFAULT_LAYOUT'.
 * @public
 */
xiv.ui.Displayer.Xtk.prototype.getViewLayout =  function(){
    if (this.currentSlicerSetting_ && this.currentSlicerSetting_['layout']) {
	window.console.log("LAYOUT", this.currentViewablesSettings_['layout']);
	return this.currentSlicerSetting_['layout'];
    } else {
	return xiv.ui.Displayer.Xtk.DEFAULT_LAYOUT;
    }
}




/**
 * @return {!string} Returns the two background colors as strings.  Two are returned for the purpose of gradients.
 * @public 
 */
xiv.ui.Displayer.Xtk.prototype.__defineGetter__('BackgroundColors', function(){
    if (this.currentSlicerSetting_ && this.currentSlicerSetting_['background-color']) {
	//window.console.log("LAYOUT", this.currentViewablesSettings_['background-colors']);
	return [moka.convert.arrayToRgb(this.currentSlicerSetting_['background-color'][0], 255), 
		moka.convert.arrayToRgb(this.currentSlicerSetting_['background-color'][1], 255)]
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
xiv.ui.Displayer.Xtk.prototype.syncControllerMenu_ = function(){

    var viewablesArr = moka.convert.objectToArray(this.currentViewables_);
    var settingsArr = moka.convert.objectToArray(this.currentViewablesSettings_);
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
xiv.ui.Displayer.Xtk.prototype.isLoaded = function(fileCollection) {

    var viewablesArr = moka.convert.objectToArray(this.currentViewables_);
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
xiv.ui.Displayer.Xtk.prototype.makeXtkObject_ = function(fileOrFiles, opt_properties){

    //----------------
    // Dicom X.Objects require an array of files...
    //----------------    
    if (!goog.isArray(fileOrFiles)){
	var fileOrFiles =  (fileOrFiles.indexOf(' ') > -1) ? goog.string.urlEncode(fileOrFiles) : fileOrFiles;
	fileOrFiles = decodeURIComponent(fileOrFiles);	 
    }
    var xObj = xiv.xtk.createXObject(fileOrFiles);
    if (opt_properties){
	xiv.xtk.setProperties(xObj, opt_properties); 
    }
    return xObj;
}




/**
 * @inheritDoc
 */
xiv.ui.Displayer.Xtk.prototype.load = function (xnatProperties) {


    xiv.ui.Displayer.Xtk.superClass_.load.call(this, xnatProperties);


    switch(this.xnatProperties_['category'].toLowerCase()) {
    case 'slicer':
	this.loadSlicer_(this.xnatProperties_['files']);
	break;
    default:
	window.console.log(this.xnatProperties_);
	this.loadFiles_(this.xnatProperties_['files']);
    }


}




/**
 * A xiv.ui.ViewBox will call on this function to load up
 * a set of fileUris.
 *
 * @param {!Array.<string>} viewables The relevant viewables to be loaded.
 * @private
 */
xiv.ui.Displayer.Xtk.prototype.loadFiles_ = function (fileUris) {
    this.loadViewables_(xiv.xtk.getViewables(fileUris));
}




/**
 * A xiv.ui.ViewBox will call on this function to load up
 * an viewable object (String) into the displayer.
 *
 * @param {!xiv.xtk.viewables} viewables The relevant viewables to be loaded.
 * @public
 */
xiv.ui.Displayer.Xtk.prototype.loadViewables_ = function (viewables) {


    var renderablePlanes = ['Sagittal', 'Coronal', 'Transverse', '3D']; 



    //----------------
    // init vars.
    //----------------
    this.currentViewables_ = xiv.xtk.getEmptyViewablesObject();
    this.currentViewablesSettings_ = xiv.xtk.getEmptyViewablesObject(); 

    

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
    this.XtkPlaneManager_.loadInRenderers(moka.convert.objectToArray(this.currentViewables_))
}



/**
 * Makes a set of X.Objects based the viewables argument, storing them in the 
 * private variable 'this.currentViewables_' and their settings in 
 * 'this.currentViewablesSettings_'
 *
 * @param {!Object} vbls The vbls to derive the X.Objects from.
 * @private
 */
xiv.ui.Displayer.Xtk.prototype.makeXtkObjects_ = function(vbls){

    window.console.log("MAKE XTK", vbls);
    
    goog.object.forEach(vbls, function(vbl, key){
	switch (key){
	case 'volumes':
	case 'fibers':
	case 'meshes':
            if (!vbl) break;
            goog.array.forEach(vbl, function(volOrFiberOrMesh){
		this.storeViewables_(key, 
		 this.makeXtkObject_(volOrFiberOrMesh['file'], 
				     volOrFiberOrMesh['properties']), 
				     volOrFiberOrMesh);
            }.bind(this))
            break;
	case 'dicoms':
	case 'analyze':
	case 'nifti':

	    window.console.log("HERE", key);
	    this.storeViewables_(key, this.makeXtkObject_(vbl), vbl);
	    break;
	case 'annotations':
	    goog.array.forEach(vbl, function(annotationObj){
		this.storeViewables_(key, xiv.xtk.makeAnnotation(annotationObj), 
				     {'properties': annotationObj});
	    }.bind(this))

	    break;
	}
    }.bind(this))
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
xiv.ui.Displayer.Xtk.prototype.storeViewables_ = function(viewableType, xtkObj, viewableSettings) {
    this.currentViewables_[viewableType].push(xtkObj);
    this.currentViewablesSettings_[viewableType].push(viewableSettings);
}



/**
 * Check for 'isSelectedVolumes' in volumes. 
 * If none, select the first.
 * 
 * @private
 */
xiv.ui.Displayer.Xtk.prototype.determineSelectedVolume_ = function(){
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
xiv.ui.Displayer.Xtk.prototype.getSlicerSettingsPerMrml_ = function(fileCollection, settings){
    var basename = '';
    var ext = '';
    goog.array.forEach(fileCollection, function(fileName){
	basename = moka.string.basename(fileName);
	ext = moka.string.getFileExtension(basename).toLowerCase();
	if ((ext === 'mrml') && (goog.string.startsWith(basename, '.') !== true)) {
	    // Get the Slicer settings for each file
	    //console.log("MRML", ext, basename, fileName);
	    settings[fileName] = xiv.slicer.getSlicerSettings(fileName);
	    
	}
    }.bind(this));
}




/**
 * @param {!Array.<string>} fileCollection The relevant Slicer files to be loaded.
 * @param {!Object} settings The slicer settings.
 * @private
 */
xiv.ui.Displayer.Xtk.prototype.getSlicerSceneThumbnails_ = function(fileCollection, settings){
    var basename = '';
    var ext = '';
    var screenshotName = '';
    var cleanedSceneName = '';
    var mrmlFilename = '';
    goog.array.forEach(fileCollection, function(fileName){
	basename = moka.string.basename(fileName);
	ext = moka.string.getFileExtension(basename).toLowerCase();
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
xiv.ui.Displayer.Xtk.prototype.updateUrls_ = function(settings){
    var viewableArr = [];

    var updateUrl = function(mrml, url) { 
	// If there's a '!' in the mrml url, then
	// we're likely extracting a file from the .mrb.
	var folderPrefix = (mrml.indexOf('!') === -1) ? moka.string.dirname(mrml) + '/' : mrml.split('!')[0] + '!';
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
xiv.ui.Displayer.Xtk.prototype.loopSettingsViewables = function(settings, callback){
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
xiv.ui.Displayer.Xtk.prototype.loadSlicer_ = function (fileCollection) {

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
xiv.ui.Displayer.Xtk.prototype.showSlicerViewMenu_ = function(){

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
xiv.ui.Displayer.Xtk.prototype.updateStyle = function (opt_args) {
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
xiv.ui.Displayer.Xtk.prototype.set2DRenderObject_ = function(fileName) {

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




xiv.ui.Displayer.Xtk.CSS_CLASS_PREFIX = /**@type {string} @const*/ goog.getCssName('xiv-displayer');
xiv.ui.Displayer.Xtk.ELEMENT_CLASS = /**@type {string} @const*/ goog.getCssName(xiv.ui.Displayer.Xtk.CSS_CLASS_PREFIX, '');
